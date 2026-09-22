'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  FooterSocialLinkIcon,
  type EditorialContactLink,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const DEFAULT_WATERMARK = 'CONNECT';

/**
 * Concept 3 — "Liquid distortion": a minimalist, liquid-feeling composition on deep
 * black. Contact items sit unboxed at the four corners of the viewport (vw/vh
 * coordinates, deliberately non-linear); a monumental watermark word drifts, almost
 * invisibly (3% opacity), across the whole background, stretching and skewing with
 * the cursor's own speed — the faster the mouse moves, the more it distorts, then
 * eases back to rest. Hovering any coordinate gives it a brief organic stretch
 * (scale + skew settling on `power4.out`) and instantly dims every other item to
 * near-nothing, so 100% of the attention lands on the active link. All mouse-driven
 * motion is dropped on touch / `prefers-reduced-motion`; under 768px the watermark
 * shrinks and the corners collapse into one clean centered vertical stack.
 */
export function ContactDesignLiquidDistortion({
  email,
  phone,
  locationLabel,
  links,
  presentation,
}: {
  email: string | null;
  phone: string | null;
  locationLabel: string | null;
  links: EditorialContactLink[];
  presentation: PortfolioContactPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  const watermark = presentation.liquidDistortionWatermark?.trim() || DEFAULT_WATERMARK;
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

    // Organic hover stretch + radical dim-to-focus.
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-liquid-item]'));
    const onEnter = (target: HTMLElement) => {
      items.forEach((el) => {
        if (el === target) {
          gsap.fromTo(
            el,
            { scaleX: 1.18, skewX: -7 },
            { scaleX: 1, skewX: 0, color: '#ffffff', duration: 0.6, ease: 'power4.out', overwrite: 'auto' }
          );
        } else {
          gsap.to(el, { opacity: 0.1, duration: 0.12, ease: 'power1.out', overwrite: 'auto' });
        }
      });
    };
    const onLeaveAll = () => {
      items.forEach((el) => {
        gsap.to(el, { opacity: 1, color: '', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
    };
    const enterHandlers = items.map((el) => {
      const enter = () => onEnter(el);
      el.addEventListener('pointerenter', enter);
      return enter;
    });
    root.addEventListener('pointerleave', onLeaveAll);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeaveAll);
      items.forEach((el, i) => el.removeEventListener('pointerenter', enterHandlers[i]));
      if (decayTimer) window.clearTimeout(decayTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const itemClass =
    'block text-xl font-light text-neutral-300 transition-colors hover:text-white sm:text-2xl';

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black"
      data-pf-no-color-transition=""
    >
      <div
        ref={watermarkRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
      >
        <span className="text-[26vw] font-black uppercase leading-none tracking-tight text-white opacity-[0.03] sm:text-[20vw]">
          {watermark}
        </span>
      </div>

      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-[90rem] grid-cols-1 gap-14 px-6 py-24 sm:px-10 lg:min-h-[90vh] lg:grid-cols-2 lg:gap-0 lg:px-0">
        {hasEmail ? (
          <div className="flex justify-center text-center lg:absolute lg:left-[6vw] lg:top-[10vh] lg:block lg:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Email</p>
              <a href={`mailto:${email}`} className={`${itemClass} mt-2 break-all`} data-liquid-item>
                {email}
              </a>
            </div>
          </div>
        ) : null}

        {hasPhone ? (
          <div className="flex justify-center text-center lg:absolute lg:right-[7vw] lg:top-[16vh] lg:block lg:text-right">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Phone</p>
              <a href={`tel:${phone}`} className={`${itemClass} mt-2`} data-liquid-item>
                {phone}
              </a>
            </div>
          </div>
        ) : null}

        {hasLocation ? (
          <div className="flex justify-center text-center lg:absolute lg:bottom-[14vh] lg:left-[8vw] lg:block lg:text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Address</p>
              <span className={`${itemClass} mt-2`} data-liquid-item>
                {locationLabel}
              </span>
            </div>
          </div>
        ) : null}

        {hasLinks ? (
          <div className="flex justify-center text-center lg:absolute lg:bottom-[10vh] lg:right-[6vw] lg:block lg:text-right">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-600">Social</p>
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
