'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDashboardNavItems } from '@/components/layout/dashboard/useDashboardNavItems';

/**
 * The navigation below `lg`.
 *
 * Above `lg` the bar carries the links itself and this does not exist in the layout at all — which
 * is what keeps the one-visible-nav rule true: the bar's `<nav>` is `hidden lg:flex`, this one is
 * `lg:hidden`, so exactly one of the two is ever measurable.
 *
 * **It is a sheet under the bar, not a curtain over it.** It opens at `--dash-header-h` and runs
 * to the bottom edge, so the header — wordmark, search, avatar and the burger that opened this —
 * stays on screen and keeps working the whole time. A full-viewport overlay took the brand, the
 * search and the account away at the exact moment the visitor was trying to get somewhere, and
 * left the burger-turned-cross as the only thing on screen that still did anything.
 *
 * Still rendered as a sibling of `<header>`, never inside it. The bar's glass is a
 * `backdrop-filter` layer, and a `backdrop-filter` ancestor becomes the containing block for
 * `position: fixed` descendants — nested, this sheet's offsets would resolve against the 61px bar
 * instead of the viewport.
 *
 * The form is a ledger: full-bleed rows on hairlines, one band per group. No cards, no icons, no
 * type larger than it needs to be. The whole gesture is carried by the rule that draws itself in
 * under the row you are on.
 */

const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/** Rows arrive on a stagger; closing runs them together, because nothing is being revealed. */
function revealStyle(open: boolean, index: number) {
  return { transitionDelay: open ? `${70 + index * 45}ms` : '0ms' };
}

/**
 * One row of the ledger — the same geometry whether it links, expands, or nests.
 *
 * The hover is a flat surface swap and nothing else: no transition on it, so the tone snaps in
 * and out rather than easing. Deliberate — on a touch sheet the point of the state is to confirm
 * *which row* is under the finger, and a 460ms fade answers that question after the tap is
 * already over. `active:` carries the same tone for touch, which has no hover at all.
 */
const ROW_CLS =
  'group/row relative flex w-full items-center justify-between gap-4 px-4 py-[1.15rem] text-left transition-none hover:bg-[rgba(34,34,34,0.07)] active:bg-[rgba(34,34,34,0.07)] dark:hover:bg-white/[0.07] dark:active:bg-white/[0.07] sm:px-6';

/** The hairline between rows. Full-bleed: a rule that stops short of the edge reads as a card. */
const RULE_CLS = 'border-b border-[rgba(34,34,34,0.09)] dark:border-white/[0.07]';

/**
 * The band that titles a group of rows. It is the one filled surface in the sheet, which is why it
 * can be this quiet — a tone change across the full width separates two lists more clearly than
 * any amount of extra space between them.
 */
