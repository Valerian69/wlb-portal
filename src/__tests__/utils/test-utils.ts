/**
 * Test Utilities
 * Common test helpers and mock data
 */

import { User, UserRole, Report, ReportStatus, ChatMessage } from '@/types';

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    role: 'internal_admin',
    avatar: 'TU',
    ...overrides,
  };
}

/**
 * Create mock users for different roles
 */
export const mockUsers: Record<UserRole, User> = {
  super_admin: createMockUser({ role: 'super_admin', email: 'super@admin.com' }),
  company_admin: createMockUser({ 
    role: 'company_admin', 
    email: 'company@admin.com',
    clientId: 'client-1',
    clientName: 'Test Corp',
  }),
  external_admin: createMockUser({ role: 'external_admin', email: 'external@admin.com' }),
  internal_admin: createMockUser({ 
    role: 'internal_admin', 
    email: 'internal@admin.com',
    clientId: 'client-1',
    clientName: 'Test Corp',
  }),
  reporter: createMockUser({ role: 'reporter', email: 'reporter@anonymous.com' }),
};

/**
 * Create a mock report for testing
 */
export function createMockReport(overrides?: Partial<Report>): Report {
  return {
    id: 'report-' + Math.random().toString(36).substr(2, 9),
    ticketId: 'WLB-2024-' + Math.floor(Math.random() * 1000),
    pin: '123456',
    clientSlug: 'test-corp',
    status: 'submitted',
    type: 'harassment',
    title: 'Test Report',
    description: 'This is a test report description',
    involvesPhysicalHarm: false,
    involvesLegalViolation: false,
    submittedAt: new Date(),
    updatedAt: new Date(),
    chatMessages: [],
    internalChatMessages: [],
    ...overrides,
  };
}

/**
 * Create mock chat messages
 */
export function createMockMessages(count: number, overrides?: Partial<ChatMessage>): ChatMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 'msg-' + i,
    sender: 'reporter',
    content: `Test message ${i + 1}`,
    timestamp: new Date(Date.now() - (count - i) * 60000), // 1 minute apart
    ...overrides,
  }));
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

/**
 * Setup mock localStorage
 */
export function setupLocalStorageMock() {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });
}

/**
 * Reset mock localStorage
 */
export function resetLocalStorageMock() {
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
}

/**
 * Mock fetch response helper
 */
export function mockFetchResponse(data: any, options?: { ok?: boolean; status?: number }) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: async () => data,
  });
}

/**
 * Mock fetch error helper
 */
export function mockFetchError(error: Error) {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
}

/**
 * Wait helper for async tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock Next.js router
 */
export function createMockRouter(overrides?: any) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    ...overrides,
  };
}

/**
 * Report status test helpers
 */
export const reportStatusFlow: ReportStatus[] = [
  'submitted',
  'under_review',
  'validated',
  'in_progress',
  'resolved',
  'closed',
];

/**
 * Check if status is in valid flow
 */
export function isValidStatusTransition(from: ReportStatus, to: ReportStatus): boolean {
  const fromIndex = reportStatusFlow.indexOf(from);
  const toIndex = reportStatusFlow.indexOf(to);
  return toIndex > fromIndex;
}
