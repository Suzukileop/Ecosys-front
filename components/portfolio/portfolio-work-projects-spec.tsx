'use client';
import { workButtonColor } from './portfolio-work-button-color';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type RefObject,
} from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
  workPaletteTokenColor,
} from '@/components/portfolio/portfolio-work-settings';
import { WorkConsultButtonLink } from '@/components/portfolio/portfolio-work-consult-link';
import { aboutBannerScrollParent } from '@/components/portfolio/portfolio-about-scroll-utils';
import { useT } from '@/lib/i18n/I18nProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SPEC_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Varied, non-repeating rhythm for the asymmetric left-offset (desktop only). */
const SPEC_SHIFT_PATTERN = [0, 9, 3, 12, 6];
function specShiftVw(index: number): number {
  return SPEC_SHIFT_PATTERN[index % SPEC_SHIFT_PATTERN.length];
}

const SPEC_MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  .pf-work-spec-sheet,
  .pf-work-spec-header {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .pf-work-spec [data-spec-title],
  .pf-work-spec [data-spec-body],
  .pf-work-spec [data-spec-index],
  .pf-work-spec [data-spec-media],
  .pf-work-spec-title-inner {
    opacity: 1 !important;
    transform: none !important;
  }
  .pf-work-spec-rule {
    width: min(44%, 12rem) !important;
    transition: none !important;
  }
  .pf-work-spec-preview {
    display: none !important;
  }
}
/* Everything below this line is a static/idle state only — GSAP (see
   useSpecChoreography, SpecHoverPreview) owns every
   transition: scroll reveal, scrub parallax, hover image and focus/blur. No CSS transitions compete with GSAP's per-frame writes. */
.pf-work-spec-rule {
  width: min(44%, 12rem);
  opacity: 0.22;
  transition: width 0.55s ${SPEC_EASE}, opacity 0.55s ${SPEC_EASE};
}
.pf-work-spec-sheet:hover .pf-work-spec-rule,
.pf-work-spec-sheet:focus-within .pf-work-spec-rule {
  width: min(78%, 20rem);
  opacity: 0.4;
}
/* Title mask — GSAP sets the inner span's initial yPercent and reveals it;
   this just clips it so the text is invisible until then. */
.pf-work-spec-title-mask {
  display: block;
  overflow: hidden;
}
.pf-work-spec-title-inner {
  display: block;
}
.pf-work-spec-title-hit {
  cursor: pointer;
}
/* Asymmetric rhythm — desktop only, single-column mode. */
@media (min-width: 1024px) {
  .pf-work-spec-sheet[data-spec-shifted='true'] {
    margin-left: calc(var(--spec-shift, 0) * 1vw);
  }
}
/* Hover image reveal — static box model only; GSAP drives position + entrance. */
.pf-work-spec-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  z-index: 50;
}
.pf-work-spec-preview-inner {
  position: absolute;
  top: -5.5rem;
  left: 1.75rem;
  width: 15rem;
  height: 10rem;
  overflow: hidden;
  opacity: 0;
  will-change: transform, opacity, filter;
}
.pf-work-spec-preview-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (pointer: coarse) {
  .pf-work-spec-preview {
    display: none;
  }
}
`;

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  if (item.genre?.trim()) return item.genre.trim();
  return '';
}

function formatSpecIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function SpecThumbnail({
  url,
  alt,
  surface,
  compact,
}: {
  url: string;
  alt: string;
  surface: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${
        compact ? 'aspect-[4/5] max-h-56 sm:max-h-64' : 'aspect-[4/5] sm:aspect-[3/4]'
      }`}
      style={{ backgroundColor: surface }}
    >
      <Image
        src={url}
        alt={alt}
        fill
        sizes={compact ? '(max-width: 1024px) 40vw, 18vw' : '(max-width: 768px) 100vw, 28vw'}
        className="object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/sheet:scale-[1.03]"
        data-pf-no-color-transition=""
      />
    </div>
  );
}

