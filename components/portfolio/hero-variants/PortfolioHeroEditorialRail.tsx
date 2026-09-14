'use client';

import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
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

/** Compact editorial block — tighter than the previous 1.05 leading. */
const TITLE_LINE_HEIGHT = 0.95;
/** Photo lags the page scroll (1.0) at this ratio. */
const PHOTO_PARALLAX_RATIO = 0.85;
const BIO_GAP_DESKTOP = 'mt-[clamp(2.2rem,4vh,2.9rem)]';
const BIO_GAP_MOBILE = 'mt-9';

function editorialRailScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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

function groupWordsIntoLines(words: HTMLElement[]): string[] {
  const lines: string[][] = [];
  let current: string[] = [];
  let currentTop = Number.NaN;

  for (const word of words) {
    const top = word.offsetTop;
    if (Number.isFinite(currentTop) && Math.abs(top - currentTop) > 1) {
      lines.push(current);
      current = [word.textContent?.trim() ?? ''];
    } else {
      current.push(word.textContent?.trim() ?? '');
    }
    currentTop = top;
  }
  if (current.length > 0) lines.push(current);
  return lines.map((line) => line.filter(Boolean).join(' ')).filter(Boolean);
}

/**
 * Editorial rail — availability + headline + bio | portrait, then a tools rail.
 * Optional CTAs under the bio (Start a project / View project).
 * Palette tokens only (fond, texteFort, texteMuted, principal, bordure, neutre).
 */
