import express from 'express';
import { getFinanceSummary } from '../controllers/financeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant);

router.get('/summary', authorizeRoles('Owner', 'Admin'), getFinanceSummary);

export default router;
