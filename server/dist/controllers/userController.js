"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const memoryUser = {
    githubId: 'demo-user-123',
    username: 'Alex Developer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    technicalInterests: ['TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'Express', 'CSS', 'HTML'],
    languageBreakdown: { 'TypeScript': 45, 'React': 25, 'Node.js': 15, 'Python': 10, 'CSS': 5 },
    experienceLevel: 'Beginner',
    savedIssueIds: ['issue-101']
};
// GET /api/user/profile
const getUserProfile = async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState === 1) {
            let user = await User_1.default.findOne({ githubId: 'demo-user-123' });
            if (!user) {
                user = await User_1.default.create(memoryUser);
            }
            res.status(200).json(user);
        }
        else {
            res.status(200).json(memoryUser);
        }
    }
    catch (error) {
        res.status(200).json(memoryUser);
    }
};
exports.getUserProfile = getUserProfile;
// PUT /api/user/profile
const updateUserProfile = async (req, res) => {
    try {
        const { technicalInterests, experienceLevel } = req.body;
        if (technicalInterests)
            memoryUser.technicalInterests = technicalInterests;
        if (experienceLevel)
            memoryUser.experienceLevel = experienceLevel;
        if (mongoose_1.default.connection.readyState === 1) {
            let user = await User_1.default.findOneAndUpdate({ githubId: 'demo-user-123' }, { technicalInterests, experienceLevel }, { new: true, upsert: true });
            res.status(200).json(user);
        }
        else {
            res.status(200).json(memoryUser);
        }
    }
    catch (error) {
        res.status(200).json(memoryUser);
    }
};
exports.updateUserProfile = updateUserProfile;
