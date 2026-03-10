'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { APP_NAME, NAVIGATION_ITEMS } from '@/lib/constants';
import { useProjects, useTasks, useTeam } from '@/lib/hooks';
import { CommandPalette } from '@varity-labs/ui-kit';
import { Menu, X } from 'lucide-react';

// Conditionally import Privy/UI-Kit components
let DashboardLayout: any = null;
let PrivyProtectedRoute: any = null;
let PrivyStackComponent: any = null;
let usePrivyHook: any = null;

try {
  const uiKit = require('@varity-labs/ui-kit');
  DashboardLayout = uiKit.DashboardLayout;
  PrivyProtectedRoute = uiKit.PrivyProtectedRoute;
  PrivyStackComponent = uiKit.PrivyStack;
  usePrivyHook = uiKit.usePrivy;
} catch {}

function RedirectToLogin() {
  const router = useRouter();
  useEffect(() => {
    router.push('/login');
  }, [router]);
  return null;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

function MobileNav({
  open,
  onToggle,
  onClose,
  navItems,
  userEmail,
  onLogout,
  onNavigate,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  navItems: { path: string; label: string; active: boolean }[];
  userEmail: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-[60] rounded-lg bg-white p-2 shadow-md border border-gray-200"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/50" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-[56] w-64 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 pt-16">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{APP_NAME}</h2>
                <p className="text-sm text-gray-500">{userEmail || 'Not signed in'}</p>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { onNavigate(item.path); onClose(); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 border-t border-gray-200 pt-4">
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- conditional on require() success, stable across renders
  const privy = usePrivyHook ? usePrivyHook() : { user: null, logout: async () => {} };
  const { user, logout } = privy;
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Data for command palette search
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks();
  const { data: team } = useTeam();

  // Cmd+K / Ctrl+K keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navWithActive = NAVIGATION_ITEMS.map((item) => ({
    ...item,
    active: item.path === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === item.path || pathname.startsWith(item.path + '/'),
  }));

  const userName = user?.email?.address?.split('@')[0] || 'User';
  const userEmail = user?.email?.address || '';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Fallback layout when DashboardLayout from ui-kit isn't available
  if (!DashboardLayout) {
    return (
      <>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onNavigate={(path: string) => router.push(path)}
          projects={projects}
          tasks={tasks}
          team={team}
        />
        <div className="flex min-h-screen">
          {/* Simple sidebar */}
          {!isMobile && (
            <div className="w-64 shrink-0 border-r border-gray-200 bg-white">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">{APP_NAME}</h2>
                <p className="text-sm text-gray-500">{userEmail || 'Not signed in'}</p>
              </div>
              <nav className="px-3 space-y-1">
                {navWithActive.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 px-3 border-t border-gray-200 pt-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {isMobile && (
            <MobileNav
              open={mobileMenuOpen}
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              onClose={() => setMobileMenuOpen(false)}
              navItems={navWithActive}
              userEmail={userEmail}
              onLogout={handleLogout}
              onNavigate={(path) => router.push(path)}
            />
          )}

          <main className={`flex-1 bg-gray-50 p-6 ${isMobile ? 'pt-16' : ''}`}>
            {children}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(path: string) => router.push(path)}
        projects={projects}
        tasks={tasks}
        team={team}
      />

      {isMobile && (
        <MobileNav
          open={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onClose={() => setMobileMenuOpen(false)}
          navItems={navWithActive}
          userEmail={userEmail}
          onLogout={handleLogout}
          onNavigate={(path) => router.push(path)}
        />
      )}

      {/* Desktop layout */}
      <div className={isMobile ? '[&>div>div:first-child]:hidden' : ''}>
        <DashboardLayout
          companyName={APP_NAME}
          logoUrl="/logo.svg"
          navigationItems={navWithActive}
          showSidebar={!isMobile}
          user={{
            name: userName,
            address: userEmail,
          }}
          onLogout={handleLogout}
          onNavigateToProfile={() => router.push('/dashboard/settings')}
          onNavigateToSettings={() => router.push('/dashboard/settings')}
          onSearchClick={() => setCommandPaletteOpen(true)}
          searchPlaceholder="Search projects, tasks, team..."
        >
          <div className={isMobile ? 'pt-14' : ''}>
            {children}
          </div>
        </DashboardLayout>
      </div>
    </>
  );
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always wrap in PrivyStack + PrivyProtectedRoute - uses dev credentials automatically when env vars are empty
  if (!PrivyProtectedRoute || !PrivyStackComponent) {
    // Fallback if ui-kit package isn't installed
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <PrivyStackComponent
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      thirdwebClientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      loginMethods={['email', 'google']}
      appearance={{ theme: 'light', accentColor: '#2563EB', logo: '/logo.svg' }}
    >
      <PrivyProtectedRoute fallback={<RedirectToLogin />}>
        <DashboardShell>{children}</DashboardShell>
      </PrivyProtectedRoute>
    </PrivyStackComponent>
  );
}
