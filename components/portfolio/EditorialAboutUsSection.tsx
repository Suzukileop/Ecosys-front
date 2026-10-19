'use client';

import { createContext, useContext, type CSSProperties, type MouseEvent } from 'react';
import type { ProfileAboutUs } from '@/types/profile';
import {
  aboutUsCardBorderStyle,
  aboutUsCardRadiusClass,
  aboutUsCardShadowClass,
  aboutUsCardSurfaceColor,
  aboutUsChrome,
  aboutUsContentPlacementClass,
  aboutUsIsDarkMode,
  aboutUsReadableInk,
  aboutUsTextScale,
  DEFAULT_ABOUT_US_SUBTITLE,
  resolveAboutUsCtaStyle,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsCtaStyle,
  type PortfolioAboutUsPresentationSettings,
} from '@/components/portfolio/portfolio-about-us-settings';
import {
  AboutUsQuoteSvg,
  DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
  isAboutUsQuoteSvgId,
  quoteSvgSlotIndex,
} from '@/components/portfolio/about-us-quote-svgs';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import { resolveTaskListMarker } from '@/components/portfolio/portfolio-list-marker';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';

/** Portraits and photos in this section are user uploads; serve a derivative, not the original. */
const ABOUT_MEDIA_WIDTHS = [256, 384, 640, 828] as const;
const ABOUT_MEDIA_SIZES = '(min-width: 1024px) 420px, 90vw';


/**
 * Where the About us button goes. The page resolves it like the nav's Contact link: the Contact
 * section when it is shown, otherwise the creator's primary link / email / footer — a bare
 * `#contact` went nowhere once Contact was turned off. In pages mode the page also hands over its
 * navigator, since a hash alone doesn't switch pages.
 */
type AboutUsCtaTarget = { href: string; onNavigate?: (href: string) => void };
const AboutUsCtaContext = createContext<AboutUsCtaTarget>({ href: '#contact' });

function useAboutUsCtaLinkProps() {
  const { href, onNavigate } = useContext(AboutUsCtaContext);
  const external = /^https?:\/\//i.test(href);
  return {
    href,
    ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (!onNavigate || external) return;
      event.preventDefault();
      onNavigate(href);
    },
  };
}

function filledImages(imageUrls: Array<string | null | undefined> | undefined): string[] {
  return (imageUrls ?? []).map((url) => (url ?? '').trim()).filter(Boolean).slice(0, 2);
}

function aboutUsMediaIsLeft(presentation: PortfolioAboutUsPresentationSettings): boolean {
  return resolveAboutUsMediaSide(presentation.design, presentation.mediaSide) === 'left';
}

function aboutUsSplitOrderClass(role: 'copy' | 'media', mediaLeft: boolean): string {
  if (role === 'media') return mediaLeft ? 'order-1' : 'max-lg:order-1 lg:order-2';
  return mediaLeft ? 'order-2' : 'max-lg:order-2 lg:order-1';
}

function aboutUsSplitCols(
  hasImages: boolean,
  mediaLeft: boolean,
  ratio: 'overlap' | 'balanced' = 'balanced'
): string {
  if (!hasImages) return '';
  // Complete class strings so Tailwind JIT emits the two-column template.
  if (ratio === 'overlap') {
    return mediaLeft
      ? 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]'
      : 'lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]';
  }
  return mediaLeft
    ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'
    : 'lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]';
}

