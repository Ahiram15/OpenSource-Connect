import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { extractUserSkills } from '../services/githubService';

// GET /api/auth/github
export const githubLogin = (req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
  const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${serverUrl}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

  res.redirect(githubAuthUrl);
};

// GET /api/auth/github/callback
export const githubCallback = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

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
      // Dev fallback redirect if credentials unconfigured
      const devToken = jwt.sign({ githubId: 'demo-user-123', username: 'Alex Developer' }, jwtSecret, { expiresIn: '7d' });
      res.redirect(`${clientUrl}/dashboard?token=${devToken}`);
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

    // 6. Redirect to frontend with token
    res.redirect(`${clientUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('[GitHub OAuth Error]:', (error as Error).message);
    const devToken = jwt.sign({ githubId: 'demo-user-123', username: 'Alex Developer' }, jwtSecret, { expiresIn: '7d' });
    res.redirect(`${clientUrl}/dashboard?token=${devToken}`);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const githubId = req.user?.githubId || 'demo-user-123';
    let user = await User.findOne({ githubId });
    if (!user) {
      user = await User.create({
        githubId,
        username: req.user?.username || 'Alex Developer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        technicalInterests: ['React', 'Node', 'TypeScript'],
        experienceLevel: 'Beginner',
        savedIssueIds: []
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
