import { Router } from 'express';
import {
  getDailyStats,
  getMonthlyRevenue,
  getPeakHours,
  getNoShowRate,
} from '../controllers/analyticsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.get('/today', getDailyStats);
router.get('/revenue', getMonthlyRevenue);
router.get('/peak-hours', getPeakHours);
router.get('/no-show-rate', getNoShowRate);

export default router;
