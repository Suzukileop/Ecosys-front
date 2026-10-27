'use client';
import { workButtonColor } from './portfolio-work-button-color';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
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
  workPaletteTokenColor,
} from '@/components/portfolio/portfolio-work-settings';
import { WorkConsultButtonLink } from '@/components/portfolio/portfolio-work-consult-link';
import { useT } from '@/lib/i18n/I18nProvider';

const LEDGER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Back-out easing — the "spring/magnetic" overshoot used for active-state and FLIP motion. */
const LEDGER_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 28px, 0)',
};

const LEDGER_CSS = `
/* Full-width hairline (a ledger is read across the row). The border color alone was ~1.2:1
   on black at 0.22, so it is lifted toward the ink. */
.pf-work-ledger-rule {
  width: 100%;
  background-color: color-mix(in srgb, var(--pf-ledger-rule), var(--pf-ledger-line-ink) 16%);
  transition: background-color 0.5s ${LEDGER_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-rule,
.pf-work-ledger-row:focus-within .pf-work-ledger-rule {
  background-color: color-mix(in srgb, var(--pf-ledger-rule), var(--pf-ledger-line-ink) 34%);
}
.pf-work-ledger-mark {
  opacity: 0;
  transform-origin: right center;
  transition: transform 0.6s ${LEDGER_EASE}, opacity 0.5s ${LEDGER_EASE};
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
    transform 0.6s ${LEDGER_EASE};
}
.pf-work-ledger-row:hover .pf-work-ledger-title,
.pf-work-ledger-row:focus-within .pf-work-ledger-title,
.pf-work-ledger-row[data-ledger-active='1'] .pf-work-ledger-title {
  color: var(--pf-ledger-ink-active);
  transform: translate3d(0.25rem, 0, 0);
}
.pf-work-ledger-role-text {
  color: var(--pf-ledger-muted);
  transform-origin: right center;
  transition:
    color 0.5s ${LEDGER_EASE},
    opacity 0.5s ${LEDGER_EASE},
    transform 0.55s ${LEDGER_EASE};
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
.pf-work-ledger-panel {
  transition: grid-template-rows 0.45s ${LEDGER_EASE};
}
.pf-work-ledger-panel-body {
  opacity: 0;
  transform: translate3d(0, 6px, 0);
  transition:
    opacity 0.3s ${LEDGER_EASE},
    transform 0.4s ${LEDGER_EASE};
}
.pf-work-ledger-panel-body[data-open='1'] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition-delay: 0.08s;
}
/* Siblings step back but stay readable (was 0.15). */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .pf-work-ledger[data-expand='hover'] .pf-work-ledger-list:hover .pf-work-ledger-row:not(:hover):not(:focus-within) .pf-work-ledger-inner {
    opacity: 0.6;
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
  .pf-work-ledger-panel,
  .pf-work-ledger-panel-body {
    transition-duration: 0.01ms !important;
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
      <span className="font-semibold tracking-[-0.03em]">{parts.italic}</span>
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
    'group/consult relative inline-flex items-center gap-2 text-sm tracking-[-0.012em] focus:outline-hidden focus-visible:opacity-70';
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

/** Color comes from --pf-ledger-rule / --pf-ledger-line-ink on the ledger root. */
function LedgerHairline({ indent = true }: { indent?: boolean }) {
  return (
    <div className="flex" aria-hidden>
      {indent ? <span className="hidden w-12 shrink-0 md:block lg:w-[3.5rem] xl:w-16" /> : null}
      {indent ? <span className="hidden w-6 shrink-0 md:block lg:w-8 xl:w-10" /> : null}
      <span className="pf-work-ledger-rule block h-px" data-pf-no-color-transition="" />
    </div>
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
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsLedgerSettings;
  open: boolean;
  dimmed: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';
  const ink = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted =
    presentation.elementStyles?.cardDescription?.color ||
    presentation.subtitleColor ||
    presentation.titleColor;
  const title = item.title?.trim() || t('Untitled');
  const role = workRoleLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;

  const showIndex = settings.showIndex !== false;
  const showRole = settings.showRole !== false && Boolean(role);
  const showDescription = settings.showDescription !== false && Boolean(description);
  const showStack = settings.showStack !== false && tools.length > 0;
  const showConsult = settings.showConsult !== false && Boolean(href);
  const consultLabel = settings.consultLabel?.trim() || t('Consult this project');
  const consultStyle = settings.consultStyle ?? 'link';
  const metaInk = !settings.metaColor || settings.metaColor === 'muted' ? undefined : workPaletteTokenColor(settings.metaColor);
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
        // Rest slightly softened, hover = the full ink (works on light and dark sections).
        ['--pf-ledger-ink' as string]: `color-mix(in srgb, ${ink} 88%, transparent)`,
        ['--pf-ledger-ink-active' as string]: ink,
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
          className={`grid items-start gap-x-4 gap-y-2 py-6 sm:gap-x-6 sm:py-7 md:gap-x-6 lg:gap-x-8 lg:py-9 xl:gap-x-10 ${
            // Without the numbering the first column goes away, so the title sits flush left.
            showIndex
              ? 'grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[3rem_minmax(0,1fr)_minmax(7rem,12rem)_1.5rem] lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] xl:grid-cols-[4rem_minmax(0,1fr)_minmax(8rem,14rem)_1.75rem]'
              : 'grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(7rem,12rem)_1.5rem] lg:grid-cols-[minmax(0,1fr)_minmax(7.5rem,13rem)_1.75rem] xl:grid-cols-[minmax(0,1fr)_minmax(8rem,14rem)_1.75rem]'
          } ${
            clickable
              ? 'cursor-pointer rounded-xs focus:outline-hidden focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4'
              : ''
          }`}
        >
          {showIndex ? (
            <div
              className="pt-[0.55rem] md:pt-[0.8rem] md:text-center lg:pt-[0.85rem]"
              data-ledger-index=""
              data-pf-no-color-transition=""
            >
              <span
                className="font-mono text-[11px] tabular-nums tracking-[0.18em] sm:text-[12px]"
                style={{ color: muted, opacity: 0.88 }}
              >
                {formatLedgerIndex(index)}
              </span>
            </div>
          ) : null}

          <div className="min-w-0" data-ledger-title="" data-pf-no-color-transition="">
            <h3
              className="pf-work-ledger-title text-[1.55rem] font-medium leading-[1.08] tracking-[-0.042em] sm:text-[1.9rem] lg:text-[2.35rem] xl:text-[2.55rem]"
              data-pf-no-color-transition=""
            >
              <LedgerTitleText text={title} allowItalic={false} />
            </h3>
          </div>

          {showRole ? (
            <div
              className={`${showIndex ? 'col-span-2 col-start-2' : 'col-span-1 col-start-1'} pt-1 md:col-span-1 md:col-start-auto md:justify-self-end md:pt-[0.85rem] md:text-right lg:pt-[0.95rem]`}
              data-ledger-role=""
              data-pf-no-color-transition=""
            >
              <p
                className="pf-work-ledger-role-text text-[11px] font-medium uppercase tracking-[0.16em] sm:text-[12px]"
                style={
                  metaInk
                    ? ({ opacity: 0.95, '--pf-ledger-muted': metaInk, '--pf-ledger-ink-active': metaInk } as CSSProperties)
                    : { opacity: 0.9 }
                }
                data-pf-no-color-transition=""
              >
                {role}
              </p>
            </div>
          ) : (
            <span className="hidden md:block" aria-hidden />
          )}

          <div
            className="mt-[1.05rem] hidden justify-self-end md:block lg:mt-[1.15rem]"
            aria-hidden
            data-ledger-mark=""
            data-pf-no-color-transition=""
          >
            <span
              className="pf-work-ledger-mark block h-px w-5"
              style={{ backgroundColor: accent }}
              data-pf-no-color-transition=""
            />
          </div>
        </div>

        {hasDetails ? (
          // One fluid gesture: the panel height eases open/closed (grid rows 0fr ↔ 1fr) while the
          // content fades in with a small lift. Replaces a snapped height + spring push of the
          // rows below + a line-by-line cascade, which stacked three motions on every hover.
          <div
            className="pf-work-ledger-panel grid"
            style={{ gridTemplateRows: detailsOpen ? '1fr' : '0fr' }}
            data-pf-no-color-transition=""
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`pf-work-ledger-panel-body pb-8 pl-0 sm:pb-10 lg:pr-12 ${showIndex ? 'md:pl-[4.5rem] lg:pl-[5.5rem] xl:pl-[6.5rem]' : ''}`}
                data-open={detailsOpen ? '1' : '0'}
                data-pf-no-color-transition=""
              >
                <div className="max-w-xl space-y-5">
                  {showDescription ? (
                    <p className="text-[15px] leading-[1.7] sm:text-base" style={{ color: muted }}>
                      {description}
                    </p>
                  ) : null}

                  {showStack ? (
                    <ul
                      className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium uppercase tracking-[0.14em]"
                      style={{ color: `color-mix(in srgb, ${muted} 85%, transparent)` }}
                      aria-label={t('Stack')}
                    >
                      {tools.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  ) : null}

                  {showConsult && href ? (
                    <div className="pt-1">
                      {consultStyle === 'link' ? (
                        <LedgerConsultLink href={href} label={consultLabel} accent={workButtonColor(settings.buttonColor ? workPaletteTokenColor(settings.buttonColor) : accent, settings.buttonColorOpacity)} ink={workButtonColor(settings.buttonColor ? workPaletteTokenColor(settings.buttonColor) : ink, settings.buttonColorOpacity)} />
                      ) : (
                        <WorkConsultButtonLink href={href} label={consultLabel} ink={workButtonColor(settings.buttonColor ? workPaletteTokenColor(settings.buttonColor) : ink, settings.buttonColorOpacity)} variant={consultStyle} />
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <LedgerHairline indent={showIndex} />
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
  const t = useT();
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

  // Rows below simply follow the panel's eased height (no FLIP spring push any more).
  const openRow = useCallback((index: number) => {
    setOpenIndex(index);
  }, []);
  const closeRow = useCallback(() => {
    if (expandMode === 'always') return;
    setOpenIndex(null);
  }, [expandMode]);

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
        {t('No projects yet.')}
      </p>
    );
  }

  return (
    <div
      ref={rootRef}
      className="pf-work-ledger w-full"
      data-expand={expandMode}
      data-pf-no-color-transition=""
      style={
        {
          '--pf-ledger-rule': rule,
          '--pf-ledger-line-ink':
            presentation.elementStyles?.cardTitle?.color || presentation.titleColor,
        } as CSSProperties
      }
    >
      <style>{LEDGER_CSS}</style>
      <div className="pf-work-ledger-list">
        <div className="flex" aria-hidden>
          <span className="hidden w-12 shrink-0 md:block lg:w-[3.5rem] xl:w-16" />
          <span className="hidden w-6 shrink-0 md:block lg:w-8 xl:w-10" />
          <span className="pf-work-ledger-rule mb-1 block h-px" />
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
          />
        ))}
      </div>
    </div>
  );
}
