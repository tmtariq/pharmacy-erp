import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
    email: { type: String, required: true, lowercase: true, trim: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    status: {
      type: String,
      enum: ['success', 'failed', 'locked', '2fa_pending'],
      required: true
    },
    failureReason: { type: String, default: '' }
  },
  { timestamps: true }
);

loginHistorySchema.index({ user: 1, createdAt: -1 });
loginHistorySchema.index({ pharmacy: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
