'use client';

import { useMemo, useEffect, useRef, type ReactNode } from 'react';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_HEADER_MARGIN_BOTTOM_REM,
  workPaletteTokenColor,
  type PortfolioWorkHeaderTitleSize,
  type PortfolioWorkHeaderTitleWeight,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';

// Three short, punchy default lines — that's what makes the mast stack
// dramatically. Each line is its own field now (not one string split on
// periods), so the count and wording are both directly editable.
const DEFAULT_LINE_1 = 'Selected work.';
const DEFAULT_LINE_2 = 'Crafted with intent.';
const DEFAULT_LINE_3 = 'Delivered with care.';

const HEADLINE_SIZE_CLASS: Record<PortfolioWorkHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,4.8vw,3.4rem)]',
  md: 'text-[clamp(2.2rem,6vw,4.2rem)]',
  lg: 'text-[clamp(2.7rem,7.2vw,5.1rem)]',
  xl: 'text-[clamp(3.2rem,8.4vw,6.1rem)]',
};

/** The light-first-word / black-rest contrast stays at every weight step —
 *  "weight" shifts both up together rather than flattening the contrast. */
const HEADLINE_WEIGHT: Record<PortfolioWorkHeaderTitleWeight, { light: number; heavy: number }> = {
  light: { light: 300, heavy: 700 },
  regular: { light: 300, heavy: 900 },
  semibold: { light: 400, heavy: 900 },
  bold: { light: 500, heavy: 900 },
};

/**
 * Masthead — exact disposition + motion copy of Experience's Press header
 * (`ExperiencePressHeader`): up to three independent lines stack into the
 * mast, each word revealed with a stagger (the first word of every line
 * light, the rest bold — no mask, just an opacity/translateY reveal). On
 * scroll, each line drifts and fades at its own speed (asymmetric
 * parallax). One color/size/weight for the whole headline, across every
 * line.
 */
export function WorkMastheadHeader({
  presentation: presentationProp,
  trailing,
}: {
  sectionTitle: string;
  sectionSubtitle?: string;
  presentation?: PortfolioWorkPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_WORK_PRESENTATION;
  const centered = presentation.headerAlignment === 'center';
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const ink = workPaletteTokenColor(presentation.mastheadHeadlineColor ?? 'principal');
  const headlineWeight = HEADLINE_WEIGHT[presentation.mastheadHeadlineWeight ?? 'regular'];

  const sectionRef = useRef<HTMLElement>(null);

  const lines = useMemo(
    () =>
      [
        presentation.mastheadLine1Text || DEFAULT_LINE_1,
        presentation.mastheadLine2Text || DEFAULT_LINE_2,
        presentation.mastheadLine3Text || DEFAULT_LINE_3,
      ]
        .map((line) => line.trim())
        .filter(Boolean),
    [presentation.mastheadLine1Text, presentation.mastheadLine2Text, presentation.mastheadLine3Text]
  );

  const styledLines = useMemo(
    () =>
      lines.map((line) => {
        const words = line.replace(/\.$/, '').split(/\s+/).filter(Boolean);
        return words.map((word, idx) => ({
          text: word,
          isLight: idx === 0,
          hasPeriod: idx === words.length - 1,
        }));
      }),
    [lines]
  );
  // A stable key that changes with the actual word structure, not just the
  // line count — editing a line (e.g. adding a space, splitting off a new
  // word) creates fresh `[data-work-word]` spans that the effects below
  // must re-bind to, or a newly-added word stays stuck at its hidden
  // "from" state forever (the old, already-fired-and-disconnected observer
  // never sees it).
  const linesKey = lines.join('\n');

  // ========== ANIMATION: Entry — staggered word reveal per line ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !animationEnabled) {
      section.querySelectorAll<HTMLElement>('[data-work-word]').forEach((word) => {
        word.style.opacity = '1';
        word.style.transform = 'translateY(0)';
      });
      return;
    }

    let hasAnimated = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const lineEls = section.querySelectorAll<HTMLElement>('[data-work-line]');
      const delay = 100;

      lineEls.forEach((line, index) => {
        const words = line.querySelectorAll<HTMLElement>('[data-work-word]');
        words.forEach((word, wordIndex) => {
          timers.push(
            setTimeout(() => {
              word.style.transition =
                'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
              word.style.opacity = '1';
              word.style.transform = 'translateY(0)';
            }, delay + index * 180 + wordIndex * 80)
          );
        });
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
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [linesKey, animationEnabled]);

  // ========== ANIMATION: Scroll — asymmetric per-line parallax ==========
  useEffect(() => {
    if (typeof window === 'undefined' || !animationEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const lineEls = section.querySelectorAll<HTMLElement>('[data-work-line]');
    const speedBase = 0.15;
    const speedIncrement = 0.08;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top > viewportHeight || rect.bottom < 0) return;

      // Trigger point sits a little above center (not dead center, not
      // near the very top) — the recede shouldn't start while the header
      // is still comfortably in view.
      const triggerOffset = rect.top - viewportHeight * 0.32;
      const relativeScroll = Math.max(0, -triggerOffset);

      lineEls.forEach((line, index) => {
        const speed = speedBase + index * speedIncrement;
        const parallax = relativeScroll * speed;
        const fadeProgress = Math.max(0, (relativeScroll - 50) / 300);
        const fade = Math.max(0, 1 - fadeProgress * (0.8 + index * 0.2));
        line.style.transform = `translateY(${-parallax}px)`;
        line.style.opacity = String(fade);
      });
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

    lineEls.forEach((line) => {
      line.style.transition = 'transform 0.08s linear, opacity 0.12s linear';
      line.style.willChange = 'transform, opacity';
    });

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      lineEls.forEach((line) => {
        line.style.willChange = '';
      });
    };
  }, [linesKey, animationEnabled]);

  const initialOpacity = animationEnabled ? 0 : 1;
  const initialTransform = animationEnabled ? 'translateY(100%)' : 'translateY(0)';

  return (
    <header
      ref={sectionRef}
      className="w-full"
      style={{ marginBottom: `${WORK_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-work-header="masthead"
    >
      {styledLines.length > 0 ? (
        <div className={`flex flex-col gap-1 sm:gap-2 ${centered ? 'items-center' : 'items-start'}`}>
          {styledLines.map((words, lineIndex) => (
            <div key={lineIndex} className="overflow-hidden" data-work-line>
              <h2
                className={`${HEADLINE_SIZE_CLASS[presentation.mastheadHeadlineSize ?? 'md']} uppercase leading-[1.08] tracking-[-0.02em] ${centered ? 'text-center' : 'text-left'}`}
                style={{ color: ink }}
              >
                {words.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className="inline-block"
                    style={{
                      opacity: initialOpacity,
                      transform: initialTransform,
                      marginRight: wordIndex < words.length - 1 ? '0.3em' : 0,
                      fontWeight: word.isLight ? headlineWeight.light : headlineWeight.heavy,
                    }}
                    data-work-word
                  >
                    {word.text.toUpperCase()}
                    {word.hasPeriod ? <span style={{ fontWeight: headlineWeight.heavy }}>.</span> : null}
                  </span>
                ))}
              </h2>
            </div>
          ))}
        </div>
      ) : null}

      {trailing ? <div className="mt-6">{trailing}</div> : null}
    </header>
  );
}
