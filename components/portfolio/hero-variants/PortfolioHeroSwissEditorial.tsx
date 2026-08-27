'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroCurrentlyLabel,
  resolveHeroSignatureWord,
  resolveHeroSpecializedInLabel,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Swiss editorial Hero banner — paper canvas, statement + portrait,
 * Currently / Specialized-in rail between hairlines, cropped signature word.
 * Colors follow the Hero / Global palette (fond, texteFort, texteMuted, bordure).
 */
export function PortfolioHeroSwissEditorial({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const faint = resolveHeroPaletteColor(palette, 'texteFaint');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const statement =
    data.description?.trim() ||
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor, aenean massa.';
  const currentlyLabel = resolveHeroCurrentlyLabel(data.presentation);
  const specializedLabel = resolveHeroSpecializedInLabel(data.presentation);
  const availabilityValue = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const specialtyValue = resolveHeroSpecialtyValue(data.specialite);
  const signature = resolveHeroSignatureWord(
    data.presentation,
    data.nameLead || data.fullName || 'LOREM'
  );
  const swapBioName = data.presentation.heroBannerSwapBioName === true;
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (data.nameLead || data.fullName || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const hairline: CSSProperties = {
    borderColor: `color-mix(in srgb, ${bordure} 70%, transparent)`,
  };

  return (
    <div
      className="relative isolate flex min-h-[100dvh] min-h-screen w-full flex-col overflow-hidden"
      style={{ backgroundColor: fond, color: ink }}
    >
      {/* Full-bleed paper so Global wallpaper never peeks through Swiss banner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      <div
        className={`relative z-[1] flex flex-1 flex-col pb-0 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(6.25rem+env(safe-area-inset-top,0px))] lg:pt-[calc(6.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        {/* —— Desktop / tablet: statement left · portrait right —— */}
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          {/* Top hero content */}
          <div className="flex w-full shrink-0 items-start justify-between gap-[clamp(2.5rem,10%,7rem)]">
            {swapBioName ? (
              <div
                className="min-w-0 basis-[60%]"
                style={{ maxWidth: '62%', width: '60%' }}
              >
                <p
                  className="m-0 font-sans font-normal uppercase leading-[0.92] tracking-[-0.05em]"
                  style={{
                    color: ink,
                    fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
                  }}
                >
                  {signature}
                </p>
              </div>
            ) : (
              <p
                className="min-w-0 basis-[60%] text-[clamp(1.35rem,2.4vw,2.15rem)] font-medium leading-[1.4] tracking-[-0.02em] [text-wrap:pretty]"
                style={{
                  color: ink,
                  maxWidth: '62%',
                  width: '60%',
                }}
              >
                {statement}
              </p>
            )}
            <div className="shrink-0">
              <SwissPortrait
                avatarUrl={avatarUrl}
                initials={initials}
                ink={ink}
                neutre={neutre}
                imageBw={imageBw}
                className="aspect-[3/4] w-[min(28vw,22rem)] overflow-hidden"
                radiusClass="rounded-none"
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center px-0 py-[clamp(1.75rem,4vh,3.5rem)]">
            <div className="w-full">
              <div className="border-t" style={hairline} />
              <div className="grid grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] gap-x-10 py-[clamp(1.25rem,2.5vh,2rem)] sm:gap-x-16 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]">
                <SwissInfoBlock
                  label={currentlyLabel}
                  value={availabilityValue}
                  showBullet
                  muted={muted}
                  ink={ink}
                />
                <SwissInfoBlock
                  label={specializedLabel}
                  value={specialtyValue}
                  muted={muted}
                  ink={ink}
                />
              </div>
              <div className="border-t" style={hairline} />
            </div>
          </div>

          <div className="w-full shrink-0">
            {swapBioName ? (
              <p
                className="pb-8 pt-3 font-sans font-medium leading-[1.25] tracking-[-0.02em] [text-wrap:pretty] sm:pb-10"
                style={{
                  color: ink,
                  fontSize: 'clamp(1.35rem, 2.4vw, 2.15rem)',
                }}
              >
                {statement}
              </p>
            ) : (
              <SwissSignature word={signature} ink={ink} faint={faint} />
            )}
          </div>
        </div>

        {/* —— Mobile: stacked —— */}
        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          {swapBioName ? (
            <p
              className="m-0 font-sans font-normal uppercase leading-[0.92] tracking-[-0.05em]"
              style={{
                color: ink,
                fontSize: 'clamp(2.25rem, 12vw, 3.5rem)',
              }}
            >
              {signature}
            </p>
          ) : (
            <p
              className="max-w-full text-[clamp(1.35rem,6.2vw,1.85rem)] font-medium leading-[1.4] tracking-[-0.02em] [text-wrap:pretty]"
              style={{ color: ink }}
            >
              {statement}
            </p>
          )}

          <div className="mt-[5vh] w-full shrink-0">
            <SwissPortrait
              avatarUrl={avatarUrl}
              initials={initials}
              ink={ink}
              neutre={neutre}
              imageBw={imageBw}
              className="aspect-[4/5] w-full overflow-hidden"
              radiusClass="rounded-[1.25rem]"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center py-8">
            <div className="grid grid-cols-2 gap-x-4">
              <SwissInfoBlock
                label={currentlyLabel}
                value={availabilityValue}
                showBullet
                muted={muted}
                ink={ink}
              />
              <SwissInfoBlock
                label={specializedLabel}
                value={specialtyValue}
                muted={muted}
                ink={ink}
              />
            </div>
            <div className="mt-6 border-t" style={hairline} />
          </div>

          <div className="shrink-0">
            {swapBioName ? (
              <p
                className="pb-[max(1.75rem,env(safe-area-inset-bottom))] font-sans font-medium leading-[1.35] tracking-[-0.02em] [text-wrap:pretty]"
                style={{
                  color: ink,
                  fontSize: 'clamp(1.35rem, 6.2vw, 1.85rem)',
                }}
              >
                {statement}
              </p>
            ) : (
              <SwissSignature word={signature} ink={ink} faint={faint} mobile />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SwissInfoBlock({
  label,
  value,
  showBullet = false,
  muted,
  ink,
}: {
  label: string;
  value: string;
  showBullet?: boolean;
  muted: string;
  ink: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className="text-[0.8rem] font-medium uppercase tracking-[0.12em] sm:text-[0.875rem] sm:normal-case sm:tracking-[0.02em]"
        style={{ color: muted }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-[0.95rem] font-medium leading-snug tracking-[-0.01em] sm:text-[1.05rem]"
        style={{ color: ink }}
      >
        {showBullet ? (
          <span className="mr-1.5 inline-block" aria-hidden>
            •
          </span>
        ) : null}
        {value}
      </p>
    </div>
  );
}

function SwissPortrait({
  avatarUrl,
  initials,
  ink,
  neutre,
  imageBw,
  className,
  radiusClass,
}: {
  avatarUrl: string | null;
  initials: string;
  ink: string;
  neutre: string;
  imageBw: boolean;
  className: string;
  radiusClass: string;
}) {
  return (
    <div
      className={`relative ${radiusClass} ${className}`.trim()}
      style={{ backgroundColor: neutre }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 28vw"
          className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
          priority
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center text-4xl font-semibold tracking-tight sm:text-5xl ${heroImageGrayscaleClass(imageBw)}`}
          style={{ color: ink }}
          aria-hidden
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function SwissSignature({
  word,
  ink,
  faint,
  mobile = false,
}: {
  word: string;
  ink: string;
  faint: string;
  mobile?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      // Start large, then shrink until the full word fits in one line.
      const maxPx = mobile ? Math.min(maxWidth * 0.42, 160) : Math.min(maxWidth * 0.28, 220);
      const minPx = mobile ? 28 : 40;
      let size = maxPx;
      text.style.fontSize = `${size}px`;
      text.style.transform = 'none';

      // Binary search for the largest size that fits.
      let lo = minPx;
      let hi = maxPx;
      for (let i = 0; i < 16; i += 1) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= maxWidth) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      size = Math.floor(lo * 100) / 100;
      text.style.fontSize = `${size}px`;

      // Safety: if still slightly over (subpixel), scale down from left.
      if (text.scrollWidth > maxWidth) {
        const scale = maxWidth / text.scrollWidth;
        text.style.transform = `scale(${scale})`;
        text.style.transformOrigin = 'left bottom';
      } else {
        text.style.transform = 'none';
        text.style.transformOrigin = 'left bottom';
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [word, mobile]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible ${
        mobile
          ? 'mt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]'
          : 'pb-8 pt-3 sm:pb-10'
      }`}
      aria-hidden
    >
      <p
        ref={textRef}
        className="inline-block max-w-none select-none whitespace-nowrap font-sans font-normal uppercase leading-none tracking-[-0.06em]"
        style={{
          color: ink,
          textShadow: `0 0 0 ${faint}`,
        }}
      >
        {word}
      </p>
    </div>
  );
}
