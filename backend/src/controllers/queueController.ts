import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { queueService } from '../services/queueService';

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await queueService.checkIn(req.params['appointmentId']!);
    res.json(successResponse('Patient checked in', appointment));
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json(errorResponse(err.message));
      return;
    }
    next(err);
  }
};

export const getQueueStatus = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queue = await queueService.getCurrentQueue();
    res.json(successResponse('Queue status', queue));
  } catch (err) {
    next(err);
  }
};

export const getQueuePosition = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pos = await queueService.getQueuePosition(req.params['appointmentId']!);
    if (pos === null) {
      res.status(404).json(errorResponse('Appointment not in queue'));
      return;
    }
    res.json(successResponse('Queue position', { position: pos }));
  } catch (err) {
    next(err);
  }
};

export const nextInQueue = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queue = await queueService.getCurrentQueue();
    if (!queue.next) {
      res.json(successResponse('No more patients in queue', null));
      return;
    }
    const appointment = await queueService.startConsultation(queue.next.id);
    res.json(successResponse('Consultation started', appointment));
  } catch (err) {
    next(err);
  }
};

export const completeConsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await queueService.completeConsultation(req.params['appointmentId']!);
    res.json(successResponse('Consultation completed', appointment));
  } catch (err) {
    next(err);
  }
};

export const markNoShow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await queueService.markNoShow(req.params['appointmentId']!);
    res.json(successResponse('Marked as no-show', appointment));
  } catch (err) {
    next(err);
  }
};
