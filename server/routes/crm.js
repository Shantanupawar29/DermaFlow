// server/routes/crm.js
// CRM – Skin Journey Timeline, Automated Check-ins, Segmentation, Referrals

const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const SkinJourney = require('../models/SkinJourney');
const Order       = require('../models/Order');
const AuditLog    = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

// Email service (non-blocking, won't crash if not configured)
let sendCheckInEmail = null;
try { ({ sendCheckInEmail } = require('../services/emailService')); } catch(e) {}

// ── Check-in email templates (Day 1, 7, 28) ──────────────────────────────────
const CHECK_IN_TEMPLATES = [
  {
    day: 1, subject: '✨ Your DermaFlow Journey Begins Today!',
    message: `Welcome to your personalised skincare journey! Here's how to apply your products for the best results. Your AM routine: Cleanser → Vitamin C → SPF. Your PM routine: Cleanser → Retinol → Moisturiser. Start with Retinol every 3rd night for the first 2 weeks.`,
  },
  {
    day: 7, subject: '🌿 Week 1 Check-In — Purging is Normal!',
    message: `It's been 7 days! You might notice a "purge" — some breakouts or peeling. This is COMPLETELY NORMAL. Your skin is adjusting. Keep going! Pro tip: If irritation is severe, skip Retinol for a night and apply extra moisturiser.`,
  },
  {
    day: 28, subject: '📸 28-Day Mark — Time for Your Progress Photo!',
    message: `You've completed one full skincare cycle — congratulations! Take a progress photo in the same lighting as your Day 1 photo and compare. Most users see visible improvement in texture and tone by now. Share your results on Instagram with #DermaFlowGlow!`,
  },
];

