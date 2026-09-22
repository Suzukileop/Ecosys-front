'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_SERVICES_PRESENTATION, type PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import {
  SERVICES_HEADER_MARGIN_BOTTOM_REM,
  servicesHeaderPaletteTokenColor,
  type PortfolioServicesHeaderTitleSize,
  type PortfolioServicesHeaderTitleWeight,
} from '@/components/portfolio/portfolio-services-header-settings';

const DEFAULT_BADGE_TEXT = '{count}+ services';
const DEFAULT_LEAD_TEXT = 'A focused set of services, built around what you need.';

const SIZE_CLASS: Record<PortfolioServicesHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,3.2vw,2.8rem)]',
  md: 'text-[clamp(2.25rem,4.2vw,3.75rem)]',
  lg: 'text-[clamp(2.8rem,5.2vw,4.7rem)]',
  xl: 'text-[clamp(3.4rem,6.2vw,5.6rem)]',
};

/** The badge stays a fixed bold pill — "weight" governs the lead text next to it. */
const LEAD_WEIGHT_CLASS: Record<PortfolioServicesHeaderTitleWeight, string> = {
  light: 'font-normal',
  regular: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const ALIGN_CLASS: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const ALIGN_MARGIN: Record<'left' | 'center' | 'right', { marginInlineStart: string; marginInlineEnd: string }> = {
  left: { marginInlineStart: '0', marginInlineEnd: 'auto' },
  center: { marginInlineStart: 'auto', marginInlineEnd: 'auto' },
  right: { marginInlineStart: 'auto', marginInlineEnd: '0' },
};

/**
 * Accent count — a badge (item count) inline with a lead sentence, one
 * flowing line. Badge and lead each have their own color; the line shares
 * one size, and "weight" governs the lead's boldness (the badge stays a
 * fixed bold pill). Same entrance/scroll motion as the other headers in
 * this set — badge scales in first, then the lead fades up; the whole line
 * recedes on scroll.
 */
export function ServicesHeaderAccentCountHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioServicesPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_SERVICES_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const align = presentation.headerAccentCountAlignment ?? 'left';
  const lead = (presentation.headerAccentCountLeadText || DEFAULT_LEAD_TEXT).trim();
  const badgeTemplate = presentation.headerAccentCountBadgeText || DEFAULT_BADGE_TEXT;
  const badgeText = badgeTemplate.replace('{count}', String(itemCount ?? 0));
  const badgeColor = servicesHeaderPaletteTokenColor(presentation.headerAccentCountBadgeColor ?? 'principal');
  const leadColor = servicesHeaderPaletteTokenColor(presentation.headerAccentCountLeadColor ?? 'secondaire');

  const sectionRef = useRef<HTMLDivElement>(null);

  const getInitialBadgeStyle = () =>
    animationEnabled ? { opacity: 0, transform: 'scale(0.7)' } : { opacity: 1, transform: 'scale(1)' };
  const getInitialLeadStyle = () =>
    animationEnabled ? { opacity: 0, transform: 'translateY(10px)' } : { opacity: 1, transform: 'translateY(0)' };

  // ========== ANIMATION: Entry — badge scales in, then the lead fades up ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const section = sectionRef.current;
    if (!section) return;

    let hasAnimated = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const badge = section.querySelector<HTMLElement>('[data-services-header-badge]');
      const leadEl = section.querySelector<HTMLElement>('[data-services-header-lead]');

      if (badge) {
        timers.push(
          setTimeout(() => {
            badge.style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            badge.style.opacity = '1';
            badge.style.transform = 'scale(1)';
          }, 80)
        );
      }
      if (leadEl) {
        timers.push(
          setTimeout(() => {
            leadEl.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            leadEl.style.opacity = '1';
            leadEl.style.transform = 'translateY(0)';
          }, 260)
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '50px' }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [animationEnabled, badgeText, lead]);

  // ========== ANIMATION: Scroll — whole line recedes ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top > viewportHeight || rect.bottom < 0) return;

      // Trigger point sits a little above center — the recede shouldn't
      // start while the header is still comfortably in view.
      const triggerOffset = rect.top - viewportHeight * 0.32;
      const relativeScroll = Math.max(0, -triggerOffset);
      const fade = Math.max(0, 1 - relativeScroll / 300);
      section.style.opacity = String(fade);
      section.style.transform = `translateY(${-relativeScroll * 0.08}px)`;
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    section.style.transition = 'transform 0.08s linear, opacity 0.12s linear';
    section.style.willChange = 'transform, opacity';

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      section.style.willChange = '';
    };
  }, [animationEnabled]);

  return (
    <div
      ref={sectionRef}
      className={`w-full ${ALIGN_CLASS[align]}`}
      style={{ marginBottom: `${SERVICES_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-services-header="accent-count"
    >
      <p
        className={`mb-0 max-w-3xl ${SIZE_CLASS[presentation.headerAccentCountSize ?? 'md']}`}
        style={{
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          ...ALIGN_MARGIN[align],
        }}
      >
        {badgeText ? (
          <span
            data-services-header-badge
            className="inline-block whitespace-nowrap align-baseline font-bold text-white"
            style={{
              padding: '0.1em 0.5em',
              borderRadius: '20px',
              backgroundColor: badgeColor,
              lineHeight: 'inherit',
              ...getInitialBadgeStyle(),
            }}
          >
            {badgeText}
          </span>
        ) : null}
        {lead ? (
          <span
            data-services-header-lead
            className={`inline ${LEAD_WEIGHT_CLASS[presentation.headerAccentCountWeight ?? 'regular']}`}
            style={{ color: leadColor, ...getInitialLeadStyle() }}
          >
            {badgeText ? ' ' : null}
            {lead}
          </span>
        ) : null}
      </p>
      {trailing ? <div className="mt-4 shrink-0">{trailing}</div> : null}
    </div>
  );
}
