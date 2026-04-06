const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: Number,
  newStock: Number,
  reference: {
    type: String,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Order', 'Purchase']
  },
  reason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);