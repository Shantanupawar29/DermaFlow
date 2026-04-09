const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');
const { generateVibeSummary } = require('../services/sentimentService');

// Dashboard data
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    console.log('Admin dashboard accessed by:', req.user.email);

    const users = await User.find({ role: 'user' });
    const orders = await Order.find({});
    const products = await Product.find({});

    const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.safetyThreshold || 10));

    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyRevenue = last7Days.map(date => {
      const dayOrders = orders.filter(order => {
        const orderDate = order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '';
        return orderDate === date;
      });
      const revenue = dayOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
      return { _id: date, revenue, orders: dayOrders.length };
    });

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalProducts: products.length,
      lowStock: lowStock.map(p => ({
        _id: p._id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        safetyThreshold: p.safetyThreshold || 10
      })),
      dailyRevenue
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sentiment analysis route - now uses sentimentService (no ESM import)
router.get('/sentiment-vibe', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find();

    if (!reviews || reviews.length === 0) {
      return res.json({
        aiSummary: 'No reviews available for analysis.',
        positiveThemes: [],
        negativeThemes: [],
        vibe: 'No reviews yet',
        alertCount: 0,
      });
    }

    const result = await generateVibeSummary(reviews);
    res.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ERP audit log route
router.get('/erp/audit-log', protect, admin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all orders
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-orderDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({ orders, total });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;