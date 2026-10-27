'use client';

import Image from 'next/image';
import { BowlPortraitMotif } from './bowl-portrait-motif';
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
import { isPortfolioMotionOff, motionTimeout } from '@/components/portfolio/portfolio-motion-off';
import { useT } from '@/lib/i18n/I18nProvider';
import {
  hasPortraitShapeOverride,
  portraitShapeAspect,
  portraitShapeOverlayStyle,
  portraitShapeRadius,
} from '@/components/portfolio/hero-variants/portrait-shape';

const FALLBACK_BIO =
  'Ingénieur informatique passionné par les solutions innovantes et les expériences numériques claires.';

/** Soft green for the availability pill */
const AVAILABLE_PILL_BG = '#E8F6EC';
const AVAILABLE_PILL_FG = '#1F7A3A';
const UNAVAILABLE_PILL_BG = '#F3F3F3';
const UNAVAILABLE_PILL_FG = '#6B6B6B';

/** Portrait geometry and decorative motif are independent; both remain visible together. */
export function PortfolioHeroBowlIntro({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;
  const motif = data.presentation.heroBowlIntroMotif ?? 'bowl';
  const portraitShape = data.presentation.heroPortraitShape;
  const shapeOverride = hasPortraitShapeOverride(portraitShape);
  const shapeOverlay = shapeOverride ? portraitShapeOverlayStyle(portraitShape, principal, fond) : undefined;

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
      const t = motionTimeout(() => {
        portrait.style.transition = 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1)';
        portrait.style.opacity = '1';
        portrait.style.transform = 'scale(1)';
      }, delay);
      timers.push(t);
    }

    delay += 200;

    // 2. NAME - Fade in
    if (name) {
      const t = motionTimeout(() => {
        name.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        name.style.opacity = '1';
        name.style.transform = 'translateY(0)';
      }, delay);
      timers.push(t);
    }

    // 3. AVAILABILITY BADGE - Fade in
    if (availabilityBadge) {
      const t = motionTimeout(() => {
        availabilityBadge.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        availabilityBadge.style.opacity = '1';
        availabilityBadge.style.transform = 'translateY(0)';
      }, delay + 100);
      timers.push(t);
    }

    delay += 300;

    // 4. TITLE LINES - Staggered line-by-line
    titleLines.forEach((line, index) => {
      const t = motionTimeout(() => {
        (line as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        (line as HTMLElement).style.opacity = '1';
        (line as HTMLElement).style.transform = 'translateY(0)';
      }, delay + index * 120);
      timers.push(t);
    });

    delay += titleLines.length * 120 + 200;

    // 5. BIO - Fade in
    if (bioElement) {
      const t = motionTimeout(() => {
        bioElement.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        bioElement.style.opacity = '1';
        bioElement.style.transform = 'translateY(0)';
      }, delay);
      timers.push(t);
    }

    delay += 150;

    // 6. CTAs - Staggered cascade
    ctaElements.forEach((cta, index) => {
      const t = motionTimeout(() => {
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
      const t = motionTimeout(() => {
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
    
    // Animations switched off (Global → Animations): no scroll-driven parallax.
    if (isPortfolioMotionOff()) return;
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

    motionTimeout(updateBounds, 500);

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
        className={`relative z-[1] flex flex-col pb-10 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:pb-14 sm:pt-[calc(5.25rem+env(safe-area-inset-top,0px))] lg:min-h-[100dvh] lg:justify-center lg:pb-14 lg:pt-[calc(5.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        {/* ALIGNED GRID: Top of title aligns PRECISELY with top of portrait */}
        <div 
          className="grid w-full grid-cols-1 items-center gap-9 sm:gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-14 xl:gap-x-24"
          style={{ alignItems: 'start' }} // Critical: top alignment
        >
          {/* LEFT COLUMN — portrait + name (NO BOWL MOTIF - clean floating) */}
          <div 
            ref={leftColumnRef}
            className="relative isolate z-0 mx-auto flex w-full max-w-[15.5rem] flex-col items-center sm:max-w-[21rem] lg:mx-0 lg:max-w-[28rem]"
            data-gsap-left-column
          >
            <div className="relative w-full px-[5%] pb-8 pt-5 lg:px-[8%]">

            {/* Availability badge - anchored to the portrait composition */}
            {showAvailability ? (
              <div data-hero-availability
                className="absolute left-[10%] top-0 z-[4] inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-sm"
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

            {/* Portrait held by the selected sculptural motif. */}
            <div className="relative w-full">
            <BowlPortraitMotif motif={motif} shape={portraitShape} principal={principal} fond={fond} />
            {portraitShape === 'offset' ? <span aria-hidden className="pointer-events-none absolute inset-0 translate-x-[0.9rem] translate-y-[0.9rem] border" style={{ borderColor: principal }} /> : null}
            <div
              ref={portraitRef}
              className={`relative z-[2] w-full overflow-hidden border ${shapeOverride && portraitShape === 'circle' ? '' : 'aspect-[3/4]'}`}
              style={{
                backgroundColor: neutre,
                borderColor: `color-mix(in srgb, ${ink} 14%, transparent)`,
                ...(shapeOverride && portraitShapeAspect(portraitShape) ? { aspectRatio: portraitShapeAspect(portraitShape) } : null),
                borderRadius: shapeOverride
                  ? portraitShapeRadius(portraitShape)
                  : motif === 'bowl' || motif === 'hug'
                    ? '2rem 2rem 42% 42% / 2rem 2rem 16% 16%'
                    : motif === 'orbs-bottom'
                      ? '2rem 2rem 46% 2rem'
                      : '2rem',
                // Shape changes must never hide the image after the entry effect has run.
                opacity: 1,
                transform: 'scale(1)',
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
              {shapeOverlay ? (
                <span aria-hidden className="pointer-events-none absolute inset-0 z-[3]" style={shapeOverlay} />
              ) : null}
            </div>
            </div>
            </div>

            {/* Name - CORRECTED: closer to portrait, larger, with letter-spacing */}
            <p
              ref={nameRef}
              className="relative z-[2] m-0 mt-1 text-center font-sans font-bold"
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

          {/* RIGHT COLUMN — oversized specialty, editorial bio, restrained CTAs */}
          <div 
            ref={rightColumnRef}
            className="relative z-[2] flex min-w-0 flex-col items-start text-left lg:-mt-8 lg:min-h-[clamp(31rem,62vh,37rem)]"
            data-gsap-right-column
          >
            {/* Title - split into lines for animation */}
            <h1
              ref={titleRef}
              className="m-0 w-full max-w-[42rem] font-sans font-bold tracking-[-0.065em]"
              style={{
                color: principal,
                fontSize: 'clamp(2.75rem, 7vw, 7rem)',
                lineHeight: 0.92,
              }}
            >
              {specialtyLines.map((line, index) => (
                <span
                  key={index}
                  className="block [overflow-wrap:anywhere]"
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

            <span
              aria-hidden
              className="pointer-events-none absolute bottom-[4.5rem] right-0 hidden h-[clamp(9rem,18vh,12rem)] w-[min(100%,38rem)] border border-b-0 lg:block"
              style={{
                borderColor: `color-mix(in srgb, ${principal} 24%, transparent)`,
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              }}
            />

            <div className="relative z-[1] mt-6 w-full lg:mt-auto">

            {/* Bio - line-height 1.6 for editorial magazine feel */}
            <p data-hero-bio
              className="m-0 max-w-[35rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
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

            <div className="mt-6 flex w-full flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              {[
                { visible: data.showWorkCta !== false, href: workHref, label: t('View my work'), primary: true },
                { visible: data.showContactCta !== false, href: contactHref, label: t('Contact me'), primary: false },
              ].filter(button => button.visible).map(button => (
                <a
                  key={button.href + button.label}
                  href={button.href}
                  onClick={onNavClick(button.href)}
                  className="pf-bowl-cta"
                  data-shape={data.presentation.heroBowlIntroButtonShape ?? 'rectangle'}
                  data-pf-no-color-transition=""
                  style={{
                    color: ink,
                    borderColor: button.primary ? principal : `color-mix(in srgb, ${ink} 32%, transparent)`,
                  }}
                >
                  <span className="pf-bowl-cta-fill" aria-hidden data-pf-no-color-transition="" style={{ backgroundColor: button.primary ? principal : ink }} />
                  <span className="pf-bowl-cta-label">{button.label}</span>
                  <span className="pf-bowl-cta-arrow" aria-hidden data-pf-no-color-transition="">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M5 5h14v14" /></svg>
                  </span>
                </a>
              ))}
            </div>
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
            {t('Scroll to explore')}
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
