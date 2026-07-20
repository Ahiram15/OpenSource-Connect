"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opensource-connect';
        const conn = await mongoose_1.default.connect(connStr, {
            serverSelectionTimeoutMS: 2000
        });
        console.log(`[MongoDB] Database Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[MongoDB Error]: ${error.message}`);
        // Non-fatal fallback for development without running MongoDB instance
        console.warn('[MongoDB Warning]: Server will operate in dev mode with mock/in-memory data fallback if database is unreachable.');
    }
};
exports.connectDB = connectDB;
