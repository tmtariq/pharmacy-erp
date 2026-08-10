import express from 'express';
import {
  getDashboardMetrics, getAuditLogs, getOwnerDashboard,
  getPharmacistDashboard, getInventoryDashboard, getSalesStaffDashboard,
  getCashierDashboard
} from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant);

router.get('/dashboard-metrics', getDashboardMetrics);
router.get('/owner-dashboard', authorizeRoles('Owner', 'Admin'), getOwnerDashboard);
router.get('/pharmacist-dashboard', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Pharmacist'), getPharmacistDashboard);
router.get('/inventory-dashboard', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager', 'InventoryManager'), getInventoryDashboard);
router.get('/sales-dashboard', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Sales Staff', 'SalesStaff'), getSalesStaffDashboard);
router.get('/cashier-dashboard', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Cashier'), getCashierDashboard);
router.get('/audit-logs', getAuditLogs);

export default router;
