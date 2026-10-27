'use client';

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { PortfolioFaqMarker } from '@/components/portfolio/portfolio-faq-marker';

/**
 * FAQ → General → Frame — one opt-in outer frame shared by every FAQ design.
 *
 * The designs themselves draw no stage any more (no fill, no radius, no inner padding), so by
 * default they sit straight on the section and line up with every other section's content
 * edge. Turning the frame on wraps whichever design is active in a box the creator styles here.
 *
 * Colors are palette tokens resolved through the live `--pf-palette-*` custom properties (same
 * convention as the FAQ Header tokens), so a frame follows Global → Theme light/dark and the
 * section's own color-mode pin without any extra wiring.
 */

export type PortfolioFaqFrameBorderWidth = 'none' | 'hairline' | 'thin' | 'bold';
export type PortfolioFaqFrameBorderColor = 'bordure' | 'texteFort' | 'texteMuted' | 'principal' | 'secondaire';
export type PortfolioFaqFrameFill = 'none' | 'fond' | 'neutre' | 'texteFort' | 'principal' | 'secondaire';
export type PortfolioFaqFrameRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioFaqFramePadding = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioFaqFrameShadow = 'none' | 'soft' | 'deep';

export type PortfolioFaqFrameSettings = {
  enabled: boolean;
  borderWidth: PortfolioFaqFrameBorderWidth;
  borderColor: PortfolioFaqFrameBorderColor;
  /** 0–100 */
  borderOpacity: number;
  fill: PortfolioFaqFrameFill;
  /** 0–100 */
  fillOpacity: number;
  radius: PortfolioFaqFrameRadius;
  padding: PortfolioFaqFramePadding;
  shadow: PortfolioFaqFrameShadow;
  /** Frosted glass: blurs the section background behind the frame (images, gradients). */
  blur: boolean;
};

/** Off by default. Once on: a hairline in the palette's own border color, 28px corners and
 *  roomy padding — the same silhouette the designs' old built-in stage had. */
export const DEFAULT_FAQ_FRAME: PortfolioFaqFrameSettings = {
  enabled: false,
  borderWidth: 'hairline',
  borderColor: 'bordure',
  borderOpacity: 100,
  fill: 'none',
  fillOpacity: 100,
  radius: 'lg',
  padding: 'lg',
  shadow: 'none',
  blur: false,
};

/** Designs that already draw their own cards: an outer frame is blocked for them (panel hides it, render ignores it). */
export function faqDesignAllowsFrame(design: string | undefined): boolean {
  return design !== 'bento-dual' && design !== 'prism-cards';
}

export const FAQ_FRAME_BORDER_WIDTHS: PortfolioFaqFrameBorderWidth[] = ['none', 'hairline', 'thin', 'bold'];
export const FAQ_FRAME_BORDER_COLORS: PortfolioFaqFrameBorderColor[] = ['bordure', 'texteFort', 'texteMuted', 'principal', 'secondaire'];
export const FAQ_FRAME_FILLS: PortfolioFaqFrameFill[] = ['none', 'fond', 'neutre', 'texteFort', 'principal', 'secondaire'];
export const FAQ_FRAME_RADII: PortfolioFaqFrameRadius[] = ['none', 'sm', 'md', 'lg', 'xl'];
export const FAQ_FRAME_PADDINGS: PortfolioFaqFramePadding[] = ['sm', 'md', 'lg', 'xl'];
export const FAQ_FRAME_SHADOWS: PortfolioFaqFrameShadow[] = ['none', 'soft', 'deep'];

export const FAQ_FRAME_BORDER_PX: Record<PortfolioFaqFrameBorderWidth, number> = { none: 0, hairline: 1, thin: 2, bold: 4 };
export const FAQ_FRAME_RADIUS_PX: Record<PortfolioFaqFrameRadius, number> = { none: 0, sm: 12, md: 20, lg: 28, xl: 40 };

/** [block, inline] — `lg` matches the designs' former built-in padding (py 40–64 / px 20–56). */
const FAQ_FRAME_PADDING: Record<PortfolioFaqFramePadding, [string, string]> = {
  sm: ['clamp(20px, 3vw, 28px)', 'clamp(16px, 2.5vw, 24px)'],
  md: ['clamp(28px, 4vw, 44px)', 'clamp(20px, 3.5vw, 36px)'],
  lg: ['clamp(40px, 5vw, 64px)', 'clamp(20px, 4.5vw, 56px)'],
  xl: ['clamp(48px, 7vw, 96px)', 'clamp(24px, 6vw, 80px)'],
};

const FAQ_FRAME_SHADOW: Record<PortfolioFaqFrameShadow, string | undefined> = {
  none: undefined,
  soft: '0 1px 2px rgba(0, 0, 0, 0.04), 0 16px 40px -20px rgba(0, 0, 0, 0.22)',
  deep: '0 2px 8px rgba(0, 0, 0, 0.06), 0 36px 72px -28px rgba(0, 0, 0, 0.42)',
};

/** Fallbacks mirror the `@property --pf-palette-*` initial values in globals.css. */
const FAQ_FRAME_TOKEN_VAR: Record<PortfolioFaqFrameBorderColor | Exclude<PortfolioFaqFrameFill, 'none'>, string> = {
  bordure: 'var(--pf-palette-bordure, #262626)',
  texteFort: 'var(--pf-palette-texte-fort, #fafafa)',
  texteMuted: 'var(--pf-palette-texte-muted, #a3a3a3)',
  principal: 'var(--pf-palette-principal, #ea580c)',
  secondaire: 'var(--pf-palette-secondaire, #3b82f6)',
  neutre: 'var(--pf-palette-neutre, #171717)',
  fond: 'var(--pf-palette-fond, #0a0a0a)',
};

/** Picking a fill resets its opacity to a readable starting point: a surface color can be
 *  solid, but a text or accent color at 100% would swallow the FAQ content drawn on top. */
export const FAQ_FRAME_FILL_DEFAULT_OPACITY: Record<Exclude<PortfolioFaqFrameFill, 'none'>, number> = {
  fond: 100,
  neutre: 100,
  texteFort: 5,
  principal: 10,
  secondaire: 10,
};

function tokenColor(token: keyof typeof FAQ_FRAME_TOKEN_VAR, opacity: number): string {
  const color = FAQ_FRAME_TOKEN_VAR[token];
  return opacity >= 100 ? color : `color-mix(in srgb, ${color} ${Math.max(0, opacity)}%, transparent)`;
}

const clampPercent = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : fallback;

const pickFrom = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export function normalizeFaqFrame(value: unknown, base: PortfolioFaqFrameSettings = DEFAULT_FAQ_FRAME): PortfolioFaqFrameSettings {
  if (!value || typeof value !== 'object') return base;
  const r = value as Record<string, unknown>;
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : base.enabled,
    borderWidth: pickFrom(r.borderWidth, FAQ_FRAME_BORDER_WIDTHS, base.borderWidth),
    borderColor: pickFrom(r.borderColor, FAQ_FRAME_BORDER_COLORS, base.borderColor),
    borderOpacity: clampPercent(r.borderOpacity, base.borderOpacity),
    fill: pickFrom(r.fill, FAQ_FRAME_FILLS, base.fill),
    fillOpacity: clampPercent(r.fillOpacity, base.fillOpacity),
    radius: pickFrom(r.radius, FAQ_FRAME_RADII, base.radius),
    padding: pickFrom(r.padding, FAQ_FRAME_PADDINGS, base.padding),
    shadow: pickFrom(r.shadow, FAQ_FRAME_SHADOWS, base.shadow),
    blur: typeof r.blur === 'boolean' ? r.blur : base.blur,
  };
}

/** Inline style for the `.pf-faq-frame` wrapper, or `undefined` when the frame is off. The
 *  glass blur lives on the wrapper's `::before` (globals.css), never on the wrapper itself — a
 *  `backdrop-filter` ancestor would trap Floating Gallery's mobile `position: fixed` sheet. */
function faqFrameWrapperStyle(frame: PortfolioFaqFrameSettings): CSSProperties | undefined {
  if (!frame.enabled) return undefined;
  const borderPx = FAQ_FRAME_BORDER_PX[frame.borderWidth];
  const [paddingBlock, paddingInline] = FAQ_FRAME_PADDING[frame.padding];
  return {
    borderStyle: borderPx ? 'solid' : undefined,
    borderWidth: borderPx || undefined,
    borderColor: borderPx ? tokenColor(frame.borderColor, frame.borderOpacity) : undefined,
    backgroundColor: frame.fill === 'none' ? undefined : tokenColor(frame.fill, frame.fillOpacity),
    borderRadius: FAQ_FRAME_RADIUS_PX[frame.radius],
    paddingBlock,
    paddingInline,
    boxShadow: FAQ_FRAME_SHADOW[frame.shadow],
  };
}

/* ------------------------------------------------------------------------------------------------ *
 * Contrast adaptation. A frame fill can turn the surface behind the FAQ into the opposite tone of the
 * page (a light "Text" fill over a dark page): the designs' own light ink then vanishes. The wrapper
 * measures the surface it really paints and, when the current ink would not read on it, re-points the
 * palette inks for everything inside the frame to whichever of light / dark reads best.
 * ------------------------------------------------------------------------------------------------ */

type Rgba = [number, number, number, number];

/** Parses what getComputedStyle returns for a colour: rgb()/rgba() and color(srgb …) (color-mix results). */
function parseCssColor(value: string): Rgba | null {
  const v = value.trim();
  let m = v.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)$/i);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), a];
  }
  m = v.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)$/i);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [parseFloat(m[1]) * 255, parseFloat(m[2]) * 255, parseFloat(m[3]) * 255, a];
  }
  return null;
}

function luminance([r, g, b]: Rgba): number {
  const lin = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: Rgba, b: Rgba): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
}

const INK_LIGHT: Rgba = [245, 245, 245, 1];
const INK_DARK: Rgba = [10, 10, 10, 1];
const rgb = (c: Rgba, alpha = 1) => `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;

const ADAPTED_VARS = [
  '--pf-palette-texte-fort',
  '--pf-palette-texte-muted',
  '--pf-palette-texte-faint',
  '--pf-palette-bordure',
  '--pf-faq-q-color',
  '--pf-faq-a-color',
  '--pf-faq-title-ink',
  '--pf-faq-subtitle-ink',
] as const;

/** Keeps every ink inside an enabled, filled frame readable against the surface the frame really paints. */
function useFaqFrameContrast(
  frameRef: React.RefObject<HTMLDivElement | null>,
  innerRef: React.RefObject<HTMLDivElement | null>,
  frame: PortfolioFaqFrameSettings,
  textColors: CSSProperties | undefined
) {
  const textKey = JSON.stringify(textColors ?? {});
  useLayoutEffect(() => {
    // `frameEl` paints the fill from the UNTOUCHED palette tokens; the adapted inks are set on `el`, the box
    // inside it. Setting them on the frame itself would re-colour its own fill (it reads the same tokens) and
    // flip the very surface being measured.
    const frameEl = frameRef.current;
    const el = innerRef.current;
    if (!frameEl || !el || !frame.enabled || frame.fill === 'none') return undefined;

    const resolve = (css: string): Rgba | null => {
      const probe = document.createElement('span');
      probe.style.color = css;
      probe.style.display = 'none';
      frameEl.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return parseCssColor(value);
    };
    const clear = () => ADAPTED_VARS.forEach((name) => el.style.removeProperty(name));

    const adapt = () => {
      clear();
      const base = resolve(FAQ_FRAME_TOKEN_VAR.fond);
      const fill = resolve(FAQ_FRAME_TOKEN_VAR[frame.fill as Exclude<PortfolioFaqFrameFill, 'none'>]);
      const ink = resolve(FAQ_FRAME_TOKEN_VAR.texteFort);
      if (!base || !fill || !ink) return;
      const surface = over([fill[0], fill[1], fill[2], fill[3] * (frame.fillOpacity / 100)], over(base, [255, 255, 255, 1]));
      const readsNow = contrast(ink, surface) >= 4.5;
      const tone = contrast(INK_LIGHT, surface) >= contrast(INK_DARK, surface) ? INK_LIGHT : INK_DARK;
      if (!readsNow) {
        // Re-point the palette inks for everything inside the frame (headers read these directly).
        el.style.setProperty('--pf-palette-texte-fort', rgb(tone));
        el.style.setProperty('--pf-palette-texte-muted', rgb(tone, 0.68));
        el.style.setProperty('--pf-palette-texte-faint', rgb(tone, 0.5));
        el.style.setProperty('--pf-palette-bordure', rgb(tone, 0.2));
        // Headers that take a free hex colour read these instead of the palette.
        el.style.setProperty('--pf-faq-title-ink', rgb(tone));
        el.style.setProperty('--pf-faq-subtitle-ink', rgb(tone, 0.72));
      }
      // Question / answer inks: an explicit choice is kept only while it reads; otherwise the readable tone.
      const guard = (name: '--pf-faq-q-color' | '--pf-faq-a-color', fallbackAlpha: number) => {
        const chosen = (textColors as Record<string, string> | undefined)?.[name];
        const resolved = chosen ? resolve(chosen) : null;
        if (resolved && contrast(over(resolved, surface), surface) >= 3.2) return;
        if (!chosen && readsNow) return;
        el.style.setProperty(name, rgb(tone, fallbackAlpha));
      };
      guard('--pf-faq-q-color', 1);
      guard('--pf-faq-a-color', 0.82);
    };

    adapt();
    // A colour-mode or palette change repaints the tokens: re-measure.
    let raf = 0;
    const again = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(adapt);
    };
    const observer = new MutationObserver(again);
    observer.observe(document.documentElement, { attributes: true });
    const root = frameEl.closest('.pf-theme-root');
    if (root) observer.observe(root, { attributes: true });
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- frame fields + text colours are the real inputs
  }, [frame.enabled, frame.fill, frame.fillOpacity, textKey]);
}

/**
 * Wraps the active FAQ design (header included) in the creator's frame — a no-op when off.
 * `textColors` (General → Text colors, see `faqTextColorVars`) are custom properties every
 * design inherits; with the frame off they ride a `display: contents` box, which passes
 * inherited values down without adding a layout box.
 */
export function FaqDesignFrame({
  frame,
  textColors,
  marker = 'auto',
  children,
}: {
  frame: PortfolioFaqFrameSettings;
  textColors?: CSSProperties;
  /** List marker kind (`auto` = each design's own); read by globals.css through `data-pf-faq-marker`. */
  marker?: PortfolioFaqMarker;
  children: ReactNode;
}) {
  const style = faqFrameWrapperStyle(frame);
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useFaqFrameContrast(frameRef, innerRef, frame, textColors);
  // Lets a design with its own vivid surface behind the text (Prism Cards' open card) step
  // back to a neutral one once the creator has picked palette text colors.
  const customText = textColors ? '' : undefined;
  if (!style) {
    if (!textColors && marker === 'auto') return <>{children}</>;
    return (
      <div
        data-pf-faq-text-custom={customText}
        data-pf-faq-marker={marker === 'auto' ? undefined : marker}
        style={{ display: 'contents', ...textColors }}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      ref={frameRef}
      className="pf-faq-frame"
      data-pf-faq-frame-blur={frame.blur ? 'true' : undefined}
      data-pf-faq-text-custom={customText}
      data-pf-faq-marker={marker === 'auto' ? undefined : marker}
      style={{ ...style, ...textColors }}
    >
      {/* Carries the contrast-adapted inks (custom properties inherit through `display: contents`). */}
      <div ref={innerRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Places the FAQ header beside (left) or above the design. Used when the creator's position differs from the design's
 * native one (the design then renders without its own header slot). Side-by-side only from a wide container
 * (> 1024px, same threshold as Kinetic split's own rule); tablet and phone always stack the header on top, which
 * is why the position is only a desktop preference. Keyed to the box's own width, not the viewport, so the Studio
 * preview pane and page gutters are accounted for.
 */
export function FaqHeaderPlacement({
  position,
  header,
  children,
}: {
  position: 'top' | 'left' | null;
  header: ReactNode;
  children: ReactNode;
}) {
  if (!position || !header) return <>{children}</>;
  return (
    // The outer box is the query container; the grid is its child, because a container query can only style
    // what is inside the container, never the container itself.
    <div className="pf-faq-placement">
      <div className="pf-faq-placement-grid" data-position={position}>
        <div className="pf-faq-placement-head">{header}</div>
        <div className="pf-faq-placement-body">{children}</div>
      </div>
    </div>
  );
}
