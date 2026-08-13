import type { Role } from '@/types/auth';
import type { ReactNode } from 'react';
import { isContentCreatorsPath, isMarketplaceHubPath } from '@/lib/marketplace-nav';

export type DashboardNavChild = {
  href: string;
  label: string;
  roles?: Role[];
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  roles?: Role[];
  comingSoon?: boolean;
  children?: DashboardNavChild[];
  /** Optional search string (e.g. `?from=profile`) for context-aware active state. */
  activeWhen?: (pathname: string, search?: string) => boolean;
};

/**
 * Sidebar nav order. "Dashboard" is intentionally omitted for now
 * (route still exists; re-add when the hub is ready).
 */
export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: '/dashboard/creator',
    label: 'My Profile',
    roles: ['ROLE_CREATOR'],
    activeWhen: (pathname, search = '') => {
      if (pathname.startsWith('/dashboard/creator/products')) {
        return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('from') ===
          'profile';
      }
      return pathname === '/dashboard/creator' || pathname.startsWith('/dashboard/creator/');
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/portfolio',
    label: 'My Portfolio',
    roles: ['ROLE_CREATOR'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
  },
  {
    href: '/marketplace/creators',
    label: 'Members',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    activeWhen: isContentCreatorsPath,
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    activeWhen: isMarketplaceHubPath,
  },
  {
    href: '/dashboard/products',
    label: 'My Product',
    roles: ['ROLE_CREATOR'],
    activeWhen: (pathname, search = '') => {
      if (
        pathname === '/dashboard/products' ||
        pathname.startsWith('/dashboard/products/')
      ) {
        return true;
      }
      if (!pathname.startsWith('/dashboard/creator/products')) return false;
      return (
        new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('from') !==
        'profile'
      );
    },
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/discussions',
    label: 'Messages',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/agent',
    label: 'Agent queue',
    roles: ['ROLE_AGENT'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Admin',
    roles: ['ROLE_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function isDashboardHomePath(pathname: string): boolean {
  return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
}

export function getPageTitle(pathname: string, search = ''): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/dashboard/home') return 'News';
  if (pathname.startsWith('/dashboard/credits')) return 'Credits';
  if (pathname.startsWith('/dashboard/discussions')) return 'Messages';
  if (pathname.startsWith('/dashboard/portfolio')) return 'My Portfolio';
  if (pathname.startsWith('/dashboard/search')) return 'Search';
  if (pathname.startsWith('/dashboard/scheduler')) return 'Scheduler';
  if (pathname.startsWith('/dashboard/agent/deliver')) return 'Deliver content';
  if (pathname.startsWith('/dashboard/agent')) return 'Agent queue';
  if (pathname.startsWith('/dashboard/products')) return 'My Product';
  if (pathname.startsWith('/dashboard/creator/content/new')) return 'New content';
  if (pathname.startsWith('/dashboard/creator/content')) return 'My Profile';
  if (pathname.startsWith('/dashboard/creator/products/new')) return 'New product';
  if (pathname.startsWith('/dashboard/creator/products')) {
    const from = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('from');
    return from === 'profile' ? 'My Profile' : 'My Product';
  }
  if (pathname.startsWith('/dashboard/creator/profile')) return 'My Profile';
  if (pathname.startsWith('/dashboard/settings')) return 'Profile settings';
  if (pathname.startsWith('/dashboard/creator')) return 'My Profile';
  if (isContentCreatorsPath(pathname)) return 'Members';
  if (isMarketplaceHubPath(pathname)) return 'Marketplace';
  return 'Dashboard';
}
