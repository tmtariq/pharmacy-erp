import mongoose from 'mongoose';

const saasTransactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    companyName: { type: String, required: true },
    companyCode: { type: String, default: '' },
    invoiceNumber: { type: String, required: true, default: '' },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    planName: { type: String, default: 'Professional' },
    amount: { type: Number, required: true, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    currency: { type: String, uppercase: true, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Bank Wire', 'Direct Debit', 'ACH Transfer', 'PayPal', 'Corporate Account'],
      default: 'Credit Card'
    },
    paymentProvider: {
      type: String,
      enum: ['Stripe', 'PayPal', 'Authorize.Net', 'Manual Wire', 'Mock Gateway'],
      default: 'Stripe'
    },
    providerReferenceId: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'Pending', 'Processing', 'Successful', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded', 'Disputed',
        'pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded', 'partially_refunded', 'disputed'
      ],
      default: 'Successful',
      index: true
    },
    customerEmail: { type: String, default: '' },
    disputeReason: { type: String, default: '' },
    refundReason: { type: String, default: '' },
    proofUrl: { type: String, default: '' },
    bankReferenceNumber: { type: String, default: '' },
    internalAdminNotes: { type: String, default: '' },
    requestedProofNotes: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: '' },
    metadata: { type: Map, of: String }
  },
  { timestamps: true }
);

export default mongoose.model('SaasTransaction', saasTransactionSchema);
