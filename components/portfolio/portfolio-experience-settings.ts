import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_EXPERIENCE_COLOR_BINDINGS,
  DEFAULT_EXPERIENCE_PALETTE,
  applyExperiencePaletteToSettings,
  mergeExperienceColorBindings,
  mergeExperiencePalette,
  type PortfolioExperienceColorBindings,
  type PortfolioExperiencePalette,
} from '@/components/portfolio/portfolio-experience-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  mergeServicesCardBackgroundSettings,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  servicesCardPaddingClass,
  servicesCardRadiusClass,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_LIST_MARKER_COLOR,
  isPortfolioListMarkerSize,
  isPortfolioListMarkerSource,
  isPortfolioListMarkerStyle,
  isPortfolioListMarkerWeight,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerSource,
  type PortfolioListMarkerStyle,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';

export type PortfolioExperienceDesign =
  | 'timeline'
  | 'timeline-accent'
  | 'timeline-editorial'
  | 'timeline-stepped'
  | 'stacked'
  | 'compact'
  | 'large';

export type PortfolioExperienceTitlePreset =
  | 'experience'
  | 'career-path'
  | 'work-history'
  | 'professional-journey'
  | 'custom';

export type PortfolioExperienceSubtitlePreset = 'default' | 'short' | 'career' | 'minimal' | 'custom';

export type PortfolioExperienceHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioExperienceHeaderAlignment = 'left' | 'center' | 'right';

/** How the section title relates to the experience list. */
export type PortfolioExperienceSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative Experience illustration beside the list. */
export type PortfolioExperienceIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioExperienceIllustrationPlacement = 'left' | 'right';

export type PortfolioExperienceYearsPreset =
  | 'default'
  | 'hands-on'
  | 'industry'
  | 'professional'
  | 'creative'
  | 'custom';

export type PortfolioExperienceYearsSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioExperienceContentAlign = 'left' | 'center' | 'right';

export type PortfolioExperienceListMaxWidth = 'narrow' | 'default' | 'wide' | 'full';

export type PortfolioExperienceListPlacement = 'left' | 'center' | 'right';

/** How many experience cards per row (card-style designs only). */
export type PortfolioExperienceItemsPerRow = 1 | 2 | 3;

export type PortfolioExperienceItemGap = 'sm' | 'md' | 'lg' | 'xl';

/** Vertical gap between individual task list rows. */
export type PortfolioExperienceTaskItemGap = 'sm' | 'md' | 'lg' | 'xl';

/** Visual chrome for ONGOING / FINISHED status badges. */
export type PortfolioExperienceStatusBadgeStyle =
  | 'pill'
  | 'soft'
  | 'outline'
  | 'plain'
  | 'accent'
  | 'square'
  | 'dot';

export type PortfolioExperienceItemDensity = 'comfortable' | 'compact';

/** Vertical gap between title / org / meta / description / tools in the story column. */
export type PortfolioExperienceStoryContentGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/** Where the details column (tasks / tools / proof / …) sits relative to the story. */
export type PortfolioExperienceAsidePlacement = 'right' | 'left' | 'stacked' | 'inline';

/** Large / bento only: where Tasks + Proof sit relative to media / story. */
export type PortfolioExperienceBentoDetailsPlacement = 'aside' | 'under-media' | 'under-story';

/** Where the entry image/video sits relative to the experience content. */
export type PortfolioExperienceEntryMediaPlacement =
  | 'aside-right'
  | 'aside-left'
  | 'outside-right'
  | 'outside-left'
  | 'story-top'
  | 'entry-top'
  | 'hidden';

export type PortfolioExperienceEntryMediaSize = 'sm' | 'md' | 'lg' | 'full' | 'custom';

export type PortfolioExperienceEntryMediaRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioExperienceEntryMediaAspect = 'auto' | '1/1' | '4/5' | '16/9' | '3/2';

/** How media fills its frame across every Experience design. */
export type PortfolioExperienceEntryMediaFit = 'cover' | 'contain';

/** Focal alignment used by images and videos inside their frame. */
export type PortfolioExperienceEntryMediaPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Magazine only: relative width of the media and content columns on large screens. */
export type PortfolioExperienceMagazineColumnRatio =
  | 'balanced'
  | 'content-wide'
  | 'media-wide';

/** Fixed frame height for entry media (auto = follow aspect / natural). */
export type PortfolioExperienceEntryMediaHeight = 'auto' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/** Which column / layer the tools block belongs to. */
export type PortfolioExperienceToolsZone = 'story' | 'details' | 'entry';

/** Where proof links render: story card, details card, or under the entry media. */
export type PortfolioExperienceProofZone = 'story' | 'details' | 'under-media';

/** When tools sit outside the cards, which side of the entry background. */
export type PortfolioExperienceToolsEntrySide = 'left' | 'right';

/** How tool chips are rendered. */
export type PortfolioExperienceToolsDisplay = 'icons-and-labels' | 'icons' | 'stacked';

export type PortfolioExperienceToolsIconSize = 'sm' | 'md' | 'lg' | 'xl';

/** Outline around each tools logo chip. */
export type PortfolioExperienceToolsIconBorder = 'none' | 'soft' | 'solid';

export type PortfolioExperienceToolsChromePadding = PortfolioServicesCardPadding | 'custom';

export type PortfolioExperienceToolsChromeBorderRadius = PortfolioServicesCardRadius | 'full';

export type PortfolioExperienceToolsChromeSettings = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  border: 'none' | 'soft' | 'solid';
  borderColor: string;
  borderRadius: PortfolioExperienceToolsChromeBorderRadius;
  padding: PortfolioExperienceToolsChromePadding;
  paddingPx: number;
  fitContent: boolean;
};

export const EXPERIENCE_TOOLS_ICON_PADDING_PX_MIN = 0;
export const EXPERIENCE_TOOLS_ICON_PADDING_PX_MAX = 28;
export const EXPERIENCE_TOOLS_ICON_GAP_PX_MIN = 0;
export const EXPERIENCE_TOOLS_ICON_GAP_PX_MAX = 32;

export const EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX: Record<PortfolioServicesCardPadding, number> = {
  none: 0,
  sm: 16,
  md: 24,
  lg: 36,
};

export const EXPERIENCE_TOOLS_CHROME_PADDING_PX_MIN = 0;
export const EXPERIENCE_TOOLS_CHROME_PADDING_PX_MAX = 64;

export function clampExperienceToolsIconPaddingPx(value: unknown, fallback = 10): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    EXPERIENCE_TOOLS_ICON_PADDING_PX_MAX,
    Math.max(EXPERIENCE_TOOLS_ICON_PADDING_PX_MIN, Math.round(n))
  );
}

export function clampExperienceToolsIconGapPx(value: unknown, fallback = 8): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    EXPERIENCE_TOOLS_ICON_GAP_PX_MAX,
    Math.max(EXPERIENCE_TOOLS_ICON_GAP_PX_MIN, Math.round(n))
  );
}

export function clampExperienceToolsChromePaddingPx(value: unknown, fallback = 16): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_TOOLS_CHROME_PADDING_PX_MIN,
    Math.min(EXPERIENCE_TOOLS_CHROME_PADDING_PX_MAX, Math.round(n))
  );
}

export function resolveExperienceToolsChromePaddingPx(
  chrome: Pick<PortfolioExperienceToolsChromeSettings, 'padding' | 'paddingPx'>
): number {
  if (chrome.padding === 'custom') {
    return clampExperienceToolsChromePaddingPx(chrome.paddingPx, 16);
  }
  return EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX[chrome.padding] ?? 16;
}

export function mergeExperienceToolsChrome(
  base: PortfolioExperienceToolsChromeSettings,
  patch: unknown
): PortfolioExperienceToolsChromeSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const padding =
    record.padding === 'none' ||
    record.padding === 'sm' ||
    record.padding === 'md' ||
    record.padding === 'lg' ||
    record.padding === 'custom'
      ? record.padding
      : base.padding;
  return {
    enabled: typeof record.enabled === 'boolean' ? record.enabled : base.enabled,
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    border:
      record.border === 'none' || record.border === 'soft' || record.border === 'solid'
        ? record.border
        : base.border,
    borderColor: sanitizeHex(record.borderColor, base.borderColor),
    borderRadius:
      record.borderRadius === 'none' ||
      record.borderRadius === 'sm' ||
      record.borderRadius === 'md' ||
      record.borderRadius === 'lg' ||
      record.borderRadius === 'xl' ||
      record.borderRadius === 'full'
        ? record.borderRadius
        : base.borderRadius,
    padding,
    paddingPx: clampExperienceToolsChromePaddingPx(
      record.paddingPx,
      padding !== 'custom' && padding !== base.padding
        ? EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX[padding as PortfolioServicesCardPadding]
        : base.paddingPx
    ),
    fitContent: typeof record.fitContent === 'boolean' ? record.fitContent : base.fitContent,
  };
}

/** Visual style for skill tags inside an experience entry. */
export type PortfolioExperienceSkillsTagStyle = 'soft' | 'pill' | 'outline' | 'plain';

/** Visual style for proof / portfolio links inside an experience entry. */
export type PortfolioExperienceProofLinkStyle =
  | 'pill'
  | 'soft'
  | 'outline'
  | 'plain'
  | 'accent'
  | 'underline';

/** Font size scale for entry content elements. */
export type PortfolioExperienceTextSize = 'sm' | 'md' | 'lg' | 'xl';

/** Color / font / size / weight controls for one entry text element. */
export type PortfolioExperienceTextStyle = {
  color: string;
  /**
   * Manual dark-mode color (used when the section palette is off and
   * Global → Theme is Dark). Falls back to `color` when empty/unset.
   */
  colorDark: string;
  font: PortfolioExperienceHeaderFont;
  size: PortfolioExperienceTextSize;
  italic: boolean;
  bold: boolean;
  uppercase: boolean;
};

/** Which entry text role can be styled independently. */
export type PortfolioExperienceStyleTarget =
  | 'title'
  | 'organization'
  | 'meta'
  | 'description'
  | 'blockLabel'
  | 'tasks'
  | 'proof'
  | 'note'
  | 'skills'
  | 'tools';

export type PortfolioExperienceElementStyles = Record<
  PortfolioExperienceStyleTarget,
  PortfolioExperienceTextStyle
>;

/** Which of the two inner cards an element belongs to. */
export type PortfolioExperienceCardZone = 'story' | 'details';

/** Ordered content blocks inside an experience entry (all designs). */
export type PortfolioExperienceElementId =
  | 'title'
  | 'organization'
  | 'meta'
  | 'description'
  | 'tasks'
  | 'tools'
  | 'proof'
  | 'note'
  | 'skills';

/** Per-element assignment to the story card or details card. */
export type PortfolioExperienceElementZones = Record<
  PortfolioExperienceElementId,
  PortfolioExperienceCardZone
>;

/** Block ids that can show an uppercase heading above the content. */
export type PortfolioExperienceBlockLabelId =
  | 'tasks'
  | 'proof'
  | 'note'
  | 'skills'
  | 'tools';

export type PortfolioExperienceBlockLabelVisibility = Record<
  PortfolioExperienceBlockLabelId,
  boolean
>;

export const DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY: PortfolioExperienceBlockLabelVisibility = {
  tasks: true,
  proof: true,
  note: true,
  skills: true,
  tools: true,
};

export const EXPERIENCE_BLOCK_LABEL_IDS: PortfolioExperienceBlockLabelId[] = [
  'tasks',
  'proof',
  'note',
  'skills',
  'tools',
];

/** Independent chrome for entry background, story column, or details column. */
export type PortfolioExperienceLayerFrame = PortfolioServicesCardBackgroundSettings & {
  /** When true, draw border / fill / radius / padding for this layer. */
  enabled: boolean;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
};

