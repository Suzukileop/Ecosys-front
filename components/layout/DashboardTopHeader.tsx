'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NotificationBell } from '@/components/NotificationBell';
import { MessagesHeaderButton } from '@/components/messaging/MessagesHeaderButton';
import {
  isProductsHeaderTogglePath,
  isServiceProviderHeaderTogglePath,
} from '@/components/layout/dashboard/navConfig';
import { ProductsHeaderToggle } from '@/components/layout/ProductsHeaderToggle';
import { ServiceProviderHeaderToggle } from '@/components/layout/ServiceProviderHeaderToggle';
import {
  isMarketplaceCreatorProfilePath,
  sanitizeMarketplaceReturnTo,
} from '@/lib/marketplace-nav';
import Link from 'next/link';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { DashboardMobileNav } from '@/components/layout/DashboardMobileNav';
import { DashboardNavbarLinks } from '@/components/layout/DashboardNavbarLinks';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { Avatar } from '@/components/ui/Avatar';
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

/** One curve for every micro-interaction in the bar. */
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

function isNewsFeedPath(pathname: string): boolean {
  return pathname === '/dashboard/home' || pathname.startsWith('/dashboard/home/');
}

/**
 * Opens the menu below `lg`. Three rules that resolve to a cross when the menu is up, on the same
 * curve as everything else — the control changes state rather than swapping glyph.
 */
function MobileNavTrigger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
      className={`group/burger inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 transition-[color,transform] duration-[420ms] ${EASE} hover:scale-105 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:text-neutral-200 dark:hover:text-white lg:hidden`}
    >
      <span className="relative flex h-[0.7rem] w-[1.1rem] flex-col justify-between" aria-hidden>
        <span
          className={`block h-[1.5px] w-full origin-center rounded-full bg-current transition-transform duration-[520ms] ${EASE} ${
            open ? 'translate-y-[0.32rem] rotate-45' : ''
          }`}
        />
        <span
          className={`block h-[1.5px] w-full origin-center rounded-full bg-current transition-transform duration-[520ms] ${EASE} ${
            open ? '-translate-y-[0.32rem] -rotate-45' : ''
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Avatar + account menu at the far right.
 *
 * Opens on hover *and* on click. The hover path needs a grace period on the way out, otherwise a
 * straight diagonal from the avatar to the last row leaves the trigger and closes the card under
 * the cursor; the card itself is a sibling inside the same hover root, so crossing the gap between
 * them never counts as leaving.
 */
function HeaderAccountMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  /*
   * Whether the card is up because the pointer is merely resting on the avatar, as opposed to
   * pinned by a click.
   *
   * Without this the two opening gestures cancelled each other: on any device with a pointer,
   * hovering opened the card and the click that followed hit a plain toggle and shut it again —
   * so "click the avatar" appeared to do nothing at all. A click now *pins* a hover-opened card
   * instead of toggling it, and only a second click (or Escape, or a click outside) closes it.
   * While pinned, moving the pointer away no longer dismisses it either.
   */
  const hoverOpened = useRef(false);

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const close = () => {
    cancelClose();
    hoverOpened.current = false;
    setOpen(false);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(close, 220);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        cancelClose();
        hoverOpened.current = false;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (!user) return null;

  return (
    <div
      className="relative"
      ref={rootRef}
      onPointerEnter={(event) => {
        // Touch taps fire pointerenter too; letting them through would open the card before the
        // tap is even resolved.
        if (event.pointerType === 'touch') return;
        cancelClose();
        if (!open) hoverOpened.current = true;
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'touch') return;
        // A pinned card stays until it is dismissed deliberately.
        if (hoverOpened.current) scheduleClose();
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (open && hoverOpened.current) {
            // Hover put it there; this click pins it rather than undoing it.
            hoverOpened.current = false;
            return;
          }
          if (open) {
            close();
            return;
          }
          hoverOpened.current = false;
          setOpen(true);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        title={user.fullName}
        className={`group/avatar relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-[420ms] ${EASE} hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400`}
      >
        {/* A hairline ring that draws itself in rather than a filled plate — the same restraint
            the rest of the bar's controls keep. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute -inset-1 rounded-full border border-neutral-900/15 transition-opacity duration-[420ms] ${EASE} dark:border-white/20 ${
            open ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'
          }`}
        />
        <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="sm" tone="muted" />
      </button>
      <ProfileDropdown open={open} onClose={close} />
    </div>
  );
}

