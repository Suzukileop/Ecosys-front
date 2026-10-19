'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { isPortfolioMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { useT } from '@/lib/i18n/I18nProvider';

const MAX_THUMBS = 4;

const desktopCardGeometry = [
  'col-span-4 h-[clamp(17rem,36vh,23rem)]',
  'col-span-3 h-[clamp(15rem,31vh,20rem)]',
  'col-span-2 h-[clamp(13rem,27vh,17.5rem)]',
  'col-span-3 h-[clamp(16rem,34vh,21.5rem)]',
] as const;

export function PortfolioHeroSelectedWorks({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const heroRef = useRef<HTMLElement>(null);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || t('Name');
  }, [data.fullName, data.nameLead, t]);
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  // Availability is part of this variant's identity composition, even when the
  // generic hero badge is disabled. Its text and available/unavailable state
  // still come from the shared presentation settings.
  const showAvailability = true;
  const dim = Math.min(80, Math.max(0, Math.round(data.presentation.heroSelectedWorksDimIntensity ?? 40)));
  const isCenteredIdentity = (data.presentation.heroSelectedWorksIdentityLayout ?? 'split') === 'centered';
  const bio = useMemo(() => data.description?.replace(/\s+/g, ' ').trim() || '', [data.description]);
  const works = useMemo(
    () => (data.featuredWorks ?? []).filter((work) => work.imageUrl?.trim()).slice(0, MAX_THUMBS),
    [data.featuredWorks]
  );
  const workHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'work');
    }
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isPortfolioMotionOff()) return;

    const context = gsap.context(() => {
      const copy = hero.querySelectorAll<HTMLElement>('.pf-sw-copy');
      const rail = hero.querySelector<HTMLElement>('.pf-sw-rail-head');
      const cards = hero.querySelectorAll<HTMLElement>('.pf-sw-card');
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });

      timeline.from(copy, { y: 26, autoAlpha: 0, duration: 0.85, stagger: 0.1 }, 0);
      if (rail) timeline.from(rail, { y: 16, autoAlpha: 0, duration: 0.65 }, 0.28);
      timeline.from(cards, { y: 34, clipPath: 'inset(0 0 100% 0)', autoAlpha: 0, duration: 0.85, stagger: 0.09 }, 0.35);
    }, hero);

    return () => context.revert();
  }, [works.length, isCenteredIdentity]);

  const renderCard = (work: (typeof works)[number], index: number, desktop: boolean) => {
    const finalHref = work.href || workHref;
    const isExternal = Boolean(work.href && !work.href.startsWith('#') && !work.href.startsWith('/'));
    const isHash = work.href?.startsWith('#');
    const geometry = works.length === 4
      ? desktopCardGeometry[index]
      : works.length === 3
        ? 'col-span-4 h-[clamp(16rem,33vh,21rem)]'
        : works.length === 2
          ? 'col-span-6 h-[clamp(17rem,35vh,23rem)]'
          : 'col-span-12 h-[clamp(18rem,38vh,25rem)]';

    return (
      <li
        key={`${desktop ? 'desktop' : 'rail'}-${work.id}`}
        className={`pf-sw-card min-w-0 ${desktop ? geometry : 'h-[clamp(18rem,45svh,25rem)] w-[82vw] max-w-[28rem] shrink-0 snap-center md:w-[58vw] lg:w-[44vw]'}`}
      >
        <a
          href={finalHref}
          onClick={isHash ? onNavClick(finalHref) : undefined}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="group relative block size-full overflow-hidden border"
          style={{ borderColor: bordure, clipPath: 'polygon(0 0, calc(100% - 1.15rem) 0, 100% 1.15rem, 100% 100%, 0 100%)' }}
          aria-label={work.title || t('View project')}
        >
          <Image
            src={work.imageUrl}
            alt={work.title || t('Selected work')}
            fill
            loading={index === 0 ? 'eager' : 'lazy'}
            sizes={desktop ? '(min-width: 1280px) 33vw, 100vw' : '(max-width: 767px) 82vw, 58vw'}
            className={`object-cover object-center transition duration-700 ease-out group-hover:scale-[1.035] ${imageBw ? 'grayscale' : 'grayscale group-hover:grayscale-0'}`}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-30"
            style={{ backgroundColor: `rgba(0,0,0,${dim / 100})` }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-[clamp(1rem,1.6vw,1.5rem)] text-white">
            <span className="min-w-0">
              <span className="block font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/55">
                {String(index + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
              </span>
              <span className="mt-2 block truncate font-sans text-[clamp(1rem,1.25vw,1.22rem)] font-semibold tracking-[-0.02em]">
                {work.title || t('Selected work')}
              </span>
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
          </span>
        </a>
      </li>
    );
  };

  return (
    <section
      ref={heroRef}
      className="pf-selected-works-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
      aria-label={t('Selected works')}
      data-hero-variant="selected-works"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2" style={data.suppressBackground ? undefined : { backgroundColor: fond }} />

      <div className={`relative z-[1] flex min-h-[100dvh] flex-col pb-[clamp(1.5rem,3vh,2.5rem)] pt-[calc(4.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5.5rem+env(safe-area-inset-top,0px))] ${shellX}`}>
        {isCenteredIdentity ? (
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            {showAvailability ? (
              <p className="pf-sw-copy m-0 flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: muted }}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: principal }} aria-hidden />
                {availability}
              </p>
            ) : null}
            <h1 className={`pf-sw-copy m-0 max-w-[12ch] font-sans text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em] ${showAvailability ? 'mt-5' : ''}`}>
              <span style={{ color: principal }}>{firstName}</span><span style={{ color: ink }}> / {specialty}</span>
            </h1>
            {bio ? <p className="pf-sw-copy m-0 mt-6 max-w-2xl text-[clamp(.95rem,1.1vw,1.08rem)] leading-relaxed" style={{ color: muted }}>{bio}</p> : null}
          </div>
        ) : (
          <div className="grid w-full gap-8 md:grid-cols-12 md:items-start md:gap-6">
            <div className="md:col-span-7 lg:col-span-8">
              <h1 className="pf-sw-copy m-0 max-w-[10ch] font-sans text-[clamp(3.2rem,6.4vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
                <span className="block" style={{ color: principal }}>{firstName}</span>
                <span className="block" style={{ color: ink }}>/ {specialty}</span>
              </h1>
            </div>
            {bio || showAvailability ? (
              <div className="pf-sw-copy md:col-span-5 md:pt-6 lg:col-span-4">
                {showAvailability ? (
                  <p className="m-0 mb-4 flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: muted }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: principal }} aria-hidden />
                    {availability}
                  </p>
                ) : null}
                <div className="mb-5 h-px w-full" style={{ backgroundColor: bordure }} aria-hidden />
                {bio ? <p className="m-0 max-w-[34rem] text-[clamp(.95rem,1.1vw,1.08rem)] leading-[1.6] tracking-[-0.01em]" style={{ color: muted }}>{bio}</p> : null}
              </div>
            ) : null}
          </div>
        )}

        {works.length > 0 ? (
          <div className="mt-auto min-h-0 pt-[clamp(2.5rem,7vh,5rem)]">
            <div className="pf-sw-rail-head mb-4 flex items-end justify-between gap-6 border-b pb-3" style={{ borderColor: bordure }}>
              <p className="m-0 font-mono text-[0.64rem] uppercase tracking-[0.2em]" style={{ color: muted }}>{t('Featured selection')}</p>
              <a href={workHref} onClick={onNavClick(workHref)} className="inline-flex items-center gap-2 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-60" style={{ color: ink }}>
                {t('See all')} <span aria-hidden>↗</span>
              </a>
            </div>

            <ul className="m-0 hidden min-h-0 list-none grid-cols-12 items-end gap-[clamp(.75rem,1.25vw,1.35rem)] p-0 xl:grid">
              {works.map((work, index) => renderCard(work, index, true))}
            </ul>
            <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 md:-mx-16 md:px-16 lg:-mx-20 lg:px-20 xl:hidden [&::-webkit-scrollbar]:hidden">
              {works.map((work, index) => renderCard(work, index, false))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
