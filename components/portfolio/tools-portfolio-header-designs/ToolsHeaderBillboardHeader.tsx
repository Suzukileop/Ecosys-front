'use client';

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { DEFAULT_TOOLS_PRESENTATION, type PortfolioToolsPresentationSettings } from '@/components/portfolio/portfolio-tools-settings';
import {
  TOOLS_HEADER_MARGIN_BOTTOM_REM,
  toolsHeaderPaletteTokenColor,
  type PortfolioToolsHeaderBillboardWordStyle,
} from '@/components/portfolio/portfolio-tools-header-settings';

const DEFAULT_BIG_WORD = 'TOOLS';
const DEFAULT_COUNT_TEXT = '{count} tools — daily workflow below';
const DEFAULT_TITLE_TEXT = 'Daily workflow';
const REFERENCE_PX = 100;

/**
 * Sizes `textRef`'s font so its rendered box exactly fills `containerRef`'s
 * width — on mount, on any container-width change, and once web fonts
 * finish loading. Measures the *same* element it then resizes, so
 * measurement and final render can never disagree.
 */
function useFitWidthTextSize(
  containerRef: RefObject<HTMLElement | null>,
  textRef: RefObject<HTMLElement | null>,
  text: string
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return undefined;

    const fit = () => {
      const targetWidth = container.getBoundingClientRect().width;
      if (targetWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX}px`;
      const measuredWidth = textEl.getBoundingClientRect().width;
      if (measuredWidth <= 0) return;

      textEl.style.fontSize = `${REFERENCE_PX * (targetWidth / measuredWidth)}px`;
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit();
      }).catch(() => {});
    }

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text]);
}

/** The full-bleed word — outline (stroke + glow), fill (solid + glow), or
 *  simple (solid, no glow at all — plain display), user's choice. */
function ToolsHeaderBillboardBigWord({
  text,
  tone,
  wordStyle,
}: {
  text: string;
  tone: string;
  wordStyle: PortfolioToolsHeaderBillboardWordStyle;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  useFitWidthTextSize(containerRef, textRef, text);

  const glow = `drop-shadow(0 0 36px color-mix(in srgb, ${tone} 24%, transparent))`;
  const textStyle: CSSProperties =
    wordStyle === 'simple'
      ? { color: tone, WebkitTextFillColor: tone }
      : wordStyle === 'fill'
        ? { color: tone, WebkitTextFillColor: tone, filter: glow }
        : {
            color: 'transparent',
            WebkitTextStroke: `1.75px color-mix(in srgb, ${tone} 28%, transparent)`,
            WebkitTextFillColor: 'transparent',
            filter: glow,
          };

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <span
        ref={textRef}
        aria-hidden
        className="inline-block whitespace-nowrap text-[13vw] font-black uppercase leading-none tracking-tight sm:text-[9vw]"
        style={textStyle}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/**
 * Billboard — exact disposition + motion copy of Portfolio/Work's Billboard
 * header (`WorkBillboardHeader`): full-bleed outline word, an editorial
 * title/count split row beneath it, dramatic entrance (scale + blur in on
 * the big word, staggered slide-ups after), asymmetric scroll parallax. Only
 * the displayed text differs.
 */
export function ToolsHeaderBillboardHeader({
  presentation: presentationProp,
  trailing,
  itemCount,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioToolsPresentationSettings;
  trailing?: ReactNode;
  itemCount?: number;
}) {
  const presentation = presentationProp ?? DEFAULT_TOOLS_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const bigWord = (presentation.headerBillboardBigWord || DEFAULT_BIG_WORD).trim();
  const countTemplate = presentation.headerBillboardCountText || DEFAULT_COUNT_TEXT;
  const countText = countTemplate.replace('{count}', String(itemCount ?? 0));
  const title = (presentation.headerBillboardTitleText || DEFAULT_TITLE_TEXT).trim();

  // Every element bound to one of our actual palette colors, chosen
  // independently — not a shared/random tone.
  const wordTone = toolsHeaderPaletteTokenColor(presentation.headerBillboardWordColor ?? 'principal');
  const titleTone = toolsHeaderPaletteTokenColor(presentation.headerBillboardTitleColor ?? 'principal');
  const metaTone = toolsHeaderPaletteTokenColor(presentation.headerBillboardMetaColor ?? 'secondaire');

  const sectionRef = useRef<HTMLDivElement>(null);

  // First word italic/light, rest bold — same split as the editorial secondary title.
  const renderSecondaryTitle = (() => {
    const firstSpaceIndex = title.indexOf(' ');
    if (firstSpaceIndex === -1) {
      return <span className="font-light italic">{title}</span>;
    }
    const firstWord = title.slice(0, firstSpaceIndex);
    const restOfText = title.slice(firstSpaceIndex + 1);
    return (
      <>
        <span className="font-light italic">{firstWord}</span> <span className="font-semibold">{restOfText}</span>
      </>
    );
  })();

  const getInitialBigTitleStyle = (): CSSProperties =>
    animationEnabled ? { opacity: 0, transform: 'scale(0.85)', filter: 'blur(12px)' } : { opacity: 1, transform: 'scale(1)', filter: 'none' };

  const getInitialSecondaryStyle = (): CSSProperties =>
    animationEnabled
      ? { color: titleTone, opacity: 0, transform: 'translateY(30px)' }
      : { color: titleTone, opacity: 1, transform: 'translateY(0)' };

  const getInitialMetaStyle = (): CSSProperties =>
    animationEnabled
      ? { color: metaTone, opacity: 0, transform: 'translateX(20px)' }
      : { color: metaTone, opacity: 1, transform: 'translateX(0)' };

  // ========== ANIMATION: Entry — dramatic billboard reveal ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const section = sectionRef.current;
    if (!section) return;

    let hasAnimated = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const bigTitle = section.querySelector('[data-tools-header-gsap-big-title]') as HTMLElement | null;
      const secondaryTitle = section.querySelector('[data-tools-header-gsap-secondary]') as HTMLElement | null;
      const metaEl = section.querySelector('[data-tools-header-gsap-meta]') as HTMLElement | null;

      if (bigTitle) {
        timers.push(
          setTimeout(() => {
            bigTitle.style.transition =
              'opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), filter 0.8s ease-out';
            bigTitle.style.opacity = '1';
            bigTitle.style.transform = 'scale(1)';
            bigTitle.style.filter = 'blur(0)';
          }, 100)
        );
      }
      if (secondaryTitle) {
        timers.push(
          setTimeout(() => {
            secondaryTitle.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            secondaryTitle.style.opacity = '1';
            secondaryTitle.style.transform = 'translateY(0)';
          }, 400)
        );
      }
      if (metaEl) {
        timers.push(
          setTimeout(() => {
            metaEl.style.transition = 'opacity 0.6s ease-out, transform 0.5s ease-out';
            metaEl.style.opacity = '1';
            metaEl.style.transform = 'translateX(0)';
          }, 600)
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
  }, [animationEnabled]);

  // ========== ANIMATION: Scroll — asymmetric parallax ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const bigTitle = section.querySelector('[data-tools-header-gsap-big-title]') as HTMLElement | null;
    const secondaryTitle = section.querySelector('[data-tools-header-gsap-secondary]') as HTMLElement | null;
    const metaEl = section.querySelector('[data-tools-header-gsap-meta]') as HTMLElement | null;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top > viewportHeight || rect.bottom < 0) return;

      // Trigger point sits a little above center (not dead center, not
      // near the very top) — the recede shouldn't start while the header
      // is still comfortably in view.
      const triggerOffset = rect.top - viewportHeight * 0.2;
      const relativeScroll = Math.max(0, -triggerOffset);

      if (bigTitle) {
        const parallax = relativeScroll * 0.05;
        const fade = Math.max(0, 1 - (relativeScroll - 150) / 400);
        bigTitle.style.transform = `scale(1) translateY(${-parallax}px)`;
        bigTitle.style.opacity = String(fade);
      }
      if (secondaryTitle) {
        const parallax = relativeScroll * 0.18;
        const fade = Math.max(0, 1 - (relativeScroll - 50) / 250);
        secondaryTitle.style.transform = `translateY(${-parallax}px)`;
        secondaryTitle.style.opacity = String(fade);
      }
      if (metaEl) {
        const slide = relativeScroll * 0.12;
        const fade = Math.max(0, 1 - (relativeScroll - 30) / 200);
        metaEl.style.transform = `translateX(${slide}px)`;
        metaEl.style.opacity = String(fade);
      }
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

    [bigTitle, secondaryTitle, metaEl].forEach((el) => {
      if (el) el.style.willChange = 'transform, opacity';
    });

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      [bigTitle, secondaryTitle, metaEl].forEach((el) => {
        if (el) el.style.willChange = '';
      });
    };
  }, [animationEnabled]);

  return (
    <div
      ref={sectionRef}
      className="w-full"
      style={{ marginBottom: `${TOOLS_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-tools-header="billboard"
    >
      <div style={getInitialBigTitleStyle()} data-tools-header-gsap-big-title>
        <ToolsHeaderBillboardBigWord text={bigWord} tone={wordTone} wordStyle={presentation.headerBillboardWordStyle ?? 'outline'} />
      </div>

      <div className="mt-8 flex flex-col gap-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <h2
          className="text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em]"
          style={getInitialSecondaryStyle()}
          data-tools-header-gsap-secondary
        >
          {renderSecondaryTitle}
        </h2>

        <div className="flex max-w-xs flex-col items-start gap-3 sm:items-end" style={getInitialMetaStyle()} data-tools-header-gsap-meta>
          {countText ? (
            <p className="mb-0 text-[0.72rem] font-medium uppercase leading-relaxed tracking-[0.1em] sm:text-right" style={{ color: metaTone }}>
              {countText}
            </p>
          ) : null}
          {trailing ? <div className="shrink-0">{trailing}</div> : null}
        </div>
      </div>
    </div>
  );
}
