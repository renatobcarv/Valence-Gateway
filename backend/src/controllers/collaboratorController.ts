import { Response, NextFunction } from 'express';
import { collaboratorService } from '../services';
import { addCollaboratorSchema, updateCollaboratorSchema } from '../utils/validators';
import type { AuthRequest } from '../types';

export const collaboratorController = {
  async add(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { projectId } = req.params as { projectId: string };
      const body = addCollaboratorSchema.parse(req.body);
      const collab = await collaboratorService.add(projectId, userId, body);
      res.status(201).json(collab);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { projectId } = req.params as { projectId: string };
      const result = await collaboratorService.list(projectId, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { projectId, collabId } = req.params as { projectId: string; collabId: string };
      const body = updateCollaboratorSchema.parse(req.body);
      const collab = await collaboratorService.update(projectId, collabId, userId, body);
      res.json(collab);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { projectId, collabId } = req.params as { projectId: string; collabId: string };
      await collaboratorService.remove(projectId, collabId, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
