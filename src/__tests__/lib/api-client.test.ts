/**
 * API Client Tests
 * Tests for src/lib/api-client.ts
 */

import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  storeAuth,
  clearAuth,
  isTokenExpired,
  loginAdmin,
  loginReporter,
  logout,
  createReport,
  getMessages,
  sendMessage,
} from '@/lib/api-client';
import { User } from '@/types';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'super_admin',
};

const mockTokens = {
  accessToken: 'mock_access_token_123',
  refreshToken: 'mock_refresh_token_456',
  expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
};

describe('API Client - Auth Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('storeAuth', () => {
    it('should store auth data in localStorage', () => {
      storeAuth(mockTokens.accessToken, mockTokens.refreshToken, mockTokens.expiresAt, mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith('wlb_access_token', mockTokens.accessToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('wlb_refresh_token', mockTokens.refreshToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('wlb_token_expiry', mockTokens.expiresAt);
      expect(localStorage.setItem).toHaveBeenCalledWith('wlb_user', JSON.stringify(mockUser));
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.getItem = jest.fn().mockReturnValue(mockTokens.accessToken);
      
      const token = getAccessToken();
      
      expect(token).toBe(mockTokens.accessToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('wlb_access_token');
    });

    it('should return null when no token exists', () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      
      const token = getAccessToken();
      
      expect(token).toBeNull();
    });
  });

  describe('getStoredUser', () => {
    it('should return parsed user from localStorage', () => {
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(mockUser));
      
      const user = getStoredUser();
      
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user exists', () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      
      const user = getStoredUser();
      
      expect(user).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid json');
      
      const user = getStoredUser();
      
      expect(user).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should remove all auth data from localStorage', () => {
      clearAuth();

      expect(localStorage.removeItem).toHaveBeenCalledWith('wlb_access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('wlb_refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('wlb_token_expiry');
      expect(localStorage.removeItem).toHaveBeenCalledWith('wlb_user');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no expiry exists', () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return true when token is expired', () => {
      const expiredDate = new Date(Date.now() - 1000).toISOString();
      localStorage.getItem = jest.fn().mockReturnValue(expiredDate);
      
      expect(isTokenExpired()).toBe(true);
    });

    it('should return false when token is valid', () => {
      const validDate = new Date(Date.now() + 3600000).toISOString();
      localStorage.getItem = jest.fn().mockReturnValue(validDate);
      
      expect(isTokenExpired()).toBe(false);
    });
  });
});

describe('API Client - Authentication', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('loginAdmin', () => {
    it('should successfully login admin user', async () => {
      const mockResponse = {
        success: true,
        data: { user: mockUser },
        auth: mockTokens,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginAdmin('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.user).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const result = await loginAdmin('test@example.com', 'wrongpassword');

      expect(result.error).toBe('Invalid credentials');
      expect(result.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await loginAdmin('test@example.com', 'password123');

      expect(result.error).toBe('Network error');
    });
  });

  describe('loginReporter', () => {
    it('should successfully login reporter with ticket ID and PIN', async () => {
      const mockReport = {
        id: '1',
        ticketId: 'WLB-2024-001',
        status: 'submitted',
        type: 'harassment',
      };

      const mockResponse = {
        success: true,
        data: {
          report: mockReport,
          reporterChatRoomId: 'room_1',
          internalChatRoomId: 'room_2',
        },
        auth: mockTokens,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginReporter('WLB-2024-001', '123456');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/reporter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: 'WLB-2024-001', pin: '123456' }),
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toBeDefined();
    });

    it('should handle PIN lockout', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
          error: 'Too many failed attempts',
          lockoutRemainingMinutes: 30,
        }),
      });

      const result = await loginReporter('WLB-2024-001', 'wrongpin');

      expect(result.error).toBe('Too many failed attempts');
      expect((result as any).lockoutRemainingMinutes).toBe(30);
    });
  });

  describe('logout', () => {
    it('should call logout API and clear auth data', async () => {
      localStorage.getItem = jest.fn().mockReturnValue(mockTokens.refreshToken);
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await logout();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: mockTokens.refreshToken }),
      });
    });
  });
});

describe('API Client - Reports', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    localStorage.getItem = jest.fn().mockReturnValue(mockTokens.accessToken);
  });

  describe('createReport', () => {
    it('should create a new report', async () => {
      const mockReportData = {
        type: 'harassment',
        title: 'Test Report',
        description: 'Test description',
        involvesPhysicalHarm: false,
        involvesLegalViolation: false,
        clientId: 'client_1',
      };

      const mockResponse = {
        success: true,
        data: {
          reportId: '1',
          ticketId: 'WLB-2024-001',
          pin: '123456',
          status: 'submitted',
          reporterChatRoomId: 'room_1',
          internalChatRoomId: 'room_2',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createReport(mockReportData);

      expect(global.fetch).toHaveBeenCalledWith('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockTokens.accessToken}`,
        },
        body: JSON.stringify(mockReportData),
      });

      expect(result.data).toBeDefined();
      expect(result.data?.reportId).toBeDefined();
    });
  });
});

describe('API Client - Messages', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    localStorage.getItem = jest.fn().mockReturnValue(mockTokens.accessToken);
  });

  describe('getMessages', () => {
    it('should fetch messages from a chat room', async () => {
      const mockMessages = [
        { id: '1', content: 'Hello', senderType: 'reporter', createdAt: new Date() },
        { id: '2', content: 'Hi there', senderType: 'external_admin', createdAt: new Date() },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockMessages }),
      });

      const result = await getMessages('room_1', 50);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/messages?roomId=room_1&limit=50',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockTokens.accessToken}`,
          }),
        })
      );

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('sendMessage', () => {
    it('should send a message to a chat room', async () => {
      const mockMessage = {
        id: '1',
        content: 'Test message',
        senderType: 'external_admin',
        createdAt: new Date(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockMessage }),
      });

      const result = await sendMessage('room_1', 'report_1', 'Test message', false);

      expect(global.fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockTokens.accessToken}`,
        },
        body: JSON.stringify({
          roomId: 'room_1',
          reportId: 'report_1',
          content: 'Test message',
          isInternal: false,
        }),
      });

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
    });
  });
});
