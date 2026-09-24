'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { ContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Layout settings → "Watermark intensity" (Subtle is the original 3%). */
const WATERMARK_OPACITY: Record<string, number> = { subtle: 0.03, medium: 0.07, bold: 0.14 };

/**
 * Concept 3 — "Liquid distortion": a minimalist, liquid-feeling composition on deep
 * black. Contact items sit unboxed at the four corners of the viewport (vw/vh
 * coordinates, deliberately non-linear); a monumental watermark word drifts, almost
 * invisibly (3% opacity), across the whole background, stretching and skewing with
 * the cursor's own speed — the faster the mouse moves, the more it distorts, then
 * eases back to rest. Hovering any coordinate gives it a brief organic stretch
 * (scale + skew settling on `power4.out`), self-contained to that one item. All mouse-driven
 * motion is dropped on touch / `prefers-reduced-motion`; under 768px the watermark
 * shrinks and the corners collapse into one clean centered vertical stack.
 */
export function ContactDesignLiquidDistortion({
  email,
  phone,
  locationLabel,
  links,
  layout,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  layout: ContactDesignLayoutResolver;
  /** Same site-wide editorial gutter every other section respects — used to keep the
   *  watermark word from bleeding past the page's own right/left margin. */
  contentGutter?: PortfolioContentGutter;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  const watermark = layout.text('watermark');
  const hasWatermark = Boolean(watermark);
  const watermarkOpacity = WATERMARK_OPACITY[layout.option('watermarkIntensity')] ?? WATERMARK_OPACITY.subtle;
  const emailHeading = layout.text('emailLabel');
  const phoneHeading = layout.text('phoneLabel');
  const addressHeading = layout.text('addressLabel');
  const socialHeading = layout.text('socialLabel');
  const hasEmail = Boolean(email?.trim());
  const hasPhone = Boolean(phone?.trim());
  const hasLocation = Boolean(locationLabel?.trim());
  const hasLinks = links.length > 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const watermarkEl = watermarkRef.current;
    if (!root) return undefined;
    if (prefersReducedMotion()) return undefined;
    const fine = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
    if (!fine) return undefined;

    // Speed-reactive watermark drift — a rAF loop smooths raw pointer velocity into a
    // lagging value, then maps it onto a skew + horizontal offset. No new movement ⇒
    // the raw velocity decays to 0 and the smoothed value eases the shape back to rest.
    let rawVX = 0;
    let smoothVX = 0;
    let lastX: number | null = null;
    let decayTimer: number | null = null;
    let rafId = 0;

    const onMove = (event: PointerEvent) => {
      if (lastX !== null) rawVX = event.clientX - lastX;
      lastX = event.clientX;
      if (decayTimer) window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => {
        rawVX = 0;
      }, 80);
    };

    const tick = () => {
      smoothVX += (rawVX - smoothVX) * 0.08;
      if (watermarkEl) {
        const skew = Math.max(-16, Math.min(16, smoothVX * 0.9));
        const drift = Math.max(-40, Math.min(40, smoothVX * 2.2));
        gsap.set(watermarkEl, { skewX: skew, x: drift });
      }
      rafId = window.requestAnimationFrame(tick);
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    // Organic hover stretch — self-contained to the hovered item only, never touches
    // any sibling's opacity or color.
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-liquid-item]'));
    const enterHandlers = items.map((el) => {
      const enter = () => {
        gsap.fromTo(
          el,
          { scaleX: 1.18, skewX: -7 },
          { scaleX: 1, skewX: 0, duration: 0.6, ease: 'power4.out', overwrite: 'auto' }
        );
      };
      el.addEventListener('pointerenter', enter);
      return enter;
    });

    return () => {
      root.removeEventListener('pointermove', onMove);
      items.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
      if (decayTimer) window.clearTimeout(decayTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, [hasWatermark]);

  const itemClass =
    'block text-xl font-light text-neutral-300 transition-colors hover:text-white sm:text-2xl';

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      data-pf-no-color-transition=""
    >
      {/* Two nested wrappers, not one — `overflow: hidden` clips at an element's own
          border-box edge and ignores that same element's `padding` once the child is
          centered (flex/absolute) and wider than the box: it bleeds straight through the
          padding to the outer edge, no matter how much gutter padding is set. Confirmed by
          isolated repro, not a guess. So the gutter padding lives on this OUTER, non-clipping
          layer (sets the real, narrower width the inner box inherits); `overflow: hidden`
          then lives on the INNER layer, whose width comes from that inherited box model, not
          its own padding — so it clips exactly at the gutter edge. GSAP only ever moves/skews
          the innermost `watermarkRef` div, never either clipping/padding layer. */}
      {watermark ? (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 right-0 select-none ${portfolioEditorialGutterX(contentGutter)}`}
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <div ref={watermarkRef}>
              <span
                className="text-[26vw] font-black uppercase leading-none tracking-tight text-white sm:text-[20vw]"
                style={{ opacity: watermarkOpacity }}
              >
                {watermark}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-[90rem] grid-cols-1 gap-14 px-6 py-24 sm:px-10 lg:min-h-[90vh] lg:grid-cols-2 lg:gap-0 lg:px-0">
        {hasEmail ? (
          <div className="flex justify-center text-center lg:absolute lg:left-[6vw] lg:top-[10vh] lg:block lg:text-left">
            <div>
              {emailHeading ? <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{emailHeading}</p> : null}
              <a href={`mailto:${email}`} className={`${itemClass} mt-2 break-all`} data-liquid-item>
                {email}
              </a>
            </div>
          </div>
        ) : null}

        {hasPhone ? (
          <div className="flex justify-center text-center lg:absolute lg:right-[7vw] lg:top-[16vh] lg:block lg:text-right">
            <div>
              {phoneHeading ? <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{phoneHeading}</p> : null}
              <a href={`tel:${phone}`} className={`${itemClass} mt-2`} data-liquid-item>
                {phone}
              </a>
            </div>
          </div>
        ) : null}

        {hasLocation ? (
          <div className="flex justify-center text-center lg:absolute lg:bottom-[14vh] lg:left-[8vw] lg:block lg:text-left">
            <div>
              {addressHeading ? <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{addressHeading}</p> : null}
              <span className={`${itemClass} mt-2`} data-liquid-item>
                {locationLabel}
              </span>
            </div>
          </div>
        ) : null}

        {hasLinks ? (
          <div className="flex justify-center text-center lg:absolute lg:bottom-[10vh] lg:right-[6vw] lg:block lg:text-right">
            <div>
              {socialHeading ? <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">{socialHeading}</p> : null}
              <nav className="mt-3 flex flex-wrap items-center justify-center gap-5 lg:justify-end" aria-label="Social">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`${itemClass} mt-0 flex items-center gap-2 text-base sm:text-lg`}
                    data-liquid-item
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
