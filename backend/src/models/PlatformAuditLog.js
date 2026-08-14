import mongoose from 'mongoose';

const platformAuditLogSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin', default: null },
      name: { type: String, required: true, default: 'System / Automated' },
      role: { type: String, default: 'System' }
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    target: {
      type: String, // e.g. 'Company', 'Subscription', 'Invoice', 'User', 'Settings', 'Platform'
      required: true,
      index: true
    },
    targetId: {
      type: String, // ID of the target resource
      default: ''
    },
    oldValue: {
      type: String,
      default: ''
    },
    newValue: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    module: {
      type: String, // e.g., 'Authentication', 'Company Management', 'Billing', 'Refunds', 'Security'
      required: true,
      index: true
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

platformAuditLogSchema.index({ createdAt: -1 });
platformAuditLogSchema.index({ 'actor.name': 1 });

export default mongoose.model('PlatformAuditLog', platformAuditLogSchema);
