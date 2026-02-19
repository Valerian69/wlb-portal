import { Report, ReportStatus, ChatMessage, Client, StaffUser, UserRole } from '@/types';

// Mock data for development - In production, this would be replaced with actual API calls
export const mockReports: Report[] = [
  {
    id: '1',
    ticketId: 'WLB-2024-001',
    pin: '123456',
    clientSlug: 'acme-corp',
    status: 'in_progress',
    type: 'harassment',
    title: 'Workplace Harassment Incident',
    description: 'Experienced repeated inappropriate comments from a colleague during team meetings over the past month.',
    location: 'Main Office, Floor 3',
    dateOfIncident: '2024-01-15',
    involvesPhysicalHarm: false,
    involvesLegalViolation: false,
    submittedAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-17T14:30:00Z'),
    chatMessages: [
      {
        id: 'msg1',
        sender: 'reporter',
        content: 'Thank you for accepting my report. When can I expect an update?',
        timestamp: new Date('2024-01-16T10:00:00Z'),
      },
      {
        id: 'msg2',
        sender: 'external_admin',
        content: 'We have received your report and are currently reviewing it. We will get back to you within 48 hours.',
        timestamp: new Date('2024-01-16T11:00:00Z'),
      },
    ],
    internalChatMessages: [
      {
        id: 'int1',
        sender: 'external_admin',
        content: 'Client team, please review this case and provide your assessment.',
        timestamp: new Date('2024-01-16T11:05:00Z'),
      },
      {
        id: 'int2',
        sender: 'internal_admin',
        content: 'We have identified the individuals involved. Scheduling interviews for tomorrow.',
        timestamp: new Date('2024-01-17T09:00:00Z'),
      },
    ],
  },
  {
    id: '2',
    ticketId: 'WLB-2024-002',
    pin: '654321',
    clientSlug: 'acme-corp',
    status: 'validated',
    type: 'safety',
    title: 'Unsafe Working Conditions',
    description: 'Fire exit in the warehouse is blocked by stored materials.',
    location: 'Warehouse B',
    dateOfIncident: '2024-01-18',
    involvesPhysicalHarm: false,
    involvesLegalViolation: true,
    submittedAt: new Date('2024-01-18T14:00:00Z'),
    updatedAt: new Date('2024-01-18T16:00:00Z'),
    chatMessages: [],
    internalChatMessages: [],
  },
  {
    id: '3',
    ticketId: 'WLB-2024-003',
    pin: '789012',
    clientSlug: 'techstart-inc',
    status: 'submitted',
    type: 'discrimination',
    title: 'Discriminatory Hiring Practices',
    description: 'Observed patterns of discriminatory language in job postings.',
    submittedAt: new Date('2024-01-19T08:30:00Z'),
    updatedAt: new Date('2024-01-19T08:30:00Z'),
    chatMessages: [],
    internalChatMessages: [],
  },
];

export const statusSteps: { status: ReportStatus; label: string; description: string }[] = [
  { status: 'submitted', label: 'Submitted', description: 'Report received' },
  { status: 'under_review', label: 'Under Review', description: 'Being evaluated' },
  { status: 'validated', label: 'Validated', description: 'Confirmed for action' },
  { status: 'in_progress', label: 'In Progress', description: 'Active investigation' },
  { status: 'resolved', label: 'Resolved', description: 'Issue addressed' },
  { status: 'closed', label: 'Closed', description: 'Case completed' },
];

export const reportTypes: { value: string; label: string; icon: string }[] = [
  { value: 'harassment', label: 'Harassment', icon: '⚠️' },
  { value: 'discrimination', label: 'Discrimination', icon: '🚫' },
  { value: 'safety', label: 'Safety Concern', icon: '🛡️' },
  { value: 'ethics', label: 'Ethics Violation', icon: '⚖️' },
  { value: 'fraud', label: 'Fraud', icon: '💰' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export const mockClients: Client[] = [
  { 
    id: '1', 
    slug: 'acme-corp', 
    name: 'Acme Corporation', 
    primaryColor: '#3b82f6',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  { 
    id: '2', 
    slug: 'techstart-inc', 
    name: 'TechStart Inc.', 
    primaryColor: '#10b981',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    slug: 'global-dynamics',
    name: 'Global Dynamics',
    primaryColor: '#8b5cf6',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    slug: 'initech',
    name: 'Initech',
    primaryColor: '#ef4444',
    isActive: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-20'),
  },
];

// Mock companies for Super Admin CRUD
export const mockCompanies: Client[] = mockClients;

// Mock staff users for Company Admin management
export const mockStaffUsers: StaffUser[] = [
  {
    id: '1',
    email: 'john.doe@acme.com',
    name: 'John Doe',
    role: 'company_admin',
    clientId: 'acme-corp',
    isActive: true,
    lastLogin: new Date('2024-02-19T09:00:00Z'),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'jane.smith@acme.com',
    name: 'Jane Smith',
    role: 'internal_admin',
    clientId: 'acme-corp',
    isActive: true,
    lastLogin: new Date('2024-02-18T14:30:00Z'),
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    email: 'bob.wilson@acme.com',
    name: 'Bob Wilson',
    role: 'internal_admin',
    clientId: 'acme-corp',
    isActive: false,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    email: 'alice@techstart.com',
    name: 'Alice Johnson',
    role: 'company_admin',
    clientId: 'techstart-inc',
    isActive: true,
    lastLogin: new Date('2024-02-19T08:00:00Z'),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    email: 'charlie@techstart.com',
    name: 'Charlie Brown',
    role: 'internal_admin',
    clientId: 'techstart-inc',
    isActive: true,
    lastLogin: new Date('2024-02-17T11:00:00Z'),
    createdAt: new Date('2024-02-05'),
  },
];

// Helper functions for mock data
export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `WLB-${year}-${randomNum}`;
}

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getStatusColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    submitted: 'bg-gray-500',
    under_review: 'bg-yellow-500',
    validated: 'bg-blue-500',
    in_progress: 'bg-purple-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-700',
  };
  return colors[status];
}

export function getStatusBadgeVariant(status: ReportStatus): string {
  const variants: Record<ReportStatus, string> = {
    submitted: 'secondary',
    under_review: 'warning',
    validated: 'info',
    in_progress: 'default',
    resolved: 'success',
    closed: 'outline',
  };
  return variants[status];
}
