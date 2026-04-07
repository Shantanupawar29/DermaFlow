const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const InventoryAlert = require('../models/InventoryAlert');
const { protect, admin } = require('../middleware/auth');
const { sendStockAlert } = require('../services/emailService');

// ============ DASHBOARD ============
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    console.log('Fetching SCM dashboard...');
    
    const products = await Product.find({}).populate('supplier');
    const suppliers = await Supplier.find({});
    
    const lowStockProducts = products.filter(p => {
      const threshold = p.criticalThreshold || 10;
      return p.stockQuantity <= threshold && p.stockQuantity > 0;
    });
    
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
    
    // Get pending alerts count
    const pendingAlerts = await InventoryAlert.countDocuments({ status: 'pending' });
    
    const responseData = {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      pendingAlerts: pendingAlerts,
      pendingPOs: 0,
      totalSuppliers: suppliers.length,
      lowStockProducts: lowStockProducts.map(p => ({
        _id: p._id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        criticalThreshold: p.criticalThreshold || 10,
        supplier: p.supplier?.name || 'No supplier assigned',
        daysLeft: 'N/A'
      })),
      supplierPerformance: suppliers.map(s => ({
        name: s.name,
        totalOrders: s.totalOrders || 0,
        rating: s.rating || 0,
        onTimeDelivery: s.onTimeDelivery || 0
      }))
    };
    
    console.log('SCM dashboard data sent');
    res.json(responseData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ SUPPLIERS ============
router.get('/suppliers', protect, admin, async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).select('-password');
    res.json(suppliers);
  } catch (error) {
    console.error('Suppliers error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/suppliers/register', protect, admin, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, phone, company, gstNumber, address, categories } = req.body;
    
    const existing = await Supplier.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Supplier already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const supplier = await Supplier.create({
      name,
      email,
      password: hashedPassword,
      phone,
      company,
      gstNumber,
      address,
      categories: categories || [],
      isActive: true,
      isVerified: true
    });
    
    const supplierResponse = supplier.toObject();
    delete supplierResponse.password;
    
    res.status(201).json(supplierResponse);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/suppliers/:id', protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/suppliers/:id', protect, admin, async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ALERTS ============
router.get('/alerts', protect, admin, async (req, res) => {
  try {
    const alerts = await InventoryAlert.find()
      .populate('product')
      .populate('supplier')
      .sort('-createdAt')
      .limit(50);
    res.json(alerts);
  } catch (error) {
    console.error('Alerts error:', error);
    res.json([]);
  }
});

// ============ CHECK ALERTS - FIXED ============
router.post('/check-alerts', protect, admin, async (req, res) => {
  try {
    console.log('Manual stock check triggered...');
    
    const products = await Product.find({}).populate('supplier');
    let alertsSent = 0;
    const newAlerts = [];
    
    for (const product of products) {
      const threshold = product.criticalThreshold || 10;
      
      if (product.stockQuantity <= threshold && product.stockQuantity > 0 && product.supplier) {
        console.log(`⚠️ Low stock: ${product.name} - ${product.stockQuantity} units left`);
        
        // Check if alert already exists for this product
        const existingAlert = await InventoryAlert.findOne({
          product: product._id,
          status: { $in: ['pending', 'sent'] }
        });
        
        if (!existingAlert) {
          const alert = await InventoryAlert.create({
            product: product._id,
            supplier: product.supplier._id,
            currentStock: product.stockQuantity,
            criticalThreshold: threshold,
            reorderQuantity: product.reorderQuantity || 50
          });
          
          // Try to send email
          try {
            const emailSent = await sendStockAlert(
              product.supplier.email,
              product.supplier.name,
              product,
              alert
            );
            
            if (emailSent) {
              alert.emailSent = true;
              alert.emailSentAt = new Date();
              await alert.save();
              alertsSent++;
              console.log(`✅ Alert sent to ${product.supplier.email}`);
              newAlerts.push(alert);
            } else {
              console.log(`❌ Failed to send email to ${product.supplier.email}`);
            }
          } catch (emailError) {
            console.error(`Email error for ${product.supplier.email}:`, emailError.message);
          }
        } else {
          console.log(`Alert already exists for ${product.name}, skipping`);
        }
      }
    }
    
    res.json({ 
      message: `Stock check completed. ${alertsSent} alerts sent.`,
      alertsSent,
      alerts: newAlerts
    });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ REORDER ============
router.post('/reorder', protect, admin, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId).populate('supplier');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const reorderQty = quantity || product.reorderQuantity || 50;
    
    console.log(`📦 Reorder request: ${product.name} - Qty: ${reorderQty}`);
    
    // Mark existing alerts as acknowledged
    await InventoryAlert.updateMany(
      { product: productId, status: { $in: ['pending', 'sent'] } },
      { status: 'acknowledged' }
    );
    
    res.json({ 
      message: `Reorder placed for ${product.name}: ${reorderQty} units`,
      product: product.name,
      quantity: reorderQty,
      supplier: product.supplier?.name
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ ASSIGN PRODUCT TO SUPPLIER ============
router.put('/products/:productId/assign-supplier', protect, admin, async (req, res) => {
  try {
    const { supplierId, criticalThreshold, reorderQuantity } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { 
        supplier: supplierId,
        criticalThreshold: criticalThreshold || 10,
        reorderQuantity: reorderQuantity || 50
      },
      { new: true }
    ).populate('supplier');
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;