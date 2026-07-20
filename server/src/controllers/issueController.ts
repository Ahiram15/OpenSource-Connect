import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Issue from '../models/Issue';
import User from '../models/User';
import { fetchGitHubIssues } from '../services/githubService';
import { analyzeIssueWithGemini } from '../services/geminiService';

// GET /api/issues/recommendations
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const language = (req.query.language as string) || 'javascript';
    const label = (req.query.label as string) || 'good first issue';

    // Get user preferences
    let userInterests = ['React', 'Node'];
    let userExperience = 'Beginner';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ githubId: 'demo-user-123' });
      if (user) {
        userInterests = user.technicalInterests;
        userExperience = user.experienceLevel;
      }
    }

    // Fetch GitHub issues
    const rawIssues = await fetchGitHubIssues(language, label);

    // Process each issue through Gemini AI engine
    const processedIssues = await Promise.all(
      rawIssues.map(async (raw) => {
        const aiResult = await analyzeIssueWithGemini(raw.title, raw.body, userInterests, userExperience);
        
        return {
          id: raw.id,
          title: raw.title,
          repository: raw.repository,
          stars: raw.stars,
          labels: raw.labels,
          url: raw.url,
          matchScore: aiResult.matchScore,
          explanation: aiResult.explanation,
          difficulty: aiResult.difficulty,
          estimatedTime: aiResult.estimatedTime,
          knowledgeGaps: aiResult.knowledgeGaps,
          roadmap: aiResult.roadmap
        };
      })
    );

    // Sort by match score descending
    processedIssues.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(processedIssues);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST /api/issues/:id/bookmark
export const toggleBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ githubId: 'demo-user-123' });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const index = user.savedIssueIds.indexOf(id);
    if (index > -1) {
      user.savedIssueIds.splice(index, 1);
    } else {
      user.savedIssueIds.push(id);
    }

    await user.save();
    res.status(200).json({ savedIssueIds: user.savedIssueIds });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
