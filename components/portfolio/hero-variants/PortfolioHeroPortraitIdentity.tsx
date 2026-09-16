'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type MouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  resolveHeroAvailabilityValue,
  resolveHeroSpecialtyValue,
  resolveHeroTwoWordDisplayName,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL } from '@/components/portfolio/portfolio-hero-settings';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';

const FALLBACK_INTRO =
  'Ingénieur en informatique, passionné par des solutions innovantes et performantes.';

function resolveIntroCopy(source?: string | null) {
  const cleaned = source?.replace(/\s+/g, ' ').trim();
  return cleaned || FALLBACK_INTRO;
}

/** Nearest scrollable ancestor (pages mode nests overflow-y-auto shells). */
function identityScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
 * Portrait identity — editorial 16:9 composition.
 * All colors come from the Hero / Global palette (fond, texteFort, texteMuted, bordure, principal, neutre).
 */
export function PortfolioHeroPortraitIdentity({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  const bio = useMemo(() => resolveIntroCopy(data.description), [data.description]);
  const imageBw = data.presentation.heroImageGrayscale === true;
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const displayName = resolveHeroTwoWordDisplayName(data.fullName || data.nameLead || '');
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const swapBioName = data.presentation.heroBannerSwapBioName === true;
  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = (data.nameLead || data.fullName || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  // The shared bottom-frame feature was removed — always false so the reserved-space
  // branches below never trigger, even for legacy portfolios with old frame data stored.
  const showBottomBand = false;
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const contactHref = data.contactHref || '#contact';
  const workHref = data.workHref || '#work';
  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const hairline = `1px solid color-mix(in srgb, ${bordure} 85%, transparent)`;

  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.dataset.pfEntry = 'off';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    hero.dataset.pfEntry = 'running';

    const scroller = identityScrollParent(hero);
    const pick = (selector: string) => Array.from(hero.querySelectorAll<HTMLElement>(selector));
    const masks = pick('.pf-identity-photo-mask');
    const inners = pick('.pf-identity-photo-inner');
    const names = pick('.pf-identity-entry-name');
    const subs = pick('.pf-identity-entry-sub');
    const ctas = pick('.pf-identity-entry-cta');
    const shifts = pick('.pf-identity-shift');
    const zones = pick('.pf-identity-void');

    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* B — entry: the portrait wipes up behind its mask, the right column cascades in. */
      const cascade = [...names, ...subs, ...ctas];
      if (masks.length) gsap.set(masks, { clipPath: 'inset(100% 0% 0% 0%)' });
      if (inners.length) gsap.set(inners, { yPercent: 8 });
      if (cascade.length) gsap.set(cascade, { y: 20, autoAlpha: 0 });

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          hero.dataset.pfEntry = 'done';
        },
      });
      if (masks.length) intro.to(masks, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15 }, 0);
      if (inners.length) intro.to(inners, { yPercent: 0, duration: 1.3, ease: 'power2.out' }, 0);
      if (names.length) intro.to(names, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.22);
      if (subs.length) intro.to(subs, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.32);
      if (ctas.length) intro.to(ctas, { y: 0, autoAlpha: 1, duration: 0.85 }, 0.42);

      /* A — magnetic cursor: the empty lower-right block swaps the system cursor for a floating dial. */
      const detach: Array<() => void> = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        zones.forEach((zone) => {
          const dial = zone.querySelector<HTMLElement>('.pf-identity-cursor');
          if (!dial) return;

          zone.dataset.magnetic = 'on';
          gsap.set(dial, { xPercent: -50, yPercent: -50, scale: 0.55, autoAlpha: 0 });
          const toX = gsap.quickTo(dial, 'x', { duration: 0.55, ease: 'power3' });
          const toY = gsap.quickTo(dial, 'y', { duration: 0.55, ease: 'power3' });

          const follow = (event: PointerEvent, snap: boolean) => {
            const box = zone.getBoundingClientRect();
            const x = event.clientX - box.left;
            const y = event.clientY - box.top;
            if (snap) gsap.set(dial, { x, y });
            else {
              toX(x);
              toY(y);
            }
          };
          const onEnter = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            follow(event, true);
            gsap.to(dial, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          };
          const onMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            follow(event, false);
          };
          const onLeave = () => {
            gsap.to(dial, { autoAlpha: 0, scale: 0.55, duration: 0.28, ease: 'power2.in' });
          };

          zone.addEventListener('pointerenter', onEnter);
          zone.addEventListener('pointermove', onMove);
          zone.addEventListener('pointerleave', onLeave);
          detach.push(() => {
            zone.removeEventListener('pointerenter', onEnter);
            zone.removeEventListener('pointermove', onMove);
            zone.removeEventListener('pointerleave', onLeave);
            delete zone.dataset.magnetic;
          });
        });
      }

      return () => {
        detach.forEach((off) => off());
      };
    }, hero);

    /* C — asymmetric exit: the portrait scrolls 1:1 while the right column trails at 0.6 and fades. */
    media.add('(min-width: 768px)', () => {
      shifts.forEach((shift) => {
        const trailingZones = Array.from(shift.querySelectorAll<HTMLElement>('.pf-identity-void'));

        gsap.fromTo(
          shift,
          { y: 0 },
          {
            y: () => Math.round(hero.offsetHeight * 0.4),
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
        gsap.fromTo(
          shift,
          { autoAlpha: 1 },
          {
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: hero,
              scroller,
              start: 'top top',
              end: '55% top',
              scrub: true,
              invalidateOnRefresh: true,
              /* The trailing block drifts over the next section: keep its void inert there. */
              onUpdate: (self: ScrollTrigger) => {
                const inert = self.progress > 0.02 ? 'none' : '';
                trailingZones.forEach((zone) => {
                  zone.style.pointerEvents = inert;
                });
              },
            },
          }
        );
      });

      return () => {
        shifts.forEach((shift) => {
          shift.querySelectorAll<HTMLElement>('.pf-identity-void').forEach((zone) => {
            zone.style.pointerEvents = '';
          });
        });
      };
    });

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => {
      window.clearTimeout(refreshId);
      media.revert();
      ctx.revert();
    };
  }, [showBottomBand, swapBioName]);

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-identity-hero relative isolate w-full overflow-x-clip font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      {/* Desktop — Global content gutter only */}
      <div
        className={`relative z-[1] hidden flex-col pt-[calc(6.75rem+env(safe-area-inset-top,0px))] md:flex lg:pt-[calc(7.5rem+env(safe-area-inset-top,0px))] ${shellX} ${
          showBottomBand ? 'min-h-0 pb-4' : 'min-h-[100dvh] pb-10'
        }`}
      >
        <div className="flex w-full flex-col">
          <div
            className="grid w-full shrink-0"
            style={{
              gridTemplateColumns: 'minmax(18rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
              alignItems: 'last baseline',
            }}
          >
            {swapBioName ? (
              <div
                className="flex min-w-0 flex-col"
                style={{ gap: 'clamp(0.75rem, 1.2vh, 1.15rem)' }}
              >
                <IdentityName word={displayName} ink={ink} maxFontPx={108} minFontPx={56} />
                <p
                  className="m-0 overflow-hidden whitespace-nowrap font-sans font-normal leading-none tracking-[-0.015em]"
                  style={{
                    color: muted,
                    fontSize: 'clamp(1.15rem, 2vw, 2.35rem)',
                  }}
                >
                  {specialty}
                </p>
              </div>
            ) : (
              <p
                className="m-0 max-w-full text-left font-sans font-semibold tracking-[-0.02em]"
                style={{
                  color: ink,
                  fontSize: 'clamp(1.05rem, 1.55vw, 1.95rem)',
                  lineHeight: 1.16,
                }}
              >
                {bio}
              </p>
            )}
            <div aria-hidden />
            <p
              className="m-0 justify-self-start whitespace-nowrap font-sans font-normal tracking-[-0.01em]"
              style={{
                color: muted,
                fontSize: 'clamp(0.85rem, 1.05vw, 1.25rem)',
                lineHeight: 1.16,
              }}
            >
              {availability}
            </p>
          </div>

          <div
            aria-hidden
            className="w-full shrink-0"
            style={{
              marginTop: 'clamp(2.5rem, 4.5vh, 3.75rem)',
              marginBottom: 'clamp(2.5rem, 4.5vh, 3.75rem)',
              borderTop: hairline,
            }}
          />

          <div
            className="grid w-full items-start"
            style={{
              gridTemplateColumns: 'minmax(18rem, 44%) minmax(0, 8%) minmax(0, 1fr)',
            }}
          >
            <div
              className="pf-identity-photo-mask relative aspect-[4/5] w-[min(100%,28rem)] max-h-[min(58vh,34rem)] shrink-0 justify-self-start overflow-hidden"
              style={{ backgroundColor: neutre }}
            >
              <IdentityPortrait
                avatarUrl={avatarUrl}
                initials={initials}
                muted={muted}
                imageBw={imageBw}
                className="pf-identity-photo-inner absolute inset-0 h-full w-full"
              />
            </div>

            <div aria-hidden />

            <div className="pf-identity-shift flex min-w-0 flex-col self-stretch">
              {swapBioName ? (
                <p
                  className="pf-identity-entry-name m-0 max-w-full text-left font-sans font-semibold tracking-[-0.02em]"
                  style={{
                    color: ink,
                    fontSize: 'clamp(1.05rem, 1.55vw, 1.95rem)',
                    lineHeight: 1.16,
                  }}
                >
                  {bio}
                </p>
              ) : (
                <div
                  className="flex min-w-0 flex-col"
                  style={{ gap: 'clamp(0.3rem, 0.7vh, 0.6rem)' }}
                >
                  <IdentityName
                    word={displayName}
                    ink={ink}
                    maxFontPx={108}
                    minFontPx={56}
                    flushTop
                    className="pf-identity-entry-name"
                  />
                  <p
                    className="pf-identity-entry-sub m-0 overflow-hidden whitespace-nowrap font-sans font-normal leading-none tracking-[-0.015em]"
                    style={{
                      color: muted,
                      fontSize: 'clamp(1.15rem, 2vw, 2.35rem)',
                    }}
                  >
                    {specialty}
                  </p>
                </div>
              )}

              <div
                className="pf-identity-entry-cta flex shrink-0 flex-wrap items-center gap-3.5"
                style={{ marginTop: 'clamp(2.25rem, 4.5vh, 3rem)' }}
              >
                <a
                  href={workHref}
                  onClick={onNavClick(workHref)}
                  className="inline-flex h-14 min-h-14 shrink-0 items-center justify-center px-8 font-sans text-[1.05rem] font-normal tracking-[-0.01em] transition hover:brightness-110"
                  style={{
                    backgroundColor: principal,
                    color: '#FFFFFF',
                    borderRadius: 10,
                  }}
                >
                  View project
                </a>
                <a
                  href={contactHref}
                  onClick={onNavClick(contactHref)}
                  className="inline-flex h-14 min-h-14 shrink-0 items-center justify-center border-2 px-8 font-sans text-[1.05rem] font-normal tracking-[-0.01em] transition hover:opacity-85"
                  style={{
                    borderColor: ink,
                    color: ink,
                    backgroundColor: 'transparent',
                    borderRadius: 10,
                  }}
                >
                  Contact me
                </a>
              </div>

              <div className="pf-identity-void relative min-h-0 w-full flex-1" aria-hidden>
                <span
                  className="pf-identity-cursor pointer-events-none absolute left-0 top-0 flex h-[7.25rem] w-[7.25rem] items-center justify-center whitespace-nowrap rounded-full font-sans text-[0.55rem] font-normal uppercase tracking-[0.22em]"
                  style={{
                    border: `1px solid color-mix(in srgb, ${ink} 26%, transparent)`,
                    color: `color-mix(in srgb, ${ink} 72%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${ink} 4%, transparent)`,
                  }}
                >
                  Scroll ✕
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — Global content gutter only */}
      <div
        className={`relative z-[1] flex min-h-[100dvh] flex-col pb-10 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {swapBioName ? (
          <div className="min-w-0">
            <IdentityName
              word={displayName}
              ink={ink}
              mobile
              maxFontPx={72}
              minFontPx={36}
              className="pf-identity-entry-name"
            />
            <p
              className="pf-identity-entry-sub mt-3 font-sans font-normal leading-snug"
              style={{ color: muted, fontSize: 'clamp(1.2rem, 4.8vw, 1.75rem)' }}
            >
              {specialty}
            </p>
          </div>
        ) : (
          <p
            className="m-0 text-left font-sans font-semibold tracking-[-0.02em]"
            style={{ color: ink, fontSize: 'clamp(1.2rem, 5.2vw, 1.75rem)', lineHeight: 1.16 }}
          >
            {bio}
          </p>
        )}
        <p className="mt-5 font-sans text-[0.95rem] font-normal leading-snug" style={{ color: muted }}>
          {availability}
        </p>
        <div
          className="w-full"
          style={{
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            borderTop: hairline,
          }}
        />
        <div className="min-w-0">
          {swapBioName ? (
            <p
              className="m-0 text-left font-sans font-semibold tracking-[-0.02em]"
              style={{ color: ink, fontSize: 'clamp(1.2rem, 5.2vw, 1.75rem)', lineHeight: 1.16 }}
            >
              {bio}
            </p>
          ) : (
            <>
              <IdentityName
                word={displayName}
                ink={ink}
                mobile
                maxFontPx={72}
                minFontPx={36}
                className="pf-identity-entry-name"
              />
              <p
                className="pf-identity-entry-sub mt-3 font-sans font-normal leading-snug"
                style={{ color: muted, fontSize: 'clamp(1.2rem, 4.8vw, 1.75rem)' }}
              >
                {specialty}
              </p>
            </>
          )}
          <div className="pf-identity-entry-cta mt-6 flex flex-wrap items-center gap-3">
            <a
              href={workHref}
              onClick={onNavClick(workHref)}
              className="inline-flex h-12 min-h-12 shrink-0 items-center justify-center px-7 font-sans text-[0.95rem] font-normal tracking-[-0.01em] transition hover:brightness-110"
              style={{ backgroundColor: principal, color: '#FFFFFF', borderRadius: 10 }}
            >
              View project
            </a>
            <a
              href={contactHref}
              onClick={onNavClick(contactHref)}
              className="inline-flex h-12 min-h-12 shrink-0 items-center justify-center border-2 px-7 font-sans text-[0.95rem] font-normal tracking-[-0.01em] transition hover:opacity-85"
              style={{
                borderColor: ink,
                color: ink,
                backgroundColor: 'transparent',
                borderRadius: 10,
              }}
            >
              Contact me
            </a>
          </div>
        </div>
        <div
          className={`pf-identity-photo-mask relative w-full overflow-hidden ${
            showBottomBand ? 'mt-8 mb-2' : 'mt-8'
          }`}
          style={{ aspectRatio: '3 / 3.4', backgroundColor: neutre }}
        >
          <IdentityPortrait
            avatarUrl={avatarUrl}
            initials={initials}
            muted={muted}
            imageBw={imageBw}
            className="pf-identity-photo-inner h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

function IdentityPortrait({
  avatarUrl,
  initials,
  muted,
  imageBw,
  className,
}: {
  avatarUrl: string | null;
  initials: string;
  muted: string;
  imageBw: boolean;
  className: string;
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover object-center"
          style={{
            filter: imageBw
              ? 'grayscale(1) contrast(1.38) brightness(0.94) saturate(0)'
              : 'contrast(1.24) brightness(0.9)',
          }}
          priority
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-sans text-4xl font-normal tracking-tight"
          style={{ color: muted }}
          aria-hidden
        >
          {initials}
        </div>
      )}
    </div>
  );
}

/**
 * Distance between the text box top and the actual cap top of the glyphs
 * (half-leading + the ascender space above capital letters).
 */
function capTopInset(text: HTMLElement, word: string): number {
  const styles = getComputedStyle(text);
  const fontSize = Number.parseFloat(styles.fontSize);
  if (!Number.isFinite(fontSize) || fontSize <= 0) return 0;
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const box = Number.isFinite(lineHeight) ? lineHeight : fontSize;

  const context = document.createElement('canvas').getContext('2d');
  if (!context) return 0;
  context.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
  const metrics = context.measureText(word || 'H');
  const ascent = metrics.fontBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent;
  const capAscent = metrics.actualBoundingBoxAscent;
  if (![ascent, descent, capAscent].every((value) => Number.isFinite(value))) return 0;

  return (box - (ascent + descent)) / 2 + (ascent - capAscent);
}

function IdentityName({
  word,
  ink,
  mobile = false,
  maxFontPx,
  minFontPx,
  flushTop = false,
  className = '',
}: {
  word: string;
  ink: string;
  mobile?: boolean;
  maxFontPx: number;
  minFontPx: number;
  /** Pull the cap height flush with the container top (aligns onto the portrait edge). */
  flushTop?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      let lo = minFontPx;
      let hi = maxFontPx;
      text.style.transform = 'none';
      for (let i = 0; i < 20; i += 1) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= maxWidth) lo = mid;
        else hi = mid;
      }
      text.style.fontSize = `${Math.floor(lo * 100) / 100}px`;
      if (text.scrollWidth > maxWidth) {
        const scale = maxWidth / text.scrollWidth;
        text.style.transform = `scale(${scale})`;
        text.style.transformOrigin = 'left center';
      }
      text.style.marginTop = flushTop ? `${-capTopInset(text, word)}px` : '';
    };

    fit();
    void document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [flushTop, maxFontPx, minFontPx, mobile, word]);

  return (
    <div ref={containerRef} className={`w-full min-w-0 overflow-hidden ${className}`.trim()}>
      <h1
        ref={textRef}
        className="m-0 inline-block max-w-none whitespace-nowrap font-sans font-normal uppercase leading-[0.92] tracking-[-0.04em]"
        style={{ color: ink }}
      >
        {word}
      </h1>
    </div>
  );
}
