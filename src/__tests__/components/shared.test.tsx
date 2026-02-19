/**
 * Component Tests
 * Tests for shared UI components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { ReportCard } from '@/components/shared/ReportCard';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { Report, ReportStatus, ChatMessage } from '@/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('StatusTracker', () => {
  const mockSteps = [
    { status: 'submitted', label: 'Submitted', description: 'Report received' },
    { status: 'under_review', label: 'Under Review', description: 'Being evaluated' },
    { status: 'validated', label: 'Validated', description: 'Confirmed for action' },
    { status: 'in_progress', label: 'In Progress', description: 'Active investigation' },
    { status: 'resolved', label: 'Resolved', description: 'Issue addressed' },
    { status: 'closed', label: 'Closed', description: 'Case completed' },
  ];

  it('should render all status steps', () => {
    render(<StatusTracker currentStatus="submitted" steps={mockSteps} />);

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Validated')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should highlight current status', () => {
    render(<StatusTracker currentStatus="in_progress" steps={mockSteps} />);

    const inProgressElement = screen.getByText('In Progress');
    expect(inProgressElement).toBeInTheDocument();
  });

  it('should show checkmarks for completed steps', () => {
    render(<StatusTracker currentStatus="resolved" steps={mockSteps} />);

    // Steps before current should have checkmarks
    const submittedStep = screen.getByText('Submitted');
    expect(submittedStep).toBeInTheDocument();
  });

  it('should use default steps when not provided', () => {
    render(<StatusTracker currentStatus="submitted" />);

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });
});

describe('ReportCard', () => {
  const mockReport: Report = {
    id: '1',
    ticketId: 'WLB-2024-001',
    pin: '123456',
    clientSlug: 'acme-corp',
    status: 'in_progress',
    type: 'harassment',
    title: 'Workplace Harassment Incident',
    description: 'Experienced repeated inappropriate comments from a colleague during team meetings.',
    location: 'Main Office, Floor 3',
    dateOfIncident: '2024-01-15',
    involvesPhysicalHarm: false,
    involvesLegalViolation: false,
    submittedAt: new Date('2024-01-16T09:00:00Z'),
    updatedAt: new Date('2024-01-17T14:30:00Z'),
    chatMessages: [],
    internalChatMessages: [],
  };

  it('should render report information', () => {
    render(<ReportCard report={mockReport} />);

    expect(screen.getByText('Workplace Harassment Incident')).toBeInTheDocument();
    expect(screen.getByText('WLB-2024-001')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText(/Main Office, Floor 3/)).toBeInTheDocument();
  });

  it('should display report type badge', () => {
    render(<ReportCard report={mockReport} />);

    expect(screen.getByText('Harassment')).toBeInTheDocument();
  });

  it('should show physical harm warning when applicable', () => {
    const reportWithHarm = {
      ...mockReport,
      involvesPhysicalHarm: true,
    };

    render(<ReportCard report={reportWithHarm} />);

    expect(screen.getByText(/Physical Harm/)).toBeInTheDocument();
  });

  it('should show legal violation warning when applicable', () => {
    const reportWithLegal = {
      ...mockReport,
      involvesLegalViolation: true,
    };

    render(<ReportCard report={reportWithLegal} />);

    expect(screen.getByText(/Legal Violation/)).toBeInTheDocument();
  });

  it('should be clickable', () => {
    const onClick = jest.fn();
    render(<ReportCard report={mockReport} onClick={onClick} />);

    fireEvent.click(screen.getByText('Workplace Harassment Incident'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    const onClick = jest.fn();
    render(<ReportCard report={mockReport} onClick={onClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });
});

describe('ChatWindow', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      sender: 'reporter',
      content: 'Hello, I need help with my report.',
      timestamp: new Date('2024-01-16T10:00:00Z'),
    },
    {
      id: '2',
      sender: 'external_admin',
      content: 'We have received your report and are reviewing it.',
      timestamp: new Date('2024-01-16T11:00:00Z'),
    },
  ];

  it('should render chat messages', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={jest.fn()}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    expect(screen.getByText('Hello, I need help with my report.')).toBeInTheDocument();
    expect(screen.getByText('We have received your report and are reviewing it.')).toBeInTheDocument();
  });

  it('should render chat title and subtitle', () => {
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={jest.fn()}
        title="Reporter Communication"
        subtitle="Confidential channel"
        participantType="external_admin"
      />
    );

    expect(screen.getByText('Reporter Communication')).toBeInTheDocument();
    expect(screen.getByText('Confidential channel')).toBeInTheDocument();
  });

  it('should show empty state when no messages', () => {
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={jest.fn()}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start the conversation')).toBeInTheDocument();
  });

  it('should allow sending messages', async () => {
    const onSendMessage = jest.fn();
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={onSendMessage}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    const textarea = screen.getByLabelText('Chat message input');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should send message on Enter key', () => {
    const onSendMessage = jest.fn();
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={onSendMessage}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    const textarea = screen.getByLabelText('Chat message input');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send empty messages', () => {
    const onSendMessage = jest.fn();
    render(
      <ChatWindow
        messages={[]}
        onSendMessage={onSendMessage}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should show disabled state', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={jest.fn()}
        title="Test Chat"
        participantType="external_admin"
        disabled={true}
      />
    );

    expect(screen.getByText('Read-only')).toBeInTheDocument();
    const textarea = screen.getByLabelText('Chat message input');
    expect(textarea).toBeDisabled();
  });

  it('should display sender labels correctly', () => {
    render(
      <ChatWindow
        messages={mockMessages}
        onSendMessage={jest.fn()}
        title="Test Chat"
        participantType="external_admin"
      />
    );

    expect(screen.getByText(/Reporter/)).toBeInTheDocument();
    expect(screen.getByText(/External Admin/)).toBeInTheDocument();
  });
});
