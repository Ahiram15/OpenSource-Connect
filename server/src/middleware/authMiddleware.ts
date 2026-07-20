import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    githubId: string;
    username: string;
  };
}

export const authenticateJwt = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secret) as { githubId: string; username: string };
      req.user = decoded;
      return next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  }

  // Fallback for dev mode / demo session
  req.user = { githubId: 'demo-user-123', username: 'Alex Developer' };
  next();
};
