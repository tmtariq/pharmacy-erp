import express from 'express';
import { createTransferRequest, getTransfers, updateTransferStatus } from '../controllers/transferController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { requireFeature } from '../middlewares/featureEntitlementMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant, requireFeature('multiBranch'));

router.post('/transfers', createTransferRequest);
router.get('/transfers', getTransfers);
router.put('/transfers/:id/status', updateTransferStatus);

export default router;
