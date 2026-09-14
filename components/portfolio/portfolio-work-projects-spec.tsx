'use client';

import {
  useEffect,
  useRef,
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
  PortfolioWorkProjectsSpecConsultDesign,
  PortfolioWorkProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsSpecSettings,
} from '@/components/portfolio/portfolio-work-settings';

const SPEC_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SPEC_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

const SPEC_MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  .pf-work-spec-sheet,
  .pf-work-spec-header {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .pf-work-spec [data-spec-title],
  .pf-work-spec [data-spec-body],
  .pf-work-spec [data-spec-index],
  .pf-work-spec [data-spec-media] {
    opacity: 1 !important;
    transform: none !important;
  }
  .pf-work-spec-title-shift,
  .pf-work-spec-rule {
    transition: none !important;
    transform: none !important;
  }
  .pf-work-spec-rule {
    width: min(44%, 12rem) !important;
  }
}
.pf-work-spec-rule {
  width: min(44%, 12rem);
  opacity: 0.22;
  transition: width 0.55s ${SPEC_EASE}, opacity 0.55s ${SPEC_EASE};
}
.pf-work-spec-sheet:hover .pf-work-spec-rule,
.pf-work-spec-sheet:focus-within .pf-work-spec-rule {
  width: min(78%, 20rem);
  opacity: 0.4;
}
.pf-work-spec-title-shift {
  display: inline-block;
  max-width: 100%;
  transition: transform 0.7s ${SPEC_EASE};
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .pf-work-spec:hover .pf-work-spec-sheet[data-revealed='true']:not(:hover):not(:focus-within) {
    opacity: 0.42 !important;
  }
  .pf-work-spec-sheet[data-revealed='true'] {
    transition: opacity 0.6s ${SPEC_EASE};
  }
  .pf-work-spec-sheet:hover .pf-work-spec-title-shift,
  .pf-work-spec-sheet:focus-within .pf-work-spec-title-shift {
    transform: translate3d(0.4rem, 0, 0);
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

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  if (item.genre?.trim()) return item.genre.trim();
  return '';
}

function formatSpecIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function specScrollRoot(el: HTMLElement | null): HTMLElement | null {
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

function specScrollTarget(el: HTMLElement | null): HTMLElement | Window {
  return specScrollRoot(el) ?? window;
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${SPEC_EASE} ${delayMs}ms, transform 0.95s ${SPEC_EASE} ${delayMs}ms`;
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

function SpecConsultAnchor({
  href,
  className,
  style,
  children,
  noColorTransition = false,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  /** True when `className` carries a transition (e.g. opacity) that the global
   * .pf-theme-root color-transition rule would otherwise clobber. */
  noColorTransition?: boolean;
}) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : null)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      style={style}
      {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : null)}
    >
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
  const focusClass =
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

  if (design === 'underline') {
    return (
      <SpecConsultAnchor
        href={href}
        className={`group/consult relative inline-block text-[0.9375rem] tracking-[-0.015em] ${focusClass}`}
        style={{ color: ink }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-400 ease-out group-hover/consult:scale-x-0"
          style={{ backgroundColor: ink, opacity: 0.28 }}
        />
        <span
          aria-hidden
          data-pf-no-color-transition=""
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
        className={`group/consult inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.02em] transition-opacity duration-300 hover:opacity-60 ${focusClass}`}
        style={{ color: ink }}
        noColorTransition
      >
        <span aria-hidden className="opacity-45">
          [
        </span>
        <span className="tracking-[-0.015em]">{label}</span>
        <span
          className="opacity-55 transition-transform duration-300 group-hover/consult:translate-x-0.5"
          aria-hidden
          data-pf-no-color-transition=""
        >
          →
        </span>
        <span aria-hidden className="opacity-45">
          ]
        </span>
      </SpecConsultAnchor>
    );
  }

  if (design === 'footer') {
    return (
      <SpecConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-3 text-[0.9375rem] font-medium tracking-[-0.015em] transition-opacity duration-300 hover:opacity-65 ${focusClass}`}
        style={{ color: ink }}
        noColorTransition
      >
        <span>{label}</span>
        <span
          className="inline-block h-px w-7 origin-left transition-transform duration-500 ease-out group-hover/consult:scale-x-[1.85]"
          style={{ backgroundColor: accent, opacity: 0.85 }}
          aria-hidden
          data-pf-no-color-transition=""
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
            border: `1px solid color-mix(in srgb, ${ink} 22%, transparent)`,
          }
        : design === 'ghost'
          ? {
              color: ink,
              backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
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
      <SpecConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-2 px-2.5 py-1 text-[13px] font-medium tracking-[-0.015em] transition-opacity duration-300 hover:opacity-75 ${focusClass}`}
        style={buttonStyle}
        noColorTransition
      >
        <span>{label}</span>
        <FontAwesomeIcon
          icon={faArrowUp}
          className="size-2.5 rotate-45 opacity-70 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
          aria-hidden
          data-pf-no-color-transition=""
        />
      </SpecConsultAnchor>
    );
  }

  return (
    <SpecConsultAnchor
      href={href}
      className={`group/consult inline-flex items-center gap-2 text-[0.9375rem] tracking-[-0.015em] transition-opacity duration-300 hover:opacity-65 ${focusClass}`}
      style={{ color: accent }}
      noColorTransition
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="size-2.5 rotate-45 opacity-70 transition-transform duration-300 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
        data-pf-no-color-transition=""
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
        className="object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/sheet:scale-[1.03]"
        data-pf-no-color-transition=""
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
      className={`py-4 sm:py-[1.15rem] ${
        showLabel
          ? 'grid grid-cols-1 gap-2 sm:grid-cols-[6.25rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-8 sm:gap-y-0 lg:grid-cols-[7rem_minmax(0,1fr)]'
          : ''
      }`}
    >
      {showLabel ? (
        <dt
          className="text-[9px] font-normal uppercase tracking-[0.1em] sm:text-[10px]"
          style={{ color: muted, opacity: 0.4 }}
        >
          {label}
        </dt>
      ) : null}
      <dd className={`min-w-0 ${showLabel ? '' : 'block'}`} style={{ color: ink }}>
        {children}
        {!last ? (
          <span
            aria-hidden
            data-pf-no-color-transition=""
            className="pf-work-spec-rule mt-4 block h-px origin-left sm:mt-5"
            style={{ backgroundColor: rule }}
          />
        ) : null}
      </dd>
    </div>
  );
}

function SpecStack({
  tools,
  ink,
}: {
  tools: string[];
  ink: string;
}) {
  return (
    <ul className="flex flex-wrap items-baseline" aria-label="Stack">
      {tools.map((tool, toolIndex) => (
        <li
          key={tool}
          className="flex items-baseline text-[0.8125rem] font-normal tracking-[-0.01em] sm:text-[0.875rem]"
          style={{ color: ink }}
        >
          {toolIndex > 0 ? (
            <span className="mx-2 select-none opacity-35" aria-hidden>
              /
            </span>
          ) : null}
          {tool}
        </li>
      ))}
    </ul>
  );
}

function SpecSheet({
  item,
  index,
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
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    muted;
  const surface =
    presentation.cardBackgroundColor ||
    presentation.toolsIconBackgroundColor ||
    '#fafafa';
  const solidInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || ink;
  const stackInk = presentation.elementStyles?.toolsList?.color || muted;
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
  const frameBorderColor = sheetFrame === 'accent' ? accent : rule;
  const frameBorderWidth =
    sheetFrame === 'solid' ? 2 : sheetFrame === 'thin' || sheetFrame === 'accent' ? 1 : 0;

  const rows: { key: string; label: string; content: ReactNode }[] = [];
  if (showDescription) {
    rows.push({
      key: 'description',
      label: descriptionLabel,
      content: (
        <p className="max-w-[58ch] text-[0.9375rem] font-normal leading-[1.72] sm:text-[1.02rem] sm:leading-[1.76]">
          {description}
        </p>
      ),
    });
  }
  if (showStack) {
    rows.push({
      key: 'stack',
      label: stackLabel,
      content: <SpecStack tools={tools} ink={stackInk} />,
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
      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            data-spec-index=""
            className="font-mono text-[10px] font-normal tabular-nums tracking-[0.16em] sm:text-[11px]"
            style={{ color: muted, opacity: 0.42 }}
            data-pf-no-color-transition=""
          >
            {formatSpecIndex(index)}
          </span>
          <span
            aria-hidden
            className="hidden h-px w-7 shrink-0 sm:block sm:w-9"
            style={{ backgroundColor: accent, opacity: 0.7 }}
          />
        </div>
        {(showCategory || showRole) && (
          <div className="min-w-0 max-w-[62%] text-right">
            {showCategory ? (
              <p
                className="truncate text-[10px] font-normal tracking-[0.08em] sm:text-[11px]"
                style={{ color: muted, opacity: 0.55 }}
              >
                {category}
              </p>
            ) : null}
            {showRole ? (
              <p
                className={`truncate text-[11px] font-normal tracking-[-0.01em] sm:text-xs ${
                  showCategory ? 'mt-1' : ''
                }`}
                style={{ color: muted, opacity: 0.46 }}
              >
                {role}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <h3
        data-spec-title=""
        className="mt-5 font-medium leading-[1.06] tracking-[-0.045em] sm:mt-6"
        data-pf-no-color-transition=""
        style={{
          color: ink,
          fontSize: showThumb
            ? 'clamp(1.55rem, 2.35vw, 2.2rem)'
            : compactTitle
              ? 'clamp(1.4rem, 2vw, 1.9rem)'
              : 'clamp(2.15rem, 4.2vw, 3.35rem)',
        }}
      >
        <span className="pf-work-spec-title-shift">{title}</span>
      </h3>

      {rows.length > 0 || (showConsult && href && consultDesign === 'footer') ? (
        <div data-spec-body="" className="mt-7 sm:mt-8" data-pf-no-color-transition="">
          {rows.length > 0 ? (
            <dl>
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
            <div className={rows.length > 0 ? 'mt-6 sm:mt-7' : ''}>
              <span
                aria-hidden
                data-pf-no-color-transition=""
                className="pf-work-spec-rule mb-5 block h-px origin-left sm:mb-6"
                style={{ backgroundColor: rule }}
              />
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
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className="pf-work-spec-sheet group/sheet flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8 lg:gap-10"
      data-spec-sheet=""
      data-index={String(index)}
      data-pf-no-color-transition=""
      style={SPEC_HIDDEN}
    >
      {showThumb && mediaUrl ? (
        <div
          data-spec-media=""
          className="w-full shrink-0 overflow-hidden sm:w-[28%] sm:max-w-[14.5rem] lg:max-w-[16.5rem]"
          data-pf-no-color-transition=""
        >
          <SpecThumbnail
            url={mediaUrl}
            alt={title}
            surface={tagSurface || surface}
            compact={false}
          />
        </div>
      ) : null}

      <article
        className={`relative min-w-0 flex-1 ${framed ? 'p-5 sm:p-6 lg:p-8' : ''}`}
        data-pf-no-color-transition=""
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
            data-pf-no-color-transition=""
            className="pointer-events-none absolute left-0 top-0 h-9 w-px origin-top scale-y-0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:scale-y-100 group-hover/sheet:opacity-100"
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
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
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
  const headerRef = useRef<HTMLElement>(null);
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  const isEmpty = !heading && !sub && !trailing;

  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;

  const restTitleStyle: CSSProperties = { ...(titleStyle ?? {}) };
  delete restTitleStyle.fontSize;
  delete restTitleStyle.lineHeight;
  delete restTitleStyle.letterSpacing;

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

    const ioRoot = specScrollRoot(header);
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
      className={`pf-work-spec-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={SPEC_HIDDEN}
    >
      <style>{SPEC_MOTION_CSS}</style>
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: resolvedTitleColor, opacity: 0.55 }}
              aria-hidden
            />
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-medium tracking-[-0.04em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.35rem)',
                lineHeight: 1.06,
              }}
            >
              {heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-[0.95rem] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-4' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.82 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0 pb-1">{trailing}</div> : null}
      </div>
    </header>
  );
}

function specSheetGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return 'mt-12 sm:mt-14 lg:mt-16';
  if (gap === 'md') return 'mt-20 sm:mt-24 lg:mt-28';
  if (gap === '2xl') return 'mt-36 sm:mt-44 lg:mt-52';
  return 'mt-28 sm:mt-32 lg:mt-36';
}

function specSheetGridGapClass(gap: PortfolioWorkProjectsSpecSettings['sheetGap']): string {
  if (gap === 'tight') return 'gap-y-12 sm:gap-y-14 lg:gap-y-16 gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16';
  if (gap === 'md') return 'gap-y-20 sm:gap-y-24 lg:gap-y-28 gap-x-10 sm:gap-x-12 lg:gap-x-14 xl:gap-x-20';
  if (gap === '2xl') return 'gap-y-36 sm:gap-y-44 lg:gap-y-52 gap-x-12 sm:gap-x-14 lg:gap-x-16 xl:gap-x-24';
  return 'gap-y-28 sm:gap-y-32 lg:gap-y-36 gap-x-10 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20';
}

function useSpecGalleryMotion(itemsKey: number) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sheets = [...root.querySelectorAll<HTMLElement>('[data-spec-sheet]')];
    if (sheets.length === 0) return;

    if (prefersReducedMotion()) {
      sheets.forEach(showElementNow);
      return;
    }

    const ioRoot = specScrollRoot(root);
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
    sheets.forEach((sheet) => observer.observe(sheet));

    const failSafe = window.setTimeout(() => {
      sheets.forEach((sheet) => {
        if (sheet.dataset.revealed !== 'true') showElementNow(sheet);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [itemsKey]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    let scroller: HTMLElement | Window | null = null;
    let frame = 0;

    const resetKinetic = () => {
      root
        .querySelectorAll<HTMLElement>(
          '[data-spec-title], [data-spec-body], [data-spec-index], [data-spec-media]'
        )
        .forEach((el) => {
          el.style.transform = '';
          el.style.opacity = '';
        });
    };

    const applyKinetic = () => {
      const vh = window.innerHeight;
      const sheets = root.querySelectorAll<HTMLElement>('[data-spec-sheet]');
      sheets.forEach((sheet) => {
        if (sheet.dataset.revealed !== 'true') return;
        const title = sheet.querySelector<HTMLElement>('[data-spec-title]');
        const bodies = sheet.querySelectorAll<HTMLElement>('[data-spec-body]');
        const mark = sheet.querySelector<HTMLElement>('[data-spec-index]');
        const media = sheet.querySelector<HTMLElement>('[data-spec-media]');
        const rect = sheet.getBoundingClientRect();
        const centered = (rect.top + rect.height * 0.42 - vh * 0.5) / vh;
        const t = Math.max(-1, Math.min(1, centered));
        const exitStart = vh * 0.12;
        const exitT = Math.max(0, Math.min(1, (exitStart - rect.top) / (vh * 0.28)));

        if (title) {
          title.style.transform = `translate3d(0, ${(-16 * exitT).toFixed(2)}px, 0)`;
        }
        bodies.forEach((body) => {
          body.style.opacity = String(1 - exitT * 0.52);
          body.style.transform = `translate3d(${(12 * exitT).toFixed(2)}px, ${(10 * t).toFixed(2)}px, 0)`;
        });
        if (mark) {
          mark.style.transform = `translate3d(0, ${(14 * t).toFixed(2)}px, 0)`;
        }
        if (media) {
          media.style.transform = `translate3d(0, ${(20 * t).toFixed(2)}px, 0)`;
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
      scroller = specScrollTarget(root);
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
      resetKinetic();
    };
  }, [itemsKey]);

  return rootRef;
}

/** Full-width technical specification sheets — data first, optional left media. */
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
  const thumbnailForcesSingle = settings.showThumbnail === true;
  const twoColumn = !thumbnailForcesSingle && (settings.columnsPerRow ?? 1) === 2;
  const gapClass = specSheetGapClass(settings.sheetGap ?? 'xl');
  const gridGapClass = specSheetGridGapClass(settings.sheetGap ?? 'xl');
  const rootRef = useSpecGalleryMotion(items.length);

  if (items.length === 0) return null;

  if (twoColumn) {
    return (
      <section
        ref={rootRef}
        className={`pf-work-spec grid w-full grid-cols-1 lg:grid-cols-2 ${gridGapClass}`}
        aria-label="Project specifications"
        data-pf-no-color-transition=""
      >
        <style>{SPEC_MOTION_CSS}</style>
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
    <section
      ref={rootRef}
      className="pf-work-spec w-full"
      aria-label="Project specifications"
      data-pf-no-color-transition=""
    >
      <style>{SPEC_MOTION_CSS}</style>
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
