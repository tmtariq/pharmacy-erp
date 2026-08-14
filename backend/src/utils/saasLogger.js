import PlatformAuditLog from '../models/PlatformAuditLog.js';
import SaasNotification from '../models/SaasNotification.js';
import SaasNotificationPreference from '../models/SaasNotificationPreference.js';
import SuperAdmin from '../models/SuperAdmin.js';

/**
 * Log a Platform Administrative Action
 */
export const logPlatformAction = async ({
  req,
  actorName,
  actorRole,
  actorId,
  action,
  target,
  targetId = '',
  oldValue = '',
  newValue = '',
  reason = '',
  module
}) => {
  try {
    let finalActorName = actorName || 'System';
    let finalActorRole = actorRole || 'System';
    let finalActorId = actorId || null;

    if (req) {
      const admin = req.superAdmin || req.userFull || req.user;
      if (admin) {
        finalActorId = admin._id || admin.id;
        finalActorName = admin.name || finalActorName;
        finalActorRole = admin.role || finalActorRole;
      }
    }

    const ipAddress = req ? (req.ip || req.headers['x-forwarded-for'] || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await PlatformAuditLog.create({
      actor: {
        id: finalActorId,
        name: finalActorName,
        role: finalActorRole
      },
      action,
      target,
      targetId: String(targetId),
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      reason,
      module,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Audit Logger Error:', error);
  }
};

/**
 * Dispatch Platform Notification & Alert
 */
export const dispatchSaasNotification = async ({
  type,
  title,
  message,
  metadata = {}
}) => {
  try {
    // 1. Save Notification record
    const notification = await SaasNotification.create({
      type,
      title,
      message,
      metadata
    });

    // 2. Dispatch email/browser logic based on active preferences
    // For MERN scope, we query all administrators and verify enabled alert preferences
    const admins = await SuperAdmin.find({ status: 'active' });
    for (const admin of admins) {
      let pref = await SaasNotificationPreference.findOne({ admin: admin._id });
      if (!pref) {
        pref = await SaasNotificationPreference.create({ admin: admin._id });
      }

      // Check alert key mapping
      const keyMap = {
        'NEW_COMPANY_REGISTERED': 'newCompanyRegistered',
        'COMPANY_APPROVAL_REQUIRED': 'companyApprovalRequired',
        'PAYMENT_RECEIVED': 'paymentReceived',
        'PAYMENT_FAILED': 'paymentFailed',
        'MANUAL_PAYMENT_UPLOADED': 'manualPaymentUploaded',
        'REFUND_REQUESTED': 'refundRequested',
        'SUBSCRIPTION_EXPIRING': 'subscriptionExpiring',
        'COMPANY_SUSPENDED': 'companySuspended',
        'SUPPORT_REQUEST_ARRIVED': 'supportRequestArrived',
        'WEBHOOK_FAILED': 'webhookFailed',
        'INTEGRATION_FAILED': 'integrationFailed'
      };

      const prefKey = keyMap[type];
      const isAlertEnabled = prefKey ? pref.enabledAlertTypes[prefKey] !== false : true;

      if (isAlertEnabled) {
        if (pref.browserNotifications) {
          // Push notifications or socket dispatch (mocked to terminal/logs for seeding)
          console.log(`[BROWSER NOTIFICATION DISPATCHED to ${admin.email}] Title: ${title}`);
        }
        if (pref.emailNotifications) {
          // Nodemailer email send logic
          console.log(`[EMAIL ALERT DISPATCHED to ${admin.email}] Subject: ${title}`);
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('Platform Notification Dispatcher Error:', error);
  }
};
