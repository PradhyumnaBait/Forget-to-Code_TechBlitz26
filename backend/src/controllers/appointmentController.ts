import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { bookingService } from '../services/bookingService';

export const listAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, status, patientId, page, limit } = req.query;
    const result = await bookingService.listAppointments({
      date: date as string,
      status: status as string,
      patientId: patientId as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(successResponse('Appointments retrieved', result));
  } catch (err) {
    next(err);
  }
};

export const getTodayAppointments = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointments = await bookingService.getTodayAppointments();
    res.json(successResponse('Today\'s appointments', { appointments, count: appointments.length }));
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await bookingService.getAppointmentById(req.params['id']!);
    if (!appointment) {
      res.status(404).json(errorResponse('Appointment not found'));
      return;
    }
    res.json(successResponse('Appointment retrieved', appointment));
  } catch (err) {
    next(err);
  }
};
