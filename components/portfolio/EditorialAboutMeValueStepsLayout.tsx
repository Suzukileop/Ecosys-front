'use client';
import contentStyles from './portfolio-info-value-content.module.css';

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'framer-motion';
import { aboutBannerScrollParent } from '@/components/portfolio/portfolio-about-scroll-utils';
import { type ProfileEducationEntry } from '@/types/profile';
import { aboutPlatformLeadSizeClass, aboutValueBlockTitleSizeClass, aboutValueNumberedGridIndexSizeClass, aboutValueStepsDescriptionSizeClass, aboutValueStepsItemTitleSizeClass, aboutValueStepsLanguageCodeSizeClass, aboutValueStepsLanguageLevelSizeClass, ABOUT_VALUE_STEPS_SECTION_LABELS, infoContentEducationMetaSizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, type PortfolioInfoAboutValueStepsMarker, type PortfolioInfoAboutValueStepsIntroStyle, infoBlockLabelColor, type PortfolioInfoAboutValueValuesLayout, type PortfolioInfoAboutValueBlocksLayout, type PortfolioInfoAboutValueListMarkerStyle, type PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';
import { type ProfileSkillEntry } from '@/lib/about-skills';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import { type PortfolioListMarkerStyle } from '@/components/portfolio/portfolio-list-marker';
import { mediaImageResponsive } from '@/lib/media-image-url';
import { useT } from '@/lib/i18n/I18nProvider';
import { ABOUT_MEDIA_WIDTHS, ABOUT_MEDIA_SIZES, infoPortraitImageClass, type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';
import { ABOUT_CLASSIC_SERIF, ABOUT_CLASSIC_LEVEL_TONE, aboutClassicLanguageCode } from '@/components/portfolio/EditorialAboutMeClassicLayout';
import { ManifestoSectionLabel } from '@/components/portfolio/EditorialAboutMeManifestoLayout';

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
  labelColor,
  contentSize,
  children,
}: {
  label: string;
  labelColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
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
  labelColor,
  accent,
  subtitleColor,
  bodyColor,
  contentSize,
}: {
  items: ProfileEducationEntry[];
  labelColor: string;
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
      <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
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
  const t = useT();
  const media = avatarSrc ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...mediaImageResponsive(avatarSrc, ABOUT_MEDIA_WIDTHS)}
      sizes={ABOUT_MEDIA_SIZES}
      alt={fullName?.trim() || t('Profile')}
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
  visibleSkills,
  accent,
  subtitleColor,
  bodyColor,
  contentSize,
  marker,
}: {
  visibleSkills: ProfileSkillEntry[];
  accent: string;
  subtitleColor: string;
  bodyColor: string;
  contentSize: PortfolioInfoPremiumFontSize;
  marker: PortfolioInfoAboutValueStepsMarker;
}) {
  const numbered = marker === 'number';
  const motionOff = useReducedMotion() === true;
  const stepTitleClass = aboutValueStepsItemTitleSizeClass(contentSize);
  const descriptionSizeClass = aboutValueStepsDescriptionSizeClass(contentSize);

  return (
    <>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
        <div className="lg:col-span-8">
          {visibleSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              className={`pf-about-values-step grid grid-cols-1 items-start gap-x-6 gap-y-3 ${numbered ? 'lg:grid-cols-[4rem_minmax(0,1fr)]' : 'lg:grid-cols-[1.75rem_minmax(0,1fr)]'} ${
                index > 0 ? 'mt-10 sm:mt-12 lg:mt-14' : ''
              }`}
              style={{ ['--pf-about-values-i' as string]: index } as CSSProperties}
              data-pf-no-color-transition=""
              initial={motionOff ? false : 'hidden'}
              whileInView={motionOff ? undefined : 'show'}
              viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_STEP_VIEWPORT}
              variants={ABOUT_VALUE_STEPS_STEP_STAGGER}
              whileHover={motionOff ? undefined : { y: -5 }}
            >
              <div className={`flex gap-4 ${numbered ? 'items-baseline lg:pt-1.5' : 'items-start lg:pt-2.5'}`}>
                <motion.span
                  className="pf-about-values-index inline-flex"
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_INDEX}
                >
                  {numbered ? (
                    <ValueStepsIndicator index={index} accent={accent} />
                  ) : (
                    <AboutValueListMarker style={marker} accent={accent} />
                  )}
                </motion.span>
                <motion.h3
                  className={`pf-about-values-serif min-w-0 flex-1 font-semibold tracking-tight lg:hidden ${stepTitleClass}`}
                  style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
                >
                  {skill.title}
                </motion.h3>
              </div>

              <div className="min-w-0 max-w-xl">
                <motion.h3
                  className={`pf-about-values-serif hidden font-semibold tracking-tight lg:block ${stepTitleClass}`}
                  style={{ color: subtitleColor, ...ABOUT_VALUE_SERIF_STYLE }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_FADE}
                >
                  {skill.title}
                </motion.h3>
                {skill.description.trim() ? (
                  <motion.p
                    className={`mt-4 hidden leading-relaxed lg:mt-5 lg:block ${descriptionSizeClass}`}
                    style={{ color: bodyColor }}
                    variants={motionOff ? undefined : ABOUT_VALUE_STEPS_COPY}
                  >
                    {skill.description}
                  </motion.p>
                ) : null}
              </div>

              {skill.description.trim() ? (
                <motion.p
                  className={`max-w-xl leading-relaxed lg:hidden ${descriptionSizeClass}`}
                  style={{ color: bodyColor }}
                  variants={motionOff ? undefined : ABOUT_VALUE_STEPS_COPY}
                >
                  {skill.description}
                </motion.p>
              ) : null}
            </motion.div>
          ))}
        </div>

      </div>
    </>
  );
}

