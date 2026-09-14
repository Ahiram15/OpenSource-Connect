import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface DigestIssue {
  title: string;
  repository: string;
  url: string;
  matchScore: number;
  difficulty: string;
  labels: string[];
}

/**
 * Creates and returns a configured nodemailer transporter
 */
const createTransporter = () => {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: {
        user: user || '',
        pass: pass || ''
      }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: user || '',
      pass: pass || ''
    }
  });
};

/**
 * Checks whether SMTP credentials are fully configured
 */
export const isSmtpConfigured = (): boolean => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(user && pass && user.trim() !== '' && pass.trim() !== '');
};

/**
 * Sends a generic email using configured transporter
 */
export const sendMail = async (options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string; preview?: boolean }> => {
  const from = process.env.SMTP_FROM || `"OpenSource Connect" <${process.env.SMTP_USER || 'no-reply@opensourceconnect.dev'}>`;

  if (!isSmtpConfigured()) {
    console.warn('[EmailService] SMTP credentials not fully configured in .env. Simulating email dispatch:');
    console.log(`To: ${options.to} | Subject: ${options.subject}`);
    return {
      success: true,
      preview: true,
      messageId: `simulated-${Date.now()}`
    };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    });

    console.log(`[EmailService] Email dispatched successfully to ${options.to} (Message ID: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error('[EmailService Error]:', err.message || err);
    return {
      success: false,
      error: err.message || 'Failed to send email via SMTP transporter'
    };
  }
};

/**
 * Sends an instant Test Verification Email
 */
export const sendTestEmail = async (toEmail: string, username: string = 'Developer'): Promise<{ success: boolean; error?: string; preview?: boolean }> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02050E; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #0b1528; border: 1px solid rgba(0, 106, 103, 0.4); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .badge { display: inline-block; background: rgba(0, 106, 103, 0.35); border: 1px solid rgba(255, 244, 183, 0.4); color: #FFF4B7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
      h1 { color: #ffffff; font-size: 24px; margin-top: 0; font-weight: 800; }
      p { color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .btn { display: inline-block; background: linear-gradient(135deg, #006A67 0%, #004B49 100%); color: #FFF4B7 !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; }
      .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="badge">SMTP VERIFIED • OPENSOURCE CONNECT</div>
      <h1>👋 Hello, ${username}!</h1>
      <p>This is a test notification confirming that your <strong>OpenSource Connect SMTP email service</strong> is configured and operational.</p>
      <p>You will now receive notifications for:</p>
      <ul>
        <li>📬 <strong>Weekly Matched Issue Digests</strong> tailored to your programming skills</li>
        <li>🎉 <strong>Pull Request Merge Celebrations</strong> and badge unlocks</li>
        <li>⚡ <strong>Repository Momentum & Contribution Streaks</strong></li>
      </ul>
      <a href="http://localhost:5173/dashboard" class="btn">Go to Developer Dashboard ➔</a>
      <div class="footer">
        OpenSource Connect • AI Contributor Intelligence & Open-Source Match Platform
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject: `🚀 [OpenSource Connect] SMTP Verification & Welcome Email for @${username}`,
    html
  });
};

/**
 * Sends a Weekly / Daily Issue Recommendation Digest Email
 */
export const sendIssueDigestEmail = async (
  toEmail: string,
  username: string,
  issues: DigestIssue[]
): Promise<{ success: boolean; error?: string; preview?: boolean }> => {
  const issueCardsHtml = issues.map((issue) => `
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(0, 106, 103, 0.35); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 700; color: #38bdf8; font-family: monospace;">${issue.repository}</span>
        <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px;">${issue.matchScore}% MATCH</span>
      </div>
      <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
        ${issue.title}
      </div>
      <div style="margin-bottom: 12px;">
        ${(issue.labels || []).slice(0, 3).map(l => `<span style="display: inline-block; background: rgba(255, 255, 255, 0.08); color: #cbd5e1; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${l}</span>`).join('')}
      </div>
      <a href="${issue.url}" style="display: inline-block; background: rgba(255, 244, 183, 0.15); border: 1px solid rgba(255, 244, 183, 0.3); color: #FFF4B7; text-decoration: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;">
        Explore in Solution Lab ➔
      </a>
    </div>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02050E; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 600px; margin: 0 auto; background: #0b1528; border: 1px solid rgba(0, 106, 103, 0.4); border-radius: 16px; padding: 32px; }
      .badge { display: inline-block; background: rgba(0, 106, 103, 0.35); border: 1px solid rgba(255, 244, 183, 0.4); color: #FFF4B7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
      h1 { color: #ffffff; font-size: 22px; margin-top: 0; font-weight: 800; }
      p { color: #cbd5e1; font-size: 14px; line-height: 1.5; }
      .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="badge">WEEKLY ISSUE DIGEST • CURATED FOR YOU</div>
      <h1>🌟 Fresh Open-Source Issues for @${username}</h1>
      <p>Here are high-signal, beginner-friendly GitHub issues matched to your skill profile with 80%+ compatibility:</p>
      ${issueCardsHtml}
      <div style="text-align: center; margin-top: 24px;">
        <a href="http://localhost:5173/issues" style="display: inline-block; background: linear-gradient(135deg, #006A67 0%, #004B49 100%); color: #FFF4B7; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
          View All Matched Issues on OpenSource Connect ➔
        </a>
      </div>
      <div class="footer">
        You are receiving this digest because email notifications are enabled on your OpenSource Connect profile.
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject: `📬 [Issue Digest] ${issues.length} Curated Good First Issues for @${username}`,
    html
  });
};

/**
 * Sends a PR Merged Celebration Email
 */
export const sendPRMergedEmail = async (
  toEmail: string,
  username: string,
  repoName: string,
  prTitle: string,
  prUrl: string
): Promise<{ success: boolean; error?: string; preview?: boolean }> => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02050E; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #0b1528; border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 16px; padding: 32px; }
      .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); color: #34d399; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
      h1 { color: #ffffff; font-size: 24px; margin-top: 0; font-weight: 800; }
      p { color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px; margin: 20px 0; }
      .btn { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="badge">🎉 PULL REQUEST MERGED • BADGE UNLOCKED</div>
      <h1>Congratulations @${username}!</h1>
      <p>Your Pull Request in <strong>${repoName}</strong> has been officially accepted and merged into the main branch!</p>
      <div class="card">
        <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">REPOSITORY: ${repoName}</div>
        <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${prTitle}</div>
      </div>
      <p>Your OpenSource Connect contribution status and developer portfolio PDF have been updated with this verified proof of work.</p>
      <a href="${prUrl}" class="btn">View Merged PR on GitHub ➔</a>
      <div style="margin-top: 24px;">
        <a href="http://localhost:5173/dashboard" style="color: #FFF4B7; font-size: 13px; text-decoration: underline;">
          View Updated Dashboard & Export PDF
        </a>
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject: `🎉 [PR Merged] Congratulations! Your PR on ${repoName} was merged!`,
    html
  });
};

/**
 * Forwards Contact & Feedback messages to the administrator/maintainer
 */
export const sendFeedbackEmail = async (
  fromName: string,
  fromEmail: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string; preview?: boolean }> => {
  const adminEmail = process.env.SMTP_USER || 'admin@opensourceconnect.dev';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02050E; color: #f8fafc; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #0b1528; border: 1px solid rgba(0, 106, 103, 0.4); border-radius: 16px; padding: 32px; }
      .badge { display: inline-block; background: rgba(0, 106, 103, 0.35); border: 1px solid rgba(255, 244, 183, 0.4); color: #FFF4B7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
      h1 { color: #ffffff; font-size: 20px; margin-top: 0; font-weight: 800; }
      .card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 106, 103, 0.3); border-radius: 12px; padding: 18px; margin: 20px 0; color: #f8fafc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="badge">USER FEEDBACK & SUPPORT MESSAGE</div>
      <h1>Message from: ${fromName} &lt;${fromEmail}&gt;</h1>
      <p><strong>Subject:</strong> ${subject}</p>
      <div class="card">${message}</div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: adminEmail,
    subject: `💬 [Feedback] ${subject} (from ${fromName})`,
    html
  });
};
