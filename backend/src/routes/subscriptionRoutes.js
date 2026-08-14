import express from 'express';
import {
  getMySubscription,
  getSubscriptionPlans,
  changeSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  suspendSubscription,
  renewSubscription,
  getAllTenantSubscriptions,
  getSuperAdminFullAnalytics,
  createTenantCompanyBySuperAdmin,
  updateTenantCompany,
  deleteTenantCompany
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant);

router.get('/my-subscription', getMySubscription);
router.get('/plans', getSubscriptionPlans);
router.get('/admin/all-subscriptions', authorizeRoles('SuperAdmin'), getAllTenantSubscriptions);
router.get('/admin/full-analytics', authorizeRoles('SuperAdmin'), getSuperAdminFullAnalytics);
router.post('/admin/create-company', authorizeRoles('SuperAdmin'), createTenantCompanyBySuperAdmin);
router.put('/admin/company/:pharmacyId', authorizeRoles('SuperAdmin'), updateTenantCompany);
router.delete('/admin/company/:pharmacyId', authorizeRoles('SuperAdmin'), deleteTenantCompany);
router.post('/change-plan', authorizeRoles('Owner', 'SuperAdmin', 'Admin'), changeSubscriptionPlan);
router.post('/change-plan/:pharmacyId', authorizeRoles('Owner', 'SuperAdmin'), changeSubscriptionPlan);
router.post('/suspend/:pharmacyId', authorizeRoles('SuperAdmin'), suspendSubscription);
router.post('/renew/:pharmacyId', authorizeRoles('SuperAdmin'), renewSubscription);
router.post('/cancel-subscription', authorizeRoles('Owner', 'SuperAdmin'), cancelSubscription);
router.post('/reactivate-subscription', authorizeRoles('Owner', 'SuperAdmin'), reactivateSubscription);

export default router;