export type PortfolioExperiencePresentationSettings = PortfolioSectionBackgroundSettings & {
  titlePreset: PortfolioExperienceTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioExperienceSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioExperienceHeaderFont;
  subtitleFont: PortfolioExperienceHeaderFont;
  titleColor: string;
  subtitleColor: string;
  titleUppercase: boolean;
  subtitleUppercase: boolean;
  headerAlignment: PortfolioExperienceHeaderAlignment;
  /**
   * `stacked` — title above the list (default).
   * `aside-left` / `aside-right` — title beside the list on large screens.
   */
  sectionLayout: PortfolioExperienceSectionLayout;
  /**
   * Decorative SVG beside the experience list (`none` hides it).
   */
  illustrationVariant: PortfolioExperienceIllustrationVariant;
  /** Side of the list for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioExperienceIllustrationPlacement;
  experienceDesign: PortfolioExperienceDesign;
  listMaxWidth: PortfolioExperienceListMaxWidth;
  listPlacement: PortfolioExperienceListPlacement;
  itemsPerRow: PortfolioExperienceItemsPerRow;
  itemGap: PortfolioExperienceItemGap;
  itemDensity: PortfolioExperienceItemDensity;
  /** Vertical gap between elements in the left / story column. */
  storyContentGap: PortfolioExperienceStoryContentGap;
  /** Manual px when storyContentGap is `custom`. */
  storyContentGapPx: number;
  /** Vertical gap between tasks / proof / note / skills / tools in the details column. */
  detailsContentGap: PortfolioExperienceStoryContentGap;
  /** Manual px when detailsContentGap is `custom`. */
  detailsContentGapPx: number;
  /** Magazine only: width balance for the two-column media/content composition. */
  magazineColumnRatio: PortfolioExperienceMagazineColumnRatio;
  /** Magazine only: breathing room between entry content and the horizontal separator. */
  magazineSeparatorSpacingPx: number;
  /** Magazine design: show the horizontal rule beside the period badge. */
  periodRuleEnabled: boolean;
  periodRuleColor: string;
  /** Manual dark-mode rule color when palette is off or follow-palette is off. */
  periodRuleColorDark: string;
  /**
   * When palette is on: `true` uses the bound token; `false` uses periodRuleColor hex.
   * Ignored when useHeroPalette is false.
   */
  periodRuleFollowPalette: boolean;
  periodRuleThickness: number;
  periodRuleOpacity: number;
  /** Classic / Accent timeline: vertical rail line + node. */
  timelineRailEnabled: boolean;
  timelineRailColor: string;
  timelineRailOpacity: number;
  /** Hairline above the Tools block (last entry element). */
  toolsSeparatorEnabled: boolean;
  toolsSeparatorColor: string;
  toolsSeparatorOpacity: number;
  accentColor: string;
  yearsPreset: PortfolioExperienceYearsPreset;
  yearsCustom: string;
  yearsFont: PortfolioExperienceHeaderFont;
  yearsSize: PortfolioExperienceYearsSize;
  yearsColor: string;
  yearsHighlightColor: string;
  yearsBoldYears: boolean;
  yearsItalic: boolean;
  yearsAlignment: PortfolioExperienceContentAlign;
  showYears: boolean;
  /** Fill for Tools / Proof / Skills pills (palette-synced). */
  entryChipBackgroundColor: string;
  /** Border for Tools / Proof / Skills pills (palette-synced). */
  entryChipBorderColor: string;
  /** Entry content visibility */
  showPeriod: boolean;
  showTitle: boolean;
  showOrganization: boolean;
  showDescription: boolean;
  showMeta: boolean;
  showTasks: boolean;
  /** Global vs section override for task list bullets. */
  taskBulletSource: PortfolioListMarkerSource;
  taskBulletStyle: PortfolioListMarkerStyle;
  taskBulletColor: string;
  taskBulletSize: PortfolioListMarkerSize;
  taskBulletSizePx: number;
  taskBulletWeight: PortfolioListMarkerWeight;
  taskBulletWeightAmount: number;
  /** Vertical gap between task list items. */
  taskItemGap: PortfolioExperienceTaskItemGap;
  showTools: boolean;
  showProof: boolean;
  showNote: boolean;
  showSkills: boolean;
  asidePlacement: PortfolioExperienceAsidePlacement;
  /**
   * Large / bento: `aside` keeps Tasks + Proof in their own column;
   * `under-media` stacks them under the entry photo.
   */
  bentoDetailsPlacement: PortfolioExperienceBentoDetailsPlacement;
  /** When false, entry media is never shown even if mediaUrl exists. */
  showEntryMedia: boolean;
  /** Where the entry image/video sits relative to the experience content. */
  entryMediaPlacement: PortfolioExperienceEntryMediaPlacement;
  /** When placement is outside-*, pin media while the entry is in view (lg+ only). */
  entryMediaSticky: boolean;
  entryMediaSize: PortfolioExperienceEntryMediaSize;
  /** Manual width in px when entryMediaSize is `custom` (lg+). */
  entryMediaSizePx: number;
  entryMediaRadius: PortfolioExperienceEntryMediaRadius;
  entryMediaAspect: PortfolioExperienceEntryMediaAspect;
  entryMediaFit: PortfolioExperienceEntryMediaFit;
  entryMediaPosition: PortfolioExperienceEntryMediaPosition;
  /** Uniform dark veil over experience media. 0 = disabled, 100 = fully black. */
  entryMediaDarkness: number;
  /** Cap / fix media frame height (especially useful for XL). */
  entryMediaHeight: PortfolioExperienceEntryMediaHeight;
  /** Manual height in px when entryMediaHeight is `custom`. */
  entryMediaHeightPx: number;
  /** Display order of content elements (applies to every design). */
  elementOrder: PortfolioExperienceElementId[];
  /** Which inner card each element sits in (story ↔ details). */
  elementZones: PortfolioExperienceElementZones;
  /** Custom block headings (empty = default English labels). */
  tasksLabel: string;
  proofLabel: string;
  noteLabel: string;
  skillsLabel: string;
  toolsLabel: string;
  showBlockLabels: boolean;
  /** Per-block visibility for Tasks / Proof / Note / Skills / Tools headings (when showBlockLabels is on). */
  blockLabelVisibility: PortfolioExperienceBlockLabelVisibility;
  skillsTagStyle: PortfolioExperienceSkillsTagStyle;
  /** Visual chrome for ONGOING / FINISHED status badges. */
  statusBadgeStyle: PortfolioExperienceStatusBadgeStyle;
  /** Visual chrome for proof / portfolio links. */
  proofLinkStyle: PortfolioExperienceProofLinkStyle;
  /** Which column / layer renders the tools block. */
  toolsZone: PortfolioExperienceToolsZone;
  /** Where proof links render: story card, details card, or under the entry media. */
  proofZone: PortfolioExperienceProofZone;
  /** When toolsZone is entry: bottom-left or bottom-right of the entry background. */
  toolsEntrySide: PortfolioExperienceToolsEntrySide;
  /** Icons only, or icons with labels. */
  toolsDisplay: PortfolioExperienceToolsDisplay;
  toolsIconSize: PortfolioExperienceToolsIconSize;
  /** Outline around tools logo chips — set to none to remove the ring. */
  toolsIconBorder: PortfolioExperienceToolsIconBorder;
  toolsIconBorderColor: string;
  /** When false, tool glyphs render without a filled chip plate. */
  toolsIconBackgroundEnabled: boolean;
  /** Tool icon chip fill — independent from entryChipBackground (Proof / Skills). */
  toolsIconBackgroundColor: string;
  /** Inner padding around each tool glyph (chip grows with size + padding×2). */
  toolsIconPaddingPx: number;
  /** Space between tool icon chips. */
  toolsIconGapPx: number;
  /** Surface behind the tools icons group (like Work elementChromes.tools). */
  toolsChrome: PortfolioExperienceToolsChromeSettings;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /** Experience-owned palette copy (same 8 tokens as Hero). */
  experiencePalette?: PortfolioExperiencePalette;
  /** Which token each experience color slot uses. */
  experienceColorBindings?: PortfolioExperienceColorBindings;
  /** Runtime Global color mode (injected on the public page for light/dark pairs). */
  activeColorMode?: 'light' | 'dark';
  /** Per-element color, font, size, and weight for entry content. */
  elementStyles: PortfolioExperienceElementStyles;
  /** Outer entry background (the gray shell around both columns). */
  entryFrame: PortfolioExperienceLayerFrame;
  /** Inner frame around title / org / meta / description. */
  storyFrame: PortfolioExperienceLayerFrame;
  /** Inner frame around the Tasks card in details. */
  detailsFrame: PortfolioExperienceLayerFrame;
  /** Inner frame around Proof / skills (and other secondary details blocks). */
  detailsSecondaryFrame: PortfolioExperienceLayerFrame;
};

export type PortfolioExperienceSectionSettings = PortfolioSectionCopy & PortfolioExperiencePresentationSettings;

export const DEFAULT_EXPERIENCE_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_SUBTITLE_COLOR = '#737373';
export const DEFAULT_EXPERIENCE_ACCENT_COLOR = '#ea580c';
export const DEFAULT_EXPERIENCE_YEARS_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_EXPERIENCE_ENTRY_BACKGROUND_COLOR = '#f5f5f5';
export const DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_EXPERIENCE_BODY_COLOR = '#525252';
export const DEFAULT_EXPERIENCE_MUTED_COLOR = '#a3a3a3';
export const DEFAULT_EXPERIENCE_NOTE_COLOR = '#737373';

export const DEFAULT_EXPERIENCE_TOOLS_CHROME: PortfolioExperienceToolsChromeSettings = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#fafafa',
  border: 'none',
  borderColor: DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR,
  borderRadius: 'full',
  padding: 'sm',
  paddingPx: EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX.sm,
  fitContent: true,
};

function createExperienceTextStyle(
  overrides: Partial<PortfolioExperienceTextStyle> = {}
): PortfolioExperienceTextStyle {
  const color = overrides.color ?? DEFAULT_EXPERIENCE_BODY_COLOR;
  return {
    font: 'sans',
    size: 'md',
    italic: false,
    bold: false,
    uppercase: false,
    ...overrides,
    color,
    colorDark: overrides.colorDark ?? color,
  };
}

export const DEFAULT_EXPERIENCE_ELEMENT_STYLES: PortfolioExperienceElementStyles = {
  title: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_TITLE_COLOR,
    font: 'serif',
    size: 'xl',
    bold: true,
  }),
  organization: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_ACCENT_COLOR,
    size: 'md',
    bold: true,
  }),
  meta: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  description: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'md',
  }),
  blockLabel: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_MUTED_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  tasks: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'md',
  }),
  proof: createExperienceTextStyle({
    color: '#404040',
    size: 'sm',
    bold: true,
  }),
  note: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_NOTE_COLOR,
    font: 'serif',
    size: 'md',
    italic: true,
  }),
  skills: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    size: 'sm',
    bold: true,
  }),
  tools: createExperienceTextStyle({
    color: '#404040',
    size: 'sm',
    bold: true,
  }),
};

export const EXPERIENCE_STYLE_TARGET_IDS: PortfolioExperienceStyleTarget[] = [
  'title',
  'organization',
  'meta',
  'description',
  'blockLabel',
  'tasks',
  'proof',
  'note',
  'skills',
  'tools',
];

export const EXPERIENCE_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'title',
  'organization',
  'meta',
  'description',
  'tools',
  'tasks',
  'proof',
  'skills',
  'note',
];

export const EXPERIENCE_STORY_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'title',
  'organization',
  'meta',
  'description',
];

export const EXPERIENCE_DETAILS_ELEMENT_IDS: PortfolioExperienceElementId[] = [
  'tools',
  'tasks',
  'proof',
  'skills',
  'note',
];

export const DEFAULT_EXPERIENCE_ELEMENT_ORDER: PortfolioExperienceElementId[] = [...EXPERIENCE_ELEMENT_IDS];

export const DEFAULT_EXPERIENCE_ELEMENT_ZONES: PortfolioExperienceElementZones = {
  title: 'story',
  organization: 'story',
  meta: 'story',
  description: 'story',
  tasks: 'details',
  tools: 'details',
  proof: 'details',
  note: 'details',
  skills: 'details',
};

export const PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS: {
  value: PortfolioExperienceElementId;
  label: string;
  zone: PortfolioExperienceCardZone;
}[] = [
  { value: 'title', label: 'Job title', zone: 'story' },
  { value: 'organization', label: 'Organization', zone: 'story' },
  { value: 'meta', label: 'Meta chips', zone: 'story' },
  { value: 'description', label: 'Description', zone: 'story' },
  { value: 'tasks', label: 'Tasks', zone: 'details' },
  { value: 'tools', label: 'Tools', zone: 'details' },
  { value: 'proof', label: 'Proof links', zone: 'details' },
  { value: 'note', label: 'Note', zone: 'details' },
  { value: 'skills', label: 'Skills tags', zone: 'details' },
];

function createExperienceLayerFrame(
  overrides: Partial<PortfolioExperienceLayerFrame> = {}
): PortfolioExperienceLayerFrame {
  return {
    ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
    enabled: true,
    cardBorder: 'soft',
    cardBorderColor: DEFAULT_EXPERIENCE_CARD_BORDER_COLOR,
    cardBackgroundEnabled: true,
    cardBackgroundColor: DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR,
    cardBorderRadius: 'lg',
    cardPadding: 'lg',
    ...overrides,
  };
}

const EXPERIENCE_DESIGNS = [
  'timeline',
  'timeline-accent',
  'timeline-editorial',
  'timeline-stepped',
  'stacked',
  'compact',
  'large',
] as const;

export const DEFAULT_EXPERIENCE_PRESENTATION: PortfolioExperiencePresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  titlePreset: 'experience',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_EXPERIENCE_TITLE_COLOR,
  subtitleColor: DEFAULT_EXPERIENCE_SUBTITLE_COLOR,
  titleUppercase: false,
  subtitleUppercase: false,
  headerAlignment: 'left',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  experienceDesign: 'timeline-editorial',
  listMaxWidth: 'full',
  listPlacement: 'left',
  itemsPerRow: 1,
  itemGap: 'md',
  itemDensity: 'comfortable',
  storyContentGap: 'md',
  storyContentGapPx: 16,
  detailsContentGap: 'md',
  detailsContentGapPx: 16,
  // Preserve the historical Magazine composition: visual wider than content.
  magazineColumnRatio: 'media-wide',
  magazineSeparatorSpacingPx: 64,
  periodRuleEnabled: false,
  /** Light mode default — darker hairline so it reads on pale pages. */
  periodRuleColor: '#a3a3a3',
  /** Dark mode default — lighter hairline on near-black pages. */
  periodRuleColorDark: '#e5e5e5',
  periodRuleFollowPalette: true,
  periodRuleThickness: 1,
  periodRuleOpacity: 70,
  timelineRailEnabled: true,
  timelineRailColor: '#d4d4d4',
  timelineRailOpacity: 85,
  toolsSeparatorEnabled: true,
  toolsSeparatorColor: '#d4d4d4',
  toolsSeparatorOpacity: 55,
  accentColor: DEFAULT_EXPERIENCE_ACCENT_COLOR,
  yearsPreset: 'default',
  yearsCustom: '{years}+ years of hands-on experience in my field.',
  yearsFont: 'serif',
  yearsSize: 'md',
  yearsColor: DEFAULT_EXPERIENCE_YEARS_COLOR,
  yearsHighlightColor: DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR,
  yearsBoldYears: true,
  yearsItalic: false,
  yearsAlignment: 'left',
  showYears: true,
  entryChipBackgroundColor: DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR,
  entryChipBorderColor: DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR,
  showPeriod: true,
  showTitle: true,
  showOrganization: true,
  showDescription: true,
  showMeta: true,
  showTasks: true,
  taskBulletSource: 'section',
  taskBulletStyle: 'disc',
  taskBulletColor: DEFAULT_LIST_MARKER_COLOR,
  taskBulletSize: 'md',
  taskBulletSizePx: LIST_MARKER_SIZE_PRESET_PX.md,
  taskBulletWeight: 'regular',
  taskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  taskItemGap: 'md',
  showTools: true,
  showProof: true,
  showNote: false,
  showSkills: true,
  asidePlacement: 'right',
  bentoDetailsPlacement: 'aside',
  showEntryMedia: true,
  entryMediaPlacement: 'aside-right',
  entryMediaSticky: true,
  entryMediaSize: 'md',
  entryMediaSizePx: 224,
  entryMediaRadius: 'lg',
  entryMediaAspect: '4/5',
  entryMediaFit: 'cover',
  entryMediaPosition: 'center',
  entryMediaDarkness: 0,
  entryMediaHeight: 'auto',
  entryMediaHeightPx: 280,
  elementOrder: DEFAULT_EXPERIENCE_ELEMENT_ORDER,
  elementZones: DEFAULT_EXPERIENCE_ELEMENT_ZONES,
  tasksLabel: '',
  proofLabel: '',
  noteLabel: '',
  skillsLabel: '',
  toolsLabel: '',
  showBlockLabels: true,
  blockLabelVisibility: { ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY },
  skillsTagStyle: 'soft',
  statusBadgeStyle: 'pill',
  proofLinkStyle: 'pill',
  toolsZone: 'details',
  proofZone: 'details',
  toolsEntrySide: 'left',
  toolsDisplay: 'icons-and-labels',
  toolsIconSize: 'md',
  toolsIconBorder: 'solid',
  toolsIconBorderColor: DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR,
  toolsIconBackgroundEnabled: true,
  toolsIconBackgroundColor: DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR,
  toolsIconPaddingPx: 10,
  toolsIconGapPx: 8,
  toolsChrome: { ...DEFAULT_EXPERIENCE_TOOLS_CHROME },
  useHeroPalette: true,
  experiencePalette: { ...DEFAULT_EXPERIENCE_PALETTE },
  experienceColorBindings: { ...DEFAULT_EXPERIENCE_COLOR_BINDINGS },
  elementStyles: DEFAULT_EXPERIENCE_ELEMENT_STYLES,
  entryFrame: createExperienceLayerFrame({
    enabled: false,
    cardBackgroundColor: DEFAULT_EXPERIENCE_ENTRY_BACKGROUND_COLOR,
    cardPadding: 'lg',
  }),
  storyFrame: createExperienceLayerFrame({
    enabled: false,
    cardPadding: 'md',
  }),
  detailsFrame: createExperienceLayerFrame({
    enabled: true,
    cardBackgroundColor: DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR,
    cardPadding: 'md',
  }),
  detailsSecondaryFrame: createExperienceLayerFrame({
    enabled: true,
    cardBackgroundColor: DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR,
    cardPadding: 'md',
  }),
};

