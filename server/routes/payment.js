const express   = require('express');
const router    = express.Router();
const Razorpay  = require('razorpay');
const crypto    = require('crypto');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    console.log('💰 Amount received from frontend (paise):', amount);

    const amountInPaise = Math.round(Number(amount)); // already in paise, NO * 100

    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({ error: `Invalid amount: ${amount}` });
    }

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });

    console.log('✅ Razorpay order:', order.id, '| ₹', amountInPaise / 100);

    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('❌ Razorpay error:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.error?.description || error.message });
  }
});

// POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body              = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;