'use client';

import gsap from 'gsap';
import { useRef } from 'react';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioEditorialGutterX,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  abbreviateFooterMiniBarName,
  prefersReducedMotion,
  useFooterMiniBarLiveClock,
  type FooterMiniBarVariantProps,
} from '@/components/portfolio/portfolio-footer-mini-bar-shared';

const REST_OPACITY = 0.6;
const FOCUS_OPACITY = 1;
const KERNING_STEP_PX = 2;

const SPLIT_CAPS_CSS = `
.pf-mbsc-block {
  transition: opacity 0.4s ease, color 0.4s ease;
}
.pf-mbsc-root {
  transition: background-color 0.4s ease;
}
@media (prefers-reduced-motion: reduce) {
  .pf-mbsc-block,
  .pf-mbsc-root {
    transition: none !important;
  }
}
`;

function SplitCapsStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SPLIT_CAPS_CSS }} />;
}

/** GSAP "kerning" focus — on hover/focus the block snaps to full ink and its letter-spacing
 *  spreads by `KERNING_STEP_PX` more with a damped `power3.out` ease, per spec; it contracts
 *  back on leave with the same ease. GSAP reads/writes the computed letter-spacing in px
 *  regardless of the element's authored `em` value, so `+=`/`-=` deltas stay exact either way. */
function useKerningFocus(ref: React.RefObject<HTMLElement | null>) {
  const handleEnter = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.to(el, {
      opacity: FOCUS_OPACITY,
      letterSpacing: `+=${KERNING_STEP_PX}px`,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.to(el, {
      opacity: REST_OPACITY,
      letterSpacing: `-=${KERNING_STEP_PX}px`,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  return { handleEnter, handleLeave };
}

/**
 * "Split caps" — the 3rd Mini bottom bar variant: Swiss-editorial, borderless. No divider
 * line — a generous vertical whitespace gap is the only boundary with the section above.
 * Two blocks only, pinned to the viewport's bottom-left and bottom-right geometric corners:
 * an abbreviated copyright on the left, and a single capsule on the right that fuses the
 * live local clock + location with "Back to top" into one clickable target. Hovering either
 * block snaps it to full ink and spreads its letter-spacing via GSAP (`power3.out`); clicking
 * the right block smooth-scrolls to the very top. Below 768px both blocks recenter and stack
 * at the very bottom of the viewport with tighter tracking for thumb-width legibility.
 */
export function FooterMiniBarSplitCaps({
  creatorName,
  locationLabel,
  timezoneId,
  colorMode,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  backgroundStyle,
}: FooterMiniBarVariantProps) {
  const isLight = colorMode === 'light';
  const ink = isLight ? '#050505' : '#fafafa';

  const clock = useFooterMiniBarLiveClock(timezoneId);
  const trimmedLocation = locationLabel?.trim().toUpperCase() || '';
  const abbreviatedName = abbreviateFooterMiniBarName(creatorName);
  const copyrightText = abbreviatedName ? `© ${new Date().getFullYear()} ${abbreviatedName}` : '';

  const copyrightRef = useRef<HTMLParagraphElement>(null);
  const capsuleRef = useRef<HTMLButtonElement>(null);
  const copyrightKerning = useKerningFocus(copyrightRef);
  const capsuleKerning = useKerningFocus(capsuleRef);

  const handleClick = () => {
    try {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div
      data-pf-mini-footer-bar="split-caps"
      data-pf-no-color-transition=""
      className={`pf-mbsc-root relative w-full ${portfolioEditorialGutterX(contentGutter)}`}
      style={backgroundStyle}
    >
      <SplitCapsStyles />
      <div className="mx-auto flex w-full max-w-none flex-col items-center gap-4 pb-8 pt-20 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-10 sm:pt-28">
        {copyrightText ? (
          <p
            ref={copyrightRef}
            tabIndex={0}
            onMouseEnter={copyrightKerning.handleEnter}
            onMouseLeave={copyrightKerning.handleLeave}
            onFocus={copyrightKerning.handleEnter}
            onBlur={copyrightKerning.handleLeave}
            data-pf-no-color-transition=""
            className="pf-mbsc-block order-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.1em] sm:order-1 sm:text-left sm:text-[0.8rem] sm:tracking-[0.18em]"
            style={{ color: ink, opacity: REST_OPACITY }}
          >
            {copyrightText}
          </p>
        ) : (
          <span className="order-2 sm:order-1" aria-hidden />
        )}

        <button
          ref={capsuleRef}
          type="button"
          onClick={handleClick}
          onMouseEnter={capsuleKerning.handleEnter}
          onMouseLeave={capsuleKerning.handleLeave}
          onFocus={capsuleKerning.handleEnter}
          onBlur={capsuleKerning.handleLeave}
          data-pf-no-color-transition=""
          className="pf-mbsc-block order-1 inline-flex w-fit items-center gap-2 text-center text-[0.72rem] font-bold uppercase tracking-[0.1em] sm:order-2 sm:text-[0.8rem] sm:tracking-[0.18em]"
          style={{ color: ink, opacity: REST_OPACITY }}
        >
          {trimmedLocation ? <span>{trimmedLocation}</span> : null}
          {clock ? (
            <span className="font-mono tabular-nums">
              {clock.hour}:{clock.minute} {clock.period}
            </span>
          ) : null}
          <span aria-hidden>•</span>
          <span>Back to top ↑</span>
        </button>
      </div>
    </div>
  );
}

/** Tiny abstract wireframe for the settings-panel design picker thumbnail. */
export function FooterMiniBarSplitCapsWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-mute" x="8" y="54" width="26" height="3.5" rx="1.5" opacity={0.65} />
      <rect className="pf-stack-mini-ink" x="76" y="54" width="36" height="3.5" rx="1.5" />
    </svg>
  );
}