Object.assign(
  DEFAULT_EXPERIENCE_PRESENTATION,
  applyExperiencePaletteToSettings({
    experiencePalette: DEFAULT_EXPERIENCE_PALETTE,
    experienceColorBindings: DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    elementStyles: DEFAULT_EXPERIENCE_ELEMENT_STYLES,
    entryFrame: DEFAULT_EXPERIENCE_PRESENTATION.entryFrame,
    storyFrame: DEFAULT_EXPERIENCE_PRESENTATION.storyFrame,
    detailsFrame: DEFAULT_EXPERIENCE_PRESENTATION.detailsFrame,
    detailsSecondaryFrame: DEFAULT_EXPERIENCE_PRESENTATION.detailsSecondaryFrame,
  })
);

export const PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS: {
  value: PortfolioExperienceTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'experience', label: 'Experience', description: 'Classic section label.' },
  { value: 'career-path', label: 'Career path', description: 'Journey-focused heading.' },
  { value: 'work-history', label: 'Work history', description: 'Professional track record.' },
  {
    value: 'professional-journey',
    label: 'Professional journey',
    description: 'Long-form career narrative tone.',
  },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioExperienceSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'career', label: 'Career', description: 'Roles and milestones focus.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS: {
  value: PortfolioExperienceHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_EXPERIENCE_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioExperienceSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, expériences en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, liste à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Liste à gauche, titre à droite (côte à côte).',
  },
];

export function isPortfolioExperienceSectionLayout(
  value: unknown
): value is PortfolioExperienceSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function experienceSectionLayoutIsAside(
  layout: PortfolioExperienceSectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + experience list (large screens). */
export function experienceAsideLayoutClass(layout: PortfolioExperienceSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const PORTFOLIO_EXPERIENCE_ILLUSTRATION_OPTIONS: {
  value: PortfolioExperienceIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_EXPERIENCE_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche de la liste.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite de la liste.' },
];

const EXPERIENCE_ILLUSTRATION_VARIANTS = [
  'none',
  'chat',
  'question',
  'docs',
  'support',
  'hex',
] as const satisfies readonly PortfolioExperienceIllustrationVariant[];

const EXPERIENCE_ILLUSTRATION_PLACEMENTS = [
  'left',
  'right',
] as const satisfies readonly PortfolioExperienceIllustrationPlacement[];

export const PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS: {
  value: PortfolioExperienceDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'timeline-editorial',
    label: 'Magazine',
    description:
      '3 equal columns on large screens — story, tech sheet, media — with optional details under the description.',
  },
  {
    value: 'large',
    label: 'Bento',
    description: 'Full-bleed showcase with oversized type and zones.',
  },
  {
    value: 'timeline-accent',
    label: 'Accent rail',
    description: 'Bold timeline with a dual-column content panel.',
  },
  {
    value: 'timeline',
    label: 'Classic rail',
    description: 'Clean vertical rail using the full section width.',
  },
  {
    value: 'timeline-stepped',
    label: 'Stepped cards',
    description:
      'Bandeau média panoramique en tête, puis texte à gauche et fiche technique à droite.',
  },
  {
    value: 'stacked',
    label: 'Panel cards',
    description:
      'Elevated panels and wide grids. Hover lift/shadow follow Global → Motion (Dynamique only).',
  },
  {
    value: 'compact',
    label: 'Dense rows',
    description: 'Horizontal meta row + two-column body — high density.',
  },
];

export const PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS: {
  value: PortfolioExperienceListMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'narrow', label: 'Narrow', description: 'Focused column — best for 1 item per row.' },
  { value: 'default', label: 'Comfortable', description: 'Wide editorial measure on desktop.' },
  { value: 'wide', label: 'Wide', description: 'Near full-bleed — great for 2–3 columns.' },
  { value: 'full', label: 'Full', description: 'Entire section width on every breakpoint.' },
];

export const PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceListPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Align experience block to the left.' },
  { value: 'center', label: 'Center', description: 'Center experience block.' },
  { value: 'right', label: 'Right', description: 'Align experience block to the right.' },
];

export const PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS: {
  value: '1' | '2' | '3';
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 per row', description: 'Single full-width entry — maximum detail.' },
  { value: '2', label: '2 per row', description: 'Two cards side by side from tablet up.' },
  { value: '3', label: '3 per row', description: 'Three cards on large screens — denser gallery.' },
];

export const PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS: {
  value: PortfolioExperienceItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les expériences.' },
  { value: 'md', label: 'Standard', description: 'Espacement équilibré.' },
  { value: 'lg', label: 'Large', description: 'Respiration claire entre chaque entrée.' },
  { value: 'xl', label: 'Très large', description: 'Fort écart vertical entre les expériences.' },
];

export const PORTFOLIO_EXPERIENCE_TASK_ITEM_GAP_OPTIONS: {
  value: PortfolioExperienceTaskItemGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les tâches.' },
  { value: 'md', label: 'Standard', description: 'Espacement équilibré entre les puces.' },
  { value: 'lg', label: 'Large', description: 'Plus d’air entre chaque tâche.' },
  { value: 'xl', label: 'Très large', description: 'Fort écart vertical entre les tâches.' },
];

export const PORTFOLIO_EXPERIENCE_STATUS_BADGE_STYLE_OPTIONS: {
  value: PortfolioExperienceStatusBadgeStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'pill',
    label: 'Pill',
    description: 'Ongoing en accent plein — Finished en chip soft (défaut).',
  },
  {
    value: 'soft',
    label: 'Soft',
    description: 'Fond muted pour Ongoing et Finished.',
  },
  {
    value: 'outline',
    label: 'Outline',
    description: 'Contour seul, sans fond fort.',
  },
  {
    value: 'plain',
    label: 'Plain',
    description: 'Texte uppercase seul, sans pastille.',
  },
  {
    value: 'accent',
    label: 'Accent',
    description: 'Ongoing plein — Finished en texte / bord accent.',
  },
  {
    value: 'square',
    label: 'Square',
    description: 'Coins légèrement carrés, look badge technique.',
  },
  {
    value: 'dot',
    label: 'Dot',
    description: 'Pastille colorée + label, sans gros chip.',
  },
];

export const PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS: {
  value: PortfolioExperienceItemDensity;
  label: string;
  description: string;
}[] = [
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Roomy padding and section gaps inside each entry.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Tighter spacing for denser reading.',
  },
];

export const PORTFOLIO_EXPERIENCE_STORY_CONTENT_GAP_OPTIONS: {
  value: Exclude<PortfolioExperienceStoryContentGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: '0px — elements sit flush.' },
  { value: 'sm', label: 'Tight', description: '8px — compact story stack.' },
  { value: 'md', label: 'Medium', description: '16px — balanced (default).' },
  { value: 'lg', label: 'Large', description: '24px — airy story column.' },
  { value: 'xl', label: 'Extra large', description: '32px — editorial breathing room.' },
];

/** Same presets as story — gap between details blocks (tasks, note, skills, tools…). */
export const PORTFOLIO_EXPERIENCE_DETAILS_CONTENT_GAP_OPTIONS: {
  value: Exclude<PortfolioExperienceStoryContentGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: '0px — details blocks sit flush.' },
  { value: 'sm', label: 'Tight', description: '8px — compact details stack.' },
  { value: 'md', label: 'Medium', description: '16px — balanced (default).' },
  { value: 'lg', label: 'Large', description: '24px — airy details column.' },
  { value: 'xl', label: 'Extra large', description: '32px — editorial breathing room.' },
];

export const EXPERIENCE_STORY_CONTENT_GAP_PRESET_PX: Record<
  Exclude<PortfolioExperienceStoryContentGap, 'custom'>,
  number
> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const EXPERIENCE_DETAILS_CONTENT_GAP_PRESET_PX = EXPERIENCE_STORY_CONTENT_GAP_PRESET_PX;

export const EXPERIENCE_STORY_CONTENT_GAP_PX_MIN = 0;
export const EXPERIENCE_STORY_CONTENT_GAP_PX_MAX = 64;

export const EXPERIENCE_DETAILS_CONTENT_GAP_PX_MIN = EXPERIENCE_STORY_CONTENT_GAP_PX_MIN;
export const EXPERIENCE_DETAILS_CONTENT_GAP_PX_MAX = EXPERIENCE_STORY_CONTENT_GAP_PX_MAX;

export function clampExperienceStoryContentGapPx(value: unknown, fallback = 16): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_STORY_CONTENT_GAP_PX_MIN,
    Math.min(EXPERIENCE_STORY_CONTENT_GAP_PX_MAX, Math.round(n))
  );
}

export const clampExperienceDetailsContentGapPx = clampExperienceStoryContentGapPx;

export function resolveExperienceStoryContentGapPx(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyContentGap' | 'storyContentGapPx'>
): number {
  const gap = p.storyContentGap ?? 'md';
  if (gap === 'custom') {
    return clampExperienceStoryContentGapPx(p.storyContentGapPx, 16);
  }
  return EXPERIENCE_STORY_CONTENT_GAP_PRESET_PX[gap] ?? 16;
}

export function resolveExperienceDetailsContentGapPx(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsContentGap' | 'detailsContentGapPx'>
): number {
  const gap = p.detailsContentGap ?? 'md';
  if (gap === 'custom') {
    return clampExperienceDetailsContentGapPx(p.detailsContentGapPx, 16);
  }
  return EXPERIENCE_DETAILS_CONTENT_GAP_PRESET_PX[gap] ?? 16;
}

export function experienceStoryContentGapStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyContentGap' | 'storyContentGapPx'>
): CSSProperties {
  return { gap: `${resolveExperienceStoryContentGapPx(p)}px` };
}

export function experienceDetailsContentGapStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsContentGap' | 'detailsContentGapPx'>
): CSSProperties {
  return { gap: `${resolveExperienceDetailsContentGapPx(p)}px` };
}

export function isPortfolioExperienceStoryContentGap(
  value: unknown
): value is PortfolioExperienceStoryContentGap {
  return (
    value === 'none' ||
    value === 'sm' ||
    value === 'md' ||
    value === 'lg' ||
    value === 'xl' ||
    value === 'custom'
  );
}

export const isPortfolioExperienceDetailsContentGap = isPortfolioExperienceStoryContentGap;

export const EXPERIENCE_PERIOD_RULE_THICKNESS_MIN = 1;
export const EXPERIENCE_PERIOD_RULE_THICKNESS_MAX = 4;

export function clampExperiencePeriodRuleThickness(value: unknown, fallback = 1): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_PERIOD_RULE_THICKNESS_MIN,
    Math.min(EXPERIENCE_PERIOD_RULE_THICKNESS_MAX, Math.round(n))
  );
}

export function clampExperiencePeriodRuleOpacity(value: unknown, fallback = 70): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const clampExperienceTimelineRailOpacity = clampExperiencePeriodRuleOpacity;
export const clampExperienceToolsSeparatorOpacity = clampExperiencePeriodRuleOpacity;

function experienceHexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(212,212,212,${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

/** Vertical timeline rail (Classic / Accent) — color + opacity. */
export function experienceTimelineRailLineStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'timelineRailColor' | 'timelineRailOpacity' | 'accentColor'>,
  filled = false
): CSSProperties {
  const opacity = clampExperienceTimelineRailOpacity(p.timelineRailOpacity, 85) / 100;
  const hex = sanitizeHex(
    p.timelineRailColor,
    filled ? experienceAccentColor(p.accentColor) : '#d4d4d4'
  );
  return { backgroundColor: experienceHexToRgba(hex, opacity) };
}

export function experienceTimelineRailNodeStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'timelineRailColor' | 'timelineRailOpacity' | 'accentColor'>,
  filled = false
): CSSProperties {
  const opacity = clampExperienceTimelineRailOpacity(p.timelineRailOpacity, 85) / 100;
  const hex = sanitizeHex(p.timelineRailColor, experienceAccentColor(p.accentColor));
  const color = experienceHexToRgba(hex, Math.max(opacity, filled ? 0.85 : 0.9));
  return filled ? { backgroundColor: color } : { borderColor: color };
}

/** Magazine left accent stripe. */
export function experienceMagazineRailStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'timelineRailEnabled' | 'timelineRailColor' | 'timelineRailOpacity' | 'accentColor'>
): CSSProperties | undefined {
  if (p.timelineRailEnabled === false) return undefined;
  const opacity = clampExperienceTimelineRailOpacity(p.timelineRailOpacity, 85) / 100;
  const hex = sanitizeHex(p.timelineRailColor, experienceAccentColor(p.accentColor));
  return { backgroundColor: experienceHexToRgba(hex, opacity) };
}

/** Hairline above the Tools block. */
export function experienceToolsSeparatorStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'toolsSeparatorEnabled' | 'toolsSeparatorColor' | 'toolsSeparatorOpacity' | 'entryFrame'
  >
): CSSProperties | undefined {
  if (p.toolsSeparatorEnabled === false) return undefined;
  return experienceHairlineBorderTopStyle(p);
}

/**
 * Horizontal divider color — palette slot `toolsSeparator` → Global `bordure`
 * (falls back to entry frame border).
 */
export function resolveExperienceHairlineColor(
  p: Pick<PortfolioExperiencePresentationSettings, 'toolsSeparatorColor' | 'entryFrame'>
): string {
  const fromTools =
    typeof p.toolsSeparatorColor === 'string' ? p.toolsSeparatorColor.trim() : '';
  if (fromTools) return sanitizeHex(fromTools, '#d4d4d4');
  return sanitizeHex(
    p.entryFrame?.cardBorderColor,
    DEFAULT_EXPERIENCE_CARD_BORDER_COLOR
  );
}

/** Shared top hairline (skills footer, fiche sections, magazine rows, …). */
export function experienceHairlineBorderTopStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'toolsSeparatorColor' | 'toolsSeparatorOpacity' | 'entryFrame'
  >,
  opacityPercent?: number
): CSSProperties {
  const opacity =
    (opacityPercent ?? clampExperienceToolsSeparatorOpacity(p.toolsSeparatorOpacity, 55)) / 100;
  return {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: experienceHexToRgba(resolveExperienceHairlineColor(p), opacity),
  };
}

/** Shared bottom hairline (banner under media, entry separators, …). */
export function experienceHairlineBorderBottomStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'toolsSeparatorColor' | 'toolsSeparatorOpacity' | 'entryFrame'
  >,
  opacityPercent?: number
): CSSProperties {
  const opacity =
    (opacityPercent ?? clampExperienceToolsSeparatorOpacity(p.toolsSeparatorOpacity, 55)) / 100;
  return {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: experienceHexToRgba(resolveExperienceHairlineColor(p), opacity),
  };
}

