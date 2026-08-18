/** Palette landing — orange hero + blanc / gris / noir */
export const BRAND_ORANGE = '#F97316';
export const BRAND_ORANGE_DARK = '#EA580C';
export const BRAND_ORANGE_LIGHT = '#FB923C';

/** Dashboard sidebar — blanc pur / anthracite YouTube (#0F0F0F) en sombre */
export const DASHBOARD_SIDEBAR_BG = 'bg-white dark:bg-[#0F0F0F]';
/** Surfaces alignées sur le fond sidebar (filtres, cartes, catalogues) */
export const DASHBOARD_SIDEBAR_SURFACE = 'bg-white dark:bg-[#0F0F0F]';
/** Dashboard main canvas — gris visible, contrasté avec le sidebar */
export const DASHBOARD_MAIN_BG = 'bg-neutral-100 dark:bg-neutral-950';

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
