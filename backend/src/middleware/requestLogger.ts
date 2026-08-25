import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppConfig } from '../config';

export function createRequestLogger(config: AppConfig): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (config.isTest) {
      return next();
    }

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`;
      
      if (res.statusCode >= 500) {
        console.error(logMessage);
      } else if (res.statusCode >= 400) {
        console.warn(logMessage);
      } else {
        console.log(logMessage);
      }
    });

    next();
  };
}
