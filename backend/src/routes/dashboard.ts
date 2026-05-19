import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { requireAuth } from '../middleware';

const router = Router();

router.get('/earnings', requireAuth, dashboardController.earnings);
router.get('/transfers', requireAuth, dashboardController.transfers);
router.get('/revenue-chart', requireAuth, dashboardController.revenueChart);

export default router;
