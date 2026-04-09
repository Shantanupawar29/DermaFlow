const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

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
router.post('/update-skin-profile', protect, async (req, res) => {
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
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ token, ...userResponse });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
});
// 1. Update User Address (SCM/CRM Pillar)
router.put('/address', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.push(req.body.address); // Make sure your User model has an 'addresses' array
        await user.save();
        res.json({ success: true, user });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 2. Recycle Plastic Trigger (CRM/Sustainability Pillar)
router.post('/recycle', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const pointsToAdd = 20; // Example: 20 points per bottle
        
        user.glowPoints += pointsToAdd;
        user.recycledBottles = (user.recycledBottles || 0) + 1;
        
        await user.save();

        // SECURITY: Log this point change
        await AuditLog.create({
            action: 'UPDATE_USER_DATA',
            targetName: user.name,
            description: `User recycled a bottle. Earned ${pointsToAdd} points.`,
            riskLevel: 'low',
            dataCategory: 'personal_data'
        });

        res.json({ success: true, glowPoints: user.glowPoints });
    } catch (error) { res.status(500).json({ message: error.message }); }
});
// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const userResponse = req.user.toObject ? req.user.toObject() : req.user;
  delete userResponse.password;
  res.json(userResponse);
});
// Add this to your existing users.js
router.post('/recycle', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pointsToAdd = 50;
    user.glowPoints = (user.glowPoints || 0) + pointsToAdd;
    await user.save();
    
    res.json({ 
      success: true, 
      glowPoints: user.glowPoints,
      message: `Added ${pointsToAdd} GlowPoints for recycling!`
    });
  } catch (error) {
    console.error('Recycle error:', error);
    res.status(500).json({ message: error.message });
  }
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

module.exports = router;