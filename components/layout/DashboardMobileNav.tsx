'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ACCENT_ORANGE } from '@/components/landing/landingBrand';
import { useDashboardNavItems } from '@/components/layout/dashboard/useDashboardNavItems';

/**
 * The navigation below `lg`.
 *
 * Above `lg` the bar carries the links itself and this does not exist in the layout at all — which
 * is what keeps the one-visible-nav rule true: the bar's `<nav>` is `hidden lg:flex`, this one is
 * `lg:hidden`, so exactly one of the two is ever measurable.
 *
 * Rendered as a sibling of `<header>`, never inside it. The bar's glass is a `backdrop-filter`
 * layer, and a `backdrop-filter` ancestor becomes the containing block for `position: fixed`
 * descendants — nested, this overlay's `inset-0` would resolve against the 61px bar instead of the
 * viewport and render as a sliver.
 */

const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/** Rows arrive on a stagger; closing runs them together, because nothing is being revealed. */
function revealStyle(open: boolean, index: number) {
  return { transitionDelay: open ? `${90 + index * 50}ms` : '0ms' };
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

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-label="Navigation"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white/80 backdrop-blur-xl transition-[opacity,transform] duration-[560ms] ${EASE_CLS} dark:bg-black/60 lg:hidden ${
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
      }`}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-[0.95rem] sm:px-6">
        <span className="text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-white">
          Noproble
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          tabIndex={open ? undefined : -1}
          className={`-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-[color,transform] duration-[420ms] ${EASE_CLS} hover:scale-110 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 dark:text-neutral-200 dark:hover:text-white`}
        >
          <svg className="h-[1.15rem] w-[1.15rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-col px-4 pt-6 sm:px-6"
      >
        {items.map(({ item, children, active, target, key }, index) => (
          <Link
            key={key}
            href={children.length > 0 ? target : item.href}
            onClick={onClose}
            tabIndex={open ? undefined : -1}
            aria-current={active ? 'page' : undefined}
            style={{
              ...revealStyle(open, index),
              ...(active ? { color: ACCENT_ORANGE } : undefined),
            }}
            className={`block py-3.5 text-[1.75rem] font-semibold uppercase leading-[1.1] tracking-[0.06em] transition-[opacity,transform,color] duration-[520ms] ${EASE_CLS} sm:text-[2.1rem] ${
              active ? '' : 'text-neutral-500 dark:text-neutral-400'
            } ${open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {signals.length > 0 ? (
        <div className="mt-8 px-4 sm:px-6">
          <span
            className={`mb-1 block text-[0.6rem] font-medium uppercase tracking-[0.3em] text-neutral-400 transition-opacity duration-[520ms] ${EASE_CLS} dark:text-neutral-600 ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
            style={revealStyle(open, items.length)}
          >
            Activity
          </span>
          {signals.map((signal, index) => (
            <Link
              key={signal.href}
              href={signal.href}
              onClick={onClose}
              tabIndex={open ? undefined : -1}
              style={revealStyle(open, items.length + 1 + index)}
              className={`group/sig flex items-center justify-between gap-4 border-b border-black/[0.06] py-4 transition-[opacity,transform] duration-[520ms] ${EASE_CLS} dark:border-white/[0.06] ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              }`}
            >
              <span className="text-[1rem] font-medium text-neutral-800 dark:text-neutral-200">
                {signal.label}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-[420ms] ${EASE_CLS} group-hover/sig:translate-x-1 dark:text-neutral-600`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
