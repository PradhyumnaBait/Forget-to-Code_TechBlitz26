import { Router } from 'express';
import {
  createBill,
  getBillByAppointment,
  confirmPayment,
  downloadReceipt,
  getTodayRevenue,
} from '../controllers/billingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/create', createBill);
router.get('/revenue/today', getTodayRevenue);
router.get('/appointment/:appointmentId', getBillByAppointment);
router.post('/:id/pay', confirmPayment);
router.get('/:id/receipt', downloadReceipt);

export default router;
