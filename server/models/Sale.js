// server/models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  name:        { type: String, required: true },   // "Summer Sale", "Diwali Offer"
  description: String,
  banner:      String,                              // optional banner image URL
  discountType:{ type: String, enum: ['percent','flat'], default: 'percent' },
  discountValue: { type: Number, required: true },  // 20 = 20% off or ₹20 flat
  
  // Which products are on sale
  scope: { type: String, enum: ['all','category','specific'], default: 'all' },
  categories:  [String],                           // ['skin','hair'] if scope=category
  products:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // if scope=specific

  // Who gets it
  audience:    { type: String, enum: ['all','tier','new'], default: 'all' },
  tierTarget:  String,                             // 'gold','platinum' if audience=tier

  isActive:    { type: Boolean, default: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  
  createdBy:   String,
}, { timestamps: true });

module.exports = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
