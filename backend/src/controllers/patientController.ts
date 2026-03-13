import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import prisma from '../config/database';
import { z } from 'zod';

export const listPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' as const } },
            { phone: { contains: search as string } },
          ],
        }
      : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.patient.count({ where }),
    ]);

    res.json(successResponse('Patients retrieved', { patients, total, page: Number(page) }));
  } catch (err) {
    next(err);
  }
};

export const getPatientById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params['id']! },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
          include: { consultation: true, billing: true },
        },
      },
    });

    if (!patient) {
      res.status(404).json(errorResponse('Patient not found'));
      return;
    }

    res.json(successResponse('Patient retrieved', patient));
  } catch (err) {
    next(err);
  }
};

export const createPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      phone: z.string().min(10).max(15),
      email: z.string().email().optional(),
      age: z.number().int().positive().optional(),
      gender: z.string().optional(),
      bloodGroup: z.string().optional(),
      medicalHistory: z.string().optional(),
      allergies: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const patient = await prisma.patient.upsert({
      where: { phone: data.phone },
      update: data,
      create: data,
    });

    res.status(201).json(successResponse('Patient created', patient));
  } catch (err) {
    next(err);
  }
};

export const updatePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      age: z.number().int().positive().optional(),
      gender: z.string().optional(),
      bloodGroup: z.string().optional(),
      medicalHistory: z.string().optional(),
      allergies: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params['id']! },
      data,
    });
    res.json(successResponse('Patient updated', patient));
  } catch (err) {
    next(err);
  }
};

export const searchPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, name } = req.query;
    if (!phone && !name) {
      res.status(400).json(errorResponse('Provide phone or name to search'));
      return;
    }

    const where: Record<string, unknown> = {};
    if (phone) where['phone'] = { contains: phone as string };
    if (name) where['name'] = { contains: name as string, mode: 'insensitive' };

    const patients = await prisma.patient.findMany({
      where,
      take: 10,
    });
    res.json(successResponse('Search results', { patients }));
  } catch (err) {
    next(err);
  }
};

export const deletePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json(errorResponse('Patient ID required'));
      return;
    }
    await prisma.patient.delete({ where: { id } });
    res.json(successResponse('Patient record deleted'));
  } catch (err: unknown) {
    if (err instanceof Error && err.message?.includes('Record to delete does not exist')) {
      res.status(404).json(errorResponse('Patient not found'));
      return;
    }
    next(err);
  }
};

