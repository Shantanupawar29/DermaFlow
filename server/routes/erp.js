// server/routes/erp.js
// ERP – Batch Integrity, BOM, COGS, Provenance, Lead-Time Forecasting

const express  = require('express');
const router   = express.Router();
const Batch    = require('../models/Batch');
const AuditLog = require('../models/AuditLog');
const Product  = require('../models/Product');
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/auth');

// ── helper: auto-quarantine check ────────────────────────────────────────────
// Scans recent reviews for a product/batch for "stinging", "burning", "rash" etc.
// If ≥3 complaints in 7 days → auto-quarantine that batch.
const QUALITY_KEYWORDS = ['stinging','burning','rash','allergic','reaction','irritation','breakout','redness','hives','swelling','blister','pain'];

async function checkAndQuarantineBatch(batchId) {
  const batch = await Batch.findById(batchId);
  if (!batch || batch.status !== 'active') return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentFeedback = await Feedback.find({
    product:   batch.product,
    createdAt: { $gte: sevenDaysAgo },
    type:      'review',
  });

  const complaints = recentFeedback.filter(f => {
    const text = f.message.toLowerCase();
    return QUALITY_KEYWORDS.some(k => text.includes(k));
  });

  const foundKeywords = [...new Set(
    complaints.flatMap(c => QUALITY_KEYWORDS.filter(k => c.message.toLowerCase().includes(k)))
  )];

  if (complaints.length >= 3) {
    batch.complaintCount  = complaints.length;
    batch.negativeKeywords = foundKeywords;
    await batch.quarantine(
      `AI Review Analysis: ${complaints.length} complaints mentioning [${foundKeywords.join(', ')}] in the last 7 days`,
      'ai_review_analysis'
    );
    return { quarantined: true, batch, complaints: complaints.length, keywords: foundKeywords };
  }

  batch.complaintCount   = complaints.length;
  batch.negativeKeywords = foundKeywords;
  await batch.save();
  return { quarantined: false };
}

