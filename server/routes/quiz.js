const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Submit quiz answers and get recommendations
router.post('/submit', protect, async (req, res) => {
  try {
    const { skinType, skinConcerns, hairConcerns, allergies, routineTime } = req.body;
    
    console.log('Quiz submitted for user:', req.user._id);
    console.log('Answers:', { skinType, skinConcerns, hairConcerns });
    
    // Get all active products
    const products = await Product.find({ isActive: true });
    
    // Score and recommend products based on quiz answers
    const scoredProducts = products.map(product => {
      let score = 0;
      
      // Match by skin type
      if (product.skinType && product.skinType === skinType) score += 20;
      
      // Match by concerns
      if (skinConcerns && product.concerns) {
        product.concerns.forEach(concern => {
          if (skinConcerns.includes(concern)) score += 15;
        });
      }
      
      // Match by hair concerns
      if (hairConcerns && product.category === 'hair') {
        hairConcerns.forEach(concern => {
          if (product.concerns?.includes(concern)) score += 15;
        });
      }
      
      // Avoid allergies
      if (allergies && product.ingredients) {
        const hasAllergen = allergies.some(allergy => 
          product.ingredients.some(ing => ing.toLowerCase().includes(allergy.toLowerCase()))
        );
        if (hasAllergen) score -= 50;
      }
      
      return { product, score };
    });
    
    // Sort by score and get top recommendations
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.product);
    
    // Separate AM and PM products
    const amProducts = recommendations.filter(p => p.routineTime === 'AM' || p.routineTime === 'both').slice(0, 4);
    const pmProducts = recommendations.filter(p => p.routineTime === 'PM' || p.routineTime === 'both').slice(0, 4);
    
    // Update user's skin profile and routine
    await User.findByIdAndUpdate(req.user._id, {
      skinProfile: {
        skinType: skinType,
        concerns: skinConcerns || [],
        routine: {
          am: amProducts.map(p => p._id),
          pm: pmProducts.map(p => p._id)
        }
      },
      glowPoints: (req.user.glowPoints || 0) + 25 // 25 points for completing quiz
    });
    
    console.log(`Quiz completed for ${req.user.email}. Recommended ${recommendations.length} products`);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's routine
router.get('/routine', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skinProfile.routine.am')
      .populate('skinProfile.routine.pm');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const routine = {
      amRoutine: user.skinProfile?.routine?.am || [],
      pmRoutine: user.skinProfile?.routine?.pm || [],
      skinType: user.skinProfile?.skinType || null,
      concerns: user.skinProfile?.concerns || []
    };
    
    res.json(routine);
  } catch (error) {
    console.error('Get routine error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user's routine manually
router.put('/routine', protect, async (req, res) => {
  try {
    const { amRoutine, pmRoutine } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'skinProfile.routine.am': amRoutine || [],
          'skinProfile.routine.pm': pmRoutine || []
        }
      },
      { new: true }
    ).populate('skinProfile.routine.am')
     .populate('skinProfile.routine.pm');
    
    res.json({
      amRoutine: user.skinProfile?.routine?.am || [],
      pmRoutine: user.skinProfile?.routine?.pm || []
    });
  } catch (error) {
    console.error('Update routine error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's points and tier
router.get('/points', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let tier = 'bronze';
    if (user.glowPoints >= 2000) tier = 'platinum';
    else if (user.glowPoints >= 1000) tier = 'gold';
    else if (user.glowPoints >= 500) tier = 'silver';
    
    res.json({
      glowPoints: user.glowPoints || 0,
      loyaltyTier: tier,
      nextTierPoints: tier === 'bronze' ? 500 : tier === 'silver' ? 1000 : tier === 'gold' ? 2000 : null,
      vouchers: user.vouchers || []
    });
  } catch (error) {
    console.error('Get points error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;