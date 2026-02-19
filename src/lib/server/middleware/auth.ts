/**
 * JWT Authentication Service
 * Handles token generation, verification, and session management
 */

import jwt from 'jsonwebtoken';
import { hashSHA256, generateSecureToken } from '../crypto/encryption';

const JWT_SECRET = process.env.JWT_SECRET || generateSecureToken(64);
const JWT_EXPIRES_IN = '8h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  clientId?: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Generate a JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Generate a refresh token (hashed for storage)
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = generateSecureToken(64);
  const hash = hashSHA256(token);
  return { token, hash };
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const { token: refreshToken } = generateRefreshToken();
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8); // Match JWT_EXPIRES_IN
  
  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Verify and decode a JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Hash a refresh token for storage
 */
export function hashRefreshToken(token: string): string {
  return hashSHA256(token);
}

/**
 * Get expiration date for access token
 */
export function getTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);
  return expiresAt;
}

/**
 * Get expiration date for refresh token
 */
export function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