function experiencePeriodRuleLuminance(hex: string): number {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Keep the hairline readable on the section surface (auto light/dark rescue). */
export function ensureExperiencePeriodRuleContrast(ruleHex: string, surfaceHex: string): string {
  const ruleLum = experiencePeriodRuleLuminance(ruleHex);
  const surfaceLum = experiencePeriodRuleLuminance(surfaceHex);
  if (Math.abs(ruleLum - surfaceLum) >= 0.16) return ruleHex;
  return surfaceLum > 0.55 ? '#a3a3a3' : '#e5e5e5';
}

/**
 * Resolve Magazine / Large period-rule color from the light/dark hex pair.
 * - Palette follow keeps both fields synced from Global Theme (clair + sombre).
 * - Manual mode uses the two hex pickers as-is (no auto-contrast rewrite).
 */
export function resolveExperiencePeriodRuleColor(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    | 'periodRuleColor'
    | 'periodRuleColorDark'
    | 'periodRuleFollowPalette'
    | 'useHeroPalette'
    | 'sectionBackgroundColor'
    | 'activeColorMode'
  >
): string {
  const mode = p.activeColorMode === 'light' ? 'light' : 'dark';
  const color =
    mode === 'light'
      ? sanitizeHex(p.periodRuleColor, '#a3a3a3')
      : sanitizeHex(p.periodRuleColorDark || p.periodRuleColor, '#e5e5e5');

  const followPalette = p.useHeroPalette !== false && p.periodRuleFollowPalette !== false;
  if (!followPalette) return color;

  const surface = sanitizeHex(
    p.sectionBackgroundColor,
    mode === 'light' ? '#ffffff' : '#0b0b0d'
  );
  return ensureExperiencePeriodRuleContrast(color, surface);
}

export function experiencePeriodRuleStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    | 'periodRuleColor'
    | 'periodRuleColorDark'
    | 'periodRuleFollowPalette'
    | 'periodRuleThickness'
    | 'periodRuleOpacity'
    | 'useHeroPalette'
    | 'sectionBackgroundColor'
    | 'activeColorMode'
  >
): CSSProperties {
  const thickness = clampExperiencePeriodRuleThickness(p.periodRuleThickness, 1);
  const opacity = clampExperiencePeriodRuleOpacity(p.periodRuleOpacity, 70) / 100;
  const color = resolveExperiencePeriodRuleColor(p);
  return {
    height: thickness,
    backgroundColor: color,
    opacity,
    alignSelf: 'center',
  };
}

export const PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceAsidePlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'Details right / below',
    description:
      'Story (title, meta, description) first — details on the right, or below when stacked.',
  },
  {
    value: 'left',
    label: 'Details left / above',
    description:
      'Details panel first — on the left side-by-side, or above the story when stacked.',
  },
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Everything in one vertical column (display order).',
  },
  {
    value: 'inline',
    label: 'Inline',
    description: 'Fold details into the story column — no side panel.',
  },
];

export const PORTFOLIO_EXPERIENCE_BENTO_DETAILS_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceBentoDetailsPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'aside',
    label: 'À côté (colonne)',
    description: 'Tasks et Proof restent dans la colonne détails, à côté du récit.',
  },
  {
    value: 'under-media',
    label: 'Sous la photo (largeur alignée)',
    description:
      'Sous l’image, largeur = photo + description (même bord droit que le récit).',
  },
  {
    value: 'under-story',
    label: 'Sous la description',
    description:
      'Magazine : la fiche (tasks, tools, proof…) passe sous la description — 2 colonnes inégales (infos | média).',
  },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_PLACEMENT_OPTIONS: {
  value: PortfolioExperienceEntryMediaPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'outside-right',
    label: 'Hors carte (droite)',
    description: 'Image dans l’espace vide à droite de la carte — pas dans le fond.',
  },
  {
    value: 'outside-left',
    label: 'Hors carte (gauche)',
    description: 'Image à gauche de la carte, hors du fond.',
  },
  {
    value: 'aside-right',
    label: 'Dans la carte (droite)',
    description: 'Image à l’intérieur de la carte, à droite du texte.',
  },
  {
    value: 'aside-left',
    label: 'Dans la carte (gauche)',
    description: 'Image à l’intérieur de la carte, à gauche du texte.',
  },
  {
    value: 'story-top',
    label: 'Au-dessus du contenu',
    description: 'Image au-dessus du texte — taille réglable (S–XL / manuel).',
  },
  {
    value: 'entry-top',
    label: 'Au-dessus de l’entrée',
    description: 'Image au-dessus de toute l’entrée — taille réglable (S–XL / manuel).',
  },
  {
    value: 'hidden',
    label: 'Masquée',
    description: 'Ne pas afficher l’image même si elle est définie dans Studio.',
  },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_SIZE_OPTIONS: {
  value: Exclude<PortfolioExperienceEntryMediaSize, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Petite vignette — peu d’espace pris.' },
  { value: 'md', label: 'M', description: 'Taille équilibrée (défaut).' },
  {
    value: 'lg',
    label: 'L',
    description: 'Plus grande — décale automatiquement le texte à côté.',
  },
  {
    value: 'full',
    label: 'XL',
    description: 'Très grande — pousse fort le récit / les détails à côté.',
  },
];

/** Desktop width (px) synced when picking a size preset. */
export const EXPERIENCE_ENTRY_MEDIA_SIZE_PRESET_PX: Record<
  Exclude<PortfolioExperienceEntryMediaSize, 'custom'>,
  number
> = {
  sm: 176,
  md: 224,
  lg: 288,
  full: 352,
};

export const EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MIN = 120;
export const EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MAX = 480;

export function clampExperienceEntryMediaSizePx(value: unknown, fallback = 224): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MIN,
    Math.min(EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MAX, Math.round(n))
  );
}

export function resolveExperienceEntryMediaSizePx(
  p: Pick<PortfolioExperiencePresentationSettings, 'entryMediaSize' | 'entryMediaSizePx'>
): number {
  const size = p.entryMediaSize ?? 'md';
  if (size === 'custom') {
    return clampExperienceEntryMediaSizePx(p.entryMediaSizePx, 224);
  }
  return EXPERIENCE_ENTRY_MEDIA_SIZE_PRESET_PX[size] ?? 224;
}

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_RADIUS_OPTIONS: {
  value: PortfolioExperienceEntryMediaRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Square corners.' },
  { value: 'sm', label: 'S', description: 'Slight rounding.' },
  { value: 'md', label: 'M', description: 'Medium rounding.' },
  { value: 'lg', label: 'L', description: 'Generous rounding.' },
  { value: 'xl', label: 'XL', description: 'Very rounded.' },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_ASPECT_OPTIONS: {
  value: PortfolioExperienceEntryMediaAspect;
  label: string;
  description: string;
}[] = [
  { value: 'auto', label: 'Auto', description: 'Natural media proportions.' },
  { value: '1/1', label: '1:1', description: 'Square crop.' },
  { value: '4/5', label: '4:5', description: 'Portrait editorial (default).' },
  { value: '3/2', label: '3:2', description: 'Landscape photo.' },
  { value: '16/9', label: '16:9', description: 'Widescreen / video.' },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_FIT_OPTIONS: {
  value: PortfolioExperienceEntryMediaFit;
  label: string;
  description: string;
}[] = [
  {
    value: 'cover',
    label: 'Remplir (cover)',
    description: 'Remplit entièrement le cadre ; les bords peuvent être recadrés.',
  },
  {
    value: 'contain',
    label: 'Afficher entier (contain)',
    description: 'Conserve tout le média dans le cadre, avec des marges si nécessaire.',
  },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_POSITION_OPTIONS: {
  value: PortfolioExperienceEntryMediaPosition;
  label: string;
  description: string;
}[] = [
  { value: 'center', label: 'Centre', description: 'Point focal au centre.' },
  { value: 'top', label: 'Haut', description: 'Privilégie le haut du média.' },
  { value: 'bottom', label: 'Bas', description: 'Privilégie le bas du média.' },
  { value: 'left', label: 'Gauche', description: 'Privilégie le bord gauche.' },
  { value: 'right', label: 'Droite', description: 'Privilégie le bord droit.' },
  { value: 'top-left', label: 'Haut gauche', description: 'Point focal dans le coin supérieur gauche.' },
  { value: 'top-right', label: 'Haut droite', description: 'Point focal dans le coin supérieur droit.' },
  { value: 'bottom-left', label: 'Bas gauche', description: 'Point focal dans le coin inférieur gauche.' },
  { value: 'bottom-right', label: 'Bas droite', description: 'Point focal dans le coin inférieur droit.' },
];

export const PORTFOLIO_EXPERIENCE_MAGAZINE_COLUMN_RATIO_OPTIONS: {
  value: PortfolioExperienceMagazineColumnRatio;
  label: string;
  description: string;
}[] = [
  {
    value: 'balanced',
    label: 'Équilibré 50 / 50',
    description: 'Image et contenu occupent chacun la moitié de la largeur.',
  },
  {
    value: 'content-wide',
    label: 'Contenu large',
    description: 'Donne davantage de largeur au texte et aux détails.',
  },
  {
    value: 'media-wide',
    label: 'Image large (actuel)',
    description: 'Conserve la composition Magazine historique avec un visuel dominant.',
  },
];

export const EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MIN = 32;
export const EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MAX = 160;

export function clampExperienceMagazineSeparatorSpacingPx(
  value: unknown,
  fallback = 64
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MIN,
    Math.min(EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MAX, Math.round(n))
  );
}

export const PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_HEIGHT_OPTIONS: {
  value: Exclude<PortfolioExperienceEntryMediaHeight, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'auto', label: 'Auto', description: 'Suit le format — XL est plafonné pour ne pas exploser.' },
  { value: 'sm', label: 'S', description: 'Cadre bas (~180px).' },
  { value: 'md', label: 'M', description: 'Hauteur moyenne (~240px).' },
  { value: 'lg', label: 'L', description: 'Cadre haut (~320px).' },
  { value: 'xl', label: 'XL', description: 'Cadre très haut (~400px).' },
];

/** Desktop height (px) synced when picking a height preset (not auto). */
export const EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX: Record<
  Exclude<PortfolioExperienceEntryMediaHeight, 'auto' | 'custom'>,
  number
> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 400,
};

export const EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MIN = 120;
export const EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MAX = 640;

/** Soft max height when size is XL and height mode is auto (avoids full-viewport portraits). */
export const EXPERIENCE_ENTRY_MEDIA_XL_AUTO_MAX_PX = 360;

export function clampExperienceEntryMediaHeightPx(value: unknown, fallback = 280): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MIN,
    Math.min(EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MAX, Math.round(n))
  );
}

export function resolveExperienceEntryMediaHeightPx(
  p: Pick<PortfolioExperiencePresentationSettings, 'entryMediaHeight' | 'entryMediaHeightPx' | 'entryMediaSize'>
): number | null {
  const height = p.entryMediaHeight ?? 'auto';
  if (height === 'custom') {
    return clampExperienceEntryMediaHeightPx(p.entryMediaHeightPx, 280);
  }
  if (height === 'auto') {
    // XL width + tall aspect otherwise dominates the viewport — cap it.
    if ((p.entryMediaSize ?? 'md') === 'full') {
      return EXPERIENCE_ENTRY_MEDIA_XL_AUTO_MAX_PX;
    }
    return null;
  }
  return EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX[height] ?? 240;
}

export function experienceEntryMediaUsesFixedHeight(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'entryMediaHeight' | 'entryMediaHeightPx' | 'entryMediaSize'
  >
): boolean {
  return resolveExperienceEntryMediaHeightPx(p) != null;
}

export function experienceEntryMediaHeightStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'entryMediaHeight' | 'entryMediaHeightPx' | 'entryMediaSize'
  >
): CSSProperties | undefined {
  const px = resolveExperienceEntryMediaHeightPx(p);
  if (px == null) return undefined;
  return {
    height: `${px}px`,
    maxHeight: `${px}px`,
  };
}

/**
 * Stepped cards panoramic banner — always a fixed height.
 * Honors Hauteur presets / manual px; Auto defaults to M (240px).
 */
export function resolveExperienceSteppedBannerHeightPx(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'entryMediaHeight' | 'entryMediaHeightPx' | 'entryMediaSize'
  >
): number {
  const height = p.entryMediaHeight ?? 'auto';
  if (height === 'custom') {
    return clampExperienceEntryMediaHeightPx(p.entryMediaHeightPx, 240);
  }
  if (height === 'auto') {
    return EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX.md;
  }
  return EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX[height] ?? EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX.md;
}

export function experienceEntryMediaRadiusClass(
  radius: PortfolioExperienceEntryMediaRadius
): string {
  return servicesCardRadiusClass(radius);
}

export function experienceEntryMediaAspectClass(
  aspect: PortfolioExperienceEntryMediaAspect
): string {
  switch (aspect) {
    case '1/1':
      return 'aspect-square';
    case '4/5':
      return 'aspect-[4/5]';
    case '16/9':
      return 'aspect-[16/9]';
    case '3/2':
      return 'aspect-[3/2]';
    default:
      return '';
  }
}

export function experienceEntryMediaPositionClass(
  position: PortfolioExperienceEntryMediaPosition
): string {
  switch (position) {
    case 'top':
      return 'object-top';
    case 'bottom':
      return 'object-bottom';
    case 'left':
      return 'object-left';
    case 'right':
      return 'object-right';
    case 'top-left':
      return 'object-left-top';
    case 'top-right':
      return 'object-right-top';
    case 'bottom-left':
      return 'object-left-bottom';
    case 'bottom-right':
      return 'object-right-bottom';
    default:
      return 'object-center';
  }
}

export function experienceEntryMediaIsOutside(
  placement: PortfolioExperienceEntryMediaPlacement | undefined
): boolean {
  return placement === 'outside-right' || placement === 'outside-left';
}

export function experienceEntryMediaSizeClass(
  size: PortfolioExperienceEntryMediaSize,
  placement: PortfolioExperienceEntryMediaPlacement
): string {
  // Outside placements use the same column widths as aside (not top stretch).
  // Mobile: always full container width; size caps apply from lg up only.
  // Explicit lg widths so bento `lg:w-fit` columns grow and push the story.
  // Top placements (story-top / entry-top): same size scale via max-width + center.
  const isTop =
    !experienceEntryMediaIsOutside(placement) &&
    (placement === 'story-top' || placement === 'entry-top');
  if (size === 'custom') {
    return isTop
      ? 'w-full max-w-none lg:mx-auto lg:max-w-[var(--experience-media-w)]'
      : 'w-full max-w-none lg:!w-[var(--experience-media-w)]';
  }
  if (size === 'full') {
    return isTop
      ? 'w-full max-w-none'
      : 'w-full max-w-none lg:w-[22rem] xl:w-[28rem]';
  }
  switch (size) {
    case 'sm':
      return isTop
        ? 'w-full max-w-none lg:mx-auto lg:max-w-[11rem] xl:max-w-[12rem]'
        : 'w-full max-w-none lg:w-[11rem] xl:w-[12rem]';
    case 'lg':
      return isTop
        ? 'w-full max-w-none lg:mx-auto lg:max-w-[20rem] xl:max-w-[24rem]'
        : 'w-full max-w-none lg:w-[18rem] xl:w-[22rem]';
    default:
      return isTop
        ? 'w-full max-w-none lg:mx-auto lg:max-w-[15rem] xl:max-w-[17rem]'
        : 'w-full max-w-none lg:w-[14rem] xl:w-[16rem]';
  }
}

export function experienceEntryMediaSizeStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'entryMediaSize' | 'entryMediaSizePx' | 'entryMediaPlacement'
  >
): CSSProperties | undefined {
  if ((p.entryMediaSize ?? 'md') !== 'custom') return undefined;
  const px = resolveExperienceEntryMediaSizePx(p);
  return { ['--experience-media-w' as string]: `${px}px` };
}

