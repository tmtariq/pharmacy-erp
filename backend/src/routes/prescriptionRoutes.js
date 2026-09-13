import express from 'express';
import {
  uploadPrescription,
  batchUploadPrescriptions,
  processOcrPreprocessing,
  reviewPrescription,
  convertPrescriptionToPosSale,
  getPrescriptionAnalytics,
  getPatientPrescriptionHistory,
  getInventoryAvailability,
  getPrescriptions,
  getPrescriptionById,
  searchPatients,
  searchDoctors,
  approvePrescription
} from '../controllers/prescriptionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { attachTenant } from '../middlewares/tenantMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(attachTenant);

router.get('/analytics', getPrescriptionAnalytics);
router.get('/patients/search', searchPatients);
router.get('/doctors/search', searchDoctors);
router.get('/inventory-availability', getInventoryAvailability);
router.get('/patient-history/:patientId', getPatientPrescriptionHistory);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/upload', uploadPrescription);
router.post('/batch-upload', batchUploadPrescriptions);
router.post('/:id/process-ocr', processOcrPreprocessing);
router.put('/:id/review', authorizeRoles('Pharmacist', 'Owner', 'Admin'), reviewPrescription);
router.post('/:id/pos-convert', authorizeRoles('Pharmacist', 'Owner', 'Admin', 'Cashier'), convertPrescriptionToPosSale);
router.put('/:id/approve', authorizeRoles('Pharmacist', 'Owner', 'Admin'), approvePrescription);

export default router;

