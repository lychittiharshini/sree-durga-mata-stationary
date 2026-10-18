import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sree_durga_mata_stationery_secure_secret_2026';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: number;
    username: string;
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Admin authentication required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Forbidden: Invalid or expired admin session. Please log in again.'
    });
  }
}

export function generateAdminToken(payload: { id: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}
