// server/routes/subscriptions.js
const express      = require('express');
const router       = express.Router();
const Subscription = require('../models/Subscription');
const Product      = require('../models/Product');
const User         = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const PLAN_DAYS    = { monthly: 30, quarterly: 90, biannual: 180 };
const PLAN_DISCOUNT= { monthly: 10, quarterly: 15, biannual: 20 }; // % off

const FREEBIE_LABELS = {
  none:                   null,
  mini_above_2000:        'Free Mini Product Sample',
  travel_kit_above_5000:  'Free Travel Kit (5 minis)',
  full_size_above_7500:   'Free Full-Size Surprise Product',
};

// ── POST /api/subscriptions — create subscription ─────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { productId, plan, addressId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stockQuantity < 1) return res.status(400).json({ message: 'Product out of stock' });

    const discPct  = PLAN_DISCOUNT[plan] || 10;
    const discPrice = Math.round(product.price * (1 - discPct / 100));

    const user = await User.findById(req.user._id);
    const addr = addressId ? user.addresses?.id(addressId) : user.addresses?.find(a => a.isDefault);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + (PLAN_DAYS[plan] || 30));

    const existing = await Subscription.findOne({ user: req.user._id, product: productId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'You already have an active subscription for this product' });

    const sub = await Subscription.create({
      user:          req.user._id,
      product:       productId,
      productName:   product.name,
      productImage:  product.images?.[0],
      plan,
      frequency:     PLAN_DAYS[plan] || 30,
      pricePerCycle: discPrice,
      originalPrice: product.price,
      discountPercent: discPct,
      nextDeliveryDate: nextDate,
      address: addr ? { name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, zipCode: addr.zipCode } : {},
    });

    res.status(201).json({ subscription: sub, freebieLabel: FREEBIE_LABELS[sub.freebieTier] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── GET /api/subscriptions/mine — user's subscriptions ───────────────────────
router.get('/mine', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).populate('product', 'name images price');
    res.json(subs.map(s => ({ ...s.toObject(), freebieLabel: FREEBIE_LABELS[s.freebieTier] })));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── PUT /api/subscriptions/:id/pause ─────────────────────────────────────────
router.put('/:id/pause', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    sub.status = sub.status === 'paused' ? 'active' : 'paused';
    sub.pausedAt = sub.status === 'paused' ? new Date() : null;
    await sub.save();
    res.json(sub);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── PUT /api/subscriptions/:id/cancel ────────────────────────────────────────
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    sub.cancelReason = req.body.reason || '';
    await sub.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── GET /api/subscriptions (admin) — all subscriptions ───────────────────────
router.get('/', protect, admin, async (req, res) => {
  try {
    const subs = await Subscription.find({}).populate('user', 'name email').populate('product', 'name').sort('-createdAt');
    res.json(subs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── GET /api/subscriptions/freebies — freebie tiers info ─────────────────────
router.get('/freebies', (req, res) => {
  res.json([
    { min: 2000, max: 4999, label: 'Free Mini Sample',      icon: 'gift',   tier: 'mini_above_2000' },
    { min: 5000, max: 7499, label: 'Free Travel Kit',       icon: 'bag',    tier: 'travel_kit_above_5000' },
    { min: 7500, max: null, label: 'Free Full-Size Product', icon: 'sparkle',tier: 'full_size_above_7500' },
  ]);
});

module.exports = router;
