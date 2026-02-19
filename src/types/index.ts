// Report status enumeration
export type ReportStatus = 
  | 'submitted'
  | 'under_review'
  | 'validated'
  | 'in_progress'
  | 'resolved'
  | 'closed';

// Report type/categories
export type ReportType = 
  | 'harassment'
  | 'discrimination'
  | 'safety'
  | 'ethics'
  | 'fraud'
  | 'other';

// User roles for RBAC
export type UserRole = 'super_admin' | 'external_admin' | 'internal_admin' | 'company_admin' | 'reporter';

// Permissions for each role
export interface RolePermissions {
  canManageCompanies: boolean;
  canManageUsers: boolean;
  canViewAllReports: boolean;
  canManageOwnCompany: boolean;
  canManageStaff: boolean;
  canAccessSuperAdminPanel: boolean;
}

// Role configuration
export const ROLE_CONFIG: Record<UserRole, RolePermissions> = {
  super_admin: {
    canManageCompanies: true,
    canManageUsers: true,
    canViewAllReports: true,
    canManageOwnCompany: true,
    canManageStaff: true,
    canAccessSuperAdminPanel: true,
  },
  company_admin: {
    canManageCompanies: false,
    canManageUsers: false,
    canViewAllReports: false,
    canManageOwnCompany: true,
    canManageStaff: true,
    canAccessSuperAdminPanel: false,
  },
  external_admin: {
    canManageCompanies: false,
    canManageUsers: false,
    canViewAllReports: true,
    canManageOwnCompany: false,
    canManageStaff: false,
    canAccessSuperAdminPanel: false,
  },
  internal_admin: {
    canManageCompanies: false,
    canManageUsers: false,
    canViewAllReports: false,
    canManageOwnCompany: false,
    canManageStaff: false,
    canAccessSuperAdminPanel: false,
  },
  reporter: {
    canManageCompanies: false,
    canManageUsers: false,
    canViewAllReports: false,
    canManageOwnCompany: false,
    canManageStaff: false,
    canAccessSuperAdminPanel: false,
  },
};

// Chat message interface
export interface ChatMessage {
  id: string;
  sender: 'reporter' | 'external_admin' | 'internal_admin' | 'system';
  content: string;
  timestamp: Date;
  isInternal?: boolean; // For internal admin notes
}

// Report interface
export interface Report {
  id: string;
  ticketId: string;
  pin: string;
  clientSlug: string;
  status: ReportStatus;
  type: ReportType;
  title: string;
  description: string;
  location?: string;
  dateOfIncident?: string;
  involvesPhysicalHarm?: boolean;
  involvesLegalViolation?: boolean;
  submittedAt: Date;
  updatedAt: Date;
  chatMessages: ChatMessage[];
  internalChatMessages: ChatMessage[]; // For external admin dual-chat
}

// Client/Organization interface
export interface Client {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Staff user for company admin management
export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Extended user interface with RBAC
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  clientName?: string;
  avatar?: string;
}

// User interfaces for different portals
export interface ReporterSession {
  ticketId: string;
  pin: string;
  reportId?: string;
}

export interface ExternalAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'external_admin';
}

export interface InternalAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'internal_admin';
  clientId: string;
}

// Form data interfaces
export interface ReportFormData {
  type: ReportType;
  title: string;
  description: string;
  location?: string;
  dateOfIncident?: string;
  involvesPhysicalHarm: boolean;
  involvesLegalViolation: boolean;
  contactEmail?: string;
}

export interface LoginForm {
  ticketId: string;
  pin: string;
}

// Status tracker step
export interface StatusStep {
  status: ReportStatus;
  label: string;
  description: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
