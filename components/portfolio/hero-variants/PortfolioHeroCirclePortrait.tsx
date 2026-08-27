'use client';

import Image from 'next/image';
import { useMemo, type MouseEvent, type ReactNode } from 'react';
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
import {
  portfolioHeroContentShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Circle portrait — circular portrait left with availability under it;
 * title / bio / CTAs on the right. Optional: title at bottom, bio+CTAs
 * centered on the image (vertical + horizontal).
 */
export function PortfolioHeroCirclePortrait({ data }: { data: PortfolioHeroData }) {
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
      'Du premier échange à la livraison, je construis des identités visuelles sensibles, cohérentes et durables pour les marques qui avancent.'
    );
  }, [data.description]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const borderSoft = `color-mix(in srgb, ${bordure} 80%, transparent)`;
  const markSpecialty = data.presentation.heroCirclePortraitSpecialtyMark === true;
  /** Default layout is title at the bottom; toggle “Titre en haut” turns this off. */
  const titleBottom = data.presentation.heroCirclePortraitTitleBottom !== false;

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const specialtyNode = markSpecialty ? (
    <span
      className="box-decoration-clone px-[0.12em] font-bold"
      style={{
        color: ink,
        backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
      }}
    >
      {specialty}
    </span>
  ) : (
    <span className="font-bold">{specialty}</span>
  );

  const availabilityRow = (opts?: { centered?: boolean }) => (
    <div
      className={`flex items-center gap-2.5 ${
        opts?.centered ? 'justify-center' : ''
      }`}
    >
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: principal }}
        aria-hidden
      />
      <p
        className="m-0 font-sans font-normal leading-none tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)',
        }}
      >
        {availability}
      </p>
    </div>
  );

  const headline = (opts?: { mobile?: boolean; bottom?: boolean }) => (
    <h1
      className={`m-0 w-full font-sans font-semibold tracking-[-0.035em] ${
        opts?.bottom ? 'text-left' : ''
      }`}
      style={{
        color: ink,
        fontSize: opts?.mobile
          ? 'clamp(2.35rem, 10vw, 3.35rem)'
          : 'clamp(2.5rem, 3.8vw, 3.85rem)',
        lineHeight: 1.08,
      }}
    >
      {opts?.bottom ? (
        <>
          {displayName} — {specialtyNode}
        </>
      ) : (
        <>
          Hello, I&apos;m {displayName} — a {specialtyNode}.
        </>
      )}
    </h1>
  );

  const titleWithRules = (opts?: { mobile?: boolean }) => (
    <div className="flex w-full flex-col gap-4">
      <div
        aria-hidden
        className="w-[min(7.5rem,28%)] self-start"
        style={{ height: 5, backgroundColor: principal }}
      />
      {headline({ mobile: opts?.mobile, bottom: true })}
      <div
        aria-hidden
        className="w-[min(7.5rem,28%)] self-end"
        style={{ height: 5, backgroundColor: principal }}
      />
    </div>
  );

  const ctaRow = (opts?: { mobile?: boolean; centered?: boolean }): ReactNode => {
    if (opts?.mobile) {
      return (
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full font-sans text-[0.95rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
          style={{ backgroundColor: ink, color: fond }}
        >
          View project
        </a>
      );
    }

    return (
      <div
        className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${
          opts?.centered ? 'justify-center' : 'justify-start'
        }`}
      >
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full px-7 font-sans text-[0.95rem] font-semibold tracking-[-0.01em] transition hover:brightness-110"
          style={{ backgroundColor: ink, color: fond }}
        >
          Let&apos;s talk
        </a>
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className="shrink-0 font-sans text-[0.95rem] font-medium tracking-[-0.01em] underline underline-offset-[5px] transition hover:opacity-80"
          style={{ color: ink }}
        >
          View project
        </a>
      </div>
    );
  };

  const bioBlock = (opts?: { mobile?: boolean; centered?: boolean }) => (
    <p
      className={`m-0 font-sans font-normal tracking-[-0.01em] ${
        opts?.centered ? 'text-center' : 'text-left'
      } ${opts?.mobile ? '' : 'max-w-[36rem]'}`}
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
  );

  /** Default: title + bio + CTAs stacked left. */
  const copyStack = (opts?: { mobile?: boolean }) => (
    <div
      className={`flex w-full flex-col items-start text-left ${
        opts?.mobile ? 'gap-8' : 'gap-10'
      }`}
    >
      {headline({ mobile: opts?.mobile })}
      {bioBlock({ mobile: opts?.mobile })}
      {ctaRow({ mobile: opts?.mobile })}
    </div>
  );

  /**
   * Title-bottom mode: bio left-aligned, CTAs stay centered.
   * Group stays vertically centered next to the portrait.
   */
  const bioCtaBesideImage = (opts?: { mobile?: boolean }) => (
    <div
      className={`flex w-full max-w-[36rem] flex-col ${
        opts?.mobile ? 'gap-8' : 'gap-10'
      }`}
    >
      {bioBlock({ mobile: opts?.mobile, centered: false })}
      <div className="flex w-full justify-center">
        {ctaRow({ mobile: opts?.mobile, centered: true })}
      </div>
    </div>
  );

  const circlePortrait = (sizeCss: string, sizes: string) => (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: sizeCss,
        height: sizeCss,
        minWidth: sizeCss,
        minHeight: sizeCss,
        backgroundColor: `color-mix(in srgb, ${neutre} 70%, ${bordure})`,
        border: `1px solid ${borderSoft}`,
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

  const portraitColumn = (opts?: { mobile?: boolean; alignStart?: boolean }) => (
    <div
      className={`flex w-full ${
        opts?.alignStart ? 'justify-start' : 'justify-center'
      }`}
    >
      <div className="flex flex-col items-center">
        {circlePortrait(
          opts?.mobile ? 'clamp(16rem, 78vw, 22rem)' : 'clamp(18rem, 40vw, 30rem)',
          opts?.mobile ? '82vw' : '(max-width: 1024px) 48vw, 30rem'
        )}
        <div className={opts?.mobile ? 'mt-5' : 'mt-6'}>
          {availabilityRow({ centered: true })}
        </div>
      </div>
    </div>
  );

  const shellPad = {
    paddingTop: 'calc(4.75rem + env(safe-area-inset-top, 0px))',
    paddingBottom: 'clamp(2rem, 4vh, 3.25rem)',
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

      {/* —— Desktop — global content width + gutter only —— */}
      {titleBottom ? (
        <div
          className={`relative z-[1] hidden min-h-[100dvh] flex-col md:flex ${shellX}`}
          style={shellPad}
        >
          <div
            className="grid w-full flex-1"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              columnGap: 'clamp(1.75rem, 4vw, 3.5rem)',
              alignItems: 'center',
            }}
          >
            {/* Image flush left — aligns with bottom title */}
            <div className="flex w-full items-center justify-start self-center">
              {portraitColumn({ alignStart: true })}
            </div>
            <div className="flex min-w-0 items-center justify-center self-center">
              {bioCtaBesideImage()}
            </div>
          </div>
          <div className="mt-[clamp(0.75rem,1.5vh,1.25rem)] w-full shrink-0">
            {titleWithRules()}
          </div>
        </div>
      ) : (
        <div
          className={`relative z-[1] hidden min-h-[100dvh] md:grid ${shellX}`}
          style={{
            ...shellPad,
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            columnGap: 'clamp(1.75rem, 4vw, 3.5rem)',
            alignItems: 'center',
          }}
        >
          <div className="flex w-full items-center justify-center self-center">
            {portraitColumn()}
          </div>
          <div className="flex min-w-0 items-center self-center pr-[clamp(0.5rem,2vw,1.5rem)]">
            {copyStack()}
          </div>
        </div>
      )}

      {/* —— Mobile —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {titleBottom ? (
          <>
            {portraitColumn({ mobile: true, alignStart: true })}
            <div className="mt-10 w-full">{bioCtaBesideImage({ mobile: true })}</div>
            <div className="mt-6 w-full">{titleWithRules({ mobile: true })}</div>
          </>
        ) : (
          <>
            {portraitColumn({ mobile: true })}
            <div className="mt-10 w-full">{copyStack({ mobile: true })}</div>
          </>
        )}
      </div>
    </div>
  );
}
