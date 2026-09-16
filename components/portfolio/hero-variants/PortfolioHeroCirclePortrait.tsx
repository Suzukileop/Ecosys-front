'use client';

import Image from 'next/image';
import { useMemo, useRef, useEffect, type MouseEvent, type ReactNode } from 'react';
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
import {
  portfolioHeroContentShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Circle portrait — Split Éclaté avec Typographie Monumentale en Bas
 * 
 * Restructured per Google/Awwwards critique:
 * - Circular portrait LEFT balanced with editorial block CENTER-RIGHT
 * - Monumental title anchors the entire composition at the BOTTOM
 * - Geometric alignment: top of circle aligns with first line of bio
 * - "Available for work" badge perfectly centered under portrait
 * 
 * GSAP Animation hooks:
 * - On Load: Title word-by-word reveal → Photo scale(0→1) → Bio/CTAs stagger fade
 * - Scroll: Title stays pinned, photo parallax 1.3x faster, bio 0.85x slower, both fade out
 */
export function PortfolioHeroCirclePortrait({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  // Refs for GSAP animation targets
  const sectionRef = useRef<HTMLElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleWordsRef = useRef<HTMLSpanElement[]>([]);
  const portraitContainerRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const bioContainerRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const redLineTopRef = useRef<HTMLDivElement>(null);
  const redLineBottomRef = useRef<HTMLDivElement>(null);

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return (
      cleaned ||
      'Du premier échange à la livraison, je construis des identités visuelles sensibles, cohérentes et durables pour les marques qui avancent.'
    );
  }, [data.description]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const borderSoft = `color-mix(in srgb, ${bordure} 80%, transparent)`;
  const markSpecialty = data.presentation.heroCirclePortraitSpecialtyMark === true;
  /** Default layout is title at the bottom; toggle "Titre en haut" turns this off. */
  const titleBottom = data.presentation.heroCirclePortraitTitleBottom !== false;

  // Split title into words for animation
  const titleText = `${displayName} — ${specialty}`;
  const titleWords = useMemo(() => titleText.split(/(\s+)/).filter(Boolean), [titleText]);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  // ========== ANIMATION: On Load Title Word-by-Word Reveal ==========
  // Initial hidden states are set via inline styles in JSX to prevent FOUC
  // This effect only triggers the reveal animations
  useEffect(() => {
    // Skip if not in titleBottom mode or if we're on the server
    if (!titleBottom || typeof window === 'undefined') return;
    
    const section = sectionRef.current;
    if (!section) return;
    
    // Query all animated elements
    const titleWords = section.querySelectorAll('[data-gsap-word]');
    const redLineTop = section.querySelector('[data-gsap-red-line="top"]') as HTMLElement;
    const redLineBottom = section.querySelector('[data-gsap-red-line="bottom"]') as HTMLElement;
    const portrait = section.querySelector('[data-gsap-portrait]') as HTMLElement;
    const availability = section.querySelector('[data-gsap-availability]') as HTMLElement;
    const bioElements = section.querySelectorAll('[data-gsap-bio]');
    
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    // ===== ANIMATION SEQUENCE =====
    // Elements start hidden (via JSX inline styles), we animate them to visible
    
    let delay = 150; // Small initial delay for page to settle
    
    // 1. TITLE WORDS - Staggered reveal (word by word)
    titleWords.forEach((word, index) => {
      const el = word as HTMLElement;
      const t = setTimeout(() => {
        el.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay + index * 70);
      timers.push(t);
    });
    
    delay += titleWords.length * 70 + 200;
    
    // 2. RED LINES - Scale in
    timers.push(setTimeout(() => {
      if (redLineTop) {
        redLineTop.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        redLineTop.style.transform = 'scaleX(1)';
      }
    }, delay));
    
    timers.push(setTimeout(() => {
      if (redLineBottom) {
        redLineBottom.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        redLineBottom.style.transform = 'scaleX(1)';
      }
    }, delay + 200));
    
    delay += 400;
    
    // 3. PORTRAIT - Scale from center with bounce effect
    timers.push(setTimeout(() => {
      if (portrait) {
        portrait.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease-out';
        portrait.style.transform = 'scale(1)';
        portrait.style.opacity = '1';
      }
    }, delay));
    
    delay += 500;
    
    // 4. AVAILABILITY BADGE - Fade up
    timers.push(setTimeout(() => {
      if (availability) {
        availability.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        availability.style.opacity = '1';
        availability.style.transform = 'translateY(0)';
      }
    }, delay));
    
    delay += 300;
    
    // 5. BIO + CTAs - Staggered cascade
    bioElements.forEach((el, index) => {
      const element = el as HTMLElement;
      const t = setTimeout(() => {
        element.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay + index * 150);
      timers.push(t);
    });
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [titleBottom]);

  // ========== ANIMATION: Scroll Parallax & Sticky Title ==========
  useEffect(() => {
    // Skip if not in titleBottom mode or on server
    if (!titleBottom || typeof window === 'undefined') return;
    
    // Only run on desktop (md+ breakpoint)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) {
      console.log('[CirclePortrait] Scroll animation skipped: viewport too narrow');
      return;
    }

    const section = sectionRef.current;
    if (!section) {
      console.warn('[CirclePortrait] Section ref not found for scroll animation');
      return;
    }

    // Query elements from the DOM
    const titleContainer = section.querySelector('[data-gsap-title-container]') as HTMLElement;
    const portraitColumn = section.querySelector('[data-gsap-portrait-column]') as HTMLElement;
    const bioContainer = section.querySelector('[data-gsap-bio-container]') as HTMLElement;

    console.log('[CirclePortrait] Scroll animation init:', {
      titleContainer: !!titleContainer,
      portraitColumn: !!portraitColumn,
      bioContainer: !!bioContainer,
    });

    if (!titleContainer) {
      console.warn('[CirclePortrait] Title container not found for scroll');
      return;
    }

    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;

    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      viewportHeight = window.innerHeight;
    };

    // Delay initial bounds calculation to ensure layout is complete
    setTimeout(updateBounds, 100);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;
      
      // Don't apply effects when above section
      if (relativeScroll < 0) {
        // Reset transforms when scrolled above
        if (titleContainer) titleContainer.style.transform = 'translateY(0)';
        if (portraitColumn) {
          portraitColumn.style.transform = 'translateY(0)';
          portraitColumn.style.opacity = '1';
        }
        if (bioContainer) {
          bioContainer.style.transform = 'translateY(0)';
          bioContainer.style.opacity = '1';
        }
        return;
      }
      
      // Calculate scroll progress (0 = at section top, 1 = scrolled past section)
      const maxScroll = Math.max(1, sectionHeight - viewportHeight * 0.5);
      const scrollProgress = Math.min(1, relativeScroll / maxScroll);

      // 1. TITLE STICKY: Keep pinned at bottom during initial scroll, then release
      const stickyThreshold = 0.6;
      if (scrollProgress < stickyThreshold) {
        // Pin the title by moving it down as we scroll
        const pinAmount = Math.min(relativeScroll * 0.35, viewportHeight * 0.2);
        titleContainer.style.transform = `translateY(${pinAmount}px)`;
      } else {
        // Gradually release
        const releaseProgress = (scrollProgress - stickyThreshold) / (1 - stickyThreshold);
        const maxPin = viewportHeight * 0.2;
        const releaseAmount = maxPin * (1 - releaseProgress * 0.5);
        titleContainer.style.transform = `translateY(${releaseAmount}px)`;
      }

      // 2. PORTRAIT PARALLAX: Moves up faster (1.3x speed) + fades out
      if (portraitColumn) {
        // Faster upward movement
        const portraitParallax = relativeScroll * 0.3;
        // Fade out as we scroll (complete fade at 80% progress)
        const portraitFade = Math.max(0, 1 - (scrollProgress * 1.25));
        portraitColumn.style.transform = `translateY(${-portraitParallax}px)`;
        portraitColumn.style.opacity = String(portraitFade);
      }

      // 3. BIO PARALLAX: Moves up slower (0.85x speed) + fades out
      if (bioContainer) {
        // Slower upward movement
        const bioParallax = relativeScroll * 0.12;
        // Fade out slightly faster than portrait
        const bioFade = Math.max(0, 1 - (scrollProgress * 1.4));
        bioContainer.style.transform = `translateY(${-bioParallax}px)`;
        bioContainer.style.opacity = String(bioFade);
      }
    };

    // Throttled scroll handler for smooth performance
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

    // Setup smooth transitions for scroll effects
    const setupTransitions = () => {
      if (titleContainer) {
        titleContainer.style.transition = 'transform 0.1s linear';
        titleContainer.style.willChange = 'transform';
      }
      if (portraitColumn) {
        portraitColumn.style.transition = 'transform 0.1s linear, opacity 0.15s linear';
        portraitColumn.style.willChange = 'transform, opacity';
      }
      if (bioContainer) {
        bioContainer.style.transition = 'transform 0.1s linear, opacity 0.15s linear';
        bioContainer.style.willChange = 'transform, opacity';
      }
    };

    // Wait for load animations to complete before enabling scroll effects
    setTimeout(() => {
      setupTransitions();
      window.addEventListener('scroll', throttledScroll, { passive: true });
      window.addEventListener('resize', updateBounds, { passive: true });
      handleScroll(); // Initial call
    }, 2500); // Wait for entry animations

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      
      // Cleanup styles
      [titleContainer, portraitColumn, bioContainer].forEach((el) => {
        if (el) {
          el.style.transform = '';
          el.style.opacity = '';
          el.style.transition = '';
          el.style.willChange = '';
        }
      });
    };
  }, [titleBottom]);

  const specialtyNode = markSpecialty ? (
    <span
      className="box-decoration-clone px-[0.12em] font-bold"
      style={{
        color: ink,
        backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
      }}
    >
      {specialty}
    </span>
  ) : (
    <span className="font-bold">{specialty}</span>
  );

  // Availability badge — perfectly centered under portrait
  // INITIAL HIDDEN STATE when in titleBottom mode
  const availabilityRow = (opts?: { centered?: boolean }) => (
    <div
      ref={opts?.centered ? availabilityRef : undefined}
      className={`flex items-center gap-2.5 ${opts?.centered ? 'justify-center' : ''}`}
      style={titleBottom && opts?.centered ? {
        opacity: 0,
        transform: 'translateY(15px)',
      } : undefined}
      data-gsap-availability
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: principal }}
        aria-hidden
      />
      <p
        className="m-0 font-sans font-normal leading-none tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)',
        }}
      >
        {availability}
      </p>
    </div>
  );

  const headline = (opts?: { mobile?: boolean; bottom?: boolean }) => (
    <h1
      className={`m-0 w-full font-sans font-semibold tracking-[-0.035em] ${
        opts?.bottom ? 'text-left' : ''
      }`}
      style={{
        color: ink,
        fontSize: opts?.mobile
          ? 'clamp(2.35rem, 10vw, 3.35rem)'
          : 'clamp(2.5rem, 3.8vw, 3.85rem)',
        lineHeight: 1.08,
      }}
    >
      {opts?.bottom ? (
        <>
          {displayName} — {specialtyNode}
        </>
      ) : (
        <>
          Hello, I&apos;m {displayName} — a {specialtyNode}.
        </>
      )}
    </h1>
  );

  // Monumental title with word-by-word animation support
  // CRITICAL: Initial hidden state set via inline styles to prevent FOUC
  const monumentalTitleWithRules = (opts?: { mobile?: boolean }) => (
    <div 
      ref={titleContainerRef}
      className="flex w-full flex-col gap-4"
      data-gsap-title-container
    >
      {/* Top red line — aligned with start of "Leopard" */}
      <div
        ref={redLineTopRef}
        aria-hidden
        className="w-[min(7.5rem,28%)] self-start"
        style={{ 
          height: 5, 
          backgroundColor: principal,
          // INITIAL HIDDEN STATE - scaleX(0) from left
          transform: 'scaleX(0)',
          transformOrigin: 'left center',
        }}
        data-gsap-red-line="top"
      />
      
      {/* Title with word-by-word animation */}
      <h1
        className={`m-0 w-full font-sans font-semibold tracking-[-0.035em] text-left`}
        style={{
          color: ink,
          fontSize: opts?.mobile
            ? 'clamp(2.35rem, 10vw, 3.35rem)'
            : 'clamp(2.75rem, 4.2vw, 4.25rem)',
          lineHeight: 1.08,
        }}
        data-gsap-title
      >
        {titleWords.map((word, index) => (
          <span
            key={index}
            ref={(el) => {
              if (el) titleWordsRef.current[index] = el;
            }}
            className="inline-block"
            style={{ 
              display: 'inline-block',
              whiteSpace: word.trim() === '' ? 'pre' : 'normal',
              // INITIAL HIDDEN STATE - opacity 0 + translateY
              opacity: 0,
              transform: 'translateY(50px)',
            }}
            data-gsap-word={index}
          >
            {word}
          </span>
        ))}
      </h1>
      
      {/* Bottom red line — aligned to the right */}
      <div
        ref={redLineBottomRef}
        aria-hidden
        className="w-[min(7.5rem,28%)] self-end"
        style={{ 
          height: 5, 
          backgroundColor: principal,
          // INITIAL HIDDEN STATE - scaleX(0) from right
          transform: 'scaleX(0)',
          transformOrigin: 'right center',
        }}
        data-gsap-red-line="bottom"
      />
    </div>
  );

  const ctaRow = (opts?: { mobile?: boolean; centered?: boolean }): ReactNode => {
    if (opts?.mobile) {
      return (
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full font-sans text-[0.95rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
          style={{ backgroundColor: ink, color: fond }}
          data-gsap-bio="cta"
        >
          View project
        </a>
      );
    }

    return (
      <div
        className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${
          opts?.centered ? 'justify-center' : 'justify-start'
        }`}
        style={titleBottom ? {
          // INITIAL HIDDEN STATE
          opacity: 0,
          transform: 'translateY(25px)',
        } : undefined}
        data-gsap-bio="ctas"
      >
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full px-7 font-sans text-[0.95rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
          style={{ backgroundColor: ink, color: fond }}
        >
          Let&apos;s talk
        </a>
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="shrink-0 font-sans text-[0.95rem] font-medium tracking-[-0.01em] underline underline-offset-[5px] transition hover:opacity-80"
          style={{ color: ink }}
        >
          View project
        </a>
      </div>
    );
  };

  const bioBlock = (opts?: { mobile?: boolean; centered?: boolean }) => (
    <p
      className={`m-0 font-sans font-normal tracking-[-0.01em] ${
        opts?.centered ? 'text-center' : 'text-left'
      } ${opts?.mobile ? '' : 'max-w-[34rem]'}`}
      style={{
        color: muted,
        fontSize: opts?.mobile
          ? '1.0625rem'
          : 'clamp(1.05rem, 1.25vw, 1.1875rem)',
        lineHeight: 1.55,
        // INITIAL HIDDEN STATE for titleBottom mode (desktop only)
        ...(titleBottom && !opts?.mobile ? {
          opacity: 0,
          transform: 'translateY(25px)',
        } : {}),
      }}
      data-gsap-bio="paragraph"
    >
      {bio}
    </p>
  );

  /** Default: title + bio + CTAs stacked left. */
  const copyStack = (opts?: { mobile?: boolean }) => (
    <div
      className={`flex w-full flex-col items-start text-left ${
        opts?.mobile ? 'gap-8' : 'gap-10'
      }`}
    >
      {headline({ mobile: opts?.mobile })}
      {bioBlock({ mobile: opts?.mobile })}
      {ctaRow({ mobile: opts?.mobile })}
    </div>
  );

  /**
   * Bio + CTAs beside image (title-bottom mode)
   * Aligned so top of bio matches top of portrait circle
   */
  const bioCtaBesideImage = (opts?: { mobile?: boolean }) => (
    <div
      ref={bioContainerRef}
      className={`flex w-full max-w-[34rem] flex-col ${
        opts?.mobile ? 'gap-8' : 'gap-10'
      }`}
      style={{ alignSelf: 'flex-start' }} // Align to top to match portrait top
      data-gsap-bio-container
    >
      {bioBlock({ mobile: opts?.mobile, centered: false })}
      <div className="flex w-full justify-start">
        {ctaRow({ mobile: opts?.mobile, centered: false })}
      </div>
    </div>
  );

  const circlePortrait = (sizeCss: string, sizes: string) => (
    <div
      ref={portraitRef}
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: sizeCss,
        height: sizeCss,
        minWidth: sizeCss,
        minHeight: sizeCss,
        backgroundColor: `color-mix(in srgb, ${neutre} 70%, ${bordure})`,
        border: `1px solid ${borderSoft}`,
        // INITIAL HIDDEN STATE - scale(0) from center
        transform: titleBottom ? 'scale(0)' : 'scale(1)',
        opacity: titleBottom ? 0 : 1,
        transformOrigin: 'center center',
      }}
      data-gsap-portrait
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Portrait of ${displayName}`}
          fill
          sizes={sizes}
          className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
          priority
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-sans text-5xl font-semibold tracking-tight"
          style={{ color: muted }}
          aria-hidden
        >
          {initials}
        </div>
      )}
    </div>
  );

  // Portrait column with availability badge centered below
  const portraitColumn = (opts?: { mobile?: boolean; alignStart?: boolean }) => (
    <div
      ref={opts?.alignStart ? portraitContainerRef : undefined}
      className={`flex w-full ${opts?.alignStart ? 'justify-start' : 'justify-center'}`}
      data-gsap-portrait-column
    >
      <div className="flex flex-col items-center">
        {circlePortrait(
          opts?.mobile ? 'clamp(16rem, 78vw, 22rem)' : 'clamp(18rem, 38vw, 26rem)',
          opts?.mobile ? '82vw' : '(max-width: 1024px) 48vw, 26rem'
        )}
        {/* Availability badge — perfectly centered under portrait with breathing room */}
        <div 
          className={opts?.mobile ? 'mt-6' : 'mt-8'}
          style={{ marginBottom: 'clamp(1.5rem, 3vh, 2.5rem)' }} // Extra space before title
        >
          {availabilityRow({ centered: true })}
        </div>
      </div>
    </div>
  );

  const shellPad = {
    paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
    paddingBottom: 'clamp(2rem, 4vh, 3.25rem)',
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
      data-hero-variant="circle-portrait"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      {/* —— Desktop — Split Éclaté avec Typographie Monumentale en Bas —— */}
      {titleBottom ? (
        <div
          className={`relative z-[1] hidden min-h-[100dvh] flex-col md:flex ${shellX}`}
          style={shellPad}
        >
          {/* Main content area — Portrait left, Bio right */}
          {/* GEOMETRIC ALIGNMENT: Top of portrait aligns with first line of bio */}
          <div
            className="grid w-full flex-1 items-start" // items-start for top alignment
            style={{
              gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1fr)',
              columnGap: 'clamp(2.5rem, 5vw, 4.5rem)',
              alignItems: 'start', // Critical: top-aligns portrait with bio first line
              paddingTop: 'clamp(2rem, 6vh, 4rem)',
            }}
          >
            {/* Portrait flush left — top edge aligns with bio first line */}
            <div className="flex w-full items-start justify-start self-start">
              {portraitColumn({ alignStart: true })}
            </div>
            
            {/* Bio + CTAs — top-aligned with portrait */}
            <div 
              className="flex min-w-0 items-start justify-start self-start"
              style={{ paddingTop: 'clamp(0.5rem, 1.5vw, 1rem)' }} // Fine-tune alignment
            >
              {bioCtaBesideImage()}
            </div>
          </div>
          
          {/* Monumental title at bottom — sticky during scroll */}
          <div 
            className="mt-auto w-full shrink-0"
            style={{ paddingTop: 'clamp(1rem, 2vh, 1.5rem)' }}
          >
            {monumentalTitleWithRules()}
          </div>
        </div>
      ) : (
        <div
          className={`relative z-[1] hidden min-h-[100dvh] md:grid ${shellX}`}
          style={{
            ...shellPad,
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            columnGap: 'clamp(1.75rem, 4vw, 3.5rem)',
            alignItems: 'center',
          }}
        >
          <div className="flex w-full items-center justify-center self-center">
            {portraitColumn()}
          </div>
          <div className="flex min-w-0 items-center self-center pr-[clamp(0.5rem,2vw,1.5rem)]">
            {copyStack()}
          </div>
        </div>
      )}

      {/* —— Mobile —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {titleBottom ? (
          <>
            {portraitColumn({ mobile: true, alignStart: true })}
            <div className="mt-10 w-full">{bioCtaBesideImage({ mobile: true })}</div>
            <div className="mt-8 w-full">{monumentalTitleWithRules({ mobile: true })}</div>
          </>
        ) : (
          <>
            {portraitColumn({ mobile: true })}
            <div className="mt-10 w-full">{copyStack({ mobile: true })}</div>
          </>
        )}
      </div>
    </section>
  );
}
