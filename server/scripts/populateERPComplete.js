require('dotenv').config();
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// ALL PRICES IN RUPEES (not paise)
const productsData = [
  { name: "Retinol Renewal Serum", sku: "SKIN-RET-001", price: 2500, category: "skin", stockQuantity: 15 },
  { name: "Vitamin C Brightening Drops", sku: "SKIN-VITC-002", price: 3500, category: "skin", stockQuantity: 25 },
  { name: "Hyaluronic Acid Moisturiser", sku: "SKIN-HYA-003", price: 1850, category: "skin", stockQuantity: 45 },
  { name: "Salicylic Acid BHA Cleanser", sku: "SKIN-SAL-004", price: 1290, category: "skin", stockQuantity: 12 },
  { name: "Niacinamide 10% Pore Serum", sku: "SKIN-NIA-005", price: 1790, category: "skin", stockQuantity: 38 },
  { name: "Biotin Hair Growth Serum", sku: "HAIR-BIO-009", price: 2900, category: "hair", stockQuantity: 30 },
  { name: "Keratin Repair Hair Mask", sku: "HAIR-KER-010", price: 2650, category: "hair", stockQuantity: 20 },
  { name: "Argan Oil Shine & Frizz Serum", sku: "HAIR-ARG-012", price: 1250, category: "hair", stockQuantity: 28 }
];

// Batches - costs in rupees
const batchesData = [
  {
    batchId: "BATCH-RET-2025-001",
    manufacturedDate: new Date('2025-01-15'),
    expiryDate: new Date('2026-01-15'),
    quantity: 1000,
    packagingType: "Glass Bottle",
    ingredientCost: 1200,
    packagingCost: 250,
    labourCost: 150,
    shippingCost: 50,
    status: "active",
    sellingPrice: 2500,
    totalCOGS: 1650,
    profitMargin: 34,
    remainingQuantity: 1000,
    productName: "Retinol Renewal Serum"
  },
  {
    batchId: "BATCH-VITC-2025-001",
    manufacturedDate: new Date('2025-02-01'),
    expiryDate: new Date('2026-02-01'),
    quantity: 800,
    packagingType: "Glass Bottle",
    ingredientCost: 1800,
    packagingCost: 200,
    labourCost: 120,
    shippingCost: 40,
    status: "active",
    sellingPrice: 3500,
    totalCOGS: 2160,
    profitMargin: 38,
    remainingQuantity: 800,
    productName: "Vitamin C Brightening Drops"
  },
  {
    batchId: "BATCH-HYA-2025-001",
    manufacturedDate: new Date('2025-01-20'),
    expiryDate: new Date('2026-01-20'),
    quantity: 2000,
    packagingType: "Plastic Tube",
    ingredientCost: 900,
    packagingCost: 300,
    labourCost: 200,
    shippingCost: 80,
    status: "active",
    sellingPrice: 1850,
    totalCOGS: 1480,
    profitMargin: 20,
    remainingQuantity: 2000,
    productName: "Hyaluronic Acid Moisturiser"
  },
  {
    batchId: "BATCH-SAL-2025-001",
    manufacturedDate: new Date('2025-02-10'),
    expiryDate: new Date('2026-02-10'),
    quantity: 1500,
    packagingType: "Plastic Bottle",
    ingredientCost: 800,
    packagingCost: 220,
    labourCost: 180,
    shippingCost: 60,
    status: "quarantined",
    sellingPrice: 1290,
    totalCOGS: 1260,
    profitMargin: 2,
    remainingQuantity: 1500,
    quarantineReason: "Quality deviation detected - customer complaints about skin irritation",
    quarantineTriggeredBy: "ai_review_analysis",
    quarantinedAt: new Date('2025-03-01'),
    productName: "Salicylic Acid BHA Cleanser"
  }
];

