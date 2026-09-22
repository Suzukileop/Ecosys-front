'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroBannerTools,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Cinematic reveal — deep-black editorial hero with layered 3D depth.
 *
 * Composition: a monumental outlined family-name sits in the background;
 * the portrait slides in front of it, breaking the flat left/right split.
 * Availability + bio anchor opposite corners for asymmetric balance; CTAs
 * are minimal underlined text links, never a filled pill.
 *
 * Motion (GSAP + ScrollTrigger):
 * - Entry: theatrical per-character stroke reveal on the monumental word,
 *   portrait bloom, corner blocks cascade in.
 * - Cursor (fine pointer only): soft spotlight follows the pointer, portrait
 *   tilts in 3D toward it.
 * - Scroll: portrait/copy drift at different speeds; composition eases out.
 * - Ticker: infinite marquee of specialty/tools, edge-masked into darkness.
 */

const GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TICKER_EDGE_MASK =
  'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)';

function cinematicScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

/** Last word of the display name — the "family name" shown at monumental scale. */
function resolveMonumentalWord(fullName: string, fallback: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const word = parts[parts.length - 1] || parts[0] || fallback;
  return word.toUpperCase();
}

export function PortfolioHeroCinematicReveal({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const secondaire = resolveHeroPaletteColor(palette, 'secondaire');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const monumentalWord = useMemo(
    () => resolveMonumentalWord(displayName, 'LOREM'),
    [displayName]
  );
  const monumentalChars = useMemo(() => monumentalWord.split(''), [monumentalWord]);
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  })();

  const bio =
    data.description?.trim() ||
    'I turn complex ideas into thoughtful, high-performing products through strategy, design, and development — work that feels inevitable once it ships.';

  const tickerTools = useMemo(
    () => resolveHeroBannerTools(data.tools, data.presentation.heroEditorialRailSelectedTools, 8),
    [data.tools, data.presentation.heroEditorialRailSelectedTools]
  );
  const tickerItems = useMemo(
    () => [specialty, ...tickerTools].filter(Boolean),
    [specialty, tickerTools]
  );

  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';

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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.dataset.pfEntry = 'off';
      return;
    }

    hero.dataset.pfEntry = 'running';
    const scroller = cinematicScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));
    const detach: Array<() => void> = [];

    const charInners = pick('.pf-cinematic-char-inner');
    const eyebrowEls = pick('.pf-cinematic-eyebrow-entry');
    const bioEls = pick('.pf-cinematic-bio-entry');
    const ctaEls = pick('.pf-cinematic-cta-entry');
    const availabilityEls = pick('.pf-cinematic-availability-entry');
    const portraitFrames = pick('.pf-cinematic-portrait-frame');
    const tickerBar = pick('.pf-cinematic-ticker-bar');

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      gsap.set(charInners, { yPercent: 130, rotateX: -55, autoAlpha: 0 });
      gsap.set(availabilityEls, { autoAlpha: 0, y: -10 });
      gsap.set(portraitFrames, { autoAlpha: 0, scale: 0.88, filter: 'blur(16px)' });
      gsap.set([...bioEls, ...eyebrowEls, ...ctaEls], { autoAlpha: 0, y: 18 });
      gsap.set(tickerBar, { autoAlpha: 0 });

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          hero.dataset.pfEntry = 'done';
        },
      });

      intro.to(availabilityEls, { autoAlpha: 1, y: 0, duration: 0.6 }, 0);
      intro.to(
        charInners,
        { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: 1.0, stagger: 0.035, ease: 'back.out(1.5)' },
        0.15
      );
      intro.to(
        portraitFrames,
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.15, ease: 'power2.out' },
        0.4
      );
      intro.to(bioEls, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.8);
      intro.to(eyebrowEls, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.85);
      intro.to(ctaEls, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.1 }, 0.98);
      intro.to(tickerBar, { autoAlpha: 1, duration: 0.8 }, 1.1);

      /* Soft spotlight — follows the pointer (fine pointer only). */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const spotlight = hero.querySelector<HTMLElement>('.pf-cinematic-spotlight');
        if (spotlight) {
          gsap.set(spotlight, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
          const toX = gsap.quickTo(spotlight, 'x', { duration: 0.7, ease: 'power3' });
          const toY = gsap.quickTo(spotlight, 'y', { duration: 0.7, ease: 'power3' });

          const onEnter = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            const box = hero.getBoundingClientRect();
            toX(event.clientX - box.left);
            toY(event.clientY - box.top);
            gsap.to(spotlight, { autoAlpha: 1, duration: 0.5 });
          };
          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            const box = hero.getBoundingClientRect();
            toX(event.clientX - box.left);
            toY(event.clientY - box.top);
          };
          const onLeave = () => gsap.to(spotlight, { autoAlpha: 0, duration: 0.4 });

          hero.addEventListener('pointerenter', onEnter);
          hero.addEventListener('pointermove', onMove);
          hero.addEventListener('pointerleave', onLeave);
          detach.push(() => {
            hero.removeEventListener('pointerenter', onEnter);
            hero.removeEventListener('pointermove', onMove);
            hero.removeEventListener('pointerleave', onLeave);
          });
        }

        /* Portrait 3D tilt toward the pointer. */
        portraitFrames.forEach((frame) => {
          const card = frame.querySelector<HTMLElement>('.pf-cinematic-portrait-tilt');
          if (!card) return;
          gsap.set(frame, { transformPerspective: 900 });
          const toRotX = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' });
          const toRotY = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' });

          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            const box = frame.getBoundingClientRect();
            const relX = (event.clientX - box.left) / box.width - 0.5;
            const relY = (event.clientY - box.top) / box.height - 0.5;
            toRotY(relX * 14);
            toRotX(-relY * 14);
          };
          const onLeave = () => {
            toRotX(0);
            toRotY(0);
          };
          frame.addEventListener('pointermove', onMove);
          frame.addEventListener('pointerleave', onLeave);
          detach.push(() => {
            frame.removeEventListener('pointermove', onMove);
            frame.removeEventListener('pointerleave', onLeave);
          });
        });
      }

      return () => detach.forEach((off) => off());
    }, hero);

    /* Infinite ticker marquee — pauses on hover. */
    const track = hero.querySelector<HTMLElement>('.pf-cinematic-ticker-track');
    let marquee: gsap.core.Tween | undefined;
    if (track) {
      marquee = gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      const onEnter = () => marquee?.timeScale(0.18);
      const onLeave = () => marquee?.timeScale(1);
      track.parentElement?.addEventListener('pointerenter', onEnter);
      track.parentElement?.addEventListener('pointerleave', onLeave);
      detach.push(() => {
        track.parentElement?.removeEventListener('pointerenter', onEnter);
        track.parentElement?.removeEventListener('pointerleave', onLeave);
      });
    }

    /* Scroll parallax — desktop only. */
    media.add('(min-width: 768px)', () => {
      portraitFrames.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => hero.offsetHeight * 0.1,
            ease: 'none',
            scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          }
        );
      });
      const monumental = hero.querySelector<HTMLElement>('.pf-cinematic-monumental');
      if (monumental) {
        gsap.fromTo(
          monumental,
          { y: 0 },
          {
            y: () => -hero.offsetHeight * 0.06,
            ease: 'none',
            scrollTrigger: { trigger: hero, scroller, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          }
        );
      }
      const wholeHero = hero.querySelector<HTMLElement>('.pf-cinematic-fade-shell');
      if (wholeHero) {
        gsap.fromTo(
          wholeHero,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: { trigger: hero, scroller, start: '58% top', end: '92% top', scrub: true, invalidateOnRefresh: true },
          }
        );
      }
      return () => {};
    });

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      marquee?.kill();
      media.revert();
      ctx.revert();
    };
  }, [monumentalWord]);

  const availabilityChip = (
    <div
      className="pf-cinematic-availability-entry inline-flex items-center gap-2.5 rounded-full px-4 py-2"
      style={{
        backgroundColor: `color-mix(in srgb, ${neutre} 45%, transparent)`,
        border: `1px solid color-mix(in srgb, ${bordure} 65%, transparent)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: secondaire }}
        />
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: secondaire }}
        />
      </span>
      <span
        className="font-sans text-[0.8rem] font-medium tracking-[-0.01em]"
        style={{ color: ink }}
      >
        {availability}
      </span>
    </div>
  );

  /** Minimal underlined text link — the 1px line draws in on hover, never a filled pill. */
  const ctaLink = (href: string, label: string, arrow: string) => (
    <a
      href={href}
      onClick={onNavClick(href)}
      className="group relative inline-flex w-fit items-center gap-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.26em]"
      style={{ color: ink }}
    >
      {label}
      <span aria-hidden className="text-[0.85em]">
        {arrow}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: ink }}
      />
    </a>
  );

  const ctaRow = (
    <div className="flex flex-col items-start gap-4">
      {ctaLink(primaryHref, 'Get in touch', '↗')}
      {ctaLink(secondaryHref, 'Explore work', '↓')}
    </div>
  );

  const portraitMedia = (
    <div
      className="pf-cinematic-portrait-tilt relative h-full w-full overflow-hidden rounded-2xl"
      style={{
        backgroundColor: `color-mix(in srgb, ${bordure} 35%, ${fond})`,
        border: `1px solid color-mix(in srgb, ${bordure} 45%, transparent)`,
        boxShadow: '0 40px 90px -32px rgba(0,0,0,0.75)',
        transformStyle: 'preserve-3d',
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Portrait of ${displayName}`}
          fill
          sizes="(max-width: 768px) 60vw, 28vw"
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
  );

  const monumentalName = (fontSize: string) => (
    <h1
      aria-label={displayName}
      className="pf-cinematic-monumental m-0 select-none text-center font-sans uppercase md:text-left"
      style={{ fontSize, lineHeight: 0.82, letterSpacing: '-0.045em', fontWeight: 900 }}
    >
      {monumentalChars.map((char, index) => (
        <span
          key={index}
          className="pf-cinematic-char-mask inline-block overflow-hidden align-top"
        >
          <span
            className="pf-cinematic-char-inner inline-block will-change-transform"
            style={
              {
                color: `color-mix(in srgb, ${ink} 6%, ${fond})`,
                WebkitTextStroke: `1.5px color-mix(in srgb, ${ink} 26%, transparent)`,
              } as CSSProperties
            }
          >
            {char === ' ' ? ' ' : char}
          </span>
        </span>
      ))}
    </h1>
  );

  const specialtyLabel = (
    <p
      className="pf-cinematic-eyebrow-entry m-0 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
      style={{ color: principal }}
    >
      {specialty}
    </p>
  );

  const bioBlock = (align: 'left' | 'right') => (
    <p
      className="pf-cinematic-bio-entry m-0 max-w-xs font-sans text-xs font-normal leading-relaxed"
      style={{ color: muted, textAlign: align }}
    >
      {bio}
    </p>
  );

  const tickerBar = (
    <div className="pf-cinematic-ticker-bar relative z-[1] w-full overflow-hidden">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 h-10"
          style={{ background: `linear-gradient(to bottom, transparent, ${fond})` }}
        />
        <div
          className="overflow-hidden py-4 sm:py-5"
          style={{
            WebkitMaskImage: TICKER_EDGE_MASK,
            maskImage: TICKER_EDGE_MASK,
          }}
        >
          <div className="pf-cinematic-ticker-track flex w-max items-center will-change-transform">
            {[0, 1].map((loop) => (
              <div key={loop} className="flex shrink-0 items-center" aria-hidden={loop === 1}>
                {Array.from({ length: 4 }).flatMap((_, repeatIndex) =>
                  tickerItems.map((item, itemIndex) => (
                    <span
                      key={`${loop}-${repeatIndex}-${itemIndex}`}
                      className="mx-4 flex shrink-0 items-center gap-4 whitespace-nowrap font-sans text-[clamp(1.05rem,2.4vw,1.65rem)] font-medium uppercase tracking-[-0.01em] sm:mx-6"
                      style={{ color: itemIndex === 0 ? ink : muted }}
                    >
                      {item}
                      <span aria-hidden style={{ color: principal }}>
                        ✦
                      </span>
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-cinematic-reveal-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      {!data.suppressBackground ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
          style={{ backgroundColor: fond }}
        />
      ) : null}

      {/* Ambient layer — grain + a faint vignette + cursor spotlight. Deep black, no color noise. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 30%, color-mix(in srgb, ${bordure} 22%, transparent), transparent 70%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_BG, backgroundRepeat: 'repeat' }}
        />
        <div
          className="pf-cinematic-spotlight absolute left-0 top-0 h-[38rem] w-[38rem] rounded-full opacity-0"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, ${ink} 10%, transparent) 0%, transparent 68%)`,
          }}
        />
      </div>

      <div className="pf-cinematic-fade-shell relative z-[1]">
        {/* —— Desktop —— */}
        <div
          className={`relative hidden min-h-[100dvh] md:flex md:flex-col ${shellX}`}
          style={{
            paddingTop: 'calc(8rem + env(safe-area-inset-top, 0px))',
            paddingBottom: 'clamp(2rem, 4vh, 3rem)',
          }}
        >
          <div>{availabilityChip}</div>

          <div className="pf-cinematic-stage relative flex-1 min-h-0">
            <div className="pointer-events-none absolute inset-0 flex items-center">
              {monumentalName('clamp(4.5rem, 13vw, 13rem)')}
            </div>

            <div
              className="pf-cinematic-portrait-frame absolute right-0 top-0 z-[2]"
              style={{
                // Height keyed to the *stage's* own viewport-relative size (not a fixed
                // rem/vw clamp) so the portrait always leaves clearance above the
                // bottom-anchored corner blocks, even on short desktop windows.
                height: 'clamp(11rem, 34dvh, 21rem)',
                width: 'auto',
                aspectRatio: '4 / 5',
              }}
            >
              {portraitMedia}
            </div>

            <div className="absolute bottom-0 left-0 z-[1] flex max-w-xs flex-col gap-5">
              {specialtyLabel}
              <div className="pf-cinematic-cta-entry">{ctaRow}</div>
            </div>

            <div className="absolute bottom-0 right-0 z-[1]">{bioBlock('left')}</div>
          </div>

          {tickerBar}
        </div>

        {/* —— Mobile —— */}
        <div
          className={`relative flex flex-col pb-14 md:hidden ${shellX}`}
          style={{ paddingTop: 'calc(6.5rem + env(safe-area-inset-top, 0px))' }}
        >
          <div>{availabilityChip}</div>

          <div className="mt-10 flex flex-col items-center">
            {monumentalName('clamp(3.75rem, 22vw, 5.5rem)')}
            {/* Normal flow (not absolute) — the negative margin pulls it up to overlap
                the name's baseline, but the block's real rendered height still pushes
                the specialty/CTA row below it, so it can never sit on top of them. */}
            <div
              className="pf-cinematic-portrait-frame relative z-[2] -mt-12"
              style={{ height: 'clamp(10rem, 42vw, 14rem)', width: 'auto', aspectRatio: '4 / 5' }}
            >
              {portraitMedia}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start gap-5">
            {specialtyLabel}
            <div className="pf-cinematic-cta-entry">{ctaRow}</div>
          </div>

          <div className="mt-9">{bioBlock('left')}</div>

          <div className="mt-11">{tickerBar}</div>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .pf-cinematic-char-inner,
          .pf-cinematic-eyebrow-entry,
          .pf-cinematic-availability-entry,
          .pf-cinematic-bio-entry,
          .pf-cinematic-cta-entry,
          .pf-cinematic-portrait-frame,
          .pf-cinematic-ticker-bar {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}
