import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { extractUserSkills } from '../services/githubService';

// GET /api/auth/github
export const githubLogin = (req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
  const host = req.get('host') || 'localhost:5000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const forwardedProto = req.headers['x-forwarded-proto'] as string;
  const protocol = forwardedProto || (isLocal ? 'http' : 'https');
  
  let serverUrl = process.env.SERVER_URL || `${protocol}://${host}`;
  if (!isLocal && serverUrl.startsWith('http://')) {
    serverUrl = serverUrl.replace('http://', 'https://');
  }
  const cleanServerUrl = serverUrl.replace(/\/$/, '');
  const redirectUri = `${cleanServerUrl}/api/auth/github/callback`;
  
  const forceRelogin = req.query.prompt || req.query.relogin;
  const promptParam = forceRelogin ? `&prompt=consent` : '';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email${promptParam}`;

  console.log(`[GitHub OAuth Redirect URI]: ${redirectUri}`);
  res.redirect(githubAuthUrl);
};

// GET /api/auth/debug
export const debugAuth = (req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'UNCONFIGURED';
  const host = req.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const forwardedProto = req.headers['x-forwarded-proto'] as string;
  const protocol = forwardedProto || (isLocal ? 'http' : 'https');
  let serverUrl = process.env.SERVER_URL || `${protocol}://${host}`;
  if (!isLocal && serverUrl.startsWith('http://')) {
    serverUrl = serverUrl.replace('http://', 'https://');
  }
  const cleanServerUrl = serverUrl.replace(/\/$/, '');
  const redirectUri = `${cleanServerUrl}/api/auth/github/callback`;

  res.status(200).json({
    status: 'OAuth Debug Info',
    githubClientIdConfigured: !!process.env.GITHUB_CLIENT_ID,
    clientIdPrefix: clientId.substring(0, 8) + '...',
    exactRedirectUriGenerated: redirectUri,
    serverUrlEnvVar: process.env.SERVER_URL || 'NOT_SET',
    detectedProtocol: protocol,
    detectedHost: host
  });
};

// GET /api/auth/github/callback
export const githubCallback = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
  
  const host = req.get('host') || 'localhost:5000';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const forwardedProto = req.headers['x-forwarded-proto'] as string;
  const protocol = forwardedProto || (isLocal ? 'http' : 'https');
  const defaultClientUrl = isLocal ? 'http://localhost:5173' : `${protocol}://${host}`;
  const clientUrl = (process.env.CLIENT_URL || process.env.SERVER_URL || defaultClientUrl).replace(/\/$/, '');

  if (!code) {
    res.status(400).redirect(`${clientUrl}/login?error=no_code`);
    return;
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      const errorMsg = tokenResponse.data.error_description || tokenResponse.data.error || 'Failed to obtain access token from GitHub';
      console.error('[GitHub OAuth Token Error]:', tokenResponse.data);
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errorMsg)}`);
      return;
    }

    // 2. Fetch GitHub user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userResponse.data;

    // 3. Extract User Skills automatically from Public Repositories
    const extracted = await extractUserSkills(githubUser.login, accessToken);

    // 4. Find or create user in MongoDB Atlas
    const profileData = {
      username:         githubUser.login,
      displayName:      githubUser.name || githubUser.login,
      avatarUrl:        githubUser.avatar_url || '',
      bio:              githubUser.bio || '',
      location:         githubUser.location || '',
      githubProfileUrl: githubUser.html_url || `https://github.com/${githubUser.login}`,
      publicRepos:      githubUser.public_repos || 0,
      followers:        githubUser.followers || 0,
      following:        githubUser.following || 0,
      technicalInterests: extracted.technicalInterests,
      languageBreakdown:  extracted.languageBreakdown,
      experienceLevel:    extracted.experienceLevel,
    };

    let user = await User.findOne({ githubId: githubUser.id.toString() });
    if (!user) {
      user = await User.create({
        githubId: githubUser.id.toString(),
        ...profileData,
        savedIssueIds: []
      });
    } else {
      Object.assign(user, profileData);
      await user.save();
    }

    // 5. Generate JWT Token
    const token = jwt.sign(
      { githubId: user.githubId, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 6. Redirect to frontend with real authenticated token
    res.redirect(`${clientUrl}/dashboard?token=${token}`);
  } catch (error) {
    const errMessage = (error as Error).message || 'OAuth authentication failed';
    console.error('[GitHub OAuth Exception]:', errMessage);
    res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errMessage)}`);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const githubId = req.user?.githubId;
    if (!githubId) {
      res.status(401).json({ error: 'Unauthorized: No valid session token provided' });
      return;
    }

    const user = await User.findOne({ githubId });
    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
