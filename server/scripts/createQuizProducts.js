require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  sku: String,
  stockQuantity: Number,
  skinType: String,
  concerns: [String],
  routineTime: String,
  ingredients: [String],
  isActive: Boolean
});

const Product = mongoose.model('Product', productSchema);

const quizProducts = [
  {
    name: "Hydrating Face Serum",
    description: "Deep hydration for dry and sensitive skin",
    price: 1299,
    category: "skin",
    sku: "SER-001",
    stockQuantity: 50,
    skinType: "dry",
    concerns: ["dryness", "dehydration"],
    routineTime: "both",
    ingredients: ["Hyaluronic Acid", "Vitamin E", "Aloe Vera"],
    isActive: true
  },
  {
    name: "Retinol Renewal Serum",
    description: "Anti-aging serum for fine lines and wrinkles",
    price: 3486,
    category: "skin",
    sku: "SER-002",
    stockQuantity: 15,
    skinType: "combination",
    concerns: ["aging", "wrinkles"],
    routineTime: "PM",
    ingredients: ["Retinol", "Hyaluronic Acid", "Vitamin E"],
    isActive: true
  },
  {
    name: "Vitamin C Brightening Drops",
    description: "Brightening formula for dark spots",
    price: 3150,
    category: "skin",
    sku: "SER-003",
    stockQuantity: 25,
    skinType: "oily",
    concerns: ["darkSpots", "dullness"],
    routineTime: "AM",
    ingredients: ["Vitamin C", "Ferulic Acid", "Vitamin E"],
    isActive: true
  },
  {
    name: "Niacinamide 10% Pore Serum",
    description: "Minimizes pores and controls oil",
    price: 1790,
    category: "skin",
    sku: "SER-004",
    stockQuantity: 38,
    skinType: "oily",
    concerns: ["enlarged pores", "oily skin"],
    routineTime: "both",
    ingredients: ["Niacinamide", "Zinc PCA"],
    isActive: true
  },
  {
    name: "Hyaluronic Acid Moisturiser",
    description: "72-hour hydration gel-cream",
    price: 2400,
    category: "skin",
    sku: "SKIN-005",
    stockQuantity: 45,
    skinType: "dry",
    concerns: ["dryness", "dehydration"],
    routineTime: "both",
    ingredients: ["Hyaluronic Acid", "Ceramides", "Squalane"],
    isActive: true
  },
  {
    name: "Biotin Hair Growth Serum",
    description: "Stimulates follicles and reduces hair fall",
    price: 2900,
    category: "hair",
    sku: "HAIR-001",
    stockQuantity: 30,
    skinType: "normal",
    concerns: ["hairFall", "slow growth"],
    routineTime: "both",
    ingredients: ["Biotin", "Caffeine", "Copper Peptides"],
    isActive: true
  }
];

async function createQuizProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing test products
    await Product.deleteMany({ sku: { $in: quizProducts.map(p => p.sku) } });
    console.log('Deleted existing test products');
    
    // Insert new products
    const result = await Product.insertMany(quizProducts);
    console.log(`✅ Created ${result.length} quiz-ready products`);
    
    console.log('\n📦 Products created:');
    result.forEach(p => {
      console.log(`- ${p.name}: ${p.skinType} | ${p.routineTime} | concerns: ${p.concerns.join(',')}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

createQuizProducts();