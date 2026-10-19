'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AvatarImage } from '@/components/ui/PersonAvatar';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

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
    label: msg('Media'),
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m20.5 15.5-4.8-4.8a1 1 0 0 0-1.4 0L6.5 18.5" />
      </svg>
    ),
  },
  {
    label: msg('Project'),
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" />
      </svg>
    ),
  },
  {
    label: msg('Tools'),
    icon: (
      <svg {...iconProps}>
        <path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.2 5.5l-2.4 13" />
      </svg>
    ),
  },
  {
    label: msg('Estimate'),
    icon: (
      <svg {...iconProps}>
        <path d="M20 12.6 12.6 20a1.6 1.6 0 0 1-2.2 0l-6.4-6.4V4h9.6l6.4 6.4a1.6 1.6 0 0 1 0 2.2Z" />
        <path d="M8.2 8.2h.01" />
      </svg>
    ),
  },
];

/** Tool shortcut: 36px pill, icon 18 + label 14/20 medium in secondary ink — the field is the hero. */
const shortcutClass =
  'gn-shortcut inline-flex h-9 items-center gap-2 rounded-full px-3 text-[14px] font-medium leading-5 text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/** The one filled button on the page, 36px, 14/20 semibold. Its colours are tokens: brand orange
 *  (#FF5722, #E64A19 on hover) as a fallback; the `.news-theme` X palette makes it solid
 *  ink — black on light, white on dark. */
const primaryButtonClass =
  'gn-primary inline-flex h-9 shrink-0 items-center rounded-full bg-[color:var(--gn-primary,var(--gn-accent-fill))] px-4 text-[14px] font-semibold leading-5 text-[color:var(--gn-primary-ink,#ffffff)] transition-colors hover:bg-[color:var(--gn-primary-hover,#E64A19)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

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
  const t = useT();
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || '';
  const initial = (user?.fullName?.trim() || user?.username || '?').slice(0, 1).toUpperCase();

  const avatar = (
    <AvatarImage
      src={user?.avatarUrl}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
      displayWidth={40}
      fallback={
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[14px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
          {initial}
        </span>
      }
    />
  );

  if (!canPublish) {
    return (
      <div className="gn-card flex items-center gap-3 p-4">
        {avatar}
        <p className="min-w-0 flex-1 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
          {t('Want to share your work here?')}
        </p>
        <Link href="/profile" className={primaryButtonClass}>
          {t('Become a creator')}
        </Link>
      </div>
    );
  }

  const prompt = firstName
    ? `Share a project or a work update, ${firstName}…`
    : t('Share a project or a work update…');

  if (compact) {
    return (
      <button
        type="button"
        onClick={onCompose}
        className="inline-flex h-12 min-w-0 max-w-full items-center gap-3 rounded-full border border-black/20 py-1.5 pl-1.5 pr-1.5 text-[15px] font-semibold text-[#111111] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF5722]/50 dark:border-white/25 dark:text-white"
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

  /*
   * Composer — one card. Row 1: 40px avatar + a 44px field (15/20, secondary ink placeholder); the
   * field is the hero, as on every major feed. Row 2 (from sm): the tool shortcuts start on the
   * field's left edge (52px = avatar + gap) and Publish closes the row. Phones keep row 1 only — the
   * field opens the full composer, which has every tool, so the second row was 52px of repetition.
   */
  return (
    <section className="gn-card p-4" aria-label={t('Create a post')}>
      <div className="flex items-center gap-3">
        {avatar}
        <button
          type="button"
          onClick={onCompose}
          className="gn-field-input h-11 min-w-0 flex-1 truncate rounded-lg bg-[color:var(--gn-inset)] px-4 text-left text-[15px] leading-5 text-[color:var(--gn-ink2)] transition-colors hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
        >
          <span className="sm:hidden">{t('Share your work…')}</span>
          <span className="hidden sm:inline">{prompt}</span>
        </button>
      </div>
      <div className="mt-3 hidden items-center gap-2 pl-[52px] sm:flex">
        <div className="-ml-3 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SHORTCUTS.map((s) => (
            <button key={s.label} type="button" onClick={onCompose} className={shortcutClass}>
              {s.icon}
              <span>{t(s.label)}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onCompose} className={primaryButtonClass}>
          {t('Publish')}
        </button>
      </div>
    </section>
  );
}
