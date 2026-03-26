const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product'); // make sure this file exists

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');

    await Product.deleteMany();

    await Product.insertMany([
      {
        name: "Face Wash",
        price: 199,
        description: "Gentle cleanser for daily use"
      },
      {
        name: "Moisturizer",
        price: 299,
        description: "Hydrates your skin"
      },
      {
        name: "Sunscreen",
        price: 399,
        description: "SPF 50 protection"
      }
    ]);

    console.log("✅ Products seeded!");
    process.exit();
  })
  .catch(err => console.log(err));