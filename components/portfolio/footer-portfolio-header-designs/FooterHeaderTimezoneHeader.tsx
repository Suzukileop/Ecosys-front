'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_FOOTER_PRESENTATION,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  FOOTER_HEADER_MARGIN_BOTTOM_REM,
  FOOTER_HEADER_PADDING_REM,
  footerHeaderPaletteTokenColor,
} from '@/components/portfolio/portfolio-footer-header-settings';

const DEFAULT_KICKER_TEXT = '( Get in touch )';
const DEFAULT_TITLE_TEXT = "Let's start\na conversation.";
const DEFAULT_DESCRIPTION_TEXT = 'Reach out and tell us about your project — we read every message.';

/** Derives a `hour:minute` local-time string from an IANA timezone id, refreshed every
 *  ~30s. `Intl.DateTimeFormat` throws on an invalid/unknown id — caught here so a bad
 *  or missing `timezoneId` just hides the clock instead of crashing the header. Direct
 *  port of the same hook in the "Timezone editorial" Footer design. */
function useLocalClock(timezoneId?: string | null): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const clear = () => setTime(null);

    const tz = timezoneId?.trim();
    if (!tz) {
      clear();
      return undefined;
    }

    let formatter: Intl.DateTimeFormat;
    try {
      formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('[FooterHeaderTimezoneHeader] Invalid IANA timezone id', tz, error);
      clear();
      return undefined;
    }

    const tick = () => {
      try {
        setTime(formatter.format(new Date()));
      } catch (error) {
        console.error('[FooterHeaderTimezoneHeader] Failed to format local time', error);
        clear();
      }
    };

    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, [timezoneId]);

  return time;
}

/**
 * Timezone — a Footer-local 11th design, modeled on the "Timezone editorial" Footer
 * design's own top block: an asymmetric two-column layout. Left — a micro kicker, a
 * two-line display headline, and a short description. Right, pinned to the far edge —
 * a live local clock (from `timezoneId`) and a location caption. No contact pill, no
 * social links, no watermark — those stay the section's own job, not the header's.
 */
export function FooterHeaderTimezoneHeader({
  presentation: presentationProp,
  trailing,
  locationLabel,
  timezoneId,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioFooterPresentationSettings;
  trailing?: ReactNode;
  locationLabel?: string | null;
  timezoneId?: string | null;
}) {
  const presentation = presentationProp ?? DEFAULT_FOOTER_PRESENTATION;
  const kickerText = (presentation.headerTimezoneKickerText || DEFAULT_KICKER_TEXT).trim();
  const titleText = (presentation.headerTimezoneTitleText || DEFAULT_TITLE_TEXT).trim();
  const descriptionText = (presentation.headerTimezoneDescriptionText || DEFAULT_DESCRIPTION_TEXT).trim();
  const ink = footerHeaderPaletteTokenColor(presentation.headerTimezoneTitleColor ?? 'texteFort');
  const kickerInk = `color-mix(in srgb, ${ink} 42%, transparent)`;
  const descriptionInk = `color-mix(in srgb, ${ink} 58%, transparent)`;
  const timeInk = `color-mix(in srgb, ${ink} 88%, transparent)`;
  const captionInk = `color-mix(in srgb, ${ink} 62%, transparent)`;

  const titleLines = titleText.split('\n').filter((line) => line.trim().length > 0);
  const trimmedLocation = locationLabel?.trim() || '';
  const localTime = useLocalClock(timezoneId);

  return (
    <header
      className="pf-footer-header-timezone-header relative w-full"
      style={{
        marginBottom: `${FOOTER_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
        paddingTop: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingTop ?? 'none']}rem`,
        paddingBottom: `${FOOTER_HEADER_PADDING_REM[presentation.headerPaddingBottom ?? 'none']}rem`,
      }}
      data-footer-header="timezone"
    >
      <div className="pf-footer-header-timezone-stage grid w-full grid-cols-1 gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
        <div className="flex min-w-0 flex-col gap-6 text-left">
          {kickerText ? (
            <p
              className="pf-footer-header-timezone-kicker mb-0 text-xs font-semibold uppercase tracking-[0.32em]"
              style={{ color: kickerInk }}
            >
              {kickerText}
            </p>
          ) : null}
          {titleLines.length > 0 ? (
            <h2 className="mb-0 font-sans text-[clamp(2.75rem,7.2vw,6rem)] font-black leading-none tracking-[-0.02em]" style={{ color: ink }}>
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`} className="pf-footer-header-timezone-title-mask block overflow-hidden">
                  <span className="pf-footer-header-timezone-title-line block">{line}</span>
                </span>
              ))}
            </h2>
          ) : null}
          {descriptionText ? (
            <p
              className="pf-footer-header-timezone-description mb-0 max-w-sm text-sm leading-relaxed sm:text-base"
              style={{ color: descriptionInk }}
            >
              {descriptionText}
            </p>
          ) : null}
          {trailing ? <div className="mt-2">{trailing}</div> : null}
        </div>

        <div className="flex min-w-0 shrink-0 flex-col items-start gap-1 lg:items-end lg:text-right">
          {localTime ? (
            <span
              className="pf-footer-header-timezone-clock font-mono text-2xl font-medium tabular-nums sm:text-3xl"
              style={{ color: timeInk }}
            >
              {localTime}
            </span>
          ) : null}
          {trimmedLocation ? (
            <span className="pf-footer-header-timezone-clock text-xs uppercase tracking-[0.32em]" style={{ color: captionInk }}>
              {trimmedLocation}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
