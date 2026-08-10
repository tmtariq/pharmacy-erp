import mongoose from 'mongoose';

const cashRegisterSchema = new mongoose.Schema(
  {
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cashierName: { type: String, required: true },
    openingBalance: { type: Number, required: true, default: 0 },
    closingBalance: { type: Number, default: null },
    actualCashCount: { type: Number, default: null },
    cashDifference: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

cashRegisterSchema.index({ pharmacy: 1, branch: 1, cashier: 1, status: 1 });

export default mongoose.model('CashRegister', cashRegisterSchema);
