'use client';

import { useState } from 'react';
import { LoginForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TicketLoginProps {
  onLogin: (ticketId: string, pin: string) => void;
  isLoading?: boolean;
}

export function TicketLogin({ onLogin, isLoading = false }: TicketLoginProps) {
  const [formData, setFormData] = useState<LoginForm>({
    ticketId: '',
    pin: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.ticketId.trim() || !formData.pin.trim()) {
      setError('Please enter both Ticket ID and PIN');
      return;
    }

    if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      setError('PIN must be 6 digits');
      return;
    }

    onLogin(formData.ticketId.trim(), formData.pin);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <CardTitle>Access Your Report</CardTitle>
        <CardDescription>
          Enter your Ticket ID and PIN to view your report status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticketId">Ticket ID</Label>
            <Input
              id="ticketId"
              value={formData.ticketId}
              onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
              placeholder="e.g., WLB-2024-001"
              disabled={isLoading}
              autoComplete="off"
              aria-describedby="ticketId-help"
            />
            <p id="ticketId-help" className="text-xs text-gray-500 dark:text-gray-400">
              Your unique ticket identifier
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              placeholder="••••••"
              maxLength={6}
              disabled={isLoading}
              autoComplete="off"
              aria-describedby="pin-help"
            />
            <p id="pin-help" className="text-xs text-gray-500 dark:text-gray-400">
              6-digit secure PIN
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </>
            ) : (
              'Access Report'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-medium text-sm text-blue-800 dark:text-blue-400 mb-2">
            📋 Where to find your credentials
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-500 space-y-1">
            <li>• Ticket ID and PIN were provided when you submitted your report</li>
            <li>• Check your confirmation email or save screen</li>
            <li>• Keep these credentials secure and private</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
