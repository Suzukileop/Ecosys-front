import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  applyTeamPaletteToSettings,
  DEFAULT_TEAM_COLOR_BINDINGS,
  DEFAULT_TEAM_PALETTE,
  mergeTeamColorBindings,
  mergeTeamPalette,
  teamCardReadableText,
  type PortfolioTeamColorBindings,
  type PortfolioTeamPalette,
} from '@/components/portfolio/portfolio-team-palette-settings';
import {
  TEAM_HEADER_ACCENT_COUNT_ALIGNMENTS,
  TEAM_HEADER_BILLBOARD_WORD_STYLES,
  TEAM_HEADER_DESIGNS,
  TEAM_HEADER_MARGIN_BOTTOM_STEPS,
  TEAM_HEADER_PALETTE_TOKENS,
  TEAM_HEADER_TITLE_SIZES,
  TEAM_HEADER_TITLE_WEIGHTS,
  type PortfolioTeamHeaderAccentCountAlignment,
  type PortfolioTeamHeaderBillboardWordStyle,
  type PortfolioTeamHeaderDesign,
  type PortfolioTeamHeaderDesignAlignment,
  type PortfolioTeamHeaderMarginBottom,
  type PortfolioTeamHeaderPaletteToken,
  type PortfolioTeamHeaderTitleSize,
  type PortfolioTeamHeaderTitleWeight,
} from '@/components/portfolio/portfolio-team-header-settings';

/** `meet-cards` and `hover-cards` are retired: still accepted from storage, remapped on merge. */
export type PortfolioTeamLayout = 'meet-cards' | 'portrait-rail' | 'spotlight' | 'split-screen' | 'editorial-rhythm' | 'directory' | 'polaroid' | 'profile-cards' | 'hover-cards' | 'avatar-cards' | 'cover-cards' | 'float-cards' | 'floating-canvas';
/**
 * Portrait rail navigation:
 * `drag` — the immersive rail, dragged or scrubbed from its own indicator (default);
 * `chevrons` — the same rail, stepped one portrait at a time from a pair of buttons;
 * `show-all` — no traversal at all, every portrait laid out in rows.
 */
export type PortfolioTeamRailNavigation = 'drag' | 'chevrons' | 'show-all';
export type PortfolioTeamRailColumns = 2 | 3 | 4;
/**
 * Profile cards — which of the design's two navigations the section opens on. Both are always
 * available to the visitor from the toolbar; this only picks the one shown first.
 * `rail` — a horizontal, trackpad-scrollable rail stepped by a pair of chevrons;
 * `grid` — every card laid out in staggered rows.
 */
export type PortfolioTeamProfileView = 'rail' | 'grid';
/**
 * Floating cards: where the block of cards sits in the section. `full` drops the block's own cap
 * and lets the cards spread across the whole content width instead of being grouped.
 */
export type PortfolioTeamFloatAlign = 'left' | 'center' | 'right' | 'full';
/** Profile cards — the card's own proportion; `Photo size` still sets its minimum height. */
export type PortfolioTeamProfileRatio = 'square' | 'soft' | 'portrait' | 'tall' | 'xtall';
/**
 * Profile cards — horizontal air between cards, desktop only: below `lg` the columns keep one
 * comfortable gap whatever this says, because there is no room to spend there.
 */
export type PortfolioTeamProfileGutter = 'sm' | 'md' | 'lg' | 'xl';
/** Profile cards — the info panel rests on the portrait, or only arrives on hover. */
export type PortfolioTeamProfilePanel = 'always' | 'hover';
/**
 * Profile cards — how many cards the grid shows before the `View all` pill releases the rest.
 * Stored as a label because `all` (hold none back) shares the axis with the counts.
 */
export type PortfolioTeamProfileVisible = '4' | '6' | '8' | 'all';
/**
 * Avatar cards — which of the design's two navigations the section opens on. Both stay available
 * to the visitor from the card toolbar; this only picks the one shown first.
 * `rail` — a horizontal, trackpad-scrollable rail stepped by a pair of chevrons;
 * `grid` — every card laid out in rows, optionally on a staggered rhythm.
 */
export type PortfolioTeamAvatarView = 'rail' | 'grid';
/**
 * Avatar cards — the shape the circular avatar morphs into while its card is hovered.
 * `circle` keeps the circle (the avatar only grows); the other two open it up.
 */
export type PortfolioTeamAvatarShape = 'circle' | 'squircle' | 'arch';
/** Avatar cards: members per row on a large screen — the grid still steps down below it. */
export type PortfolioTeamAvatarColumns = 1 | 2 | 3 | 4;
/**
 * Avatar cards: the gutter *between columns*, applied from `lg` up only. Below that the design
 * keeps the gutter its own scale derives from `Gap`, because at one or two columns a desktop
 * spacing choice has nothing to space.
 */
export type PortfolioTeamAvatarColumnGap = 'sm' | 'md' | 'lg' | 'xl';
/**
 * Avatar cards: how the grid occupies the section.
 * `centered` - the block is capped at the cards' own width and centred, so the cards read as one
 * composition (the design's original behaviour);
 * `full` - the plain arrangement the Portrait rail's "Show all" uses: the grid takes the whole
 * content width and every card stretches to fill its column.
 */
export type PortfolioTeamAvatarGridWidth = 'centered' | 'full';
/** Shared by the rail (each portrait) and the spotlight (the panel): four corner-radius steps. */
export type PortfolioTeamCornerRadius = 'none' | 'sm' | 'md' | 'lg';
/** Shared portrait-height axis. `tall` is always the original, largest setting. */
export type PortfolioTeamImageHeight = 'short' | 'medium' | 'tall';
/**
 * Polaroid and Split screen — how the portrait's color renders:
 * `hover` — black & white at rest, full color on hover (the original behavior);
 * `monochrome` — always black & white, even on hover;
 * `color` — always full color, no filter at all.
 */
export type PortfolioTeamPolaroidPhotoTone = 'hover' | 'monochrome' | 'color';
/** Spotlight and Split screen — which side the monumental portrait sits on (large screens). */
export type PortfolioTeamSpotlightSide = 'left' | 'right';
/**
 * Spotlight navigation:
 * `thumbnails` — the strip of portraits under the copy (default);
 * `arrows` — a prev/next pair, nothing else competing with the portrait;
 * `both` — the strip with the prev/next pair sitting above it, aligned right.
 */
export type PortfolioTeamSpotlightNavigation = 'thumbnails' | 'arrows' | 'both';
/**
 * Directory — where each member's portrait lives:
 * `cursor` — a plate that trails the pointer while a row is hovered (the original behavior);
 * `left` / `right` — always visible, fixed in every row on that side.
 */
export type PortfolioTeamDirectoryPortrait = 'cursor' | 'left' | 'right';
/** The shared corner steps plus `full` — a true circle, for portraits that can become one. */
export type PortfolioTeamAvatarRadius = PortfolioTeamCornerRadius | 'full';
export type PortfolioTeamGap = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type PortfolioTeamCardMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type PortfolioTeamListAlign = 'left' | 'center' | 'right';
export type PortfolioTeamAvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamCardShadow = 'none' | 'soft' | 'medium' | 'strong';
export type PortfolioTeamCardBorder = 'none' | 'thin' | 'medium';
export type PortfolioTeamImageAspect = 'square' | 'portrait' | 'landscape' | 'auto';
export type PortfolioTeamImageFit = 'cover' | 'contain';
export type PortfolioTeamImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type PortfolioTeamSocialIconSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioTeamSocialIconStyle = 'circle' | 'soft' | 'outline' | 'minimal';
export type PortfolioTeamHeaderAlignment = 'left' | 'center' | 'right';
export type PortfolioTeamHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioTeamTitlePreset = 'team' | 'meet-team' | 'people' | 'custom';
export type PortfolioTeamSubtitlePreset = 'default' | 'together' | 'expertise' | 'minimal' | 'custom';

/** How the section title relates to the team member grid. */
export type PortfolioTeamSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative SVG beside the team content (`none` hides it). */
export type PortfolioTeamIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioTeamIllustrationPlacement = 'left' | 'right';

export const PORTFOLIO_TEAM_SECTION_LAYOUTS = [
  'stacked',
  'aside-left',
  'aside-right',
] as const satisfies readonly PortfolioTeamSectionLayout[];

export const PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS = [
  'none',
  'chat',
  'question',
  'docs',
  'support',
  'hex',
] as const satisfies readonly PortfolioTeamIllustrationVariant[];

export const PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS = [
  'left',
  'right',
] as const satisfies readonly PortfolioTeamIllustrationPlacement[];

