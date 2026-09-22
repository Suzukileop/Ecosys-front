'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import type { EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Resting opacity for every secondary text/coordinate; how far the non-hovered rest of the
 *  footer sinks once one focus item is hovered; and the blur that goes with it. Raised from an
 *  earlier 0.3/0.08 pass that read as illegible body copy on a pure-black stage — 0.6 keeps the
 *  "whisper at rest, shout on hover" language while every line stays comfortably readable. */
const RESTING_OPACITY = 0.6;
const UNFOCUSED_OPACITY = 0.12;
const UNFOCUSED_BLUR = 'blur(1px)';

const HEADLINE_REVEAL_CSS = `
.pf-hlreveal-dim {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-hlreveal-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-hlreveal-dim,
  .pf-hlreveal-mode {
    transition: none !important;
  }
}
`;

function HeadlineRevealStyles() {
  return <style dangerouslySetInnerHTML={{ __html: HEADLINE_REVEAL_CSS }} />;
}

/** "Contact me" — magnetically pulled toward the cursor within a proximity radius; the arrow
 *  inside sweeps in on direct hover. Same gsap.quickTo idiom as every other Footer design's
 *  magnetic control (Monumental's submit, Swiss Magnetic's circular CTA, Editorial Grid's arrow
 *  square), sized here as a labeled pill instead. */
