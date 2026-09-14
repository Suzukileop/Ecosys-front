'use client';

import { useRef, useEffect, useMemo, type CSSProperties } from 'react';
import { GalleryFitWidthTitle } from '@/components/portfolio/portfolio-section-primitives';
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
 * Billboard/Gallery Experience Header — Premium Editorial Redesign
 * 
 * Awwwards-level refinements:
 * - Full-width title with dramatic reveal animation (scale + blur)
 * - Editorial secondary title: "Roles" italic light → "I've taken on" bold
 * - Micro-typography role count with letter-spacing
 * - NO border separator — breathing space
 * 
 * GSAP Animation:
 * - On Load: Big title scales up from 0.8 with blur → secondary title → count
 * - Scroll: Asymmetric parallax — big title moves slow, rest moves fast + fades
 * 
 * Customization Options:
 * - galleryHeaderAnimationEnabled: toggle all entry animations
 * - galleryHeaderAnimationStyle: 'dramatic' | 'subtle' | 'none'
 * - gallerySecondaryTitleStyle: 'editorial' (italic/bold) | 'uniform'
 * - gallerySecondaryTitleText: custom text
 * - galleryRoleCountStyle: 'micro' | 'normal' | 'hidden'
 * - galleryRoleCountText: custom text with {count} placeholder
 * - galleryScrollParallaxEnabled: toggle scroll parallax effect
 */
