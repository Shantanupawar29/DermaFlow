require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const products = require('./data/products');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Product.deleteMany();
    await Product.insertMany(products);
    
    console.log(`✅ Successfully seeded ${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();