'use client';

import { mockReports, mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { ReportCard } from '@/components/shared/ReportCard';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function InternalReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  
  const report = mockReports.find((r) => r.id === reportId);
  const client = mockClients[0];
  const [noteContent, setNoteContent] = useState('');

  if (!report || !['validated', 'in_progress', 'resolved'].includes(report.status)) {
    return (
      <PortalLayout
        title="Report Not Found"
        clientName={client.name}
        clientColor={client.primaryColor}
        userType="internal_admin"
        userName="Internal Team"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Report not found or not accessible to internal team
            </p>
            <Link href="/admin/internal">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </PortalLayout>
    );
  }

  const handleSendMessage = (content: string) => {
    // In production, this would call an API
    console.log('Sending message:', content);
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    console.log('Adding note:', noteContent);
    setNoteContent('');
  };

  return (
    <PortalLayout
      title="Report Details"
      subtitle={`Viewing ${report.ticketId}`}
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="internal_admin"
      userName="Internal Team"
    >
      <div className="space-y-6">
        <Link href="/admin/internal">
          <Button variant="outline" size="sm">← Back to Dashboard</Button>
        </Link>

        <ReportCard report={report} />

        <Card>
          <CardHeader>
            <CardTitle>Report Status</CardTitle>
            <CardDescription>Current progress (managed by external admin)</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTracker currentStatus={report.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Note</CardTitle>
            <CardDescription>Add a note visible to external admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Type your internal note..."
              className="w-full min-h-[100px] p-3 border rounded-md text-sm bg-background"
            />
            <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
              Add Note
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>Chat with the external admin team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ChatWindow
                messages={report.chatMessages}
                onSendMessage={handleSendMessage}
                title="External Admin Team"
                subtitle="Secure channel for report coordination"
                participantType="internal_admin"
                placeholder="Message the external admin team..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
