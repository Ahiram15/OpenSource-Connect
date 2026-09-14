import { Router } from 'express';
import {
  getSmtpStatus,
  sendTestEmailController,
  sendDigestEmailController,
  sendPRMergedEmailController,
  sendFeedbackController
} from '../controllers/emailController';

const router = Router();

router.get('/status', getSmtpStatus);
router.post('/test', sendTestEmailController);
router.post('/digest', sendDigestEmailController);
router.post('/pr-merged', sendPRMergedEmailController);
router.post('/feedback', sendFeedbackController);

export default router;