export type PortfolioTeamPresentationSettings = PortfolioSectionBackgroundSettings & {
  layout: PortfolioTeamLayout;
  columns: 1 | 2 | 3 | 4;
  gap: PortfolioTeamGap;
  cardRadius: PortfolioTeamCardRadius;
  cardPadding: PortfolioTeamCardPadding;
  cardMaxWidth: PortfolioTeamCardMaxWidth;
  listAlign: PortfolioTeamListAlign;
  avatarSize: PortfolioTeamAvatarSize;
  cardShadow: PortfolioTeamCardShadow;
  cardBorder: PortfolioTeamCardBorder;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderColor: string;
  /** Directory: separate member cards instead of one list frame. */
  directoryDetachedCards: boolean;
  /** Portrait rail: how the viewer moves through the members (Design → Layout settings). */
  railNavigation: PortfolioTeamRailNavigation;
  /** Portrait rail, `show-all` navigation only: portraits per row on large screens. */
  railColumns: PortfolioTeamRailColumns;
  /** Portrait rail: corner radius of each portrait. */
  railImageRadius: PortfolioTeamCornerRadius;
  /** Portrait rail: portrait height — viewport-based in the rail, ratio-based in `show-all`. */
  railImageHeight: PortfolioTeamImageHeight;
  /** Polaroid: how the print's color renders — black & white on hover, always mono, or always color. */
  polaroidPhotoTone: PortfolioTeamPolaroidPhotoTone;
  /** Polaroid, "View all" grid only: prints per row on large screens (never more than four). */
  polaroidColumns: PortfolioTeamRailColumns;
  /** Profile cards: the navigation the section opens on (the visitor can still switch). */
  profileCardsView: PortfolioTeamProfileView;
  /** Profile cards: offset every other card so the columns break their rigid baseline. */
  profileCardsStagger: boolean;
  /** Profile cards: cards per row in the grid view (never more than four at any breakpoint). */
  profileCardsColumns: PortfolioTeamRailColumns;
  /** Profile cards: the card's proportion, from square to 9:16. */
  profileCardsRatio: PortfolioTeamProfileRatio;
  /** Profile cards: horizontal spacing between cards, applied from `lg` up. */
  profileCardsGutter: PortfolioTeamProfileGutter;
  /** Profile cards: info panel always on the portrait, or revealed on hover. */
  profileCardsPanel: PortfolioTeamProfilePanel;
  /** Profile cards: how many the grid shows before `View all`. */
  profileCardsVisible: PortfolioTeamProfileVisible;
  /** Floating cards: the navigation the section opens on (the visitor can still switch). */
  floatCardsView: PortfolioTeamProfileView;
  /** Floating cards, grid view only: cards per row on large screens (never more than four). */
  floatCardsColumns: PortfolioTeamRailColumns;
  /** Floating cards, grid view only: drop every other column so the rows break their baseline. */
  floatCardsStagger: boolean;
  /** Floating cards: the pointer-driven 3D tilt and its parallax (hover pointers only). */
  floatCardsTilt: boolean;
  /** Floating cards: where the block of cards sits — it is not forced to the centre. */
  floatCardsAlign: PortfolioTeamFloatAlign;
  /** Floating cards: horizontal space between the cards, in px (`TEAM_FLOAT_COLUMN_GAP` bounds). */
  floatCardsColumnGap: number;
  /** Avatar cards: the navigation the section opens on (the visitor can still switch). */
  avatarCardsView: PortfolioTeamAvatarView;
  /** Avatar cards, grid view only: offset every other card so the rows break their rigid baseline. */
  avatarCardsStagger: boolean;
  /** Avatar cards: the colored halo behind the avatar, lit from the palette's principal color. */
  avatarCardsGlow: boolean;
  /** Avatar cards: the shape the avatar morphs into on hover. */
  avatarCardsShape: PortfolioTeamAvatarShape;
  /** Avatar cards: members per row on a large screen (the grid still steps down on smaller ones). */
  avatarCardsColumns: PortfolioTeamAvatarColumns;
  /** Avatar cards: horizontal gutter between the columns, desktop only. */
  avatarCardsColumnGap: PortfolioTeamAvatarColumnGap;
  /** Avatar cards: the grid capped and centred, or spread across the whole content width. */
  avatarCardsGridWidth: PortfolioTeamAvatarGridWidth;
  /** Spotlight: side the portrait sits on (large screens); the copy takes the other side. */
  spotlightPortraitSide: PortfolioTeamSpotlightSide;
  /** Spotlight: how the viewer moves between members. */
  spotlightNavigation: PortfolioTeamSpotlightNavigation;
  /** Spotlight: corner radius of the panel (the portrait bleeds to its edge). */
  spotlightPanelRadius: PortfolioTeamCornerRadius;
  /** Spotlight: hovering a thumbnail switches the portrait (off = click only). */
  spotlightHoverSwitch: boolean;
  /** Split screen: side the full-height portrait sits on (large screens); the names take the other. */
  splitPortraitSide: PortfolioTeamSpotlightSide;
  /** Split screen: corner radius of the portrait plate (nothing else is framed). */
  splitPanelRadius: PortfolioTeamCornerRadius;
  /** Split screen: how the portrait's color renders — mono, full color, or color on hover. */
  splitPhotoTone: PortfolioTeamPolaroidPhotoTone;
  /** Split screen: social links behind a `Social links +` control instead of always shown. */
  splitSocialsReveal: boolean;
  /** Floating canvas: cards per row on large screens (the irregular grid stacks to one column below `lg`). */
  canvasColumns: PortfolioTeamRailColumns;
  /** Floating canvas: where the block of cards sits — it is not forced to the centre. */
  canvasAlign: PortfolioTeamFloatAlign;
  /** Floating canvas: the scroll-driven drift that separates the top and bottom of the canvas. */
  canvasParallax: boolean;
  /** Floating canvas: the editorial paragraph placed mid-canvas in place of a portrait. Empty uses a built-in line. */
  canvasEditorialText: string;
  /** Floating canvas: the kicker above that paragraph (the design prints the em rule). Empty uses "Studio note". */
  canvasEditorialLabel: string;
  /** Directory: portrait trailing the cursor on hover, or fixed on the left/right of every row. */
  directoryPortrait: PortfolioTeamDirectoryPortrait;
  /** Directory: corner radius of every portrait (fixed print, cursor plate, touch avatar); `full` = circle. */
  directoryPortraitRadius: PortfolioTeamAvatarRadius;
  /** Directory: vertical space between the cards, in px (`TEAM_DIRECTORY_CARD_GAP` bounds). */
  directoryCardGap: number;
  imageAspect: PortfolioTeamImageAspect;
  imageFit: PortfolioTeamImageFit;
  imagePosition: PortfolioTeamImagePosition;
  showName: boolean;
  showResponsibility: boolean;
  showSocials: boolean;
  showImage: boolean;
  socialIconSize: PortfolioTeamSocialIconSize;
  socialIconStyle: PortfolioTeamSocialIconStyle;
  /** General tab "Font size" — one scale for every member-facing text size in the section. */
  premiumFontSize: PortfolioTeamPremiumFontSize;
  socialIconColor: string;
  socialBackgroundColor: string;
  nameColor: string;
  responsibilityColor: string;
  titlePreset: PortfolioTeamTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioTeamSubtitlePreset;
  subtitleCustom: string;
  headerAlignment: PortfolioTeamHeaderAlignment;
  /**
   * Header — one shared, GSAP-animated header mounted above the Team section, copied
   * from the Portfolio/Work section's Header mechanism (team-portfolio-header-designs/*).
   */
  headerDesign: PortfolioTeamHeaderDesign;
  /** Master switch for the header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioTeamHeaderDesignAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioTeamHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioTeamHeaderTitleSize;
  headerTitleWeight: PortfolioTeamHeaderTitleWeight;
  /** Header accent count — badge text supports a {count} token for the team member count. */
  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  /** Header accent count — badge and lead bound to a palette token, independently. */
  headerAccentCountBadgeColor: PortfolioTeamHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioTeamHeaderPaletteToken;
  /** Header accent count — one size/weight for the whole line (badge + lead flow together). */
  headerAccentCountSize: PortfolioTeamHeaderTitleSize;
  headerAccentCountWeight: PortfolioTeamHeaderTitleWeight;
  /** Header accent count — its own 3-way alignment (adds "right", unlike the shared control). */
  headerAccentCountAlignment: PortfolioTeamHeaderAccentCountAlignment;
  /** Header serif lead — small label above the large serif title. */
  headerSerifLeadLabelText: string;
  /** Header serif lead — the large serif title itself, independent of the section title. */
  headerSerifLeadTitleText: string;
  /** Header serif lead — each element bound to a palette token, independently. */
  headerSerifLeadLabelColor: PortfolioTeamHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioTeamHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioTeamHeaderPaletteToken;
  /** Header serif lead — each element sized/weighted independently. */
  headerSerifLeadLabelSize: PortfolioTeamHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioTeamHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioTeamHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioTeamHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioTeamHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioTeamHeaderTitleWeight;
  /** Header billboard — big faint background word + a {count}-token line. */
  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  /** Header billboard — the editorial split title beneath the big word, independent of the section title. */
  headerBillboardTitleText: string;
  /** Header billboard — outline (stroke only) or fill (solid) big word. */
  headerBillboardWordStyle: PortfolioTeamHeaderBillboardWordStyle;
  /** Header billboard — each element bound to a palette token, independently. */
  headerBillboardWordColor: PortfolioTeamHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioTeamHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioTeamHeaderPaletteToken;
  /** Header split heading — small label on the side opposite the narrative title. */
  headerSplitHeadingLabelText: string;
  /** Header split heading — the narrative title itself, independent of the section title. */
  headerSplitHeadingTitleText: string;
  /** Header split heading — each element bound to a palette token, independently. */
  headerSplitHeadingTitleColor: PortfolioTeamHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioTeamHeaderPaletteToken;
  /** Header split heading — each element sized/weighted independently. */
  headerSplitHeadingTitleSize: PortfolioTeamHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioTeamHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioTeamHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioTeamHeaderTitleWeight;
  /** Header masthead — up to 3 independent lines, monumental headline text,
   *  each stacked into the mast (no more period-splitting a single string). */
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  /** Header masthead — one color for the whole headline, across every line. */
  headerMastheadHeadlineColor: PortfolioTeamHeaderPaletteToken;
  /** Header masthead — one size/weight for the whole headline, across every line. */
  headerMastheadHeadlineSize: PortfolioTeamHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioTeamHeaderTitleWeight;
  /** Header index — small label on the top divider rule (e.g. "Index", "Catalog"). */
  headerIndexLabelText: string;
  /** Header index — the title beside the counting numeral, independent of the section title. */
  headerIndexTitleText: string;
  /** Header index — caption under the counter (e.g. "Members"). Empty falls back to automatic pluralization. */
  headerIndexCountLabelText: string;
  /** Header index — the small subtitle under the title, independent of the section subtitle. */
  headerIndexSubtitleText: string;
  /** Header index — each element bound to a palette token, independently. */
  headerIndexLabelColor: PortfolioTeamHeaderPaletteToken;
  headerIndexNumberColor: PortfolioTeamHeaderPaletteToken;
  headerIndexTitleColor: PortfolioTeamHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioTeamHeaderPaletteToken;
  /** Header index — each element sized/weighted independently. */
  headerIndexLabelSize: PortfolioTeamHeaderTitleSize;
  headerIndexLabelWeight: PortfolioTeamHeaderTitleWeight;
  headerIndexTitleSize: PortfolioTeamHeaderTitleSize;
  headerIndexTitleWeight: PortfolioTeamHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioTeamHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioTeamHeaderTitleWeight;
  /** Header marquee — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  /** Header marquee — alternating fill/outline words bound to one palette token. */
  headerMarqueeWordColor: PortfolioTeamHeaderPaletteToken;
  /** Header marquee — scales the repeating word band. */
  headerMarqueeSize: PortfolioTeamHeaderTitleSize;
  /**
   * `stacked` — title above the team grid (default).
   * `aside-left` / `aside-right` — title beside the grid on large screens.
   */
  sectionLayout: PortfolioTeamSectionLayout;
  /** Decorative SVG beside the team content (`none` hides it). */
  illustrationVariant: PortfolioTeamIllustrationVariant;
  /** Side of the content for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioTeamIllustrationPlacement;
  titleFont: PortfolioTeamHeaderFont;
  subtitleFont: PortfolioTeamHeaderFont;
  titleColor: string;
  subtitleColor: string;
  useHeroPalette: boolean;
  teamPalette?: PortfolioTeamPalette;
  teamColorBindings?: PortfolioTeamColorBindings;
  activeColorMode?: 'light' | 'dark';
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
};

export type PortfolioTeamSectionSettings = PortfolioSectionCopy & PortfolioTeamPresentationSettings;

export const PORTFOLIO_TEAM_LAYOUT_OPTIONS: {
  value: PortfolioTeamLayout;
  label: string;
  description: string;
}[] = [
  { value: 'portrait-rail', label: 'Portrait rail', description: 'Immersive portraits in a draggable rail with a scrub indicator.' },
  { value: 'spotlight', label: 'Spotlight', description: 'A monumental portrait panel; thumbnails swap it with a directional wipe.' },
  { value: 'split-screen', label: 'Split screen', description: 'Monumental names stacked on one side; the addressed one fills a full-height portrait on the other.' },
  { value: 'editorial-rhythm', label: 'Editorial rhythm', description: 'A broken grid of unequal plates; the first name is printed across its own portrait.' },
  { value: 'directory', label: 'Directory', description: 'A monumental numbered index; the portrait follows the cursor or sits in every row.' },
  { value: 'polaroid', label: 'Polaroid', description: 'Grained instant prints on a dark table — drag/chevron rail, monochrome-to-color hover, a grid toggle.' },
  { value: 'profile-cards', label: 'Profile cards', description: 'Portrait on top, name and socials centered below.' },
  { value: 'cover-cards', label: 'Hover veil', description: 'Portrait only — a dark veil reveals name, role, and links on hover.' },
  { value: 'avatar-cards', label: 'Avatar cards', description: 'Haloed avatars that morph out of their circle on hover — rail or staggered grid.' },
  { value: 'float-cards', label: 'Floating cards', description: 'A portrait floating over a card that tilts in 3D; the accent washes in from the cursor.' },
  { value: 'floating-canvas', label: 'Floating canvas', description: 'An irregular, ultra-airy canvas — names float above or below their portrait, broken by an editorial passage.' },
];

export const PORTFOLIO_TEAM_RAIL_NAVIGATIONS = [
  'drag',
  'chevrons',
  'show-all',
] as const satisfies readonly PortfolioTeamRailNavigation[];

export const PORTFOLIO_TEAM_RAIL_NAVIGATION_OPTIONS: {
  value: PortfolioTeamRailNavigation;
  label: string;
}[] = [
  { value: 'drag', label: 'Drag' },
  { value: 'chevrons', label: 'Arrows' },
  { value: 'show-all', label: 'Show all' },
];

export const PORTFOLIO_TEAM_RAIL_COLUMN_OPTIONS: {
  value: PortfolioTeamRailColumns;
  label: string;
}[] = [
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
];

export const PORTFOLIO_TEAM_POLAROID_PHOTO_TONES = [
  'hover',
  'monochrome',
  'color',
] as const satisfies readonly PortfolioTeamPolaroidPhotoTone[];

export const PORTFOLIO_TEAM_POLAROID_PHOTO_TONE_OPTIONS: {
  value: PortfolioTeamPolaroidPhotoTone;
  label: string;
  description: string;
}[] = [
  { value: 'hover', label: 'Hover to reveal', description: 'Black & white at rest, full color on hover.' },
  { value: 'monochrome', label: 'Black & white', description: 'Always black & white, even on hover.' },
  { value: 'color', label: 'Full color', description: 'Always in color — no monochrome filter.' },
];

export const PORTFOLIO_TEAM_PROFILE_VIEWS = [
  'rail',
  'grid',
] as const satisfies readonly PortfolioTeamProfileView[];

export const PORTFOLIO_TEAM_FLOAT_ALIGNS = [
  'left',
  'center',
  'right',
  'full',
] as const satisfies readonly PortfolioTeamFloatAlign[];

export const PORTFOLIO_TEAM_FLOAT_ALIGN_OPTIONS: {
  value: PortfolioTeamFloatAlign;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'full', label: 'Full width' },
];

export const TEAM_FLOAT_COLUMN_GAP = { min: 0, max: 96, step: 4 } as const;

/**
 * Before the slider existed the horizontal gutter came from the shared `gap` step. It stays the
 * fallback, so a site that never touched the slider renders exactly as before — these are the
 * same four values `FLOAT_CARDS_SCALE.gap` gives, in px.
 */
export function teamFloatDefaultColumnGap(gap: PortfolioTeamGap | undefined): number {
  if (gap === 'sm') return 12;
  if (gap === 'md') return 18;
  if (gap === 'xl') return 36;
  return 24;
}

function clampTeamFloatColumnGap(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(TEAM_FLOAT_COLUMN_GAP.max, Math.max(TEAM_FLOAT_COLUMN_GAP.min, Math.round(value)));
}

export const PORTFOLIO_TEAM_PROFILE_VIEW_OPTIONS: {
  value: PortfolioTeamProfileView;
  label: string;
}[] = [
  { value: 'rail', label: 'Rail' },
  { value: 'grid', label: 'Grid' },
];

export const PORTFOLIO_TEAM_PROFILE_RATIOS = [
  'square',
  'soft',
  'portrait',
  'tall',
  'xtall',
] as const satisfies readonly PortfolioTeamProfileRatio[];

/** Labelled by the ratio itself — the card beside it already shows the shape. Ordered
 *  widest → tallest, so the row reads as the axis it is. */
export const PORTFOLIO_TEAM_PROFILE_RATIO_OPTIONS: {
  value: PortfolioTeamProfileRatio;
  label: string;
}[] = [
  { value: 'square', label: '1:1' },
  { value: 'soft', label: '4:5' },
  { value: 'portrait', label: '3:4' },
  { value: 'tall', label: '2:3' },
  { value: 'xtall', label: '9:16' },
];

export const PORTFOLIO_TEAM_PROFILE_GUTTERS = [
  'sm',
  'md',
  'lg',
  'xl',
] as const satisfies readonly PortfolioTeamProfileGutter[];

export const PORTFOLIO_TEAM_PROFILE_GUTTER_OPTIONS: {
  value: PortfolioTeamProfileGutter;
  label: string;
}[] = [
  { value: 'sm', label: 'Tight' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Wide' },
  { value: 'xl', label: 'Extra wide' },
];

export const PORTFOLIO_TEAM_PROFILE_PANELS = [
  'always',
  'hover',
] as const satisfies readonly PortfolioTeamProfilePanel[];

export const PORTFOLIO_TEAM_PROFILE_PANEL_OPTIONS: {
  value: PortfolioTeamProfilePanel;
  label: string;
}[] = [
  { value: 'always', label: 'Always' },
  { value: 'hover', label: 'On hover' },
];

export const PORTFOLIO_TEAM_PROFILE_VISIBLES = [
  '4',
  '6',
  '8',
  'all',
] as const satisfies readonly PortfolioTeamProfileVisible[];

export const PORTFOLIO_TEAM_PROFILE_VISIBLE_OPTIONS: {
  value: PortfolioTeamProfileVisible;
  label: string;
}[] = [
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: 'all', label: 'All' },
];

export const PORTFOLIO_TEAM_AVATAR_VIEWS = [
  'rail',
  'grid',
] as const satisfies readonly PortfolioTeamAvatarView[];

export const PORTFOLIO_TEAM_AVATAR_VIEW_OPTIONS: {
  value: PortfolioTeamAvatarView;
  label: string;
}[] = [
  { value: 'rail', label: 'Rail' },
  { value: 'grid', label: 'Grid' },
];

export const PORTFOLIO_TEAM_AVATAR_SHAPES = [
  'circle',
  'squircle',
  'arch',
] as const satisfies readonly PortfolioTeamAvatarShape[];

export const PORTFOLIO_TEAM_AVATAR_SHAPE_OPTIONS: {
  value: PortfolioTeamAvatarShape;
  label: string;
}[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'squircle', label: 'Squircle' },
  { value: 'arch', label: 'Arch' },
];

