'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { type ProfileEducationEntry } from '@/types/profile';
import { infoContentBodySizeClass, infoContentEducationMetaSizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor, type PortfolioInfoAboutSplitPortraitSide, type AboutSplitSectionLabels, type PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel, spokenLanguageMatchKey } from '@/lib/spoken-languages';
import { type ProfileSkillEntry } from '@/lib/about-skills';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, infoPortraitImageClass, type LanguageDisplayItem, InfoBulletList, useHydrationSafeReducedMotion } from '@/components/portfolio/EditorialAboutMeCommon';

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

/** About · split — skill rows in the content column (titles only, no descriptions, no ordinals). */
function AboutSplitSkillsList({
  label,
  labelColor,
  skills,
  titleColor,
  bodyClass,
  reduceMotion,
}: {
  label: string;
  labelColor: string;
  skills: ProfileSkillEntry[];
  titleColor: string;
  bodyClass: string;
  reduceMotion: boolean;
}) {
  return (
    <>
      <AboutSplitSectionHeading label={label} titleColor={labelColor} />
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
              <span className="pf-about-split-skill-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <span className="pf-about-split-skill-title" style={{ color: titleColor }}>
                  {skillTitle}
                </span>
                {skill.description?.trim() ? <p className="pf-about-split-skill-description">{skill.description.trim()}</p> : null}
              </div>
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
  bodyClass,
  reduceMotion,
}: {
  items: LanguageDisplayItem[];
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
              <span className="pf-about-split-lang-level">{levelLabel}</span>
            ) : null}
          </motion.li>
        );
      })}
    </ul>
  );
}

export function AboutSplitLayout({
  title: _title,
  subtitle: _subtitle,
  bio,
  specialty,
  avatarUrl,
  showPortrait = true,
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
  portraitCaptionEnabled=true,
  sectionLabels,
  portraitGrayscale,
  blockLabelColor,
}: {
  title: string;
  subtitle: string;
  bio?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  /** Draw the portrait; off, the layout recomposes without it. */
  showPortrait?: boolean;
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
  portraitCaptionEnabled?: boolean;
  sectionLabels: AboutSplitSectionLabels;
  portraitGrayscale: boolean;
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const reduceMotion = useHydrationSafeReducedMotion();
  const labelColor = infoBlockLabelColor(blockLabelColor, titleColor);
  const bioText = bio?.trim() ?? '';
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

  const specialtyHeadline = specialty?.trim() || t('Software engineer');
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
      key={reduceMotion ? 'reduced' : 'full'}
      ref={rootRef}
      className="pf-about-split relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 lg:static lg:w-full lg:max-w-none lg:translate-x-0"
      data-pf-entry={reduceMotion || !showPortrait ? 'ready' : 'armed'}
      data-portrait-side={portraitOnRight ? 'end' : 'start'}
      style={splitThemeStyle}
    >
      <div
        className={`pf-about-split-grid flex min-h-0 flex-col lg:items-start ${
          portraitOnRight ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        {showPortrait ? (
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
                    {...mediaImageResponsive(avatarUrl.trim(), ABOUT_MEDIA_WIDTHS)}
                    sizes={ABOUT_MEDIA_SIZES}
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
            {portraitCaptionEnabled ? <><div className="pf-about-split-portrait-veil" aria-hidden />
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
            </motion.div></> : null}
          </motion.div>
        </div>
        ) : null}

        <div
          className={`pf-about-split-copy min-w-0 flex-1 ${
            !showPortrait
              ? ''
              : portraitOnRight
                ? 'pf-about-split-copy--before-portrait'
                : 'pf-about-split-copy--after-portrait'
          }`}
        >
          {/* The portrait plate already carries name + specialty; the copy column opens with
              the person's own words, so the split tells something before it lists things. */}
          {!showPortrait ? (
            // The portrait plate carried the name and specialty: without it they open the column.
            <div className="mb-10">
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: titleColor }}>
                {portraitName}
              </p>
              {specialtyHeadline ? (
                <p className="mt-2 text-base" style={{ color: subtitleColor }}>
                  {specialtyHeadline}
                </p>
              ) : null}
            </div>
          ) : null}
          {bioText ? (
            <motion.p
              className="pf-about-split-lede whitespace-pre-line"
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35, ease: ABOUT_SPLIT_EASE }}
            >
              {bioText}
            </motion.p>
          ) : null}

          {showSkillsBlock ? (
            <section className="pf-about-split-section pf-about-split-section--skills">
              <AboutSplitSkillsList
                label={sectionLabels.skills}
                labelColor={labelColor}
                skills={visibleSkills}
                titleColor={titleColor}
                bodyClass={bodyClass}
                reduceMotion={reduceMotion}
              />
            </section>
          ) : null}

          {showStrengthsBlock ? (
            <section className="pf-about-split-section pf-about-split-section--tags">
              <AboutSplitSectionHeading label={sectionLabels.strengths} titleColor={labelColor} />
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
              <AboutSplitSectionHeading label={sectionLabels.languages} titleColor={labelColor} />
              <AboutSplitLanguageList
                items={languageItems}
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
              <AboutSplitSectionHeading label={t('Education')} titleColor={labelColor} />
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
                      <span className="mt-0.5 block">{entry.institution.trim()}</span>
                    ) : null}
                    {entry.schoolYear?.trim() ? (
                      <span className={`mt-0.5 block ${metaClass}`}>
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
              className="pf-about-split-section pf-about-split-section--tools"
              style={{ borderColor: cardBorder }}
              data-pf-no-color-transition=""
              initial={reduceMotion ? false : splitSectionMotion}
              whileInView={reduceMotion ? undefined : splitSectionVisible}
              viewport={reduceMotion ? undefined : { once: true, amount: 0.16 }}
              transition={{ duration: 0.7, ease: ABOUT_SPLIT_EASE }}
            >
              <AboutSplitSectionHeading label={t('Systems & tools')} titleColor={labelColor} />
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
