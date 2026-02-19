'use client';

import { mockReports, mockClients } from '@/lib/mock-data';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { ReportCard } from '@/components/shared/ReportCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InternalReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const client = mockClients[0];
  
  // Filter to only validated reports for internal team
  const reports = mockReports.filter((r) => 
    ['validated', 'in_progress', 'resolved'].includes(r.status)
  );

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout
      title="Reports"
      subtitle="View and manage validated reports"
      clientName={client.name}
      clientColor={client.primaryColor}
      userType="internal_admin"
      userName="Internal Team"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Reports</CardTitle>
            <CardDescription>Find reports by title or ticket ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                <p>No reports found</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Link key={report.id} href={`/admin/internal/reports/${report.id}`}>
                <ReportCard report={report} />
              </Link>
            ))
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
