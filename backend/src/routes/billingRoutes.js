import express from 'express';
import {
  createSubscriptionCheckoutSession,
  handlePaymentProviderWebhook,
  verifyPaymentSession
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// 1. PUBLIC WEBHOOK ENDPOINT: Secure Payment Provider Webhooks
// NOTE: MUST NOT require JWT auth as payment providers (Stripe/PayPal) call this asynchronously
router.post('/webhook', handlePaymentProviderWebhook);

// 2. PROTECTED CHECKOUT & VERIFICATION ENDPOINTS
router.use(protect, attachTenant);

// Initiate Plan Checkout Session (Returns signed gateway URL / session reference)
router.post('/checkout', authorizeRoles('Owner', 'SuperAdmin', 'Admin'), createSubscriptionCheckoutSession);

// Backend Payment Session Verification (Poll/Verify session before activating access)
router.get('/verify-session/:sessionId', authorizeRoles('Owner', 'SuperAdmin', 'Admin'), verifyPaymentSession);

export default router;
