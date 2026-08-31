import type { ReactNode } from 'react';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import type {
  PortfolioToolsBrandDirectoryLevelStyle,
  PortfolioToolsLevelBarSize,
  PortfolioToolsLevelBarStyle,
  PortfolioToolsLevelIndicatorDisplayStyle,
  PortfolioToolsPresentationSettings,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  resolveToolsLevelBarStyle,
  resolveToolsLevelBarSize,
  resolveToolsLevelIndicatorDisplayStyle,
  toolsLevelBarHeightClass,
  toolsLevelBarPercentClass,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  resolveSkillLevel,
  resolveSkillLevelLabel,
  resolveSkillName,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import type { ProfileStrengthToolLevel } from '@/types/ecosystem';

const LEVEL_SEGMENT_COUNT: Record<ProfileStrengthToolLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const PROGRESS_BAR_SEGMENT_COUNT = 10;

function resolveProgressBarPercent(
  level: ProfileStrengthToolLevel | null | undefined,
  percent?: number
): number {
  if (percent != null) return percent;
  const filled = resolveLevelSegmentCount(level);
  return filled * 25;
}

function resolveProgressBarFilledSegments(percent: number): number {
  return Math.min(
    PROGRESS_BAR_SEGMENT_COUNT,
    Math.max(0, Math.round(percent / (100 / PROGRESS_BAR_SEGMENT_COUNT)))
  );
}

function progressBarRadiusClass(barStyle: PortfolioToolsLevelBarStyle): string {
  return barStyle === 'rectangle' ? 'rounded-none' : 'rounded-full';
}

function progressBarFillBackground(fillColor: string, barStyle: PortfolioToolsLevelBarStyle): string {
  if (barStyle === 'pill-gradient') {
    return `linear-gradient(90deg, ${fillColor} 0%, color-mix(in srgb, ${fillColor} 30%, transparent) 100%)`;
  }
  return fillColor;
}

export function resolveLevelSegmentCount(level: ProfileStrengthToolLevel | null | undefined): number {
  if (!level) return 0;
  return LEVEL_SEGMENT_COUNT[level] ?? 0;
}

/** Fill = palette « principal » (levelAccent). Track = palette « bordure ». */
export function resolveToolsLevelBarColors(presentation: PortfolioToolsPresentationSettings): {
  fillColor: string;
  trackColor: string;
} {
  return {
    fillColor: presentation.levelAccentColor,
    trackColor: presentation.cardBorderColor,
  };
}

/** Compact 4-notch bar — filled notches share one palette color. */
export function ToolsLevelStatBar({
  level,
  toolName,
  fillColor,
  trackColor,
  className,
}: {
  level: ProfileStrengthToolLevel | null | undefined;
  toolName: string;
  fillColor: string;
  trackColor: string;
  className?: string;
}) {
  const filled = resolveLevelSegmentCount(level);
  if (!level || filled === 0) return null;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={filled}
      aria-label={`${toolName} proficiency`}
      className={`flex w-14 gap-[3px] ${className ?? ''}`}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="h-1.5 flex-1 rounded-[2px] transition-colors duration-200"
          style={{ backgroundColor: index < filled ? fillColor : trackColor }}
        />
      ))}
    </div>
  );
}

/** Circular donut — percentage in the center (brand directory). */
export function ToolsLevelCircularPercent({
  percent,
  fillColor,
  trackColor,
  labelColor,
  size = 56,
  className,
}: {
  percent: number;
  fillColor: string;
  trackColor: string;
  labelColor: string;
  size?: number;
  className?: string;
}) {
  if (percent <= 0) return null;

  const stroke = Math.max(3, Math.round(size * 0.065));
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`${percent}%`}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={fillColor}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center}
        dominantBaseline="middle"
        textAnchor="middle"
        fill={labelColor}
        fontSize={Math.max(11, Math.round(size * 0.24))}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        {percent}%
      </text>
    </svg>
  );
}

