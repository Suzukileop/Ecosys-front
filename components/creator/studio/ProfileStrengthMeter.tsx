'use client';

import Link from 'next/link';
import { useId, type MouseEvent } from 'react';
import type { ProfileCompleteness, ProfileCompletenessAction } from '@/lib/profile-completeness';
import { useT } from '@/lib/i18n/I18nProvider';

type ProfileStrengthMeterProps = {
  completeness: ProfileCompleteness;
  /** `rail`: the box above "Manage" (lg+). `inline`: one line under the header (phones / tablets). */
  variant: 'rail' | 'inline';
  /** Runs the in-page actions (Edit intro, photo picker, composer); `link` actions navigate on their own. */
  onAction: (action: Exclude<ProfileCompletenessAction, { kind: 'link' }>, trigger: HTMLElement) => void;
};

const ACTION_CLASS =
  'rounded-sm font-semibold text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

/*
 * The track takes --gn-line, not --gn-field: under `.news-feed` in light mode --gn-field is #FFF (fields
 * sit on grey cards there), which would vanish on My Profile's white page. --gn-line is #EFF3F4 /
 * #2F3336 — visible on both grounds — and the ink fill flips with the theme.
 */
function StrengthBar({ percent, labelledBy, className = '' }: { percent: number; labelledBy: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-labelledby={labelledBy}
      className={`h-1 overflow-hidden rounded-full bg-[color:var(--gn-line)] ${className}`}
    >
      <div
        className="h-full rounded-full bg-[color:var(--gn-ink)] transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/**
 * "Profile strength" (LinkedIn): how complete the owner's profile is and the one next step worth the
 * most. Owner view only; renders nothing at 100%.
 */
export function ProfileStrengthMeter({ completeness, variant, onAction }: ProfileStrengthMeterProps) {
  const t = useT();
  const titleId = useId();
  const { percent, next, nextGain } = completeness;
  if (!next || percent >= 100) return null;

  const action = next.action;
  const nextControl =
    action.kind === 'link' ? (
      <Link href={action.href} className={ACTION_CLASS}>
        {t(next.label)}
      </Link>
    ) : (
      <button
        type="button"
        onClick={(e: MouseEvent<HTMLButtonElement>) => onAction(action, e.currentTarget)}
        aria-haspopup={action.kind === 'intro' ? 'dialog' : undefined}
        className={ACTION_CLASS}
      >
        {t(next.label)}
      </button>
    );

  if (variant === 'inline') {
    /* Phones / tablets: a single 44px line between the header and the section tabs — the figure, a
       bar that takes the slack, the next step. The gain is left out so nothing wraps at 320px. */
    return (
      <div className="flex min-w-0 items-center gap-3 px-4 py-3 text-[13px] leading-[18px] sm:px-0">
        <span id={titleId} className="shrink-0 font-semibold text-[color:var(--gn-ink)]">
          {t('Profile')} {percent}%<span className="sr-only"> {t('complete')}</span>
        </span>
        <StrengthBar percent={percent} labelledBy={titleId} className="min-w-[3rem] flex-1" />
        <span className="shrink-0 text-[color:var(--gn-ink2)]">{nextControl}</span>
      </div>
    );
  }

  /* Rail: the Manage box's frame (`.gn-rail-box`) and side padding, but quieter — a 15px title instead
     of the 20px section heading, so it reads as a status above the navigation, not a second menu. */
  return (
    <section className="gn-rail-box flex flex-col gap-3 px-6 py-5" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-[15px] font-bold leading-5 text-[color:var(--gn-ink)]">
        {t('Profile {percent}% complete', { percent })}
      </h2>
      <StrengthBar percent={percent} labelledBy={titleId} />
      <p className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
        {t('Next:')} {nextControl}
        {nextGain > 0 ? <span className="tabular-nums"> · +{nextGain}%</span> : null}
      </p>
    </section>
  );
}
