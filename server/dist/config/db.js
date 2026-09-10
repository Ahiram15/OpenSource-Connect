"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectDB = async () => {
    if (isConnected || mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
        console.warn('[MongoDB Warning]: MONGODB_URI environment variable not set in serverless context.');
        return;
    }
    try {
        const conn = await mongoose_1.default.connect(connStr, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log(`[MongoDB] Database Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[MongoDB Connection Error]: ${error.message}`);
        isConnected = false;
    }
};
exports.connectDB = connectDB;
