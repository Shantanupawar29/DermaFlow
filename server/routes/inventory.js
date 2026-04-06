const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    const stats = {
      total: products.length,
      inStock: products.filter(p => p.stockQuantity > (p.safetyThreshold || 10)).length,
      low: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= (p.safetyThreshold || 10)).length,
      outOf: products.filter(p => p.stockQuantity === 0).length
    };
    
    res.json({ products, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;