/** True when the entry should render media (URL present + settings allow it). */
export function experienceEntryHasMedia(
  block: { mediaUrl?: string | null },
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'showEntryMedia' | 'entryMediaPlacement'
  >
): boolean {
  if (presentation.showEntryMedia === false) return false;
  if (presentation.entryMediaPlacement === 'hidden') return false;
  return Boolean(typeof block.mediaUrl === 'string' && block.mediaUrl.trim());
}

export const PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS: {
  value: PortfolioExperienceToolsZone;
  label: string;
  description: string;
}[] = [
  {
    value: 'details',
    label: 'Right details card',
    description: 'Tools stay with tasks, proof, and skills on the details side.',
  },
  {
    value: 'story',
    label: 'Left under description',
    description: 'Tools sit at the bottom of the story column (under the description).',
  },
  {
    value: 'entry',
    label: 'Outside under column',
    description: 'Icons sit on the entry background, just under the left or right column.',
  },
];

export const PORTFOLIO_EXPERIENCE_PROOF_ZONE_OPTIONS: {
  value: PortfolioExperienceProofZone;
  label: string;
  description: string;
}[] = [
  {
    value: 'details',
    label: 'Carte détails',
    description: 'Les liens Proof restent dans la carte détails (avec tasks, skills…).',
  },
  {
    value: 'story',
    label: 'Carte story',
    description: 'Les liens Proof s’affichent dans la colonne story.',
  },
  {
    value: 'under-media',
    label: 'Sous le média',
    description: 'Les liens Proof s’affichent sous l’image de l’expérience.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS: {
  value: PortfolioExperienceToolsEntrySide;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Under left column',
    description: 'Just under the left column (story when details are on the right).',
  },
  {
    value: 'right',
    label: 'Under right column',
    description: 'Just under the right column (details card when details are on the right).',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS: {
  value: PortfolioExperienceToolsDisplay;
  label: string;
  description: string;
}[] = [
  {
    value: 'icons-and-labels',
    label: 'Icons + labels',
    description: 'Show tool logo and name.',
  },
  {
    value: 'icons',
    label: 'Icons only',
    description: 'Show logos without text labels.',
  },
  {
    value: 'stacked',
    label: 'Stacked icons',
    description: 'Overlapping circular logos in a compact stack.',
  },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS: {
  value: PortfolioExperienceToolsIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact logos.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'More visible logos.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-sized tool icons.' },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_ICON_BORDER_OPTIONS: {
  value: PortfolioExperienceToolsIconBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No ring around tool logos.' },
  { value: 'soft', label: 'Soft', description: 'Light, low-contrast outline.' },
  { value: 'solid', label: 'Solid', description: 'Clear outline using the icon border color.' },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_CHROME_BORDER_OPTIONS: {
  value: PortfolioExperienceToolsChromeSettings['border'];
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No outline on the tools group.' },
  { value: 'soft', label: 'Soft', description: 'Light border with subtle shadow.' },
  { value: 'solid', label: 'Solid', description: 'Clear border using the chrome border color.' },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_CHROME_RADIUS_OPTIONS: {
  value: PortfolioExperienceToolsChromeBorderRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Square', description: 'Sharp corners.' },
  { value: 'sm', label: 'Small', description: 'Subtle rounding.' },
  { value: 'md', label: 'Medium', description: 'Balanced corners.' },
  { value: 'lg', label: 'Large', description: 'Soft card-like corners.' },
  { value: 'xl', label: 'Extra large', description: 'Very rounded surface.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule.' },
];

export const PORTFOLIO_EXPERIENCE_TOOLS_CHROME_PADDING_OPTIONS: {
  value: PortfolioServicesCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No inner padding.' },
  { value: 'sm', label: 'Compact', description: '16px inner padding.' },
  { value: 'md', label: 'Standard', description: '24px inner padding.' },
  { value: 'lg', label: 'Comfortable', description: '36px inner padding.' },
];

export const PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS: {
  value: PortfolioExperienceSkillsTagStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'soft',
    label: 'Soft chips',
    description: 'Muted gray pills — current default.',
  },
  {
    value: 'pill',
    label: 'Accent pills',
    description: 'White pills with a small accent mark.',
  },
  {
    value: 'outline',
    label: 'Outlined',
    description: 'Bordered white chips, similar to tool labels.',
  },
  {
    value: 'plain',
    label: 'Plain text',
    description: 'Minimal text tags without chrome.',
  },
];

export const PORTFOLIO_EXPERIENCE_PROOF_LINK_STYLE_OPTIONS: {
  value: PortfolioExperienceProofLinkStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'pill',
    label: 'Pills',
    description: 'Rounded chips with border — no list bullet.',
  },
  {
    value: 'soft',
    label: 'Soft chips',
    description: 'Muted filled chips, quieter than pills.',
  },
  {
    value: 'outline',
    label: 'Outlined',
    description: 'Squared chips with a clear border.',
  },
  {
    value: 'plain',
    label: 'Plain text',
    description: 'Label + arrow only, no chip background.',
  },
  {
    value: 'accent',
    label: 'Accent button',
    description: 'Solid accent fill for stronger CTAs.',
  },
  {
    value: 'underline',
    label: 'Underline',
    description: 'Classic text link with underline.',
  },
];

export const PORTFOLIO_EXPERIENCE_TEXT_SIZE_OPTIONS: {
  value: PortfolioExperienceTextSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact body text.' },
  { value: 'md', label: 'Medium', description: 'Default readable size.' },
  { value: 'lg', label: 'Large', description: 'More prominent.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-level emphasis.' },
];

export const PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS: {
  value: PortfolioExperienceStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'title', label: 'Job title', description: 'Main role title in the entry.' },
  { value: 'organization', label: 'Organization', description: 'Company or freelance label.' },
  { value: 'meta', label: 'Meta chips', description: 'Status, employment, location.' },
  { value: 'description', label: 'Description', description: 'Role summary paragraph.' },
  { value: 'blockLabel', label: 'Block labels', description: 'TASKS, PROOF, NOTE, SKILLS, TOOLS headings.' },
  { value: 'tasks', label: 'Tasks', description: 'Bullet list items.' },
  { value: 'proof', label: 'Proof links', description: 'Proof pill labels.' },
  { value: 'note', label: 'Note', description: 'Remarks / italic note.' },
  { value: 'skills', label: 'Skills tags', description: 'Skill tag text.' },
  { value: 'tools', label: 'Tools text', description: 'Tool chip labels (when shown).' },
];

export function resolveExperienceBlockLabel(
  custom: string | undefined,
  fallback: string
): string {
  const trimmed = custom?.trim();
  return trimmed ? trimmed : fallback;
}

export function normalizeExperienceBlockLabelVisibility(
  raw: unknown,
  fallback: PortfolioExperienceBlockLabelVisibility = DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY
): PortfolioExperienceBlockLabelVisibility {
  const base = { ...fallback };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const record = raw as Record<string, unknown>;
  for (const id of EXPERIENCE_BLOCK_LABEL_IDS) {
    if (typeof record[id] === 'boolean') base[id] = record[id];
  }
  return base;
}

/** Master showBlockLabels + per-block toggle. */
export function experienceBlockLabelVisible(
  presentation: Pick<PortfolioExperiencePresentationSettings, 'showBlockLabels'> & {
    blockLabelVisibility?: PortfolioExperienceBlockLabelVisibility;
  },
  id: PortfolioExperienceBlockLabelId
): boolean {
  if (presentation.showBlockLabels === false) return false;
  const visibility = normalizeExperienceBlockLabelVisibility(
    presentation.blockLabelVisibility,
    DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY
  );
  return visibility[id] !== false;
}

export function normalizeExperienceTextStyle(
  raw: unknown,
  fallback: PortfolioExperienceTextStyle
): PortfolioExperienceTextStyle {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
  const record = raw as Record<string, unknown>;
  const font =
    record.font === 'sans' || record.font === 'serif' || record.font === 'display'
      ? record.font
      : fallback.font;
  const size =
    record.size === 'sm' || record.size === 'md' || record.size === 'lg' || record.size === 'xl'
      ? record.size
      : fallback.size;
  const color = sanitizeHex(record.color, fallback.color);
  return {
    color,
    colorDark: sanitizeHex(record.colorDark, fallback.colorDark || color),
    font,
    size,
    italic: typeof record.italic === 'boolean' ? record.italic : fallback.italic,
    bold: typeof record.bold === 'boolean' ? record.bold : fallback.bold,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : fallback.uppercase,
  };
}

export function normalizeExperienceElementStyles(raw: unknown): PortfolioExperienceElementStyles {
  const next: PortfolioExperienceElementStyles = {
    title: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.title },
    organization: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.organization },
    meta: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.meta },
    description: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.description },
    blockLabel: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.blockLabel },
    tasks: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.tasks },
    proof: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.proof },
    note: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.note },
    skills: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.skills },
    tools: { ...DEFAULT_EXPERIENCE_ELEMENT_STYLES.tools },
  };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of EXPERIENCE_STYLE_TARGET_IDS) {
    next[id] = normalizeExperienceTextStyle(record[id], DEFAULT_EXPERIENCE_ELEMENT_STYLES[id]);
  }
  return next;
}

export function patchExperienceElementStyle(
  styles: PortfolioExperienceElementStyles,
  target: PortfolioExperienceStyleTarget,
  patch: Partial<PortfolioExperienceTextStyle>
): PortfolioExperienceElementStyles {
  return normalizeExperienceElementStyles({
    ...styles,
    [target]: { ...styles[target], ...patch },
  });
}

export function experienceTextSizeClass(
  size: PortfolioExperienceTextSize,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  if (role === 'title') {
    switch (size) {
      case 'sm':
        return 'text-xl sm:text-2xl';
      case 'lg':
        return 'text-3xl sm:text-4xl';
      case 'xl':
        return 'text-3xl font-bold sm:text-4xl lg:text-[2.6rem]';
      default:
        return 'text-2xl sm:text-3xl';
    }
  }
  if (role === 'label') {
    switch (size) {
      case 'sm':
        return 'text-[11px]';
      case 'lg':
        return 'text-sm';
      case 'xl':
        return 'text-base';
      default:
        return 'text-xs';
    }
  }
  switch (size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-xl';
    default:
      return 'text-base';
  }
}

export function experienceTextStyleClass(
  style: PortfolioExperienceTextStyle,
  role: 'title' | 'body' | 'label' = 'body'
): string {
  const parts = [experienceTextSizeClass(style.size, role)];
  if (style.font === 'serif') parts.push('font-serif');
  if (style.italic) parts.push('italic');
  if (style.bold) {
    parts.push(role === 'title' ? 'font-bold' : 'font-semibold');
  } else {
    parts.push('font-normal');
  }
  if (style.uppercase) {
    parts.push(role === 'label' ? 'uppercase tracking-[0.16em]' : 'uppercase tracking-[0.08em]');
  }
  return parts.join(' ');
}

export function experienceTextInlineStyle(style: PortfolioExperienceTextStyle): CSSProperties {
  return {
    color: sanitizeHex(style.color, DEFAULT_EXPERIENCE_BODY_COLOR),
    ...experienceHeaderFontStyle(style.font),
  };
}

export function experienceChipChromeStyle(
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'entryChipBackgroundColor' | 'entryChipBorderColor'
  >
): CSSProperties {
  return {
    backgroundColor: sanitizeHex(
      presentation.entryChipBackgroundColor,
      DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR
    ),
    borderColor: sanitizeHex(
      presentation.entryChipBorderColor,
      DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR
    ),
    borderStyle: 'solid',
    borderWidth: 1,
  };
}

/** Soft skills / meta chips — same family as pill chrome, slightly translucent. */
export function experienceSoftChipChromeStyle(
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'entryChipBackgroundColor' | 'entryChipBorderColor'
  >
): CSSProperties {
  const fill = sanitizeHex(
    presentation.entryChipBackgroundColor,
    DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR
  );
  return {
    backgroundColor: `color-mix(in srgb, ${fill} 88%, transparent)`,
    borderColor: 'transparent',
  };
}

export function experienceToolsIconPixelSize(size: PortfolioExperienceToolsIconSize): number {
  switch (size) {
    case 'sm':
      return 20;
    case 'lg':
      return 32;
    case 'xl':
      return 40;
    default:
      return 26;
  }
}

export function experienceToolsIconShellClass(size: PortfolioExperienceToolsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 w-9';
    case 'lg':
      return 'h-12 w-12';
    case 'xl':
      return 'h-16 w-16';
    default:
      return 'h-11 w-11';
  }
}

export function experienceToolsIconBorderClass(
  border: PortfolioExperienceToolsIconBorder = 'solid'
): string {
  switch (border) {
    case 'none':
      return 'border-0';
    case 'soft':
      return 'border border-black/10';
    default:
      return 'border';
  }
}

/** Surface + outline for tools logo chips (independent from skills / proof chips). */
export function experienceToolsIconChromeStyle(
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    | 'toolsIconBackgroundEnabled'
    | 'toolsIconBackgroundColor'
    | 'entryChipBorderColor'
    | 'toolsIconBorder'
    | 'toolsIconBorderColor'
  >
): CSSProperties {
  const backgroundEnabled = presentation.toolsIconBackgroundEnabled !== false;
  const fill = backgroundEnabled
    ? sanitizeHex(presentation.toolsIconBackgroundColor, DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR)
    : 'transparent';
  const border = presentation.toolsIconBorder ?? 'solid';
  if (border === 'none') {
    return {
      backgroundColor: fill,
      borderColor: 'transparent',
      borderStyle: 'solid',
      borderWidth: 0,
    };
  }
  return {
    backgroundColor: fill,
    borderColor: sanitizeHex(
      presentation.toolsIconBorderColor || presentation.entryChipBorderColor,
      DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR
    ),
    borderStyle: 'solid',
    borderWidth: 1,
  };
}

function experienceToolsChromeRadiusClass(radius: PortfolioExperienceToolsChromeBorderRadius): string {
  if (radius === 'full') return 'rounded-full';
  return servicesCardRadiusClass(radius);
}

