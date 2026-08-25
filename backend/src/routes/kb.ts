import { Router, Request, Response, NextFunction } from 'express';
import { guidanceService } from '../kb/guidanceService';
import { AppError } from '../middleware/errorHandler';

export function createKnowledgeBaseRouter(): Router {
  const router = Router();

  /**
   * GET /api/v1/kb/playbooks
   * Returns all available verified fraud playbooks.
   */
  router.get('/playbooks', (_req: Request, res: Response) => {
    const playbooks = guidanceService.getPlaybooks();
    res.status(200).json({
      playbooks,
      count: Object.keys(playbooks).length,
    });
  });

  /**
   * GET /api/v1/kb/playbooks/:id
   * Returns a specific fraud playbook.
   */
  router.get('/playbooks/:id', (req: Request, res: Response, next: NextFunction) => {
    const id = String(req.params.id);
    const playbook = guidanceService.getPlaybook(id);

    if (!playbook) {
      return next(new AppError(`Playbook with ID '${id}' not found`, 404, 'PLAYBOOK_NOT_FOUND'));
    }

    res.status(200).json({
      playbookId: id,
      playbook,
    });
  });

  /**
   * GET /api/v1/kb/contacts
   * Returns verified emergency contact records and helplines.
   */
  router.get('/contacts', (_req: Request, res: Response) => {
    const contacts = guidanceService.getContacts();
    res.status(200).json({
      contacts,
    });
  });

  /**
   * GET /api/v1/kb/all
   * Returns the entire loaded knowledge base data structure.
   */
  router.get('/all', (_req: Request, res: Response) => {
    const kbData = guidanceService.getKnowledgeBaseData();
    res.status(200).json({
      knowledgeBase: kbData,
    });
  });

  return router;
}
