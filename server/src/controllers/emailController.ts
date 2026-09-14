import { Request, Response } from 'express';
import {
  isSmtpConfigured,
  sendTestEmail,
  sendIssueDigestEmail,
  sendPRMergedEmail,
  sendFeedbackEmail,
  DigestIssue
} from '../services/emailService';
import Issue from '../models/Issue';

/**
 * GET /api/email/status
 * Returns whether SMTP is configured on the backend
 */
export const getSmtpStatus = async (_req: Request, res: Response): Promise<void> => {
  const configured = isSmtpConfigured();
  res.json({
    configured,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || '587',
    service: process.env.SMTP_SERVICE || null,
    user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***@***` : null
  });
};

/**
 * POST /api/email/test
 * Sends an instant test email to the provided address
 */
export const sendTestEmailController = async (req: Request, res: Response): Promise<void> => {
  const { email, username } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required' });
    return;
  }

  try {
    const result = await sendTestEmail(email, username || 'Developer');
    if (!result.success) {
      res.status(500).json({ error: result.error || 'Failed to send test email' });
      return;
    }

    res.json({
      success: true,
      message: result.preview
        ? 'SMTP credentials not configured. Simulated email successfully!'
        : `Test email dispatched to ${email}`,
      preview: result.preview
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing test email' });
  }
};

/**
 * POST /api/email/digest
 * Compiles top matched issues and sends a curated digest
 */
export const sendDigestEmailController = async (req: Request, res: Response): Promise<void> => {
  const { email, username } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required' });
    return;
  }

  try {
    // Fetch top 3-5 issues from database or default curated list
    let issues = await Issue.find().limit(4).lean();
    
    let digestIssues: DigestIssue[] = [];
    if (issues && issues.length > 0) {
      digestIssues = issues.map((iss: any) => ({
        title: iss.title,
        repository: iss.repository,
        url: iss.url,
        matchScore: iss.matchScore || 85,
        difficulty: iss.difficulty || 'Beginner',
        labels: iss.labels || ['good first issue']
      }));
    } else {
      digestIssues = [
        {
          title: 'Card overlay invisible on touch devices',
          repository: 'kiinshuk/kinshow',
          url: 'https://github.com/kiinshuk/kinshow/issues/18',
          matchScore: 92,
          difficulty: 'Beginner',
          labels: ['enhancement', 'good first issue']
        },
        {
          title: 'Add clear button to search input',
          repository: 'kiinshuk/kinshow',
          url: 'https://github.com/kiinshuk/kinshow/issues/11',
          matchScore: 88,
          difficulty: 'Beginner',
          labels: ['ui', 'good first issue']
        },
        {
          title: 'Make genre chips scrollable on mobile',
          repository: 'kiinshuk/kinshow',
          url: 'https://github.com/kiinshuk/kinshow/issues/15',
          matchScore: 84,
          difficulty: 'Beginner',
          labels: ['css', 'good first issue']
        }
      ];
    }

    const result = await sendIssueDigestEmail(email, username || 'Developer', digestIssues);
    if (!result.success) {
      res.status(500).json({ error: result.error || 'Failed to send digest email' });
      return;
    }

    res.json({
      success: true,
      message: result.preview
        ? `Simulated issue digest sent to ${email} (SMTP not configured in .env)`
        : `Curated issue digest dispatched to ${email}`,
      preview: result.preview
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error dispatching digest email' });
  }
};

/**
 * POST /api/email/pr-merged
 * Sends celebration email when a PR is merged
 */
export const sendPRMergedEmailController = async (req: Request, res: Response): Promise<void> => {
  const { email, username, repoName, prTitle, prUrl } = req.body;

  if (!email || !repoName) {
    res.status(400).json({ error: 'Email and repoName are required' });
    return;
  }

  try {
    const result = await sendPRMergedEmail(
      email,
      username || 'Developer',
      repoName,
      prTitle || 'Open Source Contribution PR',
      prUrl || 'https://github.com'
    );

    if (!result.success) {
      res.status(500).json({ error: result.error || 'Failed to send PR merged email' });
      return;
    }

    res.json({
      success: true,
      message: `PR merge notification dispatched to ${email}`,
      preview: result.preview
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error dispatching PR merge email' });
  }
};

/**
 * POST /api/email/feedback
 * Forwards user feedback or support inquiries
 */
export const sendFeedbackController = async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, message } = req.body;

  if (!email || !message) {
    res.status(400).json({ error: 'Email and message content are required' });
    return;
  }

  try {
    const result = await sendFeedbackEmail(
      name || 'Anonymous Contributor',
      email,
      subject || 'General Inquiry / Feedback',
      message
    );

    if (!result.success) {
      res.status(500).json({ error: result.error || 'Failed to send feedback email' });
      return;
    }

    res.json({
      success: true,
      message: 'Feedback received and forwarded to OpenSource Connect maintainers!',
      preview: result.preview
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing feedback' });
  }
};
