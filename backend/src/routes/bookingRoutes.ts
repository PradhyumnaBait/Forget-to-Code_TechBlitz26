import { Router } from 'express';
import {
  getAvailableDates,
  getAvailableSlots,
  reserveSlot,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '../controllers/bookingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/available-dates', getAvailableDates);
router.get('/slots', getAvailableSlots);
router.post('/reserve-slot', authMiddleware, reserveSlot);
router.post('/create', authMiddleware, createAppointment);
router.post('/cancel/:id', authMiddleware, cancelAppointment);
router.post('/reschedule/:id', authMiddleware, rescheduleAppointment);

export default router;
