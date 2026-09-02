import { applyNavPaletteToSettings } from '@/components/portfolio/portfolio-nav-palette-settings';
import { portfolioNavUsesEditorialBarLayout } from '@/components/portfolio/portfolio-nav-layout-design';
import {
  resolveHeroPaletteColor,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavPlacement = PortfolioNavSettings['placement'];
export type PortfolioNavMode = PortfolioNavSettings['navMode'];
export type PortfolioNavBarDesign = PortfolioNavSettings['barDesign'];
export type PortfolioNavContentMode = PortfolioNavSettings['contentMode'];
export type PortfolioNavButtonDesign = PortfolioNavSettings['buttonDesign'];
export type PortfolioNavActiveStyle = PortfolioNavSettings['activeStyle'];
export type PortfolioNavDisplayMode = PortfolioNavSettings['displayMode'];
export type PortfolioNavPresence = PortfolioNavSettings['presence'];
export type PortfolioNavMenuHandleContent = PortfolioNavSettings['menuHandleContent'];
export type PortfolioNavMenuControlIcon = PortfolioNavSettings['menuControlIcon'];
export type PortfolioNavMenuControlAlign = PortfolioNavSettings['menuControlAlign'];
export type PortfolioNavCaseOverlayMenuSide = 'left' | 'right';
export type PortfolioNavCaseOverlayMenuTrigger = 'text' | 'icon';
export type PortfolioNavLabelCase = PortfolioNavSettings['labelCase'];
export type PortfolioNavLabelFontSize = PortfolioNavSettings['labelFontSize'];
export type PortfolioNavBarWidth = PortfolioNavSettings['barWidth'];
export type PortfolioNavBarThickness = PortfolioNavSettings['barThickness'];
export type PortfolioNavBarPadding = PortfolioNavSettings['barPadding'];
export type PortfolioNavBarHeight = PortfolioNavSettings['navBarHeight'];
export type PortfolioNavButtonPadding = PortfolioNavSettings['buttonPadding'];
export type PortfolioNavEffectStrength = PortfolioNavSettings['barBlurStrength'];
export type PortfolioNavEdgeOffset = PortfolioNavSettings['edgeOffset'];
export type PortfolioNavItemGap = PortfolioNavSettings['itemGap'];
export type PortfolioNavBarSurface = PortfolioNavSettings['navBarSurface'];

export type PortfolioNavMobileLayout = PortfolioNavSettings['mobileLayout'];
export type PortfolioNavMobileBrand = PortfolioNavSettings['mobileBrand'];
export type PortfolioNavMobileDrawerSide = PortfolioNavSettings['mobileDrawerSide'];

export const PORTFOLIO_NAV_MODE_OPTIONS: {
  value: PortfolioNavMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Floating menu — scroll the page and jump with the nav bar.',
  },
  {
    value: 'per-page',
    label: 'Per page',
    description: 'Dots + previous / next — still scrolls between sections.',
  },
  {
    value: 'pages',
    label: 'Pages',
    description: 'Each section is its own page — switch only with the nav bar (no scroll between sections).',
  },
  {
    value: 'split',
    label: 'Split screen',
    description:
      'Large screens only: fixed left frame (~40%) for title / description that swaps with the active section; content scrolls on the right (~60%). Hero stays full-bleed.',
  },
];

export const PORTFOLIO_NAV_PLACEMENT_OPTIONS: {
  value: PortfolioNavPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'top-center', label: 'Top center', description: 'Horizontal pill centered at the top.' },
  { value: 'top-left', label: 'Top left', description: 'Items align to the left inside the bar.' },
  { value: 'top-right', label: 'Top right', description: 'Items align to the right inside the bar.' },
  { value: 'bottom-center', label: 'Bottom center', description: 'Horizontal bar centered above the bottom edge.' },
  { value: 'bottom-left', label: 'Bottom left', description: 'Items align to the left at the bottom.' },
  { value: 'bottom-right', label: 'Bottom right', description: 'Items align to the right at the bottom.' },
  { value: 'left-center', label: 'Left center', description: 'Vertical stack on the left, centered on screen.' },
  { value: 'right-center', label: 'Right center', description: 'Vertical stack on the right, centered on screen.' },
];

export const PORTFOLIO_NAV_BAR_DESIGN_OPTIONS: {
  value: PortfolioNavBarDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic pill',
    description: 'Soft floating capsule — polished editorial default.',
  },
  {
    value: 'rail',
    label: 'Editorial rail',
    description: 'Structured panel with dividers and a slim accent on the active item.',
  },
  {
    value: 'dock',
    label: 'Icon dock',
    description: 'Individual circular buttons — minimal and tactile.',
  },
];

export const PORTFOLIO_NAV_CONTENT_MODE_OPTIONS: {
  value: PortfolioNavContentMode;
  label: string;
  description: string;
}[] = [
  { value: 'icons', label: 'Icons only', description: 'Compact section icons with accessible labels.' },
  { value: 'text', label: 'Text buttons', description: 'Uppercase or styled text labels per section.' },
  {
    value: 'both',
    label: 'Icons + text',
    description: 'Icon and label together on each button.',
  },
];

/** Floating pill — section menu labels vs icons only (not social link icons). */
export const PORTFOLIO_NAV_FLOATING_PILL_MENU_MODE_OPTIONS: {
  value: Extract<PortfolioNavContentMode, 'text' | 'icons'>;
  label: string;
  description: string;
}[] = [
  {
    value: 'text',
    label: 'Texte',
    description: 'Libellés de section dans la capsule (par défaut).',
  },
  {
    value: 'icons',
    label: 'Icônes seules',
    description: 'Glyphes compacts à la place du texte du menu.',
  },
];

export function normalizePortfolioNavFloatingPillMenuMode(
  contentMode: PortfolioNavContentMode | undefined
): Extract<PortfolioNavContentMode, 'text' | 'icons'> {
  return contentMode === 'icons' ? 'icons' : 'text';
}

export const PORTFOLIO_NAV_BUTTON_DESIGN_OPTIONS: {
  value: PortfolioNavButtonDesign;
  label: string;
  description: string;
}[] = [
  { value: 'clean', label: 'Clean', description: 'Flat buttons — shape comes from the bar design only.' },
  { value: 'outlined', label: 'Outlined', description: 'Crisp border around every button.' },
  { value: 'soft', label: 'Soft fill', description: 'Light tinted background on each item.' },
  { value: 'glow', label: 'Glow', description: 'Soft shadow with warm accent when active.' },
  {
    value: 'bottom-line',
    label: 'Bottom line',
    description: 'Simple underline only — hover and active tint the line.',
  },
];

export const PORTFOLIO_NAV_ACTIVE_OPTIONS: {
  value: PortfolioNavActiveStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'accent-fill',
    label: 'Accent fill',
    description: 'Solid Principal fill — icon uses Neutre (maquette 1).',
  },
  {
    value: 'outline',
    label: 'Accent outline',
    description: 'Thin Principal ring — accent icon on Neutre surface (maquette 2).',
  },
  {
    value: 'filled-pill',
    label: 'Contrast fill',
    description: 'Texte fort fill — Neutre icon (maquette 3).',
  },
  {
    value: 'soft-badge',
    label: 'Soft badge',
    description: 'Light Principal tint behind an accent icon (maquette 4).',
  },
  {
    value: 'dot',
    label: 'Dot indicator',
    description: 'Texte fort icon with a Principal dot underneath (maquette 5).',
  },
  { value: 'underline', label: 'Underline', description: 'Accent underline beneath the active item.' },
  { value: 'accent-text', label: 'Accent text', description: 'Colored bold text — no background shape.' },
];

/** French UI — active item indicators for Navigation → General (mockups 01–06, 08). */
export const PORTFOLIO_NAV_ACTIVE_INDICATOR_OPTIONS: {
  value: PortfolioNavActiveStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'dot',
    label: 'Point sous le texte',
    description: 'Petit point accent centré sous le libellé actif.',
  },
  {
    value: 'underline',
    label: 'Barre sous le texte',
    description: 'Barre accent soulignant le libellé actif.',
  },
  {
    value: 'filled-pill',
    label: 'Pilule colorée',
    description: 'Rectangle accent arrondi avec texte contrasté sur l’élément actif.',
  },
  {
    value: 'dot-left',
    label: 'Point à gauche',
    description: 'Petit point accent à gauche du libellé actif.',
  },
  {
    value: 'accent-text',
    label: 'Texte en gras + couleur',
    description: 'Libellé actif en gras et couleur accent — sans forme.',
  },
  {
    value: 'underline-animated',
    label: 'Souligné animé',
    description: 'Soulignement accent avec transition de largeur sur l’élément actif.',
  },
];

export type PortfolioNavActiveIndicatorSlot =
  | 'dot-below'
  | 'dot-left'
  | 'underline-bar'
  | 'underline-animated';

export function portfolioNavActiveIndicatorSlot(
  activeStyle: PortfolioNavActiveStyle,
  active: boolean
): PortfolioNavActiveIndicatorSlot | null {
  if (!active) return null;
  switch (activeStyle) {
    case 'dot':
      return 'dot-below';
    case 'dot-left':
      return 'dot-left';
    case 'underline':
      return 'underline-bar';
    case 'underline-animated':
      return 'underline-animated';
    default:
      return null;
  }
}

export function portfolioNavUsesFlatMenuIndicatorLayout(
  activeStyle: PortfolioNavActiveStyle
): boolean {
  return (
    activeStyle === 'dot' ||
    activeStyle === 'dot-left' ||
    activeStyle === 'underline' ||
    activeStyle === 'underline-animated' ||
    activeStyle === 'accent-text'
  );
}

/** Reserve space for dot/underline indicators on every item — prevents scroll/active layout shift. */
export function portfolioNavTextIndicatorReserveClass(
  activeStyle: PortfolioNavActiveStyle
): string {
  switch (activeStyle) {
    case 'dot-left':
      return 'relative inline-block pl-2.5';
    case 'dot':
      return 'relative inline-block pb-1.5';
    case 'underline':
    case 'underline-animated':
      return 'relative inline-block pb-0.5';
    default:
      return '';
  }
}

export function portfolioNavUsesTextIndicatorReserve(
  activeStyle: PortfolioNavActiveStyle,
  contentMode: PortfolioNavContentMode
): boolean {
  const mode = portfolioNavEffectiveContentMode(contentMode);
  return mode === 'text' && portfolioNavUsesFlatMenuIndicatorLayout(activeStyle);
}

export function portfolioNavActiveIndicatorNeedsRelative(
  activeStyle: PortfolioNavActiveStyle,
  active: boolean
): boolean {
  return portfolioNavActiveIndicatorSlot(activeStyle, active) !== null;
}

/** Legacy `both` from removed icons-stacked indicator → text-only menu. */
export function portfolioNavEffectiveContentMode(
  contentMode: PortfolioNavContentMode
): PortfolioNavContentMode {
  return contentMode === 'both' ? 'text' : contentMode;
}

export const PORTFOLIO_NAV_DISPLAY_OPTIONS: {
  value: PortfolioNavDisplayMode;
  label: string;
  description: string;
}[] = [
  { value: 'always', label: 'Always available', description: 'The bar can appear from the first paint.' },
  { value: 'on-scroll', label: 'After scrolling', description: 'Appears once the visitor scrolls down.' },
  { value: 'after-hero', label: 'After hero', description: 'Hidden until the hero section is passed.' },
];

export const PORTFOLIO_NAV_PRESENCE_OPTIONS: {
  value: PortfolioNavPresence;
  label: string;
  description: string;
}[] = [
  {
    value: 'full',
    label: 'Always solid',
    description: 'Full opacity whenever the nav is shown — no idle fade.',
  },
  {
    value: 'dim',
    label: 'Dim when idle',
    description: 'Fades after a short pause; brightens on hover or touch.',
  },
  {
    value: 'hover',
    label: 'Reveal on hover',
    description: 'Mostly hidden until hover (desktop) or a tap (touch).',
  },
  {
    value: 'tap',
    label: 'Reveal on tap',
    description: 'Collapsed to a small handle — tap to open or close the menu.',
  },
];

/** Simplified presence control for Navigation → Général (maps to `presence`). */
export type PortfolioNavVisibilityMode = Extract<PortfolioNavPresence, 'full' | 'dim'>;

export const PORTFOLIO_NAV_VISIBILITY_MODE_OPTIONS: {
  value: PortfolioNavVisibilityMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'full',
    label: 'Toujours visible',
    description:
      'La barre reste à pleine opacité dès qu’elle est affichée (écrans larges).',
  },
  {
    value: 'dim',
    label: 'Discret',
    description:
      'Le fond de la barre reste opaque ; seuls les libellés s’atténuent au repos et redeviennent nets au survol.',
  },
];

export function resolvePortfolioNavVisibilityMode(
  presence: PortfolioNavPresence | undefined
): PortfolioNavVisibilityMode {
  if (presence === 'dim' || presence === 'hover' || presence === 'tap') return 'dim';
  return 'full';
}

export const PORTFOLIO_NAV_MENU_HANDLE_OPTIONS: {
  value: PortfolioNavMenuHandleContent;
  label: string;
  description: string;
}[] = [
  { value: 'icon', label: 'Icon only', description: 'Glyph only — compact handle.' },
  { value: 'text', label: 'Text only', description: 'Shows the word Menu.' },
  { value: 'both', label: 'Icon + text', description: 'Glyph and Menu label together.' },
];

export const PORTFOLIO_NAV_MENU_CONTROL_ICON_OPTIONS: {
  value: PortfolioNavMenuControlIcon;
  label: string;
  description: string;
}[] = [
  { value: 'dots-h', label: 'Dots ···', description: 'Horizontal ellipsis.' },
  { value: 'dots-v', label: 'Dots ⋮', description: 'Vertical ellipsis.' },
  { value: 'menu', label: 'Menu lines', description: 'Classic hamburger glyph.' },
  { value: 'chevron', label: 'Chevron', description: 'Up/down chevron for open state.' },
  { value: 'x', label: 'Close ×', description: 'Simple close mark.' },
];

export const PORTFOLIO_NAV_MENU_CONTROL_ALIGN_OPTIONS: {
  value: PortfolioNavMenuControlAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Control sits before the section icons / brand.' },
  { value: 'center', label: 'Center', description: 'Control and brand sit centered in the bar.' },
  { value: 'right', label: 'Right', description: 'Control sits after the section icons / brand.' },
];

export const PORTFOLIO_NAV_BAR_SURFACE_OPTIONS: {
  value: PortfolioNavBarSurface;
  label: string;
  description: string;
}[] = [
  {
    value: 'neutre',
    label: 'Neutre',
    description: 'Surface carte — blanc en clair, ardoise en sombre.',
  },
  {
    value: 'fond',
    label: 'Fond',
    description: 'Même couleur que le fond de page.',
  },
  {
    value: 'transparent',
    label: 'Sans fond',
    description: 'Barre transparente, sans bordure.',
  },
];

export const PORTFOLIO_NAV_LABEL_CASE_OPTIONS: {
  value: PortfolioNavLabelCase;
  label: string;
  description: string;
}[] = [
  { value: 'uppercase', label: 'Uppercase', description: 'Bold caps with wide letter-spacing.' },
  { value: 'titlecase', label: 'Title case', description: 'Each word starts with a capital letter.' },
  { value: 'normal', label: 'Sentence case', description: 'First character uppercase, the rest lowercase — default.' },
];

export const PORTFOLIO_NAV_LABEL_FONT_SIZE_OPTIONS: {
  value: PortfolioNavLabelFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'xs', label: 'Petit', description: '12px — menu et libellés de liens compacts.' },
  { value: 'sm', label: 'Compact', description: '13px — taille par défaut, discret mais lisible.' },
  { value: 'md', label: 'Moyen', description: '15px — équilibré et confortable.' },
  { value: 'lg', label: 'Grand', description: '16px — plus visible sur grand écran.' },
];

export function portfolioNavLabelFontSizeClass(
  size: PortfolioNavLabelFontSize = 'sm',
  compactOnMobile = false
): string {
  switch (size) {
    case 'xs':
      return compactOnMobile ? 'text-[11px] sm:text-xs' : 'text-xs';
    case 'sm':
      return compactOnMobile ? 'text-xs sm:text-[13px]' : 'text-[13px]';
    case 'lg':
      return compactOnMobile ? 'text-sm sm:text-base' : 'text-base';
    default:
      return compactOnMobile ? 'text-sm sm:text-[15px]' : 'text-[15px]';
  }
}

export const PORTFOLIO_NAV_MOBILE_LAYOUT_OPTIONS: {
  value: PortfolioNavMobileLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'brand-bar',
    label: 'Barre logo pleine largeur',
    description:
      'Barre fixe en haut : logo à gauche, icône menu à droite — ouvre le tiroir de navigation.',
  },
  {
    value: 'drawer',
    label: 'Tiroir menu',
    description:
      'Déclencheur menu compact en haut (icône seule ou avec avatar / texte) — ouvre le tiroir.',
  },
];

export const PORTFOLIO_NAV_MOBILE_BRAND_OPTIONS: {
  value: PortfolioNavMobileBrand;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Menu icon only in the top bar.' },
  { value: 'avatar', label: 'Avatar', description: 'Circular profile photo next to the menu icon.' },
  {
    value: 'word',
    label: 'Word',
    description: 'Short text label next to the menu icon (custom word or first name).',
  },
];

export const PORTFOLIO_NAV_MOBILE_DRAWER_SIDE_OPTIONS: {
  value: PortfolioNavMobileDrawerSide;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'From left', description: 'Drawer slides in from the left edge.' },
  { value: 'right', label: 'From right', description: 'Drawer slides in from the right edge.' },
];

function clampNavGapForMobile(
  gap: PortfolioNavItemGap,
  max: Exclude<PortfolioNavItemGap, 'spread'> = 'sm'
): PortfolioNavItemGap {
  const order: Exclude<PortfolioNavItemGap, 'spread'>[] = ['none', 'sm', 'md', 'lg', 'xl'];
  if (gap === 'spread') return max;
  const idx = order.indexOf(gap);
  const maxIdx = order.indexOf(max);
  if (idx < 0) return max;
  return order[Math.min(idx, maxIdx)] ?? max;
}

export type PortfolioNavResolvedMobileChrome = {
  placement: PortfolioNavPlacement;
  contentMode: PortfolioNavContentMode;
  itemGap: PortfolioNavItemGap;
  barWidth: PortfolioNavBarWidth;
  compact: boolean;
  allowWrap: boolean;
  allowScroll: boolean;
  /** Minimal menu icon trigger + drawer panel. */
  useDrawer: boolean;
  /** Full-width top bar (logo + menu) + drawer panel. */
  useBrandBar: boolean;
};

export function normalizePortfolioNavMobileLayout(
  value: PortfolioNavSettings['mobileLayout'] | string | undefined
): PortfolioNavMobileLayout {
  if (value === 'drawer' || value === 'brand-bar') return value;
  return 'brand-bar';
}

/** Resolve placement / content / gap for the current viewport. */
export function resolvePortfolioNavMobileChrome(
  settings: PortfolioNavSettings,
  isLgUp: boolean,
  /** Side nav remaps to bottom until xl so mid-widths match stacked hero. */
  isXlUp: boolean = isLgUp
): PortfolioNavResolvedMobileChrome {
  let placement = settings.placement;
  if (!isXlUp && portfolioNavIsVertical(placement)) {
    placement = 'bottom-center';
  }

  const mobileLayout = normalizePortfolioNavMobileLayout(settings.mobileLayout);

  if (isLgUp) {
    return {
      placement,
      contentMode: settings.contentMode,
      itemGap: settings.itemGap,
      barWidth: settings.barWidth,
      compact: settings.compactOnMobile,
      allowWrap: false,
      allowScroll: false,
      useDrawer: false,
      useBrandBar: false,
    };
  }

  if (mobileLayout === 'drawer') {
    return {
      placement: 'top-center',
      contentMode: settings.contentMode,
      itemGap: settings.itemGap,
      barWidth: 'full',
      compact: true,
      allowWrap: false,
      allowScroll: false,
      useDrawer: true,
      useBrandBar: false,
    };
  }

  return {
    placement: 'top-center',
    contentMode: settings.contentMode,
    itemGap: settings.itemGap,
    barWidth: 'full',
    compact: true,
    allowWrap: false,
    allowScroll: false,
    useDrawer: false,
    useBrandBar: true,
  };
}

export const PORTFOLIO_NAV_BAR_WIDTH_OPTIONS: {
  value: PortfolioNavBarWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'hug',
    label: 'Hug content',
    description: 'Current pill — only as wide as the icons.',
  },
  {
    value: 'full',
    label: 'Full width',
    description: 'Edge-to-edge bar (no left/right gap).',
  },
];

export const PORTFOLIO_NAV_BAR_THICKNESS_OPTIONS: {
  value: PortfolioNavBarThickness;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Thin', description: 'Smaller icons and hit targets.' },
  { value: 'md', label: 'Medium', description: 'Default balanced icon size.' },
  { value: 'lg', label: 'Thick', description: 'Larger icons and buttons.' },
  { value: 'xl', label: 'Extra thick', description: 'Bold, oversized icons.' },
];

export const PORTFOLIO_NAV_BAR_PADDING_OPTIONS: {
  value: PortfolioNavBarPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No inner padding — items flush to the bar edge.' },
  { value: 'sm', label: 'Small', description: 'Tight padding around the items.' },
  { value: 'md', label: 'Medium', description: 'Default balanced padding.' },
  { value: 'lg', label: 'Large', description: 'Roomy space inside the bar.' },
  { value: 'xl', label: 'Extra large', description: 'Very spacious padding around items.' },
];

export const PORTFOLIO_NAV_BAR_HEIGHT_OPTIONS: {
  value: PortfolioNavBarHeight;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Petit',
    description: 'Barre basse — padding vertical réduit et zone de clic compacte.',
  },
  {
    value: 'md',
    label: 'Normal',
    description: 'Hauteur équilibrée par défaut (apparence actuelle).',
  },
  {
    value: 'lg',
    label: 'Aéré',
    description: 'Barre plus haute — padding vertical généreux et cibles plus confortables.',
  },
];

export const PORTFOLIO_NAV_BUTTON_PADDING_OPTIONS: {
  value: PortfolioNavButtonPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Minimal — icon/label almost flush in the pill.' },
  { value: 'sm', label: 'Small', description: 'Tight padding inside each button.' },
  { value: 'md', label: 'Medium', description: 'Default balanced button padding.' },
  { value: 'lg', label: 'Large', description: 'Roomier pills / rail cells.' },
  { value: 'xl', label: 'Extra large', description: 'Very spacious buttons.' },
];

export const PORTFOLIO_NAV_EDGE_OFFSET_OPTIONS: {
  value: PortfolioNavEdgeOffset;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Close', description: 'Flush against the viewport edge.' },
  { value: 'md', label: 'Default', description: 'Comfortable gap from the edge.' },
  { value: 'lg', label: 'Spacious', description: 'More breathing room from the top/edge.' },
  { value: 'xl', label: 'Far', description: 'Pushed further into the page.' },
];

export const PORTFOLIO_NAV_ITEM_GAP_OPTIONS: {
  value: PortfolioNavItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No gap — items touch.' },
  { value: 'sm', label: 'Small', description: 'Tight — about 8px between items.' },
  { value: 'md', label: 'Medium', description: 'Clear gap — about 20px between items.' },
  { value: 'lg', label: 'Large', description: 'Roomy — about 40px between items.' },
  { value: 'xl', label: 'Extra large', description: 'Wide — about 64px between items.' },
  {
    value: 'spread',
    label: 'Spread',
    description: 'Distribute items evenly across the full bar width.',
  },
];

export function portfolioNavIsVertical(placement: PortfolioNavPlacement): boolean {
  return placement === 'left-center' || placement === 'right-center';
}

export function portfolioNavIsTop(placement: PortfolioNavPlacement): boolean {
  return placement.startsWith('top');
}

/**
 * Full-width horizontal bars host extras inside the shell (empty side of the bar).
 * Vertical left/right rails always keep extras detached on the opposite side.
 */
export function portfolioNavBarHostsInlineExtras(
  barWidth: PortfolioNavBarWidth,
  placement: PortfolioNavPlacement
): boolean {
  if (portfolioNavIsVertical(placement)) return false;
  return barWidth === 'full';
}

/** Extras (link icons + Contact) only appear when bar width is full. */
export function portfolioNavExtrasAllowedForBarWidth(barWidth: PortfolioNavBarWidth): boolean {
  return barWidth === 'full';
}

/**
 * Viewport sides still free for extras (where the nav menu is not sitting).
 * Center placements expose both left and right; corner/side rails expose the opposite side.
 */
export function portfolioNavFreeSpaceSides(
  placement: PortfolioNavPlacement
): Array<'left' | 'right'> {
  switch (placement) {
    case 'top-left':
    case 'bottom-left':
    case 'left-center':
      return ['right'];
    case 'top-right':
    case 'bottom-right':
    case 'right-center':
      return ['left'];
    case 'top-center':
    case 'bottom-center':
    default:
      return ['left', 'right'];
  }
}

/**
 * Resolve a single free side for the extras cluster (Contact + icons stay together).
 * Preference is honored only when that side is free; otherwise the only free side wins.
 */
export function portfolioNavResolveExtrasSide(
  freeSides: Array<'left' | 'right'>,
  preference: 'auto' | 'left' | 'right' = 'auto'
): 'left' | 'right' | null {
  if (freeSides.length === 0) return null;
  if (freeSides.length === 1) return freeSides[0];
  if (preference === 'left' || preference === 'right') {
    return freeSides.includes(preference) ? preference : freeSides[0];
  }
  // Auto: prefer right when the menu is centered (common empty CTA zone).
  return freeSides.includes('right') ? 'right' : freeSides[0];
}

/**
 * Place link icons and Contact on free sides.
 * When Contact is detached and both sides are free, icons and Contact can split
 * (icons follow extras preference — auto leans left so Contact can take the right).
 */
export function portfolioNavResolveExtrasPlacement(opts: {
  freeSides: Array<'left' | 'right'>;
  extrasPreference?: 'auto' | 'left' | 'right';
  contactPreference?: 'auto' | 'left' | 'right';
  hasIcons: boolean;
  hasContact: boolean;
  contactDetached: boolean;
}): { iconsSide: 'left' | 'right' | null; contactSide: 'left' | 'right' | null } {
  const {
    freeSides,
    extrasPreference = 'auto',
    contactPreference = 'auto',
    hasIcons,
    hasContact,
    contactDetached,
  } = opts;

  if (freeSides.length === 0) {
    return { iconsSide: null, contactSide: null };
  }

  const canSplit =
    contactDetached && hasIcons && hasContact && freeSides.length > 1;

  if (!canSplit) {
    const preference =
      hasIcons || !hasContact ? extrasPreference : contactPreference;
    // Grouped / single-item: keep prior auto bias (prefer right for a lone CTA).
    const side = portfolioNavResolveExtrasSide(freeSides, preference);
    return {
      iconsSide: hasIcons ? side : null,
      contactSide: hasContact ? side : null,
    };
  }

  // Split: auto extras lean left so Contact can auto-claim the open right side.
  const iconsPref =
    extrasPreference === 'auto' ? 'left' : extrasPreference;
  const iconsSide =
    portfolioNavResolveExtrasSide(freeSides, iconsPref) ?? freeSides[0];
  const remaining = freeSides.filter((side) => side !== iconsSide);
  const contactSide =
    remaining.length === 0
      ? iconsSide
      : contactPreference === 'auto'
        ? remaining[0]
        : remaining.includes(contactPreference)
          ? contactPreference
          : remaining[0];

  return { iconsSide, contactSide };
}

/** Fixed position class for a free-space chrome cluster — same edge band as the nav bar. */
export function portfolioNavFreeSpaceClusterClass(
  placement: PortfolioNavPlacement,
  side: 'left' | 'right',
  edgeOffset: PortfolioNavEdgeOffset = 'md',
  closeOnMobile = false
): string {
  const top = edgeOffsetClass(edgeOffset, 'top', closeOnMobile);
  const bottom = edgeOffsetClass(edgeOffset, 'bottom', closeOnMobile);
  const left = edgeOffsetClass(edgeOffset, 'left', closeOnMobile);
  /** Leave room for the owner settings gear on the top-right. */
  const rightClearSettings: Record<PortfolioNavEdgeOffset, string> = {
    sm: 'right-12',
    md: 'right-14 sm:right-16',
    lg: 'right-16 sm:right-[4.75rem]',
    xl: 'right-[4.75rem] sm:right-24',
  };
  const rightClearCloseOnMobile: Record<PortfolioNavEdgeOffset, string> = {
    sm: 'right-12',
    md: 'right-12 lg:right-16',
    lg: 'right-12 lg:right-[4.75rem]',
    xl: 'right-12 lg:right-24',
  };
  const right =
    placement.startsWith('top')
      ? (closeOnMobile ? rightClearCloseOnMobile : rightClearSettings)[edgeOffset]
      : edgeOffsetClass(edgeOffset, 'right', closeOnMobile);
  const sideClass = side === 'left' ? left : right;

  if (placement === 'left-center' || placement === 'right-center') {
    return `top-1/2 -translate-y-1/2 ${sideClass}`;
  }
  if (
    placement === 'bottom-center' ||
    placement === 'bottom-left' ||
    placement === 'bottom-right'
  ) {
    return `${bottom} ${sideClass}`;
  }
  return `${top} ${sideClass}`;
}

function edgeOffsetClass(
  offset: PortfolioNavEdgeOffset,
  axis: 'top' | 'bottom' | 'left' | 'right',
  closeOnMobile = false
): string {
  const map: Record<PortfolioNavEdgeOffset, Record<'top' | 'bottom' | 'left' | 'right', string>> = {
    sm: { top: 'top-0', bottom: 'bottom-0', left: 'left-0', right: 'right-0' },
    md: {
      top: 'top-4 sm:top-5',
      bottom: 'bottom-4 sm:bottom-5',
      left: 'left-4 sm:left-6',
      right: 'right-4 sm:right-6',
    },
    lg: {
      top: 'top-6 sm:top-8',
      bottom: 'bottom-6 sm:bottom-8',
      left: 'left-5 sm:left-8',
      right: 'right-5 sm:right-8',
    },
    xl: {
      top: 'top-10 sm:top-14',
      bottom: 'bottom-10 sm:bottom-14',
      left: 'left-6 sm:left-10',
      right: 'right-6 sm:right-10',
    },
  };

  /** Flush below `lg`, then the desktop edge of the chosen offset. */
  const closeOnMobileMap: Record<
    Exclude<PortfolioNavEdgeOffset, 'sm'>,
    Record<'top' | 'bottom' | 'left' | 'right', string>
  > = {
    md: {
      top: 'top-0 lg:top-5',
      bottom: 'bottom-0 lg:bottom-5',
      left: 'left-0 lg:left-6',
      right: 'right-0 lg:right-6',
    },
    lg: {
      top: 'top-0 lg:top-8',
      bottom: 'bottom-0 lg:bottom-8',
      left: 'left-0 lg:left-8',
      right: 'right-0 lg:right-8',
    },
    xl: {
      top: 'top-0 lg:top-14',
      bottom: 'bottom-0 lg:bottom-14',
      left: 'left-0 lg:left-10',
      right: 'right-0 lg:right-10',
    },
  };

  if (closeOnMobile && offset !== 'sm') {
    return closeOnMobileMap[offset][axis];
  }
  return map[offset][axis];
}

export function portfolioNavPlacementClass(
  placement: PortfolioNavPlacement,
  edgeOffset: PortfolioNavEdgeOffset = 'md',
  barWidth: PortfolioNavBarWidth = 'hug',
  closeOnMobile = false
): string {
  const top = edgeOffsetClass(edgeOffset, 'top', closeOnMobile);
  const bottom = edgeOffsetClass(edgeOffset, 'bottom', closeOnMobile);
  const left = edgeOffsetClass(edgeOffset, 'left', closeOnMobile);
  const right = edgeOffsetClass(edgeOffset, 'right', closeOnMobile);
  /** Full width spans the viewport; left/right placement only shifts items inside. */
  const stretch = barWidth === 'full' && !portfolioNavIsVertical(placement);
  const sideL = stretch ? 'left-0' : left;
  const sideR = stretch ? 'right-0' : right;
  const resetX = 'translate-x-0';
  const resetY = 'translate-y-0';

  switch (placement) {
    case 'top-left':
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `right-auto bottom-auto ${resetX} ${resetY} ${left} ${top}`;
    case 'top-right':
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `left-auto bottom-auto ${resetX} ${resetY} ${right} ${top}`;
    case 'bottom-center':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto left-1/2 right-auto ${resetY} -translate-x-1/2 ${bottom}`;
    case 'bottom-left':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto right-auto ${resetX} ${resetY} ${bottom} ${left}`;
    case 'bottom-right':
      return stretch
        ? `top-auto ${resetX} ${resetY} ${sideL} ${sideR} ${bottom}`
        : `top-auto left-auto ${resetX} ${resetY} ${bottom} ${right}`;
    case 'left-center':
      return `right-auto bottom-auto ${resetX} -translate-y-1/2 ${left} top-1/2`;
    case 'right-center':
      return `left-auto bottom-auto ${resetX} -translate-y-1/2 ${right} top-1/2`;
    default:
      // top-center
      return stretch
        ? `bottom-auto ${resetX} ${resetY} ${sideL} ${sideR} ${top}`
        : `right-auto bottom-auto ${resetY} left-1/2 ${top} -translate-x-1/2`;
  }
}

/** How items align inside the bar — left/right placement shifts content, not bar width. */
export function portfolioNavItemsAlignClass(
  placement: PortfolioNavPlacement,
  itemGap: PortfolioNavItemGap,
  vertical: boolean
): string {
  if (itemGap === 'spread') return 'justify-evenly';
  if (vertical) return 'justify-center';
  switch (placement) {
    case 'top-left':
    case 'bottom-left':
      return 'justify-start';
    case 'top-right':
    case 'bottom-right':
      return 'justify-end';
    default:
      return 'justify-center';
  }
}

export function portfolioNavBarWidthClass(
  barWidth: PortfolioNavBarWidth,
  vertical: boolean
): string {
  if (vertical) return 'w-fit max-w-[calc(100vw-1.5rem)]';
  if (barWidth === 'full') return 'w-full max-w-[100vw]';
  return 'w-fit max-w-[calc(100vw-1.5rem)]';
}

export function portfolioNavBarInnerClass(
  barWidth: PortfolioNavBarWidth,
  vertical: boolean,
  itemGap: PortfolioNavItemGap = 'sm',
  placement: PortfolioNavPlacement = 'top-center',
  options?: { wrap?: boolean; scroll?: boolean }
): string {
  const gapClass = portfolioNavItemGapClass(itemGap, vertical);
  const alignClass = portfolioNavItemsAlignClass(placement, itemGap, vertical);
  const wrapClass = options?.wrap ? 'flex-wrap justify-center' : '';
  const scrollClass = options?.scroll
    ? 'overflow-x-auto overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    : options?.wrap
      ? 'overflow-visible'
      : 'overflow-x-hidden';

  if (vertical) {
    return `flex w-fit max-w-[calc(100vw-1.5rem)] flex-col ${alignClass} ${gapClass}`;
  }
  if (barWidth === 'hug') {
    return `flex w-fit max-w-[calc(100vw-1.5rem)] flex-row ${alignClass} ${gapClass} ${wrapClass} ${scrollClass}`;
  }
  return `flex w-full max-w-full flex-row ${alignClass} ${gapClass} ${wrapClass} ${scrollClass}`;
}

export function portfolioNavItemGapClass(itemGap: PortfolioNavItemGap, vertical: boolean): string {
  if (itemGap === 'spread') return 'gap-0';
  const map: Record<Exclude<PortfolioNavItemGap, 'spread'>, string> = {
    none: 'gap-0',
    sm: vertical ? 'gap-1.5' : 'gap-2',
    md: vertical ? 'gap-4' : 'gap-5',
    lg: vertical ? 'gap-7' : 'gap-10',
    xl: vertical ? 'gap-10' : 'gap-16',
  };
  return map[itemGap];
}

/** Nav · logo · social — slightly roomier horizontal link spacing. */
export function portfolioNavTriZoneItemGapClass(
  itemGap: PortfolioNavItemGap,
  vertical: boolean
): string {
  if (vertical || itemGap === 'spread') {
    return portfolioNavItemGapClass(itemGap, vertical);
  }
  const map: Record<Exclude<PortfolioNavItemGap, 'spread'>, string> = {
    none: 'gap-0',
    sm: 'gap-3',
    md: 'gap-6 sm:gap-7',
    lg: 'gap-11',
    xl: 'gap-[4.5rem]',
  };
  return map[itemGap];
}

export const PORTFOLIO_NAV_EFFECT_STRENGTH_OPTIONS: {
  value: PortfolioNavEffectStrength;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Thin', description: 'Subtle — light blur or soft shadow.' },
  { value: 'md', label: 'Medium', description: 'Balanced default intensity.' },
  { value: 'lg', label: 'Thick', description: 'Stronger blur / deeper shadow.' },
  { value: 'xl', label: 'Extra thick', description: 'Maximum frost / halo.' },
];

function glassShell(
  glassEffect: boolean,
  borderEnabled = true,
  shadowEnabled = true,
  blurStrength: PortfolioNavEffectStrength = 'md',
  shadowStrength: PortfolioNavEffectStrength = 'md'
): string {
  const border = borderEnabled ? 'border' : 'border-0';
  const shadow = !shadowEnabled
    ? 'shadow-none'
    : (
        {
          sm: 'shadow-[0_4px_14px_rgba(0,0,0,0.06)]',
          md: 'shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
          lg: 'shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
          xl: 'shadow-[0_18px_55px_rgba(0,0,0,0.16)]',
        } as const
      )[shadowStrength];
  const blur = !glassEffect
    ? ''
    : (
        {
          sm: 'backdrop-blur-sm',
          md: 'backdrop-blur-md',
          lg: 'backdrop-blur-lg',
          xl: 'backdrop-blur-xl',
        } as const
      )[blurStrength];
  return [border, shadow, blur].filter(Boolean).join(' ');
}

function barPaddingHorizontalClass(padding: PortfolioNavBarPadding): string {
  switch (padding) {
    case 'none':
      return 'px-0';
    case 'sm':
      return 'px-1';
    case 'lg':
      return 'px-3';
    case 'xl':
      return 'px-4 sm:px-5';
    default:
      return 'px-1.5 sm:px-2';
  }
}

export type PortfolioNavBarHeightVariant = 'shell' | 'structured' | 'item';

/** Vertical padding / min-height for the nav bar shell and menu hit area. `md` matches legacy defaults. */
export function portfolioNavBarHeightClass(
  height: PortfolioNavBarHeight = 'md',
  variant: PortfolioNavBarHeightVariant = 'shell'
): string {
  if (variant === 'structured') {
    switch (height) {
      case 'sm':
        return '!py-2 sm:!py-2.5';
      case 'lg':
        return '!py-4 sm:!py-5';
      default:
        return '!py-3 sm:!py-3.5';
    }
  }
  if (variant === 'item') {
    switch (height) {
      case 'sm':
        return 'min-h-8 sm:min-h-9';
      case 'lg':
        return 'min-h-11 sm:min-h-12';
      default:
        return '';
    }
  }
  switch (height) {
    case 'sm':
      return 'py-1 sm:py-1.5';
    case 'lg':
      return 'py-2.5 sm:py-3';
    default:
      return 'py-1.5 sm:py-2';
  }
}

function barRadiusClass(
  design: PortfolioNavBarDesign,
  vertical: boolean,
  barWidth: PortfolioNavBarWidth
): string {
  if (barWidth === 'full' && !vertical) return 'rounded-none';
  switch (design) {
    case 'rail':
      return 'rounded-2xl';
    case 'dock':
      return '';
    default:
      return vertical ? 'rounded-[1.75rem]' : 'rounded-full';
  }
}

export function portfolioNavBarContainerClass(
  design: PortfolioNavBarDesign,
  glassEffect: boolean,
  vertical: boolean,
  barPadding: PortfolioNavBarPadding = 'md',
  barWidth: PortfolioNavBarWidth = 'hug',
  barBorderEnabled = true,
  barShadowEnabled = true,
  barBlurStrength: PortfolioNavEffectStrength = 'md',
  barShadowStrength: PortfolioNavEffectStrength = 'md',
  navBarHeight: PortfolioNavBarHeight = 'md'
): string {
  const glass = glassShell(
    glassEffect,
    barBorderEnabled,
    barShadowEnabled,
    barBlurStrength,
    barShadowStrength
  );
  const padX = barPaddingHorizontalClass(barPadding);
  const padY = portfolioNavBarHeightClass(navBarHeight, 'shell');
  const pad = `${padX} ${padY}`;
  const radius = barRadiusClass(design, vertical, barWidth);

  switch (design) {
    case 'rail':
      return vertical
        ? `flex flex-col overflow-hidden ${radius} ${pad} ${glass}`
        : `flex flex-row overflow-hidden ${radius} ${pad} ${glass}`;
    case 'dock':
      return vertical ? 'flex flex-col p-0' : 'flex flex-row p-0';
    default:
      return vertical
        ? `flex flex-col overflow-hidden ${radius} ${pad} ${glass}`
        : `flex flex-row overflow-hidden ${radius} ${pad} ${glass}`;
  }
}

export const DEFAULT_NAV_BAR_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_NAV_BAR_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_NAV_ITEM_ICON_COLOR = '#525252';
export const DEFAULT_NAV_ITEM_TEXT_COLOR = '#525252';
export const DEFAULT_NAV_ITEM_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_NAV_ITEM_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_NAV_ITEM_HOVER_ICON_COLOR = '#e2572e';
export const DEFAULT_NAV_ITEM_HOVER_TEXT_COLOR = '#f4f3ef';
export const DEFAULT_NAV_ITEM_HOVER_BACKGROUND_COLOR = '#e2572e';
export const DEFAULT_NAV_ITEM_HOVER_BORDER_COLOR = '#e2572e';
export const DEFAULT_NAV_ACTIVE_ACCENT_COLOR = '#f97316';

export type PortfolioNavLookPreset =
  | 'accent-fill'
  | 'accent-outline'
  | 'dark-fill'
  | 'soft-badge'
  | 'dot';

export const PORTFOLIO_NAV_LOOK_PRESET_OPTIONS: {
  value: PortfolioNavLookPreset;
  label: string;
  description: string;
}[] = [
  {
    value: 'accent-fill',
    label: '1 — Remplissage accent plein',
    description: 'Pastille Principal — icône Neutre. Couleurs = palette Nav.',
  },
  {
    value: 'accent-outline',
    label: '2 — Contour accent minimal',
    description: 'Anneau Principal — icône accent sur Neutre.',
  },
  {
    value: 'dark-fill',
    label: '3 — Inversion contraste',
    description: 'Pastille Texte fort — icône Neutre.',
  },
  {
    value: 'soft-badge',
    label: '4 — Teinte douce (badge)',
    description: 'Fond Principal léger — icône accent.',
  },
  {
    value: 'dot',
    label: '5 — Indicateur point',
    description: 'Icône Texte fort + point Principal.',
  },
];

/**
 * Structure-only chrome for the five classic look presets.
 * Colors are never hard-coded here — they come from the Nav palette.
 */
const NAV_LOOK_PRESET_BASE: Partial<PortfolioNavSettings> = {
  barDesign: 'classic',
  contentMode: 'icons',
  buttonDesign: 'clean',
  barWidth: 'hug',
  barBorderEnabled: true,
  barShadowEnabled: true,
  glassEffect: false,
  itemBorderEnabled: false,
  buttonPadding: 'md',
  itemGap: 'sm',
};

function lookPresetActiveStyle(preset: PortfolioNavLookPreset): PortfolioNavActiveStyle {
  switch (preset) {
    case 'accent-fill':
      return 'accent-fill';
    case 'accent-outline':
      return 'outline';
    case 'dark-fill':
      return 'filled-pill';
    case 'soft-badge':
      return 'soft-badge';
    case 'dot':
      return 'dot';
  }
}

/**
 * Apply a reusable nav maquette: structural chrome + re-sync every bound hex
 * from the current Nav palette tokens (never overwrites with hard-coded orange/white).
 */
export function portfolioNavLookPresetPatch(
  preset: PortfolioNavLookPreset,
  navigation?: Pick<PortfolioNavSettings, 'navPalette' | 'navColorBindings' | 'useNavPalette'>
): Partial<PortfolioNavSettings> {
  const structure: Partial<PortfolioNavSettings> = {
    ...NAV_LOOK_PRESET_BASE,
    activeStyle: lookPresetActiveStyle(preset),
  };
  // Manual mode: keep current hex colors — only switch active style / chrome structure.
  if (navigation?.useNavPalette === false) {
    return structure;
  }
  const paletteSync = applyNavPaletteToSettings(navigation ?? {});
  return { ...structure, ...paletteSync, useNavPalette: true };
}

/** Which look preset matches the current settings (null = custom mix). */
export function resolvePortfolioNavLookPreset(
  settings: Pick<
    PortfolioNavSettings,
    'barDesign' | 'contentMode' | 'buttonDesign' | 'activeStyle' | 'itemBorderEnabled'
  >
): PortfolioNavLookPreset | null {
  if (
    settings.barDesign !== 'classic' ||
    settings.contentMode !== 'icons' ||
    settings.buttonDesign !== 'clean' ||
    settings.itemBorderEnabled !== false
  ) {
    return null;
  }
  switch (settings.activeStyle) {
    case 'accent-fill':
      return 'accent-fill';
    case 'outline':
      return 'accent-outline';
    case 'filled-pill':
      return 'dark-fill';
    case 'soft-badge':
      return 'soft-badge';
    case 'dot':
      return 'dot';
    default:
      return null;
  }
}

function navHex(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = navHex(hex, DEFAULT_NAV_ACTIVE_ACCENT_COLOR).slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function hexLuminance(hex: string): number {
  const raw = navHex(hex, '#000000').slice(1);
  const r = Number.parseInt(raw.slice(0, 2), 16) / 255;
  const g = Number.parseInt(raw.slice(2, 4), 16) / 255;
  const b = Number.parseInt(raw.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Pick the candidate with the larger luminance distance from `against`. */
function pickContrastingColor(against: string, a: string, b: string): string {
  const base = hexLuminance(against);
  return Math.abs(hexLuminance(a) - base) >= Math.abs(hexLuminance(b) - base) ? a : b;
}

function darkerColor(a: string, b: string): string {
  return hexLuminance(a) <= hexLuminance(b) ? a : b;
}

export function portfolioNavContrastRatio(ink: string, background: string): number {
  const inkLum = hexLuminance(ink);
  const bgLum = hexLuminance(background);
  const lighter = Math.max(inkLum, bgLum);
  const darker = Math.min(inkLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Label ink on accent / saturated fills — respects light vs dark page palette.
 * Dark pages always use texteFort for contact CTAs, mail, and grouped menu labels.
 */
export function portfolioNavPageIsDark(palette: PortfolioHeroPalette): boolean {
  return hexLuminance(resolveHeroPaletteColor(palette, 'fond')) < 0.4;
}

export function portfolioNavTexteFortInk(palette: PortfolioHeroPalette): string {
  return resolveHeroPaletteColor(palette, 'texteFort');
}

export function portfolioNavEditorialBarUsesTexteFortInk(
  settings: Pick<PortfolioNavSettings, 'enabled' | 'navLayoutDesign' | 'editorialBarButtonInk'>
): boolean {
  return (
    portfolioNavUsesEditorialBarLayout(settings) &&
    (settings.editorialBarButtonInk ?? 'principal') === 'texteFort'
  );
}

/** Menu / indicator accent — always follows editorialBarButtonInk from the live palette. */
export function resolvePortfolioNavEditorialBarMenuAccentColor(
  settings: Pick<
    PortfolioNavSettings,
    | 'enabled'
    | 'navLayoutDesign'
    | 'editorialBarButtonInk'
    | 'activeAccentColor'
    | 'useNavPalette'
    | 'navPalette'
    | 'itemTextColor'
  >,
  palette: PortfolioHeroPalette
): string {
  return resolvePortfolioNavEditorialBarButtonInk(settings, palette);
}

/** editorial-bar: resolve menu / contact label ink from the button-ink preference. */
export function resolvePortfolioNavEditorialBarButtonInk(
  settings: Pick<
    PortfolioNavSettings,
    | 'editorialBarButtonInk'
    | 'useNavPalette'
    | 'navPalette'
    | 'activeAccentColor'
    | 'itemTextColor'
  >,
  palette: PortfolioHeroPalette,
  opts?: { background?: string }
): string {
  const token = settings.editorialBarButtonInk ?? 'principal';
  const ink =
    settings.useNavPalette === false
      ? token === 'principal'
        ? settings.activeAccentColor ?? '#f97316'
        : settings.itemTextColor ?? '#0a0a0a'
      : resolveHeroPaletteColor(palette, token);

  const background = opts?.background?.trim();
  if (!background || background === 'transparent') {
    return ink;
  }

  if (portfolioNavContrastRatio(ink, background) >= 3) {
    return ink;
  }

  if (settings.useNavPalette === false) {
    return settings.itemTextColor ?? '#0a0a0a';
  }

  return token === 'principal'
    ? portfolioNavTexteFortInk(palette)
    : resolveHeroPaletteColor(palette, 'principal');
}

export function applyPortfolioNavEditorialBarActiveInk(
  style: ReturnType<typeof portfolioNavActiveItemStyle> | undefined,
  settings: Pick<
    PortfolioNavSettings,
    | 'enabled'
    | 'navLayoutDesign'
    | 'editorialBarButtonInk'
    | 'useNavPalette'
    | 'navPalette'
    | 'activeAccentColor'
    | 'itemTextColor'
    | 'activeStyle'
  >,
  palette: PortfolioHeroPalette,
  active: boolean
): ReturnType<typeof portfolioNavActiveItemStyle> | undefined {
  if (
    !active ||
    !style ||
    !portfolioNavUsesEditorialBarLayout(settings) ||
    !portfolioNavEditorialBarUsesTexteFortInk(settings)
  ) {
    return style;
  }

  const ink = resolvePortfolioNavEditorialBarButtonInk(settings, palette);
  const activeStyle = settings.activeStyle ?? 'filled-pill';

  if (activeStyle === 'filled-pill') {
    return {
      ...style,
      backgroundColor: hexToRgba(ink, 0.1),
      color: ink,
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
    };
  }

  if (activeStyle === 'accent-fill') {
    return {
      ...style,
      backgroundColor: hexToRgba(ink, 0.12),
      color: ink,
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
    };
  }

  if (activeStyle === 'soft-badge') {
    return {
      ...style,
      backgroundColor: hexToRgba(ink, 0.18),
      color: ink,
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
    };
  }

  if (activeStyle === 'outline') {
    return {
      ...style,
      boxShadow: `inset 0 0 0 1.5px ${ink}`,
      color: ink,
      backgroundColor: style.backgroundColor ?? 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
    };
  }

  return {
    ...style,
    color: ink,
    backgroundColor:
      style.backgroundColor && style.backgroundColor !== 'transparent'
        ? 'transparent'
        : style.backgroundColor,
  };
}

/** Group trigger + dropdown item when a child section is active. */
export function resolvePortfolioNavMenuGroupActiveStyle(
  settings: PortfolioNavSettings,
  palette: PortfolioHeroPalette
): { backgroundColor: string; color: string } {
  const accent = portfolioNavUsesEditorialBarLayout(settings)
    ? resolvePortfolioNavEditorialBarMenuAccentColor(settings, palette)
    : navHex(
        settings.activeAccentColor ?? resolveHeroPaletteColor(palette, 'principal'),
        DEFAULT_NAV_ACTIVE_ACCENT_COLOR
      );

  if (portfolioNavEditorialBarUsesTexteFortInk(settings)) {
    const ink = resolvePortfolioNavEditorialBarButtonInk(settings, palette);
    return {
      backgroundColor: hexToRgba(ink, 0.1),
      color: ink,
    };
  }

  return {
    backgroundColor: accent,
    color: portfolioNavFilledPillLabelInk(accent, palette),
  };
}

export function portfolioNavInkOnAccentFill(
  fillBackground: string,
  palette: PortfolioHeroPalette
): string {
  const texteFort = portfolioNavTexteFortInk(palette);
  const neutre = resolveHeroPaletteColor(palette, 'neutre');

  if (portfolioNavPageIsDark(palette)) {
    return texteFort;
  }

  const fillLum = hexLuminance(fillBackground);
  if (fillLum < 0.55) {
    return neutre;
  }
  return texteFort;
}

/**
 * Filled-pill label only — interchange palette tokens by page mode:
 * light → neutre, dark → texteFort (swap fallback if contrast is weak).
 */
export function portfolioNavFilledPillLabelInk(
  fillBackground: string,
  palette: PortfolioHeroPalette
): string {
  const texteFort = portfolioNavTexteFortInk(palette);
  const neutre = resolveHeroPaletteColor(palette, 'neutre');
  const preferred = portfolioNavPageIsDark(palette) ? texteFort : neutre;
  const fallback = portfolioNavPageIsDark(palette) ? neutre : texteFort;
  if (portfolioNavContrastRatio(preferred, fillBackground) >= 3) {
    return preferred;
  }
  return fallback;
}

export function resolveNavBarSurfaceBackground(
  settings: Pick<
    PortfolioNavSettings,
    'navBarSurface' | 'barBackgroundColor' | 'useNavPalette' | 'navPalette'
  >,
  palette: PortfolioHeroPalette
): string {
  const surface = settings.navBarSurface ?? 'neutre';
  if (surface === 'transparent') return 'transparent';
  if (settings.useNavPalette === false) {
    return settings.barBackgroundColor ?? '#ffffff';
  }
  return resolveHeroPaletteColor(palette, surface === 'fond' ? 'fond' : 'neutre');
}

/** Mobile drawer panel must stay opaque even when the bar surface is transparent. */
export function resolveNavDrawerPanelBackground(
  settings: Pick<
    PortfolioNavSettings,
    'navBarSurface' | 'barBackgroundColor' | 'useNavPalette' | 'navPalette'
  >,
  palette: PortfolioHeroPalette
): string {
  const surface = settings.navBarSurface ?? 'neutre';
  if (surface === 'transparent') {
    if (settings.useNavPalette === false) {
      return settings.barBackgroundColor ?? '#ffffff';
    }
    return resolveHeroPaletteColor(palette, 'neutre');
  }
  return resolveNavBarSurfaceBackground(settings, palette);
}

export function portfolioNavBarShellStyle(
  backgroundColor: string,
  borderColor: string,
  glassEffect: boolean,
  borderEnabled = true
): { backgroundColor: string; borderColor: string; borderWidth?: number; borderStyle?: 'solid' } {
  const bg =
    backgroundColor === 'transparent'
      ? 'transparent'
      : navHex(backgroundColor, DEFAULT_NAV_BAR_BACKGROUND_COLOR);
  const border =
    borderColor === 'transparent'
      ? 'transparent'
      : navHex(borderColor, DEFAULT_NAV_BAR_BORDER_COLOR);
  return {
    backgroundColor: glassEffect && bg !== 'transparent' ? `${bg}e6` : bg,
    borderColor: borderEnabled ? border : 'transparent',
    borderWidth: borderEnabled ? 1 : 0,
    borderStyle: 'solid',
  };
}

/** Inactive item colors — skipped when active so active styles can win. */
export function portfolioNavItemColorStyles(
  iconColor: string,
  textColor: string,
  backgroundColor: string,
  borderColor: string,
  active: boolean,
  borderEnabled = true
): {
  shell?: { backgroundColor: string; borderColor: string; borderWidth: number; borderStyle: 'solid' };
  icon?: { color: string };
  text?: { color: string };
} {
  if (active) return {};
  return {
    shell: {
      backgroundColor: navHex(backgroundColor, DEFAULT_NAV_ITEM_BACKGROUND_COLOR),
      borderColor: borderEnabled
        ? navHex(borderColor, DEFAULT_NAV_ITEM_BORDER_COLOR)
        : 'transparent',
      borderWidth: borderEnabled ? 1 : 0,
      borderStyle: 'solid',
    },
    icon: { color: navHex(iconColor, DEFAULT_NAV_ITEM_ICON_COLOR) },
    text: { color: navHex(textColor, DEFAULT_NAV_ITEM_TEXT_COLOR) },
  };
}

function navItemSurfaceHex(value: string, fallback: string): string {
  if (value === 'transparent') return 'transparent';
  return navHex(value, fallback);
}

/** Hover wash strength — lighter on dark bars so inactive items stay subtle. */
function navItemHoverBgAlpha(
  hoverBackgroundColor: string,
  itemBackgroundColor: string,
  barBackgroundColor: string | undefined,
  activeStyle: PortfolioNavActiveStyle
): number {
  const itemBg = navItemSurfaceHex(itemBackgroundColor, DEFAULT_NAV_ITEM_BACKGROUND_COLOR);
  const hoverBg = navItemSurfaceHex(hoverBackgroundColor, DEFAULT_NAV_ITEM_HOVER_BACKGROUND_COLOR);
  const barBg = barBackgroundColor
    ? navItemSurfaceHex(barBackgroundColor, DEFAULT_NAV_BAR_BACKGROUND_COLOR)
    : itemBg;
  const onDarkBar =
    itemBg === 'transparent' || hexLuminance(itemBg) < 0.08
      ? hexLuminance(barBg) < 0.35
      : hexLuminance(itemBg) < 0.35;
  if (onDarkBar) {
    return hoverBg === 'transparent' ? 0.1 : 0.14;
  }
  switch (activeStyle) {
    case 'accent-fill':
      return 0.22;
    case 'filled-pill':
      return 0.2;
    case 'soft-badge':
      return 0.16;
    case 'outline':
      return 0.1;
    default:
      return 0.12;
  }
}

export type PortfolioNavItemHoverPresentation = {
  shellClass: string;
  iconClass: string;
  textClass: string;
  showHoverDot: boolean;
  hoverDotClass: string;
};

const NAV_ITEM_HOVER_SHELL_TRANSITION =
  'transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200 ease-out';

const NAV_ITEM_HOVER_ICON_TRANSITION =
  'transition-[color,opacity,transform] duration-200 ease-out';

const NAV_ITEM_HOVER_TEXT_TRANSITION =
  'transition-[color,font-weight,opacity,transform] duration-200 ease-out';

const NAV_EDITORIAL_HOVER_EASE = 'duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]';

const NAV_HOVER_DOT_BELOW =
  'pointer-events-none absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full opacity-0 transition-opacity duration-320 ease-out group-hover:opacity-100 group-focus-visible:opacity-100';

const NAV_HOVER_DOT_LEFT =
  'pointer-events-none absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-320 ease-out group-hover:opacity-100 group-focus-visible:opacity-100';

type PortfolioNavLayoutHoverDesign =
  | 'editorial-bar'
  | 'floating-pill'
  | 'nav-logo-social'
  | 'center-logo-split';

function portfolioNavActiveIndicatorHoverParts(
  activeStyle: PortfolioNavActiveStyle,
  contentMode: PortfolioNavContentMode
): {
  shellIndicatorClasses: string;
  showHoverDot: boolean;
  hoverDotClass: string;
  textHoverExtra: string;
  iconHoverExtra: string;
} {
  switch (activeStyle) {
    case 'dot':
      return {
        shellIndicatorClasses: '',
        showHoverDot: true,
        hoverDotClass: NAV_HOVER_DOT_BELOW,
        textHoverExtra: '',
        iconHoverExtra: '',
      };
    case 'dot-left':
      return {
        shellIndicatorClasses: '',
        showHoverDot: true,
        hoverDotClass: NAV_HOVER_DOT_LEFT,
        textHoverExtra: '',
        iconHoverExtra: '',
      };
    case 'accent-text':
      return {
        shellIndicatorClasses: '',
        showHoverDot: false,
        hoverDotClass: '',
        textHoverExtra: 'portfolio-nav-hover-accent-text',
        iconHoverExtra: '',
      };
    case 'filled-pill':
    case 'soft-badge':
    case 'accent-fill':
      return {
        shellIndicatorClasses: '',
        showHoverDot: false,
        hoverDotClass: '',
        textHoverExtra: '',
        iconHoverExtra: '',
      };
    case 'outline':
      return {
        shellIndicatorClasses:
          'rounded-md shadow-[inset_0_0_0_1px_transparent] hover:shadow-[inset_0_0_0_1px_var(--nav-item-hover-border)] hover:bg-[var(--nav-item-hover-bg)]',
        showHoverDot: false,
        hoverDotClass: '',
        textHoverExtra: '',
        iconHoverExtra: '',
      };
    case 'underline':
    case 'underline-animated':
    default:
      return {
        shellIndicatorClasses: '',
        showHoverDot: false,
        hoverDotClass: '',
        textHoverExtra: '',
        iconHoverExtra: '',
      };
  }
}

function portfolioNavIndicatorHoverShellClass(
  activeStyle: PortfolioNavActiveStyle,
  design: PortfolioNavLayoutHoverDesign,
  splitSide?: 'left' | 'right'
): string {
  switch (activeStyle) {
    case 'underline':
      if (design === 'editorial-bar') return PORTFOLIO_NAV_EDITORIAL_INTERACTION.menuLine;
      if (design === 'center-logo-split') {
        return splitSide === 'left'
          ? PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.menuLineLeft
          : PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.menuLineRight;
      }
      return `portfolio-nav-hover-underline ${NAV_EDITORIAL_HOVER_EASE}`;
    case 'underline-animated':
      if (design === 'editorial-bar') return PORTFOLIO_NAV_EDITORIAL_INTERACTION.menuLine;
      if (design === 'center-logo-split') {
        const line =
          splitSide === 'left'
            ? PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.menuLineLeft
            : PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.menuLineRight;
        return `${line} portfolio-nav-hover-underline-animated`;
      }
      return `portfolio-nav-hover-underline-animated ${NAV_EDITORIAL_HOVER_EASE}`;
    case 'filled-pill':
    case 'soft-badge':
    case 'accent-fill':
      if (design === 'floating-pill') return PORTFOLIO_NAV_FLOATING_PILL_INTERACTION.menuPill;
      return `rounded-full hover:bg-[var(--nav-item-hover-bg)] ${NAV_EDITORIAL_HOVER_EASE}`;
    case 'outline':
      return `rounded-md shadow-[inset_0_0_0_1px_transparent] hover:shadow-[inset_0_0_0_1px_var(--nav-item-hover-border)] hover:bg-[var(--nav-item-hover-bg)] ${NAV_EDITORIAL_HOVER_EASE}`;
    case 'dot':
    case 'dot-left':
    case 'accent-text':
    default:
      if (design === 'center-logo-split') {
        return splitSide === 'left'
          ? `portfolio-nav-center-split-hover-tone portfolio-nav-center-split-hover-tone--left ${NAV_EDITORIAL_HOVER_EASE}`
          : `portfolio-nav-center-split-hover-tone portfolio-nav-center-split-hover-tone--right ${NAV_EDITORIAL_HOVER_EASE}`;
      }
      if (design === 'nav-logo-social' && activeStyle === 'dot') {
        return PORTFOLIO_NAV_TRI_ZONE_INTERACTION.menu;
      }
      return '';
  }
}

function portfolioNavLayoutIconHoverShell(
  design: PortfolioNavLayoutHoverDesign,
  activeStyle: PortfolioNavActiveStyle,
  splitSide?: 'left' | 'right'
): string {
  const indicatorShell = portfolioNavIndicatorHoverShellClass(activeStyle, design, splitSide);
  if (indicatorShell) return indicatorShell;

  switch (design) {
    case 'editorial-bar':
      return PORTFOLIO_NAV_EDITORIAL_INTERACTION.icon;
    case 'floating-pill':
      return activeStyle === 'filled-pill' ||
        activeStyle === 'soft-badge' ||
        activeStyle === 'accent-fill'
        ? PORTFOLIO_NAV_FLOATING_PILL_INTERACTION.menuPill
        : PORTFOLIO_NAV_FLOATING_PILL_INTERACTION.icon;
    case 'center-logo-split':
      return splitSide === 'left'
        ? PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.iconLeft
        : PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION.iconRight;
    default:
      return '';
  }
}

function portfolioNavLayoutMenuHoverPresentation(params: {
  active: boolean;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
  design: PortfolioNavLayoutHoverDesign;
  splitSide?: 'left' | 'right';
}): PortfolioNavItemHoverPresentation {
  const { active, activeStyle, contentMode, design, splitSide } = params;

  if (active) {
    return {
      shellClass: 'group relative',
      iconClass: 'inline-flex',
      textClass: '',
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  const indicatorParts = portfolioNavActiveIndicatorHoverParts(activeStyle, contentMode);
  const textHover = [
    'opacity-[0.58]',
    'group-hover:opacity-100',
    'group-hover:[color:var(--nav-item-hover-text)]',
    `transition-[color,opacity] ${NAV_EDITORIAL_HOVER_EASE}`,
    indicatorParts.textHoverExtra,
  ].join(' ');
  const iconHover = [
    'opacity-[0.7]',
    'group-hover:opacity-100',
    'group-hover:[color:var(--nav-item-hover-icon)]',
    `transition-[color,opacity] ${NAV_EDITORIAL_HOVER_EASE}`,
    indicatorParts.iconHoverExtra,
  ].join(' ');

  if (contentMode === 'icons') {
    return {
      shellClass: [
        'group relative border-0 bg-transparent',
        portfolioNavLayoutIconHoverShell(design, activeStyle, splitSide),
        indicatorParts.shellIndicatorClasses,
      ]
        .filter(Boolean)
        .join(' '),
      iconClass: `inline-flex [color:var(--nav-item-icon)] ${iconHover}`,
      textClass: '',
      showHoverDot: indicatorParts.showHoverDot,
      hoverDotClass: indicatorParts.hoverDotClass,
    };
  }

  const editorialTextHover = textHover;

  return {
    shellClass: [
      'group relative border-0 bg-transparent',
      portfolioNavIndicatorHoverShellClass(activeStyle, design, splitSide),
      indicatorParts.shellIndicatorClasses,
    ]
      .filter(Boolean)
      .join(' '),
    iconClass: `inline-flex [color:var(--nav-item-icon)] ${iconHover}`,
    textClass: `[color:var(--nav-item-text)] ${editorialTextHover}`,
    showHoverDot: indicatorParts.showHoverDot,
    hoverDotClass: indicatorParts.hoverDotClass,
  };
}

/** Tri-zone (nav-logo-social) — social-forward hover shells for menu, brand, icons, and CTA. */
export const PORTFOLIO_NAV_TRI_ZONE_INTERACTION = {
  menu: `portfolio-nav-tri-zone-hover-menu ${NAV_EDITORIAL_HOVER_EASE}`,
  socialIcon: 'portfolio-nav-tri-zone-hover-social',
  brand: 'portfolio-nav-tri-zone-hover-brand',
  cta: 'portfolio-nav-tri-zone-hover-cta',
} as const;

/** Editorial bar — shared interactive shells for menu, CTA, brand, and icon controls. */
export const PORTFOLIO_NAV_EDITORIAL_INTERACTION = {
  menuLine: `portfolio-nav-editorial-hover-line ${NAV_EDITORIAL_HOVER_EASE}`,
  cta: 'portfolio-nav-editorial-cta-hover',
  ctaBottomLine: 'portfolio-nav-editorial-cta-hover portfolio-nav-editorial-cta-hover--bottom-line',
  brand: 'portfolio-nav-editorial-brand-hover',
  icon: 'portfolio-nav-editorial-icon-hover',
  ctaIcon: 'portfolio-nav-editorial-cta-icon shrink-0',
} as const;

/** Logo-left nav + contact — utilitarian bar interactive shells. */
export const PORTFOLIO_NAV_LOGO_LEFT_INTERACTION = {
  menuLine: `portfolio-nav-logo-left-hover-line ${NAV_EDITORIAL_HOVER_EASE}`,
  cta: 'portfolio-nav-logo-left-cta-hover',
  brand: 'portfolio-nav-logo-left-brand-hover',
  icon: 'portfolio-nav-logo-left-icon-hover',
  ctaIcon: 'portfolio-nav-logo-left-cta-icon shrink-0',
} as const;

/** Center-logo-split hero bar — directional nudge + inner-edge underline toward logo. */
export const PORTFOLIO_NAV_CENTER_SPLIT_INTERACTION = {
  menuLineLeft: `portfolio-nav-center-split-hover-line portfolio-nav-center-split-hover-line--left ${NAV_EDITORIAL_HOVER_EASE}`,
  menuLineRight: `portfolio-nav-center-split-hover-line portfolio-nav-center-split-hover-line--right ${NAV_EDITORIAL_HOVER_EASE}`,
  iconLeft: `portfolio-nav-center-split-hover-icon portfolio-nav-center-split-hover-icon--left ${NAV_EDITORIAL_HOVER_EASE}`,
  iconRight: `portfolio-nav-center-split-hover-icon portfolio-nav-center-split-hover-icon--right ${NAV_EDITORIAL_HOVER_EASE}`,
  brand: 'portfolio-nav-center-split-brand-hover',
} as const;

/**
 * Editorial bar menu hover — follows the active indicator style.
 */
export function portfolioNavEditorialBarItemHoverPresentation(params: {
  active: boolean;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
}): PortfolioNavItemHoverPresentation {
  return portfolioNavLayoutMenuHoverPresentation({
    ...params,
    design: 'editorial-bar',
  });
}

/** Floating pill — shared interactive shells for menu, CTA, brand, and icon controls. */
export const PORTFOLIO_NAV_FLOATING_PILL_INTERACTION = {
  menuPill: `portfolio-nav-floating-pill-hover-pill ${NAV_EDITORIAL_HOVER_EASE}`,
  cta: 'portfolio-nav-floating-pill-hover-cta',
  brand: 'portfolio-nav-floating-pill-hover-brand',
  icon: 'portfolio-nav-floating-pill-hover-icon',
  ctaIcon: 'portfolio-nav-floating-pill-cta-icon shrink-0',
} as const;

/**
 * Floating pill menu hover — follows the active indicator style.
 */
export function portfolioNavFloatingPillItemHoverPresentation(params: {
  active: boolean;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
}): PortfolioNavItemHoverPresentation {
  return portfolioNavLayoutMenuHoverPresentation({
    ...params,
    design: 'floating-pill',
  });
}

/**
 * Logo-left-nav-contact menu hover — accent tint + left-growing underline, no inline opacity.
 */
export function portfolioNavLogoLeftNavContactItemHoverPresentation(params: {
  active: boolean;
  contentMode: PortfolioNavContentMode;
}): PortfolioNavItemHoverPresentation {
  const { active, contentMode } = params;

  if (active) {
    return {
      shellClass: 'group relative',
      iconClass: 'inline-flex',
      textClass: '',
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  const colorHoverEase = `transition-[color] ${NAV_EDITORIAL_HOVER_EASE}`;

  if (contentMode === 'icons') {
    return {
      shellClass: [
        'group relative border-0 bg-transparent',
        PORTFOLIO_NAV_LOGO_LEFT_INTERACTION.icon,
      ].join(' '),
      iconClass: `inline-flex [color:var(--nav-item-icon)] group-hover:[color:var(--nav-item-hover-icon)] ${colorHoverEase}`,
      textClass: '',
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  return {
    shellClass: ['group relative border-0 bg-transparent', PORTFOLIO_NAV_LOGO_LEFT_INTERACTION.menuLine].join(
      ' '
    ),
    iconClass: `inline-flex [color:var(--nav-item-icon)] group-hover:[color:var(--nav-item-hover-icon)] ${colorHoverEase}`,
    textClass: `[color:var(--nav-item-text)] group-hover:[color:var(--nav-item-hover-text)] ${colorHoverEase}`,
    showHoverDot: false,
    hoverDotClass: '',
  };
}

/**
 * Center-logo-split menu hover — follows the active indicator style.
 */
export function portfolioNavCenterLogoSplitItemHoverPresentation(params: {
  active: boolean;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
  splitSide: 'left' | 'right';
}): PortfolioNavItemHoverPresentation {
  return portfolioNavLayoutMenuHoverPresentation({
    ...params,
    design: 'center-logo-split',
  });
}

/**
 * Tri-zone menu hover — follows the active indicator style.
 */
export function portfolioNavTriZoneItemHoverPresentation(params: {
  active: boolean;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
}): PortfolioNavItemHoverPresentation {
  return portfolioNavLayoutMenuHoverPresentation({
    ...params,
    design: 'nav-logo-social',
  });
}

/**
 * CSS custom properties for inactive-item hover, synced with the nav palette.
 * Background hover is a soft translucent wash of the bound hover token.
 * Resting bg/border also live as vars so hover classes can replace them
 * (inline hex backgroundColor would otherwise block hover:bg-*).
 */
export function portfolioNavItemHoverCssVars(params: {
  active: boolean;
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
  hoverIconColor: string;
  hoverTextColor: string;
  hoverBackgroundColor: string;
  hoverBorderColor: string;
  borderEnabled?: boolean;
  barBackgroundColor?: string;
  activeStyle?: PortfolioNavActiveStyle;
}): Record<string, string> {
  if (params.active) return {};
  const bg = navItemSurfaceHex(params.backgroundColor, DEFAULT_NAV_ITEM_BACKGROUND_COLOR);
  const border = navHex(params.borderColor, DEFAULT_NAV_ITEM_BORDER_COLOR);
  const icon = navHex(params.iconColor, DEFAULT_NAV_ITEM_ICON_COLOR);
  const text = navHex(params.textColor, DEFAULT_NAV_ITEM_TEXT_COLOR);
  const hoverIcon = navHex(params.hoverIconColor, DEFAULT_NAV_ITEM_HOVER_ICON_COLOR);
  const hoverText = navHex(params.hoverTextColor, DEFAULT_NAV_ITEM_HOVER_TEXT_COLOR);
  const hoverBgToken = navItemSurfaceHex(
    params.hoverBackgroundColor,
    DEFAULT_NAV_ITEM_HOVER_BACKGROUND_COLOR
  );
  const hoverBorder = navHex(params.hoverBorderColor, DEFAULT_NAV_ITEM_HOVER_BORDER_COLOR);
  const borderEnabled = params.borderEnabled !== false;
  const activeStyle = params.activeStyle ?? 'filled-pill';
  const barBg = params.barBackgroundColor
    ? navItemSurfaceHex(params.barBackgroundColor, DEFAULT_NAV_BAR_BACKGROUND_COLOR)
    : bg;
  const onDarkBar =
    bg === 'transparent' || hexLuminance(bg) < 0.08
      ? hexLuminance(barBg) < 0.35
      : hexLuminance(bg) < 0.35;
  const hoverBgAlpha = navItemHoverBgAlpha(
    params.hoverBackgroundColor,
    params.backgroundColor,
    params.barBackgroundColor,
    activeStyle
  );
  const hoverBgWash =
    onDarkBar && (hoverBgToken === 'transparent' || hoverBgToken === bg)
      ? hexToRgba(hoverText, hoverBgAlpha)
      : hexToRgba(hoverBgToken, hoverBgAlpha);
  return {
    '--nav-item-bg': bg,
    '--nav-item-border': borderEnabled ? border : 'transparent',
    '--nav-item-icon': icon,
    '--nav-item-text': text,
    '--nav-item-hover-icon': hoverIcon,
    '--nav-item-hover-text': hoverText,
    '--nav-item-hover-bg': hoverBgWash,
    '--nav-item-hover-border': borderEnabled ? hoverBorder : 'transparent',
    '--nav-item-hover-line': hexToRgba(hoverBorder, onDarkBar ? 0.55 : 0.42),
  };
}

/**
 * Per-design inactive hover — complements activeStyle + bar chrome.
 * Active items return minimal classes so active styling is preserved on hover.
 */
export function portfolioNavItemHoverPresentation(params: {
  active: boolean;
  design: PortfolioNavBarDesign;
  buttonDesign: PortfolioNavButtonDesign;
  activeStyle: PortfolioNavActiveStyle;
  contentMode: PortfolioNavContentMode;
  vertical: boolean;
}): PortfolioNavItemHoverPresentation {
  const { active, design, buttonDesign, activeStyle, contentMode, vertical } = params;
  const inactiveIconBase = `inline-flex [color:var(--nav-item-icon)] ${NAV_ITEM_HOVER_ICON_TRANSITION}`;
  const inactiveTextBase = `[color:var(--nav-item-text)] ${NAV_ITEM_HOVER_TEXT_TRANSITION}`;
  const groupShell = `group relative ${NAV_ITEM_HOVER_SHELL_TRANSITION}`;

  if (active) {
    return {
      shellClass: 'group relative',
      iconClass: 'inline-flex',
      textClass: '',
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  const iconColorHover =
    'group-hover:[color:var(--nav-item-hover-icon)] group-hover:opacity-100';
  const textColorHover =
    'group-hover:[color:var(--nav-item-hover-text)] group-hover:opacity-100';

  if (buttonDesign === 'bottom-line') {
    const previewLine = vertical
      ? 'shadow-[inset_2px_0_0_0_transparent] hover:shadow-[inset_2px_0_0_0_var(--nav-item-hover-line)]'
      : 'shadow-[inset_0_-2px_0_0_transparent] hover:shadow-[inset_0_-2px_0_0_var(--nav-item-hover-line)]';
    return {
      shellClass: [
        groupShell,
        'border-0 bg-transparent',
        previewLine,
        'hover:bg-[var(--nav-item-hover-bg)]',
      ].join(' '),
      iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
      textClass: `${inactiveTextBase} ${textColorHover}`,
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  if (design === 'dock') {
    const dockShell =
      contentMode === 'both'
        ? `${groupShell} hover:-translate-y-0.5`
        : `${groupShell} hover:bg-[var(--nav-item-hover-bg)] hover:border-[color:var(--nav-item-hover-border)] hover:scale-[1.04]`;
    return {
      shellClass: [
        dockShell,
        contentMode === 'icons' || contentMode === 'both'
          ? ''
          : 'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
      ]
        .filter(Boolean)
        .join(' '),
      iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover} group-hover:scale-105`,
      textClass: `${inactiveTextBase} ${textColorHover} group-hover:-translate-y-px`,
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  if (design === 'rail') {
    const railInset = vertical
      ? 'hover:shadow-[inset_3px_0_0_0_var(--nav-item-hover-line)]'
      : 'hover:shadow-[inset_0_0_0_1px_var(--nav-item-hover-border)]';
    return {
      shellClass: [
        groupShell,
        'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
        railInset,
        'hover:bg-[var(--nav-item-hover-bg)]',
      ].join(' '),
      iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
      textClass: `${inactiveTextBase} ${textColorHover}`,
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  if (buttonDesign === 'glow') {
    return {
      shellClass: [
        groupShell,
        'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
        'hover:bg-[var(--nav-item-hover-bg)] hover:border-[color:var(--nav-item-hover-border)]',
        'hover:shadow-[0_4px_18px_rgba(0,0,0,0.1)]',
      ].join(' '),
      iconClass: `${inactiveIconBase} ${iconColorHover}`,
      textClass: `${inactiveTextBase} ${textColorHover}`,
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  if (buttonDesign === 'soft') {
    return {
      shellClass: [
        groupShell,
        'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
        'hover:bg-[var(--nav-item-hover-bg)] hover:border-[color:var(--nav-item-hover-border)]',
      ].join(' '),
      iconClass: `${inactiveIconBase} ${iconColorHover}`,
      textClass: `${inactiveTextBase} ${textColorHover}`,
      showHoverDot: false,
      hoverDotClass: '',
    };
  }

  if (contentMode === 'icons') {
    const iconIndicator = portfolioNavActiveIndicatorHoverParts(activeStyle, contentMode);
    const underlineShell =
      activeStyle === 'underline'
        ? vertical
          ? 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)]'
          : 'portfolio-nav-hover-underline'
        : activeStyle === 'underline-animated'
          ? vertical
            ? 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)]'
            : 'portfolio-nav-hover-underline-animated'
          : '';
    const pillShell =
      activeStyle === 'filled-pill' ||
      activeStyle === 'soft-badge' ||
      activeStyle === 'accent-fill'
        ? 'rounded-full hover:bg-[var(--nav-item-hover-bg)] border-0 bg-transparent'
        : '';
    const outlineShell =
      activeStyle === 'outline'
        ? 'rounded-full border border-transparent hover:border-[color:var(--nav-item-hover-border)] hover:bg-[var(--nav-item-hover-bg)] bg-transparent'
        : '';
    return {
      shellClass: [
        groupShell,
        pillShell || outlineShell || 'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
        pillShell || outlineShell
          ? ''
          : 'hover:bg-[var(--nav-item-hover-bg)] hover:border-[color:var(--nav-item-hover-border)]',
        underlineShell,
        iconIndicator.shellIndicatorClasses,
        activeStyle === 'dot' || activeStyle === 'dot-left' || activeStyle === 'accent-text'
          ? ''
          : 'hover:scale-[1.05]',
      ]
        .filter(Boolean)
        .join(' '),
      iconClass: `${inactiveIconBase} opacity-85 ${iconColorHover} group-hover:scale-105 ${iconIndicator.iconHoverExtra}`,
      textClass: inactiveTextBase,
      showHoverDot: iconIndicator.showHoverDot,
      hoverDotClass: iconIndicator.hoverDotClass,
    };
  }

  switch (activeStyle) {
    case 'underline': {
      const underlinePreview = vertical
        ? 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)]'
        : 'border-b-2 border-transparent pb-1.5 hover:border-[color:var(--nav-item-hover-line)]';
      return {
        shellClass: [
          groupShell,
          'rounded-none border-0 bg-transparent',
          underlinePreview,
          'hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
    }
    case 'dot':
      return {
        shellClass: [
          groupShell,
          'border-0 bg-transparent',
          'hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: contentMode === 'text' || contentMode === 'both',
        hoverDotClass: NAV_HOVER_DOT_BELOW,
      };
    case 'dot-left':
      return {
        shellClass: [
          groupShell,
          'border-0 bg-transparent pl-2',
          'hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: contentMode === 'text' || contentMode === 'both',
        hoverDotClass: NAV_HOVER_DOT_LEFT,
      };
    case 'underline-animated': {
      const animatedPreview = vertical
        ? 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)]'
        : 'portfolio-nav-hover-underline-animated pb-1.5';
      return {
        shellClass: [
          groupShell,
          'rounded-none border-0 bg-transparent',
          animatedPreview,
          'hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
    }
    case 'accent-text':
      return {
        shellClass: [
          groupShell,
          'border-0 bg-transparent',
          'hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
    case 'outline':
      return {
        shellClass: [
          groupShell,
          'bg-transparent shadow-[inset_0_0_0_1px_transparent]',
          'hover:shadow-[inset_0_0_0_1px_var(--nav-item-hover-border)] hover:bg-[var(--nav-item-hover-bg)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
    case 'soft-badge':
    case 'accent-fill':
    case 'filled-pill':
      return {
        shellClass: [
          groupShell,
          'border-0 bg-transparent',
          'hover:bg-[var(--nav-item-hover-bg)]',
          contentMode === 'both' ? 'hover:-translate-y-0.5' : '',
        ]
          .filter(Boolean)
          .join(' '),
        iconClass: `${inactiveIconBase} opacity-90 ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
    default:
      return {
        shellClass: [
          groupShell,
          'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)]',
          'hover:bg-[var(--nav-item-hover-bg)] hover:border-[color:var(--nav-item-hover-border)]',
        ].join(' '),
        iconClass: `${inactiveIconBase} ${iconColorHover}`,
        textClass: `${inactiveTextBase} ${textColorHover}`,
        showHoverDot: false,
        hoverDotClass: '',
      };
  }
}

/** Tailwind classes that paint resting + hover colors from CSS vars (no inline hex fight). */
export function portfolioNavItemHoverClass(
  active: boolean,
  buttonDesign?: PortfolioNavButtonDesign,
  vertical = false,
  presentation?: Pick<
    PortfolioNavItemHoverPresentation,
    'shellClass'
  >
): string {
  if (active) return 'group relative';
  if (presentation?.shellClass) return presentation.shellClass;
  if (buttonDesign === 'bottom-line') {
    const line = vertical
      ? 'shadow-[inset_2px_0_0_0_transparent] hover:shadow-[inset_2px_0_0_0_var(--nav-item-hover-line)]'
      : 'shadow-[inset_0_-2px_0_0_transparent] hover:shadow-[inset_0_-2px_0_0_var(--nav-item-hover-line)]';
    return [
      'group relative',
      NAV_ITEM_HOVER_SHELL_TRANSITION,
      'border-0 bg-transparent',
      line,
      'hover:bg-[var(--nav-item-hover-bg)]',
    ].join(' ');
  }
  return [
    'group relative',
    NAV_ITEM_HOVER_SHELL_TRANSITION,
    'bg-[var(--nav-item-bg)]',
    'border-[color:var(--nav-item-border)]',
    'hover:bg-[var(--nav-item-hover-bg)]',
    'hover:border-[color:var(--nav-item-hover-border)]',
  ].join(' ');
}

export function portfolioNavItemHoverIconClass(
  active: boolean,
  presentation?: Pick<PortfolioNavItemHoverPresentation, 'iconClass'>
): string {
  if (active) return 'inline-flex';
  return (
    presentation?.iconClass ??
    `inline-flex [color:var(--nav-item-icon)] ${NAV_ITEM_HOVER_ICON_TRANSITION} group-hover:[color:var(--nav-item-hover-icon)]`
  );
}

export function portfolioNavItemHoverTextClass(
  active: boolean,
  presentation?: Pick<PortfolioNavItemHoverPresentation, 'textClass'>
): string {
  if (active) return '';
  return (
    presentation?.textClass ??
    `[color:var(--nav-item-text)] ${NAV_ITEM_HOVER_TEXT_TRANSITION} group-hover:[color:var(--nav-item-hover-text)]`
  );
}

/** Mobile drawer row hover — mirrors activeStyle without fighting active fill. */
export function portfolioNavDrawerItemHoverClass(
  active: boolean,
  activeStyle: PortfolioNavActiveStyle
): string {
  if (active) return 'shadow-sm';
  switch (activeStyle) {
    case 'underline':
      return 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)] hover:bg-[var(--nav-item-hover-bg)]';
    case 'dot':
      return 'hover:bg-[var(--nav-item-hover-bg)]';
    case 'dot-left':
      return 'hover:bg-[var(--nav-item-hover-bg)] hover:pl-4';
    case 'underline-animated':
      return 'border-l-2 border-transparent hover:border-[color:var(--nav-item-hover-line)] hover:bg-[var(--nav-item-hover-bg)]';
    case 'outline':
      return 'border border-transparent hover:border-[color:var(--nav-item-hover-border)] hover:bg-[var(--nav-item-hover-bg)]';
    case 'accent-text':
      return 'hover:bg-[var(--nav-item-hover-bg)]';
    case 'soft-badge':
    case 'accent-fill':
    case 'filled-pill':
      return 'hover:bg-[var(--nav-item-hover-bg)]';
    default:
      return 'hover:bg-[var(--nav-item-hover-bg)]';
  }
}

function iconSizeClass(thickness: PortfolioNavBarThickness, compactOnMobile: boolean): string {
  switch (thickness) {
    case 'sm':
      return compactOnMobile
        ? 'h-8 w-8 sm:h-9 sm:w-9'
        : 'h-9 w-9';
    case 'lg':
      return compactOnMobile
        ? 'h-11 w-11 sm:h-12 sm:w-12'
        : 'h-12 w-12';
    case 'xl':
      return compactOnMobile
        ? 'h-12 w-12 sm:h-14 sm:w-14'
        : 'h-14 w-14';
    default:
      return compactOnMobile
        ? 'h-10 w-10 sm:h-11 sm:w-11'
        : 'h-10 w-10 sm:h-11 sm:w-11';
  }
}

export function portfolioNavIconGlyphClass(thickness: PortfolioNavBarThickness): string {
  switch (thickness) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-5 w-5 sm:h-6 sm:w-6';
    case 'xl':
      return 'h-6 w-6';
    default:
      return 'h-5 w-5';
  }
}

function buttonPaddingClass(
  padding: PortfolioNavButtonPadding,
  compactOnMobile: boolean
): string {
  switch (padding) {
    case 'none':
      return compactOnMobile ? 'px-1.5 py-0.5 sm:px-2 sm:py-1' : 'px-2 py-1';
    case 'sm':
      return compactOnMobile ? 'px-2.5 py-1 sm:px-3 sm:py-1.5' : 'px-3 py-1.5';
    case 'lg':
      return compactOnMobile ? 'px-3.5 py-2 sm:px-5 sm:py-2.5' : 'px-5 py-2.5';
    case 'xl':
      return 'px-5 py-3 sm:px-6 sm:py-3.5';
    default:
      return compactOnMobile ? 'px-3 py-1.5 sm:px-4 sm:py-2' : 'px-4 py-2';
  }
}

export function portfolioNavItemBaseClass(
  design: PortfolioNavBarDesign,
  contentMode: PortfolioNavContentMode,
  buttonDesign: PortfolioNavButtonDesign,
  labelCase: PortfolioNavLabelCase,
  compactOnMobile: boolean,
  vertical: boolean,
  thickness: PortfolioNavBarThickness = 'md',
  buttonPadding: PortfolioNavButtonPadding = 'md',
  labelFontSize: PortfolioNavLabelFontSize = 'sm',
  navBarHeight: PortfolioNavBarHeight = 'md',
  activeStyle?: PortfolioNavActiveStyle
): string {
  const textSize = portfolioNavLabelFontSizeClass(labelFontSize, compactOnMobile);
  const textPad = buttonPaddingClass(buttonPadding, compactOnMobile);
  const heightClass = portfolioNavBarHeightClass(navBarHeight, 'item');
  const itemHeight = heightClass ? ` ${heightClass}` : '';
  const casing =
    labelCase === 'uppercase'
      ? 'font-normal uppercase tracking-[0.14em]'
      : labelCase === 'titlecase'
        ? 'font-normal tracking-[0.02em] normal-case'
        : 'font-normal tracking-normal normal-case';

  const decor = portfolioNavButtonDesignBaseClass(buttonDesign);
  const iconBox = iconSizeClass(thickness, compactOnMobile);

  // Bottom line overrides bar chrome (dock circles / full borders) — underline only.
  if (buttonDesign === 'bottom-line') {
    if (contentMode === 'icons') {
      return `flex ${iconBox} shrink-0 items-center justify-center rounded-none transition ${decor}`;
    }
    const bothLayoutBottom =
      contentMode === 'both'
        ? vertical
          ? 'inline-flex flex-col gap-1'
          : 'inline-flex flex-row gap-1.5'
        : '';
    return `shrink-0 items-center justify-center rounded-none ${textPad} ${textSize} ${casing} ${bothLayoutBottom || 'inline-flex'} transition ${decor}`;
  }

  if (contentMode === 'icons') {
    switch (design) {
      case 'dock':
        // Palette-driven fill/border/icon (CSS vars + activeAccentStyle) — no hardcoded light/dark.
        return `flex ${iconBox} shrink-0 items-center justify-center rounded-full border shadow-sm transition`;
      case 'rail':
        return vertical
          ? `flex ${iconBox} shrink-0 items-center justify-center rounded-xl transition ${decor}`
          : `flex ${iconBox} shrink-0 items-center justify-center rounded-xl transition ${decor}`;
      default:
        return `flex ${iconBox} shrink-0 items-center justify-center rounded-full transition ${decor}`;
    }
  }

  const bothLayout =
    contentMode === 'both'
      ? vertical
        ? 'inline-flex flex-col gap-1'
        : 'inline-flex flex-row gap-1.5'
      : '';

  const indicatorPad =
    activeStyle === 'dot'
      ? 'px-2 pt-2 pb-2'
      : activeStyle === 'dot-left'
        ? 'pl-3 pr-2 py-2'
        : activeStyle === 'underline' || activeStyle === 'underline-animated'
          ? 'px-2 pt-2 pb-1.5'
          : activeStyle === 'filled-pill'
            ? 'px-2.5 py-1 sm:px-3 sm:py-1'
            : 'px-2 py-2';

  if (activeStyle && portfolioNavUsesFlatMenuIndicatorLayout(activeStyle)) {
    return `relative inline-flex shrink-0 items-center justify-center rounded-none border-0 bg-transparent shadow-none${itemHeight} ${indicatorPad} ${textSize} ${casing} transition`;
  }

  if (activeStyle === 'filled-pill') {
    return `inline-flex shrink-0 items-center justify-center rounded-md border-0 shadow-none ${indicatorPad} ${textSize} ${casing} transition`;
  }

  switch (design) {
    case 'rail':
      return vertical
        ? `flex w-full items-center justify-center rounded-xl ${textPad}${itemHeight} ${textSize} ${casing} ${bothLayout} transition ${decor}`
        : `shrink-0 items-center justify-center rounded-xl ${textPad}${itemHeight} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
    case 'dock':
      // Icon + label: keep the circle on the glyph only — never stretch rounded-full around the text.
      if (contentMode === 'both') {
        return `inline-flex shrink-0 flex-col items-center justify-center gap-1 border-0 bg-transparent p-0 shadow-none${itemHeight} ${textSize} ${casing} transition`;
      }
      return `inline-flex shrink-0 items-center justify-center rounded-full ${textPad}${itemHeight} ${textSize} ${casing} ${bothLayout} border shadow-sm transition`;
    default:
      return `shrink-0 items-center justify-center rounded-full ${textPad}${itemHeight} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
  }
}

/** Circular chrome for dock items when label sits outside the glyph (contentMode both). */
export function portfolioNavDockGlyphClass(
  thickness: PortfolioNavBarThickness = 'md',
  compactOnMobile = false,
  active = false
): string {
  const iconBox = iconSizeClass(thickness, compactOnMobile);
  // Colors: palette CSS vars (inactive) or activeAccentStyle (active).
  return `inline-flex ${iconBox} shrink-0 items-center justify-center rounded-full border shadow-sm transition ${
    active ? 'shadow-md' : ''
  }`;
}

function portfolioNavButtonDesignBaseClass(buttonDesign: PortfolioNavButtonDesign): string {
  switch (buttonDesign) {
    case 'outlined':
      return 'border border-neutral-200/90 bg-white/90 dark:border-neutral-700 dark:bg-neutral-900/90';
    case 'soft':
      return 'border border-transparent bg-neutral-100/90 dark:bg-neutral-800/80';
    case 'glow':
      return 'border border-white/70 bg-white/95 shadow-[0_2px_14px_rgba(0,0,0,0.07)] dark:border-neutral-700 dark:bg-neutral-900/95';
    case 'bottom-line':
      // Line painted via inset box-shadow (hover/active) — no full box border.
      return 'rounded-none border-0 bg-transparent shadow-none';
    default:
      return '';
  }
}

export function portfolioNavLabelFontClass(_labelCase: PortfolioNavLabelCase): string {
  return 'font-normal';
}

/** Structural active classes — accent color is applied via portfolioNavActiveItemStyle. */
function portfolioNavButtonDesignActiveClass(
  buttonDesign: PortfolioNavButtonDesign,
  labelCase: PortfolioNavLabelCase = 'normal'
): string {
  const weight = portfolioNavLabelFontClass(labelCase);
  switch (buttonDesign) {
    case 'outlined':
      return 'border-neutral-900 dark:border-white';
    case 'soft':
      return `${weight} text-neutral-950 dark:text-white`;
    case 'glow':
      return `${weight} text-neutral-950 dark:text-white`;
    case 'bottom-line':
      return `rounded-none border-0 bg-transparent ${weight} shadow-none`;
    default:
      return '';
  }
}

export function portfolioNavItemActiveClass(
  design: PortfolioNavBarDesign,
  buttonDesign: PortfolioNavButtonDesign,
  activeStyle: PortfolioNavActiveStyle,
  active: boolean,
  vertical: boolean,
  labelCase: PortfolioNavLabelCase = 'normal'
): string {
  if (buttonDesign === 'bottom-line') {
    if (!active) {
      return design === 'dock' ? '' : 'text-neutral-600 dark:text-neutral-400';
    }
    // Legacy bottom-line active trait removed — activeStyle owns the active look.
  } else if (!active) {
    // Dock: color from palette CSS vars only (avoid neutral/dark: fighting hex tokens).
    const inactive = design === 'dock' ? '' : 'text-neutral-600 dark:text-neutral-400';

    if (buttonDesign === 'soft') {
      return inactive;
    }
    if (buttonDesign === 'glow') {
      return `${inactive} hover:shadow-[0_4px_18px_rgba(0,0,0,0.1)]`.trim();
    }
    return inactive;
  }

  const decorActive = portfolioNavButtonDesignActiveClass(buttonDesign, labelCase);
  const weight = portfolioNavLabelFontClass(labelCase);

  if (design === 'rail') {
    const railActive = vertical
      ? `bg-neutral-100 ${weight} text-neutral-950 dark:bg-neutral-800 dark:text-white`
      : `bg-neutral-100 ${weight} text-neutral-950 shadow-inner dark:bg-neutral-800 dark:text-white`;
    return decorActive ? `${railActive} ${decorActive}` : railActive;
  }

  if (design === 'dock') {
    // Fill/border/glyph from portfolioNavActiveItemStyle (Global fond ↔ texteFort).
    return `${weight} shadow-md`;
  }

  let classicActive: string;
  switch (activeStyle) {
    case 'underline':
    case 'underline-animated':
      classicActive = `relative rounded-none border-0 bg-transparent ${weight}`;
      break;
    case 'outline':
      classicActive = `border bg-transparent ${weight}`;
      break;
    case 'accent-fill':
      classicActive = `border-0 ${weight}`;
      break;
    case 'soft-badge':
      classicActive = `border-0 ${weight}`;
      break;
    case 'dot':
      classicActive = `relative border-0 bg-transparent ${weight}`;
      break;
    case 'dot-left':
      classicActive = `relative border-0 bg-transparent ${weight}`;
      break;
    case 'accent-text':
      classicActive = `border-0 bg-transparent ${weight}`;
      break;
    default:
      // filled-pill — fill from portfolioNavActiveItemStyle
      classicActive = `border-0 ${weight}`;
  }

  return decorActive ? `${classicActive} ${decorActive}` : classicActive;
}

/**
 * Inline accent styles for the active nav item (replaces hardcoded orange).
 * Applied on Classic pill + Editorial rail; Dock keeps its own high-contrast fill.
 */
export function portfolioNavActiveItemStyle({
  active,
  design,
  buttonDesign,
  activeStyle,
  accentColor,
  /** Neutre / item surface — outline fill + contrast pair. */
  surfaceColor,
  /** Texte fort — dot icon + contrast pair. */
  strongTextColor,
  /** Fond — darkest/lightest page fill for contrast-fill pair. */
  pageFillColor,
  vertical,
}: {
  active: boolean;
  design: PortfolioNavBarDesign;
  buttonDesign: PortfolioNavButtonDesign;
  activeStyle: PortfolioNavActiveStyle;
  accentColor: string;
  surfaceColor?: string;
  strongTextColor?: string;
  pageFillColor?: string;
  vertical: boolean;
}): { borderColor?: string; borderWidth?: number; borderStyle?: 'solid'; boxShadow?: string; color?: string; backgroundColor?: string } | undefined {
  if (!active) return undefined;
  const accent = navHex(accentColor, DEFAULT_NAV_ACTIVE_ACCENT_COLOR);
  const surface = navHex(surfaceColor ?? DEFAULT_NAV_ITEM_BACKGROUND_COLOR, DEFAULT_NAV_ITEM_BACKGROUND_COLOR);
  const strong = navHex(strongTextColor ?? '#0a0a0a', '#0a0a0a');
  const pageFill = navHex(pageFillColor ?? surface, surface);
  const onAccent = pickContrastingColor(accent, surface, strong);
  const contrastFill = darkerColor(pageFill, strong);
  const onContrast = pickContrastingColor(contrastFill, surface, strong);

  // Icon dock: high-contrast circular chrome vs page fond (light↔dark via palette tokens).
  if (design === 'dock') {
    const dockFill = pickContrastingColor(pageFill, strong, surface);
    const dockOn = pickContrastingColor(dockFill, surface, strong);
    return {
      backgroundColor: dockFill,
      color: dockOn,
      borderColor: dockFill,
      borderWidth: 1,
      borderStyle: 'solid',
    };
  }

  if (design === 'rail') {
    return {
      boxShadow: vertical
        ? `inset 0 0 0 2px ${hexToRgba(accent, 0.4)}`
        : `inset 0 0 0 1px ${hexToRgba(accent, 0.35)}`,
    };
  }

  if (buttonDesign === 'glow') {
    return {
      borderColor: hexToRgba(accent, 0.55),
      borderWidth: 1,
      borderStyle: 'solid',
      boxShadow: `0 4px 22px ${hexToRgba(accent, 0.28)}, 0 0 0 2px ${hexToRgba(accent, 0.35)}`,
    };
  }

  if (buttonDesign === 'soft') {
    return {
      borderColor: hexToRgba(accent, 0.45),
      borderWidth: 1,
      borderStyle: 'solid',
      backgroundColor: hexToRgba(accent, 0.12),
    };
  }

  switch (activeStyle) {
    case 'underline':
      return {
        color: strong,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'outline':
      return {
        boxShadow: `inset 0 0 0 1.5px ${accent}`,
        color: accent,
        backgroundColor: surface,
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'accent-fill':
      return {
        backgroundColor: accent,
        color: onAccent,
        borderColor: accent,
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'soft-badge':
      return {
        backgroundColor: hexToRgba(accent, 0.18),
        color: accent,
        borderColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'dot':
    case 'dot-left':
    case 'underline-animated':
      return {
        color: strong,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'accent-text':
      return { color: accent, backgroundColor: 'transparent', borderWidth: 0, borderStyle: 'solid' };
    case 'filled-pill': {
      // Label ink interchanges by light/dark: clair → neutre (surface), sombre → texteFort (strong).
      const preferred = hexLuminance(pageFill) < 0.4 ? strong : surface;
      const fallback = hexLuminance(pageFill) < 0.4 ? surface : strong;
      const labelInk =
        portfolioNavContrastRatio(preferred, accent) >= 3 ? preferred : fallback;
      return {
        backgroundColor: accent,
        color: labelInk,
        borderColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
      };
    }
    default:
      return undefined;
  }
}

export function portfolioNavRailDividerClass(vertical: boolean): string {
  return vertical
    ? 'mx-auto h-px w-6 bg-neutral-200/90 dark:bg-neutral-700'
    : 'my-auto h-5 w-px bg-neutral-200/90 dark:bg-neutral-700';
}

export function formatNavLabel(label: string, labelCase: PortfolioNavLabelCase): string {
  const trimmed = label.trim();
  if (!trimmed) return label;
  if (labelCase === 'uppercase') return trimmed.toLocaleUpperCase();
  const lower = trimmed.toLocaleLowerCase();
  if (labelCase === 'titlecase') {
    return lower.replace(/(^|[\s/&-])\S/g, (chunk) => chunk.toLocaleUpperCase());
  }
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}
