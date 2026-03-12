import { Router } from 'express';
import {
  startConsultation,
  saveNotes,
  getConsultationById,
  getPatientHistory,
} from '../controllers/consultationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/start', startConsultation);
router.post('/notes', saveNotes);
router.get('/history/:patientId', getPatientHistory);
router.get('/:id', getConsultationById);

export default router;
