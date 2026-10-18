import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.ts';
import { generateAdminToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { recordFailedLogin, resetLoginAttempts } from '../middleware/rateLimiter.ts';

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { username, password } = req.body;

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please enter both username and password.' });
  }

  try {
    const admin = await db.findAdminByUsername(username.trim());
    if (!admin) {
      recordFailedLogin(ip);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      recordFailedLogin(ip);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Success: clear rate limiter counter
    resetLoginAttempts(ip);

    // Update last login timestamp
    await db.updateAdminLastLogin(admin.id);

    // Generate JWT token
    const token = generateAdminToken({ id: admin.id, username: admin.username });

    // Set secure cookie as well (for browser session)
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    return res.json({
      success: true,
      token,
      username: admin.username,
      message: 'Logged in successfully.'
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
}

// POST /api/auth/logout
export async function logout(_req: Request, res: Response) {
  res.clearCookie('admin_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

// GET /api/auth/me (Check active session)
export async function getCurrentAdmin(req: AuthenticatedRequest, res: Response) {
  if (!req.adminUser) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    user: {
      id: req.adminUser.id,
      username: req.adminUser.username
    }
  });
}
