require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if any
    await User.deleteOne({ email: 'admin@dermaflow.com' });
    console.log('Deleted existing admin if any');

    // Create new admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@dermaflow.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });

    // Save will trigger the pre-save hook to hash password
    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@dermaflow.com');
    console.log('🔑 Password: Admin@123');
    console.log('🆔 ID:', admin._id);
    console.log('🔒 Password is now hashed in database');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating admin:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

createAdmin();