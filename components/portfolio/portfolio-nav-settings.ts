import { applyNavPaletteToSettings } from '@/components/portfolio/portfolio-nav-palette-settings';
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
export type PortfolioNavLabelCase = PortfolioNavSettings['labelCase'];
export type PortfolioNavBarWidth = PortfolioNavSettings['barWidth'];
export type PortfolioNavBarThickness = PortfolioNavSettings['barThickness'];
export type PortfolioNavBarPadding = PortfolioNavSettings['barPadding'];
export type PortfolioNavButtonPadding = PortfolioNavSettings['buttonPadding'];
export type PortfolioNavEffectStrength = PortfolioNavSettings['barBlurStrength'];
export type PortfolioNavEdgeOffset = PortfolioNavSettings['edgeOffset'];
export type PortfolioNavItemGap = PortfolioNavSettings['itemGap'];

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

export const PORTFOLIO_NAV_LABEL_CASE_OPTIONS: {
  value: PortfolioNavLabelCase;
  label: string;
  description: string;
}[] = [
  { value: 'uppercase', label: 'Uppercase', description: 'Bold caps with wide letter-spacing.' },
  { value: 'titlecase', label: 'Title case', description: 'Each word starts with a capital letter.' },
  { value: 'normal', label: 'Sentence case', description: 'First character uppercase, the rest lowercase — default.' },
];

export const PORTFOLIO_NAV_MOBILE_LAYOUT_OPTIONS: {
  value: PortfolioNavMobileLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'auto',
    label: 'Auto fit',
    description:
      'Icons + tight spacing. Full-width edge-to-edge bar (no radius) on phones — same as Bar width Full.',
  },
  {
    value: 'icons-compact',
    label: 'Icons compact',
    description:
      'Force icons and shrink gaps. Full-width edge-to-edge bar (no radius) on phones.',
  },
  {
    value: 'scroll',
    label: 'Swipe row',
    description:
      'Keep labels/spacing; swipe inside a full-width edge-to-edge bar (no radius) on phones.',
  },
  {
    value: 'wrap',
    label: 'Wrap rows',
    description:
      'Icons wrap onto a second row on a full-width edge-to-edge bar (no radius).',
  },
  {
    value: 'drawer',
    label: 'Menu drawer',
    description:
      'Mobile: menu icon opens a sidebar of links — hides the full icon bar.',
  },
  {
    value: 'off',
    label: 'No change',
    description: 'Use desktop Bar width, gap, radius, and labels as-is on mobile (may overflow).',
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
  /** Mobile/tablet menu-drawer chrome — hides the floating icon bar. */
  useDrawer: boolean;
};

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

  const mobileLayout = settings.mobileLayout ?? 'auto';
  const useDrawer = !isLgUp && mobileLayout === 'drawer';

  if (isLgUp || mobileLayout === 'off') {
    return {
      placement,
      contentMode: settings.contentMode,
      itemGap: settings.itemGap,
      barWidth: settings.barWidth,
      compact: !isLgUp && settings.compactOnMobile,
      allowWrap: false,
      allowScroll: false,
      useDrawer: false,
    };
  }

  if (useDrawer) {
    return {
      placement: 'top-center',
      contentMode: settings.contentMode,
      itemGap: settings.itemGap,
      barWidth: 'full',
      compact: true,
      allowWrap: false,
      allowScroll: false,
      useDrawer: true,
    };
  }

  // Same rule as Bar width → Full: edge-to-edge + rounded-none (see barRadiusClass).
  const mobileFullWidth: PortfolioNavBarWidth = 'full';

  if (mobileLayout === 'scroll') {
    return {
      placement,
      contentMode: settings.contentMode,
      itemGap: clampNavGapForMobile(settings.itemGap, 'md'),
      barWidth: mobileFullWidth,
      compact: settings.compactOnMobile,
      allowWrap: false,
      allowScroll: true,
      useDrawer: false,
    };
  }

  if (mobileLayout === 'wrap') {
    return {
      placement,
      contentMode: 'icons',
      itemGap: 'sm',
      barWidth: mobileFullWidth,
      compact: true,
      allowWrap: true,
      allowScroll: false,
      useDrawer: false,
    };
  }

  if (mobileLayout === 'icons-compact') {
    return {
      placement,
      contentMode: 'icons',
      itemGap: clampNavGapForMobile(settings.itemGap, 'sm'),
      barWidth: mobileFullWidth,
      compact: true,
      allowWrap: false,
      allowScroll: false,
      useDrawer: false,
    };
  }

  // auto
  return {
    placement,
    contentMode: 'icons',
    itemGap: 'sm',
    barWidth: mobileFullWidth,
    compact: true,
    allowWrap: false,
    allowScroll: false,
    useDrawer: false,
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

function barPaddingClass(padding: PortfolioNavBarPadding): string {
  switch (padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-1';
    case 'lg':
      return 'p-3';
    case 'xl':
      return 'p-4 sm:p-5';
    default:
      return 'p-1.5 sm:p-2';
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
  barShadowStrength: PortfolioNavEffectStrength = 'md'
): string {
  const glass = glassShell(
    glassEffect,
    barBorderEnabled,
    barShadowEnabled,
    barBlurStrength,
    barShadowStrength
  );
  const pad = barPaddingClass(barPadding);
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

export function portfolioNavBarShellStyle(
  backgroundColor: string,
  borderColor: string,
  glassEffect: boolean,
  borderEnabled = true
): { backgroundColor: string; borderColor: string; borderWidth?: number; borderStyle?: 'solid' } {
  const bg = navHex(backgroundColor, DEFAULT_NAV_BAR_BACKGROUND_COLOR);
  const border = navHex(borderColor, DEFAULT_NAV_BAR_BORDER_COLOR);
  return {
    backgroundColor: glassEffect ? `${bg}e6` : bg,
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
}): Record<string, string> {
  if (params.active) return {};
  const bg = navHex(params.backgroundColor, DEFAULT_NAV_ITEM_BACKGROUND_COLOR);
  const border = navHex(params.borderColor, DEFAULT_NAV_ITEM_BORDER_COLOR);
  const icon = navHex(params.iconColor, DEFAULT_NAV_ITEM_ICON_COLOR);
  const text = navHex(params.textColor, DEFAULT_NAV_ITEM_TEXT_COLOR);
  const hoverIcon = navHex(params.hoverIconColor, DEFAULT_NAV_ITEM_HOVER_ICON_COLOR);
  const hoverText = navHex(params.hoverTextColor, DEFAULT_NAV_ITEM_HOVER_TEXT_COLOR);
  const hoverBg = navHex(params.hoverBackgroundColor, DEFAULT_NAV_ITEM_HOVER_BACKGROUND_COLOR);
  const hoverBorder = navHex(params.hoverBorderColor, DEFAULT_NAV_ITEM_HOVER_BORDER_COLOR);
  const borderEnabled = params.borderEnabled !== false;
  return {
    '--nav-item-bg': bg,
    '--nav-item-border': borderEnabled ? border : 'transparent',
    '--nav-item-icon': icon,
    '--nav-item-text': text,
    '--nav-item-hover-icon': hoverIcon,
    '--nav-item-hover-text': hoverText,
    '--nav-item-hover-bg': hexToRgba(hoverBg, 0.18),
    '--nav-item-hover-border': borderEnabled ? hoverBorder : 'transparent',
  };
}

/** Tailwind classes that paint resting + hover colors from CSS vars (no inline hex fight). */
export function portfolioNavItemHoverClass(
  active: boolean,
  buttonDesign?: PortfolioNavButtonDesign,
  vertical = false
): string {
  if (active) return '';
  if (buttonDesign === 'bottom-line') {
    const line = vertical
      ? 'shadow-[inset_2px_0_0_0_var(--nav-item-border)] hover:shadow-[inset_2px_0_0_0_var(--nav-item-hover-border)]'
      : 'shadow-[inset_0_-2px_0_0_var(--nav-item-border)] hover:shadow-[inset_0_-2px_0_0_var(--nav-item-hover-border)]';
    return [
      'group',
      'transition-[background-color,box-shadow,color] duration-200 ease-out',
      'border-0 bg-transparent',
      line,
      'hover:bg-[var(--nav-item-hover-bg)]',
    ].join(' ');
  }
  return [
    'group',
    'transition-[background-color,border-color,color,box-shadow] duration-200 ease-out',
    'bg-[var(--nav-item-bg)]',
    'border-[color:var(--nav-item-border)]',
    'hover:bg-[var(--nav-item-hover-bg)]',
    'hover:border-[color:var(--nav-item-hover-border)]',
  ].join(' ');
}

export function portfolioNavItemHoverIconClass(active: boolean): string {
  if (active) return 'inline-flex';
  return 'inline-flex [color:var(--nav-item-icon)] transition-colors duration-200 group-hover:[color:var(--nav-item-hover-icon)]';
}

export function portfolioNavItemHoverTextClass(active: boolean): string {
  if (active) return '';
  return '[color:var(--nav-item-text)] transition-colors duration-200 group-hover:[color:var(--nav-item-hover-text)]';
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
  buttonPadding: PortfolioNavButtonPadding = 'md'
): string {
  const textSize =
    thickness === 'sm'
      ? compactOnMobile
        ? 'text-xs sm:text-[13px]'
        : 'text-[13px]'
      : thickness === 'lg' || thickness === 'xl'
        ? compactOnMobile
          ? 'text-sm sm:text-base'
          : 'text-base'
        : compactOnMobile
          ? 'text-sm sm:text-[15px]'
          : 'text-[15px]';
  const textPad = buttonPaddingClass(buttonPadding, compactOnMobile);
  const casing =
    labelCase === 'uppercase'
      ? 'font-semibold uppercase tracking-[0.14em]'
      : labelCase === 'titlecase'
        ? 'font-semibold tracking-[0.02em] normal-case'
        : 'font-semibold tracking-normal normal-case';

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

  switch (design) {
    case 'rail':
      return vertical
        ? `flex w-full items-center justify-center rounded-xl ${textPad} ${textSize} ${casing} ${bothLayout} transition ${decor}`
        : `shrink-0 items-center justify-center rounded-xl ${textPad} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
    case 'dock':
      // Icon + label: keep the circle on the glyph only — never stretch rounded-full around the text.
      if (contentMode === 'both') {
        return `inline-flex shrink-0 flex-col items-center justify-center gap-1 border-0 bg-transparent p-0 shadow-none ${textSize} ${casing} transition`;
      }
      return `inline-flex shrink-0 items-center justify-center rounded-full ${textPad} ${textSize} ${casing} ${bothLayout} border shadow-sm transition`;
    default:
      return `shrink-0 items-center justify-center rounded-full ${textPad} ${textSize} ${casing} ${bothLayout || 'inline-flex'} transition ${decor}`;
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

/** Structural active classes — accent color is applied via portfolioNavActiveItemStyle. */
function portfolioNavButtonDesignActiveClass(buttonDesign: PortfolioNavButtonDesign): string {
  switch (buttonDesign) {
    case 'outlined':
      return 'border-neutral-900 dark:border-white';
    case 'soft':
      return 'font-semibold text-neutral-950 dark:text-white';
    case 'glow':
      return 'font-semibold text-neutral-950 dark:text-white';
    case 'bottom-line':
      return 'rounded-none border-0 bg-transparent font-semibold shadow-none';
    default:
      return '';
  }
}

export function portfolioNavItemActiveClass(
  design: PortfolioNavBarDesign,
  buttonDesign: PortfolioNavButtonDesign,
  activeStyle: PortfolioNavActiveStyle,
  active: boolean,
  vertical: boolean
): string {
  if (buttonDesign === 'bottom-line') {
    if (!active) {
      return design === 'dock' ? '' : 'text-neutral-600 dark:text-neutral-400';
    }
    return portfolioNavButtonDesignActiveClass('bottom-line');
  }

  if (!active) {
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

  const decorActive = portfolioNavButtonDesignActiveClass(buttonDesign);

  if (design === 'rail') {
    const railActive = vertical
      ? 'bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-white'
      : 'bg-neutral-100 font-semibold text-neutral-950 shadow-inner dark:bg-neutral-800 dark:text-white';
    return decorActive ? `${railActive} ${decorActive}` : railActive;
  }

  if (design === 'dock') {
    // Fill/border/glyph from portfolioNavActiveItemStyle (Global fond ↔ texteFort).
    return 'font-semibold shadow-md';
  }

  let classicActive: string;
  switch (activeStyle) {
    case 'underline':
      classicActive = vertical
        ? 'rounded-none border-l-2 bg-transparent font-semibold text-neutral-950 dark:text-white'
        : 'rounded-none border-b-2 bg-transparent pb-1.5 font-semibold text-neutral-950 dark:text-white';
      break;
    case 'outline':
      classicActive = 'border bg-transparent font-semibold';
      break;
    case 'accent-fill':
      classicActive = 'border-0 font-semibold';
      break;
    case 'soft-badge':
      classicActive = 'border-0 font-semibold';
      break;
    case 'dot':
      classicActive = 'relative border-0 bg-transparent font-semibold';
      break;
    case 'accent-text':
      classicActive = 'font-semibold bg-transparent';
      break;
    default:
      // filled-pill — fill / icon colors come from palette via portfolioNavActiveItemStyle
      classicActive = 'border-0 font-semibold';
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

  // Bottom line wins over dock/rail/box borders — accent hairline only.
  if (buttonDesign === 'bottom-line') {
    return {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
      color: accent,
      boxShadow: vertical ? `inset 2px 0 0 0 ${accent}` : `inset 0 -2px 0 0 ${accent}`,
    };
  }

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
      return { borderColor: accent, borderWidth: 2, borderStyle: 'solid' };
    case 'outline':
      return {
        borderColor: accent,
        borderWidth: 1.5,
        borderStyle: 'solid',
        color: accent,
        backgroundColor: surface,
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
      return {
        color: strong,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
      };
    case 'accent-text':
      return { color: accent };
    case 'filled-pill':
      return {
        backgroundColor: contrastFill,
        color: onContrast,
        borderColor: contrastFill,
        borderWidth: 0,
        borderStyle: 'solid',
      };
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
