const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: String,
  brand: String,
  sku: {
    type: String,
    unique: true,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  features: [String],
  specifications: Map,
  isActive: {
    type: Boolean,
    default: true
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Quiz/Recommendation Fields
  skinType: { 
    type: String, 
    enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], 
    default: null 
  },
  concerns: [String],
  routineTime: { 
    type: String, 
    enum: ['AM', 'PM', 'both'], 
    default: 'both' 
  },
  ingredients: [String],
  
  // SCM Fields
  safetyThreshold: {
    type: Number,
    default: 10
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  criticalThreshold: { type: Number, default: 10 },
  reorderQuantity: { type: Number, default: 50 },
  leadTimeDays: { type: Number, default: 7 },
  autoReorder: { type: Boolean, default: false },
  lastReplenished: Date,
  salesVelocity: { type: Number, default: 0 }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);