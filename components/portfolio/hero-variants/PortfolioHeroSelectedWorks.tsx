'use client';

import Image from 'next/image';
import { useMemo, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroImageGrayscaleClass, resolveHeroSpecialtyValue } from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const MAX_THUMBS = 4;

/**
 * Selected works banner — name / specialty (left) + full bio (right),
 * SEE ALL + thumbnails stacked full-width on mobile, row from sm (no empty slots).
 */
export function PortfolioHeroSelectedWorks({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const imageBw = data.presentation.heroImageGrayscale === true;

  /** First name only — first word of the profile name. */
  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || 'Name';
  }, [data.fullName, data.nameLead]);

  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const dim = Math.min(
    80,
    Math.max(0, Math.round(data.presentation.heroSelectedWorksDimIntensity ?? 40))
  );
  const identityLayout = data.presentation.heroSelectedWorksIdentityLayout ?? 'split';
  const isCenteredIdentity = identityLayout === 'centered';

  const bio = useMemo(
    () => data.description?.replace(/\s+/g, ' ').trim() || '',
    [data.description]
  );

  const works = useMemo(() => {
    const list = (data.featuredWorks ?? []).filter((w) => w.imageUrl?.trim());
    return list.slice(0, MAX_THUMBS);
  }, [data.featuredWorks]);

  const workHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const linkClass =
    'font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition hover:opacity-70';

  const thumbGridClass =
    works.length === 1
      ? 'grid-cols-1'
      : works.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : works.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-4';

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
        className={`relative z-[1] flex min-h-[100dvh] flex-col pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.25rem+env(safe-area-inset-top,0px))] ${shellX}`}
        style={{
          paddingBottom: 'clamp(1.75rem, 4vh, 3rem)',
        }}
      >
        {/* Identity — split (name + bio) or centered title + separator */}
        {isCenteredIdentity ? (
          <div
            className="mt-8 flex min-h-0 w-full flex-1 flex-col sm:mt-[clamp(4rem,12vh,6.5rem)]"
          >
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h1
                className="m-0 font-sans font-semibold tracking-[-0.035em]"
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
                  lineHeight: 1.08,
                }}
              >
                <span style={{ color: principal }}>{firstName}</span>
                <span style={{ color: ink }}> /</span>
                <br />
                <span style={{ color: ink }}>{specialty}</span>
              </h1>
            </div>

            <div className="w-full py-[clamp(1.25rem,3vh,2rem)]" aria-hidden>
              <div
                className="mx-auto h-px w-full max-w-[min(100%,42rem)]"
                style={{ backgroundColor: bordure }}
              />
            </div>
          </div>
        ) : (
          <div
            className="mt-8 grid w-full gap-8 sm:mt-[clamp(4rem,12vh,6.5rem)] md:grid-cols-2 md:items-start md:gap-12 lg:gap-16"
          >
            <div className="flex min-w-0 flex-col items-start text-left">
              <h1
                className="m-0 font-sans font-semibold tracking-[-0.035em]"
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
                  lineHeight: 1.08,
                }}
              >
                <span style={{ color: principal }}>{firstName}</span>
                <span style={{ color: ink }}> /</span>
                <br />
                <span style={{ color: ink }}>{specialty}</span>
              </h1>
            </div>

            {bio ? (
              <p
                className="m-0 min-w-0 font-sans font-normal tracking-[-0.01em] md:pt-1 md:text-left"
                style={{
                  color: muted,
                  fontSize: 'clamp(0.95rem, 1.2vw, 1.125rem)',
                  lineHeight: 1.55,
                }}
              >
                {bio}
              </p>
            ) : (
              <span className="hidden md:block" aria-hidden />
            )}
          </div>
        )}

        {/* Works block — See all + thumbnails */}
        {works.length > 0 ? (
          <div className="mt-auto flex w-full min-h-0 flex-col gap-4 pt-[clamp(2rem,6vh,4rem)]">
            <div className="flex w-full items-center justify-end">
              <a
                href={workHref}
                onClick={onNavClick(workHref)}
                className={`inline-flex items-center gap-1.5 ${linkClass}`}
                style={{ color: muted }}
              >
                See all
                <span aria-hidden>→</span>
              </a>
            </div>

            <ul className={`m-0 grid min-h-0 list-none gap-3 p-0 sm:gap-4 ${thumbGridClass}`}>
              {works.map((work) => (
                <li key={work.id} className="min-w-0">
                  <a
                    href={work.href || workHref}
                    onClick={work.href?.startsWith('#') ? onNavClick(work.href) : undefined}
                    className="relative block w-full overflow-hidden rounded-2xl transition hover:brightness-110"
                    style={{ height: 'clamp(14rem, 34vh, 22rem)' }}
                    aria-label={work.title || 'View project'}
                  >
                    <Image
                      src={work.imageUrl}
                      alt={work.title || 'Selected work'}
                      fill
                      sizes={
                        works.length === 1
                          ? '100vw'
                          : works.length === 2
                            ? '(max-width: 639px) 100vw, 50vw'
                            : works.length === 3
                              ? '(max-width: 639px) 100vw, 33vw'
                              : '(max-width: 639px) 100vw, 25vw'
                      }
                      className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ backgroundColor: `rgba(0,0,0,${dim / 100})` }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
