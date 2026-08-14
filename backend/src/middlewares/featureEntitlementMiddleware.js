import Pharmacy from '../models/Pharmacy.js';
import Subscription from '../models/Subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import FeatureFlag from '../models/FeatureFlag.js';

/**
 * Feature Entitlements Matrix
 * Basic: POS, Inventory, Customers, Medicines, Expiry, Barcode, QR Scanner
 * Professional: Everything in Basic + Multi-branch, Advanced Reports, Accounting, Analytics, SMS/Email Alerts, Audit Logs
 * Enterprise: Everything in Professional + REST API Access, Advanced AI Analytics/Forecast, Unlimited Quotas, Priority Support, Webhooks
 */
export const DEFAULT_PLAN_ENTITLEMENTS = {
  Basic: {
    pos: true,
    inventory: true,
    customers: true,
    medicines: true,
    expiry: true,
    barcode: true,
    qrScanner: true,
    multiBranch: false,
    reports: false,
    advancedReporting: false,
    accounting: false,
    accountingAccess: false,
    analytics: false,
    apiAccess: false,
    aiForecast: false,
    webhooks: false,
    automatedBackups: false,
    prioritySupport: false
  },
  Professional: {
    pos: true,
    inventory: true,
    customers: true,
    medicines: true,
    expiry: true,
    barcode: true,
    qrScanner: true,
    multiBranch: true,
    reports: true,
    advancedReporting: true,
    accounting: true,
    accountingAccess: true,
    analytics: true,
    apiAccess: false,
    aiForecast: false,
    webhooks: false,
    automatedBackups: true,
    prioritySupport: false
  },
  Enterprise: {
    pos: true,
    inventory: true,
    customers: true,
    medicines: true,
    expiry: true,
    barcode: true,
    qrScanner: true,
    multiBranch: true,
    reports: true,
    advancedReporting: true,
    accounting: true,
    accountingAccess: true,
    analytics: true,
    apiAccess: true,
    aiForecast: true,
    webhooks: true,
    automatedBackups: true,
    prioritySupport: true
  },
  Custom: {
    pos: true,
    inventory: true,
    customers: true,
    medicines: true,
    expiry: true,
    barcode: true,
    qrScanner: true,
    multiBranch: true,
    reports: true,
    advancedReporting: true,
    accounting: true,
    accountingAccess: true,
    analytics: true,
    apiAccess: true,
    aiForecast: true,
    webhooks: true,
    automatedBackups: true,
    prioritySupport: true
  }
};

/**
 * Backend Feature Entitlement Enforcement Middleware
 * Verifies that the tenant's current subscription tier or FeatureFlag record grants access to the requested feature.
 *
 * @param {string} requiredFeature - e.g. 'multiBranch', 'accounting', 'reports', 'analytics', 'apiAccess', 'aiForecast'
 * @returns Express Middleware
 */
export const requireFeature = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      // Super Admin bypasses tenant tier restrictions
      if (req.isSuperAdmin || req.superAdmin) {
        return next();
      }

      const pharmacyId = req.pharmacyId || req.pharmacy?._id || req.userFull?.pharmacy || req.user?.pharmacyId;
      if (!pharmacyId) {
        return res.status(403).json({
          success: false,
          code: 'PHARMACY_CONTEXT_REQUIRED',
          message: 'Tenant pharmacy context is required to verify feature entitlement.'
        });
      }

      // Check direct FeatureFlag overrides first
      const featureFlags = await FeatureFlag.findOne({ pharmacy: pharmacyId }).lean();
      if (featureFlags && featureFlags[requiredFeature] === true) {
        return next();
      }

      // Otherwise evaluate against Active Subscription Plan
      const [pharmacy, subscription] = await Promise.all([
        Pharmacy.findById(pharmacyId).lean(),
        Subscription.findOne({ pharmacy: pharmacyId }).populate('plan').lean()
      ]);

      const planName = subscription?.plan?.name || pharmacy?.plan || 'Professional';
      const planFeatures = subscription?.plan?.features || DEFAULT_PLAN_ENTITLEMENTS[planName] || DEFAULT_PLAN_ENTITLEMENTS['Professional'];

      const isEntitled = Boolean(
        planFeatures[requiredFeature] ||
        (featureFlags && featureFlags[requiredFeature] === true)
      );

      if (!isEntitled) {
        return res.status(403).json({
          success: false,
          code: 'FEATURE_NOT_ENTITLED',
          message: `The feature "${requiredFeature}" is not included in your current subscription plan (${planName}). Please upgrade your plan tier to unlock this capability.`,
          requiredFeature,
          currentPlan: planName,
          upgradeRequiredTier: getMinimumRequiredTier(requiredFeature)
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify feature entitlement: ' + error.message
      });
    }
  };
};

export const getMinimumRequiredTier = (feature) => {
  const proFeatures = ['multiBranch', 'reports', 'advancedReporting', 'accounting', 'accountingAccess', 'analytics'];
  const enterpriseFeatures = ['apiAccess', 'aiForecast', 'webhooks', 'prioritySupport'];

  if (enterpriseFeatures.includes(feature)) return 'Enterprise';
  if (proFeatures.includes(feature)) return 'Professional';
  return 'Basic';
};
