// server/models/AuditLog.js
// Security – Audit Trail for Medical Data & Admin Actions
// Every time an admin views a skin profile, updates inventory, or changes financial data,
// it's logged here with timestamp, admin ID, and action type.

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Who did it
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminName:  String,
  adminEmail: String,
  adminRole:  String,
  ipAddress:  String,
  userAgent:  String,

  // What they did
  action: {
    type: String,
    enum: [
      // Medical/skin data access
      'VIEW_SKIN_PROFILE',
      'EDIT_SKIN_PROFILE',
      'VIEW_USER_DATA',

      // Financial
      'VIEW_REVENUE_DATA',
      'EXPORT_FINANCIAL_REPORT',

      // Inventory
      'UPDATE_STOCK',
      'QUARANTINE_BATCH',
      'RECALL_BATCH',
      'DELETE_PRODUCT',

      // Orders
      'UPDATE_ORDER_STATUS',
      'ISSUE_REFUND',
      'CANCEL_ORDER',

      // User management
      'DEACTIVATE_USER',
      'CHANGE_USER_ROLE',
      'VIEW_USER_ADDRESS',

      // Security
      'FAILED_LOGIN_ATTEMPT',
      'PASSWORD_RESET',
      'ROLE_CHANGE',

      // General
      'EXPORT_DATA',
      'BULK_ACTION',
      'CONFIG_CHANGE',
    ],
    required: true,
  },

  // Who/what was affected
  targetType:  String,   // 'User', 'Product', 'Order', 'Batch'
  targetId:    String,
  targetName:  String,   // denormalized human-readable (e.g. "User Anushka")

  // Details
  description: String,   // Human-readable: "Admin Shantanu viewed User Anushka's skin profile"
  oldValue:    mongoose.Schema.Types.Mixed,
  newValue:    mongoose.Schema.Types.Mixed,

  // Risk classification
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },

  // GDPR / DPDP compliance
  dataCategory: {
    type: String,
    enum: ['health_data', 'financial_data', 'personal_data', 'operational', 'security'],
    default: 'operational',
  },
}, { timestamps: true });

// Static method to create a log entry quickly
auditLogSchema.statics.log = function ({
  admin, action, targetType, targetId, targetName, description,
  oldValue, newValue, riskLevel = 'low', dataCategory = 'operational',
  ipAddress, userAgent
}) {
  return this.create({
    adminId:     admin?._id,
    adminName:   admin?.name,
    adminEmail:  admin?.email,
    adminRole:   admin?.role,
    ipAddress,
    userAgent,
    action,
    targetType,
    targetId:    targetId?.toString(),
    targetName,
    description: description || `${admin?.name} performed ${action}`,
    oldValue,
    newValue,
    riskLevel,
    dataCategory,
  });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);