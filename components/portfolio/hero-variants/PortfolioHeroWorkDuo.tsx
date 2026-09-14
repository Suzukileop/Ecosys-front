'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
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
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { measurePortfolioNavClearanceForScroll } from '@/components/portfolio/portfolio-nav-top-clearance';

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
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  const firstName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || '').trim();
    return raw.split(/\s+/)[0] || 'Name';
  }, [data.fullName, data.nameLead]);

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

  const works = useMemo(() => {
    const list = (data.featuredWorks ?? []).filter((w) => w.imageUrl?.trim());
    return list.slice(0, MAX_WORKS);
  }, [data.featuredWorks]);

  const slots = useMemo(
    () => [0, 1].map((index) => works[index] ?? null),
    [works]
  );

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
      style={{ backgroundColor: fond, color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      <div
        className={`pf-work-duo-stage relative z-[1] flex flex-col pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-12 lg:min-h-[100dvh] lg:pb-16 lg:pt-[calc(6.5rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        <div className="grid w-full flex-1 grid-cols-1 items-stretch gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-x-12 xl:gap-x-16">
          <div className="pf-work-duo-west flex min-w-0 flex-col">
            <p
              className="pf-work-duo-copy mb-0 ml-0 mr-0 font-sans text-[0.7rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: principal }}
            >
              {availability}
            </p>

            <h1
              className="pf-work-duo-title mb-0 ml-0 mr-0 mt-5 max-w-full font-sans font-bold tracking-[-0.04em]"
              style={{
                color: ink,
                fontSize: 'clamp(2.35rem, 5vw, 3.75rem)',
                lineHeight: 1.08,
              }}
            >
              {titleLines.map((line) => (
                <span key={line} className="pf-work-duo-title-mask block overflow-hidden">
                  <span className="pf-work-duo-title-line block">{line}</span>
                </span>
              ))}
            </h1>

            <p
              className="pf-work-duo-copy pf-work-duo-bio mb-0 ml-0 mr-0 mt-8 max-w-[34rem] font-sans font-normal tracking-[-0.01em] [text-wrap:pretty]"
              style={{
                color: muted,
                fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)',
                lineHeight: 1.55,
              }}
            >
              {bio}
            </p>

            <div className="pf-work-duo-copy mt-8 flex flex-wrap items-center gap-3 sm:gap-3.5">
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

            <div className="pf-work-duo-years mt-auto pt-12 lg:pt-16">
              <p
                className="mb-0 ml-0 mr-0 font-sans font-bold tracking-[-0.04em]"
                style={{
                  color: principal,
                  fontSize: 'clamp(2.75rem, 5vw, 3.75rem)',
                  lineHeight: 0.92,
                }}
              >
                {yearsLabel}
              </p>
              <p
                className="mb-0 ml-0 mr-0 mt-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.16em]"
                style={{ color: muted }}
              >
                Years of experience
              </p>
            </div>
          </div>

          <div className="pf-work-duo-east flex min-h-0 min-w-0 flex-col">
            <div className="pf-work-duo-seeall mb-4 flex w-full items-center justify-end lg:mb-5">
              <a
                href={workHref}
                onClick={onSeeAllClick}
                className="inline-flex items-center font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition hover:opacity-70"
                style={{ color: muted }}
              >
                See all&nbsp;—
              </a>
            </div>

            <ul className="pf-work-duo-gallery m-0 grid min-h-0 flex-1 list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5">
              {slots.map((work, index) => (
                <li key={work?.id ?? `slot-${index}`} className="pf-work-duo-card-frame min-h-0 origin-center">
                  {work ? (
                    <a
                      href={work.href || workHref}
                      onClick={
                        work.href?.startsWith('#') ? onNavClick(work.href) : undefined
                      }
                      className="pf-work-duo-card relative block aspect-[3/4] h-full w-full overflow-hidden rounded-[1.75rem] lg:aspect-auto lg:min-h-[22rem] lg:rounded-[2rem]"
                      style={{ backgroundColor: neutre }}
                      aria-label={work.title || 'View project'}
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
                            alt={work.title || 'Selected work'}
                            fill
                            sizes="(max-width: 639px) 100vw, 28vw"
                            className="object-cover object-center"
                          />
                        </span>
                      </span>
                    </a>
                  ) : (
                    <div
                      className="pf-work-duo-card relative aspect-[3/4] h-full w-full overflow-hidden rounded-[1.75rem] lg:aspect-auto lg:min-h-[22rem] lg:rounded-[2rem]"
                      style={{ backgroundColor: neutre }}
                      aria-hidden
                      data-pf-no-color-transition=""
                    >
                      <span
                        className="pf-work-duo-card-media absolute block"
                        data-pf-no-color-transition=""
                      >
                        <span
                          className="pf-work-duo-card-zoom absolute inset-0 block"
                          data-pf-no-color-transition=""
                        />
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
