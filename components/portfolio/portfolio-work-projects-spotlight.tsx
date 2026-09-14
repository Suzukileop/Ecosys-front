'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
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

const SPOT_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const ENTER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 22px, 0)',
};
const INACTIVE_TITLE = 0.3;

const SPOTLIGHT_CSS = `
.pf-spotlight-enter,
.pf-work-spotlight-header {
  will-change: opacity, transform;
  transition:
    opacity 0.8s ${SPOT_EASE},
    transform 0.95s ${SPOT_EASE};
}
[data-spot-ready='1'] .pf-spotlight-enter,
[data-spot-ready='1'].pf-work-spotlight-header {
  opacity: 1 !important;
  transform: translate3d(0, 0, 0) !important;
}
.pf-spotlight-swap {
  animation: pf-spotlight-swap 0.55s ${SPOT_EASE} both;
}
@keyframes pf-spotlight-swap {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
.pf-spotlight-option {
  opacity: ${INACTIVE_TITLE};
  transition: opacity 0.5s ${SPOT_EASE};
}
.pf-spotlight-option[aria-selected='true'],
.pf-spotlight-option:hover,
.pf-spotlight-option:focus-visible {
  opacity: 1;
}
.pf-spotlight-option .pf-spotlight-mark {
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.5s ${SPOT_EASE};
}
.pf-spotlight-option[aria-selected='true'] .pf-spotlight-mark,
.pf-spotlight-option:hover .pf-spotlight-mark,
.pf-spotlight-option:focus-visible .pf-spotlight-mark {
  transform: scaleX(1);
}
.pf-spotlight-option .pf-spotlight-name {
  transform: translate3d(0, 0, 0);
  transition: transform 0.55s ${SPOT_EASE};
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  [data-spot-ready='1'] .pf-spotlight-option:hover .pf-spotlight-name,
  [data-spot-ready='1'] .pf-spotlight-option:focus-visible .pf-spotlight-name {
    transform: translate3d(0.35rem, 0, 0);
  }
  [data-spot-ready='1'] .pf-spotlight-list:hover .pf-spotlight-option:not(:hover):not(:focus-visible):not([aria-selected='true']) {
    opacity: 0.14;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pf-spotlight-enter,
  .pf-work-spotlight-header {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
  }
  .pf-spotlight-swap {
    animation: none !important;
  }
  .pf-spotlight-option,
  .pf-spotlight-option .pf-spotlight-mark,
  .pf-spotlight-option .pf-spotlight-name {
    transition-duration: 0.01ms !important;
    transform: none !important;
  }
}
`;

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

function formatSpotIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
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

function enterStyle(delayMs: number, extra?: CSSProperties): CSSProperties {
  return {
    ...ENTER_HIDDEN,
    ...extra,
    transitionDelay: `${delayMs}ms`,
  };
}

function SpotlightMotionStyles() {
  return <style dangerouslySetInnerHTML={{ __html: SPOTLIGHT_CSS }} />;
}

function useSpotlightEntrance(rootRef: RefObject<HTMLElement | null>, revision: string | number) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      root.setAttribute('data-spot-ready', '1');
    };

    if (prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(reveal);
      return () => window.cancelAnimationFrame(frame);
    }

    const scrollRoot = getScrollParent(root);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '64px 0px',
        root: scrollRoot instanceof Window ? null : scrollRoot,
      }
    );

    observer.observe(root);
    const fallback = window.setTimeout(reveal, 1400);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [rootRef, revision]);
}

