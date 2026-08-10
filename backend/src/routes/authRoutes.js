import express from 'express';
import {
  login,
  registerStaff, getUsers, updateStaffUser, getMe, refreshToken, logout,
  forgotPassword, resetPassword, toggle2FA, getLoginHistory
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected Routes
router.use(protect);
router.get('/me', getMe);

router.use(attachTenant);
router.post('/toggle-2fa', toggle2FA);
router.get('/users', authorizeRoles('Owner', 'Admin', 'Branch Manager'), getUsers);
router.put('/users/:id', authorizeRoles('Owner', 'Admin', 'Branch Manager'), updateStaffUser);
router.post('/register-staff', authorizeRoles('Owner', 'Admin', 'Branch Manager'), registerStaff);
router.get('/login-history', authorizeRoles('Owner', 'Admin'), getLoginHistory);

export default router;