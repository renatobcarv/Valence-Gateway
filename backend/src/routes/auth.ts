import { Router } from 'express';
import { authController } from '../controllers';
import { requireAuth } from '../middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/password', requireAuth, authController.changePassword);

export default router;
