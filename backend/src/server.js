import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { securityHeaders, rateLimiter } from './middlewares/securityMiddleware.js';

import tenantRoutes from './routes/tenantRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import posRoutes from './routes/posRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import expiryRoutes from './routes/expiryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import forecastRoutes from './routes/forecastRoutes.js';
import reorderDuplicateRoutes from './routes/reorderDuplicateRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import saasAdminRoutes from './routes/saasAdminRoutes.js';
import billingRoutes from './routes/billingRoutes.js';

dotenv.config();

const app = express();

// Ensure Database Connection on Request
app.use((req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => {
      console.error('Database connection failure:', err.message);
      res.status(500).json({ message: 'Database connection failure: ' + err.message });
    });
});
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security & Base Middleware
app.use(securityHeaders);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Branch-ID'],
  optionsSuccessStatus: 200,
}));

// Route Registrations (Supports both /api/v1 and /v1 for Vercel Serverless Function rewrites)
const apiRouter = express.Router();
apiRouter.use('/tenants', tenantRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/pos', posRoutes);
apiRouter.use('/transfers', transferRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/purchases', purchaseRoutes);
apiRouter.use('/expiry', expiryRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/backups', backupRoutes);
apiRouter.use('/forecast', forecastRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/saas-admin', saasAdminRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/reorder-duplicates', reorderDuplicateRoutes);

app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/', apiRouter);

// Healthcheck Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Multi-Tenant Enterprise Pharmacy ERP API is active',
    security: 'JWT + HttpOnly Cookies + Rate Limiting + Account Lockout + 2FA + RBAC Active',
    version: '2.0.0'
  });
});

// 404 Fallback Handler for Serverless Invocation Safety
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl || req.url} not found on Pharmacy ERP API`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Start Server (only if not running on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Multi-Tenant Pharmacy ERP Server running on port ${PORT}`);
  });
}

export default app;