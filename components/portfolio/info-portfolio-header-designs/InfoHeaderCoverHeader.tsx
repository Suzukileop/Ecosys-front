'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { DEFAULT_INFO_PRESENTATION, type PortfolioInfoPresentationSettings } from '@/components/portfolio/portfolio-info-settings';
import {
  INFO_HEADER_MARGIN_BOTTOM_REM,
  infoHeaderPaletteTokenColor,
  type PortfolioInfoHeaderTitleSize,
  type PortfolioInfoHeaderTitleWeight,
} from '@/components/portfolio/portfolio-info-header-settings';

// Three short lines — that's what makes the magazine-cover masthead stack
// dramatically. Each line is its own field (not one string split on
// periods), so the count and wording are both directly editable.
const DEFAULT_LINE_1 = 'Built To Ship';
const DEFAULT_LINE_2 = 'Designed To';
const DEFAULT_LINE_3 = 'Scale';

const HEADLINE_SIZE: Record<PortfolioInfoHeaderTitleSize, string> = {
  sm: 'clamp(2.75rem, 9vw, 5.5rem)',
  md: 'clamp(3.25rem, 10.5vw, 7rem)',
  lg: 'clamp(3.75rem, 12vw, 8.5rem)',
  xl: 'clamp(4.25rem, 13.5vw, 9.5rem)',
};
const HEADLINE_WEIGHT: Record<PortfolioInfoHeaderTitleWeight, number> = {
  light: 400,
  regular: 500,
  semibold: 600,
  bold: 700,
};

/**
 * Cover — a magazine-cover masthead: up to 3 centered italic serif lines,
 * each masked (clip-path + translateY) and revealed line-by-line on scroll
 * into view. Exact disposition of the "About · banner" design's former
 * built-in cover headline, promoted to a standalone, independently
 * placeable Header design — always centered, like the original. On scroll,
 * the whole block recedes.
 */
export function InfoHeaderCoverHeader({
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
  const lines = [
    presentation.headerCoverLine1Text || DEFAULT_LINE_1,
    presentation.headerCoverLine2Text || DEFAULT_LINE_2,
    presentation.headerCoverLine3Text || DEFAULT_LINE_3,
  ]
    .map((line) => line.trim())
    .filter(Boolean);
  const linesKey = lines.join('\n');

  const headlineColor = infoHeaderPaletteTokenColor(presentation.headerCoverHeadlineColor ?? 'texteFort');
  const headlineFontSize = HEADLINE_SIZE[presentation.headerCoverHeadlineSize ?? 'md'];
  const headlineFontWeight = HEADLINE_WEIGHT[presentation.headerCoverHeadlineWeight ?? 'regular'];

  const sectionRef = useRef<HTMLElement>(null);

  // ========== ANIMATION: Entry — each line masks/slides in, staggered ==========
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

      const lineEls = section.querySelectorAll<HTMLElement>('[data-info-header-cover-line]');
      lineEls.forEach((line, index) => {
        timers.push(
          setTimeout(() => {
            line.style.transition =
              'transform 0.98s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.98s cubic-bezier(0.16, 1, 0.3, 1)';
            line.style.transform = 'translateY(0%)';
            line.style.clipPath = 'inset(0% 0 0 0)';
          }, index * 120)
        );
      });
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
  }, [animationEnabled, linesKey]);

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

  const initialLineStyle: CSSProperties = animationEnabled
    ? { transform: 'translateY(108%)', clipPath: 'inset(100% 0 0 0)' }
    : { transform: 'translateY(0%)', clipPath: 'inset(0% 0 0 0)' };

  return (
    <header
      ref={sectionRef}
      className="w-full text-center"
      style={{ marginBottom: `${INFO_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-info-header="cover"
    >
      {lines.length > 0 ? (
        <h2
          className="mx-auto m-0 max-w-[20ch]"
          style={{
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontWeight: headlineFontWeight,
            fontSize: headlineFontSize,
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            textWrap: 'balance',
            color: headlineColor,
          }}
        >
          {lines.map((line, index) => (
            <span key={`${index}-${line}`} style={{ display: 'block', overflow: 'hidden', marginBottom: '-0.045em' }}>
              <span
                data-info-header-cover-line
                style={{
                  display: 'block',
                  padding: '0.08em 0 0.14em',
                  willChange: 'transform, clip-path',
                  backfaceVisibility: 'hidden',
                  ...initialLineStyle,
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </h2>
      ) : null}
      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </header>
  );
}
