/**
 * Message Broker Service Tests
 * Tests for src/lib/server/services/messageBroker.ts
 * 
 * Note: These tests mock the Prisma client
 */

// Mock the db module
jest.mock('@/lib/server/db', () => ({
  prisma: {
    chatRoom: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    report: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

import { prisma } from '@/lib/server/db';
import {
  createReportRooms,
  sendMessage,
  getRoomMessages,
  canAccessRoom,
} from '@/lib/server/services/messageBroker';
import { ChatRoomType, ChatRoomStatus, MessageSenderType } from '@prisma/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Message Broker Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReportRooms', () => {
    const mockClientId = 'client-1';
    const mockReportId = 'report-1';

    const mockReporterRoom = {
      id: 'room-reporter-1',
      type: ChatRoomType.REPORTER_EXTERNAL,
      status: ChatRoomStatus.ACTIVE,
      isReporterRoom: true,
      isInternalRoom: false,
    };

    const mockInternalRoom = {
      id: 'room-internal-1',
      type: ChatRoomType.EXTERNAL_INTERNAL,
      status: ChatRoomStatus.ACTIVE,
      isReporterRoom: false,
      isInternalRoom: true,
    };

    it('should create two isolated chat rooms', async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([mockReporterRoom, mockInternalRoom]);
      mockPrisma.report.update.mockResolvedValueOnce({});

      const result = await createReportRooms(mockClientId, mockReportId);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.reporterChatRoomId).toBe('room-reporter-1');
      expect(result.internalChatRoomId).toBe('room-internal-1');
    });

    it('should create reporter room with correct properties', async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([mockReporterRoom, mockInternalRoom]);
      mockPrisma.report.update.mockResolvedValueOnce({});

      await createReportRooms(mockClientId, mockReportId);

      expect(mockPrisma.chatRoom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: ChatRoomType.REPORTER_EXTERNAL,
            isReporterRoom: true,
            isInternalRoom: false,
          }),
        })
      );
    });

    it('should create internal room with correct properties', async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([mockReporterRoom, mockInternalRoom]);
      mockPrisma.report.update.mockResolvedValueOnce({});

      await createReportRooms(mockClientId, mockReportId);

      expect(mockPrisma.chatRoom.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: ChatRoomType.EXTERNAL_INTERNAL,
            isReporterRoom: false,
            isInternalRoom: true,
          }),
        })
      );
    });

    it('should update report with room IDs', async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([mockReporterRoom, mockInternalRoom]);
      mockPrisma.report.update.mockResolvedValueOnce({});

      await createReportRooms(mockClientId, mockReportId);

      expect(mockPrisma.report.update).toHaveBeenCalledWith({
        where: { id: mockReportId },
        data: {
          reporterChatRoomId: 'room-reporter-1',
          internalChatRoomId: 'room-internal-1',
        },
      });
    });
  });

  describe('sendMessage', () => {
    const mockRoom = {
      id: 'room-1',
      type: ChatRoomType.REPORTER_EXTERNAL,
      status: ChatRoomStatus.ACTIVE,
      encryptionKey: 'mock-key',
      encryptionIv: 'mock-iv',
      reportId: 'report-1',
    };

    const mockMessage = {
      id: 'msg-1',
      roomId: 'room-1',
      reportId: 'report-1',
      encryptedContent: 'encrypted-content',
      encryptionIv: 'mock-iv',
      senderType: MessageSenderType.REPORTER,
      isInternal: false,
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(mockRoom);
      mockPrisma.message.create.mockResolvedValue(mockMessage);
    });

    it('should send a message to the room', async () => {
      const result = await sendMessage({
        roomId: 'room-1',
        reportId: 'report-1',
        content: 'Test message',
        senderType: MessageSenderType.REPORTER,
        senderId: 'user-1',
      });

      expect(mockPrisma.chatRoom.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });

      expect(mockPrisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roomId: 'room-1',
            reportId: 'report-1',
            senderType: MessageSenderType.REPORTER,
          }),
        })
      );

      expect(result.content).toBe('Test message');
    });

    it('should throw error if room not found', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(null);

      await expect(
        sendMessage({
          roomId: 'invalid-room',
          reportId: 'report-1',
          content: 'Test',
          senderType: MessageSenderType.REPORTER,
        })
      ).rejects.toThrow('Chat room not found');
    });

    it('should throw error if room is not active', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({
        ...mockRoom,
        status: ChatRoomStatus.ARCHIVED,
      });

      await expect(
        sendMessage({
          roomId: 'room-1',
          reportId: 'report-1',
          content: 'Test',
          senderType: MessageSenderType.REPORTER,
        })
      ).rejects.toThrow('Chat room is not active');
    });

    it('should mark message as internal when isInternal is true', async () => {
      await sendMessage({
        roomId: 'room-1',
        reportId: 'report-1',
        content: 'Internal note',
        senderType: MessageSenderType.INTERNAL_ADMIN,
        senderId: 'user-1',
        isInternal: true,
      });

      expect(mockPrisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isInternal: true,
          }),
        })
      );
    });
  });

  describe('getRoomMessages', () => {
    const mockRoom = {
      id: 'room-1',
      encryptionKey: 'mock-key',
      encryptionIv: 'mock-iv',
    };

    const mockEncryptedMessages = [
      {
        id: 'msg-1',
        roomId: 'room-1',
        encryptedContent: 'encrypted-1',
        encryptionIv: 'mock-iv',
        senderType: MessageSenderType.REPORTER,
        isInternal: false,
        createdAt: new Date('2024-01-16T10:00:00Z'),
      },
      {
        id: 'msg-2',
        roomId: 'room-1',
        encryptedContent: 'encrypted-2',
        encryptionIv: 'mock-iv',
        senderType: MessageSenderType.EXTERNAL_ADMIN,
        isInternal: false,
        createdAt: new Date('2024-01-16T11:00:00Z'),
      },
    ];

    it('should fetch and decrypt messages from a room', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(mockRoom);
      mockPrisma.message.findMany.mockResolvedValue(mockEncryptedMessages);

      const result = await getRoomMessages('room-1', 50);

      expect(mockPrisma.chatRoom.findUnique).toHaveBeenCalledWith({
        where: { id: 'room-1' },
      });

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roomId: 'room-1' },
          orderBy: { createdAt: 'asc' },
          take: 50,
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('senderType');
    });

    it('should return empty array when no messages', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(mockRoom);
      mockPrisma.message.findMany.mockResolvedValue([]);

      const result = await getRoomMessages('room-1', 50);

      expect(result).toEqual([]);
    });

    it('should throw error if room not found', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(null);

      await expect(getRoomMessages('invalid-room', 50)).rejects.toThrow('Chat room not found');
    });
  });

  describe('canAccessRoom', () => {
    const mockReporterRoom = {
      id: 'room-reporter-1',
      type: ChatRoomType.REPORTER_EXTERNAL,
      status: ChatRoomStatus.ACTIVE,
      isReporterRoom: true,
      isInternalRoom: false,
      reportId: 'report-1',
    };

    const mockInternalRoom = {
      id: 'room-internal-1',
      type: ChatRoomType.EXTERNAL_INTERNAL,
      status: ChatRoomStatus.ACTIVE,
      isReporterRoom: false,
      isInternalRoom: true,
      reportId: 'report-1',
    };

    describe('Reporter access', () => {
      it('should allow access to reporter rooms', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockReporterRoom);

        const result = await canAccessRoom('room-reporter-1', 'reporter');

        expect(result.allowed).toBe(true);
      });

      it('should deny access to internal rooms', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockInternalRoom);

        const result = await canAccessRoom('room-internal-1', 'reporter');

        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Reporters can only access');
      });
    });

    describe('External Admin access', () => {
      it('should allow access to all rooms (bridge role)', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockReporterRoom);

        const result1 = await canAccessRoom('room-reporter-1', 'external_admin');
        expect(result1.allowed).toBe(true);

        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockInternalRoom);
        const result2 = await canAccessRoom('room-internal-1', 'external_admin');
        expect(result2.allowed).toBe(true);
      });
    });

    describe('Internal Admin access', () => {
      it('should allow access to internal rooms', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockInternalRoom);
        mockPrisma.report.findUnique.mockResolvedValue({ status: 'VALIDATED' });

        const result = await canAccessRoom('room-internal-1', 'internal_admin');

        expect(result.allowed).toBe(true);
      });

      it('should deny access to reporter rooms', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockReporterRoom);

        const result = await canAccessRoom('room-reporter-1', 'internal_admin');

        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('Internal admins can only access');
      });

      it('should deny access if report is not validated', async () => {
        mockPrisma.chatRoom.findUnique.mockResolvedValue(mockInternalRoom);
        mockPrisma.report.findUnique.mockResolvedValue({ status: 'SUBMITTED' });

        const result = await canAccessRoom('room-internal-1', 'internal_admin');

        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('must be validated');
      });
    });

    it('should deny access if room not found', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue(null);

      const result = await canAccessRoom('invalid-room', 'reporter');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Room not found');
    });

    it('should deny access if room is not active', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({
        ...mockReporterRoom,
        status: ChatRoomStatus.ARCHIVED,
      });

      const result = await canAccessRoom('room-reporter-1', 'reporter');

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Room is not active');
    });
  });
});
