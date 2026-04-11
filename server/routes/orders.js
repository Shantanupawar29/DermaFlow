const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, admin } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../services/emailService');

// Generate invoice number
function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Create order - WITH INVENTORY UPDATE
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, phone, totalAmount, discountAmount, couponCode } = req.body;

    console.log('Creating order for user:', req.user._id);
    console.log('Items:', items);

    let orderTotal = 0;
    const orderItems = [];

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
      console.log(`Updated stock for ${product.name}: ${product.stockQuantity} remaining`);
    }

    const taxAmount = orderTotal * 0.18;
    const shippingAmount = orderTotal > 1000 ? 0 : 50;
    const finalDiscount = discountAmount || 0;
    const grandTotal = orderTotal + taxAmount + shippingAmount - finalDiscount;

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
      grandTotal,
      paymentMethod,
      shippingAddress,
      phone,
      couponCode: couponCode || null,
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    });

    console.log('Order created:', order._id);
    console.log('Inventory updated successfully');

    sendOrderConfirmation(user.email, user.name, order).catch(console.error);

    res.status(201).json(order);
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
    const order = await Order.findById(req.params.id)
  .populate('items.product');
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
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
  
      req.params.id,
      { status },
      { new: true }
    );
        if (!order) {
  return res.status(404).json({ message: 'Order not found' });
}

    // Audit log inside the route handler (correct placement)
    await AuditLog.log({
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
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-orderDate');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;