// ── GET /api/erp/dashboard ────────────────────────────────────────────────────
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const [batches, products] = await Promise.all([
      Batch.find({}).populate('product', 'name sku price'),
      Product.find({ isActive: true }).select('name sku price stockQuantity leadTimeDays safetyThreshold'),
    ]);

    const active      = batches.filter(b => b.status === 'active').length;
    const quarantined = batches.filter(b => b.status === 'quarantined').length;
    const recalled    = batches.filter(b => b.status === 'recalled').length;

    // Near expiry (within 90 days)
    const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const nearExpiry  = batches.filter(b => b.status === 'active' && new Date(b.expiryDate) <= ninetyDays);

    // Average profit margin across active batches
    const activeBatches = batches.filter(b => b.status === 'active' && b.profitMargin);
    const avgMargin = activeBatches.length
      ? Math.round(activeBatches.reduce((s, b) => s + b.profitMargin, 0) / activeBatches.length)
      : 0;

    // Lead-time forecast — products that need reorder NOW (stock < leadTime * dailySales)
    const reorderAlerts = products.filter(p => {
      const leadDays  = p.leadTimeDays || 7;
      const safeBuffer = leadDays + 5;   // 5-day safety buffer
      const dailySales = 2;              // avg per day (use real salesVelocity in prod)
      return p.stockQuantity < (safeBuffer * dailySales);
    });

    // COGS summary
    const totalCOGS  = batches.reduce((s, b) => s + (b.totalCOGS || 0), 0);
    const totalRevPot = batches.reduce((s, b) => s + (b.sellingPrice || 0) * (b.quantity || 0), 0);

    res.json({
      batchStats: { total: batches.length, active, quarantined, recalled, nearExpiry: nearExpiry.length },
      avgMargin, totalCOGS, totalRevPot,
      reorderAlerts: reorderAlerts.map(p => ({
        _id: p._id, name: p.name, sku: p.sku,
        stockQuantity: p.stockQuantity,
        leadTimeDays:  p.leadTimeDays || 7,
        daysOfStock:   Math.floor(p.stockQuantity / 2),
      })),
      nearExpiryBatches: nearExpiry.map(b => ({
        _id: b._id, batchId: b.batchId, productName: b.productName,
        expiryDate: b.expiryDate, remainingQuantity: b.remainingQuantity,
        daysLeft: Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
      })),
      recentBatches: batches.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/erp/batches ──────────────────────────────────────────────────────
router.get('/batches', protect, admin, async (req, res) => {
  try {
    const { status, product } = req.query;
    const filter = {};
    if (status)  filter.status  = status;
    if (product) filter.product = product;
    const batches = await Batch.find(filter).populate('product', 'name sku').sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/erp/batches/:id ──────────────────────────────────────────────────
router.get('/batches/:id', protect, admin, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('product');

    // AUDIT LOG – viewing batch details
    await AuditLog.log({
      admin:      req.user,
      action:     'VIEW_USER_DATA',
      targetType: 'Batch',
      targetId:   batch._id,
      targetName: `Batch ${batch.batchId}`,
      riskLevel:  'low',
      dataCategory: 'operational',
      ipAddress:  req.ip,
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/erp/batches ─────────────────────────────────────────────────────
router.post('/batches', protect, admin, async (req, res) => {
  try {
    const { productId, manufacturedDate, expiryDate, quantity, billOfMaterials,
            packagingCost, labourCost, shippingCost, packagingType, provenance } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const batchSeq = (await Batch.countDocuments({ product: productId })) + 1;
    const batchId  = `BATCH-${product.sku}-${new Date().getFullYear()}-${String(batchSeq).padStart(3, '0')}`;

    const batch = await Batch.create({
      batchId, product: productId, productName: product.name,
      manufacturedDate, expiryDate, quantity,
      billOfMaterials: billOfMaterials || [],
      packagingCost: packagingCost || 0,
      labourCost:    labourCost    || 0,
      shippingCost:  shippingCost  || 0,
      sellingPrice:  product.price,
      packagingType: packagingType || 'Glass Bottle',
      provenance:    provenance    || [],
    });

    await AuditLog.log({
      admin: req.user, action: 'UPDATE_STOCK',
      targetType: 'Batch', targetId: batch._id, targetName: batchId,
      description: `Created batch ${batchId} for ${product.name}`,
      dataCategory: 'operational', ipAddress: req.ip,
    });

    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/erp/batches/:id/quarantine ─────────────────────────────────────
router.post('/batches/:id/quarantine', protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await batch.quarantine(reason || 'Manual admin quarantine', `admin:${req.user.name}`);

    await AuditLog.log({
      admin: req.user, action: 'QUARANTINE_BATCH',
      targetType: 'Batch', targetId: batch._id, targetName: batch.batchId,
      description: `Admin ${req.user.name} quarantined batch ${batch.batchId}: ${reason}`,
      riskLevel: 'high', dataCategory: 'operational', ipAddress: req.ip,
    });

    res.json({ message: `Batch ${batch.batchId} quarantined`, batch });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/erp/batches/check-quality ──────────────────────────────────────
// Run AI review analysis on all active batches — auto-quarantines if needed
router.post('/batches/check-quality', protect, admin, async (req, res) => {
  try {
    const activeBatches = await Batch.find({ status: 'active' });
    const results = [];

    for (const batch of activeBatches) {
      const result = await checkAndQuarantineBatch(batch._id);
      results.push({ batchId: batch.batchId, ...result });
    }

    const quarantined = results.filter(r => r.quarantined);
    res.json({
      checked:     results.length,
      quarantined: quarantined.length,
      results,
      message: `Quality check complete. ${quarantined.length} batch(es) quarantined.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/erp/cogs-report ──────────────────────────────────────────────────
// Dynamic COGS Dashboard — real-time profit margin per product/batch
router.get('/cogs-report', protect, admin, async (req, res) => {
  try {
    await AuditLog.log({
      admin: req.user, action: 'VIEW_REVENUE_DATA',
      description: 'Viewed COGS / profit margin report',
      riskLevel: 'medium', dataCategory: 'financial_data', ipAddress: req.ip,
    });

    const batches = await Batch.find({}).populate('product', 'name sku price category');

    const report = batches.map(b => ({
      batchId:       b.batchId,
      productName:   b.productName,
      category:      b.product?.category,
      sellingPrice:  b.sellingPrice,
      ingredientCost:b.ingredientCost,
      packagingCost: b.packagingCost,
      labourCost:    b.labourCost,
      shippingCost:  b.shippingCost,
      totalCOGS:     b.totalCOGS,
      grossProfit:   b.sellingPrice - b.totalCOGS,
      profitMargin:  b.profitMargin,
      quantity:      b.quantity,
      status:        b.status,
    }));

    const totalRevenue = report.reduce((s, r) => s + r.sellingPrice * r.quantity, 0);
    const totalCOGS    = report.reduce((s, r) => s + r.totalCOGS * r.quantity, 0);
    const totalProfit  = totalRevenue - totalCOGS;
    const overallMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    res.json({ report, summary: { totalRevenue, totalCOGS, totalProfit, overallMargin } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/erp/audit-log ───────────────────────────────────────────────────
router.get('/audit-log', protect, admin, async (req, res) => {
  try {
    const { action, dataCategory, riskLevel, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action)       filter.action       = action;
    if (dataCategory) filter.dataCategory = dataCategory;
    if (riskLevel)    filter.riskLevel    = riskLevel;

    const logs  = await AuditLog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await AuditLog.countDocuments(filter);
    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;