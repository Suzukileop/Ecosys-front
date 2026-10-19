'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { galleryPrefersReducedMotion } from '@/components/portfolio/portfolio-gallery-design-motion';
import {
  galleryItemDisplayTitle,
  type PortfolioGalleryPresentationSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** One shared easing for every motion in this design — the brief's own curve. */
const FRAME_EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/**
 * The masonry's rhythm when the owner hasn't asked for each image's own proportions. A fixed
 * ratio for every tile would line the round-robin columns up into a plain grid; cycling these
 * gives every column a different height, which is the whole point of the design. Six ratios
 * against three columns: each column gets one tall and one wide plate per pass.
 */
const FRAMED_GRID_RHYTHM = ['4 / 5', '1 / 1', '3 / 4', '5 / 4', '2 / 3', '4 / 3'];

/**
 * Framed grid — an irregular-column masonry with per-column scroll parallax (the outer columns
 * drift opposite the center one, at a speed set by `framedGridParallax`), a large hover-only
 * title (serif or mono, per `framedGridTitleStyle`), and a slow internal zoom + monochrome-to-
 * color bloom on hover (`framedGridColorReveal`), with a thin luminous rim and a floating lift.
 *
 * Column distribution is a round-robin over `presentation.columns` — deliberately not a
 * height-measured masonry (that needs a client-only layout pass and risks a hydration flash).
 * Irregular heights come from the images' own ratios (`imageAspect: 'auto'`) or, otherwise,
 * from `FRAMED_GRID_RHYTHM`.
 *
 * Column count narrows responsively (1 under 640px, capped at 2 under 1024px) via a small
 * client-only hook — the first render matches the server's so there's no hydration mismatch.
 */
function useEffectiveColumns(desired: number, rootRef: RefObject<HTMLDivElement | null>): number {
  const [columns, setColumns] = useState(desired);
  useEffect(() => {
    const compute = () => {
      const width = rootRef.current?.clientWidth ?? window.innerWidth;
      if (width < 640) return 1;
      if (width < 1024) return Math.min(2, desired);
      return desired;
    };
    const update = () => setColumns(compute());
    update();
    const observer = new ResizeObserver(update);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [desired, rootRef]);
  return Math.min(columns, desired);
}

function FramedGridTile({
  item,
  index,
  presentation,
  eager,
  onOpen,
  showTitle: showTitles,
  ink,
}: {
  item: ProfileGalleryItem;
  index: number;
  presentation: PortfolioGalleryPresentationSettings;
  eager: boolean;
  onOpen?: (item: ProfileGalleryItem) => void;
  showTitle: boolean;
  ink: string;
}) {
  const t = useT();
  const itemTitle = galleryItemDisplayTitle(item.title);
  const showTitle = showTitles && Boolean(itemTitle);
  const isInteractive = Boolean(onOpen);
  const isOriginalRatio = presentation.imageAspect === 'auto';
  const aspect: CSSProperties = isOriginalRatio
    ? {}
    : { aspectRatio: FRAMED_GRID_RHYTHM[index % FRAMED_GRID_RHYTHM.length] };
  const colorReveal = presentation.framedGridColorReveal !== false;
  const hoverZoom = presentation.hoverZoom !== false;
  const activate = () => onOpen?.(item);

  return (
    <article
      data-gallery-reveal=""
      className={`pf-gallery-framed-tile group relative flex w-full flex-col transition-[transform,translate,scale,rotate,box-shadow] duration-[620ms] ${FRAME_EASE} hover:z-10 hover:-translate-y-1 ${
        isInteractive ? 'cursor-zoom-in focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500' : ''
      }`}
      style={{ borderRadius: `${presentation.radius}px` }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? t('Open {title}', { title: itemTitle || t('Gallery media') }) : undefined}
      onClick={activate}
      onKeyDown={(event) => {
        if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          activate();
        }
      }}
    >
      <div
        data-gallery-reveal-media=""
        className="relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900"
        data-pf-no-color-transition=""
        style={{ borderRadius: `${presentation.radius}px`, ...aspect }}
      >
        {/* Micro-border + floating relief: near-invisible at rest, blooms into a thin luminous
            rim and a soft cast shadow on hover — never a flat static frame. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-0 transition-opacity duration-[620ms] ${FRAME_EASE} group-hover:opacity-100 group-focus-visible:opacity-100`}
          data-pf-no-color-transition=""
          style={{
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ink} 38%, transparent), 0 28px 56px -22px rgba(0,0,0,0.55)`,
          }}
        />
        <div
          className={`relative h-full w-full transition-[filter] duration-[1000ms] ${FRAME_EASE} ${
            // Pointer devices only: a touch screen has no hover to bloom the color back.
            colorReveal
              ? '[@media(hover:hover)]:grayscale-[0.85] [@media(hover:hover)]:contrast-[1.04] [@media(hover:hover)]:saturate-[0.75] group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100 group-focus-visible:grayscale-0 group-focus-visible:saturate-100'
              : ''
          }`}
          data-pf-no-color-transition=""
        >
          <PortfolioDeferredMedia
            src={item.mediaUrl}
            alt={itemTitle || t('Gallery media')}
            className={`h-full w-full ${
              hoverZoom ? `transition-transform duration-[1400ms] ${FRAME_EASE} will-change-transform group-hover:scale-[1.055]` : ''
            }`}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            eager={eager}
            highPriority={eager}
            kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
            objectFit={isOriginalRatio ? 'contain' : presentation.objectFit}
            objectPosition={presentation.objectPosition}
            autoPlayVideo={item.mediaType === 'VIDEO'}
            showPlayBadge={item.mediaType === 'VIDEO'}
            fillParent={!isOriginalRatio}
            noColorTransition
          />
        </div>

        {/* Hover-only on pointer devices; always shown on touch, where nothing would reveal it. */}
        {showTitle ? (
          <>
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-2/3 opacity-0 transition-opacity duration-[560ms] ${FRAME_EASE} group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100`}
              data-pf-no-color-transition=""
              style={{
                backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0) 100%)',
              }}
            />
            <span
              className={`pf-gallery-framed-title pointer-events-none absolute inset-x-0 bottom-0 z-[5] block translate-y-3 px-5 pb-5 pt-8 text-white opacity-0 transition-[opacity,transform,translate,scale,rotate] duration-[560ms] ${FRAME_EASE} group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 ${
                presentation.framedGridTitleStyle === 'mono'
                  ? 'font-mono text-[calc(clamp(0.85rem,1.4vw,1.15rem)*var(--pf-gallery-font-scale,1))] font-medium uppercase tracking-[0.18em]'
                  : 'font-serif text-[calc(clamp(1.6rem,3.4vw,2.5rem)*var(--pf-gallery-font-scale,1))] italic leading-[1.05] tracking-[-0.01em]'
              }`}
              data-pf-no-color-transition=""
            >
              <span className="pf-gallery-framed-title-text">{itemTitle}</span>
            </span>
          </>
        ) : null}
      </div>
    </article>
  );
}

export function GalleryFramedGrid({
  items,
  presentation,
  baseWidth,
  onOpen,
  showTitle,
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  baseWidth: string;
  /** Absent when General → Lightbox is off: the tiles are then plain, non-interactive images. */
  onOpen?: (item: ProfileGalleryItem) => void;
  showTitle: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const effectiveColumns = useEffectiveColumns(Math.max(1, presentation.columns || 3), rootRef);
  const ink = presentation.itemTitleColor?.trim() || '#f5f5f5';
  const rowGap = presentation.verticalGap >= 0 ? presentation.verticalGap : presentation.gap;

  const columnItems = useMemo(() => {
    const columns: { item: ProfileGalleryItem; index: number }[][] = Array.from(
      { length: effectiveColumns },
      () => []
    );
    items.forEach((item, index) => {
      columns[index % effectiveColumns].push({ item, index });
    });
    return columns;
  }, [items, effectiveColumns]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (galleryPrefersReducedMotion()) return undefined;
    const parallax = presentation.framedGridParallax ?? 'medium';
    if (parallax === 'off') return undefined;

    const columnEls = Array.from(root.querySelectorAll<HTMLElement>('[data-framed-col]'));
    if (columnEls.length < 2) return undefined;

    const magnitude = { subtle: 26, medium: 48, strong: 80 }[parallax] ?? 48;
    const count = columnEls.length;
    let scroller: HTMLElement | undefined;
    let parent = root.parentElement;
    while (parent && parent !== document.body) {
      if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY) &&
        parent.scrollHeight > parent.clientHeight + 1) {
        scroller = parent;
        break;
      }
      parent = parent.parentElement;
    }
    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        columnEls.forEach((columnEl, index) => {
          const distanceFromCenter = index - (count - 1) / 2;
          const amount = distanceFromCenter * magnitude;
          if (Math.abs(amount) < 1) return;
          gsap.fromTo(
            columnEl,
            { y: -amount },
            {
              y: amount,
              ease: 'none',
              scrollTrigger: { trigger: root, scroller, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true },
            }
          );
        });
      }, root);
    } catch (error) {
      console.error('[GalleryFramedGrid] parallax failed to initialize', error);
      ctx?.revert();
      gsap.set(columnEls, { clearProps: 'transform' });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[GalleryFramedGrid] deferred ScrollTrigger.refresh() failed', error);
      }
    }, 80);

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [effectiveColumns, items.length, presentation.framedGridParallax]);

  return (
    <div
      ref={rootRef}
      className={`pf-gallery-framed ${baseWidth} overflow-visible`}
      style={{
        padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
        paddingBlock: `${Math.max(presentation.padding, effectiveColumns > 1 && presentation.framedGridParallax !== 'off' ? (effectiveColumns - 1) / 2 * ({ subtle: 26, medium: 48, strong: 80 }[presentation.framedGridParallax ?? 'medium']) : 0)}px`,
      }}
    >
      <div className="flex w-full items-start overflow-visible" style={{ gap: `${presentation.gap}px` }}>
        {columnItems.map((column, columnIndex) => (
          <div
            key={columnIndex}
            data-framed-col=""
            className="flex min-w-0 flex-1 flex-col overflow-visible will-change-transform"
            style={{ gap: `${rowGap}px` }}
          >
            {column.map(({ item, index }) => (
              <FramedGridTile
                key={item.id}
                item={item}
                index={index}
                presentation={presentation}
                eager={index < effectiveColumns * 2}
                onOpen={onOpen}
                showTitle={showTitle}
                ink={ink}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