export function PortfolioHeroEditorialRail({ data }: { data: PortfolioHeroData }) {
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, data.presentation.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const principal = resolveHeroPaletteColor(palette, 'principal');
  const bordure = resolveHeroPaletteColor(palette, 'bordure');
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const imageBw = data.presentation.heroImageGrayscale === true;
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const displayName = (data.fullName || data.nameLead || 'Lorem Ipsum').trim();
  const specialty = resolveHeroSpecialtyValue(data.specialite);
  const headline = `Hi, I'm ${displayName} — a ${specialty}.`;
  const availability = resolveHeroAvailabilityValue(
    data.isAvailable,
    data.presentation.availabilityLabel,
    data.presentation.availabilityUnavailableLabel || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
  );
  const bio = useMemo(() => {
    const cleaned = data.description?.replace(/\s+/g, ' ').trim();
    return (
      cleaned ||
      'I turn complex ideas into thoughtful, high-performing products through strategy, design, and development.'
    );
  }, [data.description]);
  const tools = (data.tools ?? []).map((tool) => tool.trim()).filter(Boolean).slice(0, 4);
  const toolsLabel = data.presentation.toolsLabelText.trim() || 'Best tools';

  const identityUnderPortrait =
    data.presentation.heroEditorialRailIdentityUnderPortrait === true;
  /** Identity-under-portrait wins: bio always returns to the left, enlarged. */
  const bioUnderPortrait =
    !identityUnderPortrait && data.presentation.heroEditorialRailBioUnderPortrait === true;
  const bioOnLeft = !bioUnderPortrait;
  const allLeft = !identityUnderPortrait && !bioUnderPortrait;

  const showCta = data.presentation.heroEditorialRailShowCta === true;
  const primaryHref = data.contactHref || '#contact';
  const secondaryHref = data.workHref || '#work';

  const onNavClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && data.onNavigateSection) {
      event.preventDefault();
      data.onNavigateSection(href.slice(1) || 'contact');
    }
  };

  const avatarUrl = data.avatarUrl?.trim() || null;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const borderSoft = `color-mix(in srgb, ${bordure} 80%, transparent)`;
  const heroRef = useRef<HTMLDivElement>(null);

  const bioStyleDesktop = {
    color: muted,
    fontSize: identityUnderPortrait
      ? 'clamp(1.45rem, 2vw, 1.85rem)'
      : 'clamp(0.95rem, 1.15vw, 1.125rem)',
    lineHeight: 1.55,
  };
  const bioStyleMobile = {
    color: muted,
    fontSize: identityUnderPortrait ? '1.35rem' : '1rem',
    lineHeight: 1.55,
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduced = prefersReducedMotion();
    if (reduced) {
      hero.removeAttribute('data-pf-entry');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mq = window.matchMedia('(min-width: 768px)');
    let ctx: gsap.Context | undefined;
    let refreshId = 0;

    const setup = () => {
      ctx?.revert();
      const scroller = editorialRailScrollParent(hero);
      const isLaidOut = (el: HTMLElement) => el.getClientRects().length > 0;
      const zooms = [...hero.querySelectorAll<HTMLElement>('.pf-editorial-rail-photo-zoom')].filter(
        isLaidOut
      );
      const photos = [...hero.querySelectorAll<HTMLElement>('.pf-editorial-rail-photo')].filter(
        isLaidOut
      );

      ctx = gsap.context(() => {
        zooms.forEach((zoom) => {
          zoom.style.animation = 'none';
          gsap.fromTo(
            zoom,
            { scale: 1.1 },
            {
              scale: 1,
              duration: 1.45,
              ease: 'power2.out',
              overwrite: 'auto',
            }
          );
        });

        photos.forEach((photo) => {
          gsap.fromTo(
            photo,
            { y: 0 },
            {
              y: () => hero.offsetHeight * (1 - PHOTO_PARALLAX_RATIO),
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
  }, [headline, avatarUrl]);

  const ctaRow = (opts?: { compact?: boolean }): ReactNode => {
    if (!showCta) return null;
    return (
      <div
        className={`flex flex-wrap items-center ${
          opts?.compact ? 'gap-x-6 gap-y-3' : 'gap-x-8 gap-y-3'
        }`}
      >
        <a
          href={primaryHref}
          onClick={onNavClick(primaryHref)}
          className={`inline-flex shrink-0 items-center justify-center rounded-full font-sans font-semibold tracking-[-0.01em] transition hover:brightness-110 ${
            opts?.compact ? 'h-11 px-6 text-[0.9rem]' : 'h-12 px-7 text-[0.95rem]'
          }`}
          style={{ backgroundColor: ink, color: fond }}
        >
          Start a project
        </a>
        <a
          href={secondaryHref}
          onClick={onNavClick(secondaryHref)}
          className={`shrink-0 font-sans font-medium tracking-[-0.01em] underline underline-offset-[5px] transition hover:opacity-80 ${
            opts?.compact ? 'text-[0.9rem]' : 'text-[0.95rem]'
          }`}
          style={{ color: ink }}
        >
          View project
        </a>
      </div>
    );
  };

  const bioBlock = (
    style: { color: string; fontSize: string; lineHeight: number },
    className: string,
    opts?: { compactCta?: boolean }
  ): ReactNode => (
    <div className={`flex flex-col ${className}`.trim()}>
      <p className="m-0 font-sans font-normal tracking-[-0.01em]" style={style}>
        {bio}
      </p>
      {showCta ? <div className="mt-6">{ctaRow({ compact: opts?.compactCta })}</div> : null}
    </div>
  );

  const portrait = (className: string) => (
    <EditorialRailPortraitFrame
      className={className}
      avatarUrl={avatarUrl}
      initials={initials}
      displayName={displayName}
      muted={muted}
      imageBw={imageBw}
      neutre={neutre}
      borderSoft={borderSoft}
    />
  );

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-editorial-rail-hero relative isolate w-full overflow-x-clip overflow-y-visible font-sans"
      style={{ backgroundColor: fond, color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: fond }}
      />

      {/* Desktop — Global content gutter only (no extra internal L/R padding) */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] flex-col pb-10 pt-[calc(6.25rem+env(safe-area-inset-top,0px))] md:flex lg:pt-[calc(7rem+env(safe-area-inset-top,0px))] ${shellX}`}
      >
        {allLeft ? (
          /* Left copy centered against portrait; tools pinned to bottom of left column */
          <div className="grid w-full flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] items-stretch gap-x-[clamp(2rem,6vw,5rem)]">
            <div className="flex min-h-0 min-w-0 flex-col overflow-visible">
              <div className="flex min-h-0 flex-1 flex-col justify-center overflow-visible">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: principal }}
                    aria-hidden
                  />
                  <p
                    className="m-0 text-[clamp(0.8rem,0.95vw,0.95rem)] font-normal leading-none tracking-[-0.01em]"
                    style={{ color: muted }}
                  >
                    {availability}
                  </p>
                </div>

                <EditorialRailHeadline
                  text={headline}
                  ink={ink}
                  fontSize="clamp(2.85rem, 5.2vw, 4.75rem)"
                  className="mt-[clamp(2.5rem,4.5vh,3.25rem)]"
                />

                {bioBlock(bioStyleDesktop, `${BIO_GAP_DESKTOP} max-w-[40rem]`)}
              </div>

              {tools.length > 0 ? (
                <EditorialRailTools
                  tools={tools}
                  label={toolsLabel}
                  borderSoft={borderSoft}
                  surface={neutre}
                  muted={muted}
                  className="mt-auto shrink-0 pt-[clamp(1.5rem,3vh,2.25rem)]"
                />
              ) : null}
            </div>

            {portrait('relative ml-auto aspect-[3/4] w-full')}
          </div>
        ) : (
          <div className="grid w-full flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-start gap-x-[clamp(2rem,6vw,5rem)]">
            <div className="flex min-w-0 flex-col self-center">
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: principal }}
                  aria-hidden
                />
                <p
                  className="m-0 text-[clamp(0.8rem,0.95vw,0.95rem)] font-normal leading-none tracking-[-0.01em]"
                  style={{ color: muted }}
                >
                  {availability}
                </p>
              </div>

              {!identityUnderPortrait ? (
                <EditorialRailHeadline
                  text={headline}
                  ink={ink}
                  fontSize="clamp(2.85rem, 5.2vw, 4.75rem)"
                  className="mt-[clamp(2.5rem,4.5vh,3.25rem)]"
                />
              ) : null}

              {bioOnLeft
                ? bioBlock(
                    bioStyleDesktop,
                    identityUnderPortrait
                      ? 'mt-[clamp(2.5rem,4.5vh,3.25rem)] max-w-[40rem]'
                      : `${BIO_GAP_DESKTOP} max-w-[40rem]`
                  )
                : null}
            </div>

            {portrait('relative ml-auto aspect-[3/4] w-full')}

            <div className="min-w-0 self-start pt-[clamp(1.5rem,3vh,2.25rem)]">
              {tools.length > 0 ? (
                <EditorialRailTools
                  tools={tools}
                  label={toolsLabel}
                  borderSoft={borderSoft}
                  surface={neutre}
                  muted={muted}
                />
              ) : null}
            </div>

            <div className="ml-auto w-full self-start pt-[clamp(1.15rem,2vh,1.5rem)]">
              {identityUnderPortrait ? (
                <ul className="m-0 list-none space-y-2 p-0 font-sans text-[clamp(1.15rem,1.5vw,1.45rem)] font-medium leading-snug tracking-[-0.015em]">
                  <li className="flex gap-2" style={{ color: ink }}>
                    <span aria-hidden>→</span>
                    <span>{displayName}</span>
                  </li>
                  <li className="flex gap-2" style={{ color: principal }}>
                    <span aria-hidden>→</span>
                    <span>{specialty}</span>
                  </li>
                </ul>
              ) : null}
              {bioUnderPortrait
                ? bioBlock(bioStyleDesktop, identityUnderPortrait ? 'mt-6 w-full' : 'w-full')
                : null}
            </div>
          </div>
        )}
      </div>

      {/* Mobile — Global content gutter only */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: principal }}
            aria-hidden
          />
          <p
            className="m-0 text-[0.875rem] font-normal leading-none tracking-[-0.01em]"
            style={{ color: muted }}
          >
            {availability}
          </p>
        </div>

        {!identityUnderPortrait ? (
          <EditorialRailHeadline
            text={headline}
            ink={ink}
            fontSize="clamp(2.65rem, 11.5vw, 4rem)"
            className="mt-10 w-full"
            fullWidth
          />
        ) : null}

        {bioOnLeft
          ? bioBlock(bioStyleMobile, identityUnderPortrait ? 'mt-10' : BIO_GAP_MOBILE, {
              compactCta: true,
            })
          : null}

        {portrait('relative mt-9 aspect-[3/4] w-full')}

        {identityUnderPortrait ? (
          <ul className="mt-6 list-none space-y-2 p-0 font-sans text-[1.2rem] font-medium leading-snug tracking-[-0.015em]">
            <li className="flex gap-2" style={{ color: ink }}>
              <span aria-hidden>→</span>
              <span>{displayName}</span>
            </li>
            <li className="flex gap-2" style={{ color: principal }}>
              <span aria-hidden>→</span>
              <span>{specialty}</span>
            </li>
          </ul>
        ) : null}

        {bioUnderPortrait ? bioBlock(bioStyleMobile, 'mt-6', { compactCta: true }) : null}

        {tools.length > 0 ? (
          <EditorialRailTools
            tools={tools}
            label={toolsLabel}
            borderSoft={borderSoft}
            surface={neutre}
            muted={muted}
            className="mt-8"
            mobile
          />
        ) : null}
      </div>
    </div>
  );
}

function EditorialRailHeadline({
  text,
  ink,
  fontSize,
  className,
  fullWidth = false,
}: {
  text: string;
  ink: string;
  fontSize: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastWidth = useRef(-1);
  const [lines, setLines] = useState<string[] | null>(null);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  const typeStyle: CSSProperties = {
    color: ink,
    fontSize,
    lineHeight: TITLE_LINE_HEIGHT,
  };
  const headingClass = fullWidth
    ? 'm-0 w-full max-w-full shrink-0 font-sans font-semibold tracking-[-0.035em]'
    : 'm-0 max-w-[22ch] shrink-0 font-sans font-semibold tracking-[-0.035em]';

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const trySplit = () => {
      const wordEls = [...heading.querySelectorAll<HTMLElement>('[data-rail-word]')];
      if (wordEls.length === 0) return;
      const next = groupWordsIntoLines(wordEls);
      const splitFailed =
        next.length === 0 || next.length > 6 || (words.length > 4 && next.length >= words.length);
      setLines((prev) => {
        const resolved = splitFailed ? null : next;
        if (prev === resolved) return prev;
        if (
          prev !== null &&
          resolved !== null &&
          prev.length === resolved.length &&
          prev.every((line, i) => line === resolved[i])
        ) {
          return prev;
        }
        return resolved;
      });
    };

    if (lines === null) trySplit();

    const observer = new ResizeObserver(() => {
      const width = heading.clientWidth;
      if (width <= 0) return;
      if (lastWidth.current < 0) {
        lastWidth.current = width;
        return;
      }
      if (Math.abs(width - lastWidth.current) < 1) return;
      lastWidth.current = width;
      setLines(null);
    });
    observer.observe(heading);
    void document.fonts?.ready.then(() => {
      if (heading.querySelector('[data-rail-word]')) trySplit();
    });
    return () => observer.disconnect();
  }, [text, fontSize, words, lines]);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading || !lines?.length) return;
    if (prefersReducedMotion()) return;
    if (heading.getClientRects().length === 0) return;

    const inners = heading.querySelectorAll<HTMLElement>('.pf-editorial-rail-line-inner');
    if (inners.length === 0) return;

    const tween = gsap.fromTo(
      inners,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.95,
        stagger: 0.085,
        ease: 'power3.out',
        overwrite: 'auto',
      }
    );
    return () => {
      tween.kill();
      gsap.set(inners, { yPercent: 0 });
    };
  }, [lines]);

  return (
    <h1
      ref={headingRef}
      className={`pf-editorial-rail-headline min-w-0 ${headingClass} ${className ?? ''}`.trim()}
      style={typeStyle}
    >
      {lines && lines.length > 0
        ? lines.map((line, index) => (
            <span key={`${line}-${index}`} className="pf-editorial-rail-line">
              <span className="pf-editorial-rail-line-inner">{line}</span>
            </span>
          ))
        : words.map((word, index) => (
            <span key={`${word}-${index}`} data-rail-word>
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </span>
          ))}
    </h1>
  );
}

function EditorialRailTools({
  tools,
  label,
  borderSoft,
  surface,
  muted,
  className,
  mobile = false,
}: {
  tools: string[];
  label: string;
  borderSoft: string;
  surface: string;
  muted: string;
  className?: string;
  mobile?: boolean;
}) {
  const cellClass = mobile
    ? 'flex min-h-[3.75rem] min-w-[7.5rem] items-center justify-center whitespace-nowrap px-6 py-4 text-center font-sans text-[0.95rem] font-medium tracking-[-0.01em]'
    : 'flex min-h-[4.25rem] min-w-[8.5rem] items-center justify-center whitespace-nowrap px-8 py-4 text-center font-sans text-[clamp(0.85rem,1vw,1rem)] font-medium tracking-[-0.01em]';

  return (
    <div className={`w-fit max-w-full ${className ?? ''}`.trim()}>
      <p
        className="m-0 mb-3 font-sans text-[0.8rem] font-medium uppercase tracking-[0.12em]"
        style={{ color: muted }}
      >
        {label}
      </p>
      <div
        className="inline-flex max-w-full flex-wrap overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${borderSoft}`, backgroundColor: surface }}
        role="list"
        aria-label={label}
      >
        {tools.map((tool, index) => (
          <div
            key={`${tool}-${index}`}
            role="listitem"
            className={cellClass}
            style={{
              color: muted,
              borderLeft: index > 0 ? `1px solid ${borderSoft}` : undefined,
            }}
          >
            {tool.toLowerCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorialRailPortraitFrame({
  className,
  avatarUrl,
  initials,
  displayName,
  muted,
  imageBw,
  neutre,
  borderSoft,
}: {
  className: string;
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  muted: string;
  imageBw: boolean;
  neutre: string;
  borderSoft: string;
}) {
  return (
    <div
      className={`pf-editorial-rail-photo overflow-hidden rounded-2xl ${className}`.trim()}
      style={{
        backgroundColor: neutre,
        border: `1px solid ${borderSoft}`,
      }}
    >
      <div className="pf-editorial-rail-photo-shift absolute inset-0">
        <div className="pf-editorial-rail-photo-zoom absolute inset-0 origin-center">
          <EditorialRailPortrait
            avatarUrl={avatarUrl}
            initials={initials}
            displayName={displayName}
            muted={muted}
            imageBw={imageBw}
          />
        </div>
      </div>
    </div>
  );
}

function EditorialRailPortrait({
  avatarUrl,
  initials,
  displayName,
  muted,
  imageBw,
}: {
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  muted: string;
  imageBw: boolean;
}) {
  return (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Portrait of ${displayName}`}
          fill
          sizes="(max-width: 768px) 92vw, 34vw"
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
    </>
  );
}