/** Class names for the tools group chrome surface (when enabled). */
export function experienceToolsChromeClass(
  chrome: PortfolioExperienceToolsChromeSettings | undefined
): string {
  if (!chrome?.enabled) return '';
  const parts = [
    chrome.fitContent ? 'w-fit max-w-full' : 'w-full min-w-0',
    experienceToolsChromeRadiusClass(chrome.borderRadius),
    chrome.padding === 'custom' ? '' : servicesCardPaddingClass(chrome.padding),
  ];
  if (chrome.border !== 'none') {
    parts.push(experienceCardBorderWidthClass(chrome.border));
    if (chrome.border === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function experienceToolsChromeStyle(
  chrome: PortfolioExperienceToolsChromeSettings | undefined
): CSSProperties | undefined {
  if (!chrome?.enabled) return undefined;
  const style: CSSProperties = {};
  if (chrome.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(chrome.backgroundColor, '#fafafa');
  }
  if (chrome.border === 'soft' || chrome.border === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.borderColor, DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR);
  }
  if (chrome.padding === 'custom') {
    style.padding = `${resolveExperienceToolsChromePaddingPx(chrome)}px`;
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

/** Card-style designs that can sit in a multi-column grid. */
export function experienceDesignSupportsItemsPerRow(design: PortfolioExperienceDesign): boolean {
  return design === 'stacked' || design === 'timeline-stepped' || design === 'large';
}

/** Designs that already use an entry card shell by default. */
export function experienceDesignUsesEntryCard(design: PortfolioExperienceDesign): boolean {
  return design === 'stacked' || design === 'large' || design === 'timeline-stepped';
}

export function normalizeExperienceElementZones(raw: unknown): PortfolioExperienceElementZones {
  const next: PortfolioExperienceElementZones = { ...DEFAULT_EXPERIENCE_ELEMENT_ZONES };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of EXPERIENCE_ELEMENT_IDS) {
    const value = record[id];
    if (value === 'story' || value === 'details') next[id] = value;
  }
  return next;
}

/** Resolved card/outside zone for one element (tools/proof may sit outside via toolsZone/proofZone). */
export function resolveExperienceElementZone(
  id: PortfolioExperienceElementId,
  zones: PortfolioExperienceElementZones,
  toolsZone: PortfolioExperienceToolsZone = 'details',
  proofZone: PortfolioExperienceProofZone = 'details'
): PortfolioExperienceCardZone | 'entry' | 'under-media' {
  if (id === 'tools') {
    if (toolsZone === 'entry') return 'entry';
    return toolsZone;
  }
  if (id === 'proof') {
    if (proofZone === 'under-media') return 'under-media';
    return proofZone;
  }
  return zones[id] ?? DEFAULT_EXPERIENCE_ELEMENT_ZONES[id];
}

export function isExperienceStoryElement(
  id: PortfolioExperienceElementId,
  toolsZone: PortfolioExperienceToolsZone = 'details',
  zones: PortfolioExperienceElementZones = DEFAULT_EXPERIENCE_ELEMENT_ZONES,
  proofZone: PortfolioExperienceProofZone = 'details'
): boolean {
  return resolveExperienceElementZone(id, zones, toolsZone, proofZone) === 'story';
}

export function isExperienceDetailsElement(
  id: PortfolioExperienceElementId,
  toolsZone: PortfolioExperienceToolsZone = 'details',
  zones: PortfolioExperienceElementZones = DEFAULT_EXPERIENCE_ELEMENT_ZONES,
  proofZone: PortfolioExperienceProofZone = 'details'
): boolean {
  return resolveExperienceElementZone(id, zones, toolsZone, proofZone) === 'details';
}

export function isExperienceEntryToolsZone(toolsZone: PortfolioExperienceToolsZone): boolean {
  return toolsZone === 'entry';
}

export function normalizeExperienceElementOrder(raw: unknown): PortfolioExperienceElementId[] {
  const allowed = new Set<string>(EXPERIENCE_ELEMENT_IDS);
  const seen = new Set<string>();
  const ordered: PortfolioExperienceElementId[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item !== 'string' || !allowed.has(item) || seen.has(item)) continue;
      seen.add(item);
      ordered.push(item as PortfolioExperienceElementId);
    }
  }
  for (const id of EXPERIENCE_ELEMENT_IDS) {
    if (!seen.has(id)) ordered.push(id);
  }
  return ordered;
}

export function moveExperienceElementOrder(
  order: PortfolioExperienceElementId[],
  index: number,
  direction: -1 | 1
): PortfolioExperienceElementId[] {
  const next = normalizeExperienceElementOrder(order);
  const target = index + direction;
  if (index < 0 || index >= next.length || target < 0 || target >= next.length) return next;
  const copy = [...next];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

/** Move an element to the other inner card (story ↔ details). Syncs toolsZone/proofZone when needed. */
export function moveExperienceElementToCardZone(
  zones: PortfolioExperienceElementZones,
  id: PortfolioExperienceElementId,
  zone: PortfolioExperienceCardZone,
  toolsZone: PortfolioExperienceToolsZone,
  elementOrder?: PortfolioExperienceElementId[],
  proofZone: PortfolioExperienceProofZone = 'details'
): {
  elementZones: PortfolioExperienceElementZones;
  toolsZone: PortfolioExperienceToolsZone;
  proofZone?: PortfolioExperienceProofZone;
  elementOrder?: PortfolioExperienceElementId[];
} {
  const elementZones = normalizeExperienceElementZones({ ...zones, [id]: zone });
  if (id === 'tools') {
    return {
      elementZones,
      toolsZone: zone,
      ...(zone === 'story' && elementOrder
        ? { elementOrder: pinExperienceElementAfter(elementOrder, 'tools', 'description') }
        : {}),
    };
  }
  if (id === 'proof') {
    return {
      elementZones,
      toolsZone,
      proofZone: zone,
    };
  }
  return { elementZones, toolsZone, proofZone };
}

/** Place `id` immediately after `afterId` in the display order (or append if missing). */
export function pinExperienceElementAfter(
  order: PortfolioExperienceElementId[],
  id: PortfolioExperienceElementId,
  afterId: PortfolioExperienceElementId
): PortfolioExperienceElementId[] {
  const next = normalizeExperienceElementOrder(order).filter((item) => item !== id);
  const anchor = next.indexOf(afterId);
  if (anchor === -1) return [...next, id];
  next.splice(anchor + 1, 0, id);
  return next;
}

/** Apply Tools placement and keep story-column Tools pinned under the description. */
export function patchExperienceToolsPlacement(
  experience: Pick<
    PortfolioExperiencePresentationSettings,
    'elementOrder' | 'elementZones' | 'toolsEntrySide'
  >,
  toolsZone: PortfolioExperienceToolsZone,
  toolsEntrySide?: PortfolioExperienceToolsEntrySide
): Partial<PortfolioExperiencePresentationSettings> {
  const elementZones = normalizeExperienceElementZones(
    toolsZone === 'story' || toolsZone === 'details'
      ? { ...experience.elementZones, tools: toolsZone }
      : experience.elementZones
  );
  const elementOrder =
    toolsZone === 'story'
      ? pinExperienceElementAfter(experience.elementOrder, 'tools', 'description')
      : normalizeExperienceElementOrder(experience.elementOrder);

  return {
    toolsZone,
    elementZones,
    elementOrder,
    ...(toolsEntrySide ? { toolsEntrySide } : toolsZone === 'entry' ? { toolsEntrySide: experience.toolsEntrySide } : {}),
  };
}

/** Apply Proof placement (story / details / under media) and sync elementZones when on a card. */
export function patchExperienceProofPlacement(
  experience: Pick<PortfolioExperiencePresentationSettings, 'elementZones'>,
  proofZone: PortfolioExperienceProofZone
): Partial<PortfolioExperiencePresentationSettings> {
  return {
    proofZone,
    elementZones:
      proofZone === 'story' || proofZone === 'details'
        ? normalizeExperienceElementZones({ ...experience.elementZones, proof: proofZone })
        : experience.elementZones,
  };
}

export const PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS: {
  value: PortfolioExperienceYearsPreset;
  label: string;
  description: string;
}[] = [
  {
    value: 'default',
    label: 'Hands-on',
    description: '{years}+ years of hands-on experience in my field.',
  },
  {
    value: 'hands-on',
    label: 'Field expertise',
    description: '{years}+ years mastering my craft and delivering results.',
  },
  {
    value: 'industry',
    label: 'Industry',
    description: '{years}+ years building expertise across the industry.',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Over {years} years of professional experience.',
  },
  {
    value: 'creative',
    label: 'Creative',
    description: '{years}+ years crafting stories and content for clients worldwide.',
  },
  { value: 'custom', label: 'Custom', description: 'Write your own phrase — use {years} for the count.' },
];

export const PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS: {
  value: PortfolioExperienceYearsSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export const PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioExperienceContentAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default left alignment.' },
  { value: 'center', label: 'Center', description: 'Center the years phrase.' },
  { value: 'right', label: 'Right', description: 'Right-aligned years phrase.' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioExperienceSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Roles, milestones, and the path that shaped my craft.',
  career: 'A clear look at where I have worked and what I have built along the way.',
};

const TITLE_PRESET_COPY: Record<Exclude<PortfolioExperienceTitlePreset, 'custom'>, string> = {
  experience: 'EXPERIENCE',
  'career-path': 'CAREER PATH',
  'work-history': 'WORK HISTORY',
  'professional-journey': 'PROFESSIONAL JOURNEY',
};

const YEARS_PRESET_COPY: Record<
  Exclude<PortfolioExperienceYearsPreset, 'default' | 'custom'>,
  string
> = {
  'hands-on': '{years}+ years mastering my craft and delivering results.',
  industry: '{years}+ years building expertise across the industry.',
  professional: 'Over {years} years of professional experience.',
  creative: '{years}+ years crafting stories and content for clients worldwide.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function resolveExperienceSectionTitle(
  settings: Pick<PortfolioExperienceSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  const raw = (() => {
    switch (settings.titlePreset) {
      case 'custom':
        return settings.titleCustom.trim() || settings.title.trim() || 'Experience';
      case 'career-path':
      case 'work-history':
      case 'professional-journey':
      case 'experience':
        return TITLE_PRESET_COPY[settings.titlePreset];
      default:
        return settings.title.trim() || 'Experience';
    }
  })();
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveExperienceSectionSubtitle(
  settings: Pick<PortfolioExperienceSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'career':
      return SUBTITLE_PRESET_COPY.career;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function experienceHeaderFontClass(
  font: PortfolioExperienceHeaderFont,
  kind: 'title' | 'subtitle'
): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.1em]';
    default:
      return 'leading-relaxed';
  }
}

export function experienceHeaderFontStyle(_font: PortfolioExperienceHeaderFont): CSSProperties | undefined {
  return undefined;
}

export function experienceTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_EXPERIENCE_TITLE_COLOR) };
}

export function experienceSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_EXPERIENCE_SUBTITLE_COLOR) };
}

export function experienceAccentColor(accent: string): string {
  return sanitizeHex(accent, DEFAULT_EXPERIENCE_ACCENT_COLOR);
}

export function isExperienceTimelineDesign(design: PortfolioExperienceDesign): boolean {
  return design === 'timeline' || design.startsWith('timeline-');
}

export function resolveExperienceYearsTemplate(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsPreset' | 'yearsCustom'>
): string {
  switch (settings.yearsPreset) {
    case 'custom':
      return settings.yearsCustom.trim() || '{years}+ years of hands-on experience in my field.';
    case 'hands-on':
    case 'industry':
    case 'professional':
    case 'creative':
      return YEARS_PRESET_COPY[settings.yearsPreset];
    default:
      return '{years}+ years of hands-on experience in my field.';
  }
}

export function experienceYearsClass(
  settings: Pick<
    PortfolioExperiencePresentationSettings,
    'yearsFont' | 'yearsSize' | 'yearsItalic' | 'yearsAlignment'
  >
): string {
  const parts = ['mb-10 max-w-2xl leading-relaxed', experienceHeaderFontClass(settings.yearsFont, 'title')];

  switch (settings.yearsSize) {
    case 'sm':
      parts.push('text-base sm:text-lg');
      break;
    case 'lg':
      parts.push('text-xl sm:text-2xl lg:text-3xl');
      break;
    case 'xl':
      parts.push('text-2xl sm:text-3xl lg:text-4xl');
      break;
    default:
      parts.push('text-lg sm:text-xl lg:text-2xl');
  }

  if (settings.yearsItalic) parts.push('italic');

  switch (settings.yearsAlignment) {
    case 'center':
      parts.push('mx-auto text-center');
      break;
    case 'right':
      parts.push('ml-auto text-right');
      break;
    default:
      parts.push('text-left');
  }

  return parts.join(' ');
}

export function experienceYearsStyle(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsColor' | 'yearsFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.yearsColor, DEFAULT_EXPERIENCE_YEARS_COLOR),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceYearsHighlightStyle(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsHighlightColor' | 'yearsFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.yearsHighlightColor, DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceBlockClass(design: PortfolioExperienceDesign): string {
  switch (design) {
    case 'stacked':
      // Hover lift/shadow come from PortfolioMotionItem + Global motion (Dynamique).
      // Do not hardcode Tailwind hover here — it ignored Motion = None.
      return '';
    case 'compact':
      return 'border-b border-neutral-200/70 py-7 last:border-b-0 last:pb-0 first:pt-0';
    case 'large':
      return '';
    case 'timeline-stepped':
      return '';
    default:
      return '';
  }
}

function experienceCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return 'border-0';
  }
}

export function experienceLayerFrameClass(
  frame: PortfolioExperienceLayerFrame,
  density: PortfolioExperienceItemDensity = 'comfortable'
): string {
  if (!frame.enabled) {
    return density === 'compact' ? 'space-y-4' : 'space-y-6';
  }
  const padding =
    density === 'compact'
      ? servicesCardPaddingClass(frame.cardPadding === 'lg' ? 'md' : frame.cardPadding === 'md' ? 'sm' : frame.cardPadding)
      : servicesCardPaddingClass(frame.cardPadding);
  const parts = [
    'relative overflow-hidden',
    servicesCardRadiusClass(frame.cardBorderRadius),
    padding,
  ];
  if (frame.cardBorder !== 'none') {
    parts.push(experienceCardBorderWidthClass(frame.cardBorder));
    if (frame.cardBorder === 'soft') parts.push('shadow-sm');
  }
  parts.push(density === 'compact' ? 'space-y-4' : 'space-y-6');
  return parts.filter(Boolean).join(' ');
}

export function experienceLayerFrameStyle(
  frame: PortfolioExperienceLayerFrame,
  accentColor: string
): CSSProperties | undefined {
  if (!frame.enabled) return undefined;
  const style: CSSProperties = {};
  // Solid fill on the shell; split A/B/divider are painted by ServicesCardBackgroundLayers.
  if (frame.cardBackgroundFill === 'solid' && frame.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(frame.cardBackgroundColor, DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR);
  }
  if (frame.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(accentColor, DEFAULT_EXPERIENCE_ACCENT_COLOR);
  } else if (frame.cardBorder === 'soft' || frame.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(frame.cardBorderColor, DEFAULT_EXPERIENCE_CARD_BORDER_COLOR);
  }
  return style;
}

export function experienceLayerToCardFrameSettings(
  frame: PortfolioExperienceLayerFrame
): import('@/components/portfolio/portfolio-card-frame-settings-fields').PortfolioCardFrameSettings {
  return {
    cardBorder: frame.cardBorder,
    cardBorderColor: frame.cardBorderColor,
    cardBackgroundEnabled: frame.cardBackgroundEnabled,
    cardBackgroundColor: frame.cardBackgroundColor,
    cardBorderRadius: frame.cardBorderRadius,
    cardPadding: frame.cardPadding,
    cardBackgroundFill: frame.cardBackgroundFill,
    cardBackgroundColorA: frame.cardBackgroundColorA,
    cardBackgroundColorB: frame.cardBackgroundColorB,
    cardBackgroundSplitAxis: frame.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: frame.cardBackgroundSplitPosition,
    cardDividerEnabled: frame.cardDividerEnabled,
    cardDividerShape: frame.cardDividerShape,
    cardDividerAngle: frame.cardDividerAngle,
    cardDividerCurveDepth: frame.cardDividerCurveDepth,
    cardDividerColor: frame.cardDividerColor,
    cardDividerThickness: frame.cardDividerThickness,
    cardDividerOpacity: frame.cardDividerOpacity,
  };
}

