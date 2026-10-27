'use client';
import {resolveHeroGreeting} from '../portfolio-hero-headline-settings';

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
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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
      t('Du premier échange à la livraison, je construis des identités visuelles sensibles, cohérentes et durables pour les marques qui avancent.')
    );
  }, [data.description, t]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const showPrimaryCta = data.showContactCta !== false;
  const showSecondaryCta = data.showWorkCta !== false;
  const hasCtas = showPrimaryCta || showSecondaryCta;
  const borderSoft = `color-mix(in srgb, ${bordure} 80%, transparent)`;
  const panelSurface = `color-mix(in srgb, ${neutre} 72%, transparent)`;

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const markSpecialty = data.presentation.heroLeftPortraitSpecialtyMark === true;

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
    const pick = (selector: string) =>
      Array.from(hero.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => element.getClientRects().length > 0
      );

    // Element selections
    const photoMasks = pick('.pf-left-photo-mask');
    const photoInners = pick('.pf-left-photo-inner');
    const titleInners = pick('.pf-left-title-inner');
    const availabilityEl = pick('.pf-left-availability');
    const bioElements = pick('.pf-left-bio-entry');
    const ctaElements = pick('.pf-left-cta-entry');
    const photoColumn = pick('.pf-left-photo-column');
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
      
      // Characters begin slightly softened, then become fully legible during the intro.
      const titleChars = pick('.pf-left-char');
      if (titleChars.length) {
        gsap.set(titleChars, { 
          opacity: 0.62,
          filter: 'blur(0.45px)',
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

      if (titleChars.length) {
        intro.to(
          titleChars,
          {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.32,
            stagger: 0.009,
            ease: 'power2.out',
          },
          0.5
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

      // Title characters remain fully legible after entry; scroll only handles the exit.
      const scrollChars = [...hero.querySelectorAll<HTMLElement>('.pf-left-char')].filter(
        (element) => element.getClientRects().length > 0
      );
      if (scrollChars.length) {
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
    <div data-hero-availability
      className="pf-left-availability inline-flex w-fit items-center gap-2.5 px-3 py-2"
      style={{ backgroundColor: fond, color: ink }}
    >
      <span
        className="inline-block size-1.5 shrink-0"
        style={{ backgroundColor: principal }}
        aria-hidden
      />
      <p
        className="m-0 font-sans font-semibold uppercase leading-none tracking-[0.08em]"
        style={{
          color: ink,
          fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)',
        }}
      >
        {availability}
      </p>
    </div>
  );

  // Split headline into lines for animation
  const headlineText = resolveHeroGreeting(data.presentation,`Hello, I'm ${displayName} — a ${specialty}.`,displayName,specialty);
  const headlineLines = (() => {
    // Split at natural break: em-dash
    const parts = headlineText.split(/\s*—\s*/);
    if (parts.length >= 2) {
      return [parts[0].trim(), `— ${parts.slice(1).join(' — ').trim()}`];
    }
    return [headlineText];
  })();

  // Split text into characters for typewriter reveal effect
  const splitIntoChars = (text: string): string[] => {
    return text.split('');
  };

  const animatedWords = (text: string, keyPrefix: string, highlighted = false): ReactNode[] => {
    const tokens = text.split(/\s+/).filter(Boolean);
    const words: string[] = [];
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index] === '—' && tokens[index + 1]) {
        words.push(`${tokens[index]}\u00A0${tokens[index + 1]}`);
        index += 1;
      } else {
        words.push(tokens[index]);
      }
    }
    return words.map((word, wordIndex) => (
      <span key={`${keyPrefix}-word-${wordIndex}`}>
        <span
          className="inline-block whitespace-nowrap"
          style={
            highlighted
              ? {
                  backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
                }
              : undefined
          }
        >
          {splitIntoChars(word).map((char, charIndex) => (
            <span
              key={`${keyPrefix}-${wordIndex}-${charIndex}`}
              className="pf-left-char inline-block"
              style={{ opacity: 1 }}
            >
              {char}
            </span>
          ))}
        </span>
        {wordIndex < words.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  const headline = (opts?: { mobile?: boolean; tablet?: boolean }) => (
    <h1
      className={`pf-left-title-block m-0 font-sans font-semibold tracking-[-0.035em] ${
        opts?.mobile ? 'mt-8 w-full' : opts?.tablet ? 'w-full max-w-[16ch]' : 'max-w-[18ch]'
      }`}
      style={{
        color: ink,
        fontSize: opts?.mobile
          ? 'clamp(2.35rem, 10vw, 3.35rem)'
          : opts?.tablet
            ? 'clamp(2.4rem, 5vw, 3.25rem)'
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
                {animatedWords('— a', 'pre')} {' '}
                {animatedWords(specialty, 'spec', true)}
                <span className="pf-left-char inline-block" style={{ opacity: 1 }}>.</span>
              </>
            ) : (
              animatedWords(line, `line-${lineIdx}`)
            )}
            {lineIdx < headlineLines.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </h1>
  );

  const ctaRow = (opts?: { mobile?: boolean }): ReactNode => {
    if (!hasCtas) return null;
    return (
      <div
        className={`pf-left-cta-entry flex flex-wrap items-center ${
          opts?.mobile ? 'gap-x-5 gap-y-3' : 'gap-x-7 gap-y-3'
        }`}
      >
        {showPrimaryCta ? (
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className="group inline-flex shrink-0 items-center gap-3 font-sans text-[0.88rem] font-semibold uppercase tracking-[0.08em]"
          style={{ color: ink }}
        >
          <span
            className="inline-flex size-11 items-center justify-center rounded-full transition-transform group-hover:rotate-45"
            style={{ backgroundColor: ink, color: fond }}
            aria-hidden
          >
            ↗
          </span>
          {t('Let\'s talk')}
        </a>
        ) : null}
        {showSecondaryCta ? (
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="shrink-0 font-sans text-[0.88rem] font-semibold uppercase tracking-[0.08em] transition hover:opacity-65"
          style={{ color: ink }}
        >
          {t('View project')} <span aria-hidden>→</span>
        </a>
        ) : null}
      </div>
    );
  };

  const bioAndCta = (opts?: { mobile?: boolean }) => (
    <div
      className={`pf-left-bottom-block flex w-full flex-col items-start text-left ${
        opts?.mobile ? 'mt-8 max-w-none gap-6 p-5' : 'max-w-[36rem] gap-6 p-7'
      }`}
      style={{
        backgroundColor: panelSurface,
        boxShadow: `inset 0.35rem 0 0 ${principal}`,
      }}
    >
      <p data-hero-bio
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
      {hasCtas ? ctaRow({ mobile: opts?.mobile }) : null}
    </div>
  );

  const portrait = (sizes: string, className = '') => (
    <div
      className={`pf-left-photo-mask relative overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: neutre,
        border: data.presentation.heroImageBorder === false ? undefined : `1px solid ${borderSoft}`,
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 2.25rem), calc(100% - 2.25rem) 100%, 0 100%)',
      }}
    >
      <div className="pf-left-photo-inner relative h-full w-full will-change-transform">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={t('Portrait of {displayName}', { displayName })}
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
      {showAvailability ? (
        <div className="absolute left-0 top-6 z-[2]">{availabilityRow}</div>
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-4 right-4 z-[2] inline-flex size-12 items-center justify-center font-serif text-xl font-semibold"
        style={{ backgroundColor: fond, color: principal }}
      >
        {initials}
      </span>
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
        className={`relative z-[1] hidden h-[100dvh] min-h-0 xl:grid ${shellX}`}
        style={{
          paddingTop: 'calc(6.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          gridTemplateColumns: 'minmax(18rem, 36vw) minmax(0, 1fr)',
          columnGap: 'clamp(2rem, 5vw, 4.5rem)',
          alignItems: 'stretch',
        }}
      >
        {/* Photo column — will be pinned on scroll */}
        <div className="pf-left-photo-column relative">
          {portrait(
            '36vw',
            'h-full min-h-0 w-full'
          )}
        </div>

        {/* Content column — scrolls with parallax */}
        <div className="pf-left-content-column relative flex min-h-0 min-w-0 flex-col self-stretch overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[5%] top-1/2 -translate-y-1/2 select-none font-serif font-semibold leading-none"
            style={{
              color: `color-mix(in srgb, ${ink} 5%, transparent)`,
              fontSize: 'clamp(12rem, 21vw, 25rem)',
            }}
          >
            {initials}
          </span>
          {/* 
            GEOMETRY FIX: Badge and title share the same left alignment
            The badge sits directly above the title with no extra offset
          */}
          <div className="relative z-[1] shrink-0">
            {headline()}
          </div>

          {/* 
            GEOMETRY FIX: Bio + CTAs positioned to align button bottom with photo bottom
            Using flex-1 and justify-end ensures the CTA aligns to the bottom
          */}
          <div 
            className="relative z-[1] flex min-h-0 flex-1 flex-col items-start justify-end"
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

      {/* —— Tablet — dedicated cover composition, portrait left and readable copy right —— */}
      <div
        className={`relative z-[1] hidden h-[100dvh] min-h-0 grid-cols-[minmax(17rem,0.9fr)_minmax(0,1.1fr)] gap-x-8 pb-6 pt-[calc(6rem+env(safe-area-inset-top,0px))] md:grid xl:hidden ${shellX}`}
      >
        <div className="pf-left-photo-column flex min-h-0 items-center">
          {portrait('42vw', 'aspect-[4/5] w-full')}
        </div>

        <div className="pf-left-content-column relative flex min-h-0 min-w-0 flex-col justify-between overflow-hidden py-4">
          <span
            aria-hidden
            className="pointer-events-none absolute left-[4%] top-1/2 -translate-y-1/2 select-none font-serif text-[15rem] font-semibold leading-none"
            style={{ color: `color-mix(in srgb, ${ink} 5%, transparent)` }}
          >
            {initials}
          </span>
          <div className="relative z-[1] shrink-0">{headline({ tablet: true })}</div>
          <div className="relative z-[1] mt-8">{bioAndCta()}</div>
        </div>
      </div>

      {/* —— Mobile — same global content width + gutter —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(5.75rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {headline({ mobile: true })}

        {portrait('92vw', 'mt-8 aspect-[4/5] w-full')}

        <div className="flex w-full flex-col items-start">{bioAndCta({ mobile: true })}</div>
      </div>
    </div>
  );
}
