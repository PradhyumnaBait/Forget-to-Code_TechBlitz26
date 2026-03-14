import { Router } from 'express';
import {
  checkIn,
  getQueueStatus,
  getQueuePosition,
  nextInQueue,
  completeConsultation,
  markNoShow,
  getQueueList,
} from '../controllers/queueController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/check-in/:appointmentId', checkIn);
router.get('/status', getQueueStatus);
router.get('/list', getQueueList);
router.get('/position/:appointmentId', getQueuePosition);
router.post('/next', nextInQueue);
router.post('/complete/:appointmentId', completeConsultation);
router.post('/no-show/:appointmentId', markNoShow);

export default router;
