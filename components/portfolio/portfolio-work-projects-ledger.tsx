'use client';

import {
  useCallback,
  useEffect,
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
  PortfolioWorkProjectsLedgerSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_LEDGER_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsLedgerSettings,
} from '@/components/portfolio/portfolio-work-settings';

function workToolLabels(item: MarketplaceContentItem, max = 10): string[] {
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

function formatLedgerIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function LedgerConsultLink({
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
    'group/consult inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity duration-300 hover:opacity-70 sm:text-xs';
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

/**
 * Ledger header — Framer/Webflow archive title + optional entry count.
 */
export function ProjectsLedgerSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  entryCount,
  showCount,
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
  showCount?: boolean;
  accent?: string;
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

  const countLabel =
    showCount !== false && typeof entryCount === 'number' && entryCount > 0
      ? `${String(entryCount).padStart(2, '0')} ${entryCount === 1 ? 'project' : 'projects'}`
      : '';

  return (
    <header className={`mb-8 w-full sm:mb-10 ${className}`.trim()}>
      <div className="flex items-end justify-between gap-4 sm:gap-8">
        <div className="min-w-0 max-w-3xl">
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-semibold tracking-[-0.04em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.5rem, 6.5vw, 4.75rem)',
                lineHeight: 1.05,
              }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-sm leading-relaxed sm:text-base ${heading ? 'mt-3' : ''}`}
              style={{ color: subtitleColor }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
          {countLabel ? (
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]"
              style={{ color: accent || subtitleColor }}
            >
              {countLabel}
            </p>
          ) : null}
          {trailing}
        </div>
      </div>
    </header>
  );
}

function LedgerRow({
  item,
  index,
  presentation,
  settings,
  open,
  dimmed,
  onOpen,
  onClose,
  rule,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsLedgerSettings;
  open: boolean;
  dimmed: boolean;
  onOpen: () => void;
  onClose: () => void;
  rule: string;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.subtitleColor || presentation.titleColor;
  const title = item.title?.trim() || 'Untitled';
  const role = workRoleLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;

  const showIndex = settings.showIndex !== false;
  const showRole = settings.showRole !== false && Boolean(role);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const hasDetails = showDescription || showStack || showConsult;
  const expandMode = settings.expandMode ?? 'hover';
  const interactive = expandMode !== 'always' && hasDetails;

  const detailsOpen = expandMode === 'always' ? hasDetails : open && hasDetails;

  const handleEnter = () => {
    if (expandMode === 'hover') onOpen();
  };
  const handleLeave = () => {
    if (expandMode === 'hover') onClose();
  };
  const handleClick = () => {
    if (expandMode === 'click' && hasDetails) {
      if (open) onClose();
      else onOpen();
    }
  };

  return (
    <article
      className="group/row relative border-t transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        borderColor: rule,
        opacity: dimmed ? 0.28 : 1,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        role={interactive && expandMode === 'click' ? 'button' : undefined}
        tabIndex={interactive && expandMode === 'click' ? 0 : undefined}
        onClick={expandMode === 'click' ? handleClick : undefined}
        onKeyDown={
          expandMode === 'click'
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 py-6 sm:gap-x-6 sm:py-7 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(7rem,14rem)_2rem] lg:gap-x-8 lg:py-8 ${
          interactive && expandMode === 'click' ? 'cursor-pointer' : ''
        }`}
      >
        {showIndex ? (
          <span
            className="font-mono text-[11px] tabular-nums tracking-[0.08em] sm:text-xs"
            style={{ color: muted, opacity: 0.55 }}
          >
            {formatLedgerIndex(index)}
          </span>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}

        <h3
          className="min-w-0 text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.035em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-2xl lg:text-[1.85rem] group-hover/row:translate-x-1"
          style={{ color: ink }}
        >
          {title}
        </h3>

        {showRole ? (
          <p
            className="col-span-2 col-start-2 text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs lg:col-span-1 lg:col-start-auto lg:justify-self-end lg:text-right"
            style={{ color: muted, opacity: 0.72 }}
          >
            {role}
          </p>
        ) : (
          <span className="hidden lg:block" aria-hidden />
        )}

        <span
          className="hidden justify-self-end text-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block group-hover/row:translate-x-1"
          style={{ color: accent }}
          aria-hidden
        >
          →
        </span>
      </div>

      {hasDetails ? (
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gridTemplateRows: detailsOpen ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`pb-7 pl-0 sm:pb-8 lg:pl-[4.5rem] lg:pr-10 transition-opacity duration-400 ${
                detailsOpen ? 'opacity-100 delay-75' : 'opacity-0'
              }`}
            >
              <div className="max-w-2xl space-y-5">
                {showDescription ? (
                  <p
                    className="text-sm leading-relaxed sm:text-[0.95rem] sm:leading-[1.7]"
                    style={{ color: muted }}
                  >
                    {description}
                  </p>
                ) : null}

                {showStack ? (
                  <ul className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Stack">
                    {tools.map((tool) => (
                      <li
                        key={tool}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
                        style={{ color: muted, opacity: 0.65 }}
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {showConsult && href ? (
                  <div className="pt-1">
                    <LedgerConsultLink href={href} label={consultLabel} accent={accent} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Framer-style typographic ledger — data only, no media. */
export function ProjectsLedgerGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsLedgerSettings(
    DEFAULT_PROJECTS_LEDGER_SETTINGS,
    presentation.projectsLedger
  );
  const rule = presentation.cardBorderColor || presentation.subtitleColor || presentation.titleColor;
  const expandMode = settings.expandMode ?? 'hover';
  const [openIndex, setOpenIndex] = useState<number | null>(
    expandMode === 'always' ? 0 : expandMode === 'click' ? 0 : null
  );

  useEffect(() => {
    if (expandMode === 'always') setOpenIndex(0);
    else if (expandMode === 'click') setOpenIndex((prev) => (prev == null ? 0 : prev));
    else setOpenIndex(null);
  }, [expandMode]);

  const openRow = useCallback((index: number) => setOpenIndex(index), []);
  const closeRow = useCallback(() => {
    if (expandMode === 'hover') setOpenIndex(null);
  }, [expandMode]);

  if (items.length === 0) {
    return (
      <p className="text-sm opacity-60" style={{ color: presentation.subtitleColor }}>
        No projects yet.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="border-b" style={{ borderColor: rule }}>
        {items.map((item, index) => (
          <LedgerRow
            key={item.id || `${item.title}-${index}`}
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            open={openIndex === index}
            dimmed={expandMode === 'hover' && openIndex != null && openIndex !== index}
            onOpen={() => openRow(index)}
            onClose={closeRow}
            rule={rule}
          />
        ))}
      </div>
    </div>
  );
}

export function isProjectsLedgerDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-ledger';
}
