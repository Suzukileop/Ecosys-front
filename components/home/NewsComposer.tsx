'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { useAuth } from '@/context/AuthContext';

type Shortcut = { label: string; icon: ReactNode };

const iconProps = {
  className: 'h-[18px] w-[18px]',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const SHORTCUTS: Shortcut[] = [
  {
    label: 'Media',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m20.5 15.5-4.8-4.8a1 1 0 0 0-1.4 0L6.5 18.5" />
      </svg>
    ),
  },
  {
    label: 'Project',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" />
      </svg>
    ),
  },
  {
    label: 'Tools',
    icon: (
      <svg {...iconProps}>
        <path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.2 5.5l-2.4 13" />
      </svg>
    ),
  },
  {
    label: 'Estimate',
    icon: (
      <svg {...iconProps}>
        <path d="M20 12.6 12.6 20a1.6 1.6 0 0 1-2.2 0l-6.4-6.4V4h9.6l6.4 6.4a1.6 1.6 0 0 1 0 2.2Z" />
        <path d="M8.2 8.2h.01" />
      </svg>
    ),
  },
];

const shortcutClass =
  'inline-flex h-9 items-center gap-2 rounded-full px-3 text-[14px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:text-neutral-300 dark:hover:bg-white/[0.06] dark:hover:text-white dark:focus-visible:ring-white/30';

/** Inline "start a post" entry point at the top of the News feed. */
export function NewsComposer({
  canPublish,
  onCompose,
  compact = false,
  label = 'Share your work',
}: {
  canPublish: boolean;
  onCompose: () => void;
  /** Text of the compact pill. */
  label?: string;
  /** Inline pill (avatar + label) meant to sit next to a section title. */
  compact?: boolean;
}) {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || '';
  const initial = (user?.fullName?.trim() || user?.username || '?').slice(0, 1).toUpperCase();

  const avatar = (
    <AvatarImage
      src={user?.avatarUrl}
      className="h-11 w-11 shrink-0 rounded-full object-cover"
      fallback={
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {initial}
        </span>
      }
    />
  );

  if (!canPublish) {
    return (
      <div className="flex items-center gap-4 rounded-lg bg-white px-5 py-4 dark:bg-[#111111] sm:px-6">
        {avatar}
        <p className="min-w-0 flex-1 text-[15px] text-neutral-500 dark:text-neutral-400">
          Want to share your work here?
        </p>
        <Link
          href="/dashboard/creator"
          className="shrink-0 rounded-full bg-[#111111] px-4 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
        >
          Become a creator
        </Link>
      </div>
    );
  }

  const prompt = firstName
    ? `Share a project or a work update, ${firstName}…`
    : 'Share a project or a work update…';

  if (compact) {
    return (
      <button
        type="button"
        onClick={onCompose}
        className="inline-flex h-12 min-w-0 max-w-full items-center gap-3 rounded-full border border-black/20 py-1.5 pl-1.5 pr-1.5 text-[15px] font-semibold text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 dark:border-white/25 dark:text-white"
      >
        <AvatarImage
          src={user?.avatarUrl}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          fallback={
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[13px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {initial}
            </span>
          }
        />
        <span className="truncate">{label}</span>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF5722] text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
    );
  }

  return (
    <div className="bg-[#EEF0F2] max-md:border-y max-md:border-[#DADDE1] max-md:!bg-white dark:bg-[#111111] dark:max-md:border-white/[0.16] dark:max-md:!bg-[#111111] md:rounded-lg">
      <div className="flex items-center gap-3.5 px-5 pt-5 sm:px-6">
        {avatar}
        <button
          type="button"
          onClick={onCompose}
          className="h-11 min-w-0 flex-1 truncate rounded-full bg-white px-5 text-left text-[15px] text-neutral-500 max-md:border max-md:border-black/[0.1] dark:max-md:border-white/[0.1] transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:bg-white/[0.06] dark:text-neutral-400 dark:hover:bg-white/[0.09] dark:focus-visible:ring-white/30"
        >
          {prompt}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHORTCUTS.map((s) => (
            <button key={s.label} type="button" onClick={onCompose} className={shortcutClass}>
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCompose}
          className="shrink-0 rounded-full bg-[#111111] px-5 py-2 text-[14px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-[#111111]"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
