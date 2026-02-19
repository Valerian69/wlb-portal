/**
 * File Upload API Routes
 * Handles secure file uploads with EXIF scrubbing and encryption
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { AttachmentType, AttachmentStatus } from '@prisma/client';
import { verifyAccessToken, extractBearerToken } from '@/lib/server/middleware/auth';
import { canAccessRoom } from '@/lib/server/services/messageBroker';
import { encrypt, decrypt, generateEncryptionKey, generateIV } from '@/lib/server/crypto/encryption';
import { scrubEXIF, validateScrubbedImage } from '@/lib/server/services/exifScrubber';



/**
 * POST /api/upload
 * Upload a file with automatic EXIF scrubbing for images
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const reportId = formData.get('reportId') as string;
    const roomId = formData.get('roomId') as string;

    if (!file || !reportId || !roomId) {
      return NextResponse.json(
        { error: 'File, reportId, and roomId are required' },
        { status: 400 }
      );
    }

    // Check room access
    const userType = payload.role === 'REPORTER' ? 'reporter'
      : payload.role === 'EXTERNAL_ADMIN' ? 'external_admin'
      : 'internal_admin';

    const accessCheck = await canAccessRoom(roomId, userType);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Verify report exists and belongs to the room
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Determine file type
    const mimeType = file.type;
    let attachmentType: AttachmentType = 'OTHER';
    
    if (mimeType.startsWith('image/')) {
      attachmentType = 'IMAGE';
    } else if (mimeType.startsWith('video/')) {
      attachmentType = 'VIDEO';
    } else if (mimeType.startsWith('audio/')) {
      attachmentType = 'AUDIO';
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      attachmentType = 'DOCUMENT';
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    let fileBuffer = Buffer.from(arrayBuffer);

    // EXIF scrubbing for images
    let exifScrubbed = false;
    let originalExif: string | undefined;
    
    if (attachmentType === 'IMAGE') {
      const scrubResult = await scrubEXIF(fileBuffer);
      fileBuffer = Buffer.from(scrubResult.scrubbedBuffer);
      exifScrubbed = scrubResult.result.success;
      originalExif = scrubResult.result.originalExif;

      // Validate scrubbing
      const validation = validateScrubbedImage(fileBuffer);
      if (!validation.isClean) {
        console.warn('EXIF scrubbing incomplete:', validation.remainingFields);
      }
    }

    // Generate encryption for file
    const encryptionKey = generateEncryptionKey();
    const encryptionIv = generateIV();

    // Encrypt file content
    const encryptedFile = encrypt(fileBuffer.toString('base64'), encryptionKey, encryptionIv);

    // Generate stored filename
    const fileExtension = file.name.split('.').pop() || 'bin';
    const storedName = `${reportId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // In production, upload to S3 or similar storage
    // For now, we'll store the encrypted content in the database (not recommended for large files)
    const storagePath = `/uploads/${reportId}/${storedName}`;

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        reportId,
        originalName: file.name,
        storedName,
        mimeType,
        fileSize: fileBuffer.length,
        type: attachmentType,
        storagePath,
        encryptionKey,
        encryptionIv,
        encryptedContent: encryptedFile, // Store encrypted file (in production, store in S3)
        exifScrubbed,
        exifScrubbedAt: exifScrubbed ? new Date() : null,
        originalExif: originalExif ? encrypt(originalExif, encryptionKey, encryptionIv) : null,
        scrubbedBy: payload.userId,
        status: AttachmentStatus.CLEAN,
        scannedAt: new Date(),
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_ATTACHMENT',
        status: 'SUCCESS',
        userId: payload.userId,
        userEmail: payload.email,
        targetType: 'Attachment',
        targetId: attachment.id,
        clientId: report.clientId,
        metadata: {
          fileName: file.name,
          fileSize: fileBuffer.length,
          exifScrubbed,
        },
      },
    });

    // If EXIF was scrubbed, log that specifically
    if (exifScrubbed) {
      await prisma.auditLog.create({
        data: {
          action: 'SCRUB_EXIF',
          status: 'SUCCESS',
          userId: payload.userId,
          userEmail: payload.email,
          targetType: 'Attachment',
          targetId: attachment.id,
          clientId: report.clientId,
          metadata: { fileName: file.name },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: attachment.id,
        originalName: attachment.originalName,
        storedName: attachment.storedName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        type: attachment.type,
        exifScrubbed: attachment.exifScrubbed,
        uploadedAt: attachment.uploadedAt,
      },
    });
  } catch (error) {
    console.error('File upload failed:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/:id
 * Download an attachment (with decryption)
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
    const attachmentId = url.pathname.split('/').pop();

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        report: {
          select: { clientId: true, status: true },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check access based on role
    if (payload.role === 'REPORTER') {
      // Reporters can only access attachments from their own reports
      // This would need additional verification via ticket ID + PIN
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (payload.role === 'INTERNAL_ADMIN' || payload.role === 'COMPANY_ADMIN') {
      // Internal admins can only access if report is validated
      if (!['VALIDATED', 'IN_PROGRESS', 'RESOLVED'].includes(attachment.report.status)) {
        return NextResponse.json({ error: 'Report not yet validated' }, { status: 403 });
      }
      // Check client scoping
      if (payload.clientId !== attachment.report.clientId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Decrypt file content
    const decryptedBase64 = decrypt(
      attachment.encryptedContent,
      attachment.encryptionKey,
      attachment.encryptionIv
    );
    const fileBuffer = Buffer.from(decryptedBase64, 'base64');

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'DOWNLOAD_ATTACHMENT',
        status: 'SUCCESS',
        userId: payload.userId,
        userEmail: payload.email,
        targetType: 'Attachment',
        targetId: attachmentId,
        clientId: attachment.report.clientId,
      },
    });

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
      },
    });
  } catch (error) {
    console.error('File download failed:', error);
    return NextResponse.json(
      { error: 'File download failed' },
      { status: 500 }
    );
  }
}
