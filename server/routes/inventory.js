const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { sendStockAlert } = require('../services/emailService');

// Get inventory with stats
router.get('/', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({}).populate('supplier');
    const stats = {
      total: products.length,
      inStock: products.filter(p => p.stockQuantity > (p.criticalThreshold || 10)).length,
      low: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.criticalThreshold || 10)).length,
      outOf: products.filter(p => p.stockQuantity === 0).length
    };
    
    res.json({ products, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock - This will trigger email alerts
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    
    console.log('\n========================================');
    console.log('📦 STOCK UPDATE TRIGGERED');
    
    const product = await Product.findById(req.params.id).populate('supplier');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const oldStock = product.stockQuantity;
    product.stockQuantity = stockQuantity;
    await product.save();
    
    console.log('Product:', product.name);
    console.log('Old Stock:', oldStock);
    console.log('New Stock:', stockQuantity);
    console.log('Critical Threshold:', product.criticalThreshold || 10);
    console.log('Has Supplier:', product.supplier ? 'YES' : 'NO');
    
    if (product.supplier) {
      console.log('Supplier Name:', product.supplier.name);
      console.log('Supplier Email:', product.supplier.email);
    }
    
    // FORCE SEND ALERT WHEN STOCK IS REDUCED BELOW THRESHOLD
    const threshold = product.criticalThreshold || 10;
    
    // Check if we should send alert (stock is low AND has supplier)
    if (product.supplier && product.supplier.email) {
      if (stockQuantity <= threshold && stockQuantity > 0) {
        console.log('\n⚠️ LOW STOCK DETECTED! Sending alert...');
        
        const alertData = {
          currentStock: stockQuantity,
          criticalThreshold: threshold,
          reorderQuantity: product.reorderQuantity || 50
        };
        
        const emailSent = await sendStockAlert(
          product.supplier.email,
          product.supplier.name,
          product,
          alertData
        );
        
        if (emailSent) {
          console.log('✅ Alert email sent successfully to:', product.supplier.email);
        } else {
          console.log('❌ Failed to send email - check console above');
        }
      } else {
        console.log('\nℹ️ Stock not low enough for alert');
        console.log(`   Current Stock: ${stockQuantity} <= Threshold: ${threshold}? ${stockQuantity <= threshold}`);
      }
    } else {
      console.log('\n⚠️ Cannot send alert: No supplier assigned to this product!');
      console.log('   Please assign a supplier to this product first.');
    }
    
    console.log('========================================\n');
    res.json(product);
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;