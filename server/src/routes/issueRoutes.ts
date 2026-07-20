import { Router } from 'express';
import { getRecommendations, toggleBookmark } from '../controllers/issueController';

const router = Router();

router.get('/recommendations', getRecommendations);
router.post('/:id/bookmark', toggleBookmark);

export default router;
