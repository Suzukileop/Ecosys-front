'use client';

import Image from 'next/image';
import { useMemo } from 'react';
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
  const scoop = 'clamp(3.5rem, 11vw, 7.5rem)';
  const panelPad = 'clamp(1.35rem, 3.2vw, 2.75rem)';
  const widthStyle = stageWidthStyle(width);
  const alignClass = stageAlignClass(align);

  const renderText = () => (
    <>
      <p
        className="m-0 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.7rem]"
        style={{ color: muted }}
      >
        {specialty}
      </p>
      <h1
        className="m-0 mt-[clamp(0.85rem,1.6vw,1.25rem)] max-w-[14ch] font-serif font-semibold tracking-[-0.03em]"
        style={{
          color: ink,
          fontSize: 'clamp(1.85rem, 4.2vw, 3.35rem)',
          lineHeight: 1.08,
        }}
      >
        {greeting}
      </h1>
      {description ? (
        <p
          className="m-0 mt-[clamp(0.75rem,1.4vw,1.15rem)] max-w-[36rem] font-sans font-normal tracking-[-0.01em]"
          style={{
            color: muted,
            fontSize: 'clamp(0.9375rem, 1.15vw, 1.0625rem)',
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
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

  return (
    <section
      className="relative isolate w-full overflow-x-clip"
      style={{ backgroundColor: fond, color: ink }}
      aria-label="Editorial hero"
    >
      {/* —— Desktop collage (vertically centered) —— */}
      <div
        className={`relative hidden min-h-[100dvh] md:flex md:items-center ${contentShellClass}`}
        style={{
          paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(1.25rem, 3vh, 2rem)',
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
            className="absolute left-0 top-0 m-0 w-full overflow-hidden rounded-2xl"
            style={{
              height: '78%',
              backgroundColor: mediaSurface,
            }}
          >
            {renderMedia('(min-width: 768px) 100vw, 100vw')}
          </figure>

          <div
            className="absolute left-0 z-[1]"
            style={{
              top: '55%',
              width: 'min(58%, 42rem)',
              backgroundColor: fond,
              borderTopRightRadius: scoop,
              padding: panelPad,
              paddingBottom: 'clamp(1.5rem, 3vw, 2.35rem)',
            }}
          >
            {renderText()}
          </div>
        </div>
      </div>

      {/* —— Mobile / tablet stacked —— */}
      <div
        className={`relative flex flex-col pb-12 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] md:hidden ${contentShellClass}`}
      >
        <div className={`relative w-full ${alignClass}`} style={widthStyle}>
          <figure
            className="relative m-0 w-full overflow-hidden rounded-2xl"
            style={{
              aspectRatio: '3 / 4',
              backgroundColor: mediaSurface,
            }}
          >
            {renderMedia('100vw')}
          </figure>
          <div
            className="relative z-[1] w-full"
            style={{
              marginTop: 'clamp(-2.5rem, -8vw, -1.75rem)',
              backgroundColor: fond,
              borderTopRightRadius: scoop,
              padding: panelPad,
            }}
          >
            {renderText()}
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
