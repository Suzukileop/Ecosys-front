'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react';
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

type Density = 'mobile' | 'tablet' | 'desktop';

const CTA_SHAPE =
  'inline-flex h-12 min-h-12 items-center justify-center gap-2 rounded-md px-7 font-sans text-[0.75rem] font-bold uppercase tracking-[0.12em]';

function experienceSplitScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

/** Last word of the name sits on its own line — matches the editorial wrap. */
function splitExperienceTitle(name: string): string[] {
  const trimmed = name.trim() || 'Lorem Ipsum';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return [`Hi, I'm ${trimmed}.`];
  const last = parts[parts.length - 1];
  return [`Hi, I'm ${parts.slice(0, -1).join(' ')}`, `${last}.`];
}

/**
 * Experience split (default):
 * Desktop  → [title + CTAs with L-frame] …… [portrait | years/bio]
 * Tablet   → stacked intro, then portrait + bio as paired frames
 * Mobile   → single-column narrative, tap-friendly CTAs
 */
export function PortfolioHeroExperienceSplit({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const titleLines = useMemo(() => splitExperienceTitle(displayName), [displayName]);
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const avatarUrl = data.avatarUrl?.trim() || null;
  const bioRight = data.presentation.heroExperienceSplitBioRight !== false;
  const globalFrame = data.presentation.heroExperienceSplitGlobalFrame === true;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

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

  const bioText = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return (
      cleaned ||
      'Independent art director. I create clear, expressive, and lasting visual identities.'
    );
  }, [data.description]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const frameColor = `color-mix(in srgb, ${bordure} 70%, transparent)`;
  const heroRef = useRef<HTMLDivElement>(null);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(min-width: 768px)');
    let ctx: gsap.Context | undefined;
    let refreshId = 0;

    const setup = () => {
      ctx?.revert();
      const scroller = experienceSplitScrollParent(hero);
      const pick = (selector: string) =>
        [...hero.querySelectorAll<HTMLElement>(selector)].filter(isLaidOut);

      const strokesV = pick('.pf-exp-split-stroke-v');
      const strokesH = pick('.pf-exp-split-stroke-h');
      const titleEls = pick('.pf-exp-split-title-line');
      const photos = pick('.pf-exp-split-photo-inner');
      const photoFrames = pick('.pf-exp-split-photo');
      const eastCols = pick('.pf-exp-split-east');
      const cascade = pick('.pf-exp-split-cascade');

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

        if (strokesV.length) {
          gsap.set(strokesV, { scaleY: 0, transformOrigin: 'top center' });
          tl.to(
            strokesV,
            { scaleY: 1, duration: 1.05, ease: 'power2.inOut', stagger: 0.08 },
            0
          );
        }
        if (strokesH.length) {
          gsap.set(strokesH, { scaleX: 0, transformOrigin: 'left center' });
          tl.to(
            strokesH,
            { scaleX: 1, duration: 1.05, ease: 'power2.inOut', stagger: 0.08 },
            0.08
          );
        }
        if (titleEls.length) {
          tl.fromTo(
            titleEls,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 1.15,
              stagger: 0.12,
              ease: 'power3.out',
              immediateRender: false,
            },
            0.42
          );
        }
        if (photos.length) {
          tl.fromTo(
            photos,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 1.18, ease: 'power3.out', immediateRender: false },
            0.42
          );
        }
        if (cascade.length) {
          tl.fromTo(
            cascade,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.82,
              stagger: 0.18,
              ease: 'power3.out',
              immediateRender: false,
            },
            0.78
          );
        }

        if (mq.matches) {
          photoFrames.forEach((frame) => {
            gsap.fromTo(
              frame,
              { y: 0 },
              {
                y: () => hero.offsetHeight * (1 - 0.75),
                ease: 'none',
                scrollTrigger: {
                  trigger: hero,
                  scroller,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.55,
                  invalidateOnRefresh: true,
                },
              }
            );
          });

          eastCols.forEach((col) => {
            gsap.fromTo(
              col,
              { y: 0, opacity: 1 },
              {
                y: () => hero.offsetHeight * (1 - 1.2),
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: hero,
                  scroller,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: 0.45,
                  invalidateOnRefresh: true,
                },
              }
            );
          });
        }
      }, hero);

      window.clearTimeout(refreshId);
      refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    };

    setup();
    mq.addEventListener('change', setup);
    return () => {
      mq.removeEventListener('change', setup);
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [displayName, avatarUrl, bioRight]);

  const portrait = (density: Density) => {
    const box =
      density === 'mobile'
        ? 'aspect-[3/4] w-full max-w-[17.5rem]'
        : density === 'tablet'
          ? 'h-[clamp(15rem,38vw,20rem)] w-[clamp(11.5rem,28vw,15.5rem)]'
          : 'h-[clamp(19rem,30vw,26rem)] w-[clamp(15rem,23vw,20rem)]';
    const pad =
      density === 'mobile'
        ? 'clamp(0.75rem, 3vw, 1.1rem)'
        : 'clamp(1.1rem, 1.8vw, 1.65rem)';
    const sizes =
      density === 'mobile'
        ? '280px'
        : density === 'tablet'
          ? '240px'
          : '(min-width: 1024px) 22vw, 320px';
    const showLCorner = density !== 'mobile';

    return (
      <div
        className="pf-exp-split-photo relative shrink-0"
        style={
          showLCorner
            ? {
                paddingTop: pad,
                paddingLeft: pad,
              }
            : undefined
        }
      >
        {showLCorner ? (
          <>
            <span
              className="pf-exp-split-stroke pf-exp-split-stroke-h pointer-events-none absolute left-0 top-0 z-[1]"
              style={{ height: 5, width: '100%', backgroundColor: principal }}
              aria-hidden
            />
            <span
              className="pf-exp-split-stroke pf-exp-split-stroke-v pointer-events-none absolute left-0 top-0 z-[1]"
              style={{ width: 5, height: '100%', backgroundColor: principal }}
              aria-hidden
            />
          </>
        ) : null}
        <div
          className={`pf-exp-split-photo-inner relative overflow-hidden ${box}`}
          style={{
            backgroundColor: `color-mix(in srgb, ${bordure} 28%, ${fond})`,
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
              className="flex h-full w-full items-center justify-center font-sans text-4xl font-semibold tracking-tight"
              style={{ color: muted }}
              aria-hidden
            >
              {initials}
            </div>
          )}
        </div>
      </div>
    );
  };

  const experienceAside = (density: Density, className = '') => {
    const yearsSize =
      density === 'mobile'
        ? 'clamp(3rem, 16vw, 3.75rem)'
        : density === 'tablet'
          ? 'clamp(3.25rem, 6vw, 4.25rem)'
          : 'clamp(3.75rem, 7vw, 5.5rem)';
    const yearsMt = density === 'mobile' ? '1.5rem' : '2.5rem';
    const bioMt = density === 'mobile' ? '1.85rem' : '3.5rem';
    const bioSize =
      density === 'mobile' ? '1.0625rem' : 'clamp(0.95rem, 1.05vw, 1.0625rem)';
    const asideTop = density === 'mobile' && bioRight ? 'mt-2' : '';

    return (
      <aside
        className={`pf-exp-split-east flex min-w-0 flex-col items-start ${asideTop} ${className}`.trim()}
      >
        <div className="pf-exp-split-cascade flex flex-col items-start">
          <p
            className="pf-exp-split-avail mb-0 ml-0 mr-0 mt-0 font-sans text-[0.7rem] font-semibold uppercase leading-none tracking-[0.16em]"
            style={{ color: ink }}
          >
            {availability}
          </p>
          <div
            aria-hidden
            className="mt-2.5"
            style={{ width: '4.5rem', height: 5, backgroundColor: principal }}
          />
        </div>
        <div
          className="pf-exp-split-cascade flex flex-col items-start"
          style={{ marginTop: yearsMt }}
        >
          <p
            className="mb-0 ml-0 mr-0 mt-0 font-sans font-bold leading-[0.92] tracking-[-0.045em]"
            style={{ color: ink, fontSize: yearsSize }}
          >
            {yearsLabel}
          </p>
          <p
            className="mb-0 ml-0 mr-0 mt-2.5 font-sans text-[0.72rem] font-semibold uppercase leading-none tracking-[0.16em]"
            style={{ color: ink }}
          >
            Years of experience
          </p>
        </div>
        <p
          className="pf-exp-split-cascade pf-exp-split-bio mb-0 ml-0 mr-0 max-w-[22rem] font-sans font-normal tracking-[-0.01em]"
          style={{ color: ink, fontSize: bioSize, lineHeight: 1.55, marginTop: bioMt }}
        >
          {bioText}
        </p>
      </aside>
    );
  };

  const title = (density: Density) => (
    <h1
      className="pf-exp-split-title m-0 w-full max-w-[16ch] font-sans font-semibold tracking-[-0.04em]"
      style={{
        color: ink,
        fontSize:
          density === 'mobile'
            ? 'clamp(2.15rem, 8.5vw, 2.85rem)'
            : density === 'tablet'
              ? 'clamp(2.5rem, 5vw, 3.35rem)'
              : 'clamp(2.85rem, 4.8vw, 4.5rem)',
        lineHeight: 1.05,
      }}
    >
      {titleLines.map((line) => (
        <span key={line} className="pf-exp-split-title-mask block overflow-hidden">
          <span className="pf-exp-split-title-line block">{line}</span>
        </span>
      ))}
    </h1>
  );

  const specialtyBlock = (
    <p
      className="m-0 max-w-[36rem] font-sans font-bold tracking-[-0.015em]"
      style={{
        color: ink,
        fontSize: 'clamp(1.05rem, 1.35vw, 1.25rem)',
        lineHeight: 1.35,
      }}
    >
      {specialty}
    </p>
  );

  const specialtyMobile = (
    <p
      className="m-0 font-sans font-bold tracking-[-0.015em]"
      style={{ color: ink, fontSize: '1.0625rem', lineHeight: 1.4 }}
    >
      {specialty}
    </p>
  );

  const ctas = (density: Density) => {
    const stacked = density === 'mobile';
    return (
      <div
        className={
          stacked
            ? 'flex w-full flex-col gap-3'
            : 'flex flex-wrap items-center gap-3 sm:gap-4'
        }
      >
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className={`${CTA_SHAPE} transition hover:brightness-110 ${stacked ? 'w-full' : ''}`}
          style={{ backgroundColor: ink, color: fond }}
        >
          Let&apos;s talk
          <span aria-hidden>↗</span>
        </a>
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className={`${CTA_SHAPE} border transition hover:opacity-80 ${stacked ? 'w-full' : ''}`}
          style={{ borderColor: ink, color: ink, backgroundColor: 'transparent' }}
        >
          View my work
        </a>
      </div>
    );
  };

  const leftCopyFrame = (density: Exclude<Density, 'mobile'>, children: ReactNode) => (
    <div
      className="pf-exp-split-west relative min-w-0 justify-self-start"
      style={{
        paddingRight: density === 'tablet' ? '1rem' : 'clamp(1.1rem, 1.8vw, 1.65rem)',
        paddingBottom: density === 'tablet' ? '1rem' : 'clamp(1.1rem, 1.8vw, 1.65rem)',
      }}
    >
      <span
        className="pf-exp-split-stroke pf-exp-split-stroke-v pointer-events-none absolute right-0 top-0 z-[1]"
        style={{ width: 5, height: '100%', backgroundColor: principal }}
        aria-hidden
      />
      <span
        className="pf-exp-split-stroke pf-exp-split-stroke-h pointer-events-none absolute bottom-0 left-0 z-[1]"
        style={{ height: 5, width: '100%', backgroundColor: principal }}
        aria-hidden
      />
      {children}
    </div>
  );

  const withGlobalFrame = (node: ReactNode, density: Density) =>
    globalFrame ? (
      <div
        className="w-full min-w-0"
        style={{
          border: `1px solid ${frameColor}`,
          padding:
            density === 'mobile'
              ? '1rem'
              : density === 'tablet'
                ? '1.25rem'
                : 'clamp(1.25rem, 2.5vw, 2rem)',
        }}
      >
        {node}
      </div>
    ) : (
      node
    );

  /* —— Desktop (≥ lg): full two-column editorial —— */
  const desktopBody = bioRight ? (
    <div
      className="grid w-full min-w-0"
      style={{
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        columnGap: 'clamp(4rem, 12vw, 10rem)',
        alignItems: 'start',
      }}
    >
      {leftCopyFrame(
        'desktop',
        <div className="flex min-w-0 flex-col items-start gap-10">
          {title('desktop')}
          <div className="flex min-w-0 flex-col items-start gap-10">
            {specialtyBlock}
            {ctas('desktop')}
          </div>
        </div>
      )}
      <div className="flex shrink-0 items-start gap-8 justify-self-end">
        {portrait('desktop')}
        {experienceAside('desktop', 'max-w-[20rem]')}
      </div>
    </div>
  ) : (
    <div
      className="grid w-full"
      style={{
        gridTemplateColumns: 'minmax(14rem, 25rem) minmax(0, 1fr)',
        columnGap: 'clamp(3rem, 7vw, 6rem)',
        alignItems: 'start',
      }}
    >
      {experienceAside('desktop')}
      <div className="flex min-w-0 flex-col items-stretch gap-10">
        {title('desktop')}
        <div className="flex min-w-0 items-start gap-16">
          <div className="flex min-w-0 flex-col items-start gap-10">
            {specialtyBlock}
            {ctas('desktop')}
          </div>
          {portrait('desktop')}
        </div>
      </div>
    </div>
  );

  /* —— Tablet (md–lg): intro on top, paired frames below —— */
  const tabletBody = bioRight ? (
    <div className="flex w-full min-w-0 flex-col gap-10">
      {leftCopyFrame(
        'tablet',
        <div className="flex min-w-0 flex-col items-start gap-7">
          {title('tablet')}
          {specialtyBlock}
          {ctas('tablet')}
        </div>
      )}
      <div className="flex w-full min-w-0 items-start gap-6 sm:gap-8">
        {portrait('tablet')}
        {experienceAside('tablet', 'min-w-0 flex-1 max-w-[22rem]')}
      </div>
    </div>
  ) : (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <div className="flex w-full min-w-0 items-start gap-6 sm:gap-8">
        {experienceAside('tablet', 'min-w-0 flex-1 max-w-[18rem]')}
        {portrait('tablet')}
      </div>
      <div className="flex min-w-0 flex-col items-start gap-7">
        {title('tablet')}
        {specialtyBlock}
        {ctas('tablet')}
      </div>
    </div>
  );

  /* —— Mobile: single-column story; CTA sits outside the global frame —— */
  const mobileBody = (
    <div className="flex w-full flex-col gap-9">
      {!bioRight ? experienceAside('mobile') : null}

      <div className="flex w-full flex-col gap-5">
        {title('mobile')}
        {specialtyMobile}
      </div>

      <div className="flex w-full justify-start">{portrait('mobile')}</div>

      {bioRight ? (
        <div className="w-full pt-4">{experienceAside('mobile')}</div>
      ) : null}
    </div>
  );

  const mobileLetsTalk = (
    <a
      href={primaryHref}
      onClick={onNavClick(primaryHref)}
      className={`${CTA_SHAPE} w-full transition hover:brightness-110`}
      style={{ backgroundColor: ink, color: fond }}
    >
      Let&apos;s talk
      <span aria-hidden>↗</span>
    </a>
  );

  return (
    <div
      ref={heroRef}
      className="pf-exp-split-hero relative isolate w-full overflow-x-clip overflow-y-visible font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      {/* Desktop — global content width + gutter only */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] lg:flex lg:items-center ${shellX}`}
        style={{
          paddingTop: 'calc(5.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2rem, 4vh, 3rem)',
        }}
      >
        {withGlobalFrame(desktopBody, 'desktop')}
      </div>

      {/* Tablet */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] md:flex md:items-center lg:hidden ${shellX}`}
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2rem, 4vh, 2.75rem)',
        }}
      >
        {withGlobalFrame(tabletBody, 'tablet')}
      </div>

      {/* Mobile */}
      <div
        className={`relative z-[1] flex flex-col gap-6 pb-14 pt-[calc(4.75rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {withGlobalFrame(mobileBody, 'mobile')}
        <div className="w-full shrink-0">{mobileLetsTalk}</div>
      </div>
    </div>
  );
}
