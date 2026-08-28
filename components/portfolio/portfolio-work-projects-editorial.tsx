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

const DETAIL_FADE_MS = 220;

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
        className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <span
        className="mt-2.5 block h-px w-11 sm:w-14"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="mt-4 text-sm leading-relaxed sm:text-[0.95rem]" style={{ color: ink }}>
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
  const role = workRoleLabel(item);
  const title = item.title?.trim() || '';
  const showRole = settings.showRole !== false && Boolean(role);
  const roleLine = showRole
    ? settings.roleLabel?.trim()
      ? `${settings.roleLabel.trim()} / ${role}`
      : role
    : '';

  return (
    <div
      className="min-w-0 transition-opacity duration-300 ease-out"
      style={{ opacity: active ? 1 : 0.18 }}
    >
      <div
        className="relative w-full overflow-visible"
        style={{ height: 'clamp(10rem, 28vw, 19rem)' }}
      >
        <p
          className="absolute left-0 top-0 font-serif font-bold leading-none tracking-[-0.08em]"
          style={{
            color: projectTitleColor,
            fontSize: 'clamp(6rem, 18vw, 11.5rem)',
            transform: 'scaleY(1.75) scaleX(0.72)',
            transformOrigin: 'left top',
            width: 'max-content',
          }}
        >
          {formatEditorialNumber(index)}
        </p>
      </div>

      {showRole ? (
        <div className="mt-5 sm:mt-6">
          <span
            className="mb-3 block h-px w-10 sm:w-12"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
            style={{ color: accent }}
          >
            {roleLine}
          </p>
        </div>
      ) : null}

      {title ? (
        <h3
          className={`max-w-xl font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-[2.85rem] lg:leading-[1.15] ${showRole ? 'mt-8 sm:mt-10' : 'mt-8 sm:mt-10'}`}
          style={{ color: projectTitleColor }}
        >
          {title}
        </h3>
      ) : null}
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
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)',
        transition: `opacity ${DETAIL_FADE_MS}ms ease-out, transform ${DETAIL_FADE_MS}ms ease-out`,
      }}
    >
      {showDescription ? (
        <div className="min-w-0">
          <p
            className="max-w-md text-base leading-relaxed sm:text-lg lg:text-[1.2rem] lg:leading-relaxed"
            style={{ color: muted }}
          >
            {description || '—'}
          </p>
        </div>
      ) : null}

      {showStack ? (
        <EditorialMetaBlock label={stackLabel} accent={accent} ink={stackInk}>
          {tools.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-y-2" aria-label="Stack">
              {tools.map((tool, toolIndex) => (
                <li key={tool} className="flex items-center">
                  {toolIndex > 0 ? (
                    <span
                      className="mx-2.5 select-none text-sm font-normal sm:mx-3"
                      style={{ color: muted }}
                      aria-hidden
                    >
                      |
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
        <div className="pt-2">
          <EditorialConsultPill href={href} label={consultLabel} accent={accent} tone="panel" />
        </div>
      ) : null}
    </div>
  );
}

function EditorialConsultPill({
  href,
  label,
  accent,
  tone = 'overlay',
}: {
  href: string;
  label: string;
  accent: string;
  /** `overlay` on dark hover; `panel` on info rail. */
  tone?: 'overlay' | 'panel';
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    tone === 'overlay'
      ? 'inline-flex w-fit items-center gap-2.5 rounded-full border border-white/80 bg-white/10 px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white backdrop-blur-sm transition duration-300 ease-out hover:bg-white hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 sm:py-3'
      : 'inline-flex w-fit items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white transition duration-300 ease-out hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-current sm:px-6 sm:py-3';

  const style =
    tone === 'panel'
      ? { borderColor: accent, backgroundColor: accent, color: '#fff' }
      : undefined;

  const content = (
    <>
      <span>{label}</span>
      <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 rotate-45" aria-hidden />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
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
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 8px, 0)',
        transition: `opacity ${DETAIL_FADE_MS}ms ease-out, transform ${DETAIL_FADE_MS}ms ease-out`,
      }}
    >
      <div
        className={`group relative aspect-[4/5] w-full overflow-hidden rounded-none border-0 ${
          hoverEnabled && hasHoverContent ? '' : ''
        }`}
        style={{ backgroundColor: `${fill}33` }}
      >
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={item.title?.trim() || 'Project'}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="rounded-none object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
            priority={false}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-4 text-center text-sm"
            style={{ color: muted }}
          >
            Add a thumbnail in Information → Portfolio
          </div>
        )}

        {hoverEnabled && hasHoverContent ? (
          <>
            {/* Darken from bottom → top on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.12) 72%, transparent 100%)',
              }}
              aria-hidden
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex translate-y-3 flex-col gap-4 px-5 pb-5 pt-16 opacity-0 transition duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 sm:gap-5 sm:px-6 sm:pb-6">
              {showDescription ? (
                <p className="max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                  {description}
                </p>
              ) : null}

              {showStack ? (
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px]"
                    style={{ color: accent }}
                  >
                    {settings.stackLabel?.trim() || 'Stack'}
                  </p>
                  <span
                    className="mt-2 block h-px w-10"
                    style={{ backgroundColor: accent }}
                    aria-hidden
                  />
                  <ul className="mt-3 flex flex-wrap items-center gap-y-1.5" aria-label="Stack">
                    {tools.map((tool, toolIndex) => (
                      <li key={tool} className="flex items-center">
                        {toolIndex > 0 ? (
                          <span className="mx-2 select-none text-sm text-white/45" aria-hidden>
                            |
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
                  <EditorialConsultPill href={href} label={consultLabel} accent={accent} />
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
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub && !trailing) return null;

  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;

  const {
    fontSize: _fs,
    lineHeight: _lh,
    letterSpacing: _ls,
    ...restTitleStyle
  } = titleStyle ?? {};

  return (
    <header className={`mb-12 w-full sm:mb-14 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 sm:gap-6">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <h2
              className={
                titleClassName.trim() ||
                'font-semibold tracking-[-0.03em]'
              }
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
                lineHeight: 1.06,
              }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-2xl text-base leading-relaxed sm:text-lg ${heading ? 'mt-3' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="pt-1 sm:pt-2">{trailing}</div> : null}
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
  const rule = presentation.cardBorderColor || presentation.subtitleColor || presentation.titleColor;
  const rootRef = useRef<HTMLElement>(null);
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
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;

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

    const root = rootRef.current;
    const scrollRoot = getScrollParent(root);
    updateActive();
    const onScroll = () => updateActive();
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
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

  if (items.length === 0) return null;

  const safeDisplay = Math.max(0, Math.min(displayIndex, items.length - 1));
  const activeItem = items[safeDisplay]!;
  const thumbnailMode = (settings.rightPanel ?? 'info') === 'thumbnail';

  return (
    <section ref={rootRef} className="w-full" aria-label="Project editorial">
      {/* Mobile: stacked identity + details/thumbnail per project */}
      <div className="flex flex-col gap-14 sm:hidden">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-8">
            <EditorialIdentity
              item={item}
              index={index}
              presentation={presentation}
              settings={settings}
              active
            />
            {thumbnailMode ? (
              <EditorialRightRail
                item={item}
                presentation={presentation}
                settings={settings}
                visible
              />
            ) : (
              <div className="border-t pt-8" style={{ borderColor: rule }}>
                <EditorialRightRail
                  item={item}
                  presentation={presentation}
                  settings={settings}
                  visible
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: left scroll list + sticky centered right rail */}
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] sm:items-start sm:gap-0">
        <div className="min-w-0 sm:pr-10 lg:pr-14 xl:pr-16">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              data-editorial-item={index}
              className={index > 0 ? 'mt-20 lg:mt-28' : ''}
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

        <div
          className={`relative min-h-full min-w-0 sm:pl-10 lg:pl-12 xl:pl-14 ${
            thumbnailMode ? '' : 'border-l'
          }`}
          style={thumbnailMode ? undefined : { borderColor: rule }}
        >
          <div
            className="sticky z-10"
            style={
              thumbnailMode
                ? {
                    // Center in the viewport *below* the navbar (exclude nav clearance).
                    top: 'calc((100dvh + var(--portfolio-nav-top-clearance, 4.75rem)) / 2)',
                    transform: 'translateY(-50%)',
                  }
                : {
                    top: 'max(1.5rem, calc(50vh - 11rem))',
                  }
            }
          >
            <EditorialRightRail
              item={activeItem}
              presentation={presentation}
              settings={settings}
              visible={detailVisible}
            />
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
