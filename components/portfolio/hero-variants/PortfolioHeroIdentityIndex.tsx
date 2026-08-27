'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  resolveHeroYearsOfExperienceValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const FALLBACK_BIO =
  'A software engineer and data scientist who turns complex problems into clear, reliable digital products through thoughtful systems and code.';

/**
 * Identity index — desktop: centered name / matching divider / 3-col rail / bio at bottom.
 * Mobile: left-aligned stacked name, full-width rule, value list, compact bio.
 */
export function PortfolioHeroIdentityIndex({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = useMemo(() => {
    const parts = (data.fullName || data.nameLead || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.length > 0 ? parts.join(' ') : 'Lorem Ipsum';
  }, [data.fullName, data.nameLead]);
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const years = resolveHeroYearsOfExperienceValue(data.yearsOfExperience, data.stats);
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const nameParts = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return { first: parts[0], rest: parts.slice(1).join(' ') };
    }
    return { first: parts[0] || displayName, rest: '' };
  }, [displayName]);

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || FALLBACK_BIO;
  }, [data.description]);

  const swapBioName = data.presentation.heroBannerSwapBioName === true;
  const showPortrait = data.presentation.heroIdentityIndexShowPortrait === true;
  const swapBioPortrait = data.presentation.heroIdentityIndexSwapBioPortrait === true;
  const portraitRadius = data.presentation.heroIdentityIndexPortraitRadius ?? 'none';
  const showBottomMedia = data.presentation.heroIdentityIndexShowBottomMedia === true;
  const bottomMediaUrl = data.presentation.heroIdentityIndexBottomMediaUrl?.trim() || null;
  const bottomMediaIsVideo = Boolean(
    bottomMediaUrl && /\.(mp4|webm|mov)(\?|$)/i.test(bottomMediaUrl)
  );
  const topIsBio = swapBioName && !showPortrait;
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = (data.fullName || data.nameLead || '?').split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [data.fullName, data.nameLead]);

  const portraitRadiusClass =
    portraitRadius === 'full'
      ? 'rounded-full'
      : portraitRadius === 'medium'
        ? 'rounded-2xl'
        : 'rounded-none';
  const portraitAspectClass = portraitRadius === 'full' ? 'aspect-square' : 'aspect-[4/5]';

  const railItems = [
    { label: 'Specialty', value: specialty },
    { label: 'Availability', value: availability },
    { label: 'Years of experience', value: years },
  ] as const;

  const nameHeading = (
    <h1
      className="m-0 w-max max-w-full text-left font-sans font-bold tracking-[-0.045em] [overflow-wrap:anywhere] lg:w-max lg:text-center lg:whitespace-nowrap"
      style={{
        color: ink,
        fontSize: 'clamp(3.75rem, 11vw, 12rem)',
        lineHeight: 0.86,
      }}
    >
      <span className="lg:hidden">
        {nameParts.first}
        {nameParts.rest ? (
          <>
            <br />
            {nameParts.rest}
          </>
        ) : null}
      </span>
      <span className="hidden lg:inline">{displayName}</span>
    </h1>
  );

  const bioParagraph = (
    <p
      className="m-0 w-full font-sans font-semibold tracking-[-0.02em] [text-wrap:pretty] text-[length:clamp(1.12rem,4.4vw,1.35rem)] leading-[1.4] lg:font-medium lg:text-[length:clamp(1.2rem,1.75vw,1.6rem)] lg:leading-[1.45]"
      style={{ color: ink }}
    >
      {bio}
    </p>
  );

  return (
    <div
      className="relative isolate w-full overflow-x-clip font-sans"
      style={{ backgroundColor: fond, color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      <div
        className={`relative z-[1] flex flex-col pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-12 lg:min-h-[100dvh] lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] lg:pb-16 ${shellX}`}
      >
        <div
          aria-hidden
          className="mx-auto hidden h-[3px] w-10 lg:block"
          style={{ backgroundColor: ink }}
        />

        <div
          className={
            topIsBio
              ? 'mt-2 w-full max-w-full text-left lg:mx-auto lg:mt-10 lg:max-w-[62%] lg:text-center'
              : 'mt-2 w-fit max-w-full lg:mx-auto lg:mt-10'
          }
        >
          {topIsBio ? bioParagraph : nameHeading}
        </div>

        <div
          aria-hidden
          className="mt-16 h-px w-full opacity-35 lg:opacity-100"
          style={{ backgroundColor: ink }}
        />

        <ul className="m-0 mt-5 grid w-full list-none grid-cols-1 gap-y-2.5 p-0 text-left lg:mt-5 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-x-8 lg:gap-y-0 lg:text-center">
          {railItems.map((item) => (
            <li key={item.label} className="min-w-0">
              <p
                className="m-0 hidden font-sans font-medium uppercase tracking-[0.14em] lg:block lg:whitespace-nowrap"
                style={{
                  color: muted,
                  fontSize: 'clamp(0.62rem, 0.72vw, 0.7rem)',
                  lineHeight: 1.15,
                }}
              >
                {item.label}
              </p>
              <p
                className="m-0 font-sans font-normal tracking-[-0.015em] text-[length:clamp(0.92rem,3.4vw,1.05rem)] leading-[1.35] lg:mt-1 lg:font-medium lg:whitespace-nowrap lg:text-[length:clamp(0.82rem,1.05vw,0.98rem)] lg:leading-[1.25]"
                style={{ color: ink }}
              >
                {item.value}
              </p>
            </li>
          ))}
        </ul>

        <div
          className={
            showPortrait
              ? `mt-5 grid w-full grid-cols-1 items-end gap-8 lg:mt-auto lg:gap-x-16 lg:pt-8 ${
                  swapBioPortrait
                    ? 'lg:grid-cols-[minmax(16rem,26rem)_minmax(0,1.15fr)]'
                    : 'lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,26rem)]'
                }`
              : swapBioName
                ? 'mt-auto w-fit max-w-full pt-8 lg:mx-auto'
                : 'mt-5 w-full max-w-full text-left lg:mx-auto lg:mt-auto lg:max-w-[62%] lg:pt-8 lg:text-center'
          }
        >
          {showPortrait ? (
            <>
              {swapBioPortrait ? (
                <>
                  <div
                    className={`relative ${portraitAspectClass} w-full max-w-[20rem] justify-self-start overflow-hidden lg:max-w-none ${portraitRadiusClass}`}
                    style={{ backgroundColor: neutre }}
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 320px, 416px"
                        className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                        priority
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center font-sans text-4xl font-semibold tracking-tight"
                        style={{ color: muted }}
                        aria-hidden
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">{bioParagraph}</div>
                </>
              ) : (
                <>
                  <div className="min-w-0 text-left">{bioParagraph}</div>
                  <div
                    className={`relative ${portraitAspectClass} w-full max-w-[20rem] justify-self-start overflow-hidden lg:max-w-none lg:justify-self-end ${portraitRadiusClass}`}
                    style={{ backgroundColor: neutre }}
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 320px, 416px"
                        className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                        priority
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center font-sans text-4xl font-semibold tracking-tight"
                        style={{ color: muted }}
                        aria-hidden
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : swapBioName ? (
            nameHeading
          ) : (
            bioParagraph
          )}
        </div>
      </div>

      {showBottomMedia ? (
        <div
          className={`relative z-[1] mt-12 shrink-0 overflow-hidden lg:mt-24 ${shellX}`}
        >
          <div
            className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:h-[100dvh] lg:min-h-[100dvh]"
            style={{ backgroundColor: neutre }}
          >
            {bottomMediaUrl ? (
              bottomMediaIsVideo ? (
                <video
                  src={bottomMediaUrl}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={imageBw ? { filter: 'grayscale(1)' } : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={bottomMediaUrl}
                  alt=""
                  fill
                  sizes="100vw"
                  className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                  priority
                />
              )
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-sans text-sm font-medium uppercase tracking-[0.14em]"
                style={{ color: muted }}
                aria-hidden
              >
                Media
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
