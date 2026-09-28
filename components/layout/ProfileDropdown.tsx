'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/landing/ThemeProvider';

type ProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The account card under the avatar.
 *
 * Two things it deliberately does not do:
 *   - it does not handle clicks outside itself. Its only consumer (`HeaderAccountMenu`) wraps both
 *     the avatar and this card in one hover/click root and owns dismissal there; a second handler
 *     scoped to the card alone would fire on the avatar's own mousedown and fight the toggle.
 *   - it does not unmount when closed. It has to animate out as well as in, so it stays in the
 *     tree and goes `pointer-events-none`, with every control taken out of the tab order.
 */

const EASE_CLS = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

/**
 * Every row is full-strength ink, not the half-tone a menu usually uses. The hover still travels
 * and draws its underline, so the state is still legible without spending contrast on it.
 *
 * Hover is a flat surface swap and nothing else: no travel, no icon scale, and no hairline
 * drawing itself in under the label. The card is small and its rows are short — three animated
 * properties on each was a lot of motion to say "this one", and the rule in particular read as a
 * progress bar. `transition-none` so the tone lands with the pointer.
 */
const menuItemClass =
  'group/mi relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[#222222] transition-none hover:bg-black/[0.05] focus-visible:bg-black/[0.05] focus-visible:outline-none dark:text-neutral-200 dark:hover:bg-white/[0.07] dark:focus-visible:bg-white/[0.07]';
const menuIconClass = 'h-[1.05rem] w-[1.05rem] shrink-0';

export function ProfileDropdown({ open, onClose }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!user) return null;

  const tab = open ? undefined : -1;

  const handleLogout = async () => {
    onClose();
    await logout();
    // Hard navigation clears leftover client state from the previous session.
    window.location.assign('/login');
  };

  return (
    <div
      ref={ref}
      /*
       * Scaled and lifted from its top-right corner so it reads as unfolding out of the avatar
       * rather than sliding in from nowhere. The gap above it is padded by an invisible bridge
       * (below) — without it, the cursor crosses bare page on the way down and the hover path
       * closes the card it is travelling to.
       */
      className={`absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[19rem] origin-top-right rounded-2xl border border-neutral-900/[0.07] bg-white/85 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.5)] backdrop-blur-2xl transition-[opacity,transform] duration-[480ms] ${EASE_CLS} dark:border-white/[0.08] dark:bg-black/70 dark:shadow-[0_28px_70px_-26px_rgba(0,0,0,0.95)] ${
        open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-[0.96] opacity-0'
      }`}
      role="menu"
      aria-hidden={!open}
    >
      <span aria-hidden className="absolute -top-3 right-0 h-3 w-full" />
      {/* Same specular hairline as the bar, so the two surfaces read as one material. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 block h-px bg-gradient-to-r from-transparent via-neutral-900/10 to-transparent dark:via-white/20"
      />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#222222] dark:text-white">{user.fullName}</p>
            <p className="truncate text-xs text-[#222222] dark:text-neutral-300">{user.email}</p>
          </div>
        </div>
      </div>

      <span aria-hidden className="mx-4 block h-px bg-neutral-900/[0.07] dark:bg-white/[0.08]" />

      <div className="flex flex-col p-1.5">
        <Link href="/dashboard/creator" onClick={onClose} tabIndex={tab} className={menuItemClass} role="menuitem">
          <svg className={menuIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          My Profile
        </Link>
        {/* Inherited from the bar's old three-dot menu, which is gone. */}
        <button type="button" onClick={onClose} tabIndex={tab} className={menuItemClass} role="menuitem">
          <svg className={menuIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.5a2.25 2.25 0 113 2.122V13" />
            <path strokeLinecap="round" d="M12 16.25h.01" />
          </svg>
          Help
        </button>
      </div>

      <span aria-hidden className="mx-4 block h-px bg-neutral-900/[0.07] dark:bg-white/[0.08]" />

      <div className="px-4 py-3.5">
        <p className="mb-2.5 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-[#222222] dark:text-neutral-300">
          Appearance
        </p>
        {/* A hairline segmented control rather than a filled toggle: the selected half is marked by
            a thin outline and full contrast, which survives on glass where a shadowed pill does not. */}
        <div className="flex h-10 items-center gap-1 rounded-xl border border-neutral-900/[0.07] p-1 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => setTheme('light')}
            tabIndex={tab}
            aria-pressed={!isDark}
            className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-[color,background-color] duration-[420ms] ${EASE_CLS} ${
              !isDark
                ? 'bg-neutral-900/[0.06] text-[#222222] dark:bg-white/10 dark:text-white'
                : 'text-[#222222] dark:text-neutral-300 dark:hover:text-neutral-100'
            }`}
          >
            <SunIcon className="h-3.5 w-3.5 shrink-0" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            tabIndex={tab}
            aria-pressed={isDark}
            className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-[color,background-color] duration-[420ms] ${EASE_CLS} ${
              isDark
                ? 'bg-neutral-900/[0.06] text-[#222222] dark:bg-white/10 dark:text-white'
                : 'text-[#222222] dark:text-neutral-300 dark:hover:text-neutral-100'
            }`}
          >
            <MoonIcon className="h-3.5 w-3.5 shrink-0" />
            Dark
          </button>
        </div>
      </div>

      <span aria-hidden className="mx-4 block h-px bg-neutral-900/[0.07] dark:bg-white/[0.08]" />

      <div className="p-1.5">
        {/* Log out is a row like the others now: same box, same flat hover. Its centre-out
            underline was the last of the drawing-rule interactions in the card, and keeping one
            of them for one row made it read as a different kind of control. */}
        <button
          type="button"
          onClick={() => void handleLogout()}
          tabIndex={tab}
          className={`${menuItemClass} justify-start`}
          role="menuitem"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
