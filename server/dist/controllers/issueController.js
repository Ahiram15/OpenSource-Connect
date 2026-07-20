"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBookmark = exports.getRecommendations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const githubService_1 = require("../services/githubService");
const geminiService_1 = require("../services/geminiService");
// GET /api/issues/recommendations
const getRecommendations = async (req, res) => {
    try {
        const language = req.query.language || 'javascript';
        const label = req.query.label || 'good first issue';
        // Get user preferences
        let userInterests = ['React', 'Node'];
        let userExperience = 'Beginner';
        if (mongoose_1.default.connection.readyState === 1) {
            const user = await User_1.default.findOne({ githubId: 'demo-user-123' });
            if (user) {
                userInterests = user.technicalInterests;
                userExperience = user.experienceLevel;
            }
        }
        // Fetch GitHub issues
        const rawIssues = await (0, githubService_1.fetchGitHubIssues)(language, label);
        // Process each issue through Gemini AI engine
        const processedIssues = await Promise.all(rawIssues.map(async (raw) => {
            const aiResult = await (0, geminiService_1.analyzeIssueWithGemini)(raw.title, raw.body, userInterests, userExperience);
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
        }));
        // Sort by match score descending
        processedIssues.sort((a, b) => b.matchScore - a.matchScore);
        res.status(200).json(processedIssues);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getRecommendations = getRecommendations;
// POST /api/issues/:id/bookmark
const toggleBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findOne({ githubId: 'demo-user-123' });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const index = user.savedIssueIds.indexOf(id);
        if (index > -1) {
            user.savedIssueIds.splice(index, 1);
        }
        else {
            user.savedIssueIds.push(id);
        }
        await user.save();
        res.status(200).json({ savedIssueIds: user.savedIssueIds });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.toggleBookmark = toggleBookmark;
