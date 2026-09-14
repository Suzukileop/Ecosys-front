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
  experienceAccentColor,
  normalizeExperienceElementStyles,
  resolveExperienceColorMode,
  resolveExperienceTextColor,
} from '@/components/portfolio/portfolio-experience-settings';

/**
 * Legacy/Accent Title Header — Premium Editorial Redesign
 * 
 * Awwwards-level refinements:
 * - Typographic tension: configurable weight prefix → styled accent word
 * - Accent word gets special treatment: configurable size, style, with optional decorative underline
 * - Asymmetric visual weight distribution
 * - Subtitle: configurable typography (micro/serif/normal)
 * 
 * GSAP Animation (configurable):
 * - On Load: Prefix fades in → Accent word with bloom/slide/none effect
 * - Scroll: Asymmetric parallax with accent word moving slower (optional)
 */
export function ExperienceLegacyHeader({
  presentation: presentationProp,
}: {
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'legacy',
  };

  if (presentation.legacyHeadingEnabled === false) return null;

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLDivElement>(null);

  const isDark = presentation.activeColorMode !== 'light';
  const colorMode = resolveExperienceColorMode(presentation);
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
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

  const headingText = presentation.legacyHeadingText?.trim() || 'A Career Built on';
  const headingAccentText = presentation.legacyHeadingAccentText?.trim() || 'Craft';
  const introText =
    presentation.legacyIntroText?.trim() ||
    'A selection of roles, teams, and problems solved along the way.';

  // ========== NEW OPTIONS ==========
  const animationEnabled = presentation.legacyHeaderAnimationEnabled !== false;
  const animationStyle = presentation.legacyHeaderAnimationStyle ?? 'bloom';
  const scrollParallaxEnabled = presentation.legacyScrollParallaxEnabled !== false;
  const prefixWeight = presentation.legacyPrefixWeight ?? 'light';
  const accentStyle = presentation.legacyAccentStyle ?? 'italic-bold';
  const accentSize = presentation.legacyAccentSize ?? 'dramatic';
  const showUnderline = presentation.legacyAccentUnderline !== false;
  const underlineStyle = presentation.legacyAccentUnderlineStyle ?? 'solid';
  const subtitleStyle = presentation.legacySubtitleStyle ?? 'micro';

  // ========== COMPUTED STYLES ==========
  const prefixWeightClass = useMemo(() => {
    switch (prefixWeight) {
      case 'bold': return 'font-bold';
      case 'normal': return 'font-normal';
      case 'light':
      default: return 'font-light';
    }
  }, [prefixWeight]);

  const accentStyleClass = useMemo(() => {
    switch (accentStyle) {
      case 'bold': return 'font-black';
      case 'italic': return 'italic font-semibold';
      case 'italic-bold':
      default: return 'font-black italic';
    }
  }, [accentStyle]);

  const accentSizeClass = useMemo(() => {
    switch (accentSize) {
      case 'same': return 'text-[clamp(1.8rem,4.5vw,3rem)]';
      case 'subtle': return 'text-[clamp(2.5rem,6vw,4.5rem)]';
      case 'dramatic':
      default: return 'text-[clamp(3.5rem,9vw,7rem)]';
    }
  }, [accentSize]);

  const subtitleClassName = useMemo(() => {
    switch (subtitleStyle) {
      case 'serif': return 'font-serif text-base italic leading-relaxed tracking-normal';
      case 'normal': return 'text-sm font-normal leading-relaxed tracking-normal';
      case 'micro':
      default: return 'text-[0.8rem] font-medium uppercase leading-relaxed tracking-[0.12em]';
    }
  }, [subtitleStyle]);

  const underlineBackground = useMemo(() => {
    if (underlineStyle === 'gradient') {
      return `linear-gradient(90deg, ${accent} 0%, transparent 100%)`;
    }
    return accent;
  }, [underlineStyle, accent]);

  // Initial hidden states for animation
  const getInitialPrefixStyle = useMemo(() => {
    if (!animationEnabled) {
      return { color: ink, opacity: 1, transform: 'translateY(0)' };
    }
    return { color: ink, opacity: 0, transform: 'translateY(30px)' };
  }, [animationEnabled, ink]);

  const getInitialAccentStyle = useMemo(() => {
    if (!animationEnabled) {
      return { color: accent, opacity: 1, transform: 'scale(1) translateY(0)' };
    }
    switch (animationStyle) {
      case 'slide':
        return { color: accent, opacity: 0, transform: 'translateY(50px)' };
      case 'none':
        return { color: accent, opacity: 1, transform: 'scale(1) translateY(0)' };
      case 'bloom':
      default:
        return { color: accent, opacity: 0, transform: 'scale(0.85) translateY(40px)' };
    }
  }, [animationEnabled, animationStyle, accent]);

  const getInitialUnderlineStyle = useMemo(() => {
    const base = underlineStyle === 'gradient'
      ? { background: underlineBackground }
      : { backgroundColor: accent };
    
    if (!animationEnabled || animationStyle === 'none') {
      return { ...base, transform: 'scaleX(1)' };
    }
    return { ...base, transform: 'scaleX(0)' };
  }, [animationEnabled, animationStyle, underlineStyle, underlineBackground, accent]);

  const getInitialSubtitleStyle = useMemo(() => {
    if (!animationEnabled) {
      return { color: muted, opacity: 1, transform: 'translateY(0)' };
    }
    return { color: muted, opacity: 0, transform: 'translateY(15px)' };
  }, [animationEnabled, muted]);

  // ========== ANIMATION: Entry — Staggered Reveal with configurable Accent effect ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!animationEnabled || animationStyle === 'none') return;

    const section = sectionRef.current;
    if (!section) return;

    let hasAnimated = false;

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const prefix = section.querySelector('[data-gsap-prefix]') as HTMLElement;
      const accentWord = section.querySelector('[data-gsap-accent]') as HTMLElement;
      const accentLine = section.querySelector('[data-gsap-accent-line]') as HTMLElement;
      const subtitle = section.querySelector('[data-gsap-subtitle]') as HTMLElement;

      const timers: ReturnType<typeof setTimeout>[] = [];

      // 1. PREFIX - Fade in from below
      if (prefix) {
        const t = setTimeout(() => {
          prefix.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
          prefix.style.opacity = '1';
          prefix.style.transform = 'translateY(0)';
        }, 150);
        timers.push(t);
      }

      // 2. ACCENT WORD - Style-dependent entrance
      if (accentWord) {
        const t = setTimeout(() => {
          if (animationStyle === 'slide') {
            accentWord.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            accentWord.style.opacity = '1';
            accentWord.style.transform = 'translateY(0)';
          } else {
            // bloom effect
            accentWord.style.transition = 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
            accentWord.style.opacity = '1';
            accentWord.style.transform = 'scale(1) translateY(0)';
          }
        }, 350);
        timers.push(t);
      }

      // 3. ACCENT UNDERLINE - Draws in from left
      if (accentLine && showUnderline) {
        const t = setTimeout(() => {
          accentLine.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
          accentLine.style.transform = 'scaleX(1)';
        }, 550);
        timers.push(t);
      }

      // 4. SUBTITLE - Fade in
      if (subtitle) {
        const t = setTimeout(() => {
          subtitle.style.transition = 'opacity 0.6s ease-out, transform 0.5s ease-out';
          subtitle.style.opacity = '1';
          subtitle.style.transform = 'translateY(0)';
        }, 650);
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
      { threshold: 0.2, rootMargin: '50px' }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [animationEnabled, animationStyle, showUnderline]);

  // ========== ANIMATION: Scroll — Asymmetric Parallax (optional) ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!scrollParallaxEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const prefix = section.querySelector('[data-gsap-prefix]') as HTMLElement;
    const accentWord = section.querySelector('[data-gsap-accent]') as HTMLElement;
    const subtitle = section.querySelector('[data-gsap-subtitle]') as HTMLElement;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only apply when section is in view
      if (rect.top > viewportHeight || rect.bottom < 0) return;

      // Calculate relative scroll from center
      const centerOffset = rect.top - viewportHeight * 0.5;
      const relativeScroll = Math.max(0, -centerOffset);

      // PREFIX: Moves faster (leaves first)
      if (prefix) {
        const parallax = relativeScroll * 0.2;
        const fade = Math.max(0, 1 - (relativeScroll - 50) / 250);
        prefix.style.transform = `translateY(${-parallax}px)`;
        prefix.style.opacity = String(fade);
      }

      // ACCENT WORD: Moves slower (stays longer - hero element)
      if (accentWord) {
        const parallax = relativeScroll * 0.08;
        const fade = Math.max(0, 1 - (relativeScroll - 100) / 350);
        accentWord.style.transform = `scale(1) translateY(${-parallax}px)`;
        accentWord.style.opacity = String(fade);
      }

      // SUBTITLE: Fades fast
      if (subtitle) {
        const fade = Math.max(0, 1 - relativeScroll / 200);
        subtitle.style.opacity = String(fade);
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

    // Setup
    [prefix, accentWord, subtitle].forEach((el) => {
      if (el) {
        el.style.transition = 'transform 0.1s linear, opacity 0.12s linear';
        el.style.willChange = 'transform, opacity';
      }
    });

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      [prefix, accentWord, subtitle].forEach((el) => {
        if (el) el.style.willChange = '';
      });
    };
  }, [scrollParallaxEnabled]);

  return (
    <div 
      ref={sectionRef}
      className="text-center mb-14 sm:mb-20"
      data-experience-header="legacy"
    >
      <h2 className="mx-auto max-w-4xl">
        {/* PREFIX: Configurable weight for typographic contrast */}
        <span
          className={`block text-[clamp(1.8rem,4.5vw,3rem)] ${prefixWeightClass} leading-[1.15] tracking-tight`}
          style={getInitialPrefixStyle}
          data-gsap-prefix
        >
          {headingText}
        </span>

        {/* ACCENT WORD: Hero element — configurable size, style, with optional decorative line */}
        {headingAccentText ? (
          <span className="relative inline-block mt-2">
            <span
              className={`block ${accentSizeClass} ${accentStyleClass} leading-[0.95] tracking-[-0.03em]`}
              style={getInitialAccentStyle}
              data-gsap-accent
            >
              {headingAccentText}
            </span>
            {/* Decorative underline (optional, with style) */}
            {showUnderline ? (
              <span
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left"
                style={getInitialUnderlineStyle}
                data-gsap-accent-line
                aria-hidden
              />
            ) : null}
          </span>
        ) : null}
      </h2>

      {/* SUBTITLE: Configurable typography style */}
      {introText ? (
        <p 
          className={`mx-auto mt-8 max-w-xl ${subtitleClassName}`}
          style={getInitialSubtitleStyle}
          data-gsap-subtitle
        >
          {introText}
        </p>
      ) : null}
    </div>
  );
}
