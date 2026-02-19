/**
 * API Client for Whistleblower Portal
 * Handles authentication, JWT tokens, and API requests
 */

import { User, UserRole } from '@/types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'wlb_access_token';
const REFRESH_TOKEN_KEY = 'wlb_refresh_token';
const TOKEN_EXPIRY_KEY = 'wlb_token_expiry';
const USER_KEY = 'wlb_user';

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store auth tokens and user
 */
export function storeAuth(accessToken: string, refreshToken: string, expiresAt: string, user: User): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return new Date(expiry) <= new Date();
}

/**
 * Fetch wrapper with automatic auth header and token refresh
 */
export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; response?: Response }> {
  let token = getAccessToken();

  // If token is expired, try to refresh
  if (!token || isTokenExpired()) {
    const refreshResult = await refreshTokens();
    if (refreshResult.error || !refreshResult.data) {
      return { error: refreshResult.error || 'Session expired' };
    }
    token = refreshResult.data.accessToken;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be invalid, try one more refresh
      const refreshResult = await refreshTokens();
      if (refreshResult.data) {
        // Retry with new token
        token = refreshResult.data.accessToken;
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
        });
        const data = await retryResponse.json().catch(() => null);
        return { data, response: retryResponse };
      }
      clearAuth();
      return { error: 'Session expired. Please login again.' };
    }

    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      return { error: data?.error || 'Request failed', response };
    }

    return { data, response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(): Promise<{ data?: { accessToken: string; refreshToken: string }; error?: string }> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return { error: 'No refresh token available' };
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      clearAuth();
      return { error: data?.error || 'Token refresh failed' };
    }

    // Store new tokens
    storeAuth(data.auth.accessToken, data.auth.refreshToken, data.auth.expiresAt, getStoredUser()!);
    
    return { data: { accessToken: data.auth.accessToken, refreshToken: data.auth.refreshToken } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Token refresh failed' };
  }
}

// ============================================
// Authentication API
// ============================================

/**
 * Admin login
 */
export async function loginAdmin(email: string, password: string): Promise<{ data?: { user: User; accessToken: string; refreshToken: string; expiresAt: string }; error?: string }> {
  try {
    const response = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Login failed' };
    }

    // Store auth data
    storeAuth(data.auth.accessToken, data.auth.refreshToken, data.auth.expiresAt, data.data.user);

    return { data: { user: data.data.user, accessToken: data.auth.accessToken, refreshToken: data.auth.refreshToken, expiresAt: data.auth.expiresAt } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
}

/**
 * Reporter login with Ticket ID and PIN
 */
export async function loginReporter(ticketId: string, pin: string): Promise<{ data?: { report: any; reporterChatRoomId: string | null; internalChatRoomId: string | null; accessToken: string; refreshToken: string; expiresAt: string }; error?: string }> {
  try {
    const response = await fetch('/api/auth/reporter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, pin }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Login failed', ...(data.lockoutRemainingMinutes && { lockoutRemainingMinutes: data.lockoutRemainingMinutes }), ...(data.attemptsRemaining !== undefined && { attemptsRemaining: data.attemptsRemaining }) };
    }

    // Store auth data
    const reporterUser: User = {
      id: data.data.report.id,
      email: `reporter.${data.data.report.ticketId}@anonymous`,
      name: `Reporter ${data.data.report.ticketId}`,
      role: 'reporter',
    };
    storeAuth(data.auth.accessToken, data.auth.refreshToken, data.auth.expiresAt, reporterUser);

    return { data: { report: data.data.report, reporterChatRoomId: data.data.reporterChatRoomId, internalChatRoomId: data.data.internalChatRoomId, accessToken: data.auth.accessToken, refreshToken: data.auth.refreshToken, expiresAt: data.auth.expiresAt } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Login failed' };
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  clearAuth();
}

// ============================================
// Reports API
// ============================================

export interface CreateReportParams {
  type: string;
  title: string;
  description: string;
  location?: string;
  dateOfIncident?: string;
  involvesPhysicalHarm: boolean;
  involvesLegalViolation: boolean;
  clientId: string;
}

export async function createReport(params: CreateReportParams): Promise<{ data?: { reportId: string; ticketId: string; pin: string; status: string; reporterChatRoomId: string; internalChatRoomId: string }; error?: string }> {
  return fetchWithAuth('/api/reports', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getReports(status?: string, type?: string): Promise<{ data?: any[]; error?: string }> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchWithAuth(`/api/reports${query}`);
}

// ============================================
// Messages API
// ============================================

export async function getMessages(roomId: string, limit: number = 50): Promise<{ data?: any[]; error?: string }> {
  return fetchWithAuth(`/api/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`);
}

export async function sendMessage(roomId: string, reportId: string, content: string, isInternal: boolean = false): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ roomId, reportId, content, isInternal }),
  });
}

export async function relayMessage(fromRoomId: string, toRoomId: string, messageId: string, relayNote?: string): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth('/api/messages/relay', {
    method: 'POST',
    body: JSON.stringify({ fromRoomId, toRoomId, messageId, relayNote }),
  });
}

// ============================================
// Users API
// ============================================

export async function getUsers(status?: string, role?: string, clientId?: string): Promise<{ data?: any[]; error?: string }> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (role) params.append('role', role);
  if (clientId) params.append('clientId', clientId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchWithAuth(`/api/users${query}`);
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clientId?: string;
}

export async function createUser(params: CreateUserParams): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth('/api/users', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateUser(userId: string, params: Partial<{ name: string; email: string; role: UserRole; status: string }>): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth(`/api/users?id=${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteUser(userId: string): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth(`/api/users?id=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

// ============================================
// Clients (Companies) API
// ============================================

export async function getClients(isActive?: boolean): Promise<{ data?: any[]; error?: string }> {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append('isActive', String(isActive));
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchWithAuth(`/api/clients${query}`);
}

export interface CreateClientParams {
  name: string;
  slug: string;
  primaryColor?: string;
}

export async function createClient(params: CreateClientParams): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth('/api/clients', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function updateClient(clientId: string, params: Partial<{ name: string; slug: string; primaryColor: string; isActive: boolean }>): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth(`/api/clients?id=${encodeURIComponent(clientId)}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
}

export async function deleteClient(clientId: string): Promise<{ data?: any; error?: string }> {
  return fetchWithAuth(`/api/clients?id=${encodeURIComponent(clientId)}`, {
    method: 'DELETE',
  });
}

// ============================================
// File Upload API
// ============================================

export async function uploadFile(file: File, reportId: string, roomId: string): Promise<{ data?: any; error?: string }> {
  const token = getAccessToken();
  if (!token) {
    return { error: 'Not authenticated' };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('reportId', reportId);
  formData.append('roomId', roomId);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Upload failed' };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function downloadFile(attachmentId: string): Promise<{ data?: Blob; error?: string }> {
  const token = getAccessToken();
  if (!token) {
    return { error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`/api/upload?id=${encodeURIComponent(attachmentId)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return { error: data?.error || 'Download failed' };
    }

    const blob = await response.blob();
    return { data: blob };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Download failed' };
  }
}
