'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ProfileEducationEntry } from '@/types/profile';
import { aboutMeTraitHeadlineSizeClass, infoContentBlockTitleSizeClass, infoContentBodySizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor, type PortfolioInfoEducationDisplayStyle, type PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import { TraitEducationBlock } from '@/components/portfolio/EditorialAboutMeEducation';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { skillEntryLabels, type ProfileSkillEntry } from '@/lib/about-skills';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, infoPortraitImageClass, type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';
import { aboutClassicLanguageCode } from '@/components/portfolio/EditorialAboutMeClassicLayout';

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
  labelColor,
  items,
  titleColor,
  bodyColor,
  accent,
  contentSize,
}: {
  label: string;
  labelColor: string;
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
        className={`text-left font-medium tracking-[-0.01em] ${blockTitleClass}`}
        style={{ color: labelColor }}
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
  labelColor,
  items,
  titleColor,
  bodyColor,
  accent,
  contentSize,
}: {
  label: string;
  labelColor: string;
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
        className={`text-left font-medium tracking-[-0.01em] ${blockTitleClass}`}
        style={{ color: labelColor }}
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
              <span className="pf-about-trait-lang-level">· {levelLabel}</span>
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
          className={`pf-about-trait-line text-left font-medium tracking-[-0.02em] ${headlineClass}`}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/** Air between the headline block and the three columns. */
const ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM = 'mt-12 sm:mt-14 lg:mt-16';

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
const ABOUT_ME_TRAIT_EDUCATION_SECTION_TOP = 'mt-12 sm:mt-14 lg:mt-16';

export function AboutMeTraitLayout({
  title: _title,
  headlineText,
  showHeadline,
  avatarUrl,
  showPortrait = true,
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
  blockLabelColor,
}: {
  title: string;
  headlineText: string;
  showHeadline: boolean;
  avatarUrl?: string | null;
  /** Draw the portrait; off, the layout recomposes without it. */
  showPortrait?: boolean;
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
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const labelColor = infoBlockLabelColor(blockLabelColor, titleColor);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: client-only state after hydration
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
          '--pf-about-trait-card-bg': cardBg,
          '--pf-about-trait-card-border': cardBorder,
        } as CSSProperties
      }
    >
      <div className="mt-12 flex flex-col sm:mt-14">
        <div
          className={`grid gap-8 lg:items-stretch lg:gap-14 ${
            showHeadline && showPortrait
              ? 'lg:grid-cols-[minmax(18rem,min(26rem,34%))_minmax(0,1fr)]'
              : 'lg:grid-cols-1'
          }`}
        >
          {showPortrait ? (
          <div
            className={`pf-about-trait-portrait aspect-square w-full max-w-[22rem] overflow-hidden bg-neutral-800 sm:max-w-[26rem] lg:mx-0 lg:aspect-auto lg:h-[min(24rem,28vw)] lg:w-[min(24rem,28vw)] lg:max-w-none lg:shrink-0 ${
              showHeadline ? '' : 'lg:h-auto lg:w-full lg:aspect-square lg:max-w-[40rem]'
            }`}
            style={{ backgroundColor: cardBg }}
          >
            <div className="pf-about-trait-portrait-zoom h-full w-full" data-pf-no-color-transition="">
              {avatarUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...mediaImageResponsive(avatarUrl.trim(), ABOUT_MEDIA_WIDTHS)}
                  sizes={ABOUT_MEDIA_SIZES}
                  alt={fullName?.trim() || t('Profile')}
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
          ) : null}

          {showHeadline ? (
            <div className="order-first flex min-h-0 min-w-0 lg:order-none lg:h-full">
              <AboutMeTraitHeadline
                text={headlineText.trim() || t('Turning Hard\nProblems Into\nSimple Software')}
                contentSize={contentSize}
              />
            </div>
          ) : null}
        </div>

        {(showSkillsBlock || showStrengthsBlock || showLanguagesBlock) && (
          <section
            // Columns come from the space and the blocks actually shown — one or two blocks
            // share the full width instead of leaving empty thirds.
            className={`pf-about-trait-columns grid gap-6 lg:gap-8 ${ABOUT_ME_TRAIT_SKILLS_SECTION_RHYTHM}`}
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))' }}
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
                  label={t('Skills')}
                  labelColor={labelColor}
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
                  label={t('Strengths')}
                  labelColor={labelColor}
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
                  label={t('Languages')}
                  labelColor={labelColor}
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
            labelColor={labelColor}
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
