import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { AuthRequest, JWTPayload, UserRole } from '../types';
import prisma from '../config/database';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload & { role?: UserRole | string };
    req.userId = decoded.userId;
    if (decoded.role) {
      req.user = {
        id: decoded.userId,
        phone: '',
        name: '',
        role: decoded.role,
      };
    }

    // Populate req.patient if the userId maps to a patient
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, phone: true, age: true, gender: true },
      });
      if (patient) {
        req.patient = {
          ...patient,
          age: patient.age ?? undefined,
          gender: patient.gender ?? undefined,
        };
      }
    } catch { /* Non-critical — continue without patient context */ }

    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};


export const requireRole = (allowedRoles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.userId || !req.user?.role) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      next();
    } catch {
      res
        .status(500)
        .json({ success: false, message: 'Error checking permissions' });
    }
  };
};

// Optional auth — attaches userId if token is valid, but doesn't block if missing
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      req.userId = decoded.userId;
    }
  } catch {
    // Ignore token errors for optional auth
  }
  next();
};
