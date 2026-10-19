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
import { isPortfolioMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { useT } from '@/lib/i18n/I18nProvider';

type Density = 'mobile' | 'tablet' | 'desktop';

const CTA_SHAPE =
  'inline-flex h-12 min-h-12 items-center justify-center gap-2 px-7 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em]';

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
  const t = useT();
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
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
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const showPrimaryCta = data.showContactCta !== false;
  const showSecondaryCta = data.showWorkCta !== false;
  const hasCtas = showPrimaryCta || showSecondaryCta;
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
      t('Independent art director. I create clear, expressive, and lasting visual identities.')
    );
  }, [data.description, t]);

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
    if (prefersReducedMotion() || isPortfolioMotionOff()) return;

    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(min-width: 1280px)');
    const layoutMq = window.matchMedia('(min-width: 768px)');
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
    layoutMq.addEventListener('change', setup);
    return () => {
      mq.removeEventListener('change', setup);
      layoutMq.removeEventListener('change', setup);
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [displayName, avatarUrl, bioRight]);

  const portrait = (density: Density) => {
    const box =
      density === 'mobile'
        ? 'aspect-[4/5] w-full'
        : density === 'tablet'
          ? 'h-[clamp(16rem,37vw,21rem)] w-[clamp(12.5rem,29vw,16.5rem)]'
          : 'h-[clamp(23rem,35vw,31rem)] w-[clamp(17rem,26vw,23rem)]';
    const sizes =
      density === 'mobile'
        ? '304px'
        : density === 'tablet'
          ? '264px'
          : '(min-width: 1280px) 26vw, 368px';

    return (
      <div className={`pf-exp-split-photo relative shrink-0 pb-4 pr-4 ${density === 'mobile' ? 'w-full max-w-[15.5rem]' : ''}`}>
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-[72%] w-[72%]"
          style={{ backgroundColor: `color-mix(in srgb, ${principal} 72%, ${fond})` }}
        />
        <span
          aria-hidden
          className="absolute right-0 top-5 z-[2] h-14 w-1"
          style={{ backgroundColor: principal }}
        />
        <div
          className={`pf-exp-split-photo-inner relative overflow-hidden ${box}`}
          style={{
            backgroundColor: `color-mix(in srgb, ${bordure} 28%, ${fond})`,
            clipPath: 'polygon(0 0, 100% 0, 100% 88%, 84% 100%, 0 100%)',
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={t('Portrait of {displayName}', { displayName })}
              width={920}
              height={1150}
              sizes={sizes}
              className={`h-full w-full object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
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
        ? 'clamp(3.8rem, 18vw, 4.5rem)'
        : density === 'tablet'
          ? 'clamp(4.5rem, 10vw, 6.5rem)'
          : 'clamp(6rem, 9vw, 9rem)';
    const yearsMt = density === 'mobile' ? '1rem' : '2.25rem';
    const bioMt = density === 'mobile' ? '1.15rem' : '2.5rem';
    const bioSize =
      density === 'mobile' ? '0.95rem' : 'clamp(0.95rem, 1.05vw, 1.0625rem)';
    const asideTop = density === 'mobile' && bioRight ? 'mt-2' : '';

    return (
      <aside
        className={`pf-exp-split-east relative flex min-w-0 flex-col items-start ${asideTop} ${className}`.trim()}
      >
        {showAvailability ? <div className="pf-exp-split-cascade inline-flex min-h-9 items-center gap-2.5 rounded-full border px-3.5 py-2" style={{ borderColor: frameColor, backgroundColor: `color-mix(in srgb, ${neutre} 68%, transparent)` }}>
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full opacity-30" style={{ backgroundColor: principal }} />
            <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: principal }} />
          </span>
          <p
            className="pf-exp-split-avail m-0 font-sans text-[0.66rem] font-semibold uppercase leading-none tracking-[0.14em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div> : null}
        <div
          className="pf-exp-split-cascade relative flex flex-col items-start"
          style={{ marginTop: yearsMt }}
        >
          <p
            className="m-0 font-sans font-semibold leading-[0.78] tracking-[-0.075em]"
            style={{ color: ink, fontSize: yearsSize }}
          >
            {yearsLabel}
          </p>
          <p
            className="mb-0 ml-1 mr-0 mt-5 font-sans text-[0.68rem] font-semibold uppercase leading-none tracking-[0.18em]"
            style={{ color: principal }}
          >
            {t('Years of experience')}
          </p>
        </div>
        <p
          className="pf-exp-split-cascade pf-exp-split-bio mb-0 ml-0 mr-0 max-w-[23rem] border-l font-sans font-normal tracking-[-0.01em]"
          style={{ color: muted, borderColor: frameColor, fontSize: bioSize, lineHeight: 1.6, marginTop: bioMt, paddingLeft: '1.25rem' }}
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
            ? 'clamp(2.55rem, 11vw, 3.75rem)'
            : density === 'tablet'
              ? 'clamp(3rem, 6.4vw, 4.75rem)'
              : 'clamp(4rem, 5.6vw, 6.4rem)',
        lineHeight: 0.96,
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
    if (!hasCtas) return null;
    return (
      <div
        className={
          stacked
            ? 'grid w-full grid-cols-2 gap-2.5'
            : 'flex flex-wrap items-center gap-3 sm:gap-4'
        }
      >
        {showPrimaryCta ? <a
            href={primaryHref}
            onClick={onNavClick(primaryHref)}
            className={`${CTA_SHAPE} rounded-full transition duration-300 hover:-translate-y-0.5 hover:brightness-110 ${stacked ? 'w-full px-3 text-[0.64rem]' : ''}`}
            style={{ backgroundColor: ink, color: fond }}
          >
            {t('Let\'s talk')}
            <span aria-hidden>↗</span>
          </a> : null}
        {showSecondaryCta ? <a
            href={secondaryHref}
            onClick={onNavClick(secondaryHref)}
            className={`${CTA_SHAPE} rounded-full border transition duration-300 hover:-translate-y-0.5 hover:opacity-80 ${stacked ? 'w-full px-3 text-[0.64rem]' : ''}`}
            style={{ borderColor: frameColor, color: ink, backgroundColor: 'transparent' }}
          >
            {t('View my work')}
          </a> : null}
      </div>
    );
  };

  const leftCopyFrame = (density: Exclude<Density, 'mobile'>, children: ReactNode) => (
    <div
      className="pf-exp-split-west relative min-w-0 justify-self-start border-l"
      style={{
        borderColor: frameColor,
        paddingLeft: density === 'tablet' ? '1.25rem' : 'clamp(1.5rem, 2.5vw, 2.5rem)',
      }}
    >
      <span
        className="pf-exp-split-stroke pf-exp-split-stroke-v pointer-events-none absolute -left-px top-0 z-[1]"
        style={{ width: 3, height: density === 'tablet' ? '3.5rem' : '5rem', backgroundColor: principal }}
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
      <div
        className="flex shrink-0 items-center gap-[clamp(2rem,3vw,3.5rem)] justify-self-end p-[clamp(1.25rem,2vw,2rem)]"
        style={{ backgroundColor: `color-mix(in srgb, ${neutre} 58%, transparent)` }}
      >
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
      <div className="p-[clamp(1.25rem,2vw,2rem)]" style={{ backgroundColor: `color-mix(in srgb, ${neutre} 58%, transparent)` }}>
        {experienceAside('desktop')}
      </div>
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
    <div className="flex w-full flex-col gap-6">
      {!bioRight ? experienceAside('mobile') : null}

      <div className="flex w-full flex-col gap-3">
        {title('mobile')}
        {specialtyMobile}
      </div>

      <div className="flex w-full justify-start">{portrait('mobile')}</div>

      {bioRight ? (
        <div className="w-full pt-4">{experienceAside('mobile')}</div>
      ) : null}
    </div>
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
        className={`relative z-[1] hidden min-h-[100dvh] xl:flex xl:items-center ${shellX}`}
        style={{
          paddingTop: 'calc(5.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2rem, 4vh, 3rem)',
        }}
      >
        {withGlobalFrame(desktopBody, 'desktop')}
      </div>

      {/* Tablet */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] md:flex md:items-center xl:hidden ${shellX}`}
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2rem, 4vh, 2.75rem)',
        }}
      >
        {withGlobalFrame(tabletBody, 'tablet')}
      </div>

      {/* Mobile */}
      <div
        className={`relative z-[1] flex min-h-[100svh] flex-col gap-4 pb-10 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {withGlobalFrame(mobileBody, 'mobile')}
        {hasCtas ? <div className="w-full shrink-0">{ctas('mobile')}</div> : null}
      </div>
    </div>
  );
}
