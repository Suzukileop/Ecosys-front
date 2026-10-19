'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
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
import { isPortfolioMotionOff, motionTimeout } from '@/components/portfolio/portfolio-motion-off';
import { useT } from '@/lib/i18n/I18nProvider';

/** Portrait rond — a dedicated orbital composition. */
export function PortfolioHeroCirclePortrait({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return cleaned || t('Du premier échange à la livraison, je construis des identités visuelles sensibles, cohérentes et durables pour les marques qui avancent.');
  }, [data.description, t]);

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }, [displayName]);

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const showPrimaryCta = data.showContactCta !== false;
  const showSecondaryCta = data.showWorkCta !== false;
  const hasCtas = showPrimaryCta || showSecondaryCta;
  const titleBottom = data.presentation.heroCirclePortraitTitleBottom !== false;
  const markSpecialty = data.presentation.heroCirclePortraitSpecialtyMark === true;
  const borderSoft = `color-mix(in srgb, ${bordure} 76%, transparent)`;
  const displayWords = displayName.split(/(\s+)/).filter(Boolean);

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  useEffect(() => {
    if (!titleBottom || typeof window === 'undefined') return;
    const section = sectionRef.current;
    if (!section) return;
    // Reveal every responsive copy. A viewport can cross a breakpoint after the
    // initial load (editor preview resize / device rotation); hidden copies must
    // already be in their final state when they become visible.
    const all = (selector: string) => Array.from(section.querySelectorAll<HTMLElement>(selector));
    const words = all('[data-orbit-word]');
    const portraits = all('[data-orbit-portrait]');
    const details = all('[data-orbit-detail]');
    const reveal = (element: HTMLElement, transform = 'translateY(0)') => {
      element.style.opacity = '1';
      element.style.transform = transform;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      [...words, ...details].forEach((element) => reveal(element));
      portraits.forEach((element) => reveal(element, 'scale(1)'));
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    portraits.forEach((element) => {
      timers.push(motionTimeout(() => {
        element.style.transition = 'opacity .75s ease, transform .9s cubic-bezier(.2,.8,.2,1)';
        reveal(element, 'scale(1)');
      }, 90));
    });
    words.forEach((element, index) => {
      timers.push(motionTimeout(() => {
        element.style.transition = 'opacity .55s ease, transform .65s cubic-bezier(.2,.8,.2,1)';
        reveal(element);
      }, 170 + index * 45));
    });
    details.forEach((element, index) => {
      timers.push(motionTimeout(() => {
        element.style.transition = 'opacity .55s ease, transform .65s cubic-bezier(.2,.8,.2,1)';
        reveal(element);
      }, 360 + index * 90));
    });
    return () => timers.forEach(clearTimeout);
  }, [titleBottom, displayName]);

  useEffect(() => {
    if (!titleBottom || typeof window === 'undefined' || isPortfolioMotionOff()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 1280px)').matches) return;
    const section = sectionRef.current;
    if (!section) return;
    const visible = (selector: string) =>
      Array.from(section.querySelectorAll<HTMLElement>(selector)).find((element) => element.getClientRects().length > 0);
    const portraitElement = visible('[data-orbit-column]');
    const copyElement = visible('[data-orbit-copy]');
    if (!portraitElement || !copyElement) return;

    let ticking = false;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height * 0.8)));
      portraitElement.style.transform = `translate3d(0, ${progress * -34}px, 0) rotate(${progress * -1.4}deg)`;
      copyElement.style.transform = `translate3d(0, ${progress * -14}px, 0)`;
      portraitElement.style.opacity = String(1 - progress * 0.35);
      copyElement.style.opacity = String(1 - progress * 0.25);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    portraitElement.style.willChange = 'transform, opacity';
    copyElement.style.willChange = 'transform, opacity';
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      [portraitElement, copyElement].forEach((element) => {
        element.style.transform = '';
        element.style.opacity = '';
        element.style.willChange = '';
      });
    };
  }, [titleBottom]);

  const animatedDetailStyle = titleBottom ? { opacity: 0, transform: 'translateY(18px)' } : undefined;

  const availabilityBadge = () => showAvailability ? (
    <div
      className="inline-flex min-h-10 items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-sm"
      style={{
        ...animatedDetailStyle,
        color: muted,
        borderColor: borderSoft,
        backgroundColor: `color-mix(in srgb, ${fond} 84%, ${neutre})`,
      }}
      data-orbit-detail
    >
      <span className="relative flex size-2.5" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full opacity-35" style={{ backgroundColor: principal }} />
        <span className="relative inline-flex size-2.5 rounded-full" style={{ backgroundColor: principal }} />
      </span>
      <span className="font-sans text-[0.78rem] font-medium tracking-[-0.01em]">{availability}</span>
    </div>
  ) : null;

  const specialtyBadge = (compact = false) => (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-sans font-semibold uppercase ${compact ? 'min-h-9 px-3 text-[0.64rem] tracking-[0.12em]' : 'min-h-12 px-5 text-[0.72rem] tracking-[0.13em]'}`}
      style={markSpecialty
        ? { backgroundColor: principal, borderColor: principal, color: fond }
        : { backgroundColor: `color-mix(in srgb, ${neutre} 78%, transparent)`, borderColor: borderSoft, color: principal }}
    >
      {specialty}
    </span>
  );

  const ctaRow = (compact = false) => hasCtas ? (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-3' : 'gap-4'}`} style={animatedDetailStyle} data-orbit-detail>
      {showPrimaryCta ? (
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className={`${compact ? 'min-h-11 px-5 text-[0.82rem]' : 'min-h-12 px-7 text-[0.9rem]'} inline-flex items-center justify-center rounded-full font-sans font-semibold transition duration-300 hover:-translate-y-0.5 hover:brightness-110`}
          style={{ backgroundColor: ink, color: fond }}
        >
          {t("Let's talk")}
        </a>
      ) : null}
      {showSecondaryCta ? (
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className={`${compact ? 'min-h-11 px-4 text-[0.82rem]' : 'min-h-12 px-5 text-[0.9rem]'} inline-flex items-center justify-center rounded-full border font-sans font-semibold transition duration-300 hover:-translate-y-0.5`}
          style={{ borderColor: borderSoft, color: ink }}
        >
          {t('View project')}
        </a>
      ) : null}
    </div>
  ) : null;

  const bioPanel = (compact = false) => (
    <div className={`flex max-w-[34rem] flex-col items-start ${compact ? 'gap-5' : 'gap-7'}`} data-orbit-copy>
      <p
        className="m-0 font-sans font-normal tracking-[-0.015em]"
        style={{
          ...animatedDetailStyle,
          color: muted,
          fontSize: compact ? '0.95rem' : 'clamp(1rem, 1.2vw, 1.17rem)',
          lineHeight: 1.58,
        }}
        data-orbit-detail
      >
        {bio}
      </p>
      {ctaRow(compact)}
    </div>
  );

  const portrait = (size: string, sizes: string, compact = false) => (
    <div className="relative isolate flex shrink-0 items-center justify-center" style={{ width: size, height: size }} data-orbit-column>
      <div aria-hidden className="absolute -inset-[9%] rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${principal} 14%, transparent) 0%, transparent 68%)` }} />
      <div aria-hidden className="absolute -inset-[5%] rounded-full border" style={{ borderColor: borderSoft }} />
      <div aria-hidden className="absolute -inset-[11%] rounded-full border" style={{ borderColor: `color-mix(in srgb, ${principal} 38%, transparent)`, clipPath: 'inset(0 0 48% 48%)' }} />
      <span aria-hidden className="absolute -right-[7%] top-[23%] z-20 size-3 rounded-full border-[3px]" style={{ backgroundColor: principal, borderColor: fond }} />
      <span aria-hidden className="absolute -bottom-[4%] left-[17%] z-20 size-2 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${principal} 72%, ${ink})` }} />
      <div
        className="relative size-full overflow-hidden rounded-full border"
        style={{
          backgroundColor: `color-mix(in srgb, ${neutre} 70%, ${bordure})`,
          borderColor: borderSoft,
          boxShadow: `0 28px 80px color-mix(in srgb, ${ink} 18%, transparent)`,
          opacity: titleBottom ? 0 : 1,
          transform: titleBottom ? 'scale(.84)' : 'scale(1)',
        }}
        data-orbit-portrait
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt={t('Portrait of {displayName}', { displayName })} fill sizes={sizes} className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`} priority />
        ) : (
          <div className="flex size-full items-center justify-center font-sans text-5xl font-semibold" style={{ color: muted }} aria-hidden>{initials}</div>
        )}
      </div>
      {showAvailability ? (
        <div className={`absolute z-30 ${compact ? '-bottom-8' : '-bottom-7'} left-1/2 -translate-x-1/2 whitespace-nowrap`}>
          {availabilityBadge()}
        </div>
      ) : null}
    </div>
  );

  const displayTitle = (mode: 'desktop' | 'tablet' | 'mobile') => {
    const fontSize = mode === 'desktop'
      ? 'clamp(3.35rem, 5.5vw, 6.5rem)'
      : mode === 'tablet'
        ? 'clamp(2.5rem, 5.3vw, 4.1rem)'
        : 'clamp(2.55rem, 11.5vw, 4rem)';
    return (
      <div className={`flex w-full flex-wrap items-end ${mode === 'mobile' ? 'gap-x-3 gap-y-4' : 'gap-x-5 gap-y-5'}`} data-orbit-title>
        <h1 className="m-0 min-w-0 font-sans font-semibold tracking-[-0.055em]" style={{ color: ink, fontSize, lineHeight: 0.93 }}>
          {displayWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="inline-block"
              style={{ whiteSpace: word.trim() ? 'nowrap' : 'pre', opacity: titleBottom ? 0 : 1, transform: titleBottom ? 'translateY(34px)' : 'translateY(0)' }}
              data-orbit-word
            >
              {word}
            </span>
          ))}
        </h1>
        <div className={mode === 'mobile' ? 'mb-0' : 'mb-[0.12em]'} style={animatedDetailStyle} data-orbit-detail>
          {specialtyBadge(mode !== 'desktop')}
        </div>
      </div>
    );
  };

  const topTitle = (compact = false) => (
    <div className={`flex flex-col items-start ${compact ? 'gap-5' : 'gap-7'}`} data-orbit-copy>
      {showAvailability ? availabilityBadge() : null}
      <h1 className="m-0 max-w-[13ch] font-sans font-semibold tracking-[-0.05em]" style={{ color: ink, fontSize: compact ? 'clamp(2.35rem, 5.3vw, 3.8rem)' : 'clamp(3.4rem, 5.2vw, 6rem)', lineHeight: 0.98 }}>
        {t("Hello, I'm {displayName}", { displayName })}
      </h1>
      {specialtyBadge(compact)}
      {bioPanel(compact)}
    </div>
  );

  return (
    <section ref={sectionRef} className="relative isolate w-full overflow-x-clip font-sans" style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }} data-hero-variant="circle-portrait">
      <div aria-hidden className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2" style={data.suppressBackground ? undefined : { backgroundColor: fond }} />

      <div
        className={`relative z-[1] hidden min-h-[100dvh] xl:grid ${shellX}`}
        style={{
          gridTemplateRows: titleBottom ? 'minmax(0, 1fr) auto' : '1fr',
          gridTemplateColumns: titleBottom ? 'minmax(20rem, .92fr) minmax(22rem, 1.08fr)' : 'minmax(22rem, .9fr) minmax(24rem, 1.1fr)',
          columnGap: 'clamp(4rem, 8vw, 10rem)',
          rowGap: 'clamp(2rem, 4vh, 3.5rem)',
          alignItems: 'center',
          paddingTop: 'calc(5.75rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(2rem, 4vh, 3.5rem)',
        }}
      >
        <div className="relative flex min-h-0 items-center justify-start">{portrait('clamp(20rem, 31vw, 31rem)', '(min-width: 1536px) 31rem, 32vw')}</div>
        <div className="flex min-w-0 items-center">{titleBottom ? bioPanel() : topTitle()}</div>
        {titleBottom ? <div className="col-span-2 w-full pb-[1vh]">{displayTitle('desktop')}</div> : null}
      </div>

      <div
        className={`relative z-[1] hidden min-h-[100dvh] md:grid xl:hidden ${shellX}`}
        style={{
          gridTemplateColumns: 'minmax(13rem, .88fr) minmax(15rem, 1.12fr)',
          gridTemplateRows: titleBottom ? 'minmax(0, 1fr) auto' : '1fr',
          columnGap: 'clamp(2.25rem, 6vw, 4.5rem)',
          rowGap: 'clamp(1.75rem, 4vh, 3rem)',
          alignItems: 'center',
          paddingTop: 'calc(5.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'clamp(1.5rem, 3.5vh, 2.5rem)',
        }}
      >
        <div className="flex min-h-0 items-center justify-center">{portrait('clamp(13.5rem, 29vw, 19rem)', '(max-width: 1279px) 30vw, 19rem', true)}</div>
        <div className="flex min-w-0 items-center">{titleBottom ? bioPanel(true) : topTitle(true)}</div>
        {titleBottom ? <div className="col-span-2">{displayTitle('tablet')}</div> : null}
      </div>

      <div className={`relative z-[1] flex min-h-[100svh] flex-col pb-10 pt-[calc(5rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}>
        <div className="flex justify-center pb-12">{portrait('min(68vw, 17.5rem)', '72vw', true)}</div>
        {titleBottom ? (
          <>
            <div className="mt-6">{displayTitle('mobile')}</div>
            <div className="mt-8">{bioPanel(true)}</div>
          </>
        ) : (
          <div className="mt-7">{topTitle(true)}</div>
        )}
      </div>
    </section>
  );
}
