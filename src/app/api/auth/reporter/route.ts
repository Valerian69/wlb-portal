/**
 * Report Authentication API
 * Handles Ticket ID + PIN authentication for anonymous reporters
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { verifyPIN } from '@/lib/server/crypto/password';
import { decrypt } from '@/lib/server/crypto/encryption';
import { generateTokenPair } from '@/lib/server/middleware/auth';



const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * POST /api/auth/reporter
 * Authenticate reporter with Ticket ID and PIN
 * Body: { ticketId, pin }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, pin } = body;

    if (!ticketId || !pin) {
      return NextResponse.json(
        { error: 'Ticket ID and PIN are required' },
        { status: 400 }
      );
    }

    // Find report by ticket ID
    const report = await prisma.report.findUnique({
      where: { ticketId },
    });

    if (!report) {
      // Log failed attempt
      await logPinAttempt(ticketId, request.headers.get('x-forwarded-for') || '', false);
      return NextResponse.json(
        { error: 'Invalid Ticket ID or PIN' },
        { status: 401 }
      );
    }

    // Check if PIN is locked
    if (report.pinLockedUntil && new Date(report.pinLockedUntil) > new Date()) {
      const lockoutRemaining = Math.ceil(
        (new Date(report.pinLockedUntil).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { 
          error: 'Too many failed attempts. Please try again later.',
          lockoutRemainingMinutes: lockoutRemaining,
        },
        { status: 423 }
      );
    }

    // Verify PIN
    const pinValid = await verifyPIN(pin, report.pinHash);

    if (!pinValid) {
      // Increment failed attempts
      const newAttempts = report.pinAttempts + 1;
      const shouldLock = newAttempts >= MAX_PIN_ATTEMPTS;

      await prisma.report.update({
        where: { id: report.id },
        data: {
          pinAttempts: newAttempts,
          pinLockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        },
      });

      // Log failed attempt
      await logPinAttempt(ticketId, request.headers.get('x-forwarded-for') || '', false);

      return NextResponse.json(
        { 
          error: 'Invalid Ticket ID or PIN',
          attemptsRemaining: MAX_PIN_ATTEMPTS - newAttempts,
        },
        { status: 401 }
      );
    }

    // Reset PIN attempts on successful login
    await prisma.report.update({
      where: { id: report.id },
      data: {
        pinAttempts: 0,
        pinLockedUntil: null,
      },
    });

    // Log successful attempt
    await logPinAttempt(ticketId, request.headers.get('x-forwarded-for') || '', true);

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        status: 'SUCCESS',
        targetType: 'Report',
        targetId: report.id,
        clientId: report.clientId,
        metadata: { ticketId, method: 'PIN' },
      },
    });

    // Get client info
    const client = await prisma.client.findUnique({
      where: { id: report.clientId },
      select: { name: true, slug: true },
    });

    // Decrypt report content
    const decryptedContent = JSON.parse(
      decrypt(report.encryptedContent, report.encryptionKey, report.encryptionIv)
    );

    // Decrypt location and date if available
    let location: string | undefined;
    let dateOfIncident: string | undefined;

    if (report.encryptedLocation) {
      location = decrypt(report.encryptedLocation, report.encryptionKey, report.encryptionIv);
    }
    if (report.encryptedDateOfIncident) {
      dateOfIncident = decrypt(report.encryptedDateOfIncident, report.encryptionKey, report.encryptionIv);
    }

    // Generate session token for reporter
    const tokens = generateTokenPair({
      userId: report.id,
      email: `reporter.${report.ticketId}@anonymous`,
      role: 'REPORTER',
      sessionId: `reporter_${report.id}_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        report: {
          id: report.id,
          ticketId: report.ticketId,
          type: report.type,
          status: report.status,
          title: decryptedContent.title,
          description: decryptedContent.description,
          location,
          dateOfIncident,
          involvesPhysicalHarm: report.involvesPhysicalHarm,
          involvesLegalViolation: report.involvesLegalViolation,
          submittedAt: report.submittedAt,
          updatedAt: report.updatedAt,
          client,
        },
        reporterChatRoomId: report.reporterChatRoomId,
        internalChatRoomId: report.internalChatRoomId,
      },
      auth: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error('Reporter authentication failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Log PIN attempt for security monitoring
 */
async function logPinAttempt(ticketId: string, ipAddress: string, success: boolean): Promise<void> {
  await prisma.pinAttempt.create({
    data: {
      ticketId,
      ipAddress,
      success,
    },
  });
}
