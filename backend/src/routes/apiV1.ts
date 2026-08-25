import { Router, Request, Response } from 'express';
import { AppConfig } from '../config';

export function createApiV1Router(config: AppConfig): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'GoldenHour API',
      version: 'v1',
      status: 'active',
      environment: config.nodeEnv,
      endpoints: {
        health: '/health',
        apiV1: '/api/v1',
      },
    });
  });

  return router;
}
