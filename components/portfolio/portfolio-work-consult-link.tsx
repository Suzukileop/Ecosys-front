'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { GridButtonContent, gridButtonVars } from './portfolio-work-grid-button';
import buttonStyles from './portfolio-work-grid-cta.module.css';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** "View project ↗" — hovering swaps the label (and arrow) for an identical copy
 *  sliding in from below, inside an overflow:hidden mask. Ported from Experience
 *  Cards' CardsRepoLink (same look everywhere a card-level link appears). */
export function WorkConsultTextLink({ href, label, ink }: { href: string; label: string; ink: string }) {
  const textCloneRef = useRef<HTMLSpanElement | null>(null);
  const arrowCloneRef = useRef<SVGSVGElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const textClone = textCloneRef.current;
    const arrowClone = arrowCloneRef.current;
    if (!textClone || !arrowClone) return undefined;
    if (prefersReducedMotion()) return undefined;

    const tl = gsap
      .timeline({ paused: true, defaults: { duration: 0.5, ease: 'power3.inOut' } })
      .to(textClone.parentElement, { yPercent: -100 }, 0)
      .to(arrowClone.parentElement, { yPercent: -100 }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [label]);

  const onEnter = () => timelineRef.current?.play();
  const onLeave = () => timelineRef.current?.reverse();

  const isExternal = /^https?:\/\//i.test(href);
  const anchorProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <a
      href={href}
      {...anchorProps}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="group/consult-link inline-flex items-center gap-2.5 text-[0.92rem] font-medium tracking-[0.02em] outline-hidden focus-visible:opacity-70"
      style={{ color: ink }}
      data-pf-no-color-transition=""
    >
      <span className="relative inline-block h-[1.2em] overflow-hidden">
        <span className="block">{label}</span>
        <span ref={textCloneRef} className="absolute inset-x-0 top-full block">
          {label}
        </span>
      </span>
      <span className="relative inline-block h-[1em] w-[1em] shrink-0 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg ref={arrowCloneRef} viewBox="0 0 16 16" className="absolute inset-x-0 top-full h-full w-full" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** Underline / outline / solid / pill consult button — same look as the Grid design's. */
export function WorkConsultButtonLink({
  href,
  label,
  ink,
  variant,
}: {
  href: string;
  label: string;
  ink: string;
  variant: 'underline' | 'outline' | 'solid' | 'pill';
}) {
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={buttonStyles.cta}
      data-variant={variant}
      style={gridButtonVars(ink)}
      data-pf-no-color-transition=""
    >
      <GridButtonContent label={label} />
    </a>
  );
}
