import { Router, Request, Response } from 'express';
import { AppConfig } from '../config';
import { createIncidentRouter } from './incident';
import { createKnowledgeBaseRouter } from './kb';

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
        incident: {
          intake: 'POST /api/v1/incident/intake',
          current: 'GET /api/v1/incident/current',
          guidance: 'GET /api/v1/incident/guidance',
          artifacts: 'GET /api/v1/incident/artifacts',
          reset: 'POST /api/v1/incident/reset',
        },
        knowledgeBase: {
          playbooks: 'GET /api/v1/kb/playbooks',
          contacts: 'GET /api/v1/kb/contacts',
          all: 'GET /api/v1/kb/all',
        },
      },
    });
  });

  router.use('/incident', createIncidentRouter());
  router.use('/kb', createKnowledgeBaseRouter());

  return router;
}
