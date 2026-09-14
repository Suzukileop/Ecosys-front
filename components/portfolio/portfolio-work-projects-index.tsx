'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_INDEX_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsIndexSettings,
} from '@/components/portfolio/portfolio-work-settings';

const INDEX_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INDEX_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    max
  );
}

function formatIndexNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function indexRowPaddingClass(gap: PortfolioWorkProjectsIndexSettings['rowGap']): string {
  if (gap === 'tight') return 'py-7 sm:py-8';
  if (gap === 'xl') return 'py-14 sm:py-16 lg:py-20';
  return 'py-10 sm:py-12 lg:py-14';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function indexScrollRoot(el: HTMLElement | null): HTMLElement | null {
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

function indexScrollTarget(el: HTMLElement | null): HTMLElement | Window {
  return indexScrollRoot(el) ?? window;
}

function wordLetterCount(word: string): number {
  return (word.match(/\p{L}/gu) ?? []).length;
}

/** Italicize the last word when it stays readable (2+ words, 4+ letters). */
function splitEditorialTitle(title: string): { lead: string; italic: string } | null {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const last = words[words.length - 1];
  if (wordLetterCount(last) < 4) return null;
  return { lead: words.slice(0, -1).join(' '), italic: last };
}

function EditorialTitleText({ text }: { text: string }) {
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function IndexTitleAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  const style: CSSProperties = { color: 'inherit', textDecoration: 'none' };
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} no-underline`}
        style={style}
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${className} no-underline`} style={style} data-pf-no-color-transition="">
      {children}
    </Link>
  );
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${INDEX_EASE} ${delayMs}ms, transform 0.95s ${INDEX_EASE} ${delayMs}ms`;
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

/**
 * Index header — editorial kicker, italic last word, trailing hairline.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsIndexSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  entryCount,
  accent,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  trailing?: ReactNode;
  entryCount?: number;
  accent?: string;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;
  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;
  const {
    fontSize: _fs,
    lineHeight: _lh,
    letterSpacing: _ls,
    fontStyle: incomingFontStyle,
    ...restTitleStyle
  } = titleStyle ?? {};
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

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

    const ioRoot = indexScrollRoot(header);
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
      className={`pf-work-index-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={INDEX_HIDDEN}
    >
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-[11px]"
              style={{ color: subtitleColor }}
            >
              {countLabel || 'Index'}
            </p>
          </div>
          {heading ? (
            <h2
              className={
                titleClassName.trim() ||
                'font-semibold tracking-[-0.045em]'
              }
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.25rem)',
                lineHeight: 1.06,
              }}
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-md text-[15px] leading-[1.6] sm:text-base ${heading ? 'mt-4' : ''}`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
          {trailing}
          <span
            className="hidden h-px w-16 sm:block lg:w-24"
            style={{ backgroundColor: mark, opacity: 0.35 }}
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}

function IndexStack({
  tools,
  ink,
}: {
  tools: string[];
  ink: string;
}) {
  if (tools.length === 0) return null;
  return (
    <ul
      className="mt-4 flex flex-wrap items-center gap-x-0 gap-y-1.5 sm:mt-5"
      aria-label="Stack"
    >
      {tools.map((tool, index) => (
        <li
          key={tool}
          className="flex items-center text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]"
          style={{ color: ink, opacity: 0.62 }}
        >
          {index > 0 ? (
            <span className="mx-2.5 opacity-40" aria-hidden>
              ·
            </span>
          ) : null}
          {tool}
        </li>
      ))}
    </ul>
  );
}

function IndexMarker({
  index,
  marker,
  accent,
  muted,
}: {
  index: number;
  marker: 'number' | 'bullet';
  accent: string;
  muted: string;
}) {
  if (marker === 'bullet') {
    return (
      <span
        className="mt-[0.9rem] inline-flex h-1.5 w-1.5 shrink-0 rounded-full lg:mt-[1.15rem]"
        style={{ backgroundColor: accent || muted, opacity: 0.7 }}
        aria-hidden
      />
    );
  }
  return (
    <p
      className="pt-[0.9rem] text-[10px] font-medium tracking-[0.22em] tabular-nums sm:text-[11px] lg:pt-[1.15rem]"
      style={{ color: muted, opacity: 0.48 }}
    >
      {formatIndexNumber(index)}
    </p>
  );
}

function IndexHairline({ color }: { color: string }) {
  return (
    <div className="flex" aria-hidden>
      <span className="hidden w-[3.25rem] shrink-0 lg:block xl:w-[3.5rem]" />
      <span className="hidden w-10 shrink-0 lg:block xl:w-14" />
      <span
        className="pf-work-index-rule block h-px origin-left"
        style={{ backgroundColor: color }}
        data-pf-no-color-transition=""
      />
    </div>
  );
}

function IndexRow({
  item,
  index,
  presentation,
  board,
  showRule,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  board: PortfolioWorkProjectsIndexSettings;
  showRule: boolean;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;
  const rule = presentation.cardBorderColor || muted;
  const tools = workToolLabels(item);
  const description = item.description?.trim() || '';
  const showStack = board.showStack && tools.length > 0;
  const showDescription = board.showDescription && Boolean(description);
  const href = item.linkUrl?.trim() || null;
  const title = item.title?.trim() || 'Untitled';
  const titleClassName =
    'inline-block text-[1.55rem] font-semibold tracking-[-0.04em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/index-row:translate-x-1.5 sm:text-[1.85rem] lg:text-[2.2rem] lg:leading-[1.12]';

  return (
    <article
      className="pf-work-index-row group/index-row"
      data-index-row=""
      data-index={String(index)}
      data-pf-no-color-transition=""
      style={{
        ...INDEX_HIDDEN,
        ['--pf-index-ink' as string]: titleColor,
        ['--pf-index-ink-hover' as string]: `color-mix(in srgb, ${titleColor} 72%, ${accent} 28%)`,
      }}
    >
      <div
        className={`grid grid-cols-1 gap-5 sm:gap-6 ${indexRowPaddingClass(board.rowGap)} lg:grid-cols-[3.25rem_minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-x-10 xl:grid-cols-[3.5rem_minmax(0,1.45fr)_minmax(0,0.78fr)] xl:gap-x-14`}
      >
        {board.showNumber ? (
          <div className="pf-work-index-mark flex justify-start lg:justify-center" data-index-mark="">
            <IndexMarker
              index={index}
              marker={board.indexMarker ?? 'number'}
              accent={accent}
              muted={muted}
            />
          </div>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}

        <div className="min-w-0" data-index-title="" data-pf-no-color-transition="">
          <h3
            className={titleClassName}
            style={{ color: 'var(--pf-index-ink)' }}
            data-pf-no-color-transition=""
          >
            {href ? (
              <IndexTitleAnchor
                href={href}
                className="rounded-sm text-inherit outline-none transition-colors duration-500 group-hover/index-row:[color:var(--pf-index-ink-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <EditorialTitleText text={title} />
              </IndexTitleAnchor>
            ) : (
              <span className="text-inherit transition-colors duration-500 group-hover/index-row:[color:var(--pf-index-ink-hover)]">
                <EditorialTitleText text={title} />
              </span>
            )}
          </h3>
          {showStack ? <IndexStack tools={tools} ink={muted} /> : null}
        </div>

        {showDescription ? (
          <div
            className="max-w-md lg:justify-self-end xl:max-w-sm"
            data-index-copy=""
            data-pf-no-color-transition=""
          >
            <p
              className="text-[13px] leading-[1.6] transition-opacity duration-500 sm:text-sm lg:pt-1.5 lg:text-right"
              style={{ color: muted, opacity: 0.82 }}
            >
              {description}
            </p>
          </div>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}
      </div>

      {showRule ? <IndexHairline color={rule} /> : null}
    </article>
  );
}

/** Numbered rows + quiet inset separators — Projects index design only. */
export function ProjectsIndexGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const board = mergeProjectsIndexSettings(
    DEFAULT_PROJECTS_INDEX_SETTINGS,
    presentation.projectsIndex
  );
  const rule = presentation.cardBorderColor || presentation.subtitleColor;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('[data-index-row]')];
    if (rows.length === 0) return;

    if (prefersReducedMotion()) {
      rows.forEach(showElementNow);
      return;
    }

    const ioRoot = indexScrollRoot(root);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const i = Number(el.dataset.index) || 0;
          revealElement(el, Math.min(i * 70, 280));
          observer.unobserve(el);
        });
      },
      { threshold: 0.14, root: ioRoot, rootMargin: '0px 0px -6% 0px' }
    );
    rows.forEach((row) => observer.observe(row));

    const failSafe = window.setTimeout(() => {
      rows.forEach((row) => {
        if (row.dataset.revealed !== 'true') showElementNow(row);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    let scroller: HTMLElement | Window | null = null;
    let frame = 0;

    const resetKinetic = () => {
      root.querySelectorAll<HTMLElement>('[data-index-title], [data-index-copy]').forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
      });
    };

    const applyKinetic = () => {
      const vh = window.innerHeight;
      const rows = root.querySelectorAll<HTMLElement>('[data-index-row]');
      rows.forEach((row) => {
        if (row.dataset.revealed !== 'true') return;
        const title = row.querySelector<HTMLElement>('[data-index-title]');
        const copy = row.querySelector<HTMLElement>('[data-index-copy]');
        const rect = row.getBoundingClientRect();
        const exitStart = vh * 0.14;
        const t = Math.max(0, Math.min(1, (exitStart - rect.top) / (vh * 0.3)));
        if (title) {
          title.style.transform = `translate3d(0, ${(-22 * t).toFixed(2)}px, 0)`;
        }
        if (copy) {
          copy.style.opacity = String(1 - t * 0.94);
          copy.style.transform = `translate3d(${(14 * t).toFixed(2)}px, ${(10 * t).toFixed(2)}px, 0)`;
        }
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyKinetic();
      });
    };

    const bind = () => {
      unbind();
      if (prefersReducedMotion() || !desktop.matches) {
        resetKinetic();
        return;
      }
      scroller = indexScrollTarget(root);
      scroller.addEventListener('scroll', onScroll, { passive: true });
      applyKinetic();
    };

    const unbind = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      if (scroller) {
        scroller.removeEventListener('scroll', onScroll);
        scroller = null;
      }
    };

    bind();
    desktop.addEventListener('change', bind);
    return () => {
      desktop.removeEventListener('change', bind);
      unbind();
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="pf-work-index w-full" data-pf-no-color-transition="">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pf-work-index-row,
          .pf-work-index-header {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .pf-work-index [data-index-title],
          .pf-work-index [data-index-copy] {
            opacity: 1 !important;
            transform: none !important;
          }
        }
        .pf-work-index-rule {
          width: min(58%, 16rem);
          opacity: 0.2;
          transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pf-work-index-row:hover .pf-work-index-rule,
        .pf-work-index-row:focus-within .pf-work-index-rule {
          width: min(100%, 28rem);
          opacity: 0.42;
        }
      `}</style>
      <div className="flex" aria-hidden>
        <span className="hidden w-[3.25rem] shrink-0 lg:block xl:w-[3.5rem]" />
        <span className="hidden w-10 shrink-0 lg:block xl:w-14" />
        <span
          className="mb-1 block h-px w-[min(48%,14rem)]"
          style={{ backgroundColor: rule, opacity: 0.2 }}
        />
      </div>
      {items.map((item, index) => (
        <IndexRow
          key={item.id}
          item={item}
          index={index}
          presentation={presentation}
          board={board}
          showRule
        />
      ))}
    </div>
  );
}

export function isProjectsIndexDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-index';
}
