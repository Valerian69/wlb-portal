'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getReports, getMessages, sendMessage } from '@/lib/api-client';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { ReportCard } from '@/components/shared/ReportCard';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockClients } from '@/lib/mock-data';

const VALIDATED_STATUSES = ['validated', 'in_progress', 'resolved'];

export default function InternalAdminDashboard() {
  const { user, logout, isCompanyAdmin, isAdmin } = useAuth();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const client = mockClients.find((c) => c.slug === user?.clientId) || mockClients[0];

  useEffect(() => {
    const loadReports = async () => {
      if (!isAdmin && !isCompanyAdmin) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(true);
      const result = await getReports();
      
      if (result.data) {
        // Filter to only validated reports for internal team
        const validatedReports = result.data.filter((r) => 
          VALIDATED_STATUSES.includes(r.status)
        );
        setReports(validatedReports);
      }
      setIsLoading(false);
    };

    loadReports();
  }, [isAdmin, isCompanyAdmin, router]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedReport || !selectedReport.internalChatRoomId) return;

      const result = await getMessages(selectedReport.internalChatRoomId);
      if (result.data) {
        setMessages(result.data);
      }
    };

    loadMessages();
  }, [selectedReport?.id]);

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (content: string) => {
    if (!selectedReport || !selectedReport.internalChatRoomId) return;
    
    const result = await sendMessage(
      selectedReport.internalChatRoomId,
      selectedReport.id,
      content,
      true
    );

    if (result.data) {
      setMessages((prev) => [...prev, result.data]);
    }
  };

  const handleAddInternalNote = async () => {
    if (!selectedReport || !noteContent.trim() || !selectedReport.internalChatRoomId) return;
    
    const result = await sendMessage(
      selectedReport.internalChatRoomId,
      selectedReport.id,
      `📝 Internal Note: ${noteContent}`,
      true
    );

    if (result.data) {
      setMessages((prev) => [...prev, result.data]);
      setNoteContent('');
      setShowAddNoteDialog(false);
    }
  };

  if (!isAdmin && !isCompanyAdmin) {
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
      title="Internal Admin Dashboard"
      subtitle="View validated reports and communicate with the external admin team"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="internal_admin"
      userName={user?.name || 'Internal Team'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Validated Reports</CardTitle>
                <Badge variant="default">{reports.length}</Badge>
              </div>
              <div className="mt-3">
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                  aria-label="Search reports"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-2">
                  {filteredReports.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No reports found
                    </p>
                  ) : (
                    filteredReports.map((report) => (
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
                          <Badge
                            variant={
                              report.status === 'validated'
                                ? 'default'
                                : report.status === 'in_progress'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs"
                          >
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {report.title}
                        </p>
                        {report.involvesPhysicalHarm || report.involvesLegalViolation ? (
                          <div className="flex gap-1 mt-2">
                            {report.involvesPhysicalHarm && (
                              <span className="text-xs text-red-500">⚠️</span>
                            )}
                            {report.involvesLegalViolation && (
                              <span className="text-xs text-orange-500">⚖️</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-400 text-sm">
                ℹ️ Internal Team Access
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
                You can only view validated reports. Contact the external admin team
                for access to other reports or to request status changes.
              </p>
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
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedReport.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="font-mono">{selectedReport.ticketId}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>Submitted: {new Date(selectedReport.submittedAt).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          selectedReport.status === 'validated'
                            ? 'default'
                            : selectedReport.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {selectedReport.status.replace('_', ' ')}
                      </Badge>
                      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            📝 Add Note
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Internal Note</DialogTitle>
                            <DialogDescription>
                              Add an internal note to this report. This will be visible to the external admin team.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <textarea
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              placeholder="Type your internal note..."
                              className="w-full min-h-[100px] p-3 border rounded-md text-sm bg-background"
                              aria-label="Internal note content"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddInternalNote} disabled={!noteContent.trim()}>
                                Add Note
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedReport.description}
                      </p>
                    </div>
                    
                    {(selectedReport.location || selectedReport.dateOfIncident) && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedReport.location && (
                          <div>
                            <h4 className="font-medium text-sm">Location</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedReport.location}
                            </p>
                          </div>
                        )}
                        {selectedReport.dateOfIncident && (
                          <div>
                            <h4 className="font-medium text-sm">Date of Incident</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(selectedReport.dateOfIncident).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedReport.involvesPhysicalHarm || selectedReport.involvesLegalViolation) && (
                      <div className="flex gap-2">
                        {selectedReport.involvesPhysicalHarm && (
                          <Badge variant="destructive" className="text-xs">
                            ⚠️ Physical Harm
                          </Badge>
                        )}
                        {selectedReport.involvesLegalViolation && (
                          <Badge variant="destructive" className="text-xs">
                            ⚖️ Legal Violation
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Report Status</CardTitle>
                  <CardDescription>
                    Current progress of this report (updated by external admin)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusTracker currentStatus={selectedReport.status} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Communication</CardTitle>
                      <CardDescription>
                        Chat with the external admin team about this report
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      🔒 Confidential
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <ChatWindow
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      title="External Admin Team"
                      subtitle="Secure channel for report coordination"
                      participantType="internal_admin"
                      placeholder="Message the external admin team..."
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium">Select a report to view details</p>
                <p className="text-sm mt-1">
                  Only validated reports are visible to the internal team
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
