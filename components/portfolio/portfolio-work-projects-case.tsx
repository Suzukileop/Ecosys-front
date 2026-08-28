'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsCaseSettings,
  PortfolioWorkProjectsSpecConsultDesign,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_CASE_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsCaseSettings,
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

function CaseConsultAnchor({
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

function CaseConsultControl({
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
      <CaseConsultAnchor
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
      </CaseConsultAnchor>
    );
  }

  if (design === 'bracket') {
    return (
      <CaseConsultAnchor
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
      </CaseConsultAnchor>
    );
  }

  if (design === 'footer') {
    return (
      <CaseConsultAnchor
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
      </CaseConsultAnchor>
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
                color: '#ffffff',
                backgroundColor: accent,
                border: `1px solid ${accent}`,
              };

    return (
      <CaseConsultAnchor
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
      </CaseConsultAnchor>
    );
  }

  return (
    <CaseConsultAnchor
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
    </CaseConsultAnchor>
  );
}

function caseThumbHeightClass(
  height: PortfolioWorkProjectsCaseSettings['thumbnailHeight']
): string {
  // Visible height change at all breakpoints (`md` = previous default ~22rem on large screens).
  if (height === 'sm') {
    return 'relative w-full overflow-hidden h-48 sm:h-56 lg:h-64';
  }
  if (height === 'lg') {
    return 'relative w-full overflow-hidden h-72 sm:h-80 lg:h-[28rem]';
  }
  if (height === 'xl') {
    return 'relative w-full overflow-hidden h-80 sm:h-96 lg:h-[36rem]';
  }
  // md — état moyen / actuel
  return 'relative w-full overflow-hidden h-64 sm:h-72 lg:h-[22rem]';
}

function CaseThumbnail({
  url,
  alt,
  surface,
  height = 'xl',
}: {
  url: string | null;
  alt: string;
  surface: string;
  height?: PortfolioWorkProjectsCaseSettings['thumbnailHeight'];
}) {
  return (
    <div className={caseThumbHeightClass(height)} style={{ backgroundColor: surface }}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover/sheet:scale-[1.04]"
        />
      ) : (
        <span className="sr-only">No preview image</span>
      )}
    </div>
  );
}

function CaseDefRow({
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

function CaseSheet({
  item,
  presentation,
  settings,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsCaseSettings;
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
  const tagInk = presentation.elementStyles?.toolsList?.color || presentation.subtitleColor || ink;
  const tagSurface = presentation.cardBorderColor || rule;

  const title = item.title?.trim() || 'Untitled';
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;
  const showThumb = settings.showThumbnail !== false;
  const thumbnailHeight = settings.thumbnailHeight ?? 'xl';

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
  const sheetFrame = settings.sheetFrame ?? 'thin';
  const framed = sheetFrame !== 'none';
  const frameBorderColor = sheetFrame === 'accent' ? accent : rule;
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
        <CaseConsultControl
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
        className={`font-semibold leading-[1.08] tracking-[-0.04em] transition-[letter-spacing] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:tracking-[-0.045em] ${
          showCategory || showRole ? 'mt-4 sm:mt-5' : framed ? 'mt-0' : 'mt-4 sm:mt-5'
        }`}
        style={{
          color: ink,
          fontSize: 'clamp(1.5rem, 2.8vw, 2.35rem)',
        }}
      >
        {title}
      </h3>

      {rows.length > 0 ? (
        <dl className="mt-6 sm:mt-7">
          {rows.map((row, rowIndex) => (
            <CaseDefRow
              key={row.key}
              label={row.label}
              rule={rule}
              muted={muted}
              ink={valueInk}
              last={rowIndex === rows.length - 1}
              showLabel={showFieldLabels}
            >
              {row.content}
            </CaseDefRow>
          ))}
        </dl>
      ) : null}

      {showConsult && href && consultDesign === 'footer' ? (
        <div
          className={`border-t pt-5 sm:pt-6 ${rows.length > 0 ? 'mt-6 sm:mt-7' : 'mt-6 sm:mt-8'}`}
          style={{ borderColor: rule }}
        >
          <CaseConsultControl
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
      className={`group/sheet flex flex-col opacity-[0.92] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-100 sm:flex-row sm:items-start gap-6 lg:gap-10 xl:gap-12`}
    >
      {showThumb ? (
        <div className="w-full shrink-0 sm:w-1/2">
          <CaseThumbnail
            url={mediaUrl}
            alt={title}
            surface={tagSurface || surface}
            height={thumbnailHeight}
          />
        </div>
      ) : null}

      <article
        className={`relative min-w-0 ${showThumb ? 'w-full sm:w-1/2' : 'w-full'} transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
 * Case header — datasheet section title with optional typography overrides.
 */
export function ProjectsCaseSectionHeader({
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

function caseSheetGapClass(gap: PortfolioWorkProjectsCaseSettings['sheetGap']): string {
  if (gap === 'tight') return 'mt-12 sm:mt-14 lg:mt-16';
  if (gap === 'md') return 'mt-20 sm:mt-24 lg:mt-28';
  if (gap === '2xl') return 'mt-36 sm:mt-44 lg:mt-52';
  return 'mt-28 sm:mt-32 lg:mt-36';
}

/** Full-width case rows — large thumbnail left + Spec datasheet right. */
export function ProjectsCaseGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const settings = mergeProjectsCaseSettings(
    DEFAULT_PROJECTS_CASE_SETTINGS,
    presentation.projectsCase
  );
  const gapClass = caseSheetGapClass(settings.sheetGap ?? 'xl');

  if (items.length === 0) return null;

  return (
    <section className="w-full" aria-label="Project cases">
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? gapClass : ''}>
          <CaseSheet item={item} presentation={presentation} settings={settings} />
        </div>
      ))}
    </section>
  );
}

export function isProjectsCaseDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-case';
}
