import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { consultationService } from '../services/consultationService';
import { z } from 'zod';

const notesSchema = z.object({
  appointmentId: z.string(),
  patientId: z.string(),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  advice: z.string().optional(),
  treatmentPlan: z.string().optional(),
});

export const startConsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { appointmentId } = req.body;
    const consultation = await consultationService.startConsultation(appointmentId);
    res.status(201).json(successResponse('Consultation started', consultation));
  } catch (err) {
    next(err);
  }
};

export const saveNotes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = notesSchema.parse(req.body);
    const consultation = await consultationService.saveNotes(data);
    res.json(successResponse('Notes saved', consultation));
  } catch (err) {
    next(err);
  }
};

export const getConsultationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const consultation = await consultationService.getConsultationById(req.params['id']!);
    if (!consultation) {
      res.status(404).json(errorResponse('Consultation not found'));
      return;
    }
    res.json(successResponse('Consultation retrieved', consultation));
  } catch (err) {
    next(err);
  }
};

export const getPatientHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const history = await consultationService.getPatientHistory(req.params['patientId']!);
    res.json(successResponse('Patient history', { history, count: history.length }));
  } catch (err) {
    next(err);
  }
};
