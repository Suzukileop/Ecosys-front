'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  heroImageGrayscaleClass,
  resolveHeroAvailabilityValue,
  resolveHeroCurrentlyLabel,
  resolveHeroSignatureWord,
  resolveHeroSpecializedInLabel,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const SWISS_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SWISS_EDGE = 'rgba(255, 255, 255, 0.05)';

type SwissSignatureSize = 'desktop' | 'tablet' | 'mobile';

function swissScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

/**
 * Swiss editorial Hero — Option A (editorial balance):
 * copy + meta on a shared left rail, organic portrait in the right third,
 * full-width wordmark layered in front of the photo. Grain field on top.
 */
export function PortfolioHeroSwissEditorial({ data }: { data: PortfolioHeroData }) {
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const imageBw = data.presentation.heroImageGrayscale === true;

  const statement =
    data.description?.trim() ||
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor, aenean massa.';
  const currentlyLabel = resolveHeroCurrentlyLabel(data.presentation);
  const specializedLabel = resolveHeroSpecializedInLabel(data.presentation);
  const availabilityValue = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const specialtyValue = resolveHeroSpecialtyValue(data.specialite);
  const signature = resolveHeroSignatureWord(
    data.presentation,
    data.nameLead || data.fullName || 'LOREM'
  );
  const swapBioName = data.presentation.heroBannerSwapBioName === true;
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (data.nameLead || data.fullName || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const atmosphere: CSSProperties = {
    backgroundImage: [
      `radial-gradient(ellipse 34% 26% at 12% 54%, color-mix(in srgb, ${ink} 6%, transparent), transparent 66%)`,
      `radial-gradient(ellipse 22% 16% at 32% 14%, color-mix(in srgb, ${neutre} 9%, transparent), transparent 72%)`,
    ].join(', '),
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const portrait = {
    avatarUrl,
    initials,
    ink,
    neutre,
    imageBw,
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Still show elements for reduced motion
      hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-statement, .pf-swiss-editorial-rail, .pf-swiss-editorial-sign, .pf-swiss-editorial-photo-frame').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const scroller = swissScrollParent(hero);
    const signs = hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-sign');
    const photos = hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-photo-shift');
    const photoFrames = hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-photo-frame');
    const statements = hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-serif');
    const metaRails = hero.querySelectorAll<HTMLElement>('.pf-swiss-editorial-rail');
    const infoBlocks = hero.querySelectorAll<HTMLElement>('.pf-swiss-info-block');
    const fond = hero.querySelector<HTMLElement>('.pf-swiss-editorial-fond');
    const atmosphere = hero.querySelector<HTMLElement>('.pf-swiss-editorial-atmosphere');

    // Mark hero as GSAP-controlled to disable CSS safety animations
    hero.setAttribute('data-pf-gsap', 'active');

    const ctx = gsap.context(() => {
      // ═══════════════════════════════════════════════════════════════════════════
      // ENTRY ANIMATIONS — Swiss Editorial precision entrance
      // ═══════════════════════════════════════════════════════════════════════════
      
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Background fond + atmosphere fade in subtly
      if (fond) {
        gsap.set(fond, { opacity: 0 });
        tl.to(fond, { opacity: 1, duration: 0.8 }, 0);
      }
      if (atmosphere) {
        gsap.set(atmosphere, { opacity: 0 });
        tl.to(atmosphere, { opacity: 1, duration: 1.2 }, 0.15);
      }

      // 2. Statement text — elegant line reveal from below
      statements.forEach((statement, i) => {
        gsap.set(statement, { 
          y: 48, 
          opacity: 0,
          clipPath: 'inset(100% 0 0 0)',
        });
        tl.to(statement, {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.1,
          ease: 'power4.out',
        }, 0.2 + i * 0.08);
      });

      // 3. Portrait — organic clip-path reveal + subtle scale
      photoFrames.forEach((frame, i) => {
        gsap.set(frame, {
          scale: 0.88,
          opacity: 0,
          clipPath: 'inset(8% 12% 8% 12% round 1.5rem)',
        });
        tl.to(frame, {
          scale: 1,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0% round 0rem)',
          duration: 1.35,
          ease: 'power3.out',
        }, 0.35 + i * 0.1);
      });

      // 4. Meta rail — slide up with stagger
      metaRails.forEach((rail, i) => {
        gsap.set(rail, { y: 32, opacity: 0 });
        tl.to(rail, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        }, 0.55 + i * 0.12);
      });

      // 5. Info blocks inside meta — fine stagger
      infoBlocks.forEach((block, i) => {
        gsap.set(block, { y: 18, opacity: 0 });
        tl.to(block, {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: 'power2.out',
        }, 0.7 + i * 0.1);
      });

      // 6. Signature — dramatic scale reveal from center
      signs.forEach((sign, i) => {
        const signText = sign.querySelector<HTMLElement>('.pf-swiss-editorial-serif');
        if (signText) {
          gsap.set(signText, {
            scale: 0.75,
            opacity: 0,
            transformOrigin: 'left bottom',
          });
          tl.to(signText, {
            scale: 1,
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out',
          }, 0.5 + i * 0.15);
        }
      });

      // ═══════════════════════════════════════════════════════════════════════════
      // SCROLL ANIMATIONS — Parallax on scroll (existing)
      // ═══════════════════════════════════════════════════════════════════════════
      
      signs.forEach((sign) => {
        gsap.fromTo(
          sign,
          { x: 0 },
          {
            x: '-11vw',
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '68% top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      photos.forEach((photo) => {
        gsap.fromTo(
          photo,
          { y: 0 },
          {
            y: '14%',
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, hero);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, []);

  const metaRow = (
    <SwissMetaRail
      currentlyLabel={currentlyLabel}
      specializedLabel={specializedLabel}
      availabilityValue={availabilityValue}
      specialtyValue={specialtyValue}
      muted={muted}
      ink={ink}
      bordure={bordure}
      principal={principal}
    />
  );

  const metaStack = (
    <SwissMetaRail
      currentlyLabel={currentlyLabel}
      specializedLabel={specializedLabel}
      availabilityValue={availabilityValue}
      specialtyValue={specialtyValue}
      muted={muted}
      ink={ink}
      bordure={bordure}
      principal={principal}
      stacked
    />
  );

  return (
    <div
      ref={heroRef}
      className="pf-swiss-editorial-hero relative isolate flex min-h-[100dvh] min-h-screen w-full flex-col overflow-x-clip overflow-y-visible"
      style={{ color: ink }}
    >
      <div
        aria-hidden
        className="pf-swiss-editorial-fond pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />
      <div
        aria-hidden
        className="pf-swiss-editorial-atmosphere pointer-events-none absolute inset-0 z-0"
        style={atmosphere}
      />

      <div
        className={`relative z-[2] flex flex-1 flex-col pb-[max(2.25rem,calc(env(safe-area-inset-bottom,0px)+1.35rem))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] md:pt-[calc(6.25rem+env(safe-area-inset-top,0px))] lg:pb-[clamp(1.85rem,4.2vh,3.25rem)] lg:pt-[calc(6.75rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        {/* —— Desktop (lg+): left copy rail, portrait in the right third, full-width wordmark —— */}
        <div className="pf-swiss-editorial-desktop relative hidden min-h-0 flex-1 lg:grid" data-swap={swapBioName ? 'true' : 'false'}>
          <div className="pf-swiss-editorial-copy flex h-full min-h-0 flex-col justify-between pt-[clamp(0.15rem,1.2vh,0.75rem)]">
            <div className="pf-swiss-editorial-rail">
              {swapBioName ? (
                <SwissDisplayWord word={signature} ink={ink} />
              ) : (
                <SwissStatement text={statement} ink={ink} className="max-w-none" />
              )}
            </div>
            <div className="pf-swiss-editorial-rail pb-[clamp(0.65rem,1.8vh,1.25rem)] pt-[clamp(1.75rem,4.5vh,3.75rem)]">
              {metaRow}
            </div>
          </div>

          <div className="pf-swiss-editorial-photo">
            <div className="pf-swiss-editorial-photo-shift">
              <div className="pf-swiss-editorial-photo-frame">
                <SwissPortrait
                  {...portrait}
                  className="pf-swiss-editorial-portrait aspect-[3/4] w-full overflow-hidden"
                  radius="1.15rem 44% 1.85rem 28%"
                />
              </div>
            </div>
          </div>

          <div className="pf-swiss-editorial-sign">
            {swapBioName ? (
              <SwissStatement text={statement} ink={ink} className="max-w-[36rem] pt-2" />
            ) : (
              <SwissSignature word={signature} ink={ink} size="desktop" />
            )}
          </div>
        </div>

        {/* —— Tablet (md–lg): same editorial split, slightly tighter portrait —— */}
        <div className="pf-swiss-editorial-tablet relative hidden min-h-0 flex-1 md:grid lg:hidden" data-swap={swapBioName ? 'true' : 'false'}>
          <div className="pf-swiss-editorial-copy flex h-full min-h-0 flex-col justify-between">
            <div className="pf-swiss-editorial-rail">
              {swapBioName ? (
                <SwissDisplayWord word={signature} ink={ink} />
              ) : (
                <SwissStatement text={statement} ink={ink} className="max-w-none" />
              )}
            </div>
            <div className="pf-swiss-editorial-rail pb-2 pt-8">
              {metaRow}
            </div>
          </div>

          <div className="pf-swiss-editorial-photo">
            <div className="pf-swiss-editorial-photo-shift">
              <div className="pf-swiss-editorial-photo-frame">
                <SwissPortrait
                  {...portrait}
                  className="pf-swiss-editorial-portrait aspect-[3/4] w-full overflow-hidden"
                  radius="1.2rem 42% 1.7rem 26%"
                />
              </div>
            </div>
          </div>

          <div className="pf-swiss-editorial-sign">
            {swapBioName ? (
              <SwissStatement text={statement} ink={ink} />
            ) : (
              <SwissSignature word={signature} ink={ink} size="tablet" />
            )}
          </div>
        </div>

        {/* —— Mobile: headline → centered photo → metadata → wordmark —— */}
        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          <div className="relative z-[3]">
            {swapBioName ? (
              <SwissDisplayWord word={signature} ink={ink} compact />
            ) : (
              <SwissStatement text={statement} ink={ink} />
            )}
          </div>

          <div className="relative mt-6 flex flex-col">
            <div className="pf-swiss-editorial-photo-shift relative z-[2] mx-auto w-[min(82%,18.5rem)]">
              <div className="pf-swiss-editorial-photo-frame">
                <SwissPortrait
                  {...portrait}
                  className="pf-swiss-editorial-portrait aspect-[4/5] w-full overflow-hidden"
                  radius="1.35rem 38% 1.5rem 22%"
                />
              </div>
            </div>

            <div className="relative z-[3] mt-6">{metaStack}</div>

            <div className="pf-swiss-editorial-sign relative z-[4] mt-6">
              {swapBioName ? (
                <SwissStatement text={statement} ink={ink} />
              ) : (
                <SwissSignature word={signature} ink={ink} size="mobile" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwissStatement({
  text,
  ink,
  className = '',
}: {
  text: string;
  ink: string;
  className?: string;
}) {
  return (
    <p
      className={`pf-swiss-editorial-serif m-0 max-w-[34.5rem] text-[clamp(1.32rem,1.02rem+2.1vw,2.15rem)] font-medium italic leading-[1.28] tracking-[-0.016em] [text-wrap:pretty] ${className}`.trim()}
      style={{
        color: ink,
        fontFamily: SWISS_SERIF,
        opacity: 0.94,
      }}
    >
      {text}
    </p>
  );
}

function SwissDisplayWord({
  word,
  ink,
  compact = false,
}: {
  word: string;
  ink: string;
  compact?: boolean;
}) {
  return (
    <p
      className={`pf-swiss-editorial-serif m-0 font-normal uppercase leading-[0.88] tracking-[-0.045em] ${
        compact
          ? 'text-[clamp(2.35rem,13vw,3.65rem)]'
          : 'text-[clamp(2.75rem,6.4vw,6.25rem)]'
      }`}
      style={{
        color: ink,
        fontFamily: SWISS_SERIF,
        opacity: 0.96,
      }}
    >
      {word}
    </p>
  );
}

function SwissMetaRail({
  currentlyLabel,
  specializedLabel,
  availabilityValue,
  specialtyValue,
  muted,
  ink,
  bordure,
  principal,
  stacked = false,
}: {
  currentlyLabel: string;
  specializedLabel: string;
  availabilityValue: string;
  specialtyValue: string;
  muted: string;
  ink: string;
  bordure: string;
  principal: string;
  stacked?: boolean;
}) {
  return (
    <div
      className={
        stacked
          ? 'flex w-full max-w-[22rem] flex-col gap-5'
          : 'grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-[clamp(1.25rem,3.2vw,2.25rem)]'
      }
    >
      <SwissInfoBlock
        label={currentlyLabel}
        value={availabilityValue}
        showMark
        muted={muted}
        ink={ink}
        principal={principal}
      />
      {stacked ? null : (
        <div
          aria-hidden
          className="w-px shrink-0 self-stretch min-h-[2.75rem]"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${bordure} 55%, transparent) 18%, color-mix(in srgb, ${bordure} 55%, transparent) 82%, transparent)`,
          }}
        />
      )}
      <SwissInfoBlock
        label={specializedLabel}
        value={specialtyValue}
        muted={muted}
        ink={ink}
        principal={principal}
      />
    </div>
  );
}

function SwissInfoBlock({
  label,
  value,
  showMark = false,
  muted,
  ink,
  principal,
}: {
  label: string;
  value: string;
  showMark?: boolean;
  muted: string;
  ink: string;
  principal: string;
}) {
  return (
    <div className="pf-swiss-info-block min-w-0">
      <p
        className="text-[0.64rem] font-normal uppercase leading-none tracking-[0.26em] sm:text-[0.7rem]"
        style={{ color: `color-mix(in srgb, ${ink} 72%, ${muted})` }}
      >
        {label}
      </p>
      <p
        className="mt-2.5 text-[0.92rem] font-normal leading-snug tracking-[0.01em] sm:text-[1rem]"
        style={{ color: `color-mix(in srgb, ${ink} 92%, ${muted})` }}
      >
        {showMark ? (
          <span
            className="mr-2 inline-block h-[0.42em] w-[0.42em] translate-y-[-0.08em] rounded-full align-middle"
            style={{
              backgroundColor: principal,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${principal} 18%, transparent)`,
            }}
            aria-hidden
          />
        ) : null}
        {value}
      </p>
    </div>
  );
}

function SwissPortrait({
  avatarUrl,
  initials,
  ink,
  neutre,
  imageBw,
  className,
  radius,
}: {
  avatarUrl: string | null;
  initials: string;
  ink: string;
  neutre: string;
  imageBw: boolean;
  className: string;
  radius: string;
}) {
  return (
    <div className="relative">
      <div
        className={`relative ${className}`.trim()}
        style={{
          backgroundColor: neutre,
          borderRadius: radius,
          boxShadow: `inset 0 0 0 1px ${SWISS_EDGE}`,
        }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 86vw, (max-width: 1024px) 42vw, 32vw"
            className={`object-cover object-center ${heroImageGrayscaleClass(imageBw)}`}
            priority
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-4xl font-semibold tracking-tight sm:text-5xl ${heroImageGrayscaleClass(imageBw)}`}
            style={{ color: ink }}
            aria-hidden
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  );
}

function SwissSignature({
  word,
  ink,
  size,
}: {
  word: string;
  ink: string;
  size: SwissSignatureSize;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      const vh = window.innerHeight;
      const vhCap =
        size === 'mobile' ? vh * 0.11 : size === 'tablet' ? vh * 0.2 : vh * 0.42;
      const widthCap = maxWidth * (size === 'mobile' ? 0.96 : 1);
      const maxPx = Math.min(widthCap, vhCap);
      const minPx = size === 'mobile' ? 28 : size === 'tablet' ? 56 : 84;

      text.style.transform = 'none';
      let lo = minPx;
      let hi = Math.max(minPx, maxPx);
      for (let i = 0; i < 16; i += 1) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= maxWidth) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      const next = Math.floor(lo * 100) / 100;
      text.style.fontSize = `${next}px`;

      if (text.scrollWidth > maxWidth) {
        const scale = maxWidth / text.scrollWidth;
        text.style.transform = `scale(${scale})`;
        text.style.transformOrigin = 'left bottom';
      } else {
        text.style.transform = 'none';
        text.style.transformOrigin = 'left bottom';
      }
    };

    fit();
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [word, size]);

  const clampClass =
    size === 'mobile'
      ? 'text-[clamp(2.5rem,18vw,4.25rem)]'
      : size === 'tablet'
        ? 'text-[clamp(3.25rem,14vw,7.5rem)]'
        : 'text-[clamp(5.5rem,18vw,14.5rem)]';

  return (
    <div ref={containerRef} className="relative z-[1] w-full overflow-visible" aria-hidden>
      <p
        ref={textRef}
        className={`pf-swiss-editorial-serif inline-block max-w-none select-none whitespace-nowrap font-normal uppercase leading-[0.8] tracking-[-0.052em] ${clampClass}`}
        style={{
          color: ink,
          fontFamily: SWISS_SERIF,
        }}
      >
        {word}
      </p>
    </div>
  );
}
