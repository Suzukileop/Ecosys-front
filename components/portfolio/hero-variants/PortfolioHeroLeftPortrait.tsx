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
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

/**
 * Left portrait — image left; availability + Hello I’m name — a specialty on top;
 * bio + Let’s talk / View project centered at the bottom of the remaining width.
 */
export function PortfolioHeroLeftPortrait({ data }: { data: PortfolioHeroData }) {
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

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const markSpecialty = data.presentation.heroLeftPortraitSpecialtyMark === true;

  const specialtyNode = markSpecialty ? (
    <span
      className="box-decoration-clone px-[0.12em]"
      style={{
        color: ink,
        backgroundImage: `linear-gradient(to top, color-mix(in srgb, ${principal} 42%, transparent) 0.38em, transparent 0.38em)`,
      }}
    >
      {specialty}
    </span>
  ) : (
    specialty
  );

  const availabilityRow = (
    <div className="flex items-center gap-2.5">
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

  const headline = (opts?: { mobile?: boolean }) => (
    <h1
      className={`m-0 font-sans font-semibold tracking-[-0.035em] ${
        opts?.mobile ? 'mt-8 w-full' : 'mt-[clamp(1.75rem,3.5vh,2.5rem)] max-w-[18ch]'
      }`}
      style={{
        color: ink,
        fontSize: opts?.mobile
          ? 'clamp(2.35rem, 10vw, 3.35rem)'
          : 'clamp(2.65rem, 4.6vw, 4.35rem)',
        lineHeight: 1.06,
      }}
    >
      Hello, I&apos;m {displayName} — a {specialtyNode}.
    </h1>
  );

  const ctaRow = (opts?: { mobile?: boolean }): ReactNode => {
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
      <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3">
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

  const bioAndCta = (opts?: { mobile?: boolean }) => (
    <div
      className={`flex w-full flex-col items-start text-left ${
        opts?.mobile ? 'mt-8 max-w-none gap-6' : 'max-w-[32rem] gap-6'
      }`}
    >
      <p
        className="m-0 font-sans font-normal tracking-[-0.01em]"
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
      {ctaRow({ mobile: opts?.mobile })}
    </div>
  );

  const portrait = (sizes: string, className = '') => (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      style={{
        backgroundColor: neutre,
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
        className={`relative z-[1] hidden min-h-[100dvh] md:grid ${shellX}`}
        style={{
          paddingTop: 'calc(6.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          gridTemplateColumns: 'minmax(14rem, 34vw) minmax(0, 1fr)',
          columnGap: 'clamp(2rem, 5vw, 4.5rem)',
          alignItems: 'stretch',
        }}
      >
        {portrait(
          '(max-width: 1024px) 40vw, 34vw',
          'h-full min-h-[28rem] w-full rounded-2xl'
        )}

        <div className="flex min-h-0 min-w-0 flex-col self-stretch">
          <div className="shrink-0">
            {availabilityRow}
            {headline()}
          </div>

          {/* Bio + CTAs — bottom of remaining width, text left-aligned */}
          <div className="flex min-h-0 flex-1 flex-col items-start justify-end pb-1 pt-10">
            {bioAndCta()}
          </div>
        </div>
      </div>

      {/* —— Mobile — same global content width + gutter —— */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(5.75rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {availabilityRow}
        {headline({ mobile: true })}

        {portrait('92vw', 'mt-8 aspect-[3/4] w-full rounded-2xl')}

        <div className="flex w-full flex-col items-start">{bioAndCta({ mobile: true })}</div>
      </div>
    </div>
  );
}
