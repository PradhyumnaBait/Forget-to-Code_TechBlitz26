import { Router } from 'express';
import {
  getAvailableDates,
  getAvailableSlots,
  getClinicInfo,
  reserveSlot,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '../controllers/bookingController';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/available-dates', getAvailableDates);
router.get('/slots', getAvailableSlots);
router.get('/clinic-info', getClinicInfo);
router.post('/reserve-slot', optionalAuth, reserveSlot);
router.post('/create', optionalAuth, createAppointment);
router.post('/cancel/:id', optionalAuth, cancelAppointment);
router.post('/reschedule/:id', optionalAuth, rescheduleAppointment);

export default router;
