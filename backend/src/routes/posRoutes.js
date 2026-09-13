import express from 'express';
import {
  checkout, processSale, getSales, getSalesHistory, getSaleById,
  openCashRegister, closeCashRegister, getCurrentRegister,
  requestRefund, approveRefund, processRefund, getRefunds
} from '../controllers/posController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';
import { subscriptionGatekeeper } from '../middlewares/subscriptionGatekeeperMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant, subscriptionGatekeeper);

// Sales & Invoices
router.post('/sales', processSale);
router.post('/checkout', checkout);
router.get('/sales', getSales);
router.get('/sales/:id', getSaleById);

// Cash Register Session
router.post('/register/open', openCashRegister);
router.post('/register/close', closeCashRegister);
router.get('/register/current', getCurrentRegister);

// 2-Step Manager Approved Refund Workflow
router.post('/refunds/request', requestRefund);
router.post('/refunds/:id/process', authorizeRoles('Owner', 'Admin', 'Branch Manager'), processRefund);
router.get('/refunds', getRefunds);

export default router;
