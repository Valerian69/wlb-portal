/**
 * Admin Authentication API
 * Handles admin user login with email/password and JWT
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { verifyPassword } from '@/lib/server/crypto/password';
import { generateTokenPair, hashRefreshToken } from '@/lib/server/middleware/auth';

/**
 * POST /api/auth/admin
 * Authenticate admin user
 * Body: { email, password }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        client: {
          select: { name: true, slug: true, isActive: true },
        },
      },
    });

    if (!user) {
      await logAuthAttempt(email, request.headers.get('x-forwarded-for') || '', false, 'USER_NOT_FOUND');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      await logAuthAttempt(email, request.headers.get('x-forwarded-for') || '', false, 'USER_INACTIVE');
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Check client status (if applicable)
    if (user.client && !user.client.isActive) {
      await logAuthAttempt(email, request.headers.get('x-forwarded-for') || '', false, 'CLIENT_INACTIVE');
      return NextResponse.json(
        { error: 'Organization account is deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      await logAuthAttempt(email, request.headers.get('x-forwarded-for') || '', false, 'INVALID_PASSWORD');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId || undefined,
      sessionId: `admin_${user.id}_${Date.now()}`,
    });

    // Store refresh token hash
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: hashRefreshToken(tokens.refreshToken),
        ipAddress: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        expiresAt: tokens.expiresAt,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        status: 'SUCCESS',
        userId: user.id,
        userEmail: user.email,
        clientId: user.clientId,
        ipAddress: request.headers.get('x-forwarded-for') || '',
        metadata: { role: user.role },
      },
    });

    await logAuthAttempt(email, request.headers.get('x-forwarded-for') || '', true, 'SUCCESS');

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
          clientName: user.client?.name,
          clientSlug: user.client?.slug,
        },
      },
      auth: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error('Admin authentication failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 * Body: { refreshToken }
 */
export async function refresh(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    // Find session by refresh token hash
    const tokenHash = hashRefreshToken(refreshToken);
    const session = await prisma.userSession.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          include: { client: { select: { name: true, slug: true } } },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await prisma.userSession.delete({ where: { id: session.id } });
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      clientId: session.user.clientId || undefined,
      sessionId: `admin_${session.user.id}_${Date.now()}`,
    });

    // Update session
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: hashRefreshToken(tokens.refreshToken),
        expiresAt: tokens.expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      auth: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
export async function logout(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await prisma.userSession.deleteMany({
        where: { token: tokenHash },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

/**
 * Log authentication attempt for security monitoring
 */
async function logAuthAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  reason: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: success ? 'LOGIN' : 'ACCESS_DENIED',
      status: success ? 'SUCCESS' : 'FAILURE',
      userEmail: email,
      ipAddress,
      metadata: { reason },
    },
  });
}
