import express from 'express';
import { createTransferRequest, getTransfers, updateTransferStatus } from '../controllers/transferController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { requireFeature } from '../middlewares/featureEntitlementMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant, requireFeature('multiBranch'));

router.post('/transfers', authorizeRoles('Owner', 'Admin', 'Branch Manager'), createTransferRequest);
router.get('/transfers', getTransfers);
router.put('/transfers/:id/status', authorizeRoles('Owner', 'Admin', 'Branch Manager'), updateTransferStatus);

export default router;
