import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authenticateJwt, getUserProfile);
router.put('/profile', authenticateJwt, updateUserProfile);

export default router;
