const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.get('/sales', protect, admin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    console.log('Fetching sales data for last', days, 'days');
    
    // Get orders within period
    const orders = await Order.find({
      orderDate: { $gte: startDate },
      status: { $ne: 'cancelled' }
    });
    
    console.log('Found', orders.length, 'orders');
    
    // Calculate totals (prices are in rupees, not paise)
    let totalRevenue = 0;
    orders.forEach(order => {
      totalRevenue += order.grandTotal || 0;
    });
    
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Top products - aggregate by product name
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productName = item.name || 'Unknown';
        if (!productSales[productName]) {
          productSales[productName] = { revenue: 0, unitsSold: 0 };
        }
        productSales[productName].revenue += (item.price || 0) * item.quantity;
        productSales[productName].unitsSold += item.quantity;
      });
    });
    
    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ _id: name, revenue: data.revenue, unitsSold: data.unitsSold }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Sales by category (based on product category from database)
    const categorySales = {};
    for (const order of orders) {
      for (const item of order.items) {
        // Try to find product category
        let category = 'other';
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            category = product.category || 'other';
          }
        }
        
        if (!categorySales[category]) {
          categorySales[category] = { revenue: 0 };
        }
        categorySales[category].revenue += (item.price || 0) * item.quantity;
      }
    }
    
    const salesByCategory = Object.entries(categorySales)
      .map(([cat, data]) => ({ _id: cat, revenue: data.revenue }));
    
    // Daily breakdown
    const revenueByDay = {};
    orders.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += order.grandTotal || 0;
      revenueByDay[date].orders += 1;
    });
    
    const revenueByDayArray = Object.entries(revenueByDay)
      .map(([date, data]) => ({ _id: date, revenue: data.revenue, orders: data.orders }))
      .sort((a, b) => a._id.localeCompare(b._id));
    
    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topProducts,
      salesByCategory,
      revenueByDay: revenueByDayArray
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;