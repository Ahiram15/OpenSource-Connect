import { Router } from 'express';
import { getRecommendations, toggleBookmark, getPRStarter } from '../controllers/issueController';

const router = Router();

router.get('/recommendations', getRecommendations);
router.post('/:id/bookmark', toggleBookmark);
router.post('/pr-starter', getPRStarter);

export default router;
