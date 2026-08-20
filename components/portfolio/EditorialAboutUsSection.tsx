'use client';

import type { CSSProperties } from 'react';
import type { ProfileAboutUs } from '@/types/ecosystem';
import {
  aboutUsCardBorderStyle,
  aboutUsCardRadiusClass,
  aboutUsCardShadowClass,
  aboutUsCardSurfaceColor,
  aboutUsChrome,
  aboutUsContentPlacementClass,
  aboutUsIsDarkMode,
  DEFAULT_ABOUT_US_SUBTITLE,
  resolveAboutUsMediaSide,
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
import { usePortfolioTaskListMarkerGlobal } from '@/components/portfolio/portfolio-task-list-marker-context';

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

function AboutUsAccentCheck({ color }: { color: string }) {
  return (
    <span
      className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center"
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
}: {
  quote: string;
  founderName: string;
  founderFunction: string;
  founderLogo: string;
  presentation: PortfolioAboutUsPresentationSettings;
}) {
  const showQuote = presentation.showQuote && Boolean(quote);
  const showFounder = presentation.showFounder && Boolean(founderName || founderFunction || founderLogo);
  if (!showQuote && !showFounder) return null;

  return (
    <div className="space-y-6">
      {showQuote ? (
        <blockquote
          className="max-w-2xl border-l-2 pl-5 text-lg font-medium italic leading-relaxed sm:text-xl"
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
              src={founderLogo}
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
              <p className="text-base font-semibold" style={{ color: presentation.founderNameColor }}>
                {founderName}
              </p>
            ) : null}
            {founderFunction ? (
              <p className="text-sm" style={{ color: presentation.founderFunctionColor }}>
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
        src={src}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 top-[5%] z-[1] w-[86%] rounded-[1.75rem] object-cover sm:w-[88%]"
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
        src={back}
        alt=""
        loading="lazy"
        className="absolute right-0 top-0 z-[1] h-[48%] w-[40%] rounded-[1.7rem] object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={front}
        alt=""
        loading="lazy"
        className="absolute bottom-0 left-0 z-[2] h-[52%] w-[48%] rounded-[1.7rem] object-cover"
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
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || 'Contact';
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
          <div className={`${hasImages ? 'max-w-xl lg:max-w-[36rem]' : 'max-w-xl'} ${aboutUsSplitOrderClass('copy', mediaLeft)}`}>
            {eyebrow ? (
              <p
                className="text-[13px] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[2.05rem] font-semibold leading-[1.14] tracking-tight sm:text-[2.55rem] lg:text-[2.95rem] ${
                  eyebrow ? 'mt-4' : ''
                }`}
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              <p
                className={`max-w-[36rem] text-lg leading-[1.8] sm:text-[1.2rem] ${title || eyebrow ? 'mt-6' : ''}`}
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {tasks.length > 0 ? (
              <ul className={`max-w-[36rem] space-y-5 ${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}`}>
                {tasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[1.2rem]"
                    style={{ color: presentation.taskColor }}
                  >
                    <AboutUsAccentCheck color={accent} />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <a
                href="#contact"
                className="mt-10 inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {ctaLabel}
              </a>
            ) : null}
          </div>

          {hasImages ? (
            <div className={`relative min-h-[22rem] lg:min-h-full ${aboutUsSplitOrderClass('media', mediaLeft)}`}>
              <div className="h-full min-h-[22rem] lg:absolute lg:inset-0">
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

function AboutUsMediaLeftSingleVisual({ src }: { src: string }) {
  return (
    <div className="h-full min-h-[22rem] overflow-hidden rounded-[1.75rem] lg:min-h-0 lg:rounded-[2rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
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
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || 'Contact';
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
                className="text-[13px] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[2.05rem] font-semibold leading-[1.14] tracking-tight sm:text-[2.55rem] lg:text-[2.95rem] ${
                  eyebrow ? 'mt-4' : ''
                }`}
                style={{ color: presentation.titleColor } satisfies CSSProperties}
              >
                {title}
              </h3>
            ) : null}

            {description ? (
              <p
                className={`max-w-[36rem] text-lg leading-[1.8] sm:text-[1.2rem] ${title || eyebrow ? 'mt-6' : ''}`}
                style={{ color: presentation.descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {tasks.length > 0 ? (
              <ul className={`max-w-[36rem] space-y-5 ${description || title ? 'mt-8' : eyebrow ? 'mt-8' : ''}`}>
                {tasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[1.2rem]"
                    style={{ color: presentation.taskColor }}
                  >
                    <AboutUsAccentCheck color={accent} />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <a
                href="#contact"
                className="mt-10 inline-flex items-center justify-center rounded-full px-9 py-4 text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {ctaLabel}
              </a>
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
  const value = Math.max(0, Math.min(5, rating));
  const chrome = aboutUsChrome(dark);
  return (
    <div className="flex shrink-0 items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
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
  rating: number;
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
        <img src={photo} alt="" loading="lazy" className="h-[5.75rem] w-[5.75rem] rounded-2xl object-cover" />
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
          <p className="mt-0.5 text-sm sm:text-[15px]" style={{ color: roleColor }}>
            {role}
          </p>
        ) : null}
      </div>
      {showRating ? <AboutUsFounderStars rating={rating} dark={dark} /> : null}
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
        src={src}
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
        src={src}
        alt=""
        loading="lazy"
        className="absolute z-[1] rounded-[1.75rem] object-cover"
        style={{ left: '8%', right: 0, top: 0, bottom: '10%' }}
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
          src={secondary}
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
        src={primary}
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
        src={src}
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
  founderRating: number;
}) {
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || 'Contact';
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
              className="text-[13px] font-bold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
          ) : null}

          {title ? (
            <h3
              className={`max-w-[13.5em] text-[2.05rem] font-semibold leading-[1.14] tracking-tight sm:text-[2.55rem] lg:text-[2.95rem] ${
                eyebrow ? 'mt-4' : ''
              }`}
              style={{ color: presentation.titleColor } satisfies CSSProperties}
            >
              {title}
            </h3>
          ) : null}

          {description ? (
            <p
              className={`max-w-[36rem] text-lg leading-[1.8] sm:text-[1.2rem] ${title || eyebrow ? 'mt-6' : ''}`}
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
                  className="flex items-start gap-3.5 text-lg leading-relaxed sm:text-[1.2rem]"
                  style={{ color: presentation.taskColor }}
                >
                  <AboutUsAccentCheck color={accent} />
                  <span className="min-w-0">{task}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {presentation.showCta ? (
            <a
              href="#contact"
              className="mt-9 inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {ctaLabel}
            </a>
          ) : null}

          {presentation.showFounder ? (
            <AboutUsFounderCard
              name={founderName}
              role={founderFunction}
              photo={founderLogo}
              rating={founderRating || 4.5}
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
  founderRating: number;
}) {
  const title = aboutUs.title?.trim() ?? '';
  const description = aboutUs.description?.trim() ?? '';
  const tasks = (aboutUs.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const images = filledImages(aboutUs.imageUrls);
  const quote = aboutUs.quote?.trim() ?? '';
  const founderName = aboutUs.founder?.name?.trim() ?? '';
  const founderFunction = aboutUs.founder?.function?.trim() ?? '';
  const founderLogo = aboutUs.founder?.logoUrl?.trim() ?? '';
  const eyebrow = sectionTitle.trim();
  const ctaLabel = presentation.ctaLabel.trim() || 'Contact';
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
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div
            className={`flex flex-col justify-center px-8 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16 ${aboutUsSplitOrderClass('copy', mediaLeft)}`}
          >
            {eyebrow ? (
              <p
                className="text-[13px] font-bold uppercase tracking-[0.18em] sm:text-sm"
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            ) : null}

            {title ? (
              <h3
                className={`max-w-[13.5em] text-[1.85rem] font-semibold leading-[1.18] tracking-tight sm:text-[2.25rem] lg:text-[2.55rem] ${
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
                    <AboutUsAccentCheck color={accent} />
                    <span className="min-w-0">{task}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {presentation.showCta ? (
              <a
                href="#contact"
                className="mt-8 inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {ctaLabel}
              </a>
            ) : null}

            {presentation.showFounder ? (
              <AboutUsFounderCard
                name={founderName}
                role={founderFunction}
                photo={founderLogo}
                rating={founderRating || 4.5}
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
    usePortfolioTaskListMarkerGlobal(),
    {
      taskBulletSource: 'global',
      taskBulletStyle: 'disc',
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

  return (
    <div className="space-y-8 sm:space-y-10">
      {title ? (
        <h3
          className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: presentation.titleColor } satisfies CSSProperties}
        >
          {title}
        </h3>
      ) : null}

      {description ? (
        <p
          className="max-w-3xl text-base leading-relaxed sm:text-lg"
          style={{ color: presentation.descriptionColor }}
        >
          {description}
        </p>
      ) : null}

      {tasks.length > 0 ? (
        <ul className="max-w-2xl space-y-3">
          {tasks.map((task, index) => (
            <li
              key={`${index}-${task}`}
              className="flex gap-3 text-sm leading-relaxed sm:text-base"
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

      {images.length > 0 ? (
        <div className={`grid gap-4 ${images.length > 1 ? 'sm:grid-cols-2' : 'max-w-xl'}`}>
          {images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      ) : null}

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

function AboutUsQuoteMark({ color }: { color: string }) {
  return (
    <span
      className="absolute -top-5 left-6 z-[1] inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm"
      style={{ backgroundColor: color }}
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
        <img src={custom} alt="" loading="lazy" className="h-full w-full object-cover" />
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
  founderRating: number;
}) {
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
  const ctaLabel = presentation.ctaLabel.trim() || 'Contact';
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
              className="text-[13px] font-bold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: accent }}
            >
              {eyebrow}
            </p>
          ) : null}

          {title ? (
            <h3
              className={`max-w-[14em] text-[2.05rem] font-semibold leading-[1.14] tracking-tight sm:text-[2.45rem] lg:text-[2.75rem] ${
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
                  <AboutUsAccentCheck color={accent} />
                  <span className="min-w-0">{task}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {presentation.showCta ? (
            <a
              href="#contact"
              className="mt-10 inline-flex w-fit items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {ctaLabel}
            </a>
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
              rating={founderRating || 4.5}
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
              src={src}
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

export function EditorialAboutUsSection({
  aboutUs,
  presentation,
  sectionTitle = '',
  sectionSubtitle = '',
  founderRating = 4.5,
}: {
  aboutUs: ProfileAboutUs;
  presentation: PortfolioAboutUsPresentationSettings;
  sectionTitle?: string;
  sectionSubtitle?: string;
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
