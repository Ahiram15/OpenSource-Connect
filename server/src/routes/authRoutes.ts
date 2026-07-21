import { Router } from 'express';
import { githubLogin, githubCallback, getMe, debugAuth } from '../controllers/authController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.get('/debug', debugAuth);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', authenticateJwt, getMe);

export default router;