/** "Field labels" setting — micro label above the Stack / Summary rows. */
function SpecFieldLabel({ children, ink }: { children: string; ink: string }) {
  return (
    <p
      className="mb-2 font-mono text-[11px] font-normal uppercase tracking-[0.14em] sm:text-[12px]"
      style={{ color: ink, opacity: 0.8 }}
    >
      {children}
    </p>
  );
}

function SpecStack({ tools, ink }: { tools: string[]; ink: string }) {
  const t = useT();
  return (
    <ul className="flex flex-wrap items-baseline" aria-label={t('Stack')}>
      {tools.map((tool, toolIndex) => (
        <li
          key={tool}
          className="flex items-baseline text-[12px] font-normal uppercase tracking-[0.08em] sm:text-[12.5px]"
          style={{ color: ink, opacity: 0.9 }}
        >
          {toolIndex > 0 ? (
            <span className="mx-2 select-none opacity-60" aria-hidden>
              /
            </span>
          ) : null}
          {tool}
        </li>
      ))}
    </ul>
  );
}

/**
 * Floating hover-image preview — a single shared element per gallery that lags
 * gently behind the cursor (exponential smoothing, not a CSS transition, so its
 * motion never fights the per-frame position writes). Shown only while hovering
 * a `[data-spec-hover-src]` title. No-ops on touch / reduced-motion.
 */