export function ExperienceGalleryHeader({
  years: _years,
  roleCount = 3,
  presentation: presentationProp,
}: {
  years?: number | null;
  roleCount?: number;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  void _years;

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLDivElement>(null);

  const presentation: PortfolioExperiencePresentationSettings = {
    ...(presentationProp ?? DEFAULT_EXPERIENCE_PRESENTATION),
    experienceDesign: 'gallery',
  };

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

  // Big title settings
  const bigTitleEnabled = presentation.galleryBigTitleEnabled !== false;
  const bigTitleText = presentation.galleryBigTitleText?.trim() || 'Experience';
  const bigTitleStyle = presentation.galleryBigTitleStyle ?? 'outline';
  const bigTitleColor = presentation.galleryBigTitleColor ?? 'current';
  const showBigTitle = bigTitleEnabled && Boolean(bigTitleText.trim());

  // Animation settings
  const animationEnabled = presentation.galleryHeaderAnimationEnabled !== false;
  const animationStyle = presentation.galleryHeaderAnimationStyle ?? 'dramatic';
  const parallaxEnabled = presentation.galleryScrollParallaxEnabled !== false;

  // Secondary title settings
  const secondaryTitleStyle = presentation.gallerySecondaryTitleStyle ?? 'editorial';
  const secondaryTitleText = presentation.gallerySecondaryTitleText?.trim() || "Roles I've taken on";

  // Role count settings
  const roleCountStyleOption = presentation.galleryRoleCountStyle ?? 'micro';
  const roleCountTextTemplate = presentation.galleryRoleCountText?.trim() || '{count} roles — click any card for the full story';

  const count = roleCount;

  // Format role count text with {count} placeholder
  const formattedRoleCountText = useMemo(() => {
    let text = roleCountTextTemplate.replace(/\{count\}/g, String(count));
    // Handle simple pluralization in template: {count === 1 ? "role" : "roles"}
    text = text.replace(/\{count\s*===?\s*1\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']\}/g, 
      (_match: string, singular: string, plural: string) => count === 1 ? singular : plural
    );
    return text;
  }, [roleCountTextTemplate, count]);

  // Compute initial styles based on animation settings
  const getInitialBigTitleStyle = (): CSSProperties => {
    if (!animationEnabled || animationStyle === 'none') {
      return { opacity: 1, transform: 'scale(1)', filter: 'none' };
    }
    if (animationStyle === 'subtle') {
      return { opacity: 0, transform: 'scale(1)', filter: 'none' };
    }
    // dramatic
    return { opacity: 0, transform: 'scale(0.85)', filter: 'blur(12px)' };
  };

  const getInitialSecondaryStyle = (): CSSProperties => {
    if (!animationEnabled || animationStyle === 'none') {
      return { color: ink, opacity: 1, transform: 'translateY(0)' };
    }
    if (animationStyle === 'subtle') {
      return { color: ink, opacity: 0, transform: 'translateY(0)' };
    }
    // dramatic
    return { color: ink, opacity: 0, transform: 'translateY(30px)' };
  };

  const getInitialRoleCountStyle = (): CSSProperties => {
    if (!animationEnabled || animationStyle === 'none') {
      return { color: muted, opacity: 1, transform: 'translateX(0)' };
    }
    if (animationStyle === 'subtle') {
      return { color: muted, opacity: 0, transform: 'translateX(0)' };
    }
    // dramatic
    return { color: muted, opacity: 0, transform: 'translateX(20px)' };
  };

  // ========== ANIMATION: Entry — Dramatic Billboard Reveal ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!animationEnabled || animationStyle === 'none') return;

    const section = sectionRef.current;
    if (!section) return;

    let hasAnimated = false;

    const triggerAnimation = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const bigTitle = section.querySelector('[data-gsap-big-title]') as HTMLElement;
      const secondaryTitle = section.querySelector('[data-gsap-secondary]') as HTMLElement;
      const roleCountEl = section.querySelector('[data-gsap-count]') as HTMLElement;

      const timers: ReturnType<typeof setTimeout>[] = [];

      // 1. BIG TITLE - Scale up with blur removal (dramatic) or simple fade (subtle)
      if (bigTitle) {
        const t = setTimeout(() => {
          if (animationStyle === 'dramatic') {
            bigTitle.style.transition = 'opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), filter 0.8s ease-out';
            bigTitle.style.opacity = '1';
            bigTitle.style.transform = 'scale(1)';
            bigTitle.style.filter = 'blur(0)';
          } else {
            // subtle
            bigTitle.style.transition = 'opacity 0.6s ease-out';
            bigTitle.style.opacity = '1';
          }
        }, 100);
        timers.push(t);
      }

      // 2. SECONDARY TITLE - Slides up (dramatic) or fades (subtle)
      if (secondaryTitle) {
        const t = setTimeout(() => {
          if (animationStyle === 'dramatic') {
            secondaryTitle.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            secondaryTitle.style.opacity = '1';
            secondaryTitle.style.transform = 'translateY(0)';
          } else {
            secondaryTitle.style.transition = 'opacity 0.5s ease-out';
            secondaryTitle.style.opacity = '1';
          }
        }, animationStyle === 'dramatic' ? 400 : 200);
        timers.push(t);
      }

      // 3. ROLE COUNT - Fades in from right (dramatic) or simple fade (subtle)
      if (roleCountEl) {
        const t = setTimeout(() => {
          if (animationStyle === 'dramatic') {
            roleCountEl.style.transition = 'opacity 0.6s ease-out, transform 0.5s ease-out';
            roleCountEl.style.opacity = '1';
            roleCountEl.style.transform = 'translateX(0)';
          } else {
            roleCountEl.style.transition = 'opacity 0.4s ease-out';
            roleCountEl.style.opacity = '1';
          }
        }, animationStyle === 'dramatic' ? 600 : 300);
        timers.push(t);
      }
    };

    // Use IntersectionObserver
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

    return () => observer.disconnect();
  }, [animationEnabled, animationStyle]);

  // ========== ANIMATION: Scroll — Asymmetric Parallax ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!parallaxEnabled) return;

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    if (!section) return;

    const bigTitle = section.querySelector('[data-gsap-big-title]') as HTMLElement;
    const secondaryTitle = section.querySelector('[data-gsap-secondary]') as HTMLElement;
    const roleCountEl = section.querySelector('[data-gsap-count]') as HTMLElement;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top > viewportHeight || rect.bottom < 0) return;

      const centerOffset = rect.top - viewportHeight * 0.5;
      const relativeScroll = Math.max(0, -centerOffset);

      // BIG TITLE: Moves SLOW (hero element, stays longest)
      if (bigTitle) {
        const parallax = relativeScroll * 0.05;
        const fade = Math.max(0, 1 - (relativeScroll - 150) / 400);
        bigTitle.style.transform = `scale(1) translateY(${-parallax}px)`;
        bigTitle.style.opacity = String(fade);
      }

      // SECONDARY TITLE: Moves faster
      if (secondaryTitle) {
        const parallax = relativeScroll * 0.18;
        const fade = Math.max(0, 1 - (relativeScroll - 50) / 250);
        secondaryTitle.style.transform = `translateY(${-parallax}px)`;
        secondaryTitle.style.opacity = String(fade);
      }

      // ROLE COUNT: Slides right + fades
      if (roleCountEl) {
        const slide = relativeScroll * 0.12;
        const fade = Math.max(0, 1 - (relativeScroll - 30) / 200);
        roleCountEl.style.transform = `translateX(${slide}px)`;
        roleCountEl.style.opacity = String(fade);
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

    // Setup
    [bigTitle, secondaryTitle, roleCountEl].forEach((el) => {
      if (el) {
        el.style.willChange = 'transform, opacity';
      }
    });

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      [bigTitle, secondaryTitle, roleCountEl].forEach((el) => {
        if (el) el.style.willChange = '';
      });
    };
  }, [parallaxEnabled]);

  // Parse secondary title for editorial style
  // If text contains a space, split into first word (italic) + rest (bold)
  const renderSecondaryTitle = () => {
    if (secondaryTitleStyle === 'uniform') {
      return <span className="font-semibold">{secondaryTitleText}</span>;
    }
    // Editorial style: first word italic light, rest semibold
    const firstSpaceIndex = secondaryTitleText.indexOf(' ');
    if (firstSpaceIndex === -1) {
      // No space, just render as italic
      return <span className="font-light italic">{secondaryTitleText}</span>;
    }
    const firstWord = secondaryTitleText.slice(0, firstSpaceIndex);
    const restOfText = secondaryTitleText.slice(firstSpaceIndex + 1);
    return (
      <>
        <span className="font-light italic">{firstWord}</span>
        {' '}
        <span className="font-semibold">{restOfText}</span>
      </>
    );
  };

  // Role count classes based on style
  const getRoleCountClasses = () => {
    if (roleCountStyleOption === 'micro') {
      return 'max-w-xs text-[0.72rem] font-medium uppercase leading-relaxed tracking-[0.1em] sm:text-right';
    }
    // normal style
    return 'max-w-xs text-sm font-normal leading-relaxed sm:text-right';
  };

  return (
    <div 
      ref={sectionRef}
      className="w-full mb-10 sm:mb-14"
      data-experience-header="gallery"
    >
      {/* BIG TITLE — Full-width with dramatic entrance */}
      {showBigTitle ? (
        <div
          style={getInitialBigTitleStyle()}
          data-gsap-big-title
        >
          <GalleryFitWidthTitle
            text={bigTitleText}
            ink={ink}
            accent={accent}
            isDark={isDark}
            titleStyle={bigTitleStyle}
            colorMode={bigTitleColor}
          />
        </div>
      ) : null}

      {/* SECONDARY HEADER — Editorial split layout */}
      <div
        className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10 ${
          showBigTitle ? 'mt-8 sm:mt-10' : ''
        }`}
      >
        {/* Title with typographic contrast */}
        <h2
          className="text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] tracking-[-0.02em]"
          style={getInitialSecondaryStyle()}
          data-gsap-secondary
        >
          {renderSecondaryTitle()}
        </h2>

        {/* Role count — conditionally rendered */}
        {roleCountStyleOption !== 'hidden' ? (
          <p 
            className={getRoleCountClasses()}
            style={getInitialRoleCountStyle()}
            data-gsap-count
          >
            {formattedRoleCountText}
          </p>
        ) : null}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NO BORDER SEPARATOR — Premium breathing space
          Negative space creates elegant visual hierarchy
      ═══════════════════════════════════════════════════════════════ */}
    </div>
  );
}
