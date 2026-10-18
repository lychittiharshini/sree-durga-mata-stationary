import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

// Maximum 5 failed login attempts per 15 minutes window
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = loginAttempts.get(ip);

  if (record) {
    if (record.blockedUntil && now < record.blockedUntil) {
      const waitMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again after ${waitMinutes} minute(s).`
      });
    }

    if (now - record.firstAttempt > WINDOW_MS) {
      // Reset window
      loginAttempts.set(ip, { count: 1, firstAttempt: now });
    }
  }

  next();
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || (now - record.firstAttempt > WINDOW_MS)) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}
