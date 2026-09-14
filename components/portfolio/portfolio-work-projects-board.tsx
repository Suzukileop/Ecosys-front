'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
} from '@/components/portfolio/portfolio-work-settings';

const BOARD_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const ENTER_KICKER: CSSProperties = { opacity: 0, transform: 'translateY(14px)' };
const ENTER_HEADLINE: CSSProperties = { opacity: 0, transform: 'translateY(22px)' };
const ENTER_TRAIL: CSSProperties = { opacity: 0, transform: 'translateY(12px)' };
const ENTER_CARD: CSSProperties = { opacity: 0, transform: 'translateY(28px)' };

function workToolLabels(item: MarketplaceContentItem, max = 12): string[] {
  return Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(0, max);
}

function workRoleLabel(item: MarketplaceContentItem): string {
  return item.role?.trim() || '';
}

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Nested portfolio shells (pages mode) often scroll instead of `window`. */
function boardScrollRoots(el: HTMLElement | null): EventTarget[] {
  const targets: EventTarget[] = [window];
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const overflowY = String(getComputedStyle(node).overflowY);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      targets.push(node);
    }
    node = node.parentElement;
  }
  return targets;
}

function editorialHeadline(text: string): ReactNode {
  const trimmed = text.trim();
  const idx = trimmed.search(/\s+/);
  if (idx === -1) {
    return <span className="font-semibold">{trimmed}</span>;
  }
  return (
    <>
      <span className="font-light italic">{trimmed.slice(0, idx)}</span>{' '}
      <span className="font-semibold">{trimmed.slice(idx).trimStart()}</span>
    </>
  );
}

function boardEnterStyle(
  entered: boolean,
  hidden: CSSProperties,
  delayMs: number,
  instant: boolean
): CSSProperties {
  if (!entered) {
    return hidden;
  }
  if (instant) {
    return { opacity: 1, transform: 'translateY(0px)', transition: 'none' };
  }
  return {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: `opacity 0.8s ${BOARD_EASE} ${delayMs}ms, transform 0.95s ${BOARD_EASE} ${delayMs}ms`,
  };
}

function useBoardInView(
  rootRef: RefObject<HTMLElement | null>,
  readyKey: string | number
): { entered: boolean; instant: boolean } {
  const [entered, setEntered] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      setInstant(true);
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '80px 0px' }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [readyKey]);

  return { entered, instant };
}

function useBoardScrollKinetic(
  rootRef: RefObject<HTMLElement | null>,
  onFrame: (root: HTMLElement, relative: number) => void,
  readyKey: string | number
): void {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const mq = window.matchMedia('(min-width: 768px)');
    const scrollRoots = boardScrollRoots(root);
    let raf = 0;

    const tick = () => {
      raf = 0;
      if (!mq.matches) {
        onFrameRef.current(root, 0);
        return;
      }
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const relative = Math.max(0, vh * 0.4 - rect.top);
      onFrameRef.current(root, relative);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    scrollRoots.forEach((target) => {
      target.addEventListener('scroll', onScroll, { passive: true });
    });
    mq.addEventListener('change', onScroll);
    tick();

    return () => {
      scrollRoots.forEach((target) => {
        target.removeEventListener('scroll', onScroll);
      });
      mq.removeEventListener('change', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      onFrameRef.current(root, 0);
    };
  }, [readyKey]);
}

/**
 * Header for Projects board: micro kicker → editorial headline.
 * Extra space below the title lets the grid breathe.
 */
