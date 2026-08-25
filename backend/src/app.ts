import path from 'path';
import fs from 'fs';
import express, { Express } from 'express';
import { AppConfig, config as defaultConfig } from './config';
import { createSecurityHeadersMiddleware, createCorsMiddleware, JSON_BODY_LIMIT, URLENCODED_BODY_LIMIT } from './security';
import { createSessionMiddleware } from './session';
import { createRequestLogger, notFoundHandler, createErrorHandler } from './middleware';
import { createHealthRouter, createApiV1Router } from './routes';

export interface CreateAppOptions {
  config?: Partial<AppConfig>;
  configureRoutes?: (app: Express) => void;
}

export function createApp(options?: Partial<AppConfig> | CreateAppOptions): Express {
  const customConfig = options && 'config' in options ? options.config : options as Partial<AppConfig> | undefined;
  const configureRoutes = options && 'configureRoutes' in options ? options.configureRoutes : undefined;

  const appConfig: AppConfig = {
    ...defaultConfig,
    ...customConfig,
  };

  const app: Express = express();

  // Trust first proxy in production (e.g., behind NGINX, Cloudflare, load balancer)
  if (appConfig.isProduction) {
    app.set('trust proxy', 1);
  }

  // Baseline Security Headers & CORS
  app.use(createSecurityHeadersMiddleware(appConfig));
  app.use(createCorsMiddleware(appConfig));

  // Request Body Parsers with safe size limits
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: URLENCODED_BODY_LIMIT }));

  // Session Foundation
  app.use(createSessionMiddleware(appConfig));

  // Structured Request Logger
  app.use(createRequestLogger(appConfig));

  // Application Routes
  app.use(createHealthRouter(appConfig));
  app.use('/api/v1', createApiV1Router(appConfig));

  // Static Frontend Serving
  const candidates = [
    path.resolve(process.cwd(), '../frontend/public'),
    path.resolve(process.cwd(), 'frontend/public'),
    path.resolve(__dirname, '../../../frontend/public'),
    path.resolve(__dirname, '../../frontend/public'),
  ];
  const frontendPublicDir = candidates.find((dir) => fs.existsSync(dir));

  if (frontendPublicDir) {
    app.use(express.static(frontendPublicDir, { extensions: ['html', 'js'] }));
    app.get('/', (_req, res) => {
      res.sendFile(path.join(frontendPublicDir, 'index.html'));
    });
  }

  // Optional custom test/plugin routes before 404 handler
  if (configureRoutes) {
    configureRoutes(app);
  }

  // 404 & Centralized Error Handling
  app.use(notFoundHandler);
  app.use(createErrorHandler(appConfig));

  return app;
}

export const app = createApp();
