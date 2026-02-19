/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces strict access control based on user roles and client scoping
 */

import { UserRole } from '@prisma/client';
import { JWTPayload, verifyAccessToken, extractBearerToken } from './auth';

// Permission definitions
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const PERMISSIONS: RolePermissions = {
  SUPER_ADMIN: [
    { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'update', 'delete'] },
    { resource: 'reports:all', actions: ['read'] },
    { resource: 'messages', actions: ['read', 'relay'] },
    { resource: 'audit', actions: ['read'] },
    { resource: 'settings', actions: ['update'] },
  ],
  COMPANY_ADMIN: [
    { resource: 'users:own', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports:own', actions: ['read', 'update'] },
    { resource: 'messages:own', actions: ['read', 'send'] },
    { resource: 'settings:own', actions: ['update'] },
  ],
  EXTERNAL_ADMIN: [
    { resource: 'reports:assigned', actions: ['read', 'update', 'validate'] },
    { resource: 'messages:all', actions: ['read', 'send', 'relay'] },
    { resource: 'reports:all', actions: ['read'] },
  ],
  INTERNAL_ADMIN: [
    { resource: 'reports:validated', actions: ['read'] },
    { resource: 'messages:internal', actions: ['read', 'send'] },
  ],
  REPORTER: [
    { resource: 'reports:own', actions: ['create', 'read'] },
    { resource: 'messages:own', actions: ['read', 'send'] },
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  for (const perm of rolePermissions) {
    // Exact match
    if (perm.resource === resource && perm.actions.includes(action)) {
      return true;
    }
    // Wildcard for resource (e.g., 'reports:*' matches 'reports:assigned')
    if (perm.resource.endsWith(':*')) {
      const baseResource = perm.resource.slice(0, -2);
      if (resource.startsWith(baseResource) && perm.actions.includes(action)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Middleware factory for route protection
 */
export function requireAuth() {
  return async function authMiddleware(request: Request): Promise<{
    authorized: boolean;
    payload?: JWTPayload;
    error?: string;
  }> {
    const token = extractBearerToken(request.headers.get('authorization') || undefined);
    
    if (!token) {
      return { authorized: false, error: 'No authentication token provided' };
    }

    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return { authorized: false, error: 'Invalid or expired token' };
    }

    return { authorized: true, payload };
  };
}

/**
 * Middleware factory for role-based access
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async function roleMiddleware(request: Request): Promise<{
    authorized: boolean;
    payload?: JWTPayload;
    error?: string;
  }> {
    const authResult = await requireAuth()(request);
    
    if (!authResult.authorized || !authResult.payload) {
      return authResult;
    }

    if (!allowedRoles.includes(authResult.payload.role as UserRole)) {
      return {
        authorized: false,
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      };
    }

    return authResult;
  };
}

/**
 * Middleware factory for permission-based access
 */
export function requirePermission(resource: string, action: string) {
  return async function permissionMiddleware(request: Request): Promise<{
    authorized: boolean;
    payload?: JWTPayload;
    error?: string;
  }> {
    const authResult = await requireAuth()(request);
    
    if (!authResult.authorized || !authResult.payload) {
      return authResult;
    }

    const hasPerm = hasPermission(authResult.payload.role as UserRole, resource, action);
    
    if (!hasPerm) {
      return {
        authorized: false,
        error: `Permission denied: ${action} on ${resource}`,
      };
    }

    return authResult;
  };
}

/**
 * Client scoping middleware - ensures users can only access their own client's data
 */
export function requireClientScope() {
  return async function clientScopeMiddleware(
    request: Request,
    payload: JWTPayload
  ): Promise<{
    authorized: boolean;
    clientId?: string;
    error?: string;
  }> {
    const { role, clientId } = payload;

    // Super admins can access all clients
    if (role === 'SUPER_ADMIN') {
      // Extract clientId from URL or query params if needed
      const url = new URL(request.url);
      const requestedClientId = url.searchParams.get('clientId');
      return { authorized: true, clientId: requestedClientId || undefined };
    }

    // Company admins and internal admins are scoped to their client
    if (role === 'COMPANY_ADMIN' || role === 'INTERNAL_ADMIN') {
      if (!clientId) {
        return {
          authorized: false,
          error: 'User is not associated with any client',
        };
      }

      // Check if request is trying to access a different client
      const url = new URL(request.url);
      const requestedClientId = url.searchParams.get('clientId');
      
      if (requestedClientId && requestedClientId !== clientId) {
        return {
          authorized: false,
          error: 'Access denied: Cannot access data from another client',
        };
      }

      return { authorized: true, clientId };
    }

    // Other roles don't have client scope
    return { authorized: true };
  };
}

/**
 * Combined middleware for protected client-scoped routes
 */
export function requireClientAccess(...allowedRoles: UserRole[]) {
  return async function combinedMiddleware(request: Request): Promise<{
    authorized: boolean;
    payload?: JWTPayload;
    clientId?: string;
    error?: string;
  }> {
    // Check role
    const roleResult = await requireRole(...allowedRoles)(request);
    if (!roleResult.authorized || !roleResult.payload) {
      return roleResult;
    }

    // Check client scope
    const scopeResult = await requireClientScope()(request, roleResult.payload);
    if (!scopeResult.authorized) {
      return { ...scopeResult, payload: roleResult.payload };
    }

    return {
      authorized: true,
      payload: roleResult.payload,
      clientId: scopeResult.clientId,
    };
  };
}

/**
 * Check if user can access a specific report
 */
export function canAccessReport(
  userRole: UserRole,
  userClientId: string | undefined,
  reportClientId: string,
  reportStatus: string
): boolean {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return true;
    case 'EXTERNAL_ADMIN':
      return true; // Can access all reports
    case 'COMPANY_ADMIN':
    case 'INTERNAL_ADMIN':
      // Must be same client AND report must be validated
      return userClientId === reportClientId && 
             ['VALIDATED', 'IN_PROGRESS', 'RESOLVED'].includes(reportStatus);
    case 'REPORTER':
      // Reporters can only access their own reports (checked via ticket ID + PIN)
      return false; // This is handled separately via ticket authentication
    default:
      return false;
  }
}

/**
 * Check if user can access a specific chat room
 * This enforces the strict room isolation
 */
export function canAccessChatRoom(
  userRole: UserRole,
  roomType: 'REPORTER_EXTERNAL' | 'EXTERNAL_INTERNAL'
): boolean {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return true; // Super admins can access all rooms for audit
    case 'EXTERNAL_ADMIN':
      return true; // External admins are the bridge
    case 'INTERNAL_ADMIN':
      // Internal admins can ONLY access EXTERNAL_INTERNAL rooms
      return roomType === 'EXTERNAL_INTERNAL';
    case 'REPORTER':
      // Reporters can ONLY access REPORTER_EXTERNAL rooms
      return roomType === 'REPORTER_EXTERNAL';
    case 'COMPANY_ADMIN':
      // Company admins can access internal rooms for their client
      return roomType === 'EXTERNAL_INTERNAL';
    default:
      return false;
  }
}
