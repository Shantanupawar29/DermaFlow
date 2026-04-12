const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Who
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    { type: String, required: true },
  email:   { type: String, required: true },

  // What product
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  // Content
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    String,
  comment:  { type: String, required: true },

  // Media
  images:   [String],

  // Sentiment analysis (filled by backend)
  sentimentScore:  { type: Number, default: 0 },   // -1 to 1
  sentimentLabel:  { type: String, enum: ['positive','neutral','negative'], default: 'neutral' },
  qualityFlags:    [String],   // ['burning','rash'] etc — quality concern keywords
  hasQualityAlert: { type: Boolean, default: false },
  isAuthentic:     { type: Boolean, default: true },   // "this product looks fake" flag
  batchConcern:    { type: Boolean, default: false },   // "different from before" flag

  // Admin
  isApproved:      { type: Boolean, default: true },
  adminReply:      String,
  flaggedForReview: { type: Boolean, default: false },
  flagReason:      String,

  // Verification
  verifiedPurchase: { type: Boolean, default: false },
  helpful:          { type: Number, default: 0 },
}, { timestamps: true });

// Auto-detect quality/authenticity keywords on save
const QUALITY_KEYWORDS = ['stinging','burning','rash','hives','allergic','reaction','irritation','swelling','blister','pain','peeling','redness','itching','breakout'];
const FAKE_KEYWORDS    = ['fake','counterfeit','duplicate','original','seal broken','tampered','different smell','color changed','texture changed'];
const BATCH_KEYWORDS   = ['different from before','not same','earlier batch','previously bought','last time','last order','used before','changed formula','new batch different'];

reviewSchema.pre('save', function() {
  if (!this.isModified('comment')) return;
  const text = this.comment.toLowerCase();

  this.qualityFlags = QUALITY_KEYWORDS.filter(k => text.includes(k));
  this.hasQualityAlert = this.qualityFlags.length > 0;
  this.isAuthentic  = !FAKE_KEYWORDS.some(k => text.includes(k));
  this.batchConcern = BATCH_KEYWORDS.some(k => text.includes(k));

  // Flag for admin review if any concern detected
  if (this.hasQualityAlert || !this.isAuthentic || this.batchConcern || this.rating <= 2) {
    this.flaggedForReview = true;
    const reasons = [];
    if (this.hasQualityAlert) reasons.push('quality keywords: ' + this.qualityFlags.join(', '));
    if (!this.isAuthentic)    reasons.push('authenticity concern');
    if (this.batchConcern)    reasons.push('batch consistency concern');
    if (this.rating <= 2)     reasons.push('low rating');
    this.flagReason = reasons.join(' | ');
  }
});

module.exports = mongoose.model('Review', reviewSchema);
