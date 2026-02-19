/**
 * Messages API Routes
 * Handles secure messaging between users with room isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { MessageSenderType } from '@prisma/client';
import { verifyAccessToken, extractBearerToken } from '@/lib/server/middleware/auth';
import { canAccessRoom, sendMessage, getRoomMessages, relayMessage } from '@/lib/server/services/messageBroker';
import { canAccessChatRoom } from '@/lib/server/middleware/rbac';



/**
 * GET /api/messages?roomId=
 * Get messages from a chat room (with access control)
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
    const roomId = url.searchParams.get('roomId');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 });
    }

    // Check room access based on role
    const userType = payload.role === 'REPORTER' ? 'reporter' 
      : payload.role === 'EXTERNAL_ADMIN' ? 'external_admin'
      : payload.role === 'INTERNAL_ADMIN' ? 'internal_admin'
      : 'external_admin'; // Default for super/company admins

    const accessCheck = await canAccessRoom(roomId, userType);
    
    if (!accessCheck.allowed) {
      // Log access denied
      await prisma.auditLog.create({
        data: {
          action: 'ACCESS_DENIED',
          status: 'WARNING',
          userId: payload.userId,
          userEmail: payload.email,
          targetType: 'ChatRoom',
          targetId: roomId,
          metadata: { reason: accessCheck.reason },
        },
      });

      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await getRoomMessages(roomId, limit);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a message to a chat room
 * Body: { roomId, content, isInternal? }
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

    const body = await request.json();
    const { roomId, content, isInternal } = body;

    if (!roomId || !content) {
      return NextResponse.json(
        { error: 'Room ID and content are required' },
        { status: 400 }
      );
    }

    // Determine sender type from role
    let senderType: MessageSenderType;
    switch (payload.role) {
      case 'REPORTER':
        senderType = MessageSenderType.REPORTER;
        break;
      case 'EXTERNAL_ADMIN':
        senderType = MessageSenderType.EXTERNAL_ADMIN;
        break;
      case 'INTERNAL_ADMIN':
      case 'COMPANY_ADMIN':
        senderType = MessageSenderType.INTERNAL_ADMIN;
        break;
      case 'SUPER_ADMIN':
        senderType = MessageSenderType.EXTERNAL_ADMIN; // Super admins act as external
        break;
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check room access
    const userType = payload.role === 'REPORTER' ? 'reporter'
      : payload.role === 'EXTERNAL_ADMIN' ? 'external_admin'
      : 'internal_admin';

    const accessCheck = await canAccessRoom(roomId, userType);

    if (!accessCheck.allowed) {
      await prisma.auditLog.create({
        data: {
          action: 'ACCESS_DENIED',
          status: 'WARNING',
          userId: payload.userId,
          userEmail: payload.email,
          targetType: 'ChatRoom',
          targetId: roomId,
          metadata: { reason: accessCheck.reason, action: 'SEND_MESSAGE' },
        },
      });

      return NextResponse.json(
        { error: 'Access denied', reason: accessCheck.reason },
        { status: 403 }
      );
    }

    // Get room to find report ID
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Send message
    const message = await sendMessage({
      roomId,
      reportId: room.reportId || '',
      content,
      senderType,
      senderId: payload.userId,
      isInternal: isInternal || senderType === MessageSenderType.INTERNAL_ADMIN,
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'SEND_MESSAGE',
        status: 'SUCCESS',
        userId: payload.userId,
        userEmail: payload.email,
        targetType: 'Message',
        targetId: message.id,
        clientId: room.clientId,
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/relay
 * Relay a message from one room to another (External Admin bridge function)
 * Body: { fromRoomId, toRoomId, messageId, relayNote? }
 */
export async function relay(request: NextRequest) {
  try {
    // Check authentication - Only external admins and super admins can relay
    const token = extractBearerToken(request.headers.get('authorization') || undefined);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!['EXTERNAL_ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Only external admins can relay messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fromRoomId, toRoomId, messageId, relayNote } = body;

    if (!fromRoomId || !toRoomId || !messageId) {
      return NextResponse.json(
        { error: 'fromRoomId, toRoomId, and messageId are required' },
        { status: 400 }
      );
    }

    // Relay the message
    const message = await relayMessage(
      fromRoomId,
      toRoomId,
      messageId,
      payload.userId,
      relayNote
    );

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'SEND_MESSAGE',
        status: 'SUCCESS',
        userId: payload.userId,
        userEmail: payload.email,
        targetType: 'Message',
        targetId: message.id,
        metadata: { relayed: true, fromRoomId, toRoomId },
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Failed to relay message:', error);
    return NextResponse.json(
      { error: 'Failed to relay message' },
      { status: 500 }
    );
  }
}
