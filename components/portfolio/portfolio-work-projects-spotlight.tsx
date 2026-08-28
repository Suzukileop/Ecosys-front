'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSpotlightSettings,
  PortfolioWorkProjectsSpotlightStackStyle,
  PortfolioWorkCardRadius,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpotlightSettings,
  workCardRadiusClass,
} from '@/components/portfolio/portfolio-work-settings';

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return hex;
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

function SpotlightStack({
  tools,
  style,
  ink,
  separatorColor,
}: {
  tools: string[];
  style: PortfolioWorkProjectsSpotlightStackStyle;
  ink: string;
  separatorColor: string;
}) {
  if (tools.length === 0) return null;

  if (style === 'list') {
    return (
      <ul className="flex flex-col gap-3 sm:gap-3.5" aria-label="Stack">
        {tools.map((tool) => (
          <li
            key={tool}
            className="text-sm font-medium tracking-[-0.01em] sm:text-[0.95rem]"
            style={{ color: ink }}
          >
            {tool}
          </li>
        ))}
      </ul>
    );
  }

  // tags + hairline: inline labels separated by " | "
  return (
    <ul className="flex flex-wrap items-center gap-y-2" aria-label="Stack">
      {tools.map((tool, index) => (
        <li key={tool} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2.5 select-none text-sm font-normal sm:mx-3 sm:text-base"
              style={{ color: separatorColor }}
              aria-hidden
            >
              |
            </span>
          ) : null}
          <span
            className={
              style === 'tags'
                ? 'text-sm font-medium tracking-[-0.01em] sm:text-[0.95rem]'
                : 'text-[11px] font-medium lowercase tracking-[0.04em] sm:text-xs'
            }
            style={{ color: ink }}
          >
            {tool}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SpotlightConsultButton({
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
    'inline-flex w-fit items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-white transition duration-300 ease-out hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-current sm:px-6 sm:py-3';
  const style = { backgroundColor: accent || '#ea580c' };

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {label}
    </Link>
  );
}

function SpotlightDetail({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsSpotlightSettings;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#ea580c';
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const stackInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || titleColor;
  const stackSeparator =
    presentation.subtitleColor || presentation.cardBorderColor || muted;

  const role = workRoleLabel(item);
  const title = item.title?.trim() || '';
  const description = item.description?.trim() || '';
  const href = item.linkUrl?.trim() || null;
  const tools = workToolLabels(item, presentation.maxToolsShown ?? 12);

  const showRole = settings.showRole !== false && Boolean(role);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult';

  return (
    <div className="flex h-full flex-col justify-start gap-4 sm:gap-5 lg:gap-6">
      {showRole ? (
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs"
          style={{ color: accent }}
        >
          {role}
        </p>
      ) : (
        <p
          className="invisible text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs"
          aria-hidden
        >
          Role
        </p>
      )}

      <h3
        className="max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
        style={{ color: titleColor }}
      >
        {title || '\u00A0'}
      </h3>

      {showDescription ? (
        <p className="max-w-lg text-base leading-relaxed sm:text-lg" style={{ color: muted }}>
          {description}
        </p>
      ) : null}

      {showStack ? (
        <div>
          <SpotlightStack
            tools={tools}
            style={settings.stackStyle ?? 'tags'}
            ink={stackInk}
            separatorColor={hexToRgba(stackSeparator, 0.55)}
          />
        </div>
      ) : null}

      {showConsult && href ? (
        <div>
          <SpotlightConsultButton href={href} label={consultLabel} accent={accent} />
        </div>
      ) : null}
    </div>
  );
}

function SpotlightSelector({
  items,
  activeId,
  onSelect,
  presentation,
}: {
  items: MarketplaceContentItem[];
  activeId: string;
  onSelect: (id: string) => void;
  presentation: PortfolioWorkPresentationSettings;
}) {
  const titleColor = presentation.titleColor;
  const muted = presentation.subtitleColor;
  const border = presentation.cardBorderColor || muted;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;

  return (
    <ul className="flex flex-col" role="listbox" aria-label="Projects">
      {items.map((item, index) => {
        const selected = item.id === activeId;
        const label = item.title?.trim() || `Project ${index + 1}`;
        return (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(item.id)}
              className="group flex w-full items-center gap-4 border-b px-4 py-5 text-left transition-colors duration-300 sm:gap-5 sm:px-5 sm:py-6"
              style={{
                borderColor: hexToRgba(border, 0.28),
                backgroundColor: selected ? hexToRgba(accent || titleColor, 0.08) : 'transparent',
              }}
            >
              <span className="min-w-0 flex-1">
                <span
                  className="block text-base font-semibold tracking-[-0.02em] sm:text-lg"
                  style={{ color: selected ? titleColor : muted }}
                >
                  {label}
                </span>
              </span>
              <span
                className="shrink-0 text-3xl leading-none transition-transform duration-300 sm:text-4xl"
                style={{ color: selected ? accent : hexToRgba(border, 0.7) }}
                aria-hidden
              >
                ›
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectsSpotlightSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  trailing,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  trailing?: ReactNode;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub && !trailing) return null;

  return (
    <header className={`mb-10 w-full sm:mb-12 ${className}`.trim()}>
      <div className="flex flex-col items-center text-center">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <h2
              className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
              style={{ color: titleColor }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`mx-auto max-w-2xl text-base leading-relaxed sm:text-lg ${heading ? 'mt-3' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="mt-4">{trailing}</div> : null}
      </div>
    </header>
  );
}

/** Framed left details + right title selector — Projects spotlight design only. */
export function ProjectsSpotlightGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsSpotlightSettings(
    DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS,
    presentation.projectsSpotlight
  );
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (items.length === 0) {
      setActiveId('');
      return;
    }
    if (!items.some((item) => item.id === activeId)) {
      setActiveId(items[0]!.id);
    }
  }, [items, activeId]);

  if (items.length === 0) return null;

  const active = items.find((item) => item.id === activeId) ?? items[0]!;
  const border = presentation.cardBorderColor || presentation.subtitleColor || '#e5e5e5';
  const showFill = settings.showFrameFill !== false;
  const surface = showFill
    ? presentation.cardBackgroundColor || DEFAULT_WORK_PRESENTATION.cardBackgroundColor
    : 'transparent';
  const listOnRight = (settings.listSide ?? 'right') === 'right';
  const radius = (settings.frameRadius ?? 'xl') as PortfolioWorkCardRadius;
  const radiusClass = showFill ? workCardRadiusClass(radius) : 'rounded-none';
  const padDetail = showFill
    ? 'min-w-0 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12'
    : 'min-w-0';
  const padSelector = showFill
    ? 'min-w-0 px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-10'
    : 'min-w-0';

  const frameStyle: CSSProperties = showFill
    ? {
        borderColor: hexToRgba(border, 0.32),
        backgroundColor: surface,
      }
    : {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
      };

  const detail = (
    <div className={padDetail}>
      <SpotlightDetail item={active} presentation={presentation} settings={settings} />
    </div>
  );

  const selector = (
    <div
      className={`${padSelector} ${
        showFill ? (listOnRight ? 'lg:border-l' : 'lg:border-r') : ''
      }`}
      style={showFill ? { borderColor: hexToRgba(border, 0.22) } : undefined}
    >
      <SpotlightSelector
        items={items}
        activeId={active.id}
        onSelect={setActiveId}
        presentation={presentation}
      />
    </div>
  );

  return (
    <div
      className={`overflow-hidden ${showFill ? `border ${radiusClass}` : ''}`}
      style={frameStyle}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 xl:gap-14">
        {listOnRight ? (
          <>
            {detail}
            {selector}
          </>
        ) : (
          <>
            {selector}
            {detail}
          </>
        )}
      </div>
    </div>
  );
}

export function isProjectsSpotlightDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-spotlight';
}
