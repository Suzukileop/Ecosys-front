import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import { DEFAULT_CUSTOM_MOTIF_POINTS, sanitizeMotifPoints, type MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  DEFAULT_RIGHT_MOTIF_POSITION,
  DEFAULT_RIGHT_MOTIF_SIZE,
  sanitizeMotifPanelPosition,
  sanitizeMotifPanelSize,
  normalizeMotifPositionForContentFrame,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  DEFAULT_HERO_PROFILE_SETTINGS,
  isValidProfileHexColor,
  mergeHeroProfileSettings,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_HERO_META_SETTINGS,
  mergeHeroMetaSettings,
  type PortfolioHeroMetaSettings,
} from '@/components/portfolio/portfolio-hero-meta-settings';
import { isPortfolioHeroBowlIntroMotif, normalizePortfolioHeroBannerDesign, DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN, type PortfolioHeroBannerDesign, type PortfolioHeroBowlIntroMotif, type PortfolioHeroIdentityIndexPortraitRadius, type PortfolioHeroPortraitIdentityBottomGap, type PortfolioHeroSelectedWorksIdentityLayout } from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  mergeHeroLeftMotifSettings,
  type PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import {
  mergeHeroMotifsSettings,
  migrateLegacyHeroMotifs,
  syncLegacyFieldsFromHeroMotifs,
  type HeroMotifInstance,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import {
  DEFAULT_HERO_COPY_SETTINGS,
  mergeHeroCopySettings,
  type PortfolioHeroCopySettings,
} from '@/components/portfolio/portfolio-hero-copy-settings';
import { DEFAULT_HERO_HEADLINE_SETTINGS, mergeHeroHeadlineSettings, type PortfolioHeroHeadlineSettings } from '@/components/portfolio/portfolio-hero-headline-settings';
import { DEFAULT_HERO_BACKGROUND_SETTINGS, mergeHeroBackgroundSettings, type PortfolioHeroBackgroundSettings } from '@/components/portfolio/portfolio-hero-background-settings';
import {
  DEFAULT_HERO_ELEMENT_STYLES,
  normalizeHeroElementStyles,
  syncHeroElementStylesFromLegacyPatch,
  syncHeroLegacyTypographyFromElementStyles,
  type PortfolioHeroElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';

export type {
  PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';

export type {
  PortfolioHeroMetaSettings,
} from '@/components/portfolio/portfolio-hero-meta-settings';

export type {
  PortfolioHeroCopySettings,
} from '@/components/portfolio/portfolio-hero-copy-settings';

export type {
  PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';

export type PortfolioHeroMotifShape =
  | 'diagonal'
  | 'triangle'
  | 'trapezoid'
  | 'block'
  | 'chevron'
  | 'prism'
  | 'custom';

export type { MotifPoint };

export type PortfolioHeroMotifLayout = 'centered' | 'full';

const HERO_GEOM_CENTERED_MARGIN_VH = 12;
const HERO_GEOM_CENTERED_PANEL_HEIGHT_VH = 76;

export type PortfolioHeroHeadlineFont =
  | 'sans'
  | 'serif'
  | 'display'
  | 'montserrat'
  | 'oswald'
  | 'bebas'
  | 'raleway'
  | 'anton'
  | 'righteous'
  | 'script';

const PORTFOLIO_HERO_HEADLINE_FONTS = new Set<PortfolioHeroHeadlineFont>([
  'sans',
  'serif',
  'display',
  'montserrat',
  'oswald',
  'bebas',
  'raleway',
  'anton',
  'righteous',
  'script',
]);

function isPortfolioHeroHeadlineFont(value: unknown): value is PortfolioHeroHeadlineFont {
  return typeof value === 'string' && PORTFOLIO_HERO_HEADLINE_FONTS.has(value as PortfolioHeroHeadlineFont);
}

export type PortfolioHeroCtaDesign = 'pill-dark' | 'pill-outline' | 'pill-accent' | 'text-arrow';

/** Phone glyph beside Contact me — same variants as Navigation Contact. */
export type PortfolioHeroCtaIcon =
  | 'phone'
  | 'phone-handset'
  | 'smartphone'
  | 'phone-call'
  | 'phone-outgoing'
  | 'phone-incoming';

const PORTFOLIO_HERO_CTA_ICON_OPTIONS: {
  value: PortfolioHeroCtaIcon;
  label: string;
  description: string;
}[] = [
  { value: 'phone', label: 'Classic', description: 'Curved handset.' },
  { value: 'phone-handset', label: 'Handset', description: 'Bold telephone receiver.' },
  { value: 'smartphone', label: 'Mobile', description: 'Vertical smartphone.' },
  { value: 'phone-call', label: 'Ringing', description: 'Handset with sound waves.' },
  { value: 'phone-outgoing', label: 'Outgoing', description: 'Handset with outward arrow.' },
  { value: 'phone-incoming', label: 'Incoming', description: 'Handset with inward arrow.' },
];

function normalizePortfolioHeroCtaIcon(
  value: unknown,
  fallback: PortfolioHeroCtaIcon = 'phone'
): PortfolioHeroCtaIcon {
  if (typeof value !== 'string') return fallback;
  if (PORTFOLIO_HERO_CTA_ICON_OPTIONS.some((option) => option.value === value)) {
    return value as PortfolioHeroCtaIcon;
  }
  return fallback;
}

export type PortfolioHeroCtaPlacement =
  | 'below-pitch'
  | 'after-headline'
  | 'with-tools'
  | 'below-tools'
  | 'below-stats'
  | 'above-stats'
  | 'free-zone';

/** Sections the secondary hero button can point to. */
export type PortfolioHeroSecondaryCtaTarget =
  | 'work'
  | 'services'
  | 'about'
  | 'experience'
  | 'team'
  | 'gallery'
  | 'faq'
  | 'contact';

function isPortfolioHeroSecondaryCtaTarget(
  value: unknown
): value is PortfolioHeroSecondaryCtaTarget {
  return (
    value === 'work' ||
    value === 'services' ||
    value === 'about' ||
    value === 'experience' ||
    value === 'team' ||
    value === 'gallery' ||
    value === 'faq' ||
    value === 'contact'
  );
}

const DEFAULT_HERO_SECONDARY_CTA_LABEL = 'View my work';

export type PortfolioHeroAvailabilityDesign = 'pill-live' | 'pill-minimal' | 'bordered' | 'soft';

export type PortfolioHeroAvailabilityPlacement =
  | 'above-headline'
  | 'below-headline'
  | 'below-description'
  | 'above-tools'
  | 'below-tools'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  /** Outside the portrait frame, centered above it (not inside the photo). */
  | 'above-portrait';

/** Horizontal align for hero copy elements on mobile & tablet (below xl). Desktop follows layout flip. */
export type PortfolioHeroMobileAlign = 'left' | 'center' | 'right';

/**
 * Horizontal align for hero copy elements on desktop (xl+).
 * 'auto' follows the layout: left (or right when copy sits on the right side),
 * and the mobile choice for vertical divisions.
 */
export type PortfolioHeroDesktopAlign = 'auto' | PortfolioHeroMobileAlign;

export type PortfolioHeroToolsDisplayDesign =
  | 'icons'
  | 'large-cards'
  | 'compact-cards'
  | 'horizontal-cards';
export type PortfolioHeroToolsCardsPerRow = 1 | 2 | 3 | 4;
export type PortfolioHeroToolsCardsLimit = 1 | 2 | 3 | 4;
export type PortfolioHeroToolsCardContentAlignment = 'left' | 'center' | 'right';
export type PortfolioHeroToolsCardIconPlacement = 'top' | 'left' | 'right';

export type PortfolioHeroAvailabilityBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioHeroAvailabilityBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

type PortfolioHeroAvailabilityDotSize = 'sm' | 'md' | 'lg';

export type PortfolioHeroAvailabilityChromeSettings = {
  availabilityLabel: string;
  availabilityUnavailableLabel: string;
  availabilityTextColor: string;
  availabilityBackgroundColor: string;
  availabilityBorderColor: string;
  availabilityBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  availabilityBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  availabilityShowDot: boolean;
  availabilityDotColor: string;
  availabilityDotSize: PortfolioHeroAvailabilityDotSize;
  availabilityDotPulse: boolean;
  availabilityUnavailableTextColor: string;
  availabilityUnavailableBackgroundColor: string;
  availabilityUnavailableBorderColor: string;
  availabilityUnavailableDotColor: string;
  /** Extra space above the availability badge (px). */
  availabilityMarginTopPx: number;
  /** Extra space below the availability badge (px). */
  availabilityMarginBottomPx: number;
};

const DEFAULT_AVAILABILITY_LABEL = 'Available for work';
export const DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL = 'Currently unavailable';
const DEFAULT_AVAILABILITY_TEXT_COLOR = '#065f46';
const DEFAULT_AVAILABILITY_BACKGROUND_COLOR = '#ffffff';
const DEFAULT_AVAILABILITY_BORDER_COLOR = '#a7f3d0';
const DEFAULT_AVAILABILITY_DOT_COLOR = '#10b981';
const DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR = '#92400e';
const DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR = '#fffbeb';
const DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR = '#fcd34d';
const DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR = '#f59e0b';
const DEFAULT_AVAILABILITY_MARGIN_TOP_PX = 0;
const DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX = 0;
const AVAILABILITY_MARGIN_PX_MIN = 0;
const AVAILABILITY_MARGIN_PX_MAX = 96;

function sanitizeAvailabilityMarginPx(
  value: unknown,
  fallback: number = 0
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(AVAILABILITY_MARGIN_PX_MAX, Math.max(AVAILABILITY_MARGIN_PX_MIN, Math.round(n)));
}

const DEFAULT_HERO_AVAILABILITY_CHROME: PortfolioHeroAvailabilityChromeSettings = {
  availabilityLabel: DEFAULT_AVAILABILITY_LABEL,
  availabilityUnavailableLabel: DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  availabilityTextColor: DEFAULT_AVAILABILITY_TEXT_COLOR,
  availabilityBackgroundColor: DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  availabilityBorderColor: DEFAULT_AVAILABILITY_BORDER_COLOR,
  availabilityBorderWidth: 'thin',
  availabilityBorderRadius: 'full',
  availabilityShowDot: true,
  availabilityDotColor: DEFAULT_AVAILABILITY_DOT_COLOR,
  availabilityDotSize: 'md',
  availabilityDotPulse: true,
  availabilityUnavailableTextColor: DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
  availabilityUnavailableBackgroundColor: DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  availabilityUnavailableBorderColor: DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  availabilityUnavailableDotColor: DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  availabilityMarginTopPx: DEFAULT_AVAILABILITY_MARGIN_TOP_PX,
  availabilityMarginBottomPx: DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX,
};

export type {
  PortfolioHeroElementStyles,
} from '@/components/portfolio/portfolio-hero-element-styles';
import {
  applyHeroPaletteToPresentation,
  DEFAULT_HERO_COLOR_BINDINGS,
  DEFAULT_HERO_PALETTE,
  mergeHeroColorBindings,
  mergeHeroPalette,
  type PortfolioHeroColorBindings,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_HERO_COLUMNS_3_ORDER,
  DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT,
  DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL,
  DEFAULT_HERO_LAYOUT_DIVISION,
  DEFAULT_HERO_VERTICAL_FRAME_GAP_PX,
  sanitizeHeroColumns3MiddleWeight,
  sanitizeHeroColumns3Order,
  sanitizeHeroColumns3SlotVertical,
  sanitizeHeroLayoutDivision,
  sanitizeHeroVerticalFrameGapPx,
  type HeroColumns3Slot,
  type HeroColumns3VerticalAlign,
  type HeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT,
  sanitizeHeroUltraWideColumnLayout,
  type HeroUltraWideColumnLayout,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import {
  DEFAULT_HERO_COPY_ELEMENTS_LAYOUT,
  sanitizeHeroCopyElementsLayout,
  type HeroCopyElementsLayout,
} from '@/components/portfolio/portfolio-hero-copy-element-layout';
import {
  sanitizeHeroVerticalCellPlacement,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

const DEFAULT_HERO_VISUAL_FREE_CELL: HeroVerticalCellPlacement = 'top-right';

export type PortfolioHeroPresentationSettings = {
  /** Full-section Hero banner layout (Classic vs Swiss editorial, …). */
  heroBannerDesign: PortfolioHeroBannerDesign;
  /** Oversized cropped signature word for Swiss editorial (empty → first name). */
  heroSignatureWord: string;
  /** Small gray label above availability in Swiss editorial. */
  heroCurrentlyLabel: string;
  /** Small gray label above specialty in Swiss editorial. */
  heroSpecializedInLabel: string;
  /**
   * Portrait identity + Swiss editorial: swap bio/statement with name + specialty.
   */
  heroBannerSwapBioName: boolean;
  /**
   * Editorial rail only: place the description under the portrait instead of under the headline.
   */
  heroEditorialRailBioUnderPortrait: boolean;
  /**
   * Editorial rail only: place name + specialty under the portrait as a dash list.
   * When on, bio returns to the left column (overrides bio-under-portrait) with a larger size.
   */
  heroEditorialRailIdentityUnderPortrait: boolean;
  /**
   * Editorial rail only: which tools to show under Best tools (max 4).
   * Empty → first tools from the profile (up to 4).
   */
  heroEditorialRailSelectedTools: string[];
  /**
   * Editorial rail only: show Start a project / View project CTAs under the bio.
   */
  heroEditorialRailShowCta: boolean;
  /**
   * Statement CTA only: show a rounded profile portrait in the center mid band.
   * When on, CTAs automatically move under the bio (right column).
   */
  heroStatementCtaCenterPortrait: boolean;
  /**
   * Statement CTA only: Instagram-style principal ring around the center portrait (gap from image).
   */
  heroStatementCtaPortraitRing: boolean;
  /**
   * Statement CTA only: center portrait size scale (100 = medium, up to 180 ≈ XL).
   */
  heroStatementCtaPortraitScale: number;
  /**
   * Statement CTA only: independent horizontal cover rectangle (not profile avatar, not portrait).
   */
  heroStatementCtaCenterCover: boolean;
  /**
   * Statement CTA only: image URL for the horizontal cover rectangle.
   */
  heroStatementCtaCoverImageUrl: string;
  /**
   * Left portrait only: underline + principal-color highlight on the specialty in the headline.
   */
  heroLeftPortraitSpecialtyMark: boolean;
  /**
   * Circle portrait only: principal-color highlight on the specialty in the headline.
   */
  heroCirclePortraitSpecialtyMark: boolean;
  /**
   * Circle portrait only: when false (default), title sits at the bottom.
   * When true via the “Titre en haut” toggle, title returns above bio/CTAs.
   */
  heroCirclePortraitTitleBottom: boolean;
  /**
   * Experience split only: when true (default), years/bio sits to the right of
   * the portrait and the title + image block sits left (two-column layout).
   */
  heroExperienceSplitBioRight: boolean;
  /**
   * Experience split only: subtle full frame around the hero content using the
   * Bordure palette token.
   */
  heroExperienceSplitGlobalFrame: boolean;
  /**
   * Editorial overlap only: landscape stage image (not the profile avatar).
   */
  heroEditorialOverlapImageUrl: string;
  /**
   * Editorial overlap only: serif headline inside the scooped text panel.
   * Empty = greeting with real name.
   */
  heroEditorialOverlapHeadline: string;
  /**
   * Editorial overlap only: stage / image frame width.
   */
  heroEditorialOverlapWidth: 'medium' | 'large' | 'full';
  /**
   * Editorial overlap only: horizontal placement of the stage.
   */
  heroEditorialOverlapAlign: 'left' | 'center' | 'right';
  /**
   * Selected works banner only: dark overlay on thumbnails (0–80%).
   */
  heroSelectedWorksDimIntensity: number;
  /**
   * Selected works banner only: identity block layout (split columns vs centered title).
   */
  heroSelectedWorksIdentityLayout: PortfolioHeroSelectedWorksIdentityLayout;
  /**
   * All banner designs: free text in a framed band under the hero composition.
   */
  heroPortraitIdentityBottomText: string;
  /** Bottom frame width. */
  heroPortraitIdentityBottomWidth: 'medium' | 'large' | 'full';
  /** Bottom frame horizontal placement. */
  heroPortraitIdentityBottomAlign: 'left' | 'center' | 'right';
  /** Bottom free-text font size in px. */
  heroPortraitIdentityBottomFontSizePx: number;
  /** Small label above the bottom free text. */
  heroPortraitIdentityBottomLabel: string;
  /** Legacy: bottom frame border (unused — no border by default). */
  heroPortraitIdentityBottomShowBorder: boolean;
  /**
   * Bottom frame background hex.
   * Empty = Fond palette color.
   */
  heroPortraitIdentityBottomBgColor: string;
  /** Spacing above the bottom frame. */
  heroPortraitIdentityBottomGap: PortfolioHeroPortraitIdentityBottomGap;
  /**
   * Identity index only: portrait at the bottom-right, aligned with the
   * description on the left. Uses the profile photo.
   */
  heroIdentityIndexShowPortrait: boolean;
  /**
   * Identity index only (when portrait is on): swap bio ↔ portrait placement.
   */
  heroIdentityIndexSwapBioPortrait: boolean;
  /**
   * Identity index only: portrait corner radius (none / medium / full).
   */
  heroIdentityIndexPortraitRadius: PortfolioHeroIdentityIndexPortraitRadius;
  /**
   * Identity index only: full-width media frame below all other hero content.
   */
  heroIdentityIndexShowBottomMedia: boolean;
  /**
   * Identity index only: photo or video URL for the bottom media frame.
   */
  heroIdentityIndexBottomMediaUrl: string;
  /**
   * Studio split only: small eyebrow label above the headline (e.g. Portfolio).
   */
  heroStudioSplitEyebrow: string;
  /**
   * Studio split only: photo/video for the large rounded frame under the copy.
   */
  heroStudioSplitMediaUrl: string;
  /**
   * Studio split only: optional caption chip inside the media frame.
   */
  heroStudioSplitMediaCaption: string;
  /**
   * Studio split only: media frame width (medium / large / full).
   */
  heroStudioSplitMediaWidth: 'medium' | 'large' | 'full';
  /**
   * Work duo only: up to 2 portfolio post IDs for the Selected work cards.
   * Empty = first 2 posts with media.
   */
  heroWorkDuoSelectedWorkIds: string[];
  /**
   * Bowl intro only: decorative motif behind the portrait.
   */
  heroBowlIntroMotif: PortfolioHeroBowlIntroMotif;
  /**
   * When true, hero banner images / media render in noir & blanc (grayscale).
   */
  heroImageGrayscale: boolean;
  heroLayoutFlipped: boolean;
  /** How the copy group and visual group share the hero screen. */
  heroLayoutDivision: HeroLayoutDivision;
  /**
   * When true, empty Copy / Visual (or columns-3 slots) are omitted automatically
   * so the remaining part can use the full screen.
   */
  heroHideEmptyDivisionParts: boolean;
  /**
   * Vertical / columns-3: space in px between frames (vertical stack or columns).
   */
  heroVerticalFrameGapPx: number;
  /**
   * columns-3 only: left→right (desktop) / top→bottom (mobile) order of the three peers.
   */
  heroColumns3Order: HeroColumns3Slot[];
  /**
   * columns-3 only: relative width of the middle column (tenths of fr, sides stay 1fr).
   */
  heroColumns3MiddleWeight: number;
  /**
   * columns-3 only: vertical align of each peer column’s native block on xl+.
   */
  heroColumns3SlotVertical: Record<HeroColumns3Slot, HeroColumns3VerticalAlign>;
  /**
   * Vertical divisions only: 1–3 columns on xl+ screens,
   * with per-element column slots for copy / visual units.
   */
  heroUltraWideColumns: HeroUltraWideColumnLayout;
  /**
   * Per copy element: margin top/bottom + above/below stats (vertical).
   */
  heroCopyElementsLayout: HeroCopyElementsLayout;
  /**
   * Vertical divisions only: 3×3 anchor of the free zone inside the visual
   * frame, hosting copy elements whose statsSide is 'free-zone'.
   */
  heroVisualFreeCell: HeroVerticalCellPlacement;
  motifShape: PortfolioHeroMotifShape;
  motifLayout: PortfolioHeroMotifLayout;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  headlineFont: PortfolioHeroHeadlineFont;
  ctaDesign: PortfolioHeroCtaDesign;
  ctaPlacement: PortfolioHeroCtaPlacement;
  /** Show a phone glyph beside the Contact me label. */
  showCtaIcon: boolean;
  /** Phone glyph variant for the Contact me CTA. */
  ctaIcon: PortfolioHeroCtaIcon;
  /** Secondary button next to the contact CTA, pointing to a selectable section. */
  showSecondaryCta: boolean;
  secondaryCtaLabel: string;
  secondaryCtaTarget: PortfolioHeroSecondaryCtaTarget;
  secondaryCtaDesign: PortfolioHeroCtaDesign;
  availabilityDesign: PortfolioHeroAvailabilityDesign;
  availabilityPlacement: PortfolioHeroAvailabilityPlacement;
  /** When false, the availability badge is hidden on all breakpoints. */
  showAvailabilityBadge: boolean;
  /** Append “ · replies …” on the availability badge. */
  showAvailabilityResponseTime: boolean;
  /** Mobile/tablet (below xl) placement — independent from desktop. */
  mobileAvailabilityPlacement: PortfolioHeroAvailabilityPlacement;
  /** Mobile/tablet (below xl) alignment for the availability badge. */
  mobileAvailabilityAlign: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the headline. */
  mobileAlignHeadline: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the pitch / description. */
  mobileAlignDescription: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the tools icon row. */
  mobileAlignTools: PortfolioHeroMobileAlign;
  /** Mobile/tablet (below xl) alignment for the contact CTA. */
  mobileAlignCta: PortfolioHeroMobileAlign;
  /** Desktop (xl+) alignment for the availability badge — 'auto' follows the layout. */
  desktopAvailabilityAlign: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the headline — 'auto' follows the layout. */
  desktopAlignHeadline: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the pitch / description — 'auto' follows the layout. */
  desktopAlignDescription: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the tools icon row — 'auto' follows the layout. */
  desktopAlignTools: PortfolioHeroDesktopAlign;
  /** Desktop (xl+) alignment for the contact CTA — 'auto' follows the layout. */
  desktopAlignCta: PortfolioHeroDesktopAlign;
  /** One-time migration marker — bumped when the stacked-align defaults change. */
  mobileAlignSettingsRevision: number;
  selectedTools: string[];
  /** Visual treatment for the selected tools. Icons preserves the legacy chips. */
  toolsDisplayDesign: PortfolioHeroToolsDisplayDesign;
  /** Show a caption above the software icon row. */
  showToolsLabel: boolean;
  /** Custom tools caption — empty falls back to “Preferred tools”. */
  toolsLabelText: string;
  /** Spaced chips vs overlapping circular stack. */
  toolsIconArrangement: 'spaced' | 'stacked';
  /** Contact CTA surface (background + border) — editable under Typography. */
  ctaBackgroundEnabled: boolean;
  ctaBackgroundColor: string;
  ctaBorderEnabled: boolean;
  ctaBorderColor: string;
  ctaBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  ctaBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  /** When false, each tool glyph sits without a filled chip / white plate. */
  toolsIconBackgroundEnabled: boolean;
  /** Tools icon chip surface — editable under Typography. */
  toolsIconBackgroundColor: string;
  toolsIconBorderColor: string;
  toolsIconBorderWidth: PortfolioHeroAvailabilityBorderWidth;
  toolsIconBorderRadius: PortfolioHeroAvailabilityBorderRadius;
  /** Glyph pixel size inside each tools chip. */
  toolsIconSizePx: number;
  /** Inner padding around the glyph (chip grows with size + padding×2). */
  toolsIconPaddingPx: number;
  /** Space between tool icons. */
  toolsIconGapPx: number;
  /** Outer margin on each tool chip. */
  toolsIconMarginPx: number;
  toolsCardGapPx: number;
  toolsCardMarginTopPx: number;
  toolsCardMarginBottomPx: number;
  toolsCardBackgroundEnabled: boolean;
  toolsCardBackgroundColor: string;
  toolsCardBorderEnabled: boolean;
  toolsCardBorderColor: string;
  toolsCardBorderWidthPx: number;
  toolsCardRadiusPx: number;
  toolsCardMinHeightPx: number;
  toolsCardWidthPx: number;
  toolsCardPaddingPx: number;
  toolsCardsPerRow: PortfolioHeroToolsCardsPerRow;
  toolsCardsLimit: PortfolioHeroToolsCardsLimit;
  toolsCardContentGapPx: number;
  toolsCardContentAlignment: PortfolioHeroToolsCardContentAlignment;
  toolsCardIconPlacement: PortfolioHeroToolsCardIconPlacement;
  toolsCardShowIcon: boolean;
  toolsCardShowTitle: boolean;
  toolsCardShowDescription: boolean;
  toolsCardShowLevel: boolean;
  /** Multi-motif layers (shapes + patterns) with mobile/desktop visibility. */
  heroMotifs: HeroMotifInstance[];
} & PortfolioHeroAvailabilityChromeSettings &
  PortfolioHeroProfileSettings &
  PortfolioHeroMetaSettings &
  PortfolioHeroLeftMotifSettings &
  PortfolioHeroCopySettings &
  PortfolioHeroHeadlineSettings &
  PortfolioHeroBackgroundSettings & {
    /** Unified typography for hero text elements (no duplicate scalar color/size fields). */
    elementStyles: PortfolioHeroElementStyles;
    /** Semantic Hero color tokens — elements bind via colorBindings. */
    palette: PortfolioHeroPalette;
    /** Which palette token each Hero color slot uses. */
    colorBindings: PortfolioHeroColorBindings;
    /**
     * When true (default), Hero hex fields stay synced from the semantic palette.
     * When false, color pickers edit hex values directly (manual mode).
     */
    useHeroPalette: boolean;
    /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
    colorModeOverride: PortfolioSectionColorMode;
  };

const HERO_TOOLS_ICON_SIZE_PX_MIN = 12;
const HERO_TOOLS_ICON_SIZE_PX_MAX = 64;
const HERO_TOOLS_ICON_PADDING_PX_MIN = 0;
const HERO_TOOLS_ICON_PADDING_PX_MAX = 28;
const HERO_TOOLS_ICON_GAP_PX_MIN = 0;
const HERO_TOOLS_ICON_GAP_PX_MAX = 40;
const HERO_TOOLS_ICON_MARGIN_PX_MIN = 0;
const HERO_TOOLS_ICON_MARGIN_PX_MAX = 24;
const HERO_TOOLS_CARD_GAP_PX_MIN = 0;
const HERO_TOOLS_CARD_GAP_PX_MAX = 48;
const HERO_TOOLS_CARD_MARGIN_PX_MIN = 0;
const HERO_TOOLS_CARD_MARGIN_PX_MAX = 96;
const HERO_TOOLS_CARD_BORDER_WIDTH_PX_MIN = 0;
const HERO_TOOLS_CARD_BORDER_WIDTH_PX_MAX = 8;
const HERO_TOOLS_CARD_RADIUS_PX_MIN = 0;
const HERO_TOOLS_CARD_RADIUS_PX_MAX = 48;
const HERO_TOOLS_CARD_CONTENT_GAP_PX_MIN = 0;
const HERO_TOOLS_CARD_CONTENT_GAP_PX_MAX = 40;
const HERO_TOOLS_CARD_MIN_HEIGHT_PX_MIN = 96;
const HERO_TOOLS_CARD_MIN_HEIGHT_PX_MAX = 360;
const HERO_TOOLS_CARD_WIDTH_PX_MIN = 160;
const HERO_TOOLS_CARD_WIDTH_PX_MAX = 420;
const HERO_TOOLS_CARD_PADDING_PX_MIN = 8;
const HERO_TOOLS_CARD_PADDING_PX_MAX = 48;

function sanitizeHeroToolsCardNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function sanitizeHeroToolsCardGapPx(value: unknown, fallback = 16): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_GAP_PX_MIN,
    HERO_TOOLS_CARD_GAP_PX_MAX
  );
}

function sanitizeHeroToolsCardMarginPx(value: unknown, fallback = 0): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_MARGIN_PX_MIN,
    HERO_TOOLS_CARD_MARGIN_PX_MAX
  );
}

function sanitizeHeroToolsCardBorderWidthPx(value: unknown, fallback = 1): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_BORDER_WIDTH_PX_MIN,
    HERO_TOOLS_CARD_BORDER_WIDTH_PX_MAX
  );
}

