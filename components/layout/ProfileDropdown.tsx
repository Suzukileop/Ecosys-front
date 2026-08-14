'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/landing/ThemeProvider';
import { enterBrowserFullscreen, exitBrowserFullscreen } from '@/lib/browser-fullscreen';

type ProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
};

function FocusEnterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

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

function FocusExitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9L5 5M5 5v3M5 5h3M15 9l4-4m0 0v3m0-3h-3M9 15l-4 4m0 0h3m-3 0v-3M15 15l4 4m0 0h-3m3 0v-3"
      />
    </svg>
  );
}

const menuItemClass =
  'flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-black transition-colors hover:bg-neutral-200 dark:text-white dark:hover:bg-neutral-800';
const menuIconClass = 'h-5 w-5 shrink-0';

export function ProfileDropdown({ open, onClose }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const [focusActive, setFocusActive] = useState(false);

  useEffect(() => {
    const sync = () => setFocusActive(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    // Hard navigation clears leftover client state from the previous session.
    window.location.assign('/login');
  };

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
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-neutral-900"
      role="menu"
    >
      <div className="border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black dark:text-white">{user.fullName}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 px-2 py-2">
        <Link
          href="/dashboard/creator"
          onClick={onClose}
          className={menuItemClass}
          role="menuitem"
        >
          <svg className={menuIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          My Profile
        </Link>
        <button
          type="button"
          onClick={() => void toggleFocus()}
          className={menuItemClass}
          role="menuitem"
          aria-pressed={focusActive}
        >
          {focusActive ? (
            <FocusExitIcon className={menuIconClass} />
          ) : (
            <FocusEnterIcon className={menuIconClass} />
          )}
          {focusActive ? 'Exit focus' : 'Focus'}
        </button>
      </div>

      <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Appearance</p>
        <div className="flex h-10 items-center rounded-xl border border-neutral-200/80 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-black">
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={!isDark}
            className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              !isDark
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <SunIcon className="h-3.5 w-3.5 shrink-0" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={isDark}
            className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              isDark
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <MoonIcon className="h-3.5 w-3.5 shrink-0" />
            Dark
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="text-sm font-medium text-neutral-600 transition hover:text-[#EA580C] dark:text-neutral-400"
          role="menuitem"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
