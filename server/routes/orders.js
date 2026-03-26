const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// CREATE ORDER
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    const order = new Order({
      userId: req.user.id,
      products,
      totalAmount
    });

    await order.save();

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;