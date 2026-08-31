'use client';

import Image from 'next/image';
import { useMemo } from 'react';
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
 * Portrait balance — specialty (principal) above color portrait (right);
 * headline vertically centered beside the image; tools tags + hairline above
 * the bio; portrait bottom edge aligns with the bio’s last line.
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

  const portraitBox = (sizes: string, className = '') => (
    <div
      className={`relative w-full overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: `color-mix(in srgb, ${bordure} 28%, ${fond})`,
      }}
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

  const toolsBlock =
    tools.length > 0 ? (
      <div className="flex max-w-[40rem] flex-col gap-2.5">
        <p
          className="m-0 font-sans font-medium tracking-[-0.01em]"
          style={{
            color: muted,
            fontSize: 'clamp(0.8125rem, 0.95vw, 0.875rem)',
            lineHeight: 1.3,
          }}
        >
          {toolsLabel}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label={toolsLabel}>
          {tools.map((tool) => (
            <li
              key={tool}
              className="inline-flex items-center rounded-md px-2.5 py-1 font-sans text-[0.8125rem] font-medium tracking-[-0.01em]"
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

  const hairline = (
    <div aria-hidden className="w-full max-w-[34rem]" style={{ height: 1, backgroundColor: bordure }} />
  );

  const titleBlock = (opts?: { mobile?: boolean }) => (
    <div className={`flex w-full flex-col ${opts?.mobile ? 'mt-8 gap-4' : 'gap-3.5'}`}>
      <p
        className="m-0 font-sans font-medium tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: opts?.mobile
            ? 'clamp(0.95rem, 3.5vw, 1.05rem)'
            : 'clamp(0.95rem, 1.1vw, 1.0625rem)',
          lineHeight: 1.35,
        }}
      >
        {availability}
      </p>
      <div
        aria-hidden
        className="w-full max-w-[16ch]"
        style={{ height: 1, backgroundColor: bordure }}
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
        }}
      >
        Hi, I&apos;m {displayName}.
      </h1>
    </div>
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

      {/* —— Desktop — global content width + gutter only —— */}
      <div
        className={`relative z-[1] hidden md:grid lg:min-h-[100dvh] ${shellX}`}
        style={{
          paddingTop: 'calc(8.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(17rem, 32vw)',
          gridTemplateRows: 'auto minmax(0, auto)',
          columnGap: 'clamp(2.25rem, 5vw, 4.5rem)',
          rowGap: 0,
          alignItems: 'stretch',
        }}
      >
        {/* Specialty — top right */}
        <p
          className="m-0 mb-3 self-end justify-self-end text-right font-sans font-medium tracking-[-0.01em]"
          style={{
            gridColumn: 2,
            gridRow: 1,
            color: principal,
            fontSize: 'clamp(1.15rem, 1.5vw, 1.45rem)',
            lineHeight: 1.3,
          }}
        >
          {specialty}
        </p>

        {/*
          Same row as the portrait: title centered in the free space;
          tools + hairline + bio pinned to the bottom → bio last line
          aligns with image bottom.
        */}
        <div
          className="flex min-h-0 min-w-0 flex-col self-stretch"
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          <div className="flex min-h-0 flex-1 items-center">{titleBlock()}</div>

          <div className="flex shrink-0 flex-col gap-5">
            {toolsBlock}
            {hairline}
            <p
              className="m-0 max-w-[34rem] font-sans font-normal tracking-[-0.01em]"
              style={{
                color: ink,
                fontSize: 'clamp(0.95rem, 1.1vw, 1.0625rem)',
                lineHeight: 1.55,
              }}
            >
              {bio}
            </p>
          </div>
        </div>

        {/* Portrait — légèrement plus haut qu’un carré */}
        <div
          className="relative w-full self-stretch"
          style={{ gridColumn: 2, gridRow: 2, aspectRatio: '5 / 6' }}
        >
          {portraitBox('(max-width: 1024px) 42vw, 32vw', 'absolute inset-0 h-full')}
        </div>
      </div>

      {/* —— Mobile — same global content width + gutter —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(7.25rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
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

        <div className="relative mt-3 w-full" style={{ aspectRatio: '5 / 6' }}>
          {portraitBox('92vw', 'absolute inset-0 h-full')}
        </div>

        {titleBlock({ mobile: true })}

        {toolsBlock ? <div className="mt-6">{toolsBlock}</div> : null}

        <div
          aria-hidden
          className="mt-6 w-full"
          style={{ height: 1, backgroundColor: bordure }}
        />

        <p
          className="m-0 mt-6 font-sans font-normal tracking-[-0.01em]"
          style={{ color: ink, fontSize: '1rem', lineHeight: 1.55 }}
        >
          {bio}
        </p>
      </div>
    </div>
  );
}
