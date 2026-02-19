'use client';

import { Report } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  className?: string;
}

const reportTypeLabels: Record<string, string> = {
  harassment: 'Harassment',
  discrimination: 'Discrimination',
  safety: 'Safety',
  ethics: 'Ethics',
  fraud: 'Fraud',
  other: 'Other',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  validated: 'Validated',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const statusVariants: Record<string, string> = {
  submitted: 'secondary',
  under_review: 'warning',
  validated: 'info',
  in_progress: 'default',
  resolved: 'success',
  closed: 'outline',
};

export function ReportCard({ report, onClick, className }: ReportCardProps) {
  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:shadow-md', className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`View report ${report.ticketId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{report.ticketId}</span>
              <span>•</span>
              <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
            </CardDescription>
          </div>
          <Badge variant={statusVariants[report.status] as any}>
            {statusLabels[report.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {report.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {reportTypeLabels[report.type]}
            </Badge>
            {report.location && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                📍 {report.location}
              </span>
            )}
          </div>
          {(report.involvesPhysicalHarm || report.involvesLegalViolation) && (
            <div className="flex gap-2">
              {report.involvesPhysicalHarm && (
                <Badge variant="destructive" className="text-xs">
                  ⚠️ Physical Harm
                </Badge>
              )}
              {report.involvesLegalViolation && (
                <Badge variant="destructive" className="text-xs">
                  ⚖️ Legal Violation
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
