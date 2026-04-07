const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For seller login
  phone: { type: String, required: true },
  company: { type: String, required: true },
  gstNumber: { type: String },
  panNumber: { type: String },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  
  // Business Details
  categories: [String], // Product categories they supply
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  
  // Performance Metrics
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  onTimeDelivery: { type: Number, default: 0 },
  leadTime: { type: Number, default: 7 }, // Days to deliver
  qualityRating: { type: Number, default: 5 }, // 1-5 scale
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastActive: Date
});

// Hash password before saving
supplierSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
supplierSchema.methods.comparePassword = async function(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Supplier', supplierSchema);