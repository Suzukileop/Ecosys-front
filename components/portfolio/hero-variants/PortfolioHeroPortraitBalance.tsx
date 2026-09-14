'use client';

import Image from 'next/image';
import { useMemo, useRef, useEffect } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroImageGrayscaleClass, resolveHeroAvailabilityValue, resolveHeroSpecialtyValue } from '@/components/portfolio/portfolio-hero-banner-settings';
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
 * Portrait balance — Brutalist Asymmetric Edition
 * 
 * Restructured per Google/Awwwards critique:
 * - Specialty tag (Data scientist / digital designer) isolated at top-right above image
 * - Title remains massive and prominent
 * - Below title: asymmetric split into two sub-columns
 *   - Left sub-column: Core stack badges (compact, vertical)
 *   - Right sub-column: Bio description (60% opacity, airy line-height)
 * - Geometric alignment: sub-columns bottom aligns with portrait bottom edge
 * 
 * GSAP Animation hooks prepared:
 * - data-gsap-reveal="line" on text elements for line-by-line reveal
 * - data-gsap-blur="portrait" on image for progressive blur transition
 */
export function PortfolioHeroPortraitBalance({ data }: { data: PortfolioHeroData }) {
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
  const portraitDesktopRef = useRef<HTMLDivElement>(null);
  const portraitMobileRef = useRef<HTMLDivElement>(null);
  const portraitContainerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const specialtyTagRef = useRef<HTMLParagraphElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const toolsBlockRef = useRef<HTMLDivElement>(null);
  const bioBlockRef = useRef<HTMLDivElement>(null);
  

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return (
      cleaned ||
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.'
    );
  }, [data.description]);

  const tools = useMemo(
    () =>
      Array.from(
        new Set((data.tools ?? []).map((tool) => tool.trim()).filter(Boolean))
      ),
    [data.tools]
  );

  const toolsLabel =
    data.presentation.toolsLabelText?.trim() || 'Core stack';

  const chipSurface = `color-mix(in srgb, ${neutre} 88%, ${bordure})`;
  const chipBorder = `color-mix(in srgb, ${bordure} 85%, transparent)`;

  // GSAP animation - Portrait blur reveal on load
  // Initial state (blur + opacity 0) is set via inline styles in renderPortrait
  useEffect(() => {
    const portraits = [portraitDesktopRef.current, portraitMobileRef.current].filter(Boolean);
    
    // Animate blur removal on load
    const timer = setTimeout(() => {
      portraits.forEach((portrait) => {
        if (portrait) {
          portrait.style.transition = 'filter 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease-out';
          portrait.style.filter = 'blur(0px)';
          portrait.style.opacity = '1';
        }
      });
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  // Text reveal animation - Line by line on load
  // Initial states are set via inline styles on elements with data-gsap-reveal
  useEffect(() => {
    const leftColumn = leftColumnRef.current;
    if (!leftColumn) return;

    const revealElements = leftColumn.querySelectorAll('[data-gsap-reveal]');
    
    // Staggered reveal animation
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    revealElements.forEach((el, index) => {
      const element = el as HTMLElement;
      const t = setTimeout(() => {
        // Check for custom final opacity (e.g., bio = 0.6, hairline-2 = 0.5)
        const finalOpacity = element.dataset.finalOpacity || '1';
        
        element.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.opacity = finalOpacity;
        element.style.transform = 'translateY(0)';
      }, 250 + index * 120);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // GSAP ScrollTrigger-style scroll-driven animations
  useEffect(() => {
    // Only run on desktop (md+)
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    const portraitContainer = portraitContainerRef.current;
    const specialtyTag = specialtyTagRef.current;
    const titleBlock = titleBlockRef.current;
    const toolsBlock = toolsBlockRef.current;
    const bioBlock = bioBlockRef.current;

    if (!section || !portraitContainer) return;

    // Get section bounds for scroll calculations
    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;

    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      viewportHeight = window.innerHeight;
    };

    updateBounds();

    // Scroll handler for parallax and sticky effects
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;
      
      // Calculate scroll progress (0 = top of section, 1 = bottom of section)
      const scrollProgress = Math.max(0, Math.min(1, relativeScroll / (sectionHeight - viewportHeight)));
      
      // Only activate scroll effects after initial reveal
      if (relativeScroll < 0) {
        return;
      }
      
      // 1. SPECIALTY TAG: Fade out with micro translateX on scroll start
      if (specialtyTag) {
        const tagFadeProgress = Math.min(1, relativeScroll / 150); // Fade over first 150px of scroll
        specialtyTag.style.opacity = String(1 - tagFadeProgress);
        specialtyTag.style.transform = `translateX(${tagFadeProgress * 20}px)`;
      }

      // 2. PARALLAX: Different scroll speeds for left column elements
      if (titleBlock) {
        // Title: normal speed (1x)
        titleBlock.style.transform = `translateY(${-relativeScroll * 0}px)`;
      }
      
      if (toolsBlock) {
        // Tools: faster speed (1.2x) - moves up faster
        const toolsParallax = relativeScroll * 0.15;
        toolsBlock.style.transform = `translateY(${-toolsParallax}px)`;
      }
      
      if (bioBlock) {
        // Bio: slower speed (0.8x) + fade out
        const bioParallax = relativeScroll * -0.1;
        const bioFadeProgress = Math.min(1, relativeScroll / 300);
        bioBlock.style.transform = `translateY(${bioParallax}px)`;
        bioBlock.style.opacity = String(Math.max(0, 1 - bioFadeProgress));
      }

      // 3. PORTRAIT STICKY: Keep portrait pinned during scroll
      if (portraitContainer && scrollProgress < 0.85) {
        // Pin the portrait by applying transform to counteract scroll
        const maxPin = sectionHeight - viewportHeight;
        const pinAmount = Math.min(relativeScroll, maxPin * 0.7);
        portraitContainer.style.transform = `translateY(${pinAmount}px)`;
      } else if (portraitContainer) {
        // Release pin for exit transition
        const releaseProgress = (scrollProgress - 0.85) / 0.15;
        const maxPin = (sectionHeight - viewportHeight) * 0.7;
        const releaseAmount = maxPin * (1 - releaseProgress * 0.3);
        portraitContainer.style.transform = `translateY(${releaseAmount}px)`;
      }
    };

    // Throttled scroll handler for performance
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

    // Initial state setup
    if (specialtyTag) {
      specialtyTag.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    }
    if (titleBlock) {
      titleBlock.style.transition = 'transform 0.1s ease-out';
      titleBlock.style.willChange = 'transform';
    }
    if (toolsBlock) {
      toolsBlock.style.transition = 'transform 0.1s ease-out';
      toolsBlock.style.willChange = 'transform';
    }
    if (bioBlock) {
      bioBlock.style.transition = 'transform 0.1s ease-out, opacity 0.15s ease-out';
      bioBlock.style.willChange = 'transform, opacity';
    }
    if (portraitContainer) {
      portraitContainer.style.transition = 'transform 0.15s ease-out';
      portraitContainer.style.willChange = 'transform';
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', updateBounds, { passive: true });

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      
      // Cleanup styles
      [specialtyTag, titleBlock, toolsBlock, bioBlock, portraitContainer].forEach((el) => {
        if (el) {
          el.style.transform = '';
          el.style.opacity = '';
          el.style.transition = '';
          el.style.willChange = '';
        }
      });
    };
  }, []);

  // Portrait with blur transition support - accepts ref for desktop/mobile variants
  // INITIAL HIDDEN STATE: blur(20px) + opacity(0) to prevent FOUC
  const renderPortrait = (sizes: string, className: string, ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: `color-mix(in srgb, ${bordure} 28%, ${fond})`,
        // INITIAL HIDDEN STATE
        filter: 'blur(20px)',
        opacity: 0,
      }}
      data-gsap-blur="portrait"
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

  // Compact vertical tools block for left sub-column
  // FLUSH LEFT alignment: Left edge of badges aligns with "H" of title and "Available" text
  const toolsBlockCompact = tools.length > 0 ? (
    <div 
      className="flex flex-col gap-3 items-start" 
      data-gsap-reveal="tools"
      style={{ 
        alignItems: 'flex-start',
        // INITIAL HIDDEN STATE
        opacity: 0,
        transform: 'translateY(24px)',
      }}
    >
      <p
        className="m-0 font-sans font-medium uppercase tracking-[0.08em]"
        style={{
          color: muted,
          fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)',
          lineHeight: 1.3,
          letterSpacing: '0.12em',
        }}
      >
        {toolsLabel}
      </p>
      <ul 
        className="m-0 flex list-none flex-col gap-1.5 p-0 items-start" 
        aria-label={toolsLabel}
        style={{ alignItems: 'flex-start' }} // Badges align flush left
      >
        {tools.map((tool) => (
          <li
            key={tool}
            className="inline-flex w-fit items-center rounded-sm px-2 py-0.5 font-sans text-[0.75rem] font-medium tracking-[-0.01em]"
            style={{
              color: muted,
              backgroundColor: chipSurface,
              border: `1px solid ${chipBorder}`,
            }}
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  // Bio block for right sub-column with 60% opacity, airy line-height, and reduced max-width
  // max-width reduced to create more vertical gutter between text and portrait
  // Note: Final opacity is 0.6, but starts at 0 for animation
  const bioBlock = (
    <p
      className="m-0 max-w-[35ch] font-sans font-normal tracking-[-0.01em]"
      style={{
        color: ink,
        fontSize: 'clamp(0.9375rem, 1.05vw, 1rem)',
        lineHeight: 1.85,
        // INITIAL HIDDEN STATE (will animate to opacity: 0.6)
        opacity: 0,
        transform: 'translateY(24px)',
      }}
      data-gsap-reveal="bio"
      data-final-opacity="0.6"
    >
      {bio}
    </p>
  );

  // Title block with line-by-line reveal support
  // FLUSH LEFT alignment: "Available for work", title "H", and badges share same X coordinate
  // INITIAL HIDDEN STATES set via inline styles to prevent FOUC
  const titleBlock = (opts?: { mobile?: boolean }) => (
    <div 
      className={`flex w-full flex-col items-start ${opts?.mobile ? 'mt-8 gap-4' : 'gap-3.5'}`}
      style={{ alignItems: 'flex-start' }}
    >
      <p
        className="m-0 font-sans font-medium tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: opts?.mobile
            ? 'clamp(0.95rem, 3.5vw, 1.05rem)'
            : 'clamp(0.95rem, 1.1vw, 1.0625rem)',
          lineHeight: 1.35,
          // INITIAL HIDDEN STATE
          opacity: opts?.mobile ? 1 : 0,
          transform: opts?.mobile ? 'none' : 'translateY(24px)',
        }}
        data-gsap-reveal="availability"
      >
        {availability}
      </p>
      <div
        aria-hidden
        className="w-full max-w-[16ch]"
        style={{ 
          height: 1, 
          backgroundColor: bordure,
          // INITIAL HIDDEN STATE
          opacity: opts?.mobile ? 1 : 0,
          transform: opts?.mobile ? 'none' : 'translateY(24px)',
        }}
        data-gsap-reveal="hairline-1"
      />
      <h1
        className={`m-0 font-sans font-semibold ${
          opts?.mobile ? 'w-full tracking-[-0.04em]' : 'max-w-[16ch] tracking-[-0.045em]'
        }`}
        style={{
          color: ink,
          fontSize: opts?.mobile
            ? 'clamp(2.25rem, 9vw, 3.1rem)'
            : 'clamp(2.75rem, 4.8vw, 4.75rem)',
          lineHeight: 1.06,
          marginLeft: 0,
          // INITIAL HIDDEN STATE
          opacity: opts?.mobile ? 1 : 0,
          transform: opts?.mobile ? 'none' : 'translateY(24px)',
        }}
        data-gsap-reveal="headline"
      >
        Hi, I&apos;m {displayName}.
      </h1>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ backgroundColor: fond, color: ink }}
      data-hero-variant="portrait-balance"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      {/* —— Desktop — Brutalist Asymmetric Layout —— */}
      <div
        className={`relative z-[1] hidden md:grid lg:min-h-[100dvh] ${shellX}`}
        style={{
          paddingTop: 'calc(8.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(17rem, 32vw)',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          columnGap: 'clamp(3rem, 6vw, 5.5rem)', // Increased gap for better vertical gutter
          rowGap: 0,
          alignItems: 'stretch',
        }}
      >
        {/* Specialty tag — isolated top right above image (magazine label style) */}
        <p
          ref={specialtyTagRef}
          className="m-0 mb-4 self-end justify-self-end text-right font-sans font-medium tracking-[-0.01em]"
          style={{
            gridColumn: 2,
            gridRow: 1,
            color: principal,
            fontSize: 'clamp(1.15rem, 1.5vw, 1.45rem)',
            lineHeight: 1.3,
          }}
          data-gsap-scroll="specialty"
        >
          {specialty}
        </p>

        {/*
          Left column: Title at top-center, then asymmetric split below.
          The split creates two sub-columns that align at bottom with the portrait.
          FLUSH LEFT alignment: All elements share the same X coordinate start.
        */}
        <div
          ref={leftColumnRef}
          className="flex min-h-0 min-w-0 flex-col self-stretch"
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          {/* Title block — vertically centered in the available upper space */}
          <div 
            ref={titleBlockRef}
            className="flex min-h-0 flex-1 items-center"
            data-gsap-scroll="title"
          >
            {titleBlock()}
          </div>

          {/* 
            Asymmetric horizontal split: Core stack (left) | Bio (right)
            Bottom edges align geometrically with portrait bottom
            FLUSH LEFT: Tools column starts at exact same X as title "H"
          */}
          <div 
            className="mt-auto grid shrink-0 items-end"
            style={{
              gridTemplateColumns: tools.length > 0 ? 'minmax(8rem, 0.38fr) minmax(0, 1fr)' : '1fr',
              columnGap: 'clamp(1.75rem, 3.5vw, 3rem)',
              alignItems: 'end',
            }}
          >
            {/* Left sub-column: Core stack badges (compact, vertical) — FLUSH LEFT with title */}
            <div ref={toolsBlockRef} data-gsap-scroll="tools">
              {toolsBlockCompact}
            </div>
            
            {/* Right sub-column: Bio description (60% opacity, airy line-height) */}
            {/* max-width reduced to 28rem to create more vertical gutter with portrait */}
            <div 
              ref={bioBlockRef}
              className="flex flex-col justify-end"
              style={{ maxWidth: '28rem' }} // Reduced from 32rem for more breathing room
              data-gsap-scroll="bio"
            >
              {/* Thin separator above bio */}
              <div
                aria-hidden
                className="mb-4 w-full max-w-[35ch]"
                style={{ 
                  height: 1, 
                  backgroundColor: bordure,
                  // INITIAL HIDDEN STATE (final opacity is 0.5)
                  opacity: 0,
                  transform: 'translateY(24px)',
                }}
                data-gsap-reveal="hairline-2"
                data-final-opacity="0.5"
              />
              {bioBlock}
            </div>
          </div>
        </div>

        {/* Portrait — légèrement plus haut qu'un carré, bottom-aligned with sub-columns */}
        {/* This container receives sticky/pin transform during scroll */}
        <div
          ref={portraitContainerRef}
          className="relative w-full self-stretch"
          style={{ gridColumn: 2, gridRow: 2, aspectRatio: '5 / 6' }}
          data-gsap-scroll="portrait-container"
        >
          {renderPortrait('(max-width: 1024px) 42vw, 32vw', 'absolute inset-0 h-full', portraitDesktopRef)}
        </div>
      </div>

      {/* —— Mobile — Stacked layout (maintains clarity on small screens) —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(7.25rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {/* Specialty tag at top right */}
        <p
          className="m-0 self-end text-right font-sans font-medium tracking-[-0.01em]"
          style={{
            color: principal,
            fontSize: 'clamp(1.15rem, 4vw, 1.35rem)',
            lineHeight: 1.3,
          }}
        >
          {specialty}
        </p>

        {/* Portrait */}
        <div className="relative mt-3 w-full" style={{ aspectRatio: '5 / 6' }}>
          {renderPortrait('92vw', 'absolute inset-0 h-full', portraitMobileRef)}
        </div>

        {/* Title */}
        {titleBlock({ mobile: true })}

        {/* Mobile: horizontal split for tools + bio */}
        <div className="mt-8 grid gap-6" style={{ gridTemplateColumns: '1fr' }}>
          {/* Tools block (full width on mobile) */}
          {tools.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <p
                className="m-0 font-sans font-medium uppercase tracking-[0.08em]"
                style={{
                  color: muted,
                  fontSize: '0.6875rem',
                  lineHeight: 1.3,
                }}
              >
                {toolsLabel}
              </p>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={toolsLabel}>
                {tools.map((tool) => (
                  <li
                    key={tool}
                    className="inline-flex items-center rounded-sm px-2 py-0.5 font-sans text-[0.75rem] font-medium tracking-[-0.01em]"
                    style={{
                      color: muted,
                      backgroundColor: chipSurface,
                      border: `1px solid ${chipBorder}`,
                    }}
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Separator */}
          <div
            aria-hidden
            className="w-full"
            style={{ height: 1, backgroundColor: bordure, opacity: 0.5 }}
          />

          {/* Bio with 60% opacity */}
          <p
            className="m-0 font-sans font-normal tracking-[-0.01em]"
            style={{ 
              color: ink, 
              opacity: 0.6,
              fontSize: '1rem', 
              lineHeight: 1.75,
            }}
          >
            {bio}
          </p>
        </div>
      </div>
    </section>
  );
}
