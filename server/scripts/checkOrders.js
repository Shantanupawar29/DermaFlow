// Run this as a Node.js script: node checkOrders.js
require('dotenv').config({ path: '../.env' }); // if script is in scripts/
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const orders = await Order.find();
  
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.product) {
        console.log(`❌ Order ${order.orderNumber} - "${item.name}" has NO product ID`);
        continue;
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        console.log(`❌ Order ${order.orderNumber} - "${item.name}" has BROKEN ID: ${item.product}`);
        
        // Try to find the correct product by name
        const match = await Product.findOne({ 
          name: { $regex: item.name, $options: 'i' } 
        });
        if (match) {
          console.log(`   ✅ Found by name → correct ID is: ${match._id}`);
        } else {
          console.log(`   ⚠️  No product found with name "${item.name}" either`);
        }
      } else {
        console.log(`✅ Order ${order.orderNumber} - "${item.name}" OK`);
      }
    }
  }
  
  mongoose.disconnect();
});