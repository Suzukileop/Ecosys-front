'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_INFO_PRESENTATION, type PortfolioInfoPresentationSettings } from '@/components/portfolio/portfolio-info-settings';
import {
  INFO_HEADER_MARGIN_BOTTOM_REM,
  infoHeaderPaletteTokenColor,
  type PortfolioInfoHeaderTitleSize,
  type PortfolioInfoHeaderTitleWeight,
} from '@/components/portfolio/portfolio-info-header-settings';

const DEFAULT_INDEX_TEXT = '02 /';
const DEFAULT_TITLE_TEXT = 'Expertise & Mindset';

const TITLE_SIZE: Record<PortfolioInfoHeaderTitleSize, string> = {
  sm: 'clamp(1.9rem, 4.4vw, 3.1rem)',
  md: 'clamp(2.3rem, 5.3vw, 3.85rem)',
  lg: 'clamp(2.75rem, 6.2vw, 4.6rem)',
  xl: 'clamp(3.2rem, 7.1vw, 5.4rem)',
};
const TITLE_WEIGHT: Record<PortfolioInfoHeaderTitleWeight, number> = {
  light: 400,
  regular: 500,
  semibold: 600,
  bold: 700,
};

const ALIGN_ITEMS: Record<'left' | 'center' | 'right', string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const ALIGN_TEXT: Record<'left' | 'center' | 'right', 'left' | 'center' | 'right'> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

/**
 * Chapter — an italic serif index tag (e.g. "02 /") flowing inline right
 * before the title, both on one baseline, underlined by a short accent
 * rule. Exact disposition of the "About me · trait" design's former
 * built-in masthead, promoted to a standalone, independently placeable
 * Header design. Entrance: index and title fade/scale in together, then
 * the rule sweeps in from the left; on scroll, the whole block recedes.
 */
export function InfoHeaderChapterHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioInfoPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_INFO_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const align = presentation.headerDesignAlignment ?? 'left';
  const indexText = (presentation.headerChapterIndexText || DEFAULT_INDEX_TEXT).trim();
  const titleText = (presentation.headerChapterTitleText || DEFAULT_TITLE_TEXT).trim();
  const indexColor = infoHeaderPaletteTokenColor(presentation.headerChapterIndexColor ?? 'principal');
  const titleColor = infoHeaderPaletteTokenColor(presentation.headerChapterTitleColor ?? 'texteFort');
  const titleFontSize = TITLE_SIZE[presentation.headerChapterTitleSize ?? 'md'];
  const titleFontWeight = TITLE_WEIGHT[presentation.headerChapterTitleWeight ?? 'regular'];

  const sectionRef = useRef<HTMLElement>(null);

  // ========== ANIMATION: Entry — index + title fade/scale in, then the rule sweeps ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const section = sectionRef.current;
    if (!section) return;

    let hasAnimated = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const indexEl = section.querySelector<HTMLElement>('[data-info-header-chapter-index]');
      const titleEl = section.querySelector<HTMLElement>('[data-info-header-chapter-title]');
      const ruleEl = section.querySelector<HTMLElement>('[data-info-header-chapter-rule]');

      if (indexEl) {
        timers.push(
          setTimeout(() => {
            indexEl.style.transition = 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
            indexEl.style.opacity = '1';
            indexEl.style.transform = 'translateY(0) scale(1)';
          }, 60)
        );
      }
      if (titleEl) {
        timers.push(
          setTimeout(() => {
            titleEl.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            titleEl.style.opacity = '1';
            titleEl.style.transform = 'translateY(0)';
          }, 160)
        );
      }
      if (ruleEl) {
        timers.push(
          setTimeout(() => {
            ruleEl.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            ruleEl.style.transform = 'scaleX(1)';
          }, 360)
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
  }, [animationEnabled, indexText, titleText]);

  // ========== ANIMATION: Scroll — whole block recedes ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top > viewportHeight || rect.bottom < 0) return;

      const triggerOffset = rect.top - viewportHeight * 0.32;
      const relativeScroll = Math.max(0, -triggerOffset);
      const fade = Math.max(0, 1 - relativeScroll / 320);
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

  const initialIndexStyle = animationEnabled
    ? { opacity: 0, transform: 'translateY(10px) scale(0.94)' }
    : { opacity: 1, transform: 'translateY(0) scale(1)' };
  const initialTitleStyle = animationEnabled
    ? { opacity: 0, transform: 'translateY(14px)' }
    : { opacity: 1, transform: 'translateY(0)' };
  const initialRuleStyle = animationEnabled ? { transform: 'scaleX(0)' } : { transform: 'scaleX(1)' };

  return (
    <header
      ref={sectionRef}
      className="flex w-full flex-col"
      style={{
        alignItems: ALIGN_ITEMS[align],
        marginBottom: `${INFO_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem`,
      }}
      data-info-header="chapter"
    >
      <h2
        className="m-0 flex flex-wrap items-baseline"
        style={{
          gap: '0.35em 0.45em',
          fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          fontStyle: 'italic',
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          textAlign: ALIGN_TEXT[align],
          fontSize: titleFontSize,
          fontWeight: titleFontWeight,
        }}
      >
        {indexText ? (
          <span
            data-info-header-chapter-index
            style={{ color: indexColor, ...initialIndexStyle }}
          >
            {indexText}
          </span>
        ) : null}
        <span data-info-header-chapter-title style={{ color: titleColor, ...initialTitleStyle }}>
          {titleText}
        </span>
      </h2>
      <div
        data-info-header-chapter-rule
        aria-hidden
        className="mt-3 h-1 w-14 origin-left sm:mt-4 sm:w-16"
        style={{ backgroundColor: indexColor, ...initialRuleStyle }}
      />
      {trailing ? <div className="mt-4">{trailing}</div> : null}
    </header>
  );
}
