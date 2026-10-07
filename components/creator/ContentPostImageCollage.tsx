'use client';

import { mediaImageResponsive } from '@/lib/media-image-url';

/** Tiles shown before the rest collapse into a "+N" overlay on the last one. */
const MAX_TILES = 5;
const TILE_WIDTHS = [256, 384, 640, 828, 1080] as const;

type Slot = {
  /** Tailwind grid placement of the tile inside the collage grid. */
  place: string;
  /** `sizes` hint — roughly the tile's share of the card width. */
  sizes: string;
};

/**
 * Social-style collage layouts, keyed by tile count. The grid is 6 columns so 2-up and 3-up rows share
 * one track system: the 5-tile layout is two halves over three thirds.
 */
function layoutFor(count: number): { aspect: string; grid: string; slots: Slot[] } {
  const half = '(min-width: 768px) 380px, 50vw';
  const third = '(min-width: 768px) 250px, 34vw';
  switch (count) {
    case 2:
      return {
        aspect: 'aspect-[4/3] sm:aspect-[16/10]',
        grid: 'grid-cols-2 grid-rows-1',
        slots: [
          { place: '', sizes: half },
          { place: '', sizes: half },
        ],
      };
    case 3:
      return {
        aspect: 'aspect-[4/3]',
        grid: 'grid-cols-2 grid-rows-2',
        slots: [
          { place: 'row-span-2', sizes: half },
          { place: '', sizes: half },
          { place: '', sizes: half },
        ],
      };
    case 4:
      return {
        aspect: 'aspect-square sm:aspect-[4/3]',
        grid: 'grid-cols-2 grid-rows-2',
        slots: [
          { place: '', sizes: half },
          { place: '', sizes: half },
          { place: '', sizes: half },
          { place: '', sizes: half },
        ],
      };
    default:
      return {
        aspect: 'aspect-[4/3] sm:aspect-[3/2]',
        grid: 'grid-cols-6 grid-rows-[3fr_2fr]',
        slots: [
          { place: 'col-span-3', sizes: half },
          { place: 'col-span-3', sizes: half },
          { place: 'col-span-2', sizes: third },
          { place: 'col-span-2', sizes: third },
          { place: 'col-span-2', sizes: third },
        ],
      };
  }
}

/**
 * Gallery of a multi-image post as one tight collage. Every tile opens the viewer on its own image;
 * past {@link MAX_TILES} the last tile carries a "+N" count.
 */
export function ContentPostImageCollage({
  urls,
  onOpen,
  priority = false,
  className = '',
}: {
  urls: string[];
  onOpen: (index: number) => void;
  /** Above the fold: the first tiles load eagerly. */
  priority?: boolean;
  className?: string;
}) {
  if (urls.length < 2) return null;

  const shown = urls.slice(0, MAX_TILES);
  const hidden = urls.length - shown.length;
  const { aspect, grid, slots } = layoutFor(shown.length);

  return (
    <div
      className={`grid w-full gap-0.5 overflow-hidden bg-white dark:bg-[#111111] ${aspect} ${grid} ${className}`}
      role="group"
      aria-label={`${urls.length} photos`}
    >
      {shown.map((url, index) => {
        const slot = slots[index]!;
        const overflow = hidden > 0 && index === shown.length - 1;
        const responsive = mediaImageResponsive(url, TILE_WIDTHS);
        return (
          <button
            key={url}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={
              overflow ? `Open photo ${index + 1} — ${hidden} more photos` : `Open photo ${index + 1} of ${urls.length}`
            }
            data-pf-no-color-transition
            className={`group/tile relative min-h-0 min-w-0 cursor-pointer overflow-hidden bg-neutral-100 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF5722] dark:bg-neutral-900 ${slot.place}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={responsive.src}
              srcSet={responsive.srcSet}
              sizes={slot.sizes}
              alt=""
              loading={priority && index < 2 ? 'eager' : 'lazy'}
              fetchPriority={priority && index < 2 ? 'high' : 'auto'}
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
            />
            {overflow ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[1.75rem] font-semibold tabular-nums text-white">
                +{hidden}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