export const PORTFOLIO_TEAM_AVATAR_COLUMN_OPTIONS: {
  value: PortfolioTeamAvatarColumns;
  label: string;
}[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
];

export const PORTFOLIO_TEAM_AVATAR_COLUMN_GAPS = [
  'sm',
  'md',
  'lg',
  'xl',
] as const satisfies readonly PortfolioTeamAvatarColumnGap[];

export const PORTFOLIO_TEAM_AVATAR_COLUMN_GAP_OPTIONS: {
  value: PortfolioTeamAvatarColumnGap;
  label: string;
}[] = [
  { value: 'sm', label: 'Tight' },
  { value: 'md', label: 'Snug' },
  { value: 'lg', label: 'Roomy' },
  { value: 'xl', label: 'Wide' },
];

export const PORTFOLIO_TEAM_AVATAR_GRID_WIDTHS = [
  'centered',
  'full',
] as const satisfies readonly PortfolioTeamAvatarGridWidth[];

export const PORTFOLIO_TEAM_AVATAR_GRID_WIDTH_OPTIONS: {
  value: PortfolioTeamAvatarGridWidth;
  label: string;
}[] = [
  { value: 'centered', label: 'Centered' },
  { value: 'full', label: 'Full width' },
];

export const PORTFOLIO_TEAM_CORNER_RADII = [
  'none',
  'sm',
  'md',
  'lg',
] as const satisfies readonly PortfolioTeamCornerRadius[];

