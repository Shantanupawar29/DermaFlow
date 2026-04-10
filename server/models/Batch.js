const mongoose = require('mongoose');

const bomItemSchema = new mongoose.Schema({
  ingredient:   { type: String, required: true },
  quantity:     { type: Number, required: true },
  unit:         { type: String, default: 'ml' },
  costPerUnit:  { type: Number, default: 0 },
  provenance:   String,
  supplier:     String,
}, { _id: false });

const batchSchema = new mongoose.Schema({
  batchId:    { type: String, required: true, unique: true },
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,

  manufacturedDate:  { type: Date, required: true },
  expiryDate:        { type: Date, required: true },
  quantity:          { type: Number, required: true },
  remainingQuantity: { type: Number, default: 0 },
  packagingType:     { type: String, default: 'Glass Bottle' },

  billOfMaterials: [bomItemSchema],

  ingredientCost:  { type: Number, default: 0 },
  packagingCost:   { type: Number, default: 0 },
  labourCost:      { type: Number, default: 0 },
  shippingCost:    { type: Number, default: 0 },
  totalCOGS:       { type: Number, default: 0 },
  sellingPrice:    { type: Number, default: 0 },
  profitMargin:    { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['active', 'quarantined', 'recalled', 'expired', 'depleted'],
    default: 'active',
  },
  quarantineReason:    String,
  quarantineTriggeredBy: String,
  quarantinedAt:       Date,
  qualityCheckPassed:  { type: Boolean, default: true },

  complaintCount:    { type: Number, default: 0 },
  negativeKeywords:  [String],

  provenance: [{
    ingredient: String,
    origin: String,
    certifications: [String],
    supplierName: String,
  }],

  auditLog: [{
    action:    String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now },
    notes:     String,
  }],
}, { timestamps: true });

// REMOVED the problematic pre-save hook - we'll calculate values before creating

// Instance method: quarantine this batch
batchSchema.methods.quarantine = async function(reason, triggeredBy = 'manual') {
  this.status = 'quarantined';
  this.quarantineReason = reason;
  this.quarantineTriggeredBy = triggeredBy;
  this.quarantinedAt = new Date();
  if (!this.auditLog) this.auditLog = [];
  this.auditLog.push({
    action: 'QUARANTINE',
    performedBy: triggeredBy,
    notes: reason,
  });
  return this.save();
};

module.exports = mongoose.model('Batch', batchSchema);