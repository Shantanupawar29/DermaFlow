const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ============ PUBLIC ROUTES ============

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = 'newest', page = 1, limit = 10 } = req.query;
    
    let sortOption = {};
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };
    if (sort === 'helpful') sortOption = { helpful: -1 };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ product: productId, isApproved: true })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ product: productId, isApproved: true });
    
    // Calculate rating distribution
    const ratingCounts = {
      r5: await Review.countDocuments({ product: productId, rating: 5, isApproved: true }),
      r4: await Review.countDocuments({ product: productId, rating: 4, isApproved: true }),
      r3: await Review.countDocuments({ product: productId, rating: 3, isApproved: true }),
      r2: await Review.countDocuments({ product: productId, rating: 2, isApproved: true }),
      r1: await Review.countDocuments({ product: productId, rating: 1, isApproved: true })
    };
    
    const avgRating = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    
    res.json({
      reviews,
      total,
      stats: {
        count: total,
        avg: avgRating[0]?.avg || 0,
        ...ratingCounts
      },
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
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
    const { productId, rating, title, comment } = req.body;
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      status: 'delivered',
      'items.product': productId
    });
    
    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title: title || '',
      comment,
      name: req.user.name,
      email: req.user.email,
      verifiedPurchase: true
    });
    
    // Update product rating
    const product = await Product.findById(productId);
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : rating;
    
    product.rating = avgRating;
    product.numReviews = allReviews.length;
    await product.save();
    
    // Add glow points for review
    const user = await User.findById(req.user._id);
    user.glowPoints = (user.glowPoints || 0) + 25;
    await user.save();
    
    res.status(201).json({ 
      message: 'Review submitted! +25 GlowPoints added to your account.',
      review 
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.helpful = (review.helpful || 0) + 1;
    await review.save();
    
    res.json({ message: 'Marked as helpful', helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending reviews for current user
router.get('/pending', protect, async (req, res) => {
  try {
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
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    product.rating = avgRating;
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
    
    product.rating = avgRating;
    product.numReviews = allReviews.length;
    await product.save();
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Get all reviews (admin)
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject review (admin)
router.put('/admin/:reviewId/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved },
      { new: true }
    );
    
    res.json({ message: `Review ${isApproved ? 'approved' : 'rejected'}`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to review (admin)
router.post('/admin/:reviewId/reply', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { reply } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { adminReply: reply },
      { new: true }
    );
    
    res.json({ message: 'Reply added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;