import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppConfig } from '../config';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
}

export function createErrorHandler(config: AppConfig): ErrorRequestHandler {
  return (err: any, _req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : typeof err.status === 'number' ? err.status : 500;
    const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

    // Safe error message for production 500 errors
    const message =
      config.isProduction && statusCode >= 500
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Unknown error';

    const responsePayload: {
      error: {
        code: string;
        message: string;
        details?: unknown;
        stack?: string;
      };
    } = {
      error: {
        code: errorCode,
        message,
      },
    };

    if (!config.isProduction) {
      if (err.details) {
        responsePayload.error.details = err.details;
      }
      if (err.stack) {
        responsePayload.error.stack = err.stack;
      }
    }

    res.status(statusCode).json(responsePayload);
  };
}
