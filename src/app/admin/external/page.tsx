'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getReports, getMessages, sendMessage as sendApiMessage, relayMessage } from '@/lib/api-client';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { ReportCard } from '@/components/shared/ReportCard';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockClients } from '@/lib/mock-data';

export default function ExternalAdminDashboard() {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [reporterMessages, setReporterMessages] = useState<any[]>([]);
  const [internalMessages, setInternalMessages] = useState<any[]>([]);

  const client = mockClients[0];

  // Load reports on mount
  useEffect(() => {
    const loadReports = async () => {
      if (!isAdmin && !isSuperAdmin) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      const result = await getReports();
      
      if (result.data) {
        setReports(result.data);
        if (result.data.length > 0) {
          setSelectedReport(result.data[0]);
        }
      }
      setIsLoading(false);
    };

    loadReports();
  }, [isAdmin, isSuperAdmin, router]);

  // Load messages when report is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedReport) return;

      // Load reporter messages (Room A)
      if (selectedReport.reporterChatRoomId) {
        const reporterResult = await getMessages(selectedReport.reporterChatRoomId);
        if (reporterResult.data) {
          setReporterMessages(reporterResult.data);
        }
      }

      // Load internal messages (Room B)
      if (selectedReport.internalChatRoomId) {
        const internalResult = await getMessages(selectedReport.internalChatRoomId);
        if (internalResult.data) {
          setInternalMessages(internalResult.data);
        }
      }
    };

    loadMessages();
  }, [selectedReport?.id]);

  const handleSendMessageToReporter = async (content: string) => {
    if (!selectedReport || !selectedReport.reporterChatRoomId) return;
    
    const result = await sendApiMessage(
      selectedReport.reporterChatRoomId,
      selectedReport.id,
      content,
      false
    );

    if (result.data) {
      setReporterMessages((prev) => [...prev, result.data]);
    }
  };

  const handleSendMessageToInternal = async (content: string) => {
    if (!selectedReport || !selectedReport.internalChatRoomId) return;
    
    const result = await sendApiMessage(
      selectedReport.internalChatRoomId,
      selectedReport.id,
      content,
      true
    );

    if (result.data) {
      setInternalMessages((prev) => [...prev, result.data]);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // In production, call API to update report status
    setSelectedReport((prev: any) => prev ? { ...prev, status: newStatus } : null);
    setReports((prev) => prev.map((r) => r.id === selectedReport?.id ? { ...r, status: newStatus } : r));
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <PortalLayout
      title="External Admin Dashboard"
      subtitle="Manage reports and coordinate with internal teams"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="external_admin"
      userName={user?.name || 'Admin'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Reports</CardTitle>
                <Badge variant="secondary">{reports.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{report.ticketId}</span>
                        <Badge variant="outline" className="text-xs">
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {report.title}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Button onClick={logout} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {selectedReport ? (
            <>
              <ReportCard report={selectedReport} />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Status Tracker</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track and update report progress
                      </p>
                    </div>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm bg-background"
                      aria-label="Change report status"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="validated">Validated</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <StatusTracker currentStatus={selectedReport.status} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dual-Chat Interface</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Communicate with both the reporter and internal client team
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="reporter">📬 Chat with Reporter</TabsTrigger>
                      <TabsTrigger value="internal">👥 Chat with Internal Team</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="reporter" className="mt-4">
                      <div className="h-[400px]">
                        <ChatWindow
                          messages={reporterMessages}
                          onSendMessage={handleSendMessageToReporter}
                          title="Reporter Communication"
                          subtitle="Confidential channel with the report submitter"
                          participantType="external_admin"
                          placeholder="Message the reporter..."
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="internal" className="mt-4">
                      <div className="h-[400px]">
                        <ChatWindow
                          messages={internalMessages}
                          onSendMessage={handleSendMessageToInternal}
                          title="Internal Team Communication"
                          subtitle="Coordinate with the client's internal team"
                          participantType="external_admin"
                          placeholder="Message the internal team..."
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="hidden xl:grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📬</span> Reporter Chat
                  </h3>
                  <div className="h-[300px]">
                    <ChatWindow
                      messages={reporterMessages}
                      onSendMessage={handleSendMessageToReporter}
                      title=""
                      participantType="external_admin"
                      placeholder="Message the reporter..."
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>👥</span> Internal Team Chat
                  </h3>
                  <div className="h-[300px]">
                    <ChatWindow
                      messages={internalMessages}
                      onSendMessage={handleSendMessageToInternal}
                      title=""
                      participantType="external_admin"
                      placeholder="Message the internal team..."
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p>Select a report from the sidebar to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
