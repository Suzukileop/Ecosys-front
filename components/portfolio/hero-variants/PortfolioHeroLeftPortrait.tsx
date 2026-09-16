'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMemo, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react';
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

// Register GSAP plugins at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Nearest scrollable ancestor (pages mode nests overflow-y-auto shells). */
function leftPortraitScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

/**
 * Left Portrait — Awwwards-level editorial layout.
 * 
 * Geometry optimisations:
 * - Badge "Available for work" aligned with left edge of "Hello" title
 * - Bottom horizontal line: Let's talk button bottom aligned with photo bottom
 * - Breathing space between title and description
 * 
 * Motion choreography (GSAP + ScrollTrigger):
 * - Entry: photo reveal from bottom, title line-by-line, bio/CTAs cascade
 * - Scroll: sticky photo column, right column scrolls with parallax dissociation
 */
export function PortfolioHeroLeftPortrait({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

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

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const markSpecialty = data.presentation.heroLeftPortraitSpecialtyMark === true;

  const specialtyNode = markSpecialty ? (
    <span
      className="box-decoration-clone px-[0.12em]"
      style={{
        color: ink,
        backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
      }}
    >
      {specialty}
    </span>
  ) : (
    specialty
  );

  /* ───────────────────────────────────────────────────────────────────────────
   * GSAP Animation & ScrollTrigger
   * ─────────────────────────────────────────────────────────────────────────── */
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Reduced motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.dataset.pfEntry = 'off';
      return;
    }

    hero.dataset.pfEntry = 'running';

    const scroller = leftPortraitScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));

    // Element selections
    const photoMasks = pick('.pf-left-photo-mask');
    const photoInners = pick('.pf-left-photo-inner');
    const titleLines = pick('.pf-left-title-line');
    const titleInners = pick('.pf-left-title-inner');
    const availabilityEl = pick('.pf-left-availability');
    const bioElements = pick('.pf-left-bio-entry');
    const ctaElements = pick('.pf-left-cta-entry');
    const photoColumn = pick('.pf-left-photo-column');
    const contentColumn = pick('.pf-left-content-column');
    const titleBlock = pick('.pf-left-title-block');
    const bottomBlock = pick('.pf-left-bottom-block');

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* ──────────────────────────────────────────
       * A — Entry Animation Choreography
       * ────────────────────────────────────────── */

      // 1. Photo: reveal from bottom via clip-path mask
      if (photoMasks.length) {
        gsap.set(photoMasks, { clipPath: 'inset(100% 0% 0% 0%)' });
      }
      if (photoInners.length) {
        gsap.set(photoInners, { yPercent: 8 });
      }

      // 2. Title lines: slide up from mask
      if (titleInners.length) {
        gsap.set(titleInners, { yPercent: 110 });
      }
      
      // Individual characters start discrete (0.4 opacity) - ready for scroll reveal
      const titleChars = pick('.pf-left-char');
      if (titleChars.length) {
        gsap.set(titleChars, { 
          opacity: 0.35,
          filter: 'blur(0.8px)',
        });
      }

      // 3. Availability badge
      if (availabilityEl.length) {
        gsap.set(availabilityEl, { autoAlpha: 0, x: -16 });
      }

      // 4. Bio + CTAs: fade + slide up cascade
      const cascade = [...bioElements, ...ctaElements];
      if (cascade.length) {
        gsap.set(cascade, { y: 24, autoAlpha: 0 });
      }

      // Build the intro timeline
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          hero.dataset.pfEntry = 'done';
        },
      });

      // Photo reveal — mask wipe + inner parallax
      if (photoMasks.length) {
        intro.to(photoMasks, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2 }, 0);
      }
      if (photoInners.length) {
        intro.to(photoInners, { yPercent: 0, duration: 1.4, ease: 'power2.out' }, 0);
      }

      // Availability badge slide in
      if (availabilityEl.length) {
        intro.to(
          availabilityEl,
          { autoAlpha: 1, x: 0, duration: 0.7 },
          0.3
        );
      }

      // Title reveal — line by line with stagger
      // Title stays discrete (opacity 0.4) - scroll will reveal it fully
      if (titleInners.length) {
        intro.to(
          titleInners,
          {
            yPercent: 0,
            duration: 1.0,
            stagger: 0.12,
            ease: 'power3.out',
          },
          0.25
        );
      }

      // Bio cascade — staggered fade + slide (0.15s after title)
      if (bioElements.length) {
        intro.to(
          bioElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.1,
          },
          0.55
        );
      }

      // CTA buttons cascade (0.1s after bio)
      if (ctaElements.length) {
        intro.to(
          ctaElements,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.08,
          },
          0.7
        );
      }

      return () => {};
    }, hero);

    /* ──────────────────────────────────────────
     * B — Scroll-Driven Sticky + Parallax (desktop only)
     * Photo: sticky/pinned | Content: scrolls with parallax
     * Title: starts discrete, reveals on scroll then fades
     * ────────────────────────────────────────── */
    media.add('(min-width: 768px)', () => {
      // Photo column stays sticky while content scrolls
      if (photoColumn.length) {
        photoColumn.forEach((col) => {
          ScrollTrigger.create({
            trigger: hero,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            pin: col,
            pinSpacing: false,
          });
        });
      }

      // Title characters: reveal one by one on scroll (typewriter effect)
      const scrollChars = [...hero.querySelectorAll<HTMLElement>('.pf-left-char')];
      
      if (scrollChars.length) {
        // Phase 1: Typewriter reveal - characters appear progressively
        // Using ScrollTrigger with stagger for character-by-character reveal
        ScrollTrigger.create({
          trigger: hero,
          scroller,
          start: 'top top',
          end: '25% top', // Spread the reveal over this scroll distance
          scrub: 0.5, // Moderate scrub for smooth character reveal
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const totalChars = scrollChars.length;
            
            scrollChars.forEach((char, index) => {
              // Calculate when this character should be fully revealed
              const charProgress = index / totalChars;
              const charVisibility = Math.min(1, Math.max(0, (progress - charProgress * 0.7) / 0.3));
              
              // Interpolate opacity from 0.35 to 1
              const opacity = 0.35 + (charVisibility * 0.65);
              // Interpolate blur from 0.8px to 0px
              const blur = 0.8 - (charVisibility * 0.8);
              
              char.style.opacity = String(opacity);
              char.style.filter = `blur(${blur}px)`;
            });
          },
        });

        // Phase 2: Fade out all characters together
        gsap.to(
          scrollChars,
          {
            opacity: 0,
            y: -8,
            stagger: 0.008, // Slight stagger for wave effect on exit
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: '45% top',
              end: '75% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Title block fade out (for the container)
      titleBlock.forEach((block) => {
        gsap.to(
          block,
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: '40% top',
              end: '75% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // Bottom block (bio + CTAs) scrolls faster (1.25x) with opacity fade
      bottomBlock.forEach((block) => {
        gsap.fromTo(
          block,
          { y: 0, autoAlpha: 1 },
          {
            y: () => -hero.offsetHeight * 0.15,
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '80% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      return () => {};
    });

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      media.revert();
      ctx.revert();
    };
  }, []);

  /* ───────────────────────────────────────────────────────────────────────────
   * UI Components
   * ─────────────────────────────────────────────────────────────────────────── */

  const availabilityRow = (
    <div className="pf-left-availability flex items-center gap-2.5">
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

  // Split headline into lines for animation
  const headlineText = `Hello, I'm ${displayName} — a ${specialty}.`;
  const headlineLines = useMemo(() => {
    // Split at natural break: em-dash
    const parts = headlineText.split(/\s*—\s*/);
    if (parts.length >= 2) {
      return [parts[0].trim() + ' —', parts.slice(1).join(' — ').trim()];
    }
    return [headlineText];
  }, [headlineText]);

  // Split text into characters for typewriter reveal effect
  const splitIntoChars = (text: string): string[] => {
    return text.split('');
  };

  const headline = (opts?: { mobile?: boolean }) => (
    <h1
      className={`pf-left-title-block m-0 font-sans font-semibold tracking-[-0.035em] ${
        opts?.mobile ? 'mt-8 w-full' : 'max-w-[18ch]'
      }`}
      style={{
        color: ink,
        fontSize: opts?.mobile
          ? 'clamp(2.35rem, 10vw, 3.35rem)'
          : 'clamp(2.65rem, 4.6vw, 4.35rem)',
        lineHeight: 1.06,
      }}
    >
      {headlineLines.map((line, lineIdx) => (
        <span
          key={lineIdx}
          className="pf-left-title-line block overflow-hidden"
          style={{ marginBottom: lineIdx < headlineLines.length - 1 ? '0.06em' : 0 }}
        >
          <span className="pf-left-title-inner inline-block will-change-transform">
            {lineIdx === headlineLines.length - 1 && markSpecialty ? (
              <>
                {/* "a " characters */}
                {splitIntoChars('a ').map((char, i) => (
                  <span 
                    key={`pre-${i}`} 
                    className="pf-left-char inline-block"
                    style={{ opacity: 0.4 }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
                {/* Specialty word with highlight */}
                <span
                  className="box-decoration-clone px-[0.12em]"
                  style={{
                    backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
                  }}
                >
                  {splitIntoChars(specialty).map((char, i) => (
                    <span 
                      key={`spec-${i}`} 
                      className="pf-left-char inline-block"
                      style={{ opacity: 0.4 }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
                {/* Period */}
                <span className="pf-left-char inline-block" style={{ opacity: 0.4 }}>.</span>
              </>
            ) : (
              /* Regular line - split into characters */
              splitIntoChars(line).map((char, charIdx) => (
                <span 
                  key={charIdx} 
                  className="pf-left-char inline-block"
                  style={{ opacity: 0.4 }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))
            )}
          </span>
        </span>
      ))}
    </h1>
  );

  const ctaRow = (opts?: { mobile?: boolean }): ReactNode => {
    if (opts?.mobile) {
      return (
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="pf-left-cta-entry inline-flex h-12 w-full items-center justify-center rounded-full font-sans text-[0.95rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
          style={{ backgroundColor: ink, color: fond }}
        >
          View project
        </a>
      );
    }

    return (
      <div className="pf-left-cta-entry flex flex-wrap items-center justify-start gap-x-8 gap-y-3">
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

  const bioAndCta = (opts?: { mobile?: boolean }) => (
    <div
      className={`pf-left-bottom-block flex w-full flex-col items-start text-left ${
        opts?.mobile ? 'mt-8 max-w-none gap-6' : 'max-w-[32rem] gap-6'
      }`}
    >
      <p
        className="pf-left-bio-entry m-0 font-sans font-normal tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: opts?.mobile
            ? '1.0625rem'
            : 'clamp(1.05rem, 1.25vw, 1.1875rem)',
          lineHeight: 1.55,
        }}
      >
        {bio}
      </p>
      {ctaRow({ mobile: opts?.mobile })}
    </div>
  );

  const portrait = (sizes: string, className = '') => (
    <div
      className={`pf-left-photo-mask relative overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: neutre,
        border: `1px solid ${borderSoft}`,
      }}
    >
      <div className="pf-left-photo-inner h-full w-full will-change-transform">
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
    </div>
  );

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-left-portrait-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      {/* —— Desktop — global content width + gutter only —— */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] md:grid ${shellX}`}
        style={{
          paddingTop: 'calc(6.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          gridTemplateColumns: 'minmax(14rem, 34vw) minmax(0, 1fr)',
          columnGap: 'clamp(2rem, 5vw, 4.5rem)',
          alignItems: 'stretch',
        }}
      >
        {/* Photo column — will be pinned on scroll */}
        <div className="pf-left-photo-column relative">
          {portrait(
            '(max-width: 1024px) 40vw, 34vw',
            'h-full min-h-[28rem] w-full rounded-2xl'
          )}
        </div>

        {/* Content column — scrolls with parallax */}
        <div className="pf-left-content-column flex min-h-0 min-w-0 flex-col self-stretch">
          {/* 
            GEOMETRY FIX: Badge and title share the same left alignment
            The badge sits directly above the title with no extra offset
          */}
          <div className="shrink-0">
            {availabilityRow}
            {/* 
              GEOMETRY FIX: Added margin-top for title breathing space from badge
              And margin-bottom for space before the bottom block
            */}
            <div style={{ marginTop: 'clamp(1.5rem, 3vh, 2.25rem)' }}>
              {headline()}
            </div>
          </div>

          {/* 
            GEOMETRY FIX: Bio + CTAs positioned to align button bottom with photo bottom
            Using flex-1 and justify-end ensures the CTA aligns to the bottom
          */}
          <div 
            className="flex min-h-0 flex-1 flex-col items-start justify-end"
            style={{ 
              /* Extra breathing space between title and bio */
              paddingTop: 'clamp(3rem, 6vh, 5rem)',
              /* Align bottom with photo */
              paddingBottom: 0,
            }}
          >
            {bioAndCta()}
          </div>
        </div>
      </div>

      {/* —— Mobile — same global content width + gutter —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(5.75rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {availabilityRow}
        {headline({ mobile: true })}

        {portrait('92vw', 'mt-8 aspect-[3/4] w-full rounded-2xl')}

        <div className="flex w-full flex-col items-start">{bioAndCta({ mobile: true })}</div>
      </div>
    </div>
  );
}
