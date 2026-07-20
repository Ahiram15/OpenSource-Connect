import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opensource-connect';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error]: ${(error as Error).message}`);
    // Non-fatal fallback for development without running MongoDB instance
    console.warn('[MongoDB Warning]: Server will operate in dev mode with mock/in-memory data fallback if database is unreachable.');
  }
};
