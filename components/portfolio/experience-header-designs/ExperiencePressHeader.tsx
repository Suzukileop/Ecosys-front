'use client';

import { useRef, useEffect, useMemo } from 'react';
import { SERIF } from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_EXPERIENCE_MUTED_COLOR,
  DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
  DEFAULT_EXPERIENCE_PRESENTATION,
  DEFAULT_EXPERIENCE_TITLE_COLOR,
  DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
  ensureExperienceInkContrast,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
} from '@/components/portfolio/portfolio-experience-settings';

/**
 * Press/Masthead Header — Premium Editorial Typography
 * 
 * Awwwards-level refinements:
 * - Typographic tension: alternating light/bold weights within phrases
 * - Each sentence on its own line for visual rhythm
 * - Word-by-word staggered reveal animation
 * - Kinetic scroll: lines move at different speeds + fade
 * - NO generic separator line
 */
export function ExperiencePressHeader({
  presentation: presentationProp,
}: {
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'press',
  };

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLElement>(null);
  const linesContainerRef = useRef<HTMLDivElement>(null);

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const ink = ensureExperienceInkContrast(
    presentation.titleColor?.trim() || resolveExperienceTextColor(styles.title, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_TITLE_COLOR,
    DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
  );
  const muted = ensureExperienceInkContrast(
    presentation.subtitleColor?.trim() || resolveExperienceTextColor(styles.meta, colorMode),
    isDark,
    DEFAULT_EXPERIENCE_MUTED_COLOR,
    DEFAULT_EXPERIENCE_MUTED_COLOR_DARK
  );

  const headingEnabled = presentation.pressHeadingEnabled !== false;
  const headingText =
    presentation.pressHeadingText?.trim() || 'Roles taken. Skills sharpened. Impact delivered.';
  const introText = presentation.pressIntroText?.trim() || '';

  // Premium customization options
  const animationEnabled = presentation.pressHeaderAnimationEnabled !== false;
  const animationStyle = presentation.pressHeaderAnimationStyle ?? 'staggered';
  const headingWeightStyle = presentation.pressHeadingWeightStyle ?? 'alternating';
  const subtitleStyle = presentation.pressSubtitleStyle ?? 'micro';
  const headingAlignment = presentation.pressHeadingAlignment ?? 'left';
  const parallaxEnabled = presentation.pressScrollParallaxEnabled !== false;
  const parallaxIntensity = presentation.pressScrollParallaxIntensity ?? 'subtle';

  // Split heading into sentences for individual animation
  const sentences = useMemo(() => {
    // Split by period, keeping the period with each phrase
    return headingText
      .split(/(?<=\.)\s*/)
      .filter(s => s.trim())
      .map(s => s.trim());
  }, [headingText]);

  // Parse each sentence into styled words (noun = light, verb = bold)
  const styledSentences = useMemo(() => {
    return sentences.map(sentence => {
      const words = sentence.replace(/\.$/, '').split(/\s+/);
      // Pattern: First word light, second word bold + period
      // "ROLES" light → "TAKEN." bold
      return words.map((word, idx) => ({
        text: word,
        // Alternating: first word light, rest bold
        // Uniform: all bold
        isLight: headingWeightStyle === 'alternating' ? idx === 0 : false,
        hasPeriod: idx === words.length - 1, // Last word gets the period
      }));
    });
  }, [sentences, headingWeightStyle]);

  // ========== ANIMATION: Entry — Staggered Line Reveal (with IntersectionObserver) ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    // If animation is disabled, show everything immediately
    if (!animationEnabled || animationStyle === 'none') {
      const lines = section.querySelectorAll('[data-gsap-line]');
      const subtitle = section.querySelector('[data-gsap-subtitle]') as HTMLElement;
      
      lines.forEach((line) => {
        const words = line.querySelectorAll('[data-gsap-word]');
        words.forEach((word) => {
          (word as HTMLElement).style.opacity = '1';
          (word as HTMLElement).style.transform = 'translateY(0)';
        });
      });
      
      if (subtitle) {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }
      return;
    }

    let hasAnimated = false;

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const lines = section.querySelectorAll('[data-gsap-line]');
      const subtitle = section.querySelector('[data-gsap-subtitle]') as HTMLElement;

      const timers: ReturnType<typeof setTimeout>[] = [];
      let delay = 100;

      if (animationStyle === 'staggered') {
        // Reveal each line with stagger (word by word)
        lines.forEach((line, index) => {
          const words = line.querySelectorAll('[data-gsap-word]');
          
          // Animate each word within the line
          words.forEach((word, wordIndex) => {
            const t = setTimeout(() => {
              (word as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
              (word as HTMLElement).style.opacity = '1';
              (word as HTMLElement).style.transform = 'translateY(0)';
            }, delay + index * 180 + wordIndex * 80);
            timers.push(t);
          });
        });
      } else {
        // Simultaneous: all words appear at once
        lines.forEach((line, index) => {
          const words = line.querySelectorAll('[data-gsap-word]');
          const t = setTimeout(() => {
            words.forEach((word) => {
              (word as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
              (word as HTMLElement).style.opacity = '1';
              (word as HTMLElement).style.transform = 'translateY(0)';
            });
          }, delay + index * 100);
          timers.push(t);
        });
      }

      // Subtitle appears last
      if (subtitle) {
        const totalDelay = animationStyle === 'staggered' 
          ? delay + sentences.length * 180 + 200 
          : delay + sentences.length * 100 + 150;
        const t = setTimeout(() => {
          subtitle.style.transition = 'opacity 0.7s ease-out, transform 0.6s ease-out';
          subtitle.style.opacity = '1';
          subtitle.style.transform = 'translateY(0)';
        }, totalDelay);
        timers.push(t);
      }
    };

    // Use IntersectionObserver to trigger when section enters viewport
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

    return () => observer.disconnect();
  }, [sentences.length, animationEnabled, animationStyle]);

  // ========== ANIMATION: Scroll — Asymmetric Line Parallax ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip parallax if disabled
    if (!parallaxEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const lines = section.querySelectorAll('[data-gsap-line]');
    const subtitle = section.querySelector('[data-gsap-subtitle]') as HTMLElement;

    // Intensity multipliers
    const speedBase = parallaxIntensity === 'dramatic' ? 0.25 : 0.15;
    const speedIncrement = parallaxIntensity === 'dramatic' ? 0.12 : 0.08;
    const fadeMultiplier = parallaxIntensity === 'dramatic' ? 1.2 : 0.8;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how far the section has scrolled relative to viewport
      // When section top is at viewport bottom: progress = 0
      // When section top is at viewport top: progress = 1
      const sectionTopInView = viewportHeight - rect.top;
      const scrollRange = viewportHeight + rect.height;
      const scrollProgress = Math.max(0, Math.min(1, sectionTopInView / scrollRange));

      // Only apply parallax after section enters viewport
      if (rect.top > viewportHeight || rect.bottom < 0) {
        return; // Section not in view
      }

      // Calculate relative scroll from when section top hits viewport center
      const centerOffset = rect.top - viewportHeight * 0.5;
      const relativeScroll = Math.max(0, -centerOffset);

      // Each line moves at different speed (asymmetric parallax)
      lines.forEach((line, index) => {
        const speed = speedBase + index * speedIncrement;
        const parallax = relativeScroll * speed;
        
        // Fade starts when section is scrolled past center
        const fadeProgress = Math.max(0, (relativeScroll - 50) / 300);
        const fade = Math.max(0, 1 - fadeProgress * (fadeMultiplier + index * 0.2));
        
        (line as HTMLElement).style.transform = `translateY(${-parallax}px)`;
        (line as HTMLElement).style.opacity = String(fade);
      });

      // Subtitle fades faster
      if (subtitle) {
        const fadeProgress = Math.max(0, (relativeScroll - 30) / 200);
        const subtitleFade = Math.max(0, 1 - fadeProgress * (parallaxIntensity === 'dramatic' ? 2 : 1.5));
        subtitle.style.opacity = String(subtitleFade);
      }
    };

    // Throttled scroll
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

    // Setup smooth transitions
    lines.forEach((line) => {
      (line as HTMLElement).style.transition = 'transform 0.08s linear, opacity 0.12s linear';
      (line as HTMLElement).style.willChange = 'transform, opacity';
    });
    if (subtitle) {
      subtitle.style.transition = 'opacity 0.12s linear';
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      lines.forEach((line) => {
        (line as HTMLElement).style.willChange = '';
      });
    };
  }, [parallaxEnabled, parallaxIntensity]);

  // Compute alignment classes
  const alignmentClass = headingAlignment === 'center' ? 'text-center' : 'text-left';
  const containerAlignClass = headingAlignment === 'center' ? 'items-center' : 'items-start';

  // Compute subtitle styles based on subtitleStyle setting
  const subtitleClasses = (() => {
    switch (subtitleStyle) {
      case 'micro':
        return 'text-[0.95rem] uppercase tracking-[0.08em] leading-relaxed';
      case 'normal':
        return 'text-base tracking-normal leading-relaxed';
      case 'hidden':
      default:
        return '';
    }
  })();

  // Initial opacity for elements (depends on animation setting)
  const initialOpacity = animationEnabled && animationStyle !== 'none' ? 0 : 1;
  const initialTransform = animationEnabled && animationStyle !== 'none' ? 'translateY(100%)' : 'translateY(0)';
  const subtitleInitialTransform = animationEnabled && animationStyle !== 'none' ? 'translateY(20px)' : 'translateY(0)';

  return (
    <header 
      ref={sectionRef}
      className="w-full mb-14 sm:mb-20"
      data-experience-header="press"
    >
      {headingEnabled && headingText ? (
        <div ref={linesContainerRef} className={`space-y-1 sm:space-y-2 flex flex-col ${containerAlignClass}`}>
          {styledSentences.map((words, lineIndex) => (
            <div
              key={lineIndex}
              className="overflow-hidden" // Mask for reveal
              data-gsap-line={lineIndex}
            >
              <h2
                className={`text-[clamp(2.2rem,6vw,4.2rem)] uppercase leading-[1.08] tracking-[-0.02em] ${alignmentClass}`}
                style={{ color: ink }}
              >
                {words.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={`inline-block ${word.isLight ? 'font-light' : 'font-black'}`}
                    style={{
                      // INITIAL STATE (hidden if animation enabled)
                      opacity: initialOpacity,
                      transform: initialTransform,
                      marginRight: wordIndex < words.length - 1 ? '0.3em' : 0,
                    }}
                    data-gsap-word={wordIndex}
                  >
                    {word.text.toUpperCase()}
                    {word.hasPeriod && (
                      <span className="font-black">.</span>
                    )}
                  </span>
                ))}
              </h2>
            </div>
          ))}
        </div>
      ) : null}

      {introText && subtitleStyle !== 'hidden' ? (
        <p
          className={`max-w-2xl ${subtitleClasses} ${headingEnabled && headingText ? 'mt-8' : ''} ${headingAlignment === 'center' ? 'mx-auto text-center' : ''}`}
          style={{ 
            color: muted, 
            // INITIAL STATE (hidden if animation enabled)
            opacity: initialOpacity,
            transform: subtitleInitialTransform,
          }}
          data-gsap-subtitle
        >
          {introText}
        </p>
      ) : null}

      {/* ═══════════════════════════════════════════════════════════════
          NO SEPARATOR LINE — Removed for premium breathing space
          Negative space creates elegant transition to content below
      ═══════════════════════════════════════════════════════════════ */}
    </header>
  );
}
