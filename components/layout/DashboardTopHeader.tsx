'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import { NotificationBell } from '@/components/NotificationBell';
import { MessagesHeaderButton } from '@/components/messaging/MessagesHeaderButton';
import {
  getPageTitle,
  isProductsHeaderTogglePath,
  isServiceProviderHeaderTogglePath,
} from '@/components/layout/dashboard/navConfig';
import { ProductsHeaderToggle } from '@/components/layout/ProductsHeaderToggle';
import { ServiceProviderHeaderToggle } from '@/components/layout/ServiceProviderHeaderToggle';
import {
  isMarketplaceCreatorProfilePath,
  sanitizeMarketplaceReturnTo,
} from '@/lib/marketplace-nav';
import { useTheme } from '@/components/landing/ThemeProvider';
import { enterBrowserFullscreen, exitBrowserFullscreen } from '@/lib/browser-fullscreen';
import { DASHBOARD_MAIN_BG } from '@/components/landing/landingBrand';
import { useAuth } from '@/context/AuthContext';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import {
  creatorCanAccessProductsMenu,
  creatorCanAccessServiceProviderMenu,
} from '@/lib/creator-app-role';
import {
  NEWS_INLINE_PUBLISH_CTA_ID,
  NewsPublishHeaderCta,
} from '@/components/home/NewsPublishHeaderCta';

const headerIconClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white';

const menuItemClass =
  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800';

function isNewsFeedPath(pathname: string): boolean {
  return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
}

function getDashboardScrollY() {
  const content = document.querySelector('[data-dashboard-content]');
  const contentScroll = content instanceof HTMLElement ? content.scrollTop : 0;
  return Math.max(window.scrollY, contentScroll);
}

function HeaderMoreMenu() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFocusActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        title="More"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={headerIconClass}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Header options"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => {
              toggle();
              setOpen(false);
            }}
          >
            <FontAwesomeIcon icon={isDark ? faMoon : faSun} className="h-4 w-4 shrink-0" />
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => void toggleFocus()}
          >
            <FontAwesomeIcon
              icon={focusActive ? faCompress : faExpand}
              className="h-4 w-4 shrink-0"
            />
            <span>{focusActive ? 'Exit focus' : 'Focus'}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center text-sm font-semibold leading-none"
              aria-hidden
            >
              ?
            </span>
            <span>Help</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardTopHeader({
  transparent = false,
}: {
  transparent?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const [scrolled, setScrolled] = useState(false);
  const [newsCtaVisible, setNewsCtaVisible] = useState(false);
  const search = searchParams.toString();
  const pageTitle = getPageTitle(pathname, search);
  const showCreatorsBack = isMarketplaceCreatorProfilePath(pathname);
  const showNotificationsBack = pathname.startsWith('/dashboard/notifications');
  const profileReturnTo = sanitizeMarketplaceReturnTo(searchParams.get('from'));
  const isDiscussionsPage = pathname.startsWith('/dashboard/discussions');
  const isNewsPage = isNewsFeedPath(pathname);
  const showProductsToggle =
    hasRole('ROLE_CREATOR') &&
    isProductsHeaderTogglePath(pathname, search) &&
    (!appRoleReady || creatorCanAccessProductsMenu(appRole));
  const showServiceProviderToggle =
    hasRole('ROLE_CREATOR') &&
    isServiceProviderHeaderTogglePath(pathname, search) &&
    (!appRoleReady || creatorCanAccessServiceProviderMenu(appRole));

  const showSolidBg = !transparent || scrolled;
  const showNewsPublishCta = isNewsPage && newsCtaVisible;

  const handleCreatorProfileBack = () => {
    if (profileReturnTo) {
      router.push(profileReturnTo);
      return;
    }
    try {
      const referrer = document.referrer;
      if (referrer) {
        const refUrl = new URL(referrer);
        if (refUrl.origin === window.location.origin) {
          router.back();
          return;
        }
      }
    } catch {
      /* ignore invalid referrer */
    }
    // Fallback only when we cannot resolve a previous in-app page.
    router.push('/marketplace/creators');
  };

  useEffect(() => {
    if (!transparent) {
      setScrolled(false);
      return;
    }

    const update = () => {
      setScrolled(getDashboardScrollY() > 6);
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

  useEffect(() => {
    if (!isNewsPage) {
      setNewsCtaVisible(false);
      return;
    }

    const update = () => {
      const inlineCta = document.getElementById(NEWS_INLINE_PUBLISH_CTA_ID);
      if (!inlineCta) {
        setNewsCtaVisible(getDashboardScrollY() > 72);
        return;
      }
      // Sticky header ~4.5rem — show header twin once the in-feed CTA has scrolled above it.
      const headerClearance = 72;
      setNewsCtaVisible(inlineCta.getBoundingClientRect().bottom < headerClearance);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    const content = document.querySelector('[data-dashboard-content]');
    content?.addEventListener('scroll', update, { passive: true });
    // Feed can mount after header — re-check shortly.
    const retry = window.setTimeout(update, 120);

    return () => {
      window.clearTimeout(retry);
      window.removeEventListener('scroll', update);
      content?.removeEventListener('scroll', update);
    };
  }, [isNewsPage, pathname]);

  return (
    <header
      className={`sticky top-0 z-40 px-6 py-4 transition-colors duration-200 border-b ${
        showSolidBg
          ? `border-neutral-200 dark:border-neutral-800 ${DASHBOARD_MAIN_BG}`
          : 'border-neutral-200/70 bg-transparent dark:border-neutral-800/70'
      }`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          {showCreatorsBack ? (
            <button
              type="button"
              onClick={handleCreatorProfileBack}
              aria-label="Go back"
              title="Go back"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          {showNotificationsBack ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                  return;
                }
                router.push('/dashboard/home');
              }}
              aria-label="Go back"
              title="Go back"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          {showProductsToggle ? <ProductsHeaderToggle /> : null}
          {showServiceProviderToggle ? <ServiceProviderHeaderToggle /> : null}
          {showNewsPublishCta ? <NewsPublishHeaderCta /> : null}
        </div>

        <h1 className="max-w-[40vw] truncate text-center text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:max-w-none">
          {pageTitle}
        </h1>

        <div className="flex h-9 shrink-0 items-center justify-end gap-2 justify-self-end">
          {isDiscussionsPage ? null : <MessagesHeaderButton />}
          <NotificationBell compact />
          <HeaderMoreMenu />
        </div>
      </div>
    </header>
  );
}
