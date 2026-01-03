import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-32-chars';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-32-chars';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

/**
 * Generate an access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

/**
 * Calculate token expiration date
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  // Default 7 days
  const days = parseInt(REFRESH_EXPIRES.replace('d', '')) || 7;
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}
