'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { CreditBadge } from '@/components/CreditBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
function AuthHeaderShell({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
        collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
      }`}
      aria-hidden={collapsed}
    >
      <div className="overflow-hidden">
        <header
          className={`sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm transition-opacity duration-300 ${
            collapsed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {children}
        </header>
      </div>
    </div>
  );
}

export function HeaderAuth() {
  const pathname = usePathname();
  const { user, logout, hasRole, isLoading } = useAuth();
  const collapseHeader = false;

  const handleLogout = async () => {
    await logout();
    window.location.assign('/login');
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
          active ? 'bg-indigo-50 text-indigo-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {label}
      </Link>
    );
  };

  if (isLoading) {
    return (
      <AuthHeaderShell collapsed={collapseHeader}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-4">
          <LoadingSpinner size="sm" />
        </div>
      </AuthHeaderShell>
    );
  }

  if (!user) {
    return (
      <AuthHeaderShell collapsed={collapseHeader}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              NP
            </div>
            <span className="font-semibold text-gray-900">NoProbleme</span>
          </Link>
          <LoadingSpinner size="sm" />
        </div>
      </AuthHeaderShell>
    );
  }

  return (
    <AuthHeaderShell collapsed={collapseHeader}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              NP
            </div>
            <span className="hidden font-semibold text-gray-900 sm:inline">NoProbleme</span>
          </Link>
          <nav
            className="flex max-w-full flex-wrap items-center gap-1 overflow-x-auto md:gap-2"
            aria-label="Navigation connectée"
          >
            {navLink('/dashboard', 'Accueil')}
            {navLink('/marketplace', 'Marketplace')}
            {hasRole('ROLE_AGENT') && navLink('/dashboard/agent', 'File agent')}
            {hasRole('ROLE_CREATOR') && navLink('/dashboard/creator', 'My Store')}
            {hasRole('ROLE_ADMIN') && navLink('/admin/users', 'Admin')}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <CreditBadge />
          <NotificationBell />
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg hover:bg-gray-50">
              <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
              <span className="max-w-[9rem] truncate text-sm text-gray-700">{user.fullName}</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </AuthHeaderShell>
  );
}
