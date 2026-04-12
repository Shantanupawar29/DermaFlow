// server/routes/sales.js
const express  = require('express');
const router   = express.Router();
const Sale     = require('../models/Sale');
const Subscription = require('../models/Subscription');
const Product  = require('../models/Product');
const User     = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// GET /api/sales — active sales (public)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const sales = await Sale.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } });
    res.json(sales);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/admin-all', protect, admin, async (req, res) => {
  try {
    const sales = await Sale.find().sort('-createdAt');
    res.json(sales);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const sale = await Sale.create({ ...req.body, createdBy: req.user.name });
    if (sale.isActive && new Date(sale.startDate) <= new Date()) await applyDiscount(sale);
    res.status(201).json(sale);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.isActive === false) await removeDiscount(sale);
    else if (req.body.isActive === true) await applyDiscount(sale);
    res.json(sale);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (sale) await removeDiscount(sale);
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Winback emails
router.post('/winback', protect, admin, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const users = await User.find({ role: { $ne: 'admin' }, orderCount: { $gt: 0 }, updatedAt: { $lt: cutoff } }).select('name email glowPoints').limit(500);
    // Email sending would go here via emailService
    res.json({ sent: users.length, message: `Winback queued for ${users.length} customers` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// SUBSCRIPTIONS
router.get('/subscriptions/my', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).populate('product', 'name images price');
    res.json(subs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/subscriptions', protect, async (req, res) => {
  try {
    const { productId, plan, shippingAddress, paymentMethod } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const existing = await Subscription.findOne({ user: req.user._id, product: productId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'Already subscribed' });
    const planDays = { monthly: 30, quarterly: 90, biannual: 180 };
    const sub = await Subscription.create({
      user: req.user._id, product: productId,
      productName: product.name, productPrice: product.price,
      plan, nextDelivery: new Date(Date.now() + (planDays[plan] || 30) * 86400000),
      shippingAddress, paymentMethod,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { glowPoints: 20 } });
    res.status(201).json({ subscription: sub, glowPointsEarned: 20 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/subscriptions/:id', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { status: req.body.status }, { new: true });
    res.json(sub);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/subscriptions/admin-all', protect, admin, async (req, res) => {
  try {
    const subs = await Subscription.find().populate('user','name email').populate('product','name').sort('-createdAt');
    res.json(subs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

async function applyDiscount(sale) {
  let filter = { isActive: true };
  if (sale.scope === 'category') filter.category = { $in: sale.categories };
  else if (sale.scope === 'specific') filter._id = { $in: sale.products };
  if (sale.scope !== 'all' && Object.keys(filter).length === 1) return;
  await Product.updateMany(sale.scope === 'all' ? {} : filter, { discountPercentage: sale.discountValue });
}

async function removeDiscount(sale) {
  let filter = {};
  if (sale.scope === 'category') filter.category = { $in: sale.categories };
  else if (sale.scope === 'specific') filter._id = { $in: sale.products };
  await Product.updateMany(filter, { discountPercentage: 0 });
}

module.exports = router;
