import express from 'express';
import {
  superAdminLogin,
  getSuperAdminProfile,
  superAdminLogout
} from '../controllers/superAdminAuthController.js';
import {
  getAllTenantSubscriptions,
  getSuperAdminFullAnalytics,
  createTenantCompanyBySuperAdmin,
  updateTenantCompany,
  deleteTenantCompany,
  suspendSubscription,
  renewSubscription,
  reactivateCompanyWithConfig,
  modifyTenantSubscription,
  getPendingRegistrations,
  reviewCompanyRegistration,
  getCompanyFullDetail,
  getSuperAdminPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  archiveSubscriptionPlan,
  getPlatformTrialSettings,
  updatePlatformTrialSettings,
  extendCompanyTrial,
  getPaymentDashboardAnalytics,
  getAllSaasTransactions,
  processPaymentRefund,
  updateTransactionStatus,
  reviewManualPaymentTransaction,
  getAllSaasRefunds,
  processSaasRefundDecision,
  getAllSaasInvoices,
  resendSaasInvoice,
  voidSaasInvoice,
  getExpirationGraceSettings,
  updateExpirationGraceSettings,
  runAutomatedSubscriptionLifecycleRoutine,
  getAllCompanyUsers,
  sendUserPasswordResetLink,
  toggleCompanyUserStatus,
  getAllCompanyBranches,
  startSuperAdminSupportSession,
  endSuperAdminSupportSession,
  getPlatformAuditLogs,
  getSaasNotifications,
  markSaasNotificationRead,
  getSaasNotificationPreferences,
  updateSaasNotificationPreferences,
  getAllSaasSupportTickets,
  getSaasSupportTicketById,
  createSaasSupportTicketBySuperAdmin,
  updateSaasSupportTicketProperties,
  addSaasSupportTicketMessage,
  getPlatformExecutiveReports,
  getSaaSPlatformSettings,
  updateSaaSPlatformSettings
} from '../controllers/subscriptionController.js';
import { requireSuperAdmin, authorizePlatformRole } from '../middlewares/superAdminMiddleware.js';

const router = express.Router();

// 1. SuperAdmin Public Authentication Endpoints
router.post('/login', superAdminLogin);

// 2. Protected SaaS Administration Endpoints (Restricted strictly to SuperAdmin)
router.use(requireSuperAdmin);

router.get('/me', getSuperAdminProfile);
router.post('/logout', superAdminLogout);
router.get('/companies', authorizePlatformRole('Support Admin', 'Operations Admin'), getAllTenantSubscriptions);
router.get('/companies/pending', authorizePlatformRole('Support Admin'), getPendingRegistrations);
router.get('/companies/:pharmacyId', authorizePlatformRole('Support Admin', 'Operations Admin'), getCompanyFullDetail);
router.post('/companies/:pharmacyId/review', authorizePlatformRole('Support Admin'), reviewCompanyRegistration);
router.get('/analytics', getSuperAdminFullAnalytics);
router.post('/companies/create', authorizePlatformRole('Operations Admin'), createTenantCompanyBySuperAdmin);
router.put('/companies/:pharmacyId', authorizePlatformRole('Operations Admin'), updateTenantCompany);
router.delete('/companies/:pharmacyId', authorizePlatformRole('Super Admin', 'SuperAdmin'), deleteTenantCompany);
router.post('/subscriptions/suspend/:pharmacyId', authorizePlatformRole('Operations Admin', 'Support Admin'), suspendSubscription);
router.post('/subscriptions/reactivate/:pharmacyId', authorizePlatformRole('Operations Admin'), reactivateCompanyWithConfig);
router.post('/subscriptions/renew/:pharmacyId', authorizePlatformRole('Finance Admin'), renewSubscription);
router.post('/subscriptions/modify/:pharmacyId', authorizePlatformRole('Finance Admin', 'Operations Admin'), modifyTenantSubscription);

// 3. SaaS Subscription Plan Management Endpoints
router.get('/plans', getSuperAdminPlans);
router.post('/plans/create', authorizePlatformRole('Operations Admin'), createSubscriptionPlan);
router.put('/plans/:planId', authorizePlatformRole('Operations Admin'), updateSubscriptionPlan);
router.post('/plans/:planId/archive', authorizePlatformRole('Operations Admin'), archiveSubscriptionPlan);

