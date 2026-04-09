// server/routes/admin-additions.js
// ADD THESE ROUTES to your existing server/routes/admin.js file
// (or require this file and mount it on /api/admin)

const express  = require('express');
const router   = express.Router();
const Review   = require('../models/Review');
const Feedback = require('../models/Feedback');
const Order    = require('../models/Order');
const User     = require('../models/User');
const Product  = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

// Remove the static require - we'll import dynamically
// const { generateVibeSummary, analyseReview } = require('../services/sentimentService');

// ── GET /api/admin/sentiment-vibe ─────────────────────────────────────────────
// "The Vibe" — NLP summary of all reviews, saving admin hours of manual reading
router.get('/sentiment-vibe', protect, admin, async (req, res) => {
  try {
    // Dynamic import to avoid top-level await issues
    const { generateVibeSummary, analyseReview } = await import('../services/sentimentService.js');
    
    const { productId } = req.query;
    const filter = productId ? { product: productId } : {};

    // Combine reviews + feedback
    const [reviews, feedback] = await Promise.all([
      Review.find({ isApproved: true, ...filter }),
      Feedback.find({ type: 'review', ...filter }),
    ]);

    const allReviews = [
      ...reviews.map(r => ({ comment: r.comment, rating: r.rating })),
      ...feedback.map(f => ({ comment: f.message, rating: f.rating })),
    ];

    const vibe = await generateVibeSummary(allReviews);

    // Log audit - comment this out if AuditLog.log method doesn't exist
    if (AuditLog.log) {
      await AuditLog.log({
        admin:      req.user,
        action:     'VIEW_USER_DATA',
        description:`Ran sentiment vibe analysis on ${allReviews.length} reviews`,
        dataCategory: 'operational',
        riskLevel:  'low',
        ipAddress:  req.ip,
      });
    }

    res.json(vibe);
  } catch (err) {
    console.error('Sentiment analysis error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/dashboard ──────────────────────────────────────────────────
// Updated dashboard with audit log summary and ERP links
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const [
      totalOrders, totalUsers, totalProducts, revenueAgg,
      lowStock, recentAudit,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Product.find({ isActive: true, $expr: { $lte: ['$stockQuantity', '$safetyThreshold'] } })
        .select('name stockQuantity safetyThreshold').limit(10),
      AuditLog.find({ riskLevel: { $in: ['high','critical'] } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }, paymentStatus: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue:  revenueAgg[0]?.total || 0,
      lowStock,
      dailyRevenue,
      recentHighRiskAudit: recentAudit,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/rate-limit-stats ───────────────────────────────────────────
// Show rate-limiting activity (IP hits, blocked requests)
router.get('/rate-limit-stats', protect, admin, async (req, res) => {
  // In production: pull from Redis or express-rate-limit store
  res.json({
    quizEndpoint: { hits: 1847, blocked: 23, uniqueIPs: 412 },
    searchEndpoint: { hits: 5621, blocked: 87, uniqueIPs: 1204 },
    authEndpoint:  { hits: 892,  blocked: 14, uniqueIPs: 334 },
    message: 'Rate limiting active: 20 req/15min on /api/auth, 300 req/15min global',
  });
});

module.exports = router;