const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// Import email service
const { sendOrderConfirmation } = require('../services/emailService');

// Generate invoice number
function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, phone, totalAmount, discount, couponCode } = req.body;
    
    console.log('Creating order for user:', req.user._id);
    console.log('Payment method:', paymentMethod);
    
    // Calculate totals
    let orderTotal = totalAmount || 0;
    const taxAmount = orderTotal * 0.18;
    const shippingAmount = orderTotal > 1000 ? 0 : 50;
    const grandTotal = orderTotal + taxAmount + shippingAmount;
    
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = generateInvoiceNumber();
    
    // Get user details for email
    const user = await User.findById(req.user._id);
    
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      invoiceNumber,
      items: items.map(item => ({
        product: item.product,
        name: item.name || 'Product',
        quantity: item.quantity,
        price: item.price || 0
      })),
      totalAmount: orderTotal,
      taxAmount,
      shippingAmount,
      grandTotal,
      paymentMethod,
      shippingAddress,
      phone,
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      discountAmount: discount || 0,
      couponCode: couponCode || null
    });
    
    console.log('Order created:', order._id);
    
    // SEND ORDER CONFIRMATION EMAIL
    try {
      console.log('Attempting to send email to:', user.email);
      const emailSent = await sendOrderConfirmation(user.email, user.name, order);
      if (emailSent) {
        console.log('✅ Order confirmation email sent to:', user.email);
      } else {
        console.log('❌ Failed to send email to:', user.email);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the order if email fails
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-orderDate');
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
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-orderDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;