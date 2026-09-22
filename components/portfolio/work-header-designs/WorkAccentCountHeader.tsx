'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  workPaletteTokenColor,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkHeaderTitleWeight,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

const DEFAULT_BADGE_TEXT = '{count}+ projects';
const DEFAULT_LEAD_TEXT = 'A selection of recent work.';

const SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,3.2vw,2.8rem)]',
  md: 'text-[clamp(2.25rem,4.2vw,3.75rem)]',
  lg: 'text-[clamp(2.8rem,5.2vw,4.7rem)]',
  xl: 'text-[clamp(3.4rem,6.2vw,5.6rem)]',
};

/** The badge stays a fixed bold pill — "weight" governs the lead text next to it. */
const LEAD_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
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
 * Accent count — a badge (project count) inline with a lead sentence, one
 * flowing line. Badge and lead each have their own color; the line shares
 * one size, and "weight" governs the lead's boldness (the badge stays a
 * fixed bold pill). Same entrance/scroll motion as the other headers in
 * this set — badge scales in first, then the lead fades up; the whole line
 * recedes on scroll.
 */
export function WorkAccentCountHeader({
  presentation: presentationProp,
  trailing,
  projectCount,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioWorkPresentationSettings;
  trailing?: ReactNode;
  projectCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_WORK_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const align = presentation.accentCountAlignment ?? 'left';
  const lead = (presentation.accentCountLeadText || DEFAULT_LEAD_TEXT).trim();
  const badgeTemplate = presentation.accentCountBadgeText || DEFAULT_BADGE_TEXT;
  const badgeText = badgeTemplate.replace('{count}', String(projectCount ?? 0));
  const badgeColor = workPaletteTokenColor(presentation.accentCountBadgeColor ?? 'principal');
  const leadColor = workPaletteTokenColor(presentation.accentCountLeadColor ?? 'secondaire');

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

      const badge = section.querySelector<HTMLElement>('[data-work-badge]');
      const leadEl = section.querySelector<HTMLElement>('[data-work-lead]');

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
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-work-header="accent-count"
    >
      <p
        className={`mb-0 max-w-3xl ${SIZE_CLASS[presentation.accentCountSize ?? 'md']}`}
        style={{
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          ...ALIGN_MARGIN[align],
        }}
      >
        {badgeText ? (
          <span
            data-work-badge
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
            data-work-lead
            className={`inline ${LEAD_WEIGHT_CLASS[presentation.accentCountWeight ?? 'regular']}`}
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
