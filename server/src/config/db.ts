import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const connStr = process.env.MONGODB_URI;
  if (!connStr) {
    console.warn('[MongoDB Warning]: MONGODB_URI environment variable not set in serverless context.');
    return;
  }

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${(error as Error).message}`);
    isConnected = false;
  }
};
