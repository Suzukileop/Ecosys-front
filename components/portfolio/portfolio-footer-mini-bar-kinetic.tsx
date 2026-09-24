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

const REST_OPACITY = 0.55;
const FOCUS_OPACITY = 1;
const DEFAULT_ACCENT = '#f97316';

const KINETIC_CSS = `
.pf-mbk-item {
  transition: opacity 0.35s ease, color 0.4s ease;
}
.pf-mbk-root {
  transition: background-color 0.4s ease, border-color 0.4s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-mbk-item,
  .pf-mbk-root {
    transition: none !important;
  }
}
`;

function KineticStyles() {
  return <style dangerouslySetInnerHTML={{ __html: KINETIC_CSS }} />;
}

/** Tracks whole-page scroll progress (0 → 1) and scales the progress fill's width via a
 *  `scaleX` transform (GPU-cheap, no layout thrash) — `gsap.quickTo` smooths every tick,
 *  and reads are rAF-batched so a fast scroll never queues more than one write per frame. */
function useScrollProgressFill(barRef: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        const setScale = gsap.quickTo(bar, 'scaleX', {
          duration: prefersReducedMotion() ? 0 : 0.2,
          ease: 'power1.out',
        });

        const computeProgress = () => {
          const doc = document.documentElement;
          const scrollTop = window.scrollY || doc.scrollTop || 0;
          const scrollable = doc.scrollHeight - doc.clientHeight || 1;
          return Math.min(1, Math.max(0, scrollTop / scrollable));
        };

        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(() => {
            setScale(computeProgress());
            ticking = false;
          });
        };

        setScale(computeProgress());
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        };
      });
    } catch (error) {
      console.error('[FooterMiniBarKinetic] scroll progress failed to initialize', error);
      ctx?.revert();
      gsap.set(bar, { clearProps: 'all' });
    }

    return () => ctx?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** "[ Back to top ↑ ]" — magnetic pull toward the cursor, same `gsap.quickTo` idiom as every
 *  other Footer magnetic control. Unlike Minimal's single arrow jump, direct hover here starts
 *  a *continuous* looping bounce (repeat:-1, yoyo:true) that only settles back to rest on
 *  mouseleave, per spec. */
function KineticBackToTop({ ink }: { ink: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);

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
        const radius = 60;

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
      console.error('[FooterMiniBarKinetic] magnetic back-to-top failed to initialize', error);
      ctx?.revert();
      gsap.set(btn, { clearProps: 'all' });
    }

    return () => ctx?.revert();
  }, []);

  const handleEnter = () => {
    const label = labelRef.current;
    const arrow = arrowRef.current;
    if (prefersReducedMotion()) return;
    if (label) gsap.to(label, { opacity: FOCUS_OPACITY, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    if (arrow) {
      loopRef.current?.kill();
      loopRef.current = gsap.to(arrow, {
        y: -4,
        duration: 0.42,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  };

  const handleLeave = () => {
    const label = labelRef.current;
    const arrow = arrowRef.current;
    loopRef.current?.kill();
    loopRef.current = null;
    if (prefersReducedMotion()) return;
    if (label) gsap.to(label, { opacity: REST_OPACITY, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    if (arrow) gsap.to(arrow, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
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
        className="pf-mbk-item inline-flex items-center gap-1.5 text-[0.85rem] font-semibold uppercase tracking-[0.14em]"
        style={{ color: ink, opacity: REST_OPACITY }}
      >
        <span aria-hidden>[</span>
        <span ref={labelRef}>Back to top</span>
        <span ref={arrowRef} aria-hidden className="inline-block">
          ↑
        </span>
        <span aria-hidden>]</span>
      </button>
    </div>
  );
}

/**
 * "Kinetic line" — the 2nd Mini bottom bar variant: the same three micro-caption items as
 * Minimal (copyright, live clock + location, back-to-top) but louder — 0.85rem type at
 * 0.55 resting opacity instead of Minimal's more whispered 0.45/0.7rem — and its hairline
 * top border doubles as a scroll-progress track: an accent-colored fill scales left→right
 * with the page's whole scroll position. "Back to top" bounces continuously while hovered
 * instead of a single jump. Below 768px the row stacks (clock, copyright, back-to-top).
 */
export function FooterMiniBarKinetic({
  creatorName,
  locationLabel,
  timezoneId,
  colorMode,
  accentColor,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#050505' : '#fafafa';
  const hairline = isLight ? 'rgba(5,5,5,0.1)' : 'rgba(255,255,255,0.08)';
  const accent = accentColor?.trim() || DEFAULT_ACCENT;

  const progressRef = useRef<HTMLDivElement>(null);
  useScrollProgressFill(progressRef);

  const clock = useFooterMiniBarLiveClock(timezoneId);
  const trimmedLocation = locationLabel?.trim() || '';
  const trimmedCopyright = footerMiniBarCopyrightBase(creatorName);
  const hasCenter = Boolean(clock || trimmedLocation);

  return (
    <div
      data-pf-mini-footer-bar="kinetic"
      data-pf-no-color-transition=""
      className={`pf-mbk-root relative w-full overflow-hidden ${portfolioEditorialGutterX(contentGutter)}`}
      style={backgroundStyle}
    >
      <KineticStyles />
      {/* Hairline track + accent scroll-progress fill layered on top of it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ backgroundColor: hairline }} aria-hidden />
      <div
        ref={progressRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left"
        style={{ backgroundColor: accent, transform: 'scaleX(0)' }}
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-none flex-col items-center gap-3 py-5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:py-4">
        {hasCenter ? (
          <p
            className="pf-mbk-item order-1 text-center text-[0.85rem] font-medium uppercase tracking-[0.12em] sm:order-2"
            style={{ color: ink, opacity: REST_OPACITY }}
          >
            {trimmedLocation}
            {trimmedLocation && clock ? ' / ' : ''}
            {clock ? (
              <span className="font-mono tabular-nums">
                {clock.hour}:{clock.minute} {clock.period}
              </span>
            ) : null}
          </p>
        ) : (
          <span className="order-1 hidden sm:order-2 sm:block" aria-hidden />
        )}

        {trimmedCopyright ? (
          <p
            className="pf-mbk-item order-2 text-center text-[0.85rem] font-medium uppercase tracking-[0.12em] sm:order-1 sm:text-left"
            style={{ color: ink, opacity: REST_OPACITY }}
          >
            {trimmedCopyright}
          </p>
        ) : (
          <span className="order-2 sm:order-1" aria-hidden />
        )}

        <div className="order-3 flex justify-center sm:justify-end">
          <KineticBackToTop ink={ink} />
        </div>
      </div>
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarKineticWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <line x1="6" y1="50" x2="114" y2="50" className="pf-stack-mini-mute" strokeWidth={1} />
      <line x1="6" y1="50" x2="66" y2="50" className="pf-stack-mini-accent" strokeWidth={2} />
      <rect className="pf-stack-mini-mute" x="8" y="57" width="28" height="3.5" rx="1.5" opacity={0.65} />
      <rect className="pf-stack-mini-mute" x="48" y="57" width="24" height="3.5" rx="1.5" opacity={0.65} />
      <rect className="pf-stack-mini-ink" x="88" y="57" width="24" height="3.5" rx="1.5" />
    </svg>
  );
}
