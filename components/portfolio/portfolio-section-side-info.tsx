'use client';

/**
 * Info section side panel, its heading and stat grid.
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import { Fragment, type ReactNode } from 'react';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import {
  listMarkerStrokeWidth,
  listMarkerFontWeightFromAmount,
  resolveListMarkerSizePx,
  resolveListMarkerWeightAmount,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import {
  DEFAULT_ABOUT_PRESENTATION,
  aboutAccentColor,
  aboutStatFontStyle,
  aboutStatLabelColorStyle,
  aboutStatValueColorStyle,
  aboutSidePanelShellClass,
  aboutSidePanelAutoCenterClass,
  aboutSidePanelAccentSoftBackground,
  aboutSidePanelCardBackgroundSettings,
  aboutSidePanelContentGapStyle,
  aboutSidePanelDividerColor,
  aboutSidePanelFrameClass,
  aboutSidePanelFrameStyle,
  aboutSidePanelFullWidthLayoutClass,
  aboutSidePanelInfoBarLayoutClass,
  aboutSidePanelItemCellClass,
  aboutPalettePrincipalColor,
  aboutSidePanelMicroLabelColor,
  aboutStatsAutoCenterClass,
  aboutStatCardFrameClass,
  aboutStatCardFrameStyle,
  aboutStatEditorialSuffix,
  aboutStatsGapStyle,
  aboutStatFontClass,
  aboutStatIconColorStyle,
  aboutStatIconSizeClass,
  aboutStatLabelSizeClass,
  aboutStatLabelTrackingClass,
  aboutStatLabelWeightClass,
  aboutStatValueSizeClass,
  aboutStatValueWeightClass,
  sidePanelHeadingClass,
  sidePanelHeadingStyle,
  resolveSidePanelHeading,
  formatWhyMeIndexLabel,
  resolveSidePanelMarkerColor,
  ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX,
  sidePanelIconPlacementClass,
  isAboutRatingStat,
  type AboutStatValueSizeContext,
  type PortfolioAboutLayoutMode,
  type PortfolioAboutPresentationSettings,
  type PortfolioAboutSidePanelIconPlacement,
  type PortfolioAboutWhyMeMarkerSize,
  type PortfolioAboutWhyMeMarkerStyle,
} from '@/components/portfolio/portfolio-about-settings';
import { elementTextInlineStyle, elementTextStyleClass } from '@/components/portfolio/portfolio-element-text-style';
import { ServicesCardBackgroundLayers, ServicesCardForeground } from '@/components/portfolio/portfolio-services-card-background-layers';
import { useT } from '@/lib/i18n/I18nProvider';

function WhyMeHyperBulletGlyph({
  style,
  className = '',
  strokeWidth = 1.75,
}: {
  style: PortfolioAboutWhyMeMarkerStyle;
  className?: string;
  strokeWidth?: number;
}) {
  const cn = `shrink-0 ${className}`.trim();
  const sw = strokeWidth;
  switch (style) {
    case 'disc':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <circle cx="10" cy="10" r={sw >= 2.4 ? 6 : sw >= 2 ? 5.75 : 5.5} />
        </svg>
      );
    case 'bar-dot':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect
            x={sw >= 2.4 ? 5.5 : 6.5}
            y="2.5"
            width={sw >= 2.4 ? 9 : 7}
            height="15"
            rx="1.5"
            fill="currentColor"
          />
          <circle cx="10" cy="10" r={sw >= 2 ? 2.25 : 2} fill="white" />
        </svg>
      );
    case 'bullseye':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={sw} />
          <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth={Math.max(1, sw - 0.2)} />
          <circle cx="10" cy="10" r={sw >= 2.4 ? 1.7 : 1.4} fill="currentColor" />
        </svg>
      );
    case 'square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
    case 'check-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7 10.2l2.1 2.1 3.9-4.2"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'x-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7.5 7.5l5 5M12.5 7.5l-5 5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'check':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4.5 10.5l3.6 3.6 7.4-8"
            stroke="currentColor"
            strokeWidth={Math.max(1.5, sw + 0.25)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'arrow':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3.5 10h12M11.5 5.5L16.5 10l-5 4.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7.5 4.5L13 10l-5.5 5.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron-double':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5.5 4.5L11 10l-5.5 5.5M10 4.5L15.5 10 10 15.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          {/* Optically centered play-triangle — tip aims at mid text line */}
          <path d="M7 4.25v11.5L16.25 10 7 4.25z" />
        </svg>
      );
    default:
      return null;
  }
}

