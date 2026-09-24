'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  aboutBannerScrollParent,
  aboutBannerWatchEnter,
} from '@/components/portfolio/portfolio-about-scroll-utils';
import {
  elementTextSizeClass,
  resolveElementTextSizePx,
  resolveElementTextWeightAmount,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import type {
  LanguageProficiencyLevel,
  ProfileEducationEntry,
  ProfileSpokenLanguage,
} from '@/types/ecosystem';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import {
  aboutMeTraitHeadlineSizeClass,
  aboutBannerBioSizeClass,
  aboutBannerContentSizeClass,
  aboutBannerMetaSizeClass,
  aboutPlatformHeadlineSizeClass,
  aboutPlatformLeadSizeClass,
  aboutPlatformSkillsTitleSizeClass,
  aboutPortraitSkillsBioSizeClass,
  aboutPortraitSkillsListSizeClass,
  aboutPortraitSkillsMetaSizeClass,
  aboutPortraitSkillsStrengthsItemSizeClass,
  aboutPortraitSkillsStrengthsTitleSizeClass,
  aboutValueBlockTitleSizeClass,
  aboutValueNumberedGridIndexSizeClass,
  aboutValueStepsDescriptionSizeClass,
  aboutValueStepsItemTitleSizeClass,
  aboutValueStepsLanguageCodeSizeClass,
  aboutValueStepsLanguageLevelSizeClass,
  ABOUT_VALUE_STEPS_SECTION_LABELS,
  infoContentBlockTitleSizeClass,
  infoContentBodySizeClass,
  infoContentEducationMetaSizeClass,
  infoContentLabelSizeClass,
  manifestoStatementSecondarySizeClass,
  resolveAboutValueStepsIntroParagraphs,
  resolveAboutMeTraitHeadlineText,
  resolveAboutBannerSectionLabels,
  resolveAboutPlatformHeadlineText,
  resolveAboutPlatformStrengthsSectionTitle,
  resolveAboutPortraitSkillsMetaEnabled,
  resolveAboutPortraitSkillsMetaLead,
  resolveInfoPremiumFontSize,
  resolveInfoAboutValueValuesLayout,
  resolveInfoAboutValueListMarkerStyle,
  resolveInfoAboutManifestoBlocksLayout,
  resolveInfoAboutManifestoBlocksScrollFocus,
  resolveInfoAboutManifestoStatementStyle,
  resolveInfoAboutManifestoPortraitFrame,
  resolveInfoAboutTerminalColorMode,
  resolveInfoAboutSplitPortraitSide,
  resolveAboutSplitSectionLabels,
  resolveInfoDesign,
  resolveInfoEducationDisplayStyle,
  resolveInfoEducationCascadeScrollShift,
  resolveInfoLanguageLevelDisplayStyle,
  resolveInfoShowEducation,
  resolveInfoShowInterests,
  resolveInfoShowLanguages,
  resolveInfoPortraitGrayscale,
  resolveInfoShowStrengths,
  resolveInfoShowSystemsTools,
  type PortfolioInfoPremiumFontSize,
  type PortfolioInfoAboutValueValuesLayout,
  type PortfolioInfoAboutValueBlocksLayout,
  type PortfolioInfoAboutManifestoBlocksLayout,
  type PortfolioInfoAboutManifestoPortraitFrame,
  type PortfolioInfoAboutSplitPortraitSide,
  type AboutSplitSectionLabels,
  type PortfolioInfoAboutValueListMarkerStyle,
  type PortfolioInfoEducationDisplayStyle,
  type PortfolioInfoLanguageLevelDisplayStyle,
  type PortfolioInfoPresentationSettings,
} from '@/components/portfolio/portfolio-info-settings';
import type { PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import { TraitEducationBlock } from '@/components/portfolio/EditorialAboutMeEducation';
import {
  AboutTerminalLayout,
} from '@/components/portfolio/EditorialAboutMeNoirLayouts';
import { AboutIndexEditorialLayout } from '@/components/portfolio/EditorialAboutMeIndexLayout';
import {
  ToolsLevelGlowDots,
  ToolsLevelProgressBar,
  ToolsLevelStarRating,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import {
  resolveSpokenLanguageLevelLabel,
  resolveSpokenLanguageFlagIso2,
  spokenLanguageMatchKey,
} from '@/lib/spoken-languages';
import {
  resolveAboutSkillEntries,
  skillEntryLabels,
  type ProfileSkillEntry,
} from '@/lib/about-skills';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import type { PortfolioListMarkerStyle } from '@/components/portfolio/portfolio-list-marker';
import { readPortfolioNavTopClearancePx } from '@/components/portfolio/portfolio-nav-top-clearance';

export type EditorialAboutMeSectionProps = {
  title: string;
  subtitle: string;
  bio?: string | null;
  /** Profile specialty — headline on about-split and portrait role line. */
  specialty?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  education?: ProfileEducationEntry[] | null;
  skills?: ProfileSkillEntry[] | null;
  strengths?: string[] | null;
  interests?: string[] | null;
  languages?: ProfileSpokenLanguage[] | null;
  /** Fallback plain languages string when spokenLanguages is empty. */
  languagesFallback?: string | null;
  systemsTools?: string[] | null;
  presentation: PortfolioInfoPresentationSettings;
  heroPalette?: PortfolioHeroPalette;
  /** About · terminal "Always dark" — dark-palette colors for the terminal shell only
   *  (null when the toggle is off or the design isn't about-terminal). */
  terminalDarkColors?: {
    accentColor: string;
    titleColor: string;
    subtitleColor: string;
    bodyColor: string;
    cardBackgroundColor: string;
    cardBorderColor: string;
  } | null;
};

function infoPortraitImageClass(baseClass: string, grayscale: boolean): string {
  return grayscale ? `${baseClass} grayscale` : baseClass;
}

type LanguageDisplayItem = {
  name: string;
  level?: LanguageProficiencyLevel | null;
};

function resolveLanguageItems(
  languages: ProfileSpokenLanguage[] | null | undefined,
  languagesFallback: string | null | undefined
): LanguageDisplayItem[] {
  const fromSpoken: LanguageDisplayItem[] = [];
  for (const entry of languages ?? []) {
    const name = entry.name?.trim() || '';
    if (!name) continue;
    fromSpoken.push({ name, level: entry.level ?? null });
  }
  if (fromSpoken.length > 0) return fromSpoken;
  const fallback = languagesFallback?.trim();
  if (!fallback) return [];
  return fallback
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name, level: null }));
}

function InfoLanguageLevelIndicator({
  name,
  level,
  style,
  accent,
  track,
}: {
  name: string;
  level?: LanguageProficiencyLevel | null;
  style: PortfolioInfoLanguageLevelDisplayStyle;
  accent: string;
  track: string;
}) {
  if (!level) return null;

  if (style === 'text') {
    const label = resolveSpokenLanguageLevelLabel(level);
    if (!label) return null;
    return (
      <span className="text-sm font-medium tabular-nums" style={{ color: accent }}>
        {label}
      </span>
    );
  }

  if (style === 'dots') {
    return (
      <ToolsLevelGlowDots
        level={level}
        toolName={name}
        fillColor={accent}
        trackColor={track}
        className="shrink-0"
      />
    );
  }

  if (style === 'progress-bar') {
    const percent = resolveToolLevelPercent(level);
    return (
      <ToolsLevelProgressBar
        level={level}
        toolName={name}
        fillColor={accent}
        trackColor={track}
        percent={percent}
        barStyle="pill"
        barSize="small"
        className="w-[5.5rem] shrink-0 sm:w-28"
      />
    );
  }

  return (
    <ToolsLevelStarRating
      level={level}
      toolName={name}
      fillColor={accent}
      trackColor={track}
      className="shrink-0"
    />
  );
}

function InfoLanguageList({
  items,
  accent,
  body,
  track,
  levelStyle,
  square = false,
  showMarker = true,
  bodySizeClass,
  className = 'mt-5',
}: {
  items: LanguageDisplayItem[];
  accent: string;
  body: string;
  track: string;
  levelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  square?: boolean;
  showMarker?: boolean;
  bodySizeClass?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={`inline-grid grid-cols-[max-content_auto] items-center gap-x-3 gap-y-3 sm:gap-x-4 ${className}`}>
      {items.map((item) => {
        const flagIso = resolveSpokenLanguageFlagIso2(item.name);
        return (
          <li key={item.name} className="contents">
            <span
              className={`flex items-center gap-2.5 leading-relaxed ${bodySizeClass ?? 'text-[0.95rem]'}`}
              style={{ color: body }}
            >
              {flagIso ? (
                <CountryFlag iso2={flagIso} size="sm" className="mt-0.5 shrink-0" />
              ) : showMarker ? (
                <span
                  aria-hidden
                  className={`mt-0.5 h-1.5 w-1.5 shrink-0 ${square ? 'rounded-none' : 'rounded-full'}`}
                  style={{ backgroundColor: accent }}
                />
              ) : null}
              <span className="whitespace-nowrap">{item.name}</span>
            </span>
            <InfoLanguageLevelIndicator
              name={item.name}
              level={item.level}
              style={levelStyle}
              accent={accent}
              track={track}
            />
          </li>
        );
      })}
    </ul>
  );
}

