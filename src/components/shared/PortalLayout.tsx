'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PortalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  clientName?: string;
  clientColor?: string;
  userAvatar?: string;
  userName?: string;
  userType: 'reporter' | 'external_admin' | 'internal_admin';
  showNavigation?: boolean;
}

export function PortalLayout({
  children,
  title,
  subtitle,
  clientName,
  clientColor = '#3b82f6',
  userAvatar,
  userName,
  userType,
  showNavigation = true,
}: PortalLayoutProps) {
  const pathname = usePathname();

  const navItems =
    userType === 'reporter'
      ? [{ href: `/portal/${clientName?.toLowerCase().replace(/\s+/g, '-') || 'client'}`, label: 'Submit Report' }]
      : userType === 'external_admin'
      ? [
          { href: '/admin/external', label: 'Dashboard' },
          { href: '/admin/external/reports', label: 'Reports' },
          { href: '/admin/external/settings', label: 'Settings' },
        ]
      : [
          { href: '/admin/internal', label: 'Dashboard' },
          { href: '/admin/internal/reports', label: 'Reports' },
          { href: '/admin/internal/team', label: 'Team' },
        ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-4">
            {/* Client Logo/Name */}
            <div
              className="flex items-center gap-2"
              style={{ color: clientColor }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: clientColor }}
              >
                {clientName?.charAt(0) || 'W'}
              </div>
              <span className="font-semibold text-lg hidden sm:block">{clientName || 'Whistleblower Portal'}</span>
            </div>

            {/* Navigation */}
            {showNavigation && (
              <nav className="hidden md:flex items-center gap-6 ml-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      pathname === item.href ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {userType === 'external_admin' && (
              <Badge variant="outline" className="hidden sm:flex">External Admin</Badge>
            )}
            {userType === 'internal_admin' && (
              <Badge variant="default" className="hidden sm:flex">Internal Team</Badge>
            )}
            {(userType === 'external_admin' || userType === 'internal_admin') && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{userName || 'User'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} {clientName || 'Whistleblower Portal'}. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            {' | '}
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            {' | '}
            <Link href="/support" className="hover:underline">Support</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
