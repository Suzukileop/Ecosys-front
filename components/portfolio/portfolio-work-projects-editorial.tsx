'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsEditorialSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_EDITORIAL_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsEditorialSettings,
} from '@/components/portfolio/portfolio-work-settings';

const DETAIL_FADE_MS = 260;
const EDITORIAL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EDITORIAL_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 26px, 0)',
};
const EDITORIAL_REDUCED_CSS = `
@media (prefers-reduced-motion: reduce) {
  .pf-work-editorial-header,
  .pf-work-editorial [data-editorial-item],
  .pf-work-editorial [data-editorial-rail] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .pf-work-editorial [data-editorial-kinetic],
  .pf-work-editorial [data-editorial-num],
  .pf-work-editorial [data-editorial-copy],
  .pf-work-editorial [data-editorial-media] {
    transform: none !important;
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

function formatEditorialNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function editorialIoRoot(node: HTMLElement | null): Element | null {
  const parent = getScrollParent(node);
  return parent instanceof Window ? null : parent;
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

function EditorialTitleText({ text, italic = true }: { text: string; italic?: boolean }) {
  if (!italic) return <>{text}</>;
  const parts = splitEditorialTitle(text);
  if (!parts) {
    return <span className="font-semibold tracking-[-0.04em]">{text}</span>;
  }
  return (
    <>
      <span className="font-light tracking-[-0.045em]">{parts.lead}</span>{' '}
      <span className="font-semibold italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.9s ${EDITORIAL_EASE} ${delayMs}ms, transform 1.05s ${EDITORIAL_EASE} ${delayMs}ms`;
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

function EditorialHairline({
  color,
  widthClass = 'w-8 sm:w-10',
}: {
  color: string;
  widthClass?: string;
}) {
  return (
    <span
      className={`block h-px ${widthClass}`}
      style={{ backgroundColor: color, opacity: 0.72 }}
      aria-hidden
    />
  );
}

function EditorialMetaBlock({
  label,
  accent,
  ink,
  children,
}: {
  label: string;
  accent: string;
  ink: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p
        className="text-[10px] font-medium uppercase tracking-[0.26em] sm:text-[11px]"
        style={{ color: accent, opacity: 0.88 }}
      >
        {label}
      </p>
      <EditorialHairline color={accent} widthClass="mt-2.5 w-7 sm:w-8" />
      <div
        className="mt-4 text-sm font-light leading-[1.7] sm:text-[0.95rem] sm:leading-[1.75]"
        style={{ color: ink }}
      >
        {children}
      </div>
    </div>
  );
}

