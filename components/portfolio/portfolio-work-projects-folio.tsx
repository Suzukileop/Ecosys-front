'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
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

const FOLIO_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DOSSIER_FADE_MS = 320;
const INACTIVE_TITLE_OPACITY = 0.18;
const FOLIO_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

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

function formatFolioIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function folioScrollRoot(el: HTMLElement | null): HTMLElement | null {
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

function folioScrollTarget(el: HTMLElement | null): HTMLElement | Window {
  return folioScrollRoot(el) ?? window;
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

function EditorialTitleText({ text }: { text: string }) {
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.lead}{' '}
      <span className="font-medium italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.9s ${FOLIO_EASE} ${delayMs}ms, transform 1.05s ${FOLIO_EASE} ${delayMs}ms`;
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
    'group/consult inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-opacity duration-500 hover:opacity-55 focus:outline-none focus-visible:opacity-55 sm:text-[12px]';
  const body = (
    <>
      <span
        className="border-b pb-[0.14em] transition-[border-color] duration-500"
        style={{
          borderColor: `color-mix(in srgb, ${accent} 42%, transparent)`,
        }}
        data-pf-no-color-transition=""
      >
        {label}
      </span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-500 ease-out group-hover/consult:translate-x-1"
        data-pf-no-color-transition=""
      >
        →
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={{ color: accent }}
        data-pf-no-color-transition=""
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={{ color: accent }} data-pf-no-color-transition="">
      {body}
    </Link>
  );
}

function FolioStackLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <p
      className="text-[10px] font-medium uppercase tracking-[0.26em] sm:text-[11px]"
      style={{ color: accent, opacity: 0.88 }}
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
  if (tools.length === 0) return null;

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
            border: `1px solid color-mix(in srgb, ${ink} 28%, transparent)`,
          }
        : variant === 'solid'
          ? {
              color: surface,
              backgroundColor: ink,
              border: `1px solid ${ink}`,
            }
          : {
              color: ink,
              backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
            };

    return (
      <div className="min-w-0 max-w-md">
        <FolioStackLabel label={label} accent={accent} />
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={label}>
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
        <ul className="mt-5 flex flex-col gap-3" aria-label={label}>
          {tools.map((tool) => (
            <li
              key={tool}
              className="text-[11px] font-medium uppercase tracking-[0.16em] sm:text-xs"
              style={{ color: ink, opacity: 0.72 }}
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
          className="mt-5 text-[15px] leading-[1.7] tracking-[-0.01em] sm:text-base sm:leading-[1.75]"
          style={{ color: ink }}
          aria-label={label}
        >
          {tools.map((tool, index) => (
            <span key={tool}>
              {index > 0 ? (
                <span style={{ color: muted, opacity: 0.5 }} aria-hidden>
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
          className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:gap-x-7"
          aria-label={label}
        >
          {tools.map((tool) => (
            <li
              key={tool}
              className="min-w-0 border-t pt-3 text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]"
              style={{
                color: ink,
                borderColor: `color-mix(in srgb, ${muted} 26%, transparent)`,
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
        <div className="mt-5 flex gap-4 sm:gap-5">
          <span
            className="w-px shrink-0 self-stretch"
            style={{ backgroundColor: accent, opacity: 0.7 }}
            aria-hidden
          />
          <ul className="flex min-w-0 flex-1 flex-col gap-3 py-0.5" aria-label={label}>
            {tools.map((tool, index) => (
              <li key={tool} className="flex items-baseline gap-3">
                <span
                  className="font-mono text-[10px] tabular-nums tracking-[0.08em] sm:text-[11px]"
                  style={{ color: accent, opacity: 0.7 }}
                >
                  {formatFolioIndex(index)}
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
      <ol className="mt-5 flex flex-col" aria-label={label}>
        {tools.map((tool, index) => (
          <li
            key={tool}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-2 py-3 first:pt-0 last:pb-0 sm:gap-x-3 sm:py-3.5"
            style={
              index > 0
                ? {
                    borderTop: `1px solid color-mix(in srgb, ${muted} 22%, transparent)`,
                  }
                : undefined
            }
          >
            <span
              className="font-mono text-[10px] tabular-nums tracking-[0.08em] sm:text-[11px]"
              style={{ color: accent, opacity: 0.8 }}
            >
              {formatFolioIndex(index)}
            </span>
            <span
              className="min-w-[1.5rem] self-center border-b border-dotted"
              style={{
                borderColor: `color-mix(in srgb, ${muted} 40%, transparent)`,
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
  index,
  total,
  presentation,
  settings,
  visible,
  hideTitle = false,
  hideIndex = false,
}: {
  item: MarketplaceContentItem;
  index: number;
  total: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsFolioSettings;
  visible: boolean;
  hideTitle?: boolean;
  hideIndex?: boolean;
}) {
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;
  const stackInk =
    presentation.elementStyles?.toolsList?.color || presentation.titleColor || ink;
  const rule = presentation.cardBorderColor || muted || ink;
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
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || 'Consult this project';
  const stackLabel = settings.stackLabel?.trim() || 'Core stack';
  const stackDesign = settings.stackDesign ?? 'tags-outline';
  const showIndex = !hideIndex && total > 1;
  const showHeading = !hideTitle && Boolean(title);

  return (
    <div
      className="flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 10px, 0)',
        transition: `opacity ${DOSSIER_FADE_MS}ms ${FOLIO_EASE}, transform ${DOSSIER_FADE_MS}ms ${FOLIO_EASE}`,
      }}
      data-pf-no-color-transition=""
    >
      {showIndex ? (
        <p
          className="font-mono text-[10px] tabular-nums tracking-[0.16em] sm:text-[11px]"
          style={{ color: muted, opacity: 0.72 }}
        >
          {formatFolioIndex(index)}
          <span style={{ opacity: 0.45 }} aria-hidden>
            {' / '}
          </span>
          {String(total).padStart(2, '0')}
        </p>
      ) : null}

      {showRole ? (
        <div className={`min-w-0 ${showIndex ? 'mt-6 sm:mt-7' : ''}`}>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.26em] sm:text-[11px]"
            style={{ color: accent }}
          >
            {role}
          </p>
          <span
            className="mt-3 block h-px origin-left transition-transform duration-700 ease-out"
            style={{
              backgroundColor: accent,
              width: '2.5rem',
              transform: visible ? 'scaleX(1)' : 'scaleX(0)',
            }}
            aria-hidden
          />
        </div>
      ) : hideTitle ? null : (
        <span
          className={`block h-px origin-left transition-transform duration-700 ease-out ${
            showIndex ? 'mt-6 sm:mt-7' : ''
          }`}
          style={{
            backgroundColor: accent,
            width: '2.5rem',
            transform: visible ? 'scaleX(1)' : 'scaleX(0)',
          }}
          aria-hidden
        />
      )}

      {showHeading ? (
        <h3
          className={`max-w-[22rem] text-[1.35rem] font-medium tracking-[-0.035em] sm:text-[1.5rem] sm:leading-[1.22] ${
            showRole || showIndex ? 'mt-7 sm:mt-8' : 'mt-6'
          }`}
          style={{ color: ink }}
        >
          <EditorialTitleText text={title} />
        </h3>
      ) : null}

      {showDescription ? (
        <p
          className={`max-w-[28rem] text-[15px] leading-[1.75] sm:text-[1.05rem] sm:leading-[1.8] ${
            showHeading || showRole || showIndex ? 'mt-6 sm:mt-7' : ''
          }`}
          style={{ color: muted }}
        >
          {description}
        </p>
      ) : null}

      {showStack ? (
        <div
          className={
            showDescription || showHeading || showRole || showIndex ? 'mt-9 sm:mt-11' : ''
          }
        >
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
        <div
          className={`pt-1 ${
            showStack || showDescription || showHeading || showRole ? 'mt-9 sm:mt-11' : ''
          }`}
        >
          <FolioConsultLink href={href} label={consultLabel} accent={accent} />
        </div>
      ) : null}
    </div>
  );
}

function FolioTitleButton({
  title,
  index,
  active,
  ink,
  accent,
  onActivate,
}: {
  title: string;
  index: number;
  active: boolean;
  ink: string;
  accent: string;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className="group/folio-title block w-full text-left focus:outline-none focus-visible:opacity-100"
      style={{
        color: ink,
        opacity: active ? 1 : INACTIVE_TITLE_OPACITY,
        transition: `opacity 0.65s ${FOLIO_EASE}, transform 0.7s ${FOLIO_EASE}`,
        transform: active ? 'translate3d(0.4rem, 0, 0)' : 'translate3d(0, 0, 0)',
      }}
      aria-current={active ? 'true' : undefined}
      data-pf-no-color-transition=""
    >
      <span className="flex items-baseline gap-5 sm:gap-6 xl:gap-8">
        <span
          className="shrink-0 font-mono text-[10px] tabular-nums tracking-[0.16em] sm:text-[11px]"
          style={{
            color: active ? accent : ink,
            opacity: active ? 0.9 : 0.7,
          }}
        >
          {formatFolioIndex(index)}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block font-semibold tracking-[-0.05em] leading-[0.98]"
            style={{
              fontSize: 'clamp(2.35rem, 5.4vw, 4.35rem)',
            }}
          >
            <EditorialTitleText text={title} />
          </span>
          <span
            className="mt-4 block h-px origin-left"
            style={{
              backgroundColor: accent,
              width: '2.75rem',
              transform: active ? 'scaleX(1)' : 'scaleX(0)',
              opacity: active ? 0.75 : 0,
              transition: `transform 0.7s ${FOLIO_EASE}, opacity 0.5s ${FOLIO_EASE}`,
            }}
            aria-hidden
          />
        </span>
      </span>
    </button>
  );
}

/**
 * Folio header — quiet kicker + editorial title. Hidden in JSX (FOUC-safe).
 */
export function ProjectsFolioSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  titleClassName = '',
  titleStyle,
  trailing,
  entryCount,
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
  accent?: string;
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
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

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

    const ioRoot = folioScrollRoot(header);
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
      className={`pf-work-folio-header mb-16 w-full sm:mb-20 lg:mb-24 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={FOLIO_HIDDEN}
    >
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.65 }}
              aria-hidden
            />
            <p
              className="text-[10px] font-medium uppercase tracking-[0.28em] sm:text-[11px]"
              style={{ color: subtitleColor }}
            >
              {countLabel || 'Folio'}
            </p>
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-semibold tracking-[-0.04em]'}
              style={{
                ...restTitleStyle,
                ...(!allowItalicWord && incomingFontStyle
                  ? { fontStyle: incomingFontStyle }
                  : null),
                color: resolvedTitleColor,
                fontSize: 'clamp(2.05rem, 4.6vw, 3.25rem)',
                lineHeight: 1.08,
              }}
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-[15px] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-4 sm:mt-5' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.88 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
          {trailing}
          <span
            className="hidden h-px w-16 sm:block lg:w-24"
            style={{ backgroundColor: mark, opacity: 0.32 }}
            aria-hidden
          />
        </div>
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
  const accent = presentation.ctaColor || presentation.categoryActiveColor || ink;
  const rule =
    presentation.cardBorderColor ||
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor;
  const rootRef = useRef<HTMLElement>(null);
  const dossierShiftRef = useRef<HTMLDivElement>(null);
  const listShiftRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const hoverLock = useRef(false);
  const updateActiveRef = useRef<() => void>(() => undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [dossierVisible, setDossierVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeRaf = useRef(0);

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
    updateActiveRef.current = updateActive;

    const root = rootRef.current;
    const scrollRoot = folioScrollTarget(root);
    let raf = 0;
    updateActive();

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        updateActive();
      });
    };

    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
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
    if (fadeRaf.current) window.cancelAnimationFrame(fadeRaf.current);
    fadeTimer.current = setTimeout(() => {
      setDisplayIndex(activeIndex);
      fadeRaf.current = window.requestAnimationFrame(() => setDossierVisible(true));
    }, DOSSIER_FADE_MS);
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (fadeRaf.current) window.cancelAnimationFrame(fadeRaf.current);
    };
  }, [activeIndex, displayIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-folio-reveal]')];
    if (nodes.length === 0) return;

    if (prefersReducedMotion()) {
      nodes.forEach(showElementNow);
      return;
    }

    const ioRoot = folioScrollRoot(root);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const i = Number(el.dataset.folioReveal) || 0;
          revealElement(el, Math.min(i * 70, 280));
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, root: ioRoot, rootMargin: '0px 0px -6% 0px' }
    );
    nodes.forEach((node) => observer.observe(node));

    const failSafe = window.setTimeout(() => {
      nodes.forEach((node) => {
        if (node.dataset.revealed !== 'true') showElementNow(node);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scroller: HTMLElement | Window | null = null;
    let frame = 0;

    const resetKinetic = () => {
      const dossier = dossierShiftRef.current;
      const list = listShiftRef.current;
      if (dossier) {
        dossier.style.transform = '';
        dossier.style.willChange = 'auto';
      }
      if (list) {
        list.style.transform = '';
        list.style.willChange = 'auto';
      }
      root.querySelectorAll<HTMLElement>('[data-folio-title-shift]').forEach((el) => {
        el.style.transform = '';
      });
    };

    const applyKinetic = () => {
      const dossier = dossierShiftRef.current;
      const list = listShiftRef.current;
      if (!dossier || !list) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      const relative = vh * 0.42 - rect.top;
      const dossierY = Math.max(-18, Math.min(18, relative * 0.045));
      const listY = Math.max(-12, Math.min(12, -relative * 0.026));
      dossier.style.transform = `translate3d(0, ${dossierY.toFixed(2)}px, 0)`;
      list.style.transform = `translate3d(0, ${listY.toFixed(2)}px, 0)`;

      itemRefs.current.forEach((el) => {
        if (!el) return;
        const shift = el.querySelector<HTMLElement>('[data-folio-title-shift]');
        if (!shift || el.dataset.revealed === 'false') return;
        const itemRect = el.getBoundingClientRect();
        if (itemRect.height <= 0) return;
        const centered = (itemRect.top + itemRect.height * 0.5 - vh * 0.42) / vh;
        const y = Math.max(-16, Math.min(16, centered * 22));
        shift.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyKinetic();
      });
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

    const bind = () => {
      unbind();
      if (reduce.matches || !desktop.matches) {
        resetKinetic();
        return;
      }
      const dossier = dossierShiftRef.current;
      const list = listShiftRef.current;
      if (dossier) dossier.style.willChange = 'transform';
      if (list) list.style.willChange = 'transform';
      scroller = folioScrollTarget(root);
      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      applyKinetic();
    };

    bind();
    desktop.addEventListener('change', bind);
    reduce.addEventListener('change', bind);
    return () => {
      desktop.removeEventListener('change', bind);
      reduce.removeEventListener('change', bind);
      unbind();
      resetKinetic();
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const safeDisplay = Math.max(0, Math.min(displayIndex, items.length - 1));
  const activeItem = items[safeDisplay]!;

  const activate = (index: number) => {
    hoverLock.current = true;
    setActiveIndex(index);
  };

  const releaseHover = () => {
    hoverLock.current = false;
    updateActiveRef.current();
  };

  return (
    <section
      ref={rootRef}
      className="pf-work-folio w-full"
      aria-label="Project folio"
      data-pf-no-color-transition=""
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pf-work-folio-header,
          .pf-work-folio [data-folio-reveal] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .pf-work-folio [data-folio-title-shift],
          .pf-work-folio [data-folio-dossier-shift],
          .pf-work-folio [data-folio-list-shift] {
            transform: none !important;
          }
        }
      `}</style>

      {/* Mobile: monument title, then reading copy — no repeated heading */}
      <div className="flex flex-col gap-20 sm:gap-24 lg:hidden">
        {items.map((item, index) => {
          const title = item.title?.trim() || 'Untitled';
          return (
            <article
              key={item.id}
              className="flex flex-col"
              data-folio-reveal={String(index)}
              style={FOLIO_HIDDEN}
            >
              <p
                className="font-mono text-[10px] tabular-nums tracking-[0.16em] sm:text-[11px]"
                style={{ color: accent, opacity: 0.75 }}
              >
                {formatFolioIndex(index)}
              </p>
              <h3
                className="mt-4 font-semibold tracking-[-0.05em] leading-[0.98] sm:mt-5"
                style={{
                  color: ink,
                  fontSize: 'clamp(2.35rem, 10vw, 3.75rem)',
                }}
              >
                <EditorialTitleText text={title} />
              </h3>
              <span
                className="mt-5 block h-px w-10"
                style={{ backgroundColor: accent, opacity: 0.65 }}
                aria-hidden
              />
              <div className="mt-8 sm:mt-10">
                <FolioDossier
                  item={item}
                  index={index}
                  total={items.length}
                  presentation={presentation}
                  settings={settings}
                  visible
                  hideTitle
                  hideIndex
                />
              </div>
              {index < items.length - 1 ? (
                <span
                  className="mt-16 block h-px w-[min(42%,12rem)] sm:mt-20"
                  style={{ backgroundColor: rule, opacity: 0.22 }}
                  aria-hidden
                />
              ) : null}
            </article>
          );
        })}
      </div>

      {/* Desktop: sticky reading dossier (~5) + monument title list (~7) */}
      <div
        className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
        onMouseLeave={releaseHover}
      >
        <div className="relative min-w-0 lg:col-span-5">
          <div
            ref={dossierShiftRef}
            data-folio-dossier-shift=""
            className="sticky z-10"
            style={{ top: 'max(1.75rem, calc(50vh - 14rem))' }}
          >
            <div data-folio-reveal="0" style={FOLIO_HIDDEN}>
              <FolioDossier
                item={activeItem}
                index={safeDisplay}
                total={items.length}
                presentation={presentation}
                settings={settings}
                visible={dossierVisible}
              />
            </div>
          </div>
        </div>

        <div ref={listShiftRef} className="min-w-0 lg:col-span-7" data-folio-list-shift="">
          {items.map((item, index) => {
            const title = item.title?.trim() || 'Untitled';
            return (
              <div
                key={item.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                data-folio-item={index}
                data-folio-reveal={String(index + 1)}
                className={index > 0 ? 'mt-12 xl:mt-16' : ''}
                style={FOLIO_HIDDEN}
              >
                <div data-folio-title-shift="">
                  <FolioTitleButton
                    title={title}
                    index={index}
                    active={index === activeIndex}
                    ink={ink}
                    accent={accent}
                    onActivate={() => activate(index)}
                  />
                </div>
              </div>
            );
          })}
          <div className="h-[32vh]" aria-hidden />
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
