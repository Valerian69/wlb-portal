/**
 * Intermediate Message Broker Service
 * Manages strictly isolated chat rooms:
 * - Room A: Reporter <-> External Admin
 * - Room B: External Admin <-> Internal Admin
 * 
 * Internal Admins can NEVER access Room A or see Reporter's PIN
 */

import { prisma } from '@/lib/server/db';
import { ChatRoomType, ChatRoomStatus, MessageSenderType } from '@prisma/client';
import { encrypt, decrypt, generateEncryptionKey, generateIV } from '../crypto/encryption';



export interface CreateReportRoomsResult {
  reporterChatRoomId: string;
  internalChatRoomId: string;
}

export interface SendMessageParams {
  roomId: string;
  reportId: string;
  content: string;
  senderType: MessageSenderType;
  senderId?: string;
  isInternal?: boolean;
}

export interface MessageResult {
  id: string;
  roomId: string;
  content: string;
  senderType: MessageSenderType;
  isInternal: boolean;
  createdAt: Date;
}

/**
 * Create two isolated chat rooms for a new report
 * Room A: Reporter <-> External Admin (allowReporter: true, allowInternalAdmin: false)
 * Room B: External Admin <-> Internal Admin (allowReporter: false, allowInternalAdmin: true)
 */
export async function createReportRooms(
  clientId: string,
  reportId: string
): Promise<CreateReportRoomsResult> {
  // Generate unique encryption keys for each room
  const reporterRoomKey = generateEncryptionKey();
  const reporterRoomIV = generateIV();
  const internalRoomKey = generateEncryptionKey();
  const internalRoomIV = generateIV();

  const [reporterRoom, internalRoom] = await prisma.$transaction([
    // Room A: Reporter <-> External Admin
    prisma.chatRoom.create({
      data: {
        type: ChatRoomType.REPORTER_EXTERNAL,
        status: ChatRoomStatus.ACTIVE,
        encryptionKey: reporterRoomKey,
        encryptionIv: reporterRoomIV,
        clientId,
        reportId,
        isReporterRoom: true,
        isInternalRoom: false,
      },
    }),
    // Room B: External Admin <-> Internal Admin
    prisma.chatRoom.create({
      data: {
        type: ChatRoomType.EXTERNAL_INTERNAL,
        status: ChatRoomStatus.ACTIVE,
        encryptionKey: internalRoomKey,
        encryptionIv: internalRoomIV,
        clientId,
        reportId,
        isReporterRoom: false,
        isInternalRoom: true,
      },
    }),
  ]);

  // Update report with room IDs
  await prisma.report.update({
    where: { id: reportId },
    data: {
      reporterChatRoomId: reporterRoom.id,
      internalChatRoomId: internalRoom.id,
    },
  });

  return {
    reporterChatRoomId: reporterRoom.id,
    internalChatRoomId: internalRoom.id,
  };
}

/**
 * Send a message to a chat room with encryption
 */
export async function sendMessage({
  roomId,
  reportId,
  content,
  senderType,
  senderId,
  isInternal = false,
}: SendMessageParams): Promise<MessageResult> {
  // Get room for encryption key
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Chat room not found');
  }

  if (room.status !== ChatRoomStatus.ACTIVE) {
    throw new Error('Chat room is not active');
  }

  // Encrypt message content
  const encryptedContent = encrypt(content, room.encryptionKey, room.encryptionIv);

  const message = await prisma.message.create({
    data: {
      roomId,
      reportId,
      encryptedContent,
      encryptionIv: room.encryptionIv,
      senderType,
      senderId,
      isInternal,
      isDelivered: true,
    },
  });

  return {
    id: message.id,
    roomId: message.roomId,
    content, // Return decrypted for immediate display
    senderType: message.senderType,
    isInternal: message.isInternal,
    createdAt: message.createdAt,
  };
}

/**
 * Get messages from a room (with decryption)
 */
export async function getRoomMessages(
  roomId: string,
  limit: number = 50
): Promise<MessageResult[]> {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Chat room not found');
  }

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  return messages.map((msg) => ({
    id: msg.id,
    roomId: msg.roomId,
    content: decrypt(msg.encryptedContent, room.encryptionKey, room.encryptionIv),
    senderType: msg.senderType,
    isInternal: msg.isInternal,
    createdAt: msg.createdAt,
  }));
}

/**
 * Check if a user has access to a specific room
 * This is the CRITICAL access control function
 */
