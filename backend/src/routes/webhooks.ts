import { Router } from 'express';
import { webhookController } from '../controllers';

const router = Router();

// express.raw() já está aplicado no server.ts antes desta rota
router.post('/', webhookController.stripe);

export default router;