/** Four signal dots — alternative level read (brand directory). */
export function ToolsLevelSignalDots({
  level,
  toolName,
  fillColor,
  trackColor,
  className,
}: {
  level: ProfileStrengthToolLevel | null | undefined;
  toolName: string;
  fillColor: string;
  trackColor: string;
  className?: string;
}) {
  const filled = resolveLevelSegmentCount(level);
  if (!level || filled === 0) return null;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={4}
      aria-valuenow={filled}
      aria-label={`${toolName} proficiency`}
      className={`flex items-center gap-1.5 ${className ?? ''}`}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="h-2 w-2 rounded-full transition-colors duration-200"
          style={{ backgroundColor: index < filled ? fillColor : trackColor }}
        />
      ))}
    </div>
  );
}

/** Circular progress ring with centered tool name — no logo, no percentage. */
export function ToolsLevelSvgRingWithLabel({
  label,
  percent,
  fillColor,
  trackColor,
  size = 120,
  className,
}: {
  label: string;
  percent: number;
  fillColor: string;
  trackColor: string;
  size?: number;
  className?: string;
}) {
  const stroke = Math.max(4, Math.round(size * 0.042));
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  const fontSize = Math.max(10, Math.round(size * 0.12));
  const useSmallText = label.length > 12;

  return (
    <div
      className={`relative shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}, ${percent}% proficiency`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {percent > 0 ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-[stroke-dashoffset] duration-500"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center px-2">
        <span
          className={`max-w-full truncate text-center font-semibold leading-tight ${useSmallText ? 'text-xs' : ''}`}
          style={{
            color: fillColor,
            fontSize: useSmallText ? undefined : fontSize,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/** Circular progress ring with a centered logo — no inner square tile. */
export function ToolsLevelCircularRingWithLogo({
  percent,
  fillColor,
  trackColor,
  size = 112,
  logo,
  className,
}: {
  percent: number;
  fillColor: string;
  trackColor: string;
  size?: number;
  logo: ReactNode;
  className?: string;
}) {
  if (percent <= 0) return null;

  const stroke = Math.max(4, Math.round(size * 0.042));
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={`relative shrink-0 ${className ?? ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{logo}</div>
    </div>
  );
}

/** Simple continuous or segmented bar — fill from logo brand, width from level percent. */
export function ToolsLevelProgressBar({
  level,
  toolName,
  fillColor,
  trackColor,
  percent,
  barStyle = 'rectangle',
  barSize = 'small',
  barHeightVariant = 'default',
  className,
}: {
  level: ProfileStrengthToolLevel | null | undefined;
  toolName: string;
  fillColor: string;
  trackColor: string;
  /** Optional override; defaults to 25 / 50 / 75 / 100 from level. */
  percent?: number;
  barStyle?: PortfolioToolsLevelBarStyle;
  barSize?: PortfolioToolsLevelBarSize;
  barHeightVariant?: 'default' | 'thin';
  className?: string;
}) {
  const filled = resolveLevelSegmentCount(level);
  if (!level || filled === 0) return null;

  const widthPercent = resolveProgressBarPercent(level, percent);
  const radiusClass = progressBarRadiusClass(barStyle);
  const heightClass = toolsLevelBarHeightClass(barSize, barHeightVariant);

  if (barStyle === 'segments') {
    const filledSegments = resolveProgressBarFilledSegments(widthPercent);

    return (
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={PROGRESS_BAR_SEGMENT_COUNT}
        aria-valuenow={filledSegments}
        aria-label={`${toolName} proficiency`}
        className={`flex w-full gap-[3px] ${heightClass} ${className ?? ''}`}
      >
        {Array.from({ length: PROGRESS_BAR_SEGMENT_COUNT }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="h-full min-w-0 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: index < filledSegments ? fillColor : trackColor,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={widthPercent}
      aria-label={`${toolName} proficiency`}
      className={`w-full overflow-hidden ${heightClass} ${radiusClass} ${className ?? ''}`}
      style={{ backgroundColor: trackColor }}
    >
      <div
        className={`h-full transition-[width] duration-300 ${radiusClass}`}
        style={{
          width: `${widthPercent}%`,
          background: progressBarFillBackground(fillColor, barStyle),
        }}
      />
    </div>
  );
}

const LEVEL_SEMANTIC_COLORS: Record<ProfileStrengthToolLevel, string> = {
  beginner: '#f87171',
  intermediate: '#fb923c',
  advanced: '#60a5fa',
  expert: '#34d399',
};

export function resolveToolsLevelSemanticColor(
  level: ProfileStrengthToolLevel,
  presentation: Pick<PortfolioToolsPresentationSettings, 'labelColor' | 'activeColorMode'>,
  logosGrayscale: boolean
): string {
  if (logosGrayscale) {
    const label = presentation.labelColor?.trim();
    if (label) return label;
    return presentation.activeColorMode === 'dark' ? '#f5f5f5' : '#171717';
  }
  return LEVEL_SEMANTIC_COLORS[level];
}

export function resolveLevelStarCount(level: ProfileStrengthToolLevel | null | undefined): number {
  const percent = resolveToolLevelPercent(level);
  if (percent >= 100) return 5;
  if (percent >= 75) return 4;
  if (percent >= 50) return 3;
  if (percent >= 25) return 2;
  return 1;
}

export function resolveLevelDotCount(level: ProfileStrengthToolLevel | null | undefined): number {
  const percent = resolveToolLevelPercent(level);
  return Math.min(5, Math.max(1, Math.round(percent / 20)));
}

/** 5-star rating — no text level label. */
export function ToolsLevelStarRating({
  level,
  toolName,
  fillColor,
  trackColor,
  className,
}: {
  level: ProfileStrengthToolLevel | null | undefined;
  toolName: string;
  fillColor: string;
  trackColor: string;
  className?: string;
}) {
  const filled = resolveLevelStarCount(level);
  if (!level || filled === 0) return null;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={filled}
      aria-label={`${toolName} proficiency`}
      className={`flex items-center gap-0.5 text-sm leading-none sm:text-base ${className ?? ''}`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="transition-colors duration-200"
          style={{ color: index < filled ? fillColor : trackColor }}
        >
          {index < filled ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

/** 5 glowing dots — semantic level color, no text label. */
export function ToolsLevelGlowDots({
  level,
  toolName,
  fillColor,
  trackColor,
  className,
}: {
  level: ProfileStrengthToolLevel | null | undefined;
  toolName: string;
  fillColor: string;
  trackColor: string;
  className?: string;
}) {
  const filled = resolveLevelDotCount(level);
  if (!level || filled === 0) return null;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={filled}
      aria-label={`${toolName} proficiency`}
      className={`flex items-center gap-1.5 ${className ?? ''}`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const active = index < filled;
        return (
          <span
            key={index}
            aria-hidden="true"
            className="h-2 w-2 rounded-full transition-all duration-200 sm:h-2.5 sm:w-2.5"
            style={{
              backgroundColor: active ? fillColor : trackColor,
              boxShadow: active ? `0 0 8px ${fillColor}99` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

/** Shared level read for bento / table / list rows — text or visual without labels. */
export function ToolsLevelIndicatorDisplay({
  tool,
  presentation,
  style,
  className,
  showPercent = false,
  layout = 'inline',
  logosGrayscale = false,
  semanticFillColor,
  barColor,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  style?: PortfolioToolsLevelIndicatorDisplayStyle;
  className?: string;
  showPercent?: boolean;
  /** `stacked` places a full-width bar under the name row (bento). */
  layout?: 'inline' | 'stacked';
  logosGrayscale?: boolean;
  semanticFillColor?: string;
  barColor?: string;
}) {
  const level = resolveSkillLevel(tool);
  if (!level) return null;

  const name = resolveSkillName(tool);
  const displayStyle = style ?? resolveToolsLevelIndicatorDisplayStyle(presentation);
  const { fillColor: paletteFill, trackColor } = resolveToolsLevelBarColors(presentation);
  const semanticColor =
    semanticFillColor ??
    resolveToolsLevelSemanticColor(level, presentation, logosGrayscale);
  const percent = resolveToolLevelPercent(level);
  const barStyle = resolveToolsLevelBarStyle(presentation);
  const barSize = resolveToolsLevelBarSize(presentation);
  const progressFill = barColor ?? semanticColor;

  if (displayStyle === 'text') {
    return (
      <span
        className={`text-sm font-medium leading-none sm:text-[0.9375rem] ${className ?? ''}`}
        style={{ color: semanticColor }}
      >
        {resolveSkillLevelLabel(tool)}
      </span>
    );
  }

  if (displayStyle === 'stars') {
    return (
      <ToolsLevelStarRating
        level={level}
        toolName={name}
        fillColor={presentation.levelAccentColor?.trim() || paletteFill}
        trackColor={trackColor}
        className={className}
      />
    );
  }

  if (displayStyle === 'dots') {
    return (
      <ToolsLevelGlowDots
        level={level}
        toolName={name}
        fillColor={semanticColor}
        trackColor={trackColor}
        className={className}
      />
    );
  }

  const bar = (
    <ToolsLevelProgressBar
      level={level}
      toolName={name}
      fillColor={progressFill}
      trackColor={trackColor}
      percent={percent}
      barStyle={barStyle}
      barSize={barSize}
      barHeightVariant={layout === 'stacked' ? 'default' : 'thin'}
      className={layout === 'stacked' ? 'min-w-0 flex-1' : 'w-16 sm:w-20'}
    />
  );

  if (layout === 'stacked') {
    return (
      <div className={`flex w-full min-w-0 items-center gap-3 ${className ?? ''}`}>
        {bar}
        {showPercent ? (
          <span
            className={`shrink-0 font-semibold tabular-nums leading-none ${toolsLevelBarPercentClass(barSize)}`}
            style={{ color: progressFill }}
          >
            {percent}%
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className ?? ''}`}>
      {bar}
      {showPercent ? (
        <span
          className={`font-semibold tabular-nums leading-none ${toolsLevelBarPercentClass(barSize)}`}
          style={{ color: progressFill }}
        >
          {percent}%
        </span>
      ) : null}
    </div>
  );
}

/** Brand directory only — tag, circular %, stat bar, or signal dots. */
export function ToolsBrandDirectoryLevelIndicator({
  tool,
  presentation,
  style,
  compact = false,
}: {
  tool: PortfolioSkillRef;
  presentation: PortfolioToolsPresentationSettings;
  style: PortfolioToolsBrandDirectoryLevelStyle;
  /** Smaller footprint for inline mobile placement. */
  compact?: boolean;
}) {
  const level = resolveSkillLevel(tool);
  const levelLabel = resolveSkillLevelLabel(tool);
  if (!level || !levelLabel) return null;

  const name = resolveSkillName(tool);
  const { fillColor, trackColor } = resolveToolsLevelBarColors(presentation);
  const percent = resolveToolLevelPercent(level);
  const accent = presentation.levelAccentColor;

  if (style === 'percentage') {
    return (
      <ToolsLevelCircularPercent
        percent={percent}
        fillColor={fillColor}
        trackColor={trackColor}
        labelColor={presentation.labelColor}
        size={compact ? 44 : 56}
      />
    );
  }

  if (style === 'stat') {
    const percent = resolveToolLevelPercent(level);
    const barStyle = resolveToolsLevelBarStyle(presentation);
    const barSize = resolveToolsLevelBarSize(presentation);

    return (
      <ToolsLevelProgressBar
        level={level}
        toolName={name}
        fillColor={fillColor}
        trackColor={trackColor}
        percent={percent}
        barStyle={barStyle}
        barSize={barSize}
        className={compact ? 'w-12' : 'w-[4.5rem]'}
      />
    );
  }

  if (style === 'dots') {
    return (
      <ToolsLevelSignalDots
        level={level}
        toolName={name}
        fillColor={fillColor}
        trackColor={trackColor}
      />
    );
  }

  return (
    <span
      className={
        compact
          ? 'inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide'
          : 'inline-flex min-w-[6.5rem] items-center justify-center rounded-full px-3 py-1.5 text-[0.75rem] font-semibold tracking-wide'
      }
      style={{
        color: accent,
        border: compact ? undefined : `1px solid ${accent}33`,
        backgroundColor: `${accent}${compact ? '14' : '0f'}`,
      }}
    >
      {levelLabel}
    </span>
  );
}
