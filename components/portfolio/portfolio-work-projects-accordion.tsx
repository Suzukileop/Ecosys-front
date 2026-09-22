'use client';

import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_ACCORDION_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsAccordionSettings,
} from '@/components/portfolio/portfolio-work-settings';

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const ENTER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 22px, 0)',
};
// Every element below that declares its own transform/opacity transition via a CSS
// class also carries `data-pf-no-color-transition=""` in its JSX. Without it, the
// global theme color-crossfade rule in globals.css
// (`.pf-theme-root[data-pf-color-transitions='true'] *:not([data-pf-no-color-transition])...`)
// silently wins the specificity fight (it out-specifies any single- or double-class
// selector here) and overwrites `transition-property` with its own list
// (background-color, border-color, color, fill, stroke, box-shadow, outline-color,
// text-decoration-color, -webkit-text-fill-color) — which does NOT include `transform`
// or `opacity`. The practical effect: any hover/open-state transform or opacity
// transition on an element missing that attribute snaps instantly instead of easing,
// while color happens to keep working (coincidentally in that list) at the global
// rule's own 620ms duration instead of whatever this file intended. Found this by
// reading globals.css after a "transitions feel brutal" report kept reproducing even
// after fixing the specific color-transition bug below.
const ACCORDION_CSS = `
.portfolio-acc-enter {
  will-change: opacity, transform;
  transition:
    opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
[data-acc-ready='1'] .portfolio-acc-enter {
  opacity: 1 !important;
  transform: translate3d(0, 0, 0) !important;
}
.portfolio-acc-list .portfolio-acc-title {
  display: inline-block;
  max-width: 100%;
  transform: translateX(0);
  /* This rule's specificity beats the .transition-colors Tailwind utility on
     the same element, so it silently wins the cascade and its transition
     shorthand overrides that class entirely — color, opacity and font-size
     must all be listed here too, or the title's open/closed state swap snaps
     instantly instead of fading (font-size in particular needs a slower,
     springier ease — it's the biggest visual jump on toggle). */
  transition:
    transform 0.7s ${EASE_OUT},
    color 0.4s ${EASE_OUT},
    opacity 0.5s ${EASE_OUT},
    font-size 0.65s ${EASE_OUT};
  will-change: transform, color, opacity, font-size;
}
[data-acc-ready='1'] .portfolio-acc-item:hover .portfolio-acc-title,
[data-acc-ready='1'] .portfolio-acc-item:focus-within .portfolio-acc-title {
  transform: translateX(0.4rem);
}
/* Inactive titles pop to pure white on hover/focus — color value only (the
   existing 0.4s transition above still carries it); needs !important because
   this is fighting the inline style={{color}} on the same element, which no
   plain-specificity external rule can ever out-rank. Scoped to closed items
   only — the open item is already at titleInk, so this would be a no-op for
   it visually, but scoping keeps the intent explicit. */
[data-acc-ready='1'] .portfolio-acc-item[data-open='false']:hover .portfolio-acc-title,
[data-acc-ready='1'] .portfolio-acc-item[data-open='false']:focus-within .portfolio-acc-title {
  color: #ffffff !important;
}
.portfolio-acc-tags {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.portfolio-acc-tags::-webkit-scrollbar {
  display: none;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  [data-acc-ready='1'] .portfolio-acc-item {
    opacity: 1;
    transition: opacity 0.7s ${EASE_OUT};
  }
  [data-acc-ready='1'] .portfolio-acc-list:hover .portfolio-acc-item:not(:hover):not(:focus-within) {
    opacity: 0.38;
  }
}
@media (prefers-reduced-motion: reduce) {
  .portfolio-acc-enter {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
    will-change: auto !important;
  }
  .portfolio-acc-list .portfolio-acc-item,
  .portfolio-acc-list .portfolio-acc-title {
    transition-duration: 0.01ms !important;
  }
}
`;

function workToolLabels(item: MarketplaceContentItem, max = 16): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function sameHex(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Strong text for accordion titles — avoid principal/accent when titleColor is bound to it. */
function accordionTitleInk(presentation: PortfolioWorkPresentationSettings): string {
  const title = presentation.titleColor?.trim() || '#f5f5f5';
  const accent = (presentation.ctaColor || presentation.categoryActiveColor || '').trim();
  const cardTitle = presentation.elementStyles?.cardTitle?.color?.trim();
  if (cardTitle && (!accent || !sameHex(cardTitle, accent))) return cardTitle;
  if (accent && sameHex(title, accent)) return '#f5f5f5';
  return title;
}

function alignClass(align: 'left' | 'center' | 'right'): string {
  if (align === 'right') return 'text-right items-end';
  if (align === 'left') return 'text-left items-start';
  return 'text-center items-center';
}

function workRoleLabel(item: MarketplaceContentItem): string {
  const role = item.role?.trim();
  if (role) return role;
  // Legacy posts only expose genre — use it as role when category is absent.
  if (!item.category?.trim() && item.genre?.trim()) return item.genre.trim();
  return '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function splitEditorialTitle(title: string): { lead: string; rest: string } {
  const trimmed = title.trim();
  const space = trimmed.search(/\s+/);
  if (space <= 0) return { lead: trimmed, rest: '' };
  return {
    lead: trimmed.slice(0, space),
    rest: trimmed.slice(space).trim(),
  };
}

function formatAccordionIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function motionReduced(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function AccordionMotionStyles() {
  return <style dangerouslySetInnerHTML={{ __html: ACCORDION_CSS }} />;
}

function EditorialTitleText({
  title,
  open,
}: {
  title: string;
  open: boolean;
}) {
  const { lead, rest } = splitEditorialTitle(title);
  if (!rest) {
    return <span className={open ? 'font-semibold' : 'font-light'}>{lead}</span>;
  }
  return (
    <>
      <span className="font-light">{lead}</span>
      {' '}
      <span className={open ? 'font-semibold' : 'font-normal'}>{rest}</span>
    </>
  );
}

function enterStyle(delayMs: number, extra?: CSSProperties): CSSProperties {
  return {
    ...ENTER_HIDDEN,
    ...extra,
    transitionDelay: `${delayMs}ms`,
  };
}

function useAccordionEntrance(
  rootRef: RefObject<HTMLElement | null>,
  revision: string | number = 0
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined') return;

    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      root.setAttribute('data-acc-ready', '1');
    };

    if (motionReduced()) {
      const frame = window.requestAnimationFrame(reveal);
      return () => window.cancelAnimationFrame(frame);
    }

    const scrollRoot = getScrollParent(root);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '64px 0px',
        root: scrollRoot instanceof Window ? null : scrollRoot,
      }
    );

    observer.observe(root);
    const fallback = setTimeout(reveal, 1400);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [rootRef, revision]);
}

function useDesktopKineticShift(
  rootRef: RefObject<HTMLElement | null>,
  previewRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let ticking = false;
    let scrollRoot: HTMLElement | Window = window;

    const reset = () => {
      const preview = previewRef.current;
      const list = listRef.current;
      if (preview) {
        preview.style.transform = '';
        preview.style.willChange = 'auto';
      }
      if (list) {
        list.style.transform = '';
        list.style.willChange = 'auto';
      }
    };

    const apply = () => {
      ticking = false;
      const root = rootRef.current;
      const preview = previewRef.current;
      const list = listRef.current;
      if (!root || !preview || !list) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      const relative = vh * 0.42 - rect.top;
      const previewY = Math.max(-20, Math.min(20, relative * 0.055));
      const listY = Math.max(-12, Math.min(12, -relative * 0.028));
      preview.style.transform = `translate3d(0, ${previewY}px, 0)`;
      list.style.transform = `translate3d(0, ${listY}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(apply);
    };

    const bind = () => {
      const root = rootRef.current;
      const preview = previewRef.current;
      const list = listRef.current;
      if (!root || !preview || !list) return;
      if (!desktopMq.matches || reduceMq.matches) {
        reset();
        return;
      }
      preview.style.willChange = 'transform';
      list.style.willChange = 'transform';
      scrollRoot = getScrollParent(root);
      scrollRoot.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      apply();
    };

    const unbind = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      ticking = false;
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const sync = () => {
      unbind();
      bind();
    };

    sync();
    desktopMq.addEventListener('change', sync);
    reduceMq.addEventListener('change', sync);

    return () => {
      unbind();
      reset();
      desktopMq.removeEventListener('change', sync);
      reduceMq.removeEventListener('change', sync);
    };
  }, [rootRef, previewRef, listRef, enabled]);
}

/**
 * Accordion design header — editorial light/semibold contrast, rule that stops with the title.
 */
export function ProjectsAccordionSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  align = 'center',
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const rootRef = useRef<HTMLElement>(null);
  useAccordionEntrance(rootRef, heading);

  if (!heading && !sub) return null;

  const { lead, rest } = splitEditorialTitle(heading);

  return (
    <header
      ref={rootRef}
      className={`mb-12 flex w-full flex-col sm:mb-16 ${alignClass(align)} ${className}`.trim()}
    >
      <AccordionMotionStyles />
      {heading ? (
        <div
          className="portfolio-acc-enter inline-flex max-w-3xl flex-col"
          style={enterStyle(40)}
          data-pf-no-color-transition=""
        >
          <h2
            className="text-3xl tracking-[-0.035em] sm:text-4xl lg:text-[3.15rem] lg:leading-[1.08]"
            style={{ color: titleColor }}
          >
            <span className="font-light">{lead}</span>
            {rest ? (
              <>
                {' '}
                <span className="font-semibold">{rest}</span>
              </>
            ) : null}
          </h2>
          <span
            className="mt-5 h-px w-full"
            style={{ backgroundColor: titleColor, opacity: 0.28 }}
            aria-hidden
          />
        </div>
      ) : null}
      {sub ? (
        <p
          className={`portfolio-acc-enter max-w-xl text-base leading-[1.7] sm:text-lg sm:leading-[1.75] ${
            heading ? 'mt-5' : ''
          }`}
          style={enterStyle(heading ? 130 : 40, { color: subtitleColor })}
          data-pf-no-color-transition=""
        >
          {sub}
        </p>
      ) : null}
    </header>
  );
}

/**
 * The single large preview image — imposing, organic, and the *only* click target
 * for the active project now (replaces the old standalone "Consult" text link: the
 * whole image is the interactive zone, with a label that only reveals on hover so
 * the image itself stays a clean surface at rest). GSAP drives:
 * - the scale/blur/lift settle whenever the active project (and so the image)
 *   changes, instead of a CSS @keyframes animation retriggered by remounting on
 *   `key={mediaUrl}`;
 * - a soft mouse-parallax drift on desktop pointer devices — the photo leans
 *   gently toward the cursor with a short lag, independent of the settle tween
 *   (GSAP composes `scale`/`yPercent` and `x`/`y` on the same element cleanly
 *   since they're tracked as separate transform components, not raw strings).
 * The edge facing the text column fades out via a CSS mask instead of ending in
 * a hard rectangle — the "organic, bleeding" edge instead of a strict 50/50 split.
 */
function AccordionPreview({
  item,
  surface,
  muted,
  accent,
  ink,
  href,
  ctaLabel,
  previewFirst,
  shiftRef,
}: {
  item: MarketplaceContentItem | null;
  surface: string;
  muted: string;
  accent: string;
  ink: string;
  href: string | null;
  ctaLabel: string;
  previewFirst: boolean;
  shiftRef?: RefObject<HTMLDivElement | null>;
}) {
  const mediaUrl = item?.mediaUrl?.trim() || null;
  const title = item?.title?.trim() || '';
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // Cinematic reveal: a fast vertical curtain-lift (clip-path) instead of the
  // old blur/scale settle — needed now that hovering a title (not just opening
  // it) retriggers this, so it has to read as snappy even fired several times
  // in quick succession rather than a single deliberate "open" moment.
  useLayoutEffect(() => {
    const el = mediaRef.current;
    if (!el || !mediaUrl || typeof window === 'undefined' || motionReduced()) return;
    const tween = gsap.fromTo(
      el,
      { clipPath: 'inset(0% 0 100% 0)', scale: 1.06 },
      { clipPath: 'inset(0% 0 0% 0)', scale: 1, duration: 0.68, ease: 'power4.inOut' }
    );
    return () => {
      tween.kill();
    };
  }, [mediaUrl]);

  useEffect(() => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media || typeof window === 'undefined') return;
    if (motionReduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const setX = gsap.quickTo(media, 'x', { duration: 0.7, ease: 'power3.out' });
    const setY = gsap.quickTo(media, 'y', { duration: 0.7, ease: 'power3.out' });

    const onMove = (event: MouseEvent) => {
      const rect = frame.getBoundingClientRect();
      // Inverse drift (image leans away from the cursor, not toward it) reads
      // as a lighter, more "floating" surface than the usual toward-cursor tilt.
      setX(((event.clientX - rect.left) / rect.width - 0.5) * -14);
      setY(((event.clientY - rect.top) / rect.height - 0.5) * -10);
    };
    const onLeave = () => {
      setX(0);
      setY(0);
    };

    frame.addEventListener('mousemove', onMove);
    frame.addEventListener('mouseleave', onLeave);
    return () => {
      frame.removeEventListener('mousemove', onMove);
      frame.removeEventListener('mouseleave', onLeave);
      setX(0);
      setY(0);
    };
  }, [mediaUrl]);

  // No more rigid card: no border-radius, no boxed background surface. The edge
  // facing the text column dissolves via a mask, and the opposite corner is
  // sliced off at an angle (mirrored by previewSide) — an asymmetric silhouette
  // instead of a rectangle, and the frame runs close to full column height so
  // it reads as bleeding to the edge rather than sitting in a contained tile.
  const fadeMask = previewFirst
    ? 'linear-gradient(to left, black 80%, transparent)'
    : 'linear-gradient(to right, black 80%, transparent)';
  const clipShape = previewFirst
    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 7%, 5% 0%)'
    : 'polygon(0% 0%, 95% 0%, 100% 7%, 100% 100%, 0% 100%)';

  const content = (
    <div
      ref={frameRef}
      className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[34rem] xl:min-h-[42rem]"
      style={{
        WebkitMaskImage: fadeMask,
        maskImage: fadeMask,
        clipPath: clipShape,
      }}
    >
      {mediaUrl ? (
        <div key={mediaUrl} ref={mediaRef} className="absolute inset-0 will-change-transform">
          <Image
            src={mediaUrl}
            alt={title || 'Project preview'}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="scale-[1.08] object-cover object-center"
            priority
          />
        </div>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-8 text-center text-sm font-light leading-[1.7]"
          style={{ color: muted, backgroundColor: surface }}
        >
          {title || 'Add a thumbnail in Information → Portfolio'}
        </div>
      )}

      {href ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}
            data-pf-no-color-transition=""
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-6 left-6 inline-flex translate-y-2 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-0 transition-all duration-500 group-hover/preview:translate-y-0 group-hover/preview:opacity-100 sm:bottom-8 sm:left-8"
            style={{ color: accent || ink }}
            data-pf-no-color-transition=""
          >
            <span className="border-b pb-[0.12em]" style={{ borderColor: accent || ink }}>
              {ctaLabel}
            </span>
            <span aria-hidden>↗</span>
          </span>
        </>
      ) : null}
    </div>
  );

  return (
    <div ref={shiftRef} className="group/preview min-w-0 will-change-transform">
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none"
          aria-label={`${ctaLabel}: ${title || 'project'}`}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function AccordionItem({
  item,
  index,
  open,
  onToggle,
  onPreviewHover,
  onPreviewLeave,
  panelId,
  headerId,
  accent,
  titleInk,
  muted,
  border,
  showDescription,
  showRoleInPanel,
  showCategoryInPanel,
  showTools,
  mobileThumbnailSurface,
}: {
  item: MarketplaceContentItem;
  index: number;
  open: boolean;
  onToggle: () => void;
  onPreviewHover: () => void;
  onPreviewLeave: () => void;
  panelId: string;
  headerId: string;
  accent: string;
  titleInk: string;
  muted: string;
  border: string;
  showDescription: boolean;
  showRoleInPanel: boolean;
  showCategoryInPanel: boolean;
  showTools: boolean;
  /** Below `lg` there's no separate side preview column, so each item shows its
   *  own thumbnail inline, at the bottom of its own open panel (after the tags) —
   *  instead of a shared image ending up stranded after the whole list. */
  mobileThumbnailSurface: string;
}) {
  const description = item.description?.trim() || '';
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const tools = showTools ? workToolLabels(item) : [];
  const showRole = showRoleInPanel !== false && Boolean(role);
  const showCategory = showCategoryInPanel !== false && Boolean(category);
  const roleColor =
    accent && !sameHex(accent, muted) && !sameHex(accent, titleInk) ? accent : titleInk;
  const mobileMediaUrl = item.mediaUrl?.trim() || null;

  // One flat, single-line list — role first (accent ink), category + tools grey —
  // instead of a role/category row plus a separate tools paragraph underneath.
  const metaItems: { text: string; isRole: boolean }[] = [
    ...(showRole ? [{ text: role, isRole: true }] : []),
    ...(showCategory ? [{ text: category, isRole: false }] : []),
    ...tools.map((tool) => ({ text: tool, isRole: false })),
  ];
  const showMetaLine = metaItems.length > 0;
  const showBody =
    open && ((showDescription && Boolean(description)) || showMetaLine || Boolean(mobileMediaUrl));

  return (
    <div
      className="portfolio-acc-item min-w-0"
      data-open={open ? 'true' : 'false'}
      data-pf-no-color-transition=""
    >
      {index > 0 ? (
        <div
          className="mb-1 h-px w-[min(100%,19rem)]"
          style={{ backgroundColor: border, opacity: 0.24 }}
          aria-hidden
        />
      ) : null}

      {/* focus:outline-none flips outline-style/width to solid/2px instantly on
          click, but without data-pf-no-color-transition the global color-crossfade
          rule still fades outline-color from opaque to transparent over ~620ms —
          a solid frame flashing in on every click before fading back out. */}
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onMouseEnter={onPreviewHover}
        onFocus={onPreviewHover}
        onMouseLeave={onPreviewLeave}
        className={`flex w-full items-baseline gap-4 text-left sm:gap-5 ${
          open ? 'pb-5 pt-9 sm:pb-6 sm:pt-12 lg:pt-14' : 'py-8 sm:py-10 lg:py-11'
        } ${index === 0 ? '!pt-0' : ''} rounded-sm focus:outline-none`}
        data-pf-no-color-transition=""
      >
        <span
          className="w-7 shrink-0 font-light tabular-nums text-xs tracking-[0.14em] transition-[color,opacity] duration-300 sm:w-8 sm:text-sm"
          style={{ color: open ? titleInk : muted, opacity: open ? 0.9 : 0.4 }}
          data-pf-no-color-transition=""
        >
          {formatAccordionIndex(index)}
        </span>
        {/* Active title goes gigantic (display-scale) and full-opacity; closed
            titles shrink back down and fade to ~0.3 — this size/opacity swing is
            the sole state indicator now (no more +/- glyph). */}
        <span
          className={`portfolio-acc-title min-w-0 flex-1 tracking-[-0.03em] ${
            open
              ? 'text-[2.15rem] leading-[0.98] sm:text-[3.1rem] lg:text-[4.1rem] xl:text-[4.6rem]'
              : 'text-[1.2rem] leading-[1.16] sm:text-[1.45rem] lg:text-[1.6rem]'
          }`}
          style={{ color: open ? titleInk : muted, opacity: open ? 1 : 0.18 }}
          data-pf-no-color-transition=""
        >
          <EditorialTitleText title={item.title} open={open} />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="grid"
        style={{
          gridTemplateRows: showBody ? '1fr' : '0fr',
          transition: `grid-template-rows 0.52s ${EASE_OUT}`,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="pb-8 pl-[2.75rem] pr-8 sm:pb-10 sm:pl-[3.25rem]"
            style={{
              opacity: showBody ? 1 : 0,
              transform: showBody ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
              transition: `opacity 0.45s ${EASE_OUT}, transform 0.5s ${EASE_OUT}`,
              transitionDelay: showBody ? '70ms' : '0ms',
            }}
          >
            {showDescription && description ? (
              <p className="max-w-md text-base leading-relaxed" style={{ color: muted }}>
                {description}
              </p>
            ) : null}

            {showMetaLine ? (
              <ul
                className={`portfolio-acc-tags group/tags flex flex-nowrap items-baseline gap-x-3 overflow-x-auto ${
                  showDescription && description ? 'mt-7' : 'mt-1'
                }`}
                aria-label="Role, category and tools"
              >
                {metaItems.map((meta, metaIndex) => (
                  <li
                    key={`${meta.text}-${metaIndex}`}
                    className="flex shrink-0 items-baseline gap-3 whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.22em] opacity-50 transition-opacity duration-300 hover:!opacity-100 group-hover/tags:opacity-25"
                    style={{ color: meta.isRole ? roleColor : muted }}
                  >
                    {metaIndex > 0 ? (
                      <span aria-hidden className="font-normal opacity-40" style={{ color: muted }}>
                        /
                      </span>
                    ) : null}
                    <span>{meta.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {mobileMediaUrl ? (
            <div
              className="w-full lg:hidden"
              style={{
                opacity: showBody ? 1 : 0,
                transform: showBody ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
                transition: `opacity 0.45s ${EASE_OUT}, transform 0.5s ${EASE_OUT}`,
                transitionDelay: showBody ? '110ms' : '0ms',
              }}
            >
              <div
                className="relative aspect-[4/3] w-full overflow-hidden"
                style={{ backgroundColor: mobileThumbnailSurface }}
              >
                <Image
                  src={mobileMediaUrl}
                  alt={item.title?.trim() || 'Project preview'}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  data-pf-no-color-transition=""
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Accordion list + large preview — Projects accordion design only. */
export function ProjectsAccordionGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const board = mergeProjectsAccordionSettings(
    DEFAULT_PROJECTS_ACCORDION_SETTINGS,
    presentation.projectsAccordion
  );
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const previewShiftRef = useRef<HTMLDivElement>(null);
  const listShiftRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [previewId, setPreviewId] = useState<string | undefined>(undefined);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useAccordionEntrance(rootRef, items.length);
  useDesktopKineticShift(rootRef, previewShiftRef, listShiftRef, items.length > 0);

  useEffect(
    () => () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    },
    []
  );

  if (items.length === 0) return null;

  const firstId = items[0]?.id ?? null;
  const effectiveOpenId =
    openId === undefined
      ? firstId
      : openId === null
        ? null
        : items.some((item) => item.id === openId)
          ? openId
          : firstId;
  // Hovering (or keyboard-focusing) a title previews its image immediately,
  // even over a *different* open project — takes priority over the open item
  // whenever it's set. A short debounce in each direction (scheduled below)
  // keeps moving across adjacent titles from flashing back to the open item
  // between hovers.
  const hoverPreviewId =
    previewId && items.some((item) => item.id === previewId) ? previewId : null;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleInk = accordionTitleInk(presentation);
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor;
  const previewSurface = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : `${border}55`;

  const active =
    items.find((item) => item.id === (hoverPreviewId ?? effectiveOpenId ?? firstId)) ?? items[0];
  const previewFirst = board.previewSide === 'left';

  const schedulePreview = (id: string | undefined, delay: number) => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => setPreviewId(id), delay);
  };

  const toggleItem = (itemId: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenId(null);
      return;
    }
    setOpenId(itemId);
    setPreviewId(itemId);
  };

  const list = (
    <div ref={listShiftRef} className="min-w-0 will-change-transform">
      <div className="portfolio-acc-list flex min-w-0 flex-col" role="list">
        {items.map((item, index) => {
          const open = item.id === effectiveOpenId;
          return (
            <div
              key={item.id}
              className="portfolio-acc-enter"
              role="listitem"
              style={enterStyle(previewFirst ? 90 + index * 78 : 70 + index * 78)}
              data-pf-no-color-transition=""
            >
              <AccordionItem
                item={item}
                index={index}
                open={open}
                onToggle={() => toggleItem(item.id, open)}
                onPreviewHover={() => schedulePreview(item.id, 70)}
                onPreviewLeave={() => schedulePreview(undefined, 120)}
                panelId={`${baseId}-panel-${index}`}
                headerId={`${baseId}-header-${index}`}
                accent={accent}
                titleInk={titleInk}
                muted={muted}
                border={border}
                showDescription={board.showDescription}
                showRoleInPanel={board.showRoleInPanel}
                showCategoryInPanel={board.showCategoryInPanel}
                showTools={board.showTools}
                mobileThumbnailSurface={previewSurface}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const preview = (
    <div className="hidden min-w-0 w-full lg:sticky lg:top-28 lg:block lg:self-start xl:top-24">
      <div
        className="portfolio-acc-enter"
        style={enterStyle(previewFirst ? 40 : 110)}
        data-pf-no-color-transition=""
      >
        <AccordionPreview
          item={active}
          surface={previewSurface}
          muted={muted}
          accent={accent}
          ink={titleInk}
          href={board.showConsult ? active?.linkUrl?.trim() || null : null}
          ctaLabel={board.consultLabel.trim() || 'View project'}
          previewFirst={previewFirst}
          shiftRef={previewShiftRef}
        />
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`grid w-full items-start gap-5 lg:gap-6 xl:gap-8 ${
        previewFirst
          ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'
          : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'
      }`}
    >
      <AccordionMotionStyles />
      {previewFirst ? (
        <>
          {preview}
          {list}
        </>
      ) : (
        <>
          {list}
          {preview}
        </>
      )}
    </div>
  );
}

export function isProjectsAccordionDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-accordion';
}
