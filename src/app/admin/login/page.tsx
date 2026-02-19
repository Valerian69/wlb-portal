'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading...</p></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'super' | 'company' | 'external' | 'internal'>('super');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [superForm, setSuperForm] = useState({ email: '', password: '' });
  const [companyForm, setCompanyForm] = useState({ clientId: '', email: '', password: '' });
  const [externalForm, setExternalForm] = useState({ email: '', password: '' });
  const [internalForm, setInternalForm] = useState({ clientId: '', email: '', password: '' });

  const handleLogin = async (
    e: React.FormEvent,
    email: string,
    password: string,
    redirectRole: string
  ) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Redirect based on role
    const redirect = searchParams.get('redirect');
    if (redirect && redirect.startsWith('/admin')) {
      router.push(redirect);
    } else {
      switch (redirectRole) {
        case 'super_admin':
          router.push('/admin/super');
          break;
        case 'company_admin':
          router.push('/admin/company/staff');
          break;
        case 'external_admin':
          router.push('/admin/external');
          break;
        case 'internal_admin':
          router.push('/admin/internal');
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">W</div>
            <span className="font-semibold text-lg">Whistleblower Portal</span>
          </Link>
          <Link href="/"><Button variant="ghost" size="sm">Back to Home</Button></Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">W</div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400">Select your portal and sign in</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portal Access</CardTitle>
                <Badge variant="outline" className="text-xs">Secure 🔒</Badge>
              </div>
              <CardDescription>Choose your admin portal type</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="super">👑 Super</TabsTrigger>
                  <TabsTrigger value="company">🏢 Company</TabsTrigger>
                  <TabsTrigger value="external">📋 External</TabsTrigger>
                  <TabsTrigger value="internal">👥 Internal</TabsTrigger>
                </TabsList>

                {/* Super Admin Login */}
                <TabsContent value="super" className="space-y-4">
                  <form onSubmit={(e) => handleLogin(e, superForm.email, superForm.password, 'super_admin')}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="super-email">Email</Label>
                        <Input id="super-email" type="email" placeholder="super@admin.com" value={superForm.email} onChange={(e) => setSuperForm({ ...superForm, email: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="super-password">Password</Label>
                        <Input id="super-password" type="password" placeholder="••••••••" value={superForm.password} onChange={(e) => setSuperForm({ ...superForm, password: e.target.value })} disabled={isLoading} required />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in as Super Admin'}</Button>
                    </div>
                  </form>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-gray-500">Demo</span></div></div>
                  <div className="text-xs text-gray-500 space-y-1"><p><strong>Email:</strong> super@admin.com</p><p><strong>Password:</strong> demo123</p></div>
                </TabsContent>

                {/* Company Admin Login */}
                <TabsContent value="company" className="space-y-4">
                  <form onSubmit={(e) => handleLogin(e, companyForm.email, companyForm.password, 'company_admin')}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-client">Organization ID</Label>
                        <Input id="company-client" placeholder="acme-corp" value={companyForm.clientId} onChange={(e) => setCompanyForm({ ...companyForm, clientId: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Email</Label>
                        <Input id="company-email" type="email" placeholder="company@admin.com" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-password">Password</Label>
                        <Input id="company-password" type="password" placeholder="••••••••" value={companyForm.password} onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })} disabled={isLoading} required />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in as Company Admin'}</Button>
                    </div>
                  </form>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-gray-500">Demo</span></div></div>
                  <div className="text-xs text-gray-500 space-y-1"><p><strong>Org:</strong> acme-corp</p><p><strong>Email:</strong> company@admin.com</p><p><strong>Password:</strong> demo123</p></div>
                </TabsContent>

                {/* External Admin Login */}
                <TabsContent value="external" className="space-y-4">
                  <form onSubmit={(e) => handleLogin(e, externalForm.email, externalForm.password, 'external_admin')}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ext-email">Email</Label>
                        <Input id="ext-email" type="email" placeholder="admin@external.com" value={externalForm.email} onChange={(e) => setExternalForm({ ...externalForm, email: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ext-password">Password</Label>
                        <Input id="ext-password" type="password" placeholder="••••••••" value={externalForm.password} onChange={(e) => setExternalForm({ ...externalForm, password: e.target.value })} disabled={isLoading} required />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
                    </div>
                  </form>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-gray-500">Demo</span></div></div>
                  <div className="text-xs text-gray-500 space-y-1"><p><strong>Email:</strong> admin@external.com</p><p><strong>Password:</strong> demo123</p></div>
                </TabsContent>

                {/* Internal Admin Login */}
                <TabsContent value="internal" className="space-y-4">
                  <form onSubmit={(e) => handleLogin(e, internalForm.email, internalForm.password, 'internal_admin')}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="int-client">Organization ID</Label>
                        <Input id="int-client" placeholder="acme-corp" value={internalForm.clientId} onChange={(e) => setInternalForm({ ...internalForm, clientId: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="int-email">Email</Label>
                        <Input id="int-email" type="email" placeholder="admin@internal.com" value={internalForm.email} onChange={(e) => setInternalForm({ ...internalForm, email: e.target.value })} disabled={isLoading} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="int-password">Password</Label>
                        <Input id="int-password" type="password" placeholder="••••••••" value={internalForm.password} onChange={(e) => setInternalForm({ ...internalForm, password: e.target.value })} disabled={isLoading} required />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
                    </div>
                  </form>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-gray-500">Demo</span></div></div>
                  <div className="text-xs text-gray-500 space-y-1"><p><strong>Org:</strong> acme-corp</p><p><strong>Email:</strong> admin@internal.com</p><p><strong>Password:</strong> demo123</p></div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <div className="text-sm text-blue-800 dark:text-blue-400">
                  <p className="font-medium">Secure Admin Access</p>
                  <p className="text-blue-700 dark:text-blue-500 mt-1">Restricted to authorized personnel. All attempts are logged.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Need help? <Link href="/support" className="text-primary hover:underline">Contact Support</Link></p>
            <p>Not an admin? <Link href="/" className="text-primary hover:underline">Reporter Portal</Link></p>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Whistleblower Portal. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/support" className="hover:underline">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
