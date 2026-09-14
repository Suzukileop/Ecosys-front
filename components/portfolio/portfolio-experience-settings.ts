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
  | 'editorial'
  | 'milestone'
  | 'table'
  | 'cards'
  | 'reel'
  | 'duotone'
  | 'gallery'
  | 'spotlight'
  | 'loft'
  | 'press'
  | 'legacy'
  | 'asymmetric'
  | 'kinetic';

/** Legacy design ids persisted in older portfolios — coerced to `editorial` on merge. */
export const REMOVED_EXPERIENCE_DESIGNS = [
  'timeline',
  'timeline-accent',
  'timeline-editorial',
  'timeline-stepped',
  'stacked',
  'compact',
  'large',
] as const;

export type RemovedPortfolioExperienceDesign = (typeof REMOVED_EXPERIENCE_DESIGNS)[number];

export type PortfolioExperienceTitlePreset =
  | 'experience'
  | 'career-path'
  | 'work-history'
  | 'professional-journey'
  | 'custom';

export type PortfolioExperienceSubtitlePreset = 'default' | 'short' | 'career' | 'minimal' | 'custom';

export type PortfolioExperienceHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioExperienceHeaderAlignment = 'left' | 'center' | 'right';

/**
 * Header design applied from Experience → Header (above the design-owned lead).
 * `none` keeps only the design’s own header; more designs will be added one by one.
 */
export type PortfolioExperienceHeaderDesign =
  | 'none'
  | 'editorial'
  | 'milestone'
  | 'table'
  | 'cards'
  | 'reel'
  | 'duotone'
  | 'gallery'
  | 'spotlight'
  | 'loft'
  | 'press'
  | 'legacy';

/** Accent years header — display size mapped to text-4xl…text-7xl. */
export type PortfolioExperienceAccentYearsFontSize = 4 | 5 | 6 | 7;

/** Accent years header — badge corner radius in px. */
export type PortfolioExperienceAccentYearsRadius = 0 | 2 | 4;

/** Accent years header — badge fill from the active theme. */
export type PortfolioExperienceAccentYearsBadgeColor = 'accent' | 'principal' | 'secondaire';

export const PORTFOLIO_EXPERIENCE_ACCENT_YEARS_SIZE_OPTIONS: {
  value: PortfolioExperienceAccentYearsFontSize;
  label: string;
}[] = [
  { value: 4, label: 'Small' },
  { value: 5, label: 'Medium' },
  { value: 6, label: 'Large' },
  { value: 7, label: 'XL' },
];

export const PORTFOLIO_EXPERIENCE_ACCENT_YEARS_RADIUS_OPTIONS: {
  value: PortfolioExperienceAccentYearsRadius;
  label: string;
  description: string;
}[] = [
  { value: 0, label: 'Sharp', description: 'Square corners — architectural.' },
  { value: 2, label: 'Soft', description: 'Noticeable 10px round.' },
  { value: 4, label: 'Rounded', description: '20px round — clearly curved.' },
];

export const PORTFOLIO_EXPERIENCE_ACCENT_YEARS_COLOR_OPTIONS: {
  value: PortfolioExperienceAccentYearsBadgeColor;
  label: string;
}[] = [
  { value: 'accent', label: 'Accent' },
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondaire' },
];

export const DEFAULT_ACCENT_YEARS_BADGE_TEXT = '{years}+ years';
export const DEFAULT_ACCENT_YEARS_LEAD_TEXT = 'of hands-on experience in my field.';
export const DEFAULT_CENTERED_TITLE_TEXT = 'Experience';
export const DEFAULT_CENTERED_LEAD_TEXT = '{years}+ years of hands-on experience in my field.';
export const DEFAULT_SERIF_LEAD_LABEL_TEXT = 'Experience';
export const DEFAULT_SERIF_LEAD_TITLE_TEXT = '{years}+ years of hands-on experience in my field.';

export const ACCENT_YEARS_RADIUS_CSS: Record<PortfolioExperienceAccentYearsRadius, string> = {
  0: '0px',
  2: '10px',
  4: '20px',
};

export const ACCENT_YEARS_FONT_SIZE_CSS: Record<PortfolioExperienceAccentYearsFontSize, string> = {
  4: 'clamp(1.375rem, 2.8vw, 2.25rem)',
  5: 'clamp(1.75rem, 3.5vw, 3rem)',
  6: 'clamp(2.25rem, 4.2vw, 3.75rem)',
  7: 'clamp(2.75rem, 5.2vw, 4.5rem)',
};

export type PortfolioExperienceCenteredLeadWeight = 'light' | 'regular' | 'medium';
export type PortfolioExperienceCenteredLeadOpacity = 'muted' | 'balanced' | 'vibrant';
export type PortfolioExperienceCenteredScale = 'compact' | 'default' | 'monumental';
export type PortfolioExperienceCenteredMaxWidth = 'narrow' | 'balanced' | 'wide';
export type PortfolioExperienceCenteredLineHeight = 'tight' | 'aery' | 'spaced';
export type PortfolioExperienceCenteredDivider = 'none' | 'dot' | 'full' | 'track';
export type PortfolioExperienceCenteredDividerOpacity = 'ghost' | 'subtle' | 'accent';
export type PortfolioExperienceCenteredAlign = 'left' | 'center' | 'right';

export const PORTFOLIO_EXPERIENCE_CENTERED_WEIGHT_OPTIONS: {
  value: PortfolioExperienceCenteredLeadWeight;
  label: string;
}[] = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'medium', label: 'Medium' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_ALIGN_OPTIONS: {
  value: PortfolioExperienceCenteredAlign;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_OPACITY_OPTIONS: {
  value: PortfolioExperienceCenteredLeadOpacity;
  label: string;
}[] = [
  { value: 'muted', label: 'Muted' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'vibrant', label: 'Vibrant' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_SCALE_OPTIONS: {
  value: PortfolioExperienceCenteredScale;
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'monumental', label: 'Monumental' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_WIDTH_OPTIONS: {
  value: PortfolioExperienceCenteredMaxWidth;
  label: string;
}[] = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'wide', label: 'Wide' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_LEADING_OPTIONS: {
  value: PortfolioExperienceCenteredLineHeight;
  label: string;
}[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'aery', label: 'Aery' },
  { value: 'spaced', label: 'Spaced' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPTIONS: {
  value: PortfolioExperienceCenteredDivider;
  label: string;
}[] = [
  { value: 'none', label: 'None' },
  { value: 'dot', label: 'Minimal dot' },
  { value: 'full', label: 'Full width' },
  { value: 'track', label: 'Centered track' },
];

export const PORTFOLIO_EXPERIENCE_CENTERED_DIVIDER_OPACITY_OPTIONS: {
  value: PortfolioExperienceCenteredDividerOpacity;
  label: string;
}[] = [
  { value: 'ghost', label: 'Ghost' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'accent', label: 'Accent' },
];

export const CENTERED_LEAD_OPACITY: Record<PortfolioExperienceCenteredLeadOpacity, number> = {
  muted: 0.4,
  balanced: 0.65,
  vibrant: 1,
};

export const CENTERED_LEAD_WEIGHT: Record<PortfolioExperienceCenteredLeadWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
};

export const CENTERED_LEAD_WIDTH: Record<PortfolioExperienceCenteredMaxWidth, string> = {
  narrow: '40ch',
  balanced: '55ch',
  wide: '70ch',
};

export const CENTERED_LEAD_LINE_HEIGHT: Record<PortfolioExperienceCenteredLineHeight, number> = {
  tight: 1.3,
  aery: 1.6,
  spaced: 1.9,
};

export type PortfolioExperienceSerifLeadInk = 'current' | 'accent' | 'principal' | 'secondaire';
export type PortfolioExperienceSerifLeadLabelOpacity = 'ghost' | 'muted' | 'ink';
export type PortfolioExperienceSerifLeadTracking = 'tight' | 'editorial' | 'open';

export const PORTFOLIO_EXPERIENCE_SERIF_LEAD_INK_OPTIONS: {
  value: PortfolioExperienceSerifLeadInk;
  label: string;
}[] = [
  { value: 'current', label: 'Ink' },
  { value: 'accent', label: 'Accent' },
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondaire' },
];

export const PORTFOLIO_EXPERIENCE_SERIF_LEAD_TRACKING_OPTIONS: {
  value: PortfolioExperienceSerifLeadTracking;
  label: string;
}[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'open', label: 'Open' },
];

export const PORTFOLIO_EXPERIENCE_SERIF_LEAD_LABEL_OPACITY_OPTIONS: {
  value: PortfolioExperienceSerifLeadLabelOpacity;
  label: string;
}[] = [
  { value: 'ghost', label: 'Ghost' },
  { value: 'muted', label: 'Muted' },
  { value: 'ink', label: 'Ink' },
];

export const SERIF_LEAD_WEIGHT: Record<PortfolioExperienceCenteredLeadWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
};

export const SERIF_LEAD_WIDTH: Record<PortfolioExperienceCenteredMaxWidth, string> = {
  narrow: '32ch',
  balanced: '42ch',
  wide: '54ch',
};

export const SERIF_LEAD_LINE_HEIGHT: Record<PortfolioExperienceCenteredLineHeight, number> = {
  tight: 1.06,
  aery: 1.16,
  spaced: 1.3,
};

export const SERIF_LEAD_TRACKING: Record<PortfolioExperienceSerifLeadTracking, string> = {
  tight: '-0.055em',
  editorial: '-0.04em',
  open: '-0.018em',
};

export const SERIF_LEAD_LABEL_OPACITY: Record<PortfolioExperienceSerifLeadLabelOpacity, number> = {
  ghost: 0.25,
  muted: 0.4,
  ink: 0.72,
};

export type PortfolioExperienceMarqueeStyle = 'alternate' | 'fill' | 'outline';
export type PortfolioExperienceMarqueeDirection = 'ltr' | 'rtl';
export type PortfolioExperienceMarqueeSpeed = 'slow' | 'cruise' | 'fast';
export type PortfolioExperienceMarqueeEdgeFade = 'none' | 'soft' | 'wide';
export type PortfolioExperienceMarqueeSeparator = 'none' | 'dot';
export type PortfolioExperienceMarqueeWeight = 'light' | 'regular' | 'medium' | 'semibold';

// Spotlight Marquee Premium options
export type PortfolioExperienceSpotlightMarqueeSpeed = 'slow' | 'medium' | 'fast';
export type PortfolioExperienceSpotlightMarqueeDirection = 'left' | 'right';
export type PortfolioExperienceSpotlightMarqueeWeight = 'light' | 'normal' | 'bold';
export type PortfolioExperienceSpotlightMarqueeStyle = 'outline' | 'fill' | 'mixed';
export type PortfolioExperienceSpotlightMarqueeGap = 'sm' | 'md' | 'lg';

export const PORTFOLIO_EXPERIENCE_MARQUEE_STYLE_OPTIONS: {
  value: PortfolioExperienceMarqueeStyle;
  label: string;
}[] = [
  { value: 'alternate', label: 'Alternate' },
  { value: 'fill', label: 'Fill' },
  { value: 'outline', label: 'Outline' },
];

export const PORTFOLIO_EXPERIENCE_MARQUEE_DIRECTION_OPTIONS: {
  value: PortfolioExperienceMarqueeDirection;
  label: string;
}[] = [
  { value: 'ltr', label: 'Left → right' },
  { value: 'rtl', label: 'Right → left' },
];

export const PORTFOLIO_EXPERIENCE_MARQUEE_SPEED_OPTIONS: {
  value: PortfolioExperienceMarqueeSpeed;
  label: string;
}[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'fast', label: 'Fast' },
];

export const PORTFOLIO_EXPERIENCE_MARQUEE_FADE_OPTIONS: {
  value: PortfolioExperienceMarqueeEdgeFade;
  label: string;
}[] = [
  { value: 'none', label: 'None' },
  { value: 'soft', label: 'Soft' },
  { value: 'wide', label: 'Wide' },
];

export const PORTFOLIO_EXPERIENCE_MARQUEE_SEPARATOR_OPTIONS: {
  value: PortfolioExperienceMarqueeSeparator;
  label: string;
}[] = [
  { value: 'dot', label: 'Dot' },
  { value: 'none', label: 'None' },
];

export const PORTFOLIO_EXPERIENCE_MARQUEE_WEIGHT_OPTIONS: {
  value: PortfolioExperienceMarqueeWeight;
  label: string;
}[] = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
];

export const MARQUEE_WEIGHT: Record<PortfolioExperienceMarqueeWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
};

// Spotlight Marquee Premium option arrays
export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_SPEED_OPTIONS: {
  value: PortfolioExperienceSpotlightMarqueeSpeed;
  label: string;
}[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'fast', label: 'Fast' },
];

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_DIRECTION_OPTIONS: {
  value: PortfolioExperienceSpotlightMarqueeDirection;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_WEIGHT_OPTIONS: {
  value: PortfolioExperienceSpotlightMarqueeWeight;
  label: string;
}[] = [
  { value: 'light', label: 'Light' },
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
];

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_STYLE_OPTIONS: {
  value: PortfolioExperienceSpotlightMarqueeStyle;
  label: string;
}[] = [
  { value: 'outline', label: 'Outline' },
  { value: 'fill', label: 'Fill' },
  { value: 'mixed', label: 'Mixed' },
];

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_MARQUEE_GAP_OPTIONS: {
  value: PortfolioExperienceSpotlightMarqueeGap;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

// Spotlight Marquee Premium constant mappings
export const SPOTLIGHT_MARQUEE_SPEED_PX: Record<PortfolioExperienceSpotlightMarqueeSpeed, number> = {
  slow: 28,
  medium: 44,
  fast: 72,
};

export const SPOTLIGHT_MARQUEE_WEIGHT: Record<PortfolioExperienceSpotlightMarqueeWeight, number> = {
  light: 300,
  normal: 400,
  bold: 700,
};

export const SPOTLIGHT_MARQUEE_GAP: Record<PortfolioExperienceSpotlightMarqueeGap, string> = {
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
};

export const MARQUEE_FILL_OPACITY: Record<PortfolioExperienceSerifLeadLabelOpacity, number> = {
  ghost: 0.55,
  muted: 0.85,
  ink: 1,
};

export const MARQUEE_SPEED_PX: Record<PortfolioExperienceMarqueeSpeed, number> = {
  slow: 28,
  cruise: 44,
  fast: 72,
};

export const MARQUEE_EDGE_FADE: Record<PortfolioExperienceMarqueeEdgeFade, string> = {
  none: '0%',
  soft: '10%',
  wide: '18%',
};

export function resolveMarqueeInkColor(
  presentation: Pick<PortfolioExperiencePresentationSettings, 'marqueeInk' | 'accentColor'>,
  ink: string
): string {
  switch (presentation.marqueeInk) {
    case 'accent':
      return experienceAccentColor(presentation.accentColor);
    case 'principal':
      return 'var(--pf-palette-principal)';
    case 'secondaire':
      return 'var(--pf-palette-secondaire)';
    default:
      return ink;
  }
}

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

/** Gallery design: how many thumbnail cards per row on large screens. */
export type PortfolioExperienceGalleryColumns = 2 | 3;

export const PORTFOLIO_EXPERIENCE_GALLERY_COLUMNS_OPTIONS: {
  value: PortfolioExperienceGalleryColumns;
  label: string;
  description: string;
}[] = [
  { value: 2, label: '2 per row', description: 'Fewer, larger thumbnails.' },
  { value: 3, label: '3 per row', description: 'The default — more cards visible at once.' },
];

/** Loft design: how many cards per row on large screens. */
export type PortfolioExperienceLoftColumns = 2 | 3 | 4;

export const PORTFOLIO_EXPERIENCE_LOFT_COLUMNS_OPTIONS: {
  value: PortfolioExperienceLoftColumns;
  label: string;
  description: string;
}[] = [
  { value: 2, label: '2 per row', description: 'Fewer, larger cards.' },
  { value: 3, label: '3 per row', description: 'The default.' },
  { value: 4, label: '4 per row', description: 'More cards visible at once.' },
];

/** Gallery design: how the thumbnail image fits its frame. */
export type PortfolioExperienceGalleryThumbnailFit = 'cover' | 'contain';

export const PORTFOLIO_EXPERIENCE_GALLERY_THUMBNAIL_FIT_OPTIONS: {
  value: PortfolioExperienceGalleryThumbnailFit;
  label: string;
  description: string;
}[] = [
  { value: 'cover', label: 'Cover', description: 'Fills the frame — the default. May crop the image.' },
  { value: 'contain', label: 'Contain', description: 'Full image, never cropped — letterboxed to fit.' },
];

/** Gallery design: the full-bleed word above the section (e.g. "EXPERIENCE"). */
export type PortfolioExperienceGalleryBigTitleStyle = 'outline' | 'fill';

export const PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_STYLE_OPTIONS: {
  value: PortfolioExperienceGalleryBigTitleStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: 'Outline', description: 'Letters drawn as an outline only — the default.' },
  { value: 'fill', label: 'Fill', description: 'Solid, fully filled letters.' },
];

export type PortfolioExperienceGalleryBigTitleColor = 'current' | 'accent' | 'simple';

export const PORTFOLIO_EXPERIENCE_GALLERY_BIG_TITLE_COLOR_OPTIONS: {
  value: PortfolioExperienceGalleryBigTitleColor;
  label: string;
  description: string;
}[] = [
  { value: 'current', label: 'Current', description: 'The design’s own discreet tone — the default.' },
  { value: 'accent', label: 'Accent', description: 'Your section’s accent / primary color.' },
  { value: 'simple', label: 'Simple', description: 'Plain, flat color — same as the “Roles I’ve taken on” heading.' },
];

/** Gallery / Billboard header: entrance animation intensity. */
export type PortfolioExperienceGalleryHeaderAnimationStyle = 'dramatic' | 'subtle' | 'none';

export const PORTFOLIO_EXPERIENCE_GALLERY_HEADER_ANIMATION_STYLE_OPTIONS: {
  value: PortfolioExperienceGalleryHeaderAnimationStyle;
  label: string;
  description: string;
}[] = [
  { value: 'dramatic', label: 'Dramatic', description: 'Scale + blur reveal — billboard lighting up.' },
  { value: 'subtle', label: 'Subtle', description: 'Soft fade only, no scale or blur.' },
  { value: 'none', label: 'None', description: 'No entrance animation.' },
];

/** Gallery / Billboard header: secondary title typography. */
export type PortfolioExperienceGallerySecondaryTitleStyle = 'editorial' | 'uniform';

export const PORTFOLIO_EXPERIENCE_GALLERY_SECONDARY_TITLE_STYLE_OPTIONS: {
  value: PortfolioExperienceGallerySecondaryTitleStyle;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'First word italic light, rest semibold.' },
  { value: 'uniform', label: 'Uniform', description: 'Same weight on every word.' },
];

/** Gallery / Billboard header: role-count presentation. */
export type PortfolioExperienceGalleryRoleCountStyle = 'micro' | 'normal' | 'hidden';

export const PORTFOLIO_EXPERIENCE_GALLERY_ROLE_COUNT_STYLE_OPTIONS: {
  value: PortfolioExperienceGalleryRoleCountStyle;
  label: string;
  description: string;
}[] = [
  { value: 'micro', label: 'Micro', description: 'Uppercase, letter-spaced, small.' },
  { value: 'normal', label: 'Normal', description: 'Regular body size, sentence case.' },
  { value: 'hidden', label: 'Hidden', description: 'Hide the role count line.' },
];

/** Spotlight design: color treatment for the scrolling marquee title. */
export type PortfolioExperienceSpotlightTitleColor = 'ink' | 'accent' | 'alternating' | 'muted';

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_TITLE_COLOR_OPTIONS: {
  value: PortfolioExperienceSpotlightTitleColor;
  label: string;
  description: string;
}[] = [
  { value: 'ink', label: 'Ink', description: 'Words in ink, dots in accent — the default.' },
  { value: 'accent', label: 'Accent', description: 'Words in accent, dots in ink.' },
  { value: 'alternating', label: 'Alternating', description: 'Each word alternates between ink and accent.' },
  { value: 'muted', label: 'Muted', description: 'Words and dots both in the quiet secondary tone — no accent.' },
];

/** Spotlight design: how each row's thumbnail is presented. */
export type PortfolioExperienceSpotlightThumbnailFit = 'cover' | 'glass';

export const PORTFOLIO_EXPERIENCE_SPOTLIGHT_THUMBNAIL_FIT_OPTIONS: {
  value: PortfolioExperienceSpotlightThumbnailFit;
  label: string;
  description: string;
}[] = [
  { value: 'cover', label: 'Current', description: 'Fills the frame — the default, cropped to fit.' },
  { value: 'glass', label: 'Glassmorphism', description: 'Full image, never cropped — frosted glass backdrop.' },
];

/** Loft design: how each row's thumbnail is presented. */
export type PortfolioExperienceLoftThumbnailFit = 'cover' | 'glass';

export const PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_FIT_OPTIONS: {
  value: PortfolioExperienceLoftThumbnailFit;
  label: string;
  description: string;
}[] = [
  { value: 'cover', label: 'Current', description: 'Fills the frame — the default, cropped to fit.' },
  { value: 'glass', label: 'Glassmorphism', description: 'Full image, never cropped — frosted glass backdrop.' },
];

/** Loft design: which word gets italic treatment. */
export type PortfolioExperienceLoftHeadingItalicWord = 'first' | 'last' | 'none';

export const PORTFOLIO_EXPERIENCE_LOFT_HEADING_ITALIC_WORD_OPTIONS: {
  value: PortfolioExperienceLoftHeadingItalicWord;
  label: string;
  description: string;
}[] = [
  { value: 'first', label: 'First word', description: 'First word gets italic treatment.' },
  { value: 'last', label: 'Last word', description: 'Last word gets italic treatment.' },
  { value: 'none', label: 'None', description: 'No italic treatment.' },
];

/** Loft design: light first word vs all same weight. */
export type PortfolioExperienceLoftHeadingFontWeight = 'light-to-bold' | 'uniform';

export const PORTFOLIO_EXPERIENCE_LOFT_HEADING_FONT_WEIGHT_OPTIONS: {
  value: PortfolioExperienceLoftHeadingFontWeight;
  label: string;
  description: string;
}[] = [
  { value: 'light-to-bold', label: 'Light → Bold', description: 'Italic word is lighter, rest is bold.' },
  { value: 'uniform', label: 'Uniform', description: 'All words have the same weight.' },
];

/** Loft design: label casing style. */
export type PortfolioExperienceLoftLabelStyle = 'uppercase' | 'lowercase' | 'capitalize';

export const PORTFOLIO_EXPERIENCE_LOFT_LABEL_STYLE_OPTIONS: {
  value: PortfolioExperienceLoftLabelStyle;
  label: string;
  description: string;
}[] = [
  { value: 'uppercase', label: 'UPPERCASE', description: 'All caps label.' },
  { value: 'lowercase', label: 'lowercase', description: 'All lowercase label.' },
  { value: 'capitalize', label: 'Capitalize', description: 'First letter capitalized.' },
];

/** Loft design: vertical alignment of label with title. */
export type PortfolioExperienceLoftLabelPosition = 'top-aligned' | 'center-aligned';

export const PORTFOLIO_EXPERIENCE_LOFT_LABEL_POSITION_OPTIONS: {
  value: PortfolioExperienceLoftLabelPosition;
  label: string;
  description: string;
}[] = [
  { value: 'top-aligned', label: 'Top aligned', description: 'Label aligns with top of title.' },
  { value: 'center-aligned', label: 'Center aligned', description: 'Label vertically centered with title.' },
];

/** Loft design: scroll effect style. */
export type PortfolioExperienceLoftScrollEffectStyle = 'slide-right' | 'fade-only';

export const PORTFOLIO_EXPERIENCE_LOFT_SCROLL_EFFECT_STYLE_OPTIONS: {
  value: PortfolioExperienceLoftScrollEffectStyle;
  label: string;
  description: string;
}[] = [
  { value: 'slide-right', label: 'Slide right', description: 'Label slides right and fades out.' },
  { value: 'fade-only', label: 'Fade only', description: 'Label fades out without sliding.' },
];

/** Loft design: corner radius of the thumbnail frame. */
export type PortfolioExperienceLoftThumbnailRadius = 'none' | 'md' | 'xl';

export const PORTFOLIO_EXPERIENCE_LOFT_THUMBNAIL_RADIUS_OPTIONS: {
  value: PortfolioExperienceLoftThumbnailRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp corners — no border radius on the thumbnail.' },
  { value: 'md', label: 'Medium', description: 'Soft rounded corners — the default.' },
  { value: 'xl', label: 'Large', description: 'More rounded thumbnail frame.' },
];

export function experienceLoftThumbnailRadiusClass(radius: PortfolioExperienceLoftThumbnailRadius | undefined): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'xl':
      return 'rounded-[1.35rem] sm:rounded-[1.5rem]';
    case 'md':
    default:
      return 'rounded-2xl';
  }
}

/** Loft design: hover interaction on grid thumbnails. */
export type PortfolioExperienceLoftHoverEffect = 'curtain' | 'magnetic' | 'press';

export const PORTFOLIO_EXPERIENCE_LOFT_HOVER_EFFECT_OPTIONS: {
  value: PortfolioExperienceLoftHoverEffect;
  label: string;
  description: string;
}[] = [
  {
    value: 'curtain',
    label: 'Project Curtain',
    description: 'Dimmed at rest, full light + soft scale-out and inner glow on hover.',
  },
  {
    value: 'magnetic',
    label: 'Magnetic Cue',
    description: 'Title lifts while a blurred [ VIEW CASE ↗ ] cue appears on the thumbnail.',
  },
  {
    value: 'press',
    label: 'Press In',
    description: 'Thumbnail eases down 4px with a translucent white rim — physical button feel.',
  },
];

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

/** Left-column period / timeline chrome on editorial entries. */
export type PortfolioExperiencePeriodDesign = 'plain' | 'rail' | 'badge' | 'rule';

/** Editorial: accordion (one open) or every entry expanded with no toggle. */
export type PortfolioExperienceEntryExpandMode = 'accordion' | 'all-open';

/** Editorial expanded body: classic vertical stack, or right-hand Données & Actions column. */
export type PortfolioExperienceEditorialDetailLayout = 'stacked' | 'split-actions';

export const PORTFOLIO_EXPERIENCE_EDITORIAL_DETAIL_LAYOUT_OPTIONS: {
  value: PortfolioExperienceEditorialDetailLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Classic vertical flow — meta, copy, stack, then repo CTA under STACK.',
  },
  {
    value: 'split-actions',
    label: 'Split actions',
    description: 'Meta + status top-right, repo bottom-right — copy stays centered.',
  },
];

/** How responsibilities / tasks render inside an experience entry. */
export type PortfolioExperienceTasksDisplay =
  | 'engineering-grid'
  | 'cinematic-timeline'
  | 'editorial-dash'
  | 'accordion-stack'
  | 'architectural-index';

/** Map legacy task-display ids saved before the Award redesign. */
export function migrateExperienceTasksDisplay(value: unknown): PortfolioExperienceTasksDisplay | null {
  if (
    value === 'engineering-grid' ||
    value === 'cinematic-timeline' ||
    value === 'editorial-dash' ||
    value === 'accordion-stack' ||
    value === 'architectural-index'
  ) {
    return value;
  }
  if (value === 'arrows' || value === 'dashes') return 'editorial-dash';
  if (value === 'checkmarks' || value === 'chips') return 'engineering-grid';
  if (value === 'summary') return 'accordion-stack';
  return null;
}

/** Cards design: corner radius of each experience card. */
export type PortfolioExperienceCardsBorderRadius = 'none' | 'md' | 'xl';

/** Cards design: horizontal width of each stacked card (always centered). */
export type PortfolioExperienceCardsCardWidth = 'full' | 'medium' | 'small';

/** Cards design: vertical rhythm between title, body, tasks, tools inside a card. */
export type PortfolioExperienceCardsElementSpacing = 'sm' | 'md' | 'lg';

/** Cards design: vertical gap between stacked cards. */
export type PortfolioExperienceCardsVerticalGap = 'sm' | 'md' | 'lg';

/** Legacy design: image height proportion — 'lg' (tallest) is the current default. */
export type PortfolioExperienceLegacyThumbnailHeight = 'sm' | 'md' | 'lg';

/** Legacy design: image width within its column — 'lg' (full width) is the current default. */
export type PortfolioExperienceLegacyThumbnailWidth = 'sm' | 'md' | 'lg';

/** Legacy design: vertical gap between feature blocks — 'md' (current default), 'lg' is 2x that. */
export type PortfolioExperienceLegacyItemGap = 'sm' | 'md' | 'lg' | 'xl';

/** Legacy design: which side the image sits on when alternating is turned off. */
export type PortfolioExperienceLegacySide = 'left' | 'right';

/** Legacy header: animation effect style for the accent word. */
export type PortfolioExperienceLegacyAnimationStyle = 'bloom' | 'slide' | 'none';

/** Legacy header: font weight for the prefix text. */
export type PortfolioExperienceLegacyPrefixWeight = 'light' | 'normal' | 'bold';

/** Legacy header: styling combination for the accent word. */
export type PortfolioExperienceLegacyAccentStyle = 'italic-bold' | 'bold' | 'italic';

/** Legacy header: size difference of the accent word relative to prefix. */
export type PortfolioExperienceLegacyAccentSize = 'dramatic' | 'subtle' | 'same';

/** Legacy header: decorative underline style. */
export type PortfolioExperienceLegacyUnderlineStyle = 'solid' | 'gradient';

/** Legacy header: subtitle typography style. */
export type PortfolioExperienceLegacySubtitleStyle = 'micro' | 'serif' | 'normal';

/** Press / Masthead header: entrance animation style. */
export type PortfolioExperiencePressAnimationStyle = 'staggered' | 'simultaneous' | 'none';

/** Press / Masthead header: heading weight treatment. */
export type PortfolioExperiencePressHeadingWeightStyle = 'alternating' | 'uniform';

/** Press / Masthead header: subtitle typography. */
export type PortfolioExperiencePressSubtitleStyle = 'micro' | 'normal' | 'hidden';

/** Press / Masthead header: heading alignment. */
export type PortfolioExperiencePressHeadingAlignment = 'left' | 'center';

/** Press / Masthead header: scroll parallax intensity. */
export type PortfolioExperiencePressParallaxIntensity = 'subtle' | 'dramatic';

/** Cards design: one gap value for both row and column spacing. */
export type PortfolioExperienceCardsGridGap = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

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

/** Visual style for proof / portfolio links inside an experience entry. */
export type PortfolioExperienceProofLinkStyle =
  | 'pill'
  | 'soft'
  | 'outline'
  | 'plain'
  | 'accent'
  | 'underline';

/** Button harvested from each Experience layout. `auto` keeps each design’s native button. */
export type PortfolioExperienceRepoLinkStyle =
  | 'auto'
  | 'editorial'
  | 'milestone'
  | 'table'
  | 'cards'
  | 'reel'
  | 'duotone'
  | 'spotlight'
  | 'legacy'
  | 'icon'
  | 'underline'
  | 'solid'
  | 'ghost';

export const PORTFOLIO_EXPERIENCE_REPO_LINK_STYLES = [
  'auto',
  'editorial',
  'milestone',
  'table',
  'cards',
  'reel',
  'duotone',
  'spotlight',
  'legacy',
  'icon',
  'underline',
  'solid',
  'ghost',
] as const satisfies readonly PortfolioExperienceRepoLinkStyle[];

export const PORTFOLIO_EXPERIENCE_REPO_LINK_STYLE_OPTIONS: {
  value: Exclude<
    PortfolioExperienceRepoLinkStyle,
    'auto' | 'icon' | 'underline' | 'solid' | 'ghost' | 'milestone' | 'cards'
  >;
  label: string;
}[] = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'table', label: 'Table' },
  { value: 'reel', label: 'Reel' },
  { value: 'duotone', label: 'Duotone' },
  { value: 'spotlight', label: 'Spotlight' },
  { value: 'legacy', label: 'Legacy' },
];

/** Glyph used on Experience proof / repository link buttons that show an arrow. */
export type PortfolioExperienceLinkArrowStyle = 'northeast' | 'chevron' | 'east';

export const PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLES = [
  'northeast',
  'chevron',
  'east',
] as const satisfies readonly PortfolioExperienceLinkArrowStyle[];

export const PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLE_OPTIONS: {
  value: PortfolioExperienceLinkArrowStyle;
  label: string;
  description: string;
}[] = [
  { value: 'northeast', label: '↗', description: 'Diagonal exit arrow.' },
  { value: 'chevron', label: '›', description: 'Simple chevron.' },
  { value: 'east', label: '→', description: 'Horizontal arrow.' },
];

/** Concrete button to render. `auto` / legacy default `icon` keep the layout’s own button. */
export function resolveExperienceRepoLinkStyle(
  stored: PortfolioExperienceRepoLinkStyle | undefined,
  native: Exclude<PortfolioExperienceRepoLinkStyle, 'auto' | 'duotone'>
): Exclude<PortfolioExperienceRepoLinkStyle, 'auto' | 'duotone'> {
  if (!stored || stored === 'auto' || stored === 'icon' || stored === 'milestone' || stored === 'cards') {
    return native;
  }
  if (stored === 'duotone') return 'icon';
  if (stored === 'ghost' || stored === 'solid' || stored === 'underline') {
    return native === 'icon' ? stored : native;
  }
  return stored;
}

/** Reel design: how the Ongoing / Completed status is presented under "Period & status". */
export type PortfolioExperienceReelStatusStyle = 'minimal' | 'badge' | 'bar' | 'square' | 'plain';

export const PORTFOLIO_EXPERIENCE_REEL_STATUS_STYLE_OPTIONS: {
  value: PortfolioExperienceReelStatusStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'A small blinking dot with a monospaced label — the default.',
  },
  {
    value: 'badge',
    label: 'Badge',
    description: 'Pill chip with a checkmark / dot icon.',
  },
  {
    value: 'bar',
    label: 'Progress bar',
    description: 'Short horizontal bar instead of a badge.',
  },
  {
    value: 'square',
    label: 'Square dot',
    description: 'Small square marker, no background pill.',
  },
  {
    value: 'plain',
    label: 'Plain text',
    description: 'Just the label, colored by status — no icon, no chrome.',
  },
];

/** Reel design: scroll choreography between full-viewport roles. */
export type PortfolioExperienceReelScrollMotion =
  | 'index-distort'
  | 'fade-reveal'
  | 'sticky-vertical';

export const PORTFOLIO_EXPERIENCE_REEL_SCROLL_MOTION_OPTIONS: {
  value: PortfolioExperienceReelScrollMotion;
  label: string;
  description: string;
}[] = [
  {
    value: 'index-distort',
    label: 'Index distort',
    description: 'Creative skew / stretch / blur on the large “01” watermark as you scroll.',
  },
  {
    value: 'fade-reveal',
    label: 'Fade & reveal',
    description: 'Staggered fade-up of title, meta, copy, and footer — fluid block chaining.',
  },
  {
    value: 'sticky-vertical',
    label: 'Sticky vertical',
    description: 'Bottom story stays pinned; titles morph fluidly as you scroll through roles.',
  },
];

/** Duotone design: how you move between roles. */
export type PortfolioExperienceDuotoneScrollMode = 'sticky' | 'scroll' | 'slide';

export const PORTFOLIO_EXPERIENCE_DUOTONE_SCROLL_MODE_OPTIONS: {
  value: PortfolioExperienceDuotoneScrollMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'sticky',
    label: 'Sticky',
    description: 'The story card stays pinned centered while the role list scrolls past it.',
  },
  {
    value: 'scroll',
    label: 'Scroll',
    description: 'Plain scroll — no pinning, each role and its story move together.',
  },
  {
    value: 'slide',
    label: 'Slide',
    description: 'One role at a time — navigate with the chevron arrows, a smooth slide transition.',
  },
];

/** Duotone design, Slide mode: how the prev/next control is presented. */
export type PortfolioExperienceDuotoneSlideNavStyle = 'chevron' | 'text';

export const PORTFOLIO_EXPERIENCE_DUOTONE_SLIDE_NAV_STYLE_OPTIONS: {
  value: PortfolioExperienceDuotoneSlideNavStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'chevron',
    label: 'Chevron',
    description: 'Round prev/next arrow buttons — the original, quietest option.',
  },
  {
    value: 'text',
    label: 'Text',
    description: '"Previous / Next" text links — no icons.',
  },
];

/** Duotone design, Scroll / Slide modes only: color of the frame drawn around each full screen. */
export type PortfolioExperienceDuotoneFrameColor = 'none' | 'neutral' | 'muted';

export const PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_COLOR_OPTIONS: {
  value: PortfolioExperienceDuotoneFrameColor;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No frame — the default.' },
  { value: 'neutral', label: 'Neutral', description: 'The same discreet hairline color used elsewhere in this design.' },
  { value: 'muted', label: 'Muted', description: 'The secondary text color — a touch more visible than Neutral.' },
];

/** Duotone design, Scroll / Slide modes only: corner rounding of that same frame. */
export type PortfolioExperienceDuotoneFrameRadius = 'none' | 'sm' | 'lg';

export const PORTFOLIO_EXPERIENCE_DUOTONE_FRAME_RADIUS_OPTIONS: {
  value: PortfolioExperienceDuotoneFrameRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Square corners.' },
  { value: 'sm', label: 'Small', description: 'A subtle 16px rounding.' },
  { value: 'lg', label: 'Large', description: 'A more pronounced 28px rounding.' },
];

/** Duotone design, Sticky mode only: filter applied to the left-column thumbnail. */
export type PortfolioExperienceDuotoneThumbnailEffect = 'grayscale' | 'tint' | 'none';

export const PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_EFFECT_OPTIONS: {
  value: PortfolioExperienceDuotoneThumbnailEffect;
  label: string;
  description: string;
}[] = [
  { value: 'grayscale', label: 'Black & white', description: 'Desaturated image (default).' },
  { value: 'tint', label: 'Accent tint', description: 'Desaturated image tinted with the accent color.' },
  { value: 'none', label: 'None', description: 'Plain image, no filter.' },
];

/** Duotone design, Sticky mode only: height proportion of the left-column thumbnail. */
export type PortfolioExperienceDuotoneThumbnailHeight = 'sm' | 'md' | 'lg';

export const PORTFOLIO_EXPERIENCE_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS: {
  value: PortfolioExperienceDuotoneThumbnailHeight;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Short', description: 'A wider, shorter image.' },
  { value: 'md', label: 'Balanced', description: 'Current proportions (default).' },
  { value: 'lg', label: 'Tall', description: 'A taller, more square image.' },
];

/** CSS aspect-ratio value for the Duotone sticky-mode thumbnail — kept as an inline style,
 * not a Tailwind class (arbitrary-value classes silently fail to compile in this very large
 * file, the same issue documented on experienceLegacyThumbnailAspectRatio). */
export function experienceDuotoneThumbnailAspectRatio(
  height: PortfolioExperienceDuotoneThumbnailHeight | undefined
): string {
  switch (height) {
    case 'sm':
      return '16 / 9';
    case 'lg':
      return '1 / 1';
    case 'md':
    default:
      return '4 / 3';
  }
}

/** Caps the thumbnail's rendered height so a tall aspect ratio on a narrow column can never
 * push the title + thumbnail group past the screen's own min-h-screen budget — that overflow
 * used to get squeezed and clipped by the sticky column's fixed total height, which read as
 * the thumbnail overlapping the title. */
export function experienceDuotoneThumbnailMaxHeight(
  height: PortfolioExperienceDuotoneThumbnailHeight | undefined
): string {
  switch (height) {
    case 'sm':
      return '32vh';
    case 'lg':
      return '52vh';
    case 'md':
    default:
      return '42vh';
  }
}

/** Duotone Sticky / Scroll: where the repository CTA lives. */
export type PortfolioExperienceDuotoneRepoCtaMode = 'footer' | 'thumb-cursor';

export const PORTFOLIO_EXPERIENCE_DUOTONE_REPO_CTA_MODE_OPTIONS: {
  value: PortfolioExperienceDuotoneRepoCtaMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'footer',
    label: 'Footer button',
    description: 'Classic repository button under the stack.',
  },
  {
    value: 'thumb-cursor',
    label: 'Thumbnail cursor',
    description: 'Rounded Consult pill that follows the pointer over the miniature.',
  },
];

/** Duotone design, Sticky / Scroll modes: vertical air between title / media / editorial blocks. */
export type PortfolioExperienceDuotoneStickyVerticalGap = 'sm' | 'md' | 'lg' | 'xl';

export const PORTFOLIO_EXPERIENCE_DUOTONE_STICKY_VERTICAL_GAP_OPTIONS: {
  value: PortfolioExperienceDuotoneStickyVerticalGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Tighter title ↔ media and editorial rhythm.' },
  { value: 'md', label: 'Medium', description: 'Balanced spacing — the default.' },
  { value: 'lg', label: 'Large', description: 'More vertical air between elements.' },
  { value: 'xl', label: 'Extra large', description: 'Maximum breathing room.' },
];

/** Left-column title ↔ thumbnail gap in Duotone sticky / scroll modes. */
export function experienceDuotoneStickyLeftGapClass(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): string {
  switch (gap) {
    case 'sm':
      return 'gap-7 sm:gap-10';
    case 'lg':
      return 'gap-14 sm:gap-20';
    case 'xl':
      return 'gap-16 sm:gap-24';
    case 'md':
    default:
      return 'gap-10 sm:gap-14';
  }
}

/** Right-column block spacing tokens for Duotone sticky / scroll modes. */
export function experienceDuotoneStickyEditorialSpacing(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): { tasksMt: string; stackMt: string; stackGap: string; stackPt: string } {
  switch (gap) {
    case 'sm':
      return { tasksMt: 'mt-7', stackMt: 'mt-7', stackGap: 'gap-4', stackPt: 'pt-5' };
    case 'lg':
      return { tasksMt: 'mt-12', stackMt: 'mt-11', stackGap: 'gap-8', stackPt: 'pt-8' };
    case 'xl':
      return { tasksMt: 'mt-14', stackMt: 'mt-14', stackGap: 'gap-10', stackPt: 'pt-10' };
    case 'md':
    default:
      return { tasksMt: 'mt-10', stackMt: 'mt-9', stackGap: 'gap-6', stackPt: 'pt-7' };
  }
}

/** Scroll mode: title ↔ thumbnail row gap (roomier than sticky, still tight enough to read as one unit). */
export function experienceDuotoneScrollTitleThumbGapClass(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): string {
  switch (gap) {
    case 'sm':
      return 'gap-y-6 sm:gap-y-8';
    case 'lg':
      return 'gap-y-10 sm:gap-y-14';
    case 'xl':
      return 'gap-y-12 sm:gap-y-16';
    case 'md':
    default:
      return 'gap-y-8 sm:gap-y-10';
  }
}

/** Scroll mode: editorial rhythm — one step roomier than sticky for the same option. */
export function experienceDuotoneScrollEditorialSpacing(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): { tasksMt: string; stackMt: string; stackGap: string; stackPt: string } {
  switch (gap) {
    case 'sm':
      return { tasksMt: 'mt-9', stackMt: 'mt-9', stackGap: 'gap-5', stackPt: 'pt-6' };
    case 'lg':
      return { tasksMt: 'mt-14', stackMt: 'mt-14', stackGap: 'gap-10', stackPt: 'pt-10' };
    case 'xl':
      return { tasksMt: 'mt-16', stackMt: 'mt-16', stackGap: 'gap-12', stackPt: 'pt-12' };
    case 'md':
    default:
      return { tasksMt: 'mt-12', stackMt: 'mt-11', stackGap: 'gap-8', stackPt: 'pt-8' };
  }
}

/** Scroll mode: vertical air between successive role screens. */
export function experienceDuotoneScrollRoleStackClass(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): string {
  switch (gap) {
    case 'sm':
      return 'gap-20 sm:gap-24';
    case 'lg':
      return 'gap-32 sm:gap-40';
    case 'xl':
      return 'gap-40 sm:gap-52';
    case 'md':
    default:
      return 'gap-24 sm:gap-32';
  }
}

/** Sticky track height per role — more gap = longer scroll between entries. */
export function experienceDuotoneStickySectionVh(
  gap: PortfolioExperienceDuotoneStickyVerticalGap | undefined
): number {
  switch (gap) {
    case 'sm':
      return 92;
    case 'lg':
      return 112;
    case 'xl':
      return 124;
    case 'md':
    default:
      return 100;
  }
}

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
  | 'proof';

/** Per-element assignment to the story card or details card. */
export type PortfolioExperienceElementZones = Record<
  PortfolioExperienceElementId,
  PortfolioExperienceCardZone
>;

/** Block ids that can show an uppercase heading above the content. */
export type PortfolioExperienceBlockLabelId =
  | 'tasks'
  | 'proof'
  | 'tools';

export type PortfolioExperienceBlockLabelVisibility = Record<
  PortfolioExperienceBlockLabelId,
  boolean
>;

export const DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY: PortfolioExperienceBlockLabelVisibility = {
  tasks: true,
  proof: true,
  tools: true,
};

export const EXPERIENCE_BLOCK_LABEL_IDS: PortfolioExperienceBlockLabelId[] = [
  'tasks',
  'proof',
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
   * Applied Experience header design (Header subsection).
   * Renders in a zone above the design-owned header — Editorial first.
   */
  headerDesign: PortfolioExperienceHeaderDesign;
  /** Accent years only — badge copy. Empty falls back to the years template. `{years}` interpolates. */
  accentYearsBadgeText: string;
  /** Accent years only — sentence after the badge. Empty falls back to the years template. */
  accentYearsLeadText: string;
  /** Accent years only — display size, 4xl–7xl. */
  accentYearsFontSize: PortfolioExperienceAccentYearsFontSize;
  /** Accent years only — unitless line-height (1.00–1.20). */
  accentYearsLineHeight: number;
  /** Accent years only — letter-spacing in em (−0.06–0.02). */
  accentYearsLetterSpacing: number;
  /** Accent years only — badge horizontal padding in em. */
  accentYearsBadgePadX: number;
  /** Accent years only — badge vertical padding in em. */
  accentYearsBadgePadY: number;
  /** Accent years only — badge corner radius in px (0 / 2 / 4). */
  accentYearsBadgeRadius: PortfolioExperienceAccentYearsRadius;
  /** Accent years only — badge fill from the active theme. */
  accentYearsBadgeColor: PortfolioExperienceAccentYearsBadgeColor;
  /** Accent years only — lock the lead’s left edge to the timeline year. */
  accentYearsGridAnchor: boolean;
  /** Accent years only — space below the header, in rem. */
  accentYearsBottomRem: number;
  /** Centered header — title copy. Empty falls back to the section title. `{years}` interpolates. */
  centeredTitleText: string;
  /** Centered header — subtitle copy. Empty falls back to the years template. `{years}` interpolates. */
  centeredLeadText: string;
  /** Centered header — title + subtitle alignment. */
  centeredAlign: PortfolioExperienceCenteredAlign;
  /** Centered header — subtitle weight. */
  centeredLeadWeight: PortfolioExperienceCenteredLeadWeight;
  /** Centered header — subtitle opacity. */
  centeredLeadOpacity: PortfolioExperienceCenteredLeadOpacity;
  /** Centered header — title + subtitle scale. */
  centeredScale: PortfolioExperienceCenteredScale;
  /** Centered header — subtitle max-width / wrap. */
  centeredMaxWidth: PortfolioExperienceCenteredMaxWidth;
  /** Centered header — subtitle line-height. */
  centeredLineHeight: PortfolioExperienceCenteredLineHeight;
  /** Centered header — rule under the lead. */
  centeredDivider: PortfolioExperienceCenteredDivider;
  /** Centered header — divider strength / color. */
  centeredDividerOpacity: PortfolioExperienceCenteredDividerOpacity;
  /** Serif lead — micro-label copy. Empty falls back to the section title. `{years}` interpolates. */
  serifLeadLabelText: string;
  /** Serif lead — large title copy. Empty falls back to the years template. `{years}` interpolates. */
  serifLeadTitleText: string;
  /** Serif lead — label + title alignment. */
  serifLeadAlign: PortfolioExperienceCenteredAlign;
  /** Serif lead — title weight. */
  serifLeadWeight: PortfolioExperienceCenteredLeadWeight;
  /** Serif lead — title scale. */
  serifLeadScale: PortfolioExperienceCenteredScale;
  /** Serif lead — title max-width. */
  serifLeadMaxWidth: PortfolioExperienceCenteredMaxWidth;
  /** Serif lead — title line-height. */
  serifLeadLineHeight: PortfolioExperienceCenteredLineHeight;
  /** Serif lead — title letter-spacing. */
  serifLeadTracking: PortfolioExperienceSerifLeadTracking;
  /** Serif lead — italic title. */
  serifLeadItalic: boolean;
  /** Serif lead — title ink source. */
  serifLeadInk: PortfolioExperienceSerifLeadInk;
  /** Serif lead — micro-label opacity. */
  serifLeadLabelOpacity: PortfolioExperienceSerifLeadLabelOpacity;
  /** Serif lead — rule under the title. */
  serifLeadDivider: PortfolioExperienceCenteredDivider;
  /** Serif lead — divider strength / color. */
  serifLeadDividerOpacity: PortfolioExperienceCenteredDividerOpacity;
  /** Serif lead — GSAP intro + scroll fade. */
  serifLeadMotion: boolean;
  /** Marquee header — letter weight. */
  marqueeWeight: PortfolioExperienceMarqueeWeight;
  /** Marquee header — type scale. */
  marqueeScale: PortfolioExperienceCenteredScale;
  /** Marquee header — letter-spacing. */
  marqueeTracking: PortfolioExperienceSerifLeadTracking;
  /** Marquee header — word ink source. */
  marqueeInk: PortfolioExperienceSerifLeadInk;
  /** Marquee header — filled-word opacity. */
  marqueeFillOpacity: PortfolioExperienceSerifLeadLabelOpacity;
  /** Marquee header — fill / outline treatment. */
  marqueeStyle: PortfolioExperienceMarqueeStyle;
  /** Marquee header — travel direction. */
  marqueeDirection: PortfolioExperienceMarqueeDirection;
  /** Marquee header — cruise speed. */
  marqueeSpeed: PortfolioExperienceMarqueeSpeed;
  /** Marquee header — edge dissolve. */
  marqueeEdgeFade: PortfolioExperienceMarqueeEdgeFade;
  /** Marquee header — separator between words. */
  marqueeSeparator: PortfolioExperienceMarqueeSeparator;
  /** Marquee header — separator color. */
  marqueeSeparatorColor: PortfolioExperienceSerifLeadInk;
  /** Marquee header — GSAP loop + exit fade. */
  marqueeMotion: boolean;
  /** Marquee header — scroll velocity / reverse. */
  marqueeScrollLink: boolean;
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
  /** Gallery design: how many thumbnail cards per row on large screens. */
  galleryColumns: PortfolioExperienceGalleryColumns;
  /** Gallery design: how the thumbnail image fits its frame. */
  galleryThumbnailFit: PortfolioExperienceGalleryThumbnailFit;
  /** Gallery design: show the full-bleed word above the section (e.g. "EXPERIENCE"). */
  galleryBigTitleEnabled: boolean;
  /** Gallery design: the word itself. */
  galleryBigTitleText: string;
  /** Gallery design: outline vs fully filled letters. */
  galleryBigTitleStyle: PortfolioExperienceGalleryBigTitleStyle;
  /** Gallery design: color source for the word. */
  galleryBigTitleColor: PortfolioExperienceGalleryBigTitleColor;
  /** Gallery design: enable/disable GSAP animations. */
  galleryHeaderAnimationEnabled: boolean;
  /** Gallery design: animation intensity (dramatic / subtle / none). */
  galleryHeaderAnimationStyle: PortfolioExperienceGalleryHeaderAnimationStyle;
  /** Gallery design: secondary title typography (editorial italic vs uniform). */
  gallerySecondaryTitleStyle: PortfolioExperienceGallerySecondaryTitleStyle;
  /** Gallery design: custom secondary title text (default: "Roles I've taken on"). */
  gallerySecondaryTitleText: string;
  /** Gallery design: role count presentation (micro / normal / hidden). */
  galleryRoleCountStyle: PortfolioExperienceGalleryRoleCountStyle;
  /** Gallery design: custom role count text (use {count} placeholder). */
  galleryRoleCountText: string;
  /** Gallery design: enable scroll parallax effect. */
  galleryScrollParallaxEnabled: boolean;
  /** Spotlight design: show the scrolling marquee title above the section. */
  spotlightBigTitleEnabled: boolean;
  /** Spotlight design: the first word in the marquee cycle. */
  spotlightBigTitleText: string;
  /** Spotlight design: additional words cycled into the marquee — all optional. */
  spotlightBigTitleWord2: string;
  spotlightBigTitleWord3: string;
  spotlightBigTitleWord4: string;
  /** Spotlight design: color treatment for the marquee title. */
  spotlightBigTitleColor: PortfolioExperienceSpotlightTitleColor;
  /** Spotlight design: how each row's thumbnail is presented. */
  spotlightThumbnailFit: PortfolioExperienceSpotlightThumbnailFit;
  /** Spotlight design: enable/disable entry animations (marquee motion). */
  spotlightHeaderAnimationEnabled: boolean;
  /** Spotlight design: marquee scrolling speed. */
  spotlightMarqueeSpeed: PortfolioExperienceSpotlightMarqueeSpeed;
  /** Spotlight design: marquee scroll direction. */
  spotlightMarqueeDirection: PortfolioExperienceSpotlightMarqueeDirection;
  /** Spotlight design: pause marquee when hovering. */
  spotlightMarqueePauseOnHover: boolean;
  /** Spotlight design: marquee text weight. */
  spotlightMarqueeWeight: PortfolioExperienceSpotlightMarqueeWeight;
  /** Spotlight design: marquee text rendering style. */
  spotlightMarqueeStyle: PortfolioExperienceSpotlightMarqueeStyle;
  /** Spotlight design: fade edges with gradient. */
  spotlightMarqueeGradientFade: boolean;
  /** Spotlight design: gap between repeated words. */
  spotlightMarqueeGap: PortfolioExperienceSpotlightMarqueeGap;
  /** Spotlight design: speed up marquee on scroll. */
  spotlightScrollSpeedBoost: boolean;
  /** Loft design: show the plain static heading above the list. */
  loftHeadingEnabled: boolean;
  /** Loft design: the heading text. */
  loftHeadingText: string;
  /** Loft design: enable/disable GSAP animations. */
  loftHeaderAnimationEnabled: boolean;
  /** Loft design: which word gets italic treatment. */
  loftHeadingItalicWord: PortfolioExperienceLoftHeadingItalicWord;
  /** Loft design: light first word vs all same weight. */
  loftHeadingFontWeight: PortfolioExperienceLoftHeadingFontWeight;
  /** Loft design: custom label text. */
  loftLabelText: string;
  /** Loft design: label casing style. */
  loftLabelStyle: PortfolioExperienceLoftLabelStyle;
  /** Loft design: vertical alignment of label with title. */
  loftLabelPosition: PortfolioExperienceLoftLabelPosition;
  /** Loft design: enable scroll effect. */
  loftScrollEffectEnabled: boolean;
  /** Loft design: scroll effect style. */
  loftScrollEffectStyle: PortfolioExperienceLoftScrollEffectStyle;
  /** Loft design: how each row's thumbnail is presented. */
  loftThumbnailFit: PortfolioExperienceLoftThumbnailFit;
  /** Loft design: corner radius of the thumbnail frame. */
  loftThumbnailRadius: PortfolioExperienceLoftThumbnailRadius;
  /** Loft design: hover interaction on grid thumbnails. */
  loftHoverEffect: PortfolioExperienceLoftHoverEffect;
  /** Loft design: how many cards per row on large screens. */
  loftColumns: PortfolioExperienceLoftColumns;
  /** Loft design: gap between cards, both axes at once. */
  loftGap: PortfolioExperienceItemGap;
  /** Press design: show the bold headline above the two-column layout. */
  pressHeadingEnabled: boolean;
  /** Press design: the bold headline text. */
  pressHeadingText: string;
  /** Press design: small intro blurb in the left column, above the entry list. */
  pressIntroText: string;
  /** Press design: corner radius of each row's thumbnail. */
  pressThumbnailRadius: PortfolioExperienceCardsBorderRadius;
  /** Press design: enable/disable GSAP entry animations. */
  pressHeaderAnimationEnabled: boolean;
  /** Press design: word-by-word staggered vs all at once. */
  pressHeaderAnimationStyle: PortfolioExperiencePressAnimationStyle;
  /** Press design: alternating light/bold weight or uniform bold. */
  pressHeadingWeightStyle: PortfolioExperiencePressHeadingWeightStyle;
  /** Press design: subtitle micro-typography style. */
  pressSubtitleStyle: PortfolioExperiencePressSubtitleStyle;
  /** Press design: heading alignment (left or center). */
  pressHeadingAlignment: PortfolioExperiencePressHeadingAlignment;
  /** Press design: enable scroll parallax effect. */
  pressScrollParallaxEnabled: boolean;
  /** Press design: parallax intensity (subtle or dramatic). */
  pressScrollParallaxIntensity: PortfolioExperiencePressParallaxIntensity;
  /** Legacy design: show the two-tone hero title above the feature blocks. */
  legacyHeadingEnabled: boolean;
  /** Legacy design: hero title, plain part — shown in ink. */
  legacyHeadingText: string;
  /** Legacy design: hero title, accent part — shown in accent, after the plain part. */
  legacyHeadingAccentText: string;
  /** Legacy design: intro sentence centered under the hero title. */
  legacyIntroText: string;
  /** Legacy design: corner radius of each feature block's image. */
  legacyThumbnailRadius: PortfolioExperienceCardsBorderRadius;
  /** Legacy design: image height proportion — 3 tiers, tallest ('lg') is the current default. */
  legacyThumbnailHeight: PortfolioExperienceLegacyThumbnailHeight;
  /** Legacy design: image width within its column — 3 tiers, full ('lg') is the current default. */
  legacyThumbnailWidth: PortfolioExperienceLegacyThumbnailWidth;
  /** Legacy design: vertical gap between feature blocks — 3 tiers, 'md' is the current default. */
  legacyItemGap: PortfolioExperienceLegacyItemGap;
  /** Legacy design: alternate the image side (left/right) per entry — true (default) matches current behavior. */
  legacyAlternateSides: boolean;
  /** Legacy design: fixed image side used when legacyAlternateSides is off. */
  legacyFixedSide: PortfolioExperienceLegacySide;
  /** Legacy design: show the task list — off by default, unlike every other design. */
  legacyShowTasks: boolean;
  /** Legacy header: enable/disable GSAP entry + scroll animations. */
  legacyHeaderAnimationEnabled: boolean;
  /** Legacy header: accent word animation effect style. */
  legacyHeaderAnimationStyle: PortfolioExperienceLegacyAnimationStyle;
  /** Legacy header: font weight of the prefix text. */
  legacyPrefixWeight: PortfolioExperienceLegacyPrefixWeight;
  /** Legacy header: styling for the accent word (italic/bold combinations). */
  legacyAccentStyle: PortfolioExperienceLegacyAccentStyle;
  /** Legacy header: size difference of accent word. */
  legacyAccentSize: PortfolioExperienceLegacyAccentSize;
  /** Legacy header: show decorative underline under accent word. */
  legacyAccentUnderline: boolean;
  /** Legacy header: underline style (solid or gradient). */
  legacyAccentUnderlineStyle: PortfolioExperienceLegacyUnderlineStyle;
  /** Legacy header: subtitle typography style. */
  legacySubtitleStyle: PortfolioExperienceLegacySubtitleStyle;
  /** Legacy header: enable scroll parallax effect. */
  legacyScrollParallaxEnabled: boolean;
  itemGap: PortfolioExperienceItemGap;
  itemDensity: PortfolioExperienceItemDensity;
  /** Vertical gap between elements in the left / story column. */
  storyContentGap: PortfolioExperienceStoryContentGap;
  /** Manual px when storyContentGap is `custom`. */
  storyContentGapPx: number;
  /** Vertical gap between tasks / proof / skills / tools in the details column. */
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
  toolsLabel: string;
  showBlockLabels: boolean;
  /** Per-block visibility for Tasks / Proof / Tools headings (when showBlockLabels is on). */
  blockLabelVisibility: PortfolioExperienceBlockLabelVisibility;
  /** Visual chrome for ONGOING / FINISHED status badges. */
  statusBadgeStyle: PortfolioExperienceStatusBadgeStyle;
  /** Editorial: left-column period label style (plain text, timeline rail, badge, …). */
  periodDesign: PortfolioExperiencePeriodDesign;
  /** Editorial: accordion with + toggle, or all entries always expanded. */
  entryExpandMode: PortfolioExperienceEntryExpandMode;
  /** Editorial: stacked details vs right-hand Données & Actions column. */
  editorialDetailLayout: PortfolioExperienceEditorialDetailLayout;
  /** How responsibilities / tasks are displayed inside entries. */
  tasksDisplay: PortfolioExperienceTasksDisplay;
  /** Table design: alternate row background for easier scanning. */
  tableStripedRows: boolean;
  /** Cards design: shared row + column gap between cards. */
  cardsGridGap: PortfolioExperienceCardsGridGap;
  /** Manual px when cardsGridGap is `custom`. */
  cardsGridGapPx: number;
  /** Cards design: card frame width (full / medium / small), always centered. */
  cardsCardWidth: PortfolioExperienceCardsCardWidth;
  /** Cards design: spacing between elements inside each card. */
  cardsElementSpacing: PortfolioExperienceCardsElementSpacing;
  /** Cards design: vertical gap between stacked cards. */
  cardsVerticalGap: PortfolioExperienceCardsVerticalGap;
  /** Cards design: corner radius of the card frame. */
  cardsBorderRadius: PortfolioExperienceCardsBorderRadius;
  /** Visual chrome for proof / portfolio links. */
  proofLinkStyle: PortfolioExperienceProofLinkStyle;
  /** General: which harvested Experience link button presents proof / repository links. */
  repoLinkButtonStyle: PortfolioExperienceRepoLinkStyle;
  /** General: arrow glyph on proof / repository link buttons (↗ / › / →). */
  linkArrowStyle: PortfolioExperienceLinkArrowStyle;
  /** Title stack header: show the micro chronology kicker. */
  reelKickerEnabled: boolean;
  /** Title stack header: kicker text (e.g. "02 / Chronology"). */
  reelKickerText: string;
  /** Title stack header: enable GSAP entrance + recede. */
  reelHeaderAnimationEnabled: boolean;
  /** Reel design: how the Ongoing / Completed status is presented. */
  reelStatusStyle: PortfolioExperienceReelStatusStyle;
  /** Reel design: scroll choreography (index warp vs staggered fade & reveal). */
  reelScrollMotion: PortfolioExperienceReelScrollMotion;
  /** Duotone design: how you move between roles. */
  duotoneScrollMode: PortfolioExperienceDuotoneScrollMode;
  /** Duotone design, Slide mode: how the prev/next control is presented. */
  duotoneSlideNavStyle: PortfolioExperienceDuotoneSlideNavStyle;
  /** Duotone design, Scroll / Slide modes only: color of the frame around each full screen. */
  duotoneFrameColor: PortfolioExperienceDuotoneFrameColor;
  /** Duotone design, Scroll / Slide modes only: corner rounding of that same frame. */
  duotoneFrameRadius: PortfolioExperienceDuotoneFrameRadius;
  /** Duotone design, Slide mode only: auto-advance every 5s, paused while the frame is hovered. */
  duotoneAutoAdvance: boolean;
  /** Duotone design, Sticky mode only: filter applied to the left-column thumbnail. */
  duotoneThumbnailEffect: PortfolioExperienceDuotoneThumbnailEffect;
  /** Duotone design, Sticky mode only: height proportion of the left-column thumbnail. */
  duotoneThumbnailHeight: PortfolioExperienceDuotoneThumbnailHeight;
  /** Duotone Sticky / Scroll: footer repo button, or inertia Consult pill on the thumbnail. */
  duotoneRepoCtaMode: PortfolioExperienceDuotoneRepoCtaMode;
  /** Duotone Scroll mode only: role title spans full width above both columns. */
  duotoneScrollFullWidthTitle: boolean;
  /** Duotone design, Sticky / Scroll modes: swap columns — title/thumbnail on the right, info on the left. */
  duotoneStickySwapSides: boolean;
  /** Duotone design, Scroll mode: flip title/info sides on every other role. */
  duotoneAlternateSides: boolean;
  /** Duotone design, Sticky / Scroll modes: vertical spacing between title, media, and editorial blocks. */
  duotoneStickyVerticalGap: PortfolioExperienceDuotoneStickyVerticalGap;
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
/** Readable title ink on dark section surfaces (editorial + dark theme). */
export const DEFAULT_EXPERIENCE_TITLE_COLOR_DARK = '#F4F4F5';
export const DEFAULT_EXPERIENCE_SUBTITLE_COLOR = '#737373';
export const DEFAULT_EXPERIENCE_SUBTITLE_COLOR_DARK = '#A1A1AA';
export const DEFAULT_EXPERIENCE_ACCENT_COLOR = '#ea580c';
export const DEFAULT_EXPERIENCE_YEARS_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR = '#0a0a0a';
export const DEFAULT_EXPERIENCE_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_EXPERIENCE_CARD_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_EXPERIENCE_ENTRY_BACKGROUND_COLOR = '#f5f5f5';
export const DEFAULT_EXPERIENCE_CHIP_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_EXPERIENCE_CHIP_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_EXPERIENCE_BODY_COLOR = '#525252';
export const DEFAULT_EXPERIENCE_BODY_COLOR_DARK = '#D4D4D8';
export const DEFAULT_EXPERIENCE_MUTED_COLOR = '#a3a3a3';
export const DEFAULT_EXPERIENCE_MUTED_COLOR_DARK = '#A1A1AA';

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
    colorDark: overrides.colorDark ?? DEFAULT_EXPERIENCE_BODY_COLOR_DARK,
  };
}

export const DEFAULT_EXPERIENCE_ELEMENT_STYLES: PortfolioExperienceElementStyles = {
  title: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_TITLE_COLOR,
    colorDark: DEFAULT_EXPERIENCE_TITLE_COLOR_DARK,
    font: 'serif',
    size: 'xl',
    bold: true,
  }),
  organization: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_ACCENT_COLOR,
    colorDark: DEFAULT_EXPERIENCE_ACCENT_COLOR,
    size: 'md',
    bold: true,
  }),
  meta: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    colorDark: DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  description: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    colorDark: DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
    size: 'md',
  }),
  blockLabel: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_MUTED_COLOR,
    colorDark: DEFAULT_EXPERIENCE_MUTED_COLOR_DARK,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  tasks: createExperienceTextStyle({
    color: DEFAULT_EXPERIENCE_BODY_COLOR,
    colorDark: DEFAULT_EXPERIENCE_BODY_COLOR_DARK,
    size: 'md',
  }),
  proof: createExperienceTextStyle({
    color: '#404040',
    colorDark: DEFAULT_EXPERIENCE_BODY_COLOR_DARK,
    size: 'sm',
    bold: true,
  }),
  tools: createExperienceTextStyle({
    color: '#404040',
    colorDark: DEFAULT_EXPERIENCE_BODY_COLOR_DARK,
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
  'editorial',
  'milestone',
  'table',
  'cards',
  'reel',
  'duotone',
  'gallery',
  'spotlight',
  'loft',
  'press',
  'legacy',
  'asymmetric',
  'kinetic',
] as const satisfies readonly PortfolioExperienceDesign[];

export function coerceExperienceDesign(value: unknown): PortfolioExperienceDesign {
  if (typeof value === 'string' && (EXPERIENCE_DESIGNS as readonly string[]).includes(value)) {
    return value as PortfolioExperienceDesign;
  }
  // Legacy / unknown ids (timeline, stacked, compact, large, …) → editorial
  return 'editorial';
}

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
  headerDesign: 'none',
  accentYearsBadgeText: '',
  accentYearsLeadText: '',
  accentYearsFontSize: 6,
  accentYearsLineHeight: 1.05,
  accentYearsLetterSpacing: -0.02,
  accentYearsBadgePadX: 0.5,
  accentYearsBadgePadY: 0.1,
  accentYearsBadgeRadius: 4,
  accentYearsBadgeColor: 'accent',
  accentYearsGridAnchor: true,
  accentYearsBottomRem: 3.5,
  centeredTitleText: '',
  centeredLeadText: '',
  centeredAlign: 'center',
  centeredLeadWeight: 'light',
  centeredLeadOpacity: 'balanced',
  centeredScale: 'monumental',
  centeredMaxWidth: 'balanced',
  centeredLineHeight: 'aery',
  centeredDivider: 'none',
  centeredDividerOpacity: 'ghost',
  serifLeadLabelText: '',
  serifLeadTitleText: '',
  serifLeadAlign: 'left',
  serifLeadWeight: 'medium',
  serifLeadScale: 'default',
  serifLeadMaxWidth: 'narrow',
  serifLeadLineHeight: 'tight',
  serifLeadTracking: 'editorial',
  serifLeadItalic: false,
  serifLeadInk: 'current',
  serifLeadLabelOpacity: 'muted',
  serifLeadDivider: 'none',
  serifLeadDividerOpacity: 'ghost',
  serifLeadMotion: true,
  marqueeWeight: 'semibold',
  marqueeScale: 'default',
  marqueeTracking: 'editorial',
  marqueeInk: 'current',
  marqueeFillOpacity: 'muted',
  marqueeStyle: 'alternate',
  marqueeDirection: 'ltr',
  marqueeSpeed: 'cruise',
  marqueeEdgeFade: 'soft',
  marqueeSeparator: 'dot',
  marqueeSeparatorColor: 'accent',
  marqueeMotion: true,
  marqueeScrollLink: true,
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  experienceDesign: 'editorial',
  listMaxWidth: 'full',
  listPlacement: 'left',
  itemsPerRow: 1,
  galleryColumns: 3,
  galleryThumbnailFit: 'cover',
  galleryBigTitleEnabled: true,
  galleryBigTitleText: 'Experience',
  galleryBigTitleStyle: 'outline',
  galleryBigTitleColor: 'current',
  galleryHeaderAnimationEnabled: true,
  galleryHeaderAnimationStyle: 'dramatic',
  gallerySecondaryTitleStyle: 'editorial',
  gallerySecondaryTitleText: "Roles I've taken on",
  galleryRoleCountStyle: 'micro',
  galleryRoleCountText: '{count} {count === 1 ? "role" : "roles"} — click any card for the full story',
  galleryScrollParallaxEnabled: true,
  spotlightBigTitleEnabled: true,
  spotlightBigTitleText: 'Experience',
  spotlightBigTitleWord2: '',
  spotlightBigTitleWord3: '',
  spotlightBigTitleWord4: '',
  spotlightBigTitleColor: 'ink',
  spotlightThumbnailFit: 'cover',
  spotlightHeaderAnimationEnabled: true,
  spotlightMarqueeSpeed: 'medium',
  spotlightMarqueeDirection: 'left',
  spotlightMarqueePauseOnHover: true,
  spotlightMarqueeWeight: 'normal',
  spotlightMarqueeStyle: 'mixed',
  spotlightMarqueeGradientFade: true,
  spotlightMarqueeGap: 'md',
  spotlightScrollSpeedBoost: false,
  loftHeadingEnabled: true,
  loftHeadingText: "Roles I've taken on",
  loftHeaderAnimationEnabled: true,
  loftHeadingItalicWord: 'first',
  loftHeadingFontWeight: 'light-to-bold',
  loftLabelText: 'Experience',
  loftLabelStyle: 'uppercase',
  loftLabelPosition: 'top-aligned',
  loftScrollEffectEnabled: true,
  loftScrollEffectStyle: 'slide-right',
  loftThumbnailFit: 'cover',
  loftThumbnailRadius: 'md',
  loftHoverEffect: 'curtain',
  loftColumns: 3,
  loftGap: 'md',
  pressHeadingEnabled: true,
  pressHeadingText: 'Roles taken. Skills sharpened. Impact delivered.',
  pressIntroText: 'Selected roles, projects, and outcomes.',
  pressThumbnailRadius: 'md',
  pressHeaderAnimationEnabled: true,
  pressHeaderAnimationStyle: 'staggered',
  pressHeadingWeightStyle: 'alternating',
  pressSubtitleStyle: 'micro',
  pressHeadingAlignment: 'left',
  pressScrollParallaxEnabled: true,
  pressScrollParallaxIntensity: 'subtle',
  legacyHeadingEnabled: true,
  legacyHeadingText: 'A Career Built on',
  legacyHeadingAccentText: 'Craft',
  legacyIntroText: 'A selection of roles, teams, and problems solved along the way.',
  legacyThumbnailRadius: 'xl',
  legacyThumbnailHeight: 'lg',
  legacyThumbnailWidth: 'lg',
  legacyItemGap: 'md',
  legacyAlternateSides: true,
  legacyFixedSide: 'left',
  legacyShowTasks: false,
  legacyHeaderAnimationEnabled: true,
  legacyHeaderAnimationStyle: 'bloom',
  legacyPrefixWeight: 'light',
  legacyAccentStyle: 'italic-bold',
  legacyAccentSize: 'dramatic',
  legacyAccentUnderline: true,
  legacyAccentUnderlineStyle: 'solid',
  legacySubtitleStyle: 'micro',
  legacyScrollParallaxEnabled: true,
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
  toolsLabel: '',
  showBlockLabels: true,
  blockLabelVisibility: { ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY },
  statusBadgeStyle: 'pill',
  periodDesign: 'plain',
  entryExpandMode: 'accordion',
  editorialDetailLayout: 'split-actions',
  tasksDisplay: 'editorial-dash',
  tableStripedRows: false,
  cardsGridGap: 'md',
  cardsGridGapPx: 36,
  cardsCardWidth: 'medium',
  cardsElementSpacing: 'md',
  cardsVerticalGap: 'md',
  cardsBorderRadius: 'none',
  proofLinkStyle: 'pill',
  repoLinkButtonStyle: 'auto',
  linkArrowStyle: 'northeast',
  reelKickerEnabled: true,
  reelKickerText: '02 / Chronology',
  reelHeaderAnimationEnabled: true,
  reelStatusStyle: 'minimal',
  reelScrollMotion: 'fade-reveal',
  duotoneScrollMode: 'sticky',
  duotoneSlideNavStyle: 'chevron',
  duotoneFrameColor: 'none',
  duotoneFrameRadius: 'sm',
  duotoneAutoAdvance: false,
  duotoneThumbnailEffect: 'grayscale',
  duotoneThumbnailHeight: 'md',
  duotoneRepoCtaMode: 'footer',
  duotoneScrollFullWidthTitle: false,
  duotoneStickySwapSides: false,
  duotoneAlternateSides: false,
  duotoneStickyVerticalGap: 'md',
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
    value: 'asymmetric',
    label: 'Asymmetric Split',
    description:
      'Strict 50/50 split — a frozen full-height visual on the left, airy editorial copy scrolling on the right.',
  },
  {
    value: 'kinetic',
    label: 'Kinetic Typo',
    description:
      'Brutalist type layout — the role title owns the screen, metadata tucked into the leftover gaps. No image chrome.',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description:
      'Period left, story right — expand a role for responsibilities, tools, and proof. Serif title + soft Ongoing badge.',
  },
  {
    value: 'milestone',
    label: 'Milestone',
    description:
      'Framer Continuum–style timeline — oversized years, connected rail, card blocks with numbered tasks.',
  },
  {
    value: 'table',
    label: 'Table',
    description:
      'Ledger-style table — Period, Role, Organization, Status. Expand a row for details and stack.',
  },
  {
    value: 'cards',
    label: 'Cards',
    description:
      'Card grid — 2 per row on large screens. Title, meta, period, status, description, tasks, and stack.',
  },
  {
    value: 'reel',
    label: 'Reel',
    description:
      'One role per screen — full-height sections with a Fraunces headline, period, stack, and story.',
  },
  {
    value: 'duotone',
    label: 'Duotone',
    description:
      'One role per screen, split 50/50 — role details on the left, a framed story card on the right.',
  },
  {
    value: 'gallery',
    label: 'Gallery',
    description:
      'Airy thumbnail grid — Framer/Webflow-style cards with hover zoom. Click a card for the full story.',
  },
  {
    value: 'spotlight',
    label: 'Spotlight',
    description:
      'Editorial media showcase — alternating full-bleed image/story rows under a scrolling marquee title.',
  },
  {
    value: 'loft',
    label: 'Loft',
    description:
      'Calm, airy Webflow-style list — a plain static heading, thumbnail-left rows with generous space and hairline dividers.',
  },
  {
    value: 'press',
    label: 'Press',
    description:
      'Newsroom feed — a bold headline over a two-column layout, thumbnail rows with just a label, date, and title.',
  },
  {
    value: 'legacy',
    label: 'Legacy',
    description:
      'Premium showcase — a two-tone hero title, then alternating image/story feature blocks with a pill badge, icon accent, and CTA button.',
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
  { value: 'sm', label: 'Tight', description: 'Same small gap between cards, horizontally and vertically.' },
  { value: 'md', label: 'Standard', description: 'Balanced gap on both axes.' },
  { value: 'lg', label: 'Large', description: 'More air between cards on both axes.' },
  { value: 'xl', label: 'Extra large', description: 'Wide gap between cards on both axes.' },
];

export const PORTFOLIO_EXPERIENCE_CARDS_GRID_GAP_OPTIONS: {
  value: Exclude<PortfolioExperienceCardsGridGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Tight',
    description: 'Same small gap between cards, horizontally and vertically.',
  },
  {
    value: 'md',
    label: 'Standard',
    description: 'Balanced gap on both axes.',
  },
  {
    value: 'lg',
    label: 'Large',
    description: 'More air between cards on both axes.',
  },
  {
    value: 'xl',
    label: 'Extra large',
    description: 'Wide gap between cards on both axes.',
  },
];

export const EXPERIENCE_CARDS_GRID_GAP_PRESET_PX: Record<
  Exclude<PortfolioExperienceCardsGridGap, 'custom'>,
  number
> = {
  sm: 20,
  md: 36,
  lg: 48,
  xl: 72,
};

export const EXPERIENCE_CARDS_GRID_GAP_PX_MIN = 0;
export const EXPERIENCE_CARDS_GRID_GAP_PX_MAX = 96;

export function clampExperienceCardsGridGapPx(value: unknown, fallback = 36): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    EXPERIENCE_CARDS_GRID_GAP_PX_MIN,
    Math.min(EXPERIENCE_CARDS_GRID_GAP_PX_MAX, Math.round(n))
  );
}

export function isPortfolioExperienceCardsGridGap(
  value: unknown
): value is PortfolioExperienceCardsGridGap {
  return value === 'sm' || value === 'md' || value === 'lg' || value === 'xl' || value === 'custom';
}

export function resolveExperienceCardsGridGapPx(
  p: Pick<PortfolioExperiencePresentationSettings, 'cardsGridGap' | 'cardsGridGapPx' | 'itemGap'>
): number {
  const gap = p.cardsGridGap ?? (p.itemGap === 'sm' || p.itemGap === 'lg' || p.itemGap === 'xl' ? p.itemGap : 'md');
  if (gap === 'custom') {
    return clampExperienceCardsGridGapPx(p.cardsGridGapPx, 36);
  }
  return EXPERIENCE_CARDS_GRID_GAP_PRESET_PX[gap] ?? 36;
}

/** One CSS `gap` drives horizontal and vertical card spacing together. */
export function experienceCardsGridGapStyle(
  p: Pick<PortfolioExperiencePresentationSettings, 'cardsGridGap' | 'cardsGridGapPx' | 'itemGap'>
): CSSProperties {
  return { gap: `${resolveExperienceCardsGridGapPx(p)}px` };
}

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

export const PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS: {
  value: PortfolioExperiencePeriodDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'plain',
    label: 'Plain text',
    description: 'Simple year label on the left (current).',
  },
  {
    value: 'rail',
    label: 'Timeline rail',
    description: 'Vertical line with hollow nodes linking each entry.',
  },
  {
    value: 'badge',
    label: 'Accent badge',
    description: 'Small uppercase accent label for the period.',
  },
  {
    value: 'rule',
    label: 'Hairline rule',
    description: 'Period with a subtle horizontal rule beneath.',
  },
];

export const PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS: {
  value: PortfolioExperienceEntryExpandMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'accordion',
    label: 'Accordion',
    description: 'One entry open at a time — click + to expand or collapse.',
  },
  {
    value: 'all-open',
    label: 'All open',
    description: 'Every entry expanded — no accordion button.',
  },
];

export const PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS: {
  value: PortfolioExperienceTasksDisplay;
  label: string;
  description: string;
}[] = [
  {
    value: 'engineering-grid',
    label: 'Engineering Grid',
    description: 'Compact monochrome micro-blocks in a tight grid — technical and ordered.',
  },
  {
    value: 'cinematic-timeline',
    label: 'Cinematic Timeline',
    description: 'Wire vertical rail with monospaced indexes — narrative and fluid.',
  },
  {
    value: 'editorial-dash',
    label: 'Editorial Dash',
    description: 'Airy typography with long em-dashes that stretch and shift on hover.',
  },
  {
    value: 'accordion-stack',
    label: 'Lined Stack',
    description: 'Numbered full sentences with a hairline between each task — always visible.',
  },
  {
    value: 'architectural-index',
    label: 'Architectural Index',
    description: 'Structural 01 / indexes in monospace — studio index line, dark-ready.',
  },
];

export const PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS: {
  value: PortfolioExperienceCardsBorderRadius;
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'None',
    description: 'Sharp corners — no border radius on the card (default).',
  },
  {
    value: 'md',
    label: 'Medium',
    description: 'Soft rounded corners.',
  },
  {
    value: 'xl',
    label: 'Large',
    description: 'More rounded card frame.',
  },
];

export function experienceCardsBorderRadiusClass(
  radius: PortfolioExperienceCardsBorderRadius | undefined
): string {
  switch (radius) {
    case 'md':
      return 'rounded-2xl';
    case 'xl':
      return 'rounded-[1.35rem] sm:rounded-[1.5rem]';
    case 'none':
    default:
      return 'rounded-none';
  }
}

export const PORTFOLIO_EXPERIENCE_CARDS_CARD_WIDTH_OPTIONS: {
  value: PortfolioExperienceCardsCardWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'full',
    label: 'Plein écran',
    description: 'La carte occupe toute la largeur disponible.',
  },
  {
    value: 'medium',
    label: 'Moyen',
    description: 'Largeur confortable, centrée dans la section.',
  },
  {
    value: 'small',
    label: 'Petit',
    description: 'Carte plus étroite, toujours centrée.',
  },
];

export const PORTFOLIO_EXPERIENCE_CARDS_ELEMENT_SPACING_OPTIONS: {
  value: PortfolioExperienceCardsElementSpacing;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Serré',
    description: 'Peu d’air entre titre, texte, tâches et outils.',
  },
  {
    value: 'md',
    label: 'Standard',
    description: 'Rythme équilibré à l’intérieur de la carte.',
  },
  {
    value: 'lg',
    label: 'Large',
    description: 'Plus d’espace entre chaque bloc de la carte.',
  },
];

export const PORTFOLIO_EXPERIENCE_CARDS_VERTICAL_GAP_OPTIONS: {
  value: PortfolioExperienceCardsVerticalGap;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Serré',
    description: 'Peu d’espace vertical entre les cartes.',
  },
  {
    value: 'md',
    label: 'Standard',
    description: 'Écart vertical équilibré entre chaque cadre.',
  },
  {
    value: 'lg',
    label: 'Large',
    description: 'Plus d’air vertical entre les cartes.',
  },
];

export function resolveExperienceCardsVerticalGapPx(
  gap: PortfolioExperienceCardsVerticalGap | undefined
): number {
  switch (gap) {
    case 'sm':
      return 12;
    case 'lg':
      return 72;
    case 'md':
    default:
      return 40;
  }
}

/** Stack shell width — always centered while the card width changes. */
export function experienceCardsCardWidthClass(
  width: PortfolioExperienceCardsCardWidth | undefined
): string {
  switch (width) {
    case 'full':
      return 'w-full max-w-none mx-auto';
    case 'small':
      return 'w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto';
    case 'medium':
    default:
      return 'w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto';
  }
}

/** Padding + section gaps inside a Cards experience card. */
export function experienceCardsElementSpacingClasses(
  spacing: PortfolioExperienceCardsElementSpacing | undefined
): {
  cardPad: string;
  sectionGap: string;
  toolsGap: string;
  linksGap: string;
  tasksSpace: string;
} {
  switch (spacing) {
    case 'sm':
      return {
        cardPad: 'px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5',
        sectionGap: 'mt-5 sm:mt-6',
        toolsGap: 'mt-auto pt-5 sm:pt-6',
        linksGap: 'mt-5 sm:mt-6',
        tasksSpace: '[&_ul]:space-y-2.5 sm:[&_ul]:space-y-3',
      };
    case 'lg':
      return {
        cardPad: 'px-6 py-7 sm:px-8 sm:py-8 lg:px-9 lg:py-9',
        sectionGap: 'mt-10 sm:mt-12',
        toolsGap: 'mt-auto pt-10 sm:pt-12',
        linksGap: 'mt-9 sm:mt-10',
        tasksSpace: '[&_ul]:space-y-5 sm:[&_ul]:space-y-6',
      };
    case 'md':
    default:
      return {
        cardPad: 'px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7',
        sectionGap: 'mt-8 sm:mt-9',
        toolsGap: 'mt-auto pt-8 sm:pt-9',
        linksGap: 'mt-7 sm:mt-8',
        tasksSpace: '[&_ul]:space-y-4 sm:[&_ul]:space-y-5',
      };
  }
}

export const PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_HEIGHT_OPTIONS: {
  value: PortfolioExperienceLegacyThumbnailHeight;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Compact',
    description: 'Shorter image, closer to landscape.',
  },
  {
    value: 'md',
    label: 'Balanced',
    description: 'Square-ish proportions.',
  },
  {
    value: 'lg',
    label: 'Tall',
    description: 'Tallest image (default).',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_THUMBNAIL_WIDTH_OPTIONS: {
  value: PortfolioExperienceLegacyThumbnailWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Narrow',
    description: 'Fills about 70% of the column.',
  },
  {
    value: 'md',
    label: 'Medium',
    description: 'Fills about 85% of the column.',
  },
  {
    value: 'lg',
    label: 'Full',
    description: 'Fills the whole column (default).',
  },
];

/** CSS aspect-ratio value — kept as an inline style, not a Tailwind class, since
 * arbitrary-value classes silently fail to compile in this very large file. */
export function experienceLegacyThumbnailAspectRatio(
  height: PortfolioExperienceLegacyThumbnailHeight | undefined
): string {
  switch (height) {
    case 'sm':
      return '4 / 3';
    case 'md':
      return '1 / 1';
    case 'lg':
    default:
      return '8 / 9';
  }
}

/** CSS max-width value — kept as an inline style for the same reason. */
export function experienceLegacyThumbnailMaxWidth(
  width: PortfolioExperienceLegacyThumbnailWidth | undefined
): string {
  switch (width) {
    case 'sm':
      return '70%';
    case 'md':
      return '85%';
    case 'lg':
    default:
      return '100%';
  }
}

export const PORTFOLIO_EXPERIENCE_LEGACY_ITEM_GAP_OPTIONS: {
  value: PortfolioExperienceLegacyItemGap;
  label: string;
  description: string;
}[] = [
  {
    value: 'sm',
    label: 'Compact',
    description: 'Tighter spacing between entries.',
  },
  {
    value: 'md',
    label: 'Balanced',
    description: 'Current spacing between entries (default).',
  },
  {
    value: 'lg',
    label: 'Spacious',
    description: 'Twice the current spacing between entries.',
  },
  {
    value: 'xl',
    label: 'Extra spacious',
    description: 'The most room between entries.',
  },
];

/** Bottom-padding class on each non-last feature block — plain Tailwind presets, not
 * arbitrary values (see the note on experienceLegacyThumbnailAspectRatio above). */
export function experienceLegacyItemGapClass(gap: PortfolioExperienceLegacyItemGap | undefined): string {
  switch (gap) {
    case 'sm':
      return 'pb-7 sm:pb-10';
    case 'lg':
      return 'pb-28 sm:pb-40';
    case 'xl':
      return 'pb-48 sm:pb-72';
    case 'md':
    default:
      return 'pb-14 sm:pb-20';
  }
}

export const PORTFOLIO_EXPERIENCE_LEGACY_FIXED_SIDE_OPTIONS: {
  value: PortfolioExperienceLegacySide;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Left',
    description: 'The image always stays on the left.',
  },
  {
    value: 'right',
    label: 'Right',
    description: 'The image always stays on the right.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_ANIMATION_STYLE_OPTIONS: {
  value: PortfolioExperienceLegacyAnimationStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'bloom',
    label: 'Bloom',
    description: 'Accent word scales up with color bloom effect.',
  },
  {
    value: 'slide',
    label: 'Slide',
    description: 'Accent word slides in from below.',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No animation on the accent word.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_PREFIX_WEIGHT_OPTIONS: {
  value: PortfolioExperienceLegacyPrefixWeight;
  label: string;
  description: string;
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Light weight prefix for maximum typographic contrast.',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Regular weight prefix.',
  },
  {
    value: 'bold',
    label: 'Bold',
    description: 'Bold prefix for stronger presence.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_STYLE_OPTIONS: {
  value: PortfolioExperienceLegacyAccentStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'italic-bold',
    label: 'Italic Bold',
    description: 'Italic and bold for maximum emphasis.',
  },
  {
    value: 'bold',
    label: 'Bold',
    description: 'Bold only, no italic.',
  },
  {
    value: 'italic',
    label: 'Italic',
    description: 'Italic only, no bold.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_ACCENT_SIZE_OPTIONS: {
  value: PortfolioExperienceLegacyAccentSize;
  label: string;
  description: string;
}[] = [
  {
    value: 'dramatic',
    label: 'Dramatic',
    description: 'Large size difference — accent is much bigger.',
  },
  {
    value: 'subtle',
    label: 'Subtle',
    description: 'Moderate size difference.',
  },
  {
    value: 'same',
    label: 'Same',
    description: 'Same size as prefix text.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_UNDERLINE_STYLE_OPTIONS: {
  value: PortfolioExperienceLegacyUnderlineStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'solid',
    label: 'Solid',
    description: 'Simple solid line in accent color.',
  },
  {
    value: 'gradient',
    label: 'Gradient',
    description: 'Faded gradient line from accent color.',
  },
];

export const PORTFOLIO_EXPERIENCE_LEGACY_SUBTITLE_STYLE_OPTIONS: {
  value: PortfolioExperienceLegacySubtitleStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'micro',
    label: 'Micro',
    description: 'Uppercase, letter-spaced, small text.',
  },
  {
    value: 'serif',
    label: 'Serif',
    description: 'Elegant serif typography.',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Standard body text style.',
  },
];

export const PORTFOLIO_EXPERIENCE_PRESS_ANIMATION_STYLE_OPTIONS: {
  value: PortfolioExperiencePressAnimationStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'staggered',
    label: 'Staggered',
    description: 'Words reveal one after another.',
  },
  {
    value: 'simultaneous',
    label: 'Simultaneous',
    description: 'The whole headline appears at once.',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No entrance animation.',
  },
];

export const PORTFOLIO_EXPERIENCE_PRESS_HEADING_WEIGHT_STYLE_OPTIONS: {
  value: PortfolioExperiencePressHeadingWeightStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'alternating',
    label: 'Alternating',
    description: 'First word light, rest black — editorial contrast.',
  },
  {
    value: 'uniform',
    label: 'Uniform',
    description: 'Every word the same bold weight.',
  },
];

export const PORTFOLIO_EXPERIENCE_PRESS_SUBTITLE_STYLE_OPTIONS: {
  value: PortfolioExperiencePressSubtitleStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'micro',
    label: 'Micro',
    description: 'Uppercase, letter-spaced, small.',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Regular sentence-case body text.',
  },
  {
    value: 'hidden',
    label: 'Hidden',
    description: 'Hide the intro line.',
  },
];

export const PORTFOLIO_EXPERIENCE_PRESS_HEADING_ALIGNMENT_OPTIONS: {
  value: PortfolioExperiencePressHeadingAlignment;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Left',
    description: 'Flush left — the default editorial alignment.',
  },
  {
    value: 'center',
    label: 'Center',
    description: 'Centered masthead.',
  },
];

export const PORTFOLIO_EXPERIENCE_PRESS_PARALLAX_INTENSITY_OPTIONS: {
  value: PortfolioExperiencePressParallaxIntensity;
  label: string;
  description: string;
}[] = [
  {
    value: 'subtle',
    label: 'Subtle',
    description: 'Gentle line-by-line drift.',
  },
  {
    value: 'dramatic',
    label: 'Dramatic',
    description: 'Stronger cascade as you scroll.',
  },
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

/** Same presets as story — gap between details blocks (tasks, skills, tools…). */
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
 * Rescue entry ink that still carries light-theme hex on a dark surface
 * (common when Global title chrome is light but section `titleColor` stayed near-black).
 */
export function ensureExperienceInkContrast(
  candidate: string | null | undefined,
  isDark: boolean,
  lightFallback: string,
  darkFallback: string
): string {
  const fallback = isDark ? darkFallback : lightFallback;
  const raw = typeof candidate === 'string' ? candidate.trim() : '';
  if (!raw) return fallback;
  // rgba()/hsl() — trust the author; only rescue solid hex that fights the surface.
  if (!raw.startsWith('#')) return raw;
  const lum = experiencePeriodRuleLuminance(raw);
  if (isDark && lum < 0.38) return darkFallback;
  if (!isDark && lum > 0.72) return lightFallback;
  return raw;
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
  { value: 'blockLabel', label: 'Block labels', description: 'TASKS, PROOF, TOOLS headings.' },
  { value: 'tasks', label: 'Tasks', description: 'Bullet list items.' },
  { value: 'proof', label: 'Proof links', description: 'Proof pill labels.' },
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

/** Pick light or dark text color for experience element styles. */
export function resolveExperienceTextColor(
  style: PortfolioExperienceTextStyle,
  mode: 'light' | 'dark' = 'light'
): string {
  if (mode === 'dark') {
    const dark = (style.colorDark || '').trim();
    // Prefer an explicit dark ink; if missing or identical to a near-black light color, use dark fallback.
    if (dark && experiencePeriodRuleLuminance(dark) >= 0.38) {
      return sanitizeHex(dark, DEFAULT_EXPERIENCE_BODY_COLOR_DARK);
    }
    const light = sanitizeHex(style.color, DEFAULT_EXPERIENCE_BODY_COLOR);
    if (experiencePeriodRuleLuminance(light) >= 0.38) return light;
    return DEFAULT_EXPERIENCE_BODY_COLOR_DARK;
  }
  return sanitizeHex(style.color, DEFAULT_EXPERIENCE_BODY_COLOR);
}

/**
 * Prefer the live Global theme. Hero-painted `color` is still read in light mode;
 * dark mode always consults `colorDark` / contrast rescue so near-black titles never sit on black.
 */
export function resolveExperienceColorMode(
  p: Pick<PortfolioExperiencePresentationSettings, 'useHeroPalette' | 'activeColorMode'>
): 'light' | 'dark' {
  return p.activeColorMode !== 'light' ? 'dark' : 'light';
}

export function experienceTextInlineStyle(
  style: PortfolioExperienceTextStyle,
  mode: 'light' | 'dark' = 'light'
): CSSProperties {
  return {
    color: resolveExperienceTextColor(style, mode),
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

/** Cards design uses a multi-column grid on large screens. */
export function experienceDesignSupportsItemsPerRow(design: PortfolioExperienceDesign): boolean {
  return design === 'cards';
}

/** Editorial entries are bare period/story rows, not card shells. */
export function experienceDesignUsesEntryCard(_design: PortfolioExperienceDesign): boolean {
  return false;
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

export function resolveSerifLeadInkColor(
  presentation: Pick<PortfolioExperiencePresentationSettings, 'serifLeadInk' | 'accentColor'>,
  ink: string
): string {
  switch (presentation.serifLeadInk) {
    case 'accent':
      return experienceAccentColor(presentation.accentColor);
    case 'principal':
      return 'var(--pf-palette-principal)';
    case 'secondaire':
      return 'var(--pf-palette-secondaire)';
    default:
      return ink;
  }
}

/** Editorial hides the sticky section title and uses the years line as the lead. */
export function experienceDesignUsesFlatHeader(design: PortfolioExperienceDesign): boolean {
  return design === 'editorial';
}

/** Whether a Header-subsection design is selected (applies on every Experience layout). */
export function experienceHeaderDesignIsApplied(
  headerDesign: PortfolioExperienceHeaderDesign | undefined,
  _experienceDesign?: PortfolioExperienceDesign
): boolean {
  return Boolean(
    headerDesign &&
      headerDesign !== 'none' &&
      headerDesign !== 'cards' &&
      headerDesign !== 'duotone'
  );
}

/** Table design owns its own header (small section label + years intro). */
export function experienceDesignUsesTableHeader(design: PortfolioExperienceDesign): boolean {
  return design === 'table';
}

/** Cards design owns its own header (small title left + large years right). */
export function experienceDesignUsesCardsHeader(design: PortfolioExperienceDesign): boolean {
  return design === 'cards';
}

/** Editorial uses a period gutter, not a timeline rail. */
export function isExperienceTimelineDesign(design: PortfolioExperienceDesign): boolean {
  return design === 'milestone';
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

/** Two-line split for Serif lead — avoids a one-word widow on the last line. */
export function splitSerifLeadLines(lead: string): string[] {
  const text = lead.replace(/\s+/g, ' ').trim();
  if (!text) return [];

  const defaultSplit = text.match(/^(.*?experience)\s+(in my field\.?)$/i);
  if (defaultSplit?.[1] && defaultSplit[2]) {
    return [defaultSplit[1], defaultSplit[2]];
  }

  const words = text.split(' ');
  if (words.length <= 4) return [text];

  let splitAt = Math.max(2, Math.round(words.length * 0.62));
  if (words.length - splitAt < 2) splitAt = Math.max(2, words.length - 2);
  if (splitAt >= words.length) return [text];
  return [words.slice(0, splitAt).join(' '), words.slice(splitAt).join(' ')];
}

export function resolveSerifLeadCopy(
  years: number | null | undefined,
  sectionTitle: string,
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'serifLeadLabelText' | 'serifLeadTitleText' | 'yearsPreset' | 'yearsCustom' | 'showYears'
  >
): { label: string; title: string } {
  const yearsValue = years != null && years > 0 ? String(years) : '';
  const interpolate = (text: string) => text.replaceAll('{years}', yearsValue);
  const customLabel = presentation.serifLeadLabelText?.trim() ?? '';
  const label = interpolate(customLabel || sectionTitle.trim() || DEFAULT_SERIF_LEAD_LABEL_TEXT);
  const customTitle = presentation.serifLeadTitleText?.trim() ?? '';
  if (customTitle) return { label, title: interpolate(customTitle) };
  const showYears = presentation.showYears !== false && Boolean(yearsValue);
  if (!showYears) return { label, title: '' };
  return { label, title: interpolate(resolveExperienceYearsTemplate(presentation)) };
}

export function clampAccentYearsFontSize(
  value: unknown,
  fallback: PortfolioExperienceAccentYearsFontSize = 6
): PortfolioExperienceAccentYearsFontSize {
  const n = typeof value === 'number' ? value : Number(value);
  if (n === 4 || n === 5 || n === 6 || n === 7) return n;
  return fallback;
}

export function clampAccentYearsLineHeight(value: unknown, fallback = 1.05): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1.2, Math.max(1, Math.round(n * 100) / 100));
}

export function clampAccentYearsLetterSpacing(value: unknown, fallback = -0.02): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(0.02, Math.max(-0.06, Math.round(n * 1000) / 1000));
}

export function clampAccentYearsBadgePadX(value: unknown, fallback = 0.5): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(0.9, Math.max(0.16, Math.round(n * 100) / 100));
}

export function clampAccentYearsBadgePadY(value: unknown, fallback = 0.1): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(0.28, Math.max(0.02, Math.round(n * 100) / 100));
}

export function clampAccentYearsBadgeRadius(
  value: unknown,
  fallback: PortfolioExperienceAccentYearsRadius = 4
): PortfolioExperienceAccentYearsRadius {
  const n = typeof value === 'number' ? value : Number(value);
  if (n === 0 || n === 2 || n === 4) return n;
  return fallback;
}

export function clampAccentYearsBottomRem(value: unknown, fallback = 3.5): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(6.5, Math.max(1.25, Math.round(n * 4) / 4));
}

function interpolateAccentYearsToken(text: string, years: number): string {
  return text.replaceAll('{years}', years > 0 ? String(years) : '');
}

export function resolveAccentYearsCopy(
  years: number,
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'yearsPreset' | 'yearsCustom' | 'accentYearsBadgeText' | 'accentYearsLeadText'
  >
): { badge: string; lead: string } {
  const customBadge = presentation.accentYearsBadgeText?.trim() ?? '';
  const customLead = presentation.accentYearsLeadText?.trim() ?? '';
  const template = resolveExperienceYearsTemplate(presentation);
  const marker = '{years}';
  const markerIndex = template.indexOf(marker);
  let fallbackBadge = '';
  let fallbackLead = interpolateAccentYearsToken(template, years);
  if (markerIndex !== -1) {
    const after = template.slice(markerIndex + marker.length);
    const yearsPhraseMatch = after.match(/^(\+?\s*years?\b)/i);
    const highlightTail = yearsPhraseMatch?.[1] ?? '';
    fallbackBadge = interpolateAccentYearsToken(`${marker}${highlightTail}`, years);
    fallbackLead = interpolateAccentYearsToken(after.slice(highlightTail.length), years).replace(
      /^\s+/,
      ''
    );
  }
  return {
    badge: customBadge ? interpolateAccentYearsToken(customBadge, years) : fallbackBadge,
    lead: customLead ? interpolateAccentYearsToken(customLead, years) : fallbackLead,
  };
}

export function resolveAccentYearsBadgeColor(
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'accentColor' | 'accentYearsBadgeColor'
  >
): string {
  switch (presentation.accentYearsBadgeColor) {
    case 'principal':
      return 'var(--pf-palette-principal)';
    case 'secondaire':
      return 'var(--pf-palette-secondaire)';
    default:
      return experienceAccentColor(presentation.accentColor);
  }
}

export function accentYearsCssVars(
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'accentYearsFontSize' | 'accentYearsBadgeRadius'
  >
): CSSProperties {
  const size = clampAccentYearsFontSize(presentation.accentYearsFontSize);
  const radius = clampAccentYearsBadgeRadius(presentation.accentYearsBadgeRadius);
  return {
    ['--pf-exp-accent-size' as string]: ACCENT_YEARS_FONT_SIZE_CSS[size],
    ['--pf-exp-accent-badge-radius' as string]: ACCENT_YEARS_RADIUS_CSS[radius],
  } as CSSProperties;
}

export function accentYearsGridAnchorEnabled(
  presentation: Pick<PortfolioExperiencePresentationSettings, 'headerDesign'>
): boolean {
  return presentation.headerDesign === 'editorial';
}

export function accentYearsHasCustomCopy(
  presentation: Pick<PortfolioExperiencePresentationSettings, 'accentYearsBadgeText' | 'accentYearsLeadText'>
): boolean {
  return Boolean(
    presentation.accentYearsBadgeText?.trim() || presentation.accentYearsLeadText?.trim()
  );
}

export function resolveCenteredHeaderCopy(
  years: number | null | undefined,
  sectionTitle: string,
  presentation: Pick<
    PortfolioExperiencePresentationSettings,
    'centeredTitleText' | 'centeredLeadText' | 'yearsPreset' | 'yearsCustom' | 'showYears'
  >
): { title: string; lead: string } {
  const yearsValue = years != null && years > 0 ? String(years) : '';
  const interpolate = (text: string) => text.replaceAll('{years}', yearsValue);
  const customTitle = presentation.centeredTitleText?.trim() ?? '';
  const title = portfolioSectionTitleSentenceCase(
    interpolate(customTitle || sectionTitle.trim() || DEFAULT_CENTERED_TITLE_TEXT)
  );
  const customLead = presentation.centeredLeadText?.trim() ?? '';
  if (customLead) {
    return { title, lead: interpolate(customLead) };
  }
  const showYears = presentation.showYears !== false && Boolean(yearsValue);
  if (!showYears) return { title, lead: '' };
  return { title, lead: interpolate(resolveExperienceYearsTemplate(presentation)) };
}

export function experienceYearsClass(
  settings: Pick<
    PortfolioExperiencePresentationSettings,
    'yearsFont' | 'yearsSize' | 'yearsItalic' | 'yearsAlignment' | 'experienceDesign'
  >
): string {
  const isEditorial = settings.experienceDesign === 'editorial';
  const parts = [
    isEditorial
      ? 'pf-exp-accent-years relative mb-0 max-w-3xl bg-transparent font-bold'
      : 'relative mb-8 max-w-2xl border-0 bg-transparent p-0 leading-relaxed shadow-none',
  ];

  if (isEditorial) {
    switch (settings.yearsFont) {
      case 'serif':
        parts.push('font-serif');
        break;
      case 'display':
        parts.push('uppercase tracking-[0.06em]');
        break;
      default:
        break;
    }
  } else {
    parts.push(experienceHeaderFontClass(settings.yearsFont, 'title'));
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

  return parts.filter(Boolean).join(' ');
}

export function experienceYearsStyle(
  settings: Pick<PortfolioExperiencePresentationSettings, 'yearsColor' | 'yearsFont' | 'activeColorMode'>
): CSSProperties {
  const isDark = settings.activeColorMode !== 'light';
  return {
    color: ensureExperienceInkContrast(
      settings.yearsColor,
      isDark,
      DEFAULT_EXPERIENCE_YEARS_COLOR,
      DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
    ),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceYearsHighlightStyle(
  settings: Pick<
    PortfolioExperiencePresentationSettings,
    'yearsHighlightColor' | 'yearsFont' | 'activeColorMode'
  >
): CSSProperties {
  const isDark = settings.activeColorMode !== 'light';
  return {
    color: ensureExperienceInkContrast(
      settings.yearsHighlightColor,
      isDark,
      DEFAULT_EXPERIENCE_YEARS_HIGHLIGHT_COLOR,
      DEFAULT_EXPERIENCE_TITLE_COLOR_DARK
    ),
    ...experienceHeaderFontStyle(settings.yearsFont),
  };
}

export function experienceBlockClass(_design: PortfolioExperienceDesign): string {
  return '';
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
  if (
    p.experienceDesign === 'editorial' ||
    p.experienceDesign === 'milestone' ||
    p.experienceDesign === 'table' ||
    p.experienceDesign === 'cards' ||
    p.experienceDesign === 'reel' ||
    p.experienceDesign === 'duotone' ||
    p.experienceDesign === 'gallery' ||
    p.experienceDesign === 'asymmetric' ||
    p.experienceDesign === 'kinetic'
  )
    return false;
  if (p.entryFrame.enabled) return true;
  return experienceDesignUsesEntryCard(p.experienceDesign);
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
  _p: Pick<PortfolioExperiencePresentationSettings, 'asidePlacement' | 'experienceDesign'>,
  _inMultiColumn: boolean
): 'stack' | 'split' | 'bento' | 'compact' | 'magazine' | 'stepped' {
  // Editorial renders its own period/story layout — stack is the safe default
  // for any leftover shared body helpers.
  return 'stack';
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

  const experienceDesign = coerceExperienceDesign(
    typeof record.experienceDesign === 'string' ? record.experienceDesign : base.experienceDesign
  );

  // Editorial / Milestone / Table / Cards / Reel / Duotone / Gallery manage their own chrome —
  // strip legacy frames.
  const editorialFramesOff =
    experienceDesign === 'editorial' ||
    experienceDesign === 'milestone' ||
    experienceDesign === 'table' ||
    experienceDesign === 'cards' ||
    experienceDesign === 'reel' ||
    experienceDesign === 'duotone' ||
    experienceDesign === 'gallery' ||
    experienceDesign === 'asymmetric' ||
    experienceDesign === 'kinetic';
  const resolvedEntryFrame = editorialFramesOff ? { ...entryFrame, enabled: false } : entryFrame;
  const resolvedStoryFrame = editorialFramesOff ? { ...storyFrame, enabled: false } : storyFrame;
  const resolvedDetailsFrame = editorialFramesOff ? { ...detailsFrame, enabled: false } : detailsFrame;
  const resolvedDetailsSecondaryFrame = editorialFramesOff
    ? { ...detailsSecondaryFrame, enabled: false }
    : detailsSecondaryFrame;

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
    headerDesign: pick(
      record.headerDesign,
      [
        'none',
        'editorial',
        'milestone',
        'table',
        'reel',
        'gallery',
        'spotlight',
        'loft',
        'press',
        'legacy',
      ],
      base.headerDesign === 'cards' || base.headerDesign === 'duotone'
        ? 'none'
        : (base.headerDesign ?? 'none')
    ),
    accentYearsBadgeText:
      typeof record.accentYearsBadgeText === 'string' ? record.accentYearsBadgeText : base.accentYearsBadgeText,
    accentYearsLeadText:
      typeof record.accentYearsLeadText === 'string' ? record.accentYearsLeadText : base.accentYearsLeadText,
    accentYearsFontSize: clampAccentYearsFontSize(record.accentYearsFontSize, base.accentYearsFontSize),
    accentYearsLineHeight: clampAccentYearsLineHeight(
      record.accentYearsLineHeight,
      base.accentYearsLineHeight
    ),
    accentYearsLetterSpacing: clampAccentYearsLetterSpacing(
      record.accentYearsLetterSpacing,
      base.accentYearsLetterSpacing
    ),
    accentYearsBadgePadX: clampAccentYearsBadgePadX(record.accentYearsBadgePadX, base.accentYearsBadgePadX),
    accentYearsBadgePadY: clampAccentYearsBadgePadY(record.accentYearsBadgePadY, base.accentYearsBadgePadY),
    accentYearsBadgeRadius: clampAccentYearsBadgeRadius(
      record.accentYearsBadgeRadius,
      base.accentYearsBadgeRadius
    ),
    accentYearsBadgeColor: pick(
      record.accentYearsBadgeColor,
      ['accent', 'principal', 'secondaire'],
      base.accentYearsBadgeColor
    ),
    accentYearsGridAnchor:
      typeof record.accentYearsGridAnchor === 'boolean'
        ? record.accentYearsGridAnchor
        : base.accentYearsGridAnchor,
    accentYearsBottomRem: clampAccentYearsBottomRem(
      record.accentYearsBottomRem,
      base.accentYearsBottomRem
    ),
    centeredTitleText:
      typeof record.centeredTitleText === 'string' ? record.centeredTitleText : base.centeredTitleText,
    centeredLeadText:
      typeof record.centeredLeadText === 'string' ? record.centeredLeadText : base.centeredLeadText,
    centeredAlign: pick(
      record.centeredAlign,
      ['left', 'center', 'right'],
      base.centeredAlign ?? 'center'
    ),
    centeredLeadWeight: pick(
      record.centeredLeadWeight,
      ['light', 'regular', 'medium'],
      base.centeredLeadWeight ?? 'light'
    ),
    centeredLeadOpacity: pick(
      record.centeredLeadOpacity,
      ['muted', 'balanced', 'vibrant'],
      base.centeredLeadOpacity ?? 'balanced'
    ),
    centeredScale: pick(
      record.centeredScale,
      ['compact', 'default', 'monumental'],
      base.centeredScale ?? 'monumental'
    ),
    centeredMaxWidth: pick(
      record.centeredMaxWidth,
      ['narrow', 'balanced', 'wide'],
      base.centeredMaxWidth ?? 'balanced'
    ),
    centeredLineHeight: pick(
      record.centeredLineHeight,
      ['tight', 'aery', 'spaced'],
      base.centeredLineHeight ?? 'aery'
    ),
    centeredDivider: pick(
      record.centeredDivider,
      ['none', 'dot', 'full', 'track'],
      base.centeredDivider ?? 'none'
    ),
    centeredDividerOpacity: pick(
      record.centeredDividerOpacity,
      ['ghost', 'subtle', 'accent'],
      base.centeredDividerOpacity ?? 'ghost'
    ),
    serifLeadLabelText:
      typeof record.serifLeadLabelText === 'string' ? record.serifLeadLabelText : base.serifLeadLabelText,
    serifLeadTitleText:
      typeof record.serifLeadTitleText === 'string' ? record.serifLeadTitleText : base.serifLeadTitleText,
    serifLeadAlign: pick(
      record.serifLeadAlign,
      ['left', 'center', 'right'],
      base.serifLeadAlign ?? 'left'
    ),
    serifLeadWeight: pick(
      record.serifLeadWeight,
      ['light', 'regular', 'medium'],
      base.serifLeadWeight ?? 'medium'
    ),
    serifLeadScale: pick(
      record.serifLeadScale,
      ['compact', 'default', 'monumental'],
      base.serifLeadScale ?? 'default'
    ),
    serifLeadMaxWidth: pick(
      record.serifLeadMaxWidth,
      ['narrow', 'balanced', 'wide'],
      base.serifLeadMaxWidth ?? 'narrow'
    ),
    serifLeadLineHeight: pick(
      record.serifLeadLineHeight,
      ['tight', 'aery', 'spaced'],
      base.serifLeadLineHeight ?? 'tight'
    ),
    serifLeadTracking: pick(
      record.serifLeadTracking,
      ['tight', 'editorial', 'open'],
      base.serifLeadTracking ?? 'editorial'
    ),
    serifLeadItalic: typeof record.serifLeadItalic === 'boolean' ? record.serifLeadItalic : base.serifLeadItalic,
    serifLeadInk: pick(
      record.serifLeadInk,
      ['current', 'accent', 'principal', 'secondaire'],
      base.serifLeadInk ?? 'current'
    ),
    serifLeadLabelOpacity: pick(
      record.serifLeadLabelOpacity,
      ['ghost', 'muted', 'ink'],
      base.serifLeadLabelOpacity ?? 'muted'
    ),
    serifLeadDivider: pick(
      record.serifLeadDivider,
      ['none', 'dot', 'full', 'track'],
      base.serifLeadDivider ?? 'none'
    ),
    serifLeadDividerOpacity: pick(
      record.serifLeadDividerOpacity,
      ['ghost', 'subtle', 'accent'],
      base.serifLeadDividerOpacity ?? 'ghost'
    ),
    serifLeadMotion:
      typeof record.serifLeadMotion === 'boolean' ? record.serifLeadMotion : (base.serifLeadMotion ?? true),
    marqueeWeight: pick(
      record.marqueeWeight,
      ['light', 'regular', 'medium', 'semibold'],
      base.marqueeWeight ?? 'semibold'
    ),
    marqueeScale: pick(
      record.marqueeScale,
      ['compact', 'default', 'monumental'],
      base.marqueeScale ?? 'default'
    ),
    marqueeTracking: pick(
      record.marqueeTracking,
      ['tight', 'editorial', 'open'],
      base.marqueeTracking ?? 'editorial'
    ),
    marqueeInk: pick(
      record.marqueeInk,
      ['current', 'accent', 'principal', 'secondaire'],
      base.marqueeInk ?? 'current'
    ),
    marqueeFillOpacity: pick(
      record.marqueeFillOpacity,
      ['ghost', 'muted', 'ink'],
      base.marqueeFillOpacity ?? 'muted'
    ),
    marqueeStyle: pick(
      record.marqueeStyle,
      ['alternate', 'fill', 'outline'],
      base.marqueeStyle ?? 'alternate'
    ),
    marqueeDirection: pick(
      record.marqueeDirection,
      ['ltr', 'rtl'],
      base.marqueeDirection ?? 'ltr'
    ),
    marqueeSpeed: pick(
      record.marqueeSpeed,
      ['slow', 'cruise', 'fast'],
      base.marqueeSpeed ?? 'cruise'
    ),
    marqueeEdgeFade: pick(
      record.marqueeEdgeFade,
      ['none', 'soft', 'wide'],
      base.marqueeEdgeFade ?? 'soft'
    ),
    marqueeSeparator: pick(
      record.marqueeSeparator,
      ['none', 'dot'],
      base.marqueeSeparator ?? 'dot'
    ),
    marqueeSeparatorColor: pick(
      record.marqueeSeparatorColor,
      ['current', 'accent', 'principal', 'secondaire'],
      base.marqueeSeparatorColor ?? 'accent'
    ),
    marqueeMotion: typeof record.marqueeMotion === 'boolean' ? record.marqueeMotion : (base.marqueeMotion ?? true),
    marqueeScrollLink:
      typeof record.marqueeScrollLink === 'boolean' ? record.marqueeScrollLink : (base.marqueeScrollLink ?? true),
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
    experienceDesign,
    listMaxWidth: pick(record.listMaxWidth, ['narrow', 'default', 'wide', 'full'], base.listMaxWidth),
    listPlacement: pick(record.listPlacement, ['left', 'center', 'right'], base.listPlacement),
    itemsPerRow: (() => {
      const raw = record.itemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3) return raw;
      if (raw === '1' || raw === '2' || raw === '3') return Number(raw) as PortfolioExperienceItemsPerRow;
      return base.itemsPerRow;
    })(),
    galleryColumns: (() => {
      const raw = record.galleryColumns;
      if (raw === 2 || raw === 3) return raw;
      if (raw === '2' || raw === '3') return Number(raw) as PortfolioExperienceGalleryColumns;
      return base.galleryColumns ?? 3;
    })(),
    galleryThumbnailFit: pick(
      record.galleryThumbnailFit,
      ['cover', 'contain'],
      base.galleryThumbnailFit ?? 'cover'
    ),
    galleryBigTitleEnabled:
      typeof record.galleryBigTitleEnabled === 'boolean'
        ? record.galleryBigTitleEnabled
        : (base.galleryBigTitleEnabled ?? true),
    galleryBigTitleText:
      typeof record.galleryBigTitleText === 'string' && record.galleryBigTitleText.trim()
        ? record.galleryBigTitleText
        : (base.galleryBigTitleText ?? 'Experience'),
    galleryBigTitleStyle: pick(
      record.galleryBigTitleStyle,
      ['outline', 'fill'],
      base.galleryBigTitleStyle ?? 'outline'
    ),
    galleryBigTitleColor: pick(
      record.galleryBigTitleColor,
      ['current', 'accent', 'simple'],
      base.galleryBigTitleColor ?? 'current'
    ),
    galleryHeaderAnimationEnabled:
      typeof record.galleryHeaderAnimationEnabled === 'boolean'
        ? record.galleryHeaderAnimationEnabled
        : (base.galleryHeaderAnimationEnabled ?? true),
    galleryHeaderAnimationStyle: pick(
      record.galleryHeaderAnimationStyle,
      ['dramatic', 'subtle', 'none'],
      base.galleryHeaderAnimationStyle ?? 'dramatic'
    ),
    gallerySecondaryTitleStyle: pick(
      record.gallerySecondaryTitleStyle,
      ['editorial', 'uniform'],
      base.gallerySecondaryTitleStyle ?? 'editorial'
    ),
    gallerySecondaryTitleText:
      typeof record.gallerySecondaryTitleText === 'string'
        ? record.gallerySecondaryTitleText
        : (base.gallerySecondaryTitleText ?? "Roles I've taken on"),
    galleryRoleCountStyle: pick(
      record.galleryRoleCountStyle,
      ['micro', 'normal', 'hidden'],
      base.galleryRoleCountStyle ?? 'micro'
    ),
    galleryRoleCountText:
      typeof record.galleryRoleCountText === 'string'
        ? record.galleryRoleCountText
        : (base.galleryRoleCountText ?? '{count} {count === 1 ? "role" : "roles"} — click any card for the full story'),
    galleryScrollParallaxEnabled:
      typeof record.galleryScrollParallaxEnabled === 'boolean'
        ? record.galleryScrollParallaxEnabled
        : (base.galleryScrollParallaxEnabled ?? true),
    spotlightBigTitleEnabled:
      typeof record.spotlightBigTitleEnabled === 'boolean'
        ? record.spotlightBigTitleEnabled
        : (base.spotlightBigTitleEnabled ?? true),
    spotlightBigTitleText:
      typeof record.spotlightBigTitleText === 'string' && record.spotlightBigTitleText.trim()
        ? record.spotlightBigTitleText
        : (base.spotlightBigTitleText ?? 'Experience'),
    spotlightBigTitleWord2:
      typeof record.spotlightBigTitleWord2 === 'string'
        ? record.spotlightBigTitleWord2
        : (base.spotlightBigTitleWord2 ?? ''),
    spotlightBigTitleWord3:
      typeof record.spotlightBigTitleWord3 === 'string'
        ? record.spotlightBigTitleWord3
        : (base.spotlightBigTitleWord3 ?? ''),
    spotlightBigTitleWord4:
      typeof record.spotlightBigTitleWord4 === 'string'
        ? record.spotlightBigTitleWord4
        : (base.spotlightBigTitleWord4 ?? ''),
    spotlightBigTitleColor: pick(
      record.spotlightBigTitleColor,
      ['ink', 'accent', 'alternating', 'muted'],
      base.spotlightBigTitleColor ?? 'ink'
    ),
    spotlightThumbnailFit: pick(
      record.spotlightThumbnailFit,
      ['cover', 'glass'],
      base.spotlightThumbnailFit ?? 'cover'
    ),
    spotlightHeaderAnimationEnabled:
      typeof record.spotlightHeaderAnimationEnabled === 'boolean'
        ? record.spotlightHeaderAnimationEnabled
        : (base.spotlightHeaderAnimationEnabled ?? true),
    spotlightMarqueeSpeed: pick(
      record.spotlightMarqueeSpeed,
      ['slow', 'medium', 'fast'],
      base.spotlightMarqueeSpeed ?? 'medium'
    ),
    spotlightMarqueeDirection: pick(
      record.spotlightMarqueeDirection,
      ['left', 'right'],
      base.spotlightMarqueeDirection ?? 'left'
    ),
    spotlightMarqueePauseOnHover:
      typeof record.spotlightMarqueePauseOnHover === 'boolean'
        ? record.spotlightMarqueePauseOnHover
        : (base.spotlightMarqueePauseOnHover ?? true),
    spotlightMarqueeWeight: pick(
      record.spotlightMarqueeWeight,
      ['light', 'normal', 'bold'],
      base.spotlightMarqueeWeight ?? 'normal'
    ),
    spotlightMarqueeStyle: pick(
      record.spotlightMarqueeStyle,
      ['outline', 'fill', 'mixed'],
      base.spotlightMarqueeStyle ?? 'mixed'
    ),
    spotlightMarqueeGradientFade:
      typeof record.spotlightMarqueeGradientFade === 'boolean'
        ? record.spotlightMarqueeGradientFade
        : (base.spotlightMarqueeGradientFade ?? true),
    spotlightMarqueeGap: pick(
      record.spotlightMarqueeGap,
      ['sm', 'md', 'lg'],
      base.spotlightMarqueeGap ?? 'md'
    ),
    spotlightScrollSpeedBoost:
      typeof record.spotlightScrollSpeedBoost === 'boolean'
        ? record.spotlightScrollSpeedBoost
        : (base.spotlightScrollSpeedBoost ?? false),
    loftHeadingEnabled:
      typeof record.loftHeadingEnabled === 'boolean'
        ? record.loftHeadingEnabled
        : (base.loftHeadingEnabled ?? true),
    loftHeadingText:
      typeof record.loftHeadingText === 'string' && record.loftHeadingText.trim()
        ? record.loftHeadingText
        : (base.loftHeadingText ?? "Roles I've taken on"),
    loftHeaderAnimationEnabled:
      typeof record.loftHeaderAnimationEnabled === 'boolean'
        ? record.loftHeaderAnimationEnabled
        : (base.loftHeaderAnimationEnabled ?? true),
    loftHeadingItalicWord: pick(
      record.loftHeadingItalicWord,
      ['first', 'last', 'none'],
      base.loftHeadingItalicWord ?? 'first'
    ),
    loftHeadingFontWeight: pick(
      record.loftHeadingFontWeight,
      ['light-to-bold', 'uniform'],
      base.loftHeadingFontWeight ?? 'light-to-bold'
    ),
    loftLabelText:
      typeof record.loftLabelText === 'string'
        ? record.loftLabelText
        : (base.loftLabelText ?? 'Experience'),
    loftLabelStyle: pick(
      record.loftLabelStyle,
      ['uppercase', 'lowercase', 'capitalize'],
      base.loftLabelStyle ?? 'uppercase'
    ),
    loftLabelPosition: pick(
      record.loftLabelPosition,
      ['top-aligned', 'center-aligned'],
      base.loftLabelPosition ?? 'top-aligned'
    ),
    loftScrollEffectEnabled:
      typeof record.loftScrollEffectEnabled === 'boolean'
        ? record.loftScrollEffectEnabled
        : (base.loftScrollEffectEnabled ?? true),
    loftScrollEffectStyle: pick(
      record.loftScrollEffectStyle,
      ['slide-right', 'fade-only'],
      base.loftScrollEffectStyle ?? 'slide-right'
    ),
    loftThumbnailFit: pick(record.loftThumbnailFit, ['cover', 'glass'], base.loftThumbnailFit ?? 'cover'),
    loftThumbnailRadius: pick(
      record.loftThumbnailRadius,
      ['none', 'md', 'xl'],
      base.loftThumbnailRadius ?? 'md'
    ),
    loftHoverEffect: pick(
      record.loftHoverEffect,
      ['curtain', 'magnetic', 'press'],
      base.loftHoverEffect ?? 'curtain'
    ),
    loftColumns: (() => {
      const raw = record.loftColumns;
      if (raw === 2 || raw === 3 || raw === 4) return raw;
      if (raw === '2' || raw === '3' || raw === '4') return Number(raw) as PortfolioExperienceLoftColumns;
      return base.loftColumns ?? 3;
    })(),
    loftGap: pick(record.loftGap, ['sm', 'md', 'lg', 'xl'], base.loftGap ?? 'md'),
    pressHeadingEnabled:
      typeof record.pressHeadingEnabled === 'boolean'
        ? record.pressHeadingEnabled
        : (base.pressHeadingEnabled ?? true),
    pressHeadingText:
      typeof record.pressHeadingText === 'string' && record.pressHeadingText.trim()
        ? record.pressHeadingText
        : (base.pressHeadingText ?? 'Roles taken. Skills sharpened. Impact delivered.'),
    pressIntroText:
      typeof record.pressIntroText === 'string'
        ? record.pressIntroText
        : (base.pressIntroText ?? 'Selected roles, projects, and outcomes.'),
    pressThumbnailRadius: pick(
      record.pressThumbnailRadius,
      ['none', 'md', 'xl'],
      base.pressThumbnailRadius ?? 'md'
    ),
    pressHeaderAnimationEnabled:
      typeof record.pressHeaderAnimationEnabled === 'boolean'
        ? record.pressHeaderAnimationEnabled
        : (base.pressHeaderAnimationEnabled ?? true),
    pressHeaderAnimationStyle: pick(
      record.pressHeaderAnimationStyle,
      ['staggered', 'simultaneous', 'none'],
      base.pressHeaderAnimationStyle ?? 'staggered'
    ),
    pressHeadingWeightStyle: pick(
      record.pressHeadingWeightStyle,
      ['alternating', 'uniform'],
      base.pressHeadingWeightStyle ?? 'alternating'
    ),
    pressSubtitleStyle: pick(
      record.pressSubtitleStyle,
      ['micro', 'normal', 'hidden'],
      base.pressSubtitleStyle ?? 'micro'
    ),
    pressHeadingAlignment: pick(
      record.pressHeadingAlignment,
      ['left', 'center'],
      base.pressHeadingAlignment ?? 'left'
    ),
    pressScrollParallaxEnabled:
      typeof record.pressScrollParallaxEnabled === 'boolean'
        ? record.pressScrollParallaxEnabled
        : (base.pressScrollParallaxEnabled ?? true),
    pressScrollParallaxIntensity: pick(
      record.pressScrollParallaxIntensity,
      ['subtle', 'dramatic'],
      base.pressScrollParallaxIntensity ?? 'subtle'
    ),
    legacyHeadingEnabled:
      typeof record.legacyHeadingEnabled === 'boolean'
        ? record.legacyHeadingEnabled
        : (base.legacyHeadingEnabled ?? true),
    legacyHeadingText:
      typeof record.legacyHeadingText === 'string' && record.legacyHeadingText.trim()
        ? record.legacyHeadingText
        : (base.legacyHeadingText ?? 'A Career Built on'),
    legacyHeadingAccentText:
      typeof record.legacyHeadingAccentText === 'string' && record.legacyHeadingAccentText.trim()
        ? record.legacyHeadingAccentText
        : (base.legacyHeadingAccentText ?? 'Craft'),
    legacyIntroText:
      typeof record.legacyIntroText === 'string'
        ? record.legacyIntroText
        : (base.legacyIntroText ?? 'A selection of roles, teams, and problems solved along the way.'),
    legacyThumbnailRadius: pick(
      record.legacyThumbnailRadius,
      ['none', 'md', 'xl'],
      base.legacyThumbnailRadius ?? 'xl'
    ),
    legacyThumbnailHeight: pick(
      record.legacyThumbnailHeight,
      ['sm', 'md', 'lg'],
      base.legacyThumbnailHeight ?? 'lg'
    ),
    legacyThumbnailWidth: pick(
      record.legacyThumbnailWidth,
      ['sm', 'md', 'lg'],
      base.legacyThumbnailWidth ?? 'lg'
    ),
    legacyItemGap: pick(record.legacyItemGap, ['sm', 'md', 'lg', 'xl'], base.legacyItemGap ?? 'md'),
    legacyAlternateSides:
      typeof record.legacyAlternateSides === 'boolean'
        ? record.legacyAlternateSides
        : (base.legacyAlternateSides ?? true),
    legacyFixedSide: pick(record.legacyFixedSide, ['left', 'right'], base.legacyFixedSide ?? 'left'),
    legacyShowTasks:
      typeof record.legacyShowTasks === 'boolean'
        ? record.legacyShowTasks
        : (base.legacyShowTasks ?? false),
    legacyHeaderAnimationEnabled:
      typeof record.legacyHeaderAnimationEnabled === 'boolean'
        ? record.legacyHeaderAnimationEnabled
        : (base.legacyHeaderAnimationEnabled ?? true),
    legacyHeaderAnimationStyle: pick(
      record.legacyHeaderAnimationStyle,
      ['bloom', 'slide', 'none'],
      base.legacyHeaderAnimationStyle ?? 'bloom'
    ),
    legacyPrefixWeight: pick(
      record.legacyPrefixWeight,
      ['light', 'normal', 'bold'],
      base.legacyPrefixWeight ?? 'light'
    ),
    legacyAccentStyle: pick(
      record.legacyAccentStyle,
      ['italic-bold', 'bold', 'italic'],
      base.legacyAccentStyle ?? 'italic-bold'
    ),
    legacyAccentSize: pick(
      record.legacyAccentSize,
      ['dramatic', 'subtle', 'same'],
      base.legacyAccentSize ?? 'dramatic'
    ),
    legacyAccentUnderline:
      typeof record.legacyAccentUnderline === 'boolean'
        ? record.legacyAccentUnderline
        : (base.legacyAccentUnderline ?? true),
    legacyAccentUnderlineStyle: pick(
      record.legacyAccentUnderlineStyle,
      ['solid', 'gradient'],
      base.legacyAccentUnderlineStyle ?? 'solid'
    ),
    legacySubtitleStyle: pick(
      record.legacySubtitleStyle,
      ['micro', 'serif', 'normal'],
      base.legacySubtitleStyle ?? 'micro'
    ),
    legacyScrollParallaxEnabled:
      typeof record.legacyScrollParallaxEnabled === 'boolean'
        ? record.legacyScrollParallaxEnabled
        : (base.legacyScrollParallaxEnabled ?? true),
    itemGap: pick(record.itemGap, ['sm', 'md', 'lg', 'xl'], base.itemGap),
    cardsGridGap: isPortfolioExperienceCardsGridGap(record.cardsGridGap)
      ? record.cardsGridGap
      : pick(record.itemGap, ['sm', 'md', 'lg', 'xl'], base.cardsGridGap ?? 'md'),
    cardsGridGapPx: clampExperienceCardsGridGapPx(
      record.cardsGridGapPx,
      base.cardsGridGapPx ?? 36
    ),
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
    toolsLabel: typeof record.toolsLabel === 'string' ? record.toolsLabel : base.toolsLabel,
    showBlockLabels:
      typeof record.showBlockLabels === 'boolean' ? record.showBlockLabels : base.showBlockLabels,
    blockLabelVisibility: normalizeExperienceBlockLabelVisibility(
      record.blockLabelVisibility,
      base.blockLabelVisibility ?? DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY
    ),
    statusBadgeStyle: pick(
      record.statusBadgeStyle,
      ['pill', 'soft', 'outline', 'plain', 'accent', 'square', 'dot'],
      base.statusBadgeStyle ?? 'pill'
    ),
    periodDesign: pick(
      record.periodDesign,
      ['plain', 'rail', 'badge', 'rule'],
      base.periodDesign ?? 'plain'
    ),
    entryExpandMode: pick(
      record.entryExpandMode,
      ['accordion', 'all-open'],
      base.entryExpandMode ?? 'accordion'
    ),
    editorialDetailLayout: pick(
      record.editorialDetailLayout,
      ['stacked', 'split-actions'],
      base.editorialDetailLayout ?? 'split-actions'
    ),
    tasksDisplay:
      migrateExperienceTasksDisplay(record.tasksDisplay) ??
      migrateExperienceTasksDisplay(base.tasksDisplay) ??
      'editorial-dash',
    tableStripedRows:
      typeof record.tableStripedRows === 'boolean'
        ? record.tableStripedRows
        : base.tableStripedRows ?? false,
    cardsBorderRadius: pick(
      record.cardsBorderRadius,
      ['none', 'md', 'xl'],
      base.cardsBorderRadius ?? 'none'
    ),
    cardsCardWidth: pick(
      record.cardsCardWidth,
      ['full', 'medium', 'small'],
      base.cardsCardWidth ?? 'medium'
    ),
    cardsElementSpacing: pick(
      record.cardsElementSpacing,
      ['sm', 'md', 'lg'],
      base.cardsElementSpacing ?? 'md'
    ),
    cardsVerticalGap: pick(
      record.cardsVerticalGap,
      ['sm', 'md', 'lg'],
      base.cardsVerticalGap ?? 'md'
    ),
    proofLinkStyle: pick(
      record.proofLinkStyle,
      ['pill', 'soft', 'outline', 'plain', 'accent', 'underline'],
      base.proofLinkStyle ?? 'pill'
    ),
    repoLinkButtonStyle: pick(
      record.repoLinkButtonStyle,
      PORTFOLIO_EXPERIENCE_REPO_LINK_STYLES,
      base.repoLinkButtonStyle ?? 'auto'
    ),
    linkArrowStyle: pick(
      record.linkArrowStyle,
      PORTFOLIO_EXPERIENCE_LINK_ARROW_STYLES,
      base.linkArrowStyle ?? 'northeast'
    ),
    reelKickerEnabled:
      typeof record.reelKickerEnabled === 'boolean'
        ? record.reelKickerEnabled
        : (base.reelKickerEnabled ?? true),
    reelKickerText:
      typeof record.reelKickerText === 'string'
        ? record.reelKickerText
        : (base.reelKickerText ?? '02 / Chronology'),
    reelHeaderAnimationEnabled:
      typeof record.reelHeaderAnimationEnabled === 'boolean'
        ? record.reelHeaderAnimationEnabled
        : (base.reelHeaderAnimationEnabled ?? true),
    reelStatusStyle: pick(
      record.reelStatusStyle,
      ['minimal', 'badge', 'bar', 'square', 'plain'],
      base.reelStatusStyle ?? 'minimal'
    ),
    reelScrollMotion: pick(
      record.reelScrollMotion,
      ['index-distort', 'fade-reveal', 'sticky-vertical'],
      // Migrate retired sticky-snap → sticky-vertical
      record.reelScrollMotion === 'sticky-snap'
        ? 'sticky-vertical'
        : (base.reelScrollMotion ?? 'fade-reveal')
    ),
    duotoneScrollMode: pick(
      record.duotoneScrollMode,
      ['sticky', 'scroll', 'slide'],
      base.duotoneScrollMode ?? 'sticky'
    ),
    duotoneSlideNavStyle: pick(
      record.duotoneSlideNavStyle,
      ['chevron', 'text'],
      base.duotoneSlideNavStyle ?? 'chevron'
    ),
    duotoneFrameColor: pick(
      record.duotoneFrameColor,
      ['none', 'neutral', 'muted'],
      base.duotoneFrameColor ?? 'none'
    ),
    duotoneFrameRadius: pick(
      record.duotoneFrameRadius,
      ['none', 'sm', 'lg'],
      base.duotoneFrameRadius ?? 'sm'
    ),
    duotoneAutoAdvance:
      typeof record.duotoneAutoAdvance === 'boolean'
        ? record.duotoneAutoAdvance
        : (base.duotoneAutoAdvance ?? false),
    duotoneThumbnailEffect: pick(
      record.duotoneThumbnailEffect,
      ['grayscale', 'tint', 'none'],
      base.duotoneThumbnailEffect ?? 'grayscale'
    ),
    duotoneThumbnailHeight: pick(
      record.duotoneThumbnailHeight,
      ['sm', 'md', 'lg'],
      base.duotoneThumbnailHeight ?? 'md'
    ),
    duotoneRepoCtaMode: pick(
      record.duotoneRepoCtaMode,
      ['footer', 'thumb-cursor'],
      base.duotoneRepoCtaMode ?? 'footer'
    ),
    duotoneScrollFullWidthTitle:
      typeof record.duotoneScrollFullWidthTitle === 'boolean'
        ? record.duotoneScrollFullWidthTitle
        : (base.duotoneScrollFullWidthTitle ?? false),
    duotoneStickySwapSides:
      typeof record.duotoneStickySwapSides === 'boolean'
        ? record.duotoneStickySwapSides
        : (base.duotoneStickySwapSides ?? false),
    duotoneAlternateSides:
      typeof record.duotoneAlternateSides === 'boolean'
        ? record.duotoneAlternateSides
        : (base.duotoneAlternateSides ?? false),
    duotoneStickyVerticalGap: pick(
      record.duotoneStickyVerticalGap,
      ['sm', 'md', 'lg', 'xl'],
      base.duotoneStickyVerticalGap ?? 'md'
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
    entryFrame: resolvedEntryFrame,
    storyFrame: resolvedStoryFrame,
    detailsFrame: resolvedDetailsFrame,
    detailsSecondaryFrame: resolvedDetailsSecondaryFrame,
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