export const PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS: {
  value: PortfolioTeamCornerRadius;
  label: string;
}[] = [
  { value: 'none', label: 'Square' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PORTFOLIO_TEAM_AVATAR_RADII = [
  ...PORTFOLIO_TEAM_CORNER_RADII,
  'full',
] as const satisfies readonly PortfolioTeamAvatarRadius[];

export const PORTFOLIO_TEAM_AVATAR_RADIUS_OPTIONS: {
  value: PortfolioTeamAvatarRadius;
  label: string;
}[] = [...PORTFOLIO_TEAM_CORNER_RADIUS_OPTIONS, { value: 'full', label: 'Full' }];

export const PORTFOLIO_TEAM_IMAGE_HEIGHTS = [
  'short',
  'medium',
  'tall',
] as const satisfies readonly PortfolioTeamImageHeight[];

export const PORTFOLIO_TEAM_IMAGE_HEIGHT_OPTIONS: {
  value: PortfolioTeamImageHeight;
  label: string;
}[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'tall', label: 'Tall' },
];

export const PORTFOLIO_TEAM_SPOTLIGHT_SIDES = [
  'left',
  'right',
] as const satisfies readonly PortfolioTeamSpotlightSide[];

export const PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATIONS = [
  'thumbnails',
  'arrows',
  'both',
] as const satisfies readonly PortfolioTeamSpotlightNavigation[];

export const PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATION_OPTIONS: {
  value: PortfolioTeamSpotlightNavigation;
  label: string;
}[] = [
  { value: 'thumbnails', label: 'Thumbnails' },
  { value: 'arrows', label: 'Arrows' },
  { value: 'both', label: 'Both' },
];

export const PORTFOLIO_TEAM_SPOTLIGHT_SIDE_OPTIONS: {
  value: PortfolioTeamSpotlightSide;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];


export const PORTFOLIO_TEAM_DIRECTORY_PORTRAITS = [
  'cursor',
  'left',
  'right',
] as const satisfies readonly PortfolioTeamDirectoryPortrait[];

export const PORTFOLIO_TEAM_DIRECTORY_PORTRAIT_OPTIONS: {
  value: PortfolioTeamDirectoryPortrait;
  label: string;
}[] = [
  { value: 'cursor', label: 'On hover' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

export const PORTFOLIO_TEAM_GAP_OPTIONS: {
  value: PortfolioTeamGap;
  label: string;
}[] = [
  { value: 'sm', label: 'Tight' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export const PORTFOLIO_TEAM_TITLE_PRESET_OPTIONS = [
  { value: 'team' as const, label: 'Our team', description: 'Default English title.' },
  { value: 'meet-team' as const, label: 'Meet the team', description: 'A warm invitation.' },
  { value: 'people' as const, label: 'The talent', description: 'Focus on the people.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own title.' },
];

export const PORTFOLIO_TEAM_SUBTITLE_PRESET_OPTIONS = [
  { value: 'default' as const, label: 'Default', description: 'Uses the section subtitle text.' },
  { value: 'together' as const, label: 'Together', description: 'A line about collaboration.' },
  { value: 'expertise' as const, label: 'Expertise', description: 'Highlights complementary skills.' },
  { value: 'minimal' as const, label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own subtitle.' },
];

export {
  PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS,
  TEAM_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  TEAM_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  TEAM_HEADER_PALETTE_TOKEN_OPTIONS,
  teamHeaderDesignFontClass,
  teamHeaderDesignFontStyle,
  teamHeaderPaletteTokenColor,
  type PortfolioTeamHeaderAccentCountAlignment,
  type PortfolioTeamHeaderBillboardWordStyle,
  type PortfolioTeamHeaderDesign,
  type PortfolioTeamHeaderDesignAlignment,
  type PortfolioTeamHeaderMarginBottom,
  type PortfolioTeamHeaderPaletteToken,
  type PortfolioTeamHeaderTitleSize,
  type PortfolioTeamHeaderTitleWeight,
} from '@/components/portfolio/portfolio-team-header-settings';

export const PORTFOLIO_TEAM_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioTeamSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Title above, members below.',
  },
  {
    value: 'aside-left',
    label: 'Title on the left',
    description: 'Title on the left, team grid on the right (side by side).',
  },
  {
    value: 'aside-right',
    label: 'Title on the right',
    description: 'Team grid on the left, title on the right (side by side).',
  },
];

export const PORTFOLIO_TEAM_ILLUSTRATION_OPTIONS: {
  value: PortfolioTeamIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No decorative SVG beside the content.' },
  { value: 'chat', label: 'Chat', description: 'Conversation bubbles.' },
  { value: 'question', label: 'Question', description: 'Graphic question mark.' },
  { value: 'docs', label: 'Docs', description: 'Stacked documents.' },
  { value: 'support', label: 'Support', description: 'Support illustration.' },
  { value: 'hex', label: 'Hex', description: 'Hexagonal symbol.' },
];

export const PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioTeamIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'SVG on the left of the team content.' },
  { value: 'right', label: 'Right', description: 'SVG on the right of the team content.' },
];

export function isPortfolioTeamSectionLayout(value: unknown): value is PortfolioTeamSectionLayout {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_SECTION_LAYOUTS as readonly string[]).includes(value)
  );
}

export function isPortfolioTeamIllustrationVariant(
  value: unknown
): value is PortfolioTeamIllustrationVariant {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS as readonly string[]).includes(value)
  );
}

export function isPortfolioTeamIllustrationPlacement(
  value: unknown
): value is PortfolioTeamIllustrationPlacement {
  return (
    typeof value === 'string' &&
    (PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS as readonly string[]).includes(value)
  );
}

