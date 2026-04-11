require('dotenv').config({ path: './.env' });  // Change from '../.env' to './.env'
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected, starting migration...\n');
  
  const orders = await Order.find();
  let fixed = 0;
  let failed = 0;

  for (const order of orders) {
    let orderModified = false;

    for (const item of order.items) {
      if (!item.product) continue;

      const exists = await Product.findById(item.product);
      if (exists) continue; // already correct, skip

      // Find correct product by exact name match (no regex, avoids special char issues)
      const match = await Product.findOne({ name: item.name });
      
      if (match) {
        console.log(`✅ Fixing "${item.name}"`);
        console.log(`   Old ID: ${item.product}`);
        console.log(`   New ID: ${match._id}\n`);
        item.product = match._id;
        orderModified = true;
        fixed++;
      } else {
        console.log(`⚠️  Could not fix "${item.name}" in order ${order.orderNumber}`);
        failed++;
      }
    }

    if (orderModified) {
      await order.save();
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`✅ Fixed: ${fixed} items`);
  console.log(`❌ Failed: ${failed} items`);
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});