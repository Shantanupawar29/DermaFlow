require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const createSeller = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const suppliers = db.collection('suppliers');
    
    // Delete existing if any
    await suppliers.deleteOne({ email: 'anushka.5aas@gmail.com' }); // Replace with your email
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Seller@123', 10);
    
    // Create seller/supplier
    const result = await suppliers.insertOne({
      name: 'Test Supplier',
      email: 'anushka.5aas@gmail.com', // REPLACE WITH YOUR EMAIL
      password: hashedPassword,
      phone: '9876543210',
      company: 'DermaFlow Supplies Pvt Ltd',
      gstNumber: '27AAACA1234E1Z5',
      address: {
        street: '123 Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      categories: ['Skincare', 'Haircare'],
      rating: 4.5,
      totalOrders: 0,
      onTimeDelivery: 95,
      leadTime: 5,
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    });
    
    console.log('✅ Seller created successfully!');
    console.log('📧 Email: your-email@gmail.com');
    console.log('🔑 Password: Seller@123');
    console.log('📝 Company:', 'DermaFlow Supplies Pvt Ltd');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
};

createSeller();