import { Router } from 'express';
import { sendOTP, verifyOTP, getProfile, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { otpLimiter, authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
