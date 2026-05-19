import { Response, NextFunction } from 'express';
import { projectService } from '../services';
import {
  createProjectSchema,
  updateProjectSchema,
  paginationSchema,
} from '../utils/validators';
import type { AuthRequest } from '../types';

export const projectController = {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const body = createProjectSchema.parse(req.body);
      const project = await projectService.create(userId, body.name, body.description);
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { limit, offset } = paginationSchema.parse(req.query);
      const result = await projectService.list(userId, limit, offset);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { id } = req.params as { id: string };
      const project = await projectService.getById(id, userId);
      res.json(project);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { id } = req.params as { id: string };
      const body = updateProjectSchema.parse(req.body);
      const project = await projectService.update(id, userId, body);
      res.json(project);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { id } = req.params as { id: string };
      await projectService.remove(id, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
