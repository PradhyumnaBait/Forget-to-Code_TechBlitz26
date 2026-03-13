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

// Staff login — validates configured credentials and issues a JWT
export const staffLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, role } = z.object({
      username: z.string(),
      password: z.string(),
      role: z.enum(['doctor', 'reception']),
    }).parse(req.body);

    // Read credentials from env, fall back to demo defaults
    const validCredentials: Record<string, { user: string; pass: string }> = {
      doctor: {
        user: process.env['DOCTOR_USERNAME'] ?? 'doctor',
        pass: process.env['DOCTOR_PASSWORD'] ?? 'meddesk123',
      },
      reception: {
        user: process.env['RECEPTION_USERNAME'] ?? 'reception',
        pass: process.env['RECEPTION_PASSWORD'] ?? 'meddesk123',
      },
    };

    const creds = validCredentials[role];
    if (!creds || username !== creds.user || password !== creds.pass) {
      res.status(401).json(errorResponse('Invalid username or password'));
      return;
    }

    // Issue a JWT — userId = `staff:{role}` so it won't collide with patient IDs
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: `staff:${role}`, role },
      process.env['JWT_SECRET'] ?? 'meddesk-secret',
      { expiresIn: '12h' }
    );

    res.json(successResponse('Staff login successful', { token, role }));
  } catch (err) {
    next(err);
  }
};

