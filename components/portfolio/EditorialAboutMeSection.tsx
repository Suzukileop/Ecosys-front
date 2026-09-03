'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type {
  LanguageProficiencyLevel,
  ProfileEducationEntry,
  ProfileSpokenLanguage,
} from '@/types/ecosystem';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import {
  aboutMeTraitHeadlineSizeClass,
  aboutMeTraitSectionTitleSizeClass,
  aboutBannerBioSizeClass,
  aboutBannerHeadlineSizeClass,
  aboutFeatureMetaIntroSizeClass,
  aboutFeatureQuoteSizeClass,
  aboutFeatureSkillTitleSizeClass,
  aboutPlatformHeadlineSizeClass,
  aboutPlatformLeadSizeClass,
  aboutPlatformSkillsTitleSizeClass,
  aboutPortraitSkillsBioSizeClass,
  aboutPortraitSkillsListSizeClass,
  aboutPortraitSkillsMetaSizeClass,
  aboutPortraitSkillsStrengthsItemSizeClass,
  aboutPortraitSkillsStrengthsTitleSizeClass,
  aboutSplitTitleSizeClass,
  aboutValueBlockTitleSizeClass,
  aboutValueNumberedGridIndexSizeClass,
  aboutValueStepsDescriptionSizeClass,
  aboutValueStepsItemTitleSizeClass,
  ABOUT_VALUE_STEPS_SECTION_LABELS,
  infoContentBlockTitleSizeClass,
  infoContentBodySizeClass,
  infoContentEducationMetaSizeClass,
  infoContentLabelSizeClass,
  infoContentSectionTitleSizeClass,
  manifestoStatementSecondarySizeClass,
  resolveAboutValueStepsIntroParagraphs,
  resolveAboutMeTraitHeadlineText,
  resolveAboutBannerHeadlineText,
  resolveAboutBannerSectionLabels,
  resolveAboutFeatureIntroLines,
  resolveAboutFeatureMetaIntroLines,
  resolveAboutPlatformHeadlineText,
  resolveAboutPlatformStrengthsSectionTitle,
  resolveAboutPortraitSkillsMetaEnabled,
  resolveAboutPortraitSkillsMetaLead,
  resolveInfoAboutPlatformStaggerLayout,
  type AboutFeatureIntroLine,
  resolveInfoContentSize,
  resolveInfoAboutValueValuesLayout,
  resolveInfoAboutValueListMarkerStyle,
  resolveInfoAboutManifestoBlocksLayout,
  resolveInfoAboutManifestoBlocksScrollFocus,
  resolveInfoAboutManifestoPortraitFrame,
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
  type PortfolioInfoContentSize,
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
import {
  ToolsLevelGlowDots,
  ToolsLevelProgressBar,
  ToolsLevelStarRating,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import { resolveSpokenLanguageLevelLabel, resolveSpokenLanguageFlagIso2 } from '@/lib/spoken-languages';
import {
  resolveAboutSkillEntries,
  skillEntryLabels,
  type ProfileSkillEntry,
} from '@/lib/about-skills';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import type { PortfolioListMarkerStyle } from '@/components/portfolio/portfolio-list-marker';

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
      {items.map((item) => (
        <li
          key={item}
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
  contentSize: PortfolioInfoContentSize;
}) {
  if (items.length === 0) return null;
  const blockTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  return (
    <div>
      <h3
        className={`text-left font-bold tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor }}
      >
        {label}
      </h3>
      <InfoBulletList
        items={items}
        accent={accent}
        body={bodyColor}
        showBullets={false}
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
  track,
  levelStyle,
  contentSize,
}: {
  label: string;
  items: LanguageDisplayItem[];
  titleColor: string;
  bodyColor: string;
  accent: string;
  track: string;
  levelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  contentSize: PortfolioInfoContentSize;
}) {
  if (items.length === 0) return null;
  const blockTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  return (
    <div>
      <h3
        className={`text-left font-bold tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor }}
      >
        {label}
      </h3>
      <InfoLanguageList
        items={items}
        accent={accent}
        body={bodyColor}
        track={track}
        levelStyle={levelStyle}
        showMarker={false}
        bodySizeClass={bodyClass}
      />
    </div>
  );
}

function AboutMeClassicLayout({
  title,
  subtitle,
  bio,
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
  languageLevelStyle,
  accent,
  titleColor,
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
  contentSize: PortfolioInfoContentSize;
}) {
  const labelClass = infoContentLabelSizeClass(contentSize);
  const sectionTitleClass = infoContentSectionTitleSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const blockTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const cardLabelClass = infoContentLabelSizeClass(contentSize);

  const gridCards: Array<{
    key: string;
    label: string;
    kind: 'strings' | 'languages';
    stringItems?: string[];
    languageItems?: LanguageDisplayItem[];
  }> = [];
  if (showSkills) {
    gridCards.push({
      key: 'skills',
      label: 'Skills',
      kind: 'strings',
      stringItems: skillEntryLabels(skillItems),
    });
  }
  if (showStrengths) {
    gridCards.push({
      key: 'strengths',
      label: 'Strengths',
      kind: 'strings',
      stringItems: strengthItems,
    });
  }
  if (showLanguages) {
    gridCards.push({
      key: 'languages',
      label: 'Languages',
      kind: 'languages',
      languageItems,
    });
  }
  if (showSystemsTools) {
    gridCards.push({
      key: 'systems',
      label: 'Systems & tools',
      kind: 'strings',
      stringItems: toolItems,
    });
  }

  const dividerStyle: CSSProperties = {
    backgroundColor: cardBorder,
  };

  return (
    <div className="w-full">
      <header className="max-w-3xl">
        <p
          className={`font-bold uppercase tracking-[0.2em] ${labelClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </p>
        {subtitle ? (
          <h2
            className={`mt-4 font-semibold tracking-tight ${sectionTitleClass}`}
            style={{ color: subtitleColor }}
          >
            {subtitle}
          </h2>
        ) : null}
        <div className="mt-8 h-px w-full" style={dividerStyle} />
        {bio?.trim() ? (
          <p
            className={`mt-8 max-w-3xl leading-relaxed ${bodyClass}`}
            style={{ color: bodyColor }}
          >
            {bio.trim()}
          </p>
        ) : null}
      </header>

      {showEducation ? (
        <section className="mt-14 sm:mt-16">
          <p
            className={`font-bold uppercase tracking-[0.18em] ${labelClass}`}
            style={{ color: accent }}
          >
            Education
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {educationItems.map((entry) => (
              <div
                key={entry.id || `${entry.title}-${entry.schoolYear}`}
                className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border p-5 sm:p-6"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                {entry.schoolYear?.trim() ? (
                  <p className={metaClass} style={{ color: bodyColor }}>
                    {entry.schoolYear.trim()}
                  </p>
                ) : null}
                {entry.title?.trim() ? (
                  <p
                    className={`mt-2 font-semibold leading-snug ${blockTitleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {entry.title.trim()}
                  </p>
                ) : null}
                {entry.institution?.trim() ? (
                  <p className={`mt-2 leading-relaxed ${bodyClass}`} style={{ color: bodyColor }}>
                    {entry.institution.trim()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {gridCards.length > 0 ? (
        <section className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
          {gridCards.map((card) => (
            <InfoCard
              key={card.key}
              label={card.label}
              accent={accent}
              cardBg={cardBg}
              cardBorder={cardBorder}
              labelSizeClass={cardLabelClass}
            >
              {card.kind === 'languages' ? (
                <InfoLanguageList
                  items={card.languageItems ?? []}
                  accent={accent}
                  body={bodyColor}
                  track={cardBorder}
                  levelStyle={languageLevelStyle}
                  bodySizeClass={bodyClass}
                />
              ) : (
                <InfoBulletList
                  items={card.stringItems ?? []}
                  accent={accent}
                  body={bodyColor}
                  bodySizeClass={bodyClass}
                />
              )}
            </InfoCard>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function AboutMeTraitHeadline({
  text,
  color,
  contentSize,
}: {
  text: string;
  color: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const headlineClass = aboutMeTraitHeadlineSizeClass(contentSize);

  return (
    <div className="flex min-h-full min-w-0 flex-col justify-center gap-3 sm:gap-4 lg:h-full lg:justify-between lg:gap-0 lg:py-1">
      {lines.map((line, index) => (
        <p
          key={`${index}-${line}`}
          className={`text-left font-bold leading-[0.95] tracking-[-0.03em] ${headlineClass}`}
          style={{ color }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/** Symmetric vertical rhythm above and below the skills / strengths / languages row. */
const ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM = 'mt-28 sm:mt-32 lg:mt-36';
/** Education — same gap as above skills, no horizontal divider. */
const ABOUT_ME_TRAIT_EDUCATION_SECTION_TOP = 'mt-28 sm:mt-32 lg:mt-36';

function AboutMeTraitLayout({
  title,
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
  languageLevelStyle,
  educationDisplayStyle,
  cascadeScrollShift = false,
  contentSize,
  accent,
  titleColor,
  bodyColor,
  cardBg,
  cardBorder,
  portraitGrayscale,
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
  contentSize: PortfolioInfoContentSize;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  portraitGrayscale: boolean;
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
  const sectionTitleClass = aboutMeTraitSectionTitleSizeClass(contentSize);
  const placeholderBodyClass = infoContentBodySizeClass(contentSize);

  return (
    <div className="w-full">
      <header className="flex flex-col items-start text-left">
        <h2
          className={`font-bold uppercase tracking-[0.08em] ${sectionTitleClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </h2>
        <div
          className="mt-3 h-[4px] w-14 sm:mt-4 sm:w-16"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </header>

      <div className="mt-12 flex flex-col sm:mt-14">
        <div
          className={`grid gap-8 lg:items-stretch lg:gap-14 ${
            showHeadline
              ? 'lg:grid-cols-[minmax(18rem,min(26rem,34%))_minmax(0,1fr)]'
              : 'lg:grid-cols-1'
          }`}
        >
          <div
            className={`mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden bg-neutral-800 sm:aspect-square lg:mx-0 lg:aspect-auto lg:h-[min(24rem,28vw)] lg:w-[min(24rem,28vw)] lg:max-w-none lg:shrink-0 ${
              showHeadline ? '' : 'lg:h-auto lg:w-full lg:aspect-square lg:max-w-[40rem]'
            }`}
          style={{ backgroundColor: cardBg }}
        >
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

          {showHeadline ? (
            headlineText.length > 0 ? (
              <div className="flex min-h-0 min-w-0 lg:h-full">
                <AboutMeTraitHeadline
                  text={headlineText}
                  color={titleColor}
                  contentSize={contentSize}
                />
              </div>
            ) : (
              <div className="flex min-h-full min-w-0 flex-col justify-center lg:py-2">
                <p className={`opacity-60 ${placeholderBodyClass}`} style={{ color: bodyColor }}>
                  Ajoute un grand titre personnalisé dans les réglages Info.
                </p>
        </div>
            )
          ) : null}
      </div>

      {(showSkillsBlock || showStrengthsBlock || showLanguagesBlock) && (
          <section
            className={`grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3 ${ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM}`}
          >
          {showSkillsBlock ? (
            <TraitHeadingList
              label="Skills"
              items={skillEntryLabels(skillItems)}
              titleColor={titleColor}
              bodyColor={bodyColor}
              accent={titleColor}
                contentSize={contentSize}
            />
          ) : null}
          {showStrengthsBlock ? (
            <TraitHeadingList
              label="Strengths"
              items={strengthItems}
              titleColor={titleColor}
              bodyColor={bodyColor}
              accent={titleColor}
                contentSize={contentSize}
            />
          ) : null}
          {showLanguagesBlock ? (
            <TraitLanguageList
              label="Languages"
              items={languageItems}
              titleColor={titleColor}
              bodyColor={bodyColor}
              accent={titleColor}
              track={cardBorder}
              levelStyle={languageLevelStyle}
                contentSize={contentSize}
            />
          ) : null}
        </section>
      )}
      </div>

      {showEducationBlock ? (
        <div className={ABOUT_ME_TRAIT_EDUCATION_SECTION_TOP}>
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
        </div>
      ) : null}
    </div>
  );
}

function AboutFeatureIntroLine({
  line,
  titleColor,
  bodyColor,
  introClass,
}: {
  line: AboutFeatureIntroLine;
  titleColor: string;
  bodyColor: string;
  introClass: string;
}) {
  return (
    <p
      className={`block w-full text-left font-semibold uppercase leading-[1.14] tracking-[-0.03em] ${introClass}`}
    >
      <span style={{ color: titleColor }}>{line.primary}</span>
      {line.secondary ? (
        <>
          {' '}
          <span style={{ color: bodyColor, opacity: 0.52 }}>{line.secondary}</span>
        </>
      ) : null}
    </p>
  );
}

function AboutFeaturePanelQuote({
  text,
  skillTitle,
  quoteClass,
  titleColor,
  bodyColor,
  bodyClass,
  isPlaceholder = false,
  hideAttribution = false,
}: {
  text: string;
  skillTitle: string;
  quoteClass: string;
  titleColor: string;
  bodyColor: string;
  bodyClass: string;
  isPlaceholder?: boolean;
  hideAttribution?: boolean;
}) {
  const quoteColor = isPlaceholder ? bodyColor : titleColor;

  return (
    <figure className="mx-auto w-full max-w-xl px-2 text-center sm:max-w-2xl sm:px-4 lg:max-w-2xl">
      <blockquote className="m-0">
        <p
          className={`${quoteClass} font-serif font-bold leading-[1.22] tracking-[-0.02em] sm:leading-[1.24] lg:leading-[1.26]`}
          style={{ color: quoteColor, opacity: isPlaceholder ? 0.55 : 1 }}
        >
          <span
            className="mr-1 inline-block align-top font-serif text-[1.08em] leading-none sm:mr-1.5"
            style={{ color: titleColor, opacity: 0.72 }}
            aria-hidden
          >
            &ldquo;
          </span>
          {text}
          <span
            className="ml-1 inline-block align-bottom font-serif text-[1.08em] leading-none sm:ml-1.5"
            style={{ color: titleColor, opacity: 0.72 }}
            aria-hidden
          >
            &rdquo;
          </span>
        </p>
      </blockquote>
      {skillTitle && !hideAttribution ? (
        <figcaption
          className={`mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] sm:mt-6 sm:text-[0.72rem] ${bodyClass}`}
          style={{ color: bodyColor, opacity: 0.72 }}
        >
          {skillTitle}
        </figcaption>
      ) : null}
    </figure>
  );
}

function AboutFeaturePanelMobileAccordionPanel({
  isOpen,
  reduceMotion,
  cardBg,
  children,
}: {
  isOpen: boolean;
  reduceMotion: boolean | null;
  cardBg: string;
  children: ReactNode;
}) {
  const motionDisabled = reduceMotion === true;

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="panel"
          initial={motionDisabled ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={motionDisabled ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={
            motionDisabled
              ? { duration: 0 }
              : {
                  height: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.28, ease: 'easeOut' },
                }
          }
          className="overflow-hidden"
        >
          <div className="pt-4 sm:pt-5">
            <div
              className="rounded-2xl px-5 py-6 sm:px-6 sm:py-7"
              style={{ backgroundColor: cardBg }}
            >
              {children}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AboutPlatformSkillIcon({ variant, color }: { variant: number; color: string }) {
  const stroke = color;
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (variant % 4) {
    case 1:
      return (
        <svg {...common}>
          <path d="M12 3l1.9 5.8H20l-4.8 3.5 1.8 5.7L12 14.4 7 17.9l1.8-5.7L4 8.8h6.1L12 3z" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15V11" />
          <path d="M12 15V8" />
          <path d="M16 15v-5" />
        </svg>
      );
    case 3:
      return (
        <svg {...common}>
          <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
          <path d="M12 11v6" />
          <path d="M9 9h6" />
        </svg>
      );
    case 0:
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
  }
}

function aboutPlatformSkillCascadeClass(index: number): string {
  switch (index) {
    case 0:
      return '';
    case 1:
      return 'lg:translate-y-14 xl:translate-y-16';
    case 2:
      return 'lg:translate-y-28 xl:translate-y-32';
    case 3:
      return 'lg:translate-y-[10.5rem] xl:translate-y-[11.5rem]';
    case 4:
      return 'lg:translate-y-56 xl:translate-y-60';
    case 5:
      return 'lg:translate-y-[17.5rem] xl:translate-y-[19rem]';
    default:
      return 'lg:translate-y-[21rem] xl:translate-y-[23rem]';
  }
}

function AboutPlatformSkillCard({
  skill,
  index,
  titleColor,
  bodyColor,
  cardBg,
  cardBorder,
  cardTitleClass,
  cardBodyClass,
}: {
  skill: ProfileSkillEntry;
  index: number;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  cardTitleClass: string;
  cardBodyClass: string;
}) {
  const skillTitle = skill.title?.trim() || '';
  const skillDescription = skill.description?.trim() || '';
  const isPlaceholder = !skillDescription;

  return (
    <article
      className="flex h-full flex-col rounded-2xl border p-5 sm:p-6"
      style={{ backgroundColor: cardBg, borderColor: cardBorder }}
    >
      <div className="flex min-h-[3.25rem] items-start justify-between gap-3 sm:min-h-[3.5rem]">
        <h4
          className={`min-w-0 flex-1 font-semibold leading-snug tracking-[-0.02em] ${cardTitleClass}`}
          style={{ color: titleColor }}
        >
          {skillTitle}
        </h4>
        <span className="shrink-0 opacity-80">
          <AboutPlatformSkillIcon variant={index} color={bodyColor} />
        </span>
      </div>
      <p
        className={`mt-4 min-w-0 flex-1 leading-relaxed sm:mt-5 ${cardBodyClass}`}
        style={{ color: bodyColor, opacity: isPlaceholder ? 0.55 : 0.82 }}
      >
        {skillDescription || 'Add a description for this skill in Creator Studio → Information.'}
      </p>
    </article>
  );
}

function AboutPlatformSplitSection({
  title,
  staggerLayout,
  sectionTitleClass,
  titleColor,
  children,
}: {
  title: string;
  staggerLayout: boolean;
  sectionTitleClass: string;
  titleColor: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 grid gap-8 sm:mt-20 sm:gap-10 lg:mt-24 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-14 xl:mt-28 xl:gap-x-20">
      <h3
        className={`min-w-0 font-semibold leading-[1.06] tracking-[-0.03em] lg:col-start-1 lg:row-start-1 ${sectionTitleClass}`}
        style={{ color: titleColor }}
      >
        {title}
      </h3>
      <div
        className={`min-w-0 ${
          staggerLayout
            ? 'lg:col-start-2 lg:row-start-2 lg:pt-2 xl:pt-3'
            : 'lg:col-start-2 lg:row-start-1'
        }`}
      >
        {children}
      </div>
    </section>
  );
}

/** About · platform — Jasper-style hero split + skills card grid. */
function AboutPlatformLayout({
  title,
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
  showLanguageFlags,
  languageLevelStyle,
  headlineText,
  strengthsSectionTitle,
  staggerLayout,
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
  staggerLayout: boolean;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const headlineClass = aboutPlatformHeadlineSizeClass(contentSize);
  const leadClass = aboutPlatformLeadSizeClass(contentSize);
  const strengthsTitleClass = aboutPlatformSkillsTitleSizeClass(contentSize);
  const cardTitleClass = infoContentBlockTitleSizeClass(contentSize);
  const cardBodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const kickerLabel = title?.trim() || 'About me';
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

  return (
    <div className="w-full">
      <header className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-14 xl:gap-x-20">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p
            className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.8125rem]"
            style={{ color: accent }}
          >
            {kickerLabel}
          </p>
          <h2
            className={`mt-4 font-semibold leading-[1.08] tracking-[-0.03em] sm:mt-5 ${headlineClass}`}
            style={{ color: titleColor }}
          >
            {displayHeadlineLines.map((line, index) => (
              <span key={`${index}-${line}`} className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>
        {bioText ? (
          <div
            className={`min-w-0 ${
              staggerLayout
                ? 'lg:col-start-2 lg:row-start-2 lg:pt-2 xl:pt-3'
                : 'lg:col-start-2 lg:row-start-1 lg:pt-9 xl:pt-10'
            }`}
          >
            <p
              className={`max-w-xl font-semibold leading-[1.12] tracking-[-0.02em] lg:max-w-none ${leadClass}`}
              style={{ color: bodyColor, opacity: 0.88 }}
            >
              {bioText}
            </p>
          </div>
        ) : null}
      </header>

      {showSkillsBlock ? (
        <section
          className={`mt-16 sm:mt-20 lg:mt-24 xl:mt-28 ${staggerLayout ? 'lg:pb-40 xl:pb-44' : ''}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:items-stretch lg:gap-5">
            {visibleSkills.map((skill, index) => (
              <div
                key={skill.id}
                className={`flex h-full min-h-0 flex-col ${
                  staggerLayout ? aboutPlatformSkillCascadeClass(index) : ''
                }`}
              >
                <AboutPlatformSkillCard
                  skill={skill}
                  index={index}
                  titleColor={titleColor}
                  bodyColor={bodyColor}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  cardTitleClass={cardTitleClass}
                  cardBodyClass={cardBodyClass}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showStrengthsBlock ? (
        <AboutPlatformSplitSection
          title={strengthsSectionTitle}
          staggerLayout={staggerLayout}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
        >
          <ul className="space-y-4 sm:space-y-5 lg:space-y-6">
            {visibleStrengths.map((item) => (
              <li
                key={item}
                className={`font-semibold leading-[1.12] tracking-[-0.02em] ${leadClass}`}
                style={{ color: bodyColor, opacity: 0.88 }}
              >
                {item}
              </li>
            ))}
          </ul>
        </AboutPlatformSplitSection>
      ) : null}

      {showLanguagesBlock ? (
        <AboutPlatformSplitSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
          staggerLayout={staggerLayout}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
        >
          <InfoLanguageList
            items={languageItems}
            accent={accent}
            body={bodyColor}
            track={bodyColor}
            levelStyle={languageLevelStyle}
            showMarker={showLanguageFlags}
            bodySizeClass={leadClass}
            className="mt-0 gap-y-4 sm:gap-y-5"
          />
        </AboutPlatformSplitSection>
      ) : null}

      {showEducationBlock ? (
        <AboutPlatformSplitSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.education}
          staggerLayout={staggerLayout}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
        >
          <ol className="space-y-6 sm:space-y-7">
            {visibleEducation.map((entry, index) => {
              const degree = entry.title?.trim() || '';
              const institution = entry.institution?.trim() || '';
              const year = entry.schoolYear?.trim() || '';
              const headline = degree || institution;
              const detail = degree && institution ? institution : '';

              return (
                <li key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}>
                  {headline ? (
                    <p
                      className={`font-semibold leading-[1.12] tracking-[-0.02em] ${leadClass}`}
                      style={{ color: bodyColor, opacity: 0.88 }}
                    >
                      {headline}
                    </p>
                  ) : null}
                  {year ? (
                    <p
                      className={`mt-1.5 font-medium tabular-nums leading-none ${metaClass}`}
                      style={{ color: bodyColor, opacity: 0.62 }}
                    >
                      {year}
                    </p>
                  ) : null}
                  {detail ? (
                    <p
                      className={`mt-1.5 leading-relaxed ${metaClass}`}
                      style={{ color: bodyColor, opacity: 0.72 }}
                    >
                      {detail}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </AboutPlatformSplitSection>
      ) : null}

      {showInterestsBlock ? (
        <AboutPlatformSplitSection
          title={ABOUT_VALUE_STEPS_SECTION_LABELS.interests}
          staggerLayout={staggerLayout}
          sectionTitleClass={strengthsTitleClass}
          titleColor={titleColor}
        >
          <ul className="space-y-4 sm:space-y-5 lg:space-y-6">
            {visibleInterests.map((item) => (
              <li
                key={item}
                className={`font-semibold leading-[1.12] tracking-[-0.02em] ${leadClass}`}
                style={{ color: bodyColor, opacity: 0.88 }}
              >
                {item}
              </li>
            ))}
          </ul>
        </AboutPlatformSplitSection>
      ) : null}
    </div>
  );
}

function AboutFeaturePanelMetaFooter({
  educationItems,
  strengthItems,
  languageItems,
  showEducation,
  showStrengths,
  showLanguages,
  metaIntroLines,
  showLanguageFlags,
  accent,
  titleColor,
  bodyColor,
  cardBorder,
  contentSize,
}: {
  educationItems: ProfileEducationEntry[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  showEducation: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  metaIntroLines: { line1: AboutFeatureIntroLine; line2: AboutFeatureIntroLine };
  showLanguageFlags: boolean;
  accent: string;
  titleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const showEducationBlock = showEducation && visibleEducation.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;

  if (!showEducationBlock && !showStrengthsBlock && !showLanguagesBlock) return null;

  const metaIntroClass = aboutFeatureMetaIntroSizeClass(contentSize);
  const labelClass = infoContentLabelSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  const sectionLabelClass = `mb-5 font-semibold uppercase tracking-[0.2em] sm:mb-6 ${labelClass}`;
  const metaFooterBlockClass = 'min-w-0 border-b pb-8 sm:pb-9 lg:pb-10';
  const metaFooterBlockStyle = { borderColor: cardBorder } satisfies CSSProperties;

  return (
    <footer className="mt-0">
      <div className="mb-12 w-full text-left sm:mb-14 lg:mb-16">
        <div className="space-y-4">
          <AboutFeatureIntroLine
            line={metaIntroLines.line1}
            titleColor={titleColor}
            bodyColor={bodyColor}
            introClass={metaIntroClass}
          />
          <AboutFeatureIntroLine
            line={metaIntroLines.line2}
            titleColor={titleColor}
            bodyColor={bodyColor}
            introClass={metaIntroClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-14 sm:gap-16 lg:grid-cols-3 lg:gap-x-10 xl:gap-x-12">
        {showEducationBlock ? (
          <section className={metaFooterBlockClass} style={metaFooterBlockStyle}>
            <p className={sectionLabelClass} style={{ color: accent }}>
              {ABOUT_VALUE_STEPS_SECTION_LABELS.education}
            </p>
            <ol className="space-y-6 sm:space-y-7">
              {visibleEducation.map((entry, index) => {
                const degree = entry.title?.trim() || '';
                const institution = entry.institution?.trim() || '';
                const year = entry.schoolYear?.trim() || '';

                const yearInline = year ? (
                  <>
                    {' '}
                    <span
                      className="whitespace-nowrap font-medium tabular-nums"
                      style={{ color: bodyColor, opacity: 0.62 }}
                    >
                      {year}
                    </span>
                  </>
                ) : null;

                return (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                    className="min-w-0"
                  >
                    {degree ? (
                      <p
                        className={`font-medium leading-snug tracking-[-0.01em] ${bodyClass}`}
                        style={{ color: titleColor }}
                      >
                        {degree}
                      </p>
                    ) : null}
                    {institution ? (
                      <p
                        className={`${degree ? 'mt-1.5' : ''} leading-relaxed ${metaClass}`}
                        style={{ color: degree ? bodyColor : titleColor, opacity: degree ? 0.72 : 1 }}
                      >
                        {institution}
                        {yearInline}
                      </p>
                    ) : year ? (
                      <p
                        className={`${degree ? 'mt-1.5' : ''} font-medium tabular-nums leading-none ${metaClass}`}
                        style={{ color: bodyColor, opacity: 0.62 }}
                      >
                        {year}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {showStrengthsBlock ? (
          <section className={metaFooterBlockClass} style={metaFooterBlockStyle}>
            <p className={sectionLabelClass} style={{ color: accent }}>
              {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
            </p>
            <ul className="space-y-4 sm:space-y-5">
              {visibleStrengths.map((item) => (
                <li
                  key={item}
                  className={`font-medium leading-snug tracking-[-0.01em] ${bodyClass}`}
                  style={{ color: titleColor }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showLanguagesBlock ? (
          <section className={metaFooterBlockClass} style={metaFooterBlockStyle}>
            <p className={sectionLabelClass} style={{ color: accent }}>
              {ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
            </p>
            <InfoLanguageList
              items={languageItems}
              accent={titleColor}
              body={bodyColor}
              track={bodyColor}
              levelStyle="stars"
              showMarker={showLanguageFlags}
              bodySizeClass={bodyClass}
              className="mt-0 gap-y-4 sm:gap-y-4"
            />
          </section>
        ) : null}
      </div>
    </footer>
  );
}

/** About · feature panel — Apollo-style skills rail + description card. */
function AboutFeaturePanelLayout({
  title,
  bio,
  subtitle,
  skillItems,
  educationItems,
  strengthItems,
  languageItems,
  showSkills,
  showEducation,
  showStrengths,
  showLanguages,
  languageLevelStyle,
  showLanguageFlags,
  introLines,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
}: {
  title: string;
  bio?: string | null;
  subtitle?: string;
  skillItems: ProfileSkillEntry[];
  educationItems: ProfileEducationEntry[];
  strengthItems: string[];
  languageItems: LanguageDisplayItem[];
  showSkills: boolean;
  showEducation: boolean;
  showStrengths: boolean;
  showLanguages: boolean;
  languageLevelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  showLanguageFlags: boolean;
  introLines: { line1: AboutFeatureIntroLine; line2: AboutFeatureIntroLine };
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const skillsSectionRef = useRef<HTMLElement>(null);
  const [interactionIndex, setInteractionIndex] = useState<number | null>(null);
  const [mobileAccordionIndex, setMobileAccordionIndex] = useState(0);
  const [desktopScrollMode, setDesktopScrollMode] = useState(false);
  const scrollFocusEnabled = visibleSkills.length > 1;
  const desktopScrollIndex = useFeaturePanelScrollProgress(
    skillsSectionRef,
    visibleSkills.length,
    scrollFocusEnabled && desktopScrollMode
  );
  const reduceMotion = useReducedMotion();
  const introClass = aboutFeatureMetaIntroSizeClass(contentSize);
  const skillTitleClass = aboutFeatureSkillTitleSizeClass(contentSize);
  const quoteClass = aboutFeatureQuoteSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const bioClass = aboutBannerBioSizeClass(contentSize);
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const scrollFocusedIndex = desktopScrollIndex;
  const activeIndex =
    interactionIndex ?? (scrollFocusEnabled && desktopScrollMode ? scrollFocusedIndex : 0);
  const safeIndex = visibleSkills.length > 0 ? Math.min(activeIndex, visibleSkills.length - 1) : 0;
  const kickerLabel = title?.trim() || 'About me';

  useEffect(() => {
    let active = true;
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      if (active) setDesktopScrollMode(mq.matches);
    };
    update();
    mq.addEventListener('change', update);
    return () => {
      active = false;
      mq.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (interactionIndex == null || !scrollFocusEnabled) return;

    let active = true;
    let frame = 0;
    const clearInteraction = () => {
      if (frame || !active) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (active) setInteractionIndex(null);
      });
    };

    const scrollRoot = getManifestoScrollParent(skillsSectionRef.current);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', clearInteraction, { passive: true });
    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', clearInteraction);
    };
  }, [interactionIndex, scrollFocusEnabled]);

  useEffect(() => {
    if (interactionIndex != null && interactionIndex >= visibleSkills.length) {
      setInteractionIndex(null);
    }
  }, [interactionIndex, visibleSkills.length]);

  useEffect(() => {
    if (mobileAccordionIndex >= visibleSkills.length) {
      setMobileAccordionIndex(Math.max(0, visibleSkills.length - 1));
    }
  }, [mobileAccordionIndex, visibleSkills.length]);

  const featurePanelCardShellClass =
    'relative ml-0 mr-auto w-full max-w-xl min-h-[20rem] overflow-hidden rounded-2xl sm:min-h-[22rem] sm:max-w-2xl lg:min-h-[26rem] lg:max-w-3xl lg:rounded-3xl xl:min-h-[30rem] xl:max-w-4xl';

  const featurePanelHeader = (
    <header className="grid gap-x-8 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-10 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-x-20 xl:gap-x-28">
      <p
        className="row-start-1 shrink-0 self-start text-[0.78rem] font-semibold uppercase tracking-[0.16em] sm:text-[0.8125rem]"
        style={{ color: accent }}
      >
        {kickerLabel}
      </p>
      <div className="row-start-1 min-w-0 space-y-4 text-left sm:col-start-2 lg:col-start-2 lg:row-span-1">
        <AboutFeatureIntroLine
          line={introLines.line1}
          titleColor={titleColor}
          bodyColor={bodyColor}
          introClass={introClass}
        />
        <AboutFeatureIntroLine
          line={introLines.line2}
          titleColor={titleColor}
          bodyColor={bodyColor}
          introClass={introClass}
        />
      </div>
    </header>
  );

  const featurePanelSkillsGrid = (
    <div className="mt-24 sm:mt-28 lg:mt-32 xl:mt-36">
      <div className="relative min-w-0 pl-5 sm:pl-6 lg:hidden">
        <div
          className="absolute bottom-0 left-0 top-0 w-px"
          style={{ backgroundColor: cardBorder }}
          aria-hidden
        />
        <ul className="space-y-8 sm:space-y-9">
          {visibleSkills.map((skill, index) => {
            const isOpen = mobileAccordionIndex === index;
            const skillTitle = skill.title?.trim() || '';
            const skillDescription = skill.description?.trim() || '';
            return (
              <li key={skill.id} className="min-w-0">
                <button
                  type="button"
                  className={`block w-full text-left font-normal transition-[opacity,color] duration-500 ease-out ${skillTitleClass} ${
                    isOpen ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{ color: titleColor }}
                  aria-expanded={isOpen}
                  onClick={() =>
                    setMobileAccordionIndex((prev) => (prev === index ? -1 : index))
                  }
                >
                  {skillTitle}
                </button>
                <AboutFeaturePanelMobileAccordionPanel
                  isOpen={isOpen}
                  reduceMotion={reduceMotion}
                  cardBg={cardBg}
                >
                  <AboutFeaturePanelQuote
                    text={
                      skillDescription ||
                      'Add a description for this skill in Creator Studio → Information.'
                    }
                    skillTitle={skillTitle}
                    quoteClass={quoteClass}
                    titleColor={titleColor}
                    bodyColor={bodyColor}
                    bodyClass={bodyClass}
                    isPlaceholder={!skillDescription}
                    hideAttribution
                  />
                </AboutFeaturePanelMobileAccordionPanel>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden gap-12 lg:grid lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-x-20 xl:gap-x-28">
        <div className="relative min-w-0 self-start pl-5 sm:pl-6">
          <div
            className="absolute bottom-0 left-0 top-0 w-px"
            style={{ backgroundColor: cardBorder }}
            aria-hidden
          />
          <ul className="space-y-10 sm:space-y-12 lg:space-y-14 xl:space-y-16">
            {visibleSkills.map((skill, index) => {
              const isActive = index === safeIndex;
              const skillTitle = skill.title?.trim() || '';
              return (
                <li key={skill.id}>
                  <button
                    type="button"
                    className={`block w-full text-left font-normal transition-opacity duration-300 ${skillTitleClass} ${
                      isActive ? 'opacity-100' : 'opacity-40 hover:opacity-65'
                    }`}
                    style={{ color: titleColor }}
                    onClick={() => setInteractionIndex(index)}
                    onMouseEnter={() => setInteractionIndex(index)}
                    aria-pressed={isActive}
                  >
                    {skillTitle}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="relative min-w-0 lg:self-stretch">
          <div className={featurePanelCardShellClass} style={{ backgroundColor: cardBg }} aria-live="polite">
            {visibleSkills.map((skill, index) => {
              const isVisible = index === safeIndex;
              const skillTitle = skill.title?.trim() || '';
              const skillDescription = skill.description?.trim() || '';
              return (
                <motion.div
                  key={skill.id}
                  className="absolute inset-0 flex items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
                  aria-hidden={!isVisible}
                  initial={false}
                  animate={{ opacity: isVisible ? 1 : 0 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                  }
                  style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
                >
                  <AboutFeaturePanelQuote
                    text={
                      skillDescription ||
                      'Add a description for this skill in Creator Studio → Information.'
                    }
                    skillTitle={skillTitle}
                    quoteClass={quoteClass}
                    titleColor={titleColor}
                    bodyColor={bodyColor}
                    bodyClass={bodyClass}
                    isPlaceholder={!skillDescription}
                  />
                </motion.div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );

  const featurePanelMetaFooter = (
    <AboutFeaturePanelMetaFooter
      educationItems={educationItems}
      strengthItems={strengthItems}
      languageItems={languageItems}
      showEducation={showEducation}
      showStrengths={showStrengths}
      showLanguages={showLanguages}
      metaIntroLines={resolveAboutFeatureMetaIntroLines()}
      showLanguageFlags={showLanguageFlags}
      accent={accent}
      titleColor={titleColor}
      bodyColor={bodyColor}
      cardBorder={cardBorder}
      contentSize={contentSize}
    />
  );

  return (
    <div className="w-full">
      {showSkillsBlock ? (
        <>
          <section ref={skillsSectionRef} className="relative">
            {featurePanelHeader}
            {scrollFocusEnabled ? (
              <div
                aria-hidden
                data-feature-panel-lead-in
                className="pointer-events-none hidden lg:block"
                style={{ height: FEATURE_PANEL_LEAD_IN_HEIGHT }}
              />
            ) : null}
            <div
              data-feature-panel-sticky
              className={
                scrollFocusEnabled
                  ? 'lg:sticky lg:z-[1] lg:-translate-y-1/2'
                  : undefined
              }
              style={
                scrollFocusEnabled
                  ? ({ top: FEATURE_PANEL_STICKY_TOP } satisfies CSSProperties)
                  : undefined
              }
            >
              {featurePanelSkillsGrid}
            </div>
            {scrollFocusEnabled ? (
              <div
                aria-hidden
                data-feature-panel-runway
                className="pointer-events-none hidden lg:block"
                style={{
                  height: featurePanelRunwayHeight(visibleSkills.length),
                }}
              />
            ) : null}
          </section>
          {featurePanelMetaFooter}
        </>
      ) : (
        <>
          {featurePanelHeader}
          {bioText ? (
            <p
              className={`mt-12 max-w-xl leading-[1.75] ${bioClass} ${bodyClass}`}
              style={{ color: bodyColor, opacity: 0.82 }}
            >
              {bioText}
            </p>
          ) : null}
          {featurePanelMetaFooter}
        </>
      )}
    </div>
  );
}

function portraitSkillsItemStyle(
  index: number,
  activeIndex: number,
  subtitleColor: string,
  bodyColor: string,
  titleColor: string
): CSSProperties {
  if (index === activeIndex) {
    return { color: subtitleColor, opacity: 1 };
  }

  const mutedTones: CSSProperties[] = [
    { color: bodyColor, opacity: 0.42 },
    { color: subtitleColor, opacity: 0.3 },
    { color: titleColor, opacity: 0.24 },
    { color: bodyColor, opacity: 0.34 },
    { color: subtitleColor, opacity: 0.38 },
  ];

  return mutedTones[index % mutedTones.length] ?? mutedTones[0]!;
}

function portraitSkillsMetaValueStyle(
  index: number,
  subtitleColor: string,
  bodyColor: string,
  titleColor: string
): CSSProperties {
  const tones: CSSProperties[] = [
    { color: subtitleColor, opacity: 0.92 },
    { color: bodyColor, opacity: 1 },
    { color: titleColor, opacity: 0.78 },
    { color: subtitleColor, opacity: 0.72 },
    { color: bodyColor, opacity: 0.82 },
  ];
  return tones[index % tones.length] ?? tones[0]!;
}

function PortraitSkillsMetaValues({
  values,
  subtitleColor,
  bodyColor,
  titleColor,
}: {
  values: string[];
  subtitleColor: string;
  bodyColor: string;
  titleColor: string;
}) {
  return (
    <>
      {values.map((value, index) => (
        <span key={`${value}-${index}`}>
          {index > 0 ? (
            <span style={{ color: bodyColor, opacity: 0.45 }}>, </span>
          ) : null}
          <span
            className="font-medium"
            style={portraitSkillsMetaValueStyle(index, subtitleColor, bodyColor, titleColor)}
          >
            {value}
          </span>
        </span>
      ))}
    </>
  );
}

/** About · portrait skills — large portrait right, XXL skill rail + bio left. */
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
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  metaLead,
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
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  metaLead: string;
  metaEnabled: boolean;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  contentSize: PortfolioInfoContentSize;
  portraitGrayscale?: boolean;
}) {
  const [activeSkillIndex, setActiveSkillIndex] = useState(0);
  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleLanguages = languageItems
    .map((item) => item.name.trim())
    .filter(Boolean);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showMetaBlock =
    metaEnabled &&
    ((showInterests && visibleInterests.length > 0) ||
      (showLanguages && visibleLanguages.length > 0));
  const skillListClass = aboutPortraitSkillsListSizeClass(contentSize);
  const bioClass = aboutPortraitSkillsBioSizeClass(contentSize);
  const strengthsTitleClass = aboutPortraitSkillsStrengthsTitleSizeClass(contentSize);
  const strengthsItemClass = aboutPortraitSkillsStrengthsItemSizeClass(contentSize);
  const metaClass = aboutPortraitSkillsMetaSizeClass(contentSize);
  const kickerClass = infoContentBodySizeClass(contentSize);
  const bioText = bio?.trim() || '';
  const kickerText = subtitle.trim() || title.trim() || 'About me';
  const leadText = metaLead.trim() || '';
  const safeActiveIndex =
    visibleSkills.length > 0 ? Math.min(activeSkillIndex, visibleSkills.length - 1) : 0;

  const avatarSrc = avatarUrl?.trim() || '';
  const portraitName = fullName?.trim() || 'Profile';
  const initials = portraitName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const portraitPanelClass =
    'relative w-full overflow-hidden lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.5rem)] lg:aspect-[4/5] lg:max-h-[min(88dvh,calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-3rem))]';

  const portraitMedia = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarSrc}
      alt={portraitName}
      className={infoPortraitImageClass('block h-full w-full object-cover object-[50%_18%]', portraitGrayscale)}
    />
  ) : (
    <div
      className="flex h-full min-h-[22rem] w-full items-center justify-center text-5xl font-semibold tracking-tight sm:min-h-[26rem] lg:min-h-0"
      style={{ backgroundColor: cardBg, color: bodyColor }}
    >
      {initials || '?'}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-10 sm:gap-12 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-x-10 xl:gap-x-16">
        <div className="order-1 flex min-w-0 flex-col justify-between lg:min-h-[min(88dvh,calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-3rem))] lg:py-2 xl:py-4">
          <div className="min-w-0">
            <p
              className={`max-w-xl leading-relaxed ${kickerClass}`}
              style={{ color: bodyColor, opacity: 0.88 }}
            >
              {kickerText}
            </p>

            {showSkillsBlock ? (
              <ul className="mt-8 space-y-2 sm:mt-10 sm:space-y-3 lg:mt-12">
                {visibleSkills.map((skill, index) => {
                  const skillTitle = skill.title?.trim() || '';
                  const isActive = index === safeActiveIndex;
                  return (
                    <li key={skill.id || `${skillTitle}-${index}`}>
                      <button
                        type="button"
                        className={`block w-full text-left font-semibold tracking-[-0.025em] transition-[color,opacity] duration-300 ease-out ${skillListClass}`}
                        style={portraitSkillsItemStyle(
                          index,
                          safeActiveIndex,
                          subtitleColor,
                          bodyColor,
                          titleColor
                        )}
                        onMouseEnter={() => setActiveSkillIndex(index)}
                        onFocus={() => setActiveSkillIndex(index)}
                        aria-pressed={isActive}
                      >
                        {skillTitle}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={`mt-8 opacity-60 ${kickerClass}`} style={{ color: bodyColor }}>
                Ajoute des skills dans Creator Studio → Information.
              </p>
            )}
          </div>

          {bioText ? (
            <p
              className={`mt-10 hidden max-w-xl lg:mt-0 lg:block ${bioClass}`}
              style={{ color: bodyColor, opacity: 0.9 }}
            >
              {bioText}
            </p>
          ) : null}
        </div>

        <div className={`order-2 ${portraitPanelClass}`}>{portraitMedia}</div>

        {bioText ? (
          <p
            className={`order-3 max-w-xl lg:hidden ${bioClass}`}
            style={{ color: bodyColor, opacity: 0.9 }}
          >
            {bioText}
          </p>
        ) : null}
      </div>

      {showStrengthsBlock ? (
        <section className="mt-20 flex w-full flex-col items-center sm:mt-24 lg:mt-28 xl:mt-32">
          <h3
            className={`text-center font-semibold tracking-[-0.02em] ${strengthsTitleClass}`}
            style={{ color: subtitleColor }}
          >
            {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
          </h3>
          <ul className="mt-8 flex w-fit max-w-2xl list-none flex-col items-start gap-3.5 text-left sm:mt-10 sm:gap-4">
            {visibleStrengths.map((item) => (
              <li
                key={item}
                className={`flex items-start gap-3 font-medium leading-[1.4] tracking-[-0.015em] ${strengthsItemClass}`}
                style={{ color: bodyColor }}
              >
                <span
                  className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: bodyColor, opacity: 0.55 }}
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showMetaBlock ? (
        <section
          className={`${
            showStrengthsBlock ? 'mt-24 sm:mt-28 lg:mt-32 xl:mt-36' : 'mt-20 sm:mt-24 lg:mt-28'
          } max-w-2xl text-left`}
        >
          <p className={metaClass}>
            {showInterests && visibleInterests.length > 0 ? (
              <PortraitSkillsMetaValues
                values={visibleInterests}
                subtitleColor={subtitleColor}
                bodyColor={bodyColor}
                titleColor={titleColor}
              />
            ) : null}
            {showInterests &&
            visibleInterests.length > 0 &&
            ((showLanguages && visibleLanguages.length > 0) || leadText) ? (
              <span style={{ color: bodyColor, opacity: 0.45 }}>. </span>
            ) : null}
            {showLanguages && visibleLanguages.length > 0 ? (
              <>
                {leadText ? (
                  <span style={{ color: bodyColor, opacity: 0.78 }}>{leadText} </span>
                ) : null}
                <PortraitSkillsMetaValues
                  values={visibleLanguages}
                  subtitleColor={subtitleColor}
                  bodyColor={bodyColor}
                  titleColor={titleColor}
                />
              </>
            ) : null}
            <span style={{ color: bodyColor, opacity: 0.45 }}>.</span>
          </p>
        </section>
      ) : null}
    </div>
  );
}

/** About · banner — strengths footer: centered vertical list below skills. */
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
    <section className="-mx-6 mt-24 px-0 pb-4 sm:-mx-10 sm:mt-28 lg:-mx-16 lg:mt-32 xl:-mx-20 xl:mt-36">
      {label?.trim() ? (
        <p
          className="mb-8 text-center text-[0.72rem] font-semibold uppercase tracking-[0.22em] sm:mb-10"
          style={{ color: bodyColor, opacity: 0.72 }}
        >
          {label.trim()}
        </p>
      ) : null}
      <ul className="mx-auto flex w-fit list-none flex-col gap-3 sm:gap-3.5">
        {visible.map((item, index) => (
          <li
            key={`${index}-${item}`}
            className="flex items-start gap-3 text-left"
          >
            <span
              className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: bodyColor, opacity: 0.45 }}
              aria-hidden
            />
            <span
              className={`font-medium leading-[1.45] tracking-[-0.02em] text-[1.25rem] sm:text-[1.35rem] lg:text-[1.5rem] ${bodyClass}`}
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

/** About · banner — skills footer: 3-col cards, title top / description bottom, neutral tones. */
function AboutBannerSkillsFooter({
  label,
  skills,
  titleColor,
  bodyColor,
  cardBorder,
  bodyClass,
}: {
  label: string;
  skills: ProfileSkillEntry[];
  titleColor: string;
  bodyColor: string;
  cardBorder: string;
  bodyClass: string;
}) {
  const visible = skills.filter((item) => item.title?.trim());
  if (visible.length === 0) return null;

  return (
    <section
      className="-mx-6 mt-14 border-t pt-10 pb-2 sm:-mx-10 sm:mt-16 sm:pt-12 lg:-mx-16 lg:pt-14 xl:-mx-20"
      style={{ borderColor: cardBorder }}
    >
      <p
        className="mb-10 text-[0.72rem] font-semibold uppercase tracking-[0.22em] sm:mb-12 lg:mb-14"
        style={{ color: bodyColor, opacity: 0.72 }}
      >
        {label}
      </p>

      <ul className="grid list-none gap-x-16 gap-y-14 sm:grid-cols-2 sm:gap-x-24 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-32 lg:gap-y-20 xl:gap-x-40 xl:gap-y-24">
        {visible.map((skill) => {
          const skillTitle = skill.title?.trim() || '';
          const skillDescription = skill.description?.trim() || '';
          return (
            <li key={skill.id} className="min-w-0">
              <p
                className={`mb-4 font-medium leading-snug tracking-[-0.01em] sm:mb-5 ${bodyClass}`}
                style={{ color: titleColor }}
              >
                {skillTitle}
              </p>
              {skillDescription ? (
                <p
                  className={`text-[0.92em] leading-[1.65] ${bodyClass}`}
                  style={{ color: bodyColor, opacity: 0.82 }}
                >
                  {skillDescription}
                </p>
              ) : null}
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

  const labelClass =
    'mb-6 text-left text-[0.72rem] font-semibold uppercase tracking-[0.22em] sm:mb-7';
  const labelStyle = { color: bodyColor, opacity: 0.72 };

  return (
    <section className="-mx-6 mt-16 px-6 sm:-mx-10 sm:mt-20 lg:-mx-16 lg:mt-24 xl:-mx-20">
      <div className="min-w-0 max-w-xl text-left">
        <p className={labelClass} style={labelStyle}>
          {educationLabel}
        </p>
        <ol className="space-y-5 text-left">
          {visibleEducation.map((entry, index) => {
            const title = entry.title?.trim() || '';
            const institution = entry.institution?.trim() || '';
            const year = entry.schoolYear?.trim() || '';
            const headline = title || institution;
            const detail = [institution && title ? institution : '', year]
              .filter(Boolean)
              .join(' · ');

            return (
              <li
                key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                className="min-w-0"
              >
                {headline ? (
                  <p
                    className={`font-medium leading-snug tracking-[-0.01em] text-[1.05rem] sm:text-[1.12rem] ${bodyClass}`}
                    style={{ color: textColor }}
                  >
                    {headline}
                  </p>
                ) : null}
                {detail ? (
                  <p
                    className={`mt-1.5 leading-relaxed ${metaClass}`}
                    style={{ color: bodyColor, opacity: 0.72 }}
                  >
                    {detail}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** About · banner — interests anchored bottom-left. */
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

  const labelClass =
    'mb-6 text-left text-[0.72rem] font-semibold uppercase tracking-[0.22em] sm:mb-7';
  const labelStyle = { color: bodyColor, opacity: 0.72 };

  return (
    <section className="-mx-6 mt-auto self-start px-6 pb-10 pt-10 sm:-mx-10 sm:pt-12 lg:-mx-16 xl:-mx-20 xl:pb-12">
      <div className="min-w-0 max-w-xl text-left">
        <p className={labelClass} style={labelStyle}>
          {interestsLabel}
        </p>
        <p
          className={`text-left leading-[1.85] tracking-[-0.01em] text-[1.05rem] sm:text-[1.12rem] ${bodyClass}`}
          style={{ color: textColor }}
        >
          {visibleInterests.map((item, index) => (
            <span key={item}>
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
      </div>
    </section>
  );
}

/** About · banner — XXL centered headline, portrait bottom-left, bio bottom-right. */
function AboutBannerLayout({
  title,
  subtitle,
  bio,
  specialty,
  headlineText,
  showHeadline,
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
  headlineColor,
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
  headlineText: string;
  showHeadline: boolean;
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
  contentSize: PortfolioInfoContentSize;
  headlineColor: string;
  skillsTitleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  portraitGrayscale: boolean;
}) {
  const headlineSource = showHeadline
    ? headlineText
    : specialty?.trim() || title.trim() || 'About';
  const headlineLines = headlineSource
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const displayHeadlineLines =
    headlineLines.length > 0 ? headlineLines : [specialty?.trim() || title.trim() || 'About'];
  const bioText = bio?.trim() || subtitle?.trim() || '';
  const headlineClass = aboutBannerHeadlineSizeClass(contentSize);
  const bioClass = aboutBannerBioSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);
  const showSkillsBlock = showSkills && skillItems.some((item) => item.title?.trim());
  const showStrengthsBlock = showStrengths && strengthItems.some((item) => item.trim());

  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const portraitName = fullName?.trim() || 'Profile';

  return (
    <div className="relative z-[1] flex w-full flex-col justify-between gap-10 px-6 sm:gap-14 sm:px-10 lg:min-h-[calc(100svh-var(--portfolio-nav-top-clearance,5.5rem)-4rem)] lg:gap-0 lg:px-16 xl:px-20">
      <div className="flex shrink-0 items-center justify-center px-2 pt-2 pb-6 sm:pb-10 lg:flex-1 lg:py-12 xl:py-16">
        <h2
          className={`max-w-[18ch] text-center font-bold uppercase leading-[0.88] tracking-[-0.04em] ${headlineClass}`}
          style={{ color: headlineColor }}
        >
          {displayHeadlineLines.map((line, index) => (
            <span key={`${index}-${line}`} className="block">
              {line}
            </span>
          ))}
        </h2>
      </div>

      <div className="mt-auto grid grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)] items-end gap-5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div
          className="aspect-[3/4] w-full overflow-hidden"
          style={{ backgroundColor: cardBg }}
        >
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
              className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight"
              style={{ color: bodyColor }}
            >
              {initials || '?'}
            </div>
          )}
        </div>

        <div className="pb-0.5 lg:max-w-md lg:justify-self-end lg:pb-1">
          {bioText ? (
            <p
              className={`leading-[1.7] ${bioClass}`}
              style={{ color: bodyColor }}
            >
              {bioText}
            </p>
          ) : (
            <p className={`opacity-60 ${bioClass}`} style={{ color: bodyColor }}>
              Add a bio in Creator Studio → Information.
            </p>
          )}
        </div>
      </div>

      {showSkillsBlock ? (
        <AboutBannerSkillsFooter
          label={skillsLabel}
          skills={skillItems}
          titleColor={skillsTitleColor}
          bodyColor={bodyColor}
          cardBorder={cardBorder}
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

      <AboutBannerEducationBlock
        educationItems={educationItems}
        showEducation={showEducation}
        educationLabel={educationLabel}
        textColor={subtitleColor}
        bodyColor={bodyColor}
        bodyClass={bodyClass}
        metaClass={metaClass}
      />

      <AboutBannerInterestsBlock
        interestItems={interestItems}
        showInterests={showInterests}
        interestsLabel={interestsLabel}
        textColor={subtitleColor}
        bodyColor={bodyColor}
        bodyClass={bodyClass}
      />
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
}: {
  label: string;
  skills: ProfileSkillEntry[];
  accent: string;
  titleColor: string;
  bodyColor: string;
  bodyClass: string;
  metaClass: string;
}) {
  const countLabel = String(skills.length).padStart(2, '0');

  return (
    <>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3
          className="font-serif text-xl font-medium tracking-[-0.005em] sm:text-[1.25rem]"
          style={{ color: titleColor }}
        >
          {label}
        </h3>
        <span
          className={`tabular-nums ${metaClass}`}
          style={{ color: bodyColor, opacity: 0.5 }}
          aria-label={`${skills.length} skills`}
        >
          {countLabel}
        </span>
      </div>
      <ul className={`space-y-3.5 sm:space-y-4 ${bodyClass}`}>
        {skills.map((skill, index) => {
          const skillTitle = skill.title?.trim();
          if (!skillTitle) return null;
          return (
            <li key={skill.id} className="flex items-baseline gap-4 sm:gap-5">
              <span
                className={`shrink-0 tabular-nums ${metaClass}`}
                style={{ color: accent, opacity: 0.72 }}
                aria-hidden
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className="font-medium leading-snug tracking-[-0.01em]"
                style={{ color: titleColor }}
              >
                {skillTitle}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** About · split — flowing strengths line (editorial Webflow: slash-separated prose). */
function AboutSplitStrengthsList({
  items,
  accent,
  titleColor,
  bodyClass,
}: {
  items: string[];
  accent: string;
  titleColor: string;
  bodyClass: string;
}) {
  return (
    <p
      className={`max-w-[38rem] text-[1.05rem] leading-[1.85] tracking-[-0.01em] sm:text-[1.12rem] ${bodyClass}`}
      style={{ color: titleColor }}
    >
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 ? (
            <span
              aria-hidden
              className="mx-2.5 select-none font-light sm:mx-3"
              style={{ color: accent, opacity: 0.72 }}
            >
              /
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

function AboutSplitLayout({
  title,
  subtitle,
  bio,
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
  languageLevelStyle,
  showLanguageFlags,
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
  contentSize: PortfolioInfoContentSize;
  portraitSide: PortfolioInfoAboutSplitPortraitSide;
  sectionLabels: AboutSplitSectionLabels;
  portraitGrayscale: boolean;
}) {
  const splitTitleClass = aboutSplitTitleSizeClass(contentSize);
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
  const ledeText = subtitle?.trim() || bio?.trim() || '';
  const kickerLabel = title?.trim() || 'About';
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
    'lg:sticky lg:self-start lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.25rem)] lg:h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-2.5rem)] lg:max-h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-2.5rem)]';

  const splitSectionClass = 'mt-12 border-t pt-9 sm:mt-14 sm:pt-10';
  const portraitOnRight = portraitSide === 'right';

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 lg:static lg:w-full lg:max-w-none lg:translate-x-0">
      <div
        className={`flex min-h-0 flex-col lg:items-start ${
          portraitOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        {/* Portrait — inset below navbar, sticky while right column scrolls */}
        <div
          className={`relative h-[calc(60vh-2rem)] w-full shrink-0 overflow-hidden mb-4 mt-4 lg:mb-0 lg:mt-0 lg:w-[46%] ${splitPortraitPanelClass}`}
          >
            {avatarUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl.trim()}
              alt={portraitName}
              className={infoPortraitImageClass(
                'block h-full w-full object-cover object-[50%_20%]',
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
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgba(15, 9, 5, 0.72) 0%, rgba(15, 9, 5, 0) 30%)',
            }}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-[2] px-7 py-10 sm:px-10 sm:py-11">
            <p
              className="font-serif text-[2.1rem] font-medium leading-[1.05] tracking-[-0.01em]"
              style={{ color: '#F6F1E9' }}
            >
              {portraitName}
            </p>
            <p
              className="mt-1.5 text-[0.95rem] font-medium"
              style={{ color: portraitPlateMuted }}
            >
              {specialtyHeadline}
            </p>
          </div>
        </div>

        {/* Content — scrolls beside sticky portrait; all blocks live here */}
        <div className="min-w-0 flex-1 px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16 lg:pb-24 xl:px-20">
          <div className="mb-9 flex items-center gap-2.5 text-[0.8rem] font-semibold tracking-[0.03em]" style={{ color: accent }}>
              <span
                aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
            {kickerLabel}
          </div>

                <h2
            className={`font-serif font-semibold leading-[0.98] tracking-[-0.015em] ${splitTitleClass}`}
                  style={{ color: titleColor }}
                >
            {specialtyHeadline}
                </h2>

          {ledeText ? (
                  <p
              className={`mt-6 max-w-[34rem] text-[1.05rem] leading-[1.6] sm:text-[1.15rem] ${bodyClass}`}
                    style={{ color: subtitleColor }}
                  >
              {ledeText}
            </p>
          ) : null}

          {showSkillsBlock ? (
            <section className={splitSectionClass} style={{ borderColor: cardBorder }}>
              <AboutSplitSkillsList
                label={sectionLabels.skills}
                skills={visibleSkills}
                accent={accent}
                titleColor={titleColor}
                bodyColor={bodyColor}
                bodyClass={bodyClass}
                metaClass={metaClass}
              />
            </section>
          ) : null}

          {showStrengthsBlock ? (
            <section className={splitSectionClass} style={{ borderColor: cardBorder }}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h3
                  className="font-serif text-xl font-medium tracking-[-0.005em] sm:text-[1.25rem]"
                  style={{ color: titleColor }}
                >
                  {sectionLabels.strengths}
                </h3>
              </div>
              <AboutSplitStrengthsList
                items={visibleStrengths}
                accent={accent}
                titleColor={titleColor}
                bodyClass={bodyClass}
              />
            </section>
          ) : null}

          {showLanguagesBlock ? (
            <section className={splitSectionClass} style={{ borderColor: cardBorder }}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h3
                  className="font-serif text-xl font-medium tracking-[-0.005em] sm:text-[1.25rem]"
                  style={{ color: titleColor }}
                >
                  {sectionLabels.languages}
                </h3>
            </div>
              <InfoLanguageList
                items={languageItems}
                accent={accent}
                body={titleColor}
                track={bodyColor}
                levelStyle={languageLevelStyle}
                showMarker={showLanguageFlags}
                bodySizeClass={bodyClass}
                className=""
              />
            </section>
          ) : null}

          {showEducationBlock ? (
            <section className={splitSectionClass} style={{ borderColor: cardBorder }}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h3
                  className="font-serif text-xl font-medium tracking-[-0.005em] sm:text-[1.25rem]"
                  style={{ color: titleColor }}
              >
                Education
                </h3>
              </div>
              <ul className={`space-y-4 ${bodyClass}`}>
                {educationItems.map((entry) => (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}`}
                    className="leading-relaxed"
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
            </section>
          ) : null}

          {showSystemsBlock ? (
            <section className={splitSectionClass} style={{ borderColor: cardBorder }}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h3
                  className="font-serif text-xl font-medium tracking-[-0.005em] sm:text-[1.25rem]"
                  style={{ color: titleColor }}
              >
                Systems & tools
                </h3>
            </div>
              <InfoBulletList
                items={toolItems}
                accent={accent}
                body={bodyColor}
                square
                bodySizeClass={bodyClass}
              />
        </section>
      ) : null}
        </div>
      </div>
    </div>
  );
}
/** Vertical rhythm between manifesto blocks — spacing only (no repeated rules). */
const MANIFESTO_BLOCK_SPACING = 'mt-14 sm:mt-16';
/** Single rule after bio / before first meta block. */
const MANIFESTO_BLOCK_DIVIDER = 'mt-14 border-t pt-8 sm:mt-16';

function manifestoBlockCellClass(
  index: number,
  layout: PortfolioInfoAboutManifestoBlocksLayout
): string {
  if (layout !== 'zigzag') return 'min-w-0';
  const side =
    index % 2 === 0
      ? 'lg:justify-self-start lg:mr-auto'
      : 'lg:justify-self-end lg:ml-auto';
  return `min-w-0 w-full lg:max-w-[min(100%,42rem)] ${side}`;
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

const FEATURE_PANEL_STICKY_TOP =
  'calc((100dvh + var(--portfolio-nav-top-clearance, 5.5rem)) / 2)';

const FEATURE_PANEL_LEAD_IN_HEIGHT =
  'calc((100dvh - var(--portfolio-nav-top-clearance, 5.5rem)) / 2 - 6rem)';

/** Scroll runway per skill step — slightly shorter than the original 50dvh to tighten the footer gap. */
const FEATURE_PANEL_RUNWAY_STEP_VH = 42;

function featurePanelRunwayHeight(skillCount: number): string {
  if (skillCount <= 1) return '0px';
  return `calc(${(skillCount - 1) * FEATURE_PANEL_RUNWAY_STEP_VH}dvh)`;
}

function useFeaturePanelScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  skillCount: number,
  enabled: boolean
) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    let active = true;

    if (!enabled || skillCount <= 1) {
      setFocusedIndex((prev) => (prev === 0 ? prev : 0));
      return () => {
        active = false;
      };
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return () => {
        active = false;
      };
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!active) return;

      const section = sectionRef.current;
      if (!section) return;

      const scrollRoot = getManifestoScrollParent(section);
      const viewportHeight =
        scrollRoot instanceof HTMLElement ? scrollRoot.clientHeight : window.innerHeight;
      const rootTop = scrollRoot instanceof HTMLElement ? scrollRoot.getBoundingClientRect().top : 0;
      const navClearanceRaw = getComputedStyle(document.documentElement).getPropertyValue(
        '--portfolio-nav-top-clearance'
      );
      const navClearance = Number.parseFloat(navClearanceRaw) || 88;
      const stickyCenterY = rootTop + (viewportHeight + navClearance) / 2;
      const rect = section.getBoundingClientRect();
      const runwayEl = section.querySelector('[data-feature-panel-runway]');
      const runwayHeight = runwayEl instanceof HTMLElement ? runwayEl.offsetHeight : 0;

      if (rect.bottom <= stickyCenterY + 48) {
        setFocusedIndex((prev) => (prev === skillCount - 1 ? prev : skillCount - 1));
        return;
      }

      if (!runwayEl || runwayHeight <= 0) return;

      const runwayRect = runwayEl.getBoundingClientRect();
      const traveled = Math.min(Math.max(stickyCenterY - runwayRect.top, 0), runwayHeight);
      const progress = traveled / runwayHeight;
      const nextIndex = Math.min(
        skillCount - 1,
        Math.max(0, Math.round(progress * (skillCount - 1)))
      );

      setFocusedIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };

    const onScroll = () => {
      if (frame || !active) return;
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    const scrollRoot = getManifestoScrollParent(sectionRef.current);
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled, sectionRef, skillCount]);

  return focusedIndex;
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
    : 'opacity-[0.52] blur-[2px] saturate-[0.85]';
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
  contentSize: PortfolioInfoContentSize;
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
      <ol className={includeLabel ? 'mt-5' : 'mt-0'}>
        {visible.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';
          const headline = title || institution;
          const subline = title && institution ? institution : '';

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:gap-x-10"
            >
              <span
                className={`tabular-nums tracking-tight opacity-80 sm:pt-0.5 ${metaClass}`}
                style={{ color: bodyColor }}
              >
                {year || '—'}
              </span>
              <div className="min-w-0">
                {headline ? (
                  <p
                    className={`font-medium leading-snug ${titleClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {headline}
                  </p>
                ) : null}
                {subline ? (
                  <p
                    className={`mt-1 leading-relaxed opacity-75 ${bodyClass}`}
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
  contentSize = 'md',
}: {
  children: string;
  accent?: string;
  color?: string;
  contentSize?: PortfolioInfoContentSize;
}) {
  const labelClass = infoContentLabelSizeClass(contentSize);
  return (
    <p
      className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
      style={{ color: color ?? accent }}
    >
      {children}
    </p>
  );
}

function ManifestoEditorialList({
  items,
  bodyColor,
  bodySizeClass,
}: {
  items: string[];
  bodyColor: string;
  bodySizeClass: string;
}) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((item) => (
        <li
          key={item}
          className={`leading-relaxed ${bodySizeClass}`}
          style={{ color: bodyColor }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Skills + Strengths side by side — default manifesto pairing. */
function ManifestoSkillsStrengthsRow({
  skillLabels,
  strengthItems,
  showSkills,
  showStrengths,
  accent,
  labelColor,
  bodyColor,
  contentSize,
}: {
  skillLabels: string[];
  strengthItems: string[];
  showSkills: boolean;
  showStrengths: boolean;
  accent: string;
  labelColor?: string;
  bodyColor: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  if (!showSkillsCol && !showStrengthsCol) return null;

  const bodySizeClass = infoContentBodySizeClass(contentSize);
  const paired = showSkillsCol && showStrengthsCol;

  return (
    <div
      className={`grid gap-10 ${paired ? 'md:grid-cols-2 md:gap-x-10 lg:gap-x-16' : 'grid-cols-1'}`}
    >
      {showSkillsCol ? (
        <div className="min-w-0">
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            Skills
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={skillLabels}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
        </div>
      ) : null}
      {showStrengthsCol ? (
        <div className="min-w-0">
          <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
            Strengths
          </ManifestoSectionLabel>
          <ManifestoEditorialList
            items={strengthItems}
            bodyColor={bodyColor}
            bodySizeClass={bodySizeClass}
          />
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
      className={`${
        blocksLayout === 'zigzag' ? manifestoBlockCellClass(index, blocksLayout) : 'min-w-0'
      } ${scrollFocusActive ? MANIFESTO_BLOCK_FOCUS_TRANSITION : ''} ${manifestoBlockFocusClass(
        focusedIndex === index,
        scrollFocusActive
      )}`}
    >
      {block.node}
    </div>
  );

  if (blocksLayout === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-x-16 lg:gap-y-14 xl:gap-x-24 xl:gap-y-16">
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
  contentSize: PortfolioInfoContentSize;
  blocksLayout?: PortfolioInfoAboutManifestoBlocksLayout;
  blocksScrollFocus?: boolean;
  sectionTopClass?: string;
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
    <section className={sectionTopClass}>
      <ManifestoDetailsBlocks
        blocks={blocks}
        blocksLayout={blocksLayout}
        blocksScrollFocus={blocksScrollFocus}
      />
    </section>
  );
}

const MANIFESTO_PORTRAIT_SIZE_CLASS = 'size-72 lg:size-80 xl:size-96';
const MANIFESTO_PORTRAIT_RECT_CLASS = 'w-72 lg:w-80 xl:w-96';

function ManifestoPortraitFrame({
  frame,
  avatarSrc,
  initials,
  fullName,
  avatarGrayscale,
  accent,
  cardBg,
  bodyColor,
}: {
  frame: PortfolioInfoAboutManifestoPortraitFrame;
  avatarSrc: string;
  initials: string;
  fullName?: string | null;
  avatarGrayscale: boolean;
  accent: string;
  cardBg: string;
  bodyColor: string;
}) {
  const imageClass = `h-full w-full object-cover object-center ${avatarGrayscale ? 'grayscale' : ''}`;

  const media = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarSrc} alt={fullName?.trim() || 'Profile'} className={imageClass} />
  ) : (
    <div
      className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight sm:text-4xl"
      style={{ color: bodyColor, backgroundColor: `${accent}22` }}
    >
      {initials}
        </div>
  );

  if (frame === 'instagram') {
    const ringColor = `color-mix(in srgb, ${accent} 72%, transparent)`;
    return (
      <div
        className="shrink-0 rounded-full p-[3px] shadow-[0_8px_28px_-8px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: ringColor }}
      >
        <div className="rounded-full p-[3px]" style={{ backgroundColor: cardBg }}>
          <div
            className={`aspect-square ${MANIFESTO_PORTRAIT_SIZE_CLASS} shrink-0 overflow-hidden rounded-full`}
          >
            {media}
            </div>
            </div>
        </div>
    );
  }

  const shapeClass =
    frame === 'circle'
      ? `aspect-square ${MANIFESTO_PORTRAIT_SIZE_CLASS} shrink-0 overflow-hidden rounded-full`
      : frame === 'square'
        ? `aspect-square ${MANIFESTO_PORTRAIT_SIZE_CLASS} shrink-0 overflow-hidden`
        : `aspect-[4/5] ${MANIFESTO_PORTRAIT_RECT_CLASS} shrink-0 overflow-hidden rounded-2xl`;

  return <div className={shapeClass}>{media}</div>;
}

function AboutManifestoLayout({
  title,
  subtitle,
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
  portraitFrame = 'circle',
  blocksLayout = 'grid',
  blocksScrollFocus = false,
  contentSize,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
}: {
  title: string;
  subtitle: string;
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
  contentSize: PortfolioInfoContentSize;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
}) {
  const bioParagraphs = (bio?.trim() || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const subtitleTrimmed = subtitle.trim();
  const statement = subtitleTrimmed;
  const supportingParagraphs = bioParagraphs;

  const statementIsLong = statement.length > 72;
  const showLangRail = showLanguages && languageItems.length > 0;
  const skillLabels = skillEntryLabels(skillItems);
  const showSkillsCol = showSkills && skillLabels.length > 0;
  const showStrengthsCol = showStrengths && strengthItems.length > 0;
  const showSkillsStrengthsRow = showSkillsCol || showStrengthsCol;
  const sectionLabelClass = infoContentLabelSizeClass(contentSize);
  const secondaryBodyClass = manifestoStatementSecondarySizeClass(contentSize);
  const langBodyClass = infoContentBodySizeClass(contentSize);

  const avatarSrc = avatarUrl?.trim() || '';
  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const showAvatarColumn = Boolean(avatarSrc || initials);

  return (
    <div className="relative w-full">
      <div
        className={
          showAvatarColumn
            ? 'flex flex-col gap-10 sm:gap-12 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-12 xl:gap-16'
            : 'flex flex-col gap-10 sm:gap-12'
        }
      >
        <header className="flex min-w-0 flex-col justify-center">
          <p
            className={`font-semibold uppercase tracking-[0.2em] ${sectionLabelClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </p>

        {statement ? (
          <>
            <h2
              className={`mt-6 font-semibold tracking-tight ${
                statementIsLong
                  ? 'max-w-4xl text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.12]'
                  : 'max-w-[28ch] text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05]'
              }`}
              style={{ color: subtitleColor }}
            >
              {statement}
            </h2>
            <div
              className="mt-7 h-px w-16 sm:mt-8 sm:w-20"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
          </>
        ) : null}

        {supportingParagraphs.length > 0 ? (
          <div
              className={`mt-8 max-w-2xl space-y-4 leading-relaxed ${secondaryBodyClass}`}
            style={{ color: bodyColor }}
          >
            {supportingParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {!statement && supportingParagraphs.length === 0 ? (
            <p className={`mt-8 opacity-60 ${secondaryBodyClass}`} style={{ color: bodyColor }}>
              Ajoute un sous-titre dans Creator Studio → Information.
          </p>
        ) : null}
      </header>

        {showAvatarColumn ? (
          <div className="hidden min-h-[min(22rem,44vw)] lg:flex lg:items-center lg:justify-center lg:py-6">
            <ManifestoPortraitFrame
              frame={portraitFrame}
              avatarSrc={avatarSrc}
              initials={initials}
              fullName={fullName}
              avatarGrayscale={avatarGrayscale}
              accent={accent}
              cardBg={cardBg}
              bodyColor={bodyColor}
            />
          </div>
        ) : null}
      </div>

          {showLangRail ? (
        <div className={MANIFESTO_BLOCK_DIVIDER} style={{ borderColor: cardBorder }}>
          <ManifestoSectionLabel color={subtitleColor} contentSize={contentSize}>
            Languages
          </ManifestoSectionLabel>
          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              {languageItems.map((item) => {
                const flagIso = resolveSpokenLanguageFlagIso2(item.name);
                return (
                  <li
                    key={item.name}
                  className={`flex items-center gap-3 ${langBodyClass}`}
                    style={{ color: bodyColor }}
                  >
                    {flagIso ? (
                      <CountryFlag iso2={flagIso} size="sm" />
                    ) : (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                    )}
                    <span className="whitespace-nowrap">{item.name}</span>
                  </li>
                );
              })}
            </ul>
        </div>
          ) : null}

      {showSkillsStrengthsRow ? (
        <div
          className={showLangRail ? MANIFESTO_BLOCK_SPACING : MANIFESTO_BLOCK_DIVIDER}
          style={{ borderColor: cardBorder }}
        >
          <ManifestoSkillsStrengthsRow
            skillLabels={skillLabels}
            strengthItems={strengthItems}
            showSkills={showSkillsCol}
            showStrengths={showStrengthsCol}
                accent={accent}
            labelColor={subtitleColor}
                bodyColor={bodyColor}
            contentSize={contentSize}
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
        sectionTopClass={
          showLangRail || showSkillsStrengthsRow
            ? MANIFESTO_BLOCK_SPACING
            : MANIFESTO_BLOCK_DIVIDER
        }
      />
    </div>
  );
}

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
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-24 sm:space-y-28 lg:space-y-36 xl:space-y-40">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex ${rowGap} items-start`}
          style={{ color: bodyColor }}
        >
          <AboutValueListMarker style={listMarkerStyle} accent={accent} />
          <div className="min-w-0 max-w-xl">
            <span className={`font-semibold tracking-tight ${itemTitleClass}`}>{item.title}</span>
            {item.description.trim() ? (
              <p
                className={`mt-4 leading-relaxed opacity-80 lg:mt-5 ${itemDescriptionClass}`}
                style={{ color: bodyColor }}
              >
                {item.description}
              </p>
            ) : null}
          </div>
        </li>
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
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-8 sm:space-y-10">
      {items.map((entry) => {
        const title = entry.title?.trim() ?? '';
        const institution = entry.institution?.trim() ?? '';
        const schoolYear = entry.schoolYear?.trim() ?? '';
        const meta = [institution, schoolYear].filter(Boolean).join(' · ');
        const key = entry.id || `${title}-${institution}-${schoolYear}`;

        return (
          <li
            key={key}
            className={`flex ${rowGap} items-start`}
            style={{ color: bodyColor }}
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
          </li>
        );
      })}
    </ul>
  );
}

function AboutValueLanguageList({
  items,
  accent,
  bodyColor,
  trackColor,
  levelStyle,
  showFlags,
  listMarkerStyle,
  bodySizeClass,
}: {
  items: LanguageDisplayItem[];
  accent: string;
  bodyColor: string;
  trackColor: string;
  levelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  showFlags: boolean;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  bodySizeClass: string;
}) {
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="inline-grid w-full max-w-full grid-cols-[max-content_auto] items-center gap-x-3 gap-y-3 sm:gap-x-4">
      {items.map((item) => {
        const flagIso = resolveSpokenLanguageFlagIso2(item.name);
        return (
          <li key={item.name} className="contents">
            <span
              className={`flex min-w-0 items-center ${rowGap} leading-relaxed ${bodySizeClass}`}
              style={{ color: bodyColor }}
            >
              {showFlags && flagIso ? (
                <CountryFlag iso2={flagIso} size="sm" className="shrink-0" />
              ) : (
                <AboutValueListMarker style={listMarkerStyle} accent={accent} />
              )}
              <span>{item.name}</span>
            </span>
            <span className="justify-self-start">
              <InfoLanguageLevelIndicator
                name={item.name}
                level={item.level}
                style={levelStyle}
                accent={accent}
                track={trackColor}
              />
            </span>
          </li>
        );
      })}
    </ul>
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
  if (items.length === 0) return null;
  const rowGap = listMarkerStyle === 'none' ? 'gap-0' : 'gap-4';
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item}
          className={`flex ${rowGap} items-start`}
          style={{ color: bodyColor }}
        >
          <AboutValueListMarker style={listMarkerStyle} accent={accent} />
          <span className={`leading-relaxed ${itemTitleClass}`}>{item}</span>
        </li>
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
  if (wide) {
    return (
      <div className={`w-full ${className}`}>
        <h2
          className={`w-full font-semibold leading-[0.95] tracking-tight ${titleSizeClass}`}
          style={{ color: titleColor }}
        >
          {children}
        </h2>
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <h2
        className={`max-w-[14ch] font-semibold leading-[0.95] tracking-tight ${titleSizeClass}`}
        style={{ color: titleColor }}
      >
        {children}
      </h2>
      <div
        className="mt-4 h-px w-12 sm:mt-5 sm:w-14"
            style={{ backgroundColor: accent }}
        aria-hidden
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
  contentSize: PortfolioInfoContentSize;
  emptyMessage?: string;
}) {
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
        <h2
          className={`font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </h2>
        <p className={`mt-8 opacity-60 sm:mt-10 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10 xl:gap-x-16">
      <div className="min-w-0 lg:col-span-4 lg:pt-1">
        <h2
          className={`font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </h2>
      </div>

      <div className="mt-12 min-w-0 lg:col-span-8 lg:mt-0">
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-16 lg:gap-x-16 lg:gap-y-20">
          {visible.map((skill, index) => (
            <article key={skill.id} className="min-w-0">
              <p
                className={`font-semibold tabular-nums tracking-tight ${numberClass}`}
                style={{ color: titleColor }}
              >
                {formatValueStepNumber(index)}
              </p>
              {skill.title?.trim() ? (
                <h3
                  className={`mt-3 font-semibold tracking-tight sm:mt-4 ${itemTitleClass}`}
                  style={{ color: subtitleColor }}
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
            </article>
          ))}
        </div>
      </div>
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
  contentSize: PortfolioInfoContentSize;
  emptyMessage?: string;
}) {
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
        <h2
          className={`max-w-[16ch] font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
          style={{ color: titleColor }}
        >
          {title}
        </h2>
        <p className={`mt-8 opacity-60 sm:mt-10 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2
        className={`max-w-[16ch] font-semibold leading-[0.95] tracking-tight ${blockTitleClass}`}
        style={{ color: titleColor }}
      >
        {title}
      </h2>

      <ul className="mt-10 w-full sm:mt-12">
        {visible.map((skill, index) => (
          <li
            key={skill.id}
            className="border-t py-10 first:border-t sm:py-12 lg:py-14"
            style={{ borderColor: cardBorder }}
          >
            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-12 sm:gap-x-8 lg:gap-x-12">
              <span
                className={`tabular-nums tracking-tight opacity-70 sm:col-span-1 ${indexClass}`}
                style={{ color: bodyColor }}
              >
                {formatValueIndexNumber(index)}
              </span>
              {skill.title?.trim() ? (
                <h3
                  className={`font-semibold tracking-tight sm:col-span-3 ${itemTitleClass}`}
                  style={{ color: subtitleColor }}
                >
                  {skill.title}
                </h3>
              ) : (
                <span className="hidden sm:col-span-3 sm:block" aria-hidden />
              )}
              {skill.description.trim() ? (
                <p
                  className={`leading-relaxed opacity-80 sm:col-span-8 ${itemDescriptionClass}`}
                  style={{ color: bodyColor }}
                >
                  {skill.description}
                </p>
              ) : null}
            </div>
        </li>
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
  languageLevelStyle,
  showLanguageFlags = true,
  listMarkerStyle = 'dot',
  showList,
  emptyListMessage,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  trackColor,
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
  contentSize: PortfolioInfoContentSize;
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
        trackColor={trackColor ?? bodyColor}
        levelStyle={languageLevelStyle ?? 'stars'}
        showFlags={showLanguageFlags}
        listMarkerStyle={listMarkerStyle}
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
      <div className="flex min-w-0 flex-col">
        {titleBlock}
        {listBlock}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 xl:gap-x-16">
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

function ValueStepsMetaBlock({
  label,
  accent,
  contentSize,
  children,
}: {
  label: string;
  accent: string;
  contentSize: PortfolioInfoContentSize;
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
function ValueStepsEducationList({
  items,
  accent,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
}: {
  items: ProfileEducationEntry[];
  accent: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const visible = items.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );
  if (visible.length === 0) return null;

  const yearClass = infoContentEducationMetaSizeClass(contentSize);
  const titleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const metaClass = aboutValueStepsDescriptionSizeClass(contentSize);

  return (
    <div className="w-full">
      <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
        {ABOUT_VALUE_STEPS_SECTION_LABELS.education}
      </ManifestoSectionLabel>
      <ol className="mt-8 w-full sm:mt-10">
        {visible.map((entry, index) => {
          const year = entry.schoolYear?.trim() || '';
          const title = entry.title?.trim() || '';
          const institution = entry.institution?.trim() || '';

          return (
            <li
              key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
              className="grid w-full grid-cols-1 items-baseline gap-x-8 gap-y-2 border-t py-8 first:border-t-0 first:pt-0 sm:grid-cols-12 sm:gap-x-10 lg:gap-x-16"
              style={{ borderColor: cardBorder }}
            >
              <span
                className={`tabular-nums tracking-tight sm:col-span-2 lg:col-span-2 ${yearClass}`}
                style={{ color: accent }}
              >
                {year || '—'}
              </span>
              <p
                className={`min-w-0 font-semibold tracking-tight sm:col-span-5 lg:col-span-6 ${titleClass}`}
                style={{ color: subtitleColor }}
              >
                {title || institution || '—'}
              </p>
              {title && institution ? (
                <p
                  className={`min-w-0 sm:col-span-5 sm:text-right lg:col-span-4 ${metaClass}`}
                  style={{ color: bodyColor, opacity: 0.75 }}
                >
                  {institution}
                </p>
              ) : null}
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
  contentSize: PortfolioInfoContentSize;
}) {
  const sectionTitleClass = infoContentBodySizeClass(contentSize);
  const stepTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const descriptionSizeClass = aboutValueStepsDescriptionSizeClass(contentSize);

  return (
    <>
      <h2
        className={`mb-10 font-semibold uppercase tracking-[0.2em] sm:mb-12 lg:hidden ${sectionTitleClass}`}
        style={{ color: titleColor }}
      >
        ({title})
      </h2>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
        <div className="lg:col-span-8">
          {visibleSkills.map((skill, index) => (
            <div
              key={skill.id}
              className={`grid grid-cols-1 items-start gap-x-10 gap-y-4 lg:grid-cols-8 ${
                index > 0 ? 'mt-24 sm:mt-28 lg:mt-36 xl:mt-40' : ''
              }`}
            >
              <div className="flex items-baseline gap-4 lg:col-span-2 lg:pt-1.5">
                <ValueStepsIndicator index={index} accent={accent} />
                <h3
                  className={`min-w-0 flex-1 font-semibold tracking-tight lg:hidden ${stepTitleClass}`}
                  style={{ color: subtitleColor }}
                >
                  {skill.title}
                </h3>
    </div>

              <div className="min-w-0 max-w-xl lg:col-span-6">
                <h3
                  className={`hidden font-semibold tracking-tight lg:block ${stepTitleClass}`}
                  style={{ color: subtitleColor }}
                >
                  {skill.title}
                </h3>
                {skill.description.trim() ? (
                  <p
                    className={`mt-4 leading-relaxed opacity-80 lg:mt-5 ${descriptionSizeClass}`}
                    style={{ color: bodyColor }}
                  >
                    {skill.description}
                  </p>
                ) : null}
              </div>

              {skill.description.trim() ? (
                <p
                  className={`max-w-xl leading-relaxed opacity-80 lg:hidden ${descriptionSizeClass}`}
                  style={{ color: bodyColor }}
                >
                  {skill.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <h2
            className={`sticky top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+0.5rem)] z-20 text-right font-semibold uppercase tracking-[0.2em] ${sectionTitleClass}`}
            style={{ color: titleColor }}
          >
            ({title})
          </h2>
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
  showLanguageFlags,
  languageLevelStyle,
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
  contentSize: PortfolioInfoContentSize;
  valuesLayout: PortfolioInfoAboutValueValuesLayout;
  listMarkerStyle: PortfolioInfoAboutValueListMarkerStyle;
  portraitGrayscale: boolean;
}) {
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

  return (
    <div className="w-full">
      {showIntro ? (
        <div className="max-w-3xl space-y-6 sm:max-w-4xl sm:space-y-7 lg:max-w-5xl">
          {introParagraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 48)}
              className={`leading-relaxed ${stepTitleClass}`}
              style={{ color: subtitleColor }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {showIntro && showValuesContent ? (
        <div
          className="my-14 h-px w-full sm:my-16 lg:my-20"
          style={{ backgroundColor: cardBorder }}
          aria-hidden
        />
      ) : null}

      {showValuesContent ? (
        <>
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
        </>
      ) : !showIntro && showSkills ? (
        <p className={`opacity-60 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          Ajoute des skills dans Creator Studio → Information.
        </p>
      ) : null}

      {showFooter ? (
        <div className="mt-32 sm:mt-40 lg:mt-48 xl:mt-56">
          <div
            className="mb-14 h-px w-full sm:mb-16 lg:mb-20"
            style={{ backgroundColor: cardBorder }}
            aria-hidden
          />
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
            {showStrengthsBlock ? (
              <div className="min-w-0 lg:col-span-6">
                <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
                  {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
                </ManifestoSectionLabel>
                <ManifestoEditorialList
                  items={visibleStrengths}
                  bodyColor={subtitleColor}
                  bodySizeClass={stepTitleClass}
                />
              </div>
            ) : null}

            {showPortrait ? (
              <div
                className={`flex justify-center lg:col-span-6 ${
                  showStrengthsBlock ? 'lg:justify-end' : 'lg:col-start-7 lg:justify-end'
                }`}
              >
                <ValueStepsSquarePortrait
                  avatarSrc={avatarSrc}
                  initials={initials}
                  fullName={fullName}
                  accent={accent}
                  bodyColor={bodyColor}
                  portraitGrayscale={portraitGrayscale}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showMetaSection ? (
        <div className="mt-32 sm:mt-40 lg:mt-48 xl:mt-56">
          <ValueStepsSectionRule cardBorder={cardBorder} className="mb-14 sm:mb-16 lg:mb-20" />
          {showEducationBlock ? (
            <div className={showMeta || showLanguagesBlock ? 'mb-32 sm:mb-40 lg:mb-48 xl:mb-56' : ''}>
              <ValueStepsEducationList
                items={educationItems}
                accent={accent}
                subtitleColor={subtitleColor}
                bodyColor={bodyColor}
                cardBorder={cardBorder}
                contentSize={contentSize}
              />
            </div>
          ) : null}
          {showMeta ? (
            <div className={showLanguagesBlock ? 'mb-32 sm:mb-40 lg:mb-48 xl:mb-56' : ''}>
              <ValueStepsMetaGrid blocks={metaBlocks} />
            </div>
          ) : null}
          {showLanguagesBlock ? (
            <ValueStepsMetaBlock
              label={ABOUT_VALUE_STEPS_SECTION_LABELS.languages}
              accent={accent}
              contentSize={contentSize}
            >
              <InfoLanguageList
                items={languageItems}
                accent={accent}
                body={bodyColor}
                track={bodyColor}
                levelStyle={languageLevelStyle}
                showMarker={showLanguageFlags}
                bodySizeClass={descriptionSizeClass}
              />
            </ValueStepsMetaBlock>
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
 * - about-split: sticky portrait split — specialty headline, bio lede, numbered skills, strength tags, language levels
 * - about-banner: XXL centered headline — portrait bottom-left, bio bottom-right
 * - about-feature-panel: kicker + two-tone intro — skills rail + description card, bio below titles
 * - about-platform: Jasper-style — kicker + headline left, bio right ; skills card grid (4 per row)
 * - about-portrait-skills: large portrait right — small lede + XXL skill titles left, bio bottom-left
 * - about-manifesto: huge statement + accent rule + languages rail + education index + capability blocks
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
  const contentSize = resolveInfoContentSize(presentation);
  const infoDesign = resolveInfoDesign(presentation.design);
  const portraitGrayscale = resolveInfoPortraitGrayscale(presentation);

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
        staggerLayout={resolveInfoAboutPlatformStaggerLayout(presentation)}
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

  if (infoDesign === 'about-feature-panel') {
    return (
      <AboutFeaturePanelLayout
        title={title}
        bio={bio}
        subtitle={subtitle}
        skillItems={skillItems}
        educationItems={educationItems}
        strengthItems={strengthItems}
        languageItems={languageItems}
        showSkills={showSkills}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showStrengths={showStrengths && strengthItems.length > 0}
        showLanguages={showLanguages && languageItems.length > 0}
        languageLevelStyle={languageLevelStyle}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        introLines={resolveAboutFeatureIntroLines(presentation)}
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
        contentSize={contentSize}
      />
    );
  }

  if (infoDesign === 'about-banner') {
    const headlineText = resolveAboutBannerHeadlineText(presentation);
    const showHeadline = presentation.aboutBannerHeadlineEnabled !== false;
    const bannerHeadlineColor =
      presentation.useHeroPalette === false ? titleColor : subtitleColor;
    const bannerSectionLabels = resolveAboutBannerSectionLabels(presentation);

    return (
      <AboutBannerLayout
        title={title}
        subtitle={subtitle}
        bio={bio}
        specialty={specialty}
        headlineText={headlineText}
        showHeadline={showHeadline}
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
        headlineColor={bannerHeadlineColor}
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
        showSkills={showSkills}
        showStrengths={showStrengths && strengthItems.length > 0}
        showInterests={interestItems.length > 0}
        showLanguages={languageItems.length > 0}
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

  if (presentation.design === 'about-manifesto') {
    return (
      <AboutManifestoLayout
        title={title}
        subtitle={subtitle}
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
      />
    );
  }

  if (presentation.design === 'about-terminal') {
    return (
      <AboutTerminalLayout
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
        colorMode={presentation.activeColorMode ?? 'dark'}
        accent={accent}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        bodyColor={bodyColor}
        cardBg={cardBg}
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
