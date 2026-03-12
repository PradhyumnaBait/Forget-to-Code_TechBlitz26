import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { otpService } from '../services/otpService';
import { z } from 'zod';
import prisma from '../config/database';

const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

export const sendOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const result = await otpService.sendOTP(phone);

    if (!result.success) {
      res.status(400).json(errorResponse(result.message));
      return;
    }

    res.json(successResponse(result.message));
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const result = await otpService.verifyOTP(phone, otp);

    if (!result.success) {
      res.status(400).json(errorResponse(result.message));
      return;
    }

    res.json(successResponse(result.message, { token: result.token, patientId: result.patientId }));
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.userId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    if (!patient) {
      res.status(404).json(errorResponse('Patient not found'));
      return;
    }

    res.json(successResponse('Profile retrieved', patient));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      age: z.number().int().min(1).max(120).optional(),
      gender: z.string().optional(),
      bloodGroup: z.string().optional(),
      medicalHistory: z.string().optional(),
      allergies: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.userId },
      data,
    });

    res.json(successResponse('Profile updated', patient));
  } catch (err) {
    next(err);
  }
};
