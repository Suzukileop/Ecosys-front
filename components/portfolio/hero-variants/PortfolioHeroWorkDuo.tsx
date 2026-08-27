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
  'I turn complex data into clear insights and measurable decisions.';
const MAX_WORKS = 2;

/**
 * Work duo — left copy (availability, Hi I'm name — specialty, bio, CTAs, years)
 * and right Selected work duo with See all above.
 */
export function PortfolioHeroWorkDuo({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || 'Name';
  }, [data.fullName, data.nameLead]);

  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );

  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || FALLBACK_BIO;
  }, [data.description]);

  const yearsLabel = useMemo(() => {
    const years = data.yearsOfExperience;
    if (typeof years === 'number' && Number.isFinite(years) && years > 0) {
      const n = Math.min(99, Math.max(1, Math.round(years)));
      return `${String(n).padStart(2, '0')}+`;
    }
    const fromStats = data.stats?.find((stat) => /year/i.test(stat.label))?.value?.trim();
    if (fromStats) {
      const digits = fromStats.replace(/[^\d]/g, '');
      if (digits) return `${digits.padStart(2, '0')}+`;
      return fromStats.endsWith('+') ? fromStats : `${fromStats}+`;
    }
    return null;
  }, [data.yearsOfExperience, data.stats]);

  const works = useMemo(() => {
    const list = (data.featuredWorks ?? []).filter((w) => w.imageUrl?.trim());
    return list.slice(0, MAX_WORKS);
  }, [data.featuredWorks]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const workHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

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

      <div
        className={`relative z-[1] flex flex-col pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-12 lg:min-h-[100dvh] lg:justify-center lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] lg:pb-16 ${shellX}`}
      >
        <div className="grid w-full grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-x-12 xl:gap-x-16">
          {/* Left — availability, headline, bio, CTAs, years */}
          <div className="flex min-w-0 flex-col">
            <p
              className="m-0 font-sans text-[0.7rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: principal }}
            >
              {availability}
            </p>

            <h1
              className="m-0 mt-5 max-w-[16ch] font-sans font-bold tracking-[-0.04em]"
              style={{
                color: ink,
                fontSize: 'clamp(2.35rem, 5vw, 3.75rem)',
                lineHeight: 1.08,
              }}
            >
              Hi, I&apos;m {firstName} — a {specialty}
            </h1>

            <p
              className="m-0 mt-5 max-w-[34rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: muted,
                fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)',
                lineHeight: 1.55,
              }}
            >
              {bio}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
              <a
                href={primaryHref}
                onClick={onNavClick(primaryHref)}
                className="inline-flex h-12 items-center justify-center rounded-xl px-7 font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] transition hover:brightness-110"
                style={{ backgroundColor: principal, color: fond }}
              >
                Let&apos;s talk
              </a>
              <a
                href={secondaryHref}
                onClick={onNavClick(secondaryHref)}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 px-7 font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] transition hover:opacity-85"
                style={{ borderColor: principal, color: principal, backgroundColor: 'transparent' }}
              >
                View projects
              </a>
            </div>

            {yearsLabel ? (
              <div className="mt-auto pt-12 lg:pt-16">
                <p
                  className="m-0 font-sans font-bold tracking-[-0.04em]"
                  style={{
                    color: principal,
                    fontSize: 'clamp(2.75rem, 5vw, 3.75rem)',
                    lineHeight: 0.92,
                  }}
                >
                  {yearsLabel}
                </p>
                <p
                  className="m-0 mt-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: muted }}
                >
                  Years of experience
                </p>
              </div>
            ) : null}
          </div>

          {/* Right — See all + two Selected work cards */}
          <div className="flex min-w-0 flex-col">
            {works.length > 0 ? (
              <>
                <div className="mb-4 flex w-full items-center justify-end lg:mb-5">
                  <a
                    href={workHref}
                    onClick={onNavClick(workHref)}
                    className="inline-flex items-center gap-1.5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition hover:opacity-70"
                    style={{ color: muted }}
                  >
                    See all
                    <span aria-hidden>→</span>
                  </a>
                </div>

                <ul className="m-0 grid min-h-0 flex-1 list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5">
                  {works.map((work) => (
                    <li key={work.id} className="min-w-0">
                      <a
                        href={work.href || workHref}
                        onClick={
                          work.href?.startsWith('#') ? onNavClick(work.href) : undefined
                        }
                        className="relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] transition hover:brightness-105 lg:rounded-[2rem]"
                        style={{ backgroundColor: neutre }}
                        aria-label={work.title || 'View project'}
                      >
                        <Image
                          src={work.imageUrl}
                          alt={work.title || 'Selected work'}
                          fill
                          sizes="(max-width: 639px) 100vw, 28vw"
                          className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div
                className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
                aria-hidden
              >
                {[0, 1].map((slot) => (
                  <div
                    key={slot}
                    className="aspect-[3/4] w-full rounded-[1.75rem] lg:rounded-[2rem]"
                    style={{ backgroundColor: neutre }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