export function ProjectsBoardSectionHeader({
  title,
  subtitle,
  accentColor,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const kicker = title.trim();
  const headline = subtitle?.trim() || '';
  const ink = titleColor || subtitleColor;
  const { entered, instant } = useBoardInView(headerRef, `${kicker}|${headline}`);

  useBoardScrollKinetic(
    headerRef,
    (root, relative) => {
      const kickerEl = root.querySelector<HTMLElement>('[data-board-scroll="kicker"]');
      const headlineEl = root.querySelector<HTMLElement>('[data-board-scroll="headline"]');
      const trailEl = root.querySelector<HTMLElement>('[data-board-scroll="trail"]');
      if (kickerEl) {
        kickerEl.style.transform = `translateY(${(-relative * 0.04).toFixed(2)}px)`;
      }
      if (headlineEl) {
        headlineEl.style.transform = `translateY(${(-relative * 0.08).toFixed(2)}px)`;
      }
      if (trailEl) {
        trailEl.style.transform = `translateY(${(-relative * 0.03).toFixed(2)}px)`;
      }
    },
    `${kicker}|${headline}`
  );

  const headingClass =
    'max-w-[19ch] text-[2.05rem] font-normal leading-[1.12] tracking-[-0.038em] sm:text-[2.75rem] lg:text-[3.35rem] lg:leading-[1.06]';

  return (
    <header
      ref={headerRef}
      className={`mb-16 w-full pt-2 sm:mb-24 sm:pt-4 lg:mb-32 lg:pt-6 ${className}`.trim()}
    >
      <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between sm:gap-12 lg:gap-20">
        <div className="min-w-0 max-w-3xl">
          {kicker && headline ? (
            <div data-board-scroll="kicker">
              <p
                className="text-[0.68rem] font-medium uppercase tracking-[0.22em]"
                style={{
                  color: accentColor,
                  ...boardEnterStyle(entered, ENTER_KICKER, 40, instant),
                }}
              >
                {kicker}
              </p>
            </div>
          ) : null}
          {headline ? (
            <div data-board-scroll="headline">
              <h2
                className={`${headingClass} ${kicker ? 'mt-5 sm:mt-6' : ''}`}
                style={{
                  color: ink,
                  ...boardEnterStyle(entered, ENTER_HEADLINE, 140, instant),
                }}
              >
                {editorialHeadline(headline)}
              </h2>
            </div>
          ) : kicker ? (
            <div data-board-scroll="headline">
              <h2
                className={headingClass}
                style={{
                  color: titleColor,
                  ...boardEnterStyle(entered, ENTER_HEADLINE, 80, instant),
                }}
              >
                {editorialHeadline(kicker)}
              </h2>
            </div>
          ) : null}
        </div>
        {trailing ? (
          <div data-board-scroll="trail" className="shrink-0 sm:pt-1.5">
            <div style={boardEnterStyle(entered, ENTER_TRAIL, 240, instant)}>{trailing}</div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ConsultButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'pointer-events-auto inline-flex items-center gap-2 border border-white/75 bg-black/35 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md transition duration-300 ease-out hover:bg-white hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  const content = (
    <>
      <span>{label}</span>
      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 8h9M8.5 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-pf-no-color-transition=""
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} data-pf-no-color-transition="">
      {content}
    </Link>
  );
}

function ProjectsBoardThumbnail({
  url,
  alt,
  surface,
  consultHref,
  consultLabel,
  showConsult,
}: {
  url: string | null;
  alt: string;
  surface: string;
  consultHref?: string | null;
  consultLabel: string;
  showConsult: boolean;
}) {
  const consult = showConsult && consultHref?.trim();

  return (
    <div
      className="relative aspect-[3/2] w-full shrink-0 overflow-hidden"
      style={{ backgroundColor: surface }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-700 ease-out will-change-transform group-hover/board-card:scale-[1.04]"
          data-pf-no-color-transition=""
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/50 via-neutral-950/0 to-transparent transition-opacity duration-500 ease-out group-hover/board-card:from-neutral-950/60"
        aria-hidden
      />
      {consult ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-start p-5 sm:p-6">
          <ConsultButton href={consultHref!.trim()} label={consultLabel} />
        </div>
      ) : null}
    </div>
  );
}

function ProjectsBoardCard({
  item,
  presentation,
  index,
  entered,
  instant,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  index: number;
  entered: boolean;
  instant: boolean;
}) {
  const board = presentation.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS;
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = board.showThumbnail;
  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showMetaRow = showRole || showCategory;
  const showTools = presentation.showCardTools !== false && tools.length > 0;
  const showFooter = showMetaRow || showTools;
  const showConsult = board.showConsultOnHover && Boolean(href);

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const mutedMeta = presentation.subtitleColor || presentation.categoryMutedColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const descriptionColor =
    presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const tagInk = presentation.elementStyles?.toolsList?.color || presentation.subtitleColor;
  const tagSurface = presentation.cardBorderColor;
  const hasCardFill = presentation.cardBackgroundEnabled;
  const hasBorder = presentation.cardBorder !== 'none';

  const consultLabel = board.consultLabel?.trim() || 'Consult';
  const enterDelay = 90 + Math.min(index, 8) * 95;

  const cardVars: CSSProperties = {
    ...(hasCardFill ? ({ ['--pf-board-card-bg' as string]: presentation.cardBackgroundColor } as CSSProperties) : {}),
    ...(hasBorder ? ({ ['--pf-board-card-line' as string]: presentation.cardBorderColor } as CSSProperties) : {}),
    ...boardEnterStyle(entered, ENTER_CARD, enterDelay, instant),
  };

  return (
    <article
      data-board-card=""
      className="group/board-card pf-projects-board-card flex h-full min-h-0 flex-col overflow-hidden rounded-xl"
      style={cardVars}
      data-pf-no-color-transition=""
    >
      {showThumb ? (
        <ProjectsBoardThumbnail
          url={mediaUrl}
          alt={item.title}
          surface={tagSurface || 'transparent'}
          consultHref={href}
          consultLabel={consultLabel}
          showConsult={showConsult}
        />
      ) : null}

      <div
        className={`flex min-h-0 flex-1 flex-col ${
          showThumb ? 'px-6 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-10' : 'p-6 sm:p-8'
        }`}
      >
        {presentation.showCardTitle !== false ? (
          <h3
            className="text-[1.32rem] font-semibold leading-[1.22] tracking-[-0.03em] sm:text-[1.55rem] sm:leading-[1.2]"
            style={{ color: titleColor }}
          >
            {item.title}
          </h3>
        ) : null}

        {presentation.showCardDescription !== false && description ? (
          <p
            className={`max-w-[42em] text-[1.02rem] leading-[1.75] sm:text-[1.0625rem] sm:leading-[1.8] ${
              presentation.showCardTitle !== false ? 'mt-4 sm:mt-5' : ''
            }`}
            style={{ color: descriptionColor }}
          >
            {description}
          </p>
        ) : null}

        {showFooter ? (
          <div className="mt-auto flex flex-col gap-3 pt-8 sm:pt-10">
            {showMetaRow ? (
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                {showRole ? (
                  <p
                    className="min-w-0 text-[11px] font-medium uppercase tracking-[0.16em]"
                    style={{ color: accent }}
                  >
                    {role}
                  </p>
                ) : null}
                {showRole && showCategory ? (
                  <span
                    aria-hidden
                    className="text-[11px] font-normal"
                    style={{ color: mutedMeta, opacity: 0.35 }}
                  >
                    ·
                  </span>
                ) : null}
                {showCategory ? (
                  <p
                    className="text-[11px] font-normal uppercase tracking-[0.14em]"
                    style={{ color: mutedMeta, opacity: 0.78 }}
                  >
                    {category}
                  </p>
                ) : null}
              </div>
            ) : null}
            {showTools ? (
              <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5" aria-label="Tools">
                {tools.map((tool, toolIndex) => (
                  <li
                    key={tool}
                    className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: tagInk }}
                  >
                    {toolIndex > 0 ? (
                      <span aria-hidden className="font-normal opacity-35">
                        /
                      </span>
                    ) : null}
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Two-up project cards — Projects board design only. Equal height, aligned row. */
export function ProjectsBoardGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  forceSingleColumn?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { entered, instant } = useBoardInView(
    rootRef,
    `${items.length}:${forceSingleColumn ? '1' : '2'}`
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={
        forceSingleColumn
          ? 'grid grid-cols-1 items-stretch gap-y-12 sm:gap-y-16'
          : 'grid grid-cols-1 items-stretch gap-y-12 sm:gap-y-16 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-16 xl:gap-x-16'
      }
    >
      {items.map((item, index) => (
        <ProjectsBoardCard
          key={item.id}
          item={item}
          presentation={presentation}
          index={index}
          entered={entered}
          instant={instant}
        />
      ))}
    </div>
  );
}

export function isProjectsBoardDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-board';
}
