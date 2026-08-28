'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsSpecConsultDesign,
  PortfolioWorkProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';

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

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  if (item.genre?.trim()) return item.genre.trim();
  return '';
}

function SpecConsultAnchor({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

function SpecConsultControl({
  href,
  label,
  design,
  accent,
  ink,
  surface,
}: {
  href: string;
  label: string;
  design: PortfolioWorkProjectsSpecConsultDesign;
  accent: string;
  ink: string;
  surface: string;
}) {
  if (design === 'underline') {
    return (
      <SpecConsultAnchor
        href={href}
        className="group/consult relative inline-block text-sm tracking-[-0.01em] focus:outline-none"
        style={{ color: ink }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-400 ease-out group-hover/consult:scale-x-0"
          style={{ backgroundColor: ink, opacity: 0.45 }}
        />
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-400 ease-out group-hover/consult:scale-x-100"
          style={{ backgroundColor: accent }}
        />
      </SpecConsultAnchor>
    );
  }

  if (design === 'bracket') {
    return (
      <SpecConsultAnchor
        href={href}
        className="group/consult inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-opacity duration-300 hover:opacity-70 focus:outline-none sm:text-xs"
        style={{ color: ink }}
      >
        <span aria-hidden>[</span>
        <span className="normal-case tracking-[-0.01em]">{label}</span>
        <span
          className="transition-transform duration-300 group-hover/consult:translate-x-0.5"
          aria-hidden
        >
          →
        </span>
        <span aria-hidden>]</span>
      </SpecConsultAnchor>
    );
  }

  if (design === 'footer') {
    return (
      <SpecConsultAnchor
        href={href}
        className="group/consult inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-300 hover:opacity-70 focus:outline-none sm:text-xs"
        style={{ color: accent }}
      >
        <span>{label}</span>
        <span
          className="inline-block h-px w-8 origin-left transition-transform duration-400 ease-out group-hover/consult:scale-x-150"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </SpecConsultAnchor>
    );
  }

  if (design === 'pill' || design === 'outline' || design === 'ghost' || design === 'solid') {
    const buttonStyle =
      design === 'outline'
        ? {
            color: ink,
            backgroundColor: 'transparent',
            border: `1px solid color-mix(in srgb, ${ink} 45%, transparent)`,
          }
        : design === 'ghost'
          ? {
              color: ink,
              backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
              border: '1px solid transparent',
            }
          : design === 'solid'
            ? {
                color: surface,
                backgroundColor: ink,
                border: `1px solid ${ink}`,
              }
            : {
                // pill
                color: '#ffffff',
                backgroundColor: accent,
                border: `1px solid ${accent}`,
              };

    return (
      <SpecConsultAnchor
        href={href}
        className="group/consult inline-flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity duration-300 hover:opacity-80 focus:outline-none sm:text-xs"
        style={buttonStyle}
      >
        <span className="normal-case tracking-[-0.01em]">{label}</span>
        <FontAwesomeIcon
          icon={faArrowUp}
          className="size-3 rotate-45 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
          aria-hidden
        />
      </SpecConsultAnchor>
    );
  }

  // link (default fallback)
  return (
    <SpecConsultAnchor
      href={href}
      className="group/consult inline-flex items-center gap-2 text-sm tracking-[-0.01em] transition-opacity duration-300 hover:opacity-70 focus:outline-none focus-visible:opacity-70"
      style={{ color: accent }}
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="size-3 rotate-45 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
      />
    </SpecConsultAnchor>
  );
}

function SpecThumbnail({
  url,
  alt,
  surface,
  compact,
}: {
  url: string;
  alt: string;
  surface: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden ${
        compact ? 'aspect-[4/5] max-h-56 sm:max-h-64' : 'aspect-[4/5] sm:aspect-[3/4]'
      }`}
      style={{ backgroundColor: surface }}
    >
      <Image
        src={url}
        alt={alt}
        fill
        sizes={compact ? '(max-width: 1024px) 40vw, 18vw' : '(max-width: 768px) 100vw, 28vw'}
        className="object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover/sheet:scale-[1.04]"
      />
    </div>
  );
}

function SpecDefRow({
  label,
  children,
  rule,
  muted,
  ink,
  last,
  showLabel = true,
}: {
  label: string;
  children: ReactNode;
  rule: string;
  muted: string;
  ink: string;
  last?: boolean;
  showLabel?: boolean;
}) {
  return (
    <div
      className={`py-3.5 sm:py-4 ${showLabel ? 'grid grid-cols-1 gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-6 sm:gap-y-0' : ''} ${
        last ? '' : 'border-b'
      }`}
      style={last ? undefined : { borderColor: rule }}
    >
      {showLabel ? (
        <dt
          className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] sm:text-[11px]"
          style={{ color: muted, opacity: 0.72 }}
        >
          {label}
        </dt>
      ) : null}
      <dd
        className={`min-w-0 text-[0.95rem] leading-relaxed sm:text-base ${showLabel ? '' : 'block'}`}
        style={{ color: ink }}
      >
        {children}
      </dd>
    </div>
  );
}

function SpecSheet({
  item,
  presentation,
  settings,
  compactTitle = false,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsSpecSettings;
  /** When 2-up on large screens — smaller project title. */
  compactTitle?: boolean;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted =
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    presentation.titleColor;
  const rule = presentation.cardBorderColor || muted || ink;
  const valueInk =
    presentation.elementStyles?.cardDescription?.color || presentation.titleColor || ink;
  const surface =
    presentation.cardBackgroundColor ||
    presentation.toolsIconBackgroundColor ||
    '#fafafa';
  const solidInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || ink;
  // Same tokens as Projects Board stack tags
  const tagInk = presentation.elementStyles?.toolsList?.color || presentation.subtitleColor || ink;
  const tagSurface = presentation.cardBorderColor || rule;

  const title = item.title?.trim() || 'Untitled';
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = settings.showThumbnail === true && Boolean(mediaUrl);

  const showRole = settings.showRole !== false && Boolean(role);
  const showCategory = settings.showCategory !== false && Boolean(category);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const showFieldLabels = settings.showFieldLabels !== false;
  const descriptionLabel = settings.descriptionLabel?.trim() || 'Summary';
  const stackLabel = settings.stackLabel?.trim() || 'Stack';
  const linkLabel = settings.linkLabel?.trim() || 'Link';
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const consultDesign = settings.consultDesign ?? 'bracket';
  const consultInGrid = showConsult && href && consultDesign !== 'footer';
  const sheetFrame = settings.sheetFrame ?? 'none';
  const framed = sheetFrame !== 'none';
  const frameBorderColor =
    sheetFrame === 'accent' ? accent : rule;
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;

  const rows: { key: string; label: string; content: ReactNode }[] = [];
  if (showDescription) {
    rows.push({ key: 'description', label: descriptionLabel, content: description });
  }
  if (showStack) {
    rows.push({
      key: 'stack',
      label: stackLabel,
      content: (
        <ul className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <li
              key={tool}
              className="rounded-md px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: tagSurface,
                color: tagInk,
              }}
            >
              {tool}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (consultInGrid && href) {
    rows.push({
      key: 'consult',
      label: linkLabel,
      content: (
        <SpecConsultControl
          href={href}
          label={consultLabel}
          design={consultDesign}
          accent={accent}
          ink={consultDesign === 'solid' ? solidInk : ink}
          surface={surface}
        />
      ),
    });
  }

  const body = (
    <>
      {/* Top rule + micro header */}
      {(showCategory || showRole) && (
        <div
          className={`flex items-baseline justify-between gap-4 ${framed ? 'pt-0' : 'border-t pt-4 sm:pt-5'}`}
          style={framed ? undefined : { borderColor: rule }}
        >
          {showCategory ? (
            <span
              className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-[11px]"
              style={{ color: accent }}
            >
              {category}
            </span>
          ) : (
            <span />
          )}
          {showRole ? (
            <span
              className="max-w-[60%] truncate text-right text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]"
              style={{ color: muted, opacity: 0.72 }}
            >
              {role}
            </span>
          ) : null}
        </div>
      )}

      <h3
        className={`font-semibold leading-[1.08] tracking-[-0.04em] transition-[letter-spacing,font-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:tracking-[-0.045em] ${
          showCategory || showRole ? 'mt-4 sm:mt-5' : framed ? 'mt-0' : 'mt-4 sm:mt-5'
        }`}
        style={{
          color: ink,
          fontSize: showThumb
            ? 'clamp(1.45rem, 2.4vw, 2.15rem)'
            : compactTitle
              ? 'clamp(1.35rem, 2.1vw, 1.85rem)'
              : 'clamp(2rem, 4.5vw, 3.25rem)',
        }}
      >
        {title}
      </h3>

      {rows.length > 0 ? (
        <dl className="mt-6 sm:mt-7">
          {rows.map((row, rowIndex) => (
            <SpecDefRow
              key={row.key}
              label={row.label}
              rule={rule}
              muted={muted}
              ink={valueInk}
              last={rowIndex === rows.length - 1}
              showLabel={showFieldLabels}
            >
              {row.content}
            </SpecDefRow>
          ))}
        </dl>
      ) : null}

      {showConsult && href && consultDesign === 'footer' ? (
        <div
          className={`border-t pt-5 sm:pt-6 ${rows.length > 0 ? 'mt-6 sm:mt-7' : 'mt-6 sm:mt-8'}`}
          style={{ borderColor: rule }}
        >
          <SpecConsultControl
            href={href}
            label={consultLabel}
            design="footer"
            accent={accent}
            ink={ink}
            surface={surface}
          />
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={`group/sheet flex flex-col gap-5 opacity-[0.92] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-100 sm:flex-row sm:items-stretch sm:gap-6 lg:gap-8 ${
        showThumb ? '' : ''
      }`}
    >
      {/* Thumbnail outside, always on the left */}
      {showThumb && mediaUrl ? (
        <div className="w-full shrink-0 sm:w-[30%] sm:max-w-[15rem] lg:max-w-[17rem]">
          <SpecThumbnail
            url={mediaUrl}
            alt={title}
            surface={tagSurface || surface}
            compact={false}
          />
        </div>
      ) : null}

      <article
        className={`relative min-w-0 flex-1 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          framed
            ? 'p-5 sm:p-6 lg:p-7'
            : showThumb
              ? ''
              : 'pl-0 hover:pl-3 sm:hover:pl-3.5'
        }`}
        style={
          framed
            ? {
                borderWidth: frameBorderWidth,
                borderStyle: 'solid',
                borderColor: frameBorderColor,
              }
            : undefined
        }
      >
        {/* Left accent bar — hover only (unframed, no external thumb) */}
        {!framed && !showThumb ? (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 top-0 w-[1.5px] origin-top scale-y-0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:scale-y-100 group-hover/sheet:opacity-100"
            style={{ backgroundColor: accent }}
          />
        ) : null}
        {body}
      </article>
    </div>
  );
}

/**
 * Spec header — datasheet section title with optional typography overrides.
 */
export function ProjectsSpecSectionHeader({
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

function specSheetGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return 'mt-12 sm:mt-14 lg:mt-16';
  if (gap === 'md') return 'mt-20 sm:mt-24 lg:mt-28';
  if (gap === '2xl') return 'mt-36 sm:mt-44 lg:mt-52';
  return 'mt-28 sm:mt-32 lg:mt-36'; // xl
}

function specSheetGridGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  // Vertical rhythm + generous horizontal gutter between the two columns
  if (gap === 'tight') return 'gap-y-12 sm:gap-y-14 lg:gap-y-16 gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16';
  if (gap === 'md') return 'gap-y-20 sm:gap-y-24 lg:gap-y-28 gap-x-10 sm:gap-x-12 lg:gap-x-14 xl:gap-x-20';
  if (gap === '2xl') return 'gap-y-36 sm:gap-y-44 lg:gap-y-52 gap-x-12 sm:gap-x-14 lg:gap-x-16 xl:gap-x-24';
  return 'gap-y-28 sm:gap-y-32 lg:gap-y-36 gap-x-10 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20'; // xl
}

/** Full-width technical specification sheets — data only, no media. */
export function ProjectsSpecGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsSpecSettings(
    DEFAULT_PROJECTS_SPEC_SETTINGS,
    presentation.projectsSpec
  );
  // Thumbnail outside-left forces a single full-width row (never 2-up).
  const thumbnailForcesSingle = settings.showThumbnail === true;
  const twoColumn = !thumbnailForcesSingle && (settings.columnsPerRow ?? 1) === 2;
  const gapClass = specSheetGapClass(settings.sheetGap ?? 'xl');
  const gridGapClass = specSheetGridGapClass(settings.sheetGap ?? 'xl');

  if (items.length === 0) return null;

  if (twoColumn) {
    return (
      <section
        className={`grid w-full grid-cols-1 lg:grid-cols-2 ${gridGapClass}`}
        aria-label="Project specifications"
      >
        {items.map((item, index) => (
          <div key={item.id} className="min-w-0">
            <SpecSheet
              item={item}
              index={index}
              presentation={presentation}
              settings={settings}
              compactTitle
            />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="w-full" aria-label="Project specifications">
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? gapClass : ''}>
          <SpecSheet
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            compactTitle={false}
          />
        </div>
      ))}
    </section>
  );
}

export function isProjectsSpecDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-spec';
}
