'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import type { MarketplaceContentItem } from '@/types/marketplace';
import type {
  PortfolioWorkPresentationSettings,
  PortfolioWorkProjectsFramesCardGap,
  PortfolioWorkProjectsFramesSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_PROJECTS_FRAMES_SETTINGS,
  DEFAULT_WORK_PRESENTATION,
  mergeProjectsFramesSettings,
} from '@/components/portfolio/portfolio-work-settings';

const FRAMES_ENTRANCE_MS = 920;
const FRAMES_ENTRANCE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const FRAMES_REVEAL_MS = 1150;
const FRAMES_IMAGE_PARALLAX = 0.6;
const FRAMES_COPY_PARALLAX = 1.05;
const FRAMES_TITLE_PARALLAX = 0.3;
const FRAMES_PARALLAX_TRAVEL = 64;
const FRAMES_DESKTOP_MQ = '(min-width: 768px)';

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

function workCategoryLabel(item: MarketplaceContentItem): string {
  const category = item.category?.trim();
  if (category) return category;
  const genre = item.genre?.trim();
  const role = item.role?.trim();
  if (genre && genre !== role) return genre;
  return '';
}

/** Curtain-open scroll reveal — a plain rectangular inset with no rounding baked in.
 * The organic diagonal cutout itself is a separate, breakpoint-aware border-radius (see
 * the [data-frames-media-frame] rules below) so it can be switched off entirely on
 * mobile, where the image bleeds edge-to-edge, without fighting this clip-path. */
function framesClipPath(revealed: boolean): string {
  const inset = revealed ? '0% 0% 0% 0%' : '0% 0% 38% 0%';
  return `inset(${inset})`;
}

function framesCardGapClass(gap: PortfolioWorkProjectsFramesCardGap): string {
  if (gap === 'md') return 'gap-24 sm:gap-32 lg:gap-40';
  if (gap === 'xl') return 'gap-32 sm:gap-44 lg:gap-56 xl:gap-64';
  return 'gap-16 sm:gap-24 lg:gap-28 xl:gap-32';
}

/** Tablet (768–1023px): an even 50/50 split with the two columns pulled close
 * together — no leftover gap column. Desktop (≥1024px) keeps the original,
 * more generous 7/4 split with breathing room between image and copy. */
function framesImageColumnClass(imageOnRight: boolean): string {
  return imageOnRight
    ? 'md:col-span-6 md:col-start-7 lg:col-span-7 lg:col-start-6'
    : 'md:col-span-6 md:col-start-1 lg:col-span-7 lg:col-start-1';
}

