'use client';

import { mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ExternalSettingsPage() {
  const client = mockClients[0];

  return (
    <PortalLayout
      title="Settings"
      subtitle="Manage your account and notification preferences"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="external_admin"
      userName="Admin User"
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="User" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@external.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newReports">New Report Alerts</Label>
                <p className="text-sm text-gray-500">Get notified when a new report is submitted</p>
              </div>
              <input type="checkbox" id="newReports" defaultChecked className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailDigest">Email Digest</Label>
                <p className="text-sm text-gray-500">Receive daily summary of all reports</p>
              </div>
              <input type="checkbox" id="emailDigest" className="h-4 w-4" />
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