// Sample feedback
const feedbackData = [
  {
    type: "review",
    name: "Priya Sharma",
    email: "priya@example.com",
    message: "This serum caused severe stinging and burning sensation on my face. Had to wash it off immediately!",
    rating: 1,
    category: "product_quality",
    status: "open"
  },
  {
    type: "complaint",
    name: "Rahul Verma",
    email: "rahul@example.com",
    message: "Product gave me allergic reaction. Redness and itching all over. Need refund.",
    category: "product_quality",
    status: "open"
  },
  {
    type: "review",
    name: "Neha Gupta",
    email: "neha@example.com",
    message: "Love this product! My skin feels amazing after using it for 2 weeks.",
    rating: 5,
    category: "product_quality",
    status: "open"
  },
  {
    type: "complaint",
    name: "Anjali Mehta",
    email: "anjali@example.com",
    message: "Burning sensation and rash on cheeks. Very disappointed.",
    category: "product_quality",
    status: "open"
  },
  {
    type: "review",
    name: "Kavita Singh",
    email: "kavita@example.com",
    message: "Good product but shipping was delayed by 5 days.",
    rating: 3,
    category: "delivery",
    status: "open"
  }
];

async function populateERPComplete() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // 1. Ensure products exist (prices in paise for backend)
    console.log('📦 Ensuring products...');
    for (const prod of productsData) {
      const priceInPaise = prod.price ;
      await Product.findOneAndUpdate(
        { sku: prod.sku },
        { 
          name: prod.name,
          sku: prod.sku,
          price: priceInPaise,
          category: prod.category,
          stockQuantity: prod.stockQuantity,
          isActive: true 
        },
        { upsert: true }
      );
      console.log(`  ✅ ${prod.name}: ₹${prod.price}`);
    }
    console.log(`✅ ${productsData.length} products ready\n`);
    
    // 2. Get product IDs
    const products = await Product.find({});
    const productMap = {};
    products.forEach(p => {
      productMap[p.sku] = p;
    });
    
    // 3. Delete existing batches and feedback
    await Batch.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✅ Cleared existing batches and feedback\n');
    
    // 4. Create batches
    console.log('🏭 Creating batches...');
    for (const batch of batchesData) {
      // Find matching product
      let productSku = null;
      if (batch.batchId.includes('RET')) productSku = 'SKIN-RET-001';
      else if (batch.batchId.includes('VITC')) productSku = 'SKIN-VITC-002';
      else if (batch.batchId.includes('HYA')) productSku = 'SKIN-HYA-003';
      else if (batch.batchId.includes('SAL')) productSku = 'SKIN-SAL-004';
      
      const product = productMap[productSku];
      if (product) {
        batch.product = product._id;
        batch.productName = product.name;
        // Convert costs to paise for storage
        batch.ingredientCost = (batch.ingredientCost || 0) ;
        batch.packagingCost = (batch.packagingCost || 0) ;
        batch.labourCost = (batch.labourCost || 0) ;
        batch.shippingCost = (batch.shippingCost || 0) ;
        batch.totalCOGS = (batch.totalCOGS || 0) ;
        batch.sellingPrice = product.price;
        
        await Batch.create(batch);
        console.log(`  ✅ Created: ${batch.batchId} for ${product.name}`);
      }
    }
    console.log(`✅ ${batchesData.length} batches created\n`);
    
    // 5. Create feedback
    console.log('📝 Creating feedback...');
    for (const feedback of feedbackData) {
      const salProduct = productMap['SKIN-SAL-004'];
      feedback.product = salProduct?._id;
      await Feedback.create(feedback);
    }
    console.log(`✅ Created ${feedbackData.length} feedback entries\n`);
    
    // 6. Create audit logs
    console.log('📋 Creating audit logs...');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await AuditLog.create({
        adminId: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'QUALITY_CHECK',
        description: 'AI Quality Check - Auto-quarantined batch BATCH-SAL-2025-001 due to customer complaints',
        riskLevel: 'high',
        dataCategory: 'health_data'
      });
      
      await AuditLog.create({
        adminId: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'QUARANTINE_BATCH',
        targetType: 'Batch',
        targetName: 'BATCH-SAL-2025-001',
        description: 'Batch quarantined due to quality issues detected in customer feedback',
        riskLevel: 'high',
        dataCategory: 'operational'
      });
      
      console.log('✅ Audit logs created\n');
    }
    
    console.log('🎉 ERP DATA POPULATION COMPLETE!');
    console.log('================================');
    console.log(`📦 Products: ${productsData.length}`);
    console.log(`🏭 Batches: ${batchesData.length}`);
    console.log(`📝 Feedback: ${feedbackData.length}`);
    console.log('\n⚠️ Note: Batch BATCH-SAL-2025-001 is QUARANTINED');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

populateERPComplete();