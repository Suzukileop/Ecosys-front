'use client';

import { useMemo, type ComponentProps, type CSSProperties } from 'react';
import { TranslationOverrides } from '@/lib/i18n/I18nProvider';

import { type ProfileEducationEntry, type ProfileSpokenLanguage } from '@/types/profile';
import { resolveAboutValueStepsIntroParagraphs, resolveAboutMeTraitHeadlineText, resolveAboutBannerSectionLabels, resolveAboutPlatformHeadlineText, resolveAboutPlatformStrengthsSectionTitle, resolveAboutPortraitSkillsMetaEnabled, resolveAboutPortraitSkillsMetaLead, resolveInfoPremiumFontSize, resolveInfoPortrait, infoBlockLabelScale, infoBlockLabelOverrides, resolveInfoAboutValueValuesLayout, resolveInfoAboutValueListMarkerStyle, resolveInfoAboutValueStepsMarker, resolveAboutValueStepsIntroTypography, resolveInfoAboutManifestoBlocksLayout, resolveInfoAboutManifestoBlocksScrollFocus, resolveInfoAboutManifestoStatementStyle, resolveInfoAboutManifestoPortraitFrame, resolveInfoAboutTerminalColorMode, resolveInfoAboutSplitPortraitSide, resolveAboutSplitSectionLabels, resolveInfoDesign, resolveInfoEducationDisplayStyle, resolveInfoEducationCascadeScrollShift, resolveInfoLanguageLevelDisplayStyle, resolveInfoShowEducation, resolveInfoShowInterests, resolveInfoShowLanguages, resolveInfoPortraitGrayscale, resolveInfoShowStrengths, resolveInfoShowSystemsTools, type PortfolioInfoPresentationSettings } from '@/components/portfolio/portfolio-info-settings';
import { type PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import { AboutTerminalLayout } from '@/components/portfolio/EditorialAboutMeNoirLayouts';
import { AboutIndexEditorialLayout } from '@/components/portfolio/EditorialAboutMeIndexLayout';
import { resolveAboutSkillEntries, type ProfileSkillEntry } from '@/lib/about-skills';
import { resolveLanguageItems } from '@/components/portfolio/EditorialAboutMeCommon';
import { AboutMeTraitLayout } from '@/components/portfolio/EditorialAboutMeTraitLayout';
import { AboutMeClassicLayout } from '@/components/portfolio/EditorialAboutMeClassicLayout';
import { AboutPlatformLayout } from '@/components/portfolio/EditorialAboutMePlatformLayout';
import { AboutPortraitSkillsLayout } from '@/components/portfolio/EditorialAboutMePortraitSkillsLayout';
import { AboutBannerLayout } from '@/components/portfolio/EditorialAboutMeBannerLayout';
import { AboutSplitLayout } from '@/components/portfolio/EditorialAboutMeSplitLayout';
import { AboutManifestoLayout } from '@/components/portfolio/EditorialAboutMeManifestoLayout';
import { AboutValueStepsLayout } from '@/components/portfolio/EditorialAboutMeValueStepsLayout';

type EditorialAboutMeSectionProps = {
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
function EditorialAboutMeSectionLayouts({
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
  const showLanguages = presentation.showLanguages !== false;
  const showSystemsTools = presentation.showSystemsTools !== false && toolItems.length > 0;
  const contentSize = resolveInfoPremiumFontSize(presentation);
  const infoDesign = resolveInfoDesign(presentation.design);
  const portraitGrayscale = resolveInfoPortraitGrayscale(presentation);
  const portrait = resolveInfoPortrait(presentation, avatarUrl);

  if (infoDesign === 'about-manifesto') {
    return (
      <AboutManifestoLayout
        title={title}
        subtitle={subtitle}
        specialty={specialty}
        bio={bio}
        avatarUrl={portrait.url}
        showPortrait={portrait.show}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        headlineFormat={presentation.aboutPlatformHeadlineFormat}
        skillIcons={presentation.aboutPlatformSkillIcons}
        filledCards={presentation.aboutPlatformFilledCards === true}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        avatarUrl={portrait.url}
        showPortrait={portrait.show}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        portraitEnabled={portrait.show}
        title={title}
        subtitle={subtitle}
        bio={bio}
        avatarUrl={portrait.url}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        avatarUrl={portrait.url}
        showPortrait={portrait.show}
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
        portraitCaptionEnabled={presentation.aboutSplitPortraitCaptionEnabled!==false}
        sectionLabels={resolveAboutSplitSectionLabels(presentation)}
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
        avatarUrl={portrait.url}
        showPortrait={portrait.show}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
        stepsMarker={resolveInfoAboutValueStepsMarker(presentation)}
        introStyle={resolveAboutValueStepsIntroTypography(presentation).style}
        introSizeKey={resolveAboutValueStepsIntroTypography(presentation).sizeClassKey}
        introColor={resolveAboutValueStepsIntroTypography(presentation).color}
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
        avatarUrl={portrait.url}
        showPortrait={portrait.show}
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
        blockLabelColor={presentation.blockLabelColor ?? 'muted'}
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
      blockLabelColor={presentation.blockLabelColor ?? 'muted'}
    />
  );
}

/**
 * The Info section: draws the chosen design and sets the Block label size scale every design's block
 * labels read (see the `--pf-info-label-ink` rule in globals.css). `contents` keeps the wrapper out of layout.
 */
export function EditorialAboutMeSection(props: ComponentProps<typeof EditorialAboutMeSectionLayouts>) {
  const labelScale = infoBlockLabelScale(props.presentation.blockLabelSize);
  const labelsKey = JSON.stringify(props.presentation.blockLabels ?? {});
  // The creator's own block names replace the default ones in every design (they all draw them through `t`).
  // eslint-disable-next-line react-hooks/exhaustive-deps -- labelsKey is the serialized blockLabels
  const overrides = useMemo(() => infoBlockLabelOverrides(JSON.parse(labelsKey)), [labelsKey]);
  return (
    <div className="contents" style={{ '--pf-info-label-scale': labelScale } as CSSProperties}>
      <TranslationOverrides overrides={overrides}>
        <EditorialAboutMeSectionLayouts {...props} />
      </TranslationOverrides>
    </div>
  );
}