function useDesktopKineticShift(
  rootRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let ticking = false;
    let scrollRoot: HTMLElement | Window = window;

    const reset = () => {
      const stage = stageRef.current;
      const list = listRef.current;
      if (stage) {
        stage.style.transform = '';
        stage.style.willChange = 'auto';
      }
      if (list) {
        list.style.transform = '';
        list.style.willChange = 'auto';
      }
    };

    const apply = () => {
      ticking = false;
      const root = rootRef.current;
      const stage = stageRef.current;
      const list = listRef.current;
      if (!root || !stage || !list) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      const relative = vh * 0.42 - rect.top;
      const stageY = Math.max(-18, Math.min(18, relative * 0.05));
      const listY = Math.max(-12, Math.min(12, -relative * 0.028));
      stage.style.transform = `translate3d(0, ${stageY}px, 0)`;
      list.style.transform = `translate3d(0, ${listY}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(apply);
    };

    const bind = () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const list = listRef.current;
      if (!root || !stage || !list) return;
      if (!desktopMq.matches || reduceMq.matches) {
        reset();
        return;
      }
      stage.style.willChange = 'transform';
      list.style.willChange = 'transform';
      scrollRoot = getScrollParent(root);
      scrollRoot.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      apply();
    };

    const unbind = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      ticking = false;
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const sync = () => {
      unbind();
      bind();
    };

    sync();
    desktopMq.addEventListener('change', sync);
    reduceMq.addEventListener('change', sync);

    return () => {
      unbind();
      reset();
      desktopMq.removeEventListener('change', sync);
      reduceMq.removeEventListener('change', sync);
    };
  }, [rootRef, stageRef, listRef, enabled]);
}

function SpotlightStack({
  tools,
  style,
  ink,
  separatorColor,
  accent,
}: {
  tools: string[];
  style: PortfolioWorkProjectsSpotlightStackStyle;
  ink: string;
  separatorColor: string;
  accent: string;
}) {
  if (tools.length === 0) return null;

  if (style === 'list') {
    return (
      <ul className="flex max-w-sm flex-col" aria-label="Stack">
        {tools.map((tool, index) => (
          <li key={tool} className="flex items-baseline gap-3 py-1.5 first:pt-0 last:pb-0">
            <span
              className="font-mono text-[10px] tabular-nums tracking-[0.08em] sm:text-[11px]"
              style={{ color: accent, opacity: 0.72 }}
            >
              {formatSpotIndex(index)}
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
    );
  }

  return (
    <ul className="flex flex-wrap items-center gap-y-2" aria-label="Stack">
      {tools.map((tool, index) => (
        <li key={tool} className="flex items-center">
          {index > 0 ? (
            <span
              className="mx-2.5 select-none text-[11px] font-normal sm:mx-3 sm:text-xs"
              style={{ color: separatorColor }}
              aria-hidden
            >
              {style === 'tags' ? '|' : '·'}
            </span>
          ) : null}
          <span
            className={
              style === 'tags'
                ? 'text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]'
                : 'text-[10px] font-medium lowercase tracking-[0.16em] sm:text-[11px]'
            }
            style={{ color: ink, opacity: style === 'hairline' ? 0.78 : 0.92 }}
          >
            {tool}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SpotlightConsultLink({
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
    'group/consult inline-flex items-center gap-2.5 bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-65 focus:outline-none focus-visible:opacity-65';
  const body = (
    <>
      <span
        className="border-b pb-[0.12em] transition-[border-color,opacity] duration-300"
        style={{ borderColor: accent }}
        data-pf-no-color-transition=""
      >
        {label}
      </span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 group-hover/consult:translate-x-1"
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
        style={{ color: accent, backgroundColor: 'transparent' }}
        data-pf-no-color-transition=""
      >
        {body}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      style={{ color: accent, backgroundColor: 'transparent' }}
      data-pf-no-color-transition=""
    >
      {body}
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
  const stackSeparator = presentation.subtitleColor || presentation.cardBorderColor || muted;

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
    <div className="flex h-full flex-col justify-start">
      {showRole ? (
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px]"
            style={{ color: accent }}
          >
            {role}
          </p>
          <span
            className="mt-2.5 block h-px w-11 origin-left sm:w-14"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        </div>
      ) : (
        <span
          className="block h-px w-11 origin-left sm:w-14"
          style={{ backgroundColor: accent, opacity: 0.55 }}
          aria-hidden
        />
      )}

      <h3
        className="max-w-[11ch] font-semibold tracking-[-0.045em] sm:max-w-[14ch]"
        style={{
          color: titleColor,
          fontSize: 'clamp(2.15rem, 4.6vw, 4.15rem)',
          lineHeight: 1.05,
          marginTop: showRole ? '1.35rem' : '1.1rem',
        }}
      >
        {title ? <EditorialTitleText text={title} /> : '\u00A0'}
      </h3>

      {showDescription ? (
        <p
          className="mt-5 max-w-[38em] text-[0.95rem] leading-[1.75] sm:mt-6 sm:text-[1.05rem] sm:leading-[1.8]"
          style={{ color: muted, opacity: 0.88 }}
        >
          {description}
        </p>
      ) : null}

      {showStack ? (
        <div className={showDescription || title ? 'mt-8 sm:mt-9' : 'mt-7'}>
          <SpotlightStack
            tools={tools}
            style={settings.stackStyle ?? 'tags'}
            ink={stackInk}
            separatorColor={hexToRgba(stackSeparator, 0.42)}
            accent={accent}
          />
        </div>
      ) : null}

      {showConsult && href ? (
        <div className={showStack || showDescription || title ? 'mt-8 sm:mt-10' : 'mt-7'}>
          <SpotlightConsultLink href={href} label={consultLabel} accent={accent} />
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
  enterOffset = 0,
}: {
  items: MarketplaceContentItem[];
  activeId: string;
  onSelect: (id: string) => void;
  presentation: PortfolioWorkPresentationSettings;
  enterOffset?: number;
}) {
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const accent = presentation.ctaColor || presentation.categoryActiveColor || titleColor;

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = items.findIndex((item) => item.id === activeId);
    const current = index < 0 ? 0 : index;
    if (event.key === 'Home') {
      onSelect(items[0]!.id);
      return;
    }
    if (event.key === 'End') {
      onSelect(items[items.length - 1]!.id);
      return;
    }
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const next = items[(current + delta + items.length) % items.length];
    if (next) onSelect(next.id);
  };

  return (
    <ul
      className="pf-spotlight-list flex flex-col"
      role="listbox"
      aria-label="Projects"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => {
        const selected = item.id === activeId;
        const label = item.title?.trim() || `Project ${index + 1}`;
        return (
          <li
            key={item.id}
            className="pf-spotlight-enter"
            style={enterStyle(enterOffset + Math.min(index, 8) * 55)}
          >
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(item.id)}
              className="pf-spotlight-option group flex w-full items-baseline gap-4 py-3.5 text-left focus:outline-none sm:gap-5 sm:py-4"
              data-pf-no-color-transition=""
            >
              <span
                className="w-8 shrink-0 font-mono text-[10px] tabular-nums tracking-[0.08em] sm:w-9 sm:text-[11px]"
                style={{ color: selected ? accent : titleColor }}
              >
                {formatSpotIndex(index)}
              </span>
              <span className="pf-spotlight-name min-w-0 flex-1">
                <span
                  className="block text-[1.05rem] font-medium tracking-[-0.03em] sm:text-[1.2rem] lg:text-[1.32rem]"
                  style={{
                    color: titleColor,
                    fontWeight: selected ? 600 : 500,
                    lineHeight: 1.15,
                  }}
                >
                  {label}
                </span>
                <span
                  className="pf-spotlight-mark mt-2.5 block h-px w-10 sm:w-12"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Spotlight header — left kicker, editorial last-word italic, short trailing rule.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
 */
export function ProjectsSpotlightSectionHeader({
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
  const incomingFontStyle = titleStyle?.fontStyle;
  const restTitleStyle: CSSProperties = { ...(titleStyle ?? {}) };
  delete restTitleStyle.fontSize;
  delete restTitleStyle.lineHeight;
  delete restTitleStyle.letterSpacing;
  delete restTitleStyle.fontStyle;
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

  useSpotlightEntrance(headerRef, `${heading}|${sub}|${isEmpty ? '0' : '1'}`);

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`pf-work-spotlight-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={ENTER_HIDDEN}
    >
      <SpotlightMotionStyles />
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-7 shrink-0 sm:w-9"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-[11px]"
              style={{ color: subtitleColor }}
            >
              {countLabel || 'Selected'}
            </p>
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-semibold tracking-[-0.045em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 5.6vw, 4.25rem)',
                lineHeight: 1.06,
              }}
            >
              {allowItalicWord ? <EditorialTitleText text={heading} /> : heading}
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-[42em] text-[15px] leading-[1.7] sm:text-base sm:leading-[1.75] ${
                heading ? 'mt-4' : ''
              }`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 pb-1">
          {trailing}
          <span
            className="hidden h-px w-16 sm:block lg:w-24"
            style={{ backgroundColor: mark, opacity: 0.35 }}
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}

/** Editorial stage + numbered title index — Projects spotlight design only. */
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
  const [swapActive, setSwapActive] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const resolvedActiveId =
    items.length === 0
      ? ''
      : items.some((item) => item.id === activeId)
        ? activeId
        : items[0]!.id;

  const selectProject = (id: string) => {
    if (id !== resolvedActiveId) setSwapActive(true);
    setActiveId(id);
  };

  const revision = items.map((item) => item.id).join('|');
  useSpotlightEntrance(rootRef, revision);
  useDesktopKineticShift(rootRef, stageRef, listRef, items.length > 0);

  if (items.length === 0) return null;

  const active = items.find((item) => item.id === resolvedActiveId) ?? items[0]!;
  const border = presentation.cardBorderColor || presentation.subtitleColor || '#e5e5e5';
  const showFill = settings.showFrameFill !== false;
  const surface = showFill
    ? presentation.cardBackgroundColor || DEFAULT_WORK_PRESENTATION.cardBackgroundColor
    : 'transparent';
  const listOnRight = (settings.listSide ?? 'right') === 'right';
  const radius = (settings.frameRadius ?? 'xl') as PortfolioWorkCardRadius;
  const radiusClass = showFill ? workCardRadiusClass(radius) : 'rounded-none';
  const padDetail = showFill
    ? 'min-w-0 px-7 py-9 sm:px-10 sm:py-12 lg:px-12 lg:py-14'
    : 'min-w-0 py-2 lg:py-4';
  const padSelector = showFill
    ? 'min-w-0 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12'
    : 'min-w-0 py-2 lg:py-4';

  const frameStyle: CSSProperties = showFill
    ? {
        borderColor: hexToRgba(border, 0.22),
        backgroundColor: surface,
      }
    : {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
      };

  const divider = (
    <div
      className="hidden self-stretch lg:flex lg:items-center lg:justify-center"
      aria-hidden
    >
      <span
        className="pf-spotlight-enter block w-px"
        style={{
          ...enterStyle(90),
          height: 'min(22rem, 58%)',
          backgroundColor: hexToRgba(border, 0.32),
        }}
      />
    </div>
  );

  const detail = (
    <div ref={stageRef} className={`${padDetail} will-change-transform`}>
      <div className="pf-spotlight-enter" style={enterStyle(40)}>
        <div key={active.id} className={swapActive ? 'pf-spotlight-swap' : undefined}>
          <SpotlightDetail item={active} presentation={presentation} settings={settings} />
        </div>
      </div>
    </div>
  );

  const selector = (
    <div ref={listRef} className={`${padSelector} will-change-transform`}>
      <SpotlightSelector
        items={items}
        activeId={active.id}
        onSelect={selectProject}
        presentation={presentation}
        enterOffset={120}
      />
    </div>
  );

  const columns = listOnRight
    ? 'lg:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,0.82fr)]'
    : 'lg:grid-cols-[minmax(0,0.82fr)_auto_minmax(0,1.2fr)]';

  return (
    <div
      ref={rootRef}
      className={showFill ? `border ${radiusClass}` : ''}
      style={frameStyle}
      data-pf-no-color-transition=""
    >
      <SpotlightMotionStyles />
      <div className={`grid grid-cols-1 items-start gap-8 lg:gap-0 ${columns}`}>
        {listOnRight ? (
          <>
            {detail}
            {divider}
            {selector}
          </>
        ) : (
          <>
            {selector}
            {divider}
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
