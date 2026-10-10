import { Router, Request, Response, NextFunction } from 'express';
import { dashboardController } from '../controllers/dashboardController.ts';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from '../middleware/auth.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'recipehub_super_secret_jwt_key_2026_dev_seed';

function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignore
    }
  }
  next();
}

router.get('/stats', optionalAuthenticate, dashboardController.getStats);

export default router;
