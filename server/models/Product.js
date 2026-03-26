const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['skin', 'hair'], required: true },
  concerns: [String],
  ingredients: [String],
  stockQuantity: { type: Number, default: 0 },
  safetyThreshold: { type: Number, default: 5 },
  routineTime: { type: String, enum: ['AM', 'PM', 'both'] },
  subscriptionAvailable: { type: Boolean, default: false },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);