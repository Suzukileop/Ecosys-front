'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { galleryPrefersReducedMotion } from '@/components/portfolio/portfolio-gallery-design-motion';
import {
  galleryAspectStyle,
  galleryItemDisplayTitle,
  type PortfolioGalleryPresentationSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import type { ProfileGalleryItem } from '@/types/ecosystem';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** One shared easing for every motion in this design — the brief's own curve. */
const FRAME_EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/**
 * Framed grid — an irregular-column masonry with per-column scroll parallax (a cinematic
 * sense of depth: the outer columns drift opposite the center one, at a speed set by
 * `framedGridParallax`), a massive hover-only title (serif or mono, per
 * `framedGridTitleStyle` — replaces the old always-on under-caption entirely), and a slow
 * internal zoom + monochrome-to-color bloom on hover, with a thin luminous rim and a
 * floating lift for the "organic imperfection" the brief asked for.
 *
 * Column distribution is a simple round-robin over `presentation.columns` — deliberately not
 * a real height-measured masonry (that needs a client-only layout pass and risks a hydration
 * flash); pairing round-robin with natural, unforced image aspect ratios (`imageAspect: 'auto'`)
 * already produces genuinely irregular column heights from the images' own proportions.
 *
 * Column count narrows responsively (1 under 640px, capped at 2 under 1024px) via a small
 * client-only hook — the first render matches the server's (full desired column count) so
 * there's no hydration mismatch, only a brief, standard reflow right after mount on narrow
 * screens.
 */
function useEffectiveColumns(desired: number): number {
  const [columns, setColumns] = useState(desired);
  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 1024) return Math.min(2, desired);
      return desired;
    };
    const update = () => setColumns(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [desired]);
  return Math.min(columns, desired);
}

function FramedGridTile({
  item,
  index,
  presentation,
  eager,
  onOpen,
  ink,
}: {
  item: ProfileGalleryItem;
  index: number;
  presentation: PortfolioGalleryPresentationSettings;
  eager: boolean;
  onOpen: (item: ProfileGalleryItem) => void;
  ink: string;
}) {
  const itemTitle = galleryItemDisplayTitle(item.title);
  const showTitle = presentation.showTitle && Boolean(itemTitle);
  const isInteractive = presentation.lightboxEnabled;
  const aspect = presentation.imageAspect === 'auto' ? {} : galleryAspectStyle(presentation.imageAspect);
  const colorReveal = presentation.framedGridColorReveal;
  const activate = () => {
    if (presentation.lightboxEnabled) onOpen(item);
  };

  return (
    <article
      data-gallery-reveal=""
      className={`group relative flex w-full flex-col transition-[transform,box-shadow] duration-[620ms] ${FRAME_EASE} hover:z-10 hover:-translate-y-1 ${
        isInteractive ? 'cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500' : ''
      }`}
      style={{ borderRadius: `${presentation.radius}px` }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Open ${itemTitle || 'this media'}` : undefined}
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
        className="pf-framed-grid-tile relative w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900"
        data-pf-no-color-transition=""
        style={{ borderRadius: `${presentation.radius}px`, ...aspect }}
      >
        {/* Micro-border + floating relief: near-invisible at rest, blooms into a thin
            luminous rim and a soft cast shadow on hover — the "organic imperfection" the
            brief asked for, never a flat static frame. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-0 transition-opacity duration-[620ms] ${FRAME_EASE} group-hover:opacity-100`}
          data-pf-no-color-transition=""
          style={{
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ink} 38%, transparent), 0 28px 56px -22px rgba(0,0,0,0.55)`,
          }}
        />
        <div
          className={`relative h-full w-full transition-[filter] duration-[1000ms] ${FRAME_EASE} ${
            colorReveal ? 'grayscale-[0.85] contrast-[1.04] saturate-[0.75] group-hover:grayscale-0 group-hover:contrast-100 group-hover:saturate-100' : ''
          }`}
          data-pf-no-color-transition=""
        >
          <PortfolioDeferredMedia
            src={item.mediaUrl}
            alt={itemTitle || 'Gallery media'}
            className={`transition-transform duration-[1400ms] ${FRAME_EASE} will-change-transform group-hover:scale-[1.055]`}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
            eager={eager}
            highPriority={eager}
            kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
            objectFit={presentation.objectFit}
            objectPosition={presentation.objectPosition}
            autoPlayVideo={item.mediaType === 'VIDEO'}
            showPlayBadge={item.mediaType === 'VIDEO'}
            fillParent={presentation.imageAspect !== 'auto'}
            noColorTransition
          />
        </div>

        {showTitle ? (
          <>
            <span
              aria-hidden
              className={`pf-framed-grid-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-2/3 opacity-0 transition-opacity duration-[560ms] ${FRAME_EASE} group-hover:opacity-100 group-focus-within:opacity-100`}
              data-pf-no-color-transition=""
              style={{
                backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.3) 48%, rgba(0,0,0,0) 100%)',
              }}
            />
            <span
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-[5] block translate-y-3 px-5 pb-5 pt-8 text-white opacity-0 transition-[opacity,transform] duration-[560ms] ${FRAME_EASE} group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
                presentation.framedGridTitleStyle === 'mono'
                  ? 'font-mono text-[clamp(0.85rem,1.4vw,1.15rem)] font-medium uppercase tracking-[0.18em]'
                  : 'font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] italic leading-[1.05] tracking-[-0.01em]'
              }`}
              data-pf-no-color-transition=""
            >
              {itemTitle}
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
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  baseWidth: string;
  onOpen: (item: ProfileGalleryItem) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const effectiveColumns = useEffectiveColumns(Math.max(1, presentation.columns || 3));
  const ink = presentation.itemTitleColor?.trim() || '#f5f5f5';

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
    if (presentation.framedGridParallax === 'off') return undefined;

    const columnEls = Array.from(root.querySelectorAll<HTMLElement>('[data-framed-col]'));
    if (columnEls.length < 2) return undefined;

    const magnitude = { subtle: 26, medium: 48, strong: 80 }[presentation.framedGridParallax] ?? 48;
    const count = columnEls.length;
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
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
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
    <div ref={rootRef} className={`${baseWidth} overflow-visible`} style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}>
      <div
        className="flex w-full items-start overflow-visible"
        style={{ gap: `${presentation.gap}px` }}
      >
        {columnItems.map((column, columnIndex) => (
          <div
            key={columnIndex}
            data-framed-col=""
            className="flex min-w-0 flex-1 flex-col overflow-visible will-change-transform"
            style={{ gap: `${presentation.verticalGap >= 0 ? presentation.verticalGap : presentation.gap}px` }}
          >
            {column.map(({ item, index }) => (
              <FramedGridTile
                key={item.id}
                item={item}
                index={index}
                presentation={presentation}
                eager={index < effectiveColumns * 2}
                onOpen={onOpen}
                ink={ink}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
