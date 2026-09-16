'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMemo, useLayoutEffect, useRef, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroImageGrayscaleClass, resolveHeroSpecialtyValue } from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

// Register GSAP plugins at module level
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MAX_THUMBS = 4;

/** Nearest scrollable ancestor (pages mode nests overflow-y-auto shells). */
function selectedWorksScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
 * Selected Works — Awwwards-level gallery hero.
 * 
 * Geometry optimisations:
 * - Bio paragraph top aligned with "Data scientist" title top
 * - "SEE ALL" button aligned with right edge of last card
 * - Consistent gaps and border-radius on cards
 * 
 * Motion choreography:
 * - Hover: grayscale(100%) → grayscale(0%) + scale 1.04
 * - Entry: cards cascade left to right with stagger
 * - Scroll: subtle horizontal parallax on card row
 */
export function PortfolioHeroSelectedWorks({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const imageBw = data.presentation.heroImageGrayscale === true;

  /** First name only — first word of the profile name. */
  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || 'Name';
  }, [data.fullName, data.nameLead]);

  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const dim = Math.min(
    80,
    Math.max(0, Math.round(data.presentation.heroSelectedWorksDimIntensity ?? 40))
  );
  const identityLayout = data.presentation.heroSelectedWorksIdentityLayout ?? 'split';
  const isCenteredIdentity = identityLayout === 'centered';

  const bio = useMemo(
    () => data.description?.replace(/\s+/g, ' ').trim() || '',
    [data.description]
  );

  const works = useMemo(() => {
    const list = (data.featuredWorks ?? []).filter((w) => w.imageUrl?.trim());
    return list.slice(0, MAX_THUMBS);
  }, [data.featuredWorks]);

  const workHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const linkClass =
    'font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition hover:opacity-70';

  const thumbGridClass =
    works.length === 1
      ? 'grid-cols-1'
      : works.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : works.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-4';

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

    const scroller = selectedWorksScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));

    // Element selections
    const titleBlock = pick('.pf-sw-title');
    const bioBlock = pick('.pf-sw-bio');
    const seeAllBtn = pick('.pf-sw-see-all');
    const workCards = pick('.pf-sw-card');
    const cardRow = pick('.pf-sw-card-row');

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* ──────────────────────────────────────────
       * A — Entry Animation Choreography
       * ────────────────────────────────────────── */

      // Title block
      if (titleBlock.length) {
        gsap.set(titleBlock, { y: 24, autoAlpha: 0 });
      }

      // Bio block
      if (bioBlock.length) {
        gsap.set(bioBlock, { y: 20, autoAlpha: 0 });
      }

      // SEE ALL button
      if (seeAllBtn.length) {
        gsap.set(seeAllBtn, { x: 16, autoAlpha: 0 });
      }

      // Work cards - cascade entrance
      if (workCards.length) {
        gsap.set(workCards, { y: 30, autoAlpha: 0, scale: 0.96 });
      }

      // Build the intro timeline
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          hero.dataset.pfEntry = 'done';
        },
      });

      // Title entrance
      if (titleBlock.length) {
        intro.to(titleBlock, { y: 0, autoAlpha: 1, duration: 0.9 }, 0);
      }

      // Bio entrance (slightly delayed)
      if (bioBlock.length) {
        intro.to(bioBlock, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.15);
      }

      // SEE ALL button
      if (seeAllBtn.length) {
        intro.to(seeAllBtn, { x: 0, autoAlpha: 1, duration: 0.7 }, 0.3);
      }

      // Work cards cascade - left to right with stagger
      if (workCards.length) {
        intro.to(
          workCards,
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.1, // 0.1s between each card
            ease: 'power2.out',
          },
          0.35
        );
      }

      return () => {};
    }, hero);

    /* ──────────────────────────────────────────
     * B — Scroll-Driven Horizontal Parallax (desktop only)
     * Cards shift slightly horizontally as user scrolls
     * ────────────────────────────────────────── */
    media.add('(min-width: 640px)', () => {
      // Subtle horizontal parallax on card row
      if (cardRow.length) {
        gsap.fromTo(
          cardRow,
          { x: 0 },
          {
            x: () => 30, // Shift 30px to the right
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Individual cards with asymmetric parallax for depth
      workCards.forEach((card, index) => {
        const offset = (index % 2 === 0 ? 1 : -1) * 8; // Alternate direction
        gsap.fromTo(
          card,
          { y: 0 },
          {
            y: offset,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
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
  }, [works.length]);

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-selected-works-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      <div
        className={`relative z-[1] flex min-h-[100dvh] flex-col pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.25rem+env(safe-area-inset-top,0px))] ${shellX}`}
        style={{
          paddingBottom: 'clamp(1.75rem, 4vh, 3rem)',
        }}
      >
        {/* Identity — split (name + bio) or centered title + separator */}
        {isCenteredIdentity ? (
          <div
            className="mt-8 flex min-h-0 w-full flex-1 flex-col sm:mt-[clamp(4rem,12vh,6.5rem)]"
          >
            <div className="pf-sw-title flex flex-1 flex-col items-center justify-center text-center">
              <h1
                className="m-0 font-sans font-semibold tracking-[-0.035em]"
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
                  lineHeight: 1.08,
                }}
              >
                <span style={{ color: principal }}>{firstName}</span>
                <span style={{ color: ink }}> /</span>
                <br />
                <span style={{ color: ink }}>{specialty}</span>
              </h1>
            </div>

            <div className="w-full py-[clamp(1.25rem,3vh,2rem)]" aria-hidden>
              <div
                className="mx-auto h-px w-full max-w-[min(100%,42rem)]"
                style={{ backgroundColor: bordure }}
              />
            </div>
          </div>
        ) : (
          /* 
           * GEOMETRY FIX: Split layout with perfect alignment
           * Bio paragraph top aligned with title top using items-start + align-items
           */
          <div
            className="mt-8 grid w-full gap-8 sm:mt-[clamp(4rem,12vh,6.5rem)] md:grid-cols-2 md:gap-12 lg:gap-16"
            style={{
              /* GEOMETRY: Align items at the top for perfect horizontal line */
              alignItems: 'start',
            }}
          >
            <div className="pf-sw-title flex min-w-0 flex-col items-start text-left">
              <h1
                className="m-0 font-sans font-semibold tracking-[-0.035em]"
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
                  lineHeight: 1.08,
                }}
              >
                <span style={{ color: principal }}>{firstName}</span>
                <span style={{ color: ink }}> /</span>
                <br />
                <span style={{ color: ink }}>{specialty}</span>
              </h1>
            </div>

            {bio ? (
              /* 
               * GEOMETRY FIX: Bio aligned with title top
               * Removed md:pt-1 to ensure perfect alignment
               */
              <p
                className="pf-sw-bio m-0 min-w-0 font-sans font-normal tracking-[-0.01em] md:text-left"
                style={{
                  color: muted,
                  fontSize: 'clamp(0.95rem, 1.2vw, 1.125rem)',
                  lineHeight: 1.55,
                  /* GEOMETRY: Small top padding to align with cap height of title */
                  paddingTop: '0.15em',
                }}
              >
                {bio}
              </p>
            ) : (
              <span className="hidden md:block" aria-hidden />
            )}
          </div>
        )}

        {/* Works block — See all + thumbnails */}
        {works.length > 0 ? (
          <div className="mt-auto flex w-full min-h-0 flex-col gap-4 pt-[clamp(2rem,6vh,4rem)]">
            {/* 
             * GEOMETRY FIX: SEE ALL aligned with right edge of grid
             * Using justify-end ensures alignment with last card
             */}
            <div className="flex w-full items-center justify-end">
              <a
                href={workHref}
                onClick={onNavClick(workHref)}
                className={`pf-sw-see-all inline-flex items-center gap-1.5 ${linkClass}`}
                style={{ color: muted }}
              >
                See all
                <span aria-hidden>→</span>
              </a>
            </div>

            {/* 
             * GEOMETRY FIX: Consistent gap and border-radius
             * gap-4 on mobile, gap-5 on desktop for perfect rhythm
             */}
            <ul 
              className={`pf-sw-card-row m-0 grid min-h-0 list-none gap-4 p-0 sm:gap-5 ${thumbGridClass}`}
            >
              {works.map((work, index) => {
                // Determine if this is an external link (not a hash link)
                const isExternalLink = work.href && !work.href.startsWith('#') && !work.href.startsWith('/');
                const isHashLink = work.href?.startsWith('#');
                const finalHref = work.href || workHref;
                
                return (
                <li key={work.id} className="pf-sw-card min-w-0">
                  <a
                    href={finalHref}
                    onClick={isHashLink ? onNavClick(finalHref) : undefined}
                    target={isExternalLink ? '_blank' : undefined}
                    rel={isExternalLink ? 'noopener noreferrer' : undefined}
                    className="pf-sw-card-link group relative block w-full overflow-hidden rounded-xl transition-transform duration-300 hover:scale-[1.01]"
                    style={{ 
                      height: 'clamp(14rem, 34vh, 22rem)',
                      /* GEOMETRY: Consistent border-radius */
                      borderRadius: '0.85rem',
                    }}
                    aria-label={work.title || 'View project'}
                  >
                    {/* 
                     * HOVER EFFECT: Image container with grayscale + zoom
                     * At rest: grayscale(100%) + opacity 60%
                     * On hover: grayscale(0%) + opacity 100% + scale 1.04
                     */}
                    <div className="pf-sw-card-image absolute inset-0 overflow-hidden rounded-xl">
                      <Image
                        src={work.imageUrl}
                        alt={work.title || 'Selected work'}
                        fill
                        sizes={
                          works.length === 1
                            ? '100vw'
                            : works.length === 2
                              ? '(max-width: 639px) 100vw, 50vw'
                              : works.length === 3
                                ? '(max-width: 639px) 100vw, 33vw'
                                : '(max-width: 639px) 100vw, 25vw'
                        }
                        className={`pf-sw-img object-cover object-center transition-all duration-400 ease-out ${
                          imageBw ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.04]'
                        }`}
                        style={{
                          /* Apply grayscale if not already B&W in settings */
                          filter: imageBw ? undefined : 'grayscale(100%)',
                          transitionProperty: 'filter, opacity, transform',
                          transitionDuration: '0.4s',
                          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                    {/* Dim overlay */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 transition-opacity duration-400 group-hover:opacity-0"
                      style={{ backgroundColor: `rgba(0,0,0,${dim / 100})` }}
                    />
                  </a>
                </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