export function teamSectionLayoutIsAside(layout: PortfolioTeamSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + team grid (large screens). */
export function teamAsideLayoutClass(layout: PortfolioTeamSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const DEFAULT_TEAM_PRESENTATION: PortfolioTeamPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  layout: 'portrait-rail',
  columns: 3,
  gap: 'lg',
  cardRadius: 'xl',
  cardPadding: 'md',
  cardMaxWidth: 'sm',
  listAlign: 'center',
  avatarSize: 'md',
  cardShadow: 'soft',
  cardBorder: 'thin',
  cardBackgroundEnabled: true,
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e5e5e5',
  directoryDetachedCards: true,
  railNavigation: 'drag',
  railColumns: 3,
  railImageRadius: 'md',
  railImageHeight: 'tall',
  polaroidPhotoTone: 'hover',
  polaroidColumns: 3,
  profileCardsView: 'grid',
  profileCardsStagger: true,
  profileCardsColumns: 3,
  profileCardsRatio: 'portrait',
  profileCardsGutter: 'md',
  profileCardsPanel: 'always',
  profileCardsVisible: 'all',
  floatCardsView: 'grid',
  floatCardsColumns: 3,
  floatCardsStagger: true,
  floatCardsTilt: true,
  floatCardsAlign: 'center',
  floatCardsColumnGap: 24,
  avatarCardsView: 'grid',
  avatarCardsStagger: true,
  avatarCardsGlow: true,
  avatarCardsShape: 'squircle',
  avatarCardsColumns: 3,
  avatarCardsColumnGap: 'md',
  avatarCardsGridWidth: 'centered',
  spotlightPortraitSide: 'left',
  spotlightNavigation: 'thumbnails',
  spotlightPanelRadius: 'md',
  spotlightHoverSwitch: true,
  splitPortraitSide: 'right',
  splitPanelRadius: 'none',
  splitPhotoTone: 'monochrome',
  splitSocialsReveal: true,
  canvasColumns: 3,
  canvasAlign: 'center',
  canvasParallax: true,
  canvasEditorialText: '',
  canvasEditorialLabel: '',
  directoryPortrait: 'cursor',
  directoryPortraitRadius: 'md',
  directoryCardGap: 20,
  imageAspect: 'portrait',
  imageFit: 'cover',
  imagePosition: 'center',
  showName: true,
  showResponsibility: true,
  showSocials: true,
  showImage: true,
  socialIconSize: 'md',
  socialIconStyle: 'circle',
  premiumFontSize: 'medium',
  socialIconColor: '#171717',
  socialBackgroundColor: '#f5f5f5',
  nameColor: '#171717',
  responsibilityColor: '#737373',
  titlePreset: 'team',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  headerAlignment: 'center',
  headerDesign: 'editorial',
  headerAnimationEnabled: true,
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'md',
  headerTitleWeight: 'regular',
  headerAccentCountBadgeText: '',
  headerAccentCountLeadText: '',
  headerAccentCountBadgeColor: 'principal',
  headerAccentCountLeadColor: 'secondaire',
  headerAccentCountSize: 'md',
  headerAccentCountWeight: 'regular',
  headerAccentCountAlignment: 'left',
  headerSerifLeadLabelText: '',
  headerSerifLeadTitleText: '',
  headerSerifLeadLabelColor: 'texteFort',
  headerSerifLeadTitleColor: 'texteFort',
  headerSerifLeadSubtitleColor: 'texteFort',
  headerSerifLeadLabelSize: 'md',
  headerSerifLeadTitleSize: 'md',
  headerSerifLeadSubtitleSize: 'md',
  headerSerifLeadLabelWeight: 'regular',
  headerSerifLeadTitleWeight: 'regular',
  headerSerifLeadSubtitleWeight: 'regular',
  headerBillboardBigWord: '',
  headerBillboardCountText: '',
  headerBillboardTitleText: '',
  headerBillboardWordStyle: 'outline',
  headerBillboardWordColor: 'principal',
  headerBillboardTitleColor: 'principal',
  headerBillboardMetaColor: 'secondaire',
  headerSplitHeadingLabelText: '',
  headerSplitHeadingTitleText: '',
  headerSplitHeadingTitleColor: 'principal',
  headerSplitHeadingLabelColor: 'secondaire',
  headerSplitHeadingTitleSize: 'md',
  headerSplitHeadingTitleWeight: 'regular',
  headerSplitHeadingLabelSize: 'md',
  headerSplitHeadingLabelWeight: 'regular',
  headerMastheadLine1Text: '',
  headerMastheadLine2Text: '',
  headerMastheadLine3Text: '',
  headerMastheadHeadlineColor: 'principal',
  headerMastheadHeadlineSize: 'md',
  headerMastheadHeadlineWeight: 'regular',
  headerIndexLabelText: '',
  headerIndexTitleText: '',
  headerIndexCountLabelText: '',
  headerIndexSubtitleText: '',
  headerIndexLabelColor: 'texteFort',
  headerIndexNumberColor: 'principal',
  headerIndexTitleColor: 'texteFort',
  headerIndexSubtitleColor: 'texteFort',
  headerIndexLabelSize: 'md',
  headerIndexLabelWeight: 'regular',
  headerIndexTitleSize: 'md',
  headerIndexTitleWeight: 'regular',
  headerIndexSubtitleSize: 'md',
  headerIndexSubtitleWeight: 'regular',
  headerMarqueeWord1Text: '',
  headerMarqueeWord2Text: '',
  headerMarqueeWord3Text: '',
  headerMarqueeWord4Text: '',
  headerMarqueeWordColor: 'principal',
  headerMarqueeSize: 'md',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: '#171717',
  subtitleColor: '#737373',
  useHeroPalette: true,
  teamPalette: { ...DEFAULT_TEAM_PALETTE },
  teamColorBindings: { ...DEFAULT_TEAM_COLOR_BINDINGS },
  activeColorMode: 'light',
  colorModeOverride: 'auto',
};

Object.assign(DEFAULT_TEAM_PRESENTATION, applyTeamPaletteToSettings(DEFAULT_TEAM_PRESENTATION));

export const DEFAULT_TEAM_TITLE_EN = 'Our team';
export const DEFAULT_TEAM_SUBTITLE_EN = 'The people who bring every project to life.';
const LEGACY_TEAM_TITLES = new Set(['Notre équipe', 'NOTRE ÉQUIPE']);
const LEGACY_TEAM_SUBTITLES = new Set(['Les personnes qui donnent vie à chaque projet.']);

const SUBTITLE_COPY = {
  together: 'Complementary personalities united around a shared ambition.',
  expertise: 'Complementary expertise to bring every project to life.',
};

export function migrateLegacyTeamCopy(title: string, subtitle: string): { title: string; subtitle: string } {
  return {
    title: LEGACY_TEAM_TITLES.has(title.trim()) ? DEFAULT_TEAM_TITLE_EN : title,
    subtitle: LEGACY_TEAM_SUBTITLES.has(subtitle.trim()) ? DEFAULT_TEAM_SUBTITLE_EN : subtitle,
  };
}

export function resolveTeamSectionTitle(
  settings: Pick<PortfolioTeamSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  const raw =
    settings.titlePreset === 'meet-team'
      ? 'Meet the team'
      : settings.titlePreset === 'people'
        ? 'The talent'
        : settings.titlePreset === 'custom'
          ? settings.titleCustom.trim() || settings.title.trim()
          : DEFAULT_TEAM_TITLE_EN;
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveTeamSectionSubtitle(
  settings: Pick<PortfolioTeamSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset === 'minimal') return '';
  if (settings.subtitlePreset === 'together') return SUBTITLE_COPY.together;
  if (settings.subtitlePreset === 'expertise') return SUBTITLE_COPY.expertise;
  if (settings.subtitlePreset === 'custom') return settings.subtitleCustom.trim() || settings.subtitle.trim();
  const stored = settings.subtitle.trim();
  if (!stored || LEGACY_TEAM_SUBTITLES.has(stored)) return DEFAULT_TEAM_SUBTITLE_EN;
  return stored;
}

export function teamHeaderFontClass(font: PortfolioTeamHeaderFont, kind: 'title' | 'subtitle'): string {
  if (font === 'serif') return kind === 'title' ? 'font-serif font-bold tracking-tight' : 'font-serif';
  if (font === 'display') return 'font-black uppercase tracking-[0.08em]';
  return kind === 'title' ? 'font-extrabold tracking-tight' : 'font-sans';
}

export function teamHeaderFontStyle(_font: PortfolioTeamHeaderFont): CSSProperties | undefined {
  return undefined;
}

export function teamTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, '#171717') };
}

export function teamSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, '#737373') };
}

export function teamGridClass(
  columns: number,
  gap: PortfolioTeamGap,
  align: PortfolioTeamListAlign = 'center'
): string {
  const cols =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'sm:grid-cols-2'
        : columns === 4
          ? 'sm:grid-cols-2 xl:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3';
  const gaps =
    gap === 'sm' ? 'gap-4' : gap === 'md' ? 'gap-10' : gap === 'xl' ? 'gap-28' : 'gap-16';
  const justify =
    align === 'left' ? 'justify-items-start' : align === 'right' ? 'justify-items-end' : 'justify-items-center';
  return `grid items-stretch ${justify} ${cols} ${gaps}`;
}

export function teamListAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'mr-auto';
  if (align === 'right') return 'ml-auto';
  return 'mx-auto';
}

export function teamAvatarSizeClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-16 w-16';
  if (size === 'lg') return 'h-32 w-32';
  if (size === 'xl') return 'h-44 w-44';
  return 'h-24 w-24';
}

export function teamCircleAvatarClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-20 w-20';
  if (size === 'lg') return 'h-36 w-36';
  if (size === 'xl') return 'h-48 w-48';
  return 'h-28 w-28';
}

