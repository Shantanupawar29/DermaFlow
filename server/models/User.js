const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const voucherSchema = new mongoose.Schema({
  code:      String,
  discount:  Number,
  isUsed:    { type: Boolean, default: false },
  expiresAt: Date,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'customer'],  // ✅ supports all three — 'user' is default
    default: 'user'
  },
  address: {
    street: String, city: String, state: String,
    zipCode: String, country: String
  },
  phone:      String,
  // Add to your User.js schema
  skinProfile: {
    skinType: { type: String, enum: ['Oily','Dry','Combination','Normal','Sensitive', null], default: null },
    concerns: [String],
    routine: {
      am: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      pm: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }
  },

  // Glow Points & Loyalty
  glowPoints:  { type: Number, default: 0 },
  totalSpent:  { type: Number, default: 0 },
  orderCount:  { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['bronze','silver','gold','platinum'], default: 'bronze' },

  // Vouchers
  vouchers: [voucherSchema],

  lastLogin: Date,
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password (async)
userSchema.methods.comparePasswordAsync = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Legacy callback version for compatibility
userSchema.methods.comparePassword = function (candidate, callback) {
  if (callback) {
    bcrypt.compare(candidate, this.password, callback);
  } else {
    return bcrypt.compare(candidate, this.password);
  }
};

// Update loyalty tier based on total spent (paise)
userSchema.methods.updateLoyaltyTier = function () {
  const spent = this.totalSpent / 100; // convert paise to rupees
  if (spent >= 50000)      this.loyaltyTier = 'platinum';
  else if (spent >= 20000) this.loyaltyTier = 'gold';
  else if (spent >= 5000)  this.loyaltyTier = 'silver';
  else                     this.loyaltyTier = 'bronze';
};

// Strip password from JSON responses
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);