// 4. SaaS Global Trial Controls & Company Extensions
router.get('/trials/settings', getPlatformTrialSettings);
router.put('/trials/settings', authorizePlatformRole('Operations Admin'), updatePlatformTrialSettings);
router.post('/trials/extend/:pharmacyId', authorizePlatformRole('Operations Admin', 'Support Admin'), extendCompanyTrial);

// 5. SaaS Payment Management & Transactions Center
router.get('/payments/dashboard', authorizePlatformRole('Finance Admin'), getPaymentDashboardAnalytics);
router.get('/payments/transactions', authorizePlatformRole('Finance Admin'), getAllSaasTransactions);
router.post('/payments/transactions/:transactionId/refund', authorizePlatformRole('Finance Admin'), processPaymentRefund);
router.put('/payments/transactions/:transactionId/status', authorizePlatformRole('Finance Admin'), updateTransactionStatus);
router.post('/payments/transactions/:transactionId/review', authorizePlatformRole('Finance Admin'), reviewManualPaymentTransaction);

// 6. SaaS Refund Management Center
router.get('/refunds', authorizePlatformRole('Finance Admin'), getAllSaasRefunds);
router.post('/refunds/:refundId/decision', authorizePlatformRole('Finance Admin'), processSaasRefundDecision);

// 7. SaaS Invoice Management Center
router.get('/invoices', authorizePlatformRole('Finance Admin'), getAllSaasInvoices);
router.post('/invoices/:invoiceNumber/resend', authorizePlatformRole('Finance Admin'), resendSaasInvoice);
router.post('/invoices/:invoiceNumber/void', authorizePlatformRole('Finance Admin'), voidSaasInvoice);

// 8. SaaS Expiration & Grace Period Lifecycle Management
router.get('/lifecycle/expiration-settings', authorizePlatformRole('Operations Admin'), getExpirationGraceSettings);
router.put('/lifecycle/expiration-settings', authorizePlatformRole('Operations Admin'), updateExpirationGraceSettings);
router.post('/lifecycle/run-routine', authorizePlatformRole('Operations Admin'), runAutomatedSubscriptionLifecycleRoutine);

// 9. SaaS Cross-Company User Directory & Administration
router.get('/users', authorizePlatformRole('Support Admin'), getAllCompanyUsers);
router.post('/users/:userId/reset-password', authorizePlatformRole('Support Admin'), sendUserPasswordResetLink);
router.post('/users/:userId/toggle-status', authorizePlatformRole('Support Admin'), toggleCompanyUserStatus);

// 10. SaaS Branch Management & Investigation Center
router.get('/branches', authorizePlatformRole('Support Admin'), getAllCompanyBranches);

// 11. SaaS Secure Super Admin Support ERP Access Mode
router.post('/companies/:pharmacyId/support-session/start', authorizePlatformRole('Support Admin'), startSuperAdminSupportSession);
router.post('/companies/:pharmacyId/support-session/end', authorizePlatformRole('Support Admin'), endSuperAdminSupportSession);

// 12. SaaS Platform Immutable Audit Logs Directory
router.get('/audit-logs', authorizePlatformRole('Support Admin', 'Operations Admin', 'Finance Admin'), getPlatformAuditLogs);

// 13. SaaS Platform Notifications & Preference Governance
router.get('/notifications', getSaasNotifications);
router.post('/notifications/:notificationId/read', markSaasNotificationRead);
router.get('/notifications/preferences', getSaasNotificationPreferences);
router.put('/notifications/preferences', updateSaasNotificationPreferences);

// 14. SaaS Platform Support Ticketing Center
router.get('/tickets', authorizePlatformRole('Support Admin'), getAllSaasSupportTickets);
router.get('/tickets/:ticketId', authorizePlatformRole('Support Admin'), getSaasSupportTicketById);
router.post('/tickets/create', authorizePlatformRole('Support Admin'), createSaasSupportTicketBySuperAdmin);
router.put('/tickets/:ticketId', authorizePlatformRole('Support Admin'), updateSaasSupportTicketProperties);
router.post('/tickets/:ticketId/messages', authorizePlatformRole('Support Admin'), addSaasSupportTicketMessage);

// 15. SaaS Platform Executive Reports & Analytics Pipeline
router.get('/reports', authorizePlatformRole('Finance Admin'), getPlatformExecutiveReports);

// 16. SaaS Platform Configuration & Policy Governance
router.get('/settings', getSaaSPlatformSettings);
router.put('/settings', authorizePlatformRole('Operations Admin'), updateSaaSPlatformSettings);

export default router;
