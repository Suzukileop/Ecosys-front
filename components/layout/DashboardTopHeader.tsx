'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import { NotificationBell } from '@/components/NotificationBell';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { getPageTitle } from '@/components/layout/dashboard/navConfig';
import { isMarketplaceCreatorProfilePath } from '@/lib/marketplace-nav';
import { brandSolidBg } from '@/components/landing/landingBrand';
import { useTheme } from '@/components/landing/ThemeProvider';
import { enterBrowserFullscreen, exitBrowserFullscreen } from '@/lib/browser-fullscreen';

const headerIconClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white';

function HeaderThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={headerIconClass}
    >
      <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="h-4 w-4" />
    </button>
  );
}

function HeaderFocusToggle() {
  const [focusActive, setFocusActive] = useState(false);

  useEffect(() => {
    const sync = () => setFocusActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleFocus = async () => {
    try {
      if (focusActive || document.fullscreenElement) {
        await exitBrowserFullscreen();
        setFocusActive(false);
      } else {
        await enterBrowserFullscreen();
        setFocusActive(true);
      }
    } catch {
      setFocusActive(Boolean(document.fullscreenElement));
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggleFocus()}
      title={focusActive ? 'Exit focus' : 'Focus'}
      aria-label={focusActive ? 'Exit focus' : 'Focus'}
      aria-pressed={focusActive}
      className={headerIconClass}
    >
      <FontAwesomeIcon icon={focusActive ? faCompress : faExpand} className="h-4 w-4" />
    </button>
  );
}

export function DashboardTopHeader({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const pageTitle = getPageTitle(pathname, searchParams.toString());
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
              aria-label="NoProbleme"
              title="NoProbleme"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white ${brandSolidBg}`}
              >
                NP
              </span>
            </Link>
          )}
        </div>

        <h1 className="max-w-[40vw] truncate text-center text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:max-w-none">
          {pageTitle}
        </h1>

        <div className="flex h-9 shrink-0 items-center justify-end gap-2 justify-self-end">
          <DashboardHeaderSearch compact />
          <NotificationBell compact />
          <HeaderThemeToggle />
          <HeaderFocusToggle />
        </div>
      </div>
    </header>
  );
}
