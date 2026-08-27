'use client';

import Image from 'next/image';
import { useMemo, type MouseEvent } from 'react';
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
 * Studio split — bold top band (eyebrow + Hi I'm name / experience | bio + CTAs + availability)
 * and a large rounded media frame below that overlaps the band edge.
 */
export function PortfolioHeroStudioSplit({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const imageBw = data.presentation.heroImageGrayscale === true;

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

  return (
    <div className="relative isolate w-full overflow-x-clip font-sans" style={{ backgroundColor: fond }}>
      {/* Top principal band — copy lives here; media overlaps its bottom edge */}
      <div className="relative" style={{ backgroundColor: principal, color: onBand }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
          style={{ backgroundColor: principal }}
        />

        <div
          className={`relative z-[1] pb-[clamp(7rem,18vw,14rem)] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:pb-[clamp(9rem,16vw,15rem)] lg:pt-[calc(6.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
        >
          <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
            {/* Left — eyebrow + Hi I'm name + specialty */}
            <div className="min-w-0">
              <p
                className="m-0 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em]"
                style={{ color: bandMuted }}
              >
                {eyebrow}
              </p>
              <h1
                className="m-0 mt-5 max-w-[14ch] font-sans font-bold tracking-[-0.045em]"
                style={{
                  color: onBand,
                  fontSize: 'clamp(2.6rem, 6.2vw, 4.75rem)',
                  lineHeight: 1.02,
                }}
              >
                Hi, I&apos;m {displayName}
              </h1>
              <p
                className="m-0 mt-4 font-sans font-medium tracking-[-0.015em]"
                style={{
                  color: bandMuted,
                  fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                  lineHeight: 1.35,
                }}
              >
                {specialty}
              </p>
            </div>

            {/* Right — bio + CTAs + availability */}
            <div className="flex min-w-0 flex-col lg:pt-1">
              <p
                className="m-0 max-w-[36rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
                style={{
                  color: bandMuted,
                  fontSize: 'clamp(0.98rem, 1.15vw, 1.125rem)',
                  lineHeight: 1.55,
                }}
              >
                {bio}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
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
                className="m-0 mt-6 inline-flex items-center gap-2.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: bandMuted }}
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
      <div
        className={`relative z-[2] -mt-[clamp(5.5rem,14vw,11rem)] pb-12 lg:pb-16 ${shellX}`}
      >
        <div className={mediaWidthClass}>
          <div
            className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] lg:aspect-auto lg:h-[min(52vh,30rem)] lg:rounded-[2.5rem]"
            style={{ backgroundColor: `color-mix(in srgb, ${ink} 8%, ${fond})` }}
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
            style={{ backgroundColor: ink }}
          />
        </div>
      </div>
    </div>
  );
}
