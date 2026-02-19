'use client';

import { useState } from 'react';
import { ReportFormData, ReportType } from '@/types';
import { reportTypes } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MultiStepFormProps {
  onSubmit: (data: ReportFormData) => void;
  clientSlug: string;
}

const steps = [
  { id: 1, title: 'Report Type', description: 'Select the type of incident' },
  { id: 2, title: 'Details', description: 'Provide incident details' },
  { id: 3, title: 'Additional Info', description: 'Add context and flags' },
  { id: 4, title: 'Contact', description: 'Optional contact information' },
];

export function MultiStepReportForm({ onSubmit, clientSlug }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReportFormData>({
    type: 'other',
    title: '',
    description: '',
    location: '',
    dateOfIncident: '',
    involvesPhysicalHarm: false,
    involvesLegalViolation: false,
    contactEmail: '',
  });

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.type;
      case 2:
        return formData.title.trim() && formData.description.trim();
      case 3:
        return true;
      case 4:
        return true; // Contact is optional
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Anonymous Report</CardTitle>
        <CardDescription>
          Your identity will remain confidential. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            {steps.map((step) => (
              <span
                key={step.id}
                className={cn(currentStep >= step.id ? 'text-primary font-medium' : '')}
              >
                {step.id}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Report Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>What type of incident are you reporting? *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('type', type.value as ReportType)}
                    className={cn(
                      'p-4 border rounded-lg text-center transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary',
                      formData.type === type.value
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                    aria-pressed={formData.type === type.value}
                  >
                    <span className="text-2xl block mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Brief summary of the incident"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Please provide as much detail as possible about what occurred..."
                  className="mt-1 min-h-[150px]"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Where did this occur?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateOfIncident">Date of Incident (Optional)</Label>
                <Input
                  id="dateOfIncident"
                  type="date"
                  value={formData.dateOfIncident}
                  onChange={(e) => updateField('dateOfIncident', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="space-y-3 pt-4">
                <Label>Severity Indicators</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="physicalHarm"
                    checked={formData.involvesPhysicalHarm}
                    onChange={(e) => updateField('involvesPhysicalHarm', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="physicalHarm" className="font-normal cursor-pointer">
                    This incident involves potential physical harm
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="legalViolation"
                    checked={formData.involvesLegalViolation}
                    onChange={(e) => updateField('involvesLegalViolation', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="legalViolation" className="font-normal cursor-pointer">
                    This incident may involve a legal or regulatory violation
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="For follow-up communication if needed"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Providing an email is optional. You can also access updates using your Ticket ID and PIN.
                </p>
              </div>
              <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    🔒 Your Anonymity is Protected
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    This report is submitted anonymously. Save your Ticket ID and PIN to track updates.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext} disabled={!isStepValid()}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!isStepValid()}>
                Submit Report
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
