'use client';

import type { CSSProperties } from 'react';
import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FlashToastHost } from '@/components/ui/FlashToastHost';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardTopHeader } from '@/components/layout/DashboardTopHeader';
import { MarketplacePatternBackground } from '@/components/marketplace/ProductDetailHalftoneBackground';
import { isContentCreatorsPath, isMarketplaceCreatorProfilePath, isServiceProvidersCatalogPath } from '@/lib/marketplace-nav';
import { DASHBOARD_MAIN_BG } from '@/components/landing/landingBrand';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import {
  creatorCanAccessMyProducts,
  creatorCanAccessMyServices,
  creatorCanAccessProductsMenu,
  creatorCanAccessServiceProviderMenu,
} from '@/lib/creator-app-role';
import { isMyProductNavPath, isMyServiceNavPath } from '@/components/layout/dashboard/navConfig';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'noproble.dashboard.sidebar-collapsed';

function readSidebarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    /* ignore quota / private mode */
  }
}

function isCreatorStudioPath(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard/creator')) return false;
  // Sub-pages (new/edit) keep the default dashboard shell
  if (pathname.includes('/new') || pathname.includes('/edit')) return false;
  return true;
}

/** Product consult / edit / new — same hub motif as My Product. */
function isCreatorProductsWorkspacePath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/creator/products');
}

function isNewsFeedPath(pathname: string): boolean {
  return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
}

function isMyProductPath(pathname: string): boolean {
  return (
    pathname === '/marketplace/my-products' ||
    pathname.startsWith('/marketplace/my-products/') ||
    pathname === '/dashboard/products' ||
    pathname.startsWith('/dashboard/products/')
  );
}

function isMyServicePath(pathname: string): boolean {
  return (
    pathname === '/marketplace/my-services' ||
    pathname.startsWith('/marketplace/my-services/') ||
    pathname === '/dashboard/services' ||
    pathname.startsWith('/dashboard/services/')
  );
}

function SessionErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-neutral-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl dark:bg-orange-500/10">
        ⚠️
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Server temporarily unavailable
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Could not verify your session. Your connection may be rate-limited.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 active:scale-95 transition"
      >
        Try again
      </button>
    </div>
  );
}

export function DashboardShell({
  children,
  transparentContent = false,
  transparentHeader = false,
}: {
  children: React.ReactNode;
  transparentContent?: boolean;
  transparentHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user, sessionStatus, restoreSession } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useLayoutEffect(() => {
    setSidebarCollapsed(readSidebarCollapsed());
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((value) => {
      const next = !value;
      writeSidebarCollapsed(next);
      return next;
    });
  }, []);

  const creatorStudioPattern = isCreatorStudioPath(pathname);
  const creatorProductsPattern = isCreatorProductsWorkspacePath(pathname);
  const newsFeedPattern = isNewsFeedPath(pathname);
  const myProductPattern = isMyProductPath(pathname);
  const myServicePattern = isMyServicePath(pathname);
  const contentCreatorsPattern =
    isContentCreatorsPath(pathname) && !isServiceProvidersCatalogPath(pathname);
  const serviceProvidersCatalog = isServiceProvidersCatalogPath(pathname);
  const usePatternBackground =
    transparentContent ||
    creatorStudioPattern ||
    creatorProductsPattern ||
    newsFeedPattern ||
    contentCreatorsPattern;
  const useTransparentHeader =
    transparentHeader ||
    creatorStudioPattern ||
    creatorProductsPattern ||
    newsFeedPattern ||
    contentCreatorsPattern;
  const compactContentTop = isMarketplaceCreatorProfilePath(pathname);
  const discussionsLayout = pathname.startsWith('/dashboard/discussions');
  const fillMainLayout = discussionsLayout || myProductPattern || myServicePattern;

  // Only redirect to /login when the session is definitively gone.
  // 'error' (rate-limit / network) must NOT trigger a redirect because
  // the middleware would immediately bounce the user back to /dashboard,
  // creating an infinite loop that exhausts the rate limit even further.
  useEffect(() => {
    if (sessionStatus !== 'unauthenticated') return;
    if (!pathname.startsWith('/dashboard')) return;
    router.replace('/login');
  }, [sessionStatus, pathname, router]);

  // Keep creators off role-gated marketplace sections when deep-linking.
  useEffect(() => {
    if (!appRoleReady || !appRole) return;

    const onMyProducts =
      isMyProductNavPath(pathname) ||
      pathname.startsWith('/dashboard/creator/products') ||
      pathname.startsWith('/dashboard/products');
    if (onMyProducts && !creatorCanAccessMyProducts(appRole)) {
      router.replace('/dashboard/home');
      return;
    }

    const onProductsExplore =
      pathname === '/marketplace' ||
      pathname.startsWith('/marketplace/favorites') ||
      pathname.startsWith('/marketplace/purchases') ||
      pathname.startsWith('/marketplace/products');
    if (onProductsExplore && !creatorCanAccessProductsMenu(appRole)) {
      router.replace('/dashboard/home');
      return;
    }

    if (isMyServiceNavPath(pathname) && !creatorCanAccessMyServices(appRole)) {
      router.replace('/dashboard/home');
      return;
    }

    if (
      isServiceProvidersCatalogPath(pathname) &&
      !creatorCanAccessServiceProviderMenu(appRole)
    ) {
      router.replace('/dashboard/home');
    }
  }, [appRole, appRoleReady, pathname, router]);

  const handleRetry = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  // Show retry screen when session restore hit a transient error (429, network)
  if (!isLoading && sessionStatus === 'error' && !user) {
    return <SessionErrorScreen onRetry={handleRetry} />;
  }

  // Avoid painting an empty/half dashboard while auth is still resolving (account switch).
  if (isLoading || (!user && sessionStatus !== 'unauthenticated')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const shellBg = usePatternBackground ? 'bg-transparent' : DASHBOARD_MAIN_BG;

  return (
    <>
      {(creatorStudioPattern ||
        creatorProductsPattern ||
        newsFeedPattern ||
        contentCreatorsPattern) && (
        <MarketplacePatternBackground variant="hub" />
      )}
      <div
        className={`flex transition-[--dash-sidebar-w] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          fillMainLayout ? 'h-screen overflow-hidden' : 'min-h-screen'
        } ${shellBg}`}
        style={{ '--dash-sidebar-w': sidebarCollapsed ? '4.5rem' : '18rem' } as CSSProperties}
        data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
      >
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebarCollapsed}
      />
      <div
        data-dashboard-main
        className={`flex min-w-0 flex-1 flex-col ${fillMainLayout ? 'h-screen max-h-screen overflow-hidden' : ''} ${shellBg}`}
      >
        <DashboardTopHeader
          transparent={useTransparentHeader}
        />
        <div
          data-dashboard-content
          className={`relative z-10 min-w-0 flex-1 ${
            fillMainLayout
              ? 'flex min-h-0 flex-col overflow-hidden px-6 pb-4 pt-4'
              : `overflow-x-clip pb-6 ${compactContentTop ? 'pt-2' : 'pt-6'} ${
                  serviceProvidersCatalog
                    ? 'px-8 sm:px-10 lg:px-12 xl:px-14'
                    : newsFeedPattern
                      ? 'px-4 sm:px-5'
                      : 'px-6'
                }`
          } ${shellBg}`}
        >
          {children}
        </div>
      </div>
    </div>
      <Suspense fallback={null}>
        <FlashToastHost />
      </Suspense>
    </>
  );
}
