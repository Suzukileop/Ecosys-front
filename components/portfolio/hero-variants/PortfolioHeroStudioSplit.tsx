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
  'We craft distinctive digital products and brand systems for ambitious teams — clear strategy, sharp design, and experiences that feel inevitable.';

/**
 * Studio split — Immersive Gate Design
 * 
 * Restructured per Google/Awwwards critique:
 * - Bold principal band with breathing room in the right block
 * - Large rounded media frame that overlaps the band edge
 * - GSAP "Gate Dynamic" scroll effect: media zooms to full screen as user scrolls
 * 
 * GSAP Animation hooks:
 * - On Load: Red bg appears → Text cascades in → Media focus (scale 0.85→1, blur 10px→0)
 * - Scroll: Media scales up to full viewport, texts/band fade out → immersive transition
 */
export function PortfolioHeroStudioSplit({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const imageBw = data.presentation.heroImageGrayscale === true;

  // Refs for GSAP animations
  const sectionRef = useRef<HTMLElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const mediaFrameRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
    return raw || 'Lorem Ipsum';
  }, [data.fullName, data.nameLead]);

  const eyebrow =
    data.presentation.heroStudioSplitEyebrow?.trim() || 'Portfolio';

  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const specialty = resolveHeroSpecialtyValue(data.specialite);

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || FALLBACK_BIO;
  }, [data.description]);

  const mediaUrl = data.presentation.heroStudioSplitMediaUrl?.trim() || null;
  const mediaIsVideo = Boolean(mediaUrl && /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl));
  const mediaWidth =
    data.presentation.heroStudioSplitMediaWidth === 'medium' ||
    data.presentation.heroStudioSplitMediaWidth === 'large' ||
    data.presentation.heroStudioSplitMediaWidth === 'full'
      ? data.presentation.heroStudioSplitMediaWidth
      : 'full';
  const mediaWidthClass =
    mediaWidth === 'medium'
      ? 'mx-auto w-full max-w-[min(100%,42rem)]'
      : mediaWidth === 'large'
        ? 'mx-auto w-full max-w-[min(100%,64rem)]'
        : 'w-full';

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  /** Text / chrome sitting on the principal band. */
  const onBand = fond;
  const bandMuted = `color-mix(in srgb, ${fond} 78%, transparent)`;

  // ========== ANIMATION: On Load Entry Sequence ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const band = bandRef.current;
    const leftBlock = leftBlockRef.current;
    const rightBlock = rightBlockRef.current;
    const mediaFrame = mediaFrameRef.current;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let delay = 100;

    // 1. LEFT BLOCK - Cascade in with vertical translation
    if (leftBlock) {
      const leftElements = leftBlock.querySelectorAll('[data-gsap-entry]');
      leftElements.forEach((el, index) => {
        const t = setTimeout(() => {
          (el as HTMLElement).style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        }, delay + index * 100);
        timers.push(t);
      });
    }

    delay += 300;

    // 2. RIGHT BLOCK - Cascade in with vertical translation
    if (rightBlock) {
      const rightElements = rightBlock.querySelectorAll('[data-gsap-entry]');
      rightElements.forEach((el, index) => {
        const t = setTimeout(() => {
          (el as HTMLElement).style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        }, delay + index * 100);
        timers.push(t);
      });
    }

    delay += 400;

    // 3. MEDIA FRAME - Scale + blur focus effect
    if (mediaFrame) {
      const t = setTimeout(() => {
        mediaFrame.style.transition = 'transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s ease-out, filter 1s ease-out';
        mediaFrame.style.transform = 'scale(1)';
        mediaFrame.style.opacity = '1';
        mediaFrame.style.filter = 'blur(0px)';
      }, delay);
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // ========== ANIMATION: Scroll Gate Dynamic Effect ==========
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches) return;

    const section = sectionRef.current;
    const band = bandRef.current;
    const leftBlock = leftBlockRef.current;
    const rightBlock = rightBlockRef.current;
    const mediaContainer = mediaContainerRef.current;
    const mediaFrame = mediaFrameRef.current;

    if (!section || !mediaFrame) return;

    let sectionTop = 0;
    let sectionHeight = 0;
    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;

    const updateBounds = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
      viewportHeight = window.innerHeight;
      viewportWidth = window.innerWidth;
    };

    setTimeout(updateBounds, 500); // Wait for entry animations

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;

      if (relativeScroll < 0) {
        // Reset to initial state
        if (band) band.style.opacity = '1';
        if (leftBlock) leftBlock.style.opacity = '1';
        if (rightBlock) rightBlock.style.opacity = '1';
        if (mediaFrame) {
          mediaFrame.style.transform = 'scale(1)';
          mediaFrame.style.borderRadius = '';
        }
        return;
      }

      // Calculate scroll progress (0 = top of section, 1 = scrolled through)
      const scrollRange = viewportHeight * 0.8; // Gate effect over 80% of viewport height
      const scrollProgress = Math.min(1, relativeScroll / scrollRange);

      // 1. TEXTS & BAND FADE OUT
      const fadeOutProgress = Math.min(1, scrollProgress * 2); // Fade faster
      if (band) {
        band.style.opacity = String(1 - fadeOutProgress * 0.9);
      }
      if (leftBlock) {
        leftBlock.style.opacity = String(1 - fadeOutProgress);
        leftBlock.style.transform = `translateY(${-scrollProgress * 50}px)`;
      }
      if (rightBlock) {
        rightBlock.style.opacity = String(1 - fadeOutProgress);
        rightBlock.style.transform = `translateY(${-scrollProgress * 40}px)`;
      }

      // 2. MEDIA FRAME SCALE UP (Gate Effect)
      // Calculate scale to fill viewport
      const mediaRect = mediaFrame.getBoundingClientRect();
      const initialWidth = mediaRect.width / (1 + scrollProgress * 0.5); // Approximate initial width
      const scaleToFillX = viewportWidth / initialWidth;
      const scaleToFillY = viewportHeight / (mediaRect.height / (1 + scrollProgress * 0.5));
      const maxScale = Math.max(scaleToFillX, scaleToFillY) * 1.1;
      
      // Smooth scale from 1 to maxScale
      const currentScale = 1 + (scrollProgress * (maxScale - 1));
      mediaFrame.style.transform = `scale(${Math.min(currentScale, maxScale)})`;
      
      // Gradually reduce border radius as it scales
      const borderRadius = Math.max(0, 40 * (1 - scrollProgress));
      mediaFrame.style.borderRadius = `${borderRadius}px`;

      // Move media container up as it scales
      if (mediaContainer) {
        const translateUp = scrollProgress * viewportHeight * 0.3;
        mediaContainer.style.transform = `translateY(${-translateUp}px)`;
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
    if (band) {
      band.style.transition = 'opacity 0.15s ease-out';
      band.style.willChange = 'opacity';
    }
    if (leftBlock) {
      leftBlock.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
      leftBlock.style.willChange = 'opacity, transform';
    }
    if (rightBlock) {
      rightBlock.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
      rightBlock.style.willChange = 'opacity, transform';
    }
    if (mediaFrame) {
      mediaFrame.style.transition = 'transform 0.2s ease-out, border-radius 0.15s ease-out';
      mediaFrame.style.willChange = 'transform, border-radius';
      mediaFrame.style.transformOrigin = 'center center';
    }
    if (mediaContainer) {
      mediaContainer.style.transition = 'transform 0.15s ease-out';
      mediaContainer.style.willChange = 'transform';
    }

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', updateBounds, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', updateBounds);
      [band, leftBlock, rightBlock, mediaFrame, mediaContainer].forEach((el) => {
        if (el) {
          el.style.transform = '';
          el.style.opacity = '';
          el.style.transition = '';
          el.style.willChange = '';
          el.style.borderRadius = '';
        }
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ backgroundColor: fond, minHeight: '150vh' }} // Extra height for scroll effect
      data-hero-variant="studio-split"
    >
      {/* Top principal band — copy lives here; media overlaps its bottom edge */}
      <div 
        ref={bandRef}
        className="relative" 
        style={{ backgroundColor: principal, color: onBand }}
        data-gsap-band
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
          style={{ backgroundColor: principal }}
        />

        <div
          className={`relative z-[1] pb-[clamp(8rem,20vw,16rem)] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:pb-[clamp(10rem,18vw,17rem)] lg:pt-[calc(6.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
        >
          <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
            {/* Left — eyebrow + Hi I'm name + specialty */}
            <div ref={leftBlockRef} className="min-w-0">
              <p
                className="m-0 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
                style={{ 
                  color: bandMuted,
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="eyebrow"
              >
                {eyebrow}
              </p>
              <h1
                className="m-0 mt-5 max-w-[14ch] font-sans font-bold tracking-[-0.045em]"
                style={{
                  color: onBand,
                  fontSize: 'clamp(2.6rem, 6.2vw, 4.75rem)',
                  lineHeight: 1.02,
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="title"
              >
                Hi, I&apos;m {displayName}
              </h1>
              <p
                className="m-0 mt-4 font-sans font-medium tracking-[-0.015em]"
                style={{
                  color: bandMuted,
                  fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                  lineHeight: 1.35,
                  // Millimetric margin below title for typographic impact
                  marginTop: 'clamp(1rem, 2vw, 1.5rem)',
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="specialty"
              >
                {specialty}
              </p>
            </div>

            {/* Right — bio + CTAs + availability */}
            {/* CORRECTED: More breathing room, higher position, increased line-height */}
            <div 
              ref={rightBlockRef}
              className="flex min-w-0 flex-col lg:pt-0"
              style={{ marginTop: '-0.5rem' }} // Move block slightly higher
            >
              <p
                className="m-0 max-w-[34rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
                style={{
                  color: bandMuted,
                  fontSize: 'clamp(0.98rem, 1.15vw, 1.125rem)',
                  lineHeight: 1.7, // INCREASED from 1.55 for more breathing room
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="bio"
              >
                {bio}
              </p>

              <div 
                className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4"
                style={{
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="ctas"
              >
                <a
                  href={primaryHref}
                  onClick={onNavClick(primaryHref)}
                  className="inline-flex h-12 items-center justify-center rounded-full px-7 font-sans text-[0.72rem] font-bold uppercase tracking-[0.14em] transition hover:brightness-110"
                  style={{ backgroundColor: onBand, color: principal }}
                >
                  Let&apos;s talk
                </a>
                <a
                  href={secondaryHref}
                  onClick={onNavClick(secondaryHref)}
                  className="inline-flex h-12 items-center justify-center rounded-full border px-7 font-sans text-[0.72rem] font-bold uppercase tracking-[0.14em] transition hover:opacity-85"
                  style={{ borderColor: onBand, color: onBand, backgroundColor: 'transparent' }}
                >
                  View my work
                </a>
              </div>

              <p
                className="m-0 mt-5 inline-flex items-center gap-2.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                style={{ 
                  color: bandMuted,
                  // INITIAL HIDDEN STATE
                  opacity: 0,
                  transform: 'translateY(30px)',
                }}
                data-gsap-entry="availability"
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: onBand }}
                  aria-hidden
                />
                {availability}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media frame — pulled up to overlap the band / page transition */}
      {/* This frame becomes the "GATE" that zooms to fill viewport on scroll */}
      <div
        ref={mediaContainerRef}
        className={`relative z-[2] -mt-[clamp(6rem,15vw,12rem)] pb-12 lg:pb-16 ${shellX}`}
        data-gsap-media-container
      >
        <div className={mediaWidthClass}>
          <div
            ref={mediaFrameRef}
            className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] lg:aspect-auto lg:h-[min(52vh,32rem)] lg:rounded-[2.5rem]"
            style={{ 
              backgroundColor: `color-mix(in srgb, ${ink} 8%, ${fond})`,
              // INITIAL HIDDEN STATE - scale + blur for focus effect
              transform: 'scale(0.85)',
              opacity: 0,
              filter: 'blur(10px)',
              transformOrigin: 'center center',
            }}
            data-gsap-media-frame
          >
            {mediaUrl ? (
              mediaIsVideo ? (
                <video
                  src={mediaUrl}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={imageBw ? { filter: 'grayscale(1)' } : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt=""
                  fill
                  sizes="100vw"
                  className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                  priority
                />
              )
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-sans text-sm font-medium uppercase tracking-[0.16em]"
                style={{ color: muted }}
                aria-hidden
              >
                Media
              </div>
            )}
          </div>

          <div
            aria-hidden
            className="mx-auto mt-8 h-[2px] w-20 lg:mt-10 lg:w-24"
            style={{ 
              backgroundColor: ink,
              // INITIAL HIDDEN STATE
              opacity: 0,
              transform: 'scaleX(0)',
            }}
            data-gsap-entry="divider"
          />
        </div>
      </div>
    </section>
  );
}