export function patchExperienceLayerFrame(
  frame: PortfolioExperienceLayerFrame,
  patch: Partial<PortfolioExperienceLayerFrame>
): PortfolioExperienceLayerFrame {
  const mergedBg = mergeServicesCardBackgroundSettings(frame, patch);
  return {
    ...frame,
    ...mergedBg,
    enabled: typeof patch.enabled === 'boolean' ? patch.enabled : frame.enabled,
    cardBorder: patch.cardBorder ?? frame.cardBorder,
    cardBorderColor: patch.cardBorderColor ?? frame.cardBorderColor,
    cardBackgroundEnabled:
      typeof patch.cardBackgroundEnabled === 'boolean'
        ? patch.cardBackgroundEnabled
        : frame.cardBackgroundEnabled,
    cardBackgroundColor: patch.cardBackgroundColor ?? frame.cardBackgroundColor,
    cardBorderRadius: patch.cardBorderRadius ?? frame.cardBorderRadius,
    cardPadding: patch.cardPadding ?? frame.cardPadding,
  };
}

function mergeExperienceLayerFrame(
  base: PortfolioExperienceLayerFrame,
  raw: unknown,
  legacy?: Partial<PortfolioExperienceLayerFrame>
): PortfolioExperienceLayerFrame {
  const record =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : ({} as Record<string, unknown>);
  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const fromLegacy = legacy ?? {};
  const seed: PortfolioExperienceLayerFrame = {
    ...base,
    ...fromLegacy,
    enabled:
      typeof record.enabled === 'boolean'
        ? record.enabled
        : typeof fromLegacy.enabled === 'boolean'
          ? fromLegacy.enabled
          : base.enabled,
  };

  const bg = mergeServicesCardBackgroundSettings(seed, { ...fromLegacy, ...record });

  return {
    ...seed,
    ...bg,
    cardBorder: pick(
      record.cardBorder ?? fromLegacy.cardBorder,
      ['none', 'soft', 'solid', 'accent'],
      seed.cardBorder
    ),
    cardBorderColor: sanitizeHex(
      record.cardBorderColor ?? fromLegacy.cardBorderColor,
      seed.cardBorderColor
    ),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : typeof fromLegacy.cardBackgroundEnabled === 'boolean'
          ? fromLegacy.cardBackgroundEnabled
          : seed.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(
      record.cardBackgroundColor ?? fromLegacy.cardBackgroundColor,
      seed.cardBackgroundColor
    ),
    cardBorderRadius: pick(
      record.cardBorderRadius ?? fromLegacy.cardBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'],
      seed.cardBorderRadius
    ),
    cardPadding: pick(
      record.cardPadding ?? fromLegacy.cardPadding,
      ['none', 'sm', 'md', 'lg'],
      seed.cardPadding
    ),
  };
}

export function experienceEntryShellUsesFrame(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame'>
): boolean {
  const design = p.experienceDesign;
  if (design === 'compact' && !p.entryFrame.enabled) return false;
  if (p.entryFrame.enabled) return true;
  return experienceDesignUsesEntryCard(design) || design === 'large';
}

export function experienceEntryShellClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame' | 'itemDensity'>
): string {
  const designExtras = experienceBlockClass(p.experienceDesign);
  if (!experienceEntryShellUsesFrame(p)) return designExtras;
  const frameClass = experienceLayerFrameClass(
    { ...p.entryFrame, enabled: true },
    p.itemDensity
  );
  return [frameClass, designExtras].filter(Boolean).join(' ');
}

export function experienceEntryShellStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'experienceDesign' | 'entryFrame' | 'accentColor'>
): CSSProperties | undefined {
  if (!experienceEntryShellUsesFrame(p)) return undefined;
  return experienceLayerFrameStyle({ ...p.entryFrame, enabled: true }, p.accentColor);
}

export function experienceStoryPanelClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyFrame' | 'itemDensity'>
): string {
  return experienceLayerFrameClass(p.storyFrame, p.itemDensity);
}

export function experienceStoryPanelStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'storyFrame' | 'accentColor'>
): CSSProperties | undefined {
  return experienceLayerFrameStyle(p.storyFrame, p.accentColor);
}

export function experienceDetailsPanelClass(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsFrame' | 'itemDensity' | 'asidePlacement'>
): string {
  if (p.asidePlacement === 'inline') {
    return p.itemDensity === 'compact' ? 'space-y-4' : 'space-y-6';
  }
  return experienceLayerFrameClass(p.detailsFrame, p.itemDensity);
}

export function experienceDetailsPanelStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'detailsFrame' | 'accentColor' | 'asidePlacement'>
): CSSProperties | undefined {
  if (p.asidePlacement === 'inline') return undefined;
  return experienceLayerFrameStyle(p.detailsFrame, p.accentColor);
}

/** Frame for Proof / skills secondary details card (bento stack). */
export function experienceDetailsSecondaryPanelClass(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'detailsSecondaryFrame' | 'detailsFrame' | 'itemDensity' | 'asidePlacement'
  >
): string {
  if (p.asidePlacement === 'inline') {
    return p.itemDensity === 'compact' ? 'space-y-4' : 'space-y-6';
  }
  const frame = p.detailsSecondaryFrame ?? p.detailsFrame;
  return experienceLayerFrameClass(frame, p.itemDensity);
}

export function experienceDetailsSecondaryPanelStyle(
  p: Pick<
    PortfolioExperiencePresentationSettings,
    'detailsSecondaryFrame' | 'detailsFrame' | 'accentColor' | 'asidePlacement'
  >
): CSSProperties | undefined {
  if (p.asidePlacement === 'inline') return undefined;
  const frame = p.detailsSecondaryFrame ?? p.detailsFrame;
  return experienceLayerFrameStyle(frame, p.accentColor);
}

export function experienceItemGapClass(gap: PortfolioExperienceItemGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-6 sm:gap-8';
    case 'lg':
      return 'gap-12 sm:gap-16';
    case 'xl':
      return 'gap-16 sm:gap-24';
    default:
      return 'gap-8 sm:gap-12';
  }
}

export function experienceTaskItemGapClass(gap: PortfolioExperienceTaskItemGap): string {
  switch (gap) {
    case 'sm':
      return 'space-y-2';
    case 'lg':
      return 'space-y-5 sm:space-y-6';
    case 'xl':
      return 'space-y-7 sm:space-y-8';
    default:
      return 'space-y-3 sm:space-y-4';
  }
}

export function resolveExperienceBodyLayout(
  p: Pick<PortfolioExperiencePresentationSettings, 'asidePlacement' | 'experienceDesign'>,
  inMultiColumn: boolean
): 'stack' | 'split' | 'bento' | 'compact' | 'magazine' | 'stepped' {
  const design = p.experienceDesign;
  if (design === 'compact') return 'compact';
  if (design === 'large' && !inMultiColumn) return 'bento';
  if (design === 'timeline-editorial' && !inMultiColumn) return 'magazine';
  if (design === 'timeline-stepped' && !inMultiColumn) return 'stepped';
  if (inMultiColumn || p.asidePlacement === 'stacked' || p.asidePlacement === 'inline') {
    return 'stack';
  }
  return 'split';
}

export function experienceListMaxWidthClass(width: PortfolioExperienceListMaxWidth): string {
  switch (width) {
    case 'narrow':
      return 'w-full max-w-xl sm:max-w-2xl lg:max-w-3xl';
    case 'wide':
      return 'w-full max-w-4xl sm:max-w-6xl lg:max-w-[80rem] xl:max-w-[88rem]';
    case 'full':
      return 'w-full max-w-none';
    default:
      return 'w-full max-w-3xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl';
  }
}

export function experienceListPlacementClass(placement: PortfolioExperienceListPlacement): string {
  switch (placement) {
    case 'left':
      return 'mr-auto ml-0';
    case 'right':
      return 'ml-auto mr-0';
    default:
      return 'mx-auto';
  }
}

export function experienceItemsPerRowGridClass(
  itemsPerRow: PortfolioExperienceItemsPerRow,
  design: PortfolioExperienceDesign,
  itemGap: PortfolioExperienceItemGap = 'md'
): string {
  const gap = experienceItemGapClass(itemGap);
  if (!experienceDesignSupportsItemsPerRow(design) || itemsPerRow <= 1) {
    return `grid grid-cols-1 ${gap}`;
  }
  if (itemsPerRow === 3) {
    return `grid grid-cols-1 ${gap} sm:grid-cols-2 xl:grid-cols-3`;
  }
  return `grid grid-cols-1 ${gap} md:grid-cols-2`;
}

export function experienceListShellClass(
  maxWidth: PortfolioExperienceListMaxWidth,
  placement: PortfolioExperienceListPlacement
): string {
  return `w-full ${experienceListPlacementClass(placement)} ${experienceListMaxWidthClass(maxWidth)}`;
}

export function resolveExperienceItemsPerRow(
  design: PortfolioExperienceDesign,
  itemsPerRow: PortfolioExperienceItemsPerRow | undefined
): PortfolioExperienceItemsPerRow {
  if (!experienceDesignSupportsItemsPerRow(design)) return 1;
  return itemsPerRow === 2 || itemsPerRow === 3 ? itemsPerRow : 1;
}

export function pickExperiencePresentationSettings(experience: unknown): PortfolioExperiencePresentationSettings {
  const merged = mergeExperiencePresentation(DEFAULT_EXPERIENCE_PRESENTATION, experience);
  // Migrate older portfolios: mirror the tasks details card until a secondary frame is saved.
  if (experience && typeof experience === 'object' && !('detailsSecondaryFrame' in experience)) {
    return {
      ...merged,
      detailsSecondaryFrame: { ...merged.detailsFrame },
    };
  }
  return merged;
}

