'use client';

import type { CSSProperties } from 'react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppLoadingScreen } from '@/components/ui/LoadingSpinner';
import { FlashToastHost } from '@/components/ui/FlashToastHost';
import { DashboardTopHeader } from '@/components/layout/DashboardTopHeader';
import { MarketplacePatternBackground } from '@/components/marketplace/ProductDetailHalftoneBackground';
import {
  isContentCreatorsPath,
  isCreatorShopPath,
  isMarketplaceCreatorProfilePath,
  isServiceProvidersCatalogPath,
} from '@/lib/marketplace-nav';
import { APP_GROUND } from '@/components/landing/landingBrand';
import {
  MESSAGING_DETAILS_OPEN_EVENT,
  PORTFOLIO_SETTINGS_OPEN_EVENT,
  setSidebarCollapsed,
} from '@/lib/dashboard-chrome';
import { useCreatorAppRole } from '@/hooks/useCreatorAppRole';
import { recheckServer, useServerStatusStore } from '@/stores/serverStatusStore';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';
import {
  creatorCanAccessMyProducts,
  creatorCanAccessMyServices,
  creatorCanAccessProductsMenu,
  creatorCanAccessServiceProviderMenu,
} from '@/lib/creator-app-role';
import { isMyServiceNavPath } from '@/components/layout/dashboard/navConfig';
import { ROUTES, SIGNED_IN_HOME, isPathWithin, isProtectedPath } from '@/lib/routes';

/** Product consult page (`/my-products/[id]`) — plain surface, same as the My Products list. */
function isMyProductConsultPath(pathname: string): boolean {
  return /^\/my-products\/[^/]+\/?$/.test(pathname);
}

/** Product editing (`/my-products/[id]/edit`) — hub motif background. */
function isMyProductWorkspacePath(pathname: string): boolean {
  return (
    isPathWithin(pathname, ROUTES.myProducts) &&
    pathname !== ROUTES.myProducts &&
    !isMyProductConsultPath(pathname)
  );
}

const SESSION_AUTO_RETRY_SECONDS = 15;

type SessionErrorScreenProps = {
  onRetry: () => void | Promise<unknown>;
  code?: string;
  status?: string;
  title?: string;
  description?: string;
};