function SheetBand({ label, open, index }: { label: string; open: boolean; index: number }) {
  return (
    <div
      style={revealStyle(open, index)}
      className={`${RULE_CLS} bg-[rgba(34,34,34,0.045)] px-4 py-3 transition-opacity duration-[460ms] ${EASE_CLS} dark:bg-white/[0.05] sm:px-6 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
    </div>
  );
}

/**
 * The sheet's row label. Where you are is said the same way the bar says it — a step to near-black
 * plus a hairline under the words — and not with the accent, which used to make the navigation
 * change hue depending on which section you were in. See `DashboardNavbarLinks`.
 */
function RowLabel({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span
      className={`relative inline-block text-[1.05rem] font-medium leading-[1.2] tracking-[-0.005em] ${
        active ? 'text-[#0A0A0A] dark:text-white' : 'text-neutral-800 dark:text-neutral-200'
      }`}
    >
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

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-[460ms] ${EASE_CLS} dark:text-neutral-500 ${
        expanded ? 'rotate-180' : ''
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Secondary destinations shown under the main links. Deliberately without unread counts: the
 * counts live inside `MessagesHeaderButton` and `NotificationBell`, each of which owns its own
 * poll, and reading them here would mean either duplicating those requests or lifting both into a
 * store. Neither is worth it for a number you are one tap away from seeing in full.
 */
type Signal = { href: string; label: string };

export function DashboardMobileNav({
  open,
  onClose,
  signals,
}: {
  open: boolean;
  onClose: () => void;
  /** Messages / notifications, passed in so this component owns no data fetching of its own. */
  signals: Signal[];
}) {
  const items = useDashboardNavItems();
  /* One open group at a time. An accordion that lets every branch stand open turns a list you can
     read at a glance into a page you have to scroll, which is the thing this sheet replaced. */
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  /* Row indices run across both lists so the stagger reads as one sweep down the sheet rather
     than as two lists arriving at once. */
  let row = 0;

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-label="Navigation"
      aria-hidden={!open}
      /*
       * `top-[var(--dash-header-h)]`, written by the header itself, is what keeps the bar in view
       * and the sheet flush under it at any bar height — the bar grows on routes that add a page
       * action, and a hardcoded 61px would have left a seam there. The fallback matters for the
       * first paint before the measurement lands.
       *
       * `z-30` sits under the bar's `z-40` on purpose: the two do not overlap, but if the bar ever
       * grows while the sheet is open it has to pass over it, not under.
       *
       * Opaque, not glass. The sheet no longer sits over the page as a scrim — it *is* the surface
       * you are reading, and translucency here would leave the page's own type showing through the
       * rules.
       */
      className={`fixed inset-x-0 bottom-0 top-[var(--dash-header-h,3.85rem)] z-30 flex flex-col overflow-y-auto overscroll-contain bg-[#F8F8F8] transition-[opacity,transform] duration-[520ms] ${EASE_CLS} dark:bg-[#0A0A0A] lg:hidden ${
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
    >
      <SheetBand label="Explore" open={open} index={row++} />

      <nav aria-label="Main navigation" className="flex flex-col">
        {items.map(({ item, children, active, target, key }) => {
          const index = row++;
          const isGroup = children.length > 0;
          const isExpanded = expanded === key;

          return (
            <div key={key} className={RULE_CLS}>
              <div
                style={revealStyle(open, index)}
                className={`transition-[opacity,transform] duration-[520ms] ${EASE_CLS} ${
                  open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}
              >
                {isGroup ? (
                  /* A group's own row toggles rather than navigates: on a phone the parent page
                     is one tap further down its own list, and a row that sometimes navigates and
                     sometimes opens is the least predictable control on the sheet. */
                  <button
                    type="button"
                    onClick={() => setExpanded((current) => (current === key ? null : key))}
                    aria-expanded={isExpanded}
                    tabIndex={open ? undefined : -1}
                    className={ROW_CLS}
                  >
                    <RowLabel active={active}>{item.label}</RowLabel>
                    <Chevron expanded={isExpanded} />
                  </button>
                ) : (
                  <Link
                    /* `target`, not `item.href` — see `useDashboardNavItems`. */
                    href={target}
                    onClick={onClose}
                    tabIndex={open ? undefined : -1}
                    aria-current={active ? 'page' : undefined}
                    className={ROW_CLS}
                  >
                    <RowLabel active={active}>{item.label}</RowLabel>
                  </Link>
                )}
              </div>

              {isGroup ? (
                /*
                 * `grid-rows-[0fr] -> [1fr]` rather than a `max-height` guess, so the row resolves
                 * to the children's real height at any width. The inner element needs
                 * `min-h-0 overflow-hidden` or the grid refuses to take it below its content
                 * height and the row simply never closes.
                 */
                <div
                  className={`grid transition-[grid-template-rows] duration-[520ms] ${EASE_CLS} ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col pb-2">
                      {children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          tabIndex={open && isExpanded ? undefined : -1}
                          className="group/row flex items-center px-4 py-3 text-left hover:bg-[rgba(34,34,34,0.07)] active:bg-[rgba(34,34,34,0.07)] dark:hover:bg-white/[0.07] dark:active:bg-white/[0.07] sm:px-6"
                        >
                          <span className="block pl-4 text-[0.95rem] leading-[1.2] text-neutral-500 dark:text-neutral-400">
                            {child.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      {signals.length > 0 ? (
        <>
          <SheetBand label="Activity" open={open} index={row++} />
          <div className="flex flex-col">
            {signals.map((signal) => {
              const index = row++;
              return (
                <div
                  key={signal.href}
                  style={revealStyle(open, index)}
                  /* The entrance lives on the wrapper, never on the row: the row is
                     `transition-none` so its hover tone snaps, and a transition declared on the
                     same element would put the two back in conflict. */
                  className={`${RULE_CLS} transition-[opacity,transform] duration-[520ms] ${EASE_CLS} ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                  }`}
                >
                  <Link
                    href={signal.href}
                    onClick={onClose}
                    tabIndex={open ? undefined : -1}
                    className={ROW_CLS}
                  >
                    <RowLabel active={false}>{signal.label}</RowLabel>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {/* The sheet runs to the bottom edge whatever it holds: without this the rules stop halfway
          down a tall phone and the surface below them reads as a different panel. */}
      <div aria-hidden className="grow" />
    </div>
  );
}
