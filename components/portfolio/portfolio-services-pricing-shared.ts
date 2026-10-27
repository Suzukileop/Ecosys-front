'use client';

/**
 * Pieces every Services design with cards shares: the normalised card data (real price parts,
 * billing period, featured flag), small colour helpers, and the card hover hook. Kept out of the
 * individual design files so "Popular", the price period and the hover effect behave identically
 * whichever design the creator picks.
 */
import gsap from 'gsap';
import { useEffect, useSyncExternalStore, type CSSProperties, type RefObject } from 'react';
import type {
  PortfolioServicesHoverEffect,
  PortfolioServicesPricingCtaStyle,
} from '@/components/portfolio/portfolio-services-pricing-style';
import {
  formatServiceDelivery,
  getServicePriceParts,
  normalizeBillingPeriod,
  type ServiceBillingPeriod,
  type ServicePriceParts,
} from '@/lib/profile-services';
import type { ProfileServiceItem } from '@/types/profile';
import type { ServicesCardElements } from '@/components/portfolio/portfolio-services-card-elements';

export type PricingCardData = {
  id: string;
  title: string;
  description: string;
  /** The service's tasks, trimmed, empty ones dropped. */
  features: string[];
  /** "5 days delivery" or null. */
  delivery: string | null;
  price: ServicePriceParts;
  /** Raw amount in minor units (null = on request) — what a monthly/yearly switch converts. */
  cents: number | null;
  /** The service's own billing period, null when it is billed once. */
  billing: ServiceBillingPeriod | null;
  /** The creator ticked "popular" on this service in the Services editor. */
  popularFlag: boolean;
  coverImageUrl: string | null;
  /** General → Card elements: which pieces of this card the creator switched on. */
  show: ServicesCardElements;
};

const ALL_ELEMENTS_SHOWN: ServicesCardElements = {
  title: true,
  description: true,
  price: true,
  delivery: true,
  tasks: true,
  cta: true,
  deliveryTemplate: '',
};

/** Public-page services → what the pricing layouts render. Services without a title are dropped. */
export function buildPricingCards(
  services: readonly ProfileServiceItem[],
  show: ServicesCardElements = ALL_ELEMENTS_SHOWN
): PricingCardData[] {
  return services
    .filter((service) => service.title?.trim())
    .map((service) => ({
      id: service.id,
      title: service.title.trim(),
      description: show.description ? service.description?.trim() ?? '' : '',
      features: show.tasks ? (service.tasks ?? []).map((task) => task.trim()).filter(Boolean) : [],
      delivery: show.delivery ? formatServiceDelivery(service, show.deliveryTemplate) : null,
      price: getServicePriceParts(service),
      cents: service.basePriceCents ?? null,
      billing: normalizeBillingPeriod(service.billingPeriod),
      popularFlag: service.popular === true,
      coverImageUrl: service.coverImageUrl?.trim() || null,
      show,
    }));
}

/* ----------------------------------------------------------------------- *
 * Colour helpers
 * ----------------------------------------------------------------------- */

export function hexToRgbTuple(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgbTuple(hex) ?? [249, 115, 22];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.min(1, Math.max(0, alpha))})`;
}

/** Blends `hexA` toward `hexB` by `weightA` (1 = pure A). Plain JS so the result stays a parsable hex. */
export function mixHex(hexA: string, hexB: string, weightA: number): string {
  const a = hexToRgbTuple(hexA);
  const b = hexToRgbTuple(hexB);
  if (!a || !b) return hexA;
  const w = Math.min(1, Math.max(0, weightA));
  const channel = (i: number) => Math.round(a[i] * w + b[i] * (1 - w));
  return `#${[channel(0), channel(1), channel(2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque hex colours. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * A softened version of `ink` for secondary text on `bg`: starts at `target` (1 = full ink) and only
 * strengthens as far as needed to reach `min` contrast. A fixed alpha cannot do this: white at 60% is
 * fine on near-black but unreadable on a mid-tone accent, which is where the featured card sits.
 */
export function softInk(ink: string, bg: string, target: number, min = 4.5): string {
  for (let alpha = target; alpha < 1.0001; alpha += 0.04) {
    const color = mixHex(ink, bg, Math.min(1, alpha));
    if (contrastRatio(color, bg) >= min) return color;
  }
  return ink;
}

/** Near-black or near-white, whichever has the higher WCAG contrast on `hex` — unlike
 *  `pickContrastInk`'s brightness threshold, a mid red or grey correctly gets black. */
export function readableInk(hex: string): string {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return '#f5f5f5';
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // #f5f5f5 has luminance ~0.913, #0a0a0a ~0.003.
  return 0.963 / (lum + 0.05) >= (lum + 0.05) / 0.053 ? '#f5f5f5' : '#0a0a0a';
}

/** Near-black or near-white, whichever reads better on `hex`. */
export function pickContrastInk(hex: string): string {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return '#f5f5f5';
  const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminance > 0.6 ? '#0a0a0a' : '#f5f5f5';
}

/**
 * The featured card's fill. `opacity` (0–100) is how much of `color` shows; the rest is the
 * surface behind it. Returns the translucent fill to paint plus the opaque colour that fill
 * appears as — the one to compute readable text against.
 */
export function featuredFill(
  color: string,
  opacity: number,
  surface: string
): { fill: string; blended: string; ink: string } {
  const alpha = Math.min(100, Math.max(0, opacity)) / 100;
  const blended = mixHex(color, surface, alpha);
  return { fill: alpha >= 1 ? color : withAlpha(color, alpha), blended, ink: pickContrastInk(blended) };
}

/**
 * `featuredFill`, deepened only as much as needed for its text to reach 4.8:1. Light ink on a mid-tone
 * accent (orange, red) peaks around 4.4:1 however it is softened, so the fill itself has to give.
 */
export function legibleFeaturedFill(
  color: string,
  opacity: number,
  surface: string
): { fill: string; blended: string; ink: string } {
  let result = featuredFill(color, opacity, surface);
  for (let k = 0.96; k >= 0.6 && contrastRatio(result.ink, result.blended) < 4.8; k -= 0.04) {
    result = featuredFill(mixHex(color, '#000000', k), opacity, surface);
  }
  return result;
}

/* ----------------------------------------------------------------------- *
 * Motion gates
 * ----------------------------------------------------------------------- */

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Live `matchMedia` match; false on the server and during hydration. */
export function useServicesMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  );
}

const FINE_POINTER_DESKTOP = '(min-width: 768px) and (hover: hover) and (pointer: fine)';

/** True only on a real mouse at tablet width and above — phones and touch screens never get hover motion. */
export function useServicesFinePointer(): boolean {
  return useServicesMediaQuery(FINE_POINTER_DESKTOP);
}

/** Nearest scrollable ancestor — the Studio preview scrolls inside a nested container. */
export function getScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
  return undefined;
}

/* ----------------------------------------------------------------------- *
 * Hover
 * ----------------------------------------------------------------------- */

/**
 * One simple hover effect per card — `lift`, `glow` or `tilt` — on every `[data-svc-card]` inside
 * `rootRef`. No effect ever touches a neighbouring card (no dimming, no blur).
 *
 * - lift: the card rises 8px and its shadow deepens (the shadow is the `[data-hovered]` CSS rule
 *   in globals.css, so it survives GSAP owning `transform`).
 * - glow: a soft light follows the cursor inside the card (`--svc-gx/--svc-gy`, painted by the
 *   `::after` rule in globals.css).
 * - tilt: a gentle 3D tilt toward the cursor.
 *
 * A card that rests offset from 0 (a lifted "popular" card) declares it with `data-rest-y` so the
 * hover moves relative to where it already sits and returns there afterwards.
 */
export function useServicesCardHover(
  rootRef: RefObject<HTMLElement | null>,
  effect: PortfolioServicesHoverEffect,
  capable: boolean,
  itemsKey: string
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || effect === 'none' || !capable || prefersReducedMotion()) return undefined;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-svc-card]'));
    if (cards.length === 0) return undefined;

    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      const restY = Number(card.dataset.restY ?? 0) || 0;
      const tilts = effect === 'tilt' || effect === 'both';
      const lights = effect === 'glow' || effect === 'both';
      const rotX = tilts ? gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' }) : null;
      const rotY = tilts ? gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' }) : null;
      if (tilts) gsap.set(card, { transformPerspective: 900 });

      // The glow light trails the cursor: the target jumps, the drawn spot eases
      // toward it (frame-rate independent), so it glides instead of snapping.
      const light = { tx: 0, ty: 0, x: 0, y: 0, fresh: true };
      const paintLight = (_time: number, deltaTime: number) => {
        const k = 1 - Math.exp(-deltaTime / 80);
        light.x += (light.tx - light.x) * k;
        light.y += (light.ty - light.y) * k;
        card.style.setProperty('--svc-gx', `${light.x.toFixed(1)}px`);
        card.style.setProperty('--svc-gy', `${light.y.toFixed(1)}px`);
        if (Math.abs(light.tx - light.x) < 0.2 && Math.abs(light.ty - light.y) < 0.2) gsap.ticker.remove(paintLight);
      };

      const onEnter = () => {
        if (card.dataset.hovered) return;
        card.dataset.hovered = 'true';
        if (effect === 'lift') {
          gsap.to(card, { y: restY - 10, scale: 1.012, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
        } else if (tilts) {
          gsap.to(card, { scale: 1.025, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
        }
      };
      // The effect belongs to the card, not to its order button: it rests while the pointer is on it.
      const overCta = (event: PointerEvent) => event.target instanceof Element && !!event.target.closest('[data-svc-cta]');
      const onMove = (event: PointerEvent) => {
        if (overCta(event)) {
          if (card.dataset.hovered) onLeave();
          return;
        }
        if (!card.dataset.hovered) onEnter();
        const rect = card.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        if (lights) {
          light.tx = px;
          light.ty = py;
          if (light.fresh) {
            // First move after entering: start the light under the cursor, not at the last position.
            light.x = px;
            light.y = py;
            light.fresh = false;
          }
          gsap.ticker.add(paintLight);
        }
        if (rotX && rotY) {
          rotY((px / rect.width - 0.5) * 12);
          rotX((py / rect.height - 0.5) * -12);
        }
      };
      const onLeave = () => {
        delete card.dataset.hovered;
        light.fresh = true;
        if (effect === 'lift') gsap.to(card, { y: restY, scale: 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
        if (tilts) {
          rotX?.(0);
          rotY?.(0);
          gsap.to(card, { scale: 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
        }
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (!overCta(event)) onEnter();
      };

      card.addEventListener('pointerenter', onPointerEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('pointerenter', onPointerEnter);
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        delete card.dataset.hovered;
        gsap.ticker.remove(paintLight);
        gsap.killTweensOf(card, 'rotationX,rotationY,scale');
        if (tilts) gsap.set(card, { clearProps: 'rotationX,rotationY,scale,transformPerspective' });
        if (effect === 'lift') gsap.set(card, { y: restY, scale: 1 });
      });
    });

    return () => cleanups.forEach((off) => off());
  }, [rootRef, effect, capable, itemsKey]);
}

/** A converted amount (minor units) in the same currency/format as `price`. */
export function formatPriceFromCents(
  cents: number,
  price: Pick<ServicePriceParts, 'symbol' | 'symbolFirst'>
): { amount: string; text: string } {
  const amount = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return { amount, text: price.symbolFirst ? `${price.symbol}${amount}` : `${amount} ${price.symbol}` };
}

/**
 * The order button's look when the creator picked one in General → Order button (filled, outline or
 * plain link), drawn from the card's own ink/surface colours so it works on any design and in
 * light or dark. `null` for `auto`: the design keeps its own button.
 */
export function ctaLookOverride(
  mode: PortfolioServicesPricingCtaStyle,
  ink: string,
  surface: string,
  radius: string | null
): CSSProperties | null {
  if (mode === 'auto') return null;
  if (mode === 'link') {
    return {
      backgroundColor: 'transparent',
      color: ink,
      borderStyle: 'none',
      borderWidth: 0,
      padding: '0.5rem 0',
      minHeight: 48,
      borderRadius: 0,
      textDecoration: 'underline',
      textUnderlineOffset: '5px',
    };
  }
  const base: CSSProperties = {
    padding: '0 1.5rem',
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radius ?? '9999px',
    borderStyle: 'solid',
    borderWidth: 1.5,
  };
  return mode === 'filled'
    ? { ...base, backgroundColor: ink, color: surface, borderColor: ink }
    : { ...base, backgroundColor: 'transparent', color: ink, borderColor: withAlpha(ink, 0.4) };
}
