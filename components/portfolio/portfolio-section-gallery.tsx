'use client';

/**
 * Gallery section (all gallery designs).
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import { cardsBorderCss } from '@/components/portfolio/portfolio-cards-style';
import dynamic from 'next/dynamic';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import type { ProfileGalleryItem } from '@/types/profile';
import {
  galleryAspectStyle,
  galleryDesignUsesCarouselNav,
  galleryEffectiveVerticalGap,
  galleryItemDisplayTitle,
  galleryMaxWidthClass,
  galleryPlacementClass,
  type PortfolioGalleryPresentationSettings,
  galleryWithCardsRadius,
} from '@/components/portfolio/portfolio-gallery-settings';
import { galleryIndexLabel, useGalleryMosaicParallax, useGalleryReveal } from '@/components/portfolio/portfolio-gallery-design-motion';
import { useT } from '@/lib/i18n/I18nProvider';

/** The page renders one Gallery, Contact and Footer design, so each design is its own chunk. */
const GalleryTallRow = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-tall-row').then((m) => m.GalleryTallRow)
);
const GalleryFloatingCanvas = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-floating-canvas').then((m) => m.GalleryFloatingCanvas)
);
const GalleryFramedGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-framed-grid').then((m) => m.GalleryFramedGrid)
);
const GalleryVisualIndex = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-visual-index').then((m) => m.GalleryVisualIndex)
);
const GalleryContactSheet = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-contact-sheet').then((m) => m.GalleryContactSheet)
);

const HERO_MOSAIC_CHUNK = 5;

function chunkHeroMosaicItems<T>(items: T[]): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += HERO_MOSAIC_CHUNK) {
    chunks.push(items.slice(index, index + HERO_MOSAIC_CHUNK));
  }
  const last = chunks[chunks.length - 1];
  const previous = chunks[chunks.length - 2];
  if (last && previous && last.length === 1) {
    last.unshift(...previous.splice(3));
  }
  return chunks;
}

function heroMosaicPlan(count: number): {
  containerClass: string;
  heroClass: string;
  tileClass: (index: number) => string;
} {
  if (count <= 1) {
    return {
      containerClass: 'grid-cols-1 lg:[aspect-ratio:16/7]',
      heroClass: '[aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () => '',
    };
  }
  if (count === 2) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-1 lg:[aspect-ratio:16/7]',
      heroClass:
        'sm:col-span-1 lg:col-span-5 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () =>
        'sm:col-span-1 lg:col-span-3 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    };
  }
  if (count === 3) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
      heroClass:
        'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () =>
        'sm:col-span-1 lg:col-span-4 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    };
  }
  if (count === 4) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
      heroClass:
        'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: (index) =>
        index === 0
          ? 'sm:col-span-2 lg:col-span-4 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]'
          : 'sm:col-span-1 lg:col-span-2 [aspect-ratio:1/1] lg:[aspect-ratio:auto]',
    };
  }
  return {
    containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
    heroClass:
      'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    tileClass: () => 'sm:col-span-1 lg:col-span-2 [aspect-ratio:1/1] lg:[aspect-ratio:auto]',
  };
}

