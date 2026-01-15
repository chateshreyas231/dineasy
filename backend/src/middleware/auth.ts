import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}