function framesCopyColumnClass(imageOnRight: boolean): string {
  return imageOnRight
    ? 'md:col-span-6 md:col-start-1 lg:col-span-4 lg:col-start-1'
    : 'md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9';
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node) return window;
  let parent: HTMLElement | null = node.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function useFramesGalleryMotion(itemsKey: string): {
  rootRef: RefObject<HTMLDivElement | null>;
  revealed: ReadonlySet<string>;
} {
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set());
  const revealedRef = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopMq = window.matchMedia(FRAMES_DESKTOP_MQ);
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-frames-row]'));

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
        const media = row.querySelector<HTMLElement>('[data-frames-media-shift]');
        const title = row.querySelector<HTMLElement>('[data-frames-title-shift]');
        const copy = row.querySelector<HTMLElement>('[data-frames-copy]');
        if (media) media.style.transform = '';
        if (title) title.style.transform = '';
        if (copy) {
          copy.style.transform = '';
          copy.style.opacity = '';
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.framesId;
          if (id) reveal(id);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    for (const row of rows) {
      const id = row.dataset.framesId;
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
        const id = row.dataset.framesId;
        if (!id || !revealedRef.current.has(id)) continue;
        const media = row.querySelector<HTMLElement>('[data-frames-media-shift]');
        const title = row.querySelector<HTMLElement>('[data-frames-title-shift]');
        const copy = row.querySelector<HTMLElement>('[data-frames-copy]');
        if (!media && !title && !copy) continue;

        const rect = row.getBoundingClientRect();
        const centered = (rect.top + rect.height * 0.5 - vh * 0.5) / vh;
        const clamped = Math.max(-1.15, Math.min(1.15, centered));

        if (media) {
          media.style.transform = `translate3d(0, ${(clamped * FRAMES_PARALLAX_TRAVEL * FRAMES_IMAGE_PARALLAX).toFixed(2)}px, 0)`;
        }
        if (title) {
          title.style.transform = `translate3d(0, ${(clamped * FRAMES_PARALLAX_TRAVEL * FRAMES_TITLE_PARALLAX).toFixed(2)}px, 0)`;
        }
        if (copy) {
          copy.style.transform = `translate3d(0, ${(clamped * FRAMES_PARALLAX_TRAVEL * FRAMES_COPY_PARALLAX).toFixed(2)}px, 0)`;
          const fade = Math.max(0.48, 1 - Math.max(0, Math.abs(clamped) - 0.22) * 0.85);
          copy.style.opacity = fade.toFixed(3);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = window.requestAnimationFrame(updateParallax);
    };

    const scrollParent = getScrollParent(root);
    const scrollTarget: EventTarget = scrollParent;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    desktopMq.addEventListener('change', onScroll);
    motionMq.addEventListener('change', onScroll);
    onScroll();

    return () => {
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

/**
 * Frames design header — compact title + optional subtitle.
 */
export function ProjectsFramesSectionHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  className = '',
}: {
  title: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  className?: string;
}) {
  const heading = title.trim();
  const sub = subtitle?.trim() || '';
  if (!heading && !sub) return null;

  return (
    <header className={`mb-12 w-full sm:mb-16 lg:mb-20 ${className}`.trim()}>
      {heading ? (
        <h2
          className="max-w-3xl text-3xl font-semibold tracking-[-0.038em] sm:text-4xl lg:text-[3.05rem] lg:leading-[1.08]"
          style={{ color: titleColor }}
        >
          {heading}
        </h2>
      ) : null}
      {sub ? (
        <p
          className={`max-w-2xl text-base leading-[1.8] sm:text-lg sm:leading-[1.85] ${heading ? 'mt-4 sm:mt-5' : ''}`}
          style={{ color: subtitleColor }}
        >
          {sub}
        </p>
      ) : null}
    </header>
  );
}

/** Tools as one quiet uppercase line, dot-separated — each word animates on hover without
 * shifting its neighbors (transform/opacity only), and scrolls sideways if it overflows. */
function FramesStackList({ tools, ink }: { tools: string[]; ink: string }) {
  if (tools.length === 0) return null;
  return (
    <ul
      className="m-0 flex list-none items-center gap-x-2.5 overflow-x-auto whitespace-nowrap p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Stack"
    >
      {tools.map((tool, index) => (
        <li key={tool} className="flex shrink-0 items-center gap-x-2.5">
          <span
            className="inline-block text-[10px] font-medium uppercase leading-none tracking-[0.2em] opacity-70 transition-[transform,opacity,letter-spacing] duration-300 ease-out hover:scale-110 hover:tracking-[0.3em] hover:opacity-100 sm:text-[11px]"
            style={{ color: ink }}
          >
            {tool}
          </span>
          {index < tools.length - 1 ? (
            <span aria-hidden className="text-[10px] leading-none sm:text-[11px]" style={{ color: ink, opacity: 0.35 }}>
              •
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Internal vs external project link, ref-forwarding so the cursor's bounds check can watch it. */
const FramesProjectLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    className?: string;
    ariaLabel: string;
    children: ReactNode;
    onMouseEnter?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
    onMouseLeave?: () => void;
  }
>(function FramesProjectLink({ href, className, ariaLabel, children, onMouseEnter, onMouseLeave }, ref) {
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-pf-no-color-transition=""
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-pf-no-color-transition=""
    >
      {children}
    </Link>
  );
});

/** Textured circle that replaces the OS cursor over the image/title — liquid-inertia follow,
 * dismissed the instant the pointer leaves the trigger's bounds. */
function FramesViewCursor({
  anchor,
  containerRef,
  onDismiss,
  label = 'View',
}: {
  anchor: { x: number; y: number } | null;
  containerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  label?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useLayoutEffect(() => {
    if (!anchor) return;
    target.current = anchor;
    current.current = anchor;
    if (elRef.current) {
      elRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0) translate(-50%, -50%)`;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handleMove = (event: MouseEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMove);

    const lerpFactor = reduceMotion ? 1 : 0.2;
    const tick = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const stillInside =
        rect &&
        target.current.x >= rect.left &&
        target.current.x <= rect.right &&
        target.current.y >= rect.top &&
        target.current.y <= rect.bottom;
      if (!stillInside) {
        onDismiss();
        return;
      }

      current.current = {
        x: current.current.x + (target.current.x - current.current.x) * lerpFactor,
        y: current.current.y + (target.current.y - current.current.y) * lerpFactor,
      };
      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [anchor, containerRef, onDismiss]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={elRef}
      aria-hidden="true"
      data-pf-no-color-transition=""
      className="pointer-events-none fixed left-0 top-0 z-[999] transition-opacity duration-200 ease-out"
      style={{ opacity: anchor ? 1 : 0 }}
    >
      <div
        className="flex h-[6.25rem] w-[6.25rem] flex-col items-center justify-center gap-1 rounded-full border border-white/25 bg-white/92 text-neutral-900 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
          backgroundSize: '5px 5px',
        }}
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.22em]">{label}</span>
        <span aria-hidden className="text-sm leading-none">
          ↗
        </span>
      </div>
    </div>,
    document.body
  );
}

function FramesCard({
  item,
  index,
  presentation,
  board,
  imageOnRight,
  revealed,
}: {
  item: MarketplaceContentItem;
  index: number;
  presentation: PortfolioWorkPresentationSettings;
  board: PortfolioWorkProjectsFramesSettings;
  imageOnRight: boolean;
  revealed: boolean;
}) {
  const role = workRoleLabel(item);
  const category = workCategoryLabel(item);
  const description = item.description?.trim() || '';
  const tools = workToolLabels(item);
  const href = item.linkUrl?.trim() || null;
  const mediaUrl = item.mediaUrl?.trim() || null;

  const accent = presentation.ctaColor || presentation.categoryActiveColor;
  const titleColor = presentation.elementStyles?.cardTitle?.color || presentation.titleColor;
  const muted = presentation.elementStyles?.cardDescription?.color || presentation.subtitleColor;

  const showRole = board.showRole && Boolean(role);
  const showCategory = board.showCategory && Boolean(category);
  const showMeta = showRole || showCategory;
  const showDescription = board.showDescription && Boolean(description);
  const showStack = board.showStack && tools.length > 0;

  const corner: 'a' | 'b' = index % 2 === 0 ? 'a' : 'b';
  const floatDelay = `${(index % 4) * 0.55}s`;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const [cursorAnchor, setCursorAnchor] = useState<{ x: number; y: number } | null>(null);
  const dismissCursor = useCallback(() => setCursorAnchor(null), []);
  const handleEnter = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    setCursorAnchor({ x: event.clientX, y: event.clientY });
  }, []);

  const motionStyle: CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translate3d(0, 0, 0)' : 'translate3d(0, 2.75rem, 0)',
    transition: `opacity ${FRAMES_ENTRANCE_MS}ms ${FRAMES_ENTRANCE_EASE}, transform ${FRAMES_ENTRANCE_MS}ms ${FRAMES_ENTRANCE_EASE}`,
    transitionDelay: revealed ? `${Math.min(index, 3) * 95}ms` : '0ms',
  };

  const titleWords = item.title.trim().split(/\s+/).filter(Boolean);

  const titleNode = (
    <h3
      className="pf-frames-title relative z-10 font-black leading-[0.92] tracking-[-0.045em] text-[clamp(2.1rem,11vw,3.25rem)] transition-[color,-webkit-text-stroke-width] duration-500 ease-out sm:text-[clamp(2.4rem,9vw,3.75rem)] md:text-[clamp(2.75rem,6vw,4.25rem)] lg:text-[clamp(3.25rem,6.5vw,6rem)] [color:var(--pf-frames-ink)] group-hover/frame:text-transparent group-hover/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)] group-focus-visible/frame:text-transparent group-focus-visible/frame:[-webkit-text-stroke:1.5px_var(--pf-frames-ink)]"
      style={{ '--pf-frames-ink': titleColor } as CSSProperties}
    >
      {titleWords.map((word, wordIndex) => (
        <span key={`${wordIndex}-${word}`} className="inline-block overflow-hidden align-top">
          <span
            className="pf-frames-word inline-block will-change-transform"
            data-revealed={revealed ? 'true' : 'false'}
            style={{ transitionDelay: revealed ? `${180 + wordIndex * 55}ms` : '0ms' }}
          >
            {word}
            {wordIndex < titleWords.length - 1 ? ' ' : ''}
          </span>
        </span>
      ))}
    </h3>
  );

  const mediaNode = mediaUrl ? (
    <div
      data-frames-media-frame=""
      data-frames-corner={corner}
      className="relative w-full overflow-hidden shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] max-md:mx-[calc(50%-50vw)] max-md:aspect-auto max-md:h-[48dvh] max-md:w-screen md:aspect-[16/11]"
      style={{
        backgroundColor: `${muted}22`,
        clipPath: framesClipPath(revealed),
        transform: revealed ? 'scale(1)' : 'scale(1.14)',
        transition: `clip-path ${FRAMES_REVEAL_MS}ms ${FRAMES_ENTRANCE_EASE}, transform ${FRAMES_REVEAL_MS}ms ${FRAMES_ENTRANCE_EASE}`,
      }}
    >
      <Image
        src={mediaUrl}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover object-center transition-transform duration-[1.2s] ease-out group-hover/frame:scale-[1.06]"
      />
    </div>
  ) : (
    <div
      className="relative flex w-full items-center justify-center px-6 text-center text-sm leading-[1.8] max-md:mx-[calc(50%-50vw)] max-md:h-[48dvh] max-md:w-screen md:aspect-[16/11]"
      style={{ color: muted }}
    >
      Add a thumbnail in Information → Portfolio
    </div>
  );

  const mobileMeta = showMeta ? (
    <p className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.24em] md:hidden">
      {showRole ? <span style={{ color: accent }}>{role}</span> : null}
      {showRole && showCategory ? (
        <span style={{ color: muted, opacity: 0.4 }} aria-hidden>
          ·
        </span>
      ) : null}
      {showCategory ? <span style={{ color: muted }}>{category}</span> : null}
    </p>
  ) : null;

  const stageChildren = (
    <>
      <div data-frames-float="" style={{ animationDelay: floatDelay, animationDuration: '7s' }}>
        <div data-frames-media-shift="" className="will-change-transform">
          {mediaNode}
        </div>
      </div>
      <div
        data-frames-float=""
        style={{ animationDelay: floatDelay, animationDuration: '9.5s' }}
        className="relative z-10 -mt-[clamp(0.85rem,5vw,1.5rem)] md:-mt-[clamp(1rem,3vw,1.75rem)] lg:-mt-[clamp(1.25rem,2.4vw,2.5rem)]"
      >
        {mobileMeta}
        <div data-frames-title-shift="" className="will-change-transform">
          {titleNode}
        </div>
      </div>
    </>
  );

  const stage = href ? (
    <FramesProjectLink
      ref={linkRef}
      href={href}
      ariaLabel={item.title || 'Project'}
      className="group/frame block cursor-none focus:outline-none"
      onMouseEnter={handleEnter}
      onMouseLeave={dismissCursor}
    >
      {stageChildren}
    </FramesProjectLink>
  ) : (
    <div className="group/frame">{stageChildren}</div>
  );

  return (
    <article
      data-frames-row=""
      data-frames-id={item.id}
      className="relative w-full"
      style={motionStyle}
    >
      {showMeta ? (
        <p className="mb-3 hidden flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.24em] sm:mb-4 sm:text-[11px] md:flex">
          {showRole ? <span style={{ color: accent }}>{role}</span> : null}
          {showRole && showCategory ? (
            <span style={{ color: muted, opacity: 0.4 }} aria-hidden>
              ·
            </span>
          ) : null}
          {showCategory ? <span style={{ color: muted }}>{category}</span> : null}
        </p>
      ) : null}

      <div className="md:grid md:grid-cols-12 md:gap-x-4 lg:gap-x-6">
        <div className={framesImageColumnClass(imageOnRight)}>{stage}</div>

        {showDescription || showStack ? (
          <div
            data-frames-copy=""
            className={`mt-5 will-change-transform sm:mt-6 md:mt-0 md:self-end ${framesCopyColumnClass(
              imageOnRight
            )}`}
          >
            {showDescription ? (
              <p
                className="max-w-xs text-[12px] font-light leading-[1.55] line-clamp-2 sm:text-[13px] md:text-sm md:leading-[1.9] md:line-clamp-none"
                style={{ color: muted, opacity: 0.85 }}
              >
                {description}
              </p>
            ) : null}
            {showStack ? (
              <div className={showDescription ? 'mt-4 sm:mt-5 md:mt-6 lg:mt-8' : ''}>
                <FramesStackList tools={tools} ink={muted} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {href ? (
        <FramesViewCursor anchor={cursorAnchor} containerRef={linkRef} onDismiss={dismissCursor} />
      ) : null}
    </article>
  );
}

/** Floating, immersive image + title spread — Projects frames design only. */
export function ProjectsFramesGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const itemsKey = items.map((item) => item.id).join('|');
  const { rootRef, revealed } = useFramesGalleryMotion(itemsKey);

  const board = mergeProjectsFramesSettings(
    DEFAULT_PROJECTS_FRAMES_SETTINGS,
    presentation.projectsFrames
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      data-frames-gallery=""
      className={`flex w-full flex-col ${framesCardGapClass(board.cardGap)}`}
    >
      <style>{`
        @keyframes pf-frames-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
        }
        [data-frames-gallery] [data-frames-float] {
          animation-name: pf-frames-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        [data-frames-gallery] [data-frames-media-frame] {
          border-radius: 0px;
          transition: border-radius 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (min-width: 768px) {
          [data-frames-gallery] [data-frames-media-frame][data-frames-corner='a'] {
            border-radius: clamp(1.75rem, 7vw, 5rem) 0px clamp(1.75rem, 7vw, 5rem) 0px;
          }
          [data-frames-gallery] [data-frames-media-frame][data-frames-corner='b'] {
            border-radius: 0px clamp(1.75rem, 7vw, 5rem) 0px clamp(1.75rem, 7vw, 5rem);
          }
        }
        [data-frames-gallery] .pf-frames-word {
          transform: translate3d(0, 100%, 0);
          transition: transform 0.92s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-frames-gallery] .pf-frames-word[data-revealed='true'] {
          transform: translate3d(0, 0, 0);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-frames-gallery] [data-frames-row] {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          [data-frames-gallery] [data-frames-float] {
            animation: none !important;
          }
          [data-frames-gallery] [data-frames-media-shift] > div {
            transition: none !important;
          }
          [data-frames-gallery] .pf-frames-word {
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      {items.map((item, index) => {
        const baseRight = board.imageSide === 'right';
        const imageOnRight = board.alternateSides
          ? index % 2 === 1
            ? !baseRight
            : baseRight
          : baseRight;
        return (
          <FramesCard
            key={item.id}
            item={item}
            index={index}
            presentation={presentation}
            board={board}
            imageOnRight={imageOnRight}
            revealed={revealed.has(item.id)}
          />
        );
      })}
    </div>
  );
}

export function isProjectsFramesDesign(
  presentation: Pick<PortfolioWorkPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return presentation?.sectionDesign === 'projects-frames';
}
