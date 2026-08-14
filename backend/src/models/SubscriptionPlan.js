import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // Basic, Professional, Enterprise, Custom, Starter
    planType: { type: String, enum: ['Basic', 'Professional', 'Enterprise', 'Custom'], default: 'Professional' },
    description: { type: String, default: '' },
    monthlyPrice: { type: Number, required: true, default: 99 },
    yearlyPrice: { type: Number, default: 990 },
    trialDurationDays: { type: Number, default: 14 },
    supportLevel: { type: String, enum: ['Community', 'Standard (Email)', 'Priority (24/7 Phone & Email)', 'Dedicated Account Manager'], default: 'Standard (Email)' },

    // Plan Limits
    limits: {
      maxUsers: { type: Number, default: 5 }, // -1 for unlimited
      maxBranches: { type: Number, default: 1 }, // -1 for unlimited
      maxMedicines: { type: Number, default: 1000 }, // -1 for unlimited
      maxStorageGB: { type: Number, default: 5 },
      maxMonthlyTransactions: { type: Number, default: 10000 },
      maxApiRequests: { type: Number, default: 10000 }
    },

    // Feature Flags Matrix
    features: {
      pos: { type: Boolean, default: true },
      inventory: { type: Boolean, default: true },
      medicines: { type: Boolean, default: true },
      expiry: { type: Boolean, default: true },
      barcode: { type: Boolean, default: true },
      qrScanner: { type: Boolean, default: true },
      apiAccess: { type: Boolean, default: false },
      advancedReporting: { type: Boolean, default: false },
      accountingAccess: { type: Boolean, default: false },
      multiBranchSupport: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false },
      aiForecast: { type: Boolean, default: false },
      smsNotifications: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      auditLogs: { type: Boolean, default: false },
      automatedBackups: { type: Boolean, default: false }
    },

    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
