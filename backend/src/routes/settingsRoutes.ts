import { Router } from 'express';
import {
  getClinicSettings,
  updateClinicSettings,
  getDoctorSchedule,
  updateDoctorSchedule,
  getAppointmentRules,
  updateAppointmentRules,
  getNotificationSettings,
  updateNotificationSettings,
  getBillingSettings,
  updateBillingSettings,
  getSystemSettings,
  updateSystemSettings,
  getAllSettings
} from '../controllers/settingsController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All settings routes require authentication
router.use(authMiddleware);

// Get all settings at once
router.get('/', getAllSettings);

// Clinic Settings
router.get('/clinic', getClinicSettings);
router.put('/clinic', updateClinicSettings);

// Doctor Schedule
router.get('/schedule', getDoctorSchedule);
router.put('/schedule', updateDoctorSchedule);

// Appointment Rules
router.get('/rules', getAppointmentRules);
router.put('/rules', updateAppointmentRules);

// Notification Settings
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

// Billing Settings
router.get('/billing', getBillingSettings);
router.put('/billing', updateBillingSettings);

// System Settings
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

export default router;