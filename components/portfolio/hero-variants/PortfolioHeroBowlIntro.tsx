'use client';

import Image from 'next/image';
import { useMemo, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  type PortfolioHeroBowlIntroMotif,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const FALLBACK_BIO =
  'Ingénieur informatique passionné par les solutions innovantes et les expériences numériques claires.';

/** Soft green for the availability pill (matches reference; independent of Principal). */
const AVAILABLE_PILL_BG = '#E8F6EC';
const AVAILABLE_PILL_FG = '#1F7A3A';
const UNAVAILABLE_PILL_BG = '#F3F3F3';
const UNAVAILABLE_PILL_FG = '#6B6B6B';

function BowlIntroMotifLayer({
  motif,
  fill,
}: {
  motif: PortfolioHeroBowlIntroMotif;
  fill: string;
}) {
  if (motif === 'hug') {
    /* Bordure collée : cadre serré dès le milieu du portrait, bas arrondi sous le nom */
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] -z-10 w-[calc(100%+0.7rem)] -translate-x-1/2"
        style={{
          bottom: '-2.15rem',
          borderRadius: '1.55rem 1.55rem 2.6rem 2.6rem',
          backgroundColor: fill,
        }}
      />
    );
  }

  if (motif === 'orbs-top') {
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[14%] -top-[6%] -z-10 aspect-square w-[46%] rounded-full"
          style={{ backgroundColor: fill }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[14%] -top-[6%] -z-10 aspect-square w-[46%] rounded-full"
          style={{ backgroundColor: fill }}
        />
      </>
    );
  }

  if (motif === 'orbs-bottom') {
    /* Double cadre : même forme que l’image, décalé un peu à gauche et en bas */
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 aspect-[3/4] w-full -translate-x-6 translate-y-6 rounded-[1.65rem] lg:-translate-x-7 lg:translate-y-7 lg:rounded-[1.85rem]"
        style={{ backgroundColor: fill }}
      />
    );
  }

  /* bowl — demi-cercle sous le portrait */
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[62%] -z-10 w-[145%] -translate-x-1/2"
      style={{
        aspectRatio: '2 / 1',
        borderRadius: '0 0 50% 50% / 0 0 100% 100%',
        backgroundColor: fill,
      }}
    />
  );
}

/**
 * Bowl intro — left: availability pill, rounded portrait on a soft motif,
 * name under the card. Right: Hi I'm + specialty (principal), bio,
 * left-aligned View my work + Contact me.
 */
export function PortfolioHeroBowlIntro({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = (data.fullName || data.nameLead || 'Name').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const isAvailable = data.isAvailable !== false;
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || FALLBACK_BIO;
  }, [data.description]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const workHref = data.workHref || '#work';
  const contactHref = data.contactHref || '#contact';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const motif = data.presentation.heroBowlIntroMotif ?? 'bowl';
  const motifFill = `color-mix(in srgb, ${neutre} 70%, ${fond})`;
  const needsBottomPad = motif === 'bowl';
  const needsHugPad = motif === 'hug';
  const needsDoublePad = motif === 'orbs-bottom';

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

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
      {/* Soft principal glow — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[18%] z-0 h-[55%] w-[55%] rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${principal} 28%, transparent) 0%, transparent 70%)`,
        }}
      />

      <div
        className={`relative z-[1] flex flex-col pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-14 lg:min-h-[100dvh] lg:justify-center lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] lg:pb-16 ${shellX}`}
      >
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-14 xl:gap-x-20">
          {/* Left — badge + portrait on motif + name */}
          <div className="relative isolate z-0 mx-auto flex w-full max-w-[22rem] flex-col items-center lg:mx-0 lg:max-w-[26rem]">
            {showAvailability ? (
              <div
                className="relative z-[2] mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5"
                style={{
                  backgroundColor: isAvailable ? AVAILABLE_PILL_BG : UNAVAILABLE_PILL_BG,
                  borderColor: isAvailable
                    ? `color-mix(in srgb, ${AVAILABLE_PILL_FG} 28%, transparent)`
                    : `color-mix(in srgb, ${UNAVAILABLE_PILL_FG} 22%, transparent)`,
                  color: isAvailable ? AVAILABLE_PILL_FG : UNAVAILABLE_PILL_FG,
                }}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: isAvailable ? AVAILABLE_PILL_FG : UNAVAILABLE_PILL_FG }}
                  aria-hidden
                />
                <span className="font-sans text-[0.78rem] font-medium tracking-[-0.01em]">
                  {availability}
                </span>
              </div>
            ) : (
              <div className="mb-5 h-8" aria-hidden />
            )}

            <div
              className={`relative w-full ${
                needsBottomPad
                  ? 'pb-[min(42%,11rem)]'
                  : needsHugPad
                    ? 'pb-12'
                    : needsDoublePad
                      ? 'pb-8 pl-2'
                      : motif === 'orbs-top'
                        ? 'pt-6'
                        : ''
              }`}
            >
              <BowlIntroMotifLayer motif={motif} fill={motifFill} />

              <div
                className="relative z-[2] aspect-[3/4] w-full overflow-hidden rounded-[1.65rem] lg:rounded-[1.85rem]"
                style={{ backgroundColor: neutre }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    sizes="(max-width: 1023px) 88vw, 26rem"
                    className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-sans text-4xl font-bold tracking-[-0.04em]"
                    style={{ color: muted }}
                  >
                    {initials}
                  </div>
                )}
              </div>

              <p
                className="relative z-[2] mt-5 m-0 text-center font-sans font-bold tracking-[-0.03em]"
                style={{
                  color: ink,
                  fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                  lineHeight: 1.25,
                }}
              >
                {displayName}
              </p>
            </div>
          </div>

          {/* Right — specialty, bio, left CTAs (au-dessus du motif) */}
          <div className="relative z-[2] flex min-w-0 flex-col items-start text-left">
            <h1
              className="m-0 w-full max-w-[38rem] font-sans font-bold tracking-[-0.045em] text-balance"
              style={{
                color: principal,
                fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)',
                lineHeight: 1.02,
              }}
            >
              {specialty.replace(/\s*\/\s*/g, '\u00A0/\u00A0')}
            </h1>

            <p
              className="m-0 mt-7 max-w-[36rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: muted,
                fontSize: 'clamp(1.08rem, 1.35vw, 1.25rem)',
                lineHeight: 1.6,
              }}
            >
              {bio}
            </p>

            <div className="mt-8 flex w-full flex-wrap items-center justify-start gap-3 sm:gap-3.5">
              <a
                href={workHref}
                onClick={onNavClick(workHref)}
                className="inline-flex h-12 items-center justify-center rounded-full px-7 font-sans text-[0.92rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
                style={{ backgroundColor: principal, color: fond }}
              >
                View my work
              </a>
              <a
                href={contactHref}
                onClick={onNavClick(contactHref)}
                className="inline-flex h-12 items-center justify-center rounded-full border-2 px-7 font-sans text-[0.92rem] font-semibold tracking-[-0.01em] transition hover:opacity-85"
                style={{ borderColor: ink, color: ink, backgroundColor: 'transparent' }}
              >
                Contact me
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
