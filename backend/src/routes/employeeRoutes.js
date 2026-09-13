import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { getEmployees, createEmployee, updateEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.use(protect, attachTenant);

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);

export default router;
