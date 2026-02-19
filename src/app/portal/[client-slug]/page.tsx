'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ReportFormData as ReportFormDataType } from '@/types';
import { mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { MultiStepReportForm } from '@/components/portal/MultiStepReportForm';
import { TicketLogin } from '@/components/portal/TicketLogin';
import { StatusTracker } from '@/components/shared/StatusTracker';
import { ReportCard } from '@/components/shared/ReportCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createReport, loginReporter, getMessages, sendMessage } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWindow } from '@/components/shared/ChatWindow';

export default function ReporterPortalPage() {
  const params = useParams();
  const clientSlug = params['client-slug'] as string;
  const { loginReporter: authLogin, isReporter, logout } = useAuth();
  
  const client = mockClients.find((c) => c.slug === clientSlug) || mockClients[0];
  
  const [activeTab, setActiveTab] = useState('submit');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentReport, setCurrentReport] = useState<any | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ ticketId: string; pin: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [reporterChatRoomId, setReporterChatRoomId] = useState<string | null>(null);

  const handleFormSubmit = async (data: ReportFormDataType) => {
    setIsLoading(true);
    
    const result = await createReport({
      type: data.type,
      title: data.title,
      description: data.description,
      location: data.location,
      dateOfIncident: data.dateOfIncident,
      involvesPhysicalHarm: data.involvesPhysicalHarm,
      involvesLegalViolation: data.involvesLegalViolation,
      clientId: client.id,
    });

    if (result.error) {
      alert(`Failed to create report: ${result.error}`);
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setNewCredentials({ ticketId: result.data.ticketId, pin: result.data.pin });
      setShowConfirmation(true);
      setIsLoading(false);
    }
  };

  const handleLogin = async (ticketId: string, pin: string) => {
    setIsLoading(true);
    setLoginError('');
    
    const result = await authLogin(ticketId, pin);
    
    if (result.error) {
      setLoginError(result.error);
      setIsLoading(false);
      return { success: false };
    }

    if (result.data) {
      setCurrentReport(result.data.report);
      setReporterChatRoomId(result.data.reporterChatRoomId);
      setIsLoggedIn(true);
      setActiveTab('status');
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false };
  };

  const handleSendMessage = async (content: string) => {
    if (!currentReport || !reporterChatRoomId) return;
    
    const result = await sendMessage(reporterChatRoomId, currentReport.id, content);
    
    if (result.error) {
      alert(`Failed to send message: ${result.error}`);
      return;
    }

    // Refresh messages
    if (result.data) {
      setCurrentReport((prev: any) => ({
        ...prev,
        chatMessages: [...(prev.chatMessages || []), result.data],
      }));
    }
  };

  const loadMessages = async () => {
    if (!reporterChatRoomId) return [];
    const result = await getMessages(reporterChatRoomId);
    return result.data || [];
  };

  return (
    <PortalLayout
      title="Whistleblower Portal"
      subtitle="Safe, anonymous reporting for workplace concerns"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="reporter"
      showNavigation={false}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="submit">Submit Report</TabsTrigger>
          <TabsTrigger value="status">View Status</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <MultiStepReportForm onSubmit={handleFormSubmit} clientSlug={clientSlug} />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {!isLoggedIn ? (
            <TicketLogin onLogin={handleLogin} isLoading={isLoading} />
          ) : currentReport ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <ReportCard report={currentReport} />
                <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Report Status</CardTitle>
                  <CardDescription>Track the progress of your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <StatusTracker currentStatus={currentReport.status} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                  <CardDescription>
                    Message the admin team about your report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ChatWindow
                      messages={currentReport.chatMessages || []}
                      onSendMessage={handleSendMessage}
                      title="Admin Team"
                      subtitle="Secure confidential channel"
                      participantType="reporter"
                      placeholder="Type your message..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
          
          {loginError && (
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <p className="text-red-600 dark:text-red-400 text-sm">{loginError}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 dark:text-green-400">
              ✓ Report Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              Your report has been submitted anonymously
            </DialogDescription>
          </DialogHeader>
          
          {newCredentials && (
            <div className="space-y-4">
              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-3">
                    🔐 Save Your Credentials
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ticket ID:</span>
                      <span className="font-mono font-medium">{newCredentials.ticketId}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">PIN:</span>
                      <span className="font-mono font-medium">{newCredentials.pin}</span>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-3">
                    You will need these credentials to check the status of your report.
                  </p>
                </CardContent>
              </Card>
              
              <Button onClick={() => { setShowConfirmation(false); setActiveTab('status'); }} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
