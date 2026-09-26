import type { CSSProperties, ReactNode } from 'react';

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
export function faqFrameWrapperStyle(frame: PortfolioFaqFrameSettings): CSSProperties | undefined {
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

/**
 * Wraps the active FAQ design (header included) in the creator's frame — a no-op when off.
 * `textColors` (General → Text colors, see `faqTextColorVars`) are custom properties every
 * design inherits; with the frame off they ride a `display: contents` box, which passes
 * inherited values down without adding a layout box.
 */
export function FaqDesignFrame({
  frame,
  textColors,
  children,
}: {
  frame: PortfolioFaqFrameSettings;
  textColors?: CSSProperties;
  children: ReactNode;
}) {
  const style = faqFrameWrapperStyle(frame);
  // Lets a design with its own vivid surface behind the text (Prism Cards' open card) step
  // back to a neutral one once the creator has picked palette text colors.
  const customText = textColors ? '' : undefined;
  if (!style) {
    if (!textColors) return <>{children}</>;
    return (
      <div data-pf-faq-text-custom={customText} style={{ display: 'contents', ...textColors }}>
        {children}
      </div>
    );
  }
  return (
    <div
      className="pf-faq-frame"
      data-pf-faq-frame-blur={frame.blur ? 'true' : undefined}
      data-pf-faq-text-custom={customText}
      style={{ ...style, ...textColors }}
    >
      {children}
    </div>
  );
}
