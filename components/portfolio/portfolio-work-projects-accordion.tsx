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
import { useT } from '@/lib/i18n/I18nProvider';

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
.portfolio-acc-list .portfolio-acc-item > .h-px { width: 100%; }
.portfolio-acc-list .portfolio-acc-trigger { padding-block: 24px !important; align-items: flex-start; }
.portfolio-acc-list .portfolio-acc-title { font-weight: 500; }
.portfolio-acc-list .portfolio-acc-item[data-open='true'] .portfolio-acc-title { font-size: clamp(1.75rem, 2.5vw, 2.25rem); line-height: 1.18; }
.portfolio-acc-list .portfolio-acc-item[data-open='false'] .portfolio-acc-title { font-size: 1.125rem; line-height: 1.4; }
.portfolio-acc-list .portfolio-acc-title span { font-weight: inherit; }
.portfolio-acc-list .portfolio-acc-trigger::after { content: '+'; color: var(--acc-title-ink); font-size: 24px; line-height: 1; flex-shrink: 0; }
.portfolio-acc-list .portfolio-acc-trigger[aria-expanded='true']::after { content: '−'; }
.portfolio-acc-list[data-display-style='compact'] { gap: 12px; }
.portfolio-acc-list[data-display-style='compact'] .portfolio-acc-item { border: 1px solid var(--acc-border); border-radius: 12px; padding-inline: 18px; }
.portfolio-acc-list[data-display-style='compact'] .portfolio-acc-item[data-open='true'] { background: color-mix(in srgb, var(--acc-title-ink) 5%, transparent); }
.portfolio-acc-list[data-display-style='compact'] .portfolio-acc-item > .h-px { display: none; }
.portfolio-acc-list[data-display-style='compact'] .portfolio-acc-item[data-open='true'] .portfolio-acc-title { font-size: 1.375rem; }
.portfolio-acc-list .portfolio-acc-stack { display:flex; flex-wrap:wrap; gap: 6px 12px; margin-top:16px; font-size:12px; line-height:1.6; }
.portfolio-acc-list[data-display-style='compact'] .portfolio-acc-stack li { border:1px solid var(--acc-border); padding:3px 8px; border-radius:5px; }
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
/* Closed titles take the strong title ink on hover/focus. It comes from the palette
   (--acc-title-ink on the list): the old fixed #ffffff vanished on a light section.
   !important because it fights the inline style={{color}} on the same element. Closed
   titles stay readable at rest (no more 0.18 opacity, no sibling dimming on list hover):
   size and weight carry the open/closed hierarchy, not near-invisibility. */
[data-acc-ready='1'] .portfolio-acc-item[data-open='false']:hover .portfolio-acc-title,
[data-acc-ready='1'] .portfolio-acc-item[data-open='false']:focus-within .portfolio-acc-title {
  color: var(--acc-title-ink) !important;
  opacity: 1 !important;
}
.portfolio-acc-trigger:focus-visible .portfolio-acc-title {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
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
  // The light/semibold split is the open title's editorial signature; closed titles keep
  // one weight so a list of small mixed-weight lines doesn't read as noise.
  if (!open) return <span className="font-normal">{title}</span>;
  if (!rest) {
    return <span className="font-semibold">{lead}</span>;
  }
  return (
    <>
      <span className="font-light">{lead}</span>
      {' '}
      <span className="font-semibold">{rest}</span>
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
 * The image stays fully opaque to its edges; the corner cut mirrors its placement.
 */
function AccordionPreview({
  item,
  surface,
  muted,
  href,
  ctaLabel,
  previewFirst,
  previewFit = 'cover',
  previewSize = 100,
  previewShape = 'cut',
  shiftRef,
}: {
  item: MarketplaceContentItem | null;
  surface: string;
  muted: string;
  href: string | null;
  ctaLabel: string;
  previewFirst: boolean;
  previewFit?: 'cover' | 'contain';
  previewSize?: number;
  previewShape?: 'none' | 'rounded' | 'arch' | 'cut';
  shiftRef?: RefObject<HTMLDivElement | null>;
}) {
  const t = useT();
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
  }, [mediaUrl, previewFit]);

  // No border-radius or boxed background surface. The outer corner is
  // sliced off at an angle (mirrored by previewSide) — an asymmetric silhouette
  // instead of a rectangle, and the frame runs close to full column height so
  // it reads as bleeding to the edge rather than sitting in a contained tile.
  const clipShape = previewFirst
    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 7%, 5% 0%)'
    : 'polygon(0% 0%, 95% 0%, 100% 7%, 100% 100%, 0% 100%)';

  const content = (
    <div
      ref={frameRef}
      className={previewFit === 'contain' && mediaUrl ? 'relative w-full' : 'relative aspect-[4/3] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[min(48rem,80svh)]'}
      style={{
        clipPath: previewFit !== 'contain' && previewShape === 'cut' ? clipShape : undefined,
        borderRadius: previewShape === 'rounded' ? '24px' : previewShape === 'arch' ? '50% 50% 0 0' : undefined,
        overflow: 'hidden',
        backgroundColor: previewFit === 'contain' ? 'transparent' : surface,
      }}
    >
      {mediaUrl ? (
        <div key={`${mediaUrl}-${previewFit}`} ref={mediaRef} className={previewFit === 'contain' ? 'relative w-full' : 'absolute inset-0 will-change-transform'}>
          <Image
            src={mediaUrl}
            alt={title || t('Project preview')}
            fill={previewFit !== 'contain'}
            width={previewFit === 'contain' ? 1200 : undefined}
            height={previewFit === 'contain' ? 800 : undefined}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className={previewFit === 'contain' ? 'block h-auto w-full object-contain' : 'object-cover object-center'}
            priority
          />
        </div>
      ) : (
        <div
          className="flex h-full w-full items-center justify-center px-8 text-center text-sm font-light leading-[1.7]"
          style={{ color: muted, backgroundColor: surface }}
        >
          {title || t('Add a thumbnail in Information → Portfolio')}
        </div>
      )}

    </div>
  );

  return (
    <div ref={shiftRef} className="group/preview mx-auto min-w-0 will-change-transform" style={{width:`${previewSize}%`}}>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4"
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
  toolsLabel,
  mobileThumbnailSurface,
  previewFit,
  previewSize = 100,
  previewShape = 'cut',
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
  /** Heading above the meta line when the item has tools (Tools label setting), else null. */
  toolsLabel: string | null;
  /** Below `lg` there's no separate side preview column, so each item shows its
   *  own thumbnail inline, at the bottom of its own open panel (after the tags) —
   *  instead of a shared image ending up stranded after the whole list. */
  mobileThumbnailSurface: string;
  previewFit?: 'cover' | 'contain';
  previewSize?: number;
  previewShape?: 'none' | 'rounded' | 'arch' | 'cut';
}) {
  const t = useT();
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
  ];
  const showMetaLine = metaItems.length > 0;
  const showBody =
    open && ((showDescription && Boolean(description)) || showMetaLine || tools.length > 0 || Boolean(mobileMediaUrl));

  return (
    <div
      className="portfolio-acc-item min-w-0"
      data-open={open ? 'true' : 'false'}
      data-pf-no-color-transition=""
    >
      {index > 0 ? (
        // The border color at 24 % (#27272A on black) was invisible; lifted toward the ink.
        <div
          className="mb-1 h-px w-[min(100%,19rem)]"
          style={{ backgroundColor: `color-mix(in srgb, ${border}, ${titleInk} 18%)` }}
          aria-hidden
        />
      ) : null}

      {/* focus:outline-hidden flips outline-style/width to solid/2px instantly on
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
        className={`portfolio-acc-trigger flex w-full items-baseline gap-4 text-left sm:gap-5 ${
          open ? 'pb-5 pt-9 sm:pb-6 sm:pt-12 lg:pt-14' : 'py-7 sm:py-8 lg:py-9'
        } ${index === 0 ? '!pt-0' : ''} rounded-xs focus:outline-hidden`}
        data-pf-no-color-transition=""
      >
        {/* Decorative ordinal (the button already names the project): the open one takes
            the creator's main color — the section's signature accent. */}
        <span
          aria-hidden
          className="w-7 shrink-0 font-medium tabular-nums text-xs tracking-[0.14em] transition-[color,opacity] duration-300 sm:w-8 sm:text-[0.8125rem]"
          style={{ color: open ? accent || titleInk : muted, opacity: open ? 1 : 0.88 }}
          data-pf-no-color-transition=""
        >
          {formatAccordionIndex(index)}
        </span>
        {/* Open title is display-scale (sized to the ~5/12 column: the old 4.6rem wrapped
            into a heavy block against the image); closed titles stay readable list items. */}
        <span
          className={`portfolio-acc-title min-w-0 flex-1 tracking-[-0.03em] ${
            open
              ? 'text-[2rem] leading-[1.12] sm:text-[2.5rem] lg:text-[2.75rem] xl:text-[3rem] text-balance'
              : 'text-[1.25rem] leading-[1.2] sm:text-[1.4rem] lg:text-[1.5rem]'
          }`}
          style={{ color: open ? titleInk : muted }}
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
            {showMetaLine ? <div className="mb-4 flex flex-wrap gap-x-3 gap-y-2 text-xs tracking-wide">
              {metaItems.map((meta,i)=><span key={`${meta.text}-${i}`} style={{color:meta.isRole?roleColor:muted}}>{meta.text}</span>)}
            </div> : null}
            {showDescription && description ? (
              <p className="max-w-md text-base leading-relaxed" style={{ color: muted }}>
                {description}
              </p>
            ) : null}

            {toolsLabel && tools.length > 0 ? (
              <p
                className={`flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] ${
                  showDescription && description ? 'mt-7' : 'mt-1'
                }`}
                style={{ color: muted }}
              >
                <span aria-hidden className="h-px w-5" style={{ backgroundColor: muted, opacity: 0.5 }} />
                {toolsLabel}
              </p>
            ) : null}

            {tools.length > 0 ? <ul className="portfolio-acc-stack" aria-label={t('Tools')} style={{color:muted}}>
              {tools.map(tool=><li key={tool}>{tool}</li>)}
            </ul> : null}
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
                className={previewFit === 'contain' ? 'relative w-full' : 'relative aspect-[4/3] w-full overflow-hidden'}
                style={{ backgroundColor: previewFit === 'contain' ? 'transparent' : mobileThumbnailSurface, width:`${previewSize}%`, marginInline:'auto', overflow:'hidden',
                  borderRadius:previewShape==='rounded'?'24px':previewShape==='arch'?'50% 50% 0 0':undefined,
                  clipPath:previewShape==='cut'&&previewFit!=='contain'?'polygon(0 0, 93% 0, 100% 7%, 100% 100%, 0 100%)':undefined }}
              >
                <Image
                  src={mobileMediaUrl}
                  alt={item.title?.trim() || t('Project preview')}
                  fill={previewFit !== 'contain'}
                  width={previewFit === 'contain' ? 1200 : undefined}
                  height={previewFit === 'contain' ? 800 : undefined}
                  sizes="100vw"
                  className={previewFit === 'contain' ? 'block h-auto w-full object-contain' : 'object-cover object-center'}
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
  const t = useT();
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
      <div
        className="portfolio-acc-list flex min-w-0 flex-col"
        data-display-style={board.displayStyle ?? 'editorial'}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
          const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.portfolio-acc-trigger'));
          const index = triggers.indexOf(event.target as HTMLButtonElement);
          if (index < 0) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + triggers.length) % triggers.length;
          triggers[next]?.focus();
        }}
        role="list"
        style={{ '--acc-title-ink': titleInk, '--acc-border': border } as CSSProperties}
      >
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
                onPreviewHover={() => schedulePreview(undefined, 0)}
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
                toolsLabel={board.showToolsLabel ? board.toolsLabel.trim() || t('Tools I use') : null}
                mobileThumbnailSurface={previewSurface}
                previewFit={board.previewFit}
                previewSize={board.previewSize}
                previewShape={board.previewShape}
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
          href={board.showConsult ? active?.linkUrl?.trim() || null : null}
          ctaLabel={board.consultLabel.trim() || t('View project')}
          previewFirst={previewFirst}
          previewFit={board.previewFit}
          previewSize={board.previewSize}
          previewShape={board.previewShape}
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
