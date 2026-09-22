'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
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

const CASE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const CASE_HIDDEN: CSSProperties = {
  opacity: 0,
  transform: 'translate3d(0, 2.4rem, 0)',
};
const CASE_DESKTOP_MQ = '(min-width: 768px)';
const CASE_MEDIA_PARALLAX = 0.7;
const CASE_TEXT_PARALLAX = 1.16;
const CASE_PARALLAX_TRAVEL = 52;

const CASE_MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  .pf-work-case-header,
  [data-case-gallery] [data-case-row] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  [data-case-gallery] [data-case-media-shift],
  [data-case-gallery] [data-case-copy] {
    transform: none !important;
    opacity: 1 !important;
  }
  [data-case-gallery] .pf-work-case-word-inner,
  [data-case-gallery] .pf-work-case-lift,
  [data-case-gallery] [data-case-wash],
  [data-case-gallery] [data-case-clip] {
    transform: none !important;
    opacity: 1 !important;
    transition: none !important;
    clip-path: none !important;
  }
  [data-case-gallery] [data-case-wash] {
    opacity: 0 !important;
  }
}
[data-case-gallery] [data-case-rule] {
  width: 4.75rem;
  opacity: 0.32;
  transition:
    width 0.55s ${CASE_EASE},
    opacity 0.55s ${CASE_EASE};
}
[data-case-gallery] [data-case-row]:hover [data-case-rule],
[data-case-gallery] [data-case-row]:focus-within [data-case-rule] {
  width: 8.25rem;
  opacity: 0.55;
}
[data-case-gallery] .pf-work-case-word-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}
[data-case-gallery] .pf-work-case-word-inner {
  display: inline-block;
  transform: translate3d(0, 108%, 0);
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
[data-case-gallery] [data-case-row][data-case-revealed='true'] .pf-work-case-word-inner {
  transform: translate3d(0, 0, 0);
}
[data-case-gallery] [data-case-wash] {
  opacity: 0;
  transition: opacity 0.85s ${CASE_EASE};
}
[data-case-gallery] [data-case-row]:hover [data-case-wash],
[data-case-gallery] [data-case-row]:focus-within [data-case-wash] {
  opacity: 0.22;
}
[data-case-gallery] [data-case-clip] {
  will-change: clip-path, transform;
}
[data-case-gallery][data-cursor-ready='true'] [data-cursor-target] {
  cursor: none;
}
.pf-work-case-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  margin-top: -7px;
  border-radius: 999px;
  background: var(--pf-case-cursor-accent, #fff);
  pointer-events: none;
  z-index: 60;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    width 0.35s ${CASE_EASE},
    height 0.35s ${CASE_EASE},
    margin 0.35s ${CASE_EASE},
    opacity 0.25s ease;
}
.pf-work-case-cursor[data-cursor-active='true'] {
  opacity: 1;
}
.pf-work-case-cursor[data-cursor-state='view'] {
  width: 108px;
  height: 108px;
  margin-left: -54px;
  margin-top: -54px;
}
.pf-work-case-cursor-label {
  opacity: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0a0a0a;
  white-space: nowrap;
  transition: opacity 0.25s ease 0.05s;
}
.pf-work-case-cursor[data-cursor-state='view'] .pf-work-case-cursor-label {
  opacity: 1;
}
@media (pointer: coarse) {
  .pf-work-case-cursor {
    display: none;
  }
}
`;

function sameHex(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function formatCaseIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
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

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  if (item.genre?.trim()) return item.genre.trim();
  return '';
}

/** First word light italic, remainder semibold — type contrast without a new setting. */
function EditorialTitleText({
  text,
  allowItalic,
}: {
  text: string;
  allowItalic: boolean;
}) {
  const trimmed = text.trim();
  const idx = trimmed.search(/\s+/);
  if (idx === -1) {
    return <span className="font-semibold">{trimmed}</span>;
  }
  return (
    <>
      <span className={allowItalic ? 'font-light italic tracking-[-0.03em]' : 'font-light'}>
        {trimmed.slice(0, idx)}
      </span>{' '}
      <span className="font-semibold">{trimmed.slice(idx).trimStart()}</span>
    </>
  );
}

/** Split-text reveal — same first-word-italic contrast as `EditorialTitleText`, but each
 *  word is individually masked so it slides up on its own beat once the row is revealed
 *  (driven by the row's `data-case-revealed` attribute, see CASE_MOTION_CSS). */
function CaseRevealTitle({ text, allowItalic }: { text: string; allowItalic: boolean }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <span className="pf-work-case-word-mask" key={`${word}-${index}`}>
          <span
            className={`pf-work-case-word-inner${
              index === 0 && allowItalic ? ' font-light italic tracking-[-0.03em]' : ' font-semibold'
            }`}
            style={{ transitionDelay: `${80 + index * 55}ms` }}
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </>
  );
}

function caseEnterStyle(revealed: boolean, delayMs: number): CSSProperties {
  if (!revealed) return CASE_HIDDEN;
  return {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: `opacity 0.92s ${CASE_EASE} ${delayMs}ms, transform 1.08s ${CASE_EASE} ${delayMs}ms`,
  };
}

function revealCaseElement(el: HTMLElement, delayMs: number): void {
  el.style.transition = `opacity 0.92s ${CASE_EASE} ${delayMs}ms, transform 1.08s ${CASE_EASE} ${delayMs}ms`;
  el.style.opacity = '1';
  el.style.transform = 'translate3d(0, 0, 0)';
  el.dataset.revealed = 'true';
}

function showCaseElementNow(el: HTMLElement): void {
  el.style.transition = 'none';
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.dataset.revealed = 'true';
}

function stripHeaderTitleMetrics(style?: CSSProperties): {
  rest: CSSProperties;
  fontStyle: CSSProperties['fontStyle'];
} {
  if (!style) return { rest: {}, fontStyle: undefined };
  const rest: CSSProperties = { ...style };
  const fontStyle = rest.fontStyle;
  delete rest.fontSize;
  delete rest.lineHeight;
  delete rest.letterSpacing;
  delete rest.fontStyle;
  return { rest, fontStyle };
}

function CaseConsultAnchor({
  href,
  className,
  style,
  children,
  noColorTransition = false,
  ariaLabel,
  magnetic = false,
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
  noColorTransition?: boolean;
  ariaLabel?: string;
  /** Marks this anchor as a magnetic-cursor target (see CaseMagneticCursor). */
  magnetic?: boolean;
}) {
  const external = /^https?:\/\//i.test(href);
  const extra: Record<string, string> = {};
  if (noColorTransition) extra['data-pf-no-color-transition'] = '';
  if (magnetic) extra['data-cursor-target'] = '';
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        aria-label={ariaLabel}
        {...extra}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style} aria-label={ariaLabel} {...extra}>
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
  const focusRing =
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

  if (design === 'underline') {
    return (
      <CaseConsultAnchor
        href={href}
        className={`group/consult relative inline-block text-[15px] tracking-[-0.015em] ${focusRing}`}
        style={{ color: ink }}
      >
        <span>{label}</span>
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-500 ease-out group-hover/consult:scale-x-0"
          style={{ backgroundColor: ink, opacity: 0.28 }}
        />
        <span
          aria-hidden
          data-pf-no-color-transition=""
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover/consult:scale-x-100"
          style={{ backgroundColor: accent }}
        />
      </CaseConsultAnchor>
    );
  }

  if (design === 'bracket') {
    return (
      <CaseConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] transition-opacity duration-300 hover:opacity-70 sm:text-xs ${focusRing}`}
        style={{ color: ink }}
        noColorTransition
      >
        <span aria-hidden className="opacity-45">
          [
        </span>
        <span className="normal-case tracking-[-0.015em]">{label}</span>
        <span
          className="transition-transform duration-500 ease-out group-hover/consult:translate-x-1"
          aria-hidden
          data-pf-no-color-transition=""
        >
          →
        </span>
        <span aria-hidden className="opacity-45">
          ]
        </span>
      </CaseConsultAnchor>
    );
  }

  if (design === 'footer') {
    return (
      <CaseConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.16em] uppercase transition-opacity duration-300 hover:opacity-70 sm:text-xs ${focusRing}`}
        style={{ color: accent }}
        noColorTransition
      >
        <span>{label}</span>
        <span
          className="inline-block h-px w-7 origin-left transition-transform duration-500 ease-out group-hover/consult:scale-x-[1.85]"
          style={{ backgroundColor: accent }}
          aria-hidden
          data-pf-no-color-transition=""
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
            border: `1px solid color-mix(in srgb, ${ink} 28%, transparent)`,
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
                color: ink,
                backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
              };

    return (
      <CaseConsultAnchor
        href={href}
        className={`group/consult inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] transition-opacity duration-300 hover:opacity-75 sm:text-xs ${focusRing}`}
        style={buttonStyle}
        noColorTransition
      >
        <span className="normal-case tracking-[-0.015em]">{label}</span>
        <FontAwesomeIcon
          icon={faArrowUp}
          className="size-2.5 rotate-45 opacity-70 transition-transform duration-500 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
          aria-hidden
          data-pf-no-color-transition=""
        />
      </CaseConsultAnchor>
    );
  }

  return (
    <CaseConsultAnchor
      href={href}
      className={`group/consult inline-flex items-center gap-2 text-[15px] tracking-[-0.015em] transition-opacity duration-300 hover:opacity-70 ${focusRing}`}
      style={{ color: accent }}
      noColorTransition
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="size-2.5 rotate-45 transition-transform duration-500 group-hover/consult:translate-x-0.5 group-hover/consult:-translate-y-0.5"
        aria-hidden
        data-pf-no-color-transition=""
      />
    </CaseConsultAnchor>
  );
}

function caseThumbHeightClass(
  height: PortfolioWorkProjectsCaseSettings['thumbnailHeight']
): string {
  if (height === 'sm') {
    return 'relative w-full overflow-hidden h-48 sm:h-56 lg:h-64';
  }
  if (height === 'lg') {
    return 'relative w-full overflow-hidden h-72 sm:h-80 lg:h-[28rem]';
  }
  if (height === 'xl') {
    return 'relative w-full overflow-hidden h-80 sm:h-96 lg:h-[36rem]';
  }
  return 'relative w-full overflow-hidden h-64 sm:h-72 lg:h-[22rem]';
}

function CaseThumbnail({
  url,
  alt,
  surface,
  height = 'xl',
  wash,
  clipStyle,
}: {
  url: string | null;
  alt: string;
  surface: string;
  height?: PortfolioWorkProjectsCaseSettings['thumbnailHeight'];
  wash: string;
  clipStyle: CSSProperties;
}) {
  return (
    <div className={caseThumbHeightClass(height)} style={{ backgroundColor: surface }}>
      {url ? (
        <div
          data-case-media-shift=""
          data-case-clip=""
          className="absolute -top-[18%] left-0 h-[136%] w-full will-change-transform"
          style={clipStyle}
        >
          <Image
            src={url}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, 54vw"
            className="object-cover object-center transition-transform duration-[1.6s] ease-out will-change-transform group-hover/sheet:scale-[1.07] group-focus-within/sheet:scale-[1.07]"
            data-pf-no-color-transition=""
          />
          <span
            aria-hidden
            data-case-wash=""
            data-pf-no-color-transition=""
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: wash, mixBlendMode: 'color' }}
          />
        </div>
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
      className={
        showLabel
          ? 'relative grid grid-cols-1 gap-2 py-5 sm:grid-cols-[6.75rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-8 sm:gap-y-0 sm:py-6'
          : 'relative py-3.5 sm:py-4'
      }
    >
      {showLabel ? (
        <dt
          className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]"
          style={{ color: muted, opacity: 0.52 }}
        >
          {label}
        </dt>
      ) : null}
      <dd className={`min-w-0 ${showLabel ? '' : 'block'}`} style={{ color: ink }}>
        {children}
      </dd>
      {!last ? (
        <span
          aria-hidden
          data-case-rule=""
          data-pf-no-color-transition=""
          className="pointer-events-none absolute bottom-0 left-0 h-px origin-left"
          style={{ backgroundColor: rule }}
        />
      ) : null}
    </div>
  );
}

/** Magnetic cursor — lerps to the pointer, morphs into a "View project" pill over the
 *  invisible full-row link (`[data-cursor-target]`). Disabled on touch / reduced-motion. */
function CaseMagneticCursor({
  stageRef,
  accent,
}: {
  stageRef: RefObject<HTMLElement | null>;
  accent: string;
}) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cursor = cursorRef.current;
    if (!stage || !cursor) return undefined;
    if (prefersReducedMotion()) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };
    const onEnter = () => cursor.setAttribute('data-cursor-state', 'view');
    const onLeave = () => cursor.setAttribute('data-cursor-state', 'idle');

    stage.addEventListener('pointermove', onMove);
    stage.setAttribute('data-cursor-ready', 'true');
    const targets = Array.from(stage.querySelectorAll<HTMLElement>('[data-cursor-target]'));
    targets.forEach((el) => {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
    });
    cursor.setAttribute('data-cursor-active', 'true');

    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeAttribute('data-cursor-ready');
      targets.forEach((el) => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
      });
    };
  }, [stageRef]);

  return (
    <div
      ref={cursorRef}
      className="pf-work-case-cursor"
      data-cursor-state="idle"
      aria-hidden
      style={{ ['--pf-case-cursor-accent' as string]: accent }}
    >
      <span className="pf-work-case-cursor-label">View project</span>
    </div>
  );
}

function useCaseHeaderReveal(
  headerRef: RefObject<HTMLElement | null>,
  readyKey: string,
  enabled: boolean
) {
  useEffect(() => {
    const header = headerRef.current;
    if (!header || !enabled) return;

    if (prefersReducedMotion()) {
      showCaseElementNow(header);
      return;
    }

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      revealCaseElement(header, 0);
    };

    const scrollRoot = getScrollParent(header);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: '48px 0px',
        root: scrollRoot instanceof Window ? null : scrollRoot,
      }
    );
    observer.observe(header);
    const failSafe = window.setTimeout(reveal, 1600);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [headerRef, readyKey, enabled]);
}

function useCaseGalleryMotion(itemsKey: string): {
  rootRef: RefObject<HTMLElement | null>;
  revealed: ReadonlySet<string>;
} {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const revealedRef = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopMq = window.matchMedia(CASE_DESKTOP_MQ);
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-case-row]'));

    const reveal = (id: string) => {
      if (revealedRef.current.has(id)) return;
      revealedRef.current.add(id);
      setRevealed((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };

    const resetParallax = () => {
      for (const row of rows) {
        const media = row.querySelector<HTMLElement>('[data-case-media-shift]');
        const copy = row.querySelector<HTMLElement>('[data-case-copy]');
        if (media) {
          media.style.transform = '';
          media.style.willChange = 'auto';
        }
        if (copy) {
          copy.style.transform = '';
          copy.style.opacity = '';
          copy.style.willChange = 'auto';
        }
      }
    };

    if (motionMq.matches) {
      for (const row of rows) {
        const id = row.dataset.caseId;
        if (id) revealedRef.current.add(id);
      }
    }

    const scrollParent = getScrollParent(root);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.caseId;
          if (id) reveal(id);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
        root: scrollParent instanceof Window ? null : scrollParent,
      }
    );

    for (const row of rows) {
      const id = row.dataset.caseId;
      if (!id || revealedRef.current.has(id)) continue;
      observer.observe(row);
    }

    let raf = 0;
    let ticking = false;

    const updateParallax = () => {
      ticking = false;
      if (motionMq.matches || !desktopMq.matches) {
        resetParallax();
        return;
      }

      const vh = window.innerHeight || 1;
      for (const row of rows) {
        const id = row.dataset.caseId;
        if (!id || !revealedRef.current.has(id)) continue;
        const media = row.querySelector<HTMLElement>('[data-case-media-shift]');
        const copy = row.querySelector<HTMLElement>('[data-case-copy]');
        if (!media && !copy) continue;

        const rect = row.getBoundingClientRect();
        const centered = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const clamped = Math.max(-1.15, Math.min(1.15, centered));

        if (media) {
          media.style.willChange = 'transform';
          media.style.transform = `translate3d(0, ${(clamped * CASE_PARALLAX_TRAVEL * CASE_MEDIA_PARALLAX).toFixed(2)}px, 0)`;
        }
        if (copy) {
          copy.style.willChange = 'transform';
          copy.style.transform = `translate3d(0, ${(clamped * CASE_PARALLAX_TRAVEL * CASE_TEXT_PARALLAX).toFixed(2)}px, 0)`;
          const fade = Math.max(0.88, 1 - Math.max(0, Math.abs(clamped) - 0.28) * 0.42);
          copy.style.opacity = fade.toFixed(3);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(updateParallax);
    };

    const scrollTarget: EventTarget = scrollParent;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    desktopMq.addEventListener('change', onScroll);
    motionMq.addEventListener('change', onScroll);
    onScroll();

    const failSafe = window.setTimeout(() => {
      for (const row of rows) {
        const id = row.dataset.caseId;
        if (id) reveal(id);
      }
    }, 1800);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      desktopMq.removeEventListener('change', onScroll);
      motionMq.removeEventListener('change', onScroll);
      resetParallax();
    };
  }, [itemsKey]);

  return { rootRef, revealed };
}

function CaseSheet({
  item,
  index,
  presentation,
  settings,
  revealed,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  settings: PortfolioWorkProjectsCaseSettings;
  revealed: boolean;
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
  const categoryColor = accent && ink && sameHex(accent, ink) ? muted : accent;

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
  /** Zig-zag rhythm (toggleable) — even rows sit image-left/copy-right (copy overflows
   *  the image's top-right), odd rows mirror to image-right/copy-left (copy overflows
   *  top-left). Off keeps every row on the "even" (image-left) side. */
  const zigzagOn = settings.zigzagEnabled !== false;
  const isEven = zigzagOn ? index % 2 === 0 : true;
  const revealDelay = Math.min(index, 4) * 90;
  const mediaClipStyle: CSSProperties = revealed
    ? {
        clipPath: 'inset(0% 0% 0% 0%)',
        transition: `clip-path 1.05s ${CASE_EASE} ${revealDelay}ms`,
      }
    : { clipPath: isEven ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' };

  const rows: { key: string; label: string; content: ReactNode }[] = [];
  if (showDescription) {
    rows.push({
      key: 'description',
      label: descriptionLabel,
      content: (
        <p
          className="max-w-[36em] text-[15px] font-light italic leading-[1.85] tracking-[-0.01em] sm:text-[1.05rem] sm:leading-[1.9]"
          style={{ opacity: 0.86 }}
        >
          {description}
        </p>
      ),
    });
  }
  if (showStack) {
    rows.push({
      key: 'stack',
      label: stackLabel,
      content: (
        <ul className="flex flex-wrap gap-x-0 gap-y-1.5">
          {tools.map((tool, toolIndex) => (
            <li
              key={tool}
              className="flex items-center text-[10px] font-medium tracking-[0.14em] uppercase sm:text-[11px]"
              style={{ color: tagInk, opacity: 0.62 }}
            >
              {toolIndex > 0 ? (
                <span className="mx-2.5 opacity-35" aria-hidden>
                  ·
                </span>
              ) : null}
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
      <div className="flex items-start justify-between gap-4">
        <p className="flex min-w-0 items-baseline gap-3">
          <span
            className="shrink-0 font-mono font-extralight leading-none tabular-nums tracking-tight"
            style={{ color: categoryColor, opacity: 0.92, fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)' }}
            data-pf-no-color-transition=""
          >
            {formatCaseIndex(index)}
          </span>
          {showCategory ? (
            <span
              className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]"
              style={{ color: categoryColor }}
            >
              {category}
            </span>
          ) : null}
        </p>
        {showRole ? (
          <span
            className="max-w-[48%] truncate pt-1 text-right text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]"
            style={{ color: muted, opacity: 0.58 }}
          >
            {role}
          </span>
        ) : null}
      </div>

      <h3
        className="mt-4 font-normal leading-[0.96] tracking-[-0.055em] sm:mt-5"
        data-pf-no-color-transition=""
        style={{
          color: ink,
          fontSize: 'clamp(2.15rem, 4.6vw, 4rem)',
        }}
      >
        <CaseRevealTitle text={title} allowItalic />
      </h3>

      {rows.length > 0 ? (
        <dl className="mt-7 sm:mt-8">
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
        <div className={`${rows.length > 0 ? 'mt-8 sm:mt-10' : 'mt-8 sm:mt-9'}`}>
          <span
            aria-hidden
            className="mb-5 block h-px w-10 sm:mb-6"
            style={{ backgroundColor: accent, opacity: 0.45 }}
            data-pf-no-color-transition=""
          />
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

  const overlapClass = showThumb
    ? isEven
      ? 'sm:-mt-10 lg:-mt-16'
      : 'sm:-mt-5 lg:-mt-8'
    : '';

  return (
    <div
      data-case-row=""
      data-case-id={item.id}
      data-case-revealed={revealed ? 'true' : 'false'}
      className={`group/sheet relative flex flex-col gap-8 sm:items-start lg:gap-12 xl:gap-16 ${
        isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
      }`}
      data-pf-no-color-transition=""
      style={caseEnterStyle(revealed, revealDelay)}
    >
      {showThumb ? (
        <div className="w-full shrink-0 overflow-hidden sm:w-[52%] lg:w-[54%]">
          <CaseThumbnail
            url={mediaUrl}
            alt={title}
            surface={tagSurface || surface}
            height={thumbnailHeight}
            wash={categoryColor}
            clipStyle={mediaClipStyle}
          />
        </div>
      ) : null}

      <article
        data-case-copy=""
        className={`relative z-[1] min-w-0 will-change-transform ${
          showThumb ? 'w-full sm:w-[48%] lg:w-[46%]' : 'w-full'
        } ${overlapClass} ${framed ? 'p-5 sm:p-6 lg:p-8' : ''}`}
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
            className="pointer-events-none absolute bottom-0 left-0 top-0 w-[1.5px] origin-top scale-y-0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/sheet:scale-y-100 group-hover/sheet:opacity-100 group-focus-within/sheet:scale-y-100 group-focus-within/sheet:opacity-100"
            style={{ backgroundColor: accent }}
          />
        ) : null}
        <div
          className="pf-work-case-lift transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform group-hover/sheet:-translate-y-2 group-focus-within/sheet:-translate-y-2"
          data-pf-no-color-transition=""
        >
          {body}
        </div>
      </article>

      {href ? (
        <CaseConsultAnchor
          href={href}
          className="absolute inset-0 z-[2]"
          ariaLabel={`View ${title}`}
          magnetic
          noColorTransition
        >
          <span className="sr-only">{`View ${title}`}</span>
        </CaseConsultAnchor>
      ) : null}
    </div>
  );
}

/**
 * Case header — kicker + editorial title, FOUC-hidden until IntersectionObserver.
 */
export function ProjectsCaseSectionHeader({
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
  useCaseHeaderReveal(headerRef, `${heading}|${sub}|${entryCount ?? 0}`, !isEmpty);

  const resolvedTitleColor =
    (typeof titleStyle?.color === 'string' && titleStyle.color.trim()) || titleColor;
  const { rest: restTitleStyle, fontStyle: incomingFontStyle } = stripHeaderTitleMetrics(titleStyle);
  const allowItalicWord = incomingFontStyle !== 'italic';
  const mark = accent || subtitleColor;
  const countLabel =
    typeof entryCount === 'number' && entryCount > 0
      ? String(entryCount).padStart(2, '0')
      : '';

  if (isEmpty) return null;

  return (
    <header
      ref={headerRef}
      className={`pf-work-case-header mb-14 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}
      data-pf-no-color-transition=""
      style={CASE_HIDDEN}
    >
      <style>{CASE_MOTION_CSS}</style>
      <div className="flex items-end justify-between gap-6 sm:gap-10">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <span
              className="h-px w-8 shrink-0 sm:w-10"
              style={{ backgroundColor: mark, opacity: 0.7 }}
              aria-hidden
            />
            {countLabel ? (
              <p
                className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] tabular-nums sm:text-[11px]"
                style={{ color: subtitleColor }}
              >
                {countLabel}
              </p>
            ) : null}
          </div>
          {heading ? (
            <h2
              className={titleClassName.trim() || 'font-normal tracking-[-0.045em]'}
              style={{
                ...restTitleStyle,
                color: resolvedTitleColor,
                fontSize: 'clamp(2.45rem, 6.4vw, 5rem)',
                lineHeight: 1.04,
              }}
            >
              <EditorialTitleText text={heading} allowItalic={allowItalicWord} />
            </h2>
          ) : null}
          {sub ? (
            <p
              className={`max-w-xl text-[15px] leading-[1.8] sm:text-base sm:leading-[1.85] ${heading ? 'mt-4 sm:mt-5' : ''}`}
              style={{ color: subtitleColor, opacity: 0.86 }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0 pb-1 sm:pt-2">{trailing}</div> : null}
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

/** Editorial case rows — large media left + dossier copy, asymmetric desktop scroll. */
export function ProjectsCaseGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const itemsKey = items.map((item) => item.id).join('|');
  const { rootRef, revealed } = useCaseGalleryMotion(itemsKey);
  const settings = mergeProjectsCaseSettings(
    DEFAULT_PROJECTS_CASE_SETTINGS,
    presentation.projectsCase
  );
  const gapClass = caseSheetGapClass(settings.sheetGap ?? 'xl');
  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#2563eb';

  if (items.length === 0) return null;

  return (
    <section
      ref={rootRef}
      className="relative w-full"
      aria-label="Project cases"
      data-case-gallery=""
      data-pf-no-color-transition=""
    >
      <style>{CASE_MOTION_CSS}</style>
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? gapClass : ''}>
          <CaseSheet
            item={item}
            index={index}
            presentation={presentation}
            settings={settings}
            revealed={revealed.has(item.id)}
          />
        </div>
      ))}
      <CaseMagneticCursor stageRef={rootRef} accent={accent} />
    </section>
  );
}

export function isProjectsCaseDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-case';
}
