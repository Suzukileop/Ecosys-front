'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';
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
import { measurePortfolioNavClearanceForScroll } from '@/components/portfolio/portfolio-nav-top-clearance';
import { useT } from '@/lib/i18n/I18nProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const FALLBACK_BIO =
  'I turn complex data into clear insights and measurable decisions.';
const MAX_WORKS = 2;

function workDuoScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function glideDurationForDistance(px: number): number {
  return Math.min(1.85, Math.max(1.05, Math.abs(px) / 1280));
}

/** Cinematic scroll to a section — native hash jumps are instant (`scroll-behavior: auto`). */
function glideToPortfolioSection(hero: HTMLElement | null, sectionId: string): boolean {
  if (typeof document === 'undefined') return false;
  const target = document.getElementById(sectionId);
  if (!target) return false;

  const clearance = measurePortfolioNavClearanceForScroll();
  const scroller = workDuoScrollParent(hero);
  const reduced = prefersReducedMotion();

  if (scroller) {
    const nextY =
      scroller.scrollTop +
      (target.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
      clearance;
    const y = Math.max(0, nextY);
    if (reduced) {
      scroller.scrollTop = y;
    } else {
      gsap.to(scroller, {
        scrollTo: { y, autoKill: false },
        duration: glideDurationForDistance(y - scroller.scrollTop),
        ease: 'power2.inOut',
        overwrite: true,
      });
    }
  } else {
    const nextY = window.scrollY + target.getBoundingClientRect().top - clearance;
    const y = Math.max(0, nextY);
    if (reduced) {
      window.scrollTo(0, y);
    } else {
      gsap.to(window, {
        scrollTo: { y, autoKill: false },
        duration: glideDurationForDistance(y - window.scrollY),
        ease: 'power2.inOut',
        overwrite: true,
      });
    }
  }

  if (window.history?.replaceState) {
    const url = new URL(window.location.href);
    url.hash = sectionId;
    window.history.replaceState(null, '', url);
  }
  return true;
}

function splitWorkDuoTitle(firstName: string, specialty: string): string[] {
  return [`Hi, I'm ${firstName} —`, `a ${specialty}`];
}

/**
 * Work duo — left narrative (availability, title, bio, CTAs, years)
 * and right Selected work duo with See all flush to the last card.
 */
export function PortfolioHeroWorkDuo({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || t('Name');
  }, [data.fullName, data.nameLead, t]);

  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const titleLines = useMemo(
    () => splitWorkDuoTitle(firstName, specialty),
    [firstName, specialty]
  );
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
    return '08+';
  }, [data.yearsOfExperience, data.stats]);
  const experienceLabel =
    data.presentation.heroWorkDuoExperienceLabel?.trim() ||
    t('Experience built through real projects');

  const works = useMemo(() => {
    const list = (data.featuredWorks ?? []).filter((w) => w.imageUrl?.trim());
    return list.slice(0, MAX_WORKS);
  }, [data.featuredWorks]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const workHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const heroRef = useRef<HTMLDivElement>(null);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const onSeeAllClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!workHref.startsWith('#')) return;
    event.preventDefault();
    const sectionId = workHref.slice(1) || 'work';
    if (glideToPortfolioSection(heroRef.current, sectionId)) return;
    data.onNavigateSection?.(sectionId);
  };

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
      const scroller = workDuoScrollParent(hero);
      const pick = (selector: string) =>
        [...hero.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);

      const lines = pick('.pf-work-duo-title-line');
      const cards = pick('.pf-work-duo-card');
      const years = pick('.pf-work-duo-years');
      const copy = pick('.pf-work-duo-copy');
      const seeAll = pick('.pf-work-duo-seeall');

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

        if (lines.length) {
          tl.set(lines, { yPercent: 110 }, 0);
          tl.to(
            lines,
            {
              yPercent: 0,
              duration: 1.08,
              stagger: 0.1,
              ease: 'power3.out',
            },
            0.12
          );
        }
        if (copy.length) {
          tl.set(copy, { opacity: 0, y: 12 }, 0);
          tl.to(
            copy,
            { opacity: 1, y: 0, duration: 0.62, stagger: 0.08, ease: 'power3.out' },
            0.38
          );
        }
        if (seeAll.length) {
          tl.set(seeAll, { opacity: 0 }, 0);
          tl.to(seeAll, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.32);
        }
        if (cards.length) {
          tl.set(cards, { y: 52, opacity: 0 }, 0);
          tl.to(
            cards,
            {
              y: 0,
              opacity: 1,
              duration: 0.72,
              stagger: 0.1,
              ease: 'power3.out',
            },
            0.34
          );
        }
        if (years.length) {
          tl.set(years, { opacity: 0 }, 0);
          tl.to(years, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0.98);
        }

        if (mq.matches) {
          const scrollTriggerBase = {
            trigger: hero,
            start: 'top top' as const,
            end: 'bottom top' as const,
            invalidateOnRefresh: true,
            ...(scroller ? { scroller } : {}),
          };

          const frames = pick('.pf-work-duo-card-frame');
          frames.forEach((frame, index) => {
            const lead = index % 2 === 0 ? 0.14 : -0.1;
            gsap.fromTo(
              frame,
              { y: 0, scale: 1 },
              {
                y: () => hero.offsetHeight * lead,
                scale: 0.9,
                ease: 'none',
                scrollTrigger: {
                  ...scrollTriggerBase,
                  scrub: 0.75,
                },
              }
            );
          });

          seeAll.forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 1 },
              {
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                  ...scrollTriggerBase,
                  end: '40% top',
                  scrub: 0.35,
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
  }, [firstName, specialty, bio, yearsLabel, works.length]);

  return (
    <div
      ref={heroRef}
      className="pf-work-duo-hero relative isolate w-full overflow-x-clip overflow-y-visible font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      <div
        className={`pf-work-duo-stage relative z-[1] flex flex-col pb-10 pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:pb-14 sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] lg:min-h-[100dvh] lg:pb-12 lg:pt-[calc(5.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        <div className="grid w-full flex-1 grid-cols-1 items-stretch gap-12 lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] lg:gap-x-10 xl:gap-x-16">
          <div className="pf-work-duo-west flex min-w-0 flex-col">
            <div className="pf-work-duo-copy flex items-center gap-3">
              <span className="size-2 rounded-full" style={{ backgroundColor: principal }} aria-hidden />
              <p
                className="m-0 font-sans text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: principal }}
              >
                {availability}
              </p>
              <span className="h-px w-12" style={{ backgroundColor: principal, opacity: 0.38 }} aria-hidden />
            </div>

            <h1
              className="pf-work-duo-title mb-0 ml-0 mr-0 mt-6 max-w-[12ch] font-sans font-bold tracking-[-0.055em]"
              style={{
                color: ink,
                fontSize: 'clamp(2.65rem, 4.7vw, 4.8rem)',
                lineHeight: 0.98,
              }}
            >
              {titleLines.map((line) => (
                <span key={line} className="pf-work-duo-title-mask block overflow-hidden">
                  <span className="pf-work-duo-title-line block">{line}</span>
                </span>
              ))}
            </h1>

            <p
              className="pf-work-duo-copy pf-work-duo-bio mb-0 ml-0 mr-0 mt-7 max-w-[31rem] border-l pl-5 font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: muted,
                borderColor: principal,
                fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)',
                lineHeight: 1.6,
              }}
            >
              {bio}
            </p>

            {data.showContactCta !== false || data.showWorkCta !== false ? (
              <div className="pf-work-duo-copy mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
                {data.showContactCta !== false ? (
                  <a
                    href={primaryHref}
                    onClick={onNavClick(primaryHref)}
                    className="inline-flex h-12 items-center justify-center rounded-full px-7 font-sans text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: principal, color: fond }}
                  >
                    {t('Let\'s talk')}
                  </a>
                ) : null}
                {data.showWorkCta !== false ? (
                  <a
                    href={secondaryHref}
                    onClick={onNavClick(secondaryHref)}
                    className="inline-flex h-12 items-center justify-center rounded-full border px-7 font-sans text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: principal, color: principal, backgroundColor: 'transparent' }}
                  >
                    {t('View projects')}
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="pf-work-duo-years mt-12 flex max-w-[31rem] items-end justify-between border-t pt-5 lg:mt-auto" style={{ borderColor: `color-mix(in srgb, ${ink} 18%, transparent)` }}>
              <p className="m-0 max-w-[9rem] font-mono text-[0.62rem] font-semibold uppercase leading-[1.45] tracking-[0.16em]" style={{ color: muted }}>
                {experienceLabel}
              </p>
              <div className="text-right">
              <p
                className="mb-0 ml-0 mr-0 font-sans font-bold tracking-[-0.04em]"
                style={{
                  color: principal,
                  fontSize: 'clamp(2.6rem, 4vw, 3.5rem)',
                  lineHeight: 0.92,
                }}
              >
                {yearsLabel}
              </p>
              <p
                className="mb-0 ml-0 mr-0 mt-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: muted }}
              >
                {t('Years of experience')}
              </p>
              </div>
            </div>
          </div>

          <div className="pf-work-duo-east flex min-h-0 min-w-0 flex-col">
            <div className="pf-work-duo-seeall mb-5 flex w-full items-center justify-end">
              <a
                href={workHref}
                onClick={onSeeAllClick}
                className="inline-flex items-center font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition hover:opacity-70"
                style={{ color: muted }}
              >
                {t('See all —')}
              </a>
            </div>

            <ul className={`pf-work-duo-gallery -mx-1 m-0 flex min-h-0 flex-1 snap-x snap-mandatory list-none gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 ${works.length === 1 ? 'sm:ml-auto sm:w-full sm:max-w-[31rem] sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
              {works.map((work, index) => (
                <li key={work.id} className={`pf-work-duo-card-frame relative min-h-0 w-[82vw] max-w-[23rem] shrink-0 snap-center origin-center sm:w-auto sm:max-w-none ${index === 1 ? 'lg:top-10 lg:pb-10' : ''}`}>
                    <a
                      href={work.href || workHref}
                      onClick={
                        work.href?.startsWith('#') ? onNavClick(work.href) : undefined
                      }
                      className={`pf-work-duo-card group relative block aspect-[4/5] h-full w-full overflow-hidden border lg:aspect-auto lg:min-h-[27rem] ${index === 0 ? 'rounded-bl-[3rem] rounded-br-xl rounded-tl-xl rounded-tr-[3rem]' : 'rounded-bl-xl rounded-br-[3rem] rounded-tl-[3rem] rounded-tr-xl'}`}
                      style={{
                        backgroundColor: neutre,
                        borderColor: `color-mix(in srgb, ${ink} 14%, transparent)`,
                        borderWidth: '0.75px',
                      }}
                      aria-label={work.title || t('View project')}
                      data-pf-no-color-transition=""
                    >
                      <span
                        className="pf-work-duo-card-media absolute block"
                        data-pf-no-color-transition=""
                      >
                        <span
                          className="pf-work-duo-card-zoom absolute inset-0 block"
                          data-pf-no-color-transition=""
                        >
                          <Image
                            src={work.imageUrl}
                            alt={work.title || t('Selected work')}
                            fill
                            priority={index === 0}
                            sizes="(max-width: 639px) 100vw, 28vw"
                            className={`object-cover object-center ${heroImageGrayscaleClass(data.presentation.heroImageGrayscale)}`}
                          />
                        </span>
                      </span>
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />
                      <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
                        <span className="line-clamp-2 text-[clamp(1.05rem,1.5vw,1.35rem)] font-semibold leading-tight tracking-[-0.025em]">
                          {work.title || t('Selected work')}
                        </span>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-black transition-transform duration-300 group-hover:-rotate-45" aria-hidden>
                          ↗
                        </span>
                      </span>
                    </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
