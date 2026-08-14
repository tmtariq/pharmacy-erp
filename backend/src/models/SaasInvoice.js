import mongoose from 'mongoose';

const saasInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    companyName: { type: String, required: true },
    companyCode: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    billingAddress: {
      address: { type: String, default: '123 Healthcare Ave' },
      city: { type: String, default: 'New York' },
      country: { type: String, default: 'USA' },
      taxId: { type: String, default: '' }
    },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    planName: { type: String, default: 'Professional' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    billingPeriod: {
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    },
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, uppercase: true, default: 'USD' },
    paymentStatus: {
      type: String,
      enum: [
        'Draft', 'Issued', 'Paid', 'Unpaid', 'Overdue', 'Cancelled', 'Refunded',
        'draft', 'issued', 'paid', 'unpaid', 'overdue', 'cancelled', 'refunded'
      ],
      default: 'Paid',
      index: true
    },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Credit Card' },
    paymentProvider: { type: String, default: 'Stripe' },
    transactionId: { type: String, default: '' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'SaasTransaction' },
    isVoided: { type: Boolean, default: false },
    voidedAt: { type: Date, default: null },
    voidReason: { type: String, default: '' },
    resentCount: { type: Number, default: 0 },
    lastResentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('SaasInvoice', saasInvoiceSchema);
