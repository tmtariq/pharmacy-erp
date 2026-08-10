import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema(
  {
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
    invoiceNumber: { type: String, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String, required: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByName: { type: String, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedByName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'processed'],
      default: 'pending_approval'
    },
    paymentMethod: { type: String, default: 'cash' },
    rejectionReason: { type: String, default: '' },
    processedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

refundRequestSchema.index({ pharmacy: 1, branch: 1, status: 1 });

export default mongoose.model('RefundRequest', refundRequestSchema);
