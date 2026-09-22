'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef } from 'react';
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

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const DEFAULT_HERO_COLUMNS_MANIFESTO =
  'A short note on how we work: thoughtful collaboration, careful craft, and a bias for clarity over noise.';

interface FooterDesignHeroColumnsProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  isAvailable?: boolean | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  copyrightText: string;
  colorMode: 'light' | 'dark';
  manifesto?: string;
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Hero Columns" — the eighth Footer design: a two-block layout on a strict pure-white /
 * pure-deep-black canvas that mirrors the portfolio's real active `colorMode` (no `.dark`
 * class, no `prefers-color-scheme` — this codebase resolves a single mode and hands it
 * down as a prop, same convention as ContactDesignStudioOverlap). No default headline —
 * that role is now the shared Header mechanism's job. A three-column grid: a full-bleed
 * vertical portrait + giant derived initials on the left, a vertical nav under
 * "(NAVIGATION)" in the middle, and a manifesto note under "(ACKNOWLEDGEMENT)" + compact
 * contact lines and social icons under "(INFO)" on the right. Hovering any nav link, the
 * email, the phone, or a social icon snaps it to full ink with a 5px x-shift while every
 * other line in the footer (the portrait/initials, the other nav links, the manifesto,
 * the static info lines, the sub-bar) dims to 0.1 opacity with a 1.5px blur — an instant
 * photographic-focus cue; the left portrait also drifts on a slow scroll-scrubbed
 * parallax (desktop only). The availability/hours line lives once, in the compact
 * sub-footer bar alongside copyright — not duplicated in the INFO column.
 * Self-contained "bypass" design — full-bleed, no shared padding/pattern shell — like
 * Monumental and the Contact premium designs.
 *
 * Data-model gaps handled gracefully (per the brief, nothing here is fabricated):
 * - No "certifications / micro-logo" field exists anywhere in this codebase, so that
 *   slot is filled with real small icons rendered from `links` via
 *   `<FooterSocialLinkIcon bare>` instead of inventing fake badges.
 * - No design-credit / policy-links data exists either, so the sub-footer only renders
 *   copyright + availability/hours (both real props) rather than fabricating text.
 */
