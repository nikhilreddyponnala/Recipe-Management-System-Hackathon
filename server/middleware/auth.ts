import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'recipehub_super_secret_jwt_key_2026_dev_seed';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid. Please log in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Malformed authorization header.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    // Verify user still exists in database
    const user = await db.users.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user account associated with this token no longer exists.',
      });
      return;
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.',
    });
  }
}

export function authorizeAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
    return;
  }

  next();
}
