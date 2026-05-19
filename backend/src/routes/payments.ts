import { Router } from 'express';
import { paymentController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

// Endpoint público — qualquer pessoa pode pagar
router.post('/projects/:projectId/create-payment', paymentController.createPayment);

// Listagem requer auth
router.get('/payments', requireAuth, paymentController.listPayments);

export default router;