export function EditorialGallerySection({
  items,
  presentation: basePresentation,
  embeddedHeader,
  renderPreviewMedia,
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  embeddedHeader?: ReactNode;
  /** Optional lightweight media substitution; catalogue previews retain the real geometry. */
  renderPreviewMedia?: (item: ProfileGalleryItem, index: number) => ReactNode;
}) {
  const t = useT();
  const presentation = useMemo(() => galleryWithCardsRadius(basePresentation), [basePresentation]);
  const cardsBorder = useMemo(
    () => cardsBorderCss(presentation.cardsStyle, presentation.galleryPalette),
    [presentation.cardsStyle, presentation.galleryPalette]
  );
  const [activeItem, setActiveItem] = useState<ProfileGalleryItem | null>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const reduceMotion = useReducedMotion();
  // Shared scroll entrance for every design's tiles (portfolio-gallery-design-motion).
  const revealRef = useGalleryReveal<HTMLDivElement>(`${presentation.design}:${items.length}`);
  // Hero mosaic only: the cursor-depth layer. Mounted unconditionally (hooks cannot be
  // conditional) and inert for every other design, since its ref is never attached.
  const mosaicParallaxRef = useGalleryMosaicParallax<HTMLDivElement>(
    `${presentation.design}:${items.length}`,
    presentation.design === 'hero-mosaic'
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const captionDrag = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const scrollCarouselLock = useRef(false);
  const scrollCarouselRestore = useRef<(() => void) | null>(null);
  const sortedItems = useMemo(
    () => {
      const ranks = new Map((presentation.mediaOrder ?? []).map((id, index) => [id, index]));
      return [...items].sort((a, b) =>
        (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity) || a.sortOrder - b.sortOrder);
    },
    [items, presentation.mediaOrder]
  );

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null);
        return;
      }
      // Arrow keys walk the gallery from inside the lightbox — without them the only way to see
      // the next image was to close and re-open it.
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (sortedItems.length < 2) return;
      event.preventDefault();
      const current = sortedItems.findIndex((item) => item.id === activeItem.id);
      if (current < 0) return;
      const step = event.key === 'ArrowRight' ? 1 : -1;
      setActiveItem(sortedItems[(current + step + sortedItems.length) % sortedItems.length]);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeItem, sortedItems]);

  useEffect(() => {
    setCarouselPage(0);
  }, [presentation.design, presentation.columns, sortedItems.length]);

  useEffect(() => {
    return () => {
      scrollCarouselRestore.current?.();
    };
  }, []);

  const showItemTitle = presentation.showTitle && presentation.titlePlacement !== 'hidden';
  const hGap = presentation.gap;
  const captionGap = Math.max(hGap + 28, 56);
  const vGap = galleryEffectiveVerticalGap(presentation);
  const gapPx = `${hGap}px`;
  const vGapPx = `${vGap}px`;
  const gridStyle: CSSProperties = {
    '--gallery-columns': presentation.columns,
    '--gallery-gap': gapPx,
    '--gallery-vgap': vGapPx,
    columnGap: `${hGap}px`,
    rowGap: `${vGap}px`,
    padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
  } as CSSProperties;
  const mosaicChunks = useMemo(
    () => (presentation.design === 'hero-mosaic' ? chunkHeroMosaicItems(sortedItems) : []),
    [presentation.design, sortedItems]
  );
  const mosaicAspect =
    galleryAspectStyle(presentation.imageAspect === 'auto' ? 'landscape' : presentation.imageAspect)
      .aspectRatio ?? '4 / 3';
  const mosaicGridStyle: CSSProperties = {
    columnGap: `${hGap}px`,
    rowGap: `${vGap}px`,
    ['--hero-mosaic-aspect' as string]: mosaicAspect,
  };
  const baseWidth = `${galleryMaxWidthClass(presentation.maxWidth)} ${galleryPlacementClass(presentation.placement)} w-full`;
  const useOverlayTitles = presentation.titlePlacement === 'overlay';
  /**
   * Hero mosaic focus. `mosaicFocusEnabled` is the user's switch; when it is off the tiles carry
   * no opacity/filter rules at all rather than a disabled version of them.
   */
  const mosaicFocus = presentation.design === 'hero-mosaic' && presentation.mosaicFocusEnabled !== false;
  const mosaicFocusClass = mosaicFocus
    ? 'transition-[opacity,filter] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:group-hover/mosaic:opacity-[0.8] hover:!opacity-100 focus-within:!opacity-100'
    : '';
  const isClipCoverDesign = presentation.design === 'tall-row';

  useEffect(() => {
    if (presentation.design !== 'tall-row' || sortedItems.length < 2) return;
    const preload = (offset: number) => {
      const item = sortedItems[(offset + sortedItems.length) % sortedItems.length];
      if (!item?.mediaUrl || item.mediaType === 'VIDEO') return;
      const image = new window.Image();
      image.src = item.mediaUrl;
    };
    preload(1);
    preload(-1);
  }, [presentation.design, sortedItems]);

  const openLightbox = (item: ProfileGalleryItem) => {
    if (presentation.lightboxEnabled) setActiveItem(item);
  };

  const scrollCarousel = (direction: -1 | 1) => {
    const node = scrollRef.current;
    if (!node || scrollCarouselLock.current) return;
    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-gallery-carousel-item]'));
    if (!cards.length) return;

    const scrollerRect = node.getBoundingClientRect();
    const leftOf = (card: HTMLElement) =>
      card.getBoundingClientRect().left - scrollerRect.left + node.scrollLeft;
    const current = node.scrollLeft;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    const nextCard =
      direction === 1
        ? cards.find((card) => leftOf(card) > current + 4)
        : [...cards].reverse().find((card) => leftOf(card) < current - 4);
    const targetLeft = Math.max(
      0,
      Math.min(maxScroll, nextCard ? leftOf(nextCard) : direction === 1 ? maxScroll : 0)
    );
    if (Math.abs(targetLeft - current) < 1) return;

    scrollCarouselRestore.current?.();
    scrollCarouselLock.current = true;
    const previousSnap = node.style.scrollSnapType;
    node.style.scrollSnapType = 'none';
    node.scrollTo({ left: targetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      scrollCarouselLock.current = false;
      node.style.scrollSnapType = previousSnap;
      node.removeEventListener('scrollend', restore);
      if (scrollCarouselRestore.current === restore) scrollCarouselRestore.current = null;
    };
    scrollCarouselRestore.current = restore;
    node.addEventListener('scrollend', restore);
    window.setTimeout(restore, reduceMotion ? 32 : 720);
  };

  const scrollToCarouselPage = (page: number) => {
    const node = scrollRef.current;
    if (!node) return;
    setCarouselPage(page);
    const card = node.querySelector<HTMLElement>('[data-gallery-carousel-item]');
    const step = card ? card.offsetWidth + captionGap : node.clientWidth * 0.85;
    node.scrollTo({ left: page * step * presentation.columns, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const captionPageCount = useMemo(() => {
    if (presentation.design !== 'caption-carousel') return 1;
    return Math.max(1, Math.ceil(sortedItems.length / presentation.columns));
  }, [presentation.design, presentation.columns, sortedItems.length]);

  const media = (item: ProfileGalleryItem, lightbox = false, eager = false, highPriority = false) => {
    if(renderPreviewMedia&&!lightbox)return renderPreviewMedia(item,sortedItems.indexOf(item));
    const zoomHover =
      presentation.hoverZoom && !lightbox && !isClipCoverDesign;
    // Long expo push-in rather than the old snappy 500ms/scale-105: at this size a fast zoom
    // reads as a UI reaction, a slow one reads as the image breathing.
    const zoomClass = zoomHover
      ? 'h-full w-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]'
      : 'h-full w-full';
    const objectFit = lightbox
      ? 'contain'
      : isClipCoverDesign
        ? 'cover'
        : presentation.objectFit;
    const columnShare = Math.max(2, presentation.columns || 2);
    const sizes = lightbox
      ? '100vw'
      : highPriority
        ? '(max-width: 768px) 100vw, min(1200px, 72vw)'
          : presentation.design === 'caption-carousel'
            ? '(max-width: 768px) 88vw, 420px'
            : `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.round(100 / columnShare)}vw`;
    const deferred = (
      <PortfolioDeferredMedia
        src={item.mediaUrl}
        alt={galleryItemDisplayTitle(item.title) || t('Gallery media')}
        className={zoomClass}
        sizes={sizes}
        eager={lightbox || eager}
        highPriority={lightbox || highPriority}
        kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
        objectFit={objectFit}
        objectPosition={presentation.objectPosition}
        autoPlayVideo={!lightbox && item.mediaType === 'VIDEO'}
        controls={lightbox && item.mediaType === 'VIDEO'}
        showPlayBadge={!lightbox && item.mediaType === 'VIDEO'}
        fillParent={lightbox || presentation.imageAspect !== 'auto'}
        noColorTransition={zoomHover}
      />
    );
    if (!lightbox) return deferred;
    return <div className="relative h-[min(82vh,900px)] w-[min(92vw,1200px)] max-w-[92vw]">{deferred}</div>;
  };

  const persistentOverlayTitle = (itemTitle: string, revealOnHover = false, roomy = false) => {
    const reveal = revealOnHover
      ? ' opacity-0 transition-[opacity,transform,translate,scale,rotate] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'
      : '';
    // `roomy`: the mosaic sets its titles inside a much wider margin and reads them off the
    // bottom-left corner rather than centred. At mosaic scale a centred caption tight against
    // the frame looks cropped by it; a corner with real air around it looks placed.
    const framing = roomy
      ? ' px-7 py-7 text-left sm:px-9 sm:py-8 lg:px-10 lg:py-9'
      : ' px-4 py-5 text-center sm:px-5 sm:py-6';
    return (
      <>
        {/* Scrim: `.pf-gallery-media-title` force-disables text-shadow, so white caption text over
            a light photograph has nothing to sit on. The gradient is the only way to keep it
            readable, and it doubles as the classic editorial foot of the frame. */}
        <span
          aria-hidden
          className={`pf-gallery-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[9] block h-[42%]${
            revealOnHover
              ? ' opacity-0 transition-opacity duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'
              : ''
          }`}
          data-pf-no-color-transition=""
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0) 100%)',
          }}
        />
        <span
          className={`pf-gallery-media-title pf-gallery-media-title--in-frame${roomy ? ' pf-gallery-mosaic-title' : ''} pointer-events-none absolute inset-x-0 bottom-0 z-10 text-white${framing}${
            presentation.design === 'tall-row' ? ' pf-gallery-media-title--plain pf-gallery-media-title--tall' : ''
          }${reveal}${revealOnHover ? ' translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:none)]:translate-y-0' : ''}`}
          data-pf-no-color-transition=""
        >
          {itemTitle}
        </span>
      </>
    );
  };

  const card = (
    item: ProfileGalleryItem,
    index: number,
    options?: {
      forceOverlay?: boolean;
      overlayOnHover?: boolean;
      forceAspect?: CSSProperties;
      fill?: boolean;
      emphasis?: 'hero';
      hideTitle?: boolean;
      onActivate?: () => void;
      eager?: boolean;
      /** Hero mosaic: roomy corner-set titles, and no black veil under them. */
      overlayVariant?: 'mosaic';
      /** Hero mosaic: wraps the media in its own transform layer, at this depth factor. */
      parallaxDepth?: number;
    }
  ) => {
    const loadMediaEager = Boolean(options?.eager);
    const itemTitle = galleryItemDisplayTitle(item.title);
    const isEditorial = presentation.design === 'editorial-split';
    const editorialClass = isEditorial
      ? 'pf-gallery-editorial-card'
      : '';
    const aspect =
      options?.fill
        ? {}
        : options?.forceAspect ??
          (presentation.imageAspect === 'auto'
            ? {}
            : galleryAspectStyle(presentation.imageAspect));
    const overlayOnHover = Boolean(options?.overlayOnHover);
    const overlayActive =
      Boolean(itemTitle) &&
      (Boolean(options?.forceOverlay) ||
        overlayOnHover ||
        (!options?.hideTitle && showItemTitle && useOverlayTitles));
    // The mosaic sets its titles inside the frame (overlay); an under-caption as well would
    // print every name twice.
    const showUnderTitle =
      !options?.hideTitle &&
      options?.overlayVariant !== 'mosaic' &&
      showItemTitle &&
      Boolean(itemTitle) &&
      presentation.titlePlacement === 'under';
    const activate = () => {
      if (options?.onActivate) {
        options.onActivate();
        return;
      }
      openLightbox(item);
    };
    const isInteractive = Boolean(options?.onActivate || presentation.lightboxEnabled);
    const deferLayoutPaint =
      presentation.design !== 'tall-row';
    return (
      <article
        key={item.id}
        data-gallery-reveal=""
        className={`group relative break-inside-avoid ${
          'flex flex-col overflow-hidden'
        } ${editorialClass} ${
          options?.fill ? 'flex h-full w-full flex-col' : ''
        } ${deferLayoutPaint ? 'pf-gallery-tile' : ''} ${
          isInteractive
            ? `${options?.onActivate ? 'cursor-pointer' : 'cursor-zoom-in'} focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500`
            : ''
        }`}
        style={{
          borderRadius: isClipCoverDesign ? 'var(--gallery-frame-radius, 16px)' : `${presentation.radius}px`,
          overflow: 'hidden',
          ...cardsBorder,
        }}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={
          options?.onActivate
            ? t('Show {title}', { title: itemTitle || t('Gallery media') })
            : presentation.lightboxEnabled
              ? t('Open {title}', { title: itemTitle || t('Gallery media') })
              : undefined
        }
        onClick={activate}
        onKeyDown={(event) => {
          if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            activate();
          }
        }}
      >
        <div
          className={`relative w-full overflow-hidden ${
            options?.fill
              ? 'flex-1 min-h-[12rem] bg-neutral-100 dark:bg-neutral-900'
              : // The tile is a flex column and the media grows inside it. `h-full` used to make
                  // the media fill the tile outright, which pushed an under-caption past the
                  // tile's own `overflow:hidden` edge — the caption was in the DOM, styled
                  // correctly, and clipped out of existence. Growing instead keeps the caption
                  // inside while images still fill a stretched grid row.
                  'min-h-[12rem] flex-1 bg-neutral-100 dark:bg-neutral-900'
          }`}
          data-pf-no-color-transition=""
          style={
            isClipCoverDesign
              ? {
                  ...aspect,
                  borderRadius: 'var(--gallery-frame-radius, 16px)',
                  overflow: 'hidden',
                }
              : {
                  ...aspect,
                }
          }
        >
          {options?.parallaxDepth ? (
            // Its own layer, inside the tile's `overflow-hidden`: the hover push-in is a CSS
            // `scale` on the media node itself, so GSAP must not write `transform` there too.
            <div
              className="h-full w-full will-change-transform"
              data-gallery-parallax={String(options.parallaxDepth)}
              data-pf-no-color-transition=""
            >
              {media(item, false, loadMediaEager, options?.emphasis === 'hero')}
            </div>
          ) : (
            media(item, false, loadMediaEager, options?.emphasis === 'hero')
          )}
          {overlayOnHover && options?.overlayVariant !== 'mosaic' ? (
            <span
              className="pointer-events-none absolute inset-0 z-[9] bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
              aria-hidden
            />
          ) : null}
          {overlayActive && itemTitle
            ? persistentOverlayTitle(itemTitle, overlayOnHover, options?.overlayVariant === 'mosaic')
            : null}
        </div>
        {showUnderTitle ? (
          <h3
            className="pf-gallery-media-title px-1 pb-1 pt-3 text-center"
            data-pf-no-color-transition=""
            style={{ color: presentation.itemTitleColor }}
          >
            {itemTitle}
          </h3>
        ) : null}
      </article>
    );
  };

  /**
   * Caption cards — a frameless editorial rail. The card is no longer a bordered box holding a
   * small picture: the image floats on the section's own ground, and the rail is sized by HEIGHT
   * so every plate lines up on one baseline whatever its ratio, exactly like a printed contact
   * sheet. `Image size` therefore drives that height (320 → 62vh, the design's reference scale);
   * the width follows from each image's own aspect.
   */
  const captionRailHeight = `clamp(15rem, ${((presentation.captionCardWidthPx || 320) / 320) * 62}vh, 44rem)`;

  /** Mouse drag on the caption rail. Touch and trackpad keep the native, momentum-preserving scroll. */
  const onCaptionPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollRef.current;
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    captionDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: scroller.scrollLeft,
      moved: false,
    };
  };

  const onCaptionPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollRef.current;
    const drag = captionDrag.current;
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true;
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endCaptionDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = captionDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    scrollRef.current?.releasePointerCapture?.(event.pointerId);
    // Keep the flag one frame longer so the click that ends a drag never opens the lightbox.
    if (drag.moved) window.setTimeout(() => { captionDrag.current = null; }, 0);
    else captionDrag.current = null;
  };

  const captionCard = (item: ProfileGalleryItem, index = 0) => {
    const itemTitle = galleryItemDisplayTitle(item.title);
    const isOriginalRatio = presentation.imageAspect === 'auto';
    const mediaAspect = galleryAspectStyle(presentation.imageAspect);
    return (
      <article
        key={item.id}
        data-gallery-carousel-item
        data-gallery-reveal=""
        data-pf-no-color-transition=""
        /* Plate reveal mechanism: the card box stays put and only the plate rises, uncovering a
           caption that was parked behind it at the foot. So no card-level lift here — two stacked
           translations would just double the travel — and `overflow-visible` so the plate can
           leave the box. */
        className={`pf-gallery-caption-card group relative shrink-0 snap-start overflow-visible ${
          presentation.lightboxEnabled ? 'cursor-zoom-in' : ''
        } flex flex-col bg-transparent`}
        role={presentation.lightboxEnabled ? 'button' : undefined}
        tabIndex={presentation.lightboxEnabled ? 0 : undefined}
        aria-label={presentation.lightboxEnabled ? t('Open {title}', { title: itemTitle || t('Gallery media') }) : undefined}
        onClick={() => openLightbox(item)}
        onKeyDown={(event) => {
          if (presentation.lightboxEnabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openLightbox(item);
          }
        }}
      >
        <div
          /* `z-10` over the caption's `z-0`: the plate covers it at rest and slides off it on
             hover, rather than the caption fading in on top of the image. */
          className="relative z-10 shrink-0 overflow-hidden bg-transparent"
          data-pf-no-color-transition=""
          /* With a ratio set, the plate is height-driven and its width follows — one baseline for
             the whole rail. `Original ratio` stays width-driven on purpose: sizing an unknown
             ratio from its height would make the plate's width depend on the image and the image's
             width depend on the plate, which browsers resolve to a collapsed box. */
          style={{
            ...(isOriginalRatio
              ? { width: `min(86vw, ${Math.round((presentation.captionCardWidthPx || 320) * 1.9)}px)` }
              : { height: captionRailHeight, ...mediaAspect }),
            borderRadius: `${presentation.radius}px`,
          }}
        >
          {renderPreviewMedia ? renderPreviewMedia(item,index) : <PortfolioDeferredMedia
            src={item.mediaUrl}
            alt={galleryItemDisplayTitle(item.title) || t('Gallery media')}
            className={`h-full w-full ${
              presentation.hoverZoom
                ? 'transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]'
                : ''
            }`}
            noColorTransition={presentation.hoverZoom}
            sizes="(max-width: 768px) 80vw, 46vh"
            eager={index < 2}
            kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
            objectFit={isOriginalRatio ? 'contain' : presentation.objectFit}
            objectPosition={presentation.objectPosition}
            autoPlayVideo={item.mediaType === 'VIDEO'}
            showPlayBadge={item.mediaType === 'VIDEO'}
            fillParent={!isOriginalRatio}
          />}
          {/* The plate lifts out of the section's ground on hover: a hairline edge catches the
              light and the image warms very slightly. Both are barely-there by design. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] block opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition-opacity duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
            data-pf-no-color-transition=""
            style={{ borderRadius: `${presentation.radius}px` }}
          />
        </div>
        {showItemTitle && itemTitle ? (
          // Not `.pf-gallery-media-title--caption`: that class is locked to a centred 18px with
          // `!important`. This reads the same `--pf-gallery-font-scale` the Font size control sets,
          // so the setting still works, but the caption can be a real editorial line — monospaced,
          // tracked, sitting under the left edge of its own plate.
          <h3
            className="pf-gallery-caption-title pointer-events-none m-0 pt-4 text-[calc(1rem*var(--pf-gallery-font-scale,1))] font-medium leading-[1.5] tracking-normal"
            data-pf-no-color-transition=""
            style={{ color: presentation.itemTitleColor }}
          >
            {itemTitle}
          </h3>
        ) : null}
      </article>
    );
  };

  const carouselNavButtons = (
    className?: string,
    onNavigate?: (direction: -1 | 1) => void,
    size: 'md' | 'lg' = 'md',
    forceVisible = false
  ) =>
    (forceVisible || (presentation.showCarouselNav && galleryDesignUsesCarouselNav(presentation.design))) ? (
      <div
        /* The caller's own `justify-*` has to replace the default, not compete with it: two
           justify utilities on one element resolve by CSS source order, so `justify-end` passed
           by tall-row silently lost to the hardcoded `justify-center`. */
        className={`flex items-center gap-3 ${className?.includes('justify-') ? '' : 'justify-center'} ${className ?? ''}`}
      >
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => (onNavigate ?? scrollCarousel)(direction)}
            /* Hairline circle + a drawn arrow that steps in its own direction on hover — the
               glyph chevrons in a filled button were the most generic thing in the section. */
            className={`group/nav relative flex items-center justify-center overflow-hidden rounded-full border transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-current active:scale-95 ${
              size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
            }`}
            data-pf-no-color-transition=""
            style={{
              backgroundColor:
                presentation.galleryPalette?.neutre ?? presentation.cardSurfaceColor ?? '#ffffff',
              borderColor:
                presentation.galleryPalette?.bordure ??
                `color-mix(in srgb, ${presentation.itemTitleColor} 32%, transparent)`,
              color: presentation.itemTitleColor,
            }}
            aria-label={direction === -1 ? t('Previous') : t('Next')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`relative h-[38%] w-[38%] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                direction === -1
                  ? 'group-hover/nav:-translate-x-1 rotate-180'
                  : 'group-hover/nav:translate-x-1'
              }`}
              data-pf-no-color-transition=""
            >
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>
    ) : null;

  const paginationDots =
    presentation.design === 'caption-carousel' && presentation.showPagination && captionPageCount > 1 ? (
      <div className="mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: captionPageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToCarouselPage(index)}
            /* Palette-bound pills, not hardcoded neutral dots: the old ones ignored the gallery
               palette entirely and went invisible on a dark section. The active page stretches
               instead of just darkening. */
            className={`h-1.5 rounded-full transition-[width,opacity] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              carouselPage === index ? 'w-8 opacity-100' : 'w-1.5 opacity-40 hover:opacity-70'
            }`}
            data-pf-no-color-transition=""
            style={{ backgroundColor: presentation.itemTitleColor }}
            aria-label={t('Page {number}', { number: index + 1 })}
            aria-current={carouselPage === index ? 'true' : undefined}
          />
        ))}
      </div>
    ) : null;

  const content =
    presentation.design === 'caption-carousel' ? (
      <div className={baseWidth} style={{ padding: `${presentation.padding}px` }}>
        {/* Chevrons above the rail, aligned right: at this scale a pair of buttons centred under
            the images reads as a footer for them; up here it reads as the rail's own control. */}
        {/* One switch for this rail's controls (Carousel controls), whatever their style —
            the shared "Navigation arrows" switch is not offered for caption cards. */}
        {presentation.captionPager === 'dots' || !presentation.showPagination
          ? null
          : carouselNavButtons('mb-8 justify-end', undefined, 'lg', true)}
        <div
          ref={scrollRef}
          onPointerDown={onCaptionPointerDown}
          onPointerMove={onCaptionPointerMove}
          onPointerUp={endCaptionDrag}
          onPointerCancel={endCaptionDrag}
          // Without this the browser starts its own image drag as soon as the pointer moves over a
          // plate, which swallows the pointermove stream and the rail never scrolls.
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            // A drag that ends on a plate must not also open the lightbox.
            if (captionDrag.current?.moved) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          /* `overflow-x-auto` computes `overflow-y` to `auto` too, so the plate's hover lift would
             be clipped (or spawn a vertical scrollbar) without room reserved for it up top —
             a small top inset protects the hovering plate. */
          className="flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab sm:active:cursor-grabbing"
          style={{ gap: `${captionGap}px` }}
        >
          {sortedItems.map(captionCard)}
        </div>
        {presentation.captionPager === 'dots' ? paginationDots : null}
      </div>
    ) : presentation.design === 'hero-mosaic' ? (
      // `group/mosaic` is what lets one tile pull focus: every tile dims while the mosaic is
      // hovered, and the one under the pointer overrides that back to full. Both rules land on
      // the same specificity, so the winner carries `!` rather than relying on source order.
      <div
        ref={mosaicParallaxRef}
        className={`pf-gallery-mosaic ${baseWidth} flex flex-col${mosaicFocus ? ' group/mosaic' : ''}`}
        style={{
          rowGap: `${Math.max(vGap, 24)}px`,
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
        }}
      >
        {mosaicChunks.map((chunk, chunkIndex) => {
          const plan = heroMosaicPlan(chunk.length);
          const [heroItem, ...tiles] = chunk;
          const offset = chunkIndex * HERO_MOSAIC_CHUNK;
          if (!heroItem) return null;
          return (
            <div
              key={heroItem.id}
              className={`pf-gallery-mosaic-grid grid ${plan.containerClass}`}
              style={mosaicGridStyle}
            >
              <div className={`pf-gallery-mosaic-hero min-w-0 ${plan.heroClass} ${mosaicFocusClass}`} data-pf-no-color-transition="">
                {card(heroItem, offset, {
                  fill: true,
                  emphasis: 'hero',
                  hideTitle: !showItemTitle,
                  overlayOnHover: showItemTitle,
                  overlayVariant: 'mosaic',
                  // The hero is the far plane: it drifts least, which is what reads as depth
                  // against the small tiles rather than as the whole mosaic sliding.
                  parallaxDepth: 0.55,
                  eager: chunkIndex === 0,
                })}
              </div>
              {tiles.map((item, index) => (
                <div
                  key={item.id}
                  className={`min-w-0 ${plan.tileClass(index)} ${mosaicFocusClass}`}
                  data-pf-no-color-transition=""
                >
                  {card(item, offset + index + 1, {
                    fill: true,
                    hideTitle: !showItemTitle,
                    overlayOnHover: showItemTitle,
                    overlayVariant: 'mosaic',
                    parallaxDepth: 1,
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ) : presentation.design === 'floating-canvas' ? (
      /* `overflow-visible`: this design's title pills hang half-way past their card's bottom
         edge and its float shadows bleed past their frames — a clipping wrapper would cut both. */
      <div
        className={`${baseWidth} overflow-visible`}
        style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}
      >
        <GalleryFloatingCanvas
          items={sortedItems}
          presentation={presentation}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined}
          showTitle={showItemTitle}
        />
      </div>
    ) : presentation.design === 'framed-grid' ? (
      <GalleryFramedGrid
        items={sortedItems}
        presentation={presentation}
        baseWidth={baseWidth}
        onOpen={presentation.lightboxEnabled ? openLightbox : undefined}
        showTitle={showItemTitle}
      />
    ) : presentation.design === 'tall-row' ? (
      <div
        className={baseWidth}
        style={{
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
          ['--gallery-frame-radius' as string]: `${presentation.radius}px`,
        }}
      >
        <GalleryTallRow
          items={sortedItems}
          presentation={presentation}
          header={embeddedHeader}
          renderMedia={(item, index, eager) => media(item, false, eager, index === 0)}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined}
          reduceMotion={Boolean(reduceMotion)}
          showTitle={showItemTitle}
        />
      </div>
    ) : presentation.design === 'contact-sheet' ? (
      <div className={baseWidth} style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}>
        <GalleryContactSheet items={sortedItems} presentation={presentation} showTitle={showItemTitle}
          renderMedia={renderPreviewMedia}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined} />
      </div>
    ) : presentation.design === 'visual-index' ? (
      <div className={baseWidth} style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}>
        <GalleryVisualIndex items={sortedItems} presentation={presentation} showTitle={showItemTitle}
          renderMedia={renderPreviewMedia}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined} />
      </div>
    ) : presentation.design === 'editorial-split' ? (
      <div className={`pf-gallery-editorial ${baseWidth}`} style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}>
        <div className="pf-gallery-editorial-grid" style={{ columnGap: gapPx, rowGap: vGapPx }}>
          {sortedItems.map((item, index) => card(item, index))}
        </div>
      </div>
    ) : (
      <div
        className={`${baseWidth} grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr))]`}
        style={gridStyle}
      >
        {sortedItems.map((item, index) => card(item, index))}
      </div>
    );

  const lightboxIndex = activeItem ? sortedItems.findIndex((item) => item.id === activeItem.id) : -1;
  const stepLightbox = (direction: -1 | 1) => {
    if (sortedItems.length < 2 || lightboxIndex < 0) return;
    setActiveItem(sortedItems[(lightboxIndex + direction + sortedItems.length) % sortedItems.length]);
  };
  const lightboxArrow = (direction: -1 | 1) => (
    <button
      type="button"
      onClick={() => stepLightbox(direction)}
      className={`group/lb pointer-events-auto absolute top-1/2 z-[2] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,transform,translate,scale,rotate] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-14 ${
        direction === -1 ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      }`}
      data-pf-no-color-transition=""
      aria-label={direction === -1 ? t('Previous image') : t('Next image')}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`h-[38%] w-[38%] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          direction === -1 ? 'rotate-180 group-hover/lb:-translate-x-1' : 'group-hover/lb:translate-x-1'
        }`}
        data-pf-no-color-transition=""
      >
        <path d="M4 12h15" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </button>
  );

  return (
    <>
      <div ref={revealRef} className="w-full">
        {content}
      </div>
      {activeItem && presentation.lightboxEnabled
        ? createPortal(
            <motion.div
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={galleryItemDisplayTitle(activeItem.title) || t('Gallery media')}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setActiveItem(null);
              }}
            >
              {/* Counter, close and the two arrows are pinned to the viewport, not to the image:
                  an image-relative close button drifts off-screen on a tall portrait. */}
              {sortedItems.length > 1 ? (
                <span
                  className="pointer-events-none absolute left-5 top-5 z-[2] text-[0.68rem] font-medium uppercase tracking-[0.2em] tabular-nums text-white/70 sm:left-8 sm:top-8"
                  data-pf-no-color-transition=""
                >
                  {galleryIndexLabel(Math.max(0, lightboxIndex))}
                  <span className="text-white/35"> / {galleryIndexLabel(sortedItems.length - 1)}</span>
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="absolute right-4 top-4 z-[2] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,transform,translate,scale,rotate] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-90 hover:bg-white/10 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white sm:right-8 sm:top-8"
                data-pf-no-color-transition=""
                aria-label={t('Close the gallery')}
                autoFocus
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden className="h-[38%] w-[38%]">
                  <path d="M5 5 19 19M19 5 5 19" />
                </svg>
              </button>
              {sortedItems.length > 1 ? lightboxArrow(-1) : null}
              {sortedItems.length > 1 ? lightboxArrow(1) : null}
              <motion.div
                key={activeItem.id}
                className="relative flex max-h-[92vh] max-w-[96vw] flex-col items-center gap-5"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {media(activeItem, true)}
                {presentation.showTitle && galleryItemDisplayTitle(activeItem.title) ? (
                  <p className="text-center text-sm font-medium text-white sm:text-base">
                    {galleryItemDisplayTitle(activeItem.title)}
                  </p>
                ) : null}
              </motion.div>
            </motion.div>,
            document.body
          )
        : null}
    </>
  );
}