function SpecHoverPreview({ galleryRef }: { galleryRef: RefObject<HTMLElement | null> }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const root = galleryRef.current;
    const anchor = anchorRef.current;
    const inner = innerRef.current;
    const img = imgRef.current;
    if (!root || !anchor || !inner || !img) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    // Mouse tracking with inertia — GSAP's cached `quickTo` setters. This is the
    // cheapest possible way to chase the pointer every frame: it only ever
    // touches `x`/`y`, so it can never collide with (or slow down) scrolling.
    const followX = gsap.quickTo(anchor, 'x', { duration: 0.55, ease: 'power3' });
    const followY = gsap.quickTo(anchor, 'y', { duration: 0.55, ease: 'power3' });
    const onMove = (event: PointerEvent) => {
      followX(event.clientX);
      followY(event.clientY);
    };

    // Entrance impact — opacity + micro-stretch + shear, settling instantly
    // to rest with power3.out. Replayed from 0 on every fresh hover.
    const revealTl = gsap.timeline({ paused: true }).fromTo(
      inner,
      { autoAlpha: 0, scale: 1.32, skewX: -8, rotate: -3 },
      { autoAlpha: 1, scale: 1, skewX: 0, rotate: 0, duration: 0.5, ease: 'power3.out' }
    );

    const hits = Array.from(root.querySelectorAll<HTMLElement>('[data-spec-title-hit]'));
    const titleEls = Array.from(root.querySelectorAll<HTMLElement>('[data-spec-title-text]'));

    // Preserve the configured title color in both light and dark themes.
    // Only opacity and blur isolate the active project.
    const onEnter = (hit: HTMLElement) => {
      const src = hit.dataset.specHoverSrc;
      if (src) {
        img.src = src;
        revealTl.play(0);
      }
      const hoveredText = hit.querySelector<HTMLElement>('[data-spec-title-text]');
      titleEls.forEach((el) => {
        if (el === hoveredText) {
          gsap.to(el, { opacity: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        } else {
          gsap.to(el, {
            opacity: 0.1,
            filter: 'blur(1px)',
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const onLeave = () => {
      revealTl.reverse();
      titleEls.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    const enterHandlers = hits.map((el) => {
      const enter = () => onEnter(el);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', onLeave);
      return enter;
    });

    root.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      root.removeEventListener('pointermove', onMove);
      hits.forEach((el, i) => {
        el.removeEventListener('pointerenter', enterHandlers[i]);
        el.removeEventListener('pointerleave', onLeave);
      });
      revealTl.kill();
      gsap.killTweensOf(titleEls);
    };
  }, [galleryRef]);

  return (
    <div ref={anchorRef} className="pf-work-spec-preview" aria-hidden>
      <div ref={innerRef} className="pf-work-spec-preview-inner">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative cursor-follower, src swapped imperatively per hover */}
        <img ref={imgRef} alt="" className="pf-work-spec-preview-img" />
      </div>
    </div>
  );
}

function SpecSheet({
  item,
  index,
  presentation,
  settings,
  compactTitle = false,
  applyShift = false,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsSpecSettings;
  /** When 2-up on large screens — smaller project title. */
  compactTitle?: boolean;
  /** Desktop-only asymmetric left offset — single-column mode only. */
  applyShift?: boolean;
}) {
  const t = useT();
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted =
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    presentation.titleColor;
  const rule = presentation.cardBorderColor || muted || ink;
  const valueInk =
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    muted;
  const surface =
    presentation.cardBackgroundColor ||
    presentation.toolsIconBackgroundColor ||
    '#fafafa';
  const stackInk = presentation.elementStyles?.toolsList?.color || muted;
  const tagSurface = presentation.cardBorderColor || rule;

  const title = item.title?.trim() || t('Untitled');
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = settings.showThumbnail === true && Boolean(mediaUrl);
  const showHoverPreview = !showThumb && Boolean(mediaUrl);

  const showRole = settings.showRole !== false && Boolean(role);
  const showCategory = settings.showCategory !== false && Boolean(category);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || t('Consult this project');
  const showFieldLabels = settings.showFieldLabels !== false;
  const descriptionLabel = settings.descriptionLabel?.trim() || t('Summary');
  const stackLabel = settings.stackLabel?.trim() || t('Stack');
  const consultStyle = settings.consultDesign ?? 'underline';
  const sheetFrame = settings.sheetFrame ?? 'none';
  const framed = sheetFrame !== 'none';
  const specColor = (token: 'principal' | 'secondaire' | 'texteFort' | 'muted') =>
    token === 'muted' ? muted : workPaletteTokenColor(token);
  const percentMix = (color: string, percent: number) =>
    percent >= 100 ? color : `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  const frameColorSetting = settings.frameColor ?? 'auto';
  const frameBorderBase =
    frameColorSetting === 'auto' ? (sheetFrame === 'accent' ? accent : rule) : specColor(frameColorSetting);
  const frameBorderColor = percentMix(frameBorderBase, settings.frameOpacity ?? 100);
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;
  const frameFillSetting = settings.frameFill ?? 'none';
  const frameFillColor =
    frameFillSetting === 'none' ? undefined : percentMix(specColor(frameFillSetting), settings.frameFillOpacity ?? 8);
  const padded = framed || frameFillColor !== undefined;
  const categoryInk =
    !settings.categoryColor || settings.categoryColor === 'muted' ? muted : workPaletteTokenColor(settings.categoryColor);
  // Category and role share one colour.
  const roleInk = categoryInk;

  const titleFontSize = showThumb
    ? 'clamp(1.55rem, 2.35vw, 2.2rem)'
    : compactTitle
      ? 'clamp(1.4rem, 2vw, 1.9rem)'
      : 'clamp(2.15rem, 4.6vw, 3.6rem)';

  const body = (
    <>
      <div className="flex items-end justify-between gap-6">
        {settings.showIndex !== false ? (
        <div className="flex min-w-0 items-center gap-3">
          <span
            data-spec-index=""
            className="font-mono text-[11px] font-normal tabular-nums tracking-[0.14em] sm:text-[12px]"
            style={{ color: muted, opacity: 0.85 }}
            data-pf-no-color-transition=""
          >
            {formatSpecIndex(index)}
          </span>
          {/* Neutral rule: the main color on every sheet's index repeated the accent six
              times; it now lives on the hover bar and the link underline. */}
          <span
            aria-hidden
            className="hidden h-px w-7 shrink-0 sm:block sm:w-9"
            style={{ backgroundColor: `color-mix(in srgb, ${muted} 45%, transparent)` }}
          />
        </div>
        ) : null}
        {/* Phones: category / role move under the title (see below), next to what they
            describe instead of right-aligned above the index. */}
        {(showCategory || showRole) && (
          <div className="ml-auto hidden min-w-0 max-w-[62%] text-right sm:block">
            {showCategory ? (
              <p
                className="truncate text-xs font-medium tracking-[0.06em] sm:text-sm"
                style={{ color: categoryInk }}
              >
                {category}
              </p>
            ) : null}
            {showRole ? (
              <p
                className={`truncate text-sm font-normal tracking-[-0.01em] sm:text-[0.9375rem] ${
                  showCategory ? 'mt-1' : ''
                }`}
                style={{ color: roleInk }}
              >
                {role}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <h3
        data-spec-title=""
        className="mt-5 font-medium leading-[1.06] tracking-[-0.045em] sm:mt-6"
        data-pf-no-color-transition=""
        style={{ color: ink, fontSize: titleFontSize }}
      >
        <span
          className="pf-work-spec-title-hit inline-block"
          data-spec-title-hit=""
          data-spec-hover-src={showHoverPreview && mediaUrl ? mediaUrl : undefined}
        >
          <span className="pf-work-spec-title-mask block overflow-hidden">
            <span className="pf-work-spec-title-inner block" data-spec-title-text="">
              {title}
            </span>
          </span>
        </span>
      </h3>

      {showCategory || showRole ? (
        <p className="mt-2 text-sm sm:hidden">
          {showRole ? <span style={{ color: roleInk }}>{role}</span> : null}
          {showRole && showCategory ? <span style={{ color: muted }}> · </span> : null}
          {showCategory ? <span style={{ color: categoryInk }}>{category}</span> : null}
        </p>
      ) : null}

      {showStack ? (
        <div data-spec-body="" className="mt-4 sm:mt-5" data-pf-no-color-transition="">
          {showFieldLabels ? <SpecFieldLabel ink={muted}>{stackLabel}</SpecFieldLabel> : null}
          <SpecStack tools={tools} ink={stackInk} />
        </div>
      ) : null}

      {showDescription ? (
        <div data-spec-body="" className="mt-5 sm:mt-6" data-pf-no-color-transition="">
          {showFieldLabels ? <SpecFieldLabel ink={muted}>{descriptionLabel}</SpecFieldLabel> : null}
          <p
            className="max-w-[58ch] text-[0.9375rem] font-normal leading-[1.72] sm:text-[1.02rem] sm:leading-[1.76]"
            style={{ color: valueInk }}
          >
            {description}
          </p>
        </div>
      ) : null}

      {showConsult && href ? (
        <div data-spec-body="" className="mt-7 sm:mt-8" data-pf-no-color-transition="">
          <WorkConsultButtonLink href={href} label={consultLabel} ink={workButtonColor(settings.buttonColor ? workPaletteTokenColor(settings.buttonColor) : ink, settings.buttonColorOpacity)} variant={consultStyle} />
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className="pf-work-spec-sheet group/sheet relative flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10"
      data-spec-sheet=""
      data-index={String(index)}
      data-spec-shifted={applyShift ? 'true' : 'false'}
      data-pf-no-color-transition=""
      style={applyShift ? ({ ['--spec-shift' as string]: specShiftVw(index) } as CSSProperties) : undefined}
    >
      {showThumb && mediaUrl ? (
        <div
          data-spec-media=""
          className="w-full shrink-0 overflow-hidden sm:w-[28%] sm:max-w-[14.5rem] lg:max-w-[16.5rem]"
          data-pf-no-color-transition=""
        >
          <SpecThumbnail
            url={mediaUrl}
            alt={title}
            surface={tagSurface || surface}
            compact={false}
          />
        </div>
      ) : null}

      <article
        className={`relative min-w-0 flex-1 ${padded ? 'p-5 sm:p-6 lg:p-8' : ''}`}
        data-pf-no-color-transition=""
        style={
          padded
            ? {
                ...(framed
                  ? { borderWidth: frameBorderWidth, borderStyle: 'solid', borderColor: frameBorderColor }
                  : null),
                backgroundColor: frameFillColor,
              }
            : undefined
        }
      >
        {!framed && !showThumb ? (
          <span
            aria-hidden
            data-pf-no-color-transition=""
            className="pointer-events-none absolute left-0 top-0 h-9 w-px origin-top scale-y-0 opacity-0 transition-[transform,translate,scale,rotate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:scale-y-100 group-hover/sheet:opacity-100"
            style={{ backgroundColor: accent }}
          />
        ) : null}
        {body}
      </article>
    </div>
  );
}

/** Sets `--spec-gap` (vertical space between sheets): the separator sits at half of it. */
function specSheetGapVarClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return '[--spec-gap:3rem] sm:[--spec-gap:3.5rem] lg:[--spec-gap:4rem]';
  // Strictly increasing steps (Large used to be no bigger than Medium on wide screens).
  if (gap === 'md') return '[--spec-gap:6rem] sm:[--spec-gap:7rem] lg:[--spec-gap:8rem]';
  if (gap === '2xl') return '[--spec-gap:11rem] sm:[--spec-gap:13.5rem] lg:[--spec-gap:16rem]';
  return '[--spec-gap:8rem] sm:[--spec-gap:9.5rem] lg:[--spec-gap:11rem]';
}

function specSheetGridGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return '[--spec-gap:3rem] sm:[--spec-gap:3.5rem] lg:[--spec-gap:4rem] gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16';
  if (gap === 'md') return '[--spec-gap:6rem] sm:[--spec-gap:7rem] lg:[--spec-gap:8rem] gap-x-10 sm:gap-x-12 lg:gap-x-14 xl:gap-x-20';
  if (gap === '2xl') return '[--spec-gap:11rem] sm:[--spec-gap:13.5rem] lg:[--spec-gap:16rem] gap-x-12 sm:gap-x-14 lg:gap-x-16 xl:gap-x-24';
  return '[--spec-gap:8rem] sm:[--spec-gap:9.5rem] lg:[--spec-gap:11rem] gap-x-10 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20';
}

/** Line between two sheets, centered in the `--spec-gap` above its (relative) sheet wrapper. */
function SpecSheetSeparator({
  settings,
  color,
  className = '',
}: {
  settings: PortfolioWorkProjectsSpecSettings;
  color: string;
  className?: string;
}) {
  const style = settings.metaDivider ?? 'none';
  if (style === 'none') return null;
  const thickness = settings.metaDividerSize === 'lg' ? 3 : settings.metaDividerSize === 'sm' ? 1 : 2;
  const length = settings.metaDividerSize === 'lg' ? '9rem' : settings.metaDividerSize === 'sm' ? '4rem' : '6rem';
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute block -translate-y-1/2 ${
        style === 'short' ? 'left-1/2 -translate-x-1/2' : 'left-0'
      } ${className}`}
      style={{
        top: 'calc(var(--spec-gap) / -2)',
        height: thickness,
        width: style === 'short' ? length : '100%',
        backgroundColor: color,
      }}
      data-pf-no-color-transition=""
    />
  );
}

/**
 * GSAP choreography for the whole gallery:
 *  - per sheet, a ScrollTrigger-driven reveal (`once: true`) that fades the sheet
 *    in and masks the title up from translateY(108%) to 0 with power4.out;
 *  - a continuous scrub parallax (desktop only) where the index numeral travels
 *    roughly 3.5x further than the title block, `scrub: 1` tying it straight to
 *    the scrollbar.
 * All ScrollTriggers target the nearest real scroller (Live Preview nests its
 * own overflow-y-auto shell), and everything is skipped for prefers-reduced-motion.
 */
function useSpecChoreography(itemsKey: number) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const sheets = Array.from(root.querySelectorAll<HTMLElement>('[data-spec-sheet]'));
    if (sheets.length === 0) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(sheets, { autoAlpha: 1, y: 0 });
      gsap.set(root.querySelectorAll('.pf-work-spec-title-inner'), { yPercent: 0 });
      return undefined;
    }

    const scroller = aboutBannerScrollParent(root);
    const stBase = scroller ? { scroller } : {};

    const ctx = gsap.context(() => {
      sheets.forEach((sheet) => {
        const titleInner = sheet.querySelector<HTMLElement>('.pf-work-spec-title-inner');
        const bodies = Array.from(sheet.querySelectorAll<HTMLElement>('[data-spec-body]'));

        gsap.set(sheet, { autoAlpha: 0, y: 28 });
        if (titleInner) gsap.set(titleInner, { yPercent: 108 });
        if (bodies.length) gsap.set(bodies, { autoAlpha: 0, y: 16 });

        // 1. Text reveal — masked title slides up out of the shadow (power4.out),
        // staggered slightly after the sheet itself starts fading in.
        const revealTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
        revealTl.to(sheet, { autoAlpha: 1, y: 0, duration: 0.9 }, 0);
        if (titleInner) {
          revealTl.to(titleInner, { yPercent: 0, duration: 1.1, ease: 'power4.out' }, 0.08);
        }
        if (bodies.length) {
          revealTl.to(bodies, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.32);
        }

        ScrollTrigger.create({
          trigger: sheet,
          start: 'top 85%',
          once: true,
          onEnter: () => revealTl.play(),
          ...stBase,
        });
      });

      // 2. Continuous scroll-driven parallax — desktop only. The index numeral
      // travels ~3.5x further than the title block for a real editorial depth.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        sheets.forEach((sheet) => {
          const mark = sheet.querySelector<HTMLElement>('[data-spec-index]');
          const title = sheet.querySelector<HTMLElement>('[data-spec-title]');
          const scrub = {
            trigger: sheet,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            ...stBase,
          };
          if (mark) gsap.to(mark, { y: -140, ease: 'none', scrollTrigger: scrub });
          if (title) gsap.to(title, { y: -40, ease: 'none', scrollTrigger: scrub });
        });
        return undefined;
      });
    }, root);

    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [itemsKey]);

  return rootRef;
}

