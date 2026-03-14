import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { bookingService } from '../services/bookingService';
import { slotService } from '../services/slotService';
import prisma from '../config/database';
import { z } from 'zod';

// Public endpoint for booking flow - returns consultation fee & clinic name
export const getClinicInfo = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await prisma.clinicSettings.findFirst();
    res.json(
      successResponse('Clinic info', {
        consultationFee: settings ? Number(settings.consultationFee) : 500,
        clinicName: settings?.clinicName ?? 'MedDesk Clinic',
      })
    );
  } catch (err) {
    next(err);
  }
};

const createAppointmentSchema = z.object({
  patientName: z.string().min(2),
  patientPhone: z.string().min(10).max(15),
  patientEmail: z.string().email().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional(),
});

export const getAvailableDates = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dates = await slotService.getAvailableDates(14);
    res.json(successResponse('Available dates', { dates }));
  } catch (err) {
    next(err);
  }
};

export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const date = req.query['date'] as string;
    if (!date) {
      res.status(400).json(errorResponse('date query param required (YYYY-MM-DD)'));
      return;
    }

    const slots = await slotService.getAvailableSlots(date);
    // Return both field names for frontend compatibility
    res.json(successResponse('Available slots', { date, slots, availableSlots: slots }));
  } catch (err) {
    next(err);
  }
};


export const reserveSlot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, timeSlot } = z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .parse(req.body);

    const ok = await slotService.reserveSlot(date, timeSlot);
    if (!ok) {
      res.status(409).json(errorResponse('Slot not available'));
      return;
    }

    res.json(
      successResponse('Slot reserved for 5 minutes', {
        date,
        timeSlot,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })
    );
  } catch (err) {
    next(err);
  }
};

export const createAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, timeSlot, symptoms, paymentMethod, reason,
            patientName, patientPhone, patientEmail } = req.body as Record<string, string>;

    if (!date || !timeSlot) {
      res.status(400).json(errorResponse('date and timeSlot are required'));
      return;
    }

    // Prefer JWT patient, fall back to body fields
    let finalPatientName  = patientName  ?? '';
    let finalPatientPhone = patientPhone ?? '';
    let finalPatientEmail = patientEmail;

    if (req.patient) {
      finalPatientName  = req.patient.name  ?? finalPatientName;
      finalPatientPhone = req.patient.phone ?? finalPatientPhone;
    }

    if (!finalPatientName || !finalPatientPhone) {
      res.status(400).json(errorResponse('Patient name and phone are required'));
      return;
    }

    const appointment = await bookingService.createAppointment({
      patientName:  finalPatientName,
      patientPhone: finalPatientPhone,
      patientEmail: finalPatientEmail,
      date,
      timeSlot,
      reason: symptoms ?? reason,
    });

    res.status(201).json(successResponse('Appointment booked successfully', appointment));
  } catch (err: unknown) {
    if (err instanceof Error && err.message?.includes('Unique constraint')) {
      res.status(409).json(errorResponse('This time slot is already booked'));
      return;
    }
    next(err);
  }
};


export const cancelAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const appointment = await bookingService.cancelAppointment(id, reason);
    res.json(successResponse('Appointment cancelled', appointment));
  } catch (err) {
    next(err);
  }
};

export const rescheduleAppointment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .parse(req.body);

    const appointment = await bookingService.rescheduleAppointment(id, date, timeSlot);
    res.json(successResponse('Appointment rescheduled', appointment));
  } catch (err) {
    next(err);
  }
};
