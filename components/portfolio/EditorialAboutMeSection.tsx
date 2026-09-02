'use client';

import { Fragment, useCallback, useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import type {
  LanguageProficiencyLevel,
  ProfileEducationEntry,
  ProfileSpokenLanguage,
} from '@/types/ecosystem';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import {
  aboutMeTraitHeadlineSizeClass,
  aboutMeTraitSectionTitleSizeClass,
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
  resolveAboutValueBioText,
  resolveAboutValueStepsIntroParagraphs,
  resolveAboutMeTraitHeadlineText,
  resolveInfoContentSize,
  resolveInfoAboutValueBlocksLayout,
  resolveInfoAboutValueValuesLayout,
  resolveInfoAboutValueListMarkerStyle,
  resolveInfoAboutManifestoBlocksLayout,
  resolveInfoAboutManifestoBlocksScrollFocus,
  resolveInfoAboutManifestoPortraitFrame,
  resolveInfoEducationDisplayStyle,
  resolveInfoEducationCascadeScrollShift,
  resolveInfoLanguageLevelDisplayStyle,
  resolveInfoShowEducation,
  resolveInfoShowInterests,
  resolveInfoShowLanguages,
  resolveInfoShowStrengths,
  resolveInfoShowSystemsTools,
  type PortfolioInfoContentSize,
  type PortfolioInfoAboutValueBlocksLayout,
  type PortfolioInfoAboutValueValuesLayout,
  type PortfolioInfoAboutManifestoBlocksLayout,
  type PortfolioInfoAboutManifestoPortraitFrame,
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
}: {
  items: LanguageDisplayItem[];
  accent: string;
  body: string;
  track: string;
  levelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  square?: boolean;
  showMarker?: boolean;
  bodySizeClass?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-5 inline-grid grid-cols-[max-content_auto] items-center gap-x-3 gap-y-3 sm:gap-x-4">
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
                className="h-full w-full object-cover"
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

const ABOUT_SPLIT_SKILL_CAP = 6;
function AboutSplitLayout({
  title,
  subtitle,
  bio,
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
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const splitTitleClass = aboutSplitTitleSizeClass(contentSize);
  const labelClass = infoContentLabelSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const metaClass = infoContentEducationMetaSizeClass(contentSize);

  const initials = (fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const bioParagraphs = (bio?.trim() || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const visibleSkills = skillItems.slice(0, ABOUT_SPLIT_SKILL_CAP);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showStrengthsBlock = showStrengths && strengthItems.length > 0;
  const showEducationBlock = showEducation && educationItems.length > 0;
  const showSystemsBlock = showSystemsTools && toolItems.length > 0;
  const showSecondary = showEducationBlock || showSystemsBlock;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start lg:gap-16 xl:gap-20">
        {/* Portrait — first on mobile, left ~40% on desktop */}
        <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <div
            className="aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]"
            style={{ backgroundColor: cardBg }}
          >
            {avatarUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl.trim()}
                alt={fullName?.trim() || 'Profile'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-4xl font-semibold tracking-tight"
                style={{ color: bodyColor }}
              >
                {initials || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Copy stack */}
        <div className="min-w-0 flex flex-col gap-8 sm:gap-10">
          <header className="min-w-0">
            <div className="flex items-stretch gap-4 sm:gap-5">
              <span
                aria-hidden
                className="mt-1 w-[3px] shrink-0 self-stretch sm:w-1"
                style={{ backgroundColor: accent }}
              />
              <div className="min-w-0">
                <h2
                  className={`font-bold uppercase leading-[1.05] tracking-[-0.02em] ${splitTitleClass}`}
                  style={{ color: titleColor }}
                >
                  {title}
                </h2>
                {subtitle?.trim() ? (
                  <p
                    className={`mt-4 max-w-md leading-relaxed ${bodyClass}`}
                    style={{ color: subtitleColor }}
                  >
                    {subtitle.trim()}
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          {bioParagraphs.length > 0 ? (
            <div
              className={`max-w-xl space-y-4 leading-[1.7] ${bodyClass}`}
              style={{ color: bodyColor }}
            >
              {bioParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {showSkillsBlock ? (
            <div>
              <p
                className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
                style={{ color: accent }}
              >
                Skills
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
                {visibleSkills.map((skill) => (
                  <li
                    key={skill.id}
                    className={`border px-3 py-1.5 tracking-wide ${bodyClass}`}
                    style={{
                      color: bodyColor,
                      borderColor: cardBorder,
                      backgroundColor: 'transparent',
                    }}
                  >
                    {skill.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showStrengthsBlock ? (
            <div>
              <p
                className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
                style={{ color: accent }}
              >
                Strengths
              </p>
              <div className="mt-4">
                <InfoBulletList
                  items={strengthItems}
                  accent={accent}
                  body={bodyColor}
                  square
                  bodySizeClass={bodyClass}
                />
              </div>
            </div>
          ) : null}

          {showLanguagesBlock ? (
            <div>
              <p
                className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
                style={{ color: accent }}
              >
                Languages
              </p>
              <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                {languageItems.map((item) => {
                  const flagIso = resolveSpokenLanguageFlagIso2(item.name);
                  return (
                    <li
                      key={item.name}
                      className={`flex items-center gap-2 ${bodyClass}`}
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
                      <span>{item.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {showSecondary ? (
        <section
          className="mt-14 grid gap-10 border-t pt-10 sm:mt-16 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3"
          style={{ borderColor: cardBorder }}
        >
          {showEducationBlock ? (
            <div>
              <p
                className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
                style={{ color: accent }}
              >
                Education
              </p>
              <ul className={`mt-4 space-y-4 ${bodyClass}`}>
                {educationItems.map((entry) => (
                  <li
                    key={entry.id || `${entry.title}-${entry.schoolYear}`}
                    className="leading-relaxed"
                    style={{ color: bodyColor }}
                  >
                    {entry.title?.trim() ? (
                      <span className="font-medium" style={{ color: subtitleColor }}>
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
            </div>
          ) : null}
          {showSystemsBlock ? (
            <div>
              <p
                className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
                style={{ color: accent }}
              >
                Systems & tools
              </p>
              <InfoBulletList
                items={toolItems}
                accent={accent}
                body={bodyColor}
                square
                bodySizeClass={bodyClass}
              />
            </div>
          ) : null}
        </section>
      ) : null}
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
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
  includeLabel = true,
}: {
  entries: ProfileEducationEntry[];
  accent: string;
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
        <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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
  contentSize = 'md',
}: {
  children: string;
  accent: string;
  contentSize?: PortfolioInfoContentSize;
}) {
  const labelClass = infoContentLabelSizeClass(contentSize);
  return (
    <p
      className={`font-semibold uppercase tracking-[0.2em] ${labelClass}`}
      style={{ color: accent }}
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
  bodyColor,
  contentSize,
}: {
  skillLabels: string[];
  strengthItems: string[];
  showSkills: boolean;
  showStrengths: boolean;
  accent: string;
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
          <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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
          <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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
          <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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
          <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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
          <ManifestoSectionLabel accent={accent} contentSize={contentSize}>
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

function AboutValueBio({
  text,
  contentSize,
  subtitleColor,
}: {
  text: string;
  contentSize: PortfolioInfoContentSize;
  subtitleColor: string;
}) {
  const introSizeClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="mb-16 max-w-3xl space-y-6 sm:mb-20 sm:max-w-4xl sm:space-y-7 lg:mb-24 lg:max-w-5xl">
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className={`leading-relaxed ${introSizeClass}`}
          style={{ color: subtitleColor }}
        >
          {paragraph}
        </p>
      ))}
    </div>
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

function AboutValueBlockDivider({ borderColor }: { borderColor: string }) {
  return (
    <div
      className="mt-32 h-px w-full sm:mt-40 lg:mt-48 xl:mt-56 mb-14 sm:mb-16 lg:mb-20"
      style={{ backgroundColor: borderColor }}
      aria-hidden
    />
  );
}

/** About · value — numbered 2-column values grid (Our values reference layout). */
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
}: {
  avatarSrc: string;
  initials: string;
  fullName?: string | null;
  accent: string;
  bodyColor: string;
}) {
  const media = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatarSrc}
      alt={fullName?.trim() || 'Profile'}
      className="h-full w-full object-cover object-center"
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
}) {
  const sectionTitleClass = infoContentBodySizeClass(contentSize);
  const stepTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const descriptionSizeClass = aboutValueStepsDescriptionSizeClass(contentSize);
  const emptyMessageClass = infoContentEducationMetaSizeClass(contentSize);
  const visibleSkills = skillItems.filter(
    (item) => item.title?.trim() || item.description?.trim()
  );
  const showIntro = introEnabled && introParagraphs.length > 0;
  const showValues = showSkills && visibleSkills.length > 0;
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

      {showIntro && showValues ? (
        <div
          className="my-14 h-px w-full sm:my-16 lg:my-20"
          style={{ backgroundColor: cardBorder }}
          aria-hidden
        />
      ) : null}

      {showValues ? (
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
      ) : !showIntro ? (
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

function AboutValueLayout({
  title,
  bio,
  presentation,
  heroPalette,
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
  blocksLayout,
  accent,
  titleColor,
  subtitleColor,
  bodyColor,
  cardBorder,
  contentSize,
}: {
  title: string;
  bio?: string | null;
  presentation: PortfolioInfoPresentationSettings;
  heroPalette?: PortfolioHeroPalette;
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
  blocksLayout: PortfolioInfoAboutValueBlocksLayout;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBorder: string;
  contentSize: PortfolioInfoContentSize;
}) {
  const bioText = resolveAboutValueBioText(presentation.aboutValueBioCustomText, bio);
  const showBio = presentation.aboutValueBioEnabled !== false && bioText.length > 0;
  const valuesLayout = resolveInfoAboutValueValuesLayout(presentation);
  const useCustomValuesLayout = valuesLayout !== 'editorial';
  const useGrid = blocksLayout === 'grid-2';
  const rowLayout = blocksLayout;
  const listMarkerStyle = resolveInfoAboutValueListMarkerStyle(presentation);

  const sharedRowProps = {
    accent,
    titleColor,
    subtitleColor,
    bodyColor,
    blocksLayout: rowLayout,
    listMarkerStyle,
    contentSize,
  };

  type AboutValueBlockConfig = {
    key: string;
    visible: boolean;
    props: Omit<ComponentProps<typeof AboutValueRow>, keyof typeof sharedRowProps>;
  };

  const blockConfigs: AboutValueBlockConfig[] = [
    ...(useCustomValuesLayout
      ? []
      : [
          {
            key: 'values',
            visible: showSkills,
            props: {
              heading: title,
              items: skillItems,
              listMode: 'skills' as const,
              showList: showSkills,
              emptyListMessage: 'Ajoute des skills dans Creator Studio → Information.',
            },
          },
        ]),
    {
      key: 'strengths',
      visible: showStrengths && strengthItems.length > 0,
      props: {
        heading: 'Strengths',
        items: strengthItems,
        showList: true,
      },
    },
    {
      key: 'interests',
      visible: showInterests && interestItems.length > 0,
      props: {
        heading: 'Interests',
        items: interestItems,
        showList: true,
      },
    },
    {
      key: 'systems',
      visible: showSystemsTools && toolItems.length > 0,
      props: {
        heading: 'Operating systems',
        items: toolItems,
        showList: true,
      },
    },
    {
      key: 'languages',
      visible: showLanguages && languageItems.length > 0,
      props: {
        heading: 'Languages',
        listMode: 'languages',
        languageItems,
        languageLevelStyle,
        showLanguageFlags,
        showList: true,
        trackColor: cardBorder,
      },
    },
    {
      key: 'education',
      visible: showEducation && educationItems.length > 0,
      props: {
        heading: 'Education',
        listMode: 'education',
        educationItems,
        showList: true,
      },
    },
  ];

  const visibleBlocks = blockConfigs.filter((block) => block.visible);
  const showCustomValuesSection = useCustomValuesLayout && showSkills;

  const renderBlock = (block: AboutValueBlockConfig) => (
    <AboutValueRow key={block.key} {...block.props} {...sharedRowProps} />
  );

  return (
    <div className="w-full">
      {showBio ? (
        <AboutValueBio text={bioText} contentSize={contentSize} subtitleColor={subtitleColor} />
      ) : null}
      {valuesLayout === 'numbered-grid' && showSkills ? (
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
      {valuesLayout === 'indexed-list' && showSkills ? (
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
      {useGrid ? (
        <>
          {showCustomValuesSection && visibleBlocks.length > 0 ? (
            <AboutValueBlockDivider borderColor={cardBorder} />
          ) : null}
          <div className="grid grid-cols-1 gap-16 sm:gap-20 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 xl:gap-x-16">
            {visibleBlocks.map((block) => (
              <div key={block.key} className="min-w-0">
                {renderBlock(block)}
              </div>
            ))}
          </div>
        </>
      ) : (
        visibleBlocks.map((block, index) => (
          <Fragment key={block.key}>
            {index > 0 || showCustomValuesSection ? (
              <AboutValueBlockDivider borderColor={cardBorder} />
            ) : null}
            {renderBlock(block)}
          </Fragment>
        ))
      )}
    </div>
  );
}

/**
 * Info section designs:
 * - about-me: label + subtitle + bio + education + cards
 * - about-me-trait: centered title + accent trait + portrait/bio + skills/strengths/languages + education timeline
 * - about-split: asymmetric portrait/copy split — title, bio, skill chips, strengths, compact language flags
 * - about-manifesto: huge statement + accent rule + languages rail + education index + capability blocks
 * - about-terminal: dev console shell — monospace commands, no portrait
 * - about-value: stacked rows — labels left, bullet lists right (My Values, Strengths, Interests, Operating systems)
 * - about-value-steps: My Values top-right ; numbered skills — Step 01 left, title + description right
 */
export function EditorialAboutMeSection({
  title,
  subtitle,
  bio,
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

  if (presentation.design === 'about-split') {
    return (
      <AboutSplitLayout
        title={title}
        subtitle={subtitle}
        bio={bio}
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
        contentSize={contentSize}
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
        avatarGrayscale={presentation.aboutManifestoAvatarGrayscale === true}
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
      />
    );
  }

  if (presentation.design === 'about-value') {
    return (
      <AboutValueLayout
        title={title}
        bio={bio}
        presentation={presentation}
        heroPalette={heroPalette}
        skillItems={skillItems}
        strengthItems={strengthItems}
        interestItems={interestItems}
        toolItems={toolItems}
        languageItems={languageItems}
        educationItems={educationItems}
        showSkills={showSkills}
        showStrengths={showStrengths}
        showInterests={resolveInfoShowInterests(presentation) && interestItems.length > 0}
        showSystemsTools={resolveInfoShowSystemsTools(presentation) && toolItems.length > 0}
        showLanguages={showLanguages}
        showEducation={resolveInfoShowEducation(presentation) && educationItems.length > 0}
        showLanguageFlags={presentation.showLanguageFlags !== false}
        languageLevelStyle={languageLevelStyle}
        blocksLayout={resolveInfoAboutValueBlocksLayout(presentation)}
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
