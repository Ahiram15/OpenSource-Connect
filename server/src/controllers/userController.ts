import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';

const memoryUser = {
  githubId: 'demo-user-123',
  username: 'Alex Developer',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  technicalInterests: ['React', 'Node', 'TypeScript'],
  experienceLevel: 'Beginner',
  savedIssueIds: ['issue-101']
};

// GET /api/user/profile
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ githubId: 'demo-user-123' });
      if (!user) {
        user = await User.create(memoryUser);
      }
      res.status(200).json(user);
    } else {
      res.status(200).json(memoryUser);
    }
  } catch (error) {
    res.status(200).json(memoryUser);
  }
};

// PUT /api/user/profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { technicalInterests, experienceLevel } = req.body;
    if (technicalInterests) memoryUser.technicalInterests = technicalInterests;
    if (experienceLevel) memoryUser.experienceLevel = experienceLevel;

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOneAndUpdate(
        { githubId: 'demo-user-123' },
        { technicalInterests, experienceLevel },
        { new: true, upsert: true }
      );
      res.status(200).json(user);
    } else {
      res.status(200).json(memoryUser);
    }
  } catch (error) {
    res.status(200).json(memoryUser);
  }
};
