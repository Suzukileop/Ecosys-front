'use client';

import gsap from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  footerMiniBarCopyrightBase,
  prefersReducedMotion,
  useFooterMiniBarLiveClock,
  type FooterMiniBarVariantProps,
} from '@/components/portfolio/portfolio-footer-mini-bar-shared';

const REST_OPACITY = 0.45;
const FOCUS_OPACITY = 1;

const MINI_BAR_CSS = `
.pf-mini-bar-item {
  transition: opacity 0.35s ease, color 0.4s ease;
}
.pf-mini-bar-root {
  transition: background-color 0.4s ease, border-color 0.4s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-mini-bar-item,
  .pf-mini-bar-root {
    transition: none !important;
  }
}
`;

function MiniBarStyles() {
  return <style dangerouslySetInnerHTML={{ __html: MINI_BAR_CSS }} />;
}

/** Magnetic "Back to top" — text pulled toward the cursor within a proximity radius (same
 *  `gsap.quickTo` idiom as every other Footer design's magnetic control, e.g. Headline
 *  Reveal's "Contact me" pill). On direct hover the label snaps to full ink and the arrow
 *  jumps up then springs back (`back.out`); click smooth-scrolls to the very top. */
function MiniBarBackToTop({ ink }: { ink: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
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
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
        const radius = 56;

        const onMove = (event: PointerEvent) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = event.clientX - cx;
          const dy = event.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            moveX(dx * 0.35);
            moveY(dy * 0.35);
          } else {
            moveX(0);
            moveY(0);
          }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
      }, wrap);
    } catch (error) {
      console.error('[FooterMiniBarMinimal] magnetic back-to-top failed to initialize', error);
      ctx?.revert();
      gsap.set(btn, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  const handleEnter = () => {
    if (prefersReducedMotion()) return;
    const label = labelRef.current;
    const arrow = arrowRef.current;
    if (label) gsap.to(label, { opacity: FOCUS_OPACITY, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    if (arrow) {
      gsap.fromTo(
        arrow,
        { y: 0 },
        {
          y: -5,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: () => {
            gsap.to(arrow, { y: 0, duration: 0.6, ease: 'back.out(2.2)', overwrite: 'auto' });
          },
        }
      );
    }
  };

  const handleLeave = () => {
    if (prefersReducedMotion()) return;
    const label = labelRef.current;
    if (label) gsap.to(label, { opacity: REST_OPACITY, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
  };

  const handleClick = () => {
    try {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div ref={wrapRef} className="inline-flex shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        data-pf-no-color-transition=""
        className="pf-mini-bar-item inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] sm:text-[0.8rem]"
        style={{ color: ink, opacity: REST_OPACITY }}
      >
        <span ref={labelRef}>Back to top</span>
        <span ref={arrowRef} aria-hidden className="inline-block">
          ↑
        </span>
      </button>
    </div>
  );
}

/**
 * "Minimal" — the first of the 3 Mini bottom bar variants: an ultra-minimal, edge-to-edge
 * bar that closes the page just below the main Contact/Footer section. Deliberately carries
 * no navigation, no coordinates and no social links (all already live in the section above
 * it): only three micro-caption items on a single row — copyright far left, a live local
 * clock + location dead center, and a magnetic "Back to top ↑" far right. A single ultra-thin
 * top hairline is its only separator from the section above; everything else is whitespace.
 * Below 768px the row breaks into a compact centered stack (clock, then copyright, then
 * back-to-top) instead of wrapping/overlapping.
 */
export function FooterMiniBarMinimal({
  creatorName,
  locationLabel,
  timezoneId,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#050505' : '#fafafa';
  const hairline = isLight ? 'rgba(5,5,5,0.1)' : 'rgba(255,255,255,0.08)';

  const colonRef = useRef<HTMLSpanElement>(null);
  const clock = useFooterMiniBarLiveClock(timezoneId);
  const trimmedLocation = locationLabel?.trim() || '';
  const copyrightBase = footerMiniBarCopyrightBase(creatorName);
  const trimmedCopyright = copyrightBase ? `${copyrightBase} All rights reserved.` : '';
  const hasClock = Boolean(clock);
  const hasCenter = hasClock || Boolean(trimmedLocation);

  useLayoutEffect(() => {
    const colon = colonRef.current;
    if (!colon) return undefined;
    if (prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        gsap.to(colon, {
          opacity: 0.2,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    } catch (error) {
      console.error('[FooterMiniBarMinimal] clock blink failed to initialize', error);
      ctx?.revert();
      gsap.set(colon, { clearProps: 'all' });
    }

    return () => ctx?.revert();
    // Re-mount the tween whenever the clock starts existing (colonRef only renders once `clock` is truthy).
  }, [hasClock]);

  return (
    <div
      data-pf-mini-footer-bar="minimal"
      data-pf-no-color-transition=""
      className={`pf-mini-bar-root relative w-full border-t ${portfolioEditorialGutterX(contentGutter)}`}
      style={{ ...backgroundStyle, borderColor: hairline }}
    >
      <MiniBarStyles />
      <div className="mx-auto flex w-full max-w-none flex-col items-center gap-3 py-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:py-4">
        {/* MOBILE order: clock → copyright → back-to-top. DESKTOP: copyright | clock | back-to-top. */}
        {hasCenter ? (
          <p
            className="pf-mini-bar-item order-1 text-center text-[0.7rem] font-medium uppercase tracking-[0.15em] sm:order-2 sm:text-[0.75rem]"
            style={{ color: ink, opacity: REST_OPACITY }}
          >
            {trimmedLocation}
            {trimmedLocation && clock ? ' • ' : ''}
            {clock ? (
              <span className="font-mono tabular-nums">
                {clock.hour}
                <span ref={colonRef} style={{ opacity: 1 }}>
                  :
                </span>
                {clock.minute} {clock.period}
              </span>
            ) : null}
          </p>
        ) : (
          <span className="order-1 hidden sm:order-2 sm:block" aria-hidden />
        )}

        {trimmedCopyright ? (
          <p
            className="pf-mini-bar-item order-2 text-center text-[0.7rem] font-medium uppercase tracking-[0.15em] sm:order-1 sm:text-left sm:text-[0.75rem]"
            style={{ color: ink, opacity: REST_OPACITY }}
          >
            {trimmedCopyright}
          </p>
        ) : (
          <span className="order-2 sm:order-1" aria-hidden />
        )}

        <div className="order-3 flex justify-center sm:justify-end">
          <MiniBarBackToTop ink={ink} />
        </div>
      </div>
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarMinimalWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <line x1="6" y1="52" x2="114" y2="52" className="pf-stack-mini-mute" strokeWidth={1} />
      <rect className="pf-stack-mini-mute" x="8" y="58" width="26" height="3" rx="1.5" opacity={0.6} />
      <rect className="pf-stack-mini-mute" x="50" y="58" width="20" height="3" rx="1.5" opacity={0.6} />
      <rect className="pf-stack-mini-ink" x="90" y="58" width="22" height="3" rx="1.5" />
    </svg>
  );
}