function sanitizeHeroToolsCardRadiusPx(value: unknown, fallback = 16): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_RADIUS_PX_MIN,
    HERO_TOOLS_CARD_RADIUS_PX_MAX
  );
}

function sanitizeHeroToolsCardContentGapPx(value: unknown, fallback = 12): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_CONTENT_GAP_PX_MIN,
    HERO_TOOLS_CARD_CONTENT_GAP_PX_MAX
  );
}

function sanitizeHeroToolsCardMinHeightPx(value: unknown, fallback = 208): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_MIN_HEIGHT_PX_MIN,
    HERO_TOOLS_CARD_MIN_HEIGHT_PX_MAX
  );
}

function sanitizeHeroToolsCardWidthPx(value: unknown, fallback = 260): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_WIDTH_PX_MIN,
    HERO_TOOLS_CARD_WIDTH_PX_MAX
  );
}

function sanitizeHeroToolsCardPaddingPx(value: unknown, fallback = 24): number {
  return sanitizeHeroToolsCardNumber(
    value,
    fallback,
    HERO_TOOLS_CARD_PADDING_PX_MIN,
    HERO_TOOLS_CARD_PADDING_PX_MAX
  );
}

function sanitizeHeroToolsIconSizePx(value: unknown, fallback = 28): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(HERO_TOOLS_ICON_SIZE_PX_MAX, Math.max(HERO_TOOLS_ICON_SIZE_PX_MIN, Math.round(n)));
}

