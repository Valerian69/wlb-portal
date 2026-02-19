'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole, ROLE_CONFIG, RolePermissions } from '@/types';
import {
  getStoredUser,
  getAccessToken,
  isTokenExpired,
  storeAuth,
  clearAuth,
  loginAdmin,
  loginReporter,
  logout as logoutApi,
  refreshTokens,
} from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  loginReporter: (ticketId: string, pin: string) => Promise<{ error?: string; data?: any }>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isAdmin: boolean;
  isReporter: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/privacy', '/terms', '/support', '/portal'];
const LOGIN_PATH = '/admin/login';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication on mount and when pathname changes
  useEffect(() => {
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      const storedUser = getStoredUser();
      const token = getAccessToken();

      if (storedUser && token) {
        // Check if token is expired
        if (isTokenExpired()) {
          // Try to refresh token
          const refreshResult = await refreshTokens();
          if (refreshResult.error || !refreshResult.data) {
            clearAuth();
            setUser(null);
          }
        } else {
          setUser(storedUser);
        }
      } else {
        clearAuth();
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const isAdminPath = pathname?.startsWith('/admin');
    const isLoginPath = pathname === LOGIN_PATH;

    // If trying to access admin routes without auth, redirect to login
    if (isAdminPath && !isLoginPath && !user) {
      router.push(`${LOGIN_PATH}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If already logged in and trying to access login, redirect to appropriate dashboard
    if (isLoginPath && user) {
      if (user.role === 'super_admin') {
        router.push('/admin/super');
      } else if (user.role === 'company_admin') {
        router.push('/admin/company/staff');
      } else if (user.role === 'external_admin') {
        router.push('/admin/external');
      } else if (user.role === 'internal_admin') {
        router.push('/admin/internal');
      }
      return;
    }

    // Role-based route protection
    if (user) {
      const superAdminOnlyPaths = ['/admin/super'];
      const companyAdminPaths = ['/admin/company'];

      if (superAdminOnlyPaths.some(path => pathname?.startsWith(path)) && user.role !== 'super_admin') {
        router.push('/admin/login');
        return;
      }

      if (companyAdminPaths.some(path => pathname?.startsWith(path)) && 
          !['super_admin', 'company_admin'].includes(user.role)) {
        router.push('/admin/login');
        return;
      }
    }
  }, [pathname, user, isLoading, router]);

  // Admin login
  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const result = await loginAdmin(email, password);
    
    if (result.error) {
      return { error: result.error };
    }

    if (result.data) {
      setUser(result.data.user);
    }

    return {};
  }, []);

  // Reporter login
  const reporterLogin = useCallback(async (ticketId: string, pin: string): Promise<{ error?: string; data?: any; lockoutRemainingMinutes?: number; attemptsRemaining?: number }> => {
    const result = await loginReporter(ticketId, pin);
    
    if (result.error) {
      return { 
        error: result.error, 
        ...(typeof (result as any).lockoutRemainingMinutes === 'number' && { lockoutRemainingMinutes: (result as any).lockoutRemainingMinutes }), 
        ...(typeof (result as any).attemptsRemaining === 'number' && { attemptsRemaining: (result as any).attemptsRemaining }) 
      };
    }

    if (result.data) {
      const reporterUser: User = {
        id: result.data.report.id,
        email: `reporter.${result.data.report.ticketId}@anonymous`,
        name: `Reporter ${result.data.report.ticketId}`,
        role: 'reporter',
      };
      setUser(reporterUser);
      return { data: result.data };
    }

    return {};
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    router.push('/admin/login');
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Permission check
  const hasPermission = useCallback((permission: keyof RolePermissions): boolean => {
    if (!user) return false;
    return ROLE_CONFIG[user.role]?.[permission] ?? false;
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginReporter: reporterLogin,
    logout,
    hasPermission,
    isSuperAdmin: user?.role === 'super_admin',
    isCompanyAdmin: user?.role === 'company_admin',
    isAdmin: user?.role !== 'reporter' && user !== null,
    isReporter: user?.role === 'reporter',
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