export async function canAccessRoom(
  roomId: string,
  userType: 'reporter' | 'external_admin' | 'internal_admin'
): Promise<{ allowed: boolean; reason?: string }> {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { allowed: false, reason: 'Room not found' };
  }

  if (room.status !== ChatRoomStatus.ACTIVE) {
    return { allowed: false, reason: 'Room is not active' };
  }

  // Get report for status check
  let reportStatus: string | undefined;
  if (room.reportId) {
    const report = await prisma.report.findUnique({
      where: { id: room.reportId },
      select: { status: true, clientId: true },
    });
    reportStatus = report?.status;
  }

  // CRITICAL ACCESS CONTROL LOGIC
  switch (userType) {
    case 'reporter':
      if (!room.isReporterRoom) {
        return {
          allowed: false,
          reason: 'Reporters can only access reporter-external admin rooms'
        };
      }
      // Reporters can ONLY access Room A (REPORTER_EXTERNAL)
      if (room.type !== ChatRoomType.REPORTER_EXTERNAL) {
        return {
          allowed: false,
          reason: 'Access denied: Reporters cannot access internal team communications'
        };
      }
      return { allowed: true };

    case 'external_admin':
      // External admins can access both rooms (they are the bridge)
      return { allowed: true };

    case 'internal_admin':
      if (!room.isInternalRoom) {
        return {
          allowed: false,
          reason: 'Internal admins can only access external-internal rooms'
        };
      }
      // Internal admins can ONLY access Room B (EXTERNAL_INTERNAL)
      if (room.type !== ChatRoomType.EXTERNAL_INTERNAL) {
        return {
          allowed: false,
          reason: 'ACCESS VIOLATION: Internal admins cannot access reporter communications'
        };
      }
      // Additional check: Internal admin can only access if report is VALIDATED or beyond
      if (reportStatus && !['VALIDATED', 'IN_PROGRESS', 'RESOLVED'].includes(reportStatus)) {
        return {
          allowed: false,
          reason: 'Report must be validated before internal team can access',
        };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Unknown user type' };
  }
}

/**
 * Relay a message from one room to another (External Admin bridge function)
 * Used when External Admin needs to forward information between Reporter and Internal Team
 */
export async function relayMessage(
  fromRoomId: string,
  toRoomId: string,
  originalMessageId: string,
  externalAdminId: string,
  relayNote?: string
): Promise<MessageResult> {
  // Verify external admin has access to both rooms
  const fromAccess = await canAccessRoom(fromRoomId, 'external_admin');
  const toAccess = await canAccessRoom(toRoomId, 'external_admin');

  if (!fromAccess.allowed || !toAccess.allowed) {
    throw new Error('External admin does not have access to both rooms');
  }

  // Get original message
  const originalMessage = await prisma.message.findUnique({
    where: { id: originalMessageId },
  });

  if (!originalMessage) {
    throw new Error('Original message not found');
  }

  // Get source room for decryption
  const fromRoom = await prisma.chatRoom.findUnique({
    where: { id: fromRoomId },
  });

  if (!fromRoom) {
    throw new Error('Source room not found');
  }

  // Decrypt original content
  const originalContent = decrypt(
    originalMessage.encryptedContent,
    fromRoom.encryptionKey,
    fromRoom.encryptionIv
  );

  // Get destination room
  const toRoom = await prisma.chatRoom.findUnique({
    where: { id: toRoomId },
  });

  if (!toRoom) {
    throw new Error('Destination room not found');
  }

  // Create relayed message with attribution
  const relayedContent = relayNote
    ? `[Relayed from ${fromRoom.type}]\n${originalContent}\n\n— Note: ${relayNote}`
    : `[Relayed from ${fromRoom.type}]\n${originalContent}`;

  return sendMessage({
    roomId: toRoomId,
    reportId: originalMessage.reportId,
    content: relayedContent,
    senderType: MessageSenderType.EXTERNAL_ADMIN,
    senderId: externalAdminId,
    isInternal: toRoom.type === ChatRoomType.EXTERNAL_INTERNAL,
  });
}

/**
 * Archive a chat room (soft delete)
 */
export async function archiveRoom(roomId: string): Promise<void> {
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { status: ChatRoomStatus.ARCHIVED },
  });
}

/**
 * Lock a chat room (prevent new messages)
 */
export async function lockRoom(roomId: string): Promise<void> {
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { status: ChatRoomStatus.LOCKED },
  });
}