export function FooterDesignHeroColumns({
  creatorName,
  avatarUrl,
  bio,
  email,
  phone,
  locationLabel,
  hoursLabel,
  isAvailable,
  links,
  navLinks,
  copyrightText,
  colorMode,
  manifesto,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignHeroColumnsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const imageParallaxRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#0a0a0a' : '#ffffff';
  const muted = isLight ? '#8f8f8f' : '#7d7d7d';
  // Brighter, silvery resting tone for the right column's nav/manifesto/coordinates —
  // still restrained at rest, legible without a hover, and inverts natively with `ink`.
  const softInk = isLight ? 'rgba(10,10,10,0.55)' : 'rgba(255,255,255,0.55)';
  const labelInk = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(255,255,255,0.6)';
  const hairline = isLight ? 'rgba(10,10,10,0.08)' : 'rgba(255,255,255,0.1)';
  const placeholderGradient = isLight
    ? 'linear-gradient(155deg, #f2f2f2 0%, #e4e4e4 55%, #d8d8d8 100%)'
    : 'linear-gradient(155deg, #161616 0%, #0c0c0c 55%, #040404 100%)';

  const manifestoText = manifesto?.trim() || bio?.trim() || DEFAULT_HERO_COLUMNS_MANIFESTO;

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
  const trimmedHours = hoursLabel?.trim() || null;
  const phoneDisplay = trimmedPhone ? formatPhoneDisplay(trimmedPhone) : null;
  const statusLabel = typeof isAvailable === 'boolean' ? (isAvailable ? 'WE ARE OPEN' : 'WE ARE CLOSED') : null;
  const subBarRight = [statusLabel, trimmedHours].filter(Boolean).join(' · ') || null;
  const hasSocials = links.length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        // Focus interaction — every "item" line in the footer (hero block, the
        // portrait/initials column, each nav link, the manifesto, the static info
        // lines, each contact link, each social icon, the sub-bar) starts fully
        // visible; GSAP only ever nudges opacity/blur/color on hover, never an
        // entrance/hide toggle, so nothing can get stuck hidden on a slow load.
        const items = Array.from(root.querySelectorAll<HTMLElement>('[data-hc-item]'));
        const baseColors = new Map<HTMLElement, string>();
        items.forEach((el) => baseColors.set(el, getComputedStyle(el).color));
        // Every link that can trigger the focus effect: nav links, email, phone, and
        // each social icon. Each is also its own `data-hc-item`, never nested inside
        // another dim target — otherwise a dimmed parent's opacity would mute a
        // simultaneously "focused" child (CSS opacity compounds across ancestors).
        const linkTargets = Array.from(root.querySelectorAll<HTMLElement>('[data-hc-link]'));

        const onEnter = (target: HTMLElement) => {
          items.forEach((el) => {
            if (el === target) {
              gsap.to(el, {
                opacity: 1,
                x: 5,
                filter: 'blur(0px)',
                color: ink,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            } else {
              gsap.to(el, {
                opacity: 0.1,
                filter: 'blur(1.5px)',
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            }
          });
        };
        const onLeaveAll = () => {
          items.forEach((el) => {
            gsap.to(el, {
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              color: baseColors.get(el),
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });
        };
        // Each link owns its own enter/leave pair — independent of which group (nav,
        // contact info, socials) it belongs to — so leaving any one of them reliably
        // resets the effect rather than relying on one shared container's pointerleave.
        const enterHandlers = linkTargets.map((el) => () => onEnter(el));
        linkTargets.forEach((el, index) => {
          el.addEventListener('pointerenter', enterHandlers[index]);
          el.addEventListener('pointerleave', onLeaveAll);
        });

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

        return () => {
          linkTargets.forEach((el, index) => {
            el.removeEventListener('pointerenter', enterHandlers[index]);
            el.removeEventListener('pointerleave', onLeaveAll);
          });
        };
      }, root);
    } catch (error) {
      // Same containment as every other premium design in this codebase — an uncaught
      // GSAP/ScrollTrigger init error here would otherwise crash the whole React tree
      // and blank the entire page, not just this footer section.
      console.error('[FooterDesignHeroColumns] GSAP animation failed to initialize', error);
      ctx?.revert();
      gsap.set(root.querySelectorAll('[data-hc-item], [data-hc-link]'), { clearProps: 'all' });
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
  }, [ink]);

  return (
    <footer
      id="footer"
      ref={rootRef}
      className="relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {/* Asymmetric three-column grid */}
      <div className={`grid grid-cols-1 gap-x-10 gap-y-14 pb-16 pt-20 sm:pt-28 md:grid-cols-3 md:gap-x-12 md:pb-24 md:pt-32 ${portfolioEditorialGutterX(contentGutter)}`}>
        {/* Column 1 — portrait + giant derived initials */}
        <div data-hc-item data-pf-no-color-transition="" className="flex min-w-0 flex-col">
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

          <div
            aria-hidden
            className="mt-4 select-none font-sans font-black leading-none tracking-tighter"
            style={{ color: ink, fontSize: 'clamp(3.25rem, 8vw, 6.5rem)' }}
          >
            {initials || '—'}
          </div>
        </div>

        {/* Column 2 — vertical navigation */}
        <div className="flex min-w-0 flex-col md:pt-2">
          <p data-hc-item className="m-0 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: labelInk }}>
            (NAVIGATION)
          </p>
          <nav aria-label="Footer" className="mt-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                data-hc-item
                data-hc-link
                data-pf-no-color-transition=""
                className="flex min-h-[44px] w-fit items-center text-[clamp(1.05rem,2vw,1.4rem)] font-medium transition-none"
                style={{ color: softInk }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Column 3 — acknowledgement note + compact info */}
        <div className="flex min-w-0 flex-col gap-10 md:pt-2">
          <div data-hc-item>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: labelInk }}>
              (ACKNOWLEDGEMENT)
            </p>
            <p className="mt-4 max-w-xs text-base leading-[1.6]" style={{ color: softInk }}>
              {manifestoText}
            </p>
          </div>

          {/* No data-hc-item on this wrapper: email/phone/socials are individually
             focusable, so none of them may sit inside a parent that also dims — a
             dimmed ancestor's opacity would compound onto a simultaneously
             "focused" child and mute it. The label and the static location line
             stay their own leaf-level dim targets instead. */}
          <div>
            <p data-hc-item className="m-0 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: labelInk }}>
              (INFO)
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {trimmedLocation ? (
                <p data-hc-item className="m-0 text-base" style={{ color: softInk }}>
                  {trimmedLocation}
                </p>
              ) : null}
              {trimmedEmail ? (
                <a
                  href={`mailto:${trimmedEmail}`}
                  data-hc-item
                  data-hc-link
                  data-pf-no-color-transition=""
                  className="w-fit break-all text-base transition-none"
                  style={{ color: softInk }}
                >
                  {trimmedEmail}
                </a>
              ) : null}
              {phoneDisplay ? (
                <a
                  href={`tel:${trimmedPhone!.replace(/\s+/g, '')}`}
                  data-hc-item
                  data-hc-link
                  data-pf-no-color-transition=""
                  className="w-fit text-base transition-none"
                  style={{ color: softInk }}
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
                    data-hc-item
                    data-hc-link
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

      {/* Compact sub-footer bar */}
      <div
        data-hc-item
        data-pf-no-color-transition=""
        className={`flex flex-col items-center gap-3 border-t py-6 text-center sm:flex-row sm:justify-between sm:text-left ${portfolioEditorialGutterX(contentGutter)}`}
        style={{ borderColor: hairline }}
      >
        <p className="m-0 text-xs font-medium tracking-wide" style={{ color: muted }}>
          {copyrightText}
        </p>
        {subBarRight ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: muted }}>
            {subBarRight}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

export function FooterHeroColumnsWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
