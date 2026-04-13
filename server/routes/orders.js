const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');
const {
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendFeedbackRequest,
  sendTierUpgrade
} = require('../services/emailService');

// Generate invoice number
function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Create order - UPDATED to accept frontend calculations
router.post('/', protect, async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      phone, 
      totalAmount,      // This comes as paise from frontend
      discountAmount,   // This comes as paise from frontend
      couponCode,
      glowPointsUsed = 0 
    } = req.body;

    console.log('Creating order for user:', req.user._id);
    console.log('Received data:', { totalAmount, discountAmount, glowPointsUsed });

    // Convert paise to rupees for backend storage
    const totalAmountRupees = totalAmount / 100;
    const discountAmountRupees = discountAmount / 100;

    let orderTotal = 0;
    const orderItems = [];

    // Update inventory
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      const itemTotal = (item.price || product.price) * item.quantity;
      orderTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price || product.price,
        sku: product.sku
      });

      product.stockQuantity -= item.quantity;
      await product.save();
    }

    // Use frontend's calculated totals instead of recalculating
    const taxAmount = orderTotal * 0.18;
    const shippingAmount = orderTotal > 1000 ? 0 : 50;
    const finalDiscount = discountAmountRupees;
    const grandTotal = totalAmountRupees; // Frontend already sent the correct grand total

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = generateInvoiceNumber();

    const user = await User.findById(req.user._id);

    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      invoiceNumber,
      items: orderItems,
      totalAmount: orderTotal,
      taxAmount,
      shippingAmount,
      discountAmount: finalDiscount,
      glowPointsUsed: glowPointsUsed,  // Store points used
      grandTotal,
      paymentMethod,
      shippingAddress,
      phone,
      couponCode: couponCode || null,
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    });

    // Mark voucher used if applicable
    if (couponCode) {
      const userDoc = await User.findById(req.user._id);
      const voucher = (userDoc.vouchers || []).find(x => x.code === couponCode && !x.isUsed);
      if (voucher) { 
        voucher.isUsed = true; 
        await userDoc.save(); 
      }
    }

    // Award glow points (10 pts per ₹100)
    const pointsEarned = Math.floor(grandTotal / 100) * 10;
    user.glowPoints = (user.glowPoints || 0) + pointsEarned;
    user.totalSpent = (user.totalSpent || 0) + grandTotal;
    user.orderCount = (user.orderCount || 0) + 1;
    
    // Deduct points that were used
    if (glowPointsUsed > 0) {
      user.glowPoints = Math.max(0, user.glowPoints - glowPointsUsed);
    }
    
    const tierChanged = await user.updateLoyaltyTier?.() || false;
    await user.save();

    console.log('Order created:', order._id);
    console.log(`Points earned: ${pointsEarned}, Points used: ${glowPointsUsed}`);

    // Send emails (non-blocking)
    sendOrderConfirmation(user.email, user.name, order).catch(console.error);
    if (tierChanged) {
      sendTierUpgrade(user.email, user.name, user.loyaltyTier, user.glowPoints).catch(console.error);
    }

    res.status(201).json({ 
      ...order.toObject(), 
      glowPointsEarned: pointsEarned 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-orderDate');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const update = { status };
    if (trackingNumber) update.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = await User.findById(order.user);

    if (status === 'shipped' && user?.preferences?.orderUpdates !== false) {
      sendOrderShipped(user.email, user.name, order, trackingNumber).catch(console.error);
    }

    if (status === 'delivered' && user?.preferences?.orderUpdates !== false) {
      sendOrderDelivered(user.email, user.name, order).catch(console.error);
      setTimeout(() => {
        const productNames = order.items.map(i => i.name);
        sendFeedbackRequest(user.email, user.name, productNames).catch(console.error);
      }, 7 * 24 * 60 * 60 * 1000);
    }

    await AuditLog.log?.({
      admin: req.user,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'Order',
      targetId: order._id,
      description: `Changed Order #${order.orderNumber} to ${status}`,
      riskLevel: 'low',
      dataCategory: 'operational',
      ipAddress: req.ip
    });

    res.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-orderDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;