/**
 * Accent for the dashboard chrome: a deeper, more coral orange than the landing hero's.
 *
 * Deliberately one token rather than a scattering of literals — it drives the active nav underline,
 * the activation dots and the presence picker's icons and ambient glow, which is the whole point of
 * a signature colour. Kept separate from `BRAND_ORANGE` because the landing gradient is built on
 * that lighter hue; the two are not interchangeable.
 */
export const ACCENT_ORANGE = '#FF5722';
/**
 * App page ground (light) — pure white shared by every page and the top bar. Blocks drawn in
 * `APP_SURFACE` take their edge from a hairline. Dark stays black.
 */
export const APP_GROUND = 'bg-[#FFFFFF]';
/**
 * Pure-white block on that ground; the edge comes from a hairline. Written as a literal, not
 * `bg-white`, so no global surface rule can repaint it.
 */
export const APP_SURFACE =
  'border border-[#E5E5E5] bg-[#FFFFFF] dark:border-white/[0.1] dark:bg-[#111111]';
/** Fields and rails on the ground (header search, section sidebars): white with an inset hairline. */
export const APP_FIELD = 'bg-[#FFFFFF] ring-1 ring-inset ring-[#E5E5E5] dark:ring-white/[0.1]';
export const APP_FIELD_HOVER = 'hover:ring-[#CCCCCC] dark:hover:ring-white/[0.2]';

export const brandGradientBg =
  'bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C]';

/** Shared landing corner radius — matches Hero “Start for free”. */
const brandRadiusClass = 'rounded-lg';
const brandButtonRadiusClass = brandRadiusClass;

/** Boutons CTA landing — noir en clair, blanc en sombre */
export const brandCtaClass =
  `${brandButtonRadiusClass} bg-neutral-950 text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200`;

/** Boutons dashboard / UI — orange uni (sans dégradé) */
export const brandSolidBg = 'bg-[#FF6B00] hover:bg-[#EA580C]';

export const brandShadow =
  'shadow-[0_4px_24px_rgba(249,115,22,0.28)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.42)]';
