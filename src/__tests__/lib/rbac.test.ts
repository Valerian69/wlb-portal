/**
 * RBAC Middleware Tests
 * Tests for src/lib/server/middleware/rbac.ts
 */

import {
  hasPermission,
  canAccessReport,
  canAccessChatRoom,
  PERMISSIONS,
} from '@/lib/server/middleware/rbac';
import { UserRole } from '@/types';

describe('RBAC Middleware', () => {
  describe('hasPermission', () => {
    describe('SUPER_ADMIN permissions', () => {
      it('should have all management permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'clients', 'create')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'clients', 'read')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'clients', 'update')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'clients', 'delete')).toBe(true);
        
        expect(hasPermission('SUPER_ADMIN', 'users', 'create')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'users', 'delete')).toBe(true);
      });

      it('should have access to all reports', () => {
        expect(hasPermission('SUPER_ADMIN', 'reports', 'read')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'reports:all', 'read')).toBe(true);
      });

      it('should have message relay permissions', () => {
        expect(hasPermission('SUPER_ADMIN', 'messages', 'read')).toBe(true);
        expect(hasPermission('SUPER_ADMIN', 'messages', 'relay')).toBe(true);
      });

      it('should have audit log access', () => {
        expect(hasPermission('SUPER_ADMIN', 'audit', 'read')).toBe(true);
      });
    });

    describe('COMPANY_ADMIN permissions', () => {
      it('should have user management for own company', () => {
        expect(hasPermission('COMPANY_ADMIN', 'users:own', 'create')).toBe(true);
        expect(hasPermission('COMPANY_ADMIN', 'users:own', 'read')).toBe(true);
        expect(hasPermission('COMPANY_ADMIN', 'users:own', 'update')).toBe(true);
        expect(hasPermission('COMPANY_ADMIN', 'users:own', 'delete')).toBe(true);
      });

      it('should have access to own company reports', () => {
        expect(hasPermission('COMPANY_ADMIN', 'reports:own', 'read')).toBe(true);
        expect(hasPermission('COMPANY_ADMIN', 'reports:own', 'update')).toBe(true);
      });

      it('should NOT have global permissions', () => {
        expect(hasPermission('COMPANY_ADMIN', 'clients', 'create')).toBe(false);
        expect(hasPermission('COMPANY_ADMIN', 'users', 'create')).toBe(false);
        expect(hasPermission('COMPANY_ADMIN', 'reports:all', 'read')).toBe(false);
      });
    });

    describe('EXTERNAL_ADMIN permissions', () => {
      it('should have report management permissions', () => {
        expect(hasPermission('EXTERNAL_ADMIN', 'reports:assigned', 'read')).toBe(true);
        expect(hasPermission('EXTERNAL_ADMIN', 'reports:assigned', 'update')).toBe(true);
        expect(hasPermission('EXTERNAL_ADMIN', 'reports:assigned', 'validate')).toBe(true);
      });

      it('should have access to all reports for reading', () => {
        expect(hasPermission('EXTERNAL_ADMIN', 'reports:all', 'read')).toBe(true);
      });

      it('should have message permissions', () => {
        expect(hasPermission('EXTERNAL_ADMIN', 'messages:all', 'read')).toBe(true);
        expect(hasPermission('EXTERNAL_ADMIN', 'messages:all', 'send')).toBe(true);
        expect(hasPermission('EXTERNAL_ADMIN', 'messages:all', 'relay')).toBe(true);
      });
    });

    describe('INTERNAL_ADMIN permissions', () => {
      it('should only have access to validated reports', () => {
        expect(hasPermission('INTERNAL_ADMIN', 'reports:validated', 'read')).toBe(true);
      });

      it('should have internal message permissions', () => {
        expect(hasPermission('INTERNAL_ADMIN', 'messages:internal', 'read')).toBe(true);
        expect(hasPermission('INTERNAL_ADMIN', 'messages:internal', 'send')).toBe(true);
      });

      it('should NOT have management permissions', () => {
        expect(hasPermission('INTERNAL_ADMIN', 'users', 'create')).toBe(false);
        expect(hasPermission('INTERNAL_ADMIN', 'reports', 'update')).toBe(false);
        expect(hasPermission('INTERNAL_ADMIN', 'messages:all', 'relay')).toBe(false);
      });
    });

    describe('REPORTER permissions', () => {
      it('should only have access to own reports', () => {
        expect(hasPermission('REPORTER', 'reports:own', 'create')).toBe(true);
        expect(hasPermission('REPORTER', 'reports:own', 'read')).toBe(true);
      });

      it('should have own message permissions', () => {
        expect(hasPermission('REPORTER', 'messages:own', 'read')).toBe(true);
        expect(hasPermission('REPORTER', 'messages:own', 'send')).toBe(true);
      });

      it('should NOT have any admin permissions', () => {
        expect(hasPermission('REPORTER', 'users', 'read')).toBe(false);
        expect(hasPermission('REPORTER', 'reports:all', 'read')).toBe(false);
        expect(hasPermission('REPORTER', 'messages:all', 'read')).toBe(false);
      });
    });

    describe('Unknown role', () => {
      it('should return false for unknown role', () => {
        expect(hasPermission('unknown_role' as UserRole, 'users', 'read')).toBe(false);
      });
    });
  });

  describe('canAccessReport', () => {
    const mockReportClientId = 'acme-corp';
    const mockReportStatus = 'VALIDATED';

    describe('SUPER_ADMIN access', () => {
      it('should have access to all reports', () => {
        expect(canAccessReport('SUPER_ADMIN', undefined, mockReportClientId, mockReportStatus)).toBe(true);
        expect(canAccessReport('SUPER_ADMIN', 'other-client', mockReportClientId, mockReportStatus)).toBe(true);
      });
    });

    describe('EXTERNAL_ADMIN access', () => {
      it('should have access to all reports', () => {
        expect(canAccessReport('EXTERNAL_ADMIN', undefined, mockReportClientId, mockReportStatus)).toBe(true);
        expect(canAccessReport('EXTERNAL_ADMIN', 'other-client', mockReportClientId, 'SUBMITTED')).toBe(true);
      });
    });

    describe('COMPANY_ADMIN access', () => {
      it('should have access to own client reports', () => {
        expect(canAccessReport('COMPANY_ADMIN', mockReportClientId, mockReportClientId, mockReportStatus)).toBe(true);
      });

      it('should NOT have access to other client reports', () => {
        expect(canAccessReport('COMPANY_ADMIN', 'other-client', mockReportClientId, mockReportStatus)).toBe(false);
      });
    });

    describe('INTERNAL_ADMIN access', () => {
      it('should have access to validated reports from own client', () => {
        expect(canAccessReport('INTERNAL_ADMIN', mockReportClientId, mockReportClientId, 'VALIDATED')).toBe(true);
        expect(canAccessReport('INTERNAL_ADMIN', mockReportClientId, mockReportClientId, 'IN_PROGRESS')).toBe(true);
        expect(canAccessReport('INTERNAL_ADMIN', mockReportClientId, mockReportClientId, 'RESOLVED')).toBe(true);
      });

      it('should NOT have access to non-validated reports', () => {
        expect(canAccessReport('INTERNAL_ADMIN', mockReportClientId, mockReportClientId, 'SUBMITTED')).toBe(false);
        expect(canAccessReport('INTERNAL_ADMIN', mockReportClientId, mockReportClientId, 'UNDER_REVIEW')).toBe(false);
      });

      it('should NOT have access to other client reports', () => {
        expect(canAccessReport('INTERNAL_ADMIN', 'other-client', mockReportClientId, 'VALIDATED')).toBe(false);
      });
    });

    describe('REPORTER access', () => {
      it('should NOT have access through this function (handled via ticket auth)', () => {
        expect(canAccessReport('REPORTER', undefined, mockReportClientId, mockReportStatus)).toBe(false);
      });
    });
  });

  describe('canAccessChatRoom', () => {
    describe('SUPER_ADMIN access', () => {
      it('should have access to all room types', () => {
        expect(canAccessChatRoom('SUPER_ADMIN', 'REPORTER_EXTERNAL')).toBe(true);
        expect(canAccessChatRoom('SUPER_ADMIN', 'EXTERNAL_INTERNAL')).toBe(true);
      });
    });

    describe('EXTERNAL_ADMIN access', () => {
      it('should have access to all room types (bridge role)', () => {
        expect(canAccessChatRoom('EXTERNAL_ADMIN', 'REPORTER_EXTERNAL')).toBe(true);
        expect(canAccessChatRoom('EXTERNAL_ADMIN', 'EXTERNAL_INTERNAL')).toBe(true);
      });
    });

    describe('INTERNAL_ADMIN access', () => {
      it('should ONLY have access to EXTERNAL_INTERNAL rooms', () => {
        expect(canAccessChatRoom('INTERNAL_ADMIN', 'EXTERNAL_INTERNAL')).toBe(true);
        expect(canAccessChatRoom('INTERNAL_ADMIN', 'REPORTER_EXTERNAL')).toBe(false);
      });
    });

    describe('REPORTER access', () => {
      it('should ONLY have access to REPORTER_EXTERNAL rooms', () => {
        expect(canAccessChatRoom('REPORTER', 'REPORTER_EXTERNAL')).toBe(true);
        expect(canAccessChatRoom('REPORTER', 'EXTERNAL_INTERNAL')).toBe(false);
      });
    });

    describe('COMPANY_ADMIN access', () => {
      it('should have access to EXTERNAL_INTERNAL rooms', () => {
        expect(canAccessChatRoom('COMPANY_ADMIN', 'EXTERNAL_INTERNAL')).toBe(true);
        expect(canAccessChatRoom('COMPANY_ADMIN', 'REPORTER_EXTERNAL')).toBe(false);
      });
    });
  });

  describe('PERMISSIONS object', () => {
    it('should have permissions defined for all roles', () => {
      expect(PERMISSIONS.SUPER_ADMIN).toBeDefined();
      expect(PERMISSIONS.COMPANY_ADMIN).toBeDefined();
      expect(PERMISSIONS.EXTERNAL_ADMIN).toBeDefined();
      expect(PERMISSIONS.INTERNAL_ADMIN).toBeDefined();
      expect(PERMISSIONS.REPORTER).toBeDefined();
    });

    it('should have non-empty permission arrays', () => {
      expect(PERMISSIONS.SUPER_ADMIN.length).toBeGreaterThan(0);
      expect(PERMISSIONS.COMPANY_ADMIN.length).toBeGreaterThan(0);
      expect(PERMISSIONS.EXTERNAL_ADMIN.length).toBeGreaterThan(0);
      expect(PERMISSIONS.INTERNAL_ADMIN.length).toBeGreaterThan(0);
      expect(PERMISSIONS.REPORTER.length).toBeGreaterThan(0);
    });
  });
});