export function AboutValueStepsLayout({
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
  showPortrait = true,
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
  blockLabelColor,
  stepsMarker,
  introStyle,
  introSizeKey,
  introColor,
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
  /** Draw the portrait; off, the layout recomposes without it. */
  showPortrait?: boolean;
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
  blockLabelColor: PortfolioInfoBlockLabelColor;
  stepsMarker: PortfolioInfoAboutValueStepsMarker;
  introStyle: PortfolioInfoAboutValueStepsIntroStyle;
  introSizeKey: PortfolioInfoPremiumFontSize;
  introColor: string;
}) {
  const t = useT();
  const motionOff = useReducedMotion() === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const labelColor = infoBlockLabelColor(blockLabelColor, subtitleColor);
  const introLeadClass = aboutPlatformLeadSizeClass(introSizeKey);
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
  const showPortraitBlock = showPortrait && Boolean(avatarSrc || initials);
  const showFooter = showStrengthsBlock || showPortraitBlock;
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
          labelColor={labelColor}
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
          labelColor={labelColor}
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
    '--pf-values-item-size': {small:'1rem',medium:'1.125rem',large:'1.25rem',xlarge:'1.5rem',xxlarge:'1.75rem'}[contentSize],
    '--pf-about-values-accent': accent,
    '--pf-about-values-line': cardBorder,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`pf-about-values w-full ${contentStyles.content}`}
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
              className={`pf-about-values-intro-p leading-relaxed ${
                index === 0 ? introLeadClass : descriptionSizeClass
              }${index === 0 && introStyle !== 'sans' ? ' pf-about-values-intro-p--display' : ''}`}
              style={
                index === 0
                  ? introStyle === 'sans'
                    ? { color: introColor, fontWeight: 400 }
                    : {
                        color: introColor,
                        fontStyle: introStyle === 'italic-serif' ? 'italic' : 'normal',
                        fontWeight: 500,
                        ...ABOUT_VALUE_SERIF_STYLE,
                      }
                  : { color: bodyColor }
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
          className="pf-about-values-rule my-10 h-px w-full origin-left sm:my-12 lg:my-14"
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
              visibleSkills={visibleSkills}
              accent={accent}
              subtitleColor={subtitleColor}
              bodyColor={bodyColor}
              contentSize={contentSize}
              marker={stepsMarker}
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
              emptyMessage={t('Ajoute des skills dans Creator Studio → Information.')}
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
              emptyMessage={t('Ajoute des skills dans Creator Studio → Information.')}
            />
          ) : null}
        </div>
      ) : !showIntro && showSkills ? (
        <p className={`opacity-60 ${emptyMessageClass}`} style={{ color: bodyColor }}>
          {t('Ajoute des skills dans Creator Studio → Information.')}
        </p>
      ) : null}

      {showFooter ? (
        <div className="pf-about-values-footer mt-16 sm:mt-20 lg:mt-24">
          <motion.div
            className="pf-about-values-rule mb-10 h-px w-full origin-left sm:mb-12 lg:mb-14"
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
                <ManifestoSectionLabel color={labelColor} contentSize={contentSize}>
                  {ABOUT_VALUE_STEPS_SECTION_LABELS.strengths}
                </ManifestoSectionLabel>
                <ValueStepsFloatingSkillWords
                  items={visibleStrengths}
                  bodyColor={subtitleColor}
                  bodySizeClass={descriptionSizeClass}
                />
              </motion.div>
            ) : null}

            {showPortraitBlock ? (
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
        <div className="pf-about-values-meta-section mt-16 sm:mt-20 lg:mt-24">
          <ValueStepsSectionRule cardBorder={cardBorder} className="pf-about-values-rule mb-10 sm:mb-12 lg:mb-14" />
          {showEducationBlock ? (
            <motion.div
              className={`pf-about-values-meta ${showMeta || showLanguagesBlock ? 'mb-16 sm:mb-20 lg:mb-24' : ''}`}
              data-pf-no-color-transition=""
              initial={motionOff ? false : { opacity: 0, y: 22 }}
              whileInView={motionOff ? undefined : { opacity: 1, y: 0 }}
              viewport={motionOff ? undefined : ABOUT_VALUE_STEPS_BLOCK_VIEWPORT}
              transition={{ duration: 0.78, ease: ABOUT_VALUE_STEPS_EASE }}
            >
              <ValueStepsEducationList
                items={educationItems}
                labelColor={labelColor}
                accent={accent}
                subtitleColor={subtitleColor}
                bodyColor={bodyColor}
                contentSize={contentSize}
              />
            </motion.div>
          ) : null}
          {showMeta ? (
            motionOff ? (
              <div className={showLanguagesBlock ? 'mb-16 sm:mb-20 lg:mb-24' : ''}>
                <ValueStepsMetaGrid blocks={metaBlocks} />
              </div>
            ) : (
              <motion.div
                className={`grid grid-cols-1 gap-16 sm:gap-20 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-20 xl:gap-x-16 ${
                  showLanguagesBlock ? 'mb-16 sm:mb-20 lg:mb-24' : ''
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
                labelColor={labelColor}
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
