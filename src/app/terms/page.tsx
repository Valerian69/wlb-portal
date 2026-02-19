'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function TermsOfServicePage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
              <CardDescription>
                Please read these terms carefully before using our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                By accessing or using the Whistleblower Portal ("we," "us," or "our"), you agree to be bound 
                by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use this platform.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">1. Acceptable Use</h2>
              <h3 className="text-lg font-medium">1.1 You Agree to Use This Platform Only For:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Reporting legitimate workplace concerns in good faith</li>
                <li>Providing truthful and accurate information to the best of your knowledge</li>
                <li>Communicating professionally with admin teams</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">1.2 You Agree NOT to:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Submit false, misleading, or malicious reports</li>
                <li>Use the platform for harassment, defamation, or personal vendettas</li>
                <li>Impersonate another person or entity</li>
                <li>Attempt to access another user's reports or credentials</li>
                <li>Interfere with or disrupt the platform's security or functionality</li>
                <li>Use automated systems (bots, scrapers) to access the platform</li>
                <li>Share your Ticket ID and PIN with unauthorized individuals</li>
              </ul>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-400 font-medium">
                  ⚠️ Warning: Submitting false reports may result in disciplinary action and potential legal consequences.
                </p>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">2. Account Security</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Ticket ID and PIN:</strong> You are responsible for maintaining the confidentiality of your credentials</li>
                <li><strong>No Sharing:</strong> Do not share your Ticket ID and PIN with anyone except authorized legal representatives</li>
                <li><strong>Immediate Notification:</strong> Notify us immediately if you suspect unauthorized access</li>
                <li><strong>Secure Storage:</strong> We recommend saving your credentials in a secure location</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">3. Report Content</h2>
              <h3 className="text-lg font-medium">3.1 Your Responsibility</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You are solely responsible for the content of your reports. By submitting a report, you represent that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The information provided is true and accurate to the best of your knowledge</li>
                <li>You have a good faith belief that the reported conduct violates policies or laws</li>
                <li>You have the right to submit this information</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">3.2 Prohibited Content</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Defamatory, libelous, or slanderous statements</li>
                <li>Hate speech, discrimination, or harassment</li>
                <li>Threats of violence or harm</li>
                <li>Personally identifiable information of third parties (unless directly relevant)</li>
                <li>Confidential or proprietary information not related to the report</li>
                <li>Malware, viruses, or harmful code</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">4. Investigation Process</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>No Guarantee of Action:</strong> Submission of a report does not guarantee an investigation will occur</li>
                <li><strong>Discretion:</strong> We reserve the right to determine the appropriate response to each report</li>
                <li><strong>Timeline:</strong> Investigation timelines vary based on complexity and circumstances</li>
                <li><strong>Communication:</strong> We will communicate through the platform's secure messaging system</li>
                <li><strong>Outcome:</strong> Specific disciplinary actions may not be disclosed due to privacy considerations</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">5. Confidentiality</h2>
              <h3 className="text-lg font-medium">5.1 Our Commitment</h3>
              <p className="text-gray-700 dark:text-gray-300">
                We will make reasonable efforts to maintain the confidentiality of your report and identity, subject to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Legal requirements to disclose information</li>
                <li>Necessity of disclosure for effective investigation</li>
                <li>Imminent threats to health or safety</li>
                <li>Court orders or government requests</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">5.2 Your Responsibility</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You agree not to disclose your participation in the investigation to unauthorized parties 
                if doing so could compromise the investigation.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Platform:</strong> The Whistleblower Portal platform, including code, design, and content, is owned by us and protected by intellectual property laws</li>
                <li><strong>Your Content:</strong> You retain ownership of content you submit but grant us a license to use it for investigation purposes</li>
                <li><strong>Trademarks:</strong> All trademarks and logos are property of their respective owners</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">7. Disclaimer of Warranties</h2>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                  FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  We do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-2">
                  <li>The platform will be uninterrupted, secure, or error-free</li>
                  <li>Defects will be corrected</li>
                  <li>The platform is free of viruses or harmful components</li>
                  <li>All reports will result in investigations or specific outcomes</li>
                </ul>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-2">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Personal injury or property damage</li>
                  <li>Reputational harm</li>
                  <li>Employment-related consequences</li>
                  <li>Any damages resulting from unauthorized access to your reports</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED $100 OR THE AMOUNT YOU PAID TO USE THE PLATFORM, WHICHEVER IS GREATER.</strong>
                </p>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">9. Indemnification</h2>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to indemnify, defend, and hold harmless the Whistleblower Portal, its operators, 
                and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Your use of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your submission of false or malicious reports</li>
                <li>Your violation of any rights of another party</li>
              </ul>

              <Separator />

              <h2 className="text-2xl font-semibold">10. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We reserve the right to suspend or terminate your access to the platform at our sole discretion, 
                without notice, for conduct that we believe violates these Terms or is harmful to other users, 
                us, or third parties.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">11. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                where the platform operator is located, without regard to conflict of law principles.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">12. Dispute Resolution</h2>
              <h3 className="text-lg font-medium">12.1 Informal Resolution</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Before filing a claim, you agree to contact us at legal@whistleblowerportal.com to attempt 
                to resolve the dispute informally.
              </p>

              <h3 className="text-lg font-medium mt-4">12.2 Binding Arbitration</h3>
              <p className="text-gray-700 dark:text-gray-300">
                If informal resolution fails, any dispute shall be resolved through binding arbitration in 
                accordance with the rules of the American Arbitration Association.
              </p>

              <h3 className="text-lg font-medium mt-4">12.3 Class Action Waiver</h3>
              <p className="text-gray-700 dark:text-gray-300">
                You agree to resolve disputes on an individual basis and waive any right to participate in 
                class actions or representative proceedings.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">13. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may modify these Terms at any time. Continued use of the platform after changes constitutes 
                acceptance of the new Terms. We will notify users of material changes through the platform.
              </p>

              <Separator />

              <h2 className="text-2xl font-semibold">14. Contact Information</h2>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>For questions about these Terms:</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Email: legal@whistleblowerportal.com
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Address: Legal Department, Whistleblower Portal
                </p>
              </div>

              <Separator />

              <h2 className="text-2xl font-semibold">15. Miscellaneous</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain valid</li>
                <li><strong>Waiver:</strong> Failure to enforce any right does not constitute a waiver</li>
                <li><strong>Assignment:</strong> You may not assign your rights under these Terms</li>
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and us</li>
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
                <Link href="/privacy">
                  <Button variant="outline">Privacy Policy</Button>
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
