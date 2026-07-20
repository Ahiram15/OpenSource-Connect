import { Router } from 'express';
import { githubLogin, githubCallback, getMe } from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', authenticateJwt, getMe);

export default router;
