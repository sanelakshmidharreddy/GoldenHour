import { Router, Request, Response, NextFunction } from 'express';
import { incidentService } from '../incident/incidentService';
import { IncidentIntakeSchema } from '../incident/schema';
import { guidanceService } from '../kb/guidanceService';
import { AppError } from '../middleware/errorHandler';

export function createIncidentRouter(): Router {
  const router = Router();

  // Helper to resolve session ID
  const getSessionId = (req: Request): string => {
    return req.session?.id || 'default_session';
  };

  /**
   * POST /api/v1/incident/intake
   * Submits or updates incident information with Zod validation.
   */
  router.post('/intake', (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = IncidentIntakeSchema.safeParse(req.body);
      if (!parseResult.success) {
        const issues = parseResult.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        throw new AppError('Validation failed for incident intake', 400, 'VALIDATION_ERROR', { issues });
      }

      const sessionId = getSessionId(req);
      const updatedIncident = incidentService.updateIncident(sessionId, parseResult.data);
      const goldenHour = incidentService.assessGoldenHour(updatedIncident);

      res.status(200).json({
        incident: updatedIncident,
        goldenHour,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/v1/incident/current
   * Returns current active incident state and Golden Hour urgency assessment.
   */
  router.get('/current', (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const incident = incidentService.getOrCreateIncident(sessionId);
    const goldenHour = incidentService.assessGoldenHour(incident);

    res.status(200).json({
      incident,
      goldenHour,
    });
  });

  /**
   * GET /api/v1/incident/guidance
   * Returns tailored immediate action steps and helpline contacts based on the incident.
   */
  router.get('/guidance', (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const incident = incidentService.getOrCreateIncident(sessionId);
    const guidance = guidanceService.getGuidanceForIncident(incident);

    res.status(200).json({
      guidance,
    });
  });

  /**
   * GET /api/v1/incident/artifacts
   * Returns generated FIR complaint draft, 1930 helpline script, and NCRP payload.
   */
  router.get('/artifacts', (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    const artifacts = incidentService.getArtifacts(sessionId);

    res.status(200).json({
      artifacts,
    });
  });

  /**
   * POST /api/v1/incident/reset
   * Resets active incident for the current session.
   */
  router.post('/reset', (req: Request, res: Response) => {
    const sessionId = getSessionId(req);
    incidentService.clear(sessionId);

    res.status(200).json({
      status: 'reset_successful',
      message: 'Active incident session cleared.',
    });
  });

  return router;
}
