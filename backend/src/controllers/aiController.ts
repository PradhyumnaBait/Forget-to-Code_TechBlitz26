import { Response, NextFunction } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { aiService } from '../services/aiService';
import { z } from 'zod';

export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, history } = z
      .object({
        message: z.string().min(1),
        history: z
          .array(
            z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
            })
          )
          .optional(),
      })
      .parse(req.body);

    const reply = await aiService.chat(message, history);
    res.json(successResponse('AI response', { reply, message }));
  } catch (err) {
    next(err);
  }
};

export const detectIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message } = z.object({ message: z.string().min(1) }).parse(req.body);
    const intent = await aiService.detectIntent(message);
    res.json(successResponse('Intent detected', intent));
  } catch (err) {
    next(err);
  }
};
