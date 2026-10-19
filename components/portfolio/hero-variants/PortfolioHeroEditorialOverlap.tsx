'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroSpecialtyValue,
  type PortfolioHeroEditorialOverlapAlign,
  type PortfolioHeroEditorialOverlapWidth,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { isPortfolioMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { useT } from '@/lib/i18n/I18nProvider';

type Density = 'desktop' | 'tablet' | 'mobile';

type EditorialOverlapHeroProps = {
  image: string | null;
  specialty: string;
  greeting: string;
  description: string;
  fond: string;
  ink: string;
  muted: string;
  neutre: string;
  principal: string;
  bordure: string;
  contentShellClass: string;
  width: PortfolioHeroEditorialOverlapWidth;
  align: PortfolioHeroEditorialOverlapAlign;
  imageBw: boolean;
  suppressBackground?: boolean;
};

function stageWidthStyle(width: PortfolioHeroEditorialOverlapWidth): CSSProperties {
  if (width === 'medium') return { width: '100%', maxWidth: '56rem' };
  if (width === 'large') return { width: '100%', maxWidth: '76rem' };
  return { width: '100%', maxWidth: '100%' };
}

function stageAlignClass(align: PortfolioHeroEditorialOverlapAlign): string {
  if (align === 'center') return 'mx-auto';
  if (align === 'right') return 'ml-auto mr-0';
  return 'ml-0 mr-auto';
}

function overlapScrollParent(element: HTMLElement | null): HTMLElement | undefined {
  let node = element?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return undefined;
}

/** Chevauchement éditorial — a cut-paper magazine composition. */
function EditorialOverlapHero({
  image,
  specialty,
  greeting,
  description,
  fond,
  ink,
  muted,
  neutre,
  principal,
  bordure,
  contentShellClass,
  width,
  align,
  imageBw,
  suppressBackground = false,
}: EditorialOverlapHeroProps) {
  const t = useT();
  const heroRef = useRef<HTMLElement>(null);
  const widthStyle = stageWidthStyle(width);
  const alignClass = stageAlignClass(align);
  const mediaSurface = `color-mix(in srgb, ${neutre} 62%, ${fond})`;
  const panelBorder = `color-mix(in srgb, ${bordure} 74%, transparent)`;

  const renderMedia = (sizes: string) => image ? (
    <Image
      src={image}
      alt=""
      width={1800}
      height={1200}
      priority
      sizes={sizes}
      className={`h-full w-full object-cover object-[center_30%] ${heroImageGrayscaleClass(imageBw)}`}
    />
  ) : (
    <div className="size-full" style={{ backgroundColor: mediaSurface }} aria-hidden />
  );

  const renderIdentity = (density: Density) => {
    const titleSize = density === 'desktop'
      ? 'clamp(3.8rem, 5.2vw, 6.5rem)'
      : density === 'tablet'
        ? 'clamp(3.35rem, 7.4vw, 5.2rem)'
        : 'clamp(2.9rem, 12.5vw, 4.25rem)';
    return (
      <>
        <div className="pf-overlap-tag flex items-center gap-3">
          <span className="size-2 shrink-0" style={{ backgroundColor: principal }} aria-hidden />
          <p className="m-0 font-sans text-[0.67rem] font-semibold uppercase tracking-[0.18em]" style={{ color: muted }}>
            {specialty}
          </p>
        </div>
        <h1
          className="pf-overlap-title m-0 mt-[clamp(.8rem,1.5vw,1.25rem)] max-w-[10ch] text-balance font-serif font-medium tracking-[-0.055em]"
          style={{ color: ink, fontSize: titleSize, lineHeight: 0.94, textShadow: `0 8px 32px color-mix(in srgb, ${fond} 42%, transparent)` }}
        >
          {greeting}
        </h1>
      </>
    );
  };

  const renderDescription = (density: Density) => description ? (
    <div
      className="pf-overlap-desc-card border-t"
      style={{
        borderColor: panelBorder,
        paddingTop: density === 'mobile' ? '1rem' : 'clamp(1.1rem,1.7vw,1.5rem)',
      }}
    >
      <p
        className="pf-overlap-desc m-0 font-sans font-normal tracking-[-0.01em]"
        style={{
          color: muted,
          fontSize: density === 'mobile' ? '0.95rem' : 'clamp(0.96rem,1.05vw,1.08rem)',
          lineHeight: 1.58,
        }}
      >
        {description}
      </p>
    </div>
  ) : null;

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isPortfolioMotionOff()) return;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = overlapScrollParent(hero);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      const animate = (selector: string, scroll = false) => {
        const root = hero.querySelector<HTMLElement>(selector);
        if (!root) return;
        const frame = root.querySelector<HTMLElement>('.pf-overlap-media');
        const panel = root.querySelector<HTMLElement>('.pf-overlap-panel');
        const tag = root.querySelector<HTMLElement>('.pf-overlap-tag');
        const title = root.querySelector<HTMLElement>('.pf-overlap-title');
        const descriptionElement = root.querySelector<HTMLElement>('.pf-overlap-desc');
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });
        if (frame) timeline.from(frame, { clipPath: 'inset(0 100% 0 0)', duration: 1.15 }, 0);
        if (panel) timeline.from(panel, { y: 56, autoAlpha: 0, duration: 1 }, 0.2);
        if (tag) timeline.from(tag, { y: 14, autoAlpha: 0, duration: 0.65 }, 0.48);
        if (title) timeline.from(title, { y: 28, autoAlpha: 0, duration: 0.9 }, 0.55);
        if (descriptionElement) timeline.from(descriptionElement, { y: 18, autoAlpha: 0, duration: 0.75 }, 0.7);

        if (scroll && frame && panel) {
          gsap.to(frame, {
            yPercent: 7,
            scale: 1.025,
            ease: 'none',
            scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: 0.55, invalidateOnRefresh: true },
          });
          gsap.to(panel, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: 0.55, invalidateOnRefresh: true },
          });
        }
      };

      media.add('(min-width: 1280px)', () => animate('.pf-overlap-desktop', true));
      media.add('(min-width: 1024px) and (max-width: 1279px)', () => animate('.pf-overlap-tablet'));
      media.add('(max-width: 1023px)', () => animate('.pf-overlap-mobile'));
      return () => media.revert();
    }, hero);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      context.revert();
    };
  }, [description, greeting, image, align, width]);

  return (
    <section
      ref={heroRef}
      className="pf-overlap-hero relative isolate w-full overflow-x-clip"
      style={{ ...(suppressBackground ? null : { backgroundColor: fond }), color: ink }}
      aria-label={t('Editorial hero')}
      data-hero-variant="editorial-overlap"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2" style={suppressBackground ? undefined : { backgroundColor: fond }} />

      {/* Desktop: lateral editorial overlap — image window left, identity right. */}
      <div
        className={`pf-overlap-desktop relative z-[1] hidden min-h-[100dvh] items-center xl:flex ${contentShellClass}`}
        style={{ paddingTop: 'calc(5.25rem + env(safe-area-inset-top, 0px))', paddingBottom: 'clamp(2rem,4vh,3.25rem)' }}
      >
        <div className={`relative ${alignClass}`} style={{ ...widthStyle, minHeight: 'clamp(32rem, 70vh, 43rem)' }}>
          <figure
            className="pf-overlap-media absolute left-[3%] top-1/2 m-0 h-[80%] w-[44%] -translate-y-1/2 overflow-hidden border"
            style={{ backgroundColor: mediaSurface, borderColor: panelBorder }}
          >
            {renderMedia('(min-width: 1280px) 43vw, 100vw')}
          </figure>
          <div
            className="pf-overlap-panel absolute left-[49%] top-1/2 z-[2] w-[48%] -translate-y-1/2 pl-[clamp(1.5rem,2.5vw,3rem)]"
          >
            {renderIdentity('desktop')}
            {description ? <div className="mt-[clamp(2rem,3vw,3rem)] max-w-[28rem]">
              {renderDescription('desktop')}
            </div> : null}
          </div>
        </div>
      </div>

      {/* Tablet: a compact magazine spread, not a squeezed desktop stage. */}
      <div
        className={`pf-overlap-tablet relative z-[1] hidden min-h-[100dvh] items-center lg:flex xl:hidden ${contentShellClass}`}
        style={{ paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))', paddingBottom: 'clamp(2rem,4vh,3rem)' }}
      >
        <div className={`relative ${alignClass}`} style={widthStyle}>
          <figure
            className="pf-overlap-media relative m-0 ml-[2%] h-[clamp(24rem,57vh,32rem)] w-[49%] overflow-hidden border"
            style={{ backgroundColor: mediaSurface, borderColor: panelBorder }}
          >
            {renderMedia('(max-width: 1279px) 49vw, 100vw')}
          </figure>
          <div
            className="pf-overlap-panel absolute left-[52%] top-1/2 z-[2] w-[46%] -translate-y-1/2 pl-[clamp(1.25rem,2.5vw,2.25rem)]"
          >
            {renderIdentity('tablet')}
            {description ? <div className="mt-7 max-w-[23rem]">{renderDescription('tablet')}</div> : null}
          </div>
        </div>
      </div>

      {/* Mobile: image, deep tuck, then readable editorial card. */}
      <div className={`pf-overlap-mobile relative z-[1] flex min-h-[100svh] flex-col pb-10 pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:hidden ${contentShellClass}`}>
        <div className={`relative ${alignClass}`} style={widthStyle}>
          <figure
            className="pf-overlap-media relative m-0 aspect-[5/4] w-full overflow-hidden border md:aspect-[16/10] md:w-[74%]"
            style={{ backgroundColor: mediaSurface, borderColor: panelBorder }}
          >
            {renderMedia('100vw')}
          </figure>
          <div
            className="pf-overlap-panel relative z-[2] -mt-10 ml-auto w-[94%] pt-3 md:-mt-24 md:w-[64%] md:pt-5"
            style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${fond} 96%, transparent) 0%, ${fond} 38%)` }}
          >
            {renderIdentity('mobile')}
            {description ? <div className="mt-6 w-[92%]">{renderDescription('mobile')}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PortfolioHeroEditorialOverlap({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');

  const displayName = (data.fullName || data.nameLead || '').trim() || 'there';
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const image = data.presentation.heroEditorialOverlapImageUrl?.trim() || data.avatarUrl?.trim() || null;
  const imageBw = data.presentation.heroImageGrayscale === true;
  const customHeadline = data.presentation.heroEditorialOverlapHeadline?.trim() || '';
  const greeting = customHeadline || `Hi, I'm ${displayName}.`;

  const width =
    data.presentation.heroEditorialOverlapWidth === 'medium' ||
    data.presentation.heroEditorialOverlapWidth === 'large' ||
    data.presentation.heroEditorialOverlapWidth === 'full'
      ? data.presentation.heroEditorialOverlapWidth
      : 'full';
  const align =
    data.presentation.heroEditorialOverlapAlign === 'left' ||
    data.presentation.heroEditorialOverlapAlign === 'center' ||
    data.presentation.heroEditorialOverlapAlign === 'right'
      ? data.presentation.heroEditorialOverlapAlign
      : 'left';

  const description = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim() || '';
    if (cleaned.length <= 180) return cleaned;
    const cut = cleaned.slice(0, 177);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }, [data.description]);

  return (
    <EditorialOverlapHero
      image={image}
      specialty={specialty}
      greeting={greeting}
      description={description}
      fond={fond}
      ink={ink}
      muted={muted}
      neutre={neutre}
      principal={principal}
      bordure={bordure}
      contentShellClass={portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass)}
      width={width}
      align={align}
      imageBw={imageBw}
      suppressBackground={data.suppressBackground}
    />
  );
}
