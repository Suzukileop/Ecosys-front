'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface FooterDesignHeroColumnsProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  layout: FooterDesignLayoutResolver;
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
 * "Hero Columns" — the eighth Footer design: a two-block layout on a strict pure-white /
 * pure-deep-black canvas that mirrors the portfolio's real active `colorMode` (no `.dark`
 * class, no `prefers-color-scheme` — this codebase resolves a single mode and hands it
 * down as a prop, same convention as ContactDesignStudioOverlap). No default headline —
 * that role is now the shared Header mechanism's job. A three-column grid: a full-bleed
 * vertical portrait + giant derived initials on the left, a vertical nav under
 * "(NAVIGATION)" in the middle, and a manifesto note under "(ACKNOWLEDGEMENT)" + compact
 * contact lines and social icons under "(INFO)" on the right. Every line reads at full,
 * legible strength at rest and stays that way — no sibling ever dims when another element
 * is hovered; the left portrait drifts on a slow scroll-scrubbed parallax (desktop only).
 * No hardcoded closing bar (copyright/availability/hours) either — that bar was extracted
 * into the shared Mini bar catalog's own "Hero columns" variant (see
 * footer-minibar-catalog-extraction memory), toggled on separately via
 * Footer > Design > "Mini bar" rather than being always-on here.
 * Self-contained "bypass" design — full-bleed, no shared padding/pattern shell — like
 * Monumental and the Contact premium designs.
 *
 * Data-model gaps handled gracefully (per the brief, nothing here is fabricated):
 * - No "certifications / micro-logo" field exists anywhere in this codebase, so that
 *   slot is filled with real small icons rendered from `links` via
 *   `<FooterSocialLinkIcon bare>` instead of inventing fake badges.
 */
