require('dotenv').config();
const mongoose = require('mongoose');

async function assignSupplierToAllProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const suppliers = db.collection('suppliers');
    const products = db.collection('products');
    
    // Find your supplier (the one with your email)
    const supplier = await suppliers.findOne({ email: 'anushka.5aas@gmail.com' });
    
    if (!supplier) {
      console.log('❌ Supplier not found! Creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Seller@123', 10);
      
      const result = await suppliers.insertOne({
        name: 'Your Seller',
        email: 'anushka.5aas@gmail.com',
        password: hashedPassword,
        phone: '9876543210',
        company: 'Your Company',
        isActive: true,
        isVerified: true,
        createdAt: new Date()
      });
      supplier = { _id: result.insertedId };
      console.log('✅ Supplier created with email: anushka.5aas@gmail.com');
    } else {
      console.log('✅ Found supplier:', supplier.name);
      console.log('   Email:', supplier.email);
    }
    
    // Update ALL products to have this supplier
    const result = await products.updateMany(
      {}, // Update all products
      { 
        $set: { 
          supplier: supplier._id,
          criticalThreshold: 10,
          reorderQuantity: 50
        } 
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} products with supplier!`);
    console.log('   Each product will now trigger email alerts when stock is low');
    
    // Verify one product
    const sampleProduct = await products.findOne({});
    console.log('\n📦 Sample product:');
    console.log(`   Name: ${sampleProduct.name}`);
    console.log(`   Stock: ${sampleProduct.stockQuantity}`);
    console.log(`   Supplier: ${sampleProduct.supplier ? 'Assigned ✓' : 'Not assigned'}`);
    console.log(`   Critical Threshold: ${sampleProduct.criticalThreshold || 10}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

assignSupplierToAllProducts();