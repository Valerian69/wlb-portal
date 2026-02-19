'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a support API
    console.log('Support request:', formData);
    setSubmitted(true);
  };

  const faqs = [
    {
      question: 'How do I submit an anonymous report?',
      answer: 'Navigate to your organization\'s portal page, click "Submit Report," and follow the 4-step process. Your identity will remain confidential unless you choose to provide contact information.'
    },
    {
      question: 'What happens after I submit a report?',
      answer: 'Your report is reviewed by our external admin team. You can track the status using your Ticket ID and PIN. The report goes through: Submitted → Under Review → Validated → In Progress → Resolved → Closed.'
    },
    {
      question: 'How do I check the status of my report?',
      answer: 'Go to your organization\'s portal, click "View Status," and enter your Ticket ID and 6-digit PIN that were provided when you submitted your report.'
    },
    {
      question: 'Can I communicate with the investigation team?',
      answer: 'Yes! Once you log in with your Ticket ID and PIN, you can use the secure messaging system to communicate with the external admin team handling your report.'
    },
    {
      question: 'What if I forget my Ticket ID or PIN?',
      answer: 'For security reasons, we cannot recover lost credentials. Keep your Ticket ID and PIN in a secure location. If you lose them, you won\'t be able to access your report or receive updates.'
    },
    {
      question: 'Is my report really anonymous?',
      answer: 'Yes. We do not collect IP addresses, device information, or location data. Your report is only accessible with your unique Ticket ID and PIN. See our Privacy Policy for details.'
    },
    {
      question: 'What types of issues can I report?',
      answer: 'You can report harassment, discrimination, safety concerns, ethics violations, fraud, and other workplace misconduct. See the Report Types section on the submission page.'
    },
    {
      question: 'Can I update my report after submission?',
      answer: 'Yes. Log in with your Ticket ID and PIN, then use the messaging system to provide additional information or updates to your report.'
    },
    {
      question: 'How long does an investigation take?',
      answer: 'Investigation timelines vary based on complexity. Simple cases may be resolved in days, while complex investigations can take weeks or months. You\'ll receive updates through the messaging system.'
    },
    {
      question: 'What if I face retaliation?',
      answer: 'Retaliation is strictly prohibited. If you experience retaliation, report it immediately through the platform. This is treated as a serious violation.'
    },
  ];

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
            <h1 className="text-4xl font-bold tracking-tight">Support Center</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We're here to help. Find answers or contact our support team.
            </p>
          </div>

          {/* Emergency Banner */}
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🚨</div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400">Emergency Situations</h3>
                  <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                    If you're experiencing an emergency or immediate danger, please contact local emergency services (911 or your local equivalent) immediately. 
                    This platform is not monitored 24/7 and should not be used for emergencies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📋 Submit a Report</CardTitle>
                <CardDescription>Start a new anonymous report</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/portal/acme-corp">
                  <Button className="w-full">Go to Portal</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🔍 Check Status</CardTitle>
                <CardDescription>View your report status</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/portal/acme-corp">
                  <Button variant="outline" className="w-full">Check Status</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📧 Email Support</CardTitle>
                <CardDescription>Get help via email</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:support@whistleblowerportal.com">
                  <Button variant="outline" className="w-full">Email Us</Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions and answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <h3 className="font-medium text-lg">{faq.question}</h3>
                        <span className="transition group-open:rotate-180">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                        {faq.answer}
                      </p>
                    </details>
                    {index < faqs.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Have a question that's not answered in our FAQs? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-400">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    We'll get back to you within 24-48 hours.
                  </p>
                  <Button onClick={() => setSubmitted(false)} className="mt-4" variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your question or concern..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="consent" required className="h-4 w-4" />
                    <Label htmlFor="consent" className="font-normal text-sm">
                      I agree to be contacted regarding my support request
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📖 Privacy Policy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Learn how we protect your anonymity and handle your data.
                  </p>
                  <Link href="/privacy">
                    <Button variant="outline" size="sm">Read Privacy Policy</Button>
                  </Link>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📜 Terms of Service</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Understand your rights and responsibilities when using the platform.
                  </p>
                  <Link href="/terms">
                    <Button variant="outline" size="sm">Read Terms</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:support@whistleblowerportal.com" className="text-sm text-primary hover:underline">
                      support@whistleblowerportal.com
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-medium">Phone (Business Hours)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +1 (555) 123-4567 (Mon-Fri, 9am-5pm EST)
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏢</span>
                  <div>
                    <p className="font-medium">Mailing Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Whistleblower Portal Support<br />
                      123 Secure Street, Suite 100<br />
                      Privacy City, PC 12345
                    </p>
                  </div>
                </div>
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
