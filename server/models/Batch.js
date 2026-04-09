// server/models/Batch.js
// ERP – Batch Integrity Tracking
// Every product belongs to a Batch. If reviews trigger "stinging" complaints,
// the ERP automatically quarantines the entire batch.

const mongoose = require('mongoose');

const bomItemSchema = new mongoose.Schema({
  ingredient:   { type: String, required: true },   // e.g. "Retinol 0.5%"
  quantity:     { type: Number, required: true },    // quantity used per unit
  unit:         { type: String, default: 'ml' },     // ml / g / pcs
  costPerUnit:  { type: Number, default: 0 },        // cost in paise per unit
  provenance:   String,                              // e.g. "Organic Aloe from Rajasthan"
  supplier:     String,
}, { _id: false });

const batchSchema = new mongoose.Schema({
  batchId:    { type: String, required: true, unique: true }, // e.g. "BATCH-RET-2026-001"
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:String,   // denormalized for fast reads

  // Manufacturing
  manufacturedDate:  { type: Date, required: true },
  expiryDate:        { type: Date, required: true },
  quantity:          { type: Number, required: true },  // units produced
  remainingQuantity: { type: Number },
  packagingType:     { type: String, default: 'Glass Bottle' },

  // BOM – Bill of Materials (ERP "Recipe")
  billOfMaterials: [bomItemSchema],

  // COGS calculation
  ingredientCost:  { type: Number, default: 0 },  // paise – sum of BOM costs
  packagingCost:   { type: Number, default: 0 },  // paise
  labourCost:      { type: Number, default: 0 },  // paise
  shippingCost:    { type: Number, default: 0 },  // paise per unit
  totalCOGS:       { type: Number, default: 0 },  // paise – auto-calculated
  sellingPrice:    { type: Number, default: 0 },  // paise – from product
  profitMargin:    { type: Number, default: 0 },  // percentage – auto-calculated

  // Quality & Quarantine (ERP Batch Integrity)
  status: {
    type: String,
    enum: ['active', 'quarantined', 'recalled', 'expired', 'depleted'],
    default: 'active',
  },
  quarantineReason:    String,
  quarantineTriggeredBy: String,  // 'manual' | 'ai_review_analysis' | 'expiry'
  quarantinedAt:       Date,
  qualityCheckPassed:  { type: Boolean, default: true },

  // Complaint tracking – auto-updated when reviews mention stinging/burning
  complaintCount:    { type: Number, default: 0 },
  negativeKeywords:  [String],  // ['stinging','burning','rash'] detected

  // Ingredient Provenance (Traceability)
  provenance: [{
    ingredient: String,
    origin:     String,   // e.g. "Rajasthan, India"
    certifications: [String], // ["ECOCERT","ISO 9001"]
    supplierName: String,
  }],

  // Audit trail
  auditLog: [{
    action:    String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now },
    notes:     String,
  }],
}, { timestamps: true });

// Auto-calculate COGS and profit margin before save
batchSchema.pre('save', function (next) {
  if (!this.remainingQuantity && this.remainingQuantity !== 0) {
    this.remainingQuantity = this.quantity;
  }

  // Recalculate COGS
  const bomCost = (this.billOfMaterials || []).reduce((sum, item) => {
    return sum + (item.costPerUnit || 0) * (item.quantity || 0);
  }, 0);

  this.ingredientCost = bomCost;
  this.totalCOGS      = bomCost + (this.packagingCost || 0) + (this.labourCost || 0) + (this.shippingCost || 0);

  if (this.sellingPrice > 0) {
    this.profitMargin = Math.round(((this.sellingPrice - this.totalCOGS) / this.sellingPrice) * 100);
  }

  next();
});

// Instance method: quarantine this batch
batchSchema.methods.quarantine = function (reason, triggeredBy = 'manual') {
  this.status               = 'quarantined';
  this.quarantineReason     = reason;
  this.quarantineTriggeredBy = triggeredBy;
  this.quarantinedAt        = new Date();
  this.auditLog.push({
    action:    `QUARANTINE`,
    performedBy: triggeredBy,
    notes:     reason,
  });
  return this.save();
};

module.exports = mongoose.model('Batch', batchSchema);