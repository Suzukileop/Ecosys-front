'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroSpecialtyValue,
  type PortfolioHeroEditorialOverlapAlign,
  type PortfolioHeroEditorialOverlapWidth,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

export type EditorialOverlapHeroProps = {
  image: string | null;
  specialty: string;
  greeting: string;
  description: string;
  fond: string;
  ink: string;
  muted: string;
  neutre: string;
  contentShellClass: string;
  width: PortfolioHeroEditorialOverlapWidth;
  align: PortfolioHeroEditorialOverlapAlign;
  imageBw: boolean;
};

function stageWidthStyle(width: PortfolioHeroEditorialOverlapWidth): {
  width: string;
  maxWidth: string;
} {
  switch (width) {
    case 'medium':
      return { width: '100%', maxWidth: '56rem' };
    case 'large':
      return { width: '100%', maxWidth: '72rem' };
    case 'full':
    default:
      return { width: '100%', maxWidth: '100%' };
  }
}

function stageAlignClass(align: PortfolioHeroEditorialOverlapAlign): string {
  if (align === 'center') return 'ml-auto mr-auto';
  if (align === 'right') return 'ml-auto mr-0';
  return 'ml-0 mr-auto';
}

/** Nearest scrollable ancestor (pages mode nests overflow-y-auto shells). */
function overlapScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
 * Editorial overlap collage — full-bleed photo + scooped text panel.
 * Desktop: absolute overlap, vertically centered. Mobile: stacked tuck.
 */
export function EditorialOverlapHero({
  image,
  specialty,
  greeting,
  description,
  fond,
  ink,
  muted,
  neutre,
  contentShellClass,
  width,
  align,
  imageBw,
}: EditorialOverlapHeroProps) {
  const mediaSurface = `color-mix(in srgb, ${neutre} 55%, ${fond})`;
  /** One radius scale for the whole collage: the scoop answers the media frame corner. */
  const frameRadius = 'clamp(1.35rem, 2.1vw, 2.15rem)';
  const scoop = `calc(${frameRadius} * 3.4)`;
  const panelPad = 'clamp(1.35rem, 3.2vw, 2.75rem)';
  const widthStyle = stageWidthStyle(width);
  const alignClass = stageAlignClass(align);

  const renderText = () => (
    <>
      <p
        className="pf-overlap-tag m-0 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.7rem]"
        style={{ color: muted }}
      >
        {specialty}
      </p>
      <h1
        className="pf-overlap-title m-0 mt-[clamp(1rem,1.9vw,1.6rem)] max-w-[14ch] font-serif font-semibold tracking-[-0.03em]"
        style={{
          color: ink,
          fontSize: 'clamp(1.85rem, 4.2vw, 3.35rem)',
          lineHeight: 1.04,
        }}
      >
        {greeting}
      </h1>
      {description ? (
        <div className="pf-overlap-desc-fade mt-[clamp(1rem,1.7vw,1.5rem)]">
          <p
            className="pf-overlap-desc m-0 max-w-[36rem] font-sans font-normal tracking-[-0.01em]"
            style={{
              color: muted,
              fontSize: 'clamp(0.9375rem, 1.15vw, 1.0625rem)',
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        </div>
      ) : null}
    </>
  );

  const renderMedia = (sizes: string) =>
    image ? (
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes={sizes}
        className={`object-cover object-[center_30%] ${heroImageGrayscaleClass(imageBw)}`}
      />
    ) : (
      <div className="absolute inset-0" style={{ backgroundColor: mediaSurface }} aria-hidden />
    );

  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.dataset.pfEntry = 'off';
      return;
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);
    hero.dataset.pfEntry = 'running';

    const scroller = overlapScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));
    const frames = pick('.pf-overlap-media');
    const panels = pick('.pf-overlap-panel');
    const titles = pick('.pf-overlap-title');
    const tags = pick('.pf-overlap-tag');
    const descs = pick('.pf-overlap-desc');
    const shifts = pick('.pf-overlap-desktop .pf-overlap-panel-shift');
    const descFades = pick('.pf-overlap-desktop .pf-overlap-desc-fade');

    const media = gsap.matchMedia();
    const splits: SplitText[] = [];
    const dropSplits = () => {
      splits.forEach((split) => split.revert());
      splits.length = 0;
    };

    const ctx = gsap.context(() => {
      /* 2 — on load: the frame drops in, the panel rises from below, the title deploys line by line. */
      if (frames.length) gsap.set(frames, { y: -28, autoAlpha: 0 });
      if (panels.length) gsap.set(panels, { yPercent: 90, autoAlpha: 0 });
      if (tags.length) gsap.set(tags, { y: 12, autoAlpha: 0 });
      if (descs.length) gsap.set(descs, { y: 12, autoAlpha: 0 });

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          dropSplits();
          hero.dataset.pfEntry = 'done';
        },
      });

      if (frames.length) intro.to(frames, { y: 0, autoAlpha: 1, duration: 1.05 }, 0);
      if (panels.length) intro.to(panels, { yPercent: 0, autoAlpha: 1, duration: 1.1 }, 0.12);

      titles.forEach((title) => {
        const split = new SplitText(title, { type: 'lines', linesClass: 'pf-overlap-line' });
        splits.push(split);
        intro.from(split.lines, { yPercent: 100, autoAlpha: 0, duration: 0.9, stagger: 0.13 }, 0.42);
      });

      if (tags.length) intro.to(tags, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.74);
      if (descs.length) intro.to(descs, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.88);

      return dropSplits;
    }, hero);

    /* 3 — sliding split: the frame scrolls 1:1, the panel trails at 0.7, the description burns off. */
    media.add('(min-width: 768px)', () => {
      shifts.forEach((shift) => {
        gsap.fromTo(
          shift,
          { y: 0 },
          {
            y: () => Math.round(hero.offsetHeight * 0.3),
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      descFades.forEach((fade) => {
        gsap.fromTo(
          fade,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '38% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      media.revert();
      ctx.revert();
    };
  }, [description, greeting]);

  return (
    <section
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-overlap-hero relative isolate w-full overflow-clip"
      style={{ backgroundColor: fond, color: ink }}
      aria-label="Editorial hero"
    >
      {/* —— Desktop collage (vertically centered) —— */}
      <div
        className={`pf-overlap-desktop relative hidden min-h-[100dvh] md:flex md:items-center ${contentShellClass}`}
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.25rem, 5.5vh, 3.75rem)',
        }}
      >
        <div
          className={`relative ${alignClass}`}
          style={{
            ...widthStyle,
            minHeight: 'clamp(32rem, 72vh, 44rem)',
          }}
        >
          <figure
            className="pf-overlap-media absolute left-0 top-0 m-0 w-full overflow-hidden"
            style={{
              height: '78%',
              backgroundColor: mediaSurface,
              borderRadius: frameRadius,
            }}
          >
            {renderMedia('(min-width: 768px) 100vw, 100vw')}
          </figure>

          {/* Panel anchored on the stage floor: the breathing room below is now deterministic. */}
          <div
            className="pf-overlap-panel-shift absolute bottom-0 left-0 z-[1] flex flex-col"
            style={{
              width: 'min(58%, 42rem)',
              minHeight: '46%',
            }}
          >
            <div
              className="pf-overlap-panel flex flex-1 flex-col justify-end"
              style={{
                backgroundColor: fond,
                borderTopRightRadius: scoop,
                padding: panelPad,
                paddingBottom: 'clamp(1.85rem, 3.4vw, 2.85rem)',
              }}
            >
              {renderText()}
            </div>
          </div>
        </div>
      </div>

      {/* —— Mobile / tablet stacked —— */}
      <div
        className={`pf-overlap-mobile relative flex flex-col pb-14 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] md:hidden ${contentShellClass}`}
      >
        <div className={`relative w-full ${alignClass}`} style={widthStyle}>
          <figure
            className="pf-overlap-media relative m-0 w-full overflow-hidden"
            style={{
              aspectRatio: '3 / 4',
              backgroundColor: mediaSurface,
              borderRadius: frameRadius,
            }}
          >
            {renderMedia('100vw')}
          </figure>
          <div
            className="pf-overlap-panel-shift relative z-[1] flex w-full flex-col"
            style={{ marginTop: 'clamp(-2.5rem, -8vw, -1.75rem)' }}
          >
            <div
              className="pf-overlap-panel flex flex-1 flex-col"
              style={{
                backgroundColor: fond,
                borderTopRightRadius: scoop,
                padding: panelPad,
                paddingBottom: 'clamp(1.6rem, 5.5vw, 2.35rem)',
              }}
            >
              {renderText()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Portfolio banner wrapper — real specialty + greeting + bio.
 * Stage image is user-chosen (not profile avatar).
 */
export function PortfolioHeroEditorialOverlap({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  const displayName = (data.fullName || data.nameLead || '').trim() || 'there';
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const image = data.presentation.heroEditorialOverlapImageUrl?.trim() || null;
  const imageBw = data.presentation.heroImageGrayscale === true;

  const customHeadline = data.presentation.heroEditorialOverlapHeadline?.trim() || '';
  const greeting = customHeadline || `Hi, I'm ${displayName}.`;

  const width =
    data.presentation.heroEditorialOverlapWidth === 'medium' ||
    data.presentation.heroEditorialOverlapWidth === 'large' ||
    data.presentation.heroEditorialOverlapWidth === 'full'
      ? data.presentation.heroEditorialOverlapWidth
      : 'full';

  const align =
    data.presentation.heroEditorialOverlapAlign === 'left' ||
    data.presentation.heroEditorialOverlapAlign === 'center' ||
    data.presentation.heroEditorialOverlapAlign === 'right'
      ? data.presentation.heroEditorialOverlapAlign
      : 'left';

  const description = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim() || '';
    if (!cleaned) return '';
    if (cleaned.length <= 180) return cleaned;
    const cut = cleaned.slice(0, 177);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }, [data.description]);

  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  return (
    <EditorialOverlapHero
      image={image}
      specialty={specialty}
      greeting={greeting}
      description={description}
      fond={fond}
      ink={ink}
      muted={muted}
      neutre={neutre}
      contentShellClass={shellX}
      width={width}
      align={align}
      imageBw={imageBw}
    />
  );
}
