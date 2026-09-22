'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  PortfolioWorkProjectsLedgerSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_LEDGER_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsLedgerSettings,
} from '@/components/portfolio/portfolio-work-settings';

const LEDGER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Back-out easing — the "spring/magnetic" overshoot used for active-state and FLIP motion. */
const LEDGER_SPRING_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const LEDGER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

/** Cascade timing for the detail panel's split-line reveal (title -> description -> stack -> link). */
const LEDGER_DESC_BASE_MS = 60;
const LEDGER_DESC_STAGGER_MS = 50;
const LEDGER_STACK_BASE_MS = 260;
const LEDGER_STACK_STAGGER_MS = 45;
const LEDGER_CONSULT_DELAY_MS = 340;

const LEDGER_CSS = `
.pf-work-ledger-rule {
  width: min(38%, 11rem);
  opacity: 0.22;
  transform-origin: left center;
  transition:
    width 0.55s ${LEDGER_EASE},
    opacity 0.55s ${LEDGER_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-rule,
.pf-work-ledger-row:focus-within .pf-work-ledger-rule {
  width: min(100%, 34rem);
  opacity: 0.48;
}
.pf-work-ledger-mark {
  transform-origin: right center;
  transition: transform 0.6s ${LEDGER_SPRING_EASE}, opacity 0.5s ${LEDGER_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-mark,
.pf-work-ledger-row:focus-within .pf-work-ledger-mark,
.pf-work-ledger-row[data-ledger-active='1'] .pf-work-ledger-mark {
  transform: scaleX(2.6);
  opacity: 1 !important;
}
.pf-work-ledger-title {
  color: var(--pf-ledger-ink);
  transform-origin: left center;
  transition:
    color 0.5s ${LEDGER_EASE},
    transform 0.6s ${LEDGER_SPRING_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-title,
.pf-work-ledger-row:focus-within .pf-work-ledger-title,
.pf-work-ledger-row[data-ledger-active='1'] .pf-work-ledger-title {
  color: var(--pf-ledger-ink-active);
  transform: translate3d(0.4rem, 0, 0) scale(1.035);
}
.pf-work-ledger-role-text {
  color: var(--pf-ledger-muted);
  transform-origin: right center;
  transition:
    color 0.5s ${LEDGER_EASE},
    opacity 0.5s ${LEDGER_EASE},
    transform 0.55s ${LEDGER_SPRING_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-role-text,
.pf-work-ledger-row:focus-within .pf-work-ledger-role-text,
.pf-work-ledger-row[data-ledger-active='1'] .pf-work-ledger-role-text {
  color: var(--pf-ledger-ink-active);
  opacity: 1 !important;
  transform: translate3d(0.3rem, 0, 0);
}
.pf-work-ledger-inner {
  transition: opacity 0.65s ${LEDGER_EASE};
}
.pf-work-ledger-inner[data-dim='1'] {
  opacity: 0.15;
}
.pf-ledger-line-mask {
  display: block;
  overflow: hidden;
}
.pf-ledger-line-inner {
  display: block;
  transition:
    transform 0.75s ${LEDGER_SPRING_EASE},
    opacity 0.5s ${LEDGER_EASE};
  will-change: transform, opacity;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .pf-work-ledger[data-expand='hover'] .pf-work-ledger-list:hover .pf-work-ledger-row:not(:hover):not(:focus-within) .pf-work-ledger-inner {
    opacity: 0.15;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pf-work-ledger-row,
  .pf-work-ledger-header {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .pf-work-ledger [data-ledger-index],
  .pf-work-ledger [data-ledger-title],
  .pf-work-ledger [data-ledger-role],
  .pf-work-ledger [data-ledger-mark] {
    opacity: 1 !important;
    transform: none !important;
  }
  .pf-work-ledger-title,
  .pf-work-ledger-role-text,
  .pf-work-ledger-mark,
  .pf-work-ledger-rule,
  .pf-work-ledger-inner {
    transition-duration: 0.01ms !important;
  }
  .pf-ledger-line-inner {
    transition-duration: 0.01ms !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** useLayoutEffect on the client (avoids a one-frame flash while lines re-measure), useEffect on the server. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function ledgerScrollRoot(el: HTMLElement | null): HTMLElement | null {
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

function ledgerScrollTarget(el: HTMLElement | null): HTMLElement | Window {
  return ledgerScrollRoot(el) ?? window;
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

function LedgerTitleText({ text, allowItalic }: { text: string; allowItalic: boolean }) {
  if (!allowItalic) return <>{text}</>;
  const parts = splitEditorialTitle(text);
  if (!parts) return <>{text}</>;
  return (
    <>
      <span className="font-medium">{parts.lead}</span>{' '}
      <span className="font-semibold italic tracking-[-0.03em]">{parts.italic}</span>
    </>
  );
}

function revealElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.85s ${LEDGER_EASE} ${delayMs}ms, transform 0.95s ${LEDGER_EASE} ${delayMs}ms`;
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

