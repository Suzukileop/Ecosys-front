'use client';

import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const GALLERY_REVEAL_ATTR = 'data-gallery-reveal';
export const GALLERY_REVEAL_MEDIA_ATTR = 'data-gallery-reveal-media';

/**
 * Clear by property list, never `clearProps: 'all'` — "all" empties the element's whole inline
 * style attribute, and the gallery writes real layout there (border radius, aspect ratio, the
 * tall-row track widths). Confirmed the hard way on the Team family.
 */
const GALLERY_CLEAR_PROPS = 'opacity,visibility,transform,clipPath';

export function galleryPrefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Scroll-entrance shared by every Gallery design: each tile wipes open from its bottom edge
 * while the media inside settles out of a slight over-scale — the standard editorial reveal for
 * image work, and the thing the section was missing entirely (tiles used to just appear).
 *
 * One container-level trigger, not one per tile: several designs live inside horizontal
 * scrollers, where a per-tile trigger would leave everything past the fold hidden forever.
 * ScrollTrigger and a plain IntersectionObserver both race to fire it, whichever notices first —
 * ScrollTrigger's start position can go stale on a long, image-heavy page, and a missed one-shot
 * "enter" there would mean a permanently invisible gallery.
 */
export function useGalleryReveal<T extends HTMLElement = HTMLDivElement>(
  signature: string
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const revealedSignature = useRef<string | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tiles = Array.from(root.querySelectorAll<HTMLElement>(`[${GALLERY_REVEAL_ATTR}]`));
    if (tiles.length === 0) return;
    const media = tiles
      .map((tile) => tile.querySelector<HTMLElement>(`[${GALLERY_REVEAL_MEDIA_ATTR}]`))
      .filter((node): node is HTMLElement => node != null);

    if (revealedSignature.current === signature || galleryPrefersReducedMotion()) {
      gsap.set([...tiles, ...media], { clearProps: GALLERY_CLEAR_PROPS });
      return;
    }

    const observers: IntersectionObserver[] = [];
    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context(() => {
        gsap.set(tiles, { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)', y: 22 });
        if (media.length > 0) gsap.set(media, { scale: 1.08, transformOrigin: '50% 50%' });

        let fired = false;
        const play = () => {
          if (fired) return;
          fired = true;
          revealedSignature.current = signature;
          const timeline = gsap.timeline();
          timeline.to(tiles, {
            autoAlpha: 1,
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.06,
            clearProps: GALLERY_CLEAR_PROPS,
          });
          if (media.length > 0) {
            timeline.to(
              media,
              {
                scale: 1,
                duration: 1.35,
                ease: 'power3.out',
                stagger: 0.06,
                clearProps: GALLERY_CLEAR_PROPS,
              },
              0
            );
          }
        };

        ScrollTrigger.create({ trigger: root, start: 'top 90%', once: true, onEnter: play });
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              play();
              io.disconnect();
            }
          },
          { threshold: 0, rootMargin: '0px 0px -10% 0px' }
        );
        io.observe(root);
        observers.push(io);
      }, root);
    } catch (error) {
      console.error('[Gallery reveal] GSAP failed to initialize', error);
      ctx?.revert();
      gsap.set([...tiles, ...media], { clearProps: GALLERY_CLEAR_PROPS });
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[Gallery reveal] deferred ScrollTrigger.refresh() failed', error);
      }
    }, 80);

    return () => {
      window.clearTimeout(refreshId);
      observers.forEach((io) => io.disconnect());
      ctx?.revert();
    };
  }, [signature]);

  return ref;
}

export const GALLERY_PARALLAX_ATTR = 'data-gallery-parallax';
/** Travel, in px, at the very edge of the mosaic. Any more and it stops reading as depth. */
const GALLERY_PARALLAX_SHIFT = 10;
/**
 * Resting over-scale on every parallax layer. The translate needs slack to slide into: without
 * it the image's own edge walks off its frame and a sliver of the tile background shows through.
 */
const GALLERY_PARALLAX_REST_SCALE = 1.07;

/**
 * Mosaic depth: the media inside each tile drifts *against* the cursor as it crosses the mosaic,
 * by an amount the tile itself declares through `data-gallery-parallax` (its value is a depth
 * factor, "1" by default). Giving the hero a smaller factor than the small tiles is what turns a
 * uniform slide into parallax — near things move more than far ones.
 *
 * The transform lives on a layer of its own, wrapping the media but inside the tile's
 * `overflow-hidden`. It has to: the hover push-in is a CSS `scale` on the media node, and GSAP
 * writing `transform` to that same node would cancel it outright. Nested layers compose instead.
 *
 * `quickTo` rather than a tween per event: it retargets one running tween, so a fast pointer
 * sweep does not stack hundreds of them.
 */
export function useGalleryMosaicParallax<T extends HTMLElement = HTMLDivElement>(
  signature: string,
  enabled: boolean
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled || galleryPrefersReducedMotion()) return;
    // A pointer that cannot hover has no position to follow, and `pointermove` there would only
    // fire mid-scroll. `(hover: none)` is the honest test; a narrow desktop window is still a
    // hovering pointer.
    if (window.matchMedia('(hover: none)').matches) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>(`[${GALLERY_PARALLAX_ATTR}]`));
    if (layers.length === 0) return;

    const depths = layers.map((layer) => {
      const raw = Number(layer.getAttribute(GALLERY_PARALLAX_ATTR));
      return Number.isFinite(raw) && raw > 0 ? raw : 1;
    });
    gsap.set(layers, { scale: GALLERY_PARALLAX_REST_SCALE, transformOrigin: '50% 50%', force3D: true });
    const toX = layers.map((layer) => gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }));
    const toY = layers.map((layer) => gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }));

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = root.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      // -1..1 from the mosaic's own centre, negated so the media drifts against the cursor.
      const dx = -((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const dy = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
      layers.forEach((_, index) => {
        toX[index](dx * GALLERY_PARALLAX_SHIFT * depths[index]);
        toY[index](dy * GALLERY_PARALLAX_SHIFT * depths[index]);
      });
    };
    const settle = () => {
      layers.forEach((_, index) => {
        toX[index](0);
        toY[index](0);
      });
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', settle);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', settle);
      gsap.killTweensOf(layers);
      gsap.set(layers, { clearProps: 'transform' });
    };
  }, [signature, enabled]);

  return ref;
}

/** Two-digit editorial index ("01", "02", … "12"). */
export function galleryIndexLabel(index: number): string {
  return String(index + 1).padStart(2, '0');
}