export function FooterDesignHeroColumns({
  creatorName,
  avatarUrl,
  bio,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  layout,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignHeroColumnsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const imageParallaxRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#0a0a0a' : '#ffffff';
  // Brighter, silvery resting tone for the right column's nav/manifesto/coordinates —
  // still restrained at rest, legible without a hover, and inverts natively with `ink`.
  const softInk = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(255,255,255,0.55)';
  const labelInk = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(255,255,255,0.6)';
  const hairline = isLight ? 'rgba(10,10,10,0.08)' : 'rgba(255,255,255,0.1)';
  const placeholderGradient = isLight
    ? 'linear-gradient(155deg, #f2f2f2 0%, #e4e4e4 55%, #d8d8d8 100%)'
    : 'linear-gradient(155deg, #161616 0%, #0c0c0c 55%, #040404 100%)';

  const showPortrait = layout.isVisible('portrait');
  const showInitials = layout.isVisible('initials');
  const showIdentityColumn = showPortrait || showInitials;
  const navHeading = layout.text('navLabel');
  const noteHeading = layout.text('noteLabel');
  const noteText = layout.bio('note', bio);
  const infoHeading = layout.text('infoLabel');
  const labelStyle: CSSProperties = {
    color: labelInk,
    fontSize: 'calc(var(--pf-footer-label-size) * var(--pf-footer-font-scale, 1))',
  };

  const initials = useMemo(() => {
    const parts = creatorName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    const first = parts[0]?.[0] ?? '';
    const last = parts[parts.length - 1]?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }, [creatorName]);

  const trimmedLocation = locationLabel?.trim() || null;
  const trimmedEmail = email?.trim() || null;
  const trimmedPhone = phone?.trim() || null;
  const phoneDisplay = trimmedPhone ? formatPhoneDisplay(trimmedPhone) : null;
  const hasSocials = links.length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Slow vertical parallax on the portrait — desktop only (per the brief, a
        // static image is an acceptable fallback on touch/small screens), continuous
        // scrub so it can't get stuck mid-animation the way a one-shot toggle can.
        const imageWrap = imageParallaxRef.current;
        const imageColumnEl = root.querySelector<HTMLElement>('[data-hc-image-col]');
        if (imageWrap && imageColumnEl && window.matchMedia('(min-width: 768px)').matches) {
          gsap.fromTo(
            imageWrap,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: imageColumnEl, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            }
          );
        }
      }, root);
    } catch (error) {
      // Same containment as every other premium design in this codebase — an uncaught
      // GSAP/ScrollTrigger init error here would otherwise crash the whole React tree
      // and blank the entire page, not just this footer section.
      console.error('[FooterDesignHeroColumns] GSAP animation failed to initialize', error);
      ctx?.revert();
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[FooterDesignHeroColumns] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [showPortrait]);

  return (
    <footer
      id="footer"
      ref={rootRef}
      className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
    >
      {/* Asymmetric three-column grid */}
      <div
        className={`grid grid-cols-1 gap-x-10 gap-y-14 pb-16 pt-20 sm:pt-28 ${
          showIdentityColumn ? 'md:grid-cols-3' : 'md:grid-cols-2'
        } md:gap-x-12 md:pb-24 md:pt-32 ${portfolioEditorialGutterX(contentGutter)}`}
      >
        {/* Column 1 — portrait + giant derived initials */}
        {showIdentityColumn ? (
          <div data-pf-no-color-transition="" className="flex min-w-0 flex-col">
            {showPortrait ? (
              <div
                data-hc-image-col
                data-pf-no-color-transition=""
                className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/2] md:aspect-auto md:h-full md:min-h-[24rem]"
              >
                <div
                  ref={imageParallaxRef}
                  data-pf-no-color-transition=""
                  className="absolute inset-x-0 -top-[8%] h-[116%]"
                >
                  {avatarUrl?.trim() ? (
                    <img
                      src={avatarUrl}
                      alt={creatorName ? `Portrait of ${creatorName}` : 'Portrait'}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div aria-hidden className="h-full w-full" style={{ backgroundImage: placeholderGradient }} />
                  )}
                </div>
              </div>
            ) : null}

            {showInitials ? (
              <div
                aria-hidden
                className={`${showPortrait ? 'mt-4' : ''} select-none font-sans font-black leading-none tracking-tighter`}
                style={{ color: ink, fontSize: 'clamp(3.25rem, 8vw, 6.5rem)' }}
              >
                {initials || '—'}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Column 2 — vertical navigation */}
        <div className="flex min-w-0 flex-col md:pt-2">
          {navHeading ? (
            <p className="m-0 mb-6 font-semibold uppercase tracking-[0.28em]" style={labelStyle}>
              {navHeading}
            </p>
          ) : null}
          <nav aria-label="Footer" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                data-pf-no-color-transition=""
                className="flex min-h-[44px] w-fit items-center font-medium transition-none"
                style={{ color: softInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Column 3 — acknowledgement note + compact info */}
        <div className="flex min-w-0 flex-col gap-10 md:pt-2">
          {noteHeading || noteText ? (
            <div>
              {noteHeading ? (
                <p className="m-0 mb-4 font-semibold uppercase tracking-[0.28em]" style={labelStyle}>
                  {noteHeading}
                </p>
              ) : null}
              {noteText ? (
                <p
                  className="max-w-xs leading-[1.6]"
                  style={{ color: softInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {noteText}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            {infoHeading ? (
              <p className="m-0 mb-4 font-semibold uppercase tracking-[0.28em]" style={labelStyle}>
                {infoHeading}
              </p>
            ) : null}
            <div className="flex flex-col gap-3">
              {trimmedLocation ? (
                <p
                  className="m-0"
                  style={{ color: softInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {trimmedLocation}
                </p>
              ) : null}
              {trimmedEmail ? (
                <a
                  href={`mailto:${trimmedEmail}`}
                  data-pf-no-color-transition=""
                  className="w-fit break-all transition-none"
                  style={{ color: softInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {trimmedEmail}
                </a>
              ) : null}
              {phoneDisplay ? (
                <a
                  href={`tel:${trimmedPhone!.replace(/\s+/g, '')}`}
                  data-pf-no-color-transition=""
                  className="w-fit transition-none"
                  style={{ color: softInk, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
                >
                  {phoneDisplay}
                </a>
              ) : null}
            </div>

            {hasSocials ? (
              <div className="mt-5 flex flex-wrap gap-4">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    data-pf-no-color-transition=""
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-none"
                    style={{ borderColor: hairline, color: softInk }}
                    aria-label={link.label}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterHeroColumnsWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* Column 1 — portrait + initials */}
      <rect className="pf-stack-mini-mute" x="6" y="16" width="26" height="30" rx="1" />
      <rect className="pf-stack-mini-ink" x="6" y="50" width="26" height="8" rx="1" opacity={0.7} />

      {/* Column 2 — nav */}
      <rect className="pf-stack-mini-mute" x="42" y="16" width="18" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="42" y="24" width="26" height="3.5" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="42" y="32" width="22" height="3.5" rx="1.5" />
      <rect className="pf-stack-mini-mute" x="42" y="40" width="18" height="3.5" rx="1.5" />

      {/* Column 3 — acknowledgement + info */}
      <rect className="pf-stack-mini-mute" x="78" y="16" width="18" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="78" y="24" width="34" height="2.8" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="78" y="30" width="28" height="2.8" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="78" y="57" width="14" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="78" y="61" width="26" height="2.4" rx="1.2" />
      <rect className="pf-stack-mini-mute" x="78" y="65" width="22" height="2.4" rx="1.2" />
    </svg>
  );
}
