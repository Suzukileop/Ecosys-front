/** Palette landing — orange hero + blanc / gris / noir */
export const BRAND_ORANGE = '#F97316';

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
 * Light-mode neutral scale, lifted from SKKY Partners (skky.com) — measured off their live
 * stylesheet rather than eyeballed from a screenshot.
 *
 * The point of it is that the ground is **not white**. A near-white page forces every surface on
 * it to be white too, and then only a hairline says where anything begins. Dropping the ground to
 * a real grey buys a whole step of separation for free: the page recedes, the raised surfaces come
 * forward, and the ink sits at `#333` rather than pure black so nothing in the composition is at
 * an extreme.
 *
 * Their own token names are kept, so the mapping back to the source stays checkable.
 */
/**
 * The page ground: off-white, not white. A single step off `#FFF` — enough to stop the page
 * glaring without ever reading as a grey panel. The bar carries the same value, so the chrome and
 * the page are one surface and only the hairline under the bar separates them.
 *
 * The two greys below are from the same screenshot but are *surfaces*, not grounds: `#E9E7E3` is
 * the SKKY demo panel and `#C0C6C3` is their marketing home. Both were tried as the page and both
 * were too heavy for it. Kept named so the distinction does not get lost again.
 */
export const SURFACE_OFFWHITE = '#F8F8F8';
export const SURFACE_PAPER = '#E9E7E3';
export const SURFACE_SAGE = '#C0C6C3';
export const SURFACE_CHALK = '#F8F5EE';
export const INK_SLATE = '#333333';
export const INK_SLATE_SECONDARY = '#555555';
/** Their `slate10` / `slate50` — hairlines derived from the ink, never from pure black. */
export const INK_SLATE_10 = 'rgba(51,51,51,0.1)';
export const INK_SLATE_24 = 'rgba(51,51,51,0.24)';
export const BRAND_ORANGE_DARK = '#EA580C';
export const BRAND_ORANGE_LIGHT = '#FB923C';

/** Dashboard sidebar — blanc pur / anthracite YouTube (#0F0F0F) en sombre */
export const DASHBOARD_SIDEBAR_BG = 'bg-white dark:bg-[#0F0F0F]';
/** Surfaces alignées sur le fond sidebar (filtres, cartes, catalogues) */
export const DASHBOARD_SIDEBAR_SURFACE = 'bg-white dark:bg-[#0F0F0F]';
/** Dashboard main canvas — gris visible, contrasté avec le sidebar */
export const DASHBOARD_MAIN_BG = 'bg-neutral-100 dark:bg-neutral-950';
/**
 * App page ground (light) — white, with blocks drawn as `#EEF0F2` panels on it (see the
 * `[data-app-surfaces]` rule in globals.css). Dark stays black.
 */
export const APP_GROUND = 'bg-white';
/** Grey fields and rails on that ground (header search, section sidebars). */
export const APP_FIELD = 'bg-[#EEF0F2]';
export const APP_FIELD_HOVER = 'hover:bg-[#E6E9EC]';

export const brandGradientText =
  'bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] bg-clip-text text-transparent';

export const brandGradientBg =
  'bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C]';

/** Shared landing page content width + side gutters (match Features section). */
export const landingSectionShellClass =
  'mx-auto w-full max-w-[96rem] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20';

/** Shared landing corner radius — matches Hero “Start for free”. */
export const brandRadiusClass = 'rounded-lg';
export const brandButtonRadiusClass = brandRadiusClass;
export const brandFrameRadiusClass = brandRadiusClass;

/** Gray panel surface — matches Features section copy column. */
export const landingPanelSurfaceClass = 'bg-neutral-50/80 dark:bg-neutral-900';

/** Soft orange check circle — no border, bold tick inside. */
export const landingCheckBulletClass =
  'bg-[#F97316]/10 text-[#F97316] dark:bg-[#F97316]/15 dark:text-[#FB923C]';
export const landingCheckIconClass =
  'h-[0.8rem] w-[0.8rem] scale-110 font-black sm:h-[0.95rem] sm:w-[0.95rem]';

/** Boutons CTA landing — noir en clair, blanc en sombre */
export const brandCtaClass =
  `${brandButtonRadiusClass} bg-neutral-950 text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200`;

/** CTA inversé — blanc sur l’image ; reste blanc en sombre à partir de `lg`. */
export const brandCtaInvertedClass =
  `${brandButtonRadiusClass} border border-neutral-200 bg-white text-neutral-950 transition-all hover:-translate-y-0.5 hover:bg-neutral-100 dark:border-transparent dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 lg:dark:border-neutral-200 lg:dark:bg-white lg:dark:text-neutral-950 lg:dark:hover:bg-neutral-100`;

/** CTA orange — hero mobile “Start for free” + accents mobile. */
export const brandCtaOrangeClass =
  `${brandButtonRadiusClass} bg-[#FF6B00] text-white transition-all hover:-translate-y-0.5 hover:bg-[#EA580C]`;

/** Boutons dashboard / UI — orange uni (sans dégradé) */
export const brandSolidBg = 'bg-[#FF6B00] hover:bg-[#EA580C]';

export const brandShadow =
  'shadow-[0_4px_24px_rgba(249,115,22,0.28)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.42)]';