function AboutUsCtaArrow({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The About us button, in the style picked under Design → Layout. Every style keeps the accent as the
 * one signature touch (rule, ring, fill-on-hover) and the section's title colour for the label, so
 * contrast follows whatever palette the creator chose. `solidClassName` is each design's own filled
 * pill (their radii and paddings differ), so the default look of every design is unchanged.
 */
function AboutUsCta({
  presentation,
  label,
  linkProps,
  className = '',
  solidClassName,
  textClassName = 'text-[calc(15px*var(--pf-about-scale,1))]',
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  label: string;
  linkProps: ReturnType<typeof useAboutUsCtaLinkProps>;
  /** Spacing only (margin / width). */
  className?: string;
  solidClassName: string;
  /** Label size. */
  textClassName?: string;
}) {
  const variant: PortfolioAboutUsCtaStyle = resolveAboutUsCtaStyle(presentation);
  const accent = presentation.accentColor;
  const ink = presentation.titleColor;
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4';
  const vars = {
    '--cta-accent': accent,
    '--cta-on': aboutUsReadableInk(accent),
    '--cta-ink': ink,
    '--cta-hair': `color-mix(in srgb, ${ink} 32%, transparent)`,
    outlineColor: accent,
  } as CSSProperties;
  // Colours live in classes (not inline) so the hover / focus utilities below can override them.
  const ink0 = '[color:var(--cta-ink)]';

  if (variant === 'solid') {
    return (
      <a
        {...linkProps}
        className={`${className} ${solidClassName}`}
        data-pf-no-color-transition=""
        style={{ backgroundColor: accent, color: aboutUsReadableInk(accent) }}
      >
        {label}
      </a>
    );
  }

  if (variant === 'link') {
    return (
      <a
        {...linkProps}
        className={`group ${className} ${ink0} inline-flex w-fit max-w-full items-center gap-2.5 border-b pb-1.5 ${textClassName} font-medium tracking-wide transition-[gap] duration-300 hover:gap-3.5 focus-visible:gap-3.5 ${focus}`}
        data-pf-no-color-transition=""
        style={{ ...vars, borderColor: accent }}
      >
        {label}
        <span style={{ color: accent }}>
          <AboutUsCtaArrow />
        </span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        {...linkProps}
        className={`${className} ${ink0} [border-color:var(--cta-hair)] inline-flex w-fit max-w-full items-center justify-center rounded-full border px-7 py-3 ${textClassName} font-medium tracking-wide transition-colors duration-300 hover:[background-color:var(--cta-accent)] hover:[border-color:var(--cta-accent)] hover:[color:var(--cta-on)] focus-visible:[background-color:var(--cta-accent)] focus-visible:[border-color:var(--cta-accent)] focus-visible:[color:var(--cta-on)] ${focus}`}
        data-pf-no-color-transition=""
        style={vars}
      >
        {label}
      </a>
    );
  }

  if (variant === 'circle') {
    return (
      <a
        {...linkProps}
        className={`group ${className} ${ink0} inline-flex w-fit max-w-full items-center gap-3.5 ${textClassName} font-medium tracking-wide ${focus}`}
        data-pf-no-color-transition=""
        style={vars}
      >
        {label}
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border [border-color:var(--cta-hair)] transition-colors duration-300 group-hover:[background-color:var(--cta-accent)] group-hover:[border-color:var(--cta-accent)] group-hover:[color:var(--cta-on)] group-focus-visible:[background-color:var(--cta-accent)] group-focus-visible:[border-color:var(--cta-accent)] group-focus-visible:[color:var(--cta-on)]"
        >
          <AboutUsCtaArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </a>
    );
  }

  // underline: plain text over a quiet hairline; a short accent segment runs the full width on hover.
  return (
    <a
      {...linkProps}
      className={`group ${className} ${ink0} relative inline-flex w-fit max-w-full items-center pb-2 ${textClassName} font-medium tracking-wide ${focus}`}
      data-pf-no-color-transition=""
      style={vars}
    >
      {label}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px [background-color:var(--cta-hair)]" />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left scale-x-[0.28] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
        style={{ backgroundColor: accent }}
      />
    </a>
  );
}

/**
 * Task-list bullet. With no choice saved, each design keeps its own (see AboutUsAccentCheck); once the
 * creator picks one under Design → List bullets it is drawn from the shared marker set, in the accent
 * colour, at the same size in every design.
 */
function AboutUsTaskMarker({
  presentation,
  index,
  compact = false,
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  index: number;
  compact?: boolean;
}) {
  if (!presentation.taskBulletStyle) return <AboutUsAccentCheck color={presentation.accentColor} compact={compact} />;
  return (
    <PortfolioListMarker
      style={presentation.taskBulletStyle}
      color={presentation.accentColor}
      index={index}
      size="md"
      className="mt-1"
    />
  );
}

function AboutUsAccentCheck({ color, compact = false }: { color: string; compact?: boolean }) {
  return (
    <span
      className={compact ? 'mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center' : 'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center'}
      style={{ color }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7.6 12.15l2.7 2.65 6.1-6.35"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function AboutUsQuoteFounder({
  quote,
  founderName,
  founderFunction,
  founderLogo,
  presentation,
  large = false,
}: {
  quote: string;
  founderName: string;
  founderFunction: string;
  founderLogo: string;
  presentation: PortfolioAboutUsPresentationSettings;
  /** Roomier type for designs where the quote closes the section on its own (Classique). */
  large?: boolean;
}) {
  const showQuote = presentation.showQuote && Boolean(quote);
  const showFounder = presentation.showFounder && Boolean(founderName || founderFunction || founderLogo);
  if (!showQuote && !showFounder) return null;

  return (
    <div className="space-y-6">
      {showQuote ? (
        <blockquote
          className={
            large
              ? 'max-w-3xl text-pretty border-l-2 pl-5 text-xl font-medium italic leading-snug sm:pl-6 sm:text-2xl'
              : 'max-w-2xl border-l-2 pl-5 text-lg font-medium italic leading-relaxed sm:text-xl'
          }
          style={{ color: presentation.quoteColor, borderColor: presentation.quoteColor }}
        >
          {quote}
        </blockquote>
      ) : null}

      {showFounder ? (
        <div className="flex items-center gap-4">
          {founderLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...mediaImageResponsive(founderLogo, ABOUT_MEDIA_WIDTHS)}
              sizes={ABOUT_MEDIA_SIZES}
              alt=""
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold ${aboutUsChrome(aboutUsIsDarkMode(presentation)).avatar}`}
              aria-hidden
            >
              {(founderName || '?').slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            {founderName ? (
              <p
                className={large ? 'text-base font-semibold sm:text-lg' : 'text-base font-semibold'}
                style={{ color: presentation.founderNameColor }}
              >
                {founderName}
              </p>
            ) : null}
            {founderFunction ? (
              <p
                className={large ? 'mt-0.5 text-sm sm:text-[calc(15px*var(--pf-about-scale,1))]' : 'text-sm'}
                style={{ color: presentation.founderFunctionColor }}
              >
                {founderFunction}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AboutUsSplitSingleVisual({ src, dark }: { src: string; dark: boolean }) {
  const chrome = aboutUsChrome(dark);
  return (
    <div className="relative h-full min-h-[22rem] w-full lg:min-h-0">
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-[14%] right-0 top-0 left-[14%] rounded-[2rem] border ${chrome.hairlineMuted}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        // An <img> is a replaced element: top + bottom alone don't stretch it, so the height is
        // spelled out (100% − the 5% top offset) or it collapses to the photo's own ratio.
        className="absolute bottom-0 left-0 top-[5%] z-[1] h-[95%] w-[86%] rounded-[1.75rem] object-cover sm:w-[88%]"
      />
    </div>
  );
}

function AboutUsSplitPairVisual({ front, back, dark }: { front: string; back: string; dark: boolean }) {
  const chrome = aboutUsChrome(dark);
  return (
    <div className="relative h-full min-h-[22rem] w-full max-h-full lg:min-h-0">
      <div
        aria-hidden
        className={`pointer-events-none absolute rounded-[2rem] border ${chrome.hairline}`}
        style={{ top: '12%', left: '18%', right: '10%', bottom: '16%' }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(back, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className="absolute right-0 top-0 z-[1] h-[54%] w-[48%] rounded-[1.7rem] object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(front, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 z-[2] h-[58%] w-[58%] rounded-[1.7rem] object-cover"
      />
    </div>
  );
}

function AboutUsSplitOverlapVisual({ images, dark }: { images: string[]; dark: boolean }) {
  const front = images[0];
  const back = images[1];
  if (!front) return null;
  if (!back) return <AboutUsSplitSingleVisual src={front} dark={dark} />;
  return <AboutUsSplitPairVisual front={front} back={back} dark={dark} />;
}

function AboutUsSplitOverlapDesign({
  aboutUs,
  presentation,
  sectionTitle,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const widthPercent = Math.min(100, Math.max(50, presentation.contentWidthPercent || 100));
  const hasImages = images.length > 0;
  const mediaLeft = aboutUsMediaIsLeft(presentation);
  // Below `lg` the copy always comes first, so the headline opens the section instead of sitting
  // under a screen of pictures; from `lg` the chosen side applies.
  const copyOrder = mediaLeft ? 'max-lg:order-1 lg:order-2' : 'order-1';
  const mediaOrder = mediaLeft ? 'max-lg:order-2 lg:order-1' : 'order-2';

  return (
    <div className="space-y-12">
      <div
        className={`${aboutUsContentPlacementClass(presentation.contentPlacement)} w-full max-lg:!w-full`}
        style={{ width: `${widthPercent}%`, maxWidth: '100%' }}
      >
        <div
          className={`grid items-stretch gap-10 sm:gap-12 lg:gap-16 xl:gap-20 ${aboutUsSplitCols(
            hasImages,
            mediaLeft,
            'overlap'
          )}`}
        >
          <div className={`${hasImages ? 'max-w-xl lg:max-w-[36rem]' : 'max-w-xl'} ${copyOrder}`}>
            {eyebrow ? (
              <p
                className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[calc(2.05rem*var(--pf-about-scale,1))] font-semibold leading-[1.14] tracking-tight sm:text-[calc(2.55rem*var(--pf-about-scale,1))] lg:text-[calc(2.95rem*var(--pf-about-scale,1))] ${
                  eyebrow ? 'mt-4' : ''
                }`}
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              <p
                className={`max-w-[36rem] text-pretty text-[calc(1.0625rem*var(--pf-about-scale,1))] leading-[1.7] sm:text-lg ${title || eyebrow ? 'mt-5 sm:mt-6' : ''}`}
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {presentation.showTasks && tasks.length > 0 ? (
              <ul className={`max-w-[36rem] space-y-3.5 ${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}`}>
                {tasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3 text-base leading-relaxed sm:text-[calc(1.0625rem*var(--pf-about-scale,1))]"
                    style={{ color: presentation.taskColor }}
                  >
                    <AboutUsTaskMarker presentation={presentation} index={index} compact />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-9 sm:mt-10"
                solidClassName="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[calc(15px*var(--pf-about-scale,1))] font-semibold transition hover:opacity-90"
              />
            ) : null}
          </div>

          {hasImages ? (
            <div className={`relative min-h-[20rem] sm:min-h-[26rem] lg:min-h-full ${mediaOrder}`}>
              <div className="h-full min-h-[20rem] sm:min-h-[26rem] lg:absolute lg:inset-0">
                <AboutUsSplitOverlapVisual images={images} dark={aboutUsIsDarkMode(presentation)} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AboutUsQuoteFounder
        quote={quote}
        founderName={founderName}
        founderFunction={founderFunction}
        founderLogo={founderLogo}
        presentation={presentation}
      />
    </div>
  );
}

/**
 * Editorial — a magazine spread. A very large headline under a one-line eyebrow / meta rail, then two
 * columns: a wide photograph with the quote and its author under it, and beside it the lead
 * paragraph, a numbered list set between hairlines, and a text link. Nothing is boxed or filled; the
 * hierarchy is carried by size and weight alone, and the accent appears only on the eyebrow, the
 * numerals and the link.
 */
function AboutUsEditorialDesign({
  aboutUs,
  presentation,
  sectionTitle,
  sectionSubtitle,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
  sectionSubtitle: string;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const src = filledImages(aboutUs.imageUrls)[0];
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const meta =
    sectionSubtitle.trim() && sectionSubtitle.trim() !== DEFAULT_ABOUT_US_SUBTITLE ? sectionSubtitle.trim() : '';
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const dark = aboutUsIsDarkMode(presentation);
  const chrome = aboutUsChrome(dark);
  const mediaLeft = aboutUsMediaIsLeft(presentation);
  const showTasks = presentation.showTasks && tasks.length > 0;
  const showQuote = presentation.showQuote && Boolean(quote);
  const showFounder = presentation.showFounder && Boolean(founderName || founderFunction || founderLogo);
  const hasVisualColumn = Boolean(src) || showQuote || showFounder;
  const hasTextColumn = Boolean(description) || showTasks || presentation.showCta;
  const twoColumns = hasVisualColumn && hasTextColumn;
  // Numerals are the design's own list marker; any other bullet picked under List bullets replaces them.
  const numerals = !presentation.taskBulletStyle || presentation.taskBulletStyle === 'number';

  // Manual headline colour / size (Design → Layout → Headline). The size is the desktop size: it steps
  // down with the viewport so a large value never overflows a phone, and ignores Text size on purpose.
  const customSize = presentation.editorialTitleSizePx;
  const editorialTitleStyle: CSSProperties = {
    color: presentation.editorialTitleColor ?? presentation.titleColor,
    ...(customSize
      ? { fontSize: `clamp(${Math.max(Math.min(customSize, 28), Math.round(customSize * 0.42))}px, ${((customSize / 1100) * 100).toFixed(2)}vw, ${customSize}px)` }
      : null),
  };

  const gridCols = !twoColumns
    ? ''
    : mediaLeft
      ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'
      : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]';
  // On a phone the reading order is headline → lead + list → photo → quote; the side only applies from lg.
  const visualOrder = mediaLeft ? 'max-lg:order-2 lg:order-1' : 'max-lg:order-2 lg:order-2';
  const textOrder = mediaLeft ? 'max-lg:order-1 lg:order-2' : 'max-lg:order-1 lg:order-1';

  return (
    <div className="w-full">
      {eyebrow || meta ? (
        <div className="flex items-baseline justify-between gap-6">
          {eyebrow ? (
            <p className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
              {eyebrow}
            </p>
          ) : (
            <span />
          )}
          {meta ? (
            <p className="max-w-[60%] text-right text-[calc(13px*var(--pf-about-scale,1))] leading-snug sm:text-sm" style={{ color: presentation.descriptionColor }}>
              {meta}
            </p>
          ) : null}
        </div>
      ) : null}

      {title ? (
        <h3
          className={`max-w-[13em] text-balance text-[calc(clamp(2.25rem,6.6vw,5rem)*var(--pf-about-scale,1))] font-medium leading-[0.98] tracking-[-0.035em] ${
            eyebrow || meta ? 'mt-5 sm:mt-6' : ''
          }`}
          style={editorialTitleStyle}
        >
          {title}
        </h3>
      ) : null}

      {twoColumns || hasVisualColumn || hasTextColumn ? (
        <div className={`grid gap-12 lg:gap-14 xl:gap-20 ${title || eyebrow ? 'mt-10 sm:mt-12 lg:mt-14' : ''} ${gridCols}`}>
          {hasVisualColumn ? (
            <div className={`min-w-0 ${visualOrder}`}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
                  sizes="(min-width: 1024px) 58vw, 92vw"
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-sm object-cover sm:aspect-[16/9] lg:aspect-[2.45/1]"
                />
              ) : null}

              {showQuote ? (
                <blockquote
                  className={`max-w-[44rem] text-pretty text-[calc(1.375rem*var(--pf-about-scale,1))] font-normal leading-[1.3] sm:text-[calc(1.75rem*var(--pf-about-scale,1))] ${src ? 'mt-8 sm:mt-9' : ''}`}
                  style={{ color: presentation.quoteColor }}
                >
                  {'“'}
                  {quote}
                  {'”'}
                </blockquote>
              ) : null}

              {showFounder ? (
                <div className={`flex items-center gap-4 ${showQuote || src ? 'mt-6' : ''}`}>
                  {founderLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...mediaImageResponsive(founderLogo, ABOUT_MEDIA_WIDTHS)}
                      sizes="72px"
                      alt=""
                      loading="lazy"
                      className="h-[4.25rem] w-[4.25rem] shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className={`flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full text-lg font-medium ${chrome.avatar}`}
                      aria-hidden
                    >
                      {(founderName || '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    {founderName ? (
                      <p className="text-base font-medium sm:text-[calc(1.0625rem*var(--pf-about-scale,1))]" style={{ color: presentation.founderNameColor }}>
                        {founderName}
                      </p>
                    ) : null}
                    {founderFunction ? (
                      <p className="mt-0.5 text-sm sm:text-[calc(15px*var(--pf-about-scale,1))]" style={{ color: presentation.founderFunctionColor }}>
                        {founderFunction}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {hasTextColumn ? (
            <div className={`min-w-0 ${textOrder}`}>
              {description ? (
                <p
                  className="max-w-[32rem] text-pretty text-lg font-normal leading-[1.55] sm:text-[calc(1.25rem*var(--pf-about-scale,1))]"
                  style={{ color: presentation.descriptionColor }}
                >
                  {description}
                </p>
              ) : null}

              {showTasks ? (
                <ol className={`${description ? 'mt-9 sm:mt-10' : ''}`}>
                  {tasks.map((task, index) => (
                    <li
                      key={`${index}-${task}`}
                      className={`flex items-baseline gap-5 border-b py-5 first:pt-0 last:border-b-0 sm:gap-6 sm:py-6 sm:first:pt-0 ${chrome.divider}`}
                    >
                      {numerals ? (
                        <span
                          className="w-7 shrink-0 text-[calc(14px*var(--pf-about-scale,1))] font-medium tabular-nums tracking-wide"
                          style={{ color: accent }}
                          aria-hidden
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="flex w-7 shrink-0 justify-start self-start pt-1.5">
                          <AboutUsTaskMarker presentation={presentation} index={index} />
                        </span>
                      )}
                      <span
                        className="min-w-0 text-xl font-normal leading-tight sm:text-[calc(1.5rem*var(--pf-about-scale,1))]"
                        style={{ color: presentation.taskColor }}
                      >
                        {task}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {presentation.showCta ? (
                <AboutUsCta
                  presentation={presentation}
                  label={ctaLabel}
                  linkProps={ctaLink}
                  className={description || showTasks ? 'mt-9 sm:mt-10' : ''}
                  solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
                  textClassName="text-[calc(1.0625rem*var(--pf-about-scale,1))]"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AboutUsMediaLeftSingleVisual({ src }: { src: string }) {
  return (
    <div className="h-full min-h-[22rem] overflow-hidden rounded-[1.75rem] lg:min-h-0 lg:rounded-[2rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)} sizes={ABOUT_MEDIA_SIZES} alt="" loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

function AboutUsMediaLeftVisual({ images, dark }: { images: string[]; dark: boolean }) {
  const front = images[0];
  const back = images[1];
  if (!front) return null;
  if (!back) return <AboutUsMediaLeftSingleVisual src={front} />;
  return <AboutUsSplitPairVisual front={front} back={back} dark={dark} />;
}

function AboutUsSplitMediaLeftDesign({
  aboutUs,
  presentation,
  sectionTitle,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const widthPercent = Math.min(100, Math.max(50, presentation.contentWidthPercent || 100));
  const hasImages = images.length > 0;
  const mediaLeft = aboutUsMediaIsLeft(presentation);

  return (
    <div className="space-y-12">
      <div
        className={`${aboutUsContentPlacementClass(presentation.contentPlacement)} w-full max-lg:!w-full`}
        style={{ width: `${widthPercent}%`, maxWidth: '100%' }}
      >
        <div
          className={`grid items-stretch gap-10 sm:gap-12 lg:gap-16 xl:gap-20 ${aboutUsSplitCols(
            hasImages,
            mediaLeft,
            'overlap'
          )}`}
        >
          {hasImages ? (
            <div className={`relative min-h-[22rem] lg:min-h-full ${aboutUsSplitOrderClass('media', mediaLeft)}`}>
              <div className="h-full min-h-[22rem] lg:absolute lg:inset-0">
                <AboutUsMediaLeftVisual images={images} dark={aboutUsIsDarkMode(presentation)} />
              </div>
            </div>
          ) : null}

          <div
            className={`${hasImages ? 'max-w-xl justify-self-start lg:max-w-[36rem]' : 'max-w-xl'} ${aboutUsSplitOrderClass('copy', mediaLeft)}`}
          >
            {eyebrow ? (
              <p
                className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[calc(2.05rem*var(--pf-about-scale,1))] font-semibold leading-[1.14] tracking-tight sm:text-[calc(2.55rem*var(--pf-about-scale,1))] lg:text-[calc(2.95rem*var(--pf-about-scale,1))] ${
                  eyebrow ? 'mt-4' : ''
                }`}
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              <p
                className={`max-w-[36rem] text-lg leading-[1.8] sm:text-[calc(1.2rem*var(--pf-about-scale,1))] ${title || eyebrow ? 'mt-6' : ''}`}
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {presentation.showTasks && tasks.length > 0 ? (
              <ul className={`max-w-[36rem] space-y-5 ${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}`}>
                {tasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[calc(1.2rem*var(--pf-about-scale,1))]"
                    style={{ color: presentation.taskColor }}
                  >
                    <AboutUsTaskMarker presentation={presentation} index={index} />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-10"
                solidClassName="inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold transition hover:opacity-90"
              />
            ) : null}
          </div>
        </div>
      </div>

      <AboutUsQuoteFounder
        quote={quote}
        founderName={founderName}
        founderFunction={founderFunction}
        founderLogo={founderLogo}
        presentation={presentation}
      />
    </div>
  );
}

function AboutUsFounderStars({ rating, dark }: { rating: number; dark: boolean }) {
  const t = useT();
  const value = Math.max(0, Math.min(5, rating));
  const chrome = aboutUsChrome(dark);
  return (
    <div className="flex shrink-0 items-center gap-0.5" role="img" aria-label={t('{toFixed} out of 5 stars', { toFixed: value.toFixed(1) })}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, value - index));
        return (
          <span key={index} className="relative inline-block h-6 w-6">
            <svg viewBox="0 0 20 20" className={`h-6 w-6 ${chrome.starEmpty}`} fill="currentColor" aria-hidden>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 20 20" className="h-6 w-6 text-amber-400" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function AboutUsFounderCard({
  name,
  role,
  photo,
  rating,
  showRating,
  nameColor,
  roleColor,
  dark,
}: {
  name: string;
  role: string;
  photo: string;
  /** A real rating only — absent, no stars are drawn. */
  rating?: number;
  showRating: boolean;
  nameColor: string;
  roleColor: string;
  dark: boolean;
}) {
  if (!name && !role && !photo) return null;
  const chrome = aboutUsChrome(dark);
  return (
    <div className={`mt-10 flex items-center gap-5 border-t pt-8 ${chrome.divider}`}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...mediaImageResponsive(photo, ABOUT_MEDIA_WIDTHS)} sizes={ABOUT_MEDIA_SIZES} alt="" loading="lazy" className="h-[5.75rem] w-[5.75rem] rounded-2xl object-cover" />
      ) : (
        <span
          className={`flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-2xl text-xl font-semibold ${chrome.founderAvatar}`}
          aria-hidden
        >
          {(name || '?').slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        {name ? (
          <p className="text-base font-bold tracking-tight sm:text-lg" style={{ color: nameColor }}>
            {name}
          </p>
        ) : null}
        {role ? (
          <p className="mt-0.5 text-sm sm:text-[calc(15px*var(--pf-about-scale,1))]" style={{ color: roleColor }}>
            {role}
          </p>
        ) : null}
      </div>
      {showRating && typeof rating === 'number' ? <AboutUsFounderStars rating={rating} dark={dark} /> : null}
    </div>
  );
}

function AboutUsFrameLayered({ src, flip = false, dark }: { src: string; flip?: boolean; dark: boolean }) {
  const chrome = aboutUsChrome(dark);
  return (
    <div className={`relative h-full min-h-[20rem] w-[82%] ${flip ? 'mr-auto' : 'ml-auto'}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute rounded-[1.85rem] border border-dashed ${chrome.hairlineMuted}`}
        style={flip ? { top: 0, left: 0, right: '10%', bottom: 0 } : { top: 0, right: 0, left: '10%', bottom: 0 }}
      />
      <div
        aria-hidden
        className={`absolute rounded-[1.7rem] ${chrome.slab}`}
        style={
          flip
            ? { right: 0, left: '10%', top: '8%', bottom: '14%' }
            : { left: 0, right: '10%', top: '8%', bottom: '14%' }
        }
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className={`absolute top-0 z-[1] h-full w-[90%] rounded-[1.7rem] object-cover ${flip ? 'left-0' : 'right-0'}`}
      />
    </div>
  );
}

function AboutUsFrameSlab({ src, dark }: { src: string; dark: boolean }) {
  const chrome = aboutUsChrome(dark);
  return (
    <div className="relative h-full min-h-[22rem] w-full">
      <div
        aria-hidden
        className={`absolute rounded-[1.85rem] ${chrome.slabStrong}`}
        style={{ left: 0, right: '10%', top: '14%', bottom: 0 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className="absolute z-[1] rounded-[1.75rem] object-cover"
        // Explicit size: offsets alone don't stretch a replaced element.
        style={{ left: '8%', top: 0, width: '92%', height: '90%' }}
      />
    </div>
  );
}

function AboutUsFrameDuo({ images, dark }: { images: string[]; dark: boolean }) {
  const primary = images[0];
  const secondary = images[1];
  if (!primary) return null;
  const chrome = aboutUsChrome(dark);
  return (
    <div className="relative h-full min-h-[22rem] w-full">
      {secondary ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...mediaImageResponsive(secondary, ABOUT_MEDIA_WIDTHS)}
          sizes={ABOUT_MEDIA_SIZES}
          alt=""
          loading="lazy"
          className="absolute right-0 top-0 z-[1] h-[46%] w-[44%] rounded-[1.6rem] object-cover"
        />
      ) : (
        <div
          aria-hidden
          className={`absolute right-0 top-0 h-[42%] w-[40%] rounded-[1.6rem] ${chrome.placeholder}`}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(primary, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 z-[2] h-[72%] w-[68%] rounded-[1.75rem] object-cover"
      />
    </div>
  );
}

function AboutUsFrameRing({ src, dark }: { src: string; dark: boolean }) {
  const chrome = aboutUsChrome(dark);
  return (
    <div className="relative h-full min-h-[22rem] w-full p-3 sm:p-4">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-[2.35rem] border-[1.5px] ${chrome.hairline}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute rounded-[2.1rem] border ${chrome.hairlineMuted}`}
        style={{ inset: '10px' }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
        sizes={ABOUT_MEDIA_SIZES}
        alt=""
        loading="lazy"
        className="relative z-[1] h-full w-full rounded-[1.85rem] object-cover"
      />
    </div>
  );
}

function AboutUsFounderMedia({
  images,
  frame,
  flip = false,
  dark,
}: {
  images: string[];
  frame: PortfolioAboutUsPresentationSettings['imageFrame'];
  flip?: boolean;
  dark: boolean;
}) {
  const src = images[0];
  if (!src) return null;
  if (frame === 'slab') return <AboutUsFrameSlab src={src} dark={dark} />;
  if (frame === 'duo') return <AboutUsFrameDuo images={images} dark={dark} />;
  if (frame === 'ring') return <AboutUsFrameRing src={src} dark={dark} />;
  return <AboutUsFrameLayered src={src} flip={flip} dark={dark} />;
}

function AboutUsSplitFounderDesign({
  aboutUs,
  presentation,
  sectionTitle,
  founderRating,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
  founderRating?: number;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const widthPercent = Math.min(100, Math.max(50, presentation.contentWidthPercent || 100));
  const hasImages = images.length > 0;
  const showTasks = presentation.showTasks && tasks.length > 0;
  const mediaLeft = aboutUsMediaIsLeft(presentation);

  return (
    <div
      className={`${aboutUsContentPlacementClass(presentation.contentPlacement)} w-full max-lg:!w-full`}
      style={{ width: `${widthPercent}%`, maxWidth: '100%' }}
    >
      <div
        className={`grid items-stretch gap-10 sm:gap-12 lg:gap-16 xl:gap-20 ${aboutUsSplitCols(
          hasImages,
          mediaLeft,
          'balanced'
        )}`}
      >
        <div className={`${hasImages ? 'max-w-xl lg:max-w-[36rem]' : 'max-w-xl'} ${aboutUsSplitOrderClass('copy', mediaLeft)}`}>
          {eyebrow ? (
            <p
              className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
          ) : null}

          {title ? (
            <h3
              className={`max-w-[13.5em] text-[calc(2.05rem*var(--pf-about-scale,1))] font-semibold leading-[1.14] tracking-tight sm:text-[calc(2.55rem*var(--pf-about-scale,1))] lg:text-[calc(2.95rem*var(--pf-about-scale,1))] ${
                eyebrow ? 'mt-4' : ''
              }`}
              style={{ color: presentation.titleColor } satisfies CSSProperties}
            >
              {title}
            </h3>
          ) : null}

          {description ? (
            <p
              className={`max-w-[36rem] text-lg leading-[1.8] sm:text-[calc(1.2rem*var(--pf-about-scale,1))] ${title || eyebrow ? 'mt-6' : ''}`}
              style={{ color: presentation.descriptionColor }}
            >
              {description}
            </p>
          ) : null}

          {showTasks ? (
            <ul className={`max-w-[36rem] space-y-5 ${description || title ? 'mt-8' : 'mt-8'}`}>
              {tasks.map((task, index) => (
                <li
                  key={`${index}-${task}`}
                  className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[calc(1.2rem*var(--pf-about-scale,1))]"
                  style={{ color: presentation.taskColor }}
                >
                  <AboutUsTaskMarker presentation={presentation} index={index} />
                  <span className="min-w-0">{task}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {presentation.showCta ? (
            <AboutUsCta
              presentation={presentation}
              label={ctaLabel}
              linkProps={ctaLink}
              className="mt-9"
              solidClassName="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
            />
          ) : null}

          {presentation.showFounder ? (
            <AboutUsFounderCard
              name={founderName}
              role={founderFunction}
              photo={founderLogo}
              rating={founderRating}
              showRating={presentation.showFounderRating}
              nameColor={presentation.founderNameColor}
              roleColor={presentation.founderFunctionColor}
              dark={aboutUsIsDarkMode(presentation)}
            />
          ) : null}
        </div>

        {hasImages ? (
          <div className={`h-full min-h-[20rem] ${aboutUsSplitOrderClass('media', mediaLeft)}`}>
            <AboutUsFounderMedia
              images={images}
              frame={presentation.imageFrame ?? 'layered'}
              flip={mediaLeft}
              dark={aboutUsIsDarkMode(presentation)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AboutUsSplitCardDesign({
  aboutUs,
  presentation,
  sectionTitle,
  founderRating,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
  founderRating?: number;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const widthPercent = Math.min(100, Math.max(50, presentation.contentWidthPercent || 100));
  const src = images[0];
  const mediaLeft = aboutUsMediaIsLeft(presentation);
  const showQuote = presentation.showQuote && Boolean(quote);
  const showTasks = presentation.showTasks && tasks.length > 0;

  return (
    <div
      className={`${aboutUsContentPlacementClass(presentation.contentPlacement)} w-full max-lg:!w-full`}
      style={{ width: `${widthPercent}%`, maxWidth: '100%' }}
    >
      <div
        className={`overflow-hidden ${aboutUsCardRadiusClass(presentation.cardRadius)} ${aboutUsCardShadowClass(presentation.cardShadow, aboutUsIsDarkMode(presentation))}`}
        style={{
          backgroundColor: aboutUsCardSurfaceColor(presentation),
          ...aboutUsCardBorderStyle(presentation.cardBorder, presentation.cardBorderColor),
        }}
      >
        <div className={`grid items-stretch ${src ? 'lg:grid-cols-2' : ''}`}>
          {src ? (
            <div className={`min-h-[18rem] sm:min-h-[22rem] lg:min-h-[28rem] ${aboutUsSplitOrderClass('media', mediaLeft)}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)} sizes={ABOUT_MEDIA_SIZES} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div
            className={`flex flex-col justify-center px-8 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16 ${aboutUsSplitOrderClass('copy', mediaLeft)}`}
          >
            {eyebrow ? (
              <p
                className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[calc(1.85rem*var(--pf-about-scale,1))] font-semibold leading-[1.18] tracking-tight sm:text-[calc(2.25rem*var(--pf-about-scale,1))] lg:text-[calc(2.55rem*var(--pf-about-scale,1))] ${
                  eyebrow ? 'mt-4' : ''
                }`}
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              <p
                className={`max-w-[34rem] text-base leading-[1.8] sm:text-lg ${title || eyebrow ? 'mt-5' : ''}`}
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {showQuote ? (
              <blockquote
                className={`max-w-[34rem] border-l-2 pl-4 text-base italic leading-relaxed sm:text-lg ${
                  description || title ? 'mt-6' : eyebrow ? 'mt-6' : ''
                }`}
                style={{ color: presentation.quoteColor, borderColor: accent }}
              >
                {quote}
              </blockquote>
            ) : null}

            {showTasks ? (
              <ul className={`max-w-[34rem] space-y-4 ${description || title || showQuote ? 'mt-7' : 'mt-7'}`}>
                {tasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3 text-base leading-relaxed sm:text-lg"
                    style={{ color: presentation.taskColor }}
                  >
                    <AboutUsTaskMarker presentation={presentation} index={index} />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <AboutUsCta
                presentation={presentation}
                label={ctaLabel}
                linkProps={ctaLink}
                className="mt-8"
                solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
              />
            ) : null}

            {presentation.showFounder ? (
              <AboutUsFounderCard
                name={founderName}
                role={founderFunction}
                photo={founderLogo}
                rating={founderRating}
                showRating={presentation.showFounderRating}
                nameColor={presentation.founderNameColor}
                roleColor={presentation.founderFunctionColor}
                dark={aboutUsIsDarkMode(presentation)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutUsStackedDesign({
  aboutUs,
  presentation,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
}) {
  const marker = resolveTaskListMarker(
    null,
    {
      taskBulletSource: 'section',
      taskBulletStyle: presentation.taskBulletStyle ?? 'disc',
      taskBulletColor: presentation.taskColor,
      taskBulletSize: 'md',
    },
    presentation.taskColor
  );
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';

  const manyTasks = tasks.length > 4;
  const hasQuoteBlock =
    (presentation.showQuote && Boolean(quote)) ||
    (presentation.showFounder && Boolean(founderName || founderFunction || founderLogo));
  const hasImages = images.length > 0;
  const [leadImage, ...restImages] = images;

  // Two columns from `lg` when there are images, so a wide canvas is used instead of leaving its
  // right half empty: copy + tasks top-left, the quote closing the left column at the foot of the
  // images, the images spanning the right column. Below `lg` the DOM order is the reading order
  // (copy, images, quote) in one column.
  const gridClass = hasImages
    ? 'grid gap-y-9 sm:gap-y-11 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-x-14 lg:gap-y-10 xl:gap-x-20'
    : 'space-y-9 sm:space-y-11 lg:space-y-12';

  return (
    <div className={gridClass}>
      <div className="space-y-9 sm:space-y-11 lg:col-start-1 lg:row-start-1 lg:self-start lg:space-y-10">
        {title || description ? (
          // Title + paragraph read as one unit (tight); the blocks after it get a larger step.
          <div className="space-y-4 sm:space-y-5">
            {title ? (
              <h3
                className="max-w-3xl text-balance text-[calc(1.75rem*var(--pf-about-scale,1))] font-semibold leading-[1.15] tracking-tight sm:text-4xl sm:leading-[1.15] lg:text-[calc(2.5rem*var(--pf-about-scale,1))] lg:leading-[1.1]"
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              // ~62–68 characters per line at every size: past that the eye loses its place.
              <p
                className="max-w-[40rem] text-pretty text-base leading-[1.7] sm:text-lg"
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        {presentation.showTasks && tasks.length > 0 ? (
          <ul
            className={`space-y-3 ${
              manyTasks ? 'max-w-3xl md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-3 md:space-y-0' : 'max-w-2xl'
            }`}
          >
            {tasks.map((task, index) => (
              <li
                key={`${index}-${task}`}
                className="flex gap-3 text-[calc(15px*var(--pf-about-scale,1))] leading-relaxed sm:text-base"
                style={{ color: presentation.taskColor }}
              >
                <PortfolioListMarker
                  style={marker.style}
                  color={marker.color}
                  index={index}
                  size={marker.size}
                  sizePx={marker.sizePx}
                  weight={marker.weight}
                  weightAmount={marker.weightAmount}
                />
                <span className="min-w-0">{task}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {hasImages ? (
        // Mosaic: one lead image at full width, any others in pairs beneath it. A lone image keeps
        // a 4:3 frame; with company it goes flatter so the stack stays compact.
        <div
          className={`grid gap-3 sm:gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 ${
            images.length === 2 ? 'sm:grid-cols-2 lg:grid-cols-1' : ''
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={leadImage}
            {...mediaImageResponsive(leadImage, ABOUT_MEDIA_WIDTHS)}
            sizes={images.length === 2 ? '(min-width: 1024px) 50vw, (min-width: 640px) 45vw, 90vw' : '(min-width: 1024px) 50vw, 90vw'}
            alt=""
            loading="lazy"
            className={`w-full rounded-2xl object-cover ${
              images.length === 2
                ? 'aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10]'
                : restImages.length > 0
                  ? 'aspect-[16/10] sm:aspect-[2/1] lg:aspect-[16/10]'
                  : 'aspect-[4/3] lg:aspect-[5/4]'
            }`}
          />
          {restImages.length > 0 ? (
            <div
              className={`grid gap-3 sm:gap-4 ${restImages.length === 1 ? '' : 'grid-cols-1 sm:grid-cols-2'}`}
            >
              {restImages.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
                  alt=""
                  loading="lazy"
                  className={`w-full rounded-2xl object-cover ${
                    images.length === 2 ? 'aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[4/3]'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasQuoteBlock ? (
        <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
          <AboutUsQuoteFounder
            quote={quote}
            founderName={founderName}
            founderFunction={founderFunction}
            founderLogo={founderLogo}
            presentation={presentation}
            large
          />
        </div>
      ) : null}
    </div>
  );
}

function AboutUsQuoteMark({ color }: { color: string }) {
  return (
    <span
      className="absolute -top-5 left-6 z-[1] inline-flex h-11 w-11 items-center justify-center rounded-full shadow-xs"
      style={{ backgroundColor: color, color: aboutUsReadableInk(color) }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M7.17 18c-1.66 0-3-1.36-3-3.18 0-2.62 2.08-5.4 5.3-7.22l.82 1.24C8.4 10.2 7.17 12 7.17 13.38c.48-.3 1.08-.42 1.7-.42 1.54 0 2.78 1.12 2.78 2.72S10.41 18 8.87 18H7.17zm8.36 0c-1.66 0-3-1.36-3-3.18 0-2.62 2.08-5.4 5.3-7.22l.82 1.24c-1.89 1.36-3.12 3.16-3.12 4.54.48-.3 1.08-.42 1.7-.42 1.54 0 2.78 1.12 2.78 2.72S18.77 18 17.23 18h-1.7z" />
      </svg>
    </span>
  );
}

function AboutUsQuoteSvgFigure({
  presentation,
  mediaLeft,
}: {
  presentation: PortfolioAboutUsPresentationSettings;
  mediaLeft: boolean;
}) {
  const dark = aboutUsIsDarkMode(presentation);
  const id = isAboutUsQuoteSvgId(presentation.quoteSvgId) ? presentation.quoteSvgId : 'globe';
  const urls = presentation.quoteSvgUrls ?? DEFAULT_ABOUT_US_QUOTE_SVG_URLS;
  const custom = (urls[quoteSvgSlotIndex(id)] ?? '').trim();
  const fill = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.045)';
  const border = dark ? 'rgba(255,255,255,0.14)' : presentation.cardBorderColor || '#e5e7eb';
  const ink = presentation.titleColor;
  const hole = dark ? '#0b1220' : '#ffffff';

  return (
    <div
      className={`min-h-[22rem] overflow-hidden rounded-[1.75rem] border lg:min-h-[28rem] lg:rounded-[2rem] ${aboutUsSplitOrderClass('media', mediaLeft)}`}
      style={{
        backgroundColor: fill,
        borderColor: border,
        color: presentation.accentColor,
        ['--about-us-ink' as string]: ink,
        ['--about-us-surface' as string]: hole,
      }}
    >
      {custom ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...mediaImageResponsive(custom, ABOUT_MEDIA_WIDTHS)} sizes={ABOUT_MEDIA_SIZES} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[22rem] w-full items-center justify-center p-8 sm:p-10 lg:min-h-[28rem] lg:p-12">
          <AboutUsQuoteSvg id={id} className="max-h-[22rem]" />
        </div>
      )}
    </div>
  );
}

function AboutUsSplitQuoteDesign({
  aboutUs,
  presentation,
  sectionTitle,
  sectionSubtitle,
  founderRating,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
  sectionSubtitle: string;
  founderRating?: number;
}) {
  const t = useT();
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const kicker =
    sectionSubtitle.trim() && sectionSubtitle.trim() !== DEFAULT_ABOUT_US_SUBTITLE
      ? sectionSubtitle.trim()
      : '';
  const ctaLabel = presentation.ctaLabel.trim() || t('Contact');
  const ctaLink = useAboutUsCtaLinkProps();
  const accent = presentation.accentColor;
  const widthPercent = Math.min(100, Math.max(50, presentation.contentWidthPercent || 100));
  const images = filledImages(aboutUs.imageUrls);
  const src = images[0];
  const useSvgMedia = presentation.quoteMedia !== 'image';
  const hasMedia = useSvgMedia || Boolean(src);
  const mediaLeft = aboutUsMediaIsLeft(presentation);
  const dark = aboutUsIsDarkMode(presentation);
  const showQuote = presentation.showQuote && Boolean(quote);
  const showTasks = presentation.showTasks && tasks.length > 0;
  const quoteCardStyle = {
    backgroundColor:
      presentation.cardBackgroundEnabled === false
        ? 'transparent'
        : aboutUsCardSurfaceColor(presentation),
    ...aboutUsCardBorderStyle(presentation.cardBorder, presentation.cardBorderColor),
  } satisfies CSSProperties;

  return (
    <div
      className={`${aboutUsContentPlacementClass(presentation.contentPlacement)} w-full max-lg:!w-full`}
      style={{ width: `${widthPercent}%`, maxWidth: '100%' }}
    >
      <div
        className={`grid items-center gap-10 sm:gap-12 lg:gap-16 xl:gap-20 ${aboutUsSplitCols(
          hasMedia,
          mediaLeft,
          'balanced'
        )}`}
      >
        <div className={`${hasMedia ? 'max-w-xl lg:max-w-[36rem]' : 'max-w-xl'} ${aboutUsSplitOrderClass('copy', mediaLeft)}`}>
          {eyebrow ? (
            <p
              className="text-[calc(13px*var(--pf-about-scale,1))] font-bold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
          ) : null}

          {title ? (
            <h3
              className={`max-w-[14em] text-[calc(2.05rem*var(--pf-about-scale,1))] font-semibold leading-[1.14] tracking-tight sm:text-[calc(2.45rem*var(--pf-about-scale,1))] lg:text-[calc(2.75rem*var(--pf-about-scale,1))] ${
                eyebrow ? 'mt-6' : ''
              }`}
              style={{ color: presentation.titleColor }}
            >
              {title}
            </h3>
          ) : null}

          {kicker ? (
            <p
              className={`text-lg font-medium tracking-tight sm:text-xl ${title || eyebrow ? 'mt-8' : ''}`}
              style={{ color: presentation.titleColor, fontWeight: 500 }}
            >
              {kicker}
            </p>
          ) : null}

          {description ? (
            <p
              className={`max-w-[34rem] text-base leading-[1.8] sm:text-lg ${
                kicker ? 'mt-3' : title || eyebrow ? 'mt-8' : ''
              }`}
              style={{ color: presentation.descriptionColor }}
            >
              {description}
            </p>
          ) : null}

          {showTasks ? (
            <ul className={`max-w-[34rem] space-y-5 ${description || kicker || title ? 'mt-10' : 'mt-10'}`}>
              {tasks.map((task, index) => (
                <li
                  key={`${index}-${task}`}
                  className="flex items-start gap-3 text-base leading-relaxed sm:text-lg"
                  style={{ color: presentation.taskColor }}
                >
                  <AboutUsTaskMarker presentation={presentation} index={index} />
                  <span className="min-w-0">{task}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {presentation.showCta ? (
            <AboutUsCta
              presentation={presentation}
              label={ctaLabel}
              linkProps={ctaLink}
              className="mt-10"
              solidClassName="inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold transition hover:opacity-90"
            />
          ) : null}

          {showQuote ? (
            <blockquote className={`relative ${description || kicker || title || showTasks ? 'mt-14 sm:mt-16' : 'mt-10'}`}>
              <AboutUsQuoteMark color={accent} />
              <div
                className={`px-7 pb-8 pt-10 sm:px-8 ${aboutUsCardRadiusClass(presentation.cardRadius)} ${aboutUsCardShadowClass(presentation.cardShadow, dark)}`}
                style={quoteCardStyle}
              >
                <p
                  className="text-base italic leading-relaxed sm:text-lg"
                  style={{ color: presentation.quoteColor }}
                >
                  {quote}
                </p>
              </div>
            </blockquote>
          ) : null}

          {presentation.showFounder ? (
            <AboutUsFounderCard
              name={founderName}
              role={founderFunction}
              photo={founderLogo}
              rating={founderRating}
              showRating={false}
              nameColor={presentation.founderNameColor}
              roleColor={presentation.founderFunctionColor}
              dark={dark}
            />
          ) : null}
        </div>

        {useSvgMedia ? (
          <AboutUsQuoteSvgFigure presentation={presentation} mediaLeft={mediaLeft} />
        ) : src ? (
          <div className={`min-h-[22rem] lg:min-h-[28rem] ${aboutUsSplitOrderClass('media', mediaLeft)}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...mediaImageResponsive(src, ABOUT_MEDIA_WIDTHS)}
              sizes={ABOUT_MEDIA_SIZES}
              alt=""
              loading="lazy"
              className="h-full w-full rounded-[1.75rem] object-cover lg:rounded-[2rem]"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EditorialAboutUsSection(props: EditorialAboutUsSectionProps) {
  return (
    <div
      className="pf-about-scale"
      style={{ '--pf-about-scale': aboutUsTextScale(props.presentation.textSize) } as CSSProperties}
    >
      <AboutUsDesignSwitch {...props} />
    </div>
  );
}

type EditorialAboutUsSectionProps = {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle?: string;
  sectionSubtitle?: string;
  founderRating?: number;
  ctaHref?: string;
  onCtaNavigate?: (href: string) => void;
};

function AboutUsDesignSwitch({
  aboutUs,
  presentation,
  sectionTitle = '',
  sectionSubtitle = '',
  founderRating,
  ctaHref = '#contact',
  onCtaNavigate,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle?: string;
  sectionSubtitle?: string;
  /** The founder's star rating. Nothing records one yet, so no caller passes it — and the stars
   *  stay off rather than showing visitors an invented score. */
  founderRating?: number;
  /** Resolved Contact target (see `AboutUsCtaContext`). */
  ctaHref?: string;
  onCtaNavigate?: (href: string) => void;
}) {
  return (
    <AboutUsCtaContext.Provider value={{ href: ctaHref, onNavigate: onCtaNavigate }}>
      <AboutUsDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        founderRating={founderRating}
      />
    </AboutUsCtaContext.Provider>
  );
}

function AboutUsDesign({
  aboutUs,
  presentation,
  sectionTitle,
  sectionSubtitle,
  founderRating,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle: string;
  sectionSubtitle: string;
  founderRating?: number;
}) {
  if (presentation.design === 'split-overlap') {
    return (
      <AboutUsSplitOverlapDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
      />
    );
  }

  if (presentation.design === 'split-media-left') {
    return (
      <AboutUsSplitMediaLeftDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
      />
    );
  }

  if (presentation.design === 'split-founder') {
    return (
      <AboutUsSplitFounderDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        founderRating={founderRating}
      />
    );
  }

  if (presentation.design === 'split-card') {
    return (
      <AboutUsSplitCardDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        founderRating={founderRating}
      />
    );
  }

  if (presentation.design === 'editorial') {
    return (
      <AboutUsEditorialDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
      />
    );
  }

  if (presentation.design === 'split-quote') {
    return (
      <AboutUsSplitQuoteDesign
        aboutUs={aboutUs}
        presentation={presentation}
        sectionTitle={sectionTitle}
        sectionSubtitle={sectionSubtitle}
        founderRating={founderRating}
      />
    );
  }

  return <AboutUsStackedDesign aboutUs={aboutUs} presentation={presentation} />;
}