function SessionErrorScreen({
  onRetry,
  code = '503',
  status = 'Service unavailable',
  title = 'Lost connection to the server',
  description = 'We couldn’t verify your session. The server may be restarting — your work is safe and we’ll reconnect you automatically.',
}: SessionErrorScreenProps) {
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(SESSION_AUTO_RETRY_SECONDS);

  const retry = useCallback(async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
      setCountdown(SESSION_AUTO_RETRY_SECONDS);
    }
  }, [onRetry, retrying]);

  useEffect(() => {
    if (retrying) return;
    const t =
      countdown <= 0
        ? window.setTimeout(() => void retry(), 0)
        : window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, retrying, retry]);

  const progress = retrying ? 100 : ((SESSION_AUTO_RETRY_SECONDS - countdown) / SESSION_AUTO_RETRY_SECONDS) * 100;

  return (
    <div className={`relative flex min-h-screen flex-col ${APP_GROUND} px-6 dark:bg-black`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(rgba(0,0,0,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] dark:[background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)]"
      />

      <main className="relative flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-[480px]">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_64px_-32px_rgba(0,0,0,0.18)] dark:border-white/[0.08] dark:bg-[#111111]">
            <div className="flex items-center justify-center border-b border-black/[0.05] bg-[#FAFAFA] px-8 py-10 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <svg viewBox="0 0 280 64" className="h-16 w-full max-w-[280px]" fill="none" aria-hidden>
                <g className="text-[#111111] dark:text-white" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="14" width="44" height="30" rx="4" />
                  <path d="M20 52h20M30 44v8" />
                  <rect x="228" y="10" width="44" height="18" rx="3" />
                  <rect x="228" y="34" width="44" height="18" rx="3" />
                  <path d="M238 19h.01M238 43h.01" strokeWidth="2.4" />
                </g>
                <g className="text-neutral-300 dark:text-neutral-700" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 6">
                  <path d="M64 31h56">
                    <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
                  </path>
                  <path d="M160 31h56">
                    <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
                  </path>
                </g>
                <circle cx="140" cy="31" r="13" className="fill-white stroke-black/10 dark:fill-[#111111] dark:stroke-white/15" strokeWidth="1.2" />
                <path d="m135.5 26.5 9 9m0-9-9 9" className="text-amber-500" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <div className="px-8 pb-8 pt-7 sm:px-10">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-black/[0.05] px-2 py-0.5 font-mono text-[12px] font-medium text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                  {code}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                </span>
                <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">{status}</span>
              </div>

              <h1 className="mt-4 text-[1.625rem] font-bold leading-tight tracking-[-0.02em] text-[#111111] dark:text-white">
                {title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {description}
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void retry()}
                  disabled={retrying}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2.5 rounded-lg bg-[#111111] px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:focus-visible:ring-white/30"
                >
                  <svg
                    className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20 11a8 8 0 1 0-2.34 5.66" />
                    <path d="M20 4v7h-7" />
                  </svg>
                  {retrying ? 'Reconnecting…' : 'Try again'}
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-black/[0.1] px-5 text-[15px] font-medium text-[#111111] transition-colors hover:border-black/20 hover:bg-black/[0.02] dark:border-white/[0.14] dark:text-white dark:hover:border-white/25 dark:hover:bg-white/[0.04]"
                >
                  Reload page
                </button>
              </div>
            </div>

            <div className="border-t border-black/[0.05] px-8 py-4 dark:border-white/[0.06] sm:px-10">
              <div className="flex items-center justify-between text-[13px] text-neutral-400 dark:text-neutral-500" aria-live="polite">
                <span>{retrying ? 'Checking the connection…' : 'Auto-retry'}</span>
                <span className="tabular-nums">{retrying ? '' : `${countdown}s`}</span>
              </div>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-[#111111] transition-[width] duration-1000 ease-linear dark:bg-white ${retrying ? 'animate-pulse' : ''}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function DashboardShell({
  children,
  transparentContent = false,
}: {
  children: React.ReactNode;
  transparentContent?: boolean;
  transparentHeader?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user, sessionStatus, restoreSession } = useAuth();
  const { appRole, ready: appRoleReady } = useCreatorAppRole();
  const serverUnreachable = useServerStatusStore((state) => state.unreachable);
  const serverOffline = useServerStatusStore((state) => state.offline);
  usePresenceHeartbeat(Boolean(user) && sessionStatus === 'authenticated');

  useEffect(() => {
    const onDetailsOpen = () => {
      setSidebarCollapsed(true);
    };
    window.addEventListener(MESSAGING_DETAILS_OPEN_EVENT, onDetailsOpen);
    window.addEventListener(PORTFOLIO_SETTINGS_OPEN_EVENT, onDetailsOpen);
    return () => {
      window.removeEventListener(MESSAGING_DETAILS_OPEN_EVENT, onDetailsOpen);
      window.removeEventListener(PORTFOLIO_SETTINGS_OPEN_EVENT, onDetailsOpen);
    };
  }, []);

  const creatorStudioPattern = isPathWithin(pathname, ROUTES.profile);
  const creatorProductsPattern = isMyProductWorkspacePath(pathname);
  const newsFeedPattern = isPathWithin(pathname, ROUTES.feed);
  const settingsPage = isPathWithin(pathname, ROUTES.settings);
  const myProductPattern = pathname === ROUTES.myProducts;
  const myServicePattern = isPathWithin(pathname, ROUTES.myServices);
  const publicCreatorProfile = isMarketplaceCreatorProfilePath(pathname);
  const contentCreatorsPattern =
    isContentCreatorsPath(pathname) &&
    !isServiceProvidersCatalogPath(pathname) &&
    !publicCreatorProfile &&
    !isCreatorShopPath(pathname);
  const serviceProvidersCatalog = isServiceProvidersCatalogPath(pathname);
  const portfolioWorkspace = isPathWithin(pathname, ROUTES.studio);
  const marketplaceDirectory = serviceProvidersCatalog || pathname === ROUTES.marketplace;
  const usePatternBackground =
    transparentContent ||
    creatorProductsPattern ||
    contentCreatorsPattern;
  const compactContentTop = isMarketplaceCreatorProfilePath(pathname);
  const discussionsLayout = isPathWithin(pathname, ROUTES.messages);
  const fillMainLayout = discussionsLayout || myProductPattern || myServicePattern;

  // Only redirect to /login when the session is definitively gone.
  // 'error' (rate-limit / network) must NOT trigger a redirect because
  // the middleware would immediately bounce the user back into the app,
  // creating an infinite loop that exhausts the rate limit even further.
  // Prefer hard navigation from logout handlers; this soft replace is a
  // fallback for expired sessions cleared without a full page reload.
  useEffect(() => {
    if (sessionStatus !== 'unauthenticated') return;
    if (!isProtectedPath(pathname)) return;
    if (typeof window !== 'undefined' && window.location.pathname.startsWith(ROUTES.login)) return;
    window.location.replace(ROUTES.login);
  }, [sessionStatus, pathname]);

  // Keep creators off role-gated marketplace sections when deep-linking.
  useEffect(() => {
    if (!appRoleReady || !appRole) return;

    if (isPathWithin(pathname, ROUTES.myProducts) && !creatorCanAccessMyProducts(appRole)) {
      router.replace(SIGNED_IN_HOME);
      return;
    }

    const onProductsExplore =
      pathname === ROUTES.marketplace ||
      isPathWithin(pathname, ROUTES.purchases) ||
      isPathWithin(pathname, '/marketplace/products');
    if (onProductsExplore && !creatorCanAccessProductsMenu(appRole)) {
      router.replace(SIGNED_IN_HOME);
      return;
    }

    if (isMyServiceNavPath(pathname) && !creatorCanAccessMyServices(appRole)) {
      router.replace(SIGNED_IN_HOME);
      return;
    }

    if (
      isServiceProvidersCatalogPath(pathname) &&
      !creatorCanAccessServiceProviderMenu(appRole)
    ) {
      router.replace(SIGNED_IN_HOME);
    }
  }, [appRole, appRoleReady, pathname, router]);

  const handleRetry = useCallback(async () => {
    await restoreSession();
  }, [restoreSession]);

  // Show retry screen when session restore hit a transient error (429, network)
  if (!isLoading && sessionStatus === 'error' && !user) {
    return <SessionErrorScreen onRetry={handleRetry} />;
  }

  // The page underneath is unmounted, so it refetches its data when the server comes back.
  if (serverUnreachable) {
    return serverOffline ? (
      <SessionErrorScreen
        onRetry={recheckServer}
        code="OFFLINE"
        status="No internet connection"
        title="You’re offline"
        description="Check your Wi‑Fi or mobile data. We’ll pick up right where you left off as soon as you’re back online."
      />
    ) : (
      <SessionErrorScreen
        onRetry={recheckServer}
        title="We can’t reach the server"
        description="Skraft is temporarily unavailable, possibly restarting. Nothing is lost — this page will come back on its own as soon as the server responds."
      />
    );
  }

  // Avoid painting an empty/half dashboard while auth is still resolving (account switch).
  if (isLoading || (!user && sessionStatus !== 'unauthenticated')) {
    return <AppLoadingScreen />;
  }

  /*
   * One page ground (`APP_GROUND`, faint grey) across every section, with blocks drawn in pure
   * white on it; the header bar follows the ground so chrome and page read as one sheet.
   */
  const appSurfaces = !discussionsLayout && !settingsPage;
  const shellBg = usePatternBackground ? 'bg-transparent' : `${APP_GROUND} dark:bg-black`;

  return (
    <>
      {(creatorProductsPattern ||
        contentCreatorsPattern) && (
        <MarketplacePatternBackground variant="hub" />
      )}
      <div
        className={`flex ${fillMainLayout ? 'h-screen overflow-hidden' : 'min-h-screen'} ${shellBg}`}
        /* Navigation lives entirely in the top bar now. The variable is kept, pinned at 0, because
           a number of pages still offset themselves against it; removing it is a separate sweep. */
        style={{ '--dash-sidebar-w': '0rem' } as CSSProperties}
        data-sidebar-collapsed="true"
      >
      <div
        data-dashboard-main
        className={`flex min-w-0 flex-1 flex-col ${fillMainLayout ? 'h-screen max-h-screen overflow-hidden' : ''} ${shellBg}`}
      >
        <DashboardTopHeader />
        <div
          data-dashboard-content
          data-app-surfaces={appSurfaces ? '' : undefined}
          className={`relative z-10 min-w-0 flex-1 ${
            discussionsLayout
              ? 'flex min-h-0 flex-col overflow-hidden p-0'
              : portfolioWorkspace
              /* Clip X without `overflow-x-clip` on this node (that forced a scroll
                 container and broke sticky). Children use max-w-full / overflow-x-clip. */
              ? 'max-w-full min-w-0 px-0 pb-0 pt-0'
              : fillMainLayout
              ? 'flex min-h-0 flex-col overflow-hidden px-0 pb-4 pt-4'
              : `overflow-x-clip pb-6 ${compactContentTop ? 'pt-2' : creatorStudioPattern ? 'pt-0 sm:pt-6' : newsFeedPattern || serviceProvidersCatalog ? 'pt-2 lg:pt-6' : 'pt-6'} ${
                  marketplaceDirectory || creatorStudioPattern || newsFeedPattern || settingsPage
                    ? 'px-0'
                    : publicCreatorProfile
                      ? 'px-0 sm:px-6'
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
