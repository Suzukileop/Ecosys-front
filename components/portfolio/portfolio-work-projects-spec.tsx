'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSpecConsultDesign,
  PortfolioWorkProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';
import { aboutBannerScrollParent } from '@/components/portfolio/portfolio-about-scroll-utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SPEC_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SPEC_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

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
   useSpecChoreography, SpecHoverPreview, SpecBracketConsult) owns every
   transition: scroll reveal, scrub parallax, hover image, focus/blur, and the
   consult brackets. No CSS transitions compete with GSAP's per-frame writes. */
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

function specScrollRoot(el: HTMLElement | null): HTMLElement | null {
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
  return null;
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${SPEC_EASE} ${delayMs}ms, transform 0.95s ${SPEC_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
  el.dataset.revealed = 'true';
}

function showElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.dataset.revealed = 'true';
}

function SpecConsultAnchor({
  href,
  className,
  style,
  children,
  noColorTransition = false,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  /** True when `className` carries a transition (e.g. opacity) that the global
   * .pf-theme-root color-transition rule would otherwise clobber. */
  noColorTransition?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : null)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : null)}
    >
      {children}
    </Link>
  );
}

/**
 * "[ Consult this project → ]" — a paused GSAP timeline built once per instance:
 * brackets spread outward, the arrow sweeps right with a spring (back.out) on
 * mouseenter, and reverses cleanly on mouseleave (GSAP timelines reverse from
 * wherever they currently are, so a fast in/out never stutters or snaps back).
 */
function SpecBracketConsult({
  href,
  label,
  ink,
  focusClass,
}: {
  href: string;
  label: string;
  ink: string;
  focusClass: string;
}) {
  const openRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLSpanElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const open = openRef.current;
    const close = closeRef.current;
    const arrow = arrowRef.current;
    if (!open || !close || !arrow || prefersReducedMotion()) return undefined;

    const tl = gsap.timeline({ paused: true })
      .to(open, { x: -8, duration: 0.35, ease: 'power2.out' }, 0)
      .to(close, { x: 8, duration: 0.35, ease: 'power2.out' }, 0)
      .to(arrow, { x: 10, duration: 0.45, ease: 'back.out(1.7)' }, 0);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, []);

  return (
    <SpecConsultAnchor
      href={href}
      className={`pf-work-spec-consult group/consult inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.02em] ${focusClass}`}
      style={{ color: ink }}
      noColorTransition
      onMouseEnter={() => timelineRef.current?.play()}
      onMouseLeave={() => timelineRef.current?.reverse()}
    >
      <span ref={openRef} aria-hidden className="inline-block opacity-45">
        [
      </span>
      <span className="tracking-[-0.015em]">{label}</span>
      <span ref={arrowRef} aria-hidden className="inline-block opacity-55" data-pf-no-color-transition="">
        →
      </span>
      <span ref={closeRef} aria-hidden className="inline-block opacity-45">
        ]
      </span>
    </SpecConsultAnchor>
  );
}

function SpecConsultControl({
  href,
  label,
  design,
  accent,
  ink,
  surface,
}: {
  href: string;
  label: string;
  design: PortfolioWorkProjectsSpecConsultDesign;
  accent: string;
  ink: string;
  surface: string;
}) {
  const focusClass =
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

  if (design === 'underline') {
    return (
      <SpecConsultAnchor
        href={href}
        className={`group/consult relative inline-block text-[0.9375rem] tracking-[-0.015em] ${focusClass}`}
        style={{ color: ink }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-400 ease-out group-hover/consult:scale-x-0"
          style={{ backgroundColor: ink, opacity: 0.28 }}
        />
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-400 ease-out group-hover/consult:scale-x-100"
          style={{ backgroundColor: accent }}
        />
      </SpecConsultAnchor>
    );
  }

  if (design === 'bracket') {
    return <SpecBracketConsult href={href} label={label} ink={ink} focusClass={focusClass} />;
  }

  if (design === 'footer') {
    return (
      <SpecConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-3 text-[0.9375rem] font-medium tracking-[-0.015em] transition-opacity duration-300 hover:opacity-65 ${focusClass}`}
        style={{ color: ink }}
        noColorTransition
      >
        <span>{label}</span>
        <span
          className="inline-block h-px w-7 origin-left transition-transform duration-500 ease-out group-hover/consult:scale-x-[1.85]"
          style={{ backgroundColor: accent, opacity: 0.85 }}
          aria-hidden
          data-pf-no-color-transition=""
        />
      </SpecConsultAnchor>
    );
  }

  if (design === 'pill' || design === 'outline' || design === 'ghost' || design === 'solid') {
    const buttonStyle =
      design === 'outline'
        ? {
            color: ink,
            backgroundColor: 'transparent',
            border: `1px solid color-mix(in srgb, ${ink} 22%, transparent)`,
          }
        : design === 'ghost'
          ? {
              color: ink,
              backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
              border: '1px solid transparent',
            }
          : design === 'solid'
            ? {
                color: surface,
                backgroundColor: ink,
                border: `1px solid ${ink}`,
              }
            : {
                color: '#ffffff',
                backgroundColor: accent,
                border: `1px solid ${accent}`,
              };

    return (
      <SpecConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-2 px-2.5 py-1 text-[13px] font-medium tracking-[-0.015em] transition-opacity duration-300 hover:opacity-75 ${focusClass}`}
        style={buttonStyle}
        noColorTransition
      >
        <span>{label}</span>
        <FontAwesomeIcon
          icon={faArrowUp}
          className="size-2.5 rotate-45 opacity-70 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
          aria-hidden
          data-pf-no-color-transition=""
        />
      </SpecConsultAnchor>
    );
  }

  return (
    <SpecConsultAnchor
      href={href}
      className={`group/consult inline-flex items-center gap-2 text-[0.9375rem] tracking-[-0.015em] transition-opacity duration-300 hover:opacity-65 ${focusClass}`}
      style={{ color: accent }}
      noColorTransition
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="size-2.5 rotate-45 opacity-70 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
        data-pf-no-color-transition=""
      />
    </SpecConsultAnchor>
  );
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

function SpecStack({ tools, ink }: { tools: string[]; ink: string }) {
  return (
    <ul className="flex flex-wrap items-baseline" aria-label="Stack">
      {tools.map((tool, toolIndex) => (
        <li
          key={tool}
          className="flex items-baseline text-[11px] font-normal uppercase tracking-[0.08em] sm:text-[11.5px]"
          style={{ color: ink, opacity: 0.55 }}
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
    const baseColors = new Map<HTMLElement, string>();
    titleEls.forEach((el) => baseColors.set(el, getComputedStyle(el).color));

    // Focus/blur — the hovered title snaps to pure white; every other title in
    // the list dims to near-invisible with a light kinetic blur, isolating the
    // active project. Reverses to each title's own original color on leave.
    const onEnter = (hit: HTMLElement) => {
      const src = hit.dataset.specHoverSrc;
      if (src) {
        img.src = src;
        revealTl.play(0);
      }
      const hoveredText = hit.querySelector<HTMLElement>('[data-spec-title-text]');
      titleEls.forEach((el) => {
        if (el === hoveredText) {
          gsap.to(el, { color: '#ffffff', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
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
          color: baseColors.get(el),
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
  const solidInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || ink;
  const stackInk = presentation.elementStyles?.toolsList?.color || muted;
  const tagSurface = presentation.cardBorderColor || rule;

  const title = item.title?.trim() || 'Untitled';
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
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const consultDesign = settings.consultDesign ?? 'bracket';
  const sheetFrame = settings.sheetFrame ?? 'none';
  const framed = sheetFrame !== 'none';
  const frameBorderColor = sheetFrame === 'accent' ? accent : rule;
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;

  const titleFontSize = showThumb
    ? 'clamp(1.55rem, 2.35vw, 2.2rem)'
    : compactTitle
      ? 'clamp(1.4rem, 2vw, 1.9rem)'
      : 'clamp(2.15rem, 4.6vw, 3.6rem)';

  const body = (
    <>
      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            data-spec-index=""
            className="font-mono text-[10px] font-normal tabular-nums tracking-[0.16em] sm:text-[11px]"
            style={{ color: muted, opacity: 0.42 }}
            data-pf-no-color-transition=""
          >
            {formatSpecIndex(index)}
          </span>
          <span
            aria-hidden
            className="hidden h-px w-7 shrink-0 sm:block sm:w-9"
            style={{ backgroundColor: accent, opacity: 0.7 }}
          />
        </div>
        {(showCategory || showRole) && (
          <div className="min-w-0 max-w-[62%] text-right">
            {showCategory ? (
              <p
                className="truncate text-xs font-normal tracking-[0.06em] sm:text-sm"
                style={{ color: muted, opacity: 0.6 }}
              >
                {category}
              </p>
            ) : null}
            {showRole ? (
              <p
                className={`truncate text-sm font-normal tracking-[-0.01em] sm:text-[0.9375rem] ${
                  showCategory ? 'mt-1' : ''
                }`}
                style={{ color: muted, opacity: 0.5 }}
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

      {showStack ? (
        <div data-spec-body="" className="mt-4 sm:mt-5" data-pf-no-color-transition="">
          <SpecStack tools={tools} ink={stackInk} />
        </div>
      ) : null}

      {showDescription ? (
        <p
          data-spec-body=""
          className="mt-5 max-w-[58ch] text-[0.9375rem] font-normal leading-[1.72] sm:mt-6 sm:text-[1.02rem] sm:leading-[1.76]"
          style={{ color: valueInk }}
          data-pf-no-color-transition=""
        >
          {description}
        </p>
      ) : null}

      {showConsult && href ? (
        <div data-spec-body="" className="mt-7 sm:mt-8" data-pf-no-color-transition="">
          <SpecConsultControl
            href={href}
            label={consultLabel}
            design={consultDesign}
            accent={accent}
            ink={consultDesign === 'solid' ? solidInk : ink}
            surface={surface}
          />
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
        className={`relative min-w-0 flex-1 ${framed ? 'p-5 sm:p-6 lg:p-8' : ''}`}
        data-pf-no-color-transition=""
        style={
          framed
            ? {
                borderWidth: frameBorderWidth,
                borderStyle: 'solid',
                borderColor: frameBorderColor,
              }
            : undefined
        }
      >
        {!framed && !showThumb ? (
          <span
            aria-hidden
            data-pf-no-color-transition=""
            className="pointer-events-none absolute left-0 top-0 h-9 w-px origin-top scale-y-0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:scale-y-100 group-hover/sheet:opacity-100"
            style={{ backgroundColor: accent }}
          />
        ) : null}
        {body}
      </article>
    </div>
  );
}

/**
 * Spec header — datasheet section title with optional typography overrides.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsSpecSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  trailing?: ReactNode;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;

  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;

  const restTitleStyle: CSSProperties = { ...(titleStyle ?? {}) };
  delete restTitleStyle.fontSize;
  delete restTitleStyle.lineHeight;
  delete restTitleStyle.letterSpacing;

  useEffect(() => {
    const header = headerRef.current;
    if (!header || isEmpty) return;

    if (prefersReducedMotion()) {
      showElementNow(header);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealElement(header, 0);
    };

    const ioRoot = specScrollRoot(header);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '40px 0px' }
    );
    observer.observe(header);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [heading, sub, isEmpty]);

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`pf-work-spec-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={SPEC_HIDDEN}
    >
      <style>{SPEC_MOTION_CSS}</style>
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: resolvedTitleColor, opacity: 0.55 }}
              aria-hidden
            />
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-medium tracking-[-0.04em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.35rem)',
                lineHeight: 1.06,
              }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-[0.95rem] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-4' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.82 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0 pb-1">{trailing}</div> : null}
      </div>
    </header>
  );
}

function specSheetGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return 'mt-12 sm:mt-14 lg:mt-16';
  if (gap === 'md') return 'mt-20 sm:mt-24 lg:mt-28';
  if (gap === '2xl') return 'mt-36 sm:mt-44 lg:mt-52';
  return 'mt-28 sm:mt-32 lg:mt-36';
}

function specSheetGridGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return 'gap-y-12 sm:gap-y-14 lg:gap-y-16 gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16';
  if (gap === 'md') return 'gap-y-20 sm:gap-y-24 lg:gap-y-28 gap-x-10 sm:gap-x-12 lg:gap-x-14 xl:gap-x-20';
  if (gap === '2xl') return 'gap-y-36 sm:gap-y-44 lg:gap-y-52 gap-x-12 sm:gap-x-14 lg:gap-x-16 xl:gap-x-24';
  return 'gap-y-28 sm:gap-y-32 lg:gap-y-36 gap-x-10 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20';
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
  const settings = mergeProjectsSpecSettings(
    DEFAULT_PROJECTS_SPEC_SETTINGS,
    presentation.projectsSpec
  );
  const thumbnailForcesSingle = settings.showThumbnail === true;
  const twoColumn = !thumbnailForcesSingle && (settings.columnsPerRow ?? 1) === 2;
  const gapClass = specSheetGapClass(settings.sheetGap ?? 'xl');
  const gridGapClass = specSheetGridGapClass(settings.sheetGap ?? 'xl');
  const rootRef = useSpecChoreography(items.length);

  if (items.length === 0) return null;

  if (twoColumn) {
    return (
      <section
        ref={rootRef}
        className={`pf-work-spec grid w-full grid-cols-1 lg:grid-cols-2 ${gridGapClass}`}
        aria-label="Project specifications"
        data-pf-no-color-transition=""
      >
        <style>{SPEC_MOTION_CSS}</style>
        {items.map((item, index) => (
          <div key={item.id} className="min-w-0">
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
      className="pf-work-spec w-full"
      aria-label="Project specifications"
      data-pf-no-color-transition=""
    >
      <style>{SPEC_MOTION_CSS}</style>
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? gapClass : ''}>
          <SpecSheet
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            compactTitle={false}
            applyShift
          />
        </div>
      ))}
      <SpecHoverPreview galleryRef={rootRef} />
    </section>
  );
}

export function isProjectsSpecDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-spec';
}
