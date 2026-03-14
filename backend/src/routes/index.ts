import { Router } from 'express';
import authRoutes from './authRoutes';
import bookingRoutes from './bookingRoutes';
import appointmentRoutes from './appointmentRoutes';
import queueRoutes from './queueRoutes';
import consultationRoutes from './consultationRoutes';
import prescriptionRoutes from './prescriptionRoutes';
import billingRoutes from './billingRoutes';
import analyticsRoutes from './analyticsRoutes';
import aiRoutes from './aiRoutes';
import whatsappRoutes from './whatsappRoutes';
import patientRoutes from './patientRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/queue', queueRoutes);
router.use('/consultations', consultationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/billing', billingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/patients', patientRoutes);
router.use('/settings', settingsRoutes);

export default router;
