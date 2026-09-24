'use client';

import type { CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  resolveFooterCopyrightLabel,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function Dot({ muted }: { muted: string }) {
  return (
    <span aria-hidden className="hidden text-sm sm:inline" style={{ color: muted }}>
      •
    </span>
  );
}

export interface FooterDesignCompactProps {
  creatorName: string;
  creatorId: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  layout: FooterDesignLayoutResolver;
  presentation: PortfolioFooterPresentationSettings;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
  /** Resolved from the Footer section's own Background tab (`sectionBackgroundStyle`) —
   *  `undefined` when that tab is off, so this canvas is transparent (the page/global
   *  wallpaper shows through) by default, same as every other Footer design now. */
  backgroundStyle?: CSSProperties;
  /** Multiplies every standardized body/label text size via `--pf-footer-font-scale` —
   *  see the Footer section's General tab "Font size" control. */
  fontSizeScale?: number;
}

/**
 * "Compact" — total rework of the old boxed-icon horizontal utility bar into a borderless
 * composition (no default headline — that role is now the shared Header mechanism's job):
 * brand + bare (unboxed) social logos share a row with no dividing rule, and coordinates
 * settle onto one airy, dot-separated line (phone • email • address) instead of the old
 * icon-labeled stack.
 * Every element reads at full, normal opacity — the email carries a thin permanent underline
 * so it reads as the primary contact point. Hovering a link is a self-contained accent (color/
 * underline as already present) and never affects any other element in the footer. Reads the
 * resolved `colorMode` prop and branches pure black / pure white literals, same full-bleed
 * "bypass" convention as this design family's other members (Monumental, Headline reveal, …);
 * the canvas itself isn't opted out of the site's global light/dark crossfade, so it inverts
 * smoothly on toggle.
 */
export function FooterDesignCompact({
  creatorName,
  creatorId,
  bio,
  email,
  phone,
  locationLabel,
  links,
  layout,
  presentation,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignCompactProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const muted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';

  const showName = layout.isVisible('name');
  const description = layout.bio('bio', bio, 160);
  const phoneTrimmed = presentation.showPhone ? phone?.trim() || null : null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = email?.trim() || null;
  const locationTrimmed = presentation.showLocation ? locationLabel?.trim() || null : null;
  const copyrightText = presentation.showCopyright
    ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
    : null;

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
    >
      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex flex-col items-center gap-10 text-center sm:items-stretch sm:gap-8 sm:text-left">
          {/* 2. Brand + bare socials — no boxes, no divider. */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            {showName || description ? (
              <div className="max-w-xl space-y-2">
                {showName ? (
                  <p
                    className="font-semibold"
                    style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {creatorName}
                  </p>
                ) : null}
                {description ? (
                  <p
                    className="leading-[1.6]"
                    style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}

            {links.length > 0 ? (
              <nav className="flex flex-wrap items-center justify-center gap-7 sm:justify-end" aria-label="Social">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    data-pf-no-color-transition=""
                    className="inline-flex items-center justify-center p-2 transition-opacity duration-300 hover:opacity-70"
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-7 w-7" />
                  </a>
                ))}
              </nav>
            ) : null}
          </div>

          {/* 3. Coordinates — one airy, dot-separated line. */}
          {phoneDisplay || emailTrimmed || locationTrimmed ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {phoneDisplay ? (
                <a
                  href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                  data-pf-no-color-transition=""
                  className="w-fit transition-opacity duration-300 hover:opacity-70"
                  style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {phoneDisplay}
                </a>
              ) : null}
              {phoneDisplay && emailTrimmed ? <Dot muted={muted} /> : null}
              {emailTrimmed ? (
                <a
                  href={`mailto:${emailTrimmed}`}
                  data-pf-no-color-transition=""
                  className="w-fit break-all border-b pb-0.5 transition-opacity duration-300 hover:opacity-70"
                  style={{ color: ink, borderColor: ink, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {emailTrimmed}
                </a>
              ) : null}
              {(phoneDisplay || emailTrimmed) && locationTrimmed ? <Dot muted={muted} /> : null}
              {locationTrimmed ? (
                <p
                  className="w-fit max-w-xs"
                  style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {locationTrimmed}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* 4. Copyright — no rule above it, pure whitespace close. */}
          {copyrightText ? (
            <p style={{ fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))' }}>
              {copyrightText}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export function FooterCompactWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* brand + bare social logos */}
      <rect className="pf-stack-mini-mute" x="6" y="24" width="26" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="6" y="30" width="20" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="96" cy="26" r="2.4" />
      <circle className="pf-stack-mini-mute" cx="105" cy="26" r="2.4" />
      <circle className="pf-stack-mini-mute" cx="114" cy="26" r="2.4" />

      {/* dot-separated coordinates line */}
      <rect className="pf-stack-mini-mute" x="6" y="44" width="16" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="27" cy="45" r="0.9" />
      <rect className="pf-stack-mini-mute" x="32" y="44" width="30" height="2" rx="1" />
      <circle className="pf-stack-mini-mute" cx="67" cy="45" r="0.9" />
      <rect className="pf-stack-mini-mute" x="72" y="58" width="22" height="2" rx="1" />
    </svg>
  );
}
