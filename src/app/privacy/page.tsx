'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/">
              <Button variant="ghost" size="sm">Back to Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
              <CardDescription>
                Your privacy and anonymity are our top priorities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                This Privacy Policy explains how the Whistleblower Portal ("we," "us," or "our") collects, uses, 
                discloses, and protects your information when you use our anonymous reporting platform. 
                We are committed to ensuring your reports remain confidential and your identity is protected.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium">1.1 Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Report Content:</strong> Details you include in your reports (incident descriptions, locations, dates, involved parties)</li>
                <li><strong>Optional Contact Information:</strong> Email address if you choose to provide it for follow-up communication</li>
                <li><strong>Attachments:</strong> Any documents, images, or files you upload with your report</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">1.2 Information We Do NOT Collect</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Your IP address is not stored with your report</li>
                <li>Browser fingerprinting data is not collected</li>
                <li>Device identifiers are not tracked</li>
                <li>Location data beyond what you voluntarily provide</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">1.2 Automatically Generated Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Ticket ID:</strong> Unique identifier for your report (e.g., WLB-2024-001)</li>
                <li><strong>PIN:</strong> 6-digit secure access code</li>
                <li><strong>Timestamps:</strong> Date and time of report submission and updates</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We use the information we collect solely for the purpose of:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Processing and investigating your reports</li>
                <li>Communicating with you through secure channels</li>
                <li>Providing status updates on your reports</li>
                <li>Maintaining the security and integrity of the platform</li>
                <li>Complying with legal obligations</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">3. Anonymity Guarantees</h2>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-400">
                  🔒 Your Identity is Protected
                </h3>
                <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-500 ml-4">
                  <li><strong>Anonymous by Default:</strong> Reports are submitted without identifying information unless you choose to provide it</li>
                  <li><strong>Secure Access:</strong> Only you can access your report using your unique Ticket ID and PIN</li>
                  <li><strong>No IP Tracking:</strong> We do not store IP addresses or device information</li>
                  <li><strong>Encrypted Communication:</strong> All messages are encrypted in transit and at rest</li>
                  <li><strong>Limited Access:</strong> Only authorized external admins and relevant internal team members can view reports</li>
                </ul>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your report information may be shared only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>External Admin Team:</strong> Our team manages and coordinates investigations</li>
                <li><strong>Internal Client Team:</strong> Only validated reports are shared with the relevant organization's internal team</li>
                <li><strong>Legal Requirements:</strong> If required by law, court order, or government regulation</li>
                <li><strong>Safety Concerns:</strong> If there is an imminent threat to physical safety, limited information may be disclosed to prevent harm</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                <strong>We never sell, rent, or trade your information to third parties.</strong>
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">5. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted using TLS/SSL during transmission</li>
                <li><strong>Secure Storage:</strong> Data is stored in encrypted databases with access controls</li>
                <li><strong>Access Controls:</strong> Role-based access limits who can view reports</li>
                <li><strong>Audit Logs:</strong> All access to reports is logged for security monitoring</li>
                <li><strong>Regular Security Audits:</strong> We conduct periodic security assessments</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">6. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We retain report data according to the following guidelines:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Active Reports:</strong> Retained indefinitely while the case is open</li>
                <li><strong>Closed Reports:</strong> Retained for 7 years from the date of closure</li>
                <li><strong>Deleted Reports:</strong> Permanently deleted upon request or after retention period expires</li>
                <li><strong>Chat Messages:</strong> Retained for the same period as the associated report</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">7. Your Rights</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Depending on your jurisdiction, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Access:</strong> Request access to your report data using your Ticket ID and PIN</li>
                <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your report (subject to legal retention requirements)</li>
                <li><strong>Export:</strong> Request a copy of your report data in a portable format</li>
                <li><strong>Withdrawal:</strong> Withdraw your report at any time before investigation begins</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Our platform is intended for use by adults in a workplace or organizational context. 
                We do not knowingly collect information from individuals under the age of 16. 
                If you believe a minor has submitted a report, please contact us immediately.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">9. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your information may be processed in countries outside your jurisdiction. 
                We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Standard contractual clauses for data transfers</li>
                <li>Compliance with GDPR, CCPA, and other applicable privacy regulations</li>
                <li>Data processing agreements with all service providers</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Notifying users through the platform for significant changes</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                Your continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">11. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> privacy@whistleblowerportal.com
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Address:</strong> Privacy Office, Whistleblower Portal
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Response Time:</strong> We will respond within 30 days
                </p>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">12. Regulatory Authorities</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you believe your privacy rights have been violated, you may file a complaint with your local 
                data protection authority:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>EU/UK:</strong> Your national Data Protection Authority</li>
                <li><strong>USA:</strong> Federal Trade Commission (FTC) or state attorney general</li>
                <li><strong>Canada:</strong> Office of the Privacy Commissioner of Canada</li>
                <li><strong>Australia:</strong> Office of the Australian Information Commissioner</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/terms">
                  <Button variant="outline">Terms of Service</Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline">Support Center</Button>
                </Link>
                <Link href="/">
                  <Button>Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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
