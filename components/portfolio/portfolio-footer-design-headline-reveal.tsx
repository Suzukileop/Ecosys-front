'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { formatPhoneDisplay } from '@/lib/phone';
import type { EditorialContactLink } from '@/components/portfolio/portfolio-section-primitives';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { FooterDesignLayoutResolver } from '@/components/portfolio/portfolio-footer-design-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const HEADLINE_REVEAL_CSS = `
.pf-hlreveal-link {
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.pf-hlreveal-mode {
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (prefers-reduced-motion: reduce) {
  .pf-hlreveal-link,
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
function HeadlineRevealContactButton({
  href,
  ink,
  inkContrast,
  label,
}: {
  href: string;
  ink: string;
  inkContrast: string;
  label: string;
}) {
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
        {...(/^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noreferrer' } : {})}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        data-pf-no-color-transition=""
        className="pf-hlreveal-mode inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] sm:px-8 sm:py-4"
        style={{ backgroundColor: ink, color: inkContrast }}
      >
        {label}
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
  layout: FooterDesignLayoutResolver;
  copyrightText: string;
  contactHref: string;
  colorMode: 'light' | 'dark';
  /** Site-wide editorial gutter (settings.global.contentGutter) — this design is full-bleed
   *  (bypasses the legacy footer shell), so it needs the same gutter every other section
   *  respects passed in explicitly to keep its content column aligned with the rest of the page. */
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
 * "Headline Reveal" — the borderless, high-contrast rework of the classic columns-with-
 * separators Footer (no default headline — that role is now the shared Header mechanism's
 * job): a divider-free grid (identity + bio, navigation, coordinates & social links — every
 * one a bare floating label, no icon chips, no vertical rule) reads at full ink, no resting
 * dim. Hovering any single coordinate nudges it 4px with its own color/transform transition —
 * a self-contained accent that never touches any other element on the page. A
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
  layout,
  contactHref,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
  fontSizeScale = 1,
}: FooterDesignHeadlineRevealProps) {
  const rootRef = useRef<HTMLElement>(null);

  const isLight = colorMode === 'light';
  const ink = isLight ? '#000000' : '#ffffff';
  const inkContrast = isLight ? '#ffffff' : '#000000';

  const showName = layout.isVisible('name');
  const bioTrimmed = layout.bio('bio', bio);
  const ctaLabel = layout.text('ctaLabel');
  const phoneTrimmed = phone?.trim() || null;
  const phoneDisplay = phoneTrimmed ? formatPhoneDisplay(phoneTrimmed) : null;
  const emailTrimmed = email?.trim() || null;
  const locationTrimmed = locationLabel?.trim() || null;
  // Layout settings → "Button link". A channel the profile doesn't have (no phone, no link picked)
  // falls back to the page's default contact target instead of a dead button.
  const ctaTarget = layout.target('ctaTarget');
  const ctaHref =
    ctaTarget.mode === 'phone' && phoneTrimmed
      ? `tel:${phoneTrimmed.replace(/\s+/g, '')}`
      : ctaTarget.mode === 'link' && ctaTarget.url
        ? ctaTarget.url
        : ctaTarget.mode === 'email' && emailTrimmed
          ? `mailto:${emailTrimmed}`
          : contactHref;

  // Self-contained hover accent: the hovered link nudges 4px and takes the full ink color via
  // its own onMouseEnter/onMouseLeave, without touching any other element (see
  // handleLinkEnter/handleLinkLeave below).
  const handleLinkEnter = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.color = ink;
    el.style.transform = 'translateX(4px)';
  };
  const handleLinkLeave = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    el.style.color = '';
    el.style.transform = '';
  };

  return (
    <footer
      id="footer"
      ref={rootRef}
      data-creator-id={creatorId}
      className="pf-hlreveal-mode relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ ...backgroundStyle, color: ink, '--pf-footer-font-scale': fontSizeScale } as CSSProperties}
      data-pf-no-color-transition=""
    >
      <HeadlineRevealStyles />

      <div className={`relative z-[1] w-full pb-12 pt-20 sm:pt-24 lg:pb-16 lg:pt-28 ${portfolioEditorialGutterX(contentGutter)}`}>
        {/* Borderless grid — whitespace is the only separator. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-16 lg:gap-24">
          <div className="flex flex-col gap-4">
            {showName ? (
              <p
                data-pf-no-color-transition=""
                className="pf-hlreveal-mode font-semibold"
                style={{ color: ink, fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {creatorName}
              </p>
            ) : null}
            {bioTrimmed ? (
              <p
                className="max-w-[24rem] leading-[1.6]"
                style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {bioTrimmed}
              </p>
            ) : null}
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                data-pf-no-color-transition=""
                onMouseEnter={handleLinkEnter}
                onMouseLeave={handleLinkLeave}
                className="pf-hlreveal-link w-fit font-normal uppercase tracking-[0.12em]"
                style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-6">
            {phoneDisplay ? (
              <a
                href={`tel:${phoneTrimmed!.replace(/\s+/g, '')}`}
                data-pf-no-color-transition=""
                onMouseEnter={handleLinkEnter}
                onMouseLeave={handleLinkLeave}
                className="pf-hlreveal-link w-fit"
                style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {phoneDisplay}
              </a>
            ) : null}
            {emailTrimmed ? (
              <a
                href={`mailto:${emailTrimmed}`}
                data-pf-no-color-transition=""
                onMouseEnter={handleLinkEnter}
                onMouseLeave={handleLinkLeave}
                className="pf-hlreveal-link w-fit"
                style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
                {emailTrimmed}
              </a>
            ) : null}
            {locationTrimmed ? (
              <p
                className="w-fit max-w-[16rem]"
                style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
              >
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
                      data-pf-no-color-transition=""
                      onMouseEnter={handleLinkEnter}
                      onMouseLeave={handleLinkLeave}
                      className="pf-hlreveal-link w-fit"
                      style={{ fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))' }}
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

        {/* 3. Magnetic contact pill — no rule above it, pure whitespace close. Copyright removed
            from this design at the user's request (2026-09-24). */}
        {ctaLabel ? (
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <HeadlineRevealContactButton href={ctaHref} ink={ink} inkContrast={inkContrast} label={ctaLabel} />
          </div>
        ) : null}
      </div>
    </footer>
  );
}

export function FooterHeadlineRevealWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
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
