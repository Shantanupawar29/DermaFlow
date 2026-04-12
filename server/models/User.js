const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const voucherSchema = new mongoose.Schema({
  code:      String,
  discount:  Number,
  type:      { type: String, enum: ['percent', 'flat'], default: 'percent' },
  partner:   String,   // 'Nykaa', 'Zomato' etc — null for own vouchers
  isUsed:    { type: Boolean, default: false },
  expiresAt: Date,
}, { _id: false });

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both' },
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  phone: { type: String, required: true },
  landmark: String,
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const savedCardSchema = new mongoose.Schema({
  last4: { type: String, required: true },
  cardType: { type: String, enum: ['Visa', 'Mastercard', 'RuPay', 'Amex'], required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['user', 'admin', 'customer'],
    default: 'user'
  },

  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  profilePicture: String,

  addresses: [addressSchema],
  savedCards: [savedCardSchema],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  preferences: {
    newsletter: { type: Boolean, default: false },
    smsUpdates: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
  },

  // Skin Profile

  skinConcerns: [String],
  hairConcerns: [String],
  allergies: [String],
  quizCompleted: { type: Boolean, default: false },

  skinProfile: {
    skinType: { type: String, enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], default: null },
    concerns: [String],
    routine: {
      am: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      pm: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }
  },

  // Loyalty
  glowPoints: { type: Number, default: 0 },
  recycledBottles: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  referralCode: { type: String, unique: true, sparse: true },
   referredBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   referralCount:  { type: Number, default: 0 },
  vouchers: [voucherSchema],
  lastSpinDate:    Date,
  lastScratchDate: Date,
  // Lucky draw
  luckyDrawEntered: { type: Boolean, default: false },
  luckyDrawEntries: { type: Number, default: 0 },
slotCreditsLeft: { type: Number, default: 3 },
  // Email preferences
  emailPrefs: {
    orderUpdates:    { type: Boolean, default: true },
    reviewReminders: { type: Boolean, default: true },
    loyaltyUpdates:  { type: Boolean, default: true },
    marketing:       { type: Boolean, default: true },
  },
   

  lastLogin: Date,
  isActive: { type: Boolean, default: true },

}, { timestamps: true });


// ✅ FIXED PASSWORD HASHING
// In User.js - REPLACE the existing pre-save middleware with this:
// ✅ COMPLETELY REWRITTEN pre-save middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// ✅ FIXED METHOD (MATCHES YOUR LOGIN CODE)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// OPTIONAL CLEAN VERSION (you can use this instead in future)
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };


// Loyalty logic
userSchema.methods.updateLoyaltyTier = function () {
  const spent = this.totalSpent;
  if (spent >= 50000) this.loyaltyTier = 'platinum';
  else if (spent >= 20000) this.loyaltyTier = 'gold';
  else if (spent >= 5000) this.loyaltyTier = 'silver';
  else this.loyaltyTier = 'bronze';
};


// Remove password in response
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);