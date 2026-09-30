import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../types/index.ts';

export interface AuthenticatedPrincipal {
  userId: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  driverId?: string;
  issuedAt: number;
  expiresAt: number;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedPrincipal;
    }
  }
}

const FALLBACK_DEV_JWT_SECRET = crypto
  .createHash('sha256')
  .update('FLOURISH_DESTINY_COLLECTION_OKENE_DEV_SECRET_2026')
  .digest('hex');

export function getJwtSecret(): string {
  const envSecret = (process.env.JWT_SECRET || '').trim();
  return envSecret.length >= 16 ? envSecret : FALLBACK_DEV_JWT_SECRET;
}

export function isLiveJwtConfigured(): boolean {
  return (process.env.JWT_SECRET || '').trim().length >= 16;
}

export function hashPassword(plainPassword: string, existingSalt?: string): {
  hash: string;
  salt: string;
} {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return { hash: derived, salt };
}

export function verifyPassword(plainPassword: string, storedHash: string, storedSalt: string): boolean {
  try {
    const { hash } = hashPassword(plainPassword, storedSalt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwtToken(
  payload: Omit<AuthenticatedPrincipal, 'issuedAt' | 'expiresAt'>,
  ttlSeconds = 60 * 60 * 24 * 7 // 7 days
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AuthenticatedPrincipal = {
    ...payload,
    issuedAt: now,
    expiresAt: now + ttlSeconds
  };
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest();
  const encodedSig = base64UrlEncode(signature);
  return `${signingInput}.${encodedSig}`;
}

export function verifyJwtToken(token: string): AuthenticatedPrincipal | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSig] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = base64UrlEncode(
      crypto.createHmac('sha256', getJwtSecret()).update(signingInput).digest()
    );
    const a = Buffer.from(encodedSig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }
    const payload: AuthenticatedPrincipal = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.expiresAt && payload.expiresAt < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function attachAuthContext(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifyJwtToken(token);
    if (verified) {
      req.authUser = verified;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to continue.'
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.authUser && allowedRoles.includes(req.authUser.role)) {
      next();
      return;
    }

    // Support Demo/Test Mode Admin Header when signed in through Admin Portal
    const demoAdminToken = req.headers['x-fdc-admin-session'];
    if (
      (allowedRoles.includes('ADMIN') || allowedRoles.includes('SUPER_ADMIN')) &&
      demoAdminToken === 'FDC_HQ_VERIFIED_SESSION'
    ) {
      req.authUser = {
        userId: 'usr-admin-001',
        email: (process.env.ADMIN_EMAIL || 'ceejegzig83@gmail.com').trim().toLowerCase(),
        phone: '09162723865',
        name: 'HQ Master Administrator',
        role: 'SUPER_ADMIN',
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 3600
      };
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}].`
    });
  };
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const record = hits.get(key);

    if (!record || record.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (record.count >= options.maxRequests) {
      res.status(429).json({
        success: false,
        error:
          options.message ||
          'Too many requests from this IP address. Please wait a moment and try again.'
      });
      return;
    }

    record.count += 1;
    next();
  };
}

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}
