import { Router, Request, Response } from 'express';
import { AppConfig } from '../config';

export function createHealthRouter(config: AppConfig): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '0.1.0',
    });
  });

  return router;
}