function InfoBulletList({
  items,
  accent,
  body,
  square = false,
  showBullets = true,
  bodySizeClass,
}: {
  items: string[];
  accent: string;
  body: string;
  square?: boolean;
  showBullets?: boolean;
  bodySizeClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={`${showBullets ? 'flex gap-3' : ''} leading-relaxed ${bodySizeClass ?? 'text-[0.95rem]'}`}
          style={{ color: body }}
        >
          {showBullets ? (
          <span
            aria-hidden
            className={`mt-[0.55em] h-1.5 w-1.5 shrink-0 ${square ? 'rounded-none' : 'rounded-full'}`}
            style={{ backgroundColor: accent }}
          />
          ) : null}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({
  label,
  accent,
  cardBg,
  cardBorder,
  labelSizeClass,
  children,
}: {
  label: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  labelSizeClass?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <p
        className={`font-bold uppercase tracking-[0.18em] ${labelSizeClass ?? 'text-[0.7rem]'}`}
        style={{ color: accent }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function TraitInteractiveList({
  items,
  titleColor,
  bodyColor,
  accent,
  bodySizeClass,
}: {
  items: Array<{ key: string; primary: ReactNode; secondary?: ReactNode }>;
  titleColor: string;
  bodyColor: string;
  accent: string;
  bodySizeClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul
      className="pf-about-trait-list"
      data-pf-no-color-transition=""
      style={
        {
          '--pf-about-trait-ink': titleColor,
          '--pf-about-trait-muted': bodyColor,
          '--pf-about-trait-accent': accent,
        } as CSSProperties
      }
    >
      {items.map((item) => (
        <li key={item.key} className={`pf-about-trait-item ${bodySizeClass ?? ''}`} data-pf-no-color-transition="">
          <span className="pf-about-trait-item-copy" data-pf-no-color-transition="">
            <span className="pf-about-trait-item-primary">{item.primary}</span>
            {item.secondary}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TraitHeadingList({
  label,
  items,
  titleColor,
  bodyColor,
  accent,
  contentSize,
}: {
  label: string;
  items: string[];
  titleColor: string;
  bodyColor: string;
  accent: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  if (items.length === 0) return null;
  const blockTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  return (
    <div className="pf-about-trait-block">
      <h3
        className={`text-left font-bold tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor }}
      >
        {label}
      </h3>
      <TraitInteractiveList
        items={items.map((item, index) => ({ key: `${index}-${item}`, primary: item }))}
        titleColor={titleColor}
        bodyColor={bodyColor}
        accent={accent}
        bodySizeClass={bodyClass}
      />
    </div>
  );
}

function TraitLanguageList({
  label,
  items,
  titleColor,
  bodyColor,
  accent,
  contentSize,
}: {
  label: string;
  items: LanguageDisplayItem[];
  titleColor: string;
  bodyColor: string;
  accent: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  if (items.length === 0) return null;
  const blockTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  return (
    <div className="pf-about-trait-block">
      <h3
        className={`text-left font-bold tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor }}
      >
        {label}
      </h3>
      <TraitInteractiveList
        items={items.map((item, index) => {
          const code = aboutClassicLanguageCode(item.name);
          const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
          return {
            key: `${index}-${item.name}`,
            primary: (
              <>
                <span className="pf-about-trait-lang-code">{code}</span>
                <span className="pf-about-trait-lang-name">{item.name}</span>
              </>
            ),
            secondary: levelLabel ? (
              <span className="pf-about-trait-lang-level">({levelLabel})</span>
            ) : null,
          };
        })}
        titleColor={titleColor}
        bodyColor={bodyColor}
        accent={accent}
        bodySizeClass={bodyClass}
      />
    </div>
  );
}

const ABOUT_CLASSIC_EASE = [0.16, 1, 0.3, 1] as const;

const ABOUT_CLASSIC_BLOCK_VIEWPORT = { once: true, amount: 0.16, margin: '0px 0px -8% 0px' } as const;

const ABOUT_CLASSIC_FADE_UP = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.64, ease: ABOUT_CLASSIC_EASE },
  },
};

const ABOUT_CLASSIC_CARD_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.66, ease: ABOUT_CLASSIC_EASE },
  },
};

const ABOUT_CLASSIC_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const ABOUT_CLASSIC_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

/** A soft white/gray tone for section labels — dims via color-mix (not `opacity`, which
 *  Framer already animates on these elements) so accent stays reserved for the one
 *  surgical red index chip. */
function aboutClassicMuted(color: string, percent = 62): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** "2018 - 2019" → "18 — 19"; a single year → "'19"; unparseable text passes through. */
function aboutClassicShortYearRange(raw: string): string {
  const years = raw.match(/\d{4}/g);
  if (!years || years.length === 0) return raw.trim();
  if (years.length === 1) return `'${years[0].slice(2)}`;
  const first = years[0].slice(2);
  const last = years[years.length - 1].slice(2);
  return `${first} — ${last}`;
}

const ABOUT_CLASSIC_LANG_CODES: Record<string, string> = {
  francais: 'FR',
  french: 'FR',
  english: 'EN',
  espanol: 'ES',
  spanish: 'ES',
  deutsch: 'DE',
  german: 'DE',
  italiano: 'IT',
  italian: 'IT',
  portugues: 'PT',
  portuguese: 'PT',
  arabic: 'AR',
  chinese: 'ZH',
  japanese: 'JA',
  korean: 'KO',
  russian: 'RU',
  nederlands: 'NL',
  dutch: 'NL',
};

const ABOUT_CLASSIC_LEVEL_TONE: Record<string, number> = {
  expert: 1,
  advanced: 0.85,
  intermediate: 0.7,
  beginner: 0.58,
};

function aboutClassicLanguageCode(name: string): string {
  const trimmed = name.trim();
  const key = spokenLanguageMatchKey(trimmed);
  if (ABOUT_CLASSIC_LANG_CODES[key]) return ABOUT_CLASSIC_LANG_CODES[key];
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const locale = trimmed.match(/^([a-z]{2})[-_][a-z]{2}$/i);
  if (locale) return locale[1].toUpperCase();
  const latin = trimmed.replace(/[^a-zA-Z]/g, '');
  if (latin.length >= 2) return latin.slice(0, 2).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

/** Languages — massive acronym with its name/level stacked directly below,
 *  not squeezed onto the same line. */
function AboutClassicLanguageList({
  items,
  ink,
  body,
}: {
  items: LanguageDisplayItem[];
  ink: string;
  body: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="pf-about-classic-langs">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        return (
          <li key={item.name} className="pf-about-classic-lang">
            <span className="pf-about-classic-lang-code" style={{ color: ink }}>
              {code}
            </span>
            <span className="pf-about-classic-lang-meta" style={{ color: body }}>
              {item.name}
              {levelLabel ? <span className="pf-about-classic-lang-meta-level"> / {levelLabel}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AboutClassicItemList({
  items,
  bodySizeClass,
}: {
  items: string[];
  bodySizeClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="pf-about-classic-list">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={`pf-about-classic-list-item leading-relaxed ${bodySizeClass ?? 'text-[0.95rem]'}`}
        >
          <span aria-hidden className="pf-about-classic-list-index tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Strengths — plain floating keywords, no pill/background/border. Contrast comes
 *  purely from alternating two gray tones (ink / muted) and generous spacing. */
function AboutClassicKeywordList({ items, ink, bodyColor }: { items: string[]; ink: string; bodyColor: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="pf-about-classic-keywords">
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className="pf-about-classic-keyword font-medium"
          style={{ color: index % 2 === 0 ? ink : bodyColor }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Systems & tools — no category label, listed exactly like Strengths (same
 *  AboutClassicKeywordList). Entries written "Category: a, b, c" are flattened
 *  into individual tags — the category prefix is dropped, each tool split out. */
function aboutClassicFlattenToolItems(items: string[]): string[] {
  const flat: string[] = [];
  for (const raw of items) {
    const separatorIndex = raw.indexOf(':');
    const value = separatorIndex === -1 ? raw : raw.slice(separatorIndex + 1);
    for (const part of value.split(',')) {
      const trimmed = part.trim();
      if (trimmed) flat.push(trimmed);
    }
  }
  return flat;
}

function AboutClassicBentoCard({
  cardKey,
  className,
  children,
}: {
  cardKey?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      data-card={cardKey}
      className={`pf-about-classic-card${cardKey ? ` pf-about-classic-card--${cardKey}` : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="pf-about-classic-card-inner">{children}</div>
    </article>
  );
}

function AboutMeClassicLayout({
  title: _title,
  subtitle: _subtitle,
  bio: _bio,
  educationItems,
  skillItems,
  strengthItems,
  languageItems,
  toolItems,
  showEducation,
  showSkills,
  showStrengths,
  showLanguages,
  showSystemsTools,
  languageLevelStyle: _languageLevelStyle,
  accent,
  titleColor: _titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const reduceMotion = useReducedMotion();
  const motionOff = reduceMotion === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const labelClass = infoContentLabelSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const cardLabelClass = infoContentLabelSizeClass(contentSize);

  useEffect(() => {
    rootRef.current?.setAttribute('data-pf-js', 'true');
  }, []);

  const hasAnyGridBlock = showSkills || showStrengths || showLanguages || showSystemsTools;

  const rootStyle = {
    '--pf-about-classic-accent': accent,
    '--pf-about-classic-border': cardBorder,
    '--pf-about-classic-card': cardBg,
    '--pf-about-classic-body': bodyColor,
    '--pf-about-classic-ink': subtitleColor,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="pf-about-classic w-full"
      data-pf-entry={motionOff ? 'static' : 'armed'}
      style={rootStyle}
    >
      {showEducation ? (
        <motion.section
          className="pf-about-classic-edu"
          initial={motionOff ? false : 'hidden'}
          whileInView={motionOff ? undefined : 'show'}
          viewport={ABOUT_CLASSIC_BLOCK_VIEWPORT}
          variants={ABOUT_CLASSIC_STAGGER}
        >
          <motion.p
            className={`pf-about-classic-section-kicker font-bold uppercase tracking-[0.18em] ${labelClass}`}
            style={{ color: aboutClassicMuted(subtitleColor) }}
            variants={motionOff ? undefined : ABOUT_CLASSIC_FADE_UP}
          >
            <span aria-hidden className="pf-about-classic-kicker-mark" />
            <span>Education</span>
          </motion.p>
          <motion.ol className="pf-about-classic-edu-index" variants={motionOff ? undefined : ABOUT_CLASSIC_STAGGER}>
            {educationItems.map((entry, index) => (
              <motion.li
                key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                className="pf-about-classic-edu-row"
                variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}
                whileHover={motionOff ? undefined : { x: 8 }}
                transition={{ duration: 0.45, ease: ABOUT_CLASSIC_EASE }}
              >
                <div className="pf-about-classic-edu-when">
                  <span className="pf-about-classic-edu-index-chip tabular-nums" style={{ color: accent }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {entry.schoolYear?.trim() ? (
                    <p className="pf-about-classic-edu-range font-light tabular-nums text-3xl md:text-4xl">
                      {aboutClassicShortYearRange(entry.schoolYear.trim())}
                    </p>
                  ) : null}
                </div>
                <div className="pf-about-classic-edu-what">
                  {entry.title?.trim() ? (
                    <p className="pf-about-classic-edu-title font-semibold leading-snug text-base" style={{ color: subtitleColor }}>
                      {entry.title.trim()}
                    </p>
                  ) : null}
                  {entry.institution?.trim() ? (
                    <p className="pf-about-classic-edu-school leading-relaxed text-xs">
                      {entry.institution.trim()}
                    </p>
                  ) : null}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.section>
      ) : null}

      {hasAnyGridBlock ? (
        <motion.section
          className="pf-about-classic-skills pf-about-classic-bento"
          initial={motionOff ? false : 'hidden'}
          whileInView={motionOff ? undefined : 'show'}
          viewport={ABOUT_CLASSIC_BLOCK_VIEWPORT}
          variants={ABOUT_CLASSIC_STAGGER}
        >
          {showSkills ? (
            <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
              <AboutClassicBentoCard cardKey="skills" className="pf-about-classic-card--full">
                <p
                  className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                  style={{ color: aboutClassicMuted(subtitleColor) }}
                >
                  Skills
                </p>
                <AboutClassicItemList items={skillEntryLabels(skillItems)} bodySizeClass={bodyClass} />
              </AboutClassicBentoCard>
            </motion.div>
          ) : null}

          {showLanguages ? (
            <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
              <AboutClassicBentoCard cardKey="languages" className="pf-about-classic-card--full">
                <p
                  className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                  style={{ color: aboutClassicMuted(subtitleColor) }}
                >
                  Languages
                </p>
                <AboutClassicLanguageList items={languageItems} ink={subtitleColor} body={bodyColor} />
              </AboutClassicBentoCard>
            </motion.div>
          ) : null}

          {showStrengths && showSystemsTools ? (
            <div className="pf-about-classic-split-row">
              <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
                <AboutClassicBentoCard cardKey="strengths">
                  <p
                    className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                    style={{ color: aboutClassicMuted(subtitleColor) }}
                  >
                    Strengths
                  </p>
                  <AboutClassicKeywordList items={strengthItems} ink={subtitleColor} bodyColor={bodyColor} />
                </AboutClassicBentoCard>
              </motion.div>
              <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
                <AboutClassicBentoCard cardKey="systems">
                  <p
                    className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                    style={{ color: aboutClassicMuted(subtitleColor) }}
                  >
                    Systems &amp; tools
                  </p>
                  <AboutClassicKeywordList
                    items={aboutClassicFlattenToolItems(toolItems)}
                    ink={subtitleColor}
                    bodyColor={bodyColor}
                  />
                </AboutClassicBentoCard>
              </motion.div>
            </div>
          ) : showStrengths ? (
            <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
              <AboutClassicBentoCard cardKey="strengths" className="pf-about-classic-card--full">
                <p
                  className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                  style={{ color: aboutClassicMuted(subtitleColor) }}
                >
                  Strengths
                </p>
                <AboutClassicKeywordList items={strengthItems} ink={subtitleColor} bodyColor={bodyColor} />
              </AboutClassicBentoCard>
            </motion.div>
          ) : showSystemsTools ? (
            <motion.div variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
              <AboutClassicBentoCard cardKey="systems" className="pf-about-classic-card--full">
                <p
                  className={`pf-about-classic-card-label font-bold uppercase tracking-[0.18em] ${cardLabelClass}`}
                  style={{ color: aboutClassicMuted(subtitleColor) }}
                >
                  Systems &amp; tools
                </p>
                <AboutClassicKeywordList
                  items={aboutClassicFlattenToolItems(toolItems)}
                  ink={subtitleColor}
                  bodyColor={bodyColor}
                />
              </AboutClassicBentoCard>
            </motion.div>
          ) : null}
        </motion.section>
      ) : null}
    </div>
  );
}

const ABOUT_ME_TRAIT_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const ABOUT_ME_TRAIT_BLOCK_VIEWPORT = { once: true, amount: 0.22, margin: '0px 0px -10% 0px' } as const;

function AboutMeTraitHeadline({
  text,
  contentSize,
}: {
  text: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const headlineClass = aboutMeTraitHeadlineSizeClass(contentSize);

  return (
    <div className="pf-about-trait-headline" data-pf-no-color-transition="">
      {lines.map((line, index) => (
        <p
          key={`${index}-${line}`}
          className={`pf-about-trait-line text-left font-bold tracking-[-0.03em] ${headlineClass}`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/** Air between the headline block and the three columns. */
const ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM = 'mt-28 sm:mt-36 lg:mt-44';

function aboutTraitDisplayInk(color: string, colorMode: 'light' | 'dark' = 'dark'): string {
  const raw = color.trim();
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (!hex) {
    if (colorMode === 'dark') return raw || '#f5f5f5';
    return raw || '#171717';
  }
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((part) => part + part)
          .join('')
      : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  if (colorMode === 'dark') return luma < 48 ? '#f5f5f5' : raw;
  return luma > 208 ? '#171717' : raw;
}
/** Education — same gap as above skills, no horizontal divider. */
const ABOUT_ME_TRAIT_EDUCATION_SECTION_TOP = 'mt-28 sm:mt-32 lg:mt-36';

function AboutMeTraitLayout({
  title: _title,
  headlineText,
  showHeadline,
  avatarUrl,
  fullName,
  educationItems,
  skillItems,
  strengthItems,
  languageItems,
  showEducation,
  showSkills,
  showStrengths,
  showLanguages,
  languageLevelStyle: _languageLevelStyle,
  educationDisplayStyle,
  cascadeScrollShift = false,
  contentSize,
  accent,
  titleColor,
  bodyColor,
  cardBg,
  cardBorder,
  portraitGrayscale,
  colorMode = 'dark',
}: {
  title: string;
  headlineText: string;
  showHeadline: boolean;
  avatarUrl?: string | null;
  fullName?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  educationDisplayStyle: PortfolioInfoEducationDisplayStyle;
  cascadeScrollShift?: boolean;
  contentSize: PortfolioInfoPremiumFontSize;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  portraitGrayscale: boolean;
  colorMode?: 'light' | 'dark';
}) {
  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const showSkillsBlock = showSkills && skillItems.length > 0;
  const showStrengthsBlock = showStrengths && strengthItems.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showEducationBlock = showEducation && educationItems.length > 0;
  const displayInk = aboutTraitDisplayInk(titleColor, colorMode);
  const reduceMotion = useReducedMotion();
  const motionOff = reduceMotion === true;
  const [educationArmed, setEducationArmed] = useState(false);
  const [educationEntered, setEducationEntered] = useState(false);

  useEffect(() => {
    if (motionOff) return;
    setEducationArmed(true);
  }, [motionOff]);

  return (
    <div
      className="pf-about-trait-root w-full"
      style={
        {
          '--pf-about-trait-accent': accent,
          '--pf-about-trait-ink': displayInk,
          '--pf-about-trait-muted': bodyColor,
        } as CSSProperties
      }
    >
      <div className="mt-12 flex flex-col sm:mt-14">
        <div
          className={`grid gap-8 lg:items-stretch lg:gap-14 ${
            showHeadline
              ? 'lg:grid-cols-[minmax(18rem,min(26rem,34%))_minmax(0,1fr)]'
              : 'lg:grid-cols-1'
          }`}
        >
          <div
            className={`pf-about-trait-portrait mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden bg-neutral-800 sm:aspect-square lg:mx-0 lg:aspect-auto lg:h-[min(24rem,28vw)] lg:w-[min(24rem,28vw)] lg:max-w-none lg:shrink-0 ${
              showHeadline ? '' : 'lg:h-auto lg:w-full lg:aspect-square lg:max-w-[40rem]'
            }`}
            style={{ backgroundColor: cardBg }}
          >
            <div className="pf-about-trait-portrait-zoom h-full w-full" data-pf-no-color-transition="">
              {avatarUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl.trim()}
                  alt={fullName?.trim() || 'Profile'}
                  className={infoPortraitImageClass('h-full w-full object-cover', portraitGrayscale)}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-3xl font-semibold"
                  style={{ color: bodyColor }}
                >
                  {initials || '?'}
                </div>
              )}
            </div>
          </div>

          {showHeadline ? (
            <div className="flex min-h-0 min-w-0 lg:h-full">
              <AboutMeTraitHeadline
                text={headlineText.trim() || 'Turning Hard\nProblems Into\nSimple Software'}
                contentSize={contentSize}
              />
            </div>
          ) : null}
        </div>

        {(showSkillsBlock || showStrengthsBlock || showLanguagesBlock) && (
          <section
            className={`pf-about-trait-columns grid gap-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-20 lg:gap-y-16 ${ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM}`}
          >
            {showSkillsBlock ? (
              <motion.div
                className="pf-about-trait-col pf-about-trait-card"
                data-pf-no-color-transition=""
                initial={motionOff ? false : { opacity: 0, y: 22 }}
                whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
                viewport={ABOUT_ME_TRAIT_BLOCK_VIEWPORT}
                transition={{ duration: 0.72, delay: 0.05, ease: ABOUT_ME_TRAIT_EASE }}
              >
                <TraitHeadingList
                  label="Skills"
                  items={skillEntryLabels(skillItems)}
                  titleColor={titleColor}
                  bodyColor={bodyColor}
                  accent={accent}
                  contentSize={contentSize}
                />
              </motion.div>
            ) : null}
            {showStrengthsBlock ? (
              <motion.div
                className="pf-about-trait-col pf-about-trait-card"
                data-pf-no-color-transition=""
                initial={motionOff ? false : { opacity: 0, y: 22 }}
                whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
                viewport={ABOUT_ME_TRAIT_BLOCK_VIEWPORT}
                transition={{ duration: 0.72, delay: 0.16, ease: ABOUT_ME_TRAIT_EASE }}
              >
                <TraitHeadingList
                  label="Strengths"
                  items={strengthItems}
                  titleColor={titleColor}
                  bodyColor={bodyColor}
                  accent={accent}
                  contentSize={contentSize}
                />
              </motion.div>
            ) : null}
            {showLanguagesBlock ? (
              <motion.div
                className="pf-about-trait-col pf-about-trait-card"
                data-pf-no-color-transition=""
                initial={motionOff ? false : { opacity: 0, y: 22 }}
                whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
                viewport={ABOUT_ME_TRAIT_BLOCK_VIEWPORT}
                transition={{ duration: 0.72, delay: 0.27, ease: ABOUT_ME_TRAIT_EASE }}
              >
                <TraitLanguageList
                  label="Languages"
                  items={languageItems}
                  titleColor={titleColor}
                  bodyColor={bodyColor}
                  accent={accent}
                  contentSize={contentSize}
                />
              </motion.div>
            ) : null}
          </section>
        )}
      </div>

      {showEducationBlock ? (
        <motion.div
          className={`pf-about-trait-edu ${ABOUT_ME_TRAIT_EDUCATION_SECTION_TOP}`}
          data-pf-no-color-transition=""
          data-pf-about-trait-armed={educationArmed ? 'true' : undefined}
          data-pf-about-trait-in={educationEntered ? 'true' : undefined}
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={ABOUT_ME_TRAIT_BLOCK_VIEWPORT}
          onViewportEnter={() => {
            if (!motionOff) setEducationEntered(true);
          }}
        >
          <TraitEducationBlock
            items={educationItems}
            style={educationDisplayStyle}
            contentSize={contentSize}
            cascadeScrollShift={cascadeScrollShift}
            sectionClassName=""
            titleColor={titleColor}
            bodyColor={bodyColor}
            accent={accent}
            cardBg={cardBg}
            cardBorder={cardBorder}
          />
        </motion.div>
      ) : null}
    </div>
  );
}

function AboutPlatformSkillIcon({ variant, color }: { variant: number; color: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    color,
    strokeWidth: 1.22,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (variant % 8) {
    case 1:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.15" />
          <path d="M12 5.65v2.15M12 16.2v2.15M5.65 12h2.15M16.2 12h2.15" />
          <circle cx="12" cy="12" r="1.05" fill="currentColor" stroke="none" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="M5.5 17.6V11.1" />
          <path d="M12 17.6V6.4" />
          <path d="M18.5 17.6v-4.7" />
          <path d="M4.4 17.6h15.2" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M12 3.7l7.15 4.05v8.5L12 20.3 4.85 16.25v-8.5L12 3.7z" />
          <path d="M12 3.7v16.6" />
          <path d="M5.05 8.05L12 12.05l6.95-4" />
        </svg>
      );
    case 4:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.85" />
          <ellipse cx="12" cy="12" rx="9.05" ry="4.15" transform="rotate(-26 12 12)" />
        </svg>
      );
    case 5:
      return (
        <svg {...common}>
          <path d="M4.6 16.7H10V11.2h5.15V5.6H19.4" />
        </svg>
      );
    case 6:
      return (
        <svg {...common}>
          <circle cx="9.15" cy="12" r="5.05" />
          <circle cx="14.85" cy="12" r="5.05" />
        </svg>
      );
    case 7:
      return (
        <svg {...common}>
          <path d="M5 9.35V5h4.35" />
          <path d="M19 9.35V5h-4.35" />
          <path d="M5 14.65V19h4.35" />
          <path d="M19 14.65V19h-4.35" />
        </svg>
      );
    case 0:
    default:
      return (
        <svg {...common}>
          <rect x="3.6" y="3.6" width="9.4" height="9.4" rx="1.15" />
          <rect x="10.95" y="10.95" width="9.45" height="9.45" rx="1.15" />
        </svg>
      );
  }
}

function aboutPlatformFirstGlyphTop(el: HTMLElement): number | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent && /\S/.test(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });
  const textNode = walker.nextNode();
  if (textNode) {
    const value = textNode.textContent ?? '';
    const start = value.search(/\S/);
    if (start >= 0) {
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, start + 1);
      const rect = range.getBoundingClientRect();
      if (rect.height > 0) return rect.top;
    }
  }
  const box = el.getBoundingClientRect();
  return box.height > 0 ? box.top : null;
}

function aboutPlatformLineIsResting(el: HTMLElement): boolean {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === 'none') return true;
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match?.[1]) return true;
  const ty = Number(match[1].split(',')[5]);
  return !Number.isFinite(ty) || Math.abs(ty) < 1;
}

function aboutPlatformAlignHeader(root: HTMLElement) {
  const wrap = root.querySelector<HTMLElement>('.pf-about-platform-bio-wrap');
  const line = root.querySelector<HTMLElement>('.pf-about-platform-headline-line');
  const bio = root.querySelector<HTMLElement>('.pf-about-platform-bio');
  if (!wrap) return;
  if (window.innerWidth < 1024 || !line || !bio) {
    wrap.style.removeProperty('margin-top');
    return;
  }
  if (!aboutPlatformLineIsResting(line) || !aboutPlatformLineIsResting(bio)) return;
  for (let i = 0; i < 3; i += 1) {
    const titleTop = aboutPlatformFirstGlyphTop(line);
    const bioTop = aboutPlatformFirstGlyphTop(bio);
    if (titleTop == null || bioTop == null) return;
    const delta = titleTop - bioTop;
    if (Math.abs(delta) < 0.35) return;
    const current = Number.parseFloat(getComputedStyle(wrap).marginTop) || 0;
    wrap.style.marginTop = `${Math.round((current + delta) * 10) / 10}px`;
  }
}


/** Skill card — glassmorphic surface with a cursor-driven 3D tilt that trails
 *  the pointer (damped/lerped every frame, never snaps 1:1) instead of a
 *  direct mouse-tracking rotation. Hover elevation and the tilt rotation are
 *  deliberately split across two different elements: the outer wrapper
 *  handles the discrete spring-eased lift/scale (a plain two-state CSS
 *  transition), while this element carries only the continuously-updated
 *  tilt — mixing a damped per-frame value with a CSS transition on the same
 *  property would fight itself and read as mushy/late. */
function AboutPlatformSkillCard({
  skill,
  index,
  cardTitleClass,
  cardBodyClass,
}: {
  skill: ProfileSkillEntry;
  index: number;
  cardTitleClass: string;
  cardBodyClass: string;
}) {
  const skillTitle = skill.title?.trim() || '';
  const skillDescription = skill.description?.trim() || '';
  const isPlaceholder = !skillDescription;
  // Same padding on every card — varying it per index made same-content cards
  // read as different sizes, which fought the "equal width/height" grid.
  const densityClass = 'px-5 pb-6 pt-[1.15rem] sm:px-6 sm:pb-7 sm:pt-5';

  const cardRef = useRef<HTMLElement>(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const hoveringRef = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  const tick = useCallback(() => {
    const node = cardRef.current;
    if (!node) {
      rafRef.current = 0;
      return;
    }
    const damping = 0.14;
    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * damping;
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * damping;
    node.style.setProperty('--pf-about-platform-tilt-x', `${currentTilt.current.x.toFixed(3)}deg`);
    node.style.setProperty('--pf-about-platform-tilt-y', `${currentTilt.current.y.toFixed(3)}deg`);
    const settled =
      Math.abs(targetTilt.current.x - currentTilt.current.x) < 0.02 &&
      Math.abs(targetTilt.current.y - currentTilt.current.y) < 0.02;
    if (hoveringRef.current || !settled) {
      rafRef.current = window.requestAnimationFrame(() => tickRef.current());
    } else {
      rafRef.current = 0;
    }
  }, []);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const handlePointerMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const node = cardRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      targetTilt.current = { x: (py / 100 - 0.5) * -4.5, y: (px / 100 - 0.5) * 4.5 };
      node.style.setProperty('--pf-about-platform-glow-x', `${px}%`);
      node.style.setProperty('--pf-about-platform-glow-y', `${py}%`);
      if (!rafRef.current) rafRef.current = window.requestAnimationFrame(tick);
    },
    [tick]
  );

  const handlePointerEnter = useCallback(() => {
    hoveringRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    hoveringRef.current = false;
    targetTilt.current = { x: 0, y: 0 };
    if (!rafRef.current) rafRef.current = window.requestAnimationFrame(tick);
  }, [tick]);

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <article
      ref={cardRef}
      className={`pf-about-platform-card flex flex-1 flex-col rounded-[1.15rem] border ${densityClass}`}
      onMouseEnter={handlePointerEnter}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <span className="pf-about-platform-card-glow" aria-hidden />
      <span className="pf-about-platform-card-mark" data-reveal="mark">
        <AboutPlatformSkillIcon variant={index} color="currentColor" />
      </span>
      <h4
        className={`pf-about-platform-card-title mt-5 min-w-0 font-semibold leading-[1.24] tracking-[-0.026em] sm:mt-6 ${cardTitleClass}`}
        data-reveal="title"
      >
        {skillTitle}
      </h4>
      <p
        className={`pf-about-platform-card-body mt-3.5 min-w-0 flex-1 leading-[1.6] sm:mt-4 ${cardBodyClass}`}
        data-reveal="body"
        data-placeholder={isPlaceholder ? 'true' : undefined}
      >
        {skillDescription || 'Add a description for this skill in Creator Studio → Information.'}
      </p>
    </article>
  );
}

/** About · platform — one "index row": an italic title in a fixed 5/12 left
 *  column (sticky while its own content scrolls by) and content filling the
 *  full 7/12 right column, so nothing is squeezed into a narrow strip with a
 *  wide empty gutter beside it. Unconditional — no stagger/narrow variants;
 *  this is the one layout used everywhere below the skills grid. */
function AboutPlatformIndexSection({
  title,
  sectionTitleClass,
  titleColor,
  children,
  className = '',
}: {
  title: string;
  sectionTitleClass: string;
  titleColor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`pf-about-platform-split mt-16 grid grid-cols-1 gap-6 sm:mt-20 lg:mt-24 lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:mt-28 xl:gap-x-14 ${className}`}
    >
      <h3
        className={`pf-about-platform-split-title min-w-0 leading-[0.96] tracking-[-0.03em] lg:col-span-5 lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.5rem)] lg:self-start ${sectionTitleClass}`}
        style={{ color: titleColor }}
      >
        <span className="pf-about-platform-headline-mask">
          <span className="pf-about-platform-split-title-line">{title}</span>
        </span>
        <span className="pf-about-platform-title-progress" aria-hidden="true" />
      </h3>
      <div className="pf-about-platform-split-body min-w-0 lg:col-start-6 lg:col-span-7">
        {children}
      </div>
    </section>
  );
}

/** About · platform — Jasper split: Playfair headline, stair skills, typographic langs. */
function AboutPlatformLayout({
  title: _title,
  bio,
  subtitle,
  specialty,
  skillItems,
  strengthItems,
  educationItems,
  languageItems,
  interestItems,
  showSkills,
  showStrengths,
  showLanguages,
  showEducation,
  showInterests,
  showLanguageFlags: _showLanguageFlags,
  languageLevelStyle: _languageLevelStyle,
  headlineText,
  strengthsSectionTitle,
  accent,
  titleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
}: {
  title: string;
  bio?: string | null;
  subtitle?: string;
  specialty?: string | null;
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  educationItems: ProfileEducationEntry[];
  languageItems: LanguageDisplayItem[];
  interestItems: string[];
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  showEducation: boolean;
  showInterests: boolean;
  showLanguageFlags: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  headlineText: string;
  strengthsSectionTitle: string;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const reduceMotion = useReducedMotion();
  const motionDisabled = reduceMotion === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [motionState, setMotionState] = useState<'armed' | 'active' | 'done'>('armed');
  const headlineClass = aboutPlatformHeadlineSizeClass(contentSize);
  const leadClass = aboutPlatformLeadSizeClass(contentSize);
  const strengthsTitleClass = aboutPlatformSkillsTitleSizeClass(contentSize);
  const cardTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const cardBodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const headlineLines = headlineText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const displayHeadlineLines =
    headlineLines.length > 0 ? headlineLines : [specialty?.trim() || 'Built for clarity'];
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showInterestsBlock = showInterests && visibleInterests.length > 0;

  useEffect(() => {
    if (motionDisabled) {
      setHasEntered(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;
    const scrollRoot = getManifestoScrollParent(node);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { root: scrollRoot, threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [motionDisabled]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const prefersReduce =
      motionDisabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      const alignHeader = () => aboutPlatformAlignHeader(root);
      alignHeader();
      void document.fonts?.ready.then(alignHeader);
      window.addEventListener('resize', alignHeader);
      return () => window.removeEventListener('resize', alignHeader);
    }

    const scroller = aboutBannerScrollParent(root);
    const header = root.querySelector<HTMLElement>('.pf-about-platform-header');
    const kicker = root.querySelector<HTMLElement>('.pf-about-platform-kicker');
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-headline-line'));
    const bio = root.querySelector<HTMLElement>('.pf-about-platform-bio');
    const skillRises = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-skill-rise'));
    const badges = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-word'));
    const langs = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-lang'));
    const eduRows = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-edu-row'));
    const strengths = root.querySelector<HTMLElement>('.pf-about-platform-strengths');
    const languages = root.querySelector<HTMLElement>('.pf-about-platform-languages');
    const education = root.querySelector<HTMLElement>('.pf-about-platform-education');
    const interests = root.querySelector<HTMLElement>('.pf-about-platform-interests');

    let stopHeaderWatch: (() => void) | undefined;
    let headerFallbackId: number | undefined;
    const extraStops: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const playWhenVisible = (trigger: HTMLElement, play: () => void) => {
        let started = false;
        const run = () => {
          if (started) return;
          started = true;
          play();
        };

        const isInView = () => {
          const box = trigger.getBoundingClientRect();
          const port = scroller?.getBoundingClientRect();
          const top = port?.top ?? 0;
          const bottom = port ? port.bottom : window.innerHeight;
          const height = Math.max(1, bottom - top);
          return box.top < top + height * 0.82 && box.bottom > top + height * 0.16;
        };

        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.12)) {
              run();
            }
          },
          {
            root: scroller ?? null,
            threshold: [0.12, 0.24],
            rootMargin: '0px 0px -14% 0px',
          }
        );
        io.observe(trigger);
        extraStops.push(() => io.disconnect());

        ScrollTrigger.create({
          trigger,
          ...(scroller ? { scroller } : {}),
          start: 'top 82%',
          once: true,
          onEnter: run,
        });

        const onScroll = () => {
          if (isInView()) run();
        };
        const scrollTarget: HTMLElement | Window = scroller ?? window;
        scrollTarget.addEventListener('scroll', onScroll, { passive: true });
        extraStops.push(() => scrollTarget.removeEventListener('scroll', onScroll));
        if (isInView()) run();
      };

      const playIn = (
        items: HTMLElement[],
        trigger: HTMLElement | null,
        from: gsap.TweenVars,
        to: gsap.TweenVars
      ) => {
        if (!items.length || !trigger) return;
        gsap.set(items, { ...from, immediateRender: true });
        const tween = gsap.to(items, {
          ...to,
          paused: true,
          overwrite: 'auto',
          immediateRender: false,
        });
        playWhenVisible(trigger, () => tween.play());
      };

      if (header) {
        const headerIntro = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out', force3D: true, overwrite: 'auto' },
          onComplete: () => {
            if (lines.length) gsap.set(lines, { willChange: 'auto' });
            if (bio) gsap.set(bio, { willChange: 'auto' });
            aboutPlatformAlignHeader(root);
          },
        });

        if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 0, immediateRender: true });
        if (lines.length) gsap.set(lines, { y: '0%', autoAlpha: 0, immediateRender: true });
        if (bio) gsap.set(bio, { y: 0, autoAlpha: 0, immediateRender: true });
        aboutPlatformAlignHeader(root);

        if (kicker) {
          gsap.set(kicker, { autoAlpha: 0, y: 8 });
          headerIntro.to(kicker, { autoAlpha: 1, y: 0, duration: 0.48 }, 0);
        }
        if (lines.length) {
          gsap.set(lines, { y: '108%', autoAlpha: 1, willChange: 'transform' });
          headerIntro.to(lines, { y: '0%', duration: 0.88, stagger: 0.08 }, 0.04);
        }
        if (bio) {
          const risePx = Math.round((lines[0]?.offsetHeight || 48) * 1.08);
          gsap.set(bio, { y: risePx, autoAlpha: 0, willChange: 'transform,opacity' });
          headerIntro.to(bio, { y: 0, autoAlpha: 0.82, duration: 0.88 }, 0.04);
        }

        let headerStarted = false;
        const playHeaderIntro = () => {
          if (headerStarted) return;
          headerStarted = true;
          requestAnimationFrame(() => headerIntro.play());
        };
        const stopNested = aboutBannerWatchEnter(header, scroller, playHeaderIntro);
        const stopViewport = aboutBannerWatchEnter(header, undefined, playHeaderIntro);
        ScrollTrigger.create({
          trigger: header,
          start: 'top 90%',
          once: true,
          onEnter: playHeaderIntro,
        });
        if (scroller) {
          ScrollTrigger.create({
            trigger: header,
            scroller,
            start: 'top 90%',
            once: true,
            onEnter: playHeaderIntro,
          });
        }
        const onWinScroll = () => {
          const box = header.getBoundingClientRect();
          if (box.top < window.innerHeight * 0.9 && box.bottom > 40) playHeaderIntro();
        };
        window.addEventListener('scroll', onWinScroll, { passive: true });
        scroller?.addEventListener('scroll', onWinScroll, { passive: true });
        headerFallbackId = window.setTimeout(onWinScroll, 280);
        stopHeaderWatch = () => {
          if (headerFallbackId != null) window.clearTimeout(headerFallbackId);
          window.removeEventListener('scroll', onWinScroll);
          scroller?.removeEventListener('scroll', onWinScroll);
          stopNested();
          stopViewport();
        };
      }

      setMotionState('active');

      const splitLines = Array.from(
        root.querySelectorAll<HTMLElement>('.pf-about-platform-split-title-line')
      );
      splitLines.forEach((line) => {
        const title = line.closest<HTMLElement>('.pf-about-platform-split-title') ?? line;
        gsap.set(line, { y: '108%', immediateRender: true, force3D: true });
        const tween = gsap.to(line, {
          y: '0%',
          duration: 0.88,
          ease: 'power3.out',
          paused: true,
          overwrite: 'auto',
          force3D: true,
        });
        playWhenVisible(title, () => tween.play());
      });

      // Each card reveals in two phases as it scrolls into view: the frame
      // itself first (a slide + fade), then its own icon → title → body
      // cascade in quick, tight succession — triggered independently per
      // card rather than one shared stagger across the whole grid.
      skillRises.forEach((rise) => {
        const mark = rise.querySelector<HTMLElement>('[data-reveal="mark"]');
        const title = rise.querySelector<HTMLElement>('[data-reveal="title"]');
        const body = rise.querySelector<HTMLElement>('[data-reveal="body"]');
        gsap.set(rise, { y: 34, autoAlpha: 0, immediateRender: true });
        if (mark) gsap.set(mark, { y: 10, autoAlpha: 0, immediateRender: true });
        if (title) gsap.set(title, { y: 10, autoAlpha: 0, immediateRender: true });
        if (body) gsap.set(body, { y: 10, autoAlpha: 0, immediateRender: true });
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power3.out', force3D: true, overwrite: 'auto' },
          // The one-shot reveal leaves inline transform/opacity behind, which
          // (being inline) would permanently outrank the icon's own hover
          // spring and the body's rest/hover opacity swing below — hand
          // those two back to CSS once the entrance settles.
          onComplete: () => {
            if (mark) gsap.set(mark, { clearProps: 'transform,opacity,visibility' });
            if (body) gsap.set(body, { clearProps: 'transform,opacity,visibility' });
          },
        });
        tl.to(rise, { y: 0, autoAlpha: 1, duration: 0.8 }, 0);
        if (mark) tl.to(mark, { y: 0, autoAlpha: 1, duration: 0.42 }, 0.22);
        if (title) tl.to(title, { y: 0, autoAlpha: 1, duration: 0.46 }, 0.3);
        if (body) tl.to(body, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.38);
        playWhenVisible(rise, () => tl.play());
      });

      playIn(
        badges,
        strengths,
        { x: 36, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.72,
          stagger: 0.08,
          ease: 'power3.out',
          // Only transform is handed back — opacity/visibility must stay
          // inline: with no [data-pf-motion='done'] un-hide rule for this
          // element, clearing them would re-expose the CSS "hidden until
          // animated" baseline and the words would vanish again. The rest/
          // hover opacity swing below uses !important to still win over
          // that permanently-inline opacity: 1.
          onComplete: () => gsap.set(badges, { clearProps: 'transform' }),
        }
      );
      playIn(
        langs,
        languages,
        { x: 36, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );
      playIn(
        eduRows,
        education,
        { x: 36, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );

      // Each education row's year and diploma title drift horizontally at
      // different speeds as the row crosses the viewport — a scroll-scrubbed
      // parallax, not a shared one, so the two never travel in lockstep.
      eduRows.forEach((row) => {
        const year = row.querySelector<HTMLElement>('.pf-about-platform-edu-year');
        const titleTrack = row.querySelector<HTMLElement>('.pf-about-platform-edu-title-track');
        if (year) {
          gsap.fromTo(
            year,
            { x: -14 },
            {
              x: 14,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                ...(scroller ? { scroller } : {}),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            }
          );
        }
        if (titleTrack) {
          gsap.fromTo(
            titleTrack,
            { x: 9 },
            {
              x: -9,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                ...(scroller ? { scroller } : {}),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
              },
            }
          );
        }
      });

      const interestList = root.querySelector<HTMLElement>('.pf-about-platform-split-list');
      playIn(
        Array.from(root.querySelectorAll<HTMLElement>('.pf-about-platform-split-list > *')),
        interestList?.closest('.pf-about-platform-split') ?? interestList,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.72, stagger: 0.08, ease: 'power3.out' }
      );

      // Sticky title "comes into focus" while its own section's content is the
      // one actually being read — continuously scrubbed (not a one-shot
      // reveal), so it dims back out on the way back up too. A thin accent
      // rule under the title tracks the exact same progress as a "you are
      // here" indicator.
      const focusSections = [strengths, languages, education, interests].filter(
        (section): section is HTMLElement => Boolean(section)
      );
      focusSections.forEach((section) => {
        const titleEl = section.querySelector<HTMLElement>('.pf-about-platform-split-title');
        if (!titleEl) return;
        const progressEl = section.querySelector<HTMLElement>('.pf-about-platform-title-progress');
        gsap.set(titleEl, { opacity: 0.32 });
        if (progressEl) gsap.set(progressEl, { scaleX: 0, transformOrigin: 'left center' });
        const focusTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            ...(scroller ? { scroller } : {}),
            start: 'top 70%',
            end: 'bottom 55%',
            scrub: 0.3,
          },
        });
        focusTl.to(titleEl, { opacity: 1, ease: 'none' }, 0);
        if (progressEl) focusTl.to(progressEl, { scaleX: 1, ease: 'none' }, 0);
      });
    }, root);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    const alignHeader = () => aboutPlatformAlignHeader(root);
    void document.fonts?.ready.then(() => {
      alignHeader();
      ScrollTrigger.refresh();
    });
    window.addEventListener('resize', alignHeader);
    return () => {
      extraStops.forEach((stop) => stop());
      stopHeaderWatch?.();
      window.clearTimeout(refreshId);
      window.removeEventListener('resize', alignHeader);
      ctx.revert();
    };
  }, [
    motionDisabled,
    showSkillsBlock,
    showStrengthsBlock,
    showLanguagesBlock,
    showEducationBlock,
    showInterestsBlock,
    visibleSkills.length,
    visibleStrengths.length,
    languageItems.length,
    visibleEducation.length,
    visibleInterests.length,
  ]);

  return (
    <div
      ref={rootRef}
      className="pf-about-platform-root w-full"
      data-pf-entry={motionDisabled || hasEntered ? 'in' : 'armed'}
      data-pf-motion={motionDisabled ? 'reduce' : motionState}
      style={
        {
          '--pf-about-platform-accent': accent,
          '--pf-about-platform-ink': titleColor,
          '--pf-about-platform-muted': bodyColor,
          '--pf-about-platform-line': cardBorder,
          '--pf-about-platform-fill': cardBg,
        } as CSSProperties
      }
    >
      <header className="pf-about-platform-header grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-start lg:gap-x-16 lg:gap-y-5 xl:gap-x-24">
        <h2
          className={`pf-about-platform-headline leading-[0.96] tracking-[-0.03em] sm:leading-[0.94] lg:col-start-1 lg:row-start-1 ${headlineClass}`}
          style={{ color: titleColor }}
        >
          {displayHeadlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="pf-about-platform-headline-mask">
              <span className="pf-about-platform-headline-line">{line}</span>
            </span>
          ))}
        </h2>
        {bioText ? (
          <div className="pf-about-platform-bio-wrap min-w-0 lg:col-start-2 lg:row-start-1 lg:self-start">
            <p
              className={`pf-about-platform-bio min-w-0 w-full max-w-xl font-medium !leading-[1.28] tracking-[-0.018em] lg:max-w-none ${leadClass}`}
              style={{ color: bodyColor }}
            >
              {bioText}
            </p>
          </div>
        ) : null}
      </header>

      {showSkillsBlock ? (
        <section
          className="pf-about-platform-skills mt-16 pb-12 sm:mt-20 sm:pb-16 lg:mt-24 lg:pb-20 xl:mt-28 xl:pb-24"
          data-count={String(visibleSkills.length)}
        >
          <div className="pf-about-platform-skills-grid" data-count={String(visibleSkills.length)}>
            {visibleSkills.map((skill, index) => (
              <div key={skill.id} className="pf-about-platform-skill-slot flex min-h-0 flex-col">
                <div className="pf-about-platform-skill-shift">
                  <div className="pf-about-platform-skill-rise">
                    <AboutPlatformSkillCard
                      skill={skill}
                      index={index}
                      cardTitleClass={cardTitleClass}
                      cardBodyClass={cardBodyClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showStrengthsBlock ? (
        <AboutPlatformIndexSection
          title={strengthsSectionTitle}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
          className="pf-about-platform-strengths"
        >
          <div className="pf-about-platform-words flex flex-wrap items-baseline gap-x-9 gap-y-5">
            {visibleStrengths.map((item, index) => (
              <span
                key={`${index}-${item}`}
                className={`pf-about-platform-word ${cardBodyClass} ${
                  index % 3 === 1 ? 'pf-about-platform-word--minor' : ''
                }`}
                data-pf-no-color-transition=""
              >
                {item}
              </span>
            ))}
          </div>
        </AboutPlatformIndexSection>
      ) : null}

      {showLanguagesBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
          className="pf-about-platform-languages"
        >
          <ul className="pf-about-platform-langs">
            {languageItems.map((item) => {
              const code = aboutClassicLanguageCode(item.name);
              const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
              const fill = item.level ? ABOUT_CLASSIC_LEVEL_TONE[item.level] ?? 0.72 : 0.72;
              return (
                <li key={item.name} className="pf-about-platform-lang" data-pf-no-color-transition="">
                  <span className="pf-about-platform-lang-code" style={{ color: titleColor }}>
                    {code}
                  </span>
                  <span className="sr-only">{item.name}</span>
                  {levelLabel ? (
                    <span className="pf-about-platform-lang-level-mask">
                      <span
                        className="pf-about-platform-lang-level"
                        style={{ color: bodyColor, opacity: fill }}
                        data-pf-no-color-transition=""
                      >
                        {levelLabel}
                      </span>
                      <span
                        className="pf-about-platform-lang-level pf-about-platform-lang-level--dup"
                        style={{ opacity: fill }}
                        data-pf-no-color-transition=""
                        aria-hidden="true"
                      >
                        {levelLabel}
                      </span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </AboutPlatformIndexSection>
      ) : null}

      {showEducationBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.education}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
          className="pf-about-platform-education"
        >
          <ol className="pf-about-platform-edu-list">
            {visibleEducation.map((entry, index) => {
              const degree = entry.title?.trim() || '';
              const institution = entry.institution?.trim() || '';
              const year = entry.schoolYear?.trim() || '';
              const headline = degree || institution;
              const detail = degree && institution ? institution : '';

              return (
                <li
                  key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                  className="pf-about-platform-edu-row"
                  data-pf-no-color-transition=""
                >
                  <span className="pf-about-platform-edu-year" style={{ color: bodyColor }}>
                    {year || '—'}
                  </span>
                  <div className="pf-about-platform-edu-body min-w-0">
                    {headline ? (
                      <p className="pf-about-platform-edu-title-track min-w-0">
                        <span
                          className={`pf-about-platform-edu-degree font-semibold leading-[1.18] tracking-[-0.025em] ${leadClass}`}
                          style={{ color: titleColor }}
                        >
                          {headline}
                        </span>
                      </p>
                    ) : null}
                    {detail ? (
                      <span className="pf-about-platform-edu-meta-mask mt-3 block overflow-hidden">
                        <span
                          className={`pf-about-platform-edu-school block leading-relaxed ${metaClass}`}
                          style={{ color: bodyColor }}
                        >
                          <span className="pf-about-platform-edu-meta-slash" aria-hidden="true">
                            /
                          </span>
                          {detail}
                        </span>
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </AboutPlatformIndexSection>
      ) : null}

      {showInterestsBlock ? (
        <AboutPlatformIndexSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.interests}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
          className="pf-about-platform-interests"
        >
          <ul className="pf-about-platform-split-list space-y-4 sm:space-y-5 lg:space-y-6">
            {visibleInterests.map((item, index) => (
              <li
                key={`${index}-${item}`}
                className={`pf-about-platform-split-item font-semibold leading-[1.14] tracking-[-0.025em] ${leadClass}`}
                style={{ color: bodyColor, opacity: 0.88 }}
              >
                {item}
              </li>
            ))}
          </ul>
        </AboutPlatformIndexSection>
      ) : null}
    </div>
  );
}

const ABOUT_PORTRAIT_SKILLS_EASE = [0.16, 1, 0.3, 1] as const;
const ABOUT_PORTRAIT_SKILLS_CLIP_EASE = [0.77, 0, 0.175, 1] as const;
const ABOUT_PORTRAIT_SKILLS_CLIP_START = 'inset(0% 0% 0% 100%)';
const ABOUT_PORTRAIT_SKILLS_CLIP_END = 'inset(0% 0% 0% 0%)';
const ABOUT_PORTRAIT_SKILLS_INTERESTS_LABEL = 'Interests';
const ABOUT_PORTRAIT_SKILLS_LANGUAGES_LABEL = 'Languages';
const ABOUT_PORTRAIT_SKILLS_RUNWAY_STEP_VH = 56;
const ABOUT_PORTRAIT_SKILLS_INDICATOR_EASE = 'power4.out';

function portraitSkillsRunwayHeight(skillCount: number): string {
  if (skillCount <= 1) return '0px';
  return `calc(${(skillCount - 1) * ABOUT_PORTRAIT_SKILLS_RUNWAY_STEP_VH}dvh)`;
}

function aboutPortraitSkillsTween(
  reduceMotion: boolean,
  duration: number,
  delay: number,
  ease: readonly [number, number, number, number] = ABOUT_PORTRAIT_SKILLS_EASE
) {
  if (reduceMotion) {
    return { duration: 0, delay: 0 };
  }
  return { duration, delay, ease };
}

/** About · portrait skills — bold ISO code, mastery level + proportional bar underneath. */
function AboutPortraitLanguageList({
  items,
  titleColor,
}: {
  items: LanguageDisplayItem[];
  titleColor: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="pf-about-portrait-langs" role="list">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        const tone = item.level ? ABOUT_CLASSIC_LEVEL_TONE[item.level] ?? 0.72 : 0.72;
        return (
          <li
            key={item.name}
            className="pf-about-portrait-lang"
            aria-label={levelLabel ? `${item.name}, ${levelLabel}` : item.name}
          >
            <span
              className="pf-about-portrait-lang-code"
              style={{ color: titleColor, fontFamily: ABOUT_CLASSIC_SERIF }}
            >
              {code}
            </span>
            <span className="pf-about-portrait-lang-meta">
              {levelLabel ? (
                <span className="pf-about-portrait-lang-level">{levelLabel}</span>
              ) : null}
              <span className="pf-about-portrait-lang-bar" aria-hidden>
                <span
                  className="pf-about-portrait-lang-bar-fill"
                  style={{ transform: `scaleX(${tone})` }}
                />
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** About · portrait skills — sticky split frame, XXL skill rail + pinned portrait. */
function AboutPortraitSkillsLayout({
  title,
  subtitle,
  bio,
  avatarUrl,
  fullName,
  skillItems,
  strengthItems,
  interestItems,
  languageItems,
  educationItems,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showEducation,
  metaEnabled,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  contentSize,
  portraitGrayscale = false,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  languageItems: LanguageDisplayItem[];
  educationItems: ProfileEducationEntry[];
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showEducation: boolean;
  metaLead: string;
  metaEnabled: boolean;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  contentSize: PortfolioInfoPremiumFontSize;
  portraitGrayscale?: boolean;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const skillsWrapRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [scrollSkillIndex, setScrollSkillIndex] = useState(0);
  const [interactionIndex, setInteractionIndex] = useState<number | null>(null);
  const [afterMotion, setAfterMotion] = useState<'armed' | 'active' | 'done'>(
    reduceMotion ? 'done' : 'armed'
  );
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleLanguageItems = languageItems.filter((item) => item.name.trim());
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showMetaBlock =
    metaEnabled &&
    ((showInterests && visibleInterests.length > 0) ||
      (showLanguages && visibleLanguageItems.length > 0));
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showBentoBlock = showStrengthsBlock || showMetaBlock;
  const showAfterBlock = showBentoBlock || showEducationBlock;
  const scrollFocusEnabled = showSkillsBlock && visibleSkills.length > 1 && !reduceMotion;
  const skillListClass = aboutPortraitSkillsListSizeClass(contentSize);
  const bioClass = aboutPortraitSkillsBioSizeClass(contentSize);
  const strengthsTitleClass = aboutPortraitSkillsStrengthsTitleSizeClass(contentSize);
  const strengthsItemClass = aboutPortraitSkillsStrengthsItemSizeClass(contentSize);
  const metaClass = aboutPortraitSkillsMetaSizeClass(contentSize);
  const kickerClass = infoContentBodySizeClass(contentSize);
  const bioText = bio?.trim() || '';
  const kickerText = subtitle.trim() || title.trim() || 'About me';
  const displayedSkillIndex = interactionIndex ?? scrollSkillIndex;
  const safeActiveIndex =
    visibleSkills.length > 0 ? Math.min(displayedSkillIndex, visibleSkills.length - 1) : 0;
  const bioDelay = reduceMotion
    ? 0
    : 0.58 + Math.min(showSkillsBlock ? visibleSkills.length : 1, 6) * 0.075;

  const avatarSrc = avatarUrl?.trim() || '';
  const portraitName = fullName?.trim() || 'Profile';
  const initials = portraitName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const markEntryReady = useCallback(() => {
    rootRef.current?.setAttribute('data-pf-entry', 'ready');
  }, []);

  const activateSkill = useCallback((index: number) => {
    setInteractionIndex(index);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timeoutId = window.setTimeout(markEntryReady, 140);
    return () => window.clearTimeout(timeoutId);
  }, [markEntryReady, reduceMotion]);

  useEffect(() => {
    setScrollSkillIndex((prev) => {
      const max = Math.max(0, visibleSkills.length - 1);
      return prev > max ? max : prev;
    });
  }, [visibleSkills.length]);

  useEffect(() => {
    if (interactionIndex == null || !scrollFocusEnabled) return undefined;

    let active = true;
    let frame = 0;
    const clearInteraction = () => {
      if (frame || !active) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (active) setInteractionIndex(null);
      });
    };

    const scrollRoot = aboutBannerScrollParent(pinRef.current ?? rootRef.current);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', clearInteraction, { passive: true });
    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', clearInteraction);
    };
  }, [interactionIndex, scrollFocusEnabled]);

  useLayoutEffect(() => {
    const wrap = skillsWrapRef.current;
    const indicator = indicatorRef.current;
    if (!wrap || !indicator || !showSkillsBlock) return undefined;

    const elastic = indicator.dataset.pfReady === 'true' && !reduceMotion;
    const move = (animate: boolean) => {
      const buttons = wrap.querySelectorAll<HTMLElement>('.pf-about-portrait-skill-btn');
      const btn = buttons[safeActiveIndex];
      if (!btn) return;
      const wrapRect = wrap.getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      const inset = Math.max(7, rect.height * 0.14);
      gsap.to(indicator, {
        y: rect.top - wrapRect.top + inset,
        height: Math.max(18, rect.height - inset * 2),
        duration: animate ? 0.48 : 0,
        ease: ABOUT_PORTRAIT_SKILLS_INDICATOR_EASE,
        overwrite: 'auto',
      });
    };

    move(elastic);
    indicator.dataset.pfReady = 'true';

    const observer = new ResizeObserver(() => move(false));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [reduceMotion, safeActiveIndex, showSkillsBlock, visibleSkills.length]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || reduceMotion) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const scroller = aboutBannerScrollParent(root);
    const skillCount = visibleSkills.length;
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (scrollFocusEnabled) {
        media.add('(min-width: 1024px)', () => {
          const navClearance = readPortfolioNavTopClearancePx() || 88;
          const runway = pin.querySelector<HTMLElement>('.pf-about-portrait-runway');
          ScrollTrigger.create({
            trigger: pin,
            ...(scroller ? { scroller } : {}),
            start: `top top+=${navClearance}`,
            end: () => `+=${runway?.offsetHeight || 0}`,
            scrub: 0.45,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = Math.round(self.progress * (skillCount - 1));
              setScrollSkillIndex((prev) => (prev === next ? prev : next));
            },
          });
        });
      }

      const after = root.querySelector<HTMLElement>('.pf-about-portrait-after');
      if (after) {
        const title = after.querySelector<HTMLElement>('.pf-about-portrait-strengths-title');
        const badges = Array.from(
          after.querySelectorAll<HTMLElement>('.pf-about-portrait-badge-cell')
        );
        const cols = Array.from(
          after.querySelectorAll<HTMLElement>(
            '.pf-about-portrait-meta-col:not(.pf-about-portrait-meta-col--empty):not(.pf-about-portrait-meta-col--spacer)'
          )
        );
        const eduTitle = after.querySelector<HTMLElement>('.pf-about-portrait-education-title');
        const eduItems = Array.from(
          after.querySelectorAll<HTMLElement>('.pf-about-portrait-edu-item')
        );

        if (title) gsap.set(title, { autoAlpha: 0, y: 16 });
        if (badges.length) gsap.set(badges, { autoAlpha: 0, scale: 0.95 });
        if (cols.length) gsap.set(cols, { autoAlpha: 0, y: 15 });
        if (eduTitle) gsap.set(eduTitle, { autoAlpha: 0, y: 16 });
        if (eduItems.length) gsap.set(eduItems, { autoAlpha: 0, y: 15 });

        root.setAttribute('data-pf-after', 'active');
        setAfterMotion('active');

        const cascade = gsap.timeline({
          paused: true,
          defaults: { overwrite: 'auto' },
          onComplete: () => setAfterMotion('done'),
        });

        if (title) {
          cascade.to(title, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0);
        }
        if (badges.length) {
          cascade.to(
            badges,
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.36,
              stagger: 0.05,
              ease: 'power2.out',
            },
            title ? 0.08 : 0
          );
        }
        if (cols.length) {
          cascade.to(
            cols,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
              stagger: 0.08,
              ease: 'power2.out',
            },
            badges.length ? '>-0.04' : 0.06
          );
        }
        if (eduTitle) {
          cascade.to(
            eduTitle,
            { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' },
            badges.length || cols.length ? '>-0.1' : title ? 0.16 : 0
          );
        }
        if (eduItems.length) {
          cascade.to(
            eduItems,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.48,
              stagger: 0.06,
              ease: 'power2.out',
            },
            eduTitle ? '>-0.06' : '>-0.04'
          );
        }

        ScrollTrigger.create({
          trigger: after,
          ...(scroller ? { scroller } : {}),
          start: 'top 82%',
          once: true,
          onEnter: () => cascade.play(),
        });

        if (cols.length) {
          ScrollTrigger.create({
            trigger: after,
            ...(scroller ? { scroller } : {}),
            start: 'bottom 22%',
            end: 'bottom -6%',
            scrub: 0.45,
            onUpdate: (self) => {
              if (cascade.progress() < 1) return;
              gsap.set(cols, { autoAlpha: 1 - self.progress });
            },
          });
        }

        const afterBox = after.getBoundingClientRect();
        const viewRoot = scroller ?? document.documentElement;
        const viewH =
          viewRoot instanceof HTMLElement ? viewRoot.clientHeight : window.innerHeight;
        if (afterBox.top < viewH * 0.88 && afterBox.bottom > 0) {
          cascade.play();
        }
      }
    }, root);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    const refreshLater = window.setTimeout(() => ScrollTrigger.refresh(), 480);
    return () => {
      window.clearTimeout(refreshId);
      window.clearTimeout(refreshLater);
      media.revert();
      ctx.revert();
    };
  }, [
    reduceMotion,
    scrollFocusEnabled,
    showAfterBlock,
    visibleEducation.length,
    visibleInterests.length,
    visibleLanguageItems.length,
    visibleSkills.length,
    visibleStrengths.length,
  ]);

  const portraitThemeStyle = {
    '--pf-about-portrait-ink': titleColor,
    '--pf-about-portrait-soft': subtitleColor,
    '--pf-about-portrait-muted': bodyColor,
    '--pf-about-portrait-fill': cardBg,
    '--pf-about-portrait-steps': String(Math.max(visibleSkills.length - 1, 0)),
  } as CSSProperties;

  const portraitPanelClass =
    'pf-about-portrait-portrait relative min-h-[22rem] w-full overflow-hidden sm:min-h-[26rem] lg:min-h-0';

  const portraitMedia = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarSrc}
      alt={portraitName}
      className={infoPortraitImageClass(
        'pf-about-portrait-img block h-full w-full object-cover object-[50%_18%]',
        portraitGrayscale
      )}
    />
  ) : (
    <div
      className="pf-about-portrait-fallback flex h-full w-full items-center justify-center text-5xl font-semibold tracking-tight"
      style={{ backgroundColor: cardBg, color: bodyColor }}
    >
      {initials || '?'}
    </div>
  );

  const bioNode = (slot: 'desktop' | 'mobile') =>
    bioText ? (
      <motion.p
        key={`portrait-bio-${slot}`}
        className={`pf-about-portrait-bio pf-about-portrait-bio--${slot} ${bioClass}`}
        style={{ color: bodyColor }}
        data-pf-no-color-transition=""
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={aboutPortraitSkillsTween(reduceMotion, 0.82, bioDelay)}
      >
        {bioText}
      </motion.p>
    ) : null;

  return (
    <div
      ref={rootRef}
      className="pf-about-portrait-root w-full"
      data-pf-entry={reduceMotion ? 'ready' : 'armed'}
      data-pf-after={reduceMotion || !showAfterBlock ? 'done' : afterMotion}
      style={portraitThemeStyle}
    >
      <section ref={pinRef} className="pf-about-portrait-pin">
        <div className="pf-about-portrait-sticky">
          <div className="pf-about-portrait-grid">
            <motion.p
              className="pf-about-portrait-kicker"
              style={{ color: bodyColor }}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 0.88, y: 0 }}
              transition={aboutPortraitSkillsTween(reduceMotion, 0.64, 0.08)}
            >
              {kickerText}
            </motion.p>

            <div className="pf-about-portrait-stage">
              {showSkillsBlock ? (
                <div ref={skillsWrapRef} className="pf-about-portrait-skills-wrap">
                  <span
                    ref={indicatorRef}
                    className="pf-about-portrait-indicator"
                    aria-hidden
                  />
                  <ul
                    className="pf-about-portrait-skills"
                    role="list"
                    onMouseLeave={() => setInteractionIndex(null)}
                  >
                    {visibleSkills.map((skill, index) => {
                      const skillTitle = skill.title?.trim() || '';
                      const isActive = index === safeActiveIndex;
                      return (
                        <li
                          key={skill.id || `${skillTitle}-${index}`}
                          className="pf-about-portrait-skill"
                          style={{ ['--pf-about-portrait-i' as string]: index } as CSSProperties}
                        >
                          <button
                            type="button"
                            className={`pf-about-portrait-skill-btn ${
                              isActive ? 'is-active' : ''
                            } ${skillListClass}`}
                            onMouseEnter={() => activateSkill(index)}
                            onFocus={() => activateSkill(index)}
                            onClick={() => activateSkill(index)}
                            aria-pressed={isActive}
                          >
                            <span className="pf-about-portrait-skill-index tabular-nums" aria-hidden>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="pf-about-portrait-skill-mask">
                              <motion.span
                                className="pf-about-portrait-skill-title"
                                style={{ fontFamily: ABOUT_CLASSIC_SERIF }}
                                data-pf-no-color-transition=""
                                initial={reduceMotion ? false : { y: '108%' }}
                                animate={{ y: '0%' }}
                                transition={aboutPortraitSkillsTween(
                                  reduceMotion,
                                  0.92,
                                  0.26 + index * 0.078
                                )}
                              >
                                {skillTitle}
                              </motion.span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <motion.p
                  className={`pf-about-portrait-empty ${kickerClass}`}
                  style={{ color: bodyColor }}
                  data-pf-no-color-transition=""
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={aboutPortraitSkillsTween(reduceMotion, 0.7, 0.28)}
                >
                  Ajoute des skills dans Creator Studio → Information.
                </motion.p>
              )}

            </div>

            <div className={portraitPanelClass}>
              <motion.div
                className="pf-about-portrait-clip"
                data-pf-no-color-transition=""
                initial={reduceMotion ? false : { clipPath: ABOUT_PORTRAIT_SKILLS_CLIP_START }}
                animate={{ clipPath: ABOUT_PORTRAIT_SKILLS_CLIP_END }}
                transition={aboutPortraitSkillsTween(
                  reduceMotion,
                  1.24,
                  0.06,
                  ABOUT_PORTRAIT_SKILLS_CLIP_EASE
                )}
                onAnimationStart={markEntryReady}
              >
                <motion.div
                  className="pf-about-portrait-shift"
                  data-pf-no-color-transition=""
                  initial={reduceMotion ? false : { scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={aboutPortraitSkillsTween(reduceMotion, 1.4, 0.06)}
                >
                  <div className="pf-about-portrait-media" data-pf-no-color-transition="">
                    {portraitMedia}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {bioNode('desktop')}
            {bioNode('mobile')}
          </div>
        </div>
        {scrollFocusEnabled ? (
          <div
            aria-hidden
            className="pf-about-portrait-runway"
            style={{ height: portraitSkillsRunwayHeight(visibleSkills.length) }}
          />
        ) : null}
      </section>

      {showAfterBlock ? (
        <div
          className="pf-about-portrait-after"
          data-pf-bento={showStrengthsBlock ? (showMetaBlock ? 'full' : 'bring-only') : 'meta-only'}
        >
          {showBentoBlock ? (
          <div className="pf-about-portrait-bento">
            {showStrengthsBlock ? (
              <section
                className="pf-about-portrait-strengths"
                data-pf-no-color-transition=""
              >
                <div className="pf-about-portrait-strengths-head">
                  <span className="pf-about-portrait-strengths-count" aria-hidden>
                    {String(visibleStrengths.length).padStart(2, '0')}
                  </span>
                  <h3
                    className={`pf-about-portrait-strengths-title font-semibold tracking-[-0.02em] ${strengthsTitleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
                  </h3>
                </div>
                <ul className="pf-about-portrait-bring-list" role="list">
                  {visibleStrengths.map((item, index) => (
                    <li
                      key={`${index}-${item}`}
                      className="pf-about-portrait-badge-cell pf-about-portrait-bring-item"
                      data-pf-no-color-transition=""
                    >
                      <span className="pf-about-portrait-bring-index tabular-nums" aria-hidden>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`pf-about-portrait-bring-title font-medium tracking-[-0.015em] ${strengthsItemClass}`}
                        style={{ color: titleColor, fontFamily: ABOUT_CLASSIC_SERIF }}
                      >
                        {item}
                      </span>
                      <svg
                        className="pf-about-portrait-bring-arrow"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M4 10h11.5M10 4.5L16 10l-6 5.5"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {showMetaBlock ? (
              <div
                className={`pf-about-portrait-meta ${
                  showStrengthsBlock ? '' : 'pf-about-portrait-meta--solo'
                }`}
                data-pf-no-color-transition=""
              >
                {showInterests && visibleInterests.length > 0 ? (
                  <div className="pf-about-portrait-meta-col pf-about-portrait-meta-col--interests">
                    <p className="pf-about-portrait-meta-kicker" style={{ color: bodyColor }}>
                      {ABOUT_PORTRAIT_SKILLS_INTERESTS_LABEL}
                    </p>
                    <p
                      className={`pf-about-portrait-meta-interests ${metaClass}`}
                      style={{ color: titleColor, fontFamily: ABOUT_CLASSIC_SERIF }}
                    >
                      {`${visibleInterests.join(', ').replace(/[.]+$/u, '')}.`}
                    </p>
                  </div>
                ) : null}
                {showLanguages && visibleLanguageItems.length > 0 ? (
                  <div className="pf-about-portrait-meta-col pf-about-portrait-meta-col--languages">
                    <p className="pf-about-portrait-meta-kicker" style={{ color: bodyColor }}>
                      {ABOUT_PORTRAIT_SKILLS_LANGUAGES_LABEL}
                    </p>
                    <AboutPortraitLanguageList
                      items={visibleLanguageItems}
                      titleColor={titleColor}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          ) : null}

          {showEducationBlock ? (
            <section
              className={`pf-about-portrait-education ${
                showBentoBlock ? '' : 'pf-about-portrait-education--solo'
              }`}
              data-pf-no-color-transition=""
            >
              <div className="pf-about-portrait-education-head">
                <span className="pf-about-portrait-education-count" aria-hidden>
                  {String(visibleEducation.length).padStart(2, '0')}
                </span>
                <h3
                  className={`pf-about-portrait-education-title font-semibold tracking-[-0.02em] ${strengthsTitleClass}`}
                  style={{ color: subtitleColor }}
                >
                  {ABOUT_VALUE_STEPS_SECTION_LABELS.education}
                </h3>
              </div>
              <ul className="pf-about-portrait-edu-list" role="list">
                {visibleEducation.map((entry, index) => (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                    className="pf-about-portrait-edu-item"
                    data-pf-no-color-transition=""
                  >
                    <span className="pf-about-portrait-edu-heading">
                      <span className="pf-about-portrait-edu-index tabular-nums" aria-hidden>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {entry.title?.trim() ? (
                        <span
                          className={`pf-about-portrait-edu-title font-medium tracking-[-0.012em] ${strengthsItemClass}`}
                          style={{ color: titleColor, fontFamily: ABOUT_CLASSIC_SERIF }}
                        >
                          {entry.title.trim()}
                        </span>
                      ) : null}
                    </span>
                    {entry.institution?.trim() || entry.schoolYear?.trim() ? (
                      <span className="pf-about-portrait-edu-meta">
                        {entry.institution?.trim() ? (
                          <span className="pf-about-portrait-edu-institution">
                            {entry.institution.trim()}
                          </span>
                        ) : null}
                        {entry.schoolYear?.trim() ? (
                          <span className="pf-about-portrait-edu-year">
                            {entry.schoolYear.trim()}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const ABOUT_BANNER_PORTRAIT_CLIP_START =
  'inset(14% 20% 10% 8% round 2.75rem 0.45rem 2.1rem 0.8rem)';
const ABOUT_BANNER_PORTRAIT_CLIP_END = 'inset(0% 0% 0% 0% round 0rem)';

const ABOUT_BANNER_LABEL_CLASS =
  'mb-7 text-[0.72rem] font-semibold uppercase tracking-[0.22em] sm:mb-8';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** About · banner — strengths folio: ghost text badges, not a CV bullet list. */
function AboutBannerStrengthsIntro({
  label,
  strengthItems,
  textColor,
  bodyColor,
  bodyClass,
}: {
  label?: string;
  strengthItems: string[];
  textColor: string;
  bodyColor: string;
  bodyClass: string;
}) {
  const visible = strengthItems.map((item) => item.trim()).filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <section className="pf-about-banner-folio-child pf-about-banner-strengths">
      {label?.trim() ? (
        <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: bodyColor, opacity: 0.72 }}>
          {label.trim()}
        </p>
      ) : null}
      <ul className="pf-about-banner-strength-badges list-none">
        {visible.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="pf-about-banner-strength-badge-cell"
            data-pf-no-color-transition=""
          >
            <span
              className={`pf-about-banner-strength-badge font-medium tracking-[-0.018em] ${bodyClass}`}
              style={{ color: textColor }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** About · banner — skills folio: uneven magazine columns, title / whisper description. */
function AboutBannerSkillsFooter({
  label,
  skills,
  titleColor,
  bodyColor,
  bodyClass,
}: {
  label: string;
  skills: ProfileSkillEntry[];
  titleColor: string;
  bodyColor: string;
  bodyClass: string;
}) {
  const visible = skills.filter((item) => item.title?.trim());
  if (visible.length === 0) return null;

  return (
    <section className="pf-about-banner-folio-child pf-about-banner-skills">
      <p className={ABOUT_BANNER_LABEL_CLASS} style={{ color: bodyColor, opacity: 0.72 }}>
        {label}
      </p>

      <ul className="pf-about-banner-skills-grid list-none" data-count={String(visible.length)}>
        {visible.map((skill) => {
          const skillTitle = skill.title?.trim() || '';
          const skillDescription = skill.description?.trim() || '';
          return (
            <li
              key={skill.id}
              className="pf-about-banner-skill-cell min-w-0"
              data-pf-no-color-transition=""
            >
              <div className="pf-about-banner-skill min-w-0" data-pf-no-color-transition="">
                <p
                  className={`pf-about-banner-skill-title mb-4 font-medium leading-snug tracking-[-0.01em] sm:mb-5 ${bodyClass}`}
                  style={{ color: titleColor }}
                >
                  {skillTitle}
                </p>
                {skillDescription ? (
                  <p
                    className={`pf-about-banner-skill-desc text-[0.92em] leading-[1.65] ${bodyClass}`}
                    style={{ color: bodyColor, opacity: 0.82 }}
                  >
                    {skillDescription}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** About · banner — education block below strengths (left-aligned). */
function AboutBannerEducationBlock({
  educationItems,
  showEducation,
  educationLabel,
  textColor,
  bodyColor,
  bodyClass,
  metaClass,
}: {
  educationItems: ProfileEducationEntry[];
  showEducation: boolean;
  educationLabel: string;
  textColor: string;
  bodyColor: string;
  bodyClass: string;
  metaClass: string;
}) {
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  if (!showEducation || visibleEducation.length === 0) return null;

  return (
    <section className="pf-about-banner-education min-w-0 text-left">
      <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: bodyColor, opacity: 0.72 }}>
        {educationLabel}
      </p>
      <ol className="space-y-5 text-left">
        {visibleEducation.map((entry, index) => {
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const year = entry.schoolYear?.trim() || '';
          const headline = title || institution;
          const showInstitutionLine = Boolean(institution && title);

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="pf-about-banner-edu-item min-w-0"
            >
              {headline ? (
                <p
                  className={`font-medium leading-snug tracking-[-0.01em] text-[1.05rem] sm:text-[1.12rem] ${bodyClass}`}
                  style={{ color: textColor }}
                >
                  {headline}
                </p>
              ) : null}
              {showInstitutionLine || year ? (
                <p className={`mt-1.5 leading-relaxed ${metaClass}`}>
                  {showInstitutionLine ? (
                    <span className="pf-about-banner-edu-institution" style={{ color: bodyColor }}>
                      {institution}
                    </span>
                  ) : null}
                  {showInstitutionLine && year ? (
                    <span className="pf-about-banner-edu-sep" style={{ color: bodyColor }}>
                      {' · '}
                    </span>
                  ) : null}
                  {year ? (
                    <span className="pf-about-banner-edu-year" style={{ color: bodyColor }}>
                      {year}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** About · banner — interests locked with education on the folio baseline. */
function AboutBannerInterestsBlock({
  interestItems,
  showInterests,
  interestsLabel,
  textColor,
  bodyColor,
  bodyClass,
}: {
  interestItems: string[];
  showInterests: boolean;
  interestsLabel: string;
  textColor: string;
  bodyColor: string;
  bodyClass: string;
}) {
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  if (!showInterests || visibleInterests.length === 0) return null;

  return (
    <section className="pf-about-banner-interests min-w-0 text-left">
      <p className={`${ABOUT_BANNER_LABEL_CLASS} text-left`} style={{ color: bodyColor, opacity: 0.72 }}>
        {interestsLabel}
      </p>
      <p
        className={`text-left leading-[1.85] tracking-[-0.01em] text-[1.05rem] sm:text-[1.12rem] ${bodyClass}`}
        style={{ color: textColor }}
      >
        {visibleInterests.map((item, index) => (
          <span key={`${index}-${item}`}>
            {index > 0 ? (
              <span
                aria-hidden
                className="mx-2.5 select-none font-light sm:mx-3"
                style={{ color: bodyColor, opacity: 0.45 }}
              >
                /
              </span>
            ) : null}
            {item}
          </span>
        ))}
      </p>
    </section>
  );
}

/** About · banner — XXL centered headline, portrait bottom-left, bio bottom-right. */
function AboutBannerLayout({
  title: _title,
  subtitle,
  bio,
  specialty: _specialty,
  avatarUrl,
  fullName,
  skillItems,
  showSkills,
  skillsLabel,
  strengthItems,
  showStrengths,
  strengthsLabel,
  educationItems,
  interestItems,
  showEducation,
  showInterests,
  educationLabel,
  interestsLabel,
  contentSize,
  skillsTitleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  portraitGrayscale,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  skillItems: ProfileSkillEntry[];
  showSkills: boolean;
  skillsLabel: string;
  strengthItems: string[];
  showStrengths: boolean;
  strengthsLabel?: string;
  educationItems: ProfileEducationEntry[];
  interestItems: string[];
  showEducation: boolean;
  showInterests: boolean;
  educationLabel: string;
  interestsLabel: string;
  contentSize: PortfolioInfoPremiumFontSize;
  skillsTitleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  portraitGrayscale: boolean;
}) {
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const bioClass = aboutBannerBioSizeClass(contentSize);
  const bodyClass = aboutBannerContentSizeClass(contentSize);
  const metaClass = aboutBannerMetaSizeClass(contentSize);
  const showSkillsBlock = showSkills && skillItems.some((item) => item.title?.trim());
  const showStrengthsBlock = showStrengths && strengthItems.some((item) => item.trim());
  const showEducationBlock =
    showEducation &&
    educationItems.some(
      (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
    );
  const showInterestsBlock =
    showInterests && interestItems.some((item) => item.trim());
  const showFolio =
    showSkillsBlock || showStrengthsBlock || showEducationBlock || showInterestsBlock;
  const showMetaLockup = showEducationBlock || showInterestsBlock;

  const reduceMotion = useReducedMotion();
  const [motionState, setMotionState] = useState<'armed' | 'active' | 'done'>('armed');
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const scroller = aboutBannerScrollParent(root);
    const cover = root.querySelector<HTMLElement>('.pf-about-banner-cover');
    const lines = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-line-inner'));
    const portrait = root.querySelector<HTMLElement>('.pf-about-banner-portrait');
    const portraitShift = root.querySelector<HTMLElement>('.pf-about-banner-portrait-shift');
    const bio = root.querySelector<HTMLElement>('.pf-about-banner-bio');
    const skills = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-skill-cell'));
    const badges = Array.from(root.querySelectorAll<HTMLElement>('.pf-about-banner-strength-badge-cell'));
    const skillsSection = root.querySelector<HTMLElement>('.pf-about-banner-skills');
    const strengthsSection = root.querySelector<HTMLElement>('.pf-about-banner-strengths');
    const meta = root.querySelector<HTMLElement>('.pf-about-banner-folio-meta');
    const interestsShift = root.querySelector<HTMLElement>('.pf-about-banner-interests-shift');

    const stopWatchers: Array<() => void> = [];
    const media = gsap.matchMedia();

    const ctx = gsap.context(() => {
      if (cover) {
        if (lines.length) {
          gsap.set(lines, { y: '108%', clipPath: 'inset(100% 0 0 0)' });
        }
        if (portrait) {
          gsap.set(portrait, { clipPath: ABOUT_BANNER_PORTRAIT_CLIP_START });
        }
        if (portraitShift) {
          gsap.set(portraitShift, { scale: 1.1 });
        }
        if (bio) {
          gsap.set(bio, { x: 72, autoAlpha: 0 });
        }

        /* Kill CSS safety as soon as GSAP owns the nodes — do not wait for play(). */
        setMotionState('active');

        const coverIntro = gsap.timeline({
          paused: true,
          defaults: { ease: 'power2.out' },
          onComplete: () => setMotionState('done'),
        });

        if (lines.length) {
          coverIntro.to(
            lines,
            {
              y: '0%',
              clipPath: 'inset(0% 0 0 0)',
              duration: 0.98,
              stagger: 0.12,
            },
            0
          );
        }
        if (portrait) {
          coverIntro.to(
            portrait,
            { clipPath: ABOUT_BANNER_PORTRAIT_CLIP_END, duration: 1.2 },
            0.22
          );
        }
        if (portraitShift) {
          coverIntro.to(portraitShift, { scale: 1, duration: 1.28 }, 0.22);
        }
        if (bio) {
          coverIntro.to(bio, { x: 0, autoAlpha: 1, duration: 0.95 }, 0.38);
        }

        stopWatchers.push(
          aboutBannerWatchEnter(cover, scroller, () => {
            coverIntro.play();
          })
        );
      }

      if (skills.length && skillsSection) {
        gsap.set(skills, { y: 36, autoAlpha: 0 });
        const skillsIntro = gsap.to(skills, {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power2.out',
          paused: true,
        });
        stopWatchers.push(
          aboutBannerWatchEnter(skillsSection, scroller, () => {
            skillsIntro.play();
          })
        );
      }

      if (badges.length && strengthsSection) {
        gsap.set(badges, { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%' });
        const badgesIntro = gsap.to(badges, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
          paused: true,
        });
        stopWatchers.push(
          aboutBannerWatchEnter(strengthsSection, scroller, () => {
            badgesIntro.play();
          })
        );
      }

      media.add('(min-width: 1024px)', () => {
        if (!meta || !interestsShift) return undefined;
        gsap.fromTo(
          interestsShift,
          { y: 0, autoAlpha: 1 },
          {
            y: () => -Math.round(Math.max(48, meta.offsetHeight * 0.25)),
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: meta,
              ...(scroller ? { scroller } : {}),
              start: 'top 80%',
              end: 'bottom top',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
        return undefined;
      });
    }, root);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);
    const refreshLater = window.setTimeout(() => ScrollTrigger.refresh(), 480);
    return () => {
      window.clearTimeout(refreshId);
      window.clearTimeout(refreshLater);
      stopWatchers.forEach((stop) => stop());
      media.revert();
      ctx.revert();
    };
  }, [
    reduceMotion,
    showSkillsBlock,
    showStrengthsBlock,
    showMetaLockup,
    showEducationBlock,
    showInterestsBlock,
    skillItems.length,
    strengthItems.length,
  ]);

  const motionMode = reduceMotion ? 'reduce' : motionState;

  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const portraitName = fullName?.trim() || 'Profile';

  return (
    <div
      ref={rootRef}
      className="pf-about-banner relative z-[1] w-full"
      data-pf-motion={motionMode}
    >
      <div className="pf-about-banner-cover flex w-full flex-col px-6 pt-8 sm:px-10 sm:pt-10 lg:px-16 lg:pt-14 xl:px-20">
        <div className="pf-about-banner-pair grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)] items-end sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <div className="pf-about-banner-portrait-frame">
            <div
              className="pf-about-banner-portrait aspect-[3/4] w-full overflow-hidden"
              style={{ backgroundColor: cardBg }}
              data-pf-no-color-transition=""
            >
              <div
                className="pf-about-banner-portrait-shift h-full w-full"
                data-pf-no-color-transition=""
              >
                <div
                  className="pf-about-banner-portrait-zoom h-full w-full"
                  data-pf-no-color-transition=""
                >
                  {avatarUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl.trim()}
                      alt={portraitName}
                      className={infoPortraitImageClass(
                        'pf-about-banner-portrait-img block h-full w-full object-cover object-[50%_18%]',
                        portraitGrayscale
                      )}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight"
                      style={{ color: bodyColor }}
                    >
                      {initials || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pf-about-banner-bio-slot min-w-0">
            <blockquote
              className={`pf-about-banner-bio border-l pl-5 italic leading-[1.4] sm:pl-6 ${bioClass}`}
              style={{
                color: bodyColor,
                borderColor: cardBorder,
                fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              }}
              data-pf-no-color-transition=""
            >
              {bioText ? (
                bioText
              ) : (
                <span className="opacity-60">Add a bio in Creator Studio → Information.</span>
              )}
            </blockquote>
          </div>
        </div>
      </div>

      {showFolio ? (
        <div
          className="pf-about-banner-folio px-6 sm:px-10 lg:px-16 xl:px-20"
          style={{ borderColor: cardBorder }}
        >
          {showSkillsBlock ? (
            <AboutBannerSkillsFooter
              label={skillsLabel}
              skills={skillItems}
              titleColor={skillsTitleColor}
              bodyColor={bodyColor}
              bodyClass={bodyClass}
            />
          ) : null}

          {showStrengthsBlock ? (
            <AboutBannerStrengthsIntro
              label={strengthsLabel}
              strengthItems={strengthItems}
              textColor={subtitleColor}
              bodyColor={bodyColor}
              bodyClass={bodyClass}
            />
          ) : null}

          {showMetaLockup ? (
            <div className="pf-about-banner-folio-child pf-about-banner-folio-meta">
              <AboutBannerEducationBlock
                educationItems={educationItems}
                showEducation={showEducation}
                educationLabel={educationLabel}
                textColor={subtitleColor}
                bodyColor={bodyColor}
                bodyClass={bodyClass}
                metaClass={metaClass}
              />
              {showInterestsBlock ? (
                <div
                  className="pf-about-banner-interests-shift"
                  data-pf-no-color-transition=""
                >
                  <AboutBannerInterestsBlock
                    interestItems={interestItems}
                    showInterests={showInterests}
                    interestsLabel={interestsLabel}
                    textColor={subtitleColor}
                    bodyColor={bodyColor}
                    bodyClass={bodyClass}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const ABOUT_SPLIT_EASE = [0.16, 1, 0.3, 1] as const;
const ABOUT_SPLIT_CLIP_EASE = [0.77, 0, 0.175, 1] as const;

const ABOUT_SPLIT_LANG_CODES: Record<string, string> = {
  francais: 'FR',
  french: 'FR',
  english: 'EN',
  espanol: 'ES',
  spanish: 'ES',
  deutsch: 'DE',
  german: 'DE',
  italiano: 'IT',
  italian: 'IT',
  portugues: 'PT',
  portuguese: 'PT',
  arabic: 'AR',
  chinese: 'ZH',
  japanese: 'JA',
  korean: 'KO',
  russian: 'RU',
  nederlands: 'NL',
  dutch: 'NL',
  [spokenLanguageMatchKey('العربية')]: 'AR',
  [spokenLanguageMatchKey('中文')]: 'ZH',
  [spokenLanguageMatchKey('日本語')]: 'JA',
  [spokenLanguageMatchKey('한국어')]: 'KO',
  [spokenLanguageMatchKey('Русский')]: 'RU',
};

function aboutSplitLanguageCode(name: string): string {
  const trimmed = name.trim();
  const key = spokenLanguageMatchKey(trimmed);
  if (ABOUT_SPLIT_LANG_CODES[key]) return ABOUT_SPLIT_LANG_CODES[key];
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const locale = trimmed.match(/^([a-z]{2})[-_][a-z]{2}$/i);
  if (locale) return locale[1].toUpperCase();
  const latin = trimmed.replace(/[^a-zA-Z]/g, '');
  if (latin.length >= 2) return latin.slice(0, 2).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

function AboutSplitSectionHeading({
  label,
  titleColor,
  meta,
  metaColor,
  metaClass,
  metaAriaLabel,
}: {
  label: string;
  titleColor: string;
  meta?: string;
  metaColor?: string;
  metaClass?: string;
  metaAriaLabel?: string;
}) {
  return (
    <div className="pf-about-split-section-head">
      <h3 className="pf-about-split-section-title" style={{ color: titleColor }}>
        {label}
      </h3>
      {meta ? (
        <span
          className={`pf-about-split-section-meta tabular-nums ${metaClass ?? ''}`}
          style={{ color: metaColor }}
          aria-label={metaAriaLabel}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}

/** About · split — numbered skill rows in content column (titles only, no descriptions). */
function AboutSplitSkillsList({
  label,
  skills,
  accent,
  titleColor,
  bodyColor,
  bodyClass,
  metaClass,
  reduceMotion,
}: {
  label: string;
  skills: ProfileSkillEntry[];
  accent: string;
  titleColor: string;
  bodyColor: string;
  bodyClass: string;
  metaClass: string;
  reduceMotion: boolean;
}) {
  const countLabel = String(skills.length).padStart(2, '0');

  return (
    <>
      <AboutSplitSectionHeading
        label={label}
        titleColor={titleColor}
        meta={countLabel}
        metaColor={bodyColor}
        metaClass={metaClass}
        metaAriaLabel={`${skills.length} skills`}
      />
      <ul className={`pf-about-split-skills ${bodyClass}`} data-pf-no-color-transition="">
        {skills.map((skill, index) => {
          const skillTitle = skill.title?.trim();
          if (!skillTitle) return null;
          return (
            <motion.li
              key={skill.id}
              className="pf-about-split-skill"
              style={{ ['--i' as string]: index } as CSSProperties}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={reduceMotion ? undefined : { once: true, amount: 0.55 }}
              transition={{
                duration: 0.7,
                delay: reduceMotion ? 0 : index * 0.07,
                ease: ABOUT_SPLIT_EASE,
              }}
            >
              <span
                className={`pf-about-split-skill-index tabular-nums ${metaClass}`}
                style={{ color: accent }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="pf-about-split-skill-title" style={{ color: titleColor }}>
                {skillTitle}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}

/** About · split — offset typographic tags (liseré hover, not chips). */
function AboutSplitStrengthsList({
  items,
  bodyClass,
  reduceMotion,
}: {
  items: string[];
  bodyClass: string;
  reduceMotion: boolean;
}) {
  return (
    <ul className={`pf-about-split-strengths ${bodyClass}`}>
      {items.map((item, index) => (
        <motion.li
          key={`${index}-${item}`}
          className="pf-about-split-strength"
          style={{ ['--i' as string]: index } as CSSProperties}
          data-pf-no-color-transition=""
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={reduceMotion ? undefined : { once: true, amount: 0.4 }}
          transition={{
            duration: 0.6,
            delay: reduceMotion ? 0 : index * 0.055,
            ease: ABOUT_SPLIT_EASE,
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

/** About · split — typographic languages only (no gauges, no flags). */
function AboutSplitLanguageList({
  items,
  accent,
  bodyClass,
  reduceMotion,
}: {
  items: LanguageDisplayItem[];
  accent: string;
  bodyClass: string;
  reduceMotion: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={`pf-about-split-langs ${bodyClass}`}>
      {items.map((item, index) => {
        const code = aboutSplitLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        return (
          <motion.li
            key={item.name}
            className="pf-about-split-lang"
            style={{ ['--i' as string]: index } as CSSProperties}
            data-pf-no-color-transition=""
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={reduceMotion ? undefined : { once: true, amount: 0.45 }}
            transition={{
              duration: 0.58,
              delay: reduceMotion ? 0 : index * 0.05,
              ease: ABOUT_SPLIT_EASE,
            }}
          >
            <span className="pf-about-split-lang-id">
              <span className="pf-about-split-lang-code">{code}</span>
              <span className="pf-about-split-lang-name">{item.name}</span>
            </span>
            {levelLabel ? (
              <span className="pf-about-split-lang-level" style={{ color: accent }}>
                {levelLabel}
              </span>
            ) : null}
          </motion.li>
        );
      })}
    </ul>
  );
}

function AboutSplitLayout({
  title: _title,
  subtitle: _subtitle,
  bio: _bio,
  specialty,
  avatarUrl,
  fullName,
  educationItems,
  skillItems,
  strengthItems,
  languageItems,
  toolItems,
  showEducation,
  showSkills,
  showStrengths,
  showLanguages,
  showSystemsTools,
  languageLevelStyle: _languageLevelStyle,
  showLanguageFlags: _showLanguageFlags,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
  portraitSide,
  sectionLabels,
  portraitGrayscale,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  showLanguageFlags: boolean;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  portraitSide: PortfolioInfoAboutSplitPortraitSide;
  sectionLabels: AboutSplitSectionLabels;
  portraitGrayscale: boolean;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const specialtyHeadline = specialty?.trim() || 'Software engineer';
  const portraitName = fullName?.trim() || 'Profile';

  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showEducationBlock = showEducation && educationItems.length > 0;
  const showSystemsBlock = showSystemsTools && toolItems.length > 0;

  const portraitPlateMuted = 'rgba(216, 201, 181, 0.92)';
  const splitPortraitPanelClass =
    'lg:sticky lg:self-start lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1rem)] lg:h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-2.15rem)] lg:max-h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-2.15rem)]';

  const portraitOnRight = portraitSide === 'right';
  const portraitClipFrom = portraitOnRight ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';

  const markEntryReady = useCallback(() => {
    rootRef.current?.setAttribute('data-pf-entry', 'ready');
  }, []);

  const splitThemeStyle = {
    '--pf-about-split-accent': accent,
    '--pf-about-split-ink': titleColor,
    '--pf-about-split-soft': subtitleColor,
    '--pf-about-split-muted': bodyColor,
    '--pf-about-split-line': cardBorder,
    '--pf-about-split-fill': cardBg,
  } as CSSProperties;

  const splitSectionMotion = reduceMotion
    ? undefined
    : { opacity: 0, y: 18 };
  const splitSectionVisible = { opacity: 1, y: 0 };

  return (
    <div
      ref={rootRef}
      className="pf-about-split relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 lg:static lg:w-full lg:max-w-none lg:translate-x-0"
      data-pf-entry={reduceMotion ? 'ready' : 'armed'}
      data-portrait-side={portraitOnRight ? 'end' : 'start'}
      style={splitThemeStyle}
    >
      <div
        className={`pf-about-split-grid flex min-h-0 flex-col lg:items-start ${
          portraitOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        <div
          className={`pf-about-split-portrait relative mb-3 mt-3 h-[min(58vh,36rem)] w-full shrink-0 overflow-hidden lg:mb-0 lg:mt-0 lg:w-[42%] xl:w-[40%] ${splitPortraitPanelClass}`}
        >
          <motion.div
            className="pf-about-split-portrait-clip"
            data-pf-no-color-transition=""
            initial={reduceMotion ? false : { clipPath: portraitClipFrom }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.22, ease: ABOUT_SPLIT_CLIP_EASE }}
            onAnimationStart={markEntryReady}
          >
            <div className="pf-about-split-portrait-shift" data-pf-no-color-transition="">
              <div className="pf-about-split-portrait-media" data-pf-no-color-transition="">
                {avatarUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl.trim()}
                    alt={portraitName}
                    className={infoPortraitImageClass(
                      'block h-full w-full object-cover object-[50%_18%]',
                      portraitGrayscale
                    )}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-4xl font-semibold tracking-tight"
                    style={{ backgroundColor: cardBg, color: bodyColor }}
                  >
                    {initials || '?'}
                  </div>
                )}
              </div>
            </div>
            <div className="pf-about-split-portrait-veil" aria-hidden />
            <motion.div
              className="pf-about-split-plate"
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.72, ease: ABOUT_SPLIT_EASE }}
            >
              <p className="pf-about-split-plate-name">{portraitName}</p>
              <p className="pf-about-split-plate-role" style={{ color: portraitPlateMuted }}>
                {specialtyHeadline}
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div
          className={`pf-about-split-copy min-w-0 flex-1 ${
            portraitOnRight ? 'pf-about-split-copy--before-portrait' : 'pf-about-split-copy--after-portrait'
          }`}
        >
          {showSkillsBlock ? (
            <section className="pf-about-split-section pf-about-split-section--skills">
              <AboutSplitSkillsList
                label={sectionLabels.skills}
                skills={visibleSkills}
                accent={accent}
                titleColor={titleColor}
                bodyColor={bodyColor}
                bodyClass={bodyClass}
                metaClass={metaClass}
                reduceMotion={reduceMotion}
              />
            </section>
          ) : null}

          {showStrengthsBlock ? (
            <section className="pf-about-split-section pf-about-split-section--tags">
              <AboutSplitSectionHeading label={sectionLabels.strengths} titleColor={titleColor} />
              <AboutSplitStrengthsList
                items={visibleStrengths}
                bodyClass={bodyClass}
                reduceMotion={reduceMotion}
              />
            </section>
          ) : null}

          {showLanguagesBlock ? (
            <motion.section
              className="pf-about-split-section pf-about-split-section--langs"
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : splitSectionMotion}
              whileInView={reduceMotion ? undefined : splitSectionVisible}
              viewport={reduceMotion ? undefined : { once: true, amount: 0.18 }}
              transition={{ duration: 0.7, delay: 0.05, ease: ABOUT_SPLIT_EASE }}
            >
              <AboutSplitSectionHeading label={sectionLabels.languages} titleColor={titleColor} />
              <AboutSplitLanguageList
                items={languageItems}
                accent={accent}
                bodyClass={bodyClass}
                reduceMotion={reduceMotion}
              />
            </motion.section>
          ) : null}

          {showEducationBlock ? (
            <motion.section
              className="pf-about-split-section"
              style={{ borderColor: cardBorder }}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : splitSectionMotion}
              whileInView={reduceMotion ? undefined : splitSectionVisible}
              viewport={reduceMotion ? undefined : { once: true, amount: 0.16 }}
              transition={{ duration: 0.7, ease: ABOUT_SPLIT_EASE }}
            >
              <AboutSplitSectionHeading label="Education" titleColor={titleColor} />
              <ul className={`pf-about-split-edu ${bodyClass}`}>
                {educationItems.map((entry) => (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}`}
                    className="pf-about-split-edu-item"
                    style={{ color: bodyColor }}
                  >
                    {entry.title?.trim() ? (
                      <span className="font-medium" style={{ color: titleColor }}>
                        {entry.title.trim()}
                      </span>
                    ) : null}
                    {entry.institution?.trim() ? (
                      <span className="mt-0.5 block opacity-80">{entry.institution.trim()}</span>
                    ) : null}
                    {entry.schoolYear?.trim() ? (
                      <span className={`mt-0.5 block opacity-70 ${metaClass}`}>
                        {entry.schoolYear.trim()}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {showSystemsBlock ? (
            <motion.section
              className="pf-about-split-section"
              style={{ borderColor: cardBorder }}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : splitSectionMotion}
              whileInView={reduceMotion ? undefined : splitSectionVisible}
              viewport={reduceMotion ? undefined : { once: true, amount: 0.16 }}
              transition={{ duration: 0.7, ease: ABOUT_SPLIT_EASE }}
            >
              <AboutSplitSectionHeading label="Systems & tools" titleColor={titleColor} />
              <InfoBulletList
                items={toolItems}
                accent={accent}
                body={bodyColor}
                square
                bodySizeClass={bodyClass}
              />
            </motion.section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Vertical rhythm between manifesto folio blocks. */
const MANIFESTO_BLOCK_SPACING = 'mt-14 sm:mt-16 lg:mt-20';

const ABOUT_MANIFESTO_SERIF = ABOUT_CLASSIC_SERIF;

function manifestoBlockCellClass(
  index: number,
  layout: PortfolioInfoAboutManifestoBlocksLayout
): string {
  if (layout === 'zigzag') {
    const even = index % 2 === 0;
    const side = even
      ? 'lg:justify-self-start lg:mr-auto'
      : 'lg:justify-self-end lg:ml-auto';
    const width = even
      ? 'lg:max-w-[min(100%,46rem)]'
      : 'lg:max-w-[min(100%,34rem)]';
    const shift = even ? '' : 'lg:mt-3';
    return `min-w-0 w-full ${width} ${side} ${shift}`.trim();
  }

  const gridSlots = [
    'lg:col-span-7 lg:pr-[min(8%,2.25rem)]',
    'lg:col-span-5 lg:mt-14',
    'lg:col-span-5 lg:mt-2',
    'lg:col-span-7 lg:mt-10 lg:pl-[min(6%,1.75rem)]',
  ];
  return `min-w-0 ${gridSlots[index % gridSlots.length]}`;
}

function getManifestoScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function useManifestoBlocksScrollFocus(enabled: boolean, blockCount: number) {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const setBlockRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      blockRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    if (!enabled || blockCount <= 1) {
      setFocusedIndex(0);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const refs = blockRefs.current.slice(0, blockCount).filter(Boolean) as HTMLDivElement[];
      if (refs.length === 0) return;

      const scrollRoot = getManifestoScrollParent(refs[0]);
      const centerY = scrollRoot
        ? (() => {
            const rootRect = scrollRoot.getBoundingClientRect();
            return rootRect.top + rootRect.height / 2;
          })()
        : window.innerHeight / 2;

      let bestIndex = 0;
      let bestDistance = Infinity;
      refs.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const distance = Math.abs(blockCenter - centerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      setFocusedIndex((prev) => (prev === bestIndex ? prev : bestIndex));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    const scrollRoot = getManifestoScrollParent(blockRefs.current[0]);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled, blockCount]);

  return { setBlockRef, focusedIndex };
}

function manifestoBlockFocusClass(isFocused: boolean, scrollFocus: boolean): string {
  if (!scrollFocus) return '';
  return isFocused
    ? 'opacity-100 blur-none'
    : 'opacity-[0.62] blur-[1px] saturate-[0.9]';
}

function manifestoPadIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function manifestoMonogramLetters(fullName?: string | null): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const take = Math.min(parts.length, 3);
  return parts
    .slice(0, take)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Drop a repeated 3+ word lead on consecutive skills (01/02 "Designing and building…"). */
function manifestoCollapseSkillLeads(labels: string[]): string[] {
  return labels.map((label, index, all) => {
    if (index === 0) return label;
    const prevWords = all[index - 1].split(/\s+/).filter(Boolean);
    const words = label.split(/\s+/).filter(Boolean);
    let shared = 0;
    while (
      shared < prevWords.length &&
      shared < words.length - 1 &&
      prevWords[shared].toLowerCase() === words[shared].toLowerCase()
    ) {
      shared += 1;
    }
    if (shared < 3) return label;
    return words.slice(shared).join(' ');
  });
}

const MANIFESTO_BLOCK_FOCUS_TRANSITION =
  'transition-[filter,opacity] duration-500 ease-out will-change-[filter,opacity]';

/** Manifesto — vertical education index; scales cleanly with multiple entries. */
function ManifestoEducationList({
  entries,
  accent,
  labelColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  includeLabel = true,
}: {
  entries: ProfileEducationEntry[];
  accent: string;
  labelColor?: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  includeLabel?: boolean;
}) {
  const visible = entries.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  if (visible.length === 0) return null;

  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const titleClass = infoContentBodySizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);

  return (
    <div>
      {includeLabel ? (
        <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
        Education
        </ManifestoSectionLabel>
      ) : null}
      <ol className={`pf-about-manifesto-edu ${includeLabel ? 'mt-5' : 'mt-0'}`}>
        {visible.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const headline = title || institution;
          const subline = title && institution ? institution : '';

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="pf-about-manifesto-edu-row grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,8.75rem)_1fr] sm:gap-x-10"
            >
              <span
                className={`pf-about-manifesto-edu-year tabular-nums tracking-[0.08em] sm:pt-0.5 ${metaClass}`}
                style={{ color: `color-mix(in srgb, ${accent} 58%, white)` }}
              >
                {year || '—'}
              </span>
              <div className="min-w-0">
                {headline ? (
                  <p
                    className={`pf-about-manifesto-edu-title font-medium leading-snug ${titleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {headline}
                  </p>
                ) : null}
                {subline ? (
                  <p
                    className={`pf-about-manifesto-edu-school mt-1 leading-relaxed ${bodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {subline}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ManifestoSectionLabel({
  children,
  accent,
  color,
  contentSize = 'medium',
}: {
  children: string;
  accent?: string;
  color?: string;
  contentSize?: PortfolioInfoPremiumFontSize;
}) {
  const labelClass = infoContentLabelSizeClass(contentSize);
  return (
    <p
      className={`pf-about-manifesto-label font-medium uppercase tracking-[0.22em] ${labelClass}`}
      style={{ color: color ?? accent }}
    >
      <span className="pf-about-manifesto-line-mask">
        <span className="pf-about-manifesto-line-shift">{children}</span>
      </span>
    </p>
  );
}

function ManifestoEditorialList({
  items,
  bodyColor,
  bodySizeClass,
  numbered = false,
  quiet = false,
  indexColor,
}: {
  items: string[];
  bodyColor: string;
  bodySizeClass: string;
  numbered?: boolean;
  quiet?: boolean;
  indexColor?: string;
}) {
  return (
    <ul
      className={`pf-about-manifesto-list ${
        numbered ? 'pf-about-manifesto-list--indexed' : ''
      } ${quiet ? 'pf-about-manifesto-list--quiet' : ''}`}
    >
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={`pf-about-manifesto-item leading-relaxed ${bodySizeClass}`}
          style={quiet ? undefined : { color: bodyColor }}
        >
          <span className="pf-about-manifesto-line-mask">
            <span className="pf-about-manifesto-line-shift">
              {numbered ? (
                <span
                  className="pf-about-manifesto-item-index"
                  aria-hidden
                  style={indexColor ? { color: indexColor } : undefined}
                >
                  {manifestoPadIndex(index)}
                </span>
              ) : null}
              <span className="pf-about-manifesto-item-text">{item}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Skills + Strengths + Languages — one aligned index row. */
function ManifestoIndexGrid({
  skillLabels,
  strengthItems,
  languageItems,
  showSkills,
  showStrengths,
  showLanguages,
  accent,
  labelColor,
  bodyColor,
  subtitleColor,
  contentSize,
  motionOff: _motionOff = false,
}: {
  skillLabels: string[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  showSkills: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  accent: string;
  labelColor?: string;
  bodyColor: string;
  subtitleColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
  motionOff?: boolean;
}) {
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  const showLangCol = showLanguages && languageItems.length > 0;
  if (!showSkillsCol && !showStrengthsCol && !showLangCol) return null;

  const bodySizeClass = infoContentBodySizeClass(contentSize);
  const langBodyClass = infoContentBodySizeClass(contentSize);
  const colCount = [showSkillsCol, showStrengthsCol, showLangCol].filter(Boolean).length;
  const indexColor = `color-mix(in srgb, ${accent} 58%, white)`;

  return (
    <div className="pf-about-manifesto-pair-grid" data-cols={colCount}>
      {showSkillsCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="skills">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              Skills
            </ManifestoSectionLabel>
            <ManifestoEditorialList
              items={skillLabels}
              bodyColor={bodyColor}
              bodySizeClass={bodySizeClass}
              numbered
              indexColor={indexColor}
            />
          </div>
        </div>
      ) : null}
      {showStrengthsCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="strengths">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              Strengths
            </ManifestoSectionLabel>
            <ManifestoEditorialList
              items={strengthItems}
              bodyColor={bodyColor}
              bodySizeClass={bodySizeClass}
              quiet
            />
          </div>
        </div>
      ) : null}
      {showLangCol ? (
        <div className="pf-about-manifesto-col-shell min-h-0 h-full min-w-0" data-col="languages">
          <div className="pf-about-manifesto-col">
            <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
              Languages
            </ManifestoSectionLabel>
            <ManifestoLanguageRail
              items={languageItems}
              codeColor={subtitleColor}
              bodySizeClass={langBodyClass}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ManifestoDetailsBlocks({
  blocks,
  blocksLayout,
  blocksScrollFocus,
}: {
  blocks: { key: string; node: ReactNode }[];
  blocksLayout: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus: boolean;
  motionOff?: boolean;
}) {
  const scrollFocusActive = blocksScrollFocus && blocks.length > 1;
  const { setBlockRef, focusedIndex } = useManifestoBlocksScrollFocus(
    scrollFocusActive,
    blocks.length
  );

  const renderBlock = (block: { key: string; node: ReactNode }, index: number) => (
    <div
      key={block.key}
      ref={scrollFocusActive ? setBlockRef(index) : undefined}
      className={`pf-about-manifesto-block ${manifestoBlockCellClass(index, blocksLayout)} ${
        scrollFocusActive ? MANIFESTO_BLOCK_FOCUS_TRANSITION : ''
      } ${manifestoBlockFocusClass(focusedIndex === index, scrollFocusActive)}`}
    >
      {block.node}
    </div>
  );

  if (blocksLayout === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-10 lg:gap-y-16 xl:gap-x-14 xl:gap-y-20">
        {blocks.map(renderBlock)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:gap-y-14 xl:gap-y-16">
      {blocks.map(renderBlock)}
    </div>
  );
}

function ManifestoDetailsSection({
  educationItems,
  skillItems,
  strengthItems,
  interestItems,
  toolItems,
  showEducation,
  showSkills,
  showStrengths,
  showInterests,
  showSystemsTools,
  accent,
  labelColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  blocksLayout = 'grid',
  blocksScrollFocus = false,
  sectionTopClass = MANIFESTO_BLOCK_SPACING,
  motionOff = false,
}: {
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showSystemsTools: boolean;
  accent: string;
  labelColor?: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  blocksLayout?: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus?: boolean;
  sectionTopClass?: string;
  motionOff?: boolean;
}) {
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showEduBlock = showEducation && visibleEducation.length > 0;
  const showInterestsBlock = showInterests && interestItems.length > 0;
  const showToolsBlock = showSystemsTools && toolItems.length > 0;
  const bodySizeClass = infoContentBodySizeClass(contentSize);

  if (!showEduBlock && !showInterestsBlock && !showToolsBlock) {
    return null;
  }

  const blocks: { key: string; node: ReactNode }[] = [];

  if (showEduBlock) {
    blocks.push({
      key: 'education',
      node: (
        <ManifestoEducationList
          entries={educationItems}
            accent={accent}
          labelColor={labelColor}
          subtitleColor={subtitleColor}
            bodyColor={bodyColor}
          cardBorder={cardBorder}
          contentSize={contentSize}
        />
      ),
    });
  }

  if (showInterestsBlock) {
    blocks.push({
      key: 'interests',
      node: (
        <>
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            Interests
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={interestItems}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
        </>
      ),
    });
  }

  if (showToolsBlock) {
    blocks.push({
      key: 'tools',
      node: (
        <>
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            Systems &amp; tools
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={toolItems}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
        </>
      ),
    });
  }

  return (
    <section className={`pf-about-manifesto-details ${sectionTopClass}`}>
      <ManifestoDetailsBlocks
        blocks={blocks}
        blocksLayout={blocksLayout}
        blocksScrollFocus={blocksScrollFocus}
        motionOff={motionOff}
      />
    </section>
  );
}

const MANIFESTO_PORTRAIT_SIZE_CLASS = 'w-full max-w-[20rem]';
const MANIFESTO_PORTRAIT_RECT_CLASS = 'w-full max-w-[17.5rem]';
const MANIFESTO_PORTRAIT_COMPACT_CLASS = 'size-[4.25rem] sm:size-[4.75rem]';
const MANIFESTO_PORTRAIT_COMPACT_RECT_CLASS = 'w-[4.25rem] sm:w-[4.75rem]';

function manifestoStatementSizeClass(size: PortfolioInfoPremiumFontSize, isLong: boolean): string {
  if (isLong) {
    switch (size) {
      case 'small':
        return 'pf-about-manifesto-statement--long text-[clamp(1.55rem,4.2vw,2.9rem)]';
      case 'large':
        return 'pf-about-manifesto-statement--long text-[clamp(1.95rem,5.1vw,3.6rem)]';
      case 'xlarge':
        return 'pf-about-manifesto-statement--long text-[clamp(2.15rem,5.5vw,3.95rem)]';
      case 'xxlarge':
        return 'pf-about-manifesto-statement--long text-[clamp(2.35rem,5.9vw,4.3rem)]';
      default:
        return 'pf-about-manifesto-statement--long text-[clamp(1.75rem,4.7vw,3.35rem)]';
    }
  }
  switch (size) {
    case 'small':
      return 'text-[clamp(2.2rem,6.5vw,4.2rem)]';
    case 'large':
      return 'text-[clamp(2.85rem,7.8vw,5.25rem)]';
    case 'xlarge':
      return 'text-[clamp(3.2rem,8.4vw,5.85rem)]';
    case 'xxlarge':
      return 'text-[clamp(3.55rem,9vw,6.45rem)]';
    default:
      return 'text-[clamp(2.5rem,7.2vw,4.85rem)]';
  }
}

function splitManifestoStatementLines(text: string): string[] {
  const explicit = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit.slice(0, 4);

  const normalized = (explicit[0] ?? text.replace(/\s+/g, ' ').trim()).trim();
  if (!normalized) return [];
  const words = normalized.split(' ');
  if (words.length <= 3) return [normalized];

  const conjunction = normalized.match(/^(.*?)\s+(and|et|&|or|ou)\s+(.+)$/i);
  if (conjunction && conjunction[1].length >= 14 && conjunction[3].split(' ').length >= 2) {
    return [`${conjunction[1]}`, `${conjunction[2]} ${conjunction[3]}`].slice(0, 3);
  }

  const punct = normalized.match(/^(.{14,}?[,;—–])\s+(.+)$/);
  if (punct && punct[2].split(' ').length >= 2) {
    return [punct[1], punct[2]].slice(0, 3);
  }

  const maxChars = normalized.length > 72 ? 42 : 26;
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && next.length > maxChars && lines.length < 3) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function ManifestoStatementReveal({
  text,
  className,
  color,
  extraStyle,
}: {
  text: string;
  className: string;
  color: string;
  extraStyle?: CSSProperties;
}) {
  const lines = splitManifestoStatementLines(text);

  return (
    <h2
      className={`pf-about-manifesto-statement ${className}`}
      style={{ color, fontFamily: ABOUT_MANIFESTO_SERIF, ...extraStyle }}
      aria-label={text}
    >
      <span className="pf-about-manifesto-statement-lines" aria-hidden="true">
        {lines.map((line, index) => (
          <span key={`${index}-${line.slice(0, 28)}`} className="pf-about-manifesto-line">
            <span className="pf-about-manifesto-line-inner">{line}</span>
          </span>
        ))}
      </span>
    </h2>
  );
}

function ManifestoPortraitFrame({
  frame,
  avatarSrc,
  initials,
  monogram,
  fullName,
  avatarGrayscale,
  accent,
  cardBg,
  subtitleColor,
  compact = false,
}: {
  frame: PortfolioInfoAboutManifestoPortraitFrame;
  avatarSrc: string;
  initials: string;
  monogram: string;
  fullName?: string | null;
  avatarGrayscale: boolean;
  accent: string;
  cardBg: string;
  subtitleColor: string;
  compact?: boolean;
}) {
  const imageClass = `h-full w-full object-cover object-center ${avatarGrayscale ? 'grayscale' : ''}`;
  const squareClass = compact ? MANIFESTO_PORTRAIT_COMPACT_CLASS : MANIFESTO_PORTRAIT_SIZE_CLASS;
  const rectClass = compact ? MANIFESTO_PORTRAIT_COMPACT_RECT_CLASS : MANIFESTO_PORTRAIT_RECT_CLASS;
  const mark = (monogram || initials).trim();

  if (frame === 'monogram') {
    return (
      <div
        className={`pf-about-manifesto-portrait pf-about-manifesto-portrait-clip pf-about-manifesto-monogram ${
          compact ? 'pf-about-manifesto-monogram--compact' : ''
        }`}
        style={{ borderColor: accent }}
        aria-hidden={!mark}
      >
        <span
          className="pf-about-manifesto-monogram-letters"
          style={{ color: subtitleColor, fontFamily: ABOUT_MANIFESTO_SERIF }}
        >
          {mark || '—'}
        </span>
      </div>
    );
  }

  const media = (
    <div className="pf-about-manifesto-portrait-media">
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarSrc} alt={fullName?.trim() || 'Profile'} className={imageClass} />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ color: subtitleColor, backgroundColor: `${accent}18` }}
        >
          <span
            className="pf-about-manifesto-monogram-letters pf-about-manifesto-monogram-letters--inset"
            style={{ fontFamily: ABOUT_MANIFESTO_SERIF }}
          >
            {mark || initials}
          </span>
        </div>
      )}
    </div>
  );

  if (frame === 'instagram') {
    const ringColor = `color-mix(in srgb, ${accent} 72%, transparent)`;
    return (
      <div
        className={`pf-about-manifesto-portrait shrink-0 rounded-full ${
          compact ? 'p-[2px]' : 'p-[3px]'
        }`}
        style={{ backgroundColor: ringColor }}
      >
        <div className={`rounded-full ${compact ? 'p-[2px]' : 'p-[3px]'}`} style={{ backgroundColor: cardBg }}>
          <div
            className={`pf-about-manifesto-portrait-clip aspect-square ${squareClass} shrink-0 overflow-hidden rounded-full`}
          >
            {media}
          </div>
        </div>
      </div>
    );
  }

  const shapeClass =
    frame === 'circle'
      ? `aspect-square ${squareClass} shrink-0 overflow-hidden rounded-full`
      : frame === 'square'
        ? `aspect-square ${squareClass} shrink-0 overflow-hidden`
        : `aspect-[4/5] ${rectClass} shrink-0 overflow-hidden rounded-2xl`;

  return (
    <div
      className={`pf-about-manifesto-portrait pf-about-manifesto-portrait-clip ${shapeClass}`}
      style={frame === 'square' ? { borderColor: accent, borderWidth: 1, borderStyle: 'solid' } : undefined}
    >
      {media}
    </div>
  );
}

function ManifestoLanguageRail({
  items,
  codeColor,
  bodySizeClass,
}: {
  items: LanguageDisplayItem[];
  codeColor: string;
  bodySizeClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="pf-about-manifesto-langs pf-about-manifesto-langs--iso">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        return (
          <li
            key={item.name}
            className={`pf-about-manifesto-lang ${bodySizeClass}`}
            aria-label={levelLabel ? `${item.name}, ${levelLabel}` : item.name}
          >
            <span className="pf-about-manifesto-line-mask">
              <span className="pf-about-manifesto-line-shift">
                <span className="pf-about-manifesto-lang-code" style={{ color: codeColor }}>
                  {code}
                </span>
                {levelLabel ? (
                  <>
                    <span className="pf-about-manifesto-lang-sep" aria-hidden>
                      ·
                    </span>
                    <span className="pf-about-manifesto-lang-level">{levelLabel}</span>
                  </>
                ) : null}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function manifestoParallaxTravel(): number {
  return Math.min(150, Math.max(72, (window.innerHeight || 800) * 0.12));
}

function useManifestoGsapReveal(rootRef: RefObject<HTMLDivElement | null>, motionOff: boolean) {
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    node.setAttribute('data-pf-js', 'true');
    if (motionOff) {
      node.setAttribute('data-pf-entry', 'static');
      return undefined;
    }

    const hero = node.querySelector<HTMLElement>('.pf-about-manifesto-hero');
    const scroller =
      aboutBannerScrollParent(node) ?? getManifestoScrollParent(node) ?? undefined;
    const triggerHero = hero ?? node;
    const stBase = scroller ? { scroller } : {};
    let stopWatch: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const kicker = node.querySelector<HTMLElement>('.pf-about-manifesto-kicker');
      const mark = node.querySelector<HTMLElement>('.pf-about-manifesto-kicker-mark');
      const lines = Array.from(
        node.querySelectorAll<HTMLElement>('.pf-about-manifesto-line-inner')
      );
      const ruleLine = node.querySelector<HTMLElement>('.pf-about-manifesto-rule-line');
      const ruleCap = node.querySelector<HTMLElement>('.pf-about-manifesto-rule-cap');
      const bios = Array.from(node.querySelectorAll<HTMLElement>('.pf-about-manifesto-bio'));
      const portraits = Array.from(
        node.querySelectorAll<HTMLElement>('.pf-about-manifesto-portrait-clip')
      );
      const caption = node.querySelector<HTMLElement>('.pf-about-manifesto-portrait-caption');
      const colShells = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-pair-grid .pf-about-manifesto-col-shell'
        )
      );
      const folioLines = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-pair-grid .pf-about-manifesto-line-shift'
        )
      );
      const detailBlocks = Array.from(
        node.querySelectorAll<HTMLElement>(
          '.pf-about-manifesto-details .pf-about-manifesto-block'
        )
      );
      const pair = node.querySelector<HTMLElement>('.pf-about-manifesto-pair');
      const photoSlot = node.querySelector<HTMLElement>(
        '.pf-about-manifesto-portrait-slot--desktop'
      );

      if (kicker) gsap.set(kicker, { autoAlpha: 0, y: 12, immediateRender: true });
      if (mark) gsap.set(mark, { scaleX: 0, transformOrigin: 'left center', immediateRender: true });
      if (lines.length) gsap.set(lines, { y: '108%', force3D: true, immediateRender: true });
      if (ruleLine) {
        gsap.set(ruleLine, { scaleX: 0, transformOrigin: 'left center', immediateRender: true });
      }
      if (ruleCap) gsap.set(ruleCap, { autoAlpha: 0, immediateRender: true });
      if (bios.length) gsap.set(bios, { autoAlpha: 0, y: 16, immediateRender: true });
      if (portraits.length) {
        gsap.set(portraits, { clipPath: 'inset(0% 0% 100% 0%)', immediateRender: true });
      }
      if (caption) gsap.set(caption, { autoAlpha: 0, immediateRender: true });
      if (folioLines.length) {
        gsap.set(folioLines, { y: 15, autoAlpha: 0, force3D: true, immediateRender: true });
      }
      if (detailBlocks.length) {
        gsap.set(detailBlocks, { autoAlpha: 0, y: 18, immediateRender: true });
      }

      node.setAttribute('data-pf-entry', 'active');

      const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      if (kicker) heroTl.to(kicker, { autoAlpha: 1, y: 0, duration: 0.55 }, 0);
      if (mark) heroTl.to(mark, { scaleX: 1, duration: 0.7 }, 0.06);
      lines.forEach((line, index) => {
        heroTl.to(line, { y: '0%', duration: 0.92, force3D: true }, 0.1 + index * 0.1);
      });
      if (ruleCap) heroTl.to(ruleCap, { autoAlpha: 1, duration: 0.45 }, 0.28);
      if (ruleLine) heroTl.to(ruleLine, { scaleX: 1, duration: 0.88 }, 0.32);
      if (bios.length) {
        heroTl.to(bios, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.42);
      }
      if (portraits.length) {
        heroTl.to(
          portraits,
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.16, ease: 'power2.inOut' },
          0.14
        );
      }
      if (caption) heroTl.to(caption, { autoAlpha: 0.62, duration: 0.55 }, 0.7);

      const folioTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
        onComplete: () => node.setAttribute('data-pf-entry', 'done'),
      });
      colShells.forEach((shell, colIndex) => {
        const shifts = Array.from(
          shell.querySelectorAll<HTMLElement>('.pf-about-manifesto-line-shift')
        );
        if (!shifts.length) return;
        folioTl.to(
          shifts,
          { y: 0, autoAlpha: 1, duration: 0.78, stagger: 0.055, force3D: true },
          colIndex * 0.12
        );
      });
      if (detailBlocks.length) {
        folioTl.to(
          detailBlocks,
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08 },
          colShells.length ? '>-0.18' : 0
        );
      }

      let heroStarted = false;
      let folioStarted = false;
      const playHero = () => {
        if (heroStarted) return;
        heroStarted = true;
        heroTl.play();
      };
      const playFolio = () => {
        if (folioStarted) return;
        folioStarted = true;
        if (!heroStarted) playHero();
        folioTl.play();
      };

      heroTl.eventCallback('onComplete', playFolio);

      const heroInView = () => {
        const box = triggerHero.getBoundingClientRect();
        const viewH = window.innerHeight || 0;
        return box.top < viewH * 0.78 && box.bottom > 48;
      };

      ScrollTrigger.create({
        trigger: triggerHero,
        start: 'top 78%',
        once: true,
        onEnter: playHero,
        ...stBase,
      });

      const exitTrigger = pair ?? node;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        if (!photoSlot) return undefined;
        gsap.fromTo(
          photoSlot,
          { y: 0 },
          {
            y: () => -manifestoParallaxTravel() * 0.8,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: node,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.55,
              invalidateOnRefresh: true,
              ...stBase,
            },
          }
        );
        return undefined;
      });
      mm.add('(min-width: 768px)', () => {
        colShells.forEach((shell) => {
          const kind = shell.getAttribute('data-col');
          const speed = kind === 'strengths' ? 1 : 0.9;
          gsap.fromTo(
            shell,
            { y: 0 },
            {
              y: () => -manifestoParallaxTravel() * speed,
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: exitTrigger,
                start: 'top 42%',
                end: 'bottom 18%',
                scrub: 0.55,
                invalidateOnRefresh: true,
                ...stBase,
              },
            }
          );
        });
        if (pair) {
          gsap.fromTo(
            pair,
            { autoAlpha: 1 },
            {
              autoAlpha: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: pair,
                start: 'top 42%',
                end: 'bottom 18%',
                scrub: true,
                invalidateOnRefresh: true,
                ...stBase,
              },
            }
          );
        }
        return undefined;
      });

      const stopHeroWatch = aboutBannerWatchEnter(triggerHero, scroller, playHero);
      const onWinScroll = () => {
        if (heroInView()) playHero();
      };
      window.addEventListener('scroll', onWinScroll, { passive: true });
      scroller?.addEventListener('scroll', onWinScroll, { passive: true });
      onWinScroll();

      stopWatch = () => {
        stopHeroWatch();
        window.removeEventListener('scroll', onWinScroll);
        scroller?.removeEventListener('scroll', onWinScroll);
      };
    }, node);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        // GSAP's ScrollTrigger.refresh() can throw internally on an edge case
        // (e.g. "Cannot read properties of undefined (reading 'end')") during
        // its own init-time recompute; uncaught, that crash propagates up
        // through this deferred setTimeout with no React boundary to catch it
        // and takes down the whole page. Never let a best-effort refresh do that.
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      stopWatch?.();
      ctx.revert();
    };
  }, [rootRef, motionOff]);
}

function AboutManifestoLayout({
  title: _title,
  subtitle,
  specialty,
  bio,
  avatarUrl,
  fullName,
  educationItems,
  skillItems,
  strengthItems,
  interestItems,
  languageItems,
  toolItems,
  showEducation,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showSystemsTools,
  avatarGrayscale = false,
  portraitFrame = 'square',
  blocksLayout = 'grid',
  blocksScrollFocus = false,
  contentSize,
  accent,
  titleColor: _titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  statementStyle = null,
  colorMode = 'dark',
}: {
  title: string;
  subtitle: string;
  specialty?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  languageItems: LanguageDisplayItem[];
  toolItems: string[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  avatarGrayscale?: boolean;
  portraitFrame?: PortfolioInfoAboutManifestoPortraitFrame;
  blocksLayout?: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus?: boolean;
  contentSize: PortfolioInfoPremiumFontSize;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  /** Optional typography override for the statement line (color/size/weight/italic). */
  statementStyle?: PortfolioElementTextStyle | null;
  colorMode?: 'light' | 'dark';
}) {
  const reduceMotion = useReducedMotion();
  const motionOff = reduceMotion === true;
  const rootRef = useRef<HTMLDivElement>(null);

  const bioParagraphs = (bio?.trim() || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const subtitleTrimmed = subtitle.trim();
  const specialtyTrimmed = specialty?.trim() || '';
  const supportingParagraphs = bioParagraphs;
  const statementFromBio =
    !subtitleTrimmed && !specialtyTrimmed && supportingParagraphs.length > 0
      ? supportingParagraphs[0]
      : '';
  const statement = subtitleTrimmed || specialtyTrimmed || statementFromBio;
  const visibleBio =
    statementFromBio && statement === statementFromBio
      ? supportingParagraphs.slice(1)
      : supportingParagraphs;

  const statementIsLong = statement.length > 72;
  const statementSizeClass = statementStyle
    ? elementTextSizeClass(statementStyle.size, 'title')
    : manifestoStatementSizeClass(contentSize, statementIsLong);
  const statementColor = statementStyle
    ? (colorMode === 'dark'
        ? statementStyle.colorDark || statementStyle.color
        : statementStyle.color) || subtitleColor
    : subtitleColor;
  const statementExtraStyle: CSSProperties | undefined = statementStyle
    ? {
        fontWeight: resolveElementTextWeightAmount(statementStyle.weight, statementStyle.weightAmount),
        fontStyle: statementStyle.italic ? 'italic' : 'normal',
        ...(statementStyle.size === 'custom'
          ? {
              fontSize: `${resolveElementTextSizePx(statementStyle.size, statementStyle.sizePx, 'title')}px`,
              lineHeight: 1.05,
            }
          : {}),
        ...(statementStyle.uppercase ? { textTransform: 'uppercase' as const, letterSpacing: '0.01em' } : {}),
      }
    : undefined;
  const skillLabels = manifestoCollapseSkillLeads(skillEntryLabels(skillItems));
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  const showLangCol = showLanguages && languageItems.length > 0;
  const showIndexRow = showSkillsCol || showStrengthsCol || showLangCol;
  const secondaryBodyClass = manifestoStatementSecondarySizeClass(contentSize);

  const avatarSrc = avatarUrl?.trim() || '';
  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const monogram = manifestoMonogramLetters(fullName);
  const showAvatarColumn =
    portraitFrame === 'monogram' ? Boolean(monogram || initials) : Boolean(avatarSrc || initials);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showDetails =
    (showEducation && visibleEducation.length > 0) ||
    (showInterests && interestItems.length > 0) ||
    (showSystemsTools && toolItems.length > 0);
  const showFolio = showIndexRow || showDetails;
  const portraitCaption = fullName?.trim() || '';

  useManifestoGsapReveal(rootRef, motionOff);

  const rootStyle = {
    '--pf-about-manifesto-accent': accent,
    '--pf-about-manifesto-line': cardBorder,
  } as CSSProperties;

  const portraitFrameNode = (compact: boolean) => (
    <ManifestoPortraitFrame
      frame={portraitFrame}
      avatarSrc={avatarSrc}
      initials={initials}
      monogram={monogram}
      fullName={fullName}
      avatarGrayscale={avatarGrayscale}
      accent={accent}
      cardBg={cardBg}
      subtitleColor={subtitleColor}
      compact={compact}
    />
  );

  return (
    <div
      ref={rootRef}
      className="pf-about-manifesto relative w-full"
      data-pf-entry={motionOff ? 'static' : 'armed'}
      style={rootStyle}
    >
      <div
        className={`pf-about-manifesto-hero ${
          showAvatarColumn ? '' : 'pf-about-manifesto-hero--solo'
        }`}
      >
        {showAvatarColumn ? (
          <div className="pf-about-manifesto-kicker-row" style={{ justifyContent: 'flex-end' }}>
            <div className="pf-about-manifesto-portrait-slot pf-about-manifesto-portrait-slot--mobile">
              {portraitFrameNode(true)}
            </div>
          </div>
        ) : null}

        <div
          className={`pf-about-manifesto-spread ${
            showAvatarColumn ? '' : 'pf-about-manifesto-spread--solo'
          }`}
        >
          <header className="pf-about-manifesto-copy">
            {statement ? (
              <>
                <ManifestoStatementReveal
                  text={statement}
                  className={statementSizeClass}
                  color={statementColor}
                  extraStyle={statementExtraStyle}
                />
                <div className="pf-about-manifesto-rule" aria-hidden>
                  <span
                    className="pf-about-manifesto-rule-cap"
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    className="pf-about-manifesto-rule-line"
                    style={{ backgroundColor: accent }}
                  />
                </div>
              </>
            ) : null}

            {visibleBio.length > 0 ? (
              <div
                className={`pf-about-manifesto-bio-wrap ${secondaryBodyClass}`}
                style={{ color: bodyColor }}
              >
                {visibleBio.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="pf-about-manifesto-bio">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {!statement && visibleBio.length === 0 ? (
              <p
                className={`pf-about-manifesto-bio pf-about-manifesto-bio--empty ${secondaryBodyClass}`}
                style={{ color: bodyColor }}
              >
                Ajoute un sous-titre dans Creator Studio → Information.
              </p>
            ) : null}
          </header>

          {showAvatarColumn ? (
            <aside className="pf-about-manifesto-portrait-slot pf-about-manifesto-portrait-slot--desktop">
              {portraitFrameNode(false)}
              {portraitCaption ? (
                <p className="pf-about-manifesto-portrait-caption" style={{ color: bodyColor }}>
                  {portraitCaption}
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>

      {showFolio ? (
        <div className="pf-about-manifesto-folio" style={{ borderColor: cardBorder }}>
          {showIndexRow ? (
            <div className="pf-about-manifesto-pair">
              <ManifestoIndexGrid
                skillLabels={skillLabels}
                strengthItems={strengthItems}
                languageItems={languageItems}
                showSkills={showSkillsCol}
                showStrengths={showStrengthsCol}
                showLanguages={showLangCol}
                accent={accent}
                labelColor={subtitleColor}
                bodyColor={bodyColor}
                subtitleColor={subtitleColor}
                contentSize={contentSize}
                motionOff={motionOff}
              />
            </div>
          ) : null}

          <ManifestoDetailsSection
            educationItems={educationItems}
            skillItems={skillItems}
            strengthItems={strengthItems}
            interestItems={interestItems}
            toolItems={toolItems}
            showEducation={showEducation}
            showSkills={false}
            showStrengths={false}
            showInterests={showInterests}
            showSystemsTools={showSystemsTools}
            accent={accent}
            labelColor={subtitleColor}
            subtitleColor={subtitleColor}
            bodyColor={bodyColor}
            cardBorder={cardBorder}
            contentSize={contentSize}
            blocksLayout={blocksLayout}
            blocksScrollFocus={blocksScrollFocus}
            motionOff={motionOff}
            sectionTopClass={showIndexRow ? MANIFESTO_BLOCK_SPACING : 'mt-0'}
          />
        </div>
      ) : null}
    </div>
  );
}

const ABOUT_VALUE_STEPS_EASE = [0.16, 1, 0.3, 1] as const;

const ABOUT_VALUE_STEPS_INTRO_VIEWPORT = {
  once: true,
  amount: 0.42,
  margin: '0px 0px -8% 0px',
} as const;

const ABOUT_VALUE_STEPS_BLOCK_VIEWPORT = {
  once: true,
  amount: 0.18,
  margin: '0px 0px -8% 0px',
} as const;

const ABOUT_VALUE_STEPS_STEP_VIEWPORT = {
  once: true,
  amount: 0.36,
  margin: '0px 0px -6% 0px',
} as const;

const ABOUT_VALUE_STEPS_INTRO_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const ABOUT_VALUE_STEPS_INTRO_LINE = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.88, ease: ABOUT_VALUE_STEPS_EASE },
  },
};

const ABOUT_VALUE_STEPS_STEP_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.02 } },
};

const ABOUT_VALUE_STEPS_INDEX = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: ABOUT_VALUE_STEPS_EASE },
  },
};

const ABOUT_VALUE_STEPS_FADE = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: ABOUT_VALUE_STEPS_EASE },
  },
};

const ABOUT_VALUE_STEPS_COPY = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE },
  },
};

const ABOUT_VALUE_STEPS_GRID_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

const ABOUT_VALUE_STEPS_CARD = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: ABOUT_VALUE_STEPS_EASE },
  },
};

const ABOUT_VALUE_STEPS_META_STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

const ABOUT_VALUE_SERIF_STYLE = { fontFamily: ABOUT_CLASSIC_SERIF } as CSSProperties;

function AboutValueListMarker({
  style,
  accent,
}: {
  style: PortfolioInfoAboutValueListMarkerStyle;
  accent: string;
}) {
  if (style === 'none') return null;
  if (style === 'dot') {
    return (
      <span
        aria-hidden
        className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
      />
    );
  }
  const markerStyle: PortfolioListMarkerStyle =
    style === 'dash' ? 'dash' : style === 'arrow' ? 'arrow' : 'chevron';
  return (
    <PortfolioListMarker
      style={markerStyle}
      color={accent}
      size="sm"
      className="mt-[0.35em]"
    />
  );
}

function AboutValueSkillsList({
  items,
  accent,
  bodyColor,
  listMarkerStyle,
  itemTitleClass,
  itemDescriptionClass,
}: {
  items: ProfileSkillEntry[];
  accent: string;
  bodyColor: string;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  itemTitleClass: string;
  itemDescriptionClass: string;
}) {
  const motionOff = useReducedMotion() === true;
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-24 sm:space-y-28 lg:space-y-36 xl:space-y-40">
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          className={`pf-about-values-item flex ${rowGap} items-start`}
          style={{ color: bodyColor, ['--pf-about-values-i' as string]: index } as CSSProperties}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 22 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          whileHover={motionOff ? undefined : { y: -4 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
          transition={{ duration: 0.74, ease: ABOUT_VALUE_STEPS_EASE }}
        >
          <AboutValueListMarker style={listMarkerStyle} accent={accent} />
          <div className="min-w-0 max-w-xl">
            <span
              className={`pf-about-values-serif font-semibold tracking-tight ${itemTitleClass}`}
              style={ABOUT_VALUE_SERIF_STYLE}
            >
              {item.title}
            </span>
            {item.description.trim() ? (
              <p
                className={`mt-4 leading-relaxed opacity-80 lg:mt-5 ${itemDescriptionClass}`}
                style={{ color: bodyColor }}
              >
                {item.description}
              </p>
            ) : null}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function AboutValueEducationList({
  items,
  accent,
  bodyColor,
  listMarkerStyle,
  itemTitleClass,
  itemDescriptionClass,
}: {
  items: ProfileEducationEntry[];
  accent: string;
  bodyColor: string;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  itemTitleClass: string;
  itemDescriptionClass: string;
}) {
  const motionOff = useReducedMotion() === true;
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-8 sm:space-y-10">
      {items.map((entry, index) => {
        const title = entry.title?.trim() ?? '';
        const institution = entry.institution?.trim() ?? '';
        const schoolYear = entry.schoolYear?.trim() ?? '';
        const meta = [institution, schoolYear].filter(Boolean).join(' · ');
        const key = entry.id || `${title}-${institution}-${schoolYear}`;

        return (
          <motion.li
            key={key}
            className={`pf-about-values-item flex ${rowGap} items-start`}
            style={{ color: bodyColor, ['--pf-about-values-i' as string]: index } as CSSProperties}
            data-pf-no-color-transition=""
            initial={motionOff ? false : { opacity: 0, y: 16 }}
            whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
            viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
            transition={{ duration: 0.64, ease: ABOUT_VALUE_STEPS_EASE }}
          >
            <AboutValueListMarker style={listMarkerStyle} accent={accent} />
            <div className="min-w-0">
              {title ? (
                <span className={`font-semibold tracking-tight ${itemTitleClass}`}>{title}</span>
              ) : null}
              {meta ? (
                <p className={`mt-4 leading-relaxed opacity-80 lg:mt-5 ${itemDescriptionClass}`}>
                  {meta}
                </p>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

function AboutValueLanguageList({
  items,
  accent,
  bodyColor,
  bodySizeClass,
}: {
  items: LanguageDisplayItem[];
  accent: string;
  bodyColor: string;
  bodySizeClass: string;
}) {
  const motionOff = useReducedMotion() === true;
  if (items.length === 0) return null;
  return (
    <motion.ul
      className="pf-about-values-langs"
      data-pf-no-color-transition=""
      initial={motionOff ? false : { opacity: 0, y: 12 }}
      whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
      viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
      transition={{ duration: 0.68, ease: ABOUT_VALUE_STEPS_EASE }}
    >
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        const tone = item.level ? ABOUT_CLASSIC_LEVEL_TONE[item.level] ?? 0.72 : 0.72;
        return (
          <li
            key={item.name}
            className={`pf-about-values-lang ${bodySizeClass}`}
            style={{ color: bodyColor, opacity: tone }}
          >
            <span
              className="pf-about-values-lang-code"
              style={{ color: accent, ...ABOUT_VALUE_SERIF_STYLE }}
            >
              {code}
            </span>
            <span className="pf-about-values-lang-name">{item.name}</span>
            {levelLabel ? (
              <span className="pf-about-values-lang-level">({levelLabel})</span>
            ) : null}
          </li>
        );
      })}
    </motion.ul>
  );
}

function AboutValueTextList({
  items,
  accent,
  bodyColor,
  listMarkerStyle,
  itemTitleClass,
}: {
  items: string[];
  accent: string;
  bodyColor: string;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  itemTitleClass: string;
}) {
  const motionOff = useReducedMotion() === true;
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <motion.li
          key={`${index}-${item}`}
          className={`pf-about-values-item flex ${rowGap} items-start`}
          style={{ color: bodyColor, ['--pf-about-values-i' as string]: index } as CSSProperties}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 12 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
          transition={{
            duration: 0.58,
            delay: motionOff ? 0 : Math.min(index, 8) * 0.05,
            ease: ABOUT_VALUE_STEPS_EASE,
          }}
        >
          <AboutValueListMarker style={listMarkerStyle} accent={accent} />
          <span className={`leading-relaxed ${itemTitleClass}`}>{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function AboutValueTitle({
  children,
  accent,
  titleColor,
  titleSizeClass,
  wide = false,
  className = '',
}: {
  children: ReactNode;
  accent: string;
  titleColor: string;
  titleSizeClass: string;
  wide?: boolean;
  className?: string;
}) {
  const motionOff = useReducedMotion() === true;

  if (wide) {
    return (
      <div className={`w-full ${className}`}>
        <motion.h2
          className={`pf-about-values-title w-full font-semibold leading-[0.95] tracking-tight ${titleSizeClass}`}
          style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 16 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
          transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
        >
          {children}
        </motion.h2>
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <motion.h2
        className={`pf-about-values-title max-w-[14ch] font-semibold leading-[0.95] tracking-tight ${titleSizeClass}`}
        style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
        data-pf-no-color-transition=""
        initial={motionOff ? false : { opacity: 0, y: 16 }}
        whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
        viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
        transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
      >
        {children}
      </motion.h2>
      <motion.div
        className="pf-about-values-rule mt-4 h-px w-12 origin-left sm:mt-5 sm:w-14"
        style={{ backgroundColor: accent }}
        aria-hidden
        data-pf-no-color-transition=""
        initial={motionOff ? false : { scaleX: 0 }}
        whileInView={motionOff ? undefined : { scaleX: 1 }}
        viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
        transition={{ duration: 0.72, delay: motionOff ? 0 : 0.18, ease: ABOUT_VALUE_STEPS_EASE }}
      />
    </div>
  );
}

/** About · value steps — numbered 2-column values grid (Our values reference layout). */
function AboutValueNumberedGrid({
  title,
  items,
  titleColor,
  subtitleColor,
  bodyColor,
  contentSize,
  emptyMessage,
}: {
  title: string;
  items: ProfileSkillEntry[];
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
  emptyMessage?: string;
}) {
  const motionOff = useReducedMotion() === true;
  const visible = items.filter((item) => item.title?.trim() || item.description?.trim());
  const blockTitleClass = aboutValueBlockTitleSizeClass(contentSize);
  const itemTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const itemDescriptionClass = aboutValueStepsDescriptionSizeClass(contentSize);
  const numberClass = aboutValueNumberedGridIndexSizeClass(contentSize);
  const emptyMessageClass = infoContentEducationMetaSizeClass(contentSize);

  if (visible.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="w-full">
        <motion.h2
          className={`pf-about-values-title font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 16 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
          transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
        >
          {title}
        </motion.h2>
        <p className={`mt-8 opacity-60 sm:mt-10 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:gap-x-16">
      <div className="min-w-0 lg:col-span-4 lg:pt-1">
        <motion.h2
          className={`pf-about-values-title font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 16 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
          transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
        >
          {title}
        </motion.h2>
      </div>

      <motion.div
        className="pf-about-values-numbered mt-12 grid min-w-0 grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-12 sm:gap-x-8 sm:gap-y-16 lg:col-span-8 lg:mt-0 lg:gap-x-10 lg:gap-y-20"
        data-pf-no-color-transition=""
        initial={motionOff ? false : 'hidden'}
        whileInView={motionOff ? undefined : 'show'}
        viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
        variants={ABOUT_VALUE_STEPS_GRID_STAGGER}
      >
        {visible.map((skill, index) => (
          <motion.article
            key={skill.id}
            className={`pf-about-values-card min-w-0 ${index % 2 === 1 ? 'sm:col-span-5' : 'sm:col-span-7'}`}
            style={{ ['--pf-about-values-i' as string]: index } as CSSProperties}
            variants={motionOff ? undefined : ABOUT_VALUE_STEPS_CARD}
            whileHover={motionOff ? undefined : { y: -6 }}
          >
            <p
              className={`pf-about-values-index font-semibold tabular-nums tracking-tight ${numberClass}`}
              style={{ color: titleColor }}
            >
              {formatValueStepNumber(index)}
            </p>
            {skill.title?.trim() ? (
              <h3
                className={`pf-about-values-serif mt-3 font-semibold tracking-tight sm:mt-4 ${itemTitleClass}`}
                style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
              >
                {skill.title}
              </h3>
            ) : null}
            {skill.description.trim() ? (
              <p
                className={`mt-3 leading-relaxed opacity-80 sm:mt-4 ${itemDescriptionClass}`}
                style={{ color: bodyColor }}
              >
                {skill.description}
              </p>
            ) : null}
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}

/** About · value — indexed rows (001 · title · description) with thin separators. */
function AboutValueIndexedList({
  title,
  items,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  emptyMessage,
}: {
  title: string;
  items: ProfileSkillEntry[];
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  emptyMessage?: string;
}) {
  const motionOff = useReducedMotion() === true;
  const visible = items.filter((item) => item.title?.trim() || item.description?.trim());
  const blockTitleClass = aboutValueBlockTitleSizeClass(contentSize);
  const itemTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const itemDescriptionClass = aboutValueStepsDescriptionSizeClass(contentSize);
  const indexClass = infoContentEducationMetaSizeClass(contentSize);
  const emptyMessageClass = infoContentEducationMetaSizeClass(contentSize);

  if (visible.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="w-full">
        <motion.h2
          className={`pf-about-values-title max-w-[16ch] font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
          data-pf-no-color-transition=""
          initial={motionOff ? false : { opacity: 0, y: 16 }}
          whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
          transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
        >
          {title}
        </motion.h2>
        <p className={`mt-8 opacity-60 sm:mt-10 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.h2
        className={`pf-about-values-title max-w-[16ch] font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
        data-pf-no-color-transition=""
        initial={motionOff ? false : { opacity: 0, y: 16 }}
        whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
        viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
        transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
      >
        {title}
      </motion.h2>

      <ul className="mt-10 w-full sm:mt-12">
        {visible.map((skill, index) => (
          <motion.li
            key={skill.id}
            className="pf-about-values-row border-t py-10 first:border-t sm:py-12 lg:py-14"
            style={{ borderColor: cardBorder, ['--pf-about-values-i' as string]: index } as CSSProperties}
            data-pf-no-color-transition=""
            initial={motionOff ? false : 'hidden'}
            whileInView={motionOff ? undefined : 'show'}
            viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
            variants={ABOUT_VALUE_STEPS_STEP_STAGGER}
            whileHover={motionOff ? undefined : { y: -4 }}
          >
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-12 sm:gap-x-8 lg:gap-x-12">
              <motion.span
                className={`pf-about-values-index tabular-nums tracking-tight opacity-70 sm:col-span-1 ${indexClass}`}
                style={{ color: bodyColor }}
                variants={motionOff ? undefined : ABOUT_VALUE_STEPS_INDEX}
              >
                {formatValueIndexNumber(index)}
              </motion.span>
              {skill.title?.trim() ? (
                <motion.h3
                  className={`pf-about-values-serif font-semibold tracking-tight sm:col-span-3 ${itemTitleClass}`}
                  style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
                >
                  {skill.title}
                </motion.h3>
              ) : (
                <span className="hidden sm:col-span-3 sm:block" aria-hidden />
              )}
              {skill.description.trim() ? (
                <motion.p
                  className={`leading-relaxed opacity-80 sm:col-span-8 ${itemDescriptionClass}`}
                  style={{ color: bodyColor }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_COPY}
                >
                  {skill.description}
                </motion.p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function AboutValueRow({
  heading,
  items = [],
  listMode = 'text',
  languageItems,
  educationItems,
  languageLevelStyle: _languageLevelStyle,
  showLanguageFlags: _showLanguageFlags = true,
  listMarkerStyle = 'dot',
  showList,
  emptyListMessage,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  trackColor: _trackColor,
  blocksLayout = 'split',
  contentSize,
}: {
  heading: string;
  items?: ProfileSkillEntry[] | string[];
  listMode?: 'skills' | 'text' | 'languages' | 'education';
  languageItems?: LanguageDisplayItem[];
  educationItems?: ProfileEducationEntry[];
  languageLevelStyle?: PortfolioInfoLanguageLevelDisplayStyle;
  showLanguageFlags?: boolean;
  listMarkerStyle?: PortfolioInfoAboutValueListMarkerStyle;
  showList: boolean;
  emptyListMessage?: string;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  trackColor?: string;
  blocksLayout?: PortfolioInfoAboutValueBlocksLayout;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const stacked = blocksLayout === 'grid-2';
  const blockTitleClass = aboutValueBlockTitleSizeClass(contentSize);
  const itemTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const itemDescriptionClass = aboutValueStepsDescriptionSizeClass(contentSize);
  const emptyMessageClass = infoContentEducationMetaSizeClass(contentSize);

  const titleBlock = (
    <AboutValueTitle accent={accent} titleColor={titleColor} titleSizeClass={blockTitleClass}>
        {heading}
    </AboutValueTitle>
  );

  const listInner =
    showList && listMode === 'languages' && (languageItems?.length ?? 0) > 0 ? (
      <AboutValueLanguageList
        items={languageItems ?? []}
        accent={accent}
        bodyColor={subtitleColor}
        bodySizeClass={itemDescriptionClass}
      />
    ) : showList && listMode === 'education' && (educationItems?.length ?? 0) > 0 ? (
      <AboutValueEducationList
        items={educationItems ?? []}
        accent={accent}
        bodyColor={subtitleColor}
        listMarkerStyle={listMarkerStyle}
        itemTitleClass={itemTitleClass}
        itemDescriptionClass={itemDescriptionClass}
      />
    ) : showList && listMode !== 'languages' && listMode !== 'education' && items.length > 0 ? (
      listMode === 'skills' ? (
            <AboutValueSkillsList
              items={items as ProfileSkillEntry[]}
              accent={accent}
              bodyColor={subtitleColor}
          listMarkerStyle={listMarkerStyle}
          itemTitleClass={itemTitleClass}
          itemDescriptionClass={itemDescriptionClass}
            />
          ) : (
            <AboutValueTextList
              items={items as string[]}
              accent={accent}
              bodyColor={subtitleColor}
          listMarkerStyle={listMarkerStyle}
          itemTitleClass={itemTitleClass}
            />
      )
    ) : showList && emptyListMessage ? (
      <p className={`opacity-60 ${emptyMessageClass}`} style={{ color: bodyColor }}>
        {emptyListMessage}
      </p>
    ) : null;

  const listBlock = listInner ? (
    <div className={stacked ? 'min-w-0' : 'min-w-0 lg:pl-12 xl:pl-16'}>
      <div className={stacked ? 'mt-8 sm:mt-10' : 'mt-8 sm:mt-10 lg:mt-0'}>{listInner}</div>
    </div>
  ) : null;

  if (stacked) {
    return (
      <div className="pf-about-values-editorial flex min-w-0 flex-col">
        {titleBlock}
        {listBlock}
      </div>
    );
  }

  return (
    <div className="pf-about-values-editorial flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 xl:gap-x-16">
      {titleBlock}
      {listBlock}
    </div>
  );
}

function formatValueStepNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function formatValueIndexNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function ValueStepsIndicator({ index, accent }: { index: number; accent: string }) {
  return (
    <span
      className="text-sm font-medium tabular-nums tracking-[0.12em] sm:text-base"
      style={{ color: accent }}
      aria-hidden
    >
      ({formatValueStepNumber(index)})
    </span>
  );
}

function ValueStepsSectionRule({
  cardBorder,
  className = '',
}: {
  cardBorder: string;
  className?: string;
}) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ backgroundColor: cardBorder }}
      aria-hidden
    />
  );
}

/** Value steps — "What I bring": no pills, no borders. Plain words at a wide
 *  letter-spacing, scattered off the baseline and alternating a slightly
 *  smaller scale so the composition reads as loose and asymmetric rather
 *  than a justified list. Dim at rest; the hovered word alone illuminates
 *  to full white while its neighbors ease down to a quiet 0.3. */
function ValueStepsFloatingSkillWords({
  items,
  bodyColor,
  bodySizeClass,
}: {
  items: string[];
  bodyColor: string;
  bodySizeClass: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionOff = useReducedMotion() === true;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || motionOff) return undefined;
    const words = Array.from(root.querySelectorAll<HTMLElement>('.pf-value-word'));
    if (!words.length) return undefined;
    const scroller = aboutBannerScrollParent(root);

    const ctx = gsap.context(() => {
      gsap.set(words, { autoAlpha: 0, y: 16, immediateRender: true });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.to(words, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.055 });
      ScrollTrigger.create({
        trigger: root,
        ...(scroller ? { scroller } : {}),
        start: 'top 88%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, root);

    return () => ctx.revert();
  }, [motionOff, items.length]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="pf-value-words mt-6 flex flex-wrap items-baseline gap-x-7 gap-y-4 sm:mt-8">
      {items.map((item, index) => (
        <span
          key={`${index}-${item}`}
          className={`pf-value-word ${bodySizeClass} ${
            index % 3 === 1 ? 'pf-value-word--minor -translate-y-0.5' : 'translate-y-0.5'
          }`}
          style={{ color: bodyColor }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/** Value steps — "I speak": a huge Display acronym per language over a
 *  clean gray-scale level label. Hovering a language turns it bright white
 *  and reveals a hairline gauge that fills left-to-right to its
 *  proficiency, while every other language dims to a quiet 0.15 and picks
 *  up a soft blur — a deliberate one-at-a-time focus instead of a flat
 *  block of equally-weighted rows. */
function ValueStepsLanguageDial({
  items,
  accent,
  titleColor,
  bodyColor,
  contentSize,
}: {
  items: LanguageDisplayItem[];
  accent: string;
  titleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const rootRef = useRef<HTMLUListElement>(null);
  const motionOff = useReducedMotion() === true;
  const codeClass = aboutValueStepsLanguageCodeSizeClass(contentSize);
  const levelClass = aboutValueStepsLanguageLevelSizeClass(contentSize);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || motionOff) return undefined;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.pf-value-lang'));
    if (!rows.length) return undefined;
    const scroller = aboutBannerScrollParent(root);
    const ctx = gsap.context(() => {
      gsap.set(rows, { autoAlpha: 0, y: 18, immediateRender: true });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.to(rows, { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.07 });
      ScrollTrigger.create({
        trigger: root,
        ...(scroller ? { scroller } : {}),
        start: 'top 90%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, root);
    return () => ctx.revert();
  }, [motionOff, items.length]);

  if (items.length === 0) return null;

  return (
    <ul ref={rootRef} className="pf-value-langs mt-6 flex flex-col gap-8 sm:mt-8">
      {items.map((item) => {
        const code = aboutClassicLanguageCode(item.name);
        const levelLabel = item.level ? resolveSpokenLanguageLevelLabel(item.level) : null;
        const fill = item.level ? ABOUT_CLASSIC_LEVEL_TONE[item.level] ?? 0.72 : 0.72;
        return (
          <li
            key={item.name}
            className="pf-value-lang"
            data-pf-no-color-transition=""
            style={{ '--pf-value-lang-fill': fill } as CSSProperties}
          >
            <div className="flex items-baseline gap-3">
              <span
                className={`pf-value-lang-code font-medium italic ${codeClass}`}
                style={{ color: titleColor, ...ABOUT_VALUE_SERIF_STYLE }}
              >
                {code}
              </span>
              <span className="pf-value-lang-name" style={{ color: bodyColor }}>
                {item.name}
              </span>
            </div>
            {levelLabel ? (
              <span
                className={`pf-value-lang-level mt-1 block uppercase tracking-[0.14em] ${levelClass}`}
                style={{ color: bodyColor, opacity: fill }}
              >
                {levelLabel}
              </span>
            ) : null}
            <span
              className="pf-value-lang-gauge mt-3 block"
              style={{ backgroundColor: bodyColor }}
              aria-hidden
            >
              <span className="pf-value-lang-gauge-fill block" style={{ backgroundColor: accent }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ValueStepsMetaBlock({
  label,
  accent,
  contentSize,
  children,
}: {
  label: string;
  accent: string;
  contentSize: PortfolioInfoPremiumFontSize;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
        {label}
      </ManifestoSectionLabel>
      {children}
    </div>
  );
}

/** Value steps — full-width horizontal education rows (year · title · institution). */
/** Value steps — education timeline: rows are separated by generous empty
 *  space instead of table-like divider lines. Each row's year and diploma
 *  title drift horizontally at different speeds as it crosses the viewport
 *  (a scroll-scrubbed parallax, not a shared one), and on hover the row
 *  lifts on a soft spring while the institution line unmasks from beneath
 *  the title. */
function ValueStepsEducationList({
  items,
  accent,
  subtitleColor,
  bodyColor,
  contentSize,
}: {
  items: ProfileEducationEntry[];
  accent: string;
  subtitleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const motionOff = useReducedMotion() === true;
  const visible = items.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );

  const yearClass = infoContentEducationMetaSizeClass(contentSize);
  const titleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const metaClass = aboutValueStepsDescriptionSizeClass(contentSize);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || motionOff) return undefined;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.pf-value-edu-row'));
    if (!rows.length) return undefined;
    const scroller = aboutBannerScrollParent(root);

    const ctx = gsap.context(() => {
      rows.forEach((row) => {
        const year = row.querySelector<HTMLElement>('.pf-value-edu-year');
        const titleTrack = row.querySelector<HTMLElement>('.pf-value-edu-title-track');

        gsap.set(row, { autoAlpha: 0, y: 30, immediateRender: true });
        ScrollTrigger.create({
          trigger: row,
          ...(scroller ? { scroller } : {}),
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(row, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' }),
        });

        if (year) {
          gsap.fromTo(
            year,
            { x: -16 },
            {
              x: 16,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                ...(scroller ? { scroller } : {}),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            }
          );
        }

        if (titleTrack) {
          gsap.fromTo(
            titleTrack,
            { x: 10 },
            {
              x: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                ...(scroller ? { scroller } : {}),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5,
              },
            }
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, [motionOff, visible.length]);

  if (visible.length === 0) return null;

  return (
    <div ref={rootRef} className="w-full">
      <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
        {ABOUT_VALUE_STEPS_SECTION_LABELS.education}
      </ManifestoSectionLabel>
      <ol className="pf-value-edu mt-10 w-full sm:mt-14">
        {visible.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="pf-value-edu-row grid w-full grid-cols-1 items-baseline gap-x-8 gap-y-3 py-10 sm:grid-cols-12 sm:gap-x-10 sm:py-14 lg:gap-x-16 lg:py-16"
            >
              <span
                className={`pf-value-edu-year tabular-nums tracking-tight sm:col-span-2 lg:col-span-2 ${yearClass}`}
                style={{ color: accent }}
              >
                {year || '—'}
              </span>
              <div className="pf-value-edu-body min-w-0 sm:col-span-10 lg:col-span-10">
                <p className="pf-value-edu-title-track min-w-0">
                  <span
                    className={`pf-value-edu-title font-semibold tracking-tight ${titleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {title || institution || '—'}
                  </span>
                </p>
                {title && institution ? (
                  <span className="pf-value-edu-meta-mask mt-2 block overflow-hidden">
                    <span
                      className={`pf-value-edu-meta block min-w-0 ${metaClass}`}
                      style={{ color: bodyColor }}
                    >
                      {institution}
                    </span>
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ValueStepsInlineDotList({
  items,
  bodyColor,
  bodySizeClass,
}: {
  items: string[];
  bodyColor: string;
  bodySizeClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <p className={`mt-5 leading-relaxed ${bodySizeClass}`} style={{ color: bodyColor }}>
      {items.join(' · ')}
    </p>
  );
}

function ValueStepsMetaGrid({
  blocks,
}: {
  blocks: { key: string; node: ReactNode }[];
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-16 sm:gap-20 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 xl:gap-x-16">
      {blocks.map((block) => (
        <div key={block.key} className="min-w-0">
          {block.node}
        </div>
      ))}
    </div>
  );
}

function ValueStepsSquarePortrait({
  avatarSrc,
  initials,
  fullName,
  accent,
  bodyColor,
  portraitGrayscale,
}: {
  avatarSrc: string;
  initials: string;
  fullName?: string | null;
  accent: string;
  bodyColor: string;
  portraitGrayscale: boolean;
}) {
  const media = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarSrc}
      alt={fullName?.trim() || 'Profile'}
      className={infoPortraitImageClass('h-full w-full object-cover object-center', portraitGrayscale)}
    />
  ) : (
    <div
      className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight sm:text-4xl"
      style={{ color: bodyColor, backgroundColor: `${accent}22` }}
    >
      {initials}
    </div>
  );

  return (
    <div className="aspect-square size-56 shrink-0 overflow-hidden sm:size-64 lg:size-72 xl:size-80">
      {media}
    </div>
  );
}

function AboutValueStepsNativeValues({
  title,
  visibleSkills,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  contentSize,
}: {
  title: string;
  visibleSkills: ProfileSkillEntry[];
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
}) {
  const motionOff = useReducedMotion() === true;
  const sectionTitleClass = infoContentBodySizeClass(contentSize);
  const stepTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const descriptionSizeClass = aboutValueStepsDescriptionSizeClass(contentSize);

  return (
    <>
      <motion.h2
        className={`pf-about-values-kicker mb-10 font-semibold uppercase tracking-[0.2em] sm:mb-12 lg:hidden ${sectionTitleClass}`}
        style={{ color: titleColor }}
        data-pf-no-color-transition=""
        initial={motionOff ? false : { opacity: 0, y: 10 }}
        whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
        viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
        transition={{ duration: 0.62, ease: ABOUT_VALUE_STEPS_EASE }}
      >
        ({title})
      </motion.h2>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
        <div className="lg:col-span-8">
          {visibleSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              className={`pf-about-values-step grid grid-cols-1 items-start gap-x-10 gap-y-4 lg:grid-cols-8 ${
                index > 0 ? 'mt-24 sm:mt-28 lg:mt-36 xl:mt-40' : ''
              }`}
              style={{ ['--pf-about-values-i' as string]: index } as CSSProperties}
              data-pf-no-color-transition=""
              initial={motionOff ? false : 'hidden'}
              whileInView={motionOff ? undefined : 'show'}
              viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
              variants={ABOUT_VALUE_STEPS_STEP_STAGGER}
              whileHover={motionOff ? undefined : { y: -5 }}
            >
              <div className="flex items-baseline gap-4 lg:col-span-2 lg:pt-1.5">
                <motion.span
                  className="pf-about-values-index inline-flex"
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_INDEX}
                >
                  <ValueStepsIndicator index={index} accent={accent} />
                </motion.span>
                <motion.h3
                  className={`pf-about-values-serif min-w-0 flex-1 font-semibold tracking-tight lg:hidden ${stepTitleClass}`}
                  style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
                >
                  {skill.title}
                </motion.h3>
              </div>

              <div className="min-w-0 max-w-xl lg:col-span-6">
                <motion.h3
                  className={`pf-about-values-serif hidden font-semibold tracking-tight lg:block ${stepTitleClass}`}
                  style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
                >
                  {skill.title}
                </motion.h3>
                {skill.description.trim() ? (
                  <motion.p
                    className={`mt-4 hidden leading-relaxed opacity-80 lg:mt-5 lg:block ${descriptionSizeClass}`}
                    style={{ color: bodyColor }}
                    variants={motionOff ? undefined : ABOUT_VALUE_STEPS_COPY}
                  >
                    {skill.description}
                  </motion.p>
                ) : null}
              </div>

              {skill.description.trim() ? (
                <motion.p
                  className={`max-w-xl leading-relaxed opacity-80 lg:hidden ${descriptionSizeClass}`}
                  style={{ color: bodyColor }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_COPY}
                >
                  {skill.description}
                </motion.p>
              ) : null}
            </motion.div>
          ))}
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <motion.h2
            className={`pf-about-values-kicker pf-about-values-kicker--sticky sticky top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+0.5rem)] z-20 text-right font-semibold uppercase tracking-[0.2em] ${sectionTitleClass}`}
            style={{ color: titleColor }}
            data-pf-no-color-transition=""
            initial={motionOff ? false : { opacity: 0 }}
            whileInView={motionOff ? undefined : { opacity: 1 }}
            viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
            transition={{ duration: 0.7, ease: ABOUT_VALUE_STEPS_EASE }}
          >
            ({title})
          </motion.h2>
        </div>
      </div>
    </>
  );
}

function AboutValueStepsLayout({
  title,
  skillItems,
  strengthItems,
  interestItems,
  toolItems,
  languageItems,
  educationItems,
  showSkills,
  showStrengths,
  showInterests,
  showSystemsTools,
  showLanguages,
  showEducation,
  showLanguageFlags: _showLanguageFlags,
  languageLevelStyle: _languageLevelStyle,
  introEnabled,
  introParagraphs,
  avatarUrl,
  fullName,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  valuesLayout,
  listMarkerStyle,
  portraitGrayscale,
}: {
  title: string;
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  toolItems: string[];
  languageItems: LanguageDisplayItem[];
  educationItems: ProfileEducationEntry[];
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showSystemsTools: boolean;
  showLanguages: boolean;
  showEducation: boolean;
  showLanguageFlags: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  introEnabled: boolean;
  introParagraphs: string[];
  avatarUrl?: string | null;
  fullName?: string | null;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoPremiumFontSize;
  valuesLayout: PortfolioInfoAboutValueValuesLayout;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  portraitGrayscale: boolean;
}) {
  const motionOff = useReducedMotion() === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const stepTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const descriptionSizeClass = aboutValueStepsDescriptionSizeClass(contentSize);
  const emptyMessageClass = infoContentEducationMetaSizeClass(contentSize);
  const visibleSkills = skillItems.filter(
    (item) => item.title?.trim() || item.description?.trim()
  );
  const showIntro = introEnabled && introParagraphs.length > 0;
  const showValuesContent =
    showSkills &&
    (valuesLayout === 'value-steps' ? visibleSkills.length > 0 : true);
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const avatarSrc = avatarUrl?.trim() || '';
  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const showPortrait = Boolean(avatarSrc || initials);
  const showFooter = showStrengthsBlock || showPortrait;
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleTools = toolItems.map((item) => item.trim()).filter(Boolean);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showInterestsBlock = showInterests && visibleInterests.length > 0;
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showToolsBlock = showSystemsTools && visibleTools.length > 0;

  const metaBlocks: { key: string; node: ReactNode }[] = [];

  if (showInterestsBlock) {
    metaBlocks.push({
      key: 'interests',
      node: (
        <ValueStepsMetaBlock
          label={ABOUT_VALUE_STEPS_SECTION_LABELS.interests}
          accent={accent}
          contentSize={contentSize}
        >
          <ValueStepsInlineDotList
            items={visibleInterests}
            bodyColor={bodyColor}
            bodySizeClass={descriptionSizeClass}
          />
        </ValueStepsMetaBlock>
      ),
    });
  }

  if (showToolsBlock) {
    metaBlocks.push({
      key: 'tools',
      node: (
        <ValueStepsMetaBlock
          label={ABOUT_VALUE_STEPS_SECTION_LABELS.systemsTools}
          accent={accent}
          contentSize={contentSize}
        >
          <ValueStepsInlineDotList
            items={visibleTools}
            bodyColor={bodyColor}
            bodySizeClass={descriptionSizeClass}
          />
        </ValueStepsMetaBlock>
      ),
    });
  }

  const showMeta = metaBlocks.length > 0;
  const showMetaSection = showMeta || showEducationBlock || showLanguagesBlock;

  useEffect(() => {
    rootRef.current?.setAttribute('data-pf-js', 'true');
  }, []);

  const rootStyle = {
    '--pf-about-values-accent': accent,
    '--pf-about-values-line': cardBorder,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="pf-about-values w-full"
      data-pf-entry={motionOff ? 'static' : 'armed'}
      data-pf-layout={valuesLayout}
      style={rootStyle}
    >
      {showIntro ? (
        <motion.div
          className="pf-about-values-intro max-w-3xl space-y-6 sm:max-w-4xl sm:space-y-7 lg:max-w-5xl"
          data-pf-no-color-transition=""
          initial={motionOff ? false : 'hidden'}
          whileInView={motionOff ? undefined : 'show'}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_INTRO_VIEWPORT}
          variants={ABOUT_VALUE_STEPS_INTRO_STAGGER}
        >
          {introParagraphs.map((paragraph, index) => (
            <motion.p
              key={paragraph.slice(0, 48)}
              className={`pf-about-values-intro-p leading-relaxed ${stepTitleClass}${
                index === 0 ? ' pf-about-values-intro-p--display' : ''
              }`}
              style={
                index === 0
                  ? { color: subtitleColor, fontStyle: 'italic', fontWeight: 500, ...ABOUT_VALUE_SERIF_STYLE }
                  : { color: subtitleColor }
              }
              variants={motionOff ? undefined : ABOUT_VALUE_STEPS_INTRO_LINE}
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      ) : null}

      {showIntro && showValuesContent ? (
        <motion.div
          className="pf-about-values-rule my-14 h-px w-full origin-left sm:my-16 lg:my-20"
          style={{ backgroundColor: cardBorder }}
          aria-hidden
          data-pf-no-color-transition=""
          initial={motionOff ? false : { scaleX: 0 }}
          whileInView={motionOff ? undefined : { scaleX: 1 }}
          viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
          transition={{ duration: 0.86, ease: ABOUT_VALUE_STEPS_EASE }}
        />
      ) : null}

      {showValuesContent ? (
        <div className="pf-about-values-stage">
          {valuesLayout === 'value-steps' ? (
            <AboutValueStepsNativeValues
              title={title}
              visibleSkills={visibleSkills}
              accent={accent}
              titleColor={titleColor}
              subtitleColor={subtitleColor}
              bodyColor={bodyColor}
              contentSize={contentSize}
            />
          ) : null}
          {valuesLayout === 'editorial' ? (
      <AboutValueRow
        heading={title}
        items={skillItems}
        listMode="skills"
        showList={showSkills}
        emptyListMessage="Ajoute des skills dans Creator Studio → Information."
        accent={accent}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
              listMarkerStyle={listMarkerStyle}
              blocksLayout="split"
              contentSize={contentSize}
            />
          ) : null}
          {valuesLayout === 'numbered-grid' ? (
            <AboutValueNumberedGrid
              title={title}
              items={skillItems}
            titleColor={titleColor}
            subtitleColor={subtitleColor}
            bodyColor={bodyColor}
              contentSize={contentSize}
              emptyMessage="Ajoute des skills dans Creator Studio → Information."
            />
          ) : null}
          {valuesLayout === 'indexed-list' ? (
            <AboutValueIndexedList
              title={title}
              items={skillItems}
              titleColor={titleColor}
              subtitleColor={subtitleColor}
              bodyColor={bodyColor}
              cardBorder={cardBorder}
              contentSize={contentSize}
              emptyMessage="Ajoute des skills dans Creator Studio → Information."
            />
          ) : null}
        </div>
      ) : !showIntro && showSkills ? (
        <p className={`opacity-60 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          Ajoute des skills dans Creator Studio → Information.
        </p>
      ) : null}

      {showFooter ? (
        <div className="pf-about-values-footer mt-32 sm:mt-40 lg:mt-48 xl:mt-56">
          <motion.div
            className="pf-about-values-rule mb-14 h-px w-full origin-left sm:mb-16 lg:mb-20"
            style={{ backgroundColor: cardBorder }}
            aria-hidden
            data-pf-no-color-transition=""
            initial={motionOff ? false : { scaleX: 0 }}
            whileInView={motionOff ? undefined : { scaleX: 1 }}
            viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
            transition={{ duration: 0.8, ease: ABOUT_VALUE_STEPS_EASE }}
          />
          <motion.div
            className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16"
            data-pf-no-color-transition=""
            initial={motionOff ? false : 'hidden'}
            whileInView={motionOff ? undefined : 'show'}
            viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
            variants={ABOUT_VALUE_STEPS_META_STAGGER}
          >
            {showStrengthsBlock ? (
              <motion.div
                className="pf-about-values-strengths min-w-0 lg:col-span-6"
                variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
              >
                <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
                  {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
                </ManifestoSectionLabel>
                <ValueStepsFloatingSkillWords
                  items={visibleStrengths}
                  bodyColor={subtitleColor}
                  bodySizeClass={stepTitleClass}
                />
              </motion.div>
            ) : null}

            {showPortrait ? (
              <motion.div
                className={`flex justify-center lg:col-span-6 ${
                  showStrengthsBlock ? 'lg:justify-end' : 'lg:col-start-7 lg:justify-end'
                }`}
                variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
              >
                <motion.div
                  className="pf-about-values-portrait inline-flex overflow-hidden"
                  data-pf-no-color-transition=""
                  initial={motionOff ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
                  whileInView={motionOff ? undefined : { clipPath: 'inset(0% 0% 0% 0%)' }}
                  viewport={motionOff ? undefined : { once: true, amount: 0.42 }}
                  transition={{ duration: 1.08, ease: ABOUT_VALUE_STEPS_EASE }}
                >
                  <ValueStepsSquarePortrait
                    avatarSrc={avatarSrc}
                    initials={initials}
                    fullName={fullName}
                    accent={accent}
                    bodyColor={bodyColor}
                    portraitGrayscale={portraitGrayscale}
                  />
                </motion.div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      ) : null}

      {showMetaSection ? (
        <div className="pf-about-values-meta-section mt-32 sm:mt-40 lg:mt-48 xl:mt-56">
          <ValueStepsSectionRule cardBorder={cardBorder} className="pf-about-values-rule mb-14 sm:mb-16 lg:mb-20" />
          {showEducationBlock ? (
            <motion.div
              className={`pf-about-values-meta ${showMeta || showLanguagesBlock ? 'mb-32 sm:mb-40 lg:mb-48 xl:mb-56' : ''}`}
              data-pf-no-color-transition=""
              initial={motionOff ? false : { opacity: 0, y: 22 }}
              whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
              viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
              transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
            >
              <ValueStepsEducationList
                items={educationItems}
                accent={accent}
                subtitleColor={subtitleColor}
                bodyColor={bodyColor}
                contentSize={contentSize}
              />
            </motion.div>
          ) : null}
          {showMeta ? (
            motionOff ? (
              <div className={showLanguagesBlock ? 'mb-32 sm:mb-40 lg:mb-48 xl:mb-56' : ''}>
                <ValueStepsMetaGrid blocks={metaBlocks} />
              </div>
            ) : (
              <motion.div
                className={`grid grid-cols-1 gap-16 sm:gap-20 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 xl:gap-x-16 ${
                  showLanguagesBlock ? 'mb-32 sm:mb-40 lg:mb-48 xl:mb-56' : ''
                }`}
                data-pf-no-color-transition=""
                initial="hidden"
                whileInView="show"
                viewport={ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
                variants={ABOUT_VALUE_STEPS_META_STAGGER}
              >
                {metaBlocks.map((block) => (
                  <motion.div
                    key={block.key}
                    className="pf-about-values-meta min-w-0"
                    variants={ABOUT_VALUE_STEPS_FADE}
                  >
                    {block.node}
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : null}
          {showLanguagesBlock ? (
            <motion.div
              className="pf-about-values-meta min-w-0"
              data-pf-no-color-transition=""
              initial={motionOff ? false : { opacity: 0, y: 18 }}
              whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
              viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
              transition={{ duration: 0.72, ease: ABOUT_VALUE_STEPS_EASE }}
            >
              <ValueStepsMetaBlock
                label={ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
                accent={accent}
                contentSize={contentSize}
              >
                <ValueStepsLanguageDial
                  items={languageItems}
                  accent={accent}
                  titleColor={titleColor}
                  bodyColor={bodyColor}
                  contentSize={contentSize}
                />
              </ValueStepsMetaBlock>
            </motion.div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Info section designs:
 * - about-me: label + subtitle + bio + education + cards
 * - about-me-trait: centered title + accent trait + portrait/bio + skills/strengths/languages + education timeline
 * - about-split: sticky portrait split — specialty headline, bio lede, numbered skills, strength tags, typographic languages
 * - about-banner: XXL centered headline — portrait bottom-left, bio bottom-right
 * - about-platform: Jasper-style — kicker + headline left, bio right ; skills card grid (4 per row)
 * - about-portrait-skills: sticky split frame — XXL skill rail left, pinned portrait right, ghost strength badges
 * - about-manifesto: huge statement + accent rule + skills/strengths/languages index + education + capability blocks
 * - about-terminal: dev console shell — monospace commands, no portrait
 * - about-value-steps: My Values — steps, editorial, numbered grid or indexed list ; intro, footer, meta blocks
 */
export function EditorialAboutMeSection({
  title,
  subtitle,
  bio,
  specialty,
  avatarUrl,
  fullName,
  education,
  skills,
  strengths,
  interests,
  languages,
  languagesFallback,
  systemsTools,
  presentation,
  heroPalette,
  terminalDarkColors,
}: EditorialAboutMeSectionProps) {
  const accent = presentation.accentColor || '#e2572e';
  const titleColor = presentation.titleColor || accent;
  const subtitleColor = presentation.subtitleColor || '#f5f5f5';
  const bodyColor = presentation.bodyColor || '#a3a3a3';
  const cardBg = presentation.cardBackgroundColor || '#171717';
  const cardBorder = presentation.cardBorderColor || '#262626';
  const languageLevelStyle = resolveInfoLanguageLevelDisplayStyle(presentation);
  const educationDisplayStyle = resolveInfoEducationDisplayStyle(presentation);

  const educationItems = (education ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .filter((entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim());

  const skillEntries = resolveAboutSkillEntries(skills);
  const skillItems = skillEntries;
  const strengthItems = (strengths ?? []).map((s) => s.trim()).filter(Boolean);
  const interestItems = (interests ?? []).map((s) => s.trim()).filter(Boolean);
  const toolItems = (systemsTools ?? []).map((s) => s.trim()).filter(Boolean);
  const languageItems = resolveLanguageItems(languages, languagesFallback);

  const showEducation = presentation.showEducation !== false && educationItems.length > 0;
  const showSkills = presentation.showSkills !== false;
  const showStrengths = resolveInfoShowStrengths(presentation);
  const showInterests = presentation.showInterests !== false;
  const showLanguages = presentation.showLanguages !== false;
  const showSystemsTools = presentation.showSystemsTools !== false && toolItems.length > 0;
  const contentSize = resolveInfoPremiumFontSize(presentation);
  const infoDesign = resolveInfoDesign(presentation.design);
  const portraitGrayscale = resolveInfoPortraitGrayscale(presentation);

  if (infoDesign === 'about-manifesto') {
    return (
      <AboutManifestoLayout
        title={title}
        subtitle={subtitle}
        specialty={specialty}
        bio={bio}
        avatarUrl={avatarUrl}
        fullName={fullName}
        educationItems={educationItems}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        languageItems={languageItems}
        toolItems={toolItems}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showSkills={showSkills}
        showStrengths={showStrengths}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showLanguages={showLanguages}
        showSystemsTools={showSystemsTools}
        avatarGrayscale={portraitGrayscale}
        portraitFrame={resolveInfoAboutManifestoPortraitFrame(presentation)}
        blocksLayout={resolveInfoAboutManifestoBlocksLayout(presentation)}
        blocksScrollFocus={resolveInfoAboutManifestoBlocksScrollFocus(presentation)}
        contentSize={contentSize}
        accent={accent}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
        statementStyle={resolveInfoAboutManifestoStatementStyle(presentation)}
        colorMode={presentation.activeColorMode === 'light' ? 'light' : 'dark'}
      />
    );
  }

  if (infoDesign === 'about-platform') {
    return (
      <AboutPlatformLayout
        title={title}
        bio={bio}
        subtitle={subtitle}
        specialty={specialty}
        skillItems={skillItems}
        strengthItems={strengthItems}
        educationItems={educationItems}
        languageItems={languageItems}
        interestItems={interestItems}
        showSkills={showSkills}
        showStrengths={showStrengths && strengthItems.length > 0}
        showLanguages={resolveInfoShowLanguages(presentation) && languageItems.length > 0}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        languageLevelStyle={languageLevelStyle}
        headlineText={resolveAboutPlatformHeadlineText(presentation, specialty)}
        strengthsSectionTitle={resolveAboutPlatformStrengthsSectionTitle(presentation)}
        accent={accent}
        titleColor={
          presentation.useHeroPalette === false
            ? titleColor
            : presentation.activeColorMode === 'light'
              ? '#171717'
              : subtitleColor
        }
        bodyColor={bodyColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
        contentSize={contentSize}
      />
    );
  }

  if (infoDesign === 'about-banner') {
    const bannerSectionLabels = resolveAboutBannerSectionLabels(presentation);

    return (
      <AboutBannerLayout
        title={title}
        subtitle={subtitle}
        bio={bio}
        specialty={specialty}
        avatarUrl={avatarUrl}
        fullName={fullName}
        skillItems={skillItems}
        showSkills={showSkills}
        skillsLabel={bannerSectionLabels.skills}
        strengthItems={strengthItems}
        showStrengths={showStrengths}
        strengthsLabel={bannerSectionLabels.strengths}
        educationItems={educationItems}
        interestItems={interestItems}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        educationLabel={bannerSectionLabels.education}
        interestsLabel={bannerSectionLabels.interests}
        contentSize={contentSize}
        skillsTitleColor={subtitleColor}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
        portraitGrayscale={portraitGrayscale}
      />
    );
  }

  if (infoDesign === 'about-portrait-skills') {
    const resolvedTitleColor =
      presentation.useHeroPalette === false
        ? titleColor
        : presentation.activeColorMode === 'light'
          ? '#171717'
          : subtitleColor;

    return (
      <AboutPortraitSkillsLayout
        title={title}
        subtitle={subtitle}
        bio={bio}
        avatarUrl={avatarUrl}
        fullName={fullName}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        languageItems={languageItems}
        educationItems={educationItems}
        showSkills={showSkills}
        showStrengths={showStrengths && strengthItems.length > 0}
        showInterests={interestItems.length > 0}
        showLanguages={languageItems.length > 0}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        metaLead={resolveAboutPortraitSkillsMetaLead(presentation)}
        metaEnabled={resolveAboutPortraitSkillsMetaEnabled(presentation)}
        titleColor={resolvedTitleColor}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBg={cardBg}
        contentSize={contentSize}
        portraitGrayscale={portraitGrayscale}
      />
    );
  }

  if (infoDesign === 'about-split') {
    return (
      <AboutSplitLayout
        title={title}
        subtitle={subtitle}
        bio={bio}
        specialty={specialty}
        avatarUrl={avatarUrl}
        fullName={fullName}
        educationItems={educationItems}
        skillItems={skillItems}
        strengthItems={strengthItems}
        languageItems={languageItems}
        toolItems={toolItems}
        showEducation={showEducation}
        showSkills={showSkills}
        showStrengths={showStrengths}
        showLanguages={showLanguages}
        showSystemsTools={showSystemsTools}
        languageLevelStyle={languageLevelStyle}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        contentSize={contentSize}
        portraitSide={resolveInfoAboutSplitPortraitSide(presentation)}
        sectionLabels={resolveAboutSplitSectionLabels(presentation)}
        accent={accent}
        titleColor={
          presentation.useHeroPalette === false
            ? titleColor
            : presentation.activeColorMode === 'light'
              ? '#171717'
              : subtitleColor
        }
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
        portraitGrayscale={portraitGrayscale}
      />
    );
  }

  if (presentation.design === 'about-terminal') {
    const terminalDark = presentation.aboutTerminalAlwaysDark === true ? terminalDarkColors : null;
    return (
      <AboutTerminalLayout
        className="pf-about-terminal"
        title={title}
        subtitle={subtitle}
        fullName={fullName}
        bio={bio}
        educationItems={educationItems}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        toolItems={toolItems}
        languageItems={languageItems}
        showEducation={showEducation}
        showSkills={showSkills && skillItems.length > 0}
        showStrengths={showStrengths && strengthItems.length > 0}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showLanguages={showLanguages && languageItems.length > 0}
        showSystemsTools={resolveInfoShowSystemsTools(presentation) && toolItems.length > 0}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        languageLevelStyle={languageLevelStyle}
        contentSize={contentSize}
        colorMode={resolveInfoAboutTerminalColorMode(presentation)}
        accent={terminalDark?.accentColor ?? accent}
        titleColor={terminalDark?.titleColor ?? titleColor}
        subtitleColor={terminalDark?.subtitleColor ?? subtitleColor}
        bodyColor={terminalDark?.bodyColor ?? bodyColor}
        cardBg={terminalDark?.cardBackgroundColor ?? cardBg}
        cardBorder={terminalDark?.cardBorderColor ?? cardBorder}
      />
    );
  }

  if (presentation.design === 'about-index') {
    return (
      <AboutIndexEditorialLayout
        className="pf-about-index-wrap"
        title={title}
        subtitle={subtitle}
        fullName={fullName}
        bio={bio}
        educationItems={educationItems}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        toolItems={toolItems}
        languageItems={languageItems}
        showEducation={showEducation}
        showSkills={showSkills && skillItems.length > 0}
        showStrengths={showStrengths && strengthItems.length > 0}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showLanguages={showLanguages && languageItems.length > 0}
        showSystemsTools={resolveInfoShowSystemsTools(presentation) && toolItems.length > 0}
        contentSize={contentSize}
        accent={accent}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
      />
    );
  }

  if (presentation.design === 'about-value-steps') {
    return (
      <AboutValueStepsLayout
        title={title}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        toolItems={toolItems}
        languageItems={languageItems}
        educationItems={educationItems}
        showSkills={showSkills}
        showStrengths={resolveInfoShowStrengths(presentation) && strengthItems.length > 0}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showSystemsTools={resolveInfoShowSystemsTools(presentation) && toolItems.length > 0}
        showLanguages={resolveInfoShowLanguages(presentation) && languageItems.length > 0}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        languageLevelStyle={languageLevelStyle}
        introEnabled={presentation.aboutValueStepsIntroEnabled !== false}
        introParagraphs={resolveAboutValueStepsIntroParagraphs(presentation)}
        avatarUrl={avatarUrl}
        fullName={fullName}
        accent={accent}
        titleColor={
          presentation.useHeroPalette === false
            ? titleColor
            : presentation.activeColorMode === 'light'
              ? '#171717'
              : subtitleColor
        }
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBorder={cardBorder}
        contentSize={contentSize}
        valuesLayout={resolveInfoAboutValueValuesLayout(presentation)}
        listMarkerStyle={resolveInfoAboutValueListMarkerStyle(presentation)}
        portraitGrayscale={portraitGrayscale}
      />
    );
  }

  if (presentation.design === 'about-me-trait') {
    const headlineText = resolveAboutMeTraitHeadlineText(
      presentation.aboutMeTraitHeadlineCustomText
    );
    const showHeadline = presentation.aboutMeTraitHeadlineEnabled !== false;

    return (
      <AboutMeTraitLayout
        title={title}
        headlineText={headlineText}
        showHeadline={showHeadline}
        avatarUrl={avatarUrl}
        fullName={fullName}
        educationItems={educationItems}
        skillItems={skillItems}
        strengthItems={strengthItems}
        languageItems={languageItems}
        showEducation={showEducation}
        showSkills={showSkills}
        showStrengths={showStrengths}
        showLanguages={showLanguages}
        languageLevelStyle={languageLevelStyle}
        educationDisplayStyle={educationDisplayStyle}
        cascadeScrollShift={resolveInfoEducationCascadeScrollShift(presentation)}
        contentSize={contentSize}
        accent={accent}
        titleColor={
          presentation.useHeroPalette === false
            ? titleColor
            : presentation.activeColorMode === 'light'
              ? '#171717'
              : subtitleColor
        }
        bodyColor={bodyColor}
        cardBg={cardBg}
        cardBorder={cardBorder}
        portraitGrayscale={portraitGrayscale}
        colorMode={presentation.activeColorMode === 'light' ? 'light' : 'dark'}
      />
    );
  }

  return (
    <AboutMeClassicLayout
      title={title}
      subtitle={subtitle}
      bio={bio}
      educationItems={educationItems}
      skillItems={skillItems}
      strengthItems={strengthItems}
      languageItems={languageItems}
      toolItems={toolItems}
      showEducation={showEducation}
      showSkills={showSkills && skillItems.length > 0}
      showStrengths={showStrengths && strengthItems.length > 0}
      showLanguages={showLanguages && languageItems.length > 0}
      showSystemsTools={showSystemsTools}
      languageLevelStyle={languageLevelStyle}
      contentSize={contentSize}
      accent={accent}
      titleColor={titleColor}
      subtitleColor={subtitleColor}
      bodyColor={bodyColor}
      cardBg={cardBg}
      cardBorder={cardBorder}
    />
  );
}
