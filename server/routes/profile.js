const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Get user profile with all details
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('wishlist');
    
    const orders = await Order.find({ user: req.user._id })
      .sort('-orderDate')
      .limit(10);
    
    res.json({
      user,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
        savedAddresses: user.addresses?.length || 0,
        wishlistCount: user.wishlist?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/', protect, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, preferences } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ADDRESSES ============

// Get all addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add address
router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.addresses) user.addresses = [];
    
    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }
    
    // If this address is set as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    
    user.addresses.push(req.body);
    await user.save();
    
    res.json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update address
router.put('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(a => a._id.toString() === req.params.addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If updating to default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    
    Object.assign(user.addresses[addressIndex], req.body);
    await user.save();
    
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    
    // If deleted address was default, make another default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ WISHLIST ============

// Get wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist) user.wishlist = [];
    
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }
    
    res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ORDERS ============

// Get all orders
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-orderDate');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/orders/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ STATS ============

// Get user stats
router.get('/stats', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    const user = await User.findById(req.user._id);
    
    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0),
      totalProducts: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
      glowPoints: user.glowPoints || 0,
      loyaltyTier: user.loyaltyTier,
      savedAddresses: user.addresses?.length || 0,
      wishlistCount: user.wishlist?.length || 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add these to your existing profile.js file

// ============ SAVED CARDS ============

// Get all saved cards
router.get('/cards', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.savedCards || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new card
router.post('/cards', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { last4, cardType, expiryMonth, expiryYear, isDefault } = req.body;
    
    if (!user.savedCards) user.savedCards = [];
    
    // If this is the first card or marked as default, update others
    if (user.savedCards.length === 0 || isDefault) {
      user.savedCards.forEach(card => { card.isDefault = false; });
    }
    
    user.savedCards.push({
      last4,
      cardType,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || user.savedCards.length === 0
    });
    
    await user.save();
    res.json({ message: 'Card saved successfully', cards: user.savedCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a saved card
router.delete('/cards/:cardId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedCards = user.savedCards.filter(c => c._id.toString() !== req.params.cardId);
    
    // If deleted card was default, make another default
    if (user.savedCards.length > 0 && !user.savedCards.some(c => c.isDefault)) {
      user.savedCards[0].isDefault = true;
    }
    
    await user.save();
    res.json({ message: 'Card deleted successfully', cards: user.savedCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set default card
router.put('/cards/:cardId/default', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.savedCards.forEach(card => {
      card.isDefault = card._id.toString() === req.params.cardId;
    });
    
    await user.save();
    res.json({ message: 'Default card updated', cards: user.savedCards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;