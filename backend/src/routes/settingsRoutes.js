import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

router.use(protect, attachTenant);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
