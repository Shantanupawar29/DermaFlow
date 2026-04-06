const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// Get customers with CRM data
router.get('/', protect, admin, async (req, res) => {
  try {
    const { search, tier } = req.query;
    let query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query);
    
    // Get order data for each user
    const customersWithData = await Promise.all(users.map(async (user) => {
      const orders = await Order.find({ user: user._id });
      const totalSpent = orders.reduce((sum, order) => sum + order.grandTotal, 0);
      const orderCount = orders.length;
      
      // Calculate loyalty tier based on spending
      let loyaltyTier = 'bronze';
      if (totalSpent > 50000) loyaltyTier = 'platinum';
      else if (totalSpent > 20000) loyaltyTier = 'gold';
      else if (totalSpent > 5000) loyaltyTier = 'silver';
      
      // Glow points = 10% of total spent
      const glowPoints = Math.floor(totalSpent / 10);
      
      return {
        ...user.toObject(),
        totalSpent,
        orderCount,
        loyaltyTier,
        glowPoints,
        skinType: user.skinType || 'Not specified'
      };
    }));
    
    // Filter by tier if specified
    let filtered = customersWithData;
    if (tier) {
      filtered = customersWithData.filter(c => c.loyaltyTier === tier);
    }
    
    res.json({
      customers: filtered,
      total: filtered.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;