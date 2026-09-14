'use client';

import { useRef, useEffect, useMemo } from 'react';
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
 * Loft design header — Premium Editorial "Split Heading"
 * 
 * Awwwards-level refinements:
 * - "Roles" in italic/light, rest in regular weight (editorial contrast)
 * - "EXPERIENCE" label: uppercase, letter-spaced, aligned with title TOP
 * - NO horizontal separator line (breathing space)
 * 
 * GSAP Animation:
 * - On Load: Title reveals from mask (overflow-hidden), label fades in from right
 * - Scroll: Title moves up, label slides RIGHT + fades out rapidly
 */
export function ExperienceLoftHeader({
  presentation: presentationProp,
}: {
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'loft',
  };

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

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

  const headingEnabled = presentation.loftHeadingEnabled !== false;
  const headingText = presentation.loftHeadingText?.trim() || "Roles I've taken on";
  const animationsEnabled = presentation.loftHeaderAnimationEnabled !== false;
  const italicWordSetting = presentation.loftHeadingItalicWord ?? 'first';
  const fontWeightSetting = presentation.loftHeadingFontWeight ?? 'light-to-bold';
  const labelText = presentation.loftLabelText?.trim() || 'Experience';
  const labelStyle = presentation.loftLabelStyle ?? 'uppercase';
  const labelPosition = presentation.loftLabelPosition ?? 'top-aligned';
  const scrollEffectEnabled = presentation.loftScrollEffectEnabled !== false;
  const scrollEffectStyle = presentation.loftScrollEffectStyle ?? 'slide-right';

  // Split heading for editorial styling based on settings
  const headingParts = useMemo(() => {
    const words = headingText.split(/\s+/);
    if (words.length === 0) return { italic: '', regular: '' };
    
    if (italicWordSetting === 'none') {
      return { italic: '', regular: headingText };
    } else if (italicWordSetting === 'last') {
      return {
        regular: words.slice(0, -1).join(' '),
        italic: words[words.length - 1],
      };
    } else {
      // 'first' (default)
      return {
        italic: words[0],
        regular: words.slice(1).join(' '),
      };
    }
  }, [headingText, italicWordSetting]);

  // Compute label text transform based on style setting
  const labelTextTransform = useMemo(() => {
    switch (labelStyle) {
      case 'lowercase': return 'lowercase' as const;
      case 'capitalize': return 'capitalize' as const;
      default: return 'uppercase' as const;
    }
  }, [labelStyle]);

  // ========== ANIMATION: On Load Entry Sequence ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!animationsEnabled) {
      // If animations disabled, set elements to visible immediately
      const title = titleRef.current;
      const label = labelRef.current;
      if (title) {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }
      if (label) {
        label.style.opacity = '1';
        label.style.transform = 'translateX(0)';
      }
      return;
    }

    const section = sectionRef.current;
    const title = titleRef.current;
    const label = labelRef.current;

    if (!section) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // 1. TITLE - Reveal from mask (translateY)
    if (title) {
      const t = setTimeout(() => {
        title.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 150);
      timers.push(t);
    }

    // 2. LABEL - Fade in with micro-translation from right
    if (label) {
      const t = setTimeout(() => {
        label.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        label.style.opacity = '1';
        label.style.transform = 'translateX(0)';
      }, 400);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, [animationsEnabled]);

  // ========== ANIMATION: Scroll - Kinetic Split Exit ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!scrollEffectEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    const title = titleRef.current;
    const label = labelRef.current;

    if (!section) return;

    let sectionTop = 0;
    let sectionHeight = 0;

    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
    };

    setTimeout(updateBounds, 500);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;

      // Only animate when scrolling past the section
      if (relativeScroll < 0) {
        // Reset
        if (label) {
          label.style.transform = 'translateX(0)';
          label.style.opacity = '1';
        }
        return;
      }

      // Calculate scroll progress (0 to 1)
      const scrollProgress = Math.min(1, relativeScroll / (sectionHeight * 2));

      // LABEL: Effect based on scrollEffectStyle setting
      if (label) {
        // Opacity: 1 → 0 very fast (fades out in first 30% of scroll)
        const labelFade = Math.max(0, 1 - scrollProgress * 3.5);
        
        if (scrollEffectStyle === 'slide-right') {
          // translateX: 0 → 80px as scroll progresses
          const labelSlide = scrollProgress * 80;
          label.style.transform = `translateX(${labelSlide}px)`;
        } else {
          // 'fade-only' - no translation, just fade
          label.style.transform = 'translateX(0)';
        }
        label.style.opacity = String(labelFade);
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

    // Setup transitions for scroll
    if (label) {
      label.style.willChange = 'transform, opacity';
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', updateBounds, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      if (label) {
        label.style.willChange = '';
      }
    };
  }, [scrollEffectEnabled, scrollEffectStyle]);

  // Determine font weights based on settings
  const italicWeight = fontWeightSetting === 'light-to-bold' ? 300 : 500;
  const regularWeight = fontWeightSetting === 'light-to-bold' ? 400 : 500;

  // Initial animation states depend on animationsEnabled
  const initialOpacity = animationsEnabled ? 0 : 1;
  const initialTitleTransform = animationsEnabled ? 'translateY(100%)' : 'translateY(0)';
  const initialLabelTransform = animationsEnabled ? 'translateX(20px)' : 'translateX(0)';

  return (
    <div 
      ref={sectionRef}
      className="mb-14 sm:mb-20"
      data-experience-header="loft"
    >
      {/* SPLIT LAYOUT: Title left, Label right — alignment based on settings */}
      <div 
        className="flex flex-wrap justify-between gap-x-8 gap-y-4"
        style={{ alignItems: labelPosition === 'center-aligned' ? 'center' : 'flex-start' }}
      >
        {/* LEFT: Main heading with editorial italic treatment */}
        {headingEnabled && headingText.trim() ? (
          <div 
            ref={titleWrapperRef}
            className="overflow-hidden" // Mask for reveal animation
          >
            <h2
              ref={titleRef}
              className="max-w-4xl text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.06] tracking-tight"
              style={{ 
                color: ink,
                // INITIAL STATE - depends on animationsEnabled
                opacity: initialOpacity,
                transform: initialTitleTransform,
              }}
            >
              {/* Render based on italicWordSetting */}
              {italicWordSetting === 'last' ? (
                // Regular first, italic last
                <>
                  {headingParts.regular && (
                    <span style={{ fontWeight: regularWeight }}>
                      {headingParts.regular}{' '}
                    </span>
                  )}
                  {headingParts.italic && (
                    <span 
                      style={{ 
                        fontStyle: 'italic',
                        fontWeight: italicWeight,
                      }}
                    >
                      {headingParts.italic}
                    </span>
                  )}
                </>
              ) : italicWordSetting === 'none' ? (
                // All regular, no italic
                <span style={{ fontWeight: regularWeight }}>
                  {headingParts.regular}
                </span>
              ) : (
                // 'first' (default): italic first, regular rest
                <>
                  {headingParts.italic && (
                    <span 
                      style={{ 
                        fontStyle: 'italic',
                        fontWeight: italicWeight,
                      }}
                    >
                      {headingParts.italic}
                    </span>
                  )}
                  {headingParts.regular && (
                    <>
                      {' '}
                      <span style={{ fontWeight: regularWeight }}>
                        {headingParts.regular}
                      </span>
                    </>
                  )}
                </>
              )}
            </h2>
          </div>
        ) : null}

        {/* RIGHT: Label — dynamic text, styling based on settings */}
        <span 
          ref={labelRef}
          className="whitespace-nowrap text-[0.7rem] font-medium"
          style={{ 
            color: muted,
            letterSpacing: '0.14em', // Wide spacing for premium feel
            textTransform: labelTextTransform,
            // INITIAL STATE - depends on animationsEnabled
            opacity: initialOpacity,
            transform: initialLabelTransform,
          }}
        >
          {labelText}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NO HORIZONTAL LINE — Removed for breathing space
          The void below creates elegant negative space transition
      ═══════════════════════════════════════════════════════════════ */}
    </div>
  );
}
