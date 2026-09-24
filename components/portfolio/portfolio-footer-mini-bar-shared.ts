'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';

/** Shared prop shape for all 3 "Mini bottom bar" variant components. */
export interface FooterMiniBarVariantProps {
  creatorName: string;
  locationLabel?: string | null;
  /** IANA timezone id (profile.timezoneId) — drives the live clock. No id → no clock. */
  timezoneId?: string | null;
  /** Mirrors the portfolio's real active color mode, same convention as every full-bleed
   *  premium Footer design (Timezone Editorial, Inverted Wordmark, ...) — a literal pure
   *  black/white canvas branched on this, not a site CSS token. */
  colorMode: 'light' | 'dark';
  /** Resolved hex accent (Footer palette's "accent" slot) — only the Kinetic variant's
   *  scroll-progress fill reads this; harmless to pass to every variant. */
  accentColor?: string | null;
  contentGutter?: PortfolioContentGutter;
  /**
   * The 5 fields below feed only the 5 "design-origin" variants (Landing / Contact CTA /
   * Hero columns / Inverted wordmark / Services reveal) — each was extracted verbatim from
   * a Footer design's own hardcoded sub-footer bar, so unlike Minimal/Kinetic/Split caps
   * (which derive a generic "© year name." from `creatorName` alone via
   * `footerMiniBarCopyrightBase`), they need the *actual* resolved copyright label/
   * availability/credit text their source design used. Harmless to pass to every variant;
   * Minimal/Kinetic/Split caps ignore them.
   */
  /** Pre-resolved copyright label (`resolveFooterCopyrightLabel(copyrightLabel, creatorName)`) —
   *  null/empty hides the copyright line entirely. */
  copyrightText?: string | null;
  /** Only the Hero columns variant's "WE ARE OPEN"/"WE ARE CLOSED" status reads this. */
  isAvailable?: boolean | null;
  /** Only the Hero columns variant's status line reads this. */
  hoursLabel?: string | null;
  /** Only the Inverted wordmark variant's centered credit line reads this
   *  (`presentation.invertedWordmarkCredit`). */
  creditLabel?: string | null;
  /** Resolved from the Footer section's own Background tab (`sectionBackgroundStyle`) —
   *  `undefined` when that tab is off, so every variant's canvas is transparent (the
   *  page/global wallpaper shows through) by default, same as the main Footer designs. */
  backgroundStyle?: CSSProperties;
}

/** Shared by all 3 "Mini bottom bar" variants (Minimal / Kinetic line / Split caps) — same
 *  role as `portfolio-contact-design-motion.ts` for the Contact family: these are tightly
 *  coupled siblings of one feature (not independently-adopted full Footer designs), so a
 *  shared helper is the right call here even though most other Footer/Contact design files
 *  each keep their own private copy of small helpers like this. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface FooterMiniBarLiveClockParts {
  hour: string;
  minute: string;
  period: string;
}

/** `hour:minute AM/PM` in the creator's own timezone, refreshed every second — the whole
 *  point of this bar is a *live* clock, so (unlike the Timezone header's 30s tick, which
 *  only needs minute-accuracy) it can't coarsen the interval. No `timezoneId` → no clock,
 *  same graceful-hide convention as the Timezone header/footer designs (`Intl.DateTimeFormat`
 *  throws on a bad/unknown id, caught here so it just hides instead of crashing the bar). */
export function useFooterMiniBarLiveClock(timezoneId?: string | null): FooterMiniBarLiveClockParts | null {
  const [parts, setParts] = useState<FooterMiniBarLiveClockParts | null>(null);

  useEffect(() => {
    const clear = () => setParts(null);

    const tz = timezoneId?.trim();
    if (!tz) {
      clear();
      return undefined;
    }

    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('[PortfolioFooterMiniBar] Invalid IANA timezone id', tz, error);
      clear();
      return undefined;
    }

    const tick = () => {
      try {
        const found = formatter.formatToParts(new Date());
        const hour = found.find((part) => part.type === 'hour')?.value ?? '';
        const minute = found.find((part) => part.type === 'minute')?.value ?? '';
        const period = (found.find((part) => part.type === 'dayPeriod')?.value ?? '').toUpperCase();
        if (!hour || !minute) {
          clear();
          return;
        }
        setParts({ hour, minute, period });
      } catch (error) {
        console.error('[PortfolioFooterMiniBar] Failed to format local time', error);
        clear();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [timezoneId]);

  return parts;
}

/** `© {year} {NAME}.` — the shared copyright base every mini-bar variant starts from
 *  (Minimal appends "All rights reserved.", Split caps abbreviates the name instead). */
export function footerMiniBarCopyrightBase(creatorName: string, year = new Date().getFullYear()): string {
  const name = creatorName?.trim() || '';
  if (!name) return '';
  return `© ${year} ${name}.`;
}

/** "Leopard Julio Cesar" → "Leopard J.C." — keeps the first word whole, abbreviates every
 *  following word to its initial. Purely a Split-caps typographic convention (per spec),
 *  not a general name-formatting utility used elsewhere. */
export function abbreviateFooterMiniBarName(creatorName: string): string {
  const words = creatorName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length <= 1) return words[0] ?? '';
  const [first, ...rest] = words;
  const initials = rest.map((word) => `${word[0]?.toUpperCase() ?? ''}.`).join('');
  return `${first} ${initials}`;
}
