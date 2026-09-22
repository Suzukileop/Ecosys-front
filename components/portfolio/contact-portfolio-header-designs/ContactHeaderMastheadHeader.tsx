'use client';

import { useMemo, useEffect, useRef, type ReactNode } from 'react';
import { DEFAULT_CONTACT_PRESENTATION, type PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  CONTACT_HEADER_MARGIN_BOTTOM_REM,
  contactHeaderPaletteTokenColor,
  type PortfolioContactHeaderTitleSize,
  type PortfolioContactHeaderTitleWeight,
} from '@/components/portfolio/portfolio-contact-header-settings';

// Three short, punchy default lines — that's what makes the mast stack
// dramatically. Each line is its own field (not one string split on
// periods), so the count and wording are both directly editable.
const DEFAULT_LINE_1 = 'Say hello.';
const DEFAULT_LINE_2 = "Let's build something.";
const DEFAULT_LINE_3 = 'Always open to new work.';

const HEADLINE_SIZE_CLASS: Record<PortfolioContactHeaderTitleSize, string> = {
  sm: 'text-[clamp(1.7rem,4.8vw,3.4rem)]',
  md: 'text-[clamp(2.2rem,6vw,4.2rem)]',
  lg: 'text-[clamp(2.7rem,7.2vw,5.1rem)]',
  xl: 'text-[clamp(3.2rem,8.4vw,6.1rem)]',
};

/** The light-first-word / black-rest contrast stays at every weight step —
 *  "weight" shifts both up together rather than flattening the contrast. */
const HEADLINE_WEIGHT: Record<PortfolioContactHeaderTitleWeight, { light: number; heavy: number }> = {
  light: { light: 300, heavy: 700 },
  regular: { light: 300, heavy: 900 },
  semibold: { light: 400, heavy: 900 },
  bold: { light: 500, heavy: 900 },
};

/**
 * Masthead — exact disposition + motion copy of Portfolio/Work's Masthead
 * header (`WorkMastheadHeader`): up to three independent lines stack into the
 * mast, each word revealed with a stagger (the first word of every line
 * light, the rest bold — no mask, just an opacity/translateY reveal). On
 * scroll, each line drifts and fades at its own speed (asymmetric
 * parallax). One color/size/weight for the whole headline, across every
 * line.
 */
export function ContactHeaderMastheadHeader({
  presentation: presentationProp,
  trailing,
}: {
  title: string;
  subtitle?: string;
  presentation?: PortfolioContactPresentationSettings;
  trailing?: ReactNode;
}) {
  const presentation = presentationProp ?? DEFAULT_CONTACT_PRESENTATION;
  const centered = presentation.headerDesignAlignment === 'center';
  const animationEnabled = presentation.headerAnimationEnabled !== false;
  const ink = contactHeaderPaletteTokenColor(presentation.headerMastheadHeadlineColor ?? 'principal');
  const headlineWeight = HEADLINE_WEIGHT[presentation.headerMastheadHeadlineWeight ?? 'regular'];

  const sectionRef = useRef<HTMLElement>(null);

  const lines = useMemo(
    () =>
      [
        presentation.headerMastheadLine1Text || DEFAULT_LINE_1,
        presentation.headerMastheadLine2Text || DEFAULT_LINE_2,
        presentation.headerMastheadLine3Text || DEFAULT_LINE_3,
      ]
        .map((line) => line.trim())
        .filter(Boolean),
    [presentation.headerMastheadLine1Text, presentation.headerMastheadLine2Text, presentation.headerMastheadLine3Text]
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
  // word) creates fresh `[data-contact-header-word]` spans that the effects
  // below must re-bind to, or a newly-added word stays stuck at its hidden
  // "from" state forever (the old, already-fired-and-disconnected observer
  // never sees it).
  const linesKey = lines.join('\n');

  // ========== ANIMATION: Entry — staggered word reveal per line ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !animationEnabled) {
      section.querySelectorAll<HTMLElement>('[data-contact-header-word]').forEach((word) => {
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

      const lineEls = section.querySelectorAll<HTMLElement>('[data-contact-header-line]');
      const delay = 100;

      lineEls.forEach((line, index) => {
        const words = line.querySelectorAll<HTMLElement>('[data-contact-header-word]');
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

    const lineEls = section.querySelectorAll<HTMLElement>('[data-contact-header-line]');
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
      style={{ marginBottom: `${CONTACT_HEADER_MARGIN_BOTTOM_REM[presentation.headerMarginBottom ?? 'md']}rem` }}
      data-contact-header="masthead"
    >
      {styledLines.length > 0 ? (
        <div className={`flex flex-col gap-1 sm:gap-2 ${centered ? 'items-center' : 'items-start'}`}>
          {styledLines.map((words, lineIndex) => (
            <div key={lineIndex} className="overflow-hidden" data-contact-header-line>
              <h2
                className={`${HEADLINE_SIZE_CLASS[presentation.headerMastheadHeadlineSize ?? 'md']} uppercase leading-[1.08] tracking-[-0.02em] ${centered ? 'text-center' : 'text-left'}`}
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
                    data-contact-header-word
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
