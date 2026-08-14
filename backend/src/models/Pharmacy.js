import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, default: '', trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    licenseNumber: { type: String, default: '' },
    businessRegistrationNumber: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
    country: { type: String, default: 'USA' },
    city: { type: String, default: 'New York' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: 'https://pharmacy-erp-rouge.vercel.app' },
    internalAdminNotes: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    logo: { type: String, default: '' },
    plan: { type: String, enum: ['Starter', 'Professional', 'Enterprise', 'Unlimited'], default: 'Professional' },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'canceled', 'pending', 'pending_payment', 'under_review', 'trial'],
      default: 'pending'
    },
    companyStatus: {
      type: String,
      enum: [
        'Pending', 'Active', 'Trial', 'Suspended', 'Expired', 'Cancelled', 'Rejected',
        'pending', 'active', 'trial', 'suspended', 'expired', 'cancelled', 'rejected',
        'pending_approval', 'info_requested', 'inactive'
      ],
      default: 'Pending'
    },
    suspensionConfig: {
      reason: { type: String, default: '' },
      effectiveDate: { type: Date, default: null },
      isScheduled: { type: Boolean, default: false },
      accessMode: { type: String, enum: ['blocked', 'read_only'], default: 'blocked' },
      notifiedOwner: { type: Boolean, default: false },
      suspendedAt: { type: Date, default: null },
      suspendedBy: { type: String, default: '' }
    },
    gracePeriodDays: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending_review', 'verified', 'rejected', 'more_info_needed'],
      default: 'pending_review'
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending_verification', 'paid', 'failed', 'refunded'],
      default: 'pending_verification'
    },
    rejectionReason: { type: String, default: '' },
    requestedInfoNotes: { type: String, default: '' },
    uploadedDocuments: [
      {
        docType: { type: String, default: 'Pharmacy License' },
        docUrl: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    isActive: { type: Boolean, default: false },

    // Feature Flags for SaaS Subscriptions
    featureFlags: {
      barcode: { type: Boolean, default: true },
      qrScanner: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      multiBranch: { type: Boolean, default: true },
      auditLogs: { type: Boolean, default: true },
      aiForecast: { type: Boolean, default: true },
      clinicalWarnings: { type: Boolean, default: true }
    },

    // Custom Tenant Branding & Settings
    branding: {
      logo: { type: String, default: '' },
      primaryColor: { type: String, default: '#2563eb' },
      secondaryColor: { type: String, default: '#059669' },
      currency: { type: String, default: 'USD' },
      currencySymbol: { type: String, default: '$' },
      timezone: { type: String, default: 'UTC' },
      language: { type: String, default: 'en' },
      receiptFooter: { type: String, default: 'Thank you for choosing our pharmacy! Get well soon.' }
    },

    // Custom SMTP Email Configuration
    smtp: {
      host: { type: String, default: '' },
      port: { type: Number, default: 587 },
      user: { type: String, default: '' },
      pass: { type: String, default: '' },
      fromEmail: { type: String, default: '' }
    },

    // Custom SMS Provider Configuration
    smsProvider: {
      provider: { type: String, default: 'Twilio' },
      apiKey: { type: String, default: '' },
      senderId: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Pharmacy', pharmacySchema);