/** Full-width technical specification sheets — data first, optional left media. */
export function ProjectsSpecGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const t = useT();
  const settings = mergeProjectsSpecSettings(
    DEFAULT_PROJECTS_SPEC_SETTINGS,
    presentation.projectsSpec
  );
  const thumbnailForcesSingle = settings.showThumbnail === true;
  const twoColumn = !thumbnailForcesSingle && (settings.columnsPerRow ?? 1) === 2;
  const gapVarClass = specSheetGapVarClass(settings.sheetGap ?? 'xl');
  const gridGapClass = specSheetGridGapClass(settings.sheetGap ?? 'xl');
  const separatorColor =
    !settings.metaDividerColor || settings.metaDividerColor === 'muted'
      ? `color-mix(in srgb, ${presentation.subtitleColor || presentation.titleColor} 45%, transparent)`
      : workPaletteTokenColor(settings.metaDividerColor);
  const rootRef = useSpecChoreography(items.length);

  if (items.length === 0) return null;

  if (twoColumn) {
    return (
      <section
        ref={rootRef}
        className={`pf-work-spec grid w-full grid-cols-1 gap-y-[var(--spec-gap)] lg:grid-cols-2 ${gridGapClass}`}
        aria-label={t('Project specifications')}
        data-pf-no-color-transition=""
      >
        <style>{SPEC_MOTION_CSS}</style>
        {items.map((item, index) => (
          <div key={item.id} className="relative min-w-0">
            {/* First row on wide screens has nothing above it: the second sheet sits beside the first. */}
            {index > 0 ? (
              <SpecSheetSeparator settings={settings} color={separatorColor} className={index === 1 ? 'lg:hidden' : ''} />
            ) : null}
            <SpecSheet
              item={item}
              index={index}
              presentation={presentation}
              settings={settings}
              compactTitle
            />
          </div>
        ))}
        <SpecHoverPreview galleryRef={rootRef} />
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className={`pf-work-spec w-full ${gapVarClass}`}
      aria-label={t('Project specifications')}
      data-pf-no-color-transition=""
    >
      <style>{SPEC_MOTION_CSS}</style>
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? 'relative mt-[var(--spec-gap)]' : 'relative'}>
          {index > 0 ? <SpecSheetSeparator settings={settings} color={separatorColor} /> : null}
          <SpecSheet
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            compactTitle={false}
            /* One shared left edge: the 0/9/3/12/6vw zig-zag offsets read as misalignment,
               not rhythm (they followed no grid). */
            applyShift={false}
          />
        </div>
      ))}
      <SpecHoverPreview galleryRef={rootRef} />
    </section>
  );
}
