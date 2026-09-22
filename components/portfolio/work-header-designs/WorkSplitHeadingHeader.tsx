'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  workPaletteTokenColor,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkHeaderTitleWeight,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

const DEFAULT_LABEL_TEXT = 'Portfolio';
const DEFAULT_TITLE_TEXT = 'Selected work';

const TITLE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-[clamp(2.1rem,6vw,4.2rem)]',
  md: 'text-[clamp(2.75rem,7.5vw,5.5rem)]',
  lg: 'text-[clamp(3.4rem,9vw,6.8rem)]',
  xl: 'text-[clamp(4.1rem,10.5vw,8.2rem)]',
};

const LABEL_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-[0.6rem]',
  md: 'text-[0.7rem]',
  lg: 'text-[0.82rem]',
  xl: 'text-[0.95rem]',
};

/** The italic-first-word / regular-rest contrast stays at every weight step —
 *  "weight" shifts both up together rather than flattening the contrast. */
const TITLE_WEIGHT: Record<PortfolioWorkHeaderTitleWeight, { italic: number; regular: number }> = {
  light: { italic: 300, regular: 400 },
  regular: { italic: 300, regular: 500 },
  semibold: { italic: 400, regular: 600 },
  bold: { italic: 500, regular: 800 },
};

const LABEL_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: 'font-normal',
  regular: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

/**
 * Split heading — exact disposition + motion copy of Experience's Loft
 * header (`ExperienceLoftHeader`): the title on the left (first word
 * italic/light, rest regular) masked-reveals from the bottom; a small
 * uppercase label sits top-aligned on the right and fades in from a slight
 * offset. No separator line. On scroll only the label reacts — it slides
 * right and fades out fast while the title stays put. Every element —
 * title, label — has its own text, color, size, and weight.
 */
export function WorkSplitHeadingHeader({
  presentation: presentationProp,
  trailing,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioWorkPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_WORK_PRESENTATION;
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const title = (presentation.splitHeadingTitleText || DEFAULT_TITLE_TEXT).trim();
  const label = (presentation.splitHeadingLabelText || DEFAULT_LABEL_TEXT).trim();
  const ink = workPaletteTokenColor(presentation.splitHeadingTitleColor ?? 'principal');
  const muted = workPaletteTokenColor(presentation.splitHeadingLabelColor ?? 'secondaire');
  const titleWeight = TITLE_WEIGHT[presentation.splitHeadingTitleWeight ?? 'regular'];

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const headingParts = useMemo(() => {
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length === 0) return { italic: '', regular: '' };
    return { italic: words[0], regular: words.slice(1).join(' ') };
  }, [title]);

  // ========== ANIMATION: Entry — title mask reveal, label fades from the right ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const labelEl = labelRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !animationEnabled) {
      if (titleEl) {
        titleEl.style.opacity = '1';
        titleEl.style.transform = 'translateY(0)';
      }
      if (labelEl) {
        labelEl.style.opacity = '1';
        labelEl.style.transform = 'translateX(0)';
      }
      return;
    }

    // Gated by IntersectionObserver, not fired on mount — a header mounted
    // below the fold must stay in its hidden "from" state (set immediately
    // via the inline styles below, no flash) until it actually scrolls into
    // view, not play-then-finish off-screen and show up already static.
    let hasAnimated = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      if (titleEl) {
        timers.push(
          setTimeout(() => {
            titleEl.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
            titleEl.style.opacity = '1';
            titleEl.style.transform = 'translateY(0)';
          }, 150)
        );
      }
      if (labelEl) {
        timers.push(
          setTimeout(() => {
            labelEl.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            labelEl.style.opacity = '1';
            labelEl.style.transform = 'translateX(0)';
          }, 400)
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
  }, [animationEnabled, title, label]);

  // ========== ANIMATION: Scroll — label slides right + fades fast ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    const labelEl = labelRef.current;
    if (!section || !labelEl) return;

    let sectionTop = 0;
    let sectionHeight = 0;
    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
    };
    const boundsTimer = setTimeout(updateBounds, 500);

    const handleScroll = () => {
      const relativeScroll = window.scrollY - sectionTop;
      if (relativeScroll < 0) {
        labelEl.style.transform = 'translateX(0)';
        labelEl.style.opacity = '1';
        return;
      }
      const scrollProgress = Math.min(1, relativeScroll / (sectionHeight * 2));
      const fade = Math.max(0, 1 - scrollProgress * 3.5);
      labelEl.style.transform = `translateX(${scrollProgress * 80}px)`;
      labelEl.style.opacity = String(fade);
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

    labelEl.style.willChange = 'transform, opacity';
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', updateBounds, { passive: true });

    return () => {
      clearTimeout(boundsTimer);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      labelEl.style.willChange = '';
    };
  }, [animationEnabled]);

  const initialOpacity = animationEnabled ? 0 : 1;
  const initialTitleTransform = animationEnabled ? 'translateY(100%)' : 'translateY(0)';
  const initialLabelTransform = animationEnabled ? 'translateX(20px)' : 'translateX(0)';

  return (
    <div
      ref={sectionRef}
      className="w-full"
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-work-header="split-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        {title ? (
          <div className="overflow-hidden">
            <h2
              ref={titleRef}
              className={`max-w-4xl ${TITLE_SIZE_CLASS[presentation.splitHeadingTitleSize ?? 'md']} leading-[1.06] tracking-tight`}
              style={{ color: ink, opacity: initialOpacity, transform: initialTitleTransform }}
            >
              {headingParts.italic ? (
                <span style={{ fontStyle: 'italic', fontWeight: titleWeight.italic }}>{headingParts.italic}</span>
              ) : null}
              {headingParts.regular ? (
                <>
                  {' '}
                  <span style={{ fontWeight: titleWeight.regular }}>{headingParts.regular}</span>
                </>
              ) : null}
            </h2>
          </div>
        ) : null}

        <span
          ref={labelRef}
          className={`whitespace-nowrap uppercase ${LABEL_SIZE_CLASS[presentation.splitHeadingLabelSize ?? 'md']} ${LABEL_WEIGHT_CLASS[presentation.splitHeadingLabelWeight ?? 'regular']}`}
          style={{
            color: muted,
            letterSpacing: '0.14em',
            opacity: initialOpacity,
            transform: initialLabelTransform,
          }}
        >
          {label}
        </span>
      </div>

      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </div>
  );
}
