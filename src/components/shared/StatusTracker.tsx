'use client';

import { ReportStatus, StatusStep } from '@/types';
import { statusSteps as defaultStatusSteps } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface StatusTrackerProps {
  currentStatus: ReportStatus;
  steps?: StatusStep[];
  className?: string;
}

export function StatusTracker({ currentStatus, steps = defaultStatusSteps, className }: StatusTrackerProps) {
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%` }}
        />
        
        {/* Status steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-gray-300 dark:border-gray-600 text-gray-400',
                    isCurrent && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-950'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${step.label}: ${step.description}`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn('text-xs font-medium', isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400')}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
