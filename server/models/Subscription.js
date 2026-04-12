const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  productPrice: Number,
  plan:    { type: String, enum: ['monthly','quarterly','biannual'], required: true },
  discountPct: { type: Number, default: 10 },
  status:  { type: String, enum: ['active','paused','cancelled'], default: 'active' },
  nextDelivery: Date,
  lastDelivery: Date,
  deliveryCount: { type: Number, default: 0 },
  shippingAddress: Object,
  paymentMethod: String,
  freebieLevel: { type: String, enum: ['none','mini','standard','premium'], default: 'none' },
}, { timestamps: true });

subscriptionSchema.pre('save', function() {
  const p = this.productPrice || 0;
  if      (p >= 10000) this.freebieLevel = 'premium';
  else if (p >= 7500)  this.freebieLevel = 'standard';
  else if (p >= 5000)  this.freebieLevel = 'mini';
  else                  this.freebieLevel = 'none';
});

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