function WhyMeIndexMarker({
  index,
  style,
  accent,
  size = 'lg',
  sizePx,
  weight = 'regular',
  weightAmount,
  className = '',
  /** Beside body text — keeps first-line centering, uses a real S→XL scale. */
  inline = false,
}: {
  index: number;
  style: PortfolioAboutWhyMeMarkerStyle;
  accent: string;
  size?: PortfolioAboutWhyMeMarkerSize;
  sizePx?: number;
  weight?: PortfolioListMarkerWeight;
  weightAmount?: number;
  className?: string;
  inline?: boolean;
}) {
  if (style === 'none') return null;

  const px = resolveListMarkerSizePx(size, sizePx, ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX);
  const amount = resolveListMarkerWeightAmount(weight, weightAmount);
  const label = formatWhyMeIndexLabel(index, style);
  if (label) {
    return (
      <span
        className={`shrink-0 tabular-nums leading-none tracking-[-0.03em] ${
          inline ? '' : size === 'sm' ? 'uppercase tracking-[0.18em]' : ''
        } ${className}`.trim()}
        style={{
          color: accent,
          opacity: size === 'sm' ? 1 : 0.9,
          fontSize: px,
          fontWeight: listMarkerFontWeightFromAmount(amount),
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`.trim()}
      style={{ color: accent, width: px, height: px }}
    >
      <WhyMeHyperBulletGlyph
        style={style}
        className="h-full w-full"
        strokeWidth={listMarkerStrokeWidth(weight, amount)}
      />
    </span>
  );
}

/** First-line alignment slot — glyph may be larger than the line and still stay centered on it. */
function WhyMeInlineMarkerSlot({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[1lh] min-h-[1.15em] shrink-0 items-center justify-center self-start overflow-visible leading-none ${className}`.trim()}
      aria-hidden
    >
      {children}
    </span>
  );
}


/** Infos column heading — independent title from About / Why choose me. */
export function EditorialSideInfoHeading({
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  presentation?: PortfolioAboutPresentationSettings;
}) {
  if (presentation.showSidePanelHeading === false) return null;

  return (
    <h3 className={`mb-5 ${sidePanelHeadingClass()}`} style={sidePanelHeadingStyle(presentation)}>
      {resolveSidePanelHeading(presentation)}
    </h3>
  );
}


function AboutStatCalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function AboutStatFolderIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 7h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function AboutStatGlobeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 2.5 16.2 0 18M12 3c-2.5 2.8-2.5 16.2 0 18" />
    </svg>
  );
}

function AboutStatStarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 3.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 15.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77L12 3.5z" />
    </svg>
  );
}

function AboutStatEditorialIcon({
  label,
  iconStyle,
  iconSizeClass,
}: {
  label: string;
  iconStyle: React.CSSProperties;
  iconSizeClass: string;
}) {
  const iconClass = `${iconSizeClass} shrink-0`;
  if (isAboutRatingStat(label)) return <AboutStatStarIcon className={iconClass} style={iconStyle} />;
  switch (label.toLowerCase()) {
    case 'content':
    case 'projects':
      return <AboutStatFolderIcon className={iconClass} style={iconStyle} />;
    case 'languages':
      return <AboutStatGlobeIcon className={iconClass} style={iconStyle} />;
    default:
      return <AboutStatCalendarIcon className={iconClass} style={iconStyle} />;
  }
}

