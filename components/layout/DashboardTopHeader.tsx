'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { getPageTitle } from '@/components/layout/dashboard/navConfig';
import { isMarketplaceCreatorProfilePath } from '@/lib/marketplace-nav';

export function DashboardTopHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pageTitle = getPageTitle(pathname);
  const showCreatorsBack = isMarketplaceCreatorProfilePath(pathname);
  const isDiscussionsPage = pathname.startsWith('/dashboard/discussions');

  const showSolidBg = !transparent || scrolled;

  useEffect(() => {
    if (!transparent) {
      setScrolled(false);
      return;
    }

    const update = () => {
      const content = document.querySelector('[data-dashboard-content]');
      const contentScroll = content instanceof HTMLElement ? content.scrollTop : 0;
      setScrolled(window.scrollY > 6 || contentScroll > 6);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    const content = document.querySelector('[data-dashboard-content]');
    content?.addEventListener('scroll', update, { passive: true });

    return () => {
      window.removeEventListener('scroll', update);
      content?.removeEventListener('scroll', update);
    };
  }, [transparent, pathname]);

  return (
    <header
      className={`sticky top-0 z-40 px-6 py-4 transition-colors duration-200 ${
        isDiscussionsPage ? '' : 'border-b'
      } ${
        showSolidBg
          ? `${isDiscussionsPage ? '' : 'border-neutral-200 dark:border-neutral-800'} bg-white dark:bg-neutral-950`
          : `${isDiscussionsPage ? '' : 'border-neutral-200/70 dark:border-neutral-800/70'} bg-transparent`
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          {showCreatorsBack && (
            <Link
              href="/marketplace/creators"
              aria-label="Retour aux créateurs"
              title="Retour aux créateurs"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <DashboardHeaderSearch />
        </div>

        <h1 className="max-w-[40vw] truncate text-center text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:max-w-none">
          {pageTitle}
        </h1>

        <div className="flex h-9 shrink-0 items-center justify-end gap-2 justify-self-end">
          <NotificationBell compact />

          {user && (
            <div className="relative flex h-9 items-center">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="rounded-full ring-2 ring-transparent transition hover:ring-gray-200 focus:outline-none focus:ring-gray-300 dark:hover:ring-neutral-700 dark:focus:ring-neutral-600"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
              >
                <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="xs" tone="muted" />
              </button>
              <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
