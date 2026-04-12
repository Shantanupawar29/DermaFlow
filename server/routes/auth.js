const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

let sendWelcomeEmail = null;
try { 
  ({ sendWelcomeEmail } = require('../services/emailService')); 
} catch(e) { console.log('Email service not available'); }

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const voucherCode = `WELCOME${Math.floor(Math.random() * 9000 + 1000)}`;

    const user = await User.create({
      name,
      email,
      password,
      glowPoints: 50,
      vouchers: [{
        code: voucherCode,
        discount: 15,
        isUsed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }],
    });

    if (sendWelcomeEmail) {
      sendWelcomeEmail(email, name).catch(e => console.log('Welcome email error:', e.message));
    }

    const token = signToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ token, ...userResponse });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/update-skin-profile
router.post('/update-skin-profile', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const user = await User.findById(req.user._id);

    // Update basic info
    user.skinProfile.skinType = answers.skinType;
    user.skinProfile.concerns = answers.concerns;

    // Call the AI Service to generate the routine based on their answers
    const { am, pm } = await aiService.generateRoutine(answers.skinType, answers.concerns);
    
    user.skinProfile.routine = { am, pm };
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update skin profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Use the comparePassword method
   const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ token, ...userResponse });
  } catch (err) {
    console.error('Login error:', err.message);
      console.error('🔥 FULL ERROR:', err);
  console.error(err.stack);   // 👈 ADD THIS
  res.status(500).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
});

// 1. Update User Address (SCM/CRM Pillar)
router.put('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.addresses) user.addresses = [];
    user.addresses.push(req.body.address);
    await user.save();
    res.json({ success: true, user });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
});

// 2. Recycle Plastic Trigger (CRM/Sustainability Pillar)
router.post('/recycle', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pointsToAdd = 50;
    
    user.glowPoints = (user.glowPoints || 0) + pointsToAdd;
    user.recycledBottles = (user.recycledBottles || 0) + 1;
    
    await user.save();

    // SECURITY: Log this point change (if AuditLog model exists)
    try {
      await AuditLog.create({
        action: 'UPDATE_USER_DATA',
        targetName: user.name,
        description: `User recycled a bottle. Earned ${pointsToAdd} points.`,
        riskLevel: 'low',
        dataCategory: 'personal_data'
      });
    } catch (logError) {
      console.log('Audit log not available');
    }

    res.json({ success: true, glowPoints: user.glowPoints });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const userResponse = req.user.toObject ? req.user.toObject() : req.user;
  delete userResponse.password;
  res.json(userResponse);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, skinType, skinConcerns } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (skinType) user.skinType = skinType;
    if (skinConcerns) user.skinConcerns = skinConcerns;
    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/apply-voucher
router.post('/apply-voucher', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    const voucher = (user.vouchers || []).find(
      v => v.code === code && !v.isUsed && new Date(v.expiresAt) > new Date()
    );
    if (!voucher)
      return res.status(400).json({ message: 'Invalid or expired voucher code' });
    res.json({ discount: voucher.discount, message: `${voucher.discount}% discount applied!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add these to your existing auth.js file

// Get user stats (alternative endpoint)
router.get('/stats', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    const user = await User.findById(req.user._id);
    
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
      glowPoints: user.glowPoints || 0,
      loyaltyTier: user.loyaltyTier,
      recycledBottles: user.recycledBottles || 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// POST /api/auth/wishlist/:productId - Toggle Add/Remove
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    // Check if it's already in the wishlist
    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      // Add it
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Added to wishlist', isWishlisted: true });
    } else {
      // Remove it
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from wishlist', isWishlisted: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get pending reviews
router.get('/pending-reviews', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const orders = await Order.find({ 
      user: req.user._id, 
      status: 'delivered' 
    }).populate('items.product');
    
    const existingReviews = await Review.find({ user: req.user._id });
    const reviewedProductIds = existingReviews.map(r => r.product.toString());
    
    const pending = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && !reviewedProductIds.includes(item.product._id.toString())) {
          pending.push({
            productId: item.product._id,
            productName: item.product.name,
            orderId: order._id,
            orderDate: order.orderDate
          });
        }
      });
    });
    
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a review
router.post('/reviews', protect, async (req, res) => {
  try {
    const Review = require('../models/Review');
    const { productId, orderId, rating, title, comment } = req.body;
    
    // Check if user has purchased this product
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id,
      'items.product': productId
    });
    
    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ 
      product: productId, 
      user: req.user._id,
      order: orderId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      name: req.user.name,
      email: req.user.email
    });
    
    // Update product rating
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    product.rating = avgRating;
    product.numReviews = allReviews.length;
    await product.save();
    
    // Add glow points for review
    const user = await User.findById(req.user._id);
    user.glowPoints = (user.glowPoints || 0) + 25;
    await user.save();
    
    res.status(201).json({ message: 'Review submitted! +25 GlowPoints', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/scratch', protect, async (req, res) => {
  try {
    const { prize, orderId } = req.body;
    const user = await User.findById(req.user._id);

    const today = new Date().toDateString();
    const lastScratch = user.lastScratchDate ? new Date(user.lastScratchDate).toDateString() : null;
    if (lastScratch === today) {
      return res.status(429).json({ message: 'Already scratched today' });
    }

    user.lastScratchDate = new Date();
    let voucherCode = null;

    if (prize.type === 'points') {
      user.glowPoints = (user.glowPoints || 0) + (prize.pts || 0);
    } else if (prize.type === 'own' || prize.type === 'affiliate' || prize.type === 'shipping') {
      voucherCode = `SCR${Date.now().toString(36).toUpperCase()}`;
      if (!user.vouchers) user.vouchers = [];
      user.vouchers.push({
        code:      voucherCode,
        discount:  prize.discount || 0,
        type:      prize.flat ? 'flat' : 'percent',
        partner:   prize.partner || null,
        isUsed:    false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    await user.save();
    res.json({ success: true, voucherCode, glowPoints: user.glowPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/lucky-draw — enter the lucky draw ─────────────────────────
router.post('/lucky-draw', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.luckyDrawEntered) {
      return res.status(400).json({ message: 'Already entered' });
    }
    user.luckyDrawEntered = true;
    // Bonus entries for orders
    user.luckyDrawEntries = 1 + (user.orderCount || 0) * 3;
    await user.save();
    res.json({ success: true, entries: user.luckyDrawEntries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/redeem-points — convert glow points to discount ────────────
router.post('/redeem-points', protect, async (req, res) => {
  try {
    const { points } = req.body; // multiples of 100
    const user = await User.findById(req.user._id);

    if (!points || points < 100) return res.status(400).json({ message: 'Minimum redemption is 100 points' });
    if (points % 100 !== 0)      return res.status(400).json({ message: 'Points must be in multiples of 100' });
    if ((user.glowPoints || 0) < points) return res.status(400).json({ message: 'Insufficient Glow Points' });

    const discountRs = (points / 100) * 10; // 100 pts = ₹10
    const voucherCode = `GP${Date.now().toString(36).toUpperCase()}`;

    user.glowPoints -= points;
    if (!user.vouchers) user.vouchers = [];
    user.vouchers.push({
      code: voucherCode, discount: discountRs, type: 'flat',
      isUsed: false, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    res.json({ success: true, voucherCode, discountRs, remainingPoints: user.glowPoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;