'use client';

import gsap from 'gsap';
import type { CSSProperties, PointerEvent } from 'react';
import { ServicesOrderButton } from '@/components/portfolio/portfolio-services-card-elements';
import type { ServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import { contrastRatio, readableInk } from '@/components/portfolio/portfolio-services-pricing-shared';
import type { PortfolioServicesIndexListCtaDesign } from '@/components/portfolio/portfolio-services-settings';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';
const A = { 'data-pf-no-color-transition': '' } as const;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const Arrow = ({ className }: { className?: string }) => (
  <svg {...A} viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
    <path d="M3.5 12.5L12.5 3.5M12.5 3.5H5.5M12.5 3.5V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The Index List order button, in one of five designs. Every design reads one colour (`color`, a palette
 * colour or the ink) and derives the rest from it: the text on a solid button is whichever of light or dark
 * reads best on that colour, the hover flood is that text colour, and a colour too close to the page gets a
 * hairline so the button never disappears. Only used while General → Order button is on Auto.
 */
export function IndexListCta({
  design,
  color,
  pageBg,
  ink,
  inverse,
  pricingStyle,
  label,
}: {
  design: PortfolioServicesIndexListCtaDesign;
  /** Palette colour of the button; `null` = the page ink. */
  color: string | null;
  pageBg: string;
  ink: string;
  inverse: string;
  pricingStyle: ServicesPricingStyle;
  label: string;
}) {
  const base = color ?? ink;
  const onBase = readableInk(base);
  // Text-only designs sit directly on the page: the colour has to read there, or the ink takes over.
  const onPage = contrastRatio(base, pageBg) >= 3 ? base : ink;
  const ring = contrastRatio(base, pageBg) < 1.5 ? `inset 0 0 0 1.5px ${ink}66` : undefined;
  const solid = {
    '--b-bg': base,
    '--b-fg': onBase,
    backgroundColor: base,
    color: onBase,
    boxShadow: ring,
  } as CSSProperties;

  if (design === 'orb') {
    return (
      <ServicesOrderButton
        data-index-text=""
        pricingStyle={pricingStyle}
        label={label}
        ink={base}
        surface={onBase}
        className="group/cta relative mt-8 inline-flex items-center gap-5 overflow-hidden rounded-full py-1.5 pl-6 pr-1.5 text-[0.95rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
        style={solid}
        autoContent={
          <>
            <span
              {...A}
              aria-hidden
              className={`absolute right-1.5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full transition-transform duration-[800ms] ${EASE} group-hover/cta:scale-[12]`}
              style={{ backgroundColor: onBase }}
            />
            <span {...A} className={`relative transition-colors duration-500 ${EASE} group-hover/cta:text-[color:var(--b-bg)]`}>
              {label}
            </span>
            <span
              {...A}
              aria-hidden
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{ color: base }}
            >
              <Arrow className={`h-4 w-4 transition-transform duration-500 ${EASE} group-hover/cta:rotate-45`} />
            </span>
          </>
        }
      />
    );
  }

  if (design === 'roll') {
    return (
      <ServicesOrderButton
        data-index-text=""
        pricingStyle={pricingStyle}
        label={label}
        ink={base}
        surface={onBase}
        className="group/cta relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[0.95rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
        style={solid}
        autoContent={
          <>
            <span
              {...A}
              aria-hidden
              className={`absolute inset-0 translate-y-[101%] rounded-t-[50%] transition-[translate,border-radius] duration-[650ms] ${EASE} group-hover/cta:translate-y-0 group-hover/cta:rounded-t-none`}
              style={{ backgroundColor: onBase }}
            />
            <span {...A} className="relative block overflow-hidden leading-[1.35]">
              <span {...A} className={`block transition-transform duration-500 ${EASE} group-hover/cta:-translate-y-full`}>
                {label}
              </span>
              <span
                {...A}
                aria-hidden
                className={`absolute inset-0 block translate-y-full transition-transform duration-500 ${EASE} group-hover/cta:translate-y-0`}
                style={{ color: base }}
              >
                {label}
              </span>
            </span>
            <Arrow className={`relative h-4 w-4 transition-[transform,color] duration-500 ${EASE} group-hover/cta:rotate-45 group-hover/cta:text-[color:var(--b-bg)]`} />
          </>
        }
      />
    );
  }

  if (design === 'line') {
    return (
      <ServicesOrderButton
        data-index-text=""
        pricingStyle={pricingStyle}
        label={label}
        ink={onPage}
        surface={inverse}
        className="group/cta relative mt-8 inline-flex items-center gap-3 pb-2.5 text-[1.05rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
        style={{ color: onPage }}
        autoContent={
          <>
            <span {...A}>{label}</span>
            <Arrow className={`h-4 w-4 transition-transform duration-500 ${EASE} group-hover/cta:translate-x-1 group-hover/cta:-translate-y-0.5`} />
            {/* The rule leaves to the right, then draws back in from the left. */}
            <span
              {...A}
              aria-hidden
              className={`absolute bottom-0 left-0 h-px w-full origin-right bg-current transition-transform duration-500 ${EASE} group-hover/cta:scale-x-0`}
            />
            <span
              {...A}
              aria-hidden
              className={`absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 delay-0 ${EASE} group-hover/cta:scale-x-100 group-hover/cta:delay-300`}
            />
          </>
        }
      />
    );
  }

  if (design === 'magnet') {
    // Magnetic pull + a flood that opens from wherever the pointer entered.
    const onEnter = (event: PointerEvent<HTMLAnchorElement>) => {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
    const onMove = (event: PointerEvent<HTMLAnchorElement>) => {
      if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      gsap.to(el, { x: dx * 0.22, y: dy * 0.32, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      const inner = el.querySelector<HTMLElement>('[data-b-label]');
      if (inner) gsap.to(inner, { x: dx * 0.1, y: dy * 0.16, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    };
    const onLeave = (event: PointerEvent<HTMLAnchorElement>) => {
      const el = event.currentTarget;
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      const inner = el.querySelector<HTMLElement>('[data-b-label]');
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    };
    return (
      <ServicesOrderButton
        data-index-text=""
        pricingStyle={pricingStyle}
        label={label}
        ink={base}
        surface={onBase}
        className="group/cta relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[0.95rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
        style={solid}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        autoContent={
          <>
            <span
              {...A}
              aria-hidden
              className={`absolute inset-0 [clip-path:circle(0%_at_var(--mx,50%)_var(--my,50%))] transition-[clip-path] duration-[700ms] ${EASE} group-hover/cta:[clip-path:circle(150%_at_var(--mx,50%)_var(--my,50%))]`}
              style={{ backgroundColor: onBase }}
            />
            <span
              {...A}
              data-b-label=""
              className={`relative flex items-center gap-3 transition-colors duration-500 ${EASE} group-hover/cta:text-[color:var(--b-bg)]`}
            >
              {label}
              <Arrow className={`h-4 w-4 transition-transform duration-500 ${EASE} group-hover/cta:rotate-45`} />
            </span>
          </>
        }
      />
    );
  }

  // classic: the outlined pill that inverts on hover (the design's original button).
  return (
    <ServicesOrderButton
      data-index-text=""
      pricingStyle={pricingStyle}
      label={label}
      ink={onPage}
      surface={inverse}
      className="group/cta mt-8 inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-[0.95rem] font-medium transition-[background-color,color] duration-500 hover:bg-[color:var(--il-ink)] hover:text-[color:var(--il-inv)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
      style={color ? ({ color: onPage, '--il-ink': onPage, '--il-inv': readableInk(onPage) } as CSSProperties) : undefined}
      autoContent={
        <>
          {label}
          <span data-pf-no-color-transition="" aria-hidden className="inline-block transition-transform duration-500 group-hover/cta:translate-x-0.5">
            &rarr;
          </span>
        </>
      }
    />
  );
}
