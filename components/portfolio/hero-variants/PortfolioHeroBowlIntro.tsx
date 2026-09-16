'use client';

import Image from 'next/image';
import { useMemo, useRef, useEffect, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const FALLBACK_BIO =
  'Ingénieur informatique passionné par les solutions innovantes et les expériences numériques claires.';

/** Soft green for the availability pill */
const AVAILABLE_PILL_BG = '#E8F6EC';
const AVAILABLE_PILL_FG = '#1F7A3A';
const UNAVAILABLE_PILL_BG = '#F3F3F3';
const UNAVAILABLE_PILL_FG = '#6B6B6B';

/**
 * Bowl intro — Clean Floating Design (Refactored per Google/Awwwards critique)
 * 
 * Key changes:
 * - REMOVED problematic bowl/half-circle motif that caused visual conflict
 * - Portrait floats cleanly on the dark background
 * - Name positioned closer to portrait with increased size and letter-spacing
 * - Horizontal alignment: top of title aligns with top of portrait
 * - Ghost-style buttons with thin border (minimal, prestigious)
 * 
 * GSAP Animation hooks:
 * - On Load: Photo + name fade in with micro-scale → Title line-by-line → Bio/buttons cascade
 * - Scroll: Asymmetric parallax - left (0.75x slow), right (1.3x fast + fade out)
 */
export function PortfolioHeroBowlIntro({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollLineRef = useRef<HTMLSpanElement>(null);

  const displayName = (data.fullName || data.nameLead || 'Name').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const isAvailable = data.isAvailable !== false;
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || FALLBACK_BIO;
  }, [data.description]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const workHref = data.workHref || '#work';
  const contactHref = data.contactHref || '#contact';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const showAvailability = data.presentation.showAvailabilityBadge !== false;

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  // ========== ANIMATION: On Load Entry Sequence ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const section = sectionRef.current;
    if (!section) return;

    const portrait = section.querySelector('[data-gsap-portrait]') as HTMLElement;
    const name = section.querySelector('[data-gsap-name]') as HTMLElement;
    const availabilityBadge = section.querySelector('[data-gsap-availability]') as HTMLElement;
    const titleLines = section.querySelectorAll('[data-gsap-title-line]');
    const bioElement = section.querySelector('[data-gsap-bio]') as HTMLElement;
    const ctaElements = section.querySelectorAll('[data-gsap-cta]');

    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 150;

    // 1. PORTRAIT - Fade in with micro-scale
    if (portrait) {
      const t = setTimeout(() => {
        portrait.style.transition = 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
        portrait.style.opacity = '1';
        portrait.style.transform = 'scale(1)';
      }, delay);
      timers.push(t);
    }

    delay += 200;

    // 2. NAME - Fade in
    if (name) {
      const t = setTimeout(() => {
        name.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        name.style.opacity = '1';
        name.style.transform = 'translateY(0)';
      }, delay);
      timers.push(t);
    }

    // 3. AVAILABILITY BADGE - Fade in
    if (availabilityBadge) {
      const t = setTimeout(() => {
        availabilityBadge.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        availabilityBadge.style.opacity = '1';
        availabilityBadge.style.transform = 'translateY(0)';
      }, delay + 100);
      timers.push(t);
    }

    delay += 300;

    // 4. TITLE LINES - Staggered line-by-line
    titleLines.forEach((line, index) => {
      const t = setTimeout(() => {
        (line as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        (line as HTMLElement).style.opacity = '1';
        (line as HTMLElement).style.transform = 'translateY(0)';
      }, delay + index * 120);
      timers.push(t);
    });

    delay += titleLines.length * 120 + 200;

    // 5. BIO - Fade in
    if (bioElement) {
      const t = setTimeout(() => {
        bioElement.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        bioElement.style.opacity = '1';
        bioElement.style.transform = 'translateY(0)';
      }, delay);
      timers.push(t);
    }

    delay += 150;

    // 6. CTAs - Staggered cascade
    ctaElements.forEach((cta, index) => {
      const t = setTimeout(() => {
        (cta as HTMLElement).style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        (cta as HTMLElement).style.opacity = '1';
        (cta as HTMLElement).style.transform = 'translateY(0)';
      }, delay + index * 100);
      timers.push(t);
    });

    delay += 300;

    // 7. SCROLL INDICATOR - Final touch, fades in subtly
    const scrollIndicator = section.querySelector('[data-gsap-scroll-indicator]') as HTMLElement;
    if (scrollIndicator) {
      const t = setTimeout(() => {
        scrollIndicator.style.transition = 'opacity 0.8s ease-out, transform 0.6s ease-out';
        scrollIndicator.style.transform = 'translateY(0)';
        // Keep opacity at 0.3 (the design spec)
      }, delay);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // ========== ANIMATION: Scroll Asymmetric Parallax + Kinetic Scroll Indicator ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;
    const scrollIndicator = scrollIndicatorRef.current;
    const scrollLine = scrollLineRef.current;

    if (!section) return;

    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;

    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      viewportHeight = window.innerHeight;
    };

    setTimeout(updateBounds, 500);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;

      if (relativeScroll < 0) {
        // Reset
        if (leftColumn) {
          leftColumn.style.transform = 'translateY(0)';
          leftColumn.style.opacity = '1';
        }
        if (rightColumn) {
          rightColumn.style.transform = 'translateY(0)';
          rightColumn.style.opacity = '1';
        }
        // Reset scroll indicator line
        if (scrollLine) {
          scrollLine.style.width = '60px';
        }
        if (scrollIndicator) {
          scrollIndicator.style.opacity = '0.3';
        }
        return;
      }

      const scrollProgress = Math.min(1, relativeScroll / (sectionHeight - viewportHeight * 0.5));

      // LEFT COLUMN: Slow parallax (0.75x speed) - stays visible longer
      if (leftColumn) {
        const leftParallax = relativeScroll * 0.15; // Slow upward movement
        leftColumn.style.transform = `translateY(${-leftParallax}px)`;
        // Slight fade at the end
        const leftFade = Math.max(0, 1 - scrollProgress * 0.5);
        leftColumn.style.opacity = String(leftFade);
      }

      // RIGHT COLUMN: Fast parallax (1.3x speed) + fade out
      if (rightColumn) {
        const rightParallax = relativeScroll * 0.35; // Faster upward movement
        const rightFade = Math.max(0, 1 - scrollProgress * 1.5); // Fades faster
        rightColumn.style.transform = `translateY(${-rightParallax}px)`;
        rightColumn.style.opacity = String(rightFade);
      }

      // SCROLL INDICATOR: Kinetic line stretching
      if (scrollLine) {
        // Line stretches from 60px to 180px based on scroll
        const lineWidth = 60 + scrollProgress * 120;
        scrollLine.style.width = `${lineWidth}px`;
      }
      // Fade out scroll indicator as user scrolls
      if (scrollIndicator) {
        const indicatorFade = Math.max(0, 0.3 - scrollProgress * 0.4);
        scrollIndicator.style.opacity = String(indicatorFade);
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

    // Setup transitions
    if (leftColumn) {
      leftColumn.style.transition = 'transform 0.12s linear, opacity 0.15s linear';
      leftColumn.style.willChange = 'transform, opacity';
    }
    if (rightColumn) {
      rightColumn.style.transition = 'transform 0.12s linear, opacity 0.15s linear';
      rightColumn.style.willChange = 'transform, opacity';
    }
    if (scrollLine) {
      scrollLine.style.transition = 'width 0.15s ease-out';
    }
    if (scrollIndicator) {
      scrollIndicator.style.transition = 'opacity 0.2s ease-out';
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', updateBounds, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      [leftColumn, rightColumn].forEach((el) => {
        if (el) {
          el.style.transform = '';
          el.style.opacity = '';
          el.style.transition = '';
          el.style.willChange = '';
        }
      });
    };
  }, []);

  // Split specialty into lines for animation
  const specialtyLines = useMemo(() => {
    // Split on "/" to create separate lines
    return specialty.split(/\s*\/\s*/).filter(Boolean);
  }, [specialty]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
      data-hero-variant="bowl-intro"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />
      
      {/* Soft principal glow — top right (subtle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[18%] z-0 h-[55%] w-[55%] rounded-full opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${principal} 22%, transparent) 0%, transparent 70%)`,
        }}
      />

      <div
        className={`relative z-[1] flex flex-col pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-14 lg:min-h-[100dvh] lg:justify-center lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] lg:pb-16 ${shellX}`}
      >
        {/* ALIGNED GRID: Top of title aligns PRECISELY with top of portrait */}
        <div 
          className="grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-x-16 xl:gap-x-20"
          style={{ alignItems: 'start' }} // Critical: top alignment
        >
          {/* LEFT COLUMN — portrait + name (NO BOWL MOTIF - clean floating) */}
          <div 
            ref={leftColumnRef}
            className="relative isolate z-0 mx-auto flex w-full max-w-[20rem] flex-col items-center lg:mx-0 lg:max-w-[24rem]"
            data-gsap-left-column
          >
            {/* Availability badge - above portrait */}
            {showAvailability ? (
              <div
                className="relative z-[2] mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
                style={{
                  backgroundColor: isAvailable ? AVAILABLE_PILL_BG : UNAVAILABLE_PILL_BG,
                  borderColor: isAvailable
                    ? `color-mix(in srgb, ${AVAILABLE_PILL_FG} 28%, transparent)`
                    : `color-mix(in srgb, ${UNAVAILABLE_PILL_FG} 22%, transparent)`,
                  color: isAvailable ? AVAILABLE_PILL_FG : UNAVAILABLE_PILL_FG,
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(15px)',
                }}
                data-gsap-availability
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: isAvailable ? AVAILABLE_PILL_FG : UNAVAILABLE_PILL_FG }}
                  aria-hidden
                />
                <span className="font-sans text-[0.78rem] font-medium tracking-[-0.01em]">
                  {availability}
                </span>
              </div>
            ) : null}

            {/* Portrait - NO BOWL MOTIF, floats cleanly on background */}
            <div
              ref={portraitRef}
              className="relative z-[2] aspect-[3/4] w-full overflow-hidden rounded-[1.65rem] lg:rounded-[1.85rem]"
              style={{ 
                backgroundColor: neutre,
                // INITIAL HIDDEN STATE - micro-scale
                opacity: 0,
                transform: 'scale(0.92)',
              }}
              data-gsap-portrait
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  sizes="(max-width: 1023px) 88vw, 24rem"
                  className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                  priority
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center font-sans text-4xl font-bold tracking-[-0.04em]"
                  style={{ color: muted }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Name - CORRECTED: closer to portrait, larger, with letter-spacing */}
            <p
              ref={nameRef}
              className="relative z-[2] mt-4 m-0 text-center font-sans font-bold"
              style={{
                color: ink,
                fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)', // INCREASED size
                lineHeight: 1.2,
                letterSpacing: '0.02em', // Added letter-spacing for prestige
                // INITIAL HIDDEN STATE
                opacity: 0,
                transform: 'translateY(20px)',
              }}
              data-gsap-name
            >
              {displayName}
            </p>
          </div>

          {/* RIGHT COLUMN — specialty title, bio, ghost CTAs */}
          {/* TOP ALIGNED with portrait top edge - compensate for availability badge height */}
          <div 
            ref={rightColumnRef}
            className="relative z-[2] flex min-w-0 flex-col items-start text-left"
            style={{
              // PIXEL-PERFECT ALIGNMENT: compensate for badge height above portrait
              marginTop: showAvailability ? 'calc(1.5rem + 1rem)' : '0', // badge height + mb-4
            }}
            data-gsap-right-column
          >
            {/* Title - split into lines for animation */}
            <h1
              ref={titleRef}
              className="m-0 w-full max-w-[38rem] font-sans font-bold tracking-[-0.045em]"
              style={{
                color: principal,
                fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
                lineHeight: 1.02,
              }}
            >
              {specialtyLines.map((line, index) => (
                <span
                  key={index}
                  className="block"
                  style={{
                    // INITIAL HIDDEN STATE
                    opacity: 0,
                    transform: 'translateY(40px)',
                  }}
                  data-gsap-title-line={index}
                >
                  {line}
                  {index < specialtyLines.length - 1 && (
                    <span className="mx-2 text-[0.7em] opacity-60">/</span>
                  )}
                </span>
              ))}
            </h1>

            {/* Bio - line-height 1.6 for editorial magazine feel */}
            <p
              className="m-0 mt-7 max-w-[34rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: muted,
                fontSize: 'clamp(1.08rem, 1.35vw, 1.25rem)',
                lineHeight: 1.6, // EDITORIAL: aération de magazine de luxe
                // INITIAL HIDDEN STATE
                opacity: 0,
                transform: 'translateY(25px)',
              }}
              data-gsap-bio
            >
              {bio}
            </p>

            {/* CTAs - PREMIUM GHOST STYLE */}
            <div className="mt-8 flex w-full flex-wrap items-center justify-start gap-3 sm:gap-4">
              {/* Primary CTA - Ghost: transparent, WHITE text, 1px RED border */}
              {/* Hover: fills RED, text turns BLACK */}
              <a
                href={workHref}
                onClick={onNavClick(workHref)}
                className="inline-flex h-12 items-center justify-center rounded-full px-7 font-sans text-[0.92rem] font-semibold tracking-[-0.01em] transition-all duration-300"
                style={{ 
                  border: `1px solid ${principal}`, 
                  color: ink, // White/light text at rest
                  backgroundColor: 'transparent',
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = principal;
                  e.currentTarget.style.color = fond; // Black/dark text on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = ink;
                }}
                data-gsap-cta="primary"
              >
                View my work
              </a>
              {/* Secondary CTA - Ghost style with subtle ink border */}
              <a
                href={contactHref}
                onClick={onNavClick(contactHref)}
                className="inline-flex h-12 items-center justify-center rounded-full px-7 font-sans text-[0.92rem] font-semibold tracking-[-0.01em] transition-all duration-300"
                style={{ 
                  border: `1px solid color-mix(in srgb, ${ink} 40%, transparent)`, 
                  color: ink, 
                  backgroundColor: 'transparent',
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ink;
                  e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${ink} 8%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${ink} 40%, transparent)`;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                data-gsap-cta="secondary"
              >
                Contact me
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            KINETIC SCROLL INDICATOR — Bottom right, micro-typographic
            "SCROLL TO EXPLORE ———" with stretching line on scroll
        ═══════════════════════════════════════════════════════════════ */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 right-8 hidden items-center gap-3 lg:flex"
          style={{
            opacity: 0.3, // Ultra-discret
            // INITIAL HIDDEN STATE
            transform: 'translateY(10px)',
          }}
          data-gsap-scroll-indicator
        >
          <span
            className="font-sans text-[0.65rem] font-medium uppercase"
            style={{
              color: ink,
              letterSpacing: '0.18em', // Wide spacing for premium feel
            }}
          >
            Scroll to explore
          </span>
          <span
            ref={scrollLineRef}
            className="inline-block h-[1px]"
            style={{
              backgroundColor: ink,
              width: '60px', // Initial width, stretches with scroll
              transition: 'width 0.15s ease-out',
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
