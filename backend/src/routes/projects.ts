import { Router } from 'express';
import { projectController } from '../controllers';
import { collaboratorController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// Projects CRUD
router.post('/', requireAuth, projectController.create);
router.get('/', requireAuth, projectController.list);
router.get('/:id', requireAuth, projectController.getById);
router.put('/:id', requireAuth, projectController.update);
router.delete('/:id', requireAuth, projectController.remove);

// Collaborators (nested)
router.post('/:projectId/collaborators', requireAuth, collaboratorController.add);
router.get('/:projectId/collaborators', requireAuth, collaboratorController.list);
router.put('/:projectId/collaborators/:collabId', requireAuth, collaboratorController.update);
router.delete('/:projectId/collaborators/:collabId', requireAuth, collaboratorController.remove);

export default router;