function getAboutStatTypography(presentation: PortfolioAboutPresentationSettings, accent: string) {
  const labelClass = [
    aboutStatLabelSizeClass(presentation.statsLabelSize),
    aboutStatLabelWeightClass(presentation.statsLabelWeight),
    aboutStatLabelTrackingClass(presentation.statsLabelTracking),
    aboutStatFontClass(presentation.statsLabelFont, 'label'),
    presentation.statsLabelUppercase ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelStyle = {
    ...aboutStatLabelColorStyle(presentation.statsLabelColor),
    ...aboutStatFontStyle(presentation.statsLabelFont),
  };

  const iconStyle = aboutStatIconColorStyle(presentation.statsIconColor);
  const iconSizeClass = aboutStatIconSizeClass(presentation.statsIconSize);

  return {
    labelClass,
    labelStyle,
    iconStyle,
    iconSizeClass,
    valueClass: (context: AboutStatValueSizeContext) =>
      [
        aboutStatValueSizeClass(presentation.statsValueSize, context),
        aboutStatValueWeightClass(presentation.statsValueWeight),
        aboutStatFontClass(presentation.statsValueFont, 'value'),
      ].join(' '),
    valueStyle: (statLabel: string) => ({
      ...aboutStatValueColorStyle(presentation, statLabel, accent),
      ...aboutStatFontStyle(presentation.statsValueFont),
    }),
  };
}

function AboutStatCardShell({
  presentation,
  className = '',
  contentClassName = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  contentClassName?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutStatCardFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutStatCardFrameStyle(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground className={contentClassName}>{children}</ServicesCardForeground>
    </div>
  );
}

function AboutUnifiedBandStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const t = useT();
  const typography = getAboutStatTypography(presentation, accent);
  const gapPx =
    presentation.statsGroupMode === 'unified'
      ? Math.max(12, presentation.statsGap)
      : Math.max(16, presentation.statsGap);
  const gapStyle = aboutStatsGapStyle(gapPx);
  const centerClass = aboutStatsAutoCenterClass(presentation.statsAutoCenter);

  // Always separate cards with gap — no shared bar / vertical dividers.
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 ${centerClass} ${
        presentation.statsAutoCenter ? 'justify-items-center' : ''
      }`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index} className="h-full">
          <AboutStatCardShell
            presentation={presentation}
            className={presentation.statsAutoCenter ? 'w-full min-w-0 max-w-[12rem]' : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <p className={typography.valueClass('band')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </p>
              <p className={`mt-2 ${typography.labelClass}`} style={typography.labelStyle}>
                {t(stat.label)}
              </p>
            </div>
          </AboutStatCardShell>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function AboutFeaturedStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const t = useT();
  const featured = stats.find((stat) => isAboutRatingStat(stat.label)) ?? stats[0];
  const secondary = stats.filter((stat) => stat !== featured);
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);
  const centerClass = presentation.statsAutoCenter ? 'justify-center' : '';

  return (
    <div className={`grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] ${centerClass} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`} style={gapStyle}>
      <PortfolioMotionItem profile={motionProfile} index={0}>
        <AboutStatCardShell presentation={presentation}>
          <div className="flex items-start gap-3">
            <p className={typography.valueClass('featured')} style={typography.valueStyle(featured.label)}>
              {featured.value}
            </p>
            {isAboutRatingStat(featured.label) ? (
              <AboutStatStarIcon
                className={`${typography.iconSizeClass} mt-2 shrink-0`}
                style={typography.iconStyle}
              />
            ) : null}
          </div>
          <p className={`mt-5 ${typography.labelClass}`} style={typography.labelStyle}>
            {isAboutRatingStat(featured.label) ? t('Note moyenne des clients') : featured.label}
          </p>
        </AboutStatCardShell>
      </PortfolioMotionItem>
      <div className="flex flex-col" style={gapStyle}>
        {secondary.map((stat, index) => (
          <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index + 1}>
            <AboutStatCardShell presentation={presentation}>
              <div className="flex items-center justify-between gap-4">
                <span className={typography.labelClass} style={typography.labelStyle}>
                  {t(stat.label)}
                </span>
                <span className={typography.valueClass('bar')} style={typography.valueStyle(stat.label)}>
                  {stat.value}
                </span>
              </div>
            </AboutStatCardShell>
          </PortfolioMotionItem>
        ))}
      </div>
    </div>
  );
}

function AboutEditorialListStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const t = useT();
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);

  return (
    <div
      className={`flex flex-wrap ${presentation.statsAutoCenter ? 'justify-center' : ''} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index}>
          <div className="flex items-center gap-3">
            <AboutStatCardShell
              presentation={presentation}
              includePadding={false}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <AboutStatEditorialIcon
                label={t(stat.label)}
                iconStyle={typography.iconStyle}
                iconSizeClass={typography.iconSizeClass}
              />
            </AboutStatCardShell>
            <p>
              <span className={typography.valueClass('editorial')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </span>{' '}
              <span
                className={[
                  aboutStatLabelSizeClass(presentation.statsLabelSize),
                  aboutStatFontClass(presentation.statsLabelFont, 'label'),
                ].join(' ')}
                style={typography.labelStyle}
              >
                {aboutStatEditorialSuffix(stat.label)}
              </span>
            </p>
          </div>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

export function EditorialStatGrid({
  stats,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  presentation?: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  if (stats.length === 0) return null;

  const accent = aboutAccentColor(presentation.accentColor);

  switch (presentation.statsDesign) {
    case 'featured':
      return <AboutFeaturedStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    case 'editorial-list':
      return <AboutEditorialListStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    default:
      return <AboutUnifiedBandStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
  }
}

function SideInfoCard({
  label,
  title,
  subtitle,
  lines,
  dark = false,
  action,
  icon: Icon,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  label: string;
  title: string;
  subtitle?: string;
  lines?: string[];
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutPalettePrincipalColor(presentation);
  // Separate cards stay solid — split/divider chrome belongs on the framed panel.
  const cardPresentation: PortfolioAboutPresentationSettings = {
    ...presentation,
    sidePanelBackgroundFill: 'solid',
    sidePanelDividerEnabled: false,
  };

  return (
    <AboutSidePanelCardShell
      presentation={cardPresentation}
      className="group w-full transition duration-200 hover:shadow-[0_14px_36px_-22px_rgba(0,0,0,0.28)]"
    >
      <SideInfoRow
        label={label}
        title={title}
        subtitle={subtitle}
        lines={lines}
        dark={dark}
        action={action}
        icon={Icon}
        presentation={presentation}
        accent={accent}
        iconPlacement={presentation.sidePanelIconPlacement ?? 'left'}
        showIcon={presentation.sidePanelShowIcons !== false}
      />
    </AboutSidePanelCardShell>
  );
}

function SideInfoRow({
  label,
  title,
  subtitle,
  lines,
  dark = false,
  action,
  icon: Icon,
  plainIcon = false,
  hideLabel = false,
  iconPlacement = 'left',
  iconShape = 'rounded',
  showIcon = true,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  accent: accentProp,
}: {
  label: string;
  title: string;
  subtitle?: string;
  /** When set, show a vertical list instead of (or in place of) a single title line. */
  lines?: string[];
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  plainIcon?: boolean;
  hideLabel?: boolean;
  iconPlacement?: PortfolioAboutSidePanelIconPlacement;
  /** Soft badge shape — circle for info-bar, rounded square for cards. */
  iconShape?: 'rounded' | 'circle';
  showIcon?: boolean;
  presentation?: PortfolioAboutPresentationSettings;
  accent?: string;
}) {
  const accent = accentProp ?? aboutPalettePrincipalColor(presentation);
  const microLabelColor = aboutSidePanelMicroLabelColor(presentation);
  const labelClass = elementTextStyleClass(presentation.elementStyles.sideLabel, 'label');
  const labelStyle = dark
    ? undefined
    : { ...elementTextInlineStyle(presentation.elementStyles.sideLabel), color: microLabelColor };
  const titleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
  const titleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideTitle);
  const subtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
  const subtitleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideSubtitle);
  const listLines = (lines ?? []).map((line) => line.trim()).filter(Boolean);
  const placement = sidePanelIconPlacementClass(showIcon ? iconPlacement : 'left');
  const badgeRadius = iconShape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const iconWrapClass = plainIcon
    ? `shrink-0 transition duration-200 ${dark ? 'text-emerald-400' : ''}`
    : `flex h-11 w-11 shrink-0 items-center justify-center ${badgeRadius} transition duration-200 group-hover:scale-[1.03] ${
        dark ? 'bg-emerald-500/15 text-emerald-400' : ''
      }`;
  const iconWrapStyle = dark
    ? undefined
    : plainIcon
      ? { color: accent }
      : { color: accent, backgroundColor: aboutSidePanelAccentSoftBackground(accent) };

  const iconNode = showIcon ? (
    <div className={`${placement.icon} ${iconWrapClass}`.trim()} data-pf-no-color-transition="" style={iconWrapStyle} aria-hidden>
      <Icon className={plainIcon ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5'} />
    </div>
  ) : null;

  const textNode = (
    <div className={`${placement.text}${!showIcon || plainIcon || iconPlacement === 'top' ? '' : ' pt-0.5'}`}>
      {hideLabel ? null : (
        <p
          className={`leading-snug ${dark ? 'font-bold text-emerald-400' : labelClass}`}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      {listLines.length > 0 ? (
        <ul
          className={`${hideLabel ? '' : 'mt-1.5'} space-y-0.5 ${dark ? 'font-bold text-white' : titleClass}`}
          style={titleStyle}
        >
          {listLines.map((line) => (
            <li key={line} className="leading-snug">
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={`leading-snug ${hideLabel ? '' : 'mt-1.5'} ${dark ? 'font-bold text-white' : titleClass}`}
          style={titleStyle}
        >
          {title}
        </p>
      )}
      {subtitle ? (
        <p className={`mt-1 leading-relaxed ${dark ? 'text-neutral-400' : subtitleClass}`} style={subtitleStyle}>
          {subtitle}
        </p>
      ) : null}
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  );

  if (!showIcon) {
    return <div className="w-full min-w-0">{textNode}</div>;
  }

  return (
    <div className={`${placement.row} w-full`}>
      {iconPlacement === 'top' ? (
        <>
          {iconNode}
          {textNode}
        </>
      ) : iconPlacement === 'right' ? (
        <>
          {textNode}
          {iconNode}
        </>
      ) : (
        <>
          {iconNode}
          {textNode}
        </>
      )}
    </div>
  );
}

type EditorialSideInfoItem = {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  /** Vertical list body (languages, days/hours, …). */
  lines?: string[];
  icon: (props: { className?: string }) => React.ReactNode;
};

/** Single vertical panel for About sidebar details (location, languages, etc.). */
function AboutSidePanelCardShell({
  presentation,
  className = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutSidePanelFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutSidePanelFrameStyle(presentation);
  const background = aboutSidePanelCardBackgroundSettings(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={background} />
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

export function EditorialSideInfoPanel({
  items,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  layoutMode = 'sidebar-right',
}: {
  items: EditorialSideInfoItem[];
  presentation?: PortfolioAboutPresentationSettings;
  layoutMode?: PortfolioAboutLayoutMode;
}) {
  const t = useT();
  if (items.length === 0) return null;

  const isFullWidth = layoutMode === 'full-width';
  const isTwinColumns = layoutMode === 'twin-columns';
  const design = presentation.sidePanelDesign;
  const iconPlacement = presentation.sidePanelIconPlacement ?? 'left';
  const showIcons = presentation.sidePanelShowIcons !== false;
  const itemLayout = isFullWidth ? presentation.sidePanelFullWidthLayout : 'stacked';
  const supportsGap =
    itemLayout !== 'profile-frame' &&
    itemLayout !== 'inline-band' &&
    design !== 'info-bar';
  const layoutClass = aboutSidePanelFullWidthLayoutClass(itemLayout, {
    gapControlled: supportsGap,
  });
  const centerClass = aboutSidePanelAutoCenterClass(presentation.sidePanelAutoCenter, itemLayout);
  // Twin-columns: full width on mobile, hug content width on large screens.
  const twinFitClass = isTwinColumns
    ? 'w-full max-w-full lg:max-w-[20rem] xl:max-w-[22rem]'
    : '';
  const dividerColor = aboutSidePanelDividerColor(presentation);
  const accent = aboutPalettePrincipalColor(presentation);
  const gapStyle = supportsGap
    ? aboutSidePanelContentGapStyle(presentation, {
        minPx:
          itemLayout === 'horizontal' || itemLayout === 'grid-2' || itemLayout === 'grid-3'
            ? 24
            : undefined,
      })
    : undefined;
  const cellClass = aboutSidePanelItemCellClass(itemLayout, design, {
    gapControlled: supportsGap,
  });

  const renderItem = (
    item: EditorialSideInfoItem,
    options?: {
      hideLabel?: boolean;
      plainIcon?: boolean;
      iconShape?: 'rounded' | 'circle';
      cellClassName?: string;
      showIcon?: boolean;
    }
  ) => (
    <div key={item.id} className={options?.cellClassName ?? cellClass}>
      <SideInfoRow
        label={t(item.label)}
        title={t(item.title)}
        subtitle={t(item.subtitle)}
        lines={item.lines}
        icon={item.icon}
        plainIcon={options?.plainIcon ?? true}
        hideLabel={options?.hideLabel ?? true}
        iconPlacement={iconPlacement}
        iconShape={options?.iconShape ?? 'rounded'}
        showIcon={options?.showIcon ?? showIcons}
        presentation={presentation}
        accent={accent}
      />
    </div>
  );

  // Liste à puces — markers like Why me, soft gap only (no vertical dividers / info-bar separators).
  if (design === 'list') {
    const markerStyle = presentation.sidePanelMarkerStyle ?? 'disc';
    const markerSize = presentation.sidePanelMarkerSize ?? 'sm';
    const markerSizePx = presentation.sidePanelMarkerSizePx;
    const markerWeight = presentation.sidePanelMarkerWeight ?? 'regular';
    const markerWeightAmount = presentation.sidePanelMarkerWeightAmount;
    const markerColor = resolveSidePanelMarkerColor(presentation);
    const listGapStyle = aboutSidePanelContentGapStyle(presentation);

    return (
      <div className={`${aboutSidePanelShellClass('list')} ${centerClass} ${twinFitClass}`.trim()}>
        <ul className="flex flex-col" style={listGapStyle} role="list">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${elementTextStyleClass(
                presentation.elementStyles.sideTitle,
                'body'
              )}`}
              style={elementTextInlineStyle(presentation.elementStyles.sideTitle)}
            >
              {markerStyle !== 'none' ? (
                <WhyMeInlineMarkerSlot>
                  <WhyMeIndexMarker
                    index={index}
                    style={markerStyle}
                    accent={markerColor}
                    size={markerSize}
                    sizePx={markerSizePx}
                    weight={markerWeight}
                    weightAmount={markerWeightAmount}
                    inline
                  />
                </WhyMeInlineMarkerSlot>
              ) : null}
              <div className="min-w-0 flex-1">
                <SideInfoRow
                  label={t(item.label)}
                  title={t(item.title)}
                  subtitle={t(item.subtitle)}
                  lines={item.lines}
                  icon={item.icon}
                  plainIcon
                  hideLabel={false}
                  iconPlacement="left"
                  showIcon={false}
                  presentation={presentation}
                  accent={accent}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (design === 'info-bar') {
    const infoCellClass = aboutSidePanelItemCellClass('stacked', 'info-bar', {
      gapControlled: false,
    });
    return (
      <AboutSidePanelCardShell
        presentation={presentation}
        includePadding={false}
        className={`${centerClass} ${twinFitClass}`.trim()}
      >
        <div className={aboutSidePanelInfoBarLayoutClass(items.length)}>
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? (
                <span
                  className="h-px w-full shrink-0 sm:h-auto sm:w-px sm:self-stretch"
                  style={{ backgroundColor: dividerColor }}
                  aria-hidden
                />
              ) : null}
              {renderItem(item, {
                hideLabel: false,
                plainIcon: false,
                iconShape: 'circle',
                cellClassName: infoCellClass,
              })}
            </Fragment>
          ))}
        </div>
      </AboutSidePanelCardShell>
    );
  }

  // Variante 1 — horizontal strip: no heavy white panel, equal columns, icon → label → value.
  if (design === 'info-strip') {
    const colCount = Math.min(Math.max(items.length, 2), 5);
    const stripCols =
      colCount <= 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : colCount === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : colCount === 4
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    const titleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
    const titleStyle = elementTextInlineStyle(presentation.elementStyles.sideTitle);
    const subtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
    const subtitleStyle = elementTextInlineStyle(presentation.elementStyles.sideSubtitle);

    return (
      <div className={`${aboutSidePanelShellClass('info-strip')} ${centerClass}`.trim()}>
        <div className={`grid gap-x-8 gap-y-8 sm:gap-x-10 sm:gap-y-8 ${stripCols}`}>
          {items.map((item) => {
            const listLines = (item.lines ?? []).map((line) => line.trim()).filter(Boolean);
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex min-w-0 flex-col items-start gap-2.5">
                {showIcons ? (
                  <div className="shrink-0" style={{ color: accent }} aria-hidden>
                    <Icon className="h-5 w-5" />
                  </div>
                ) : null}
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
                >
                  {t(item.label)}
                </p>
                {listLines.length > 0 ? (
                  <ul className={`space-y-0.5 ${titleClass}`} style={titleStyle}>
                    {listLines.map((line) => (
                      <li key={line} className="leading-snug">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`leading-snug ${titleClass}`} style={titleStyle}>
                    {t(item.title)}
                  </p>
                )}
                {item.subtitle ? (
                  <p className={`leading-relaxed ${subtitleClass}`} style={subtitleStyle}>
                    {t(item.subtitle)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Variante 2 — CV résumé: optional bio, then equal-width info cards (full bleed, no Gender).
  if (design === 'profile-cv') {
    const bio = (presentation.sidePanelBio ?? '').trim();
    const showBio = presentation.showSidePanelBio !== false && Boolean(bio);
    const badgeTitleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
    const badgeTitleStyle = elementTextInlineStyle(presentation.elementStyles.sideTitle);
    const badgeSubtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
    const badgeSubtitleStyle = elementTextInlineStyle(presentation.elementStyles.sideSubtitle);
    // Drop Gender — keeps a clean 4-up dashboard aligned with Why me above.
    const cvItems = items.filter((item) => item.id !== 'gender').slice(0, 4);
    const colCount = Math.max(1, Math.min(4, cvItems.length));
    const cvGridClass =
      colCount <= 1
        ? 'grid-cols-1'
        : colCount === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : colCount === 3
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
      <div className={`${aboutSidePanelShellClass('profile-cv')} ${centerClass} w-full space-y-6`.trim()}>
        {showBio ? (
          <div className="min-w-0 max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
            >
              {t('Philosophie')}
            </p>
            <p
              className={`mt-3 text-base leading-relaxed sm:text-[1.05rem] sm:leading-relaxed ${elementTextStyleClass(
                presentation.elementStyles.sideSubtitle,
                'body'
              )}`}
              style={elementTextInlineStyle(presentation.elementStyles.sideSubtitle)}
            >
              {bio}
            </p>
          </div>
        ) : null}
        <div className={`grid w-full gap-4 sm:gap-5 ${cvGridClass}`}>
          {cvItems.map((item) => {
            const listLines = (item.lines ?? []).map((line) => line.trim()).filter(Boolean);
            const Icon = item.icon;
            const primary =
              listLines.length > 0
                ? [item.title, ...listLines]
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .join(' · ')
                : item.title;
            return (
              <div
                key={item.id}
                className="flex h-full min-w-0 flex-col items-start gap-3 overflow-hidden rounded-[1.35rem] border border-neutral-200/80 bg-white px-5 py-4 sm:px-5 sm:py-5"
              >
                {showIcons ? (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      color: accent,
                      backgroundColor: aboutSidePanelAccentSoftBackground(accent),
                    }}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null}
                <div className="min-w-0 w-full">
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.16em]"
                    style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
                  >
                    {t(item.label)}
                  </p>
                  <p
                    className={`mt-1.5 break-words leading-snug ${badgeTitleClass}`}
                    style={badgeTitleStyle}
                  >
                    {primary}
                  </p>
                  {item.subtitle ? (
                    <p
                      className={`mt-1 break-words leading-snug ${badgeSubtitleClass}`}
                      style={badgeSubtitleStyle}
                    >
                      {t(item.subtitle)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (design === 'cards') {
    return (
      <div
        className={`${isFullWidth ? layoutClass : aboutSidePanelShellClass('cards')} ${centerClass} ${twinFitClass} ${
          presentation.sidePanelAutoCenter
            ? '[&>*]:w-full [&>*]:max-w-none sm:[&>*]:max-w-md'
            : '[&>*]:w-full'
        }`.trim()}
        style={gapStyle}
      >
        {items.map((item) => (
          <SideInfoCard
            key={item.id}
            label={t(item.label)}
            title={t(item.title)}
            subtitle={t(item.subtitle)}
            lines={item.lines}
            icon={item.icon}
            presentation={presentation}
          />
        ))}
      </div>
    );
  }

  if (design === 'minimal') {
    const minimalStack = itemLayout === 'stacked' || !isFullWidth;
    return (
      <div
        className={`${isFullWidth && !minimalStack ? layoutClass : aboutSidePanelShellClass('minimal')} ${centerClass} ${twinFitClass}`.trim()}
        style={gapStyle}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={aboutSidePanelItemCellClass(itemLayout, 'minimal', {
              gapControlled: supportsGap,
            })}
            style={
              minimalStack && index > 0
                ? { borderTop: `1px solid ${dividerColor}` }
                : undefined
            }
          >
            <SideInfoRow
              label={t(item.label)}
              title={t(item.title)}
              subtitle={t(item.subtitle)}
              lines={item.lines}
              icon={item.icon}
              plainIcon
              hideLabel
              iconPlacement={iconPlacement}
              showIcon={showIcons}
              presentation={presentation}
              accent={accent}
            />
          </div>
        ))}
      </div>
    );
  }

  if (itemLayout === 'profile-frame') {
    const locationItem =
      items.find((item) => item.id === 'location') ?? items[0] ?? null;
    const restItems = items.filter((item) => item.id !== locationItem?.id);
    // Prefer a 2×2 grid on the right; leftover items wrap into another row.
    const rightGridClass =
      restItems.length <= 2
        ? 'grid grid-cols-1 sm:grid-cols-2'
        : 'grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2';
    const frameBorder = { borderColor: dividerColor };

    return (
      <AboutSidePanelCardShell
        presentation={presentation}
        includePadding={false}
        className={`${centerClass} ${twinFitClass}`.trim()}
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(11rem,0.38fr)_minmax(0,0.62fr)]">
          {/* Unequal left rail — location only */}
          <div
            className="flex min-w-0 flex-col justify-center border-b px-5 py-5 sm:px-6 sm:py-6 lg:border-r lg:border-b-0"
            style={frameBorder}
          >
            {locationItem ? renderItem(locationItem) : null}
          </div>
          {/* Right: two rows × two items */}
          <div
            className={`${rightGridClass} divide-y sm:divide-y-0 [&>*]:border-inherit sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)]:border-b`}
            style={frameBorder}
          >
            {restItems.map((item) => renderItem(item))}
          </div>
        </div>
      </AboutSidePanelCardShell>
    );
  }

  const itemList = items.map((item) => renderItem(item));

  return (
    <AboutSidePanelCardShell
      presentation={presentation}
      className={`${centerClass} ${twinFitClass}`.trim()}
    >
      <div className={`${layoutClass} ${centerClass}`} style={gapStyle}>
        {itemList}
      </div>
    </AboutSidePanelCardShell>
  );
}
