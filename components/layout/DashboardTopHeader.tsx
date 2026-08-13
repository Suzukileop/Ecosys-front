'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/NotificationBell';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { getPageTitle, isDashboardHomePath } from '@/components/layout/dashboard/navConfig';
import { isMarketplaceCreatorProfilePath } from '@/lib/marketplace-nav';

export function DashboardTopHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pageTitle = getPageTitle(pathname, searchParams.toString());
  const showCreatorsBack = isMarketplaceCreatorProfilePath(pathname);
  const isDiscussionsPage = pathname.startsWith('/dashboard/discussions');
  const isHomeActive = isDashboardHomePath(pathname);

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
          {showCreatorsBack ? (
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
          ) : (
            <Link
              href="/dashboard/home"
              aria-label="News feed"
              title="News"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                isHomeActive
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
          )}
        </div>

        <h1 className="max-w-[40vw] truncate text-center text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:max-w-none">
          {pageTitle}
        </h1>

        <div className="flex h-9 shrink-0 items-center justify-end gap-2 justify-self-end">
          <DashboardHeaderSearch compact />
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
