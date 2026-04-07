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
  
  safetyThreshold: {
  type: Number,
  default: 10
},
// Add these fields to existing product schema:
supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
criticalThreshold: { type: Number, default: 10 }, // Alert when stock reaches this
reorderQuantity: { type: Number, default: 50 }, // Quantity to reorder
leadTimeDays: { type: Number, default: 7 }, // Days from order to delivery
autoReorder: { type: Boolean, default: false },
lastReplenished: Date,
salesVelocity: { type: Number, default: 0 } // Units sold per day
});

module.exports = mongoose.model('Product', productSchema);