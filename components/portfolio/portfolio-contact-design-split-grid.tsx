'use client';
import { portfolioEditorialGutterNegativeX } from '@/components/portfolio/portfolio-editorial-layout';

import gsap from 'gsap';
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useFitText } from '@/components/portfolio/portfolio-contact-fit-text';
import { FooterSocialLinkIcon, type EditorialContactLink } from '@/components/portfolio/portfolio-contact-link-icons';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import { contactLightDarkTokens } from '@/components/portfolio/portfolio-contact-design-motion';
import { useT } from '@/lib/i18n/I18nProvider';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { DEFAULT_CONTENT_GUTTER, portfolioEditorialGutterX, type PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smart email wrapping — plain `break-all` chops anywhere, including mid-character inside
 * the TLD (e.g. "…skraft.co" / "m"). Instead, only offer real break opportunities
 * (`<wbr>`) right after "@" and right before each "." in the domain, with the dot kept
 * attached to the segment that follows it — so ".com" always wraps as one intact unit.
 * `break-words` stays on the wrapping `<a>` purely as a last-resort fallback for a domain
 * segment that's still too long to fit even between those points.
 */
function EmailSmartWrap({ email }: { email: string }) {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return <>{email}</>;
  const local = email.slice(0, atIndex + 1);
  const domainParts = email.slice(atIndex + 1).split('.');
  return (
    <>
      {local}
      <wbr />
      {domainParts.map((part, index) => (
        <span key={index}>
          {index > 0 ? <wbr /> : null}
          {index > 0 ? '.' : ''}
          {part}
        </span>
      ))}
    </>
  );
}

const MARQUEE_REPEATS = 6;

/** Curtain-reveal wrapper: masks its child in an overflow-hidden band, sliding it
 *  up from below on mount. Used for every large link in the right column. */
function CurtainLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const innerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || prefersReducedMotion()) return undefined;
    gsap.set(inner, { yPercent: 110 });
    const tween = gsap.to(inner, { yPercent: 0, duration: 0.9, ease: 'power3.out', delay });
    return () => {
      tween.kill();
    };
  }, [delay]);
  return (
    <span className="block overflow-hidden">
      <span ref={innerRef} className={`block ${className ?? ''}`}>
        {children}
      </span>
    </span>
  );
}

/** Magnetic hover — the element itself glides toward the cursor while hovered
 *  (proximity-based, not click-triggered), then springs back on leave. */
function useMagnetic(strength = 0.4, maxPx = 22) {
  const ref = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches) return undefined;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-maxPx, Math.min(maxPx, relX * strength));
      const y = Math.max(-maxPx, Math.min(maxPx, relY * strength));
      gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength, maxPx]);
  return ref;
}

function SplitGridMarquee({ text, active, ink }: { text: string; active: boolean; ink: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);
  const sequence = Array.from({ length: MARQUEE_REPEATS }, () => text).join('');

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || prefersReducedMotion()) return undefined;
    const first = row.firstElementChild as HTMLElement | null;
    const wrapWidth = first?.offsetWidth ?? 0;
    if (wrapWidth < 8) return undefined;
    gsap.set(row, { x: 0 });
    loopRef.current = gsap.to(row, { x: -wrapWidth, duration: wrapWidth / 90, ease: 'none', repeat: -1, paused: true });
    return () => {
      loopRef.current?.kill();
      loopRef.current = null;
    };
  }, [sequence]);

  useLayoutEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;
    if (active) loop.play();
    else loop.pause();
  }, [active]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden" aria-hidden>
      <div
        ref={rowRef}
        className="flex shrink-0 whitespace-nowrap text-[calc(10vw*var(--pf-contact-font-scale,1))] font-black uppercase leading-none tracking-tight transition-opacity duration-500"
        style={{ opacity: active ? 0.06 : 0, color: ink }}
      >
        <span>{sequence}</span>
        <span>{sequence}</span>
      </div>
    </div>
  );
}

/**
 * Concept 2 — "Split grid": a broken, split-screen editorial grid with no physical
 * divider. A narrow left column carries the physical metadata (address, phone) under
 * micro-caps category labels; a wide right column carries the primary action — a
 * monumental clickable email and the social links — each wrapped in a curtain-reveal
 * mask and, on desktop, magnetically drawn toward the cursor. Hovering the email
 * fades in a faint, oversized looping marquee of a short call-to-action phrase behind
 * it. Collapses to a single-column, thumb-friendly stack under 768px with the email
 * as the central element and socials aligned in a row beneath it. Text and the marquee
 * mirror the portfolio's own active color mode (settings.global.colorMode) via the shared
 * contactLightDarkTokens() recipe in portfolio-contact-design-motion.ts.
 */
export function ContactDesignSplitGrid({
  email,
  phone,
  locationLabel,
  links,
  layout,
  colorMode,
  heroImageUrl = null,
  heroImageAlt = '',
  accent = '#f97316',
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  layout: ContactDesignLayoutResolver;
  /** The portfolio's real active appearance (settings.global.colorMode) — mirrors the
   *  portfolio's own mode (pure white / pure black canvas, synced text), same recipe as
   *  every other genuinely light/dark-aware premium Contact design. */
  colorMode: 'light' | 'dark';
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  accent?: string;
  contentGutter?: PortfolioContentGutter;
}) {
  const t = useT();
  const emailRef = useMagnetic(0.25, 26);
  const hoverRef = useRef<HTMLDivElement>(null);
  const emailBoxRef = useRef<HTMLDivElement>(null);
  const emailLineRef = useRef<HTMLSpanElement>(null);
  useFitText(emailBoxRef, emailLineRef, [email, colorMode]);
  const [marqueeActive, setMarqueeActive] = useState(false);
  const tokens = contactLightDarkTokens(colorMode);

  const marqueeText = layout.text('marquee');
  const locationHeading = layout.text('locationLabel');
  const phoneHeading = layout.text('phoneLabel');
  const hasPhone = Boolean(phone?.trim());
  const hasLocation = Boolean(locationLabel?.trim());
  const hasLinks = links.length > 0;
  const showPortrait = layout.isVisible('portrait') && Boolean(heroImageUrl?.trim());

  return (
    <div
      className={`relative ${portfolioEditorialGutterNegativeX(contentGutter)}`}
      data-pf-no-color-transition=""
    >
      <div className={`grid w-full grid-cols-1 gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:items-center lg:gap-x-0 ${portfolioEditorialGutterX(contentGutter)}`}>
        <div className="flex min-w-0 flex-col gap-10 lg:pr-12">
          {hasLocation ? (
            <div>
              {locationHeading ? (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: tokens.faint }} data-pf-no-color-transition="">
                  {locationHeading}
                </p>
              ) : null}
              <p className="text-base font-light" style={{ color: tokens.muted }} data-pf-no-color-transition="">
                {locationLabel}
              </p>
            </div>
          ) : null}
          {hasPhone ? (
            <div>
              {phoneHeading ? (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: tokens.faint }} data-pf-no-color-transition="">
                  {phoneHeading}
                </p>
              ) : null}
              <a
                href={`tel:${phone}`}
                className="block text-base font-light transition-colors hover:![color:var(--pf-hover-ink)]"
                style={{ color: tokens.muted, '--pf-hover-ink': tokens.ink } as CSSProperties}
                data-pf-no-color-transition=""
              >
                {phone}
              </a>
            </div>
          ) : null}
        </div>

        <div
          ref={hoverRef}
          className="relative flex min-w-0 flex-col items-center gap-10 text-center lg:items-end lg:gap-12 lg:text-right"
        >
          {email ? (
            <div ref={emailBoxRef} className="relative w-full">
              {marqueeText ? <SplitGridMarquee text={marqueeText} active={marqueeActive} ink={tokens.ink} /> : null}
              <a
                ref={emailRef as RefObject<HTMLAnchorElement>}
                href={`mailto:${email}`}
                className="relative block w-full min-w-0 max-w-full font-medium leading-[1.08] tracking-tight"
                // One line, as large as the width allows (useFitText sets --fit on the wrapper).
                style={{ color: tokens.ink, fontSize: 'calc(clamp(1.75rem, 6vw, 4.5rem) * var(--pf-contact-font-scale, 1) * var(--fit, 1))' }}
                data-pf-no-color-transition=""
                onPointerEnter={() => setMarqueeActive(true)}
                onPointerLeave={() => setMarqueeActive(false)}
              >
                <CurtainLine>
                  <span ref={emailLineRef} className="inline-block whitespace-nowrap">
                    <EmailSmartWrap email={email} />
                  </span>
                </CurtainLine>
              </a>
            </div>
          ) : null}

          {hasLinks ? (
            <nav
              className="flex flex-wrap items-center justify-center gap-6 lg:justify-end"
              aria-label={t('Social')}
            >
              {links.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] transition hover:![color:var(--pf-hover-ink)]"
                  style={{ color: tokens.muted, '--pf-hover-ink': tokens.ink } as CSSProperties}
                  data-pf-no-color-transition=""
                >
                  <CurtainLine delay={0.05 * index} className="flex items-center gap-2">
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-3.5 w-3.5" />
                    {link.label}
                  </CurtainLine>
                </a>
              ))}
            </nav>
          ) : null}
        </div>
        {showPortrait ? (
          <div className="flex justify-center pt-3 lg:col-span-2" data-contact-split-portrait="">
            <div className="relative shrink-0" style={{ width: 'min(74vw, 21rem)', maxWidth: '100%' }}>
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-2.5 -right-2.5 h-full w-full border" style={{ borderColor: tokens.border }} />
              <div className="relative w-full overflow-hidden border shadow-[0_6px_18px_-12px_rgba(0,0,0,0.18)]" style={{ aspectRatio: '4 / 5', borderColor: tokens.border, backgroundColor: tokens.placeholderBg }}>
                <PortfolioDeferredMedia src={heroImageUrl!} alt={heroImageAlt || t('Portrait')} sizes="(max-width: 454px) 74vw, 336px" objectFit="cover" objectPosition="top" crisp />
              </div>
              <span aria-hidden="true" className="relative mx-auto mt-6 block h-0.5 w-7" style={{ backgroundColor: accent }} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
