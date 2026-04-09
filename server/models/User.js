const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const voucherSchema = new mongoose.Schema({
  code: String,
  discount: Number,
  isUsed: { type: Boolean, default: false },
  expiresAt: Date,
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'customer'],
    default: 'user'
  },
  address: {
    street: String, city: String, state: String,
    zipCode: String, country: String
  },
  addresses: [{ type: Object, default: [] }],
  phone: String,
  
  skinType: { 
    type: String, 
    enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], 
    default: null 
  },
  skinConcerns: [String],
  hairConcerns: [String],
  allergies: [String],
  quizCompleted: { type: Boolean, default: false },
  amRoutine: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  pmRoutine: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  skinProfile: {
    skinType: { type: String, enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], default: null },
    concerns: [String],
    routine: {
      am: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      pm: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
    }
  },

  glowPoints: { type: Number, default: 0 },
  recycledBottles: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  loyaltyTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },

  vouchers: [voucherSchema],

  lastLogin: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// SIMPLE PRE-SAVE HOOK - No async/await, just callbacks
// userSchema.pre('save', function(next) {
//   const user = this;
  
//   if (!user.isModified('password')) {
//     return next();
//   }
  
//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) return next(err);
    
//     bcrypt.hash(user.password, salt, (err, hash) => {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// SIMPLE COMPARE METHOD - Using callback
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// Add promise wrapper for async/await support
userSchema.methods.comparePasswordAsync = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
};

userSchema.methods.updateLoyaltyTier = function() {
  const spent = this.totalSpent / 100;
  if (spent >= 50000) this.loyaltyTier = 'platinum';
  else if (spent >= 20000) this.loyaltyTier = 'gold';
  else if (spent >= 5000) this.loyaltyTier = 'silver';
  else this.loyaltyTier = 'bronze';
};

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);