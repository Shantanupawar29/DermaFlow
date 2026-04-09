// server/routes/crm.js
const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const SkinJourney = require('../models/SkinJourney');
const Order       = require('../models/Order');
const Review      = require('../models/Review');
const AuditLog    = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

let sendCheckInEmail = null;
try { ({ sendCheckInEmail } = require('../services/emailService')); } catch(e) {}

const CHECK_IN_TEMPLATES = [
  { day: 1,  subject: 'Your DermaFlow Journey Begins Today!', message: `Welcome! AM: Cleanser → Vitamin C → SPF. PM: Cleanser → Retinol → Moisturiser. Start Retinol every 3rd night.` },
  { day: 7,  subject: 'Week 1 Check-In — Purging is Normal!', message: `7 days in! Some breakouts/peeling is normal. Keep going. If irritation is severe, skip Retinol one night.` },
  { day: 28, subject: '28-Day Mark — Time for Your Progress Photo!', message: `One full cycle done! Take a progress photo and compare. Share on Instagram with #DermaFlowGlow!` },
];

// ── GET /api/crm/summary ──────────────────────────────────────────────────────
// All KPI fields the CRM dashboard needs
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      tierCounts,
      skinTypeCounts,
      reviewCount,
      atRisk,
      allOrders,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        { $group: { _id: '$loyaltyTier', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { 'skinProfile.skinType': { $exists: true, $ne: null } } },
        { $group: { _id: '$skinProfile.skinType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Review.countDocuments(),
      User.countDocuments({
        role: { $ne: 'admin' },
        orderCount: { $gt: 0 },
        lastLogin: { $lt: sixtyDaysAgo },
      }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      ]),
    ]);

    const avgOrderValue = allOrders[0]
      ? Math.round(allOrders[0].total / allOrders[0].count)
      : 0;

    res.json({
      totalCustomers,
      tierCounts,
      skinTypeCounts,
      feedbackCount: reviewCount,
      flaggedCount: 0,
      atRisk,
      avgOrderValue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/customer-lifetime ───────────────────────────────────────────
router.get('/customer-lifetime', protect, admin, async (req, res) => {
  try {
    await AuditLog.log({
      admin: req.user, action: 'VIEW_USER_DATA',
      description: 'Viewed customer lifetime value report',
      riskLevel: 'medium', dataCategory: 'financial_data', ipAddress: req.ip,
    });

    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email skinProfile glowPoints loyaltyTier orderCount lastLogin')
      .sort({ glowPoints: -1 })
      .limit(50);

    // Get total spend per user from orders
    const userIds = users.map(u => u._id);
    const spendData = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', totalSpent: { $sum: '$grandTotal' }, orderCount: { $sum: 1 } } },
    ]);

    const spendMap = {};
    spendData.forEach(s => { spendMap[s._id.toString()] = s; });

    const result = users.map(u => {
      const spend = spendMap[u._id.toString()];
      const totalSpent = spend?.totalSpent || 0;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        skinType: u.skinProfile?.skinType,
        glowPoints: u.glowPoints || 0,
        tier: u.loyaltyTier || 'bronze',
        orderCount: spend?.orderCount || u.orderCount || 0,
        totalSpent,
        ltv: Math.round(totalSpent * 1.4),
        lastLogin: u.lastLogin,
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/feedback-analysis ───────────────────────────────────────────
router.get('/feedback-analysis', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const total = reviews.length;

    if (total === 0) {
      return res.json({
        total: 0, vibe: 'No reviews yet', avgRating: 0,
        positivePercent: 0, distribution: { positive: 0, neutral: 0, negative: 0 },
        categoryDistribution: [], topKeywords: [], recentFlagged: [],
      });
    }

    const avgRating = reviews.reduce((s, r) => s + (r.rating || 0), 0) / total;

    let positive = 0, neutral = 0, negative = 0;
    const keywordMap = {};
    const NEGATIVE_WORDS = ['terrible','awful','bad','horrible','disgusting','hate','broken','slow','sticky','greasy','stinging','burning','rash','allergic','irritating','disappointing','useless','fake','overpriced','expired','smells','painful'];
    const POSITIVE_WORDS = ['amazing','excellent','perfect','love','great','fantastic','smooth','glowing','transformed','best','recommend','brilliant','effective','worth','beautiful','gentle','absorbs','lightweight','hydrating','visible','results','improved','cleared','happy','wonderful'];

    reviews.forEach(r => {
      const rating = r.rating || 3;
      if (rating >= 4) positive++;
      else if (rating === 3) neutral++;
      else negative++;

      const words = (r.comment || '').toLowerCase().split(/\W+/).filter(Boolean);
      words.forEach(w => {
        if (POSITIVE_WORDS.includes(w) || NEGATIVE_WORDS.includes(w)) {
          keywordMap[w] = (keywordMap[w] || 0) + 1;
        }
      });
    });

    const positivePercent = Math.round((positive / total) * 100);
    let vibe = positivePercent >= 80 ? 'Overwhelmingly positive' :
               positivePercent >= 60 ? 'Mostly positive with minor concerns' :
               positivePercent >= 40 ? 'Mixed — quality issues being raised' :
               'Predominantly negative — action required';

    const topKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([word, count]) => ({ word, count }));

    // Low rated reviews as "flagged"
    const recentFlagged = reviews
      .filter(r => (r.rating || 5) <= 2)
      .slice(0, 5)
      .map(r => ({ _id: r._id, name: r.name || 'Anonymous', message: r.comment, rating: r.rating }));

    res.json({
      total, vibe, avgRating: avgRating.toFixed(1),
      positivePercent,
      distribution: { positive, neutral, negative },
      categoryDistribution: [],
      topKeywords,
      recentFlagged,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/segment-filter ─────────────────────────────────────────────
// Fixed URL (was /segments/filter — now matches frontend)
router.post('/segment-filter', protect, admin, async (req, res) => {
  try {
    const { skinType, tier, notBoughtSkuInDays, minOrders } = req.body;

    await AuditLog.log({
      admin: req.user, action: 'VIEW_USER_DATA',
      description: `Ran segment filter: skinType=${skinType}, tier=${tier}`,
      riskLevel: 'low', dataCategory: 'personal_data', ipAddress: req.ip,
    });

    const filter = { role: { $ne: 'admin' } };
    if (skinType) filter['skinProfile.skinType'] = skinType;
    if (tier) filter.loyaltyTier = tier;
    if (minOrders) filter.orderCount = { $gte: Number(minOrders) };

    let users = await User.find(filter)
      .select('name email skinProfile glowPoints loyaltyTier lastLogin orderCount')
      .limit(100);

    if (notBoughtSkuInDays?.sku && notBoughtSkuInDays?.days) {
      const cutoff = new Date(Date.now() - notBoughtSkuInDays.days * 24 * 60 * 60 * 1000);
      const recentBuyers = await Order.distinct('user', {
        user: { $in: users.map(u => u._id) },
        createdAt: { $gte: cutoff },
        'items.sku': notBoughtSkuInDays.sku,
      });
      users = users.filter(u => !recentBuyers.some(id => id.toString() === u._id.toString()));
    }

    // Enrich with spend data
    const spendData = await Order.aggregate([
      { $match: { user: { $in: users.map(u => u._id) } } },
      { $group: { _id: '$user', totalSpent: { $sum: '$grandTotal' }, orderCount: { $sum: 1 } } },
    ]);
    const spendMap = {};
    spendData.forEach(s => { spendMap[s._id.toString()] = s; });

    res.json({
      count: users.length,
      users: users.map(u => ({
        _id: u._id, name: u.name, email: u.email,
        skinType: u.skinProfile?.skinType,
        glowPoints: u.glowPoints || 0,
        tier: u.loyaltyTier || 'bronze',
        orderCount: spendMap[u._id.toString()]?.orderCount || u.orderCount || 0,
        totalSpent: spendMap[u._id.toString()]?.totalSpent || 0,
        lastLogin: u.lastLogin,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/journey/my ───────────────────────────────────────────────────
router.get('/journey/my', protect, async (req, res) => {
  try {
    const journey = await SkinJourney.findOne({ user: req.user._id, status: 'active' })
      .populate('products', 'name images price');
    res.json(journey || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/journey/start ──────────────────────────────────────────────
router.post('/journey/start', protect, async (req, res) => {
  try {
    const { products, skinType, concerns } = req.body;
    const existing = await SkinJourney.findOne({ user: req.user._id, status: 'active' });
    if (existing) return res.json({ message: 'Journey already active', journey: existing });

    const journey = await SkinJourney.create({
      user: req.user._id, products: products || [], skinType,
      concerns: concerns || [],
      milestones: [
        { day: 1, label: 'Journey Start' }, { day: 7, label: 'Week 1 Check-In' },
        { day: 14, label: 'Adaptation Phase' }, { day: 28, label: '28-Day Results' },
      ],
    });

    if (sendCheckInEmail) {
      const t = CHECK_IN_TEMPLATES[0];
      sendCheckInEmail(req.user.email, req.user.name, t.subject, t.message).catch(() => {});
      journey.checkIns.push({ day: 1, subject: t.subject, message: t.message, sentAt: new Date() });
      await journey.save();
    }

    res.status(201).json({ message: 'Skin journey started!', journey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/skin-profile/:userId ────────────────────────────────────────
router.get('/skin-profile/:userId', protect, admin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId).select('name email skinProfile glowPoints loyaltyTier');
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    await AuditLog.log({
      admin: req.user, action: 'VIEW_SKIN_PROFILE',
      targetType: 'User', targetId: targetUser._id, targetName: `User ${targetUser.name}`,
      description: `Admin ${req.user.name} viewed ${targetUser.name}'s skin profile`,
      riskLevel: 'high', dataCategory: 'health_data', ipAddress: req.ip,
    });
    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/referral/apply ─────────────────────────────────────────────
router.post('/referral/apply', protect, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });
    await User.findByIdAndUpdate(referrer._id, { $inc: { glowPoints: 200 } });
    await User.findByIdAndUpdate(req.user._id,  { $inc: { glowPoints: 200 } });
    res.json({ message: '200 Glow Points added to both accounts!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;