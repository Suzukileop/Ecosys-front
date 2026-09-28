'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardNavItems, isNavActive } from '@/components/layout/dashboard/useDashboardNavItems';

/**
 * The main navigation, sitting immediately after the wordmark on the left of the bar.
 *
 * It used to be pinned to the viewport midpoint. That is gone, and with it the pair of breakpoint
 * pin classes and the scrolling rail they needed: left-aligned, the links are simply in the flow,
 * which is both the reference layout and far less machinery. Below `lg` they are hidden and
 * `DashboardMobileNav` carries them — exactly one of the two is ever measurable.
 *
 * Sentence case rather than wide-tracked caps. Caps at 11px made the row read as a label strip;
 * at reading size and near-black they read as what they are, which is the product's own menu.
 *
 * Groups open as a small dropdown rather than expanding in place: a top bar has no vertical room
 * to grow into. Providers and Products use it for Explore / My Services and Explore / My Product,
 * which were a segmented pill pinned to the right of the bar until they moved under the entry
 * they belong to.
 */

const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

const LINK_CLS =
  'group/link relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap py-1 text-[0.9rem] font-medium tracking-[-0.005em] transition-none focus-visible:outline-none';
/*
 * One flat value, at rest and under the pointer alike: `#222222` in light, `neutral-300` in dark —
 * the bar's glyphs sit on exactly that pair, so every label and every icon in the row is one ink.
 *
 * No opacity step, no muted-to-full ramp, no plate. The hover changes nothing here.
 */
const IDLE_CLS = 'text-[#222222] dark:text-neutral-300';
const ACTIVE_CLS = 'text-[#0A0A0A] dark:text-white';

/**
 * Where you are, said without colour.
 *
 * The accent used to carry this — the active entry was simply orange. It is gone: the bar is the
 * one place every section of the product meets, so spending the brand colour on whichever of them
 * you happen to be in makes the navigation change hue as you move through the app, and the mark
 * ends up reading as a brand flourish rather than as a position.
 *
 * Two colourless cues instead, and they reinforce each other: the label steps from `#222` to
 * near-black, and a hairline in `currentColor` sits under it. Either alone is arguable; together
 * they are unmistakable and still quieter than the orange was.
 */
function NavLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className="relative">
      {children}
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-0 right-0 block h-px bg-current"
        />
      ) : null}
    </span>
  );
}

/** The affordance that says an entry holds a menu. Rotates to point up while it is open. */
function NavChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-3 w-3 shrink-0 transition-transform duration-[420ms] ${EASE_CLS} ${
        open ? 'rotate-180' : ''
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
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

  /*
   * Click to open, never hover.
   *
   * Hover-to-open cost this menu more than it bought: it fired whenever the pointer merely
   * crossed the entry on its way somewhere else, it needed a close grace period and a padded
   * bridge under the trigger to survive the gap down to the panel, and on touch it resolved to
   * the first tap anyway — so the control already behaved two different ways depending on the
   * device. A chevron states that the entry opens, and a click opens it. Nothing to forgive.
   *
   * The two ways out that a pointer-driven menu got for free now have to be explicit: a press
   * anywhere outside, and Escape.
   */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-nav-active={active ? 'true' : undefined} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={`${LINK_CLS} ${active ? ACTIVE_CLS : IDLE_CLS}`}
      >
        <NavLabel active={active}>{label}</NavLabel>
        <NavChevron open={open} />
      </button>

      <div
        role="menu"
        aria-label={label}
        className={`absolute left-0 top-[calc(100%+0.85rem)] z-50 min-w-[12rem] overflow-hidden rounded-xl border border-neutral-900/[0.07] bg-white/95 p-1.5 shadow-xl backdrop-blur-md transition-[opacity,transform] duration-[420ms] ${EASE_CLS} dark:border-white/[0.08] dark:bg-black/80 ${
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
              className={`block rounded-lg px-3 py-2 text-[0.85rem] font-medium transition-none ${
                childActive
                  ? 'text-[#0A0A0A] dark:text-white'
                  : 'text-[#222222] dark:text-neutral-300'
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

export function DashboardNavbarLinks() {
  const items = useDashboardNavItems();
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="hidden shrink-0 items-center gap-8 lg:flex xl:gap-10"
    >
      {items.map(({ item, children, active, target, key }) =>
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
            /* `target`, not `item.href`: a group collapsed to one visible child resolves here. */
            href={target}
            data-nav-active={active ? 'true' : undefined}
            aria-current={active ? 'page' : undefined}
            className={`${LINK_CLS} ${active ? ACTIVE_CLS : IDLE_CLS}`}
          >
            <NavLabel active={active}>{item.label}</NavLabel>
          </Link>
        )
      )}
    </nav>
  );
}
