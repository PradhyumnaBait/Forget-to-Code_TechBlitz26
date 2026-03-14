import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import prisma from '../config/database';
import { z } from 'zod';

// ==================== Clinic Settings ====================
export const getClinicSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await prisma.clinicSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.clinicSettings.create({
        data: {
          clinicName: 'MedDesk Clinic',
          address: 'Andheri West, Mumbai',
          phone: '+91 9876543210',
          email: 'info@meddesk.in',
          consultationFee: 500,
        }
      });
    }

    res.json(successResponse('Clinic settings retrieved', settings));
  } catch (err) {
    next(err);
  }
};

export const updateClinicSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      clinicName: z.string().min(1).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      consultationFee: z.number().positive().optional(),
      locationLink: z.string().url().optional(),
    });

    const data = schema.parse(req.body);
    const existing = await prisma.clinicSettings.findFirst();
    const settings = existing
      ? await prisma.clinicSettings.update({ where: { id: existing.id }, data })
      : await prisma.clinicSettings.create({
          data: { ...data, clinicName: data.clinicName || 'MedDesk Clinic' }
        });

    res.json(successResponse('Clinic settings updated', settings));
  } catch (err) {
    next(err);
  }
};

// ==================== Doctor Schedule ====================
export const getDoctorSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let schedule = await prisma.doctorSchedule.findFirst();
    
    if (!schedule) {
      schedule = await prisma.doctorSchedule.create({
        data: {}
      });
    }

    res.json(successResponse('Doctor schedule retrieved', schedule));
  } catch (err) {
    next(err);
  }
};

export const updateDoctorSchedule = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      workingDays: z.array(z.string()).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      breakStartTime: z.string().optional(),
      breakEndTime: z.string().optional(),
      appointmentDuration: z.number().positive().optional(),
      bufferTime: z.number().min(0).optional(),
    });

    const data = schema.parse(req.body);
    const existing = await prisma.doctorSchedule.findFirst();
    const schedule = existing
      ? await prisma.doctorSchedule.update({ where: { id: existing.id }, data })
      : await prisma.doctorSchedule.create({ data });

    res.json(successResponse('Doctor schedule updated', schedule));
  } catch (err) {
    next(err);
  }
};

// ==================== Appointment Rules ====================
export const getAppointmentRules = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let rules = await prisma.appointmentRules.findFirst();
    
    if (!rules) {
      rules = await prisma.appointmentRules.create({
        data: {}
      });
    }

    res.json(successResponse('Appointment rules retrieved', rules));
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentRules = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      maxAppointmentsPerDay: z.number().positive().optional(),
      allowWalkIns: z.boolean().optional(),
      cancellationTimeLimit: z.number().positive().optional(),
      rescheduleLimit: z.number().positive().optional(),
      advanceBookingDays: z.number().positive().optional(),
    });

    const data = schema.parse(req.body);
    const existing = await prisma.appointmentRules.findFirst();
    const rules = existing
      ? await prisma.appointmentRules.update({ where: { id: existing.id }, data })
      : await prisma.appointmentRules.create({ data });

    res.json(successResponse('Appointment rules updated', rules));
  } catch (err) {
    next(err);
  }
};
// ==================== Notification Settings ====================
export const getNotificationSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await prisma.notificationSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {}
      });
    }

    res.json(successResponse('Notification settings retrieved', settings));
  } catch (err) {
    next(err);
  }
};

export const updateNotificationSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      whatsappEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
      reminderTime: z.number().positive().optional(),
      confirmationEnabled: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const existing = await prisma.notificationSettings.findFirst();
    const settings = existing
      ? await prisma.notificationSettings.update({ where: { id: existing.id }, data })
      : await prisma.notificationSettings.create({ data });

    res.json(successResponse('Notification settings updated', settings));
  } catch (err) {
    next(err);
  }
};

// ==================== Billing Settings ====================
export const getBillingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await prisma.billingSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.billingSettings.create({
        data: {}
      });
    }

    res.json(successResponse('Billing settings retrieved', settings));
  } catch (err) {
    next(err);
  }
};

export const updateBillingSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      defaultConsultationFee: z.number().positive().optional(),
      currency: z.string().optional(),
      paymentMethods: z.array(z.string()).optional(),
      autoGenerateInvoice: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const existing = await prisma.billingSettings.findFirst();
    const settings = existing
      ? await prisma.billingSettings.update({ where: { id: existing.id }, data })
      : await prisma.billingSettings.create({ data });

    res.json(successResponse('Billing settings updated', settings));
  } catch (err) {
    next(err);
  }
};

// ==================== System Settings ====================
export const getSystemSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await prisma.systemSettings.findMany();
    
    // Convert to key-value object
    const settingsObj = settings.reduce<Record<string, any>>((acc, setting) => {
      let value: any = setting.settingValue;
      
      // Parse based on type
      if (setting.settingType === 'boolean') {
        value = value === 'true';
      } else if (setting.settingType === 'number') {
        value = parseFloat(value || '0');
      } else if (setting.settingType === 'json') {
        try {
          value = JSON.parse(value || '{}');
        } catch {
          value = {};
        }
      }
      
      acc[setting.settingKey] = value;
      return acc;
    }, {});

    res.json(successResponse('System settings retrieved', settingsObj));
  } catch (err) {
    next(err);
  }
};

export const updateSystemSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      res.status(400).json(errorResponse('Settings object is required'));
      return;
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      let settingValue = String(value);
      let settingType = 'string';
      
      if (typeof value === 'boolean') {
        settingType = 'boolean';
      } else if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'object') {
        settingType = 'json';
        settingValue = JSON.stringify(value);
      }

      await prisma.systemSettings.upsert({
        where: { settingKey: key },
        update: { settingValue, settingType },
        create: { settingKey: key, settingValue, settingType }
      });
    }

    res.json(successResponse('System settings updated'));
  } catch (err) {
    next(err);
  }
};

// ==================== Get All Settings ====================
export const getAllSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [clinic, schedule, rules, notifications, billing, systemSettings] = await Promise.all([
      prisma.clinicSettings.findFirst(),
      prisma.doctorSchedule.findFirst(),
      prisma.appointmentRules.findFirst(),
      prisma.notificationSettings.findFirst(),
      prisma.billingSettings.findFirst(),
      prisma.systemSettings.findMany()
    ]);

    // Convert system settings to object
    const system = systemSettings.reduce<Record<string, any>>((acc, setting) => {
      let value: any = setting.settingValue;
      if (setting.settingType === 'boolean') value = value === 'true';
      else if (setting.settingType === 'number') value = parseFloat(value || '0');
      else if (setting.settingType === 'json') {
        try { value = JSON.parse(value || '{}'); } catch { value = {}; }
      }
      acc[setting.settingKey] = value;
      return acc;
    }, {});

    const allSettings = {
      clinic: clinic || {},
      schedule: schedule || {},
      rules: rules || {},
      notifications: notifications || {},
      billing: billing || {},
      system
    };

    res.json(successResponse('All settings retrieved', allSettings));
  } catch (err) {
    next(err);
  }
};