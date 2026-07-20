import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/user/profile — returns the authenticated user's real profile
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const githubId = req.user?.githubId;

    if (mongoose.connection.readyState === 1 && githubId) {
      const user = await User.findOne({ githubId });
      if (user) {
        res.status(200).json(user);
        return;
      }
    }

    // Dev / demo fallback — only used when not authenticated or DB is down
    res.status(200).json({
      githubId:         req.user?.githubId || 'demo-user-123',
      username:         req.user?.username || 'demo',
      displayName:      req.user?.username || 'Demo Developer',
      avatarUrl:        'https://avatars.githubusercontent.com/u/0',
      bio:              'Open-source enthusiast and full-stack developer.',
      location:         'San Francisco, CA',
      githubProfileUrl: 'https://github.com',
      publicRepos:      12,
      followers:        48,
      following:        23,
      technicalInterests: ['TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Express'],
      languageBreakdown:  { 'TypeScript': 45, 'React': 25, 'Node.js': 15, 'Python': 10, 'CSS': 5 },
      experienceLevel:    'Beginner',
      savedIssueIds:      ['issue-101'],
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT /api/user/profile — update skills, experience, display name
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const githubId = req.user?.githubId;
    const { technicalInterests, experienceLevel, displayName } = req.body;

    if (mongoose.connection.readyState === 1 && githubId) {
      const user = await User.findOneAndUpdate(
        { githubId },
        {
          ...(technicalInterests ? { technicalInterests } : {}),
          ...(experienceLevel    ? { experienceLevel }    : {}),
          ...(displayName        ? { displayName }        : {}),
        },
        { new: true, upsert: false }
      );
      if (user) {
        res.status(200).json(user);
        return;
      }
    }

    res.status(200).json({ technicalInterests, experienceLevel, displayName });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