export function teamFlexAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'items-start';
  if (align === 'right') return 'items-end';
  return 'items-center';
}

/**
 * Global type-size control for the Team section — same standardized-shared-value architecture as
 * the Experience/Footer/FAQ/Gallery sections' "Font size" control: one `--pf-team-font-scale`
 * custom property, set once on the section's `PortfolioSectionShell` root (`id="team"`, via
 * `cssVars` in `PublicCreatorPortfolioPage.tsx`) from `teamPremiumFontScale(premiumFontSize)`, and
 * multiplied into every member-facing font size across the ten designs with
 * `text-[calc(<base>*var(--pf-team-font-scale,1))]`.
 *
 * Unlike the other sections, Team scales its *display* type too — the member name is the content
 * here, not decoration, so a control that moved only the role labels would read as broken. What
 * stays out: the avatar-fallback initials (a glyph sized to a fixed box), anything already in `em`
 * (it inherits the scale from its scaled parent), and the section title / shared Header designs,
 * which have their own size control in Global.
 *
 * `medium` is the current baseline — the other tiers scale relative to that.
 */
export type PortfolioTeamPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export const TEAM_PREMIUM_FONT_SIZES: PortfolioTeamPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_TEAM_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioTeamPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across the Team section.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

/** Same multipliers as the Experience/Footer/FAQ/Gallery scales — kept in sync deliberately. */
const TEAM_PREMIUM_FONT_SCALE: Record<PortfolioTeamPremiumFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
  xxlarge: 1.45,
};

export function teamPremiumFontScale(size: PortfolioTeamPremiumFontSize | undefined): number {
  return (size && TEAM_PREMIUM_FONT_SCALE[size]) ?? 1;
}

export function teamSocialIconButtonClass(size: PortfolioTeamSocialIconSize | undefined): string {
  if (size === 'sm') return 'h-7 w-7';
  if (size === 'lg') return 'h-12 w-12';
  if (size === 'xl') return 'h-16 w-16';
  return 'h-9 w-9';
}

export function teamSocialIconGlyphClass(size: PortfolioTeamSocialIconSize | undefined): string {
  if (size === 'sm') return 'h-3 w-3';
  if (size === 'lg') return 'h-6 w-6';
  if (size === 'xl') return 'h-8 w-8';
  return 'h-4 w-4';
}

/**
 * Directory list width. The index sets names at display size with the role on the far side of the
 * row, so it needs real measure — at the old `max-w-xl` every single name wrapped onto two lines.
 */
export function teamDirectoryMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-2xl';
  if (width === 'sm' || width == null) return 'max-w-5xl';
  if (width === 'md') return 'max-w-6xl';
  if (width === 'lg') return 'max-w-7xl';
  if (width === 'xl') return 'max-w-[88rem]';
  return 'max-w-none';
}

/** Directory → Layout settings → Card spacing slider bounds, in px. */
export const TEAM_DIRECTORY_CARD_GAP = { min: 0, max: 80, step: 4 } as const;

/**
 * Before the slider existed, the space between Directory cards came from the shared `gap` step
 * (12/16/20/32px). It stays the fallback, so a site that never touched the slider renders exactly
 * as before.
 */
export function teamDirectoryDefaultCardGap(gap: PortfolioTeamGap | undefined): number {
  if (gap === 'sm') return 12;
  if (gap === 'md') return 16;
  if (gap === 'xl') return 32;
  return 20;
}

function clampTeamDirectoryCardGap(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(TEAM_DIRECTORY_CARD_GAP.max, Math.max(TEAM_DIRECTORY_CARD_GAP.min, Math.round(value)));
}

export function teamCardMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-[14rem]';
  if (width === 'sm' || width == null) return 'max-w-[17.5rem]';
  if (width === 'md') return 'max-w-[21rem]';
  if (width === 'lg') return 'max-w-[26rem]';
  if (width === 'xl') return 'max-w-[32rem]';
  return 'max-w-none';
}

/**
 * Spotlight panel width. Immersive scale — every step is wider than the old card-sized frame
 * (`sm` was `max-w-3xl`), because the design's whole premise is one monumental portrait.
 */
export function teamSpotlightMaxWidthClass(width: PortfolioTeamCardMaxWidth | undefined): string {
  if (width === 'xs') return 'max-w-4xl';
  if (width === 'sm' || width == null) return 'max-w-6xl';
  if (width === 'md') return 'max-w-7xl';
  if (width === 'lg') return 'max-w-[88rem]';
  if (width === 'xl') return 'max-w-[96rem]';
  return 'max-w-none';
}

export function teamContentAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'text-left';
  if (align === 'right') return 'text-right';
  return 'text-center';
}

export function teamSocialAlignClass(align: PortfolioTeamListAlign | undefined): string {
  if (align === 'left') return 'justify-start';
  if (align === 'right') return 'justify-end';
  return 'justify-center';
}

export function teamProfilePhotoHeightClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'h-44';
  if (size === 'lg') return 'h-72';
  if (size === 'xl') return 'h-96';
  return 'h-56';
}

export function teamHoverPhotoClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'aspect-[4/5] min-h-[16rem]';
  if (size === 'lg') return 'aspect-[4/5] min-h-[24rem]';
  if (size === 'xl') return 'aspect-[4/5] min-h-[28rem]';
  return 'aspect-[4/5] min-h-[20rem]';
}

export function teamHoverOverlayPaddingClass(size: PortfolioTeamAvatarSize | undefined): string {
  if (size === 'sm') return 'px-3 py-2.5';
  if (size === 'lg') return 'px-5 py-4';
  if (size === 'xl') return 'px-6 py-5';
  return 'px-4 py-3';
}

export const PORTFOLIO_TEAM_CARD_BORDER_OPTIONS: {
  value: PortfolioTeamCardBorder;
  label: string;
}[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'thin', label: 'Fine' },
  { value: 'medium', label: 'Moyenne' },
];

export function teamCardBorderClass(settings: PortfolioTeamPresentationSettings): string {
  const border = settings.cardBorder ?? 'thin';
  if (border === 'none') return 'border-0';
  if (border === 'medium') return 'border-2';
  return 'border';
}

