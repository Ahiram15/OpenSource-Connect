"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
// GET /api/user/profile — returns the authenticated user's real profile
const getUserProfile = async (req, res) => {
    try {
        const githubId = req.user?.githubId;
        if (mongoose_1.default.connection.readyState === 1 && githubId) {
            const user = await User_1.default.findOne({ githubId });
            if (user) {
                res.status(200).json(user);
                return;
            }
        }
        // Dev / demo fallback — only used when not authenticated or DB is down
        res.status(200).json({
            githubId: req.user?.githubId || 'demo-user-123',
            username: req.user?.username || 'demo',
            displayName: req.user?.username || 'Demo Developer',
            avatarUrl: 'https://avatars.githubusercontent.com/u/0',
            bio: 'Open-source enthusiast and full-stack developer.',
            location: 'San Francisco, CA',
            githubProfileUrl: 'https://github.com',
            publicRepos: 12,
            followers: 48,
            following: 23,
            technicalInterests: ['TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Express'],
            languageBreakdown: { 'TypeScript': 45, 'React': 25, 'Node.js': 15, 'Python': 10, 'CSS': 5 },
            experienceLevel: 'Beginner',
            savedIssueIds: ['issue-101'],
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserProfile = getUserProfile;
// PUT /api/user/profile — update skills, experience, display name
const updateUserProfile = async (req, res) => {
    try {
        const githubId = req.user?.githubId;
        const { technicalInterests, experienceLevel, displayName } = req.body;
        if (mongoose_1.default.connection.readyState === 1 && githubId) {
            const user = await User_1.default.findOneAndUpdate({ githubId }, {
                ...(technicalInterests ? { technicalInterests } : {}),
                ...(experienceLevel ? { experienceLevel } : {}),
                ...(displayName ? { displayName } : {}),
            }, { new: true, upsert: false });
            if (user) {
                res.status(200).json(user);
                return;
            }
        }
        res.status(200).json({ technicalInterests, experienceLevel, displayName });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateUserProfile = updateUserProfile;