// ── POST /api/crm/journey/start ───────────────────────────────────────────────
// Start a skin journey for a user (called after quiz completion)
router.post('/journey/start', protect, async (req, res) => {
  try {
    const { products, skinType, concerns } = req.body;

    const existing = await SkinJourney.findOne({ user: req.user._id, status: 'active' });
    if (existing) {
      return res.json({ message: 'Journey already active', journey: existing });
    }

    const journey = await SkinJourney.create({
      user:     req.user._id,
      products: products || [],
      skinType,
      concerns: concerns || [],
      milestones: [
        { day: 1,  label: 'Journey Start — How to Apply' },
        { day: 7,  label: 'Purging Phase — Keep Going' },
        { day: 14, label: 'Adaptation — Skin Adjusting' },
        { day: 28, label: '28-Day Results' },
      ],
      segments: buildSegments(skinType, concerns),
    });

    // Schedule check-in emails (Day 1 — immediately)
    if (sendCheckInEmail) {
      const t = CHECK_IN_TEMPLATES[0];
      sendCheckInEmail(req.user.email, req.user.name, t.subject, t.message)
        .catch(e => console.log('Check-in email error:', e.message));

      journey.checkIns.push({ day: 1, subject: t.subject, message: t.message, sentAt: new Date() });
      await journey.save();
    }

    res.status(201).json({ message: 'Skin journey started!', journey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/journey/checkin ─────────────────────────────────────────────
// Send the next due check-in email (called by a cron job or admin trigger)
router.post('/journey/checkin', protect, admin, async (req, res) => {
  try {
    const journeys = await SkinJourney.find({ status: 'active' }).populate('user', 'name email');
    const now = new Date();
    let sent = 0;

    for (const journey of journeys) {
      const daysSinceStart = Math.floor((now - journey.startDate) / (1000 * 60 * 60 * 24));

      for (const template of CHECK_IN_TEMPLATES) {
        const alreadySent = journey.checkIns.some(c => c.day === template.day);
        if (daysSinceStart >= template.day && !alreadySent) {
          if (sendCheckInEmail && journey.user?.email) {
            sendCheckInEmail(journey.user.email, journey.user.name, template.subject, template.message)
              .catch(e => console.log('Email error:', e.message));
          }
          journey.checkIns.push({ day: template.day, subject: template.subject, message: template.message, sentAt: now });
          sent++;
        }
      }

      // Mark milestones as reached
      journey.milestones.forEach(m => {
        if (daysSinceStart >= m.day && !m.reached) {
          m.reached    = true;
          m.reachedAt  = now;
        }
      });

      await journey.save();
    }

    res.json({ message: `Sent ${sent} check-in email(s)`, sent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/journey/my ────────────────────────────────────────────────────
router.get('/journey/my', protect, async (req, res) => {
  try {
    const journey = await SkinJourney.findOne({ user: req.user._id, status: 'active' })
      .populate('products', 'name images price routineTime');
    res.json(journey || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/segments ─────────────────────────────────────────────────────
// Return all segment groups with user counts (for admin marketing tool)
router.get('/segments', protect, admin, async (req, res) => {
  try {
    const segmentCounts = await SkinJourney.aggregate([
      { $unwind: '$segments' },
      { $group: { _id: '$segments', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Skin-type segmentation from User model
    const skinTypes = await User.aggregate([
      { $match: { 'skinProfile.skinType': { $ne: null } } },
      { $group: { _id: '$skinProfile.skinType', count: { $sum: 1 } } },
    ]);

    // "At risk" customers — no order in 60 days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const atRisk = await User.countDocuments({
      orderCount: { $gt: 0 },
      updatedAt:  { $lt: sixtyDaysAgo },
    });

    res.json({ segmentCounts, skinTypes, atRisk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/segments/filter ─────────────────────────────────────────────
// Admin tool: "Show me all Oily Skin users who haven't bought BHA Cleanser in 60 days"
router.post('/segments/filter', protect, admin, async (req, res) => {
  try {
    const { skinType, excludeProductSku, notOrderedInDays = 60, limit = 50 } = req.body;

    await AuditLog.log({
      admin: req.user, action: 'VIEW_USER_DATA',
      description: `Ran segment filter: skinType=${skinType}, excludeSku=${excludeProductSku}`,
      riskLevel: 'low', dataCategory: 'personal_data', ipAddress: req.ip,
    });

    const filter = {};
    if (skinType) filter['skinProfile.skinType'] = skinType;

    let users = await User.find(filter).select('name email skinProfile glowPoints loyaltyTier lastLogin orderCount').limit(limit);

    // If we need to filter by product NOT purchased recently — do it in JS
    if (excludeProductSku && notOrderedInDays) {
      const cutoff = new Date(Date.now() - notOrderedInDays * 24 * 60 * 60 * 1000);
      const userIds = users.map(u => u._id);

      // Find users who DID buy that product recently
      const recentBuyers = await Order.distinct('user', {
        user:      { $in: userIds },
        createdAt: { $gte: cutoff },
        'items.sku': excludeProductSku,
      });

      // Exclude them
      users = users.filter(u => !recentBuyers.some(id => id.toString() === u._id.toString()));
    }

    res.json({
      count: users.length,
      users: users.map(u => ({
        _id:        u._id,
        name:       u.name,
        email:      u.email,
        skinType:   u.skinProfile?.skinType,
        glowPoints: u.glowPoints,
        tier:       u.loyaltyTier,
        orderCount: u.orderCount,
        lastLogin:  u.lastLogin,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/skin-profile/:userId (admin – with audit log) ────────────────
router.get('/skin-profile/:userId', protect, admin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId).select('name email skinProfile glowPoints loyaltyTier');
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // AUDIT LOG — critical because skinProfile is health data (DPDP Act 2023)
    await AuditLog.log({
      admin:      req.user,
      action:     'VIEW_SKIN_PROFILE',
      targetType: 'User',
      targetId:   targetUser._id,
      targetName: `User ${targetUser.name}`,
      description: `Admin ${req.user.name} viewed ${targetUser.name}'s skin profile at ${new Date().toLocaleTimeString('en-IN')}`,
      riskLevel:  'high',
      dataCategory: 'health_data',
      ipAddress:  req.ip,
      userAgent:  req.headers['user-agent'],
    });

    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crm/referral/apply ──────────────────────────────────────────────
// "Give ₹200, Get ₹200" referral program
router.post('/referral/apply', protect, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });

    // Award glow points to both
    const REFERRAL_POINTS = 200;
    await User.findByIdAndUpdate(referrer._id,      { $inc: { glowPoints: REFERRAL_POINTS } });
    await User.findByIdAndUpdate(req.user._id,       { $inc: { glowPoints: REFERRAL_POINTS } });

    res.json({ message: `${REFERRAL_POINTS} Glow Points added to both you and your referrer!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crm/summary (admin) ──────────────────────────────────────────────
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const [totalJourneys, activeJourneys, totalUsers, tierCounts] = await Promise.all([
      SkinJourney.countDocuments(),
      SkinJourney.countDocuments({ status: 'active' }),
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.aggregate([{ $group: { _id: '$loyaltyTier', count: { $sum: 1 } } }]),
    ]);

    const checkInsSent = await SkinJourney.aggregate([
      { $project: { checkInCount: { $size: '$checkIns' } } },
      { $group: { _id: null, total: { $sum: '$checkInCount' } } },
    ]);

    res.json({
      totalJourneys, activeJourneys, totalUsers,
      tierCounts,
      checkInsSent: checkInsSent[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── helper: build segment tags from quiz data ─────────────────────────────────
function buildSegments(skinType, concerns = []) {
  const segs = [];
  if (skinType) segs.push(skinType.toLowerCase().replace(' ', '_') + '_skin');
  concerns.forEach(c => segs.push(c.toLowerCase().replace(' ', '_')));
  return segs;
}

module.exports = router;