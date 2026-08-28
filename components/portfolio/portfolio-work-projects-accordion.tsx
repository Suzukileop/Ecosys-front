'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_ACCORDION_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsAccordionSettings,
} from '@/components/portfolio/portfolio-work-settings';

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

/**
 * Accordion design header — title + subtitle with left / center / right alignment.
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
  if (!heading && !sub) return null;

  return (
    <header
      className={`mb-10 flex w-full flex-col sm:mb-12 ${alignClass(align)} ${className}`.trim()}
    >
      {heading ? (
        <h2
          className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl lg:leading-[1.12]"
          style={{ color: titleColor }}
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
    </header>
  );
}

/**
 * Consult for accordion — always-visible text link under the preview (not a hover overlay).
 */
function AccordionConsultLink({
  href,
  label,
  accent,
  ink,
  border,
}: {
  href: string;
  label: string;
  accent: string;
  ink: string;
  border: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-4 sm:mt-6">
      <span className="h-px min-w-[2.5rem] flex-1" style={{ backgroundColor: border }} aria-hidden />
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
        style={{ color: accent || ink }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
      <span className="h-px min-w-[2.5rem] flex-1" style={{ backgroundColor: border }} aria-hidden />
    </div>
  );
}

function AccordionPreview({
  item,
  surface,
  border,
  ink,
  muted,
  accent,
  toolsLabel,
  showToolsLabel,
  showTools,
  showConsult,
  consultLabel,
}: {
  item: MarketplaceContentItem | null;
  surface: string;
  border: string;
  ink: string;
  muted: string;
  accent: string;
  toolsLabel: string;
  showToolsLabel: boolean;
  showTools: boolean;
  showConsult: boolean;
  consultLabel: string;
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
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] sm:aspect-[5/4] lg:aspect-[4/3] lg:min-h-[22rem]"
        style={{ backgroundColor: surface, border: `1px solid ${border}` }}
      >
        {mediaUrl ? (
          <Image
            key={mediaUrl}
            src={mediaUrl}
            alt={title || 'Project preview'}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover object-center transition-opacity duration-500"
            priority
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center px-8 text-center text-sm font-medium"
            style={{ color: muted }}
          >
            {title || 'Add a thumbnail in Information → Portfolio'}
          </div>
        )}
      </div>

      {consult ? (
        <AccordionConsultLink
          href={consult.href}
          label={consult.label}
          accent={accent}
          ink={ink}
          border={border}
        />
      ) : null}

      {showTools ? (
        <div className="mt-6 sm:mt-7">
          {showToolsLabel ? (
            <>
              <p className="text-sm font-semibold tracking-[-0.01em]" style={{ color: ink }}>
                {labelText}
              </p>
              <div
                className="mt-3 h-px w-12"
                style={{ backgroundColor: border }}
                aria-hidden
              />
            </>
          ) : null}
          {tools.length > 0 ? (
            <ul
              className={`flex flex-wrap gap-2 ${showToolsLabel ? 'mt-4' : ''}`}
              aria-label={labelText}
            >
              {tools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: surface,
                    color: muted,
                    border: `1px solid ${border}`,
                  }}
                >
                  {tool}
                </li>
              ))}
            </ul>
          ) : (
            <p className={showToolsLabel ? 'mt-4 text-sm' : 'text-sm'} style={{ color: muted }}>
              No stack tags for this project yet.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AccordionItem({
  item,
  open,
  onToggle,
  panelId,
  headerId,
  accent,
  titleInk,
  muted,
  cardBg,
  border,
  showDescription,
  showRoleInPanel,
  showCategoryInPanel,
}: {
  item: MarketplaceContentItem;
  open: boolean;
  onToggle: () => void;
  panelId: string;
  headerId: string;
  accent: string;
  titleInk: string;
  muted: string;
  cardBg: string;
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
  const showBody =
    open && ((showDescription && Boolean(description)) || showMeta);
  const roleColor =
    accent && !sameHex(accent, cardBg) && !sameHex(accent, muted) ? accent : titleInk;

  return (
    <div
      className="portfolio-acc-item overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: cardBg,
        borderColor: border,
      }}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span
          className="portfolio-acc-title min-w-0 text-base font-bold tracking-[-0.02em] sm:text-lg"
          style={{ color: titleInk }}
        >
          {item.title}
        </span>
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500"
          style={{
            backgroundColor: open ? accent : border,
            color: open ? '#0a0a0a' : titleInk,
          }}
          aria-hidden
        >
          {open ? '×' : '+'}
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          showBody ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            {showDescription && description ? (
              <p className="text-sm leading-relaxed sm:text-[15px]" style={{ color: muted }}>
                {description}
              </p>
            ) : null}
            {showMeta ? (
              <div
                className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 ${
                  showDescription && description ? 'mt-6' : 'mt-1'
                }`}
              >
                {showRole ? (
                  <p
                    className="min-w-0 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: roleColor }}
                  >
                    {role}
                  </p>
                ) : (
                  <span />
                )}
                {showCategory ? (
                  <p
                    className="shrink-0 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: muted }}
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

const ACCORDION_HOVER_CSS = `
.portfolio-acc-list .portfolio-acc-item {
  opacity: 1;
  filter: blur(0px);
  transition:
    opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, filter;
}
.portfolio-acc-list:hover .portfolio-acc-item:not(:hover) {
  opacity: 0.42;
  filter: blur(2.5px);
}
.portfolio-acc-list .portfolio-acc-title {
  display: inline-block;
  max-width: 100%;
  transform: translateX(0);
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
.portfolio-acc-list .portfolio-acc-item:hover .portfolio-acc-title {
  transform: translateX(0.55rem);
}
@media (prefers-reduced-motion: reduce) {
  .portfolio-acc-list .portfolio-acc-item,
  .portfolio-acc-list .portfolio-acc-title {
    transition-duration: 0.01ms !important;
  }
}
`;

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
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) {
      setOpenId(null);
      return;
    }
    if (!openId || !items.some((item) => item.id === openId)) {
      setOpenId(items[0].id);
    }
  }, [items, openId]);

  if (items.length === 0) return null;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleInk = accordionTitleInk(presentation);
  const muted = presentation.subtitleColor;
  const cardBg = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : 'transparent';
  const border = presentation.cardBorderColor;
  const previewSurface = presentation.cardBackgroundEnabled
    ? presentation.cardBackgroundColor
    : `${border}55`;

  const active = items.find((item) => item.id === openId) ?? items[0];
  const previewFirst = board.previewSide === 'left';

  const list = (
    <div className="portfolio-acc-list flex min-w-0 flex-col gap-3">
      <style dangerouslySetInnerHTML={{ __html: ACCORDION_HOVER_CSS }} />
      {items.map((item, index) => {
        const open = item.id === openId;
        return (
          <AccordionItem
            key={item.id}
            item={item}
            open={open}
            onToggle={() => setOpenId(open ? null : item.id)}
            panelId={`${baseId}-panel-${index}`}
            headerId={`${baseId}-header-${index}`}
            accent={accent}
            titleInk={titleInk}
            muted={muted}
            cardBg={cardBg}
            border={border}
            showDescription={board.showDescription}
            showRoleInPanel={board.showRoleInPanel}
            showCategoryInPanel={board.showCategoryInPanel}
          />
        );
      })}
    </div>
  );

  const preview = (
    <div className="min-w-0 w-full lg:sticky lg:top-28 lg:self-start xl:top-24">
      <AccordionPreview
        item={active}
        surface={previewSurface}
        border={border}
        ink={titleInk}
        muted={muted}
        accent={accent}
        toolsLabel={board.toolsLabel?.trim() || 'Tools I use'}
        showToolsLabel={board.showToolsLabel}
        showTools={board.showTools}
        showConsult={board.showConsult}
        consultLabel={board.consultLabel}
      />
    </div>
  );

  return (
    <div
      className={`grid w-full gap-8 lg:items-start lg:gap-10 xl:gap-14 ${
        previewFirst
          ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.92fr)]'
          : 'lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.15fr)]'
      }`}
    >
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
