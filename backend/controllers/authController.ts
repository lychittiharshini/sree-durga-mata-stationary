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

// PUT /api/admin/change-credentials (Admin only: update username and password)
export async function updateCredentials(req: AuthenticatedRequest, res: Response) {
  if (!req.adminUser) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({ error: 'Current password is required to verify your identity.' });
  }

  if (!newPassword && !newUsername) {
    return res.status(400).json({ error: 'Please enter a new username or new password.' });
  }

  if (newPassword && (typeof newPassword !== 'string' || newPassword.length < 6)) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  try {
    const admin = await db.findAdminById(req.adminUser.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    let updatedHash: string | undefined;
    if (newPassword) {
      const salt = bcrypt.genSaltSync(10);
      updatedHash = bcrypt.hashSync(newPassword, salt);
    }

    const updatedUsername = newUsername && typeof newUsername === 'string' && newUsername.trim().length > 0
      ? newUsername.trim()
      : admin.username;

    await db.updateAdminCredentials(admin.id, updatedUsername, updatedHash);

    // Issue updated JWT token
    const newToken = generateAdminToken({ id: admin.id, username: updatedUsername });
    res.cookie('admin_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token: newToken,
      username: updatedUsername,
      message: 'Admin credentials updated successfully! Only you have access.'
    });
  } catch (err: any) {
    console.error('Error updating admin credentials:', err);
    return res.status(500).json({ error: 'Failed to update credentials. Please try again.' });
  }
}

