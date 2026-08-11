import { Router } from 'express';
import { getRecommendations, toggleBookmark, getPRStarter, chatAboutIssue } from '../controllers/issueController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.get('/recommendations', getRecommendations);
router.post('/:id/bookmark', toggleBookmark);
router.post('/pr-starter', getPRStarter);
router.post('/:id/chat', authenticateJwt, chatAboutIssue);

export default router;