/**
 * Splits `text` into its true rendered visual lines (measured live, re-measured on resize)
 * and reveals each one independently from a bottom mask — the split-text cascade in the brief.
 * A hidden clone (`aria-hidden`, absolutely positioned, same className) does the measuring so the
 * visible lines never shift the layout while recomputing.
 */
function LedgerLineReveal({
  text,
  active,
  className = '',
  style,
  baseDelayMs = 0,
  staggerMs = 50,
  ariaLabel,
}: {
  text: string;
  active: boolean;
  className?: string;
  style?: CSSProperties;
  baseDelayMs?: number;
  staggerMs?: number;
  ariaLabel?: string;
}) {
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<string[]>(() => (text.trim() ? [text.trim()] : []));

  useIsomorphicLayoutEffect(() => {
    const measureEl = measureRef.current;
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!measureEl || words.length === 0) {
      setLines(words.length ? [words.join(' ')] : []);
      return;
    }

    const compute = () => {
      measureEl.textContent = '';
      const spans = words.map((word) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.marginRight = '0.28em';
        measureEl.appendChild(span);
        return span;
      });
      const groups: string[][] = [];
      let lastTop = Number.NaN;
      spans.forEach((span, i) => {
        const top = span.offsetTop;
        if (Number.isNaN(lastTop) || Math.abs(top - lastTop) > 1) {
          groups.push([]);
          lastTop = top;
        }
        groups[groups.length - 1].push(words[i]);
      });
      setLines(groups.map((group) => group.join(' ')));
    };

    compute();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(compute);
    observer.observe(measureEl);
    return () => observer.disconnect();
  }, [text]);

  if (lines.length === 0) return null;

  return (
    <div className={className} style={{ position: 'relative', ...style }} aria-label={ariaLabel}>
      <p
        ref={measureRef}
        aria-hidden
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 0,
          overflow: 'hidden',
          visibility: 'hidden',
          margin: 0,
          pointerEvents: 'none',
        }}
      />
      {lines.map((line, index) => (
        <span key={index} className="pf-ledger-line-mask" data-pf-no-color-transition="">
          <span
            className="pf-ledger-line-inner"
            data-pf-no-color-transition=""
            style={{
              transitionDelay: active ? `${baseDelayMs + index * staggerMs}ms` : '0ms',
              transform: active ? 'translate3d(0, 0, 0)' : 'translate3d(0, 105%, 0)',
              opacity: active ? 1 : 0,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}

function LedgerConsultLink({
  href,
  label,
  accent,
  ink,
}: {
  href: string;
  label: string;
  accent: string;
  ink: string;
}) {
  const external = /^https?:\/\//i.test(href);
  const className =
    'group/consult relative inline-flex items-center gap-2 text-sm tracking-[-0.012em] focus:outline-none focus-visible:opacity-70';
  const body = (
    <>
      <span className="relative">
        <span>{label}</span>
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-400 ease-out group-hover/consult:scale-x-0"
          style={{ backgroundColor: ink, opacity: 0.38 }}
        />
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-400 ease-out group-hover/consult:scale-x-100"
          style={{ backgroundColor: accent }}
        />
      </span>
      <span className="relative inline-block size-3 overflow-hidden" aria-hidden>
        <FontAwesomeIcon
          icon={faArrowUp}
          className="absolute inset-0 size-3 rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/consult:translate-x-[140%] group-hover/consult:-translate-y-[140%]"
          data-pf-no-color-transition=""
        />
        <FontAwesomeIcon
          icon={faArrowUp}
          className="absolute inset-0 size-3 -translate-x-[140%] translate-y-[140%] rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/consult:translate-x-0 group-hover/consult:translate-y-0"
          data-pf-no-color-transition=""
        />
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
        style={{ color: ink }}
        data-pf-no-color-transition=""
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={{ color: ink }} data-pf-no-color-transition="">
      {body}
    </Link>
  );
}

function LedgerHairline({
  color,
  indent = true,
}: {
  color: string;
  indent?: boolean;
}) {
  return (
    <div className="flex" aria-hidden>
      {indent ? <span className="hidden w-[3.5rem] shrink-0 lg:block xl:w-16" /> : null}
      {indent ? <span className="hidden w-8 shrink-0 lg:block xl:w-10" /> : null}
      <span
        className="pf-work-ledger-rule block h-px"
        style={{ backgroundColor: color }}
        data-pf-no-color-transition=""
      />
    </div>
  );
}

/**
 * Ledger header — archive kicker, italic last word, quiet tabular count.
 * Hidden in JSX (FOUC-safe), revealed via IntersectionObserver.
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
  const countVisible = showCount !== false && typeof entryCount === 'number' && entryCount > 0;
  const countDigits = countVisible ? String(entryCount).padStart(2, '0') : '';

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

    const ioRoot = ledgerScrollRoot(header);
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
      className={`pf-work-ledger-header mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={LEDGER_HIDDEN}
    >
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
              Index
            </p>
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-medium tracking-[-0.045em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.35rem, 6vw, 4.5rem)',
                lineHeight: 1.04,
              }}
            >
              <LedgerTitleText text={heading} allowItalic={allowItalicWord} />
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-md text-[15px] leading-[1.7] sm:text-base sm:leading-[1.75] ${heading ? 'mt-4' : ''}`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-4 pb-1">
          {countDigits ? (
            <p
              className="font-medium tabular-nums tracking-[-0.07em]"
              style={{
                color: mark,
                fontSize: 'clamp(2.25rem, 5.5vw, 4.25rem)',
                lineHeight: 0.9,
                opacity: 0.2,
              }}
              aria-label={`${entryCount} ${entryCount === 1 ? 'project' : 'projects'}`}
            >
              {countDigits}
            </p>
          ) : null}
          {trailing}
          <span
            className="hidden h-px w-14 sm:block lg:w-20"
            style={{ backgroundColor: mark, opacity: 0.32 }}
            aria-hidden
          />
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
  const muted =
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    presentation.titleColor;
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
  const clickable = interactive && expandMode === 'click';

  const detailsOpen = expandMode === 'always' ? hasDetails : open && hasDetails;
  const striped = settings.stripedRows === true && index % 2 === 1;

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
      className="pf-work-ledger-row group/row relative"
      data-ledger-row=""
      data-index={String(index)}
      data-pf-no-color-transition=""
      data-ledger-active={detailsOpen ? '1' : '0'}
      style={{
        ...LEDGER_HIDDEN,
        ['--pf-ledger-ink' as string]: ink,
        ['--pf-ledger-ink-active' as string]: `color-mix(in srgb, white 85%, ${ink} 15%)`,
        ['--pf-ledger-muted' as string]: muted,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        className="pf-work-ledger-inner relative"
        data-dim={dimmed ? '1' : '0'}
        data-pf-no-color-transition=""
      >
        {striped ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ backgroundColor: `color-mix(in srgb, ${muted} 7%, transparent)` }}
            data-pf-no-color-transition=""
          />
        ) : null}
        <div
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          aria-expanded={clickable ? detailsOpen : undefined}
          onClick={clickable ? handleClick : undefined}
          onKeyDown={
            clickable
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleClick();
                  }
                }
              : undefined
          }
          className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2 py-8 sm:gap-x-6 sm:py-10 lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] lg:gap-x-8 lg:py-12 xl:grid-cols-[4rem_minmax(0,1fr)_minmax(8rem,14rem)_1.75rem] xl:gap-x-10 ${
            clickable
              ? 'cursor-pointer rounded-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4'
              : ''
          }`}
        >
          {showIndex ? (
            <div
              className="pt-[0.55rem] lg:pt-[0.85rem] lg:text-center"
              data-ledger-index=""
              data-pf-no-color-transition=""
            >
              <span
                className="font-mono text-[10px] tabular-nums tracking-[0.22em] sm:text-[11px]"
                style={{ color: muted, opacity: 0.42 }}
              >
                {formatLedgerIndex(index)}
              </span>
            </div>
          ) : (
            <span className="hidden lg:block" aria-hidden />
          )}

          <div className="min-w-0" data-ledger-title="" data-pf-no-color-transition="">
            <h3
              className="pf-work-ledger-title text-[1.55rem] font-medium leading-[1.08] tracking-[-0.042em] sm:text-[1.9rem] lg:text-[2.35rem] xl:text-[2.55rem]"
              data-pf-no-color-transition=""
            >
              <LedgerTitleText text={title} allowItalic />
            </h3>
          </div>

          {showRole ? (
            <div
              className="col-span-2 col-start-2 pt-1 lg:col-span-1 lg:col-start-auto lg:justify-self-end lg:pt-[0.95rem] lg:text-right"
              data-ledger-role=""
              data-pf-no-color-transition=""
            >
              <p
                className="pf-work-ledger-role-text text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]"
                style={{ opacity: 0.58 }}
                data-pf-no-color-transition=""
              >
                {role}
              </p>
            </div>
          ) : (
            <span className="hidden lg:block" aria-hidden />
          )}

          <div
            className="mt-[1.15rem] hidden justify-self-end lg:block"
            aria-hidden
            data-ledger-mark=""
            data-pf-no-color-transition=""
          >
            <span
              className="pf-work-ledger-mark block h-px w-5"
              style={{ backgroundColor: accent, opacity: 0.55 }}
              data-pf-no-color-transition=""
            />
          </div>
        </div>

        {hasDetails ? (
          <div
            className="grid"
            style={{ gridTemplateRows: detailsOpen ? '1fr' : '0fr' }}
            data-pf-no-color-transition=""
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pb-8 pl-0 sm:pb-10 lg:pl-[3.5rem] lg:pr-12 xl:pl-16">
                <div className="max-w-xl space-y-6">
                  {showDescription ? (
                    <LedgerLineReveal
                      text={description}
                      active={detailsOpen}
                      baseDelayMs={LEDGER_DESC_BASE_MS}
                      staggerMs={LEDGER_DESC_STAGGER_MS}
                      className="text-[15px] leading-[1.8] sm:text-base sm:leading-[1.85]"
                      style={{ color: muted }}
                    />
                  ) : null}

                  {showStack ? (
                    <LedgerLineReveal
                      text={tools.join(' · ')}
                      active={detailsOpen}
                      baseDelayMs={LEDGER_STACK_BASE_MS}
                      staggerMs={LEDGER_STACK_STAGGER_MS}
                      className="text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]"
                      style={{ color: muted, opacity: 0.62 }}
                      ariaLabel="Stack"
                    />
                  ) : null}

                  {showConsult && href ? (
                    <span className="pf-ledger-line-mask block pt-1" data-pf-no-color-transition="">
                      <span
                        className="pf-ledger-line-inner"
                        data-pf-no-color-transition=""
                        style={{
                          transitionDelay: detailsOpen ? `${LEDGER_CONSULT_DELAY_MS}ms` : '0ms',
                          transform: detailsOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, 105%, 0)',
                          opacity: detailsOpen ? 1 : 0,
                        }}
                      >
                        <LedgerConsultLink
                          href={href}
                          label={consultLabel}
                          accent={accent}
                          ink={ink}
                        />
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <LedgerHairline color={rule} indent={showIndex} />
      </div>
    </article>
  );
}

/** Typographic archive ledger — data only, no media. */
export function ProjectsLedgerGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
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

  // FLIP "before" snapshot for the spring-push effect below — captured synchronously at the exact
  // moment open/close is triggered (not from a cache updated only on prior opens), so it can never
  // go stale from scrolling, the entrance reveal, or anything else that moves rows in between.
  const ledgerFlipBeforeRef = useRef<Map<string, number> | null>(null);
  const captureLedgerRowTops = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = ledgerScrollRoot(root);
    const scrollOffset = scroller ? scroller.scrollTop : window.scrollY;
    const tops = new Map<string, number>();
    root.querySelectorAll<HTMLElement>('[data-ledger-row]').forEach((row) => {
      tops.set(row.dataset.index ?? '', row.getBoundingClientRect().top + scrollOffset);
    });
    ledgerFlipBeforeRef.current = tops;
  }, []);

  const openRow = useCallback(
    (index: number) => {
      captureLedgerRowTops();
      setOpenIndex(index);
    },
    [captureLedgerRowTops]
  );
  const closeRow = useCallback(() => {
    if (expandMode === 'always') return;
    captureLedgerRowTops();
    setOpenIndex(null);
  }, [expandMode, captureLedgerRowTops]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>('[data-ledger-row]')];
    if (rows.length === 0) return;

    if (prefersReducedMotion()) {
      rows.forEach(showElementNow);
      return;
    }

    const ioRoot = ledgerScrollRoot(root);
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
    rows.forEach((row) => observer.observe(row));

    const failSafe = window.setTimeout(() => {
      rows.forEach((row) => {
        if (row.dataset.revealed !== 'true') showElementNow(row);
      });
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [items.length]);

  /**
   * FLIP: the open/close panel height itself changes with no CSS transition (see the `grid`
   * wrapper in LedgerRow) so this reads the *true* pre/post layout synchronously. Rows whose
   * position shifted are held at their old spot with an inverse transform, then eased back to 0
   * with a back-out (spring) curve — the "pushed by a magnetic force" motion from the brief,
   * decoupled from the row's own content reveal.
   */
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const before = ledgerFlipBeforeRef.current;
    ledgerFlipBeforeRef.current = null;
    if (!root || !before || prefersReducedMotion()) return;
    const scroller = ledgerScrollRoot(root);
    const scrollOffset = scroller ? scroller.scrollTop : window.scrollY;

    root.querySelectorAll<HTMLElement>('[data-ledger-row]').forEach((row) => {
      const prev = before.get(row.dataset.index ?? '');
      if (prev === undefined) return;
      const docTop = row.getBoundingClientRect().top + scrollOffset;
      const dy = prev - docTop;
      if (Math.abs(dy) < 0.5) return;
      // While held at its old spot, the row visually overlaps whatever grew above it — mute
      // pointer events for the animation's duration so it can't steal hover from that row.
      row.style.pointerEvents = 'none';
      const anim = row.animate(
        [{ transform: `translate3d(0, ${dy}px, 0)` }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: 620, easing: LEDGER_SPRING_EASE, fill: 'both' }
      );
      anim.finished
        .catch(() => {})
        .finally(() => {
          row.style.pointerEvents = '';
        });
    });
  }, [openIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    let scroller: HTMLElement | Window | null = null;
    let frame = 0;

    const resetKinetic = () => {
      root
        .querySelectorAll<HTMLElement>(
          '[data-ledger-index], [data-ledger-title], [data-ledger-role], [data-ledger-mark]'
        )
        .forEach((el) => {
          el.style.transform = '';
          el.style.opacity = '';
        });
    };

    const applyKinetic = () => {
      const vh = window.innerHeight;
      const rows = root.querySelectorAll<HTMLElement>('[data-ledger-row]');
      rows.forEach((row) => {
        if (row.dataset.revealed !== 'true') return;
        const indexEl = row.querySelector<HTMLElement>('[data-ledger-index]');
        const title = row.querySelector<HTMLElement>('[data-ledger-title]');
        const roleEl = row.querySelector<HTMLElement>('[data-ledger-role]');
        const mark = row.querySelector<HTMLElement>('[data-ledger-mark]');
        const rect = row.getBoundingClientRect();
        const exitStart = vh * 0.16;
        const t = Math.max(0, Math.min(1, (exitStart - rect.top) / (vh * 0.32)));
        if (indexEl) {
          indexEl.style.transform = `translate3d(0, ${(-10 * t).toFixed(2)}px, 0)`;
          indexEl.style.opacity = String(1 - t * 0.45);
        }
        if (title) {
          title.style.transform = `translate3d(0, ${(-22 * t).toFixed(2)}px, 0)`;
        }
        if (roleEl) {
          roleEl.style.opacity = String(1 - t * 0.94);
          roleEl.style.transform = `translate3d(${(16 * t).toFixed(2)}px, ${(8 * t).toFixed(2)}px, 0)`;
        }
        if (mark) {
          mark.style.opacity = String(1 - t);
          mark.style.transform = `translate3d(${(10 * t).toFixed(2)}px, 0, 0)`;
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
      scroller = ledgerScrollTarget(root);
      scroller.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
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
      window.removeEventListener('resize', onScroll);
    };

    bind();
    desktop.addEventListener('change', bind);
    return () => {
      desktop.removeEventListener('change', bind);
      unbind();
      resetKinetic();
    };
  }, [items.length]);

  if (items.length === 0) {
    return (
      <p className="text-sm opacity-60" style={{ color: presentation.subtitleColor }}>
        No projects yet.
      </p>
    );
  }

  return (
    <div
      ref={rootRef}
      className="pf-work-ledger w-full"
      data-expand={expandMode}
      data-pf-no-color-transition=""
    >
      <style>{LEDGER_CSS}</style>
      <div className="pf-work-ledger-list">
        <div className="flex" aria-hidden>
          <span className="hidden w-[3.5rem] shrink-0 lg:block xl:w-16" />
          <span className="hidden w-8 shrink-0 lg:block xl:w-10" />
          <span
            className="mb-1 block h-px w-[min(34%,10rem)]"
            style={{ backgroundColor: rule, opacity: 0.2 }}
          />
        </div>
        {items.map((item, index) => (
          <LedgerRow
            key={item.id || `${item.title}-${index}`}
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            open={openIndex === index}
            dimmed={expandMode === 'click' && openIndex != null && openIndex !== index}
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
