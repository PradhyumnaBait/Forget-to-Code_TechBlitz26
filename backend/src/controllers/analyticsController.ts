import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { analyticsService } from '../services/analyticsService';

export const getDailyStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await analyticsService.getDailyStats(req.query['date'] as string | undefined);
    res.json(successResponse('Daily statistics', stats));
  } catch (err) {
    next(err);
  }
};

export const getMonthlyRevenue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { year, month } = req.query;
    const stats = await analyticsService.getMonthlyRevenue(
      year ? Number(year) : undefined,
      month ? Number(month) - 1 : undefined
    );
    res.json(successResponse('Monthly revenue', stats));
  } catch (err) {
    next(err);
  }
};

export const getPeakHours = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await analyticsService.getPeakHours();
    res.json(successResponse('Peak hours', data));
  } catch (err) {
    next(err);
  }
};

export const getNoShowRate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = req.query['days'] ? Number(req.query['days']) : 30;
    const data = await analyticsService.getNoShowRate(days);
    res.json(successResponse('No-show rate', data));
  } catch (err) {
    next(err);
  }
};
