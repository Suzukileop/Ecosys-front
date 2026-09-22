'use client';

import gsap from 'gsap';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import type { EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  portfolioEditorialGutterX,
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const DEFAULT_EDITORIAL_GRID_TAGLINE = 'Feel the fear,\ndo it anyway.';

/** Resting opacity for every focus-item / dim zone before anything in the group is hovered. */
const RESTING_OPACITY = 1;
const DIMMED_OPACITY = 0.1;

/**
 * Self-contained styling, scoped to this file via an injected <style> tag rather than the
 * shared app/globals.css, matching this project's established convention for new full-bleed
 * Footer designs (see Swiss Magnetic).
 */
const EDITORIAL_GRID_CSS = `
.pf-egrid-dim {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-egrid-link {
  transition: color 0.35s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-egrid-dim {
    transition: none !important;
  }
}
`;

function EditorialGridStyles() {
  return <style dangerouslySetInnerHTML={{ __html: EDITORIAL_GRID_CSS }} />;
}

/** Small square arrow button at the foot of the bento card — magnetically pulled toward the
 *  cursor within a tight proximity radius, spring-back on leave. Same `gsap.quickTo` idiom as
 *  Monumental's submit button and Swiss Magnetic's circular CTA, just a smaller square target. */
function EditorialGridMagnetButton({ href, ink, inkContrast }: { href: string; ink: string; inkContrast: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        const radius = 64;

        const onMove = (event: PointerEvent) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = event.clientX - cx;
          const dy = event.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            moveX(dx * 0.5);
            moveY(dy * 0.5);
          } else {
            moveX(0);
            moveY(0);
          }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      }, wrap);
    } catch (error) {
      console.error('[FooterDesignEditorialGrid] magnetic button failed to initialize', error);
      ctx?.revert();
      gsap.set(btn, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  return (
    <div ref={wrapRef} className="inline-flex">
      <a
        ref={btnRef}
        href={href}
        aria-label="Get in touch"
        data-pf-no-color-transition=""
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-base transition-transform duration-300 hover:scale-[1.06] sm:h-12 sm:w-12"
        style={{ backgroundColor: ink, color: inkContrast }}
      >
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}

export interface FooterDesignEditorialGridProps {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  contactHref: string;
  colorMode: 'light' | 'dark';
  tagline?: string;
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  and bypasses the legacy shell, so this is threaded in to line its own horizontal
   *  padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Editorial Grid" — an asymmetric Footer (no default giant name anymore — that role is now
 * the shared Header mechanism's job, e.g. its own "Name" design): a suspended bento
 * card (tint inverted against the page) carries a poetic tagline and a magnetic arrow CTA, and a
 * thin two-column grid on the right holds navigation and coordinates. Hovering any nav/contact/
 * social link snaps it to full-contrast focus while the rest of the footer — including the
 * card — softens to 0.1 opacity with a light blur. A hairline sub-footer bar closes
 * the section with the creator's circular mark on the left and the current year, set large in
 * serif, on the right. Reads the resolved `colorMode` prop and branches its own literal palette
 * (near-black canvas + warm-beige card in dark mode; broken-white canvas + near-black card in
 * light mode) rather than the shared design-token system — same full-bleed "bypass" convention
 * as Monumental and Swiss Magnetic.
 */
export function FooterDesignEditorialGrid({
  creatorName,
  creatorId,
  avatarUrl,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  contactHref,
  colorMode,
  tagline,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignEditorialGridProps) {
  const focusGroupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  // Pure white/black canvas, matching every other full-bleed Footer design (Hero Columns,
  // Compact, Headline Reveal, Split Form, Timezone Editorial) — not a custom off-white tint,
  // which visibly seamed against the page's real background in light mode.
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#141210' : '#f7f5f0';
  const muted = isLight ? 'rgba(20,18,16,0.52)' : 'rgba(247,245,240,0.5)';
  const hairline = isLight ? 'rgba(20,18,16,0.14)' : 'rgba(247,245,240,0.16)';
  // Card tint is deliberately the INVERSE of the page canvas — warm beige floating on black,
  // near-black floating on cream — per the brief's own "teinte inversée" spec.
  const cardBg = isLight ? '#171512' : '#e9e2d3';
  const cardInk = isLight ? '#f2efe8' : '#171512';

  const taglineLines = (tagline?.trim() || DEFAULT_EDITORIAL_GRID_TAGLINE).split('\n');
  const year = new Date().getFullYear();

  const initials = useMemo(() => {
    const parts = creatorName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }, [creatorName]);

  const phoneTrimmed = phone?.trim() || null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = email?.trim() || null;
  const locationTrimmed = locationLabel?.trim() || null;

  // One GSAP context drives the "focus a link, dim everything else" interaction — every element
  // carrying data-egrid-dim (the giant name, the bento card, and each individual link) eases to
  // DIMMED_OPACITY + a light blur except whichever data-egrid-focus-item is currently hovered.
  useLayoutEffect(() => {
    const group = focusGroupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-egrid-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-egrid-focus-item]'));
    if (focusItems.length === 0 || dimTargets.length === 0) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const onEnter = (event: Event) => {
          const target = event.currentTarget as HTMLElement;
          dimTargets.forEach((el) => {
            gsap.to(el, {
              opacity: el === target ? RESTING_OPACITY : DIMMED_OPACITY,
              filter: el === target ? 'blur(0px)' : 'blur(3px)',
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });
        };
        const onLeave = () => {
          gsap.to(dimTargets, {
            opacity: RESTING_OPACITY,
            filter: 'blur(0px)',
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };

        focusItems.forEach((item) => {
          item.addEventListener('mouseenter', onEnter);
          item.addEventListener('mouseleave', onLeave);
        });

        return () => {
          focusItems.forEach((item) => {
            item.removeEventListener('mouseenter', onEnter);
            item.removeEventListener('mouseleave', onLeave);
          });
        };
      }, group);
    } catch (error) {
      console.error('[FooterDesignEditorialGrid] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [navLinks, links, phoneDisplay, emailTrimmed]);

  return (
    <footer
      id="footer"
      data-creator-id={creatorId}
      className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
      data-pf-no-color-transition=""
    >
      <EditorialGridStyles />

      <div ref={focusGroupRef} className={`relative z-[1] w-full pb-12 pt-16 sm:pt-20 lg:pb-16 lg:pt-24 ${portfolioEditorialGutterX(contentGutter)}`}>
        {/* Suspended bento card + link grid, asymmetric. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.15fr] md:gap-14 lg:gap-20">
          <div
            data-egrid-dim=""
            className="pf-egrid-dim flex min-h-[18rem] flex-col justify-between gap-10 rounded-[1.75rem] p-8 sm:min-h-[22rem] sm:p-10 lg:p-12"
            style={{ backgroundColor: cardBg, color: cardInk }}
          >
            <p
              className="font-serif italic leading-snug"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.35rem)' }}
            >
              {taglineLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </p>

            <div className="flex items-center justify-between gap-6">
              <a
                href={contactHref}
                data-pf-no-color-transition=""
                className="text-sm font-semibold uppercase tracking-[0.14em] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
              >
                Get in touch
              </a>
              <EditorialGridMagnetButton href={contactHref} ink={cardInk} inkContrast={cardBg} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8">
            <nav aria-label="Footer" className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  data-egrid-dim=""
                  data-egrid-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-egrid-dim pf-egrid-link w-fit py-1 text-sm font-medium uppercase tracking-[0.12em]"
                  style={{ color: muted }}
                  onMouseEnter={(event) => {
                    (event.currentTarget as HTMLElement).style.color = ink;
                  }}
                  onMouseLeave={(event) => {
                    (event.currentTarget as HTMLElement).style.color = muted;
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-5">
              {phoneDisplay ? (
                <a
                  href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                  data-egrid-dim=""
                  data-egrid-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-egrid-dim pf-egrid-link w-fit py-1 text-sm"
                  style={{ color: muted }}
                  onMouseEnter={(event) => {
                    (event.currentTarget as HTMLElement).style.color = ink;
                  }}
                  onMouseLeave={(event) => {
                    (event.currentTarget as HTMLElement).style.color = muted;
                  }}
                >
                  {phoneDisplay}
                </a>
              ) : null}
              {emailTrimmed ? (
                <a
                  href={`mailto:${emailTrimmed}`}
                  data-egrid-dim=""
                  data-egrid-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-egrid-dim pf-egrid-link w-fit py-1 text-sm"
                  style={{ color: muted }}
                  onMouseEnter={(event) => {
                    (event.currentTarget as HTMLElement).style.color = ink;
                  }}
                  onMouseLeave={(event) => {
                    (event.currentTarget as HTMLElement).style.color = muted;
                  }}
                >
                  {emailTrimmed}
                </a>
              ) : null}
              {locationTrimmed ? (
                <p className="max-w-[14rem] py-1 text-sm" style={{ color: muted }}>
                  {locationTrimmed}
                </p>
              ) : null}
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  data-egrid-dim=""
                  data-egrid-focus-item=""
                  data-pf-no-color-transition=""
                  className="pf-egrid-dim pf-egrid-link w-fit py-1 text-sm"
                  style={{ color: muted }}
                  onMouseEnter={(event) => {
                    (event.currentTarget as HTMLElement).style.color = ink;
                  }}
                  onMouseLeave={(event) => {
                    (event.currentTarget as HTMLElement).style.color = muted;
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-14 sm:h-16 lg:h-20" />

        {/* 3. Bottom identity bar. */}
        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: hairline }}>
          <div
            aria-hidden={!avatarUrl?.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border sm:h-11 sm:w-11"
            style={{ borderColor: hairline }}
          >
            {avatarUrl?.trim() ? (
              <img src={avatarUrl} alt={creatorName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: muted }}>
                {initials || '—'}
              </span>
            )}
          </div>
          <p className="font-serif" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.75rem)' }}>
            {year}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FooterEditorialGridWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* bento card, left */}
      <rect className="pf-stack-mini-mute" x="6" y="14" width="46" height="34" rx="6" />
      <rect className="pf-stack-mini-stage" x="11" y="20" width="30" height="3" rx="1.5" />
      <rect className="pf-stack-mini-stage" x="11" y="26" width="24" height="3" rx="1.5" />
      <rect className="pf-stack-mini-stage" x="38" y="38" width="8" height="8" rx="2" />

      {/* two link columns, right */}
      <rect className="pf-stack-mini-ink" x="60" y="16" width="20" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-ink" x="60" y="23" width="16" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-ink" x="60" y="30" width="18" height="2.5" rx="1.25" />

      <rect className="pf-stack-mini-mute" x="90" y="16" width="22" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="90" y="23" width="18" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="90" y="30" width="20" height="2.5" rx="1.25" />

      {/* bottom identity bar */}
      <circle className="pf-stack-mini-ink" cx="12" cy="64" r="4" />
      <rect className="pf-stack-mini-ink" x="100" y="60" width="14" height="8" rx="2" opacity={0.85} />
    </svg>
  );
}
