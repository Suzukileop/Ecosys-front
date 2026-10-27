'use client';
import {resolveHeroGreeting} from '../portfolio-hero-headline-settings';

import Image from 'next/image';
import gsap from 'gsap';
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
import { isPortfolioMotionOff } from '@/components/portfolio/portfolio-motion-off';
import { useT } from '@/lib/i18n/I18nProvider';
import { resolveStudioSplitSurface } from '../portfolio-studio-split-surface';

const FALLBACK_BIO =
  'We craft distinctive digital products and brand systems for ambitious teams — clear strategy, sharp design, and experiences that feel inevitable.';

export function PortfolioHeroStudioSplit({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const studioSurface = resolveStudioSplitSurface(
    data.presentation.heroStudioSplitAccentColor?.trim() || principal,
    data.presentation.heroStudioSplitAccentOpacity,
    fond
  );
  const studioAccent = studioSurface.surface;
  const studioPanelInk = studioSurface.ink;
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const displayName = useMemo(() => {
    const raw = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
    return raw || t('Lorem Ipsum');
  }, [data.fullName, data.nameLead, t]);
  const eyebrow = data.presentation.heroStudioSplitEyebrow?.trim() || t('Portfolio');
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const bio = useMemo(() => data.description?.replace(/\s+/g, ' ').trim() || FALLBACK_BIO, [data.description]);

  const frameStyle = data.presentation.heroStudioSplitFrameStyle ?? 'circle-center';
  const customMediaUrl = data.presentation.heroStudioSplitMediaUrl?.trim() || '';
  const profilePortraitUrl = data.avatarUrl?.trim() || '';
  const usesProfilePortrait = !customMediaUrl && frameStyle !== 'panorama' && Boolean(profilePortraitUrl);
  const mediaUrl = customMediaUrl || (frameStyle !== 'panorama' ? profilePortraitUrl : '');
  const mediaIsVideo = Boolean(mediaUrl && /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl));
  const mediaWidth = data.presentation.heroStudioSplitMediaWidth ?? 'full';
  const mediaWidthClass = frameStyle === 'panorama'
    ? mediaWidth === 'medium'
      ? 'mx-auto w-full max-w-[50rem]'
      : mediaWidth === 'large'
        ? 'mx-auto w-full max-w-[72rem]'
        : 'w-full'
    : frameStyle === 'circle-center'
      ? mediaWidth === 'medium'
        ? 'mx-auto w-full max-w-[22rem]'
        : mediaWidth === 'large'
          ? 'mx-auto w-full max-w-[28rem]'
          : 'mx-auto w-full max-w-[34rem]'
      : frameStyle === 'portrait'
        ? mediaWidth === 'medium'
          ? 'mx-auto w-full max-w-[20rem]'
          : mediaWidth === 'large'
            ? 'mx-auto w-full max-w-[26rem]'
            : 'mx-auto w-full max-w-[32rem]'
        : mediaWidth === 'medium'
          ? 'ml-auto mr-[12%] w-full max-w-[22rem]'
          : mediaWidth === 'large'
            ? 'ml-auto mr-[8%] w-full max-w-[29rem]'
            : 'ml-auto mr-[4%] w-full max-w-[36rem]';
  const frameClass = frameStyle === 'circle-center'
    ? 'aspect-square rounded-full'
    : frameStyle === 'portrait'
      ? 'aspect-[4/5] rounded-[clamp(1.5rem,4vw,3.5rem)]'
      : frameStyle === 'offset-square'
        ? 'aspect-square'
        : 'h-[clamp(20rem,51vh,34rem)]';
  const frameClipPath = frameStyle === 'panorama'
    ? 'polygon(0 0, calc(100% - clamp(2rem, 5vw, 4.5rem)) 0, 100% clamp(2rem, 5vw, 4.5rem), 100% 100%, 0 100%)'
    : frameStyle === 'offset-square'
      ? 'polygon(0 0, 86% 0, 100% 14%, 100% 100%, 0 100%)'
      : undefined;

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const showPrimaryCta = data.showContactCta !== false;
  const showSecondaryCta = data.showWorkCta !== false;

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isPortfolioMotionOff()) return;

    const context = gsap.context(() => {
      const copy = section.querySelectorAll<HTMLElement>('.pf-studio-copy');
      const frame = section.querySelector<HTMLElement>('.pf-studio-frame');
      const media = section.querySelector<HTMLElement>('.pf-studio-media');
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });

      timeline.from(copy, { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.09 }, 0);
      if (frame) timeline.from(frame, { y: 48, clipPath: 'inset(0 0 100% 0)', autoAlpha: 0, duration: 1.05 }, 0.25);
      if (media) timeline.from(media, { scale: 1.08, duration: 1.35 }, 0.3);
    }, section);

    return () => context.revert();
  }, [mediaUrl, frameStyle]);

  return (
    <section
      ref={sectionRef}
      className="pf-studio-split relative isolate min-h-[100dvh] w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
      data-hero-variant="studio-split"
      aria-label={t('Studio split hero')}
    >
      <div className="relative" style={{ backgroundColor: studioAccent, color: studioPanelInk }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 left-1/2 w-screen -translate-x-1/2" style={{ backgroundColor: studioAccent }} />
        <div className={`relative z-[1] pb-[clamp(7rem,14vw,11rem)] pt-[calc(5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(6rem+env(safe-area-inset-top,0px))] ${shellX}`}>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-7">
              <p className="pf-studio-copy m-0 font-mono text-[0.67rem] font-semibold uppercase tracking-[0.22em]" style={{ color: `color-mix(in srgb, ${studioPanelInk} 72%, transparent)` }}>
                {eyebrow}
              </p>
              <h1 className="pf-studio-copy m-0 mt-5 max-w-[12ch] font-sans text-[clamp(3.25rem,6.2vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]" style={{ color: studioPanelInk }}>
                {resolveHeroGreeting(data.presentation,t('Hi, I\'m {displayName}', { displayName }),displayName,data.specialite??'')}
              </h1>
              <p className="pf-studio-copy m-0 mt-5 text-[clamp(1rem,1.25vw,1.2rem)] font-medium tracking-[-0.02em]" style={{ color: `color-mix(in srgb, ${studioPanelInk} 76%, transparent)` }}>
                {specialty}
              </p>
            </div>

            <div className="min-w-0 lg:col-span-5 lg:pt-1">
              <p data-hero-bio className="pf-studio-copy m-0 max-w-[35rem] text-[clamp(.98rem,1.15vw,1.12rem)] leading-[1.65] tracking-[-0.01em]" style={{ color: `color-mix(in srgb, ${studioPanelInk} 78%, transparent)` }}>
                {bio}
              </p>
              {showPrimaryCta || showSecondaryCta ? (
                <div className="pf-studio-copy mt-7 flex flex-wrap gap-3">
                  {showPrimaryCta ? <a href={primaryHref} onClick={onNavClick(primaryHref)} className="inline-flex min-h-12 items-center justify-center rounded-full px-7 text-[0.7rem] font-bold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5" style={{ backgroundColor: studioPanelInk, color: studioAccent }}>{t('Let\'s talk')}</a> : null}
                  {showSecondaryCta ? <a href={secondaryHref} onClick={onNavClick(secondaryHref)} className="inline-flex min-h-12 items-center justify-center rounded-full border px-7 text-[0.7rem] font-bold uppercase tracking-[0.15em] transition-transform hover:-translate-y-0.5" style={{ borderColor: studioPanelInk, color: studioPanelInk }}>{t('View my work')}</a> : null}
                </div>
              ) : null}
              <p data-hero-availability className="pf-studio-copy m-0 mt-5 flex items-center gap-2.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em]" style={{ color: `color-mix(in srgb, ${studioPanelInk} 74%, transparent)` }}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: studioPanelInk }} aria-hidden />
                {availability}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`relative z-[2] -mt-[clamp(4.75rem,9vw,7.25rem)] pb-[clamp(2rem,5vh,4rem)] ${shellX}`}>
        <div className={mediaWidthClass}>
          <div
            className={`pf-studio-frame relative w-full overflow-hidden border ${frameClass}`}
            style={{
              backgroundColor: `color-mix(in srgb, ${neutre} 70%, ${fond})`,
              borderColor: bordure,
              clipPath: frameClipPath,
            }}
          >
            {mediaUrl ? (
              mediaIsVideo ? (
                <video src={mediaUrl} className={`pf-studio-media absolute inset-0 size-full object-cover ${imageBw ? 'grayscale' : ''}`} autoPlay muted loop playsInline />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={usesProfilePortrait ? t('Portrait of {displayName}', { displayName }) : ''}
                  fill
                  sizes="100vw"
                  priority
                  className={`pf-studio-media object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
                />
              )
            ) : (
              <div className="pf-studio-media absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute inset-0 opacity-45" style={{ backgroundImage: `linear-gradient(${bordure} 1px, transparent 1px), linear-gradient(90deg, ${bordure} 1px, transparent 1px)`, backgroundSize: 'clamp(2.5rem,5vw,4rem) clamp(2.5rem,5vw,4rem)' }} />
                <span className="absolute left-[18%] top-[16%] size-[42%] rounded-full border" style={{ borderColor: `color-mix(in srgb, ${principal} 48%, transparent)` }} />
                <span className="absolute bottom-[14%] right-[14%] size-[28%] rotate-45 border" style={{ borderColor: `color-mix(in srgb, ${ink} 18%, transparent)` }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
