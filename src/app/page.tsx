'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockClients } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              W
            </div>
            <span className="font-semibold text-lg">Whistleblower Portal</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#features" className="text-sm font-medium text-gray-500 hover:text-primary">
              Features
            </Link>
            <Link href="#portal" className="text-sm font-medium text-gray-500 hover:text-primary">
              Portals
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Safe, Anonymous Reporting for{' '}
            <span className="text-primary">Workplace Concerns</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            A secure platform for employees to report harassment, discrimination, safety concerns,
            and other workplace issues. Your identity is protected, your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/portal/${mockClients[0].slug}`}>
              <Button size="lg" className="w-full sm:w-auto">
                Submit a Report
              </Button>
            </Link>
            <Link href={`/portal/${mockClients[0].slug}`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Check Report Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Use Our Portal?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle>100% Anonymous</CardTitle>
              <CardDescription>
                Your identity is never revealed. Access your report securely with a unique Ticket ID and PIN.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <CardTitle>Secure & Encrypted</CardTitle>
              <CardDescription>
                Enterprise-grade security protects your data. All communications are end-to-end encrypted.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                Monitor the status of your report in real-time. Stay informed every step of the way.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Portal Access Section */}
      <section id="portal" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Select Your Organization</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Choose your organization to access the whistleblower portal. Each organization has its own
          dedicated portal for managing reports.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {mockClients.map((client) => (
            <Link key={client.id} href={`/portal/${client.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mb-2"
                    style={{ backgroundColor: client.primaryColor }}
                  >
                    {client.name.charAt(0)}
                  </div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>
                    Access the anonymous reporting portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" style={{ backgroundColor: client.primaryColor }}>
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin Links */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">Admin Access</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/admin/login">
            <Button variant="outline">🔐 Admin Login</Button>
          </Link>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Restricted to authorized personnel only
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Whistleblower Portal. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/support" className="hover:underline">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
