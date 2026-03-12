import { Router } from 'express';
import {
  listAppointments,
  getTodayAppointments,
  getAppointmentById,
} from '../controllers/appointmentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/', listAppointments);
router.get('/today', getTodayAppointments);
router.get('/:id', getAppointmentById);

export default router;
