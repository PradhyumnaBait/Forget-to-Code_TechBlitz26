import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/environment';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import apiRoutes from './routes';

export function createApp() {
  const app = express();

  // ─── Security ───
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ─── Body parsing ───
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Rate limiting ───
  app.use('/api', generalLimiter);

  // ─── Health check ───
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: '🏥 MedDesk API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // ─── API Routes ───
  app.use('/api', apiRoutes);

  // ─── 404 / Error handling ───
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
