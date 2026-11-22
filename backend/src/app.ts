import express, { Express } from 'express';
import { corsMiddleware } from './middleware/cors';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
