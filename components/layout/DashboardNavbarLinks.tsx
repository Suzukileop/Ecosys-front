'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
import { useDashboardNavItems, isNavActive } from '@/components/layout/dashboard/useDashboardNavItems';

/**
 * The main navigation, rendered in the bar's subnav row.
 *
 * It is the *only* navigation surface, at every width — there is no drawer and no overlay behind a
 * hamburger any more. Below `lg` the row cannot fit every entry, so it scrolls horizontally and
 * pulls the active entry into view on mount; a rail you can swipe beats a menu you have to open.
 *
 * Groups open as a small dropdown rather than expanding in place: a top bar has no vertical room
 * to grow into, and pushing the page down on hover would be worse than the menu it replaces.
 * (The config currently declares none, so this path is latent.)
 */

const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/*
 * The two pin points, spelled out in full. They cannot be derived from a shared base with a
 * `map` over a prefix: Tailwind scans source text, so a class assembled at runtime is never
 * generated and the rule silently does not exist. (It was written that way first, and the nav
 * stayed in the flow at every width with no error anywhere to show for it.)
 *
 * Pinning is what centres the nav on the viewport, but it also takes the nav out of the flow —
 * so flex can no longer keep it clear of its neighbours, and on a route that adds a wide page
 * action to the right block the two simply draw over each other (at 1024 the shortcuts ran
 * straight through "Don't stay a spectator."). Those routes therefore pin a breakpoint later,
 * where the extra width makes the overlap impossible. Every other route pins at `lg`.
 */
const PIN_AT_LG =
  'lg:absolute lg:left-1/2 lg:top-1/2 lg:w-auto lg:flex-none lg:-translate-x-1/2 lg:-translate-y-1/2 lg:gap-8 lg:overflow-x-visible lg:[mask-image:none] lg:[-webkit-mask-image:none]';
const PIN_AT_XL =
  'xl:absolute xl:left-1/2 xl:top-1/2 xl:w-auto xl:flex-none xl:-translate-x-1/2 xl:-translate-y-1/2 xl:gap-8 xl:overflow-x-visible xl:[mask-image:none] xl:[-webkit-mask-image:none]';

const LINK_CLS =
  'group/link relative inline-flex shrink-0 items-center whitespace-nowrap py-1 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-[420ms] focus-visible:outline-none';
const IDLE_CLS = 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white';
const ACTIVE_CLS = 'text-neutral-950 dark:text-white';

/**
 * A single hairline, inset from the text and grown from the centre. Inset because a rule running
 * the full width of a wide-tracked label reads as a highlight bar; stopping short of the last
 * letter-space keeps it a mark rather than a block.
 *
 * The active rule carries the accent; a hover rule stays `currentColor`. That split is deliberate:
 * orange means *this is where you are*, and spending it on a transient hover would leave the two
 * states saying the same thing in the same colour.
 */
function Underline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      style={active ? { backgroundColor: ACCENT_ORANGE } : undefined}
      className={`pointer-events-none absolute -bottom-1 left-0 right-[0.22em] block h-px origin-center transition-transform duration-[560ms] ${EASE_CLS} group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100 ${
        active ? 'scale-x-100' : 'scale-x-0 bg-current'
      }`}
    />
  );
}

