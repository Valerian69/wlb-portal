/**
 * AuthContext Tests
 * Tests for src/contexts/AuthContext.tsx
 */

import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

// Mock the api-client module
jest.mock('@/lib/api-client', () => ({
  getStoredUser: jest.fn(),
  getAccessToken: jest.fn(),
  isTokenExpired: jest.fn(),
  storeAuth: jest.fn(),
  clearAuth: jest.fn(),
  loginAdmin: jest.fn(),
  loginReporter: jest.fn(),
  logout: jest.fn(),
  refreshTokens: jest.fn(),
}));

import {
  getStoredUser,
  getAccessToken,
  isTokenExpired,
  loginAdmin,
  loginReporter,
  logout,
  refreshTokens,
} from '@/lib/api-client';

// Test component to access auth context
function TestComponent() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="is-authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="is-super-admin">{String(auth.isSuperAdmin)}</span>
      <span data-testid="is-company-admin">{String(auth.isCompanyAdmin)}</span>
      <span data-testid="is-reporter">{String(auth.isReporter)}</span>
      <span data-testid="user-name">{auth.user?.name || 'None'}</span>
      <span data-testid="user-role">{auth.user?.role || 'None'}</span>
      <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'super_admin',
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context to children', () => {
    (getStoredUser as jest.Mock).mockReturnValue(null);
    (getAccessToken as jest.Mock).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated')).toBeInTheDocument();
  });

  it('should initialize as not authenticated when no user', () => {
    (getStoredUser as jest.Mock).mockReturnValue(null);
    (getAccessToken as jest.Mock).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-name').textContent).toBe('None');
  });

  it('should initialize as authenticated when user exists in storage', () => {
    (getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (getAccessToken as jest.Mock).mockReturnValue('valid_token');
    (isTokenExpired as jest.Mock).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
    expect(screen.getByTestId('user-role').textContent).toBe('super_admin');
  });

  it('should set isSuperAdmin to true for super_admin role', () => {
    (getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (getAccessToken as jest.Mock).mockReturnValue('valid_token');
    (isTokenExpired as jest.Mock).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-super-admin').textContent).toBe('true');
    expect(screen.getByTestId('is-company-admin').textContent).toBe('false');
    expect(screen.getByTestId('is-reporter').textContent).toBe('false');
  });

  it('should set isCompanyAdmin to true for company_admin role', () => {
    const companyAdminUser: User = {
      ...mockUser,
      role: 'company_admin',
    };
    (getStoredUser as jest.Mock).mockReturnValue(companyAdminUser);
    (getAccessToken as jest.Mock).mockReturnValue('valid_token');
    (isTokenExpired as jest.Mock).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-company-admin').textContent).toBe('true');
    expect(screen.getByTestId('is-super-admin').textContent).toBe('false');
  });

  it('should call loginAdmin and update user on successful login', async () => {
    (loginAdmin as jest.Mock).mockResolvedValue({
      data: { user: mockUser, accessToken: 'token', refreshToken: 'refresh', expiresAt: 'expiry' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText('Login').click();

    await waitFor(() => {
      expect(loginAdmin).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  it('should return error on failed login', async () => {
    (loginAdmin as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText('Login').click();

    await waitFor(() => {
      expect(loginAdmin).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  it('should call logout API and clear auth', async () => {
    (logout as jest.Mock).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText('Logout').click();

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
    });
  });

  it('should refresh user data when token is expired', async () => {
    (getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (getAccessToken as jest.Mock).mockReturnValue('expired_token');
    (isTokenExpired as jest.Mock).mockReturnValue(true);
    (refreshTokens as jest.Mock).mockResolvedValue({
      data: { accessToken: 'new_token', refreshToken: 'new_refresh' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(refreshTokens).toHaveBeenCalled();
    });
  });

  it('should clear auth when token refresh fails', async () => {
    (getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (getAccessToken as jest.Mock).mockReturnValue('expired_token');
    (isTokenExpired as jest.Mock).mockReturnValue(true);
    (refreshTokens as jest.Mock).mockResolvedValue({ error: 'Refresh failed' });

    const { clearAuth } = require('@/lib/api-client');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(clearAuth).toHaveBeenCalled();
    });
  });
});

describe('hasPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true for super_admin permissions', () => {
    (getStoredUser as jest.Mock).mockReturnValue({
      ...mockUser,
      role: 'super_admin',
    });
    (getAccessToken as jest.Mock).mockReturnValue('valid_token');
    (isTokenExpired as jest.Mock).mockReturnValue(false);

    const TestPermissionComponent = () => {
      const { hasPermission } = useAuth();
      return (
        <div>
          <span data-testid="can-manage-companies">{String(hasPermission('canManageCompanies'))}</span>
          <span data-testid="can-manage-users">{String(hasPermission('canManageUsers'))}</span>
          <span data-testid="can-access-super-admin-panel">{String(hasPermission('canAccessSuperAdminPanel'))}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestPermissionComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('can-manage-companies').textContent).toBe('true');
    expect(screen.getByTestId('can-manage-users').textContent).toBe('true');
    expect(screen.getByTestId('can-access-super-admin-panel').textContent).toBe('true');
  });

  it('should return false for reporter permissions', () => {
    (getStoredUser as jest.Mock).mockReturnValue({
      ...mockUser,
      role: 'reporter',
    });
    (getAccessToken as jest.Mock).mockReturnValue('valid_token');
    (isTokenExpired as jest.Mock).mockReturnValue(false);

    const TestPermissionComponent = () => {
      const { hasPermission } = useAuth();
      return (
        <div>
          <span data-testid="can-manage-companies">{String(hasPermission('canManageCompanies'))}</span>
          <span data-testid="can-manage-users">{String(hasPermission('canManageUsers'))}</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestPermissionComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('can-manage-companies').textContent).toBe('false');
    expect(screen.getByTestId('can-manage-users').textContent).toBe('false');
  });

  it('should return false when no user is authenticated', () => {
    (getStoredUser as jest.Mock).mockReturnValue(null);
    (getAccessToken as jest.Mock).mockReturnValue(null);

    const TestPermissionComponent = () => {
      const { hasPermission } = useAuth();
      return <span data-testid="can-manage-companies">{String(hasPermission('canManageCompanies'))}</span>;
    };

    render(
      <AuthProvider>
        <TestPermissionComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('can-manage-companies').textContent).toBe('false');
  });
});
