/**
 * Reports API Routes
 * Handles report creation, retrieval, and status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { ReportStatus, ReportType } from '@prisma/client';
import { hashPIN } from '@/lib/server/crypto/password';
import { encrypt, generateEncryptionKey, generateIV } from '@/lib/server/crypto/encryption';
import { generateTicketId } from '@/lib/mock-data';
import { createReportRooms } from '@/lib/server/services/messageBroker';
import { requireClientAccess } from '@/lib/server/middleware/rbac';
import { verifyAccessToken, extractBearerToken } from '@/lib/server/middleware/auth';



/**
 * POST /api/reports
 * Create a new anonymous report
 * Body: { type, title, description, location?, dateOfIncident?, involvesPhysicalHarm, involvesLegalViolation, clientId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      type,
      title,
      description,
      location,
      dateOfIncident,
      involvesPhysicalHarm,
      involvesLegalViolation,
      clientId,
    } = body;

    // Validate required fields
    if (!type || !title || !description || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate Ticket ID and PIN
    const ticketId = generateTicketId();
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash PIN
    const pinHash = await hashPIN(pin);

    // Generate encryption key and IV for report content
    const encryptionKey = generateEncryptionKey();
    const encryptionIv = generateIV();

    // Encrypt report content
    const contentToEncrypt = { title, description };
    const encryptedContent = encrypt(JSON.stringify(contentToEncrypt), encryptionKey, encryptionIv);

    // Encrypt location and date if provided
    const encryptedLocation = location ? encrypt(location, encryptionKey, encryptionIv) : null;
    const encryptedDateOfIncident = dateOfIncident ? encrypt(dateOfIncident, encryptionKey, encryptionIv) : null;

    // Create report
    const report = await prisma.report.create({
      data: {
        ticketId,
        pinHash,
        type: type as ReportType,
        status: ReportStatus.SUBMITTED,
        encryptedContent,
        encryptionKey,
        encryptionIv,
        involvesPhysicalHarm: involvesPhysicalHarm || false,
        involvesLegalViolation: involvesLegalViolation || false,
        encryptedLocation,
        encryptedDateOfIncident,
        client: {
          connect: { id: clientId },
        },
      },
    });

    // Create isolated chat rooms
    const rooms = await createReportRooms(clientId, report.id);

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_REPORT',
        status: 'SUCCESS',
        targetType: 'Report',
        targetId: report.id,
        clientId,
        metadata: { ticketId },
      },
    });

    // Return report info with credentials (PIN shown only once!)
    return NextResponse.json({
      success: true,
      data: {
        reportId: report.id,
        ticketId: report.ticketId,
        pin, // ⚠️ ONLY TIME PIN IS SHOWN - User must save it!
        status: report.status,
        reporterChatRoomId: rooms.reporterChatRoomId,
        internalChatRoomId: rooms.internalChatRoomId,
        submittedAt: report.submittedAt,
      },
      warning: 'Save your Ticket ID and PIN. They cannot be recovered if lost.',
    });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports
 * List reports (with RBAC filtering)
 * Query: ?status=, ?type=, ?clientId=
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = extractBearerToken(request.headers.get('authorization') || undefined);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    // Build query based on role
    let whereClause: Record<string, unknown> = {};

    // Role-based filtering
    if (payload.role === 'SUPER_ADMIN') {
      // Super admins can see all reports
      if (status) whereClause.status = status;
      if (url.searchParams.get('clientId')) whereClause.clientId = url.searchParams.get('clientId');
    } else if (payload.role === 'EXTERNAL_ADMIN') {
      // External admins can see all reports
      if (status) whereClause.status = status;
    } else if (payload.role === 'COMPANY_ADMIN' || payload.role === 'INTERNAL_ADMIN') {
      // Company/Internal admins can only see their client's reports
      if (!payload.clientId) {
        return NextResponse.json({ error: 'No client association' }, { status: 403 });
      }
      whereClause.clientId = payload.clientId;
      
      // Internal admins can only see validated+ reports
      if (payload.role === 'INTERNAL_ADMIN') {
        whereClause.status = { in: ['VALIDATED', 'IN_PROGRESS', 'RESOLVED'] };
      }
      
      if (status && payload.role === 'COMPANY_ADMIN') {
        whereClause.status = status;
      }
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (type) {
      whereClause.type = type as ReportType;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        client: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Transform reports (decrypt minimal info for list view)
    const transformedReports = reports.map((report) => ({
      id: report.id,
      ticketId: report.ticketId,
      type: report.type,
      status: report.status,
      involvesPhysicalHarm: report.involvesPhysicalHarm,
      involvesLegalViolation: report.involvesLegalViolation,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      client: report.client,
    }));

    return NextResponse.json({
      success: true,
      data: transformedReports,
    });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
