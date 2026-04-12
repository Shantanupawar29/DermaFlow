const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Batch = require('../models/Batch');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');

const QUALITY_THRESHOLD = 3; // auto-quarantine if 3+ quality alerts on same product in 7 days

// ============ PUBLIC ROUTES ============

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const { flagged, product, page = 1, limit = 20 } = req.query;
    const filter = { isApproved: true };
    if (flagged === 'true') filter.flaggedForReview = true;
    if (product) filter.product = product;
    
    const reviews = await Review.find(filter)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('product', 'name');
    
    const total = await Review.countDocuments(filter);
    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const filter = { product: productId, isApproved: true };
    const sortMap = { 
      newest: '-createdAt', 
      helpful: '-helpful', 
      highest: '-rating', 
      lowest: 'rating' 
    };
    
    const reviews = await Review.find(filter)
      .sort(sortMap[sort] || '-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name');
    
    const total = await Review.countDocuments(filter);
    
    // Convert to ObjectId for aggregation
    const objectId = new mongoose.Types.ObjectId(productId);
    
    const stats = await Review.aggregate([
      { $match: { product: objectId, isApproved: true } },
      { 
        $group: { 
          _id: null, 
          avg: { $avg: '$rating' }, 
          count: { $sum: 1 },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);
    
    res.json({ 
      reviews, 
      total, 
      pages: Math.ceil(total / limit), 
      stats: stats[0] || { avg: 0, count: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0 }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ PROTECTED ROUTES ============

// Submit review (authenticated users only)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;
    const user = req.user;

    // Check verified purchase
    let verifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({ 
        _id: orderId, 
        user: user._id,
        status: 'delivered'
      });
      if (order) {
        verifiedPurchase = true;
      }
    }

    // Check if already reviewed this product for this order
    if (orderId) {
      const existing = await Review.findOne({ 
        user: user._id, 
        product: productId, 
        order: orderId 
      });
      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this product for this order' });
      }
    }

    const review = await Review.create({
      user: user._id,
      name: user.name,
      email: user.email,
      product: productId,
      order: orderId || null,
      rating,
      title: title || '',
      comment,
      verifiedPurchase,
    });

    // Award glow points for review
    await User.findByIdAndUpdate(user._id, { $inc: { glowPoints: 25 } });

    // Update product rating
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : rating;
    
    await Product.findByIdAndUpdate(productId, { 
      rating: Math.round(avgRating * 10) / 10, 
      numReviews: allReviews.length 
    });

    // ── BATCH QUALITY AUTO-TRIGGER ────────────────────────────────────────────
    if (review.hasQualityAlert || !review.isAuthentic || review.batchConcern) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentAlerts = await Review.countDocuments({
        product: productId,
        createdAt: { $gte: sevenDaysAgo },
        $or: [{ hasQualityAlert: true }, { isAuthentic: false }, { batchConcern: true }],
      });

      if (recentAlerts >= QUALITY_THRESHOLD) {
        // Find active batch for this product and quarantine it
        const activeBatch = await Batch.findOne({ product: productId, status: 'active' });
        if (activeBatch) {
          await activeBatch.quarantine(
            `Auto-quarantined: ${recentAlerts} quality/authenticity reviews in 7 days.`,
            'ai_review_analysis'
          );
          
          await AuditLog.log({
            admin: { _id: null, name: 'System', email: 'system', role: 'system' },
            action: 'QUARANTINE_BATCH',
            targetType: 'Batch', 
            targetId: activeBatch._id, 
            targetName: activeBatch.batchId,
            description: `AUTO: Batch ${activeBatch.batchId} quarantined due to ${recentAlerts} quality reviews`,
            riskLevel: 'high', 
            dataCategory: 'operational',
          });
        }
      }
    }

    res.status(201).json({ 
      message: 'Review submitted! +25 GlowPoints added to your account.',
      review, 
      glowPointsEarned: 25 
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId, 
      { $inc: { helpful: 1 } }, 
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending reviews for current user (orders delivered, not reviewed)
router.get('/pending', protect, async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ 
      user: req.user._id, 
      status: 'delivered' 
    }).populate('items.product');
    
    const existingReviews = await Review.find({ user: req.user._id });
    const reviewedProductIds = existingReviews.map(r => r.product.toString());
    
    const pending = [];
    
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        if (item.product && !reviewedProductIds.includes(item.product._id.toString())) {
          pending.push({
            productId: item.product._id,
            productName: item.product.name,
            orderId: order._id,
            orderNumber: order.orderNumber,
            deliveredAt: order.updatedAt
          });
        }
      }
    }
    
    res.json(pending);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's own reviews
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update own review
router.put('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ 
      _id: req.params.reviewId, 
      user: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    const { rating, title, comment } = req.body;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    
    await review.save();
    
    // Update product rating
    const product = await Product.findById(review.product);
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : review.rating;
    
    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();
    
    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete own review
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ 
      _id: req.params.reviewId, 
      user: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update product rating
    const product = await Product.findById(review.product);
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
    
    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Get all reviews (admin)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { flagged, product, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (flagged === 'true') filter.flaggedForReview = true;
    if (product) filter.product = product;
    
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments(filter);
    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve review (admin)
router.put('/admin/:reviewId/approve', protect, admin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved, flaggedForReview: false },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: `Review ${isApproved ? 'approved' : 'rejected'}`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to review (admin)
router.post('/admin/:reviewId/reply', protect, admin, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { adminReply: reply },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: 'Reply added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve review (alternative endpoint)
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true, flaggedForReview: false }, 
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to review (alternative endpoint)
router.put('/:id/reply', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id, 
      { adminReply: req.body.reply }, 
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;