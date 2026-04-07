const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/Feedback');
const { protect } = require('../middleware/auth');

// ── helper: check admin ──────────────────────────────────────────────────────
const isAdmin = (req) => req.user && req.user.role === 'admin';

// POST /api/feedback — submit any feedback (public or logged in)
router.post('/', async (req, res) => {
  try {
    const { type, product, rating, category, subject, message, email, name } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const fb = await Feedback.create({
      user:     req.user?._id,
      email:    email || req.user?.email,
      name:     name  || req.user?.name,
      type:     type  || 'review',
      product,
      rating,
      category,
      subject,
      message,
    });

    res.status(201).json({
      success:  true,
      id:       fb._id,
      flagged:  fb.flagged,
      priority: fb.priority,
      sentiment:fb.sentimentLabel,
      message:  'Thank you for your feedback!',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback — admin: list all with filters
router.get('/', protect, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Admin only' });

    const { type, category, status, flagged, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (flagged !== undefined) filter.flagged = flagged === 'true';

    const items = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Feedback.countDocuments(filter);
    res.json({ items, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/analytics — CRM analytics dashboard data
router.get('/analytics', protect, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Admin only' });

    const [
      totalCount,
      byType,
      byCategory,
      bySentiment,
      byPriority,
      flaggedCount,
      avgRating,
      recentFlagged,
      resolvedCount,
    ] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Feedback.aggregate([{ $group: { _id: '$sentimentLabel', count: { $sum: 1 } } }]),
      Feedback.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Feedback.countDocuments({ flagged: true }),
      Feedback.aggregate([{ $match: { rating: { $exists: true } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Feedback.find({ flagged: true, status: 'open' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
      Feedback.countDocuments({ status: 'resolved' }),
    ]);

    // Calculate top issue (category with most flagged items)
    const topIssue = await Feedback.aggregate([
      { $match: { flagged: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // Trend: feedback per day last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trend = await Feedback.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        negative: { $sum: { $cond: [{ $eq: ['$sentimentLabel', 'negative'] }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalCount, byType, byCategory, bySentiment, byPriority,
      flaggedCount, resolvedCount,
      avgRating:    avgRating[0]?.avg || 0,
      recentFlagged,
      topIssue:     topIssue[0]?._id || 'none',
      trend,
      resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/feedback/:id — admin: update status / add notes
router.put('/:id', protect, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: 'Admin only' });
    const { status, adminNotes, priority } = req.body;
    const update = {};
    if (status)     { update.status = status; if (status === 'resolved') update.resolvedAt = new Date(); }
    if (adminNotes) update.adminNotes = adminNotes;
    if (priority)   update.priority   = priority;
    const fb = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;