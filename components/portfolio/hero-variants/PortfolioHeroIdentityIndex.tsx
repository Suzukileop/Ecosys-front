'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef } from 'react';
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

function identityIndexScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isLaidOut(el: HTMLElement): boolean {
  return el.getClientRects().length > 0;
}

/**
 * Identity index — desktop: centered name / 3-col rail / rule under values / bio at bottom.
 * Mobile: left-aligned stacked name, value list, compact bio.
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
  const heroRef = useRef<HTMLDivElement>(null);

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

  const bioInk = `color-mix(in srgb, ${ink} 60%, transparent)`;

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(min-width: 1024px)');
    let ctx: gsap.Context | undefined;
    let refreshId = 0;

    const setup = () => {
      ctx?.revert();
      const scroller = identityIndexScrollParent(hero);
      const pick = (selector: string) =>
        [...hero.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);

      const marks = pick('.pf-identity-index-mark');
      const titleLines = pick('.pf-identity-index-title-line');
      const cols = pick('.pf-identity-index-col');
      const rules = pick('.pf-identity-index-rule');
      const rails = pick('.pf-identity-index-rail');
      const bios = pick('.pf-identity-index-bio');

      const magazine = !showPortrait && !swapBioName;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

        if (marks.length) {
          tl.fromTo(
            marks,
            { opacity: 0 },
            { opacity: 1, duration: 0.55, ease: 'power2.out' },
            0
          );
        }
        if (titleLines.length) {
          tl.set(titleLines, { yPercent: 110 }, 0);
          tl.to(
            titleLines,
            {
              yPercent: 0,
              duration: 1.12,
              ease: 'power3.out',
              stagger: 0.08,
            },
            0.22
          );
        }
        if (cols.length) {
          tl.set(cols, { opacity: 0, y: 14 }, 0);
          tl.to(
            cols,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.1,
              ease: 'power3.out',
            },
            0.58
          );
        }
        if (rules.length) {
          tl.set(rules, { scaleX: 0, transformOrigin: 'center center' }, 0);
          tl.to(
            rules,
            { scaleX: 1, duration: 0.72, ease: 'power2.inOut' },
            0.88
          );
        }
        if (bios.length) {
          tl.set(bios, { opacity: 0 }, 0);
          tl.to(
            bios,
            { opacity: 1, duration: 1.15, ease: 'power2.out' },
            1.05
          );
        }

        if (mq.matches && magazine) {
          const scrollTriggerBase = {
            trigger: hero,
            start: 'top top' as const,
            invalidateOnRefresh: true,
            ...(scroller ? { scroller } : {}),
          };

          rails.forEach((rail) => {
            gsap.fromTo(
              rail,
              { opacity: 1 },
              {
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                  ...scrollTriggerBase,
                  end: '32% top',
                  scrub: 0.2,
                },
              }
            );
          });

          bios.forEach((bioEl) => {
            gsap.fromTo(
              bioEl,
              { y: 0, opacity: 1 },
              {
                y: () => hero.offsetHeight * (1 - 1.3),
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                  ...scrollTriggerBase,
                  end: 'bottom top',
                  scrub: 0.45,
                },
              }
            );
          });
        }
      }, hero);

      window.clearTimeout(refreshId);
      refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    };

    const refresh = () => ScrollTrigger.refresh();
    setup();
    mq.addEventListener('change', setup);
    window.addEventListener('resize', refresh);
    return () => {
      mq.removeEventListener('change', setup);
      window.removeEventListener('resize', refresh);
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [displayName, bio, specialty, availability, years, showPortrait, swapBioName]);

  const nameHeading = (
    <h1
      className="pf-identity-index-title m-0 w-max max-w-full text-left font-sans font-bold tracking-[-0.045em] [overflow-wrap:anywhere] lg:w-max lg:text-center lg:whitespace-nowrap"
      style={{
        color: ink,
        fontSize: 'clamp(3.75rem, 11vw, 12rem)',
        lineHeight: 0.86,
      }}
    >
      <span className="lg:hidden">
        <span className="pf-identity-index-title-mask block overflow-hidden">
          <span className="pf-identity-index-title-line block">{nameParts.first}</span>
        </span>
        {nameParts.rest ? (
          <span className="pf-identity-index-title-mask block overflow-hidden">
            <span className="pf-identity-index-title-line block">{nameParts.rest}</span>
          </span>
        ) : null}
      </span>
      <span className="pf-identity-index-title-mask hidden overflow-hidden lg:block">
        <span className="pf-identity-index-title-line block">{displayName}</span>
      </span>
    </h1>
  );

  const bioParagraph = (editorial = false) => (
    <p
      className={`m-0 w-full font-sans tracking-[-0.02em] [text-wrap:pretty] text-[length:clamp(1.12rem,4.4vw,1.35rem)] lg:text-[length:clamp(1.2rem,1.75vw,1.6rem)] ${
        editorial
          ? 'pf-identity-index-bio font-medium leading-[1.6] lg:font-medium'
          : 'font-semibold leading-[1.4] lg:font-medium lg:leading-[1.45]'
      }`}
      style={{ color: editorial ? bioInk : ink }}
    >
      {bio}
    </p>
  );

  const metaRail = (
    <div className="pf-identity-index-rail mt-16 w-full">
      <ul className="m-0 grid w-full list-none grid-cols-1 gap-y-2.5 p-0 text-left lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-x-8 lg:gap-y-0 lg:text-center">
        {railItems.map((item) => (
          <li key={item.label} className="pf-identity-index-col min-w-0">
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
        aria-hidden
        className="pf-identity-index-rule mt-5 h-px w-full origin-center opacity-35 lg:opacity-100"
        style={{ backgroundColor: ink }}
      />
    </div>
  );

  return (
    <div
      ref={heroRef}
      className="pf-identity-index-hero relative isolate w-full overflow-x-clip overflow-y-visible font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      <div className="relative z-[1] flex min-h-0 flex-col lg:min-h-[100dvh]">
        <div
          className="flex w-full justify-center pt-[calc(5rem+env(safe-area-inset-top,0px))] lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))]"
          aria-hidden
        >
          <span
            className="pf-identity-index-mark hidden h-[3px] w-10 shrink-0 lg:block"
            style={{ backgroundColor: ink }}
          />
        </div>

        <div
          className={`flex flex-1 flex-col pb-12 lg:pb-16 ${shellX}`}
        >
          <div
            className={
              topIsBio
                ? 'mt-2 w-full max-w-full text-left lg:mx-auto lg:mt-10 lg:max-w-[62%] lg:text-center'
                : 'mt-2 w-fit max-w-full lg:mx-auto lg:mt-10'
            }
          >
            {topIsBio ? bioParagraph(true) : nameHeading}
          </div>

          {metaRail}

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
                    <div className="min-w-0 text-left">{bioParagraph(false)}</div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 text-left">{bioParagraph(false)}</div>
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
              bioParagraph(true)
            )}
          </div>
        </div>
      </div>

      {showBottomMedia ? (
        <div className={`relative z-[1] mt-12 shrink-0 overflow-hidden lg:mt-24 ${shellX}`}>
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
