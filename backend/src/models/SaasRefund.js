import mongoose from 'mongoose';

const saasRefundSchema = new mongoose.Schema(
  {
    refundId: { type: String, required: true, unique: true, index: true },
    transactionId: { type: String, required: true, index: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'SaasTransaction' },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    companyName: { type: String, required: true },
    companyCode: { type: String, default: '' },
    invoiceNumber: { type: String, required: true, default: '' },
    originalAmount: { type: Number, required: true, default: 0 },
    refundAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, uppercase: true, default: 'USD' },
    reason: { type: String, required: true, default: 'Customer requested plan cancellation / refund' },
    requestedBy: { type: String, default: 'Company Owner' },
    requestedDate: { type: Date, default: Date.now },
    paymentProvider: {
      type: String,
      enum: ['Stripe', 'PayPal', 'Authorize.Net', 'Manual Wire', 'Mock Gateway'],
      default: 'Stripe'
    },
    providerRefundId: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'Requested', 'Approved', 'Rejected', 'Processing', 'Completed', 'Failed',
        'requested', 'approved', 'rejected', 'processing', 'completed', 'failed'
      ],
      default: 'Requested',
      index: true
    },
    approvedBy: { type: String, default: '' },
    processedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    internalAdminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('SaasRefund', saasRefundSchema);
