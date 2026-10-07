'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/NotificationBell';
import { MessagesHeaderButton } from '@/components/messaging/MessagesHeaderButton';
import { isServiceProvidersCatalogPath } from '@/lib/marketplace-nav';
import { ROUTES, isPathWithin } from '@/lib/routes';
import { APP_GROUND } from '@/components/landing/landingBrand';
import Link from 'next/link';
import { DashboardHeaderSearch } from '@/components/layout/DashboardHeaderSearch';
import { DashboardMobileNav } from '@/components/layout/DashboardMobileNav';
import { DashboardNavbarLinks } from '@/components/layout/DashboardNavbarLinks';
import { PORTFOLIO_FRAME_CLASS } from '@/components/portfolio/portfolioFrame';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

/** One curve for every micro-interaction in the bar. */
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

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
      className={`group/burger inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#222222] transition-[color,transform] duration-[420ms] ${EASE} hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:text-neutral-300 lg:hidden`}
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
 * **Click only.** It used to open on hover as well, and that is now gone entirely — the card
 * carries Log out, so a pointer merely crossing the corner of the bar on its way somewhere else
 * should not put it on screen. With one gesture instead of two there is also no grace period to
 * tune, no pinned-vs-hovered distinction, and no way for the two paths to cancel each other the
 * way they once did.
 */
function HeaderAccountMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        title={user.fullName}
        className={`group/avatar relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-[420ms] ${EASE} hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400`}
      >
        {/* A hairline ring that draws itself in rather than a filled plate — the same restraint
            the rest of the bar's controls keep. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute -inset-1 rounded-full border border-neutral-900/15 transition-opacity duration-[420ms] ${EASE} dark:border-white/20 ${
            open ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'
          }`}
        />
        <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" tone="muted" />
      </button>
      <ProfileDropdown open={open} onClose={close} />
    </div>
  );
}

export function DashboardTopHeader() {
  const pathname = usePathname();
  const isDiscussionsPage = isPathWithin(pathname, ROUTES.messages);
  const isPortfolioPage =
    isPathWithin(pathname, ROUTES.studio) ||
    isPathWithin(pathname, ROUTES.search) ||
    isPathWithin(pathname, ROUTES.notifications) ||
    pathname === ROUTES.marketplace ||
    pathname === ROUTES.myProducts ||
    isPathWithin(pathname, ROUTES.myServices) ||
    isServiceProvidersCatalogPath(pathname) ||
    isPathWithin(pathname, ROUTES.profile) ||
    isDiscussionsPage;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);

  /*
   * The bar publishes its own height as `--dash-header-h`, which is what lets the navigation
   * sheet open flush under it instead of over it. Measured rather than hardcoded because the bar
   * grows on routes that add a page action, and written straight to the document through the ref
   * — never `setState`, which would re-render the whole bar on every resize for one number and
   * trips this repo's `set-state-in-effect` rule.
   */
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        '--dash-header-h',
        `${Math.round(node.getBoundingClientRect().height)}px`
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // A route change must close the menu, otherwise it survives the navigation it triggered.
  // Adjusted during render rather than from an effect: an effect would paint the menu over the
  // new page for a frame first, and this repo's `set-state-in-effect` rule is an error.
  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
  }

  /*
   * Phones only: the bar slides away while reading down and returns on the first scroll up.
   * Window scroll only — fill-viewport routes scroll an inner panel, and hiding the bar there
   * would leave its slot empty above the panel.
   */
  const [autoHidden, setAutoHidden] = useState(false);
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 767px)');
    let lastY = window.scrollY;
    let frame = 0;
    const evaluate = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      if (!phone.matches || y < 24) {
        setAutoHidden(false);
        lastY = y;
        return;
      }
      if (Math.abs(delta) < 8) return;
      const barHeight = headerRef.current?.offsetHeight ?? 64;
      setAutoHidden(delta > 0 && y > barHeight);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(evaluate);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    phone.addEventListener('change', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      phone.removeEventListener('change', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  const barHidden = autoHidden && !mobileNavOpen;

  return (
    <>
    <header
      ref={headerRef}
      data-dashboard-header      /*
       * Flush. The bar spans the viewport, sits on the top edge, and carries no rule underneath —
       * it shares the page's own tone in light, so a hairline would only draw a line across one
       * continuous sheet.
       *
       * Any surface treatment lives on the child layer below, NOT here, and that is load-bearing:
       * an element with `backdrop-filter` becomes a *backdrop root*, so every descendant's own
       * `backdrop-filter` has nothing left to sample and silently does nothing. With the filter
       * here, the account card and the menus rendered as flat tinted panels with the page showing
       * through them razor-sharp. As a sibling layer it blurs the page, and the popovers — siblings
       * of it, not descendants — keep a working backdrop of their own.
       */
      className={`sticky top-0 z-40 transition-transform duration-300 ${EASE} motion-reduce:transition-none ${
        barHidden ? '-translate-y-full' : ''
      }`}
    >
      {/*
       * The bar's surface. Separate from <header> so the bar is not a backdrop root — see above.
       *
       * Light is flat and matches the page ground (`APP_GROUND`), so the chrome and the page read as one
       * sheet. No translucency there on purpose: glass over a surface of its own colour is
       * invisible work, and the blur would still cost a compositor layer on every scroll for
       * nothing.
       *
       * Dark elsewhere keeps the real glass. On My Portfolio it must not: the glass tint
       * (`black/85` + blur) paints a grey strip against the page's absolute black. That route
       * uses the same opaque `#000` as the page ground, so the bar and the canvas are one sheet.
       */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 block transition-colors duration-[520ms] ${EASE} ${
          APP_GROUND
        } ${
          isPortfolioPage
            ? 'dark:bg-black'
            : 'dark:bg-black/85 dark:supports-[backdrop-filter]:bg-black/30 dark:supports-[backdrop-filter]:backdrop-blur-xl'
        }`}
      />
      {/*
        * One row, left to right: wordmark, links, the search field, the account cluster.
        *
        * Nothing is centred any more and nothing is pinned out of the flow. The links sit directly
        * beside the wordmark and the search field takes whatever is left between them and the
        * controls — which is what makes the field the only elastic thing in the row and every
        * other block `shrink-0`.
        *
        * `items-center` puts every *box* on the centre line exactly — measured, all six at a delta
        * of 0. What it cannot do is centre the *glyphs*: a line box reserves descender space that
        * words like "logo" and "News" barely use, so the type lands about a pixel high inside its
        * own box. The `pt-px` on the text-bearing blocks below pays that back.
        */}
      <div
        className={`flex items-center gap-3 py-3 sm:gap-5 ${PORTFOLIO_FRAME_CLASS}`}
      >
        {/* LEFT — wordmark, then the links right beside it, as in the reference. */}
        {/*
          * `gap-4 lg:gap-16` is two different jobs on one class. Below `lg` this group is the
          * burger and the wordmark, which belong tight together; from `lg` the burger is gone and
          * the group is the wordmark and the links, which need real air between the brand and the
          * menu — 64px against the 40px that separates the links from each other, so the wordmark
          * reads as its own block rather than as a fifth entry.
          */}
        <div className="flex shrink-0 items-center gap-4 pt-px lg:gap-16">
          <MobileNavTrigger open={mobileNavOpen} onToggle={() => setMobileNavOpen((v) => !v)} />
          <Link
            href="/feed"
            className={`shrink-0 text-[0.95rem] font-semibold tracking-[-0.01em] text-[#222222] transition-opacity duration-[420ms] ${EASE} hover:opacity-60 dark:text-white`}
          >
            {/* Placeholder until the real mark ships as an image. */}
            logo
          </Link>
          <DashboardNavbarLinks />
        </div>

        {/*
          * The search field. Below `lg` it gives way to the disc in the account cluster — a field
          * on a phone would leave room for nothing else.
          */}
        {/*
          * Below `lg` the field is the row: the links are in the menu, so it takes everything
          * between the wordmark and the avatar. From `lg` it stops growing, is bounded, and is
          * pushed right by `ml-auto` so the links own the left of the bar.
          *
          * `lg:grow-0 lg:basis-[30rem]` rather than `lg:w-[30rem]`: it keeps `shrink`, so a
          * narrowing window takes width out of the field and never out of the navigation.
          */}
        <div className="min-w-0 flex-1 lg:ml-auto lg:grow-0 lg:basis-[30rem] xl:basis-[42rem]">
          <DashboardHeaderSearch fluid />
        </div>

        {/*
          * RIGHT — search, chat, bell, avatar, in that order and on one repeated gap.
          *
          * The separating rule that used to sit before the avatar is gone: the brief is right that
          * four controls on an even rhythm read as a set, and a rule inside the group breaks the
          * very symmetry it was meant to organise. Grouping now comes from spacing alone — one
          * `gap-1` between the icons, a wider margin ahead of the avatar and of any route action.
          */}
        <div className="flex shrink-0 items-center gap-1">
          {/*
           * Chat and bell are `lg` and up only. They stay mounted rather than unmounted — each owns
           * a poll and a dismiss baseline, and tearing those down on every resize past the
           * breakpoint would restart both. Below `lg` the same two destinations are in the menu.
           */}
          <span className="hidden lg:contents">
            <MessagesHeaderButton />
            <NotificationBell compact />
          </span>
          <div className="lg:ml-3">
            <HeaderAccountMenu />
          </div>
        </div>
      </div>

    </header>

    {mobileNavOpen ? null : <MessagesHeaderButton floating />}

    {/* Sibling of <header>, never a child: the bar's glass is a `backdrop-filter` layer, and a
        `backdrop-filter` ancestor becomes the containing block for `position: fixed` descendants —
        nested, this overlay's `inset-0` resolves against the 61px bar instead of the viewport. */}
    <DashboardMobileNav
      open={mobileNavOpen}
      onClose={() => setMobileNavOpen(false)}
      signals={[
        { href: '/messages', label: 'Messages' },
        { href: '/notifications', label: 'Notifications' },
      ]}
    />
    </>
  );
}
