import express from 'express';
import {
  getForecastDashboard,
  getRevenueForecast,
  getDemandForecast,
  getTrendsForecast,
  getStockoutPredictions,
  getDeadStockPredictions,
  getCategoryForecast,
  generateForecast,
  updateForecastSettings
} from '../controllers/forecastController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';
import { requireFeature } from '../middlewares/featureEntitlementMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant, requireFeature('aiForecast'));

// Forecast Dashboard & Metrics
router.get('/', getForecastDashboard);
router.get('/revenue', getRevenueForecast);
router.get('/demand', getDemandForecast);
router.get('/trends', getTrendsForecast);
router.get('/stockout', getStockoutPredictions);
router.get('/dead-stock', getDeadStockPredictions);
router.get('/category', getCategoryForecast);

// Generation & Settings (Owner, Admin, Manager)
router.post('/generate', authorizeRoles('Owner', 'Admin', 'Manager'), generateForecast);
router.post('/settings', authorizeRoles('Owner', 'Admin'), updateForecastSettings);

export default router;