function EditorialIdentity({
  item,
  index,
  presentation,
  settings,
  active,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsEditorialSettings;
  active: boolean;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const projectTitleColor =
    presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const role = workRoleLabel(item);
  const title = item.title?.trim() || '';
  const showRole = settings.showRole !== false && Boolean(role);
  const roleLine = showRole
    ? settings.roleLabel?.trim()
      ? `${settings.roleLabel.trim()} / ${role}`
      : role
      : '';

  return (
    <div className="min-w-0" aria-current={active ? 'true' : undefined}>
      <p
        className="font-light italic tabular-nums leading-none tracking-[-0.07em]"
        data-editorial-num=""
        data-pf-no-color-transition=""
        style={{
          color: projectTitleColor,
          fontSize: 'clamp(4.25rem, 11vw, 8.25rem)',
          opacity: active ? 0.22 : 0.08,
          transition: `opacity 0.55s ${EDITORIAL_EASE}`,
        }}
      >
        {formatEditorialNumber(index)}
      </p>

      <div
        className="min-w-0"
        data-editorial-copy=""
        data-pf-no-color-transition=""
        style={{
          opacity: active ? 1 : 0.2,
          transition: `opacity 0.55s ${EDITORIAL_EASE}`,
        }}
      >
        {showRole ? (
          <div className="mt-5 sm:mt-6">
            <EditorialHairline color={accent} />
            <p
              className="mt-3 text-[10px] font-medium uppercase tracking-[0.24em] sm:text-[11px]"
              style={{ color: accent }}
            >
              {roleLine}
            </p>
          </div>
        ) : null}

        {title ? (
          <h3
            className={`max-w-xl text-[1.85rem] leading-[1.08] tracking-[-0.045em] sm:text-[2.35rem] lg:text-[2.75rem] lg:leading-[1.06] ${
              showRole ? 'mt-6 sm:mt-7' : 'mt-6 sm:mt-8'
            }`}
            style={{ color: projectTitleColor }}
          >
            <EditorialTitleText text={title} />
          </h3>
        ) : null}

        {!showRole && !title ? (
          <p className="mt-5 text-sm font-light" style={{ color: muted }}>
            —
          </p>
        ) : null}
      </div>
    </div>
  );
}

function EditorialDetailPanel({
  item,
  presentation,
  settings,
  visible,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsEditorialSettings;
  visible: boolean;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const projectTitleColor =
    presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const stackInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || projectTitleColor;

  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);

  const showDescription = settings.showDescription !== false;
  const showStack = settings.showStack !== false;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const stackLabel = settings.stackLabel?.trim() || 'Stack';

  return (
    <div
      className="flex flex-col gap-8 sm:gap-9 lg:gap-10"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
        transition: `opacity ${DETAIL_FADE_MS}ms ${EDITORIAL_EASE}, transform ${DETAIL_FADE_MS}ms ${EDITORIAL_EASE}`,
      }}
    >
      {showDescription ? (
        <p
          className="max-w-md text-[0.95rem] font-light leading-[1.75] sm:text-base sm:leading-[1.8]"
          style={{ color: muted }}
        >
          {description || '—'}
        </p>
      ) : null}

      {showStack ? (
        <EditorialMetaBlock label={stackLabel} accent={accent} ink={stackInk}>
          {tools.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-y-2" aria-label="Stack">
              {tools.map((tool, toolIndex) => (
                <li key={tool} className="flex items-center">
                  {toolIndex > 0 ? (
                    <span
                      className="mx-2.5 select-none text-sm font-light sm:mx-3"
                      style={{ color: muted, opacity: 0.45 }}
                      aria-hidden
                    >
                      ·
                    </span>
                  ) : null}
                  <span className="text-sm font-medium tracking-[-0.01em] sm:text-[0.95rem]">
                    {tool}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>—</p>
          )}
        </EditorialMetaBlock>
      ) : null}

      {showConsult && href ? (
        <div className="pt-1">
          <EditorialConsultLink href={href} label={consultLabel} accent={accent} tone="panel" />
        </div>
      ) : null}
    </div>
  );
}

function EditorialConsultLink({
  href,
  label,
  accent,
  tone = 'overlay',
}: {
  href: string;
  label: string;
  accent: string;
  tone?: 'overlay' | 'panel';
}) {
  const external = /^https?:\/\//i.test(href);
  const color = tone === 'overlay' ? '#f5f5f5' : accent;
  const className =
    'group/consult inline-flex w-fit items-center gap-2.5 bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-65 focus:outline-none focus-visible:opacity-65 sm:text-xs';

  const content = (
    <>
      <span
        className="border-b pb-[0.12em] transition-[border-color,opacity] duration-300"
        style={{ borderColor: color }}
        data-pf-no-color-transition=""
      >
        {label}
      </span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="h-3 w-3 rotate-45 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
      />
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ color, backgroundColor: 'transparent' }}
        data-pf-no-color-transition=""
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      style={{ color, backgroundColor: 'transparent' }}
      data-pf-no-color-transition=""
    >
      {content}
    </Link>
  );
}

