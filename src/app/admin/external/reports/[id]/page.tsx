'use client';

import { mockReports, mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { ReportCard } from '@/components/shared/ReportCard';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatMessage, Report } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ExternalReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const report = mockReports.find((r) => r.id === reportId);
  const client = mockClients[0];

  if (!report) {
    return (
      <PortalLayout
        title="Report Not Found"
        clientName={client.name}
        clientColor={client.primaryColor}
        userType="external_admin"
        userName="Admin User"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Report not found</p>
            <Link href="/admin/external">
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

  const handleSendMessageToInternal = (content: string) => {
    // In production, this would call an API
    console.log('Sending to internal:', content);
  };

  return (
    <PortalLayout
      title="Report Details"
      subtitle={`Viewing ${report.ticketId}`}
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="external_admin"
      userName="Admin User"
    >
      <div className="space-y-6">
        <Link href="/admin/external">
          <Button variant="outline" size="sm">← Back to Dashboard</Button>
        </Link>

        <ReportCard report={report} />

        <Card>
          <CardHeader>
            <CardTitle>Status Tracker</CardTitle>
            <CardDescription>Current progress of this report</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTracker currentStatus={report.status} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📬</span> Chat with Reporter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChatWindow
                  messages={report.chatMessages}
                  onSendMessage={handleSendMessage}
                  title=""
                  subtitle="Confidential channel"
                  participantType="external_admin"
                  placeholder="Message the reporter..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>👥</span> Chat with Internal Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChatWindow
                  messages={report.internalChatMessages}
                  onSendMessage={handleSendMessageToInternal}
                  title=""
                  subtitle="Internal coordination"
                  participantType="external_admin"
                  placeholder="Message the internal team..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
