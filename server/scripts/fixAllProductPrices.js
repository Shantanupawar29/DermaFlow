require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  sku: String
});

const Product = mongoose.model('Product', productSchema);

// Correct prices in paise (rupees * 100)
const correctPrices = {
  'Retinol Renewal Serum': 250000,        // ₹2500
  'Vitamin C Brightening Drops': 350000,  // ₹3500
  'Hyaluronic Acid Moisturiser': 185000,  // ₹1850
  'Salicylic Acid BHA Cleanser': 129000,  // ₹1290
  'Niacinamide 10% Pore Serum': 179000,   // ₹1790
  'SPF 50 PA++++ Sunscreen Fluid': 159000, // ₹1590
  'AHA Glycolic Acid Exfoliator': 219000,  // ₹2190
  'Peptide Anti-Aging Eye Cream': 145000,  // ₹1450
  'Biotin Hair Growth Serum': 290000,      // ₹2900
  'Keratin Repair Hair Mask': 265000,      // ₹2650
  'Scalp Detox Exfoliating Scrub': 185000, // ₹1850
  'Argan Oil Shine & Frizz Serum': 125000, // ₹1250
};

async function fixAllPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    let updated = 0;
    
    for (const [productName, correctPrice] of Object.entries(correctPrices)) {
      const product = await Product.findOne({ name: productName });
      
      if (product) {
        const oldPrice = product.price;
        
        if (oldPrice !== correctPrice) {
          product.price = correctPrice;
          await product.save();
          console.log(`✅ ${productName}: ${oldPrice} → ${correctPrice} paise (₹${correctPrice/100})`);
          updated++;
        } else {
          console.log(`✓ ${productName}: already correct (₹${oldPrice/100})`);
        }
      } else {
        console.log(`⚠️ Product not found: ${productName}`);
      }
    }
    
    console.log(`\n📊 Summary: Updated ${updated} products`);
    console.log('All prices are now in paise!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

fixAllPrices();