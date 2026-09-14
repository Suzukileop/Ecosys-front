'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useId,
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
.portfolio-acc-media {
  transform: scale(1.07);
  filter: blur(10px);
  transform-origin: center center;
  animation: portfolio-acc-media-settle 0.95s ${EASE_OUT} forwards;
}
@keyframes portfolio-acc-media-settle {
  to {
    transform: scale(1);
    filter: blur(0);
  }
}
.portfolio-acc-list .portfolio-acc-title {
  display: inline-block;
  max-width: 100%;
  transform: translateX(0);
  transition: transform 0.7s ${EASE_OUT};
  will-change: transform;
}
[data-acc-ready='1'] .portfolio-acc-item:hover .portfolio-acc-title,
[data-acc-ready='1'] .portfolio-acc-item:focus-within .portfolio-acc-title {
  transform: translateX(0.4rem);
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
  .portfolio-acc-media {
    animation: none !important;
    transform: none !important;
    filter: none !important;
  }
  .portfolio-acc-list .portfolio-acc-item,
  .portfolio-acc-list .portfolio-acc-title,
  .portfolio-acc-plus-v {
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
        >
          {sub}
        </p>
      ) : null}
    </header>
  );
}

/**
 * Consult — ghost text link under the preview (no filled chrome, no flanking rules).
 */
function AccordionConsultLink({
  href,
  label,
  accent,
  ink,
}: {
  href: string;
  label: string;
  accent: string;
  ink: string;
}) {
  const color = accent || ink;
  return (
    <div className="mt-6 sm:mt-7">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group/consult inline-flex items-center gap-2.5 bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-65 focus:outline-none focus-visible:opacity-65"
        style={{ color, backgroundColor: 'transparent' }}
        data-pf-no-color-transition=""
      >
        <span
          className="border-b pb-[0.12em] transition-[border-color,opacity] duration-300"
          style={{ borderColor: color }}
          data-pf-no-color-transition=""
        >
          {label}
        </span>
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover/consult:translate-x-1"
          data-pf-no-color-transition=""
        >
          →
        </span>
      </Link>
    </div>
  );
}

function AccordionPreview({
  item,
  surface,
  ink,
  muted,
  accent,
  toolsLabel,
  showToolsLabel,
  showTools,
  showConsult,
  consultLabel,
  shiftRef,
}: {
  item: MarketplaceContentItem | null;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  toolsLabel: string;
  showToolsLabel: boolean;
  showTools: boolean;
  showConsult: boolean;
  consultLabel: string;
  shiftRef?: RefObject<HTMLDivElement | null>;
}) {
  const mediaUrl = item?.mediaUrl?.trim() || null;
  const tools = item ? workToolLabels(item) : [];
  const title = item?.title?.trim() || '';
  const href = item?.linkUrl?.trim() || null;
  const consult =
    showConsult && href
      ? { href, label: consultLabel.trim() || 'Consult' }
      : null;
  const labelText = toolsLabel.trim() || 'Tools I use';

  return (
    <div className="flex min-w-0 flex-col">
      <div ref={shiftRef} className="min-w-0 will-change-transform">
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.15rem] sm:aspect-[5/4] sm:rounded-[1.25rem] lg:aspect-[4/3] lg:min-h-[24rem]"
          style={{ backgroundColor: surface }}
        >
          {mediaUrl ? (
          <div key={mediaUrl} className="portfolio-acc-media absolute inset-0">
            <Image
              src={mediaUrl}
              alt={title || 'Project preview'}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
              priority
            />
          </div>
        ) : (
            <div
              className="flex h-full w-full items-center justify-center px-8 text-center text-sm font-light leading-[1.7]"
              style={{ color: muted }}
            >
              {title || 'Add a thumbnail in Information → Portfolio'}
            </div>
          )}
        </div>
      </div>

      {consult ? (
        <AccordionConsultLink
          href={consult.href}
          label={consult.label}
          accent={accent}
          ink={ink}
        />
      ) : null}

      {showTools ? (
        <div className={consult ? 'mt-8 sm:mt-9' : 'mt-7 sm:mt-8'}>
          {showToolsLabel ? (
            <p
              className="text-[10px] font-medium uppercase tracking-[0.22em] sm:text-[11px]"
              style={{ color: muted, opacity: 0.72 }}
            >
              {labelText}
            </p>
          ) : null}
          {tools.length > 0 ? (
            <p
              className={`max-w-md text-sm font-light leading-[1.7] tracking-[0.02em] sm:text-[0.95rem] sm:leading-[1.75] ${
                showToolsLabel ? 'mt-3' : ''
              }`}
              style={{ color: muted }}
              aria-label={labelText}
            >
              {tools.join('  ·  ')}
            </p>
          ) : (
            <p
              className={`${showToolsLabel ? 'mt-3' : ''} text-sm font-light leading-[1.7]`}
              style={{ color: muted, opacity: 0.7 }}
            >
              No stack tags for this project yet.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AccordionPlus({ open, ink }: { open: boolean; ink: string }) {
  return (
    <span className="relative mt-1 inline-block h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden>
      <span
        className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
        style={{ backgroundColor: ink }}
      />
      <span
        className="portfolio-acc-plus-v absolute left-1/2 top-0 h-full w-px origin-center transition-transform duration-500"
        style={{
          backgroundColor: ink,
          transform: open ? 'translateX(-50%) rotate(90deg)' : 'translateX(-50%) rotate(0deg)',
          transitionTimingFunction: EASE_OUT,
        }}
      />
    </span>
  );
}

function AccordionItem({
  item,
  index,
  open,
  onToggle,
  panelId,
  headerId,
  accent,
  titleInk,
  muted,
  border,
  showDescription,
  showRoleInPanel,
  showCategoryInPanel,
}: {
  item: MarketplaceContentItem;
  index: number;
  open: boolean;
  onToggle: () => void;
  panelId: string;
  headerId: string;
  accent: string;
  titleInk: string;
  muted: string;
  border: string;
  showDescription: boolean;
  showRoleInPanel: boolean;
  showCategoryInPanel: boolean;
}) {
  const description = item.description?.trim() || '';
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const showRole = showRoleInPanel !== false && Boolean(role);
  const showCategory = showCategoryInPanel !== false && Boolean(category);
  const showMeta = showRole || showCategory;
  const showBody = open && ((showDescription && Boolean(description)) || showMeta);
  const roleColor =
    accent && !sameHex(accent, muted) && !sameHex(accent, titleInk) ? accent : titleInk;

  return (
    <div className="portfolio-acc-item min-w-0">
      {index > 0 ? (
        <div
          className="mb-1 h-px w-[min(100%,19rem)]"
          style={{ backgroundColor: border, opacity: 0.32 }}
          aria-hidden
        />
      ) : null}

      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`flex w-full items-baseline gap-4 text-left sm:gap-5 ${
          open ? 'pb-3 pt-5 sm:pb-4 sm:pt-6' : 'py-5 sm:py-6'
        } ${index === 0 ? '!pt-0' : ''} rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[6px]`}
        style={{ outlineColor: accent || titleInk }}
      >
        <span
          className="w-7 shrink-0 font-light tabular-nums text-[11px] tracking-[0.14em] sm:w-8 sm:text-xs"
          style={{ color: muted, opacity: open ? 0.9 : 0.48 }}
        >
          {formatAccordionIndex(index)}
        </span>
        <span
          className="portfolio-acc-title min-w-0 flex-1 text-[1.2rem] leading-[1.2] tracking-[-0.03em] sm:text-[1.45rem] lg:text-[1.6rem]"
          style={{ color: titleInk, opacity: open ? 1 : 0.78 }}
        >
          <EditorialTitleText title={item.title} open={open} />
        </span>
        <AccordionPlus open={open} ink={titleInk} />
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
            className="pb-7 pl-[2.75rem] pr-8 sm:pb-8 sm:pl-[3.25rem]"
            style={{
              opacity: showBody ? 1 : 0,
              transform: showBody ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
              transition: `opacity 0.45s ${EASE_OUT}, transform 0.5s ${EASE_OUT}`,
              transitionDelay: showBody ? '70ms' : '0ms',
            }}
          >
            {showDescription && description ? (
              <p
                className="max-w-xl text-sm leading-[1.7] sm:text-[0.95rem] sm:leading-[1.75]"
                style={{ color: muted }}
              >
                {description}
              </p>
            ) : null}
            {showMeta ? (
              <div
                className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 ${
                  showDescription && description ? 'mt-7' : 'mt-1'
                }`}
              >
                {showRole ? (
                  <p
                    className="min-w-0 text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]"
                    style={{ color: roleColor }}
                  >
                    {role}
                  </p>
                ) : (
                  <span />
                )}
                {showCategory ? (
                  <p
                    className="shrink-0 text-[10px] font-light uppercase tracking-[0.18em] sm:text-[11px]"
                    style={{ color: muted, opacity: 0.72 }}
                  >
                    {category}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
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

  useAccordionEntrance(rootRef, items.length);
  useDesktopKineticShift(rootRef, previewShiftRef, listShiftRef, items.length > 0);

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
  const effectivePreviewId =
    previewId && items.some((item) => item.id === previewId) ? previewId : firstId;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleInk = accordionTitleInk(presentation);
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor;
  const previewSurface = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : `${border}55`;

  const active = items.find((item) => item.id === (effectiveOpenId ?? effectivePreviewId)) ?? items[0];
  const previewFirst = board.previewSide === 'left';

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
            >
              <AccordionItem
                item={item}
                index={index}
                open={open}
                onToggle={() => toggleItem(item.id, open)}
                panelId={`${baseId}-panel-${index}`}
                headerId={`${baseId}-header-${index}`}
                accent={accent}
                titleInk={titleInk}
                muted={muted}
                border={border}
                showDescription={board.showDescription}
                showRoleInPanel={board.showRoleInPanel}
                showCategoryInPanel={board.showCategoryInPanel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const preview = (
    <div className="min-w-0 w-full lg:sticky lg:top-28 lg:self-start xl:top-24">
      <div className="portfolio-acc-enter" style={enterStyle(previewFirst ? 40 : 110)}>
        <AccordionPreview
          item={active}
          surface={previewSurface}
          ink={titleInk}
          muted={muted}
          accent={accent}
          toolsLabel={board.toolsLabel?.trim() || 'Tools I use'}
          showToolsLabel={board.showToolsLabel}
          showTools={board.showTools}
          showConsult={board.showConsult}
          consultLabel={board.consultLabel}
          shiftRef={previewShiftRef}
        />
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`grid w-full items-start gap-10 lg:gap-16 xl:gap-20 ${
        previewFirst
          ? 'lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.9fr)]'
          : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.18fr)]'
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
