'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsFolioSettings,
  PortfolioWorkProjectsFolioStackDesign,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_FOLIO_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsFolioSettings,
} from '@/components/portfolio/portfolio-work-settings';

const DOSSIER_FADE_MS = 220;
const INACTIVE_TITLE_OPACITY = 0.22;

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

function FolioConsultLink({
  href,
  label,
  accent,
}: {
  href: string;
  label: string;
  accent: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'group/consult inline-flex items-center gap-2 text-sm font-medium tracking-[-0.01em] transition-opacity duration-300 hover:opacity-70 focus:outline-none focus-visible:opacity-70';
  const body = (
    <>
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="size-3 rotate-45 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
      />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={{ color: accent }}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={{ color: accent }}>
      {body}
    </Link>
  );
}

function FolioStackLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]"
      style={{ color: accent }}
    >
      {label}
    </p>
  );
}

function FolioCoreStack({
  tools,
  accent,
  ink,
  muted,
  surface,
  label = 'Core stack',
  design = 'tags-outline',
}: {
  tools: string[];
  accent: string;
  ink: string;
  muted: string;
  /** Fill contrast for solid tags — not the principal CTA accent. */
  surface: string;
  label?: string;
  design?: PortfolioWorkProjectsFolioStackDesign;
}) {
  if (tools.length === 0) {
    return (
      <p className="text-sm" style={{ color: muted }}>
        —
      </p>
    );
  }

  const isTags =
    design === 'tags-soft' ||
    design === 'tags-outline' ||
    design === 'tags-solid' ||
    // legacy single tags value (if somehow passed)
    (design as string) === 'tags';

  if (isTags) {
    const variant =
      design === 'tags-outline'
        ? 'outline'
        : design === 'tags-solid'
          ? 'solid'
          : 'soft';

    // Solid uses ink / toolsList token — never the principal CTA accent.
    const tagStyle =
      variant === 'outline'
        ? {
            color: ink,
            backgroundColor: 'transparent',
            border: `1px solid color-mix(in srgb, ${ink} 42%, transparent)`,
          }
        : variant === 'solid'
          ? {
              color: surface,
              backgroundColor: ink,
              border: `1px solid ${ink}`,
            }
          : {
              color: ink,
              backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
            };

    return (
      <div className="min-w-0 max-w-md">
        <FolioStackLabel label={label} accent={accent} />
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={label}>
          {tools.map((tool) => (
            <li
              key={tool}
              className="px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] sm:text-xs"
              style={tagStyle}
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (design === 'list') {
    return (
      <div className="min-w-0 max-w-sm">
        <FolioStackLabel label={label} accent={accent} />
        <ul className="mt-4 flex flex-col gap-2.5" aria-label={label}>
          {tools.map((tool) => (
            <li
              key={tool}
              className="text-[11px] font-medium uppercase tracking-[0.16em] sm:text-xs"
              style={{ color: ink, opacity: 0.78 }}
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (design === 'inline') {
    return (
      <div className="min-w-0 max-w-md">
        <FolioStackLabel label={label} accent={accent} />
        <p
          className="mt-4 text-sm leading-relaxed tracking-[-0.01em] sm:text-[0.95rem]"
          style={{ color: ink }}
          aria-label={label}
        >
          {tools.map((tool, index) => (
            <span key={tool}>
              {index > 0 ? (
                <span style={{ color: muted, opacity: 0.55 }} aria-hidden>
                  {' · '}
                </span>
              ) : null}
              {tool}
            </span>
          ))}
        </p>
      </div>
    );
  }

  if (design === 'grid') {
    return (
      <div className="min-w-0 max-w-md">
        <FolioStackLabel label={label} accent={accent} />
        <ul
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6"
          aria-label={label}
        >
          {tools.map((tool) => (
            <li
              key={tool}
              className="min-w-0 border-t pt-2.5 text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]"
              style={{
                color: ink,
                borderColor: `color-mix(in srgb, ${muted} 30%, transparent)`,
              }}
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (design === 'rail') {
    return (
      <div className="min-w-0 max-w-sm">
        <FolioStackLabel label={label} accent={accent} />
        <div className="mt-4 flex gap-4 sm:gap-5">
          <span
            className="w-px shrink-0 self-stretch"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <ul className="flex min-w-0 flex-1 flex-col gap-2.5 py-0.5" aria-label={label}>
            {tools.map((tool, index) => (
              <li key={tool} className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[10px] tabular-nums tracking-[0.06em] sm:text-[11px]"
                  style={{ color: accent, opacity: 0.75 }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]"
                  style={{ color: ink }}
                >
                  {tool}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // index (default) — TOC with dotted leaders
  return (
    <div className="min-w-0 max-w-sm">
      <FolioStackLabel label={label} accent={accent} />
      <ol className="mt-4 flex flex-col" aria-label={label}>
        {tools.map((tool, index) => (
          <li
            key={tool}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-2 py-2.5 first:pt-0 last:pb-0 sm:gap-x-3 sm:py-3"
            style={
              index > 0
                ? {
                    borderTop: `1px solid color-mix(in srgb, ${muted} 28%, transparent)`,
                  }
                : undefined
            }
          >
            <span
              className="font-mono text-[10px] tabular-nums tracking-[0.06em] sm:text-[11px]"
              style={{ color: accent, opacity: 0.85 }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="min-w-[1.5rem] self-center border-b border-dotted"
              style={{
                borderColor: `color-mix(in srgb, ${muted} 45%, transparent)`,
              }}
              aria-hidden
            />
            <span
              className="text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]"
              style={{ color: ink }}
            >
              {tool}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FolioDossier({
  item,
  presentation,
  settings,
  visible,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsFolioSettings;
  visible: boolean;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const stackInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || ink;
  const rule =
    presentation.cardBorderColor || muted || ink;
  /** Surface token for solid-tag text contrast (not CTA). */
  const stackSurface =
    presentation.cardBackgroundColor ||
    presentation.toolsIconBackgroundColor ||
    '#fafafa';

  const role = workRoleLabel(item);
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);

  const showRole = settings.showRole !== false && Boolean(role);
  const showDescription = settings.showDescription !== false;
  const showStack = settings.showStack !== false;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const stackLabel = settings.stackLabel?.trim() || 'Core stack';
  const stackDesign = settings.stackDesign ?? 'tags-outline';

  return (
    <div
      className="flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 6px, 0)',
        transition: `opacity ${DOSSIER_FADE_MS}ms ease-out, transform ${DOSSIER_FADE_MS}ms ease-out`,
      }}
    >
      {showRole ? (
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]"
            style={{ color: accent }}
          >
            {role}
          </p>
          <span
            className="mt-2.5 block h-px origin-left transition-[transform,width] duration-500 ease-out"
            style={{
              backgroundColor: accent,
              width: visible ? '2.75rem' : '0',
              transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            }}
            aria-hidden
          />
        </div>
      ) : (
        <span
          className="block h-px origin-left transition-[transform,width] duration-500 ease-out"
          style={{
            backgroundColor: accent,
            width: visible ? '2.75rem' : '0',
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          }}
          aria-hidden
        />
      )}

      {title ? (
        <h3
          className={`max-w-md text-xl font-semibold tracking-[-0.03em] sm:text-2xl lg:text-[1.65rem] lg:leading-[1.2] ${
            showRole ? 'mt-6 sm:mt-7' : 'mt-5'
          }`}
          style={{ color: ink }}
        >
          {title}
        </h3>
      ) : null}

      {showDescription ? (
        <p
          className={`max-w-md text-sm leading-relaxed sm:text-[0.95rem] sm:leading-[1.7] ${
            title || showRole ? 'mt-4 sm:mt-5' : ''
          }`}
          style={{ color: muted }}
        >
          {description || '—'}
        </p>
      ) : null}

      {showStack ? (
        <div className={showDescription || title || showRole ? 'mt-7 sm:mt-8' : ''}>
          <FolioCoreStack
            tools={tools}
            accent={accent}
            ink={stackInk}
            muted={rule}
            surface={stackSurface}
            label={stackLabel}
            design={stackDesign}
          />
        </div>
      ) : null}

      {showConsult && href ? (
        <div className={`pt-1 ${showStack || showDescription || title ? 'mt-7 sm:mt-8' : ''}`}>
          <FolioConsultLink href={href} label={consultLabel} accent={accent} />
        </div>
      ) : null}
    </div>
  );
}

function FolioTitleButton({
  title,
  active,
  ink,
  onActivate,
}: {
  title: string;
  active: boolean;
  ink: string;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className="block w-full text-left transition-[opacity,font-weight] duration-300 ease-out focus:outline-none focus-visible:opacity-100"
      style={{
        color: ink,
        opacity: active ? 1 : INACTIVE_TITLE_OPACITY,
        fontWeight: active ? 600 : 500,
      }}
      aria-current={active ? 'true' : undefined}
    >
      <span
        className="block font-semibold tracking-[-0.045em] leading-[1.05]"
        style={{
          fontSize: 'clamp(2rem, 4.8vw, 3.75rem)',
        }}
      >
        {title}
      </span>
    </button>
  );
}

/**
 * Folio header — reading-room section title with optional typography overrides.
 */
export function ProjectsFolioSectionHeader({
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
              className={titleClassName.trim() || 'font-semibold tracking-[-0.03em]'}
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

/** Sticky dossier left + large title list right (scroll / hover synced). Data only. */
export function ProjectsFolioGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsFolioSettings(
    DEFAULT_PROJECTS_FOLIO_SETTINGS,
    presentation.projectsFolio
  );
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const rootRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const hoverLock = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [dossierVisible, setDossierVisible] = useState(true);
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
      if (hoverLock.current) return;
      const mid = window.innerHeight * 0.4;
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
      setDossierVisible(true);
      return;
    }
    setDossierVisible(false);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setDisplayIndex(activeIndex);
      requestAnimationFrame(() => setDossierVisible(true));
    }, DOSSIER_FADE_MS);
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [activeIndex, displayIndex]);

  if (items.length === 0) return null;

  const safeDisplay = Math.max(0, Math.min(displayIndex, items.length - 1));
  const activeItem = items[safeDisplay]!;

  const activate = (index: number) => {
    hoverLock.current = true;
    setActiveIndex(index);
  };

  const releaseHover = () => {
    hoverLock.current = false;
  };

  return (
    <section ref={rootRef} className="w-full" aria-label="Project folio">
      {/* Mobile: large title then dossier underneath */}
      <div className="flex flex-col gap-14 lg:hidden">
        {items.map((item) => {
          const title = item.title?.trim() || 'Untitled';
          return (
            <div key={item.id} className="flex flex-col gap-6 sm:gap-7">
              <h3
                className="font-semibold tracking-[-0.045em] leading-[1.05]"
                style={{
                  color: ink,
                  fontSize: 'clamp(2.25rem, 9vw, 3.5rem)',
                }}
              >
                {title}
              </h3>
              <FolioDossier
                item={item}
                presentation={presentation}
                settings={settings}
                visible
              />
            </div>
          );
        })}
      </div>

      {/* Desktop: sticky dossier (~5) + title list (~7) */}
      <div
        className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:gap-x-14"
        onMouseLeave={releaseHover}
      >
        <div className="relative min-w-0 lg:col-span-5">
          <div
            className="sticky z-10"
            style={{ top: 'max(1.5rem, calc(50vh - 12rem))' }}
          >
            <FolioDossier
              item={activeItem}
              presentation={presentation}
              settings={settings}
              visible={dossierVisible}
            />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          {items.map((item, index) => {
            const title = item.title?.trim() || 'Untitled';
            return (
              <div
                key={item.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                data-folio-item={index}
                className={index > 0 ? 'mt-10 xl:mt-12' : ''}
              >
                <FolioTitleButton
                  title={title}
                  active={index === activeIndex}
                  ink={ink}
                  onActivate={() => activate(index)}
                />
              </div>
            );
          })}
          <div className="h-[28vh]" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export function isProjectsFolioDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-folio';
}
