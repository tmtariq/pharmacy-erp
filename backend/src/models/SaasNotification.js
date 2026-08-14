import mongoose from 'mongoose';

const saasNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true
      // e.g. 'NEW_COMPANY_REGISTERED', 'COMPANY_APPROVAL_REQUIRED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'MANUAL_PAYMENT_UPLOADED', 'REFUND_REQUESTED', 'SUBSCRIPTION_EXPIRING', 'COMPANY_SUSPENDED', 'SUPPORT_REQUEST_ARRIVED', 'WEBHOOK_FAILED', 'INTEGRATION_FAILED'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: {
      companyId: { type: String, default: '' },
      companyName: { type: String, default: '' },
      amount: { type: Number, default: null },
      reference: { type: String, default: '' },
      errorDetail: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

saasNotificationSchema.index({ createdAt: -1 });

export default mongoose.model('SaasNotification', saasNotificationSchema);
