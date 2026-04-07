const mongoose = require('mongoose');

const inventoryAlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  currentStock: { type: Number, required: true },
  criticalThreshold: { type: Number, required: true },
  reorderQuantity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'acknowledged', 'fulfilled'], 
    default: 'pending' 
  },
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryAlert', inventoryAlertSchema);