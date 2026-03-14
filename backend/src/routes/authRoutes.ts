import { Router } from 'express';
import { sendOTP, verifyOTP, getProfile, updateProfile, staffLogin, getCurrentOTP, adminLogin } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { otpLimiter, authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.get('/current-otp', getCurrentOTP); // Demo endpoint for fetching current OTP
router.post('/staff-login', staffLogin);
router.post('/admin-login', adminLogin);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;

