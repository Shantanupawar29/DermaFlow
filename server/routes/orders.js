const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/emailService');

// Generate invoice number
function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Create order - WITH INVENTORY UPDATE
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, phone, totalAmount, discountAmount, couponCode } = req.body;
    
    console.log('Creating order for user:', req.user._id);
    console.log('Items:', items);
    
    // Check stock availability and calculate totals
    let orderTotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      // Find the product
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      
      // Check if enough stock
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` 
        });
      }
      
      // Calculate item total
      const itemTotal = (item.price || product.price) * item.quantity;
      orderTotal += itemTotal;
      
      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price || product.price,
        sku: product.sku
      });
      
      // UPDATE INVENTORY - Reduce stock
      product.stockQuantity -= item.quantity;
      await product.save();
      console.log(`Updated stock for ${product.name}: ${product.stockQuantity} remaining`);
    }
    
    // Calculate taxes
    const taxAmount = orderTotal * 0.18;
    const shippingAmount = orderTotal > 1000 ? 0 : 50;
    const finalDiscount = discountAmount || 0;
    const grandTotal = orderTotal + taxAmount + shippingAmount - finalDiscount;
    
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = generateInvoiceNumber();
    
    // Get user details
    const user = await User.findById(req.user._id);
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      invoiceNumber,
      items: orderItems,
      totalAmount: orderTotal,
      taxAmount,
      shippingAmount,
      discountAmount: finalDiscount,
      grandTotal,
      paymentMethod,
      shippingAddress,
      phone,
      couponCode: couponCode || null,
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    });
    
    console.log('Order created:', order._id);
    console.log('Inventory updated successfully');
    
    // Send email confirmation (don't await to avoid blocking)
    sendOrderConfirmation(user.email, user.name, order).catch(console.error);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-orderDate');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-orderDate');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;