function sanitizeHeroToolsIconPaddingPx(value: unknown, fallback = 10): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_TOOLS_ICON_PADDING_PX_MAX,
    Math.max(HERO_TOOLS_ICON_PADDING_PX_MIN, Math.round(n))
  );
}

function sanitizeHeroToolsIconGapPx(value: unknown, fallback = 10): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(HERO_TOOLS_ICON_GAP_PX_MAX, Math.max(HERO_TOOLS_ICON_GAP_PX_MIN, Math.round(n)));
}

function sanitizeHeroToolsIconMarginPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_TOOLS_ICON_MARGIN_PX_MAX,
    Math.max(HERO_TOOLS_ICON_MARGIN_PX_MIN, Math.round(n))
  );
}

/** Matches DEFAULT_HERO_PALETTE.bordure (default Motif token). */
const DEFAULT_HERO_MOTIF_COLOR = '#2a2a30';

/**
 * v1: stacked hero copy (below xl) centers every element by default.
 * Bump when the stacked-align defaults change to re-run the one-time reset.
 */
const HERO_MOBILE_ALIGN_SETTINGS_REVISION = 1;

const DEFAULT_HERO_MOTIFS: HeroMotifInstance[] = migrateLegacyHeroMotifs({
  motifShape: 'diagonal',
  motifColor: DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
  motifPosition: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  motifPanelSize: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  heroMotifOpacity: 100,
  ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
});

export const DEFAULT_HERO_PRESENTATION: PortfolioHeroPresentationSettings = {
  heroBannerDesign: 'swiss-editorial',
  heroSignatureWord: '',
  heroCurrentlyLabel: 'Currently',
  heroSpecializedInLabel: 'Specialized in',
  heroBannerSwapBioName: false,
  heroEditorialRailBioUnderPortrait: false,
  heroEditorialRailIdentityUnderPortrait: false,
  heroEditorialRailSelectedTools: [],
  heroEditorialRailShowCta: false,
  heroStatementCtaCenterPortrait: true,
  heroStatementCtaPortraitRing: false,
  heroStatementCtaPortraitScale: 125,
  heroStatementCtaCenterCover: false,
  heroStatementCtaCoverImageUrl: '',
  heroLeftPortraitSpecialtyMark: false,
  heroCirclePortraitSpecialtyMark: false,
  heroCirclePortraitTitleBottom: true,
  heroExperienceSplitBioRight: true,
  heroExperienceSplitGlobalFrame: false,
  heroEditorialOverlapImageUrl: '',
  heroEditorialOverlapHeadline: '',
  heroEditorialOverlapWidth: 'full',
  heroEditorialOverlapAlign: 'left',
  heroSelectedWorksDimIntensity: 40,
  heroSelectedWorksIdentityLayout: 'split',
  heroPortraitIdentityBottomText: '',
  heroPortraitIdentityBottomWidth: 'large',
  heroPortraitIdentityBottomAlign: 'left',
  heroPortraitIdentityBottomFontSizePx: 18,
  heroPortraitIdentityBottomLabel: '',
  heroPortraitIdentityBottomShowBorder: false,
  heroPortraitIdentityBottomBgColor: '',
  heroPortraitIdentityBottomGap: 'medium',
  heroIdentityIndexShowPortrait: false,
  heroIdentityIndexSwapBioPortrait: false,
  heroIdentityIndexPortraitRadius: 'none',
  heroIdentityIndexShowBottomMedia: false,
  heroIdentityIndexBottomMediaUrl: '',
  heroStudioSplitEyebrow: 'Portfolio',
  heroStudioSplitMediaUrl: '',
  heroStudioSplitMediaCaption: 'Selected work',
  heroStudioSplitMediaWidth: 'full',
  heroWorkDuoSelectedWorkIds: [],
  heroBowlIntroMotif: 'bowl',
  heroImageGrayscale: false,
  heroLayoutFlipped: false,
  heroLayoutDivision: DEFAULT_HERO_LAYOUT_DIVISION,
  heroHideEmptyDivisionParts: false,
  heroVerticalFrameGapPx: DEFAULT_HERO_VERTICAL_FRAME_GAP_PX,
  heroColumns3Order: [...DEFAULT_HERO_COLUMNS_3_ORDER],
  heroColumns3MiddleWeight: DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT,
  heroColumns3SlotVertical: { ...DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL },
  heroUltraWideColumns: {
    ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT,
    copySlots: { ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT.copySlots },
    visualSlots: { ...DEFAULT_HERO_ULTRAWIDE_COLUMN_LAYOUT.visualSlots },
  },
  heroCopyElementsLayout: {
    availability: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.availability },
    headline: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.headline },
    description: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.description },
    tools: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.tools },
    cta: { ...DEFAULT_HERO_COPY_ELEMENTS_LAYOUT.cta },
  },
  heroVisualFreeCell: DEFAULT_HERO_VISUAL_FREE_CELL,
  motifShape: 'diagonal',
  motifLayout: 'centered',
  motifColor: DEFAULT_HERO_MOTIF_COLOR,
  customMotifPoints: DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
  motifPosition: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  motifPanelSize: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  headlineFont: 'sans',
  ctaDesign: 'pill-dark',
  ctaPlacement: 'below-tools',
  showCtaIcon: true,
  ctaIcon: 'phone',
  showSecondaryCta: true,
  secondaryCtaLabel: DEFAULT_HERO_SECONDARY_CTA_LABEL,
  secondaryCtaTarget: 'work',
  secondaryCtaDesign: 'text-arrow',
  availabilityDesign: 'pill-live',
  availabilityPlacement: 'above-headline',
  showAvailabilityBadge: true,
  showAvailabilityResponseTime: false,
  mobileAvailabilityPlacement: 'above-headline',
  mobileAvailabilityAlign: 'center',
  mobileAlignHeadline: 'center',
  mobileAlignDescription: 'center',
  mobileAlignTools: 'center',
  mobileAlignCta: 'center',
  desktopAvailabilityAlign: 'auto',
  desktopAlignHeadline: 'auto',
  desktopAlignDescription: 'auto',
  desktopAlignTools: 'auto',
  desktopAlignCta: 'auto',
  mobileAlignSettingsRevision: HERO_MOBILE_ALIGN_SETTINGS_REVISION,
  ...DEFAULT_HERO_AVAILABILITY_CHROME,
  selectedTools: [],
  toolsDisplayDesign: 'icons',
  showToolsLabel: false,
  toolsLabelText: '',
  toolsIconArrangement: 'spaced',
  ctaBackgroundEnabled: false,
  ctaBackgroundColor: '#0a0a0a',
  ctaBorderEnabled: false,
  ctaBorderColor: '#ffffff',
  ctaBorderWidth: 'thin',
  ctaBorderRadius: 'full',
  toolsIconBackgroundEnabled: true,
  toolsIconBackgroundColor: '#262626',
  toolsIconBorderColor: '#3a3733',
  toolsIconBorderWidth: 'thin',
  toolsIconBorderRadius: 'full',
  toolsIconSizePx: 28,
  toolsIconPaddingPx: 10,
  toolsIconGapPx: 10,
  toolsIconMarginPx: 0,
  toolsCardGapPx: 16,
  toolsCardMarginTopPx: 0,
  toolsCardMarginBottomPx: 0,
  toolsCardBackgroundEnabled: true,
  toolsCardBackgroundColor: '#ffffff',
  toolsCardBorderEnabled: true,
  toolsCardBorderColor: '#e5e5e5',
  toolsCardBorderWidthPx: 1,
  toolsCardRadiusPx: 16,
  toolsCardMinHeightPx: 208,
  toolsCardWidthPx: 260,
  toolsCardPaddingPx: 24,
  toolsCardsPerRow: 2,
  toolsCardsLimit: 4,
  toolsCardContentGapPx: 12,
  toolsCardContentAlignment: 'center',
  toolsCardIconPlacement: 'top',
  toolsCardShowIcon: true,
  toolsCardShowTitle: true,
  toolsCardShowDescription: true,
  toolsCardShowLevel: true,
  heroMotifs: DEFAULT_HERO_MOTIFS.map((motif) => ({
    ...motif,
    points: motif.points.map((point) => ({ ...point })),
    visibility: { ...motif.visibility },
  })),
  ...DEFAULT_HERO_PROFILE_SETTINGS,
  ...DEFAULT_HERO_META_SETTINGS,
  ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  ...DEFAULT_HERO_COPY_SETTINGS,
  ...DEFAULT_HERO_HEADLINE_SETTINGS,
  ...DEFAULT_HERO_BACKGROUND_SETTINGS,
  elementStyles: DEFAULT_HERO_ELEMENT_STYLES,
  palette: { ...DEFAULT_HERO_PALETTE },
  colorBindings: { ...DEFAULT_HERO_COLOR_BINDINGS },
  useHeroPalette: true,
  colorModeOverride: 'auto',
};

function isHeroAvailabilityPlacement(
  value: unknown
): value is PortfolioHeroAvailabilityPlacement {
  return (
    value === 'above-headline' ||
    value === 'below-headline' ||
    value === 'below-description' ||
    value === 'above-tools' ||
    value === 'below-tools' ||
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right' ||
    value === 'above-portrait'
  );
}

function isHeroMobileAlign(value: unknown): value is PortfolioHeroMobileAlign {
  return value === 'left' || value === 'center' || value === 'right';
}

function isHeroDesktopAlign(value: unknown): value is PortfolioHeroDesktopAlign {
  return value === 'auto' || isHeroMobileAlign(value);
}

function sanitizeAvailabilityHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())) {
    return value.trim();
  }
  return fallback;
}

function mergeHeroAvailabilityChrome(
  base: PortfolioHeroAvailabilityChromeSettings,
  record: Record<string, unknown>
): PortfolioHeroAvailabilityChromeSettings {
  const borderWidth = record.availabilityBorderWidth;
  const borderRadius = record.availabilityBorderRadius;
  const dotSize = record.availabilityDotSize;

  return {
    availabilityLabel:
      typeof record.availabilityLabel === 'string' && record.availabilityLabel.trim()
        ? record.availabilityLabel.trim()
        : base.availabilityLabel,
    availabilityUnavailableLabel:
      typeof record.availabilityUnavailableLabel === 'string' &&
      record.availabilityUnavailableLabel.trim()
        ? record.availabilityUnavailableLabel.trim()
        : base.availabilityUnavailableLabel,
    availabilityTextColor: sanitizeAvailabilityHex(
      record.availabilityTextColor,
      base.availabilityTextColor
    ),
    availabilityBackgroundColor: sanitizeAvailabilityHex(
      record.availabilityBackgroundColor,
      base.availabilityBackgroundColor
    ),
    availabilityBorderColor: sanitizeAvailabilityHex(
      record.availabilityBorderColor,
      base.availabilityBorderColor
    ),
    availabilityBorderWidth:
      borderWidth === 'none' ||
      borderWidth === 'thin' ||
      borderWidth === 'medium' ||
      borderWidth === 'thick'
        ? borderWidth
        : base.availabilityBorderWidth,
    availabilityBorderRadius:
      borderRadius === 'none' ||
      borderRadius === 'sm' ||
      borderRadius === 'md' ||
      borderRadius === 'lg' ||
      borderRadius === 'full'
        ? borderRadius
        : base.availabilityBorderRadius,
    availabilityShowDot:
      typeof record.availabilityShowDot === 'boolean'
        ? record.availabilityShowDot
        : base.availabilityShowDot,
    availabilityDotColor: sanitizeAvailabilityHex(
      record.availabilityDotColor,
      base.availabilityDotColor
    ),
    availabilityDotSize:
      dotSize === 'sm' || dotSize === 'md' || dotSize === 'lg' ? dotSize : base.availabilityDotSize,
    availabilityDotPulse:
      typeof record.availabilityDotPulse === 'boolean'
        ? record.availabilityDotPulse
        : base.availabilityDotPulse,
    availabilityUnavailableTextColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableTextColor,
      base.availabilityUnavailableTextColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR
    ),
    availabilityUnavailableBackgroundColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableBackgroundColor,
      base.availabilityUnavailableBackgroundColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR
    ),
    availabilityUnavailableBorderColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableBorderColor,
      base.availabilityUnavailableBorderColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR
    ),
    availabilityUnavailableDotColor: sanitizeAvailabilityHex(
      record.availabilityUnavailableDotColor,
      base.availabilityUnavailableDotColor ?? DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR
    ),
    availabilityMarginTopPx: sanitizeAvailabilityMarginPx(
      record.availabilityMarginTopPx !== undefined
        ? record.availabilityMarginTopPx
        : base.availabilityMarginTopPx,
      DEFAULT_AVAILABILITY_MARGIN_TOP_PX
    ),
    availabilityMarginBottomPx: sanitizeAvailabilityMarginPx(
      record.availabilityMarginBottomPx !== undefined
        ? record.availabilityMarginBottomPx
        : base.availabilityMarginBottomPx,
      DEFAULT_AVAILABILITY_MARGIN_BOTTOM_PX
    ),
  };
}

function isValidHeroMotifColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

export function resolveHeroTools(allTools: string[], selectedTools: string[], max = 6): string[] {
  const normalized = Array.from(new Set(allTools.map((item) => item.trim()).filter(Boolean)));
  if (selectedTools.length === 0) return normalized.slice(0, max);
  const picked = selectedTools
    .map((item) => item.trim())
    .filter((item) => normalized.includes(item));
  return (picked.length > 0 ? picked : normalized).slice(0, max);
}

function getHeroGeomMetrics(layout: PortfolioHeroMotifLayout = 'centered') {
  if (layout === 'full') {
    return {
      marginVh: 0,
      panelHeightVh: 100,
      motifBottom: '100vh',
    };
  }

  return {
    marginVh: HERO_GEOM_CENTERED_MARGIN_VH,
    panelHeightVh: HERO_GEOM_CENTERED_PANEL_HEIGHT_VH,
    motifBottom: `${HERO_GEOM_CENTERED_MARGIN_VH + HERO_GEOM_CENTERED_PANEL_HEIGHT_VH}vh`,
  };
}

export function heroGeomLayerPositionStyle(
  layout: PortfolioHeroMotifLayout = 'centered'
): import('react').CSSProperties {
  const { marginVh, panelHeightVh } = getHeroGeomMetrics(layout);
  return {
    top: `${marginVh}vh`,
    height: `${panelHeightVh}vh`,
    maxHeight: `${panelHeightVh}vh`,
  };
}

/** Build a complete presentation object from stored hero settings (avoids omitting new fields). */
export function pickHeroPresentationSettings(
  hero: Partial<PortfolioHeroPresentationSettings> | unknown
): PortfolioHeroPresentationSettings {
  return mergeHeroPresentation(DEFAULT_HERO_PRESENTATION, hero);
}

export function mergeHeroPresentation(
  base: PortfolioHeroPresentationSettings,
  patch: unknown
): PortfolioHeroPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const shape = record.motifShape;
  const motifLayout = record.motifLayout;
  const headlineFont = record.headlineFont;
  const ctaDesign = record.ctaDesign;
  const ctaPlacement = record.ctaPlacement;
  const availabilityDesign = record.availabilityDesign;
  const availabilityPlacement = record.availabilityPlacement;
  const motifColor =
    typeof record.motifColor === 'string' && isValidHeroMotifColor(record.motifColor)
      ? record.motifColor.trim()
      : base.motifColor;

  let selectedTools = base.selectedTools;
  if (Array.isArray(record.selectedTools)) {
    selectedTools = record.selectedTools.filter((item): item is string => typeof item === 'string');
  }

  const motifPanelSize = sanitizeMotifPanelSize(record.motifPanelSize, base.motifPanelSize, 'right');
  const layoutDivision = sanitizeHeroLayoutDivision(
    record.heroLayoutDivision,
    typeof record.heroLayoutFlipped === 'boolean'
      ? record.heroLayoutFlipped
        ? 'horizontal-copy-right'
        : 'horizontal-copy-left'
      : base.heroLayoutDivision ?? DEFAULT_HERO_LAYOUT_DIVISION
  );
  const visualMotifEdge = layoutDivision === 'horizontal-copy-right' ? 'left' : 'right';
  const motifPosition = normalizeMotifPositionForContentFrame(
    sanitizeMotifPanelPosition(record.motifPosition, base.motifPosition, 'right', motifPanelSize),
    motifPanelSize,
    visualMotifEdge
  );

  const leftMerged = mergeHeroLeftMotifSettings(base, patch);
  const backgroundMerged = mergeHeroBackgroundSettings(base, patch);
  const profileMerged = mergeHeroProfileSettings(base, patch);
  const metaMerged = mergeHeroMetaSettings(base, patch);
  const availabilityMerged = mergeHeroAvailabilityChrome(base, record);
  const copyMerged = mergeHeroCopySettings(base, patch);
  const headlineMerged = mergeHeroHeadlineSettings(base, patch);

  const heroMotifs = mergeHeroMotifsSettings(base.heroMotifs ?? [], patch, {
    motifShape:
      shape === 'diagonal' ||
      shape === 'triangle' ||
      shape === 'trapezoid' ||
      shape === 'block' ||
      shape === 'chevron' ||
      shape === 'prism' ||
      shape === 'custom'
        ? shape
        : base.motifShape,
    motifColor,
    customMotifPoints: sanitizeMotifPoints(
      record.customMotifPoints !== undefined ? record.customMotifPoints : base.customMotifPoints
    ),
    motifPosition,
    motifPanelSize,
    heroMotifOpacity: backgroundMerged.heroMotifOpacity,
    leftMotifEnabled: leftMerged.leftMotifEnabled,
    leftMotifPattern: leftMerged.leftMotifPattern,
    leftMotifColor: leftMerged.leftMotifColor,
    leftMotifOpacity: leftMerged.leftMotifOpacity,
    leftMotifPosition: leftMerged.leftMotifPosition,
    leftMotifSize: leftMerged.leftMotifSize,
    leftCustomMotifPoints: leftMerged.leftCustomMotifPoints,
  });

  const legacyFromMotifs = syncLegacyFieldsFromHeroMotifs(heroMotifs);
  // Prefer explicit motif array as source of truth when present; otherwise keep merged scalars.
  const hasMotifsPatch = Array.isArray((record as { heroMotifs?: unknown }).heroMotifs);
  const syncedLegacy = hasMotifsPatch
    ? legacyFromMotifs
    : {
        motifShape:
          shape === 'diagonal' ||
          shape === 'triangle' ||
          shape === 'trapezoid' ||
          shape === 'block' ||
          shape === 'chevron' ||
          shape === 'prism' ||
          shape === 'custom'
            ? shape
            : base.motifShape,
        motifColor,
        customMotifPoints: sanitizeMotifPoints(
          record.customMotifPoints !== undefined ? record.customMotifPoints : base.customMotifPoints
        ),
        motifPosition,
        motifPanelSize,
        leftMotifEnabled: leftMerged.leftMotifEnabled,
        leftMotifPattern: leftMerged.leftMotifPattern,
        leftMotifColor: leftMerged.leftMotifColor,
        leftMotifOpacity: leftMerged.leftMotifOpacity,
        leftMotifPosition: leftMerged.leftMotifPosition,
        leftMotifSize: leftMerged.leftMotifSize,
        leftCustomMotifPoints: leftMerged.leftCustomMotifPoints,
      };

  const typographyContext = {
    creatorNameColor: profileMerged.creatorNameColor,
    creatorNameSize: profileMerged.creatorNameSize,
    creatorNameFont: profileMerged.creatorNameFont,
    metaValueColor: metaMerged.metaValueColor,
    metaLabelColor: metaMerged.metaLabelColor,
    metaValueSize: metaMerged.metaValueSize,
    availabilityTextColor: availabilityMerged.availabilityTextColor,
  };

  const hasElementStylesPatch = record.elementStyles !== undefined;
  const hasLegacyTypographyPatch =
    'creatorNameColor' in record ||
    'creatorNameSize' in record ||
    'creatorNameFont' in record ||
    'metaValueColor' in record ||
    'metaLabelColor' in record ||
    'metaValueSize' in record ||
    'availabilityTextColor' in record;

  let elementStyles = normalizeHeroElementStyles(
    hasElementStylesPatch ? record.elementStyles : base.elementStyles,
    typographyContext
  );

  if (hasLegacyTypographyPatch && !hasElementStylesPatch) {
    elementStyles = syncHeroElementStylesFromLegacyPatch(elementStyles, patch, {
      ...base,
      ...profileMerged,
      ...metaMerged,
      ...availabilityMerged,
      ...copyMerged,
      ...headlineMerged,
      elementStyles,
    });
  }

  const typographyLegacySync = hasElementStylesPatch
    ? syncHeroLegacyTypographyFromElementStyles(elementStyles)
    : {};

  const merged: PortfolioHeroPresentationSettings = {
    heroBannerDesign: normalizePortfolioHeroBannerDesign(
      record.heroBannerDesign ?? base.heroBannerDesign ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN
    ),
    heroSignatureWord:
      typeof record.heroSignatureWord === 'string'
        ? record.heroSignatureWord
        : base.heroSignatureWord ?? '',
    heroCurrentlyLabel:
      typeof record.heroCurrentlyLabel === 'string' && record.heroCurrentlyLabel.trim()
        ? record.heroCurrentlyLabel.trim()
        : base.heroCurrentlyLabel ?? 'Currently',
    heroSpecializedInLabel:
      typeof record.heroSpecializedInLabel === 'string' && record.heroSpecializedInLabel.trim()
        ? record.heroSpecializedInLabel.trim()
        : base.heroSpecializedInLabel ?? 'Specialized in',
    heroBannerSwapBioName: (() => {
      if (typeof record.heroBannerSwapBioName === 'boolean') return record.heroBannerSwapBioName;
      const legacy = (record as { heroPortraitIdentitySwapBioName?: unknown })
        .heroPortraitIdentitySwapBioName;
      if (typeof legacy === 'boolean') return legacy;
      return base.heroBannerSwapBioName ?? false;
    })(),
    heroEditorialRailBioUnderPortrait:
      typeof record.heroEditorialRailBioUnderPortrait === 'boolean'
        ? record.heroEditorialRailBioUnderPortrait
        : base.heroEditorialRailBioUnderPortrait ?? false,
    heroEditorialRailIdentityUnderPortrait:
      typeof record.heroEditorialRailIdentityUnderPortrait === 'boolean'
        ? record.heroEditorialRailIdentityUnderPortrait
        : base.heroEditorialRailIdentityUnderPortrait ?? false,
    heroEditorialRailSelectedTools: Array.isArray(record.heroEditorialRailSelectedTools)
      ? record.heroEditorialRailSelectedTools
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 4)
      : base.heroEditorialRailSelectedTools ?? [],
    heroEditorialRailShowCta:
      typeof record.heroEditorialRailShowCta === 'boolean'
        ? record.heroEditorialRailShowCta
        : base.heroEditorialRailShowCta ?? false,
    heroStatementCtaCenterPortrait: (() => {
      const portrait =
        typeof record.heroStatementCtaCenterPortrait === 'boolean'
          ? record.heroStatementCtaCenterPortrait
          : base.heroStatementCtaCenterPortrait ?? true;
      const cover =
        typeof record.heroStatementCtaCenterCover === 'boolean'
          ? record.heroStatementCtaCenterCover
          : base.heroStatementCtaCenterCover ?? false;
      // Mutual exclusion: never both on — cover wins if both were saved.
      return portrait && !cover;
    })(),
    heroStatementCtaPortraitRing:
      typeof record.heroStatementCtaPortraitRing === 'boolean'
        ? record.heroStatementCtaPortraitRing
        : base.heroStatementCtaPortraitRing ?? false,
    heroStatementCtaPortraitScale: (() => {
      const raw =
        typeof record.heroStatementCtaPortraitScale === 'number'
          ? record.heroStatementCtaPortraitScale
          : base.heroStatementCtaPortraitScale ?? 125;
      if (!Number.isFinite(raw)) return 125;
      return Math.min(180, Math.max(100, Math.round(raw)));
    })(),
    heroStatementCtaCenterCover:
      typeof record.heroStatementCtaCenterCover === 'boolean'
        ? record.heroStatementCtaCenterCover
        : base.heroStatementCtaCenterCover ?? false,
    heroLeftPortraitSpecialtyMark:
      typeof record.heroLeftPortraitSpecialtyMark === 'boolean'
        ? record.heroLeftPortraitSpecialtyMark
        : base.heroLeftPortraitSpecialtyMark ?? false,
    heroCirclePortraitSpecialtyMark:
      typeof record.heroCirclePortraitSpecialtyMark === 'boolean'
        ? record.heroCirclePortraitSpecialtyMark
        : base.heroCirclePortraitSpecialtyMark ?? false,
    heroCirclePortraitTitleBottom:
      typeof record.heroCirclePortraitTitleBottom === 'boolean'
        ? record.heroCirclePortraitTitleBottom
        : base.heroCirclePortraitTitleBottom ?? true,
    heroExperienceSplitBioRight:
      typeof record.heroExperienceSplitBioRight === 'boolean'
        ? record.heroExperienceSplitBioRight
        : base.heroExperienceSplitBioRight ?? true,
    heroExperienceSplitGlobalFrame:
      typeof record.heroExperienceSplitGlobalFrame === 'boolean'
        ? record.heroExperienceSplitGlobalFrame
        : base.heroExperienceSplitGlobalFrame ?? false,
    heroEditorialOverlapImageUrl:
      typeof record.heroEditorialOverlapImageUrl === 'string'
        ? record.heroEditorialOverlapImageUrl.trim()
        : base.heroEditorialOverlapImageUrl ?? '',
    heroEditorialOverlapHeadline:
      typeof record.heroEditorialOverlapHeadline === 'string'
        ? record.heroEditorialOverlapHeadline.trim()
        : base.heroEditorialOverlapHeadline ?? '',
    heroEditorialOverlapWidth:
      record.heroEditorialOverlapWidth === 'medium' ||
      record.heroEditorialOverlapWidth === 'large' ||
      record.heroEditorialOverlapWidth === 'full'
        ? record.heroEditorialOverlapWidth
        : base.heroEditorialOverlapWidth ?? 'full',
    heroEditorialOverlapAlign:
      record.heroEditorialOverlapAlign === 'left' ||
      record.heroEditorialOverlapAlign === 'center' ||
      record.heroEditorialOverlapAlign === 'right'
        ? record.heroEditorialOverlapAlign
        : base.heroEditorialOverlapAlign ?? 'left',
    heroSelectedWorksDimIntensity: (() => {
      const raw =
        typeof record.heroSelectedWorksDimIntensity === 'number'
          ? record.heroSelectedWorksDimIntensity
          : base.heroSelectedWorksDimIntensity ?? 40;
      if (!Number.isFinite(raw)) return 40;
      return Math.min(80, Math.max(0, Math.round(raw)));
    })(),
    heroSelectedWorksIdentityLayout:
      record.heroSelectedWorksIdentityLayout === 'split' ||
      record.heroSelectedWorksIdentityLayout === 'centered'
        ? record.heroSelectedWorksIdentityLayout
        : base.heroSelectedWorksIdentityLayout ?? 'split',
    heroPortraitIdentityBottomText:
      typeof record.heroPortraitIdentityBottomText === 'string'
        ? record.heroPortraitIdentityBottomText
        : base.heroPortraitIdentityBottomText ?? '',
    heroPortraitIdentityBottomWidth:
      record.heroPortraitIdentityBottomWidth === 'medium' ||
      record.heroPortraitIdentityBottomWidth === 'large' ||
      record.heroPortraitIdentityBottomWidth === 'full'
        ? record.heroPortraitIdentityBottomWidth
        : base.heroPortraitIdentityBottomWidth ?? 'large',
    heroPortraitIdentityBottomAlign:
      record.heroPortraitIdentityBottomAlign === 'left' ||
      record.heroPortraitIdentityBottomAlign === 'center' ||
      record.heroPortraitIdentityBottomAlign === 'right'
        ? record.heroPortraitIdentityBottomAlign
        : base.heroPortraitIdentityBottomAlign ?? 'left',
    heroPortraitIdentityBottomFontSizePx: (() => {
      const raw =
        typeof record.heroPortraitIdentityBottomFontSizePx === 'number'
          ? record.heroPortraitIdentityBottomFontSizePx
          : base.heroPortraitIdentityBottomFontSizePx ?? 18;
      if (!Number.isFinite(raw)) return 18;
      return Math.min(48, Math.max(12, Math.round(raw)));
    })(),
    heroPortraitIdentityBottomLabel:
      typeof record.heroPortraitIdentityBottomLabel === 'string'
        ? record.heroPortraitIdentityBottomLabel
        : base.heroPortraitIdentityBottomLabel ?? '',
    heroPortraitIdentityBottomShowBorder:
      typeof record.heroPortraitIdentityBottomShowBorder === 'boolean'
        ? record.heroPortraitIdentityBottomShowBorder
        : base.heroPortraitIdentityBottomShowBorder ?? false,
    heroPortraitIdentityBottomBgColor: (() => {
      const raw =
        typeof record.heroPortraitIdentityBottomBgColor === 'string'
          ? record.heroPortraitIdentityBottomBgColor.trim()
          : base.heroPortraitIdentityBottomBgColor ?? '';
      if (!raw) return '';
      return isValidProfileHexColor(raw) ? raw : '';
    })(),
    heroPortraitIdentityBottomGap:
      record.heroPortraitIdentityBottomGap === 'tight' ||
      record.heroPortraitIdentityBottomGap === 'medium' ||
      record.heroPortraitIdentityBottomGap === 'large' ||
      record.heroPortraitIdentityBottomGap === 'xlarge'
        ? record.heroPortraitIdentityBottomGap
        : base.heroPortraitIdentityBottomGap ?? 'medium',
    heroIdentityIndexShowPortrait:
      typeof record.heroIdentityIndexShowPortrait === 'boolean'
        ? record.heroIdentityIndexShowPortrait
        : base.heroIdentityIndexShowPortrait ?? false,
    heroIdentityIndexSwapBioPortrait:
      typeof record.heroIdentityIndexSwapBioPortrait === 'boolean'
        ? record.heroIdentityIndexSwapBioPortrait
        : base.heroIdentityIndexSwapBioPortrait ?? false,
    heroIdentityIndexPortraitRadius:
      record.heroIdentityIndexPortraitRadius === 'none' ||
      record.heroIdentityIndexPortraitRadius === 'medium' ||
      record.heroIdentityIndexPortraitRadius === 'full'
        ? record.heroIdentityIndexPortraitRadius
        : base.heroIdentityIndexPortraitRadius ?? 'none',
    heroIdentityIndexShowBottomMedia:
      typeof record.heroIdentityIndexShowBottomMedia === 'boolean'
        ? record.heroIdentityIndexShowBottomMedia
        : base.heroIdentityIndexShowBottomMedia ?? false,
    heroIdentityIndexBottomMediaUrl:
      typeof record.heroIdentityIndexBottomMediaUrl === 'string'
        ? record.heroIdentityIndexBottomMediaUrl.trim()
        : base.heroIdentityIndexBottomMediaUrl ?? '',
    heroStudioSplitEyebrow:
      typeof record.heroStudioSplitEyebrow === 'string' && record.heroStudioSplitEyebrow.trim()
        ? record.heroStudioSplitEyebrow.trim()
        : base.heroStudioSplitEyebrow ?? 'Portfolio',
    heroStudioSplitMediaUrl:
      typeof record.heroStudioSplitMediaUrl === 'string'
        ? record.heroStudioSplitMediaUrl.trim()
        : base.heroStudioSplitMediaUrl ?? '',
    heroStudioSplitMediaCaption:
      typeof record.heroStudioSplitMediaCaption === 'string'
        ? record.heroStudioSplitMediaCaption.trim()
        : base.heroStudioSplitMediaCaption ?? 'Selected work',
    heroStudioSplitMediaWidth:
      record.heroStudioSplitMediaWidth === 'medium' ||
      record.heroStudioSplitMediaWidth === 'large' ||
      record.heroStudioSplitMediaWidth === 'full'
        ? record.heroStudioSplitMediaWidth
        : base.heroStudioSplitMediaWidth ?? 'full',
    heroWorkDuoSelectedWorkIds: (() => {
      const raw = Array.isArray(record.heroWorkDuoSelectedWorkIds)
        ? record.heroWorkDuoSelectedWorkIds
        : base.heroWorkDuoSelectedWorkIds;
      if (!Array.isArray(raw)) return [];
      const out: string[] = [];
      for (const item of raw) {
        if (typeof item !== 'string') continue;
        const id = item.trim();
        if (!id || out.includes(id)) continue;
        out.push(id);
        if (out.length >= 2) break;
      }
      return out;
    })(),
    heroBowlIntroMotif: isPortfolioHeroBowlIntroMotif(record.heroBowlIntroMotif)
      ? record.heroBowlIntroMotif
      : base.heroBowlIntroMotif ?? 'bowl',
    heroImageGrayscale:
      typeof record.heroImageGrayscale === 'boolean'
        ? record.heroImageGrayscale
        : base.heroImageGrayscale ?? false,
    heroStatementCtaCoverImageUrl:
      typeof record.heroStatementCtaCoverImageUrl === 'string'
        ? record.heroStatementCtaCoverImageUrl.trim()
        : base.heroStatementCtaCoverImageUrl ?? '',
    heroLayoutFlipped:
      typeof record.heroLayoutFlipped === 'boolean' ? record.heroLayoutFlipped : base.heroLayoutFlipped,
    heroLayoutDivision: sanitizeHeroLayoutDivision(
      record.heroLayoutDivision,
      typeof record.heroLayoutFlipped === 'boolean'
        ? record.heroLayoutFlipped
          ? 'horizontal-copy-right'
          : 'horizontal-copy-left'
        : base.heroLayoutDivision ?? DEFAULT_HERO_LAYOUT_DIVISION
    ),
    heroHideEmptyDivisionParts:
      typeof record.heroHideEmptyDivisionParts === 'boolean'
        ? record.heroHideEmptyDivisionParts
        : base.heroHideEmptyDivisionParts ?? false,
    heroVerticalFrameGapPx: sanitizeHeroVerticalFrameGapPx(
      record.heroVerticalFrameGapPx !== undefined
        ? record.heroVerticalFrameGapPx
        : base.heroVerticalFrameGapPx,
      DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
    ),
    heroColumns3Order: sanitizeHeroColumns3Order(
      record.heroColumns3Order !== undefined
        ? record.heroColumns3Order
        : base.heroColumns3Order,
      DEFAULT_HERO_COLUMNS_3_ORDER
    ),
    heroColumns3MiddleWeight: sanitizeHeroColumns3MiddleWeight(
      record.heroColumns3MiddleWeight !== undefined
        ? record.heroColumns3MiddleWeight
        : base.heroColumns3MiddleWeight,
      DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT
    ),
    heroColumns3SlotVertical: sanitizeHeroColumns3SlotVertical(
      record.heroColumns3SlotVertical !== undefined
        ? record.heroColumns3SlotVertical
        : base.heroColumns3SlotVertical,
      DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL
    ),
    heroUltraWideColumns: sanitizeHeroUltraWideColumnLayout(
      record.heroUltraWideColumns !== undefined
        ? record.heroUltraWideColumns
        : base.heroUltraWideColumns
    ),
    heroCopyElementsLayout: sanitizeHeroCopyElementsLayout(
      record.heroCopyElementsLayout !== undefined
        ? record.heroCopyElementsLayout
        : base.heroCopyElementsLayout
    ),
    heroVisualFreeCell: sanitizeHeroVerticalCellPlacement(
      record.heroVisualFreeCell !== undefined
        ? record.heroVisualFreeCell
        : base.heroVisualFreeCell,
      DEFAULT_HERO_VISUAL_FREE_CELL
    ),
    motifShape: syncedLegacy.motifShape,
    motifLayout:
      motifLayout === 'centered' || motifLayout === 'full' ? motifLayout : base.motifLayout,
    motifColor: syncedLegacy.motifColor,
    customMotifPoints: syncedLegacy.customMotifPoints,
    headlineFont: isPortfolioHeroHeadlineFont(headlineFont) ? headlineFont : base.headlineFont,
    ctaDesign:
      ctaDesign === 'pill-dark' ||
      ctaDesign === 'pill-outline' ||
      ctaDesign === 'pill-accent' ||
      ctaDesign === 'text-arrow'
        ? ctaDesign
        : base.ctaDesign,
    ctaPlacement:
      ctaPlacement === 'below-pitch' ||
      ctaPlacement === 'after-headline' ||
      ctaPlacement === 'with-tools' ||
      ctaPlacement === 'below-tools' ||
      ctaPlacement === 'below-stats' ||
      ctaPlacement === 'above-stats' ||
      ctaPlacement === 'free-zone'
        ? ctaPlacement
        : base.ctaPlacement,
    showCtaIcon:
      typeof record.showCtaIcon === 'boolean' ? record.showCtaIcon : base.showCtaIcon ?? true,
    ctaIcon: normalizePortfolioHeroCtaIcon(record.ctaIcon, base.ctaIcon ?? 'phone'),
    showSecondaryCta:
      typeof record.showSecondaryCta === 'boolean'
        ? record.showSecondaryCta
        : base.showSecondaryCta,
    secondaryCtaLabel:
      typeof record.secondaryCtaLabel === 'string'
        ? record.secondaryCtaLabel
        : base.secondaryCtaLabel ?? DEFAULT_HERO_SECONDARY_CTA_LABEL,
    secondaryCtaTarget: isPortfolioHeroSecondaryCtaTarget(record.secondaryCtaTarget)
      ? record.secondaryCtaTarget
      : base.secondaryCtaTarget ?? 'work',
    secondaryCtaDesign:
      record.secondaryCtaDesign === 'pill-dark' ||
      record.secondaryCtaDesign === 'pill-outline' ||
      record.secondaryCtaDesign === 'pill-accent' ||
      record.secondaryCtaDesign === 'text-arrow'
        ? record.secondaryCtaDesign
        : base.secondaryCtaDesign ?? 'text-arrow',
    availabilityDesign:
      availabilityDesign === 'pill-live' ||
      availabilityDesign === 'pill-minimal' ||
      availabilityDesign === 'bordered' ||
      availabilityDesign === 'soft'
        ? availabilityDesign
        : base.availabilityDesign,
    availabilityPlacement: isHeroAvailabilityPlacement(availabilityPlacement)
      ? availabilityPlacement
      : base.availabilityPlacement,
    showAvailabilityBadge:
      typeof record.showAvailabilityBadge === 'boolean'
        ? record.showAvailabilityBadge
        : base.showAvailabilityBadge,
    showAvailabilityResponseTime:
      typeof record.showAvailabilityResponseTime === 'boolean'
        ? record.showAvailabilityResponseTime
        : base.showAvailabilityResponseTime,
    mobileAvailabilityPlacement: isHeroAvailabilityPlacement(record.mobileAvailabilityPlacement)
      ? record.mobileAvailabilityPlacement
      : base.mobileAvailabilityPlacement ?? base.availabilityPlacement,
    mobileAvailabilityAlign: isHeroMobileAlign(record.mobileAvailabilityAlign)
      ? record.mobileAvailabilityAlign
      : base.mobileAvailabilityAlign,
    mobileAlignHeadline: isHeroMobileAlign(record.mobileAlignHeadline)
      ? record.mobileAlignHeadline
      : base.mobileAlignHeadline,
    mobileAlignDescription: isHeroMobileAlign(record.mobileAlignDescription)
      ? record.mobileAlignDescription
      : base.mobileAlignDescription,
    mobileAlignTools: isHeroMobileAlign(record.mobileAlignTools)
      ? record.mobileAlignTools
      : base.mobileAlignTools,
    mobileAlignCta: isHeroMobileAlign(record.mobileAlignCta)
      ? record.mobileAlignCta
      : base.mobileAlignCta,
    desktopAvailabilityAlign: isHeroDesktopAlign(record.desktopAvailabilityAlign)
      ? record.desktopAvailabilityAlign
      : base.desktopAvailabilityAlign ?? 'auto',
    desktopAlignHeadline: isHeroDesktopAlign(record.desktopAlignHeadline)
      ? record.desktopAlignHeadline
      : base.desktopAlignHeadline ?? 'auto',
    desktopAlignDescription: isHeroDesktopAlign(record.desktopAlignDescription)
      ? record.desktopAlignDescription
      : base.desktopAlignDescription ?? 'auto',
    desktopAlignTools: isHeroDesktopAlign(record.desktopAlignTools)
      ? record.desktopAlignTools
      : base.desktopAlignTools ?? 'auto',
    desktopAlignCta: isHeroDesktopAlign(record.desktopAlignCta)
      ? record.desktopAlignCta
      : base.desktopAlignCta ?? 'auto',
    // Saves that predate the marker report 0 so the centering migration runs once.
    mobileAlignSettingsRevision:
      typeof record.mobileAlignSettingsRevision === 'number' &&
      Number.isFinite(record.mobileAlignSettingsRevision)
        ? Math.max(0, Math.floor(record.mobileAlignSettingsRevision))
        : 0,
    ...mergeHeroAvailabilityChrome(base, record),
    selectedTools,
    toolsDisplayDesign:
      record.toolsDisplayDesign === 'large-cards' ||
      record.toolsDisplayDesign === 'compact-cards' ||
      record.toolsDisplayDesign === 'horizontal-cards' ||
      record.toolsDisplayDesign === 'icons'
        ? record.toolsDisplayDesign
        : base.toolsDisplayDesign ?? 'icons',
    showToolsLabel:
      typeof record.showToolsLabel === 'boolean' ? record.showToolsLabel : base.showToolsLabel,
    toolsLabelText:
      typeof record.toolsLabelText === 'string' ? record.toolsLabelText : base.toolsLabelText,
    toolsIconArrangement:
      record.toolsIconArrangement === 'stacked' || record.toolsIconArrangement === 'spaced'
        ? record.toolsIconArrangement
        : base.toolsIconArrangement,
    ctaBackgroundEnabled:
      typeof record.ctaBackgroundEnabled === 'boolean'
        ? record.ctaBackgroundEnabled
        : base.ctaBackgroundEnabled,
    ctaBackgroundColor: sanitizeAvailabilityHex(
      record.ctaBackgroundColor,
      base.ctaBackgroundColor
    ),
    ctaBorderEnabled:
      typeof record.ctaBorderEnabled === 'boolean'
        ? record.ctaBorderEnabled
        : base.ctaBorderEnabled,
    ctaBorderColor: sanitizeAvailabilityHex(record.ctaBorderColor, base.ctaBorderColor),
    ctaBorderWidth:
      record.ctaBorderWidth === 'none' ||
      record.ctaBorderWidth === 'thin' ||
      record.ctaBorderWidth === 'medium' ||
      record.ctaBorderWidth === 'thick'
        ? record.ctaBorderWidth
        : base.ctaBorderWidth,
    ctaBorderRadius:
      record.ctaBorderRadius === 'none' ||
      record.ctaBorderRadius === 'sm' ||
      record.ctaBorderRadius === 'md' ||
      record.ctaBorderRadius === 'lg' ||
      record.ctaBorderRadius === 'full'
        ? record.ctaBorderRadius
        : base.ctaBorderRadius,
    toolsIconBackgroundEnabled:
      typeof record.toolsIconBackgroundEnabled === 'boolean'
        ? record.toolsIconBackgroundEnabled
        : base.toolsIconBackgroundEnabled,
    toolsIconBackgroundColor: sanitizeAvailabilityHex(
      record.toolsIconBackgroundColor,
      base.toolsIconBackgroundColor
    ),
    toolsIconBorderColor: sanitizeAvailabilityHex(
      record.toolsIconBorderColor,
      base.toolsIconBorderColor
    ),
    toolsIconBorderWidth:
      record.toolsIconBorderWidth === 'none' ||
      record.toolsIconBorderWidth === 'thin' ||
      record.toolsIconBorderWidth === 'medium' ||
      record.toolsIconBorderWidth === 'thick'
        ? record.toolsIconBorderWidth
        : base.toolsIconBorderWidth,
    toolsIconBorderRadius:
      record.toolsIconBorderRadius === 'none' ||
      record.toolsIconBorderRadius === 'sm' ||
      record.toolsIconBorderRadius === 'md' ||
      record.toolsIconBorderRadius === 'lg' ||
      record.toolsIconBorderRadius === 'full'
        ? record.toolsIconBorderRadius
        : base.toolsIconBorderRadius,
    toolsIconSizePx: sanitizeHeroToolsIconSizePx(record.toolsIconSizePx, base.toolsIconSizePx),
    toolsIconPaddingPx: sanitizeHeroToolsIconPaddingPx(
      record.toolsIconPaddingPx,
      base.toolsIconPaddingPx
    ),
    toolsIconGapPx: sanitizeHeroToolsIconGapPx(record.toolsIconGapPx, base.toolsIconGapPx),
    toolsIconMarginPx: sanitizeHeroToolsIconMarginPx(
      record.toolsIconMarginPx,
      base.toolsIconMarginPx
    ),
    toolsCardGapPx: sanitizeHeroToolsCardGapPx(
      record.toolsCardGapPx,
      base.toolsCardGapPx ?? 16
    ),
    toolsCardMarginTopPx: sanitizeHeroToolsCardMarginPx(
      record.toolsCardMarginTopPx,
      base.toolsCardMarginTopPx ?? 0
    ),
    toolsCardMarginBottomPx: sanitizeHeroToolsCardMarginPx(
      record.toolsCardMarginBottomPx,
      base.toolsCardMarginBottomPx ?? 0
    ),
    toolsCardBackgroundEnabled:
      typeof record.toolsCardBackgroundEnabled === 'boolean'
        ? record.toolsCardBackgroundEnabled
        : base.toolsCardBackgroundEnabled ?? true,
    toolsCardBackgroundColor: sanitizeAvailabilityHex(
      record.toolsCardBackgroundColor,
      base.toolsCardBackgroundColor ?? '#ffffff'
    ),
    toolsCardBorderEnabled:
      typeof record.toolsCardBorderEnabled === 'boolean'
        ? record.toolsCardBorderEnabled
        : base.toolsCardBorderEnabled ?? true,
    toolsCardBorderColor: sanitizeAvailabilityHex(
      record.toolsCardBorderColor,
      base.toolsCardBorderColor ?? '#e5e5e5'
    ),
    toolsCardBorderWidthPx: sanitizeHeroToolsCardBorderWidthPx(
      record.toolsCardBorderWidthPx,
      base.toolsCardBorderWidthPx ?? 1
    ),
    toolsCardRadiusPx: sanitizeHeroToolsCardRadiusPx(
      record.toolsCardRadiusPx,
      base.toolsCardRadiusPx ?? 16
    ),
    toolsCardMinHeightPx: sanitizeHeroToolsCardMinHeightPx(
      record.toolsCardMinHeightPx,
      base.toolsCardMinHeightPx ?? 208
    ),
    toolsCardWidthPx: sanitizeHeroToolsCardWidthPx(
      record.toolsCardWidthPx,
      base.toolsCardWidthPx ?? 260
    ),
    toolsCardPaddingPx: sanitizeHeroToolsCardPaddingPx(
      record.toolsCardPaddingPx,
      base.toolsCardPaddingPx ?? 24
    ),
    toolsCardsPerRow:
      record.toolsCardsPerRow === 1 ||
      record.toolsCardsPerRow === 2 ||
      record.toolsCardsPerRow === 3 ||
      record.toolsCardsPerRow === 4
        ? record.toolsCardsPerRow
        : base.toolsCardsPerRow ?? 2,
    toolsCardsLimit:
      record.toolsCardsLimit === 1 ||
      record.toolsCardsLimit === 2 ||
      record.toolsCardsLimit === 3 ||
      record.toolsCardsLimit === 4
        ? record.toolsCardsLimit
        : base.toolsCardsLimit ?? 4,
    toolsCardContentGapPx: sanitizeHeroToolsCardContentGapPx(
      record.toolsCardContentGapPx,
      base.toolsCardContentGapPx ?? 12
    ),
    toolsCardContentAlignment:
      record.toolsCardContentAlignment === 'left' ||
      record.toolsCardContentAlignment === 'center' ||
      record.toolsCardContentAlignment === 'right'
        ? record.toolsCardContentAlignment
        : base.toolsCardContentAlignment ?? 'center',
    toolsCardIconPlacement:
      record.toolsCardIconPlacement === 'top' ||
      record.toolsCardIconPlacement === 'left' ||
      record.toolsCardIconPlacement === 'right'
        ? record.toolsCardIconPlacement
        : base.toolsCardIconPlacement ?? 'top',
    toolsCardShowIcon:
      typeof record.toolsCardShowIcon === 'boolean'
        ? record.toolsCardShowIcon
        : base.toolsCardShowIcon ?? true,
    toolsCardShowTitle:
      typeof record.toolsCardShowTitle === 'boolean'
        ? record.toolsCardShowTitle
        : base.toolsCardShowTitle ?? true,
    toolsCardShowDescription:
      typeof record.toolsCardShowDescription === 'boolean'
        ? record.toolsCardShowDescription
        : base.toolsCardShowDescription ?? true,
    toolsCardShowLevel:
      typeof record.toolsCardShowLevel === 'boolean'
        ? record.toolsCardShowLevel
        : base.toolsCardShowLevel ?? true,
    motifPosition: syncedLegacy.motifPosition,
    motifPanelSize: syncedLegacy.motifPanelSize,
    heroMotifs,
    ...profileMerged,
    ...metaMerged,
    ...availabilityMerged,
    ...typographyLegacySync,
    ...leftMerged,
    leftMotifEnabled: syncedLegacy.leftMotifEnabled,
    leftMotifPattern: syncedLegacy.leftMotifPattern,
    leftMotifColor: syncedLegacy.leftMotifColor,
    leftMotifOpacity: syncedLegacy.leftMotifOpacity,
    leftMotifPosition: syncedLegacy.leftMotifPosition,
    leftMotifSize: syncedLegacy.leftMotifSize,
    leftCustomMotifPoints: syncedLegacy.leftCustomMotifPoints,
    ...copyMerged,
    ...headlineMerged,
    ...backgroundMerged,
    elementStyles,
    palette: mergeHeroPalette(base.palette ?? DEFAULT_HERO_PALETTE, record.palette),
    colorBindings: mergeHeroColorBindings(
      base.colorBindings ?? DEFAULT_HERO_COLOR_BINDINGS,
      record.colorBindings
    ),
    useHeroPalette:
      typeof record.useHeroPalette === 'boolean' ? record.useHeroPalette : base.useHeroPalette,
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
  };

  // One-time migration: saves that predate the stacked-align revision kept
  // left-aligned mobile copy — the hero now centers every element on
  // tablet/mobile by default. The stamped revision persists with the next
  // save, so alignment choices made after this reset are kept.
  if (merged.mobileAlignSettingsRevision < HERO_MOBILE_ALIGN_SETTINGS_REVISION) {
    merged.mobileAvailabilityAlign = 'center';
    merged.mobileAlignHeadline = 'center';
    merged.mobileAlignDescription = 'center';
    merged.mobileAlignTools = 'center';
    merged.mobileAlignCta = 'center';
    merged.mobileAlignSettingsRevision = HERO_MOBILE_ALIGN_SETTINGS_REVISION;
  }

  // Stats keep a visible outline when the frame is on (toggle-off stores width 0).
  const metaFrameBorderWidth =
    merged.showMetaFrame && merged.metaFrameBorderWidth <= 0 ? 1 : merged.metaFrameBorderWidth;

  // Manual mode: keep stored hex fields — do not overwrite from palette tokens.
  if (!merged.useHeroPalette) {
    return {
      ...merged,
      metaFrameBorderWidth,
    };
  }

  // Palette-locked groups (pairing only — each slot keeps its own binding otherwise):
  // - Contact CTA fill follows the headline specialty accent;
  // - availability text follows the blinking dot color.
  // Motif / portrait frame / mat / caption / stats borders are independent.
  const syncedBindings = mergeHeroColorBindings(merged.colorBindings, {
    ctaBackground: merged.colorBindings.headlineAccent,
    availabilityText: merged.colorBindings.availabilityDot,
  });
  // Palette mode: push tokens into EVERY bound hex field (section background,
  // motif, portrait, stats, CTA, availability, element text colors). This also
  // repaints colors that were edited manually while the palette was off.
  const paletteSynced = applyHeroPaletteToPresentation({
    ...merged,
    colorBindings: syncedBindings,
  });

  return {
    ...merged,
    ...paletteSynced,
    metaFrameBorderWidth,
  };
}
