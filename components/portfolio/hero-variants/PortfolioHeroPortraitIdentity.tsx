'use client';

import Image from 'next/image';
import { useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  resolveHeroTwoWordDisplayName,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';

const FALLBACK_INTRO =
  'Ingénieur en informatique, passionné par des solutions innovantes et performantes.';

function resolveIntroCopy(source?: string | null) {
  const cleaned = source?.replace(/\s+/g, ' ').trim();
  return cleaned || FALLBACK_INTRO;
}

/**
 * Portrait identity — editorial 16:9 composition.
 * All colors come from the Hero / Global palette (fond, texteFort, texteMuted, bordure, principal, neutre).
 */
export function PortfolioHeroPortraitIdentity({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  const bio = useMemo(() => resolveIntroCopy(data.description), [data.description]);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const displayName = resolveHeroTwoWordDisplayName(data.fullName || data.nameLead || '');
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const swapBioName = data.presentation.heroBannerSwapBioName === true;
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (data.nameLead || data.fullName || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const onContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = data.contactHref || '#contact';
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const hairline = `1px solid color-mix(in srgb, ${bordure} 85%, transparent)`;

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

      {/* Desktop: height budget includes navbar padding so CTA stays on-screen */}
      <div className="relative z-[1] mx-auto hidden h-[100dvh] w-full max-w-[100rem] flex-col pb-8 pt-[calc(6.75rem+env(safe-area-inset-top,0px))] md:flex lg:pt-[calc(7.5rem+env(safe-area-inset-top,0px))]">
        <div className="flex min-h-0 w-full flex-1 flex-col">
          {/*
            Shared 3-col track so Available (top) and right column share the same left edge.
            Optional swap: bio ↔ name + specialty.
          */}
          <div
            className="grid w-full shrink-0"
            style={{
              gridTemplateColumns: 'minmax(18rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
              alignItems: 'last baseline',
            }}
          >
            {swapBioName ? (
              <div
                className="flex min-w-0 flex-col"
                style={{ gap: 'clamp(0.75rem, 1.2vh, 1.15rem)' }}
              >
                <IdentityName word={displayName} ink={ink} maxFontPx={108} minFontPx={56} />
                <p
                  className="m-0 overflow-hidden whitespace-nowrap font-sans font-normal leading-none tracking-[-0.015em]"
                  style={{
                    color: muted,
                    fontSize: 'clamp(1.15rem, 2vw, 2.35rem)',
                  }}
                >
                  {specialty}
                </p>
              </div>
            ) : (
              <p
                className="m-0 max-w-full text-left font-sans font-medium tracking-[-0.02em]"
                style={{
                  color: ink,
                  fontSize: 'clamp(1.15rem, 1.85vw, 2.25rem)',
                  lineHeight: 1.16,
                }}
              >
                {bio}
              </p>
            )}
            <div aria-hidden />
            <p
              className="m-0 justify-self-start whitespace-nowrap font-sans font-normal tracking-[-0.01em]"
              style={{
                color: muted,
                fontSize: 'clamp(0.85rem, 1.05vw, 1.25rem)',
                lineHeight: 1.16,
              }}
            >
              {availability}
            </p>
          </div>

          {/* Larger equal gap above + below the divider */}
          <div
            aria-hidden
            className="w-full shrink-0"
            style={{
              marginTop: 'clamp(2.5rem, 4.5vh, 3.75rem)',
              marginBottom: 'clamp(2.5rem, 4.5vh, 3.75rem)',
              borderTop: hairline,
            }}
          />

          <div
            className="grid w-full items-stretch"
            style={{
              gridTemplateColumns: 'minmax(18rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
            }}
          >
            <div
              className="relative aspect-[4/5] w-[min(100%,28rem)] max-h-[min(62vh,calc(100dvh-14rem))] justify-self-start overflow-hidden"
              style={{ backgroundColor: neutre }}
            >
              <IdentityPortrait
                avatarUrl={avatarUrl}
                initials={initials}
                muted={muted}
                className="absolute inset-0 h-full w-full"
              />
            </div>

            <div aria-hidden />

            <div className="flex min-w-0 flex-col self-stretch">
              {swapBioName ? (
                <p
                  className="m-0 max-w-full text-left font-sans font-medium tracking-[-0.02em]"
                  style={{
                    color: ink,
                    fontSize: 'clamp(1.15rem, 1.85vw, 2.25rem)',
                    lineHeight: 1.16,
                  }}
                >
                  {bio}
                </p>
              ) : (
                <div
                  className="flex min-w-0 flex-col"
                  style={{ gap: 'clamp(0.75rem, 1.2vh, 1.15rem)' }}
                >
                  <IdentityName word={displayName} ink={ink} maxFontPx={108} minFontPx={56} />
                  <p
                    className="m-0 overflow-hidden whitespace-nowrap font-sans font-normal leading-none tracking-[-0.015em]"
                    style={{
                      color: muted,
                      fontSize: 'clamp(1.15rem, 2vw, 2.35rem)',
                    }}
                  >
                    {specialty}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-6">
                <a
                  href={data.contactHref || '#contact'}
                  onClick={onContactClick}
                  className="inline-flex h-11 min-w-[9.5rem] items-center justify-center px-7 font-sans text-[0.95rem] font-normal tracking-[-0.01em] transition hover:brightness-110"
                  style={{
                    backgroundColor: principal,
                    color: '#FFFFFF',
                    borderRadius: 10,
                  }}
                >
                  Contact me
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="relative z-[1] flex min-h-[100dvh] flex-col px-[5%] pb-10 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:hidden">
        {swapBioName ? (
          <div className="min-w-0">
            <IdentityName word={displayName} ink={ink} mobile maxFontPx={72} minFontPx={36} />
            <p
              className="mt-3 font-sans font-normal leading-snug"
              style={{ color: muted, fontSize: 'clamp(1.2rem, 4.8vw, 1.75rem)' }}
            >
              {specialty}
            </p>
          </div>
        ) : (
          <p
            className="m-0 text-left font-sans font-medium tracking-[-0.02em]"
            style={{ color: ink, fontSize: 'clamp(1.35rem, 6vw, 2rem)', lineHeight: 1.16 }}
          >
            {bio}
          </p>
        )}
        <p className="mt-5 font-sans text-[0.95rem] font-normal leading-snug" style={{ color: muted }}>
          {availability}
        </p>
        <div
          className="w-full"
          style={{
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            borderTop: hairline,
          }}
        />
        <div className="min-w-0">
          {swapBioName ? (
            <p
              className="m-0 text-left font-sans font-medium tracking-[-0.02em]"
              style={{ color: ink, fontSize: 'clamp(1.35rem, 6vw, 2rem)', lineHeight: 1.16 }}
            >
              {bio}
            </p>
          ) : (
            <>
              <IdentityName word={displayName} ink={ink} mobile maxFontPx={72} minFontPx={36} />
              <p
                className="mt-3 font-sans font-normal leading-snug"
                style={{ color: muted, fontSize: 'clamp(1.2rem, 4.8vw, 1.75rem)' }}
              >
                {specialty}
              </p>
            </>
          )}
          <a
            href={data.contactHref || '#contact'}
            onClick={onContactClick}
            className="mt-6 inline-flex h-10 items-center justify-center px-6 font-sans text-[0.875rem] font-normal tracking-[-0.01em]"
            style={{ backgroundColor: principal, color: '#FFFFFF', borderRadius: 10 }}
          >
            Contact me
          </a>
        </div>
        <div
          className="relative mt-8 w-full overflow-hidden"
          style={{ aspectRatio: '3 / 3.4', backgroundColor: neutre }}
        >
          <IdentityPortrait
            avatarUrl={avatarUrl}
            initials={initials}
            muted={muted}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

function IdentityPortrait({
  avatarUrl,
  initials,
  muted,
  className,
}: {
  avatarUrl: string | null;
  initials: string;
  muted: string;
  className: string;
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover object-center"
          style={{ filter: 'grayscale(1) contrast(1.18) brightness(0.88)' }}
          priority
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-sans text-4xl font-normal tracking-tight"
          style={{ color: muted }}
          aria-hidden
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function IdentityName({
  word,
  ink,
  mobile = false,
  maxFontPx,
  minFontPx,
}: {
  word: string;
  ink: string;
  mobile?: boolean;
  maxFontPx: number;
  minFontPx: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      let lo = minFontPx;
      let hi = maxFontPx;
      text.style.transform = 'none';
      for (let i = 0; i < 20; i += 1) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= maxWidth) lo = mid;
        else hi = mid;
      }
      text.style.fontSize = `${Math.floor(lo * 100) / 100}px`;
      if (text.scrollWidth > maxWidth) {
        const scale = maxWidth / text.scrollWidth;
        text.style.transform = `scale(${scale})`;
        text.style.transformOrigin = 'left center';
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [maxFontPx, minFontPx, mobile, word]);

  return (
    <div ref={containerRef} className="w-full min-w-0 overflow-hidden">
      <h1
        ref={textRef}
        className="m-0 inline-block max-w-none whitespace-nowrap font-sans font-normal uppercase leading-[0.92] tracking-[-0.04em]"
        style={{ color: ink }}
      >
        {word}
      </h1>
    </div>
  );
}
