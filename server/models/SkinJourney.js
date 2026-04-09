// server/models/SkinJourney.js
// CRM – The "Skin Journey" Timeline
// Tracks a customer's skincare journey from Day 1.
// Automated check-in emails are triggered at Day 1, Day 7, Day 28.
// Also handles skin-type segments for targeted marketing.

const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  day:        Number,   // 1, 7, 28
  subject:    String,
  message:    String,
  sentAt:     Date,
  opened:     { type: Boolean, default: false },
  clickedCta: { type: Boolean, default: false },
}, { _id: false });

const progressPhotoSchema = new mongoose.Schema({
  uploadedAt: { type: Date, default: Date.now },
  week:       Number,
  url:        String,
  note:       String,
}, { _id: false });

const skinJourneySchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate:  { type: Date, default: Date.now },

  // Products in their routine (set from quiz results)
  products:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  skinType:   String,
  concerns:   [String],

  // Check-in schedule
  checkIns: [checkInSchema],

  // Skin progress tracking
  progressPhotos: [progressPhotoSchema],

  // Scheduled milestones
  milestones: [{
    day:     Number,
    label:   String,    // "Purging Phase", "Adaptation", "Results"
    reached: { type: Boolean, default: false },
    reachedAt: Date,
  }],

  // Journey status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  },

  // CRM Segmentation tags – used for targeted campaigns
  segments: [String],   // ['dry_skin', 'anti_aging', 'premium_customer', 'at_risk_churn']
}, { timestamps: true });

module.exports = mongoose.model('SkinJourney', skinJourneySchema);