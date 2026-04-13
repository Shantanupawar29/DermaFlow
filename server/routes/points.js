const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Redeem points
router.post('/', protect, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.glowPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    
    if (points % 100 !== 0) {
      return res.status(400).json({ message: 'Points must be in multiples of 100' });
    }
    
    user.glowPoints -= points;
    await user.save();
    
    res.json({ 
      success: true, 
      remainingPoints: user.glowPoints,
      discountValue: (points / 100) * 10
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;