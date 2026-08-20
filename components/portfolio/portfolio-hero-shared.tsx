'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { PortfolioShareButton } from '@/components/portfolio/PortfolioShareButton';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ArrowUpRight, SERIF } from '@/components/portfolio/portfolio-section-primitives';
import {
  HeroEditorialLayerFrame,
  heroGeomLayerPositionStyle,
} from '@/components/portfolio/portfolio-hero-geometric';
import {
  heroVerticalCellToPosition,
  heroVerticalVisualBandStyle,
  resolveHeroVerticalVisualBand,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioHeroMotifLayout, PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveCreatorToolLogoHex } from '@/components/creator/studio/creator-profile-tools-catalog';
import { PortfolioToolsStackedIcons } from '@/components/portfolio/portfolio-tools-stacked-icons';
import {
  DEFAULT_HERO_COLOR_BINDINGS,
  DEFAULT_HERO_PALETTE,
  mergeHeroColorBindings,
  mergeHeroPalette,
  resolveHeroPaletteColor,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  portfolioMonochromeSocialBrandClass,
  isNoirPortfolioTheme,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import type {
  PortfolioHeroAvailabilityBorderRadius,
  PortfolioHeroAvailabilityBorderWidth,
  PortfolioHeroAvailabilityDesign,
  PortfolioHeroAvailabilityDotSize,
  PortfolioHeroAvailabilityPlacement,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  DEFAULT_AVAILABILITY_BORDER_COLOR,
  DEFAULT_AVAILABILITY_DOT_COLOR,
  DEFAULT_AVAILABILITY_LABEL,
  DEFAULT_AVAILABILITY_TEXT_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
  availabilityAbovePortraitVisibilityClass,
  pickHeroAvailabilityBadgeProps,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  creatorNameFontStyle,
  formatPortraitSpecialtyText,
  portraitCaptionBandEdge,
  portraitFrameHasVisibleChrome,
  portraitFrameShellStyle,
  portraitImageMediaStyle,
  portraitMatFooterAlignClass,
  portraitPositionStyle,
  portraitRadiusClass,
  portraitRadiusStyle,
  portraitWrapperSizeClass,
  portraitWrapperSizeStyle,
  resolvePortraitPositionForDivision,
  resolvePortraitVerticalCell,
  type PortraitInFrameTextPlacement,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  elementTextStyleClass,
  elementTextInlineStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import { normalizeHeroElementStyles } from '@/components/portfolio/portfolio-hero-element-styles';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  resolveSkillDescription,
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import {
  formatMetaLocationDisplay,
  metaCardBorderStyle,
  metaCardBottomBarStyle,
  metaCardIconStyle,
  metaCardInnerClass,
  metaCardShellClass,
  metaRowPositionStyle,
  metaValueSizeClass,
  resolveMetaCardAccentColor,
  resolveMetaCardAnchors,
  resolveMetaCardGapPx,
  resolveMetaCardsFillWidth,
  resolveMetaCardsOrientation,
  resolveMetaPositionForDivision,
  resolveMetaVerticalCell,
  resolveMetaCardFrameShape,
  resolveShowMetaCardIcon,
  sanitizeMetaValueInterchangeSeconds,
  type PortfolioHeroMetaCardId,
  type PortfolioHeroMetaSettings,
} from '@/components/portfolio/portfolio-hero-meta-settings';

type HeroMetaItem = {
  id: string;
  value: string;
  label: string;
  icon: 'years' | 'projects' | 'location';
};

const META_VALUE_FADE = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

/** Rotate visible meta values across card slots on an interval (soft fade is per item). */
function useHeroMetaInterchangeItems(
  items: HeroMetaItem[],
  enabled: boolean,
  intervalSeconds: number
): HeroMetaItem[] {
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const count = items.length;
  const active = Boolean(enabled) && !reduceMotion && count >= 2;
  const seconds = sanitizeMetaValueInterchangeSeconds(intervalSeconds);

  useEffect(() => {
    if (!active) {
      setOffset(0);
      return;
    }
    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setOffset((current) => (current + 1) % count);
    };
    const id = window.setInterval(tick, seconds * 1000);
    return () => window.clearInterval(id);
  }, [active, count, seconds]);

  if (!active || offset === 0) return items;
  return items.map((_, index) => items[(index + offset) % count]!);
}

export function HeroAvailabilityBadge({
  isAvailable,
  responseTimeLabel,
  showResponseTime = false,
  design = 'pill-live',
  placement = 'above-headline',
  layoutFlipped = false,
  placementContext = 'viewport',
  label = DEFAULT_AVAILABILITY_LABEL,
  unavailableLabel = DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  textColor = DEFAULT_AVAILABILITY_TEXT_COLOR,
  backgroundColor = DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  borderColor = DEFAULT_AVAILABILITY_BORDER_COLOR,
  borderWidth = 'thin',
  borderRadius = 'full',
  showDot = true,
  dotColor = DEFAULT_AVAILABILITY_DOT_COLOR,
  dotSize = 'md',
  dotPulse = true,
  unavailableTextColor = DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
  unavailableBackgroundColor = DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  unavailableBorderColor = DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  unavailableDotColor = DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  textClassName = '',
  textStyle,
  marginTopPx = 0,
  marginBottomPx = 0,
}: {
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  showResponseTime?: boolean;
  design?: PortfolioHeroAvailabilityDesign;
  placement?: PortfolioHeroAvailabilityPlacement;
  pill?: boolean;
  layoutFlipped?: boolean;
  placementContext?: 'viewport' | 'inline';
  label?: string;
  unavailableLabel?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: PortfolioHeroAvailabilityBorderWidth;
  borderRadius?: PortfolioHeroAvailabilityBorderRadius;
  showDot?: boolean;
  dotColor?: string;
  dotSize?: PortfolioHeroAvailabilityDotSize;
  dotPulse?: boolean;
  unavailableTextColor?: string;
  unavailableBackgroundColor?: string;
  unavailableBorderColor?: string;
  unavailableDotColor?: string;
  textClassName?: string;
  textStyle?: CSSProperties;
  marginTopPx?: number;
  marginBottomPx?: number;
}) {
  const placementClass =
    placementContext === 'inline'
      ? 'relative'
      : placement === 'top-right'
        ? layoutFlipped
          ? 'absolute left-0 top-0 z-30 lg:left-6 lg:top-2'
          : 'absolute right-0 top-0 z-30 lg:right-6 lg:top-2'
        : placement === 'top-left'
          ? layoutFlipped
            ? 'absolute right-0 top-0 z-30 lg:right-6 lg:top-2'
            : 'absolute left-0 top-0 z-30 lg:left-6 lg:top-2'
          : placement === 'top-center'
            ? 'absolute left-1/2 top-0 z-30 -translate-x-1/2 lg:top-2'
            : 'relative';

  const radiusClass =
    borderRadius === 'none'
      ? 'rounded-none'
      : borderRadius === 'sm'
        ? 'rounded-md'
        : borderRadius === 'md'
          ? 'rounded-xl'
          : borderRadius === 'lg'
            ? 'rounded-2xl'
            : 'rounded-full';

  const borderPx =
    borderWidth === 'none' ? 0 : borderWidth === 'medium' ? 2 : borderWidth === 'thick' ? 3 : 1;

  const paddingClass = design === 'pill-minimal' ? 'px-0 py-1' : 'px-4 py-2';
  const shadowClass = design === 'pill-minimal' ? 'shadow-none' : 'shadow-sm';
  const unavailable = isAvailable === false;

  const shellStyle: CSSProperties = {
    color: unavailable ? unavailableTextColor : textColor,
    backgroundColor: unavailable
      ? unavailableBackgroundColor
      : design === 'pill-minimal'
        ? 'transparent'
        : backgroundColor,
    borderColor: unavailable ? unavailableBorderColor : borderColor,
    borderWidth: borderPx,
    borderStyle: borderPx > 0 ? 'solid' : 'none',
    marginTop: marginTopPx > 0 ? marginTopPx : undefined,
    marginBottom: marginBottomPx > 0 ? marginBottomPx : undefined,
  };

  const resolvedDotColor = unavailable ? unavailableDotColor : dotColor;
  const dotBoxClass =
    dotSize === 'sm' ? 'h-1.5 w-1.5' : dotSize === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5';

  const responseSuffix =
    !unavailable && showResponseTime && responseTimeLabel?.trim()
      ? ` · replies ${responseTimeLabel.toLowerCase()}`
      : '';

  const displayLabel = unavailable
    ? unavailableLabel.trim() || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
    : label.trim() || DEFAULT_AVAILABILITY_LABEL;

  // Respect the toggle only — do not force pulse for pill-live.
  const pulse = !unavailable && showDot && dotPulse;

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-2.5 tracking-wide ${textClassName} ${placementClass} ${radiusClass} ${paddingClass} ${shadowClass}`.trim()}
      style={{ ...shellStyle, ...textStyle }}
    >
      {showDot ? (
        <span className={`relative flex shrink-0 ${dotBoxClass}`} aria-hidden>
          {pulse ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: resolvedDotColor }}
            />
          ) : null}
          <span
            className={`relative inline-flex rounded-full ${dotBoxClass}`}
            style={{ backgroundColor: resolvedDotColor }}
          />
        </span>
      ) : null}
      {displayLabel}
      {responseSuffix}
    </span>
  );
}

/**
 * Availability pill sitting outside / above the portrait frame (not inside the photo).
 * Controlled by availabilityPlacement / mobileAvailabilityPlacement === 'above-portrait'.
 */
export function HeroAvailabilityAbovePortrait({
  presentation,
  isAvailable,
  responseTimeLabel,
  className = '',
}: {
  presentation: PortfolioHeroPresentationSettings;
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  className?: string;
}) {
  if (!presentation.showAvailabilityBadge) return null;
  const visibility = availabilityAbovePortraitVisibilityClass(presentation);
  if (!visibility) return null;

  const elementStyles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const textClassName = elementTextStyleClass(elementStyles.availabilityText, 'label');
  const textStyle = elementTextInlineStyle(elementStyles.availabilityText);

  return (
    <div
      className={`${visibility} w-full items-center justify-center ${className}`.trim()}
      data-hero-availability-above-portrait
    >
      <HeroAvailabilityBadge
        isAvailable={isAvailable}
        responseTimeLabel={responseTimeLabel}
        {...pickHeroAvailabilityBadgeProps(presentation)}
        placement="above-portrait"
        placementContext="inline"
        textClassName={textClassName}
        textStyle={textStyle}
      />
    </div>
  );
}

export function HeroCtas({
  creatorId,
  fullName,
  showWorkCta,
  showContactCta,
  contactHref = '#footer',
  workHref = '#work',
  onNavigateSection,
  primaryClass = 'inline-flex items-center gap-2 bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700',
  secondaryClass = 'inline-flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-900 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
}: Pick<
  PortfolioHeroData,
  'creatorId' | 'fullName' | 'showWorkCta' | 'showContactCta' | 'contactHref' | 'workHref' | 'onNavigateSection'
> & {
  primaryClass?: string;
  secondaryClass?: string;
}) {
  const handleSectionNav = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (!onNavigateSection) return;
    event.preventDefault();
    onNavigateSection(sectionId);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showWorkCta ? (
        <a
          href={workHref}
          className={primaryClass}
          onClick={(event) => handleSectionNav(event, 'work')}
        >
          View my work
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : null}
      {showContactCta ? (
        <a
          href={contactHref}
          className={secondaryClass}
          onClick={(event) => {
            if (!onNavigateSection) return;
            event.preventDefault();
            const id = contactHref.replace(/^#/, '') || 'contact';
            onNavigateSection(id === 'footer' ? 'contact' : id);
          }}
        >
          Contact me
        </a>
      ) : null}
      <PortfolioShareButton creatorId={creatorId} creatorName={fullName} compact />
    </div>
  );
}

export function HeroStatsRow({
  stats,
  className = 'mt-10 grid grid-cols-3 gap-4 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 sm:max-w-lg',
  valueClass = 'text-2xl font-bold text-neutral-950 dark:text-white sm:text-3xl',
  labelClass = 'mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400',
}: {
  stats: PortfolioHeroData['stats'];
  className?: string;
  valueClass?: string;
  labelClass?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <div className={className}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className={valueClass}>{stat.value}</p>
          <p className={labelClass}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Decorative frame — border + optional mat fill + padding around the portrait. */
export function HeroPortraitEditorialFrame({
  show = true,
  color = '#ffffff',
  width = 14,
  borderOpacity = 100,
  backgroundColor = '#ffffff',
  backgroundOpacity = 0,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  radiusClass = 'rounded-[2rem]',
  radiusStyle,
  children,
}: {
  show?: boolean;
  color?: string;
  width?: number;
  borderOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  radiusClass?: string;
  /** Inline radius — preferred so corners always apply even with thick borders. */
  radiusStyle?: CSSProperties;
  children?: ReactNode;
}) {
  const chrome = {
    showPortraitFrame: show,
    portraitFrameColor: color,
    portraitFrameWidth: width,
    portraitFrameBorderOpacity: borderOpacity,
    portraitFrameBackgroundColor: backgroundColor,
    portraitFrameBackgroundOpacity: backgroundOpacity,
    portraitFramePaddingTop: paddingTop,
    portraitFramePaddingBottom: paddingBottom,
    portraitFramePaddingLeft: paddingLeft,
    portraitFramePaddingRight: paddingRight,
  };

  const clipStyle: CSSProperties = {
    ...radiusStyle,
    overflow: 'hidden',
  };

  if (!portraitFrameHasVisibleChrome(chrome)) {
    // Still clip to the chosen corner radius when the decorative frame is off.
    return children ? (
      <div className={`relative ${radiusClass}`} style={clipStyle}>
        {children}
      </div>
    ) : null;
  }

  const shellStyle = {
    ...portraitFrameShellStyle(chrome),
    ...clipStyle,
  };

  if (children) {
    return (
      <div className={`relative ${radiusClass}`} style={shellStyle}>
        {children}
      </div>
    );
  }

  // Legacy overlay (border-only) when used without wrapping children.
  if ((width ?? 0) <= 0) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${radiusClass}`}
      style={shellStyle}
      aria-hidden
    />
  );
}

type CaptionBandLine = {
  key: string;
  text: string;
  className: string;
  style?: CSSProperties;
};

type CaptionBandProfile = Pick<
  PortfolioHeroProfileSettings,
  | 'showCreatorName'
  | 'creatorNameInFrame'
  | 'creatorNameFramePlacement'
  | 'showSpecialtyInFrame'
  | 'specialtyFramePlacement'
  | 'portraitCaptionLayout'
  | 'portraitCaptionBarEnabled'
  | 'portraitCaptionBarEdge'
  | 'portraitCaptionBarColor'
  | 'portraitCaptionBarHeight'
  | 'portraitCaptionShowDot'
  | 'portraitSpecialtyUppercase'
  | 'portraitFrameBackgroundColor'
> & {
  /** Status dot mirrors the availability badge (same color + pulse). */
  availabilityDotColor?: string;
  availabilityDotPulse?: boolean;
};

function buildPortraitCaptionBands(
  fullName: string,
  specialite: string | null | undefined,
  profile: CaptionBandProfile,
  nameClassName: string,
  nameStyle?: CSSProperties
): { top: CaptionBandLine[]; bottom: CaptionBandLine[] } {
  const top: CaptionBandLine[] = [];
  const bottom: CaptionBandLine[] = [];

  // Caption layout explicitly hidden — no bands around the photo.
  if (profile.portraitCaptionLayout === 'none') {
    return { top, bottom };
  }

  const push = (
    placement: PortraitInFrameTextPlacement,
    line: CaptionBandLine,
    forceEdge?: 'top' | 'bottom'
  ) => {
    const edge =
      forceEdge ??
      (profile.portraitCaptionLayout === 'mat-footer'
        ? 'bottom'
        : portraitCaptionBandEdge(placement));
    (edge === 'top' ? top : bottom).push(line);
  };

  const showNameInFrame = Boolean(
    profile.showCreatorName &&
      fullName.trim() &&
      (profile.creatorNameInFrame || profile.portraitCaptionLayout === 'mat-footer')
  );

  if (showNameInFrame) {
    push(profile.creatorNameFramePlacement, {
      key: 'name',
      text: fullName.trim(),
      className: nameClassName,
      style: nameStyle,
    });
  }

  const specialtyText = formatPortraitSpecialtyText(
    specialite,
    profile.portraitSpecialtyUppercase
  );
  if (profile.showSpecialtyInFrame && specialtyText) {
    const specialtyStyle: CSSProperties =
      profile.portraitCaptionLayout === 'mat-footer'
        ? {
            ...nameStyle,
            color:
              typeof nameStyle?.color === 'string' &&
              nameStyle.color.toLowerCase() === '#ffffff'
                ? '#A3A3A3'
                : '#737373',
            fontWeight: 500,
          }
        : {
            ...nameStyle,
            textTransform: profile.portraitSpecialtyUppercase ? 'uppercase' : undefined,
          };

    push(
      profile.portraitCaptionLayout === 'mat-header'
        ? 'top-center'
        : profile.specialtyFramePlacement,
      {
        key: 'specialty',
        text: specialtyText,
        className:
          profile.portraitCaptionLayout === 'mat-header'
            ? `text-xs font-semibold tracking-[0.18em] sm:text-sm ${nameClassName}`
            : `text-sm leading-tight tracking-wide opacity-90 ${nameClassName}`,
        style: specialtyStyle,
      },
      profile.portraitCaptionLayout === 'mat-header' ? 'top' : undefined
    );
  }

  return { top, bottom };
}

/**
 * Dedicated caption rectangle — sibling of the photo, never overlapping the image.
 * Edge (top/bottom) is automatic from placement / template layout.
 */
export function HeroPortraitCaptionBand({
  edge,
  lines,
  profile,
  forceShow,
}: {
  edge: 'top' | 'bottom';
  lines: CaptionBandLine[];
  profile: CaptionBandProfile;
  /** Show an empty filled bar even without text (rare). */
  forceShow?: boolean;
}) {
  // Caption layout explicitly hidden — no bands around the photo.
  if (profile.portraitCaptionLayout === 'none') {
    return null;
  }

  const barWantsThisEdge =
    profile.portraitCaptionBarEnabled &&
    (profile.portraitCaptionLayout === 'mat-header'
      ? edge === 'top'
      : profile.portraitCaptionLayout === 'mat-footer'
        ? edge === 'bottom'
        : profile.portraitCaptionBarEdge === edge);

  // If there is no caption text (name/specialty) and we are not explicitly
  // forcing a plate, don't render an "empty" caption band. Otherwise the
  // layout keeps occupying vertical space even when it looks invisible.
  const hasText = lines.length > 0;
  if (!hasText && !forceShow) return null;

  const alignSource = lines.find((line) => line.key === 'name')
    ? profile.creatorNameFramePlacement
    : profile.specialtyFramePlacement;
  const alignClass = portraitMatFooterAlignClass(
    profile.portraitCaptionLayout === 'mat-header' && edge === 'top'
      ? 'top-center'
      : alignSource
  );

  const usePlate = Boolean(
    (profile.portraitCaptionBarEnabled || barWantsThisEdge) &&
      !(profile.portraitCaptionLayout === 'mat-header' && edge === 'bottom')
  );
  const minHeight = usePlate
    ? Math.max(lines.length ? 44 : 0, profile.portraitCaptionBarHeight || 44)
    : undefined;

  // Raised plate only when caption bar is on for this edge; otherwise text sits in the mat.
  const plateColor = profile.portraitCaptionBarColor || '#0A0A0A';
  const bg = usePlate ? plateColor : 'transparent';

  // Blinking status dot on the right of the plate — mirrors the availability badge.
  const showDot = Boolean(profile.portraitCaptionShowDot && usePlate && barWantsThisEdge);
  const dotColor = profile.availabilityDotColor || '#22c48f';
  const dotPulse = profile.availabilityDotPulse !== false;

  // Gap from the photo; content stays inside the frame padding box (no bleed).
  const gapFromPhoto = 12;

  return (
    <div
      className={`relative z-[1] flex w-full shrink-0 flex-col justify-center gap-1 ${
        usePlate ? 'rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5' : 'px-0.5 py-1'
      } ${alignClass}`}
      style={{
        minHeight,
        backgroundColor: bg,
        marginTop: edge === 'bottom' ? gapFromPhoto : 0,
        marginBottom: edge === 'top' ? gapFromPhoto : 0,
        paddingRight: showDot ? 32 : undefined,
      }}
      aria-hidden={lines.length === 0}
    >
      {lines.map((line) => (
        <p key={line.key} className={`leading-tight ${line.className}`} style={line.style}>
          {line.text}
        </p>
      ))}
      {showDot ? (
        <span
          className="absolute right-3.5 top-1/2 flex h-2.5 w-2.5 -translate-y-1/2 sm:right-4"
          aria-hidden
        >
          {dotPulse ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: dotColor }}
            />
          ) : null}
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </span>
      ) : null}
    </div>
  );
}

type EditorialPortraitLayerProps = {
  fullName: string;
  avatarUrl?: string | null;
  specialite?: string | null;
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
};

/** Pristine portrait + external frame, above the geom overlay so the photo is never filtered or clipped. */
export function PortfolioHeroEditorialPortraitLayer({
  fullName,
  avatarUrl,
  specialite,
  isAvailable,
  responseTimeLabel,
  fadeOpacity = 1,
  motifLayout = 'centered',
  profile,
  contentWidthClass = 'max-w-none',
  contentGutter = DEFAULT_CONTENT_GUTTER,
  verticalDivision = false,
  layoutDivision,
}: EditorialPortraitLayerProps & {
  fadeOpacity?: number;
  motifLayout?: PortfolioHeroMotifLayout;
  profile: PortfolioHeroPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  /** When true, use vertical free-placement coords and full-frame panel (not motif geom box). */
  verticalDivision?: boolean;
  /** Active screen division — used to pin layers to the visual half. */
  layoutDivision?: string;
}) {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const radiusClass = portraitRadiusClass(profile.portraitRadius);
  const radiusStyle = portraitRadiusStyle(profile.portraitRadius);
  const elementStyles = normalizeHeroElementStyles(profile.elementStyles, profile);
  const creatorNameClass = elementTextStyleClass(elementStyles.creatorName, 'body');
  const creatorNameStyle = {
    ...elementTextInlineStyle(elementStyles.creatorName),
    ...creatorNameFontStyle(profile.creatorNameFont),
  };
  const showNameBelow =
    profile.showCreatorName &&
    !profile.creatorNameInFrame &&
    profile.portraitCaptionLayout !== 'mat-footer';
  const imageMediaStyle = portraitImageMediaStyle(profile);
  const captionBands = buildPortraitCaptionBands(
    fullName,
    specialite,
    profile,
    creatorNameClass,
    creatorNameStyle
  );
  const portraitPosition = resolvePortraitPositionForDivision(profile, verticalDivision);
  const portraitCell = resolvePortraitVerticalCell(profile);
  const visualBand = verticalDivision
    ? resolveHeroVerticalVisualBand(layoutDivision ?? '')
    : null;

  const portraitCard = (
    <>
      <HeroAvailabilityAbovePortrait
        presentation={profile}
        isAvailable={isAvailable}
        responseTimeLabel={responseTimeLabel}
        className="mb-3"
      />
      <div
        className={`relative ${portraitWrapperSizeClass(profile.portraitSize)}`}
        style={portraitWrapperSizeStyle(profile.portraitSize, profile.portraitSizeScale ?? 100)}
      >
        <div className="relative w-full">
          <HeroPortraitEditorialFrame
            show={profile.showPortraitFrame}
            color={profile.portraitFrameColor}
            width={profile.portraitFrameWidth}
            borderOpacity={profile.portraitFrameBorderOpacity}
            backgroundColor={profile.portraitFrameBackgroundColor}
            backgroundOpacity={profile.portraitFrameBackgroundOpacity}
            paddingTop={profile.portraitFramePaddingTop}
            paddingBottom={profile.portraitFramePaddingBottom}
            paddingLeft={profile.portraitFramePaddingLeft}
            paddingRight={profile.portraitFramePaddingRight}
            radiusClass={radiusClass}
            radiusStyle={radiusStyle}
          >
            <div className="flex w-full flex-col">
              <HeroPortraitCaptionBand
                edge="top"
                lines={captionBands.top}
                profile={profile}
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={640}
                    height={800}
                    className="aspect-[4/5] h-auto w-full"
                    style={imageMediaStyle}
                    priority
                    sizes="(min-width: 1280px) 22rem, (min-width: 768px) 18rem, 72vw"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700">
                    {initials}
                  </div>
                )}
              </div>
              <HeroPortraitCaptionBand
                edge="bottom"
                lines={captionBands.bottom}
                profile={profile}
              />
            </div>
          </HeroPortraitEditorialFrame>
        </div>
      </div>
      {showNameBelow ? (
        <p className={`mt-4 text-center ${creatorNameClass}`} style={creatorNameStyle}>
          {fullName}
        </p>
      ) : null}
    </>
  );

  /**
   * Vertical screen division — same pattern as stats MetaLayer:
   * pin a band frame (definite height) then left% + top% inside it.
   * Avoid HeroEditorialLayerFrame's inset-y-0 which fights the band and kills Y.
   */
  if (verticalDivision && visualBand) {
    const localPos = heroVerticalCellToPosition(portraitCell);
    return (
      <div
        className={`pointer-events-none absolute inset-y-0 left-1/2 z-[25] hidden w-full -translate-x-1/2 overflow-visible xl:block ${contentWidthClass}`}
        style={fadeOpacity >= 1 ? undefined : { opacity: fadeOpacity, willChange: 'opacity' }}
        data-hero-portrait-layer="vertical"
        data-hero-portrait-band={visualBand}
      >
        <div
          className={`pointer-events-none absolute overflow-visible ${portfolioHeroLayerInset(contentGutter)}`}
          style={heroVerticalVisualBandStyle(visualBand)}
        >
          <div className="absolute inset-0 overflow-visible">
            <div
              className="pointer-events-auto absolute flex flex-col items-center"
              style={{
                left: `${localPos.x}%`,
                top: `${localPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              data-hero-portrait
              data-hero-portrait-cell={portraitCell}
            >
              {portraitCard}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[25] overflow-visible"
      style={{
        ...(verticalDivision ? {} : heroGeomLayerPositionStyle(motifLayout)),
        ...(fadeOpacity >= 1 ? {} : { opacity: fadeOpacity, willChange: 'opacity' }),
      }}
    >
      <div className="absolute inset-0 pb-8 pt-20 sm:pb-10 sm:pt-24 lg:pb-0 lg:pt-0">
        <div
          className="absolute flex flex-col items-center"
          style={portraitPositionStyle(portraitPosition)}
          data-hero-portrait
        >
          {portraitCard}
        </div>
      </div>
    </HeroEditorialLayerFrame>
  );
}

type EditorialMetaLayerProps = {
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  fadeOpacity?: number;
};

/** Stats straddling the motif bottom edge — half on black, half on white (like the portrait). */
export function PortfolioHeroEditorialMetaLayer({
  yearsOfExperience,
  workCount,
  locationLabel,
  fadeOpacity = 1,
  motifLayout = 'centered',
  meta,
  contentWidthClass = 'max-w-none',
  contentGutter = DEFAULT_CONTENT_GUTTER,
  verticalDivision = false,
  layoutDivision,
}: EditorialMetaLayerProps & {
  motifLayout?: PortfolioHeroMotifLayout;
  meta: PortfolioHeroPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  verticalDivision?: boolean;
  /** Active screen division — used to pin layers to the visual half. */
  layoutDivision?: string;
}) {
  const fadeStyle = fadeOpacity >= 1 ? undefined : { opacity: fadeOpacity, willChange: 'opacity' as const };
  const visualBand = verticalDivision
    ? resolveHeroVerticalVisualBand(layoutDivision ?? '')
    : null;
  const metaCell = resolveMetaVerticalCell(meta);
  const metaSlots = buildHeroMetaItems(yearsOfExperience, workCount, locationLabel, meta);
  const metaItems = useHeroMetaInterchangeItems(
    metaSlots,
    meta.metaValueInterchangeEnabled === true,
    meta.metaValueInterchangeSeconds ?? 5
  );
  if (metaSlots.length === 0) return null;

  const metaForPlacement: PortfolioHeroPresentationSettings = {
    ...meta,
    metaPosition: resolveMetaPositionForDivision(meta, verticalDivision),
    metaPlacementMode: verticalDivision ? 'free' : meta.metaPlacementMode,
  };

  /**
   * Vertical screen division — same proven pattern as the portrait layer:
   * 1) Pin a frame to the visual half (top/bottom → definite height tied to the section)
   * 2) Place the row with left% + top% *inside that frame*
   *
   * Do NOT use vh (preview/embed viewport ≠ section) and do NOT put inset-y-0 on the
   * band frame (it fights top/bottom and collapses usable height so only X moves).
   */
  if (verticalDivision && visualBand) {
    const localPos = heroVerticalCellToPosition(metaCell);
    return (
      <div
        className={`pointer-events-none absolute inset-y-0 left-1/2 z-[26] hidden w-full -translate-x-1/2 overflow-visible xl:block ${contentWidthClass}`}
        style={fadeStyle}
        data-hero-stats-layer="vertical"
        data-hero-stats-band={visualBand}
      >
        <div
          className={`pointer-events-none absolute overflow-visible ${portfolioHeroLayerInset(contentGutter)}`}
          style={heroVerticalVisualBandStyle(visualBand)}
        >
          <div className="absolute inset-0 overflow-visible">
            <div
              className={`pointer-events-auto absolute flex ${
                resolveMetaCardsOrientation(meta) === 'vertical'
                  ? 'flex-col items-start'
                  : 'flex-row items-center'
              } ${metaRowGapClass(meta.metaSpread)}`}
              style={{
                left: `${localPos.x}%`,
                top: `${localPos.y}%`,
                transform: 'translate(-50%, -50%)',
                gap: `${resolveMetaCardGapPx(meta)}px`,
              }}
              data-hero-stats
              data-hero-stats-cell={metaCell}
            >
              {metaSlots.map((slot, index) => (
                <HeroProfileMetaItem
                  key={slot.id}
                  slot={slot}
                  item={metaItems[index] ?? slot}
                  meta={meta}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[26] overflow-visible"
      style={fadeStyle}
    >
      <HeroProfileMeta
        editorial
        elevated
        straddle
        motifLayout={motifLayout}
        meta={metaForPlacement}
        yearsOfExperience={yearsOfExperience}
        workCount={workCount}
        locationLabel={locationLabel}
      />
    </HeroEditorialLayerFrame>
  );
}

export function HeroPortrait({
  fullName,
  avatarUrl,
  specialite,
  className = 'aspect-[4/5] w-full object-cover',
  wrapperClass = 'w-full max-w-md',
  rounded = false,
  caption,
  captionOnDark = false,
  preserveLayoutOnDesktop = false,
  profile,
  isAvailable,
  responseTimeLabel,
  children,
}: {
  fullName: string;
  avatarUrl?: string | null;
  specialite?: string | null;
  className?: string;
  wrapperClass?: string;
  rounded?: boolean;
  caption?: string | null;
  captionOnDark?: boolean;
  /** Editorial: hide in-flow image on lg (elevated layer renders the visible photo). */
  preserveLayoutOnDesktop?: boolean;
  profile?: PortfolioHeroPresentationSettings;
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  children?: React.ReactNode;
}) {
  const radiusClass = profile ? portraitRadiusClass(profile.portraitRadius) : rounded ? 'rounded-[2rem]' : '';
  const radiusStyle = profile
    ? portraitRadiusStyle(profile.portraitRadius)
    : rounded
      ? { borderRadius: 32 }
      : undefined;
  const shell = radiusClass ? `overflow-hidden ${radiusClass}` : '';
  const resolvedWrapperClass = profile ? portraitWrapperSizeClass(profile.portraitSize) : wrapperClass;
  const resolvedWrapperStyle = profile
    ? portraitWrapperSizeStyle(profile.portraitSize, profile.portraitSizeScale ?? 100)
    : undefined;
  const showCaption = profile
    ? profile.showCreatorName &&
      !profile.creatorNameInFrame &&
      profile.portraitCaptionLayout !== 'mat-footer'
    : Boolean(caption?.trim());
  const captionText = caption?.trim() || fullName;
  const elementStyles = profile ? normalizeHeroElementStyles(profile.elementStyles, profile) : null;
  const captionClass = elementStyles
    ? elementTextStyleClass(elementStyles.creatorName, 'body')
    : `text-base font-bold tracking-tight sm:text-lg ${
        captionOnDark
          ? 'text-neutral-950 lg:relative lg:z-30 lg:text-white dark:text-white'
          : 'text-neutral-950 dark:text-white'
      }`;
  const captionStyle = elementStyles
    ? {
        ...elementTextInlineStyle(elementStyles.creatorName),
        ...(profile ? creatorNameFontStyle(profile.creatorNameFont) : {}),
      }
    : undefined;

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const media = avatarUrl ? (
    <>
      <Image
        src={avatarUrl}
        alt={fullName}
        width={360}
        height={450}
        className={`${className}${preserveLayoutOnDesktop ? ' xl:hidden' : ''}`}
        style={profile ? portraitImageMediaStyle(profile) : undefined}
        priority
        sizes="(min-width: 1280px) 22rem, (min-width: 768px) 18rem, 72vw"
      />
      {preserveLayoutOnDesktop ? (
        <div className={`hidden xl:block ${className}`} aria-hidden />
      ) : null}
    </>
  ) : (
    <>
      <div
        className={`flex items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700 dark:bg-neutral-800 dark:text-white ${className}${preserveLayoutOnDesktop ? ' xl:hidden' : ''}`}
      >
        {initials}
      </div>
      {preserveLayoutOnDesktop ? (
        <div className={`hidden xl:block ${className}`} aria-hidden />
      ) : null}
    </>
  );

  const captionBands = profile
    ? buildPortraitCaptionBands(fullName, specialite, profile, captionClass, captionStyle)
    : null;

  const framedMedia = profile ? (
    <HeroPortraitEditorialFrame
      show={profile.showPortraitFrame}
      color={profile.portraitFrameColor}
      width={profile.portraitFrameWidth}
      borderOpacity={profile.portraitFrameBorderOpacity}
      backgroundColor={profile.portraitFrameBackgroundColor}
      backgroundOpacity={profile.portraitFrameBackgroundOpacity}
      paddingTop={profile.portraitFramePaddingTop}
      paddingBottom={profile.portraitFramePaddingBottom}
      paddingLeft={profile.portraitFramePaddingLeft}
      paddingRight={profile.portraitFramePaddingRight}
      radiusClass={radiusClass || 'rounded-[2rem]'}
      radiusStyle={radiusStyle}
    >
      <div className="flex w-full flex-col">
        <HeroPortraitCaptionBand
          edge="top"
          lines={captionBands?.top ?? []}
          profile={profile}
        />
        <div className="relative overflow-hidden">
          {media}
        </div>
        <HeroPortraitCaptionBand
          edge="bottom"
          lines={captionBands?.bottom ?? []}
          profile={profile}
        />
      </div>
    </HeroPortraitEditorialFrame>
  ) : (
    media
  );

  return (
    <figure className={resolvedWrapperClass} style={{ ...resolvedWrapperStyle, ...radiusStyle }}>
      {profile ? (
        <HeroAvailabilityAbovePortrait
          presentation={profile}
          isAvailable={isAvailable}
          responseTimeLabel={responseTimeLabel}
          className="mb-3"
        />
      ) : null}
      <div className="relative">
        <div className={`relative ${shell}`} style={radiusStyle}>
          {framedMedia}
          {children}
        </div>
      </div>
      {showCaption ? (
        <figcaption className={`mt-4 text-center ${captionClass}`} style={captionStyle}>
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function HeroTitle({
  fullName,
  nameLead,
  nameAccent,
  isVerified,
  accentClass = 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent',
  sizeClass = 'text-4xl sm:text-5xl lg:text-6xl',
  darkSurface = false,
}: Pick<PortfolioHeroData, 'fullName' | 'nameLead' | 'nameAccent' | 'isVerified'> & {
  accentClass?: string;
  sizeClass?: string;
  darkSurface?: boolean;
}) {
  const titleClass = darkSurface ? 'text-white' : 'text-neutral-950 dark:text-white';

  return (
    <>
      <h1 className={`font-bold tracking-tight ${titleClass} ${sizeClass} leading-[1.05]`}>
        {nameAccent ? (
          <>
            <span className="block">{nameLead}</span>
            <span className={`mt-1 block ${accentClass}`}>{nameAccent}</span>
          </>
        ) : (
          <span className="block">{fullName}</span>
        )}
      </h1>
      {isVerified ? (
        <span className="mt-3 inline-block bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Verified
        </span>
      ) : null}
    </>
  );
}

export function HeroSpecialite({
  specialite,
  darkSurface = false,
}: {
  specialite?: string | null;
  darkSurface?: boolean;
}) {
  if (!specialite?.trim()) return null;
  return (
    <p
      className={`mt-4 text-xl italic sm:text-2xl ${darkSurface ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}
      style={{ fontFamily: SERIF }}
    >
      {specialite}
    </p>
  );
}

export function HeroToolsGrid({
  tools,
  layout = 'column',
  onDark = false,
  iconSurfaceStyle,
  showIconBackground = true,
  /** Bar / page surface behind the icons (for contrast when chips are off). */
  surfaceBackgroundColor,
  iconSizePx = 28,
  iconPaddingPx = 10,
  iconGapPx = 10,
  iconMarginPx = 0,
  arrangement = 'spaced',
}: {
  tools: string[];
  layout?: 'column' | 'row';
  onDark?: boolean;
  /** Background / border from Typography → Tools (palette-synced). */
  iconSurfaceStyle?: CSSProperties;
  /** When false, drop chip fill + white logo plate — glyphs only. */
  showIconBackground?: boolean;
  surfaceBackgroundColor?: string;
  iconSizePx?: number;
  iconPaddingPx?: number;
  iconGapPx?: number;
  iconMarginPx?: number;
  arrangement?: 'spaced' | 'stacked';
}) {
  const items = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean))).slice(0, 6);
  if (items.length === 0) return null;

  const size = Math.max(12, Math.round(iconSizePx));
  const padding = Math.max(0, Math.round(iconPaddingPx));
  const gap = Math.max(0, Math.round(iconGapPx));
  const margin = Math.max(0, Math.round(iconMarginPx));
  const box = size + padding * 2;

  const chipClass = !showIconBackground
    ? ''
    : iconSurfaceStyle
      ? 'shadow-sm'
      : onDark
        ? 'border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:border-neutral-200 lg:bg-white lg:shadow-md'
        : 'border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900';

  const chipBg =
    showIconBackground && iconSurfaceStyle?.backgroundColor
      ? String(iconSurfaceStyle.backgroundColor)
      : undefined;

  // Prefer the painted tools bar / chip; fall back to a dark surface when onDark
  // so CapCut / VS Code still get contrast lifting even if palette hex is missing.
  const contrastBg =
    chipBg ||
    (surfaceBackgroundColor &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(surfaceBackgroundColor.trim())
      ? `#${surfaceBackgroundColor.trim().replace('#', '').slice(0, 6)}`
      : undefined) ||
    (onDark ? '#262626' : undefined);

  if (arrangement === 'stacked') {
    const borderColor =
      (typeof iconSurfaceStyle?.borderColor === 'string' && iconSurfaceStyle.borderColor) ||
      contrastBg ||
      (onDark ? '#0a0a0a' : '#ffffff');
    return (
      <PortfolioToolsStackedIcons
        tools={items}
        sizePx={box}
        borderColor={borderColor}
        shellBackground={chipBg || contrastBg}
        className={layout === 'row' ? '' : ''}
      />
    );
  }

  return (
    <div
      className={`flex ${layout === 'row' ? 'flex-row flex-wrap justify-start' : 'flex-col'}`}
      style={{ gap }}
    >
      {items.map((tool) => {
        const brandHex = resolveCreatorToolLogoHex(tool);
        return (
          <div
            key={tool}
            title={tool}
            aria-label={tool}
            className={`flex items-center justify-center overflow-hidden ${chipClass} ${
              showIconBackground && iconSurfaceStyle ? '' : showIconBackground ? 'rounded-full' : ''
            }`}
            style={{
              ...(showIconBackground ? iconSurfaceStyle : undefined),
              width: box,
              height: box,
              padding,
              margin,
              boxSizing: 'border-box',
            }}
          >
            <CreatorToolLogo
              label={tool}
              size={size}
              className="rounded-full !bg-transparent"
              brandColor={brandHex ?? undefined}
              bgColor={contrastBg}
            />
          </div>
        );
      })}
    </div>
  );
}

function heroToolsCardInk(background: string): { strong: string; muted: string } {
  const raw = background.replace('#', '').trim();
  const full = raw.length === 3 ? raw.split('').map((value) => value + value).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return { strong: '#171717', muted: '#525252' };
  }
  const channels = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  const luminance = 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  return luminance < 0.42
    ? { strong: '#ffffff', muted: '#d4d4d4' }
    : { strong: '#171717', muted: '#525252' };
}

export function HeroToolsCards({
  tools,
  design,
  presentation,
}: {
  tools: PortfolioSkillRef[];
  design: Exclude<PortfolioHeroPresentationSettings['toolsDisplayDesign'], 'icons'>;
  presentation: PortfolioHeroPresentationSettings;
}) {
  const seen = new Set<string>();
  const items = tools.filter((tool) => {
    const name = resolveSkillName(tool).trim();
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  }).slice(0, presentation.toolsCardsLimit ?? 4);
  if (items.length === 0) return null;

  const palette = mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.palette);
  const bindings = mergeHeroColorBindings(DEFAULT_HERO_COLOR_BINDINGS, presentation.colorBindings);
  const paletteColor = (slot: keyof typeof bindings) =>
    resolveHeroPaletteColor(palette, bindings[slot]);
  const paletteEnabled = presentation.useHeroPalette !== false;
  const background = presentation.toolsCardBackgroundEnabled
    ? paletteEnabled
      ? paletteColor('toolsCardBackground')
      : presentation.toolsCardBackgroundColor
    : 'transparent';
  const borderColor = paletteEnabled
    ? paletteColor('toolsCardBorder')
    : presentation.toolsCardBorderColor;
  const elementStyles = normalizeHeroElementStyles(presentation.elementStyles, presentation);
  const ink = presentation.toolsCardBackgroundEnabled
    ? heroToolsCardInk(background)
    : {
        strong: elementStyles.toolsLabel.color || elementStyles.headline.color || '#171717',
        muted: elementStyles.description.color || '#525252',
      };
  const cardsPerRow = presentation.toolsCardsPerRow ?? 2;
  const effectiveColumns = Math.min(cardsPerRow, items.length);
  const cardWidth = presentation.toolsCardWidthPx ?? 260;
  const cardGap = presentation.toolsCardGapPx ?? 16;
  const contentAlignment = presentation.toolsCardContentAlignment ?? 'center';
  const alignmentClass =
    contentAlignment === 'left'
      ? 'items-start text-left'
      : contentAlignment === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';
  const iconPlacement = presentation.toolsCardIconPlacement ?? 'top';
  const directionClass =
    iconPlacement === 'left'
      ? 'flex-row'
      : iconPlacement === 'right'
        ? 'flex-row-reverse'
        : 'flex-col';
  const headerJustifyClass =
    contentAlignment === 'left'
      ? 'justify-start'
      : contentAlignment === 'right'
        ? 'justify-end'
        : 'justify-center';
  const iconSize = design === 'large-cards' ? 48 : 36;
  const titleColor = paletteEnabled ? paletteColor('toolsCardTitle') : ink.strong;
  const descriptionColor = paletteEnabled ? paletteColor('toolsCardDescription') : ink.muted;
  const levelColor = paletteEnabled ? paletteColor('toolsCardLevel') : ink.muted;
  const titleTypographyClass = elementTextStyleClass(elementStyles.toolsCardTitle, 'body');
  const descriptionTypographyClass = elementTextStyleClass(
    elementStyles.toolsCardDescription,
    'body'
  );
  const levelTypographyClass = elementTextStyleClass(elementStyles.toolsCardLevel, 'label');
  const titleTypographyStyle = {
    ...elementTextInlineStyle(elementStyles.toolsCardTitle),
    color: titleColor,
  };
  const descriptionTypographyStyle = {
    ...elementTextInlineStyle(elementStyles.toolsCardDescription),
    color: descriptionColor,
  };
  const levelTypographyStyle = {
    ...elementTextInlineStyle(elementStyles.toolsCardLevel),
    color: levelColor,
  };

  return (
    <div
      className="mx-auto grid w-full"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${cardWidth}px), 1fr))`,
        maxWidth: cardWidth * effectiveColumns + cardGap * Math.max(0, effectiveColumns - 1),
        gap: cardGap,
        marginTop: presentation.toolsCardMarginTopPx,
        marginBottom: presentation.toolsCardMarginBottomPx,
      }}
      data-hero-tools-cards={design}
    >
      {items.map((tool) => {
        const name = resolveSkillName(tool).trim();
        const description = resolveSkillDescription(tool).trim();
        const level = resolveSkillLevelLabel(tool).trim();
        const brandHex = resolveCreatorToolLogoHex(name);
        return (
          <article
            key={name}
            className={`flex min-w-0 flex-col justify-center overflow-hidden ${alignmentClass}`}
            style={{
              gap: presentation.toolsCardContentGapPx ?? 12,
              minHeight: presentation.toolsCardMinHeightPx ?? 208,
              padding: presentation.toolsCardPaddingPx ?? 24,
              backgroundColor: background,
              borderStyle: presentation.toolsCardBorderEnabled ? 'solid' : 'none',
              borderColor,
              borderWidth: presentation.toolsCardBorderEnabled
                ? presentation.toolsCardBorderWidthPx
                : 0,
              borderRadius: presentation.toolsCardRadiusPx,
            }}
          >
            {presentation.toolsCardShowIcon || presentation.toolsCardShowTitle ? (
              <div
                className={`flex min-w-0 w-full ${directionClass} ${
                  iconPlacement === 'top'
                    ? alignmentClass
                    : `items-center ${headerJustifyClass}`
                }`}
                style={{ gap: presentation.toolsCardContentGapPx ?? 12 }}
              >
                {presentation.toolsCardShowIcon ? (
                  <div className="shrink-0" aria-hidden>
                    <CreatorToolLogo
                      label={name}
                      size={iconSize}
                      className="rounded-xl !bg-transparent"
                      brandColor={brandHex ?? undefined}
                      bgColor={presentation.toolsCardBackgroundEnabled ? background : undefined}
                    />
                  </div>
                ) : null}
                {presentation.toolsCardShowTitle ? (
                  <h3
                    className={`min-w-0 break-words ${titleTypographyClass}`}
                    style={titleTypographyStyle}
                  >
                    {name}
                  </h3>
                ) : null}
              </div>
            ) : null}
            {presentation.toolsCardShowDescription && description ? (
              <p
                className={`w-full break-words ${descriptionTypographyClass}`}
                style={descriptionTypographyStyle}
              >
                {description}
              </p>
            ) : null}
            {presentation.toolsCardShowLevel && level ? (
              <p
                className={`w-full break-words ${levelTypographyClass}`}
                style={levelTypographyStyle}
              >
                {level}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function HeroMetaIcon({
  type,
  accentColor,
  visible,
}: {
  type: 'years' | 'projects' | 'location';
  accentColor: string;
  visible: boolean;
}) {
  if (!visible) return null;

  const className = `${
    type === 'location' ? 'h-6 w-6' : 'h-5 w-5'
  } text-orange-500 dark:text-orange-400`;
  const style = metaCardIconStyle(accentColor);

  if (type === 'years') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    );
  }

  if (type === 'projects') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z"
        />
      </svg>
    );
  }

  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

/** locationLabel is stored as "city, country". */
function formatLocationDisplay(
  label: string,
  content: PortfolioHeroMetaSettings['metaLocationContent']
): string {
  return formatMetaLocationDisplay(label, content);
}

function HeroProfileMetaItem({
  item,
  meta,
  showStraddleHighlight = false,
  /** Physical card chrome (frame / bottom bar). Defaults to `item` when not interchanging. */
  slot,
}: {
  item: HeroMetaItem;
  meta: PortfolioHeroPresentationSettings;
  showStraddleHighlight?: boolean;
  slot?: HeroMetaItem;
}) {
  const reduceMotion = useReducedMotion();
  const interchangeFade =
    meta.metaValueInterchangeEnabled === true && !reduceMotion;
  const chrome = slot ?? item;
  const isLocation = item.icon === 'location';
  const locationShape = isLocation ? resolveMetaCardFrameShape(meta, 'location') : null;
  const locationCompact = isLocation && locationShape === 'circle';
  const elementStyles = normalizeHeroElementStyles(meta.elementStyles, meta);
  const contentCardId = item.icon as PortfolioHeroMetaCardId;
  const chromeCardId = chrome.icon as PortfolioHeroMetaCardId;
  const cardAccent = resolveMetaCardAccentColor(meta, contentCardId);
  const valueSizeClass = metaValueSizeClass(
    meta.metaValueSize,
    isLocation,
    /* keep location type scale even in a round chip */
    false
  );
  const valueFormatClass = elementTextStyleClass(elementStyles.metaValue, 'body')
    .split(' ')
    .filter((token) => !token.startsWith('text-') && !token.startsWith('sm:text-'))
    .join(' ');
  const valueClass = `${valueSizeClass} ${valueFormatClass}`.trim();
  const labelClass = elementTextStyleClass(elementStyles.metaLabel, 'label');
  const valueStyle = {
    ...elementTextInlineStyle(elementStyles.metaValue),
    ...(meta.metaValueUsesCardAccent !== false ? { color: cardAccent } : null),
  };
  const labelStyle = elementTextInlineStyle(elementStyles.metaLabel);

  const icon = (
    <HeroMetaIcon
      type={item.icon}
      accentColor={cardAccent}
      visible={resolveShowMetaCardIcon(meta, contentCardId)}
    />
  );

  const locationText = isLocation
    ? formatLocationDisplay(item.value, meta.metaLocationContent)
    : item.value;

  const valueNode = isLocation ? (
    <p
      className={`relative font-bold ${locationCompact ? 'max-w-[4.5rem] break-words px-0.5 sm:max-w-[5.25rem]' : 'max-w-[8.5rem] sm:max-w-[9.5rem]'} ${valueClass}`}
      style={valueStyle}
      title={item.value}
    >
      {locationText}
    </p>
  ) : (
    <p className={`relative font-bold ${valueClass}`} style={valueStyle}>
      {item.value}
    </p>
  );

  const labelNode =
    meta.metaShowLabels && !isLocation ? (
      <p className={`relative mt-0.5 ${labelClass}`} style={labelStyle}>
        {item.label}
      </p>
    ) : null;

  const innerClass = metaCardInnerClass(meta.metaInnerLayout);

  const content = (() => {
    switch (meta.metaInnerLayout) {
      case 'inline':
        return (
          <>
            {icon}
            <div className="min-w-0">
              {valueNode}
              {labelNode}
            </div>
          </>
        );
      case 'value-first':
        return (
          <>
            {valueNode}
            {labelNode}
            {icon}
          </>
        );
      case 'icon-bottom':
        return (
          <>
            {valueNode}
            {labelNode}
            <div className="mt-0.5">{icon}</div>
          </>
        );
      default:
        return (
          <>
            {icon}
            <div className={isLocation ? 'mt-1.5' : 'mt-1'}>{valueNode}</div>
            {labelNode}
          </>
        );
    }
  })();

  const barStyle = metaCardBottomBarStyle(meta, chromeCardId);

  return (
    <div
      className={metaCardShellClass(meta, chrome.icon)}
      style={metaCardBorderStyle(meta)}
      data-meta-slot={chrome.id}
    >
      {showStraddleHighlight && meta.showMetaFrame && meta.metaDisplayDesign === 'elevated' ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-neutral-400/[0.07]"
        />
      ) : null}
      {interchangeFade ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className={`relative ${innerClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={META_VALUE_FADE}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className={`relative ${innerClass}`}>{content}</div>
      )}
      {barStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-1.5 left-1/2 z-[1] -translate-x-1/2"
          style={barStyle}
        />
      ) : null}
    </div>
  );
}

function buildHeroMetaItems(
  yearsOfExperience: number | null | undefined,
  workCount: number | undefined,
  locationLabel: string | null | undefined,
  meta: PortfolioHeroMetaSettings
): HeroMetaItem[] {
  if (meta.showStats === false) return [];
  return [
    yearsOfExperience != null && yearsOfExperience > 0 && meta.showYearsCard
      ? { id: 'years', value: `${yearsOfExperience}+`, label: 'Years exp.', icon: 'years' as const }
      : null,
    workCount != null && workCount > 0 && meta.showProjectsCard
      ? { id: 'projects', value: String(workCount), label: 'Projects', icon: 'projects' as const }
      : null,
    locationLabel?.trim() && meta.showLocationCard
      ? { id: 'location', value: locationLabel.trim(), label: 'Location', icon: 'location' as const }
      : null,
  ].filter((item): item is HeroMetaItem => item != null);
}

/**
 * Keep the horizontal stat row on ONE line: when the configured gap would
 * overflow the container, shrink the gap to what actually fits (never wrap).
 * Skips hidden (0-width) containers so they don't clamp the gap to 0/min.
 */
function useFittedMetaRowGap(
  configuredGapPx: number,
  itemCount: number,
  enabled: boolean
): { ref: RefObject<HTMLDivElement | null>; gapPx: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [gapPx, setGapPx] = useState(configuredGapPx);

  useEffect(() => {
    if (!enabled || itemCount < 2) {
      setGapPx(configuredGapPx);
      return;
    }
    const el = ref.current;
    if (!el) {
      setGapPx(configuredGapPx);
      return;
    }

    /** Prefer the grid/half cell (fixed width), never the stack (grows with content). */
    const resolveContainer = () =>
      el.closest('[data-hero-stats-cell]') ??
      el.closest('[data-hero-visual-half]') ??
      el.parentElement;

    const fit = () => {
      const container = resolveContainer();
      if (!container) {
        setGapPx(configuredGapPx);
        return;
      }
      const containerWidth = container.clientWidth;
      // Hidden / not laid out yet — keep the configured gap, don't clamp.
      if (containerWidth <= 0) return;

      const children = Array.from(el.children) as HTMLElement[];
      if (children.length < 2) {
        setGapPx(configuredGapPx);
        return;
      }
      const cardsWidth = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
      const available = containerWidth - cardsWidth;
      const maxFit = Math.floor(available / (children.length - 1));
      const next = Math.max(0, Math.min(configuredGapPx, maxFit));
      setGapPx((prev) => (prev === next ? prev : next));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    const container = resolveContainer();
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [configuredGapPx, itemCount, enabled]);

  return { ref, gapPx: enabled ? gapPx : configuredGapPx };
}

function metaRowGapClass(spread: PortfolioHeroMetaSettings['metaSpread']): string {
  switch (spread) {
    case 'compact':
      return 'gap-5 sm:gap-6';
    case 'wide':
      return 'gap-10 sm:gap-12';
    default:
      return 'gap-7 sm:gap-9';
  }
}

export function HeroProfileMeta({
  yearsOfExperience,
  workCount,
  locationLabel,
  className = '',
  spread = false,
  editorial = false,
  elevated = false,
  straddle = false,
  meta,
}: {
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  className?: string;
  spread?: boolean;
  editorial?: boolean;
  elevated?: boolean;
  straddle?: boolean;
  motifLayout?: PortfolioHeroMotifLayout;
  meta: PortfolioHeroPresentationSettings;
}) {
  const slots = buildHeroMetaItems(yearsOfExperience, workCount, locationLabel, meta);
  const items = useHeroMetaInterchangeItems(
    slots,
    meta.metaValueInterchangeEnabled === true,
    meta.metaValueInterchangeSeconds ?? 5
  );
  const verticalCards = resolveMetaCardsOrientation(meta) === 'vertical';
  const fillWidth = !verticalCards && resolveMetaCardsFillWidth(meta);
  const straddleMode =
    straddle &&
    elevated &&
    editorial &&
    (meta.metaPlacementMode === 'straddle-bottom' ||
      meta.metaPlacementMode === 'on-motif' ||
      meta.metaPlacementMode === 'free');
  // Fit gap for every single-line row — including vertical orientation on mobile
  // (which forces a horizontal row below xl).
  const fitted = useFittedMetaRowGap(
    resolveMetaCardGapPx(meta),
    slots.length,
    !spread && !straddleMode && !fillWidth
  );

  if (slots.length === 0) return null;

  if (straddle && elevated && editorial && meta.metaPlacementMode === 'straddle-bottom') {
    const anchors = resolveMetaCardAnchors(slots.length, meta.metaPosition.x, meta.metaSpread);
    const rowTop = `${meta.metaPosition.y}%`;

    return (
      <>
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${className}`.trim()}
            style={{ left: `${anchors[index]}%`, top: rowTop }}
          >
            <HeroProfileMetaItem
              slot={slot}
              item={items[index] ?? slot}
              meta={meta}
              showStraddleHighlight
            />
          </div>
        ))}
      </>
    );
  }

  // on-motif + free: one even row (keeps all circles together on the motif panel).
  // Vertical orientation stacks on xl+ only — mobile stays a single aligned horizontal row.
  if (
    straddle &&
    elevated &&
    editorial &&
    (meta.metaPlacementMode === 'on-motif' || meta.metaPlacementMode === 'free')
  ) {
    return (
      <div
        className={`pointer-events-auto absolute flex ${
          resolveMetaCardsOrientation(meta) === 'vertical'
            ? 'flex-row flex-nowrap items-center justify-center xl:flex-col xl:items-start xl:justify-start'
            : 'flex-row flex-nowrap items-center'
        } ${className}`.trim()}
        style={{
          ...metaRowPositionStyle(meta.metaPosition),
          gap: `${resolveMetaCardGapPx(meta)}px`,
        }}
        data-hero-meta-row={
          resolveMetaCardsOrientation(meta) === 'vertical' ? 'vertical' : 'horizontal'
        }
      >
        {slots.map((slot, index) => (
          <HeroProfileMetaItem
            key={slot.id}
            slot={slot}
            item={items[index] ?? slot}
            meta={meta}
          />
        ))}
      </div>
    );
  }

  const autoSpread = spread || fillWidth;

  return (
    <div
      ref={fitted.ref}
      className={`flex min-w-0 max-w-full flex-nowrap ${
        verticalCards
          ? 'flex-row items-center justify-center xl:flex-col xl:items-start xl:justify-start'
          : `items-center ${autoSpread ? 'w-full justify-between' : ''}`
      } ${className}`.trim()}
      style={
        autoSpread && !verticalCards
          ? undefined
          : { gap: `${fitted.gapPx}px` }
      }
      data-hero-meta-row={verticalCards ? 'vertical' : fillWidth ? 'fill' : 'horizontal'}
      data-hero-meta-gap={fillWidth ? 'auto' : fitted.gapPx}
    >
      {slots.map((slot, index) => (
        <HeroProfileMetaItem
          key={slot.id}
          slot={slot}
          item={items[index] ?? slot}
          meta={meta}
        />
      ))}
    </div>
  );
}

export function HeroSocialGrid({
  links,
  themeId = 'editorial',
}: {
  links: PortfolioHeroData['socialLinks'];
  themeId?: PortfolioThemeId;
}) {
  if (links.length === 0) return null;

  const brandClass = isNoirPortfolioTheme(themeId)
    ? portfolioMonochromeSocialBrandClass
    : socialPlatformBrandClass;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {links.slice(0, 6).map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          title={link.label}
          aria-label={link.label}
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-700 ${brandClass(link.platform)}`}
        >
          <SocialPlatformIcon platform={link.platform} className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}

export function HeroSideNav({ items }: { items: PortfolioHeroData['navItems'] }) {
  if (items.length <= 1) return null;

  return (
    <nav className="hidden flex-col gap-3 xl:flex" aria-label="Accès rapide">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 transition hover:text-orange-600"
        >
          <span className="h-px w-6 bg-neutral-300 transition group-hover:w-10 group-hover:bg-orange-500" />
          {item.label}
        </a>
      ))}
    </nav>
  );
}