export function teamCardFrameClass(settings: PortfolioTeamPresentationSettings): string {
  const radius = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', xl: 'rounded-[2rem]' }[settings.cardRadius];
  const shadow = { none: '', soft: 'shadow-sm', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[settings.cardShadow];
  return `${radius} ${shadow} ${teamCardBorderClass(settings)} overflow-hidden`;
}

export function teamCardFooterPaddingClass(padding: PortfolioTeamCardPadding | undefined): string {
  if (padding === 'none') return 'px-4 py-4';
  if (padding === 'sm') return 'px-4 py-4';
  if (padding === 'lg') return 'px-6 py-8';
  return 'px-5 py-6';
}

export function teamCardClass(settings: PortfolioTeamPresentationSettings): string {
  const radius = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', xl: 'rounded-[2rem]' }[settings.cardRadius];
  const padding = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-7' }[settings.cardPadding];
  const shadow = { none: '', soft: 'shadow-sm', medium: 'shadow-lg shadow-black/10', strong: 'shadow-2xl shadow-black/20' }[settings.cardShadow];
  return `${radius} ${padding} ${shadow} ${teamCardBorderClass(settings)} overflow-hidden`;
}

export function teamCardStyle(settings: PortfolioTeamPresentationSettings): CSSProperties {
  const border = settings.cardBorder ?? 'thin';
  const fillOn = settings.cardBackgroundEnabled !== false;
  return {
    backgroundColor: fillOn ? sanitizeHex(settings.cardBackgroundColor, '#ffffff') : 'transparent',
    borderColor: border === 'none' ? 'transparent' : sanitizeHex(settings.cardBorderColor, '#e5e5e5'),
  };
}

export function teamReadableCardText(settings: PortfolioTeamPresentationSettings) {
  return teamCardReadableText(
    settings.cardBackgroundColor,
    sanitizeHex(settings.nameColor, '#171717'),
    sanitizeHex(settings.responsibilityColor, '#737373')
  );
}

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

function clampColumns(value: unknown, fallback: 1 | 2 | 3 | 4): 1 | 2 | 3 | 4 {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : fallback;
}

export function pickTeamPresentationSettings(team: unknown): PortfolioTeamPresentationSettings {
  return mergeTeamPresentation(DEFAULT_TEAM_PRESENTATION, team);
}

export function mergeTeamPresentation(
  base: PortfolioTeamPresentationSettings,
  patch: unknown
): PortfolioTeamPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const layout = pick(
    record.layout,
    ['meet-cards', 'portrait-rail', 'spotlight', 'split-screen', 'editorial-rhythm', 'directory', 'polaroid', 'profile-cards', 'hover-cards', 'avatar-cards', 'cover-cards', 'float-cards', 'floating-canvas'],
    base.layout
  );
  const merged: PortfolioTeamPresentationSettings = {
    ...mergeSectionBackground(base, patch),
    // Two retired designs, kept accepted so a saved section never falls back to the default:
    // `meet-cards` became the rail, `hover-cards` was removed in favour of Hover veil.
    layout: layout === 'meet-cards' ? 'portrait-rail' : layout === 'hover-cards' ? 'cover-cards' : layout,
    columns: clampColumns(record.columns, base.columns),
    gap: pick(record.gap, ['sm', 'md', 'lg', 'xl'], base.gap),
    cardRadius: pick(record.cardRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    cardMaxWidth: pick(record.cardMaxWidth, ['xs', 'sm', 'md', 'lg', 'xl', 'full'], base.cardMaxWidth ?? 'sm'),
    listAlign: pick(record.listAlign, ['left', 'center', 'right'], base.listAlign ?? 'center'),
    avatarSize: pick(record.avatarSize, ['sm', 'md', 'lg', 'xl'], base.avatarSize ?? 'md'),
    cardShadow: pick(record.cardShadow, ['none', 'soft', 'medium', 'strong'], base.cardShadow),
    cardBorder: pick(record.cardBorder, ['none', 'thin', 'medium'], base.cardBorder ?? 'thin'),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : (base.cardBackgroundEnabled ?? true),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    directoryDetachedCards:
      typeof record.directoryDetachedCards === 'boolean'
        ? record.directoryDetachedCards
        : (base.directoryDetachedCards ?? true),
    railNavigation: pick(
      record.railNavigation,
      PORTFOLIO_TEAM_RAIL_NAVIGATIONS,
      base.railNavigation ?? 'drag'
    ),
    railColumns:
      record.railColumns === 2 || record.railColumns === 3 || record.railColumns === 4
        ? record.railColumns
        : (base.railColumns ?? 3),
    railImageRadius: pick(
      record.railImageRadius,
      PORTFOLIO_TEAM_CORNER_RADII,
      base.railImageRadius ?? 'md'
    ),
    railImageHeight: pick(
      record.railImageHeight,
      PORTFOLIO_TEAM_IMAGE_HEIGHTS,
      base.railImageHeight ?? 'tall'
    ),
    polaroidPhotoTone: pick(
      record.polaroidPhotoTone,
      PORTFOLIO_TEAM_POLAROID_PHOTO_TONES,
      base.polaroidPhotoTone ?? 'hover'
    ),
    polaroidColumns:
      record.polaroidColumns === 2 || record.polaroidColumns === 3 || record.polaroidColumns === 4
        ? record.polaroidColumns
        : (base.polaroidColumns ?? 3),
    profileCardsView: pick(
      record.profileCardsView,
      PORTFOLIO_TEAM_PROFILE_VIEWS,
      base.profileCardsView ?? 'grid'
    ),
    profileCardsStagger:
      typeof record.profileCardsStagger === 'boolean'
        ? record.profileCardsStagger
        : (base.profileCardsStagger ?? true),
    profileCardsColumns:
      record.profileCardsColumns === 2 || record.profileCardsColumns === 3 || record.profileCardsColumns === 4
        ? record.profileCardsColumns
        : (base.profileCardsColumns ?? 3),
    profileCardsRatio: pick(
      record.profileCardsRatio,
      PORTFOLIO_TEAM_PROFILE_RATIOS,
      base.profileCardsRatio ?? 'portrait'
    ),
    profileCardsGutter: pick(
      record.profileCardsGutter,
      PORTFOLIO_TEAM_PROFILE_GUTTERS,
      base.profileCardsGutter ?? 'md'
    ),
    profileCardsPanel: pick(
      record.profileCardsPanel,
      PORTFOLIO_TEAM_PROFILE_PANELS,
      base.profileCardsPanel ?? 'always'
    ),
    profileCardsVisible: pick(
      record.profileCardsVisible,
      PORTFOLIO_TEAM_PROFILE_VISIBLES,
      base.profileCardsVisible ?? 'all'
    ),
    floatCardsView: pick(
      record.floatCardsView,
      PORTFOLIO_TEAM_PROFILE_VIEWS,
      base.floatCardsView ?? 'grid'
    ),
    floatCardsColumns:
      record.floatCardsColumns === 2 || record.floatCardsColumns === 3 || record.floatCardsColumns === 4
        ? record.floatCardsColumns
        : (base.floatCardsColumns ?? 3),
    floatCardsStagger:
      typeof record.floatCardsStagger === 'boolean'
        ? record.floatCardsStagger
        : (base.floatCardsStagger ?? true),
    floatCardsTilt:
      typeof record.floatCardsTilt === 'boolean' ? record.floatCardsTilt : (base.floatCardsTilt ?? true),
    floatCardsAlign: pick(
      record.floatCardsAlign,
      PORTFOLIO_TEAM_FLOAT_ALIGNS,
      base.floatCardsAlign ?? 'center'
    ),
    // Unset → whatever the shared `gap` step used to give the gutter, so nothing moves.
    floatCardsColumnGap: clampTeamFloatColumnGap(
      record.floatCardsColumnGap,
      record.gap !== undefined
        ? teamFloatDefaultColumnGap(pick(record.gap, ['sm', 'md', 'lg', 'xl'] as const, base.gap))
        : (base.floatCardsColumnGap ?? teamFloatDefaultColumnGap(base.gap))
    ),
    avatarCardsView: pick(
      record.avatarCardsView,
      PORTFOLIO_TEAM_AVATAR_VIEWS,
      base.avatarCardsView ?? 'grid'
    ),
    avatarCardsStagger:
      typeof record.avatarCardsStagger === 'boolean'
        ? record.avatarCardsStagger
        : (base.avatarCardsStagger ?? true),
    avatarCardsGlow:
      typeof record.avatarCardsGlow === 'boolean'
        ? record.avatarCardsGlow
        : (base.avatarCardsGlow ?? true),
    avatarCardsShape: pick(
      record.avatarCardsShape,
      PORTFOLIO_TEAM_AVATAR_SHAPES,
      base.avatarCardsShape ?? 'squircle'
    ),
    // Unset falls back to the section-wide `columns`, so a portfolio saved before this control
    // existed keeps the row it already had.
    avatarCardsColumns: clampColumns(
      record.avatarCardsColumns,
      base.avatarCardsColumns ?? clampColumns(base.columns, 3)
    ),
    avatarCardsColumnGap: pick(
      record.avatarCardsColumnGap,
      PORTFOLIO_TEAM_AVATAR_COLUMN_GAPS,
      base.avatarCardsColumnGap ?? 'md'
    ),
    avatarCardsGridWidth: pick(
      record.avatarCardsGridWidth,
      PORTFOLIO_TEAM_AVATAR_GRID_WIDTHS,
      base.avatarCardsGridWidth ?? 'centered'
    ),
    spotlightPortraitSide: pick(
      record.spotlightPortraitSide,
      PORTFOLIO_TEAM_SPOTLIGHT_SIDES,
      base.spotlightPortraitSide ?? 'left'
    ),
    spotlightNavigation: pick(
      record.spotlightNavigation,
      PORTFOLIO_TEAM_SPOTLIGHT_NAVIGATIONS,
      base.spotlightNavigation ?? 'thumbnails'
    ),
    spotlightPanelRadius: pick(
      record.spotlightPanelRadius,
      PORTFOLIO_TEAM_CORNER_RADII,
      base.spotlightPanelRadius ?? 'md'
    ),
    spotlightHoverSwitch:
      typeof record.spotlightHoverSwitch === 'boolean'
        ? record.spotlightHoverSwitch
        : (base.spotlightHoverSwitch ?? true),
    splitPortraitSide: pick(
      record.splitPortraitSide,
      PORTFOLIO_TEAM_SPOTLIGHT_SIDES,
      base.splitPortraitSide ?? 'right'
    ),
    splitPanelRadius: pick(
      record.splitPanelRadius,
      PORTFOLIO_TEAM_CORNER_RADII,
      base.splitPanelRadius ?? 'none'
    ),
    splitPhotoTone: pick(
      record.splitPhotoTone,
      PORTFOLIO_TEAM_POLAROID_PHOTO_TONES,
      base.splitPhotoTone ?? 'monochrome'
    ),
    splitSocialsReveal:
      typeof record.splitSocialsReveal === 'boolean'
        ? record.splitSocialsReveal
        : (base.splitSocialsReveal ?? true),
    canvasColumns:
      record.canvasColumns === 2 || record.canvasColumns === 3 || record.canvasColumns === 4
        ? record.canvasColumns
        : (base.canvasColumns ?? 3),
    canvasAlign: pick(record.canvasAlign, PORTFOLIO_TEAM_FLOAT_ALIGNS, base.canvasAlign ?? 'center'),
    canvasParallax:
      typeof record.canvasParallax === 'boolean' ? record.canvasParallax : (base.canvasParallax ?? true),
    canvasEditorialText:
      typeof record.canvasEditorialText === 'string'
        ? record.canvasEditorialText
        : (base.canvasEditorialText ?? ''),
    canvasEditorialLabel:
      typeof record.canvasEditorialLabel === 'string'
        ? record.canvasEditorialLabel
        : (base.canvasEditorialLabel ?? ''),
    directoryPortrait: pick(
      record.directoryPortrait,
      PORTFOLIO_TEAM_DIRECTORY_PORTRAITS,
      base.directoryPortrait ?? 'cursor'
    ),
    directoryPortraitRadius: pick(
      record.directoryPortraitRadius,
      PORTFOLIO_TEAM_AVATAR_RADII,
      base.directoryPortraitRadius ?? 'md'
    ),
    // Unset → whatever the shared `gap` step used to give the Directory, so nothing moves.
    directoryCardGap: clampTeamDirectoryCardGap(
      record.directoryCardGap,
      record.gap !== undefined
        ? teamDirectoryDefaultCardGap(pick(record.gap, ['sm', 'md', 'lg', 'xl'] as const, base.gap))
        : (base.directoryCardGap ?? teamDirectoryDefaultCardGap(base.gap))
    ),
    imageAspect: pick(record.imageAspect, ['square', 'portrait', 'landscape', 'auto'], base.imageAspect),
    imageFit: pick(record.imageFit, ['cover', 'contain'], base.imageFit),
    imagePosition: pick(record.imagePosition, ['center', 'top', 'bottom', 'left', 'right'], base.imagePosition),
    showName: typeof record.showName === 'boolean' ? record.showName : base.showName,
    showResponsibility: typeof record.showResponsibility === 'boolean' ? record.showResponsibility : base.showResponsibility,
    showSocials: typeof record.showSocials === 'boolean' ? record.showSocials : base.showSocials,
    showImage: typeof record.showImage === 'boolean' ? record.showImage : base.showImage,
    socialIconSize: pick(record.socialIconSize, ['sm', 'md', 'lg', 'xl'], base.socialIconSize),
    socialIconStyle: pick(record.socialIconStyle, ['circle', 'soft', 'outline', 'minimal'], base.socialIconStyle),
    premiumFontSize: pick(record.premiumFontSize, TEAM_PREMIUM_FONT_SIZES, base.premiumFontSize ?? 'medium'),
    socialIconColor: sanitizeHex(record.socialIconColor, base.socialIconColor),
    socialBackgroundColor: sanitizeHex(record.socialBackgroundColor, base.socialBackgroundColor),
    nameColor: sanitizeHex(record.nameColor, base.nameColor),
    responsibilityColor: sanitizeHex(record.responsibilityColor, base.responsibilityColor),
    titlePreset: pick(record.titlePreset, ['team', 'meet-team', 'people', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(record.subtitlePreset, ['default', 'together', 'expertise', 'minimal', 'custom'], base.subtitlePreset),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'], base.headerAlignment),
    headerDesign: pick(record.headerDesign, TEAM_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    headerAnimationEnabled:
      typeof record.headerAnimationEnabled === 'boolean'
        ? record.headerAnimationEnabled
        : (base.headerAnimationEnabled ?? true),
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'] as const,
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      TEAM_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, TEAM_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'regular'
    ),
    headerAccentCountBadgeText:
      typeof record.headerAccentCountBadgeText === 'string'
        ? record.headerAccentCountBadgeText
        : (base.headerAccentCountBadgeText ?? ''),
    headerAccentCountLeadText:
      typeof record.headerAccentCountLeadText === 'string'
        ? record.headerAccentCountLeadText
        : (base.headerAccentCountLeadText ?? ''),
    headerAccentCountBadgeColor: pick(
      record.headerAccentCountBadgeColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pick(
      record.headerAccentCountLeadColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pick(
      record.headerAccentCountSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pick(
      record.headerAccentCountWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pick(
      record.headerAccentCountAlignment,
      TEAM_HEADER_ACCENT_COUNT_ALIGNMENTS,
      base.headerAccentCountAlignment ?? 'left'
    ),
    headerSerifLeadLabelText:
      typeof record.headerSerifLeadLabelText === 'string'
        ? record.headerSerifLeadLabelText
        : (base.headerSerifLeadLabelText ?? ''),
    headerSerifLeadTitleText:
      typeof record.headerSerifLeadTitleText === 'string'
        ? record.headerSerifLeadTitleText
        : (base.headerSerifLeadTitleText ?? ''),
    headerSerifLeadLabelColor: pick(
      record.headerSerifLeadLabelColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadSubtitleWeight ?? 'regular'
    ),
    headerBillboardBigWord:
      typeof record.headerBillboardBigWord === 'string'
        ? record.headerBillboardBigWord
        : (base.headerBillboardBigWord ?? ''),
    headerBillboardCountText:
      typeof record.headerBillboardCountText === 'string'
        ? record.headerBillboardCountText
        : (base.headerBillboardCountText ?? ''),
    headerBillboardTitleText:
      typeof record.headerBillboardTitleText === 'string'
        ? record.headerBillboardTitleText
        : (base.headerBillboardTitleText ?? ''),
    headerBillboardWordStyle: pick(
      record.headerBillboardWordStyle,
      TEAM_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pick(
      record.headerBillboardTitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pick(
      record.headerBillboardMetaColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerBillboardMetaColor ?? 'secondaire'
    ),
    headerSplitHeadingLabelText:
      typeof record.headerSplitHeadingLabelText === 'string'
        ? record.headerSplitHeadingLabelText
        : (base.headerSplitHeadingLabelText ?? ''),
    headerSplitHeadingTitleText:
      typeof record.headerSplitHeadingTitleText === 'string'
        ? record.headerSplitHeadingTitleText
        : (base.headerSplitHeadingTitleText ?? ''),
    headerSplitHeadingTitleColor: pick(
      record.headerSplitHeadingTitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pick(
      record.headerSplitHeadingLabelColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pick(
      record.headerSplitHeadingTitleSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pick(
      record.headerSplitHeadingTitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pick(
      record.headerSplitHeadingLabelSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pick(
      record.headerSplitHeadingLabelWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingLabelWeight ?? 'regular'
    ),
    headerMastheadLine1Text:
      typeof record.headerMastheadLine1Text === 'string'
        ? record.headerMastheadLine1Text
        : (base.headerMastheadLine1Text ?? ''),
    headerMastheadLine2Text:
      typeof record.headerMastheadLine2Text === 'string'
        ? record.headerMastheadLine2Text
        : (base.headerMastheadLine2Text ?? ''),
    headerMastheadLine3Text:
      typeof record.headerMastheadLine3Text === 'string'
        ? record.headerMastheadLine3Text
        : (base.headerMastheadLine3Text ?? ''),
    headerMastheadHeadlineColor: pick(
      record.headerMastheadHeadlineColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerMastheadHeadlineWeight ?? 'regular'
    ),
    headerIndexLabelText:
      typeof record.headerIndexLabelText === 'string' ? record.headerIndexLabelText : (base.headerIndexLabelText ?? ''),
    headerIndexTitleText:
      typeof record.headerIndexTitleText === 'string' ? record.headerIndexTitleText : (base.headerIndexTitleText ?? ''),
    headerIndexCountLabelText:
      typeof record.headerIndexCountLabelText === 'string'
        ? record.headerIndexCountLabelText
        : (base.headerIndexCountLabelText ?? ''),
    headerIndexSubtitleText:
      typeof record.headerIndexSubtitleText === 'string'
        ? record.headerIndexSubtitleText
        : (base.headerIndexSubtitleText ?? ''),
    headerIndexLabelColor: pick(
      record.headerIndexLabelColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(
      record.headerIndexLabelSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(
      record.headerIndexTitleSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      TEAM_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      TEAM_HEADER_TITLE_WEIGHTS,
      base.headerIndexSubtitleWeight ?? 'regular'
    ),
    headerMarqueeWord1Text:
      typeof record.headerMarqueeWord1Text === 'string'
        ? record.headerMarqueeWord1Text
        : (base.headerMarqueeWord1Text ?? ''),
    headerMarqueeWord2Text:
      typeof record.headerMarqueeWord2Text === 'string'
        ? record.headerMarqueeWord2Text
        : (base.headerMarqueeWord2Text ?? ''),
    headerMarqueeWord3Text:
      typeof record.headerMarqueeWord3Text === 'string'
        ? record.headerMarqueeWord3Text
        : (base.headerMarqueeWord3Text ?? ''),
    headerMarqueeWord4Text:
      typeof record.headerMarqueeWord4Text === 'string'
        ? record.headerMarqueeWord4Text
        : (base.headerMarqueeWord4Text ?? ''),
    headerMarqueeWordColor: pick(
      record.headerMarqueeWordColor,
      TEAM_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pick(record.headerMarqueeSize, TEAM_HEADER_TITLE_SIZES, base.headerMarqueeSize ?? 'md'),
    sectionLayout: isPortfolioTeamSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    illustrationVariant: pick(
      record.illustrationVariant,
      PORTFOLIO_TEAM_ILLUSTRATION_VARIANTS,
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pick(
      record.illustrationPlacement,
      PORTFOLIO_TEAM_ILLUSTRATION_PLACEMENTS,
      base.illustrationPlacement ?? 'right'
    ),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    teamPalette: mergeTeamPalette(mergeTeamPalette(DEFAULT_TEAM_PALETTE, base.teamPalette), record.teamPalette),
    teamColorBindings: mergeTeamColorBindings(
      mergeTeamColorBindings(DEFAULT_TEAM_COLOR_BINDINGS, base.teamColorBindings),
      record.teamColorBindings
    ),
    activeColorMode: record.activeColorMode === 'dark' || record.activeColorMode === 'light' ? record.activeColorMode : base.activeColorMode,
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
  };
  return merged.useHeroPalette === false
    ? merged
    : { ...merged, ...applyTeamPaletteToSettings(merged), useHeroPalette: true };
}