function HeadlineRevealContactButton({ href, ink, inkContrast }: { href: string; ink: string; inkContrast: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.55, ease: 'power3' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.55, ease: 'power3' });
        const radius = 80;

        const onMove = (event: PointerEvent) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = event.clientX - cx;
          const dy = event.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            moveX(dx * 0.4);
            moveY(dy * 0.4);
          } else {
            moveX(0);
            moveY(0);
          }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      }, wrap);
    } catch (error) {
      console.error('[FooterDesignHeadlineReveal] magnetic button failed to initialize', error);
      ctx?.revert();
      gsap.set(btn, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  const handleEnter = () => {
    if (prefersReducedMotion()) return;
    const arrow = arrowRef.current;
    if (arrow) gsap.to(arrow, { x: 6, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  };
  const handleLeave = () => {
    if (prefersReducedMotion()) return;
    const arrow = arrowRef.current;
    if (arrow) gsap.to(arrow, { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' });
  };

  return (
    <div ref={wrapRef} className="inline-flex">
      <a
        ref={btnRef}
        href={href}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        data-pf-no-color-transition=""
        className="pf-hlreveal-mode inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] sm:px-8 sm:py-4"
        style={{ backgroundColor: ink, color: inkContrast }}
      >
        Contact me
        <span ref={arrowRef} aria-hidden className="inline-block">
          →
        </span>
      </a>
    </div>
  );
}

export interface FooterDesignHeadlineRevealProps {
  creatorName: string;
  creatorId: string;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  navLinks: { id: string; label: string; url: string }[];
  copyrightText: string;
  contactHref: string;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  (bypasses the legacy footer shell), so it needs the same gutter every other section
   *  respects passed in explicitly to keep its content column aligned with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}

/**
 * "Headline Reveal" — the borderless, high-contrast rework of the classic columns-with-
 * separators Footer (no default headline — that role is now the shared Header mechanism's
 * job): a divider-free grid (identity + bio, navigation, coordinates & social links — every
 * one a bare floating label, no icon chips, no vertical rule) sits at a quiet 0.6 resting
 * opacity — legible on its own, not just decorative. Hovering any single coordinate snaps it
 * to full ink with a
 * 4px kinetic nudge while every other text block and column in the footer sinks to 0.12 opacity
 * with a 1px blur — a theatrical spotlight, not just a sibling dim. A
 * magnetic "Contact me" pill closes the section next to the copyright line. Reads the resolved
 * `colorMode` prop and branches pure black / pure white literals — same full-bleed "bypass"
 * convention as this design family's other members. Its own horizontal padding is the
 * site-wide editorial gutter (`portfolioEditorialGutterX(contentGutter)`, same helper
 * Timezone Editorial uses), not a hardcoded value, so the grid stays flush with every
 * other section's content edge regardless of the configured Global gutter.
 */
export function FooterDesignHeadlineReveal({
  creatorName,
  creatorId,
  bio,
  email,
  phone,
  locationLabel,
  links,
  navLinks,
  copyrightText,
  contactHref,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: FooterDesignHeadlineRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const focusGroupRef = useRef<HTMLDivElement>(null);

  const isLight = colorMode === 'light';
  const bg = isLight ? '#ffffff' : '#000000';
  const ink = isLight ? '#000000' : '#ffffff';
  const inkContrast = isLight ? '#ffffff' : '#000000';
  const muted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)';

  const bioTrimmed = bio?.trim() || null;
  const phoneTrimmed = phone?.trim() || null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = email?.trim() || null;
  const locationTrimmed = locationLabel?.trim() || null;

  // Theatrical focus/blur: at rest every [data-hlreveal-dim] sits at RESTING_OPACITY (0.3).
  // Hovering a [data-hlreveal-focus-item] snaps that one element to full ink while every other
  // dim target — including the headline and the identity/bio block, not just sibling links —
  // sinks to UNFOCUSED_OPACITY with a blur.
  useLayoutEffect(() => {
    const group = focusGroupRef.current;
    if (!group) return undefined;
    if (prefersReducedMotion()) return undefined;

    const dimTargets = Array.from(group.querySelectorAll<HTMLElement>('[data-hlreveal-dim]'));
    const focusItems = Array.from(group.querySelectorAll<HTMLElement>('[data-hlreveal-focus-item]'));
    if (dimTargets.length === 0 || focusItems.length === 0) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const onEnter = (event: Event) => {
          const target = event.currentTarget as HTMLElement;
          dimTargets.forEach((el) => {
            const isTarget = el === target;
            gsap.to(el, {
              opacity: isTarget ? 1 : UNFOCUSED_OPACITY,
              filter: isTarget ? 'blur(0px)' : UNFOCUSED_BLUR,
              x: isTarget ? 4 : 0,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-hlreveal-focus-item')) {
              el.style.color = isTarget ? ink : '';
            }
          });
        };
        const onLeave = () => {
          dimTargets.forEach((el) => {
            gsap.to(el, {
              opacity: RESTING_OPACITY,
              filter: 'blur(0px)',
              x: 0,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
            if (el.hasAttribute('data-hlreveal-focus-item')) {
              el.style.color = '';
            }
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
      console.error('[FooterDesignHeadlineReveal] focus-dim animation failed to initialize', error);
      ctx?.revert();
      gsap.set(dimTargets, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, [navLinks, links, phoneDisplay, emailTrimmed, locationTrimmed, ink]);

  return (
    <footer
      id="footer"
      ref={rootRef}
      data-creator-id={creatorId}
      className="pf-hlreveal-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ backgroundColor: bg, color: ink }}
      data-pf-no-color-transition=""
    >
      <HeadlineRevealStyles />

      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        {/* Borderless grid — whitespace is the only separator. */}
        <div ref={focusGroupRef} className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-16 lg:gap-24">
          <div data-hlreveal-dim="" className="pf-hlreveal-dim flex flex-col gap-4" style={{ opacity: RESTING_OPACITY }}>
            <p
              data-pf-no-color-transition=""
              className="pf-hlreveal-mode text-base font-semibold"
              style={{ color: ink }}
            >
              {creatorName}
            </p>
            {bioTrimmed ? (
              <p className="max-w-[24rem] text-[0.95rem] leading-[1.6]">{bioTrimmed}</p>
            ) : null}
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                data-hlreveal-dim=""
                data-hlreveal-focus-item=""
                data-pf-no-color-transition=""
                className="pf-hlreveal-dim w-fit text-base font-normal uppercase tracking-[0.12em]"
                style={{ opacity: RESTING_OPACITY }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-6">
            {phoneDisplay ? (
              <a
                href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                data-hlreveal-dim=""
                data-hlreveal-focus-item=""
                data-pf-no-color-transition=""
                className="pf-hlreveal-dim w-fit text-base"
                style={{ opacity: RESTING_OPACITY }}
              >
                {phoneDisplay}
              </a>
            ) : null}
            {emailTrimmed ? (
              <a
                href={`mailto:${emailTrimmed}`}
                data-hlreveal-dim=""
                data-hlreveal-focus-item=""
                data-pf-no-color-transition=""
                className="pf-hlreveal-dim w-fit text-base"
                style={{ opacity: RESTING_OPACITY }}
              >
                {emailTrimmed}
              </a>
            ) : null}
            {locationTrimmed ? (
              <p data-hlreveal-dim="" className="pf-hlreveal-dim w-fit max-w-[16rem] text-base" style={{ opacity: RESTING_OPACITY }}>
                {locationTrimmed}
              </p>
            ) : null}
            {links.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-2.5" aria-label="Social">
                {links.map((link, index) => (
                  <span key={link.id} className="inline-flex items-baseline gap-1.5">
                    {index > 0 ? (
                      <span aria-hidden className="select-none text-xs" style={{ opacity: 0.25 }}>
                        •
                      </span>
                    ) : null}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      data-hlreveal-dim=""
                      data-hlreveal-focus-item=""
                      data-pf-no-color-transition=""
                      className="pf-hlreveal-dim w-fit text-base"
                      style={{ opacity: RESTING_OPACITY }}
                    >
                      {link.label}
                    </a>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="h-16 sm:h-20 lg:h-24" />

        {/* 3. Magnetic contact pill + copyright — no rule above it, pure whitespace close. */}
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <HeadlineRevealContactButton href={contactHref} ink={ink} inkContrast={inkContrast} />
          <p data-pf-no-color-transition="" className="pf-hlreveal-mode text-xs" style={{ color: muted }}>
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function FooterHeadlineRevealWireframe() {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />

      {/* borderless 3-column grid, no dividers */}
      <rect className="pf-stack-mini-mute" x="6" y="18" width="26" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="6" y="24" width="20" height="2" rx="1" />

      <rect className="pf-stack-mini-mute" x="46" y="18" width="18" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="46" y="24" width="16" height="2.5" rx="1.25" />

      <rect className="pf-stack-mini-mute" x="82" y="18" width="20" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="82" y="24" width="24" height="2.5" rx="1.25" />

      {/* magnetic contact pill + copyright, no top rule */}
      <rect className="pf-stack-mini-ink" x="6" y="60" width="24" height="8" rx="4" opacity={0.85} />
      <rect className="pf-stack-mini-mute" x="90" y="63" width="24" height="2" rx="1" />
    </svg>
  );
}
