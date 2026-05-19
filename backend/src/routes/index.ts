import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import paymentRoutes from './payments';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use(paymentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
