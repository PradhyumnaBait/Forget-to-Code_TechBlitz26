import { Router } from 'express';
import {
  createPrescription,
  createBulkPrescriptions,
  getPrescriptionById,
  downloadPrescriptionPDF,
  deletePrescription,
} from '../controllers/prescriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/', createPrescription);
router.post('/bulk', createBulkPrescriptions);
router.get('/:id', getPrescriptionById);
router.get('/:id/pdf', downloadPrescriptionPDF);
router.delete('/:id', deletePrescription);

export default router;
