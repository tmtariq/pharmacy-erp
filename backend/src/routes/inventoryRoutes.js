import express from 'express';
import {
  getCategories, createCategory,
  getSuppliers, createSupplier,
  getMedicines, createMedicine, updateMedicine, deleteMedicine,
  getBatches, addBatch, updateBatch, deleteBatch
} from '../controllers/inventoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';
import { subscriptionGatekeeper } from '../middlewares/subscriptionGatekeeperMiddleware.js';

const router = express.Router();

router.use(protect, attachTenant, subscriptionGatekeeper);

// Categories
router.get('/categories', getCategories);
router.post('/categories', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), createCategory);

// Suppliers
router.get('/suppliers', getSuppliers);
router.post('/suppliers', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), createSupplier);

// Medicines
router.get('/medicines', getMedicines);
router.post('/medicines', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), createMedicine);
router.put('/medicines/:id', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), updateMedicine);
router.delete('/medicines/:id', authorizeRoles('Owner', 'Admin'), deleteMedicine);

// Batches (FEFO inventory)
router.get('/batches', getBatches);
router.post('/batches', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), addBatch);
router.put('/batches/:id', authorizeRoles('Owner', 'Admin', 'Branch Manager', 'Inventory Manager'), updateBatch);
router.delete('/batches/:id', authorizeRoles('Owner', 'Admin'), deleteBatch);

export default router;