function getDashboardScrollY() {
  const content = document.querySelector('[data-dashboard-content]');
  const contentScroll = content instanceof HTMLElement ? content.scrollTop : 0;
  return Math.max(window.scrollY, contentScroll);
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

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  // A route change must close the menu, otherwise it survives the navigation it triggered.
  // Adjusted during render rather than from an effect: an effect would paint the menu over the
  // new page for a frame first, and this repo's `set-state-in-effect` rule is an error.
  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
  }

  /* Groups the route-specific controls ahead of the utility cluster on the right. */
  const hasRouteActions = showProductsToggle || showServiceProviderToggle || showNewsPublishCta;

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
      // Measured, not a constant: the bar is two tiers now and its height moves with the viewport
      // and with the subnav itself, so a hardcoded clearance would swap the twin in at the wrong
      // moment — and would drift again the next time a tier changes.
      const header = document.querySelector('header');
      const headerClearance = header ? header.getBoundingClientRect().bottom + 8 : 80;
      if (!inlineCta) {
        setNewsCtaVisible(getDashboardScrollY() > headerClearance);
        return;
      }
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
    <>
    <header
      /*
       * Flush glass. The bar spans the viewport and sits on the top edge — no inset, no radius,
       * no cast shadow: a floating card reads as an object *over* the page, and this one is meant
       * to be the page's own top edge. It stays translucent, because the blur is what keeps the
       * content visibly passing underneath.
       *
       * `border-b` only, for the same reason the floating version needed a full border: a flush
       * bar has no corners to resolve, and a left/right hairline would draw two stray verticals
       * down the viewport edges.
       *
       * The blur lives on the child layer below, NOT here, and that is load-bearing: an element
       * with `backdrop-filter` becomes a *backdrop root*, so every descendant's own
       * `backdrop-filter` has nothing left to sample and silently does nothing. With the filter
       * here, the account card and the More menu rendered as flat tinted panels with the page
       * showing through them razor-sharp. As a sibling layer it blurs the page, and the popovers
       * — siblings of it, not descendants — keep a working backdrop of their own.
       */
      className={`sticky top-0 z-40 border-b px-4 transition-[border-color] duration-[520ms] ${EASE} sm:px-6 lg:px-8 ${
        /* One hairline, `black/[0.04]` light and `white/[0.04]` dark. It firms up a single step
           once content is actually passing underneath — on a page that opens on a full-bleed hero,
           a rule drawn across it at scroll-top reads as a seam in the artwork. */
        showSolidBg
          ? 'border-black/[0.07] dark:border-white/[0.08]'
          : 'border-black/[0.04] dark:border-white/[0.04]'
      }`}
    >
      {/* The glass itself. Separate from <header> so the bar is not a backdrop root — see above. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 block transition-colors duration-[520ms] ${EASE}
          bg-white/85 supports-[backdrop-filter]:bg-white/55 supports-[backdrop-filter]:backdrop-blur-xl
          dark:bg-black/85 dark:supports-[backdrop-filter]:bg-black/30`}
      />
      {/*
        * One row, three blocks: the wordmark anchored hard left, the public shortcuts centred on
        * the *viewport*, the account cluster hard right.
        *
        * `justify-between` alone cannot centre the middle block — it distributes free space, so
        * the centre only lands on the midpoint when both sides happen to be the same width, and
        * here they never are (a 72px wordmark against a ~160px control cluster). So from `lg` up
        * the nav leaves the flow entirely and is pinned to the row's midpoint. That also sidesteps
        * the trap this layout hit before: as a flex child with `flex-basis: 0` it was sized to its
        * share of the row rather than its contents and overflowed onto its neighbours.
        *
        * Below `lg` there is no midpoint worth pinning to, so it returns to the flow as a
        * horizontally scrollable rail between the two anchors.
        */}
      <div className="relative flex items-center justify-between gap-3 py-3 sm:gap-4">
        {/* LEFT — the wordmark, and nothing else. */}
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          {showCreatorsBack || showNotificationsBack ? (
            <button
              type="button"
              onClick={
                showCreatorsBack
                  ? handleCreatorProfileBack
                  : () => {
                      if (typeof window !== 'undefined' && window.history.length > 1) {
                        router.back();
                        return;
                      }
                      router.push('/dashboard/home');
                    }
              }
              aria-label="Go back"
              title="Go back"
              className={`-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-[color,transform] duration-[420ms] ${EASE} hover:scale-105 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}
          <Link
            href="/dashboard/home"
            className={`shrink-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-900 transition-opacity duration-[420ms] ${EASE} hover:opacity-60 dark:text-white`}
          >
            Noproble
          </Link>
        </div>

        {/* CENTRE — the three public shortcuts, pinned to the viewport midpoint from `lg`. */}
        <DashboardNavbarLinks pinLate={hasRouteActions} />

        {/*
          * RIGHT — search, chat, bell, avatar, in that order and on one repeated gap.
          *
          * The separating rule that used to sit before the avatar is gone: the brief is right that
          * four controls on an even rhythm read as a set, and a rule inside the group breaks the
          * very symmetry it was meant to organise. Grouping now comes from spacing alone — one
          * `gap-1` throughout, and a wider margin ahead of any route action.
          */}
        <div className="flex min-w-0 items-center gap-1">
          {hasRouteActions ? (
            /*
             * The only block in the row allowed to shrink. Priority when the row is
             * over-subscribed runs: account controls and wordmark never clip, the nav keeps a
             * floor, and the page action gives way and scrolls inside itself. Without this the
             * Explore/My Product toggle pushed the avatar clean off the right edge at 430px.
             *
             * This only works because the cluster around it is `min-w-0` rather than `shrink-0`:
             * a `shrink-0` parent is sized to its contents, so there is no shrink pressure inside
             * it and this block's own `shrink` was inert. The four controls stay `shrink-0`
             * individually, so they are still the things that never give.
             */
            <div className="pf-scrollbar-hide mr-2 flex min-w-0 shrink items-center gap-2 overflow-x-auto sm:mr-3">
              {showProductsToggle ? <ProductsHeaderToggle /> : null}
              {showServiceProviderToggle ? <ServiceProviderHeaderToggle /> : null}
              {showNewsPublishCta ? <NewsPublishHeaderCta /> : null}
            </div>
          ) : null}
          <DashboardHeaderSearch iconOnly />
          {/*
           * Chat and bell are `lg` and up only. They stay mounted rather than unmounted — each owns
           * a poll and a dismiss baseline, and tearing those down on every resize past the
           * breakpoint would restart both. Below `lg` the same two destinations are in the menu.
           */}
          <span className="hidden lg:contents">
            {isDiscussionsPage ? null : <MessagesHeaderButton />}
            <NotificationBell compact />
          </span>
          <HeaderAccountMenu />
          <MobileNavTrigger open={mobileNavOpen} onToggle={() => setMobileNavOpen((v) => !v)} />
        </div>
      </div>

    </header>

    {/* Sibling of <header>, never a child: the bar's glass is a `backdrop-filter` layer, and a
        `backdrop-filter` ancestor becomes the containing block for `position: fixed` descendants —
        nested, this overlay's `inset-0` resolves against the 61px bar instead of the viewport. */}
    <DashboardMobileNav
      open={mobileNavOpen}
      onClose={() => setMobileNavOpen(false)}
      signals={[
        { href: '/dashboard/discussions', label: 'Messages' },
        { href: '/dashboard/notifications', label: 'Notifications' },
      ]}
    />
    </>
  );
}