function NavbarGroup({
  label,
  active,
  items,
}: {
  label: string;
  active: boolean;
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  // Pointer-driven, but with a grace period: a straight diagonal from the trigger to the last
  // item in the list otherwise leaves the trigger and closes the menu under the cursor.
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  useLayoutEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={rootRef}
      data-nav-active={active ? 'true' : undefined}
      className="relative shrink-0"
      onPointerEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onPointerLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
        className={`${LINK_CLS} ${active ? ACTIVE_CLS : IDLE_CLS}`}
      >
        {label}
        <Underline active={active} />
      </button>

      <div
        role="menu"
        aria-label={label}
        className={`absolute left-1/2 top-[calc(100%+0.85rem)] z-50 min-w-[12rem] -translate-x-1/2 overflow-hidden rounded-xl border border-neutral-200/70 bg-white/90 p-1.5 shadow-xl backdrop-blur-md transition-[opacity,transform] duration-[420ms] ${EASE_CLS} dark:border-white/[0.08] dark:bg-black/80 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        {items.map((child) => {
          const childActive = isNavActive(pathname, child.href);
          return (
            <Link
              key={child.href}
              href={child.href}
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
              onBlur={(event) => {
                if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
              }}
              className={`block rounded-lg px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors duration-[320ms] ${
                childActive
                  ? 'text-neutral-950 dark:text-white'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {child.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardNavbarLinks({ pinLate = false }: { pinLate?: boolean }) {
  const items = useDashboardNavItems();
  const railRef = useRef<HTMLElement | null>(null);

  /*
   * Centre the active entry in the rail. Written straight to the node — measuring and then
   * calling setState would re-render the whole rail on every route change for one number, and
   * this repo's `react-hooks/set-state-in-effect` rule is an error, not a warning.
   *
   * `scrollLeft` rather than `scrollIntoView`: the latter walks up every scrollable ancestor and
   * would drag the page itself sideways (and vertically) to reveal a row that is already on
   * screen. Setting the scroller's own offset touches nothing else.
   *
   * Measured from rectangles, not `offsetLeft`. Unpinned, the rail is `position: static`, so a
   * link's `offsetParent` is not the rail but the nearest positioned ancestor — the row — and
   * `offsetLeft` therefore carries the wordmark's width with it. The rail scrolled by that much
   * too far and pushed the active entry off its own left edge.
   */
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const active = rail.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (!active) return;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const railBox = rail.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const offsetWithinRail = activeBox.left - railBox.left + rail.scrollLeft;
    rail.scrollLeft = Math.max(
      0,
      offsetWithinRail - (rail.clientWidth - activeBox.width) / 2
    );
  });

  if (items.length === 0) return null;

  return (
    // Two positioning modes in one element.
    //
    // Once pinned it leaves the flow and sits on the row's midpoint, which is the only way to
    // centre it on the *viewport*: `justify-between` distributes free space, so an in-flow centre
    // block lands on the midpoint only when both side blocks are the same width, and a 72px
    // wordmark against a ~160px control cluster never will be. Out of flow it also stops being
    // sized by the flex algorithm, which is what used to make it overflow onto its neighbours.
    //
    // `hidden lg:flex`: below `lg` the bar has no room for the links and `DashboardMobileNav`
    // carries them instead. Exactly one of the two is ever measurable, which is what keeps the
    // one-visible-nav rule true without the two components having to know about each other.
    //
    // `min-w-[4.5rem]` rather than `min-w-0`: at `lg` a route that also puts a wide control in the
    // row would otherwise squeeze the rail to nothing.
    //
    // No `justify-center` on the unpinned state: on an overflowing scroll container it centres the
    // content and pushes the start out of reach, so the first entry can never be scrolled back to.
    // Pinned it is `w-auto` and never overflows, so nothing needs centring there either.
    //
    // Below the pin point there is no midpoint worth pinning to, so it is an in-flow scrollable rail
    // between the two anchors. The tail mask turns the clip into an affordance — without it the
    // last label is cut mid-word and reads as a layout fault. A mask rather than a gradient
    // overlay, because the bar is translucent and an overlay would have to fade to a solid colour
    // that is not actually there. Both lift at `lg`, where nothing scrolls.
    <nav
      ref={railRef}
      aria-label="Main navigation"
      className={`pf-scrollbar-hide hidden min-w-[4.5rem] flex-1 items-center gap-6 overflow-x-auto lg:flex [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] sm:gap-8 ${
        pinLate ? PIN_AT_XL : PIN_AT_LG
      }`}
    >
      {items.map(({ item, children, active, key }) =>
        children.length > 0 ? (
          <NavbarGroup
            key={key}
            label={item.label}
            active={active}
            items={children.map((child) => ({ href: child.href, label: child.label }))}
          />
        ) : (
          <Link
            key={key}
            href={item.href}
            data-nav-active={active ? 'true' : undefined}
            aria-current={active ? 'page' : undefined}
            className={`${LINK_CLS} ${active ? ACTIVE_CLS : IDLE_CLS}`}
          >
            {item.label}
            <Underline active={active} />
          </Link>
        )
      )}
    </nav>
  );
}
