import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import userRoutes from './routes/userRoutes';
import issueRoutes from './routes/issueRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Vercel / reverse proxy HTTPS forwarding
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'OpenSource Connect Backend API',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes (support both /api/ and direct paths for Vercel serverless)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/user', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/issues', issueRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 OpenSource Connect Server listening on http://localhost:${PORT}`);
  connectDB();
});

export default app;