export function mergeExperiencePresentation(
  base: PortfolioExperiencePresentationSettings,
  patch: unknown
): PortfolioExperiencePresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);

  const legacyDetailsStyle = record.detailsPanelStyle;
  const legacyForceEntry = record.forceEntryFrame;
  const legacyCardPatch: Partial<PortfolioExperienceLayerFrame> = {
    cardBorder:
      record.cardBorder === 'none' ||
      record.cardBorder === 'soft' ||
      record.cardBorder === 'solid' ||
      record.cardBorder === 'accent'
        ? record.cardBorder
        : undefined,
    cardBorderColor: typeof record.cardBorderColor === 'string' ? record.cardBorderColor : undefined,
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : undefined,
    cardBackgroundColor:
      typeof record.cardBackgroundColor === 'string' ? record.cardBackgroundColor : undefined,
    cardBorderRadius:
      record.cardBorderRadius === 'none' ||
      record.cardBorderRadius === 'sm' ||
      record.cardBorderRadius === 'md' ||
      record.cardBorderRadius === 'lg' ||
      record.cardBorderRadius === 'xl'
        ? record.cardBorderRadius
        : undefined,
    cardPadding:
      record.cardPadding === 'none' ||
      record.cardPadding === 'sm' ||
      record.cardPadding === 'md' ||
      record.cardPadding === 'lg'
        ? record.cardPadding
        : undefined,
  };

  let asidePlacement = pick(
    record.asidePlacement,
    ['right', 'left', 'stacked', 'inline'],
    base.asidePlacement
  );
  if (legacyDetailsStyle === 'inline' && record.asidePlacement == null) {
    asidePlacement = 'inline';
  }

  const entryFrame = mergeExperienceLayerFrame(base.entryFrame, record.entryFrame, {
    ...legacyCardPatch,
    ...(typeof legacyForceEntry === 'boolean' ? { enabled: legacyForceEntry } : {}),
  });

  const storyFrame = mergeExperienceLayerFrame(base.storyFrame, record.storyFrame);

  const detailsFrame = mergeExperienceLayerFrame(base.detailsFrame, record.detailsFrame, {
    ...(legacyDetailsStyle === 'plain'
      ? { enabled: false }
      : legacyDetailsStyle === 'card'
        ? { enabled: true }
        : {}),
    ...(!record.detailsFrame ? legacyCardPatch : {}),
  });

  // New layer: keep base secondary unless the patch explicitly sets it.
  const detailsSecondaryFrame = mergeExperienceLayerFrame(
    base.detailsSecondaryFrame ?? detailsFrame,
    record.detailsSecondaryFrame
  );

  const merged: PortfolioExperiencePresentationSettings = {
    ...background,
    titlePreset: pick(
      record.titlePreset,
      ['experience', 'career-path', 'work-history', 'professional-journey', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'career', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    titleUppercase: typeof record.titleUppercase === 'boolean' ? record.titleUppercase : base.titleUppercase,
    subtitleUppercase:
      typeof record.subtitleUppercase === 'boolean' ? record.subtitleUppercase : base.subtitleUppercase,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    sectionLayout: isPortfolioExperienceSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    illustrationVariant: pick(
      record.illustrationVariant,
      EXPERIENCE_ILLUSTRATION_VARIANTS,
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pick(
      record.illustrationPlacement,
      EXPERIENCE_ILLUSTRATION_PLACEMENTS,
      base.illustrationPlacement ?? 'right'
    ),
    experienceDesign: pick(record.experienceDesign, EXPERIENCE_DESIGNS, base.experienceDesign),
    listMaxWidth: pick(record.listMaxWidth, ['narrow', 'default', 'wide', 'full'], base.listMaxWidth),
    listPlacement: pick(record.listPlacement, ['left', 'center', 'right'], base.listPlacement),
    itemsPerRow: (() => {
      const raw = record.itemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3) return raw;
      if (raw === '1' || raw === '2' || raw === '3') return Number(raw) as PortfolioExperienceItemsPerRow;
      return base.itemsPerRow;
    })(),
    itemGap: pick(record.itemGap, ['sm', 'md', 'lg', 'xl'], base.itemGap),
    itemDensity: pick(record.itemDensity, ['comfortable', 'compact'], base.itemDensity),
    storyContentGap: isPortfolioExperienceStoryContentGap(record.storyContentGap)
      ? record.storyContentGap
      : base.storyContentGap,
    storyContentGapPx: clampExperienceStoryContentGapPx(
      record.storyContentGapPx,
      base.storyContentGapPx
    ),
    detailsContentGap: isPortfolioExperienceDetailsContentGap(record.detailsContentGap)
      ? record.detailsContentGap
      : base.detailsContentGap,
    detailsContentGapPx: clampExperienceDetailsContentGapPx(
      record.detailsContentGapPx,
      base.detailsContentGapPx
    ),
    magazineColumnRatio: pick(
      record.magazineColumnRatio,
      ['balanced', 'content-wide', 'media-wide'],
      base.magazineColumnRatio ?? 'media-wide'
    ),
    magazineSeparatorSpacingPx: clampExperienceMagazineSeparatorSpacingPx(
      record.magazineSeparatorSpacingPx,
      base.magazineSeparatorSpacingPx ?? 64
    ),
    periodRuleEnabled:
      typeof record.periodRuleEnabled === 'boolean'
        ? record.periodRuleEnabled
        : base.periodRuleEnabled,
    periodRuleColor: sanitizeHex(record.periodRuleColor, base.periodRuleColor),
    periodRuleColorDark: sanitizeHex(
      record.periodRuleColorDark,
      base.periodRuleColorDark ?? '#e5e5e5'
    ),
    periodRuleFollowPalette:
      typeof record.periodRuleFollowPalette === 'boolean'
        ? record.periodRuleFollowPalette
        : (base.periodRuleFollowPalette ?? true),
    periodRuleThickness: clampExperiencePeriodRuleThickness(
      record.periodRuleThickness,
      base.periodRuleThickness
    ),
    periodRuleOpacity: clampExperiencePeriodRuleOpacity(
      record.periodRuleOpacity,
      base.periodRuleOpacity
    ),
    timelineRailEnabled:
      typeof record.timelineRailEnabled === 'boolean'
        ? record.timelineRailEnabled
        : base.timelineRailEnabled,
    timelineRailColor: sanitizeHex(record.timelineRailColor, base.timelineRailColor),
    timelineRailOpacity: clampExperienceTimelineRailOpacity(
      record.timelineRailOpacity,
      base.timelineRailOpacity
    ),
    toolsSeparatorEnabled:
      typeof record.toolsSeparatorEnabled === 'boolean'
        ? record.toolsSeparatorEnabled
        : base.toolsSeparatorEnabled,
    toolsSeparatorColor: sanitizeHex(record.toolsSeparatorColor, base.toolsSeparatorColor),
    toolsSeparatorOpacity: clampExperienceToolsSeparatorOpacity(
      record.toolsSeparatorOpacity,
      base.toolsSeparatorOpacity
    ),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    yearsPreset: pick(
      record.yearsPreset,
      ['default', 'hands-on', 'industry', 'professional', 'creative', 'custom'],
      base.yearsPreset
    ),
    yearsCustom: typeof record.yearsCustom === 'string' ? record.yearsCustom : base.yearsCustom,
    yearsFont: pick(record.yearsFont, ['sans', 'serif', 'display'], base.yearsFont),
    yearsSize: pick(record.yearsSize, ['sm', 'md', 'lg', 'xl'], base.yearsSize),
    yearsColor: sanitizeHex(record.yearsColor, base.yearsColor),
    yearsHighlightColor: sanitizeHex(record.yearsHighlightColor, base.yearsHighlightColor),
    yearsBoldYears: typeof record.yearsBoldYears === 'boolean' ? record.yearsBoldYears : base.yearsBoldYears,
    yearsItalic: typeof record.yearsItalic === 'boolean' ? record.yearsItalic : base.yearsItalic,
    yearsAlignment: pick(record.yearsAlignment, ['left', 'center', 'right'], base.yearsAlignment),
    showYears: typeof record.showYears === 'boolean' ? record.showYears : base.showYears,
    entryChipBackgroundColor: sanitizeHex(
      record.entryChipBackgroundColor,
      base.entryChipBackgroundColor
    ),
    entryChipBorderColor: sanitizeHex(record.entryChipBorderColor, base.entryChipBorderColor),
    showPeriod: typeof record.showPeriod === 'boolean' ? record.showPeriod : base.showPeriod,
    showTitle: typeof record.showTitle === 'boolean' ? record.showTitle : base.showTitle,
    showOrganization:
      typeof record.showOrganization === 'boolean' ? record.showOrganization : base.showOrganization,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showMeta: typeof record.showMeta === 'boolean' ? record.showMeta : base.showMeta,
    showTasks: typeof record.showTasks === 'boolean' ? record.showTasks : base.showTasks,
    taskBulletSource: isPortfolioListMarkerSource(record.taskBulletSource)
      ? record.taskBulletSource
      : (base.taskBulletSource ?? 'section'),
    taskBulletStyle: isPortfolioListMarkerStyle(record.taskBulletStyle)
      ? record.taskBulletStyle
      : (base.taskBulletStyle ?? 'disc'),
    taskBulletColor: sanitizeHex(
      record.taskBulletColor,
      base.taskBulletColor ?? DEFAULT_LIST_MARKER_COLOR
    ),
    taskBulletSize: isPortfolioListMarkerSize(record.taskBulletSize)
      ? record.taskBulletSize
      : (base.taskBulletSize ?? 'md'),
    taskBulletSizePx: clampListMarkerSizePx(
      record.taskBulletSizePx,
      base.taskBulletSizePx ?? LIST_MARKER_SIZE_PRESET_PX.md
    ),
    taskBulletWeight: isPortfolioListMarkerWeight(record.taskBulletWeight)
      ? record.taskBulletWeight
      : (base.taskBulletWeight ?? 'regular'),
    taskBulletWeightAmount: clampListMarkerWeightAmount(
      record.taskBulletWeightAmount,
      base.taskBulletWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    taskItemGap: pick(record.taskItemGap, ['sm', 'md', 'lg', 'xl'], base.taskItemGap ?? 'md'),
    showTools: typeof record.showTools === 'boolean' ? record.showTools : base.showTools,
    showProof: typeof record.showProof === 'boolean' ? record.showProof : base.showProof,
    showNote: typeof record.showNote === 'boolean' ? record.showNote : base.showNote,
    showSkills: typeof record.showSkills === 'boolean' ? record.showSkills : base.showSkills,
    asidePlacement,
    bentoDetailsPlacement: pick(
      record.bentoDetailsPlacement,
      ['aside', 'under-media', 'under-story'],
      base.bentoDetailsPlacement ?? 'aside'
    ),
    showEntryMedia:
      typeof record.showEntryMedia === 'boolean' ? record.showEntryMedia : base.showEntryMedia,
    entryMediaPlacement: pick(
      record.entryMediaPlacement,
      [
        'aside-right',
        'aside-left',
        'outside-right',
        'outside-left',
        'story-top',
        'entry-top',
        'hidden',
      ],
      base.entryMediaPlacement
    ),
    entryMediaSticky:
      typeof record.entryMediaSticky === 'boolean'
        ? record.entryMediaSticky
        : (base.entryMediaSticky ?? true),
    entryMediaSize: pick(
      record.entryMediaSize,
      ['sm', 'md', 'lg', 'full', 'custom'],
      base.entryMediaSize
    ),
    entryMediaSizePx: clampExperienceEntryMediaSizePx(
      record.entryMediaSizePx,
      base.entryMediaSizePx ?? 224
    ),
    entryMediaRadius: pick(
      record.entryMediaRadius,
      ['none', 'sm', 'md', 'lg', 'xl'],
      base.entryMediaRadius
    ),
    entryMediaAspect: pick(
      record.entryMediaAspect,
      ['auto', '1/1', '4/5', '16/9', '3/2'],
      base.entryMediaAspect
    ),
    entryMediaFit: pick(
      record.entryMediaFit,
      ['cover', 'contain'],
      base.entryMediaFit ?? 'cover'
    ),
    entryMediaPosition: pick(
      record.entryMediaPosition,
      [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ],
      base.entryMediaPosition ?? 'center'
    ),
    entryMediaDarkness:
      typeof record.entryMediaDarkness === 'number' && Number.isFinite(record.entryMediaDarkness)
        ? Math.min(200, Math.max(0, Math.round(record.entryMediaDarkness)))
        : (base.entryMediaDarkness ?? 0),
    entryMediaHeight: pick(
      record.entryMediaHeight,
      ['auto', 'sm', 'md', 'lg', 'xl', 'custom'],
      base.entryMediaHeight ?? 'auto'
    ),
    entryMediaHeightPx: clampExperienceEntryMediaHeightPx(
      record.entryMediaHeightPx,
      base.entryMediaHeightPx ?? 280
    ),
    elementOrder: normalizeExperienceElementOrder(record.elementOrder ?? base.elementOrder),
    elementZones: (() => {
      const zones = normalizeExperienceElementZones(record.elementZones ?? base.elementZones);
      const toolsZone = pick(record.toolsZone, ['story', 'details', 'entry'], base.toolsZone);
      if (toolsZone === 'story' || toolsZone === 'details') {
        zones.tools = toolsZone;
      }
      const proofZoneRaw = record.proofZone;
      const proofZone =
        proofZoneRaw === 'story' || proofZoneRaw === 'details' || proofZoneRaw === 'under-media'
          ? proofZoneRaw
          : zones.proof === 'story' || zones.proof === 'details'
            ? zones.proof
            : base.proofZone;
      if (proofZone === 'story' || proofZone === 'details') {
        zones.proof = proofZone;
      }
      return zones;
    })(),
    tasksLabel: typeof record.tasksLabel === 'string' ? record.tasksLabel : base.tasksLabel,
    proofLabel: typeof record.proofLabel === 'string' ? record.proofLabel : base.proofLabel,
    noteLabel: typeof record.noteLabel === 'string' ? record.noteLabel : base.noteLabel,
    skillsLabel: typeof record.skillsLabel === 'string' ? record.skillsLabel : base.skillsLabel,
    toolsLabel: typeof record.toolsLabel === 'string' ? record.toolsLabel : base.toolsLabel,
    showBlockLabels:
      typeof record.showBlockLabels === 'boolean' ? record.showBlockLabels : base.showBlockLabels,
    blockLabelVisibility: normalizeExperienceBlockLabelVisibility(
      record.blockLabelVisibility,
      base.blockLabelVisibility ?? DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY
    ),
    skillsTagStyle: pick(
      record.skillsTagStyle,
      ['soft', 'pill', 'outline', 'plain'],
      base.skillsTagStyle
    ),
    statusBadgeStyle: pick(
      record.statusBadgeStyle,
      ['pill', 'soft', 'outline', 'plain', 'accent', 'square', 'dot'],
      base.statusBadgeStyle ?? 'pill'
    ),
    proofLinkStyle: pick(
      record.proofLinkStyle,
      ['pill', 'soft', 'outline', 'plain', 'accent', 'underline'],
      base.proofLinkStyle ?? 'pill'
    ),
    toolsZone: pick(record.toolsZone, ['story', 'details', 'entry'], base.toolsZone),
    proofZone: (() => {
      const proofZoneRaw = record.proofZone;
      if (proofZoneRaw === 'story' || proofZoneRaw === 'details' || proofZoneRaw === 'under-media') {
        return proofZoneRaw;
      }
      const zones = normalizeExperienceElementZones(record.elementZones ?? base.elementZones);
      if (zones.proof === 'story' || zones.proof === 'details') return zones.proof;
      return base.proofZone;
    })(),
    toolsEntrySide: pick(record.toolsEntrySide, ['left', 'right'], base.toolsEntrySide),
    toolsDisplay: pick(
      record.toolsDisplay,
      ['icons-and-labels', 'icons', 'stacked'],
      base.toolsDisplay
    ),
    toolsIconSize: pick(record.toolsIconSize, ['sm', 'md', 'lg', 'xl'], base.toolsIconSize),
    toolsIconBorder: pick(record.toolsIconBorder, ['none', 'soft', 'solid'], base.toolsIconBorder ?? 'solid'),
    toolsIconBorderColor: sanitizeHex(
      record.toolsIconBorderColor,
      base.toolsIconBorderColor ?? base.entryChipBorderColor
    ),
    toolsIconBackgroundEnabled:
      typeof record.toolsIconBackgroundEnabled === 'boolean'
        ? record.toolsIconBackgroundEnabled
        : base.toolsIconBackgroundEnabled,
    toolsIconBackgroundColor: sanitizeHex(
      record.toolsIconBackgroundColor,
      base.toolsIconBackgroundColor
    ),
    toolsIconPaddingPx: clampExperienceToolsIconPaddingPx(
      record.toolsIconPaddingPx,
      base.toolsIconPaddingPx
    ),
    toolsIconGapPx: clampExperienceToolsIconGapPx(record.toolsIconGapPx, base.toolsIconGapPx),
    toolsChrome: mergeExperienceToolsChrome(
      mergeExperienceToolsChrome(DEFAULT_EXPERIENCE_TOOLS_CHROME, base.toolsChrome),
      record.toolsChrome
    ),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    experiencePalette: mergeExperiencePalette(
      mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, base.experiencePalette),
      record.experiencePalette
    ),
    experienceColorBindings: mergeExperienceColorBindings(
      mergeExperienceColorBindings(DEFAULT_EXPERIENCE_COLOR_BINDINGS, base.experienceColorBindings),
      record.experienceColorBindings
    ),
    elementStyles: normalizeExperienceElementStyles(record.elementStyles ?? base.elementStyles),
    entryFrame,
    storyFrame,
    detailsFrame,
    detailsSecondaryFrame,
  };

  if (merged.useHeroPalette === false) {
    return merged;
  }

  return {
    ...merged,
    ...(applyExperiencePaletteToSettings(merged) as Partial<PortfolioExperiencePresentationSettings>),
    useHeroPalette: true,
  };
}

/**
 * Maps legacy About-embedded experience fields into a standalone Experience section.
 */
export function migrateExperienceFromLegacyAbout(aboutRecord: unknown): PortfolioExperienceSectionSettings {
  const defaults: PortfolioExperienceSectionSettings = {
    enabled: true,
    title: 'Experience',
    subtitle: 'Roles, milestones, and the path that shaped my craft.',
    ...DEFAULT_EXPERIENCE_PRESENTATION,
  };

  if (!aboutRecord || typeof aboutRecord !== 'object') return defaults;
  const record = aboutRecord as Record<string, unknown>;

  const headingPreset = record.experienceHeadingPreset;
  let titlePreset: PortfolioExperienceTitlePreset = defaults.titlePreset;
  let titleCustom = defaults.titleCustom;
  let title = defaults.title;

  if (
    headingPreset === 'experience' ||
    headingPreset === 'career-path' ||
    headingPreset === 'work-history' ||
    headingPreset === 'professional-journey' ||
    headingPreset === 'custom'
  ) {
    titlePreset = headingPreset;
  } else if (headingPreset === 'default') {
    titlePreset = 'custom';
  }

  if (typeof record.experienceHeadingCustom === 'string' && record.experienceHeadingCustom.trim()) {
    titleCustom = record.experienceHeadingCustom.trim();
  }
  if (typeof record.experienceHeading === 'string' && record.experienceHeading.trim()) {
    title = record.experienceHeading.trim();
    if (titlePreset === 'custom' && !titleCustom) titleCustom = title;
  }

  const presentationPatch: Record<string, unknown> = {
    titlePreset,
    titleCustom,
    experienceDesign: record.experienceDesign,
    accentColor: record.accentColor,
    yearsPreset: record.experienceYearsPreset,
    yearsCustom: record.experienceYearsCustom,
    yearsFont: record.experienceYearsFont,
    yearsSize: record.experienceYearsSize,
    yearsColor: record.experienceYearsColor,
    yearsHighlightColor: record.experienceYearsHighlightColor,
    yearsBoldYears: record.experienceYearsBoldYears,
    yearsItalic: record.experienceYearsItalic,
    yearsAlignment: record.experienceYearsAlignment,
    showYears:
      typeof record.showExperienceYears === 'boolean' ? record.showExperienceYears : defaults.showYears,
    titleFont: record.experienceHeadingFont,
    titleColor: record.experienceHeadingColor,
    titleUppercase: record.experienceHeadingUppercase,
    headerAlignment: record.experienceHeadingAlignment,
  };

  return {
    enabled: typeof record.showExperience === 'boolean' ? record.showExperience : defaults.enabled,
    title,
    subtitle: defaults.subtitle,
    ...mergeExperiencePresentation(defaults, presentationPatch),
  };
}