/** Thumbnail only — no border, no radius. Optional hover reveal. */
function EditorialThumbnailPanel({
  item,
  presentation,
  settings,
  visible,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsEditorialSettings;
  visible: boolean;
}) {
  const mediaUrl = item.mediaUrl?.trim() || null;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const fill = presentation.cardBorderColor || presentation.subtitleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#ea580c';
  const stackInk = '#f5f5f5';

  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);

  const hoverEnabled = settings.thumbnailHoverReveal !== false;
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const hasHoverContent = showDescription || showStack || showConsult;

  return (
    <div
      className="w-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
        transition: `opacity ${DETAIL_FADE_MS}ms ${EDITORIAL_EASE}, transform ${DETAIL_FADE_MS}ms ${EDITORIAL_EASE}`,
      }}
    >
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-none border-0"
        style={{ backgroundColor: `${fill}33` }}
      >
        {mediaUrl ? (
          <div className="absolute inset-0" data-editorial-media="" data-pf-no-color-transition="">
            <Image
              src={mediaUrl}
              alt={item.title?.trim() || 'Project'}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="rounded-none object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
              priority={false}
              data-pf-no-color-transition=""
            />
          </div>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-light"
            style={{ color: muted }}
          >
            Add a thumbnail in Information → Portfolio
          </div>
        )}

        {hoverEnabled && hasHoverContent ? (
          <>
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.42) 46%, rgba(0,0,0,0.08) 74%, transparent 100%)',
              }}
              aria-hidden
              data-pf-no-color-transition=""
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-4 flex-col gap-4 px-5 pb-5 pt-16 opacity-0 transition duration-700 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 sm:gap-5 sm:px-6 sm:pb-6"
              data-pf-no-color-transition=""
            >
              {showDescription ? (
                <p className="max-w-md text-sm font-light leading-[1.7] text-white/88 sm:text-[0.95rem]">
                  {description}
                </p>
              ) : null}

              {showStack ? (
                <div>
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.24em] sm:text-[11px]"
                    style={{ color: accent }}
                  >
                    {settings.stackLabel?.trim() || 'Stack'}
                  </p>
                  <EditorialHairline color={accent} widthClass="mt-2 w-7" />
                  <ul className="mt-3 flex flex-wrap items-center gap-y-1.5" aria-label="Stack">
                    {tools.map((tool, toolIndex) => (
                      <li key={tool} className="flex items-center">
                        {toolIndex > 0 ? (
                          <span className="mx-2 select-none text-sm text-white/40" aria-hidden>
                            ·
                          </span>
                        ) : null}
                        <span
                          className="text-sm font-medium tracking-[-0.01em] sm:text-[0.95rem]"
                          style={{ color: stackInk }}
                        >
                          {tool}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {showConsult && href ? (
                <div className="pt-1">
                  <EditorialConsultLink href={href} label={consultLabel} accent={accent} />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function EditorialRightRail({
  item,
  presentation,
  settings,
  visible,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsEditorialSettings;
  visible: boolean;
}) {
  if ((settings.rightPanel ?? 'info') === 'thumbnail') {
    return (
      <EditorialThumbnailPanel
        item={item}
        presentation={presentation}
        settings={settings}
        visible={visible}
      />
    );
  }
  return (
    <EditorialDetailPanel
      item={item}
      presentation={presentation}
      settings={settings}
      visible={visible}
    />
  );
}

export function ProjectsEditorialSectionHeader({
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

  const {
    fontSize: _fs,
    lineHeight: _lh,
    letterSpacing: _ls,
    fontStyle: incomingFontStyle,
    ...restTitleStyle
  } = titleStyle ?? {};
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = subtitleColor || resolvedTitleColor;

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, root: editorialIoRoot(header), rootMargin: '40px 0px' }
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
      className={`pf-work-editorial-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={EDITORIAL_HIDDEN}
    >
      <style>{EDITORIAL_REDUCED_CSS}</style>
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <>
              <EditorialHairline color={mark} widthClass="mb-5 w-8 sm:mb-6 sm:w-10" />
              <h2
                className={titleClassName.trim() || 'tracking-[-0.045em]'}
                style={{
                  ...restTitleStyle,
                  color: resolvedTitleColor,
                  fontSize: 'clamp(2.45rem, 6.2vw, 4.75rem)',
                  lineHeight: 1.05,
                }}
              >
                {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
              </h2>
            </>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-[15px] font-light leading-[1.7] sm:text-base ${
                heading ? 'mt-4' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? (
          <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
            {trailing}
            <span
              className="hidden h-px w-14 sm:block lg:w-20"
              style={{ backgroundColor: mark, opacity: 0.32 }}
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** Numbered list left + sticky centered detail rail right (scroll-synced). */
export function ProjectsEditorialGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsEditorialSettings(
    DEFAULT_PROJECTS_EDITORIAL_SETTINGS,
    presentation.projectsEditorial
  );
  const rootRef = useRef<HTMLElement>(null);
  const listShiftRef = useRef<HTMLDivElement>(null);
  const railShiftRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [detailVisible, setDetailVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setActiveIndex(0);
      setDisplayIndex(0);
      return;
    }
    setActiveIndex((index) => Math.min(index, items.length - 1));
    setDisplayIndex((index) => Math.min(index, items.length - 1));
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = [
      ...root.querySelectorAll<HTMLElement>('[data-editorial-item]'),
      ...root.querySelectorAll<HTMLElement>('[data-editorial-rail]'),
    ];
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      targets.forEach(showElementNow);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const i = Number(el.dataset.editorialItem ?? el.dataset.editorialRail ?? 0);
          revealElement(el, Math.min(i * 70, 280));
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, root: editorialIoRoot(root), rootMargin: '0px 0px -6% 0px' }
    );
    targets.forEach((el) => observer.observe(el));

    const failSafe = window.setTimeout(() => {
      targets.forEach((el) => {
        if (el.dataset.revealed !== 'true') showElementNow(el);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [items.length, settings.rightPanel]);

  useEffect(() => {
    if (items.length <= 1) return;

    let frame = 0;
    const updateActive = () => {
      const mid = window.innerHeight * 0.42;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) return;
        const center = rect.top + rect.height * 0.35;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActiveIndex((current) => (current === best ? current : best));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActive();
      });
    };

    const root = rootRef.current;
    const scrollRoot = getScrollParent(root);
    updateActive();
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === displayIndex) {
      setDetailVisible(true);
      return;
    }
    setDetailVisible(false);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setDisplayIndex(activeIndex);
      requestAnimationFrame(() => setDetailVisible(true));
    }, DETAIL_FADE_MS);
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [activeIndex, displayIndex]);

  useEffect(() => {
    const root = rootRef.current;
    const list = listShiftRef.current;
    const rail = railShiftRef.current;
    if (!root || !list || !rail) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scroller: HTMLElement | Window | null = null;
    let frame = 0;

    const resetKinetic = () => {
      list.style.transform = '';
      list.style.willChange = 'auto';
      rail.style.transform = '';
      rail.style.willChange = 'auto';
      root.querySelectorAll<HTMLElement>('[data-editorial-num], [data-editorial-copy]').forEach((el) => {
        el.style.transform = '';
      });
      root.querySelectorAll<HTMLElement>('[data-editorial-media]').forEach((el) => {
        el.style.transform = '';
      });
    };

    const applyKinetic = () => {
      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;

      const relative = vh * 0.42 - rect.top;
      const listY = Math.max(-18, Math.min(18, relative * 0.032));
      const railY = Math.max(-26, Math.min(26, -relative * 0.055));
      list.style.transform = `translate3d(0, ${listY.toFixed(2)}px, 0)`;
      rail.style.transform = `translate3d(0, ${railY.toFixed(2)}px, 0)`;

      itemRefs.current.forEach((item) => {
        if (!item || item.dataset.revealed !== 'true') return;
        const itemRect = item.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (vh * 0.16 - itemRect.top) / (vh * 0.32)));
        const num = item.querySelector<HTMLElement>('[data-editorial-num]');
        const copy = item.querySelector<HTMLElement>('[data-editorial-copy]');
        if (num) num.style.transform = `translate3d(0, ${(-14 * t).toFixed(2)}px, 0)`;
        if (copy) copy.style.transform = `translate3d(0, ${(10 * t).toFixed(2)}px, 0)`;
      });

      const media = rail.querySelector<HTMLElement>('[data-editorial-media]');
      if (media) {
        media.style.transform = `translate3d(0, ${(railY * 0.45).toFixed(2)}px, 0)`;
      }
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
      if (reduceMq.matches || !desktop.matches) {
        resetKinetic();
        return;
      }
      list.style.willChange = 'transform';
      rail.style.willChange = 'transform';
      scroller = getScrollParent(root);
      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
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
      window.removeEventListener('resize', onScroll);
    };

    bind();
    desktop.addEventListener('change', bind);
    reduceMq.addEventListener('change', bind);
    return () => {
      desktop.removeEventListener('change', bind);
      reduceMq.removeEventListener('change', bind);
      unbind();
      resetKinetic();
    };
  }, [items.length, settings.rightPanel]);

  if (items.length === 0) return null;

  const safeDisplay = Math.max(0, Math.min(displayIndex, items.length - 1));
  const activeItem = items[safeDisplay]!;
  const thumbnailMode = (settings.rightPanel ?? 'info') === 'thumbnail';

  return (
    <section
      ref={rootRef}
      className="pf-work-editorial w-full"
      aria-label="Project editorial"
      data-pf-no-color-transition=""
    >
      <style>{EDITORIAL_REDUCED_CSS}</style>

      {/* Mobile: stacked identity + details/thumbnail per project */}
      <div className="flex flex-col gap-16 sm:hidden">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col gap-8"
            data-editorial-item={index}
            data-pf-no-color-transition=""
            style={EDITORIAL_HIDDEN}
          >
            <EditorialIdentity
              item={item}
              index={index}
              presentation={presentation}
              settings={settings}
              active
            />
            <EditorialRightRail
              item={item}
              presentation={presentation}
              settings={settings}
              visible
            />
          </div>
        ))}
      </div>

      {/* Desktop: left scroll list + sticky centered right rail */}
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] sm:items-start sm:gap-x-10 lg:gap-x-14 xl:gap-x-16">
        <div
          ref={listShiftRef}
          className="min-w-0"
          data-editorial-kinetic="list"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-editorial-item={index}
              className={index > 0 ? 'mt-16 lg:mt-24' : ''}
              data-pf-no-color-transition=""
              style={EDITORIAL_HIDDEN}
            >
              <EditorialIdentity
                item={item}
                index={index}
                presentation={presentation}
                settings={settings}
                active={index === activeIndex}
              />
            </div>
          ))}
          <div className="h-[28vh]" aria-hidden />
        </div>

        <div className="relative min-h-full min-w-0">
          <div
            className="sticky z-10"
            style={
              thumbnailMode
                ? {
                    top: 'calc((100dvh + var(--portfolio-nav-top-clearance, 4.75rem)) / 2)',
                    transform: 'translateY(-50%)',
                  }
                : {
                    top: 'max(1.5rem, calc(50vh - 11rem))',
                  }
            }
          >
            <div
              data-editorial-rail="0"
              data-pf-no-color-transition=""
              style={EDITORIAL_HIDDEN}
            >
              <div ref={railShiftRef} data-editorial-kinetic="rail">
                <EditorialRightRail
                  item={activeItem}
                  presentation={presentation}
                  settings={settings}
                  visible={detailVisible}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function isProjectsEditorialDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-editorial';
}
