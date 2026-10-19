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
import { useT } from '@/lib/i18n/I18nProvider';

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
  const t = useT();
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
      t('I turn complex ideas into thoughtful, high-performing products through strategy, design, and development.')
    );
  }, [data.description, t]);
  // Layout options → tool picker (up to 4); no pick = the profile's first 4 tools.
  const tools = resolveHeroBannerTools(data.tools, data.presentation.heroEditorialRailSelectedTools, 4);
  const toolsLabel = data.presentation.toolsLabelText.trim() || t('Best tools');
  const showAvailability = data.presentation.showAvailabilityBadge !== false;
  const showTools = tools.length > 0;

  const identityUnderPortrait =
    data.presentation.heroEditorialRailIdentityUnderPortrait === true;
  /** Identity-under-portrait wins: bio always returns to the left, enlarged. */
  const bioUnderPortrait =
    !identityUnderPortrait && data.presentation.heroEditorialRailBioUnderPortrait === true;
  const bioOnLeft = !bioUnderPortrait;
  const allLeft = !identityUnderPortrait && !bioUnderPortrait;

  const showCta = data.presentation.heroEditorialRailShowCta === true;
  const showPrimaryCta = showCta && data.showContactCta !== false;
  const showSecondaryCta = showCta && data.showWorkCta !== false;
  const hasCtas = showPrimaryCta || showSecondaryCta;
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
  const bioStyleTablet = {
    color: muted,
    fontSize: identityUnderPortrait ? 'clamp(1.15rem, 2.3vw, 1.4rem)' : 'clamp(0.92rem, 1.7vw, 1rem)',
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
      const toolTracks = [
        ...hero.querySelectorAll<HTMLElement>('.pf-editorial-rail-tools-track'),
      ].filter(isLaidOut);
      const toolCells = [
        ...hero.querySelectorAll<HTMLElement>('.pf-editorial-rail-tool-cell'),
      ].filter(isLaidOut);
      const availabilityRules = [
        ...hero.querySelectorAll<HTMLElement>('.pf-editorial-rail-availability-rule'),
      ].filter(isLaidOut);

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

        if (availabilityRules.length) {
          gsap.fromTo(
            availabilityRules,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.8, delay: 0.12, ease: 'power3.out' }
          );
        }
        if (toolTracks.length) {
          gsap.fromTo(
            toolTracks,
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, delay: 0.28, ease: 'power3.out' }
          );
        }
        if (toolCells.length) {
          gsap.fromTo(
            toolCells,
            { y: 10, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, delay: 0.42, stagger: 0.055, ease: 'power2.out' }
          );
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
  }, [headline, avatarUrl]);

  const ctaRow = (opts?: { compact?: boolean }): ReactNode => {
    if (!hasCtas) return null;
    return (
      <div
        className={`flex flex-wrap items-center ${
          opts?.compact ? 'gap-x-6 gap-y-3' : 'gap-x-8 gap-y-3'
        }`}
      >
        {showPrimaryCta ? (
          <a
            href={primaryHref}
            onClick={onNavClick(primaryHref)}
            className={`group inline-flex shrink-0 items-center justify-center gap-4 rounded-sm font-sans font-semibold uppercase tracking-[0.1em] transition hover:brightness-110 ${
              opts?.compact ? 'h-11 px-5 text-[0.7rem]' : 'h-12 px-6 text-[0.74rem]'
            }`}
            style={{ backgroundColor: ink, color: fond }}
          >
            {t('Start a project')}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
          </a>
        ) : null}
        {showSecondaryCta ? (
          <a
            href={secondaryHref}
            onClick={onNavClick(secondaryHref)}
            className={`group inline-flex shrink-0 items-center gap-3 border-b pb-1 font-sans font-medium tracking-[-0.01em] transition hover:opacity-80 ${
              opts?.compact ? 'text-[0.9rem]' : 'text-[0.95rem]'
            }`}
            style={{ color: ink, borderColor: borderSoft }}
          >
            {t('View project')}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        ) : null}
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
      {hasCtas ? <div className="mt-6">{ctaRow({ compact: opts?.compactCta })}</div> : null}
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
      principal={principal}
    />
  );

  return (
    <div
      ref={heroRef}
      data-pf-entry="armed"
      className="pf-editorial-rail-hero relative isolate w-full overflow-x-clip overflow-y-visible font-sans"
      style={{ ...(data.suppressBackground ? null : { backgroundColor: fond }), color: ink }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={data.suppressBackground ? undefined : { backgroundColor: fond }}
      />

      {/* Desktop — Global content gutter only (no extra internal L/R padding) */}
      <div
        className={`relative z-[1] hidden min-h-[100dvh] flex-col pb-10 pt-[calc(7rem+env(safe-area-inset-top,0px))] xl:flex ${shellX}`}
      >
        {allLeft ? (
          /* Left copy centered against portrait; tools pinned to bottom of left column */
          <div className="grid w-full flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] items-stretch gap-x-[clamp(2rem,6vw,5rem)]">
            <div className="flex min-h-0 min-w-0 flex-col overflow-visible">
              <div className="flex min-h-0 flex-1 flex-col justify-center overflow-visible">
                {showAvailability ? (
                  <EditorialRailAvailability
                    availability={availability}
                    principal={principal}
                    muted={muted}
                  />
                ) : null}

                <EditorialRailHeadline
                  text={headline}
                  ink={ink}
                  fontSize="clamp(2.85rem, 5.2vw, 4.75rem)"
                  className="mt-[clamp(2.5rem,4.5vh,3.25rem)]"
                />

                {bioBlock(bioStyleDesktop, `${BIO_GAP_DESKTOP} max-w-[40rem]`)}
              </div>

              {showTools ? (
                <EditorialRailTools
                  tools={tools}
                  label={toolsLabel}
                  borderSoft={borderSoft}
                  surface={neutre}
                  muted={muted}
                  ink={ink}
                  principal={principal}
                  className="mt-auto shrink-0 pt-[clamp(1.5rem,3vh,2.25rem)]"
                />
              ) : null}
            </div>

            {portrait('relative ml-auto aspect-[3/4] w-full')}
          </div>
        ) : (
          <div className="grid w-full flex-1 grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] items-start gap-x-[clamp(2rem,6vw,5rem)]">
            <div className="flex min-w-0 flex-col self-center">
              {showAvailability ? (
                <EditorialRailAvailability
                  availability={availability}
                  principal={principal}
                  muted={muted}
                />
              ) : null}

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
              {showTools ? (
                <EditorialRailTools
                  tools={tools}
                  label={toolsLabel}
                  borderSoft={borderSoft}
                  surface={neutre}
                  muted={muted}
                  ink={ink}
                  principal={principal}
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

      {/* Tablet — balanced 3:4 portrait and readable copy; never stretch the photo to the rail. */}
      <div
        className={`relative z-[1] hidden h-[100dvh] min-h-0 grid-cols-[minmax(0,1fr)_minmax(17rem,0.9fr)] grid-rows-[minmax(0,1fr)_auto] gap-x-8 gap-y-6 pb-6 pt-[calc(6rem+env(safe-area-inset-top,0px))] md:grid xl:hidden ${shellX}`}
      >
        <div className="flex min-h-0 min-w-0 flex-col justify-center self-stretch">
          {showAvailability ? (
            <EditorialRailAvailability
              availability={availability}
              principal={principal}
              muted={muted}
              mobile
            />
          ) : null}

          {!identityUnderPortrait ? (
            <EditorialRailHeadline
              text={headline}
              ink={ink}
              fontSize="clamp(2.35rem, 5.4vw, 3.35rem)"
              className="mt-8 w-full"
              fullWidth
            />
          ) : null}

          {bioOnLeft
            ? bioBlock(
                bioStyleTablet,
                identityUnderPortrait ? 'mt-8 max-w-[34rem]' : 'mt-7 max-w-[34rem]',
                { compactCta: true }
              )
            : null}
        </div>

        {portrait('relative aspect-[3/4] w-full self-center')}

        <div className="min-w-0 self-end">
          {showTools ? (
            <EditorialRailTools
              tools={tools}
              label={toolsLabel}
              borderSoft={borderSoft}
              surface={neutre}
              muted={muted}
              ink={ink}
              principal={principal}
              mobile
            />
          ) : null}
        </div>

        <div className="min-w-0 self-start">
          {identityUnderPortrait ? (
            <ul className="m-0 list-none space-y-1.5 p-0 font-sans text-[1.05rem] font-medium leading-snug tracking-[-0.015em]">
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
            ? bioBlock(bioStyleTablet, identityUnderPortrait ? 'mt-5 w-full' : 'w-full', {
                compactCta: true,
              })
            : null}
        </div>
      </div>

      {/* Mobile — Global content gutter only */}
      <div
        className={`relative z-[1] flex flex-col pb-12 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:hidden ${shellX}`}
      >
        {showAvailability ? (
          <EditorialRailAvailability
            availability={availability}
            principal={principal}
            muted={muted}
            mobile
          />
        ) : null}

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

        {showTools ? (
          <EditorialRailTools
            tools={tools}
            label={toolsLabel}
            borderSoft={borderSoft}
            surface={neutre}
            muted={muted}
            ink={ink}
            principal={principal}
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
  const words = useMemo(() => {
    const tokens = text.split(/\s+/).filter(Boolean);
    const grouped: string[] = [];
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index] === '—' && tokens[index + 1]) {
        grouped.push(`${tokens[index]} ${tokens[index + 1]}`);
        index += 1;
      } else {
        grouped.push(tokens[index]);
      }
    }
    return grouped;
  }, [text]);

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
              <span className="pf-editorial-rail-line-inner">
                {line}
                {index < lines.length - 1 ? ' ' : ''}
              </span>
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

function EditorialRailAvailability({
  availability,
  principal,
  muted,
  mobile = false,
}: {
  availability: string;
  principal: string;
  muted: string;
  mobile?: boolean;
}) {
  return (
    <div className="flex max-w-full items-center gap-2.5">
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{
          backgroundColor: principal,
          boxShadow: `0 0 0 4px color-mix(in srgb, ${principal} 12%, transparent)`,
        }}
        aria-hidden
      />
      <p
        className={`m-0 shrink-0 font-normal leading-none tracking-[-0.01em] ${
          mobile ? 'text-[0.875rem]' : 'text-[clamp(0.8rem,0.95vw,0.95rem)]'
        }`}
        style={{ color: muted }}
      >
        {availability}
      </p>
      <span
        aria-hidden
        className="pf-editorial-rail-availability-rule h-px w-[clamp(2.5rem,5vw,5.5rem)] shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${principal} 68%, transparent)` }}
      />
    </div>
  );
}

function EditorialRailTools({
  tools,
  label,
  borderSoft,
  surface,
  muted,
  ink,
  principal,
  className,
  mobile = false,
}: {
  tools: string[];
  label: string;
  borderSoft: string;
  surface: string;
  muted: string;
  ink: string;
  principal: string;
  className?: string;
  mobile?: boolean;
}) {
  const cellClass = mobile
    ? 'pf-editorial-rail-tool-cell group flex min-h-[3.25rem] min-w-[7.25rem] items-center gap-3 whitespace-nowrap px-4 py-3 text-left font-sans text-[0.88rem] font-medium tracking-[-0.01em] transition-colors hover:bg-[var(--rail-accent)]'
    : 'pf-editorial-rail-tool-cell group flex min-h-[3.5rem] min-w-[8rem] items-center gap-3 whitespace-nowrap px-5 py-3 text-left font-sans text-[clamp(0.8rem,0.9vw,0.92rem)] font-medium tracking-[-0.01em] transition-colors hover:bg-[var(--rail-accent)]';

  return (
    <div className={`w-fit max-w-full ${className ?? ''}`.trim()}>
      <div className="mb-3 flex items-center gap-3">
        <p
          className="m-0 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em]"
          style={{ color: muted }}
        >
          {label}
        </p>
        <span className="h-px flex-1" style={{ backgroundColor: borderSoft }} aria-hidden />
        <span
          className="font-mono text-[0.65rem] tabular-nums tracking-[0.08em]"
          style={{ color: muted }}
          aria-hidden
        >
          0{tools.length}
        </span>
      </div>
      <div
        className="pf-editorial-rail-tools-track inline-flex max-w-full flex-wrap overflow-hidden rounded-[0.35rem]"
        style={
          {
            border: `1px solid ${borderSoft}`,
            backgroundColor: `color-mix(in srgb, ${surface} 72%, transparent)`,
            '--rail-accent': `color-mix(in srgb, ${principal} 14%, ${surface})`,
          } as CSSProperties
        }
        role="list"
        aria-label={label}
      >
        {tools.map((tool, index) => (
          <div
            key={`${tool}-${index}`}
            role="listitem"
            className={cellClass}
            style={{
              color: ink,
              borderLeft: index > 0 ? `1px solid ${borderSoft}` : undefined,
            }}
          >
            <span
              className="font-mono text-[0.62rem] tabular-nums tracking-[0.06em] opacity-55 transition-opacity group-hover:opacity-100"
              style={{ color: principal }}
              aria-hidden
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{tool.toLowerCase()}</span>
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
  principal,
}: {
  className: string;
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  muted: string;
  imageBw: boolean;
  neutre: string;
  borderSoft: string;
  principal: string;
}) {
  return (
    <div
      className={`pf-editorial-rail-photo overflow-hidden rounded-bl-[0.35rem] rounded-br-[1.5rem] rounded-tl-[1.5rem] rounded-tr-[0.35rem] ${className}`.trim()}
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${borderSoft} 70%, transparent)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-[12%] h-[11%] w-[2px]"
        style={{ backgroundColor: principal }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-5 right-5 font-mono text-[0.64rem] tracking-[0.18em] text-white/65"
      >
        01 / PORTRAIT
      </span>
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
  const t = useT();
  return (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={t('Portrait of {displayName}', { displayName })}
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
