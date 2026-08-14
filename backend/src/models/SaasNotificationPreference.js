import mongoose from 'mongoose';

const saasNotificationPreferenceSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin', required: true, unique: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    browserNotifications: { type: Boolean, default: true },
    enabledAlertTypes: {
      newCompanyRegistered: { type: Boolean, default: true },
      companyApprovalRequired: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      paymentFailed: { type: Boolean, default: true },
      manualPaymentUploaded: { type: Boolean, default: true },
      refundRequested: { type: Boolean, default: true },
      subscriptionExpiring: { type: Boolean, default: true },
      companySuspended: { type: Boolean, default: true },
      supportRequestArrived: { type: Boolean, default: true },
      webhookFailed: { type: Boolean, default: true },
      integrationFailed: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model('SaasNotificationPreference', saasNotificationPreferenceSchema);
