import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_config' },
    
    // 1. General Config
    general: {
      saasName: { type: String, default: 'Saad ERP Pharmacy Network' },
      logo: { type: String, default: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800' },
      supportEmail: { type: String, default: 'support@saaderp.com' },
      contactPhone: { type: String, default: '+1 (800) 555-0199' },
      defaultCurrency: { type: String, default: 'USD' },
      timeZone: { type: String, default: 'America/New_York' }
    },

    // 2. Subscription lifecycle Settings
    trialSettings: {
      defaultTrialLengthDays: { type: Number, default: 14 },
      trialEligibility: {
        type: String,
        enum: ['all_new_companies', 'verified_companies_only', 'manual_approval_only', 'disabled'],
        default: 'all_new_companies'
      },
      allowSelfServeExtension: { type: Boolean, default: false },
      maxExtensionDays: { type: Number, default: 30 },
      trialExpirationBehavior: {
        type: String,
        enum: ['block_access', 'read_only', 'auto_convert_paid', 'grace_period'],
        default: 'block_access'
      },
      gracePeriodAfterTrialDays: { type: Number, default: 7 },
      sendReminderDaysBeforeExpiry: { type: Number, default: 3 }
    },

    expirationAndGraceSettings: {
      enableAutomatedLifecycle: { type: Boolean, default: true },
      firstReminderDaysBeforeExpiry: { type: Number, default: 7 },
      secondReminderDaysBeforeExpiry: { type: Number, default: 3 },
      gracePeriodDurationDays: { type: Number, default: 7 },
      gracePeriodAccessMode: {
        type: String,
        enum: ['full_access', 'read_only', 'restricted_access', 'suspended_access'],
        default: 'restricted_access'
      },
      postGraceExpirationBehavior: {
        type: String,
        enum: ['suspended_access', 'read_only', 'restricted_access'],
        default: 'suspended_access'
      },
      preventDataDeletion: { type: Boolean, default: true },
      notifyOwnerViaEmail: { type: Boolean, default: true },
      notifyOwnerViaSms: { type: Boolean, default: false }
    },

    // 3. Billing & Tax configuration
    billing: {
      taxRatePercent: { type: Number, default: 8.5 },
      enableTaxCalculation: { type: Boolean, default: true },
      invoiceHeaderPrefix: { type: String, default: 'INV-SAAS-' },
      paymentProvider: { type: String, enum: ['Stripe', 'PayPal', 'Authorized.Net'], default: 'Stripe' },
      paymentProviderSandbox: { type: Boolean, default: true },
      refundWindowDays: { type: Number, default: 30 },
      enableAutomaticRefunds: { type: Boolean, default: true },
      senderEmailName: { type: String, default: 'Saad ERP Billing' }
    },

    // 4. Email Templates Configuration
    templates: {
      welcome: {
        subject: { type: String, default: 'Welcome to Saad Pharmacy ERP Platform!' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nWelcome to Saad ERP. Your pharmacy branch network account is ready. Log in to initialize POS.' }
      },
      companyApproval: {
        subject: { type: String, default: 'Pharmacy Account Approved & Active' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nYour pharmacy organization details have been approved. Access keys are now active.' }
      },
      paymentReceipt: {
        subject: { type: String, default: 'Payment Invoice Confirmation' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nWe received your payment of {{amount}} USD. Thank you for choosing Saad ERP.' }
      },
      paymentFailure: {
        subject: { type: String, default: 'Urgent: Subscription Payment Failed' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nYour transaction for {{amount}} USD declined. Please update billing credentials.' }
      },
      subscriptionExpiring: {
        subject: { type: String, default: 'Action Required: Subscription Expiring Soon' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nYour subscription expires in {{days}} days. Auto-renewal status: Active.' }
      },
      subscriptionExpired: {
        subject: { type: String, default: 'Alert: Subscription Cycle Expired' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nYour subscription cycle has ended. Grace period activated.' }
      },
      suspension: {
        subject: { type: String, default: 'Notice: Pharmacy ERP Suspension Active' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nYour branch networks access suspended. Data remains preserved.' }
      },
      reactivation: {
        subject: { type: String, default: 'Restored: Subscription Active' },
        body: { type: String, default: 'Hi {{ownerName}},\n\nAccess restored. All POS dispensaries online.' }
      }
    },

    // 5. Platform Security Configurations
    security: {
      enableMfaEnforcement: { type: Boolean, default: false },
      sessionDurationMinutes: { type: Number, default: 60 },
      passwordMinLength: { type: Number, default: 8 },
      requireUppercaseSymbols: { type: Boolean, default: true },
      lockoutAttemptsLimit: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
      enableDetailedAuditLogs: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model('PlatformSettings', platformSettingsSchema);
