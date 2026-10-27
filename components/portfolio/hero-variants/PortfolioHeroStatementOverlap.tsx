'use client';

import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import { heroImageGrayscaleClass } from '@/components/portfolio/portfolio-hero-banner-settings';
import { DEFAULT_HERO_PALETTE, mergeHeroPalette, resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { RefObject } from 'react';
import { portfolioHeroContentShellClass } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';

/** High-contrast display serif. Playfair Display ships with every portfolio route. */
const DISPLAY_SERIF = '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif';

/** A trailing full stop is drawn in the accent colour, as its own mark. */
function splitFullStop(text: string): { body: string; stop: boolean } {
  const trimmed = text.trim();
  return /[.!]$/.test(trimmed) ? { body: trimmed.slice(0, -1), stop: true } : { body: trimmed, stop: false };
}

/**
 * The statement a profile gets with nothing typed in: one word for each half — the first word of its
 * specialty, then the first name. Anything longer is the creator's to type (First half / Second half).
 */
function statementFromSpecialty(specialty: string, firstName: string): { start: string; end: string } | null {
  const word = specialty.trim().split(/[\s,•·|]+/).filter(Boolean)[0];
  if (!word) return null;
  return { start: word, end: firstName.trim() ? `${firstName.trim()}.` : '' };
}

/** Longer words are set smaller on narrow screens, where the words stack and have no portrait to fit around. */
function fitFactor(text: string): number {
  return Math.min(1, 9.5 / Math.max(text.length, 1));
}

/** The portrait's left and right edges, as a share of the stage's width. */
const PORTRAIT_LEFT = 0.375;
const PORTRAIT_RIGHT = 0.668;
/** How far each word runs onto the photo, in em: about a character and a half for the first word, only the
 *  apostrophe-and-letter of the second (as in the reference). */
const START_OVERLAP_EM = 0.38;
const END_OVERLAP_EM = 0.28;

/**
 * Wide screens: both words share one font size, chosen so that the first word ends exactly
 * START_OVERLAP_EM onto the portrait without leaving the stage on the left, and the second begins
 * END_OVERLAP_EM before the portrait's right edge without leaving it on the right. The words'
 * natural widths are measured, so any text (and any font) lands the same overlap.
 */
function useStatementFit(
  stageRef: RefObject<HTMLDivElement | null>,
  startRef: RefObject<HTMLSpanElement | null>,
  endRef: RefObject<HTMLSpanElement | null>,
  key: string
) {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      if (window.matchMedia('(max-width: 1023px)').matches) {
        stage.style.removeProperty('--stmt-fs-start');
        stage.style.removeProperty('--stmt-fs-end');
        return;
      }
      const stageWidth = stage.clientWidth;
      const cap = 0.125 * stageWidth;
      const fit = (el: HTMLSpanElement | null, room: number, overlap: number) => {
        if (!el) return cap;
        const fontPx = parseFloat(getComputedStyle(el).fontSize);
        const em = el.getBoundingClientRect().width / fontPx;
        return fontPx > 0 && em > overlap ? Math.min(cap, room / (em - overlap)) : cap;
      };
      const startFit = fit(startRef.current, PORTRAIT_LEFT * stageWidth, START_OVERLAP_EM);
      const endFit = fit(endRef.current, (1 - PORTRAIT_RIGHT) * stageWidth, END_OVERLAP_EM);
      // Each half takes the size its own room allows, but the two stay within 1.6× of each other so the
      // statement still reads as one line of type.
      const startSize = Math.max(48, Math.min(startFit, endFit * 1.6));
      const endSize = Math.max(48, Math.min(endFit, startFit * 1.6));
      stage.style.setProperty('--stmt-fs-start', `${startSize}px`);
      stage.style.setProperty('--stmt-fs-end', `${endSize}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    void document.fonts?.ready.then(apply);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [stageRef, startRef, endRef, key]);
}

/**
 * Hero · Statement overlap — a monumental statement in two parts either side of a tall portrait, each
 * part overlapping the photo's edge; name and credit in a small block lower left; a hairline with the
 * tagline, the call to action and a scroll cue closes the screen. The statement is the creator's
 * specialty unless they type their own words.
 *
 * It fills at least one screen. On wide screens the stage is one proportional composition (every size is
 * a share of its own width, so the overlaps stay put at any width); below that it stacks, keeping the same
 * overlaps with negative margins.
 */
export function PortfolioHeroStatementOverlap({ data }: { data: PortfolioHeroData }) {
  const t = useT();
  const settings = data.presentation;
  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, settings.palette);
  const fond = resolveHeroPaletteColor(palette, 'fond');
  const ink = resolveHeroPaletteColor(palette, 'texteFort');
  const muted = resolveHeroPaletteColor(palette, 'texteMuted');
  const rule = resolveHeroPaletteColor(palette, 'bordure');
  const accent = resolveHeroPaletteColor(palette, 'principal');
  const shellX = portfolioHeroContentShellClass(data.contentGutter, data.contentWidthClass);

  const fullName = (data.fullName || data.nameLead || '').trim() || t('Your Name');
  const location = data.locationLabel?.trim() || '';
  const customStart = settings.heroStatementStart?.trim() || '';
  const customEnd = settings.heroStatementEnd?.trim() || '';
  const derived = statementFromSpecialty(data.specialite ?? '', (data.nameLead || fullName).trim().split(/\s+/)[0] || '') ?? {
    start: t('Building'),
    end: t('the essential.'),
  };
  const start = splitFullStop(customStart || derived.start);
  const end = splitFullStop(customEnd || derived.end);
  // Under the name: the years of experience; without them, the place (the specialty is already in big type)
  // or, when the big words are the creator's own, the specialty.
  const years =
    typeof data.yearsOfExperience === 'number' && data.yearsOfExperience > 0
      ? Math.min(99, Math.round(data.yearsOfExperience))
      : null;
  const yearsLabel = years
    ? t.plural(years, '{count} year of experience', '{count} years of experience', { count: years })
    : '';
  const statementIsSpecialty = !customStart && !customEnd && Boolean(data.specialite?.trim());
  const credit = yearsLabel || (statementIsSpecialty ? location : data.specialite?.trim() || location);

  const customTagline = settings.heroStatementTagline?.trim();
  const tagline = customTagline || data.description?.replace(/\s+/g, ' ').trim() || '';
  const ctaLabel = settings.heroStatementCtaLabel?.trim() || t('Let’s talk about your project');
  const showCta = data.showContactCta !== false;
  const showScroll = settings.heroStatementShowScroll !== false;
  const imageUrl = settings.heroStatementImageUrl?.trim() || data.avatarUrl?.trim() || '';
  const imageClass = heroImageGrayscaleClass(settings.heroImageGrayscale === true);
  const contactHref = data.contactHref || '#contact';
  const serif = settings.heroStatementFont !== 'body';
  const font = serif ? DISPLAY_SERIF : undefined;

  const stageRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  useStatementFit(stageRef, startRef, endRef, `${start.body}|${end.body}|${serif}`);

  const displayStyle: CSSProperties = {
    fontFamily: font,
    fontWeight: serif ? 400 : 500,
    letterSpacing: '-0.045em',
    lineHeight: 0.84,
    color: ink,
  };

  const navigate = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (!contactHref.startsWith('#') || !data.onNavigateSection) return;
    event.preventDefault();
    data.onNavigateSection(contactHref.slice(1) || 'contact');
  };

  const scrollDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const section = event.currentTarget.closest('section');
    section?.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const word = (part: { body: string; stop: boolean }) => (
    <>
      {part.body}
      {part.stop ? <span style={{ color: accent }}>.</span> : null}
    </>
  );

  return (
    <div
      // Serif survives the site-wide "force body font" setting (see globals.css); "match site font" opts out.
      className={`pf-hero-statement-overlap relative flex min-h-[100svh] w-full flex-col ${shellX} pb-8 pt-[clamp(6rem,15svh,10rem)] sm:pb-10 lg:pb-12 ${serif ? 'pf-statement-serif' : ''}`}
      style={{ backgroundColor: data.suppressBackground ? undefined : fond, color: ink }}
    >
      {/* Stage — wide: one proportional composition; narrow: a stack with the same overlaps. It takes the
          free height between the top and the foot, centred, so a tall screen never leaves it hugging the top. */}
      <div className="flex flex-1 items-center">
        <div ref={stageRef} className="relative flex w-full flex-col [container-type:inline-size] lg:block lg:aspect-[2.46/1]">
          <h1 className="m-0 max-lg:contents">
            {/* The two halves of the statement read as one sentence for assistive tech. */}
            <span className="sr-only">{`${start.body} ${end.body}`}</span>
            <span
              ref={startRef}
              aria-hidden
              data-pf-no-color-transition=""
              className="pointer-events-none relative z-20 block text-[length:calc(clamp(3.6rem,19vw,7.5rem)*var(--stmt-k,1))] max-lg:order-1 lg:absolute lg:right-[var(--stmt-right)] lg:top-[17%] lg:whitespace-nowrap lg:text-[length:var(--stmt-fs-start,calc(clamp(3.25rem,10.9cqi,13rem)*var(--stmt-k,1)))]"
              style={{ ...displayStyle, '--stmt-k': fitFactor(start.body), '--stmt-right': `calc(${(1 - PORTRAIT_LEFT) * 100}% - ${START_OVERLAP_EM}em)` } as CSSProperties}
            >
              {word(start)}
            </span>
            {end.body ? (
              <span
                ref={endRef}
                aria-hidden
                data-pf-no-color-transition=""
                className="pointer-events-none relative z-20 -mt-[0.2em] block text-right text-[length:calc(clamp(3.6rem,19vw,7.5rem)*var(--stmt-k,1))] max-lg:order-3 lg:absolute lg:bottom-[3%] lg:left-[var(--stmt-left)] lg:mt-0 lg:whitespace-nowrap lg:text-left lg:text-[length:var(--stmt-fs-end,calc(clamp(3.25rem,10.9cqi,13rem)*var(--stmt-k,1)))]"
                style={{ ...displayStyle, '--stmt-k': fitFactor(end.body), '--stmt-left': `calc(${PORTRAIT_RIGHT * 100}% - ${END_OVERLAP_EM}em)` } as CSSProperties}
              >
                {word(end)}
              </span>
            ) : null}
          </h1>

          {/* Portrait — between the words on wide screens, under the first word on narrow ones. */}
          <div
            data-pf-no-color-transition=""
            className="relative z-10 mx-auto -mt-[0.9rem] aspect-[5/7] w-[68%] max-w-[22rem] overflow-hidden max-lg:order-2 lg:absolute lg:left-[37.5%] lg:top-0 lg:mx-0 lg:mt-0 lg:h-full lg:w-[29.3%] lg:max-w-none lg:aspect-auto"
            style={{ backgroundColor: `color-mix(in srgb, ${ink} 10%, ${fond})` }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={fullName}
                className={`h-full w-full object-cover object-[50%_25%] ${imageClass}`}
                decoding="async"
              />
            ) : (
              <div
                aria-hidden
                className="flex h-full w-full items-center justify-center text-6xl"
                style={{ ...displayStyle, color: muted }}
              >
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Credit — name (and role or place) under a short accent bar. */}
          <div className="relative z-20 mt-6 max-lg:order-4 lg:absolute lg:bottom-[17%] lg:left-0 lg:mt-0">
            <span aria-hidden className="mb-4 block h-[2px] w-12" style={{ backgroundColor: accent }} />
            <p
              className="m-0 text-[clamp(1.4rem,2.4cqi,1.85rem)] leading-tight tracking-[-0.01em] lg:text-[clamp(1.35rem,2.7cqi,2rem)]"
              style={{ fontFamily: font, color: ink }}
            >
              {fullName}
            </p>
            {credit ? (
              <p className="m-0 mt-1.5 text-[0.95rem] leading-snug lg:text-[clamp(0.9rem,1.25cqi,1.1rem)]" style={{ color: muted }}>
                {credit}
              </p>
            ) : null}
          </div>
          {/* Bio — top right, in the open space beside the portrait; under the credit when stacked. */}
          {tagline ? (
            <p
              className="relative z-20 m-0 mt-6 line-clamp-4 max-w-[34ch] whitespace-pre-line text-[1.15rem] leading-[1.25] tracking-[-0.01em] max-lg:order-5 lg:absolute lg:right-0 lg:top-[4%] lg:mt-0 lg:w-[28%] lg:max-w-none lg:text-[clamp(1.05rem,1.75cqi,1.5rem)]"
              style={{ fontFamily: font, color: ink }}
            >
              {tagline}
            </p>
          ) : null}
        </div>
      </div>

      {/* Foot — hairline, tagline, call to action, scroll cue. */}
      <div
        className="mt-10 grid items-center gap-y-6 border-t pt-6 lg:mt-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8"
        style={{ borderColor: rule }}
      >
        <span aria-hidden className="hidden lg:block" />

        {showCta ? (
          <a
            href={contactHref}
            onClick={navigate}
            data-pf-no-color-transition=""
            className="group/cta inline-flex w-fit items-center gap-2.5 justify-self-start border-b-[1.5px] pb-1.5 text-[1.1rem] leading-none transition-opacity duration-300 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 lg:justify-self-center"
            style={{ fontFamily: font, color: ink, borderColor: accent }}
          >
            {ctaLabel}
            <svg
              viewBox="0 0 16 16"
              aria-hidden
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              fill="none"
            >
              <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ) : (
          <span aria-hidden />
        )}

        {showScroll ? (
          <div className="hidden items-center justify-self-end lg:flex">
            <span aria-hidden className="mr-6 block h-9 w-px" style={{ backgroundColor: rule }} />
            <button
              type="button"
              onClick={scrollDown}
              data-pf-no-color-transition=""
              className="inline-flex items-center gap-2 bg-transparent p-0 text-[0.9rem] transition-opacity duration-300 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ color: muted }}
            >
              {t('Scroll')}
              <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="none">
                <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
