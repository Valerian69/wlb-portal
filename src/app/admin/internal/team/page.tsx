'use client';

import { mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const teamMembers = [
  { id: '1', name: 'Sarah Johnson', role: 'HR Director', email: 'sarah.j@company.com' },
  { id: '2', name: 'Michael Chen', role: 'Compliance Officer', email: 'm.chen@company.com' },
  { id: '3', name: 'Emily Davis', role: 'Legal Counsel', email: 'e.davis@company.com' },
];

export default function InternalTeamPage() {
  const client = mockClients[0];

  return (
    <PortalLayout
      title="Team"
      subtitle="Internal team members with access to reports"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="internal_admin"
      userName="Internal Team"
    >
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Internal Team Members</CardTitle>
            <CardDescription>
              These team members have access to validated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={member.id}>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  {index < teamMembers.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <h4 className="font-medium text-blue-800 dark:text-blue-400">
              ℹ️ Team Access Information
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-500 mt-2">
              Only validated reports are visible to the internal team. For access to other
              reports or to add team members, please contact the external admin team.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
