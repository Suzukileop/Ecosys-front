'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ProfileEducationEntry } from '@/types/profile';
import { infoContentBodySizeClass, infoContentEducationMetaSizeClass, infoContentLabelSizeClass, type PortfolioInfoPremiumFontSize, type PortfolioInfoBlockLabelColor, infoBlockLabelColor, type PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import { resolveSpokenLanguageLevelLabel, spokenLanguageMatchKey } from '@/lib/spoken-languages';
import { skillEntryLabels, type ProfileSkillEntry } from '@/lib/about-skills';
import { useT } from '@/lib/i18n/I18nProvider';
import { type LanguageDisplayItem } from '@/components/portfolio/EditorialAboutMeCommon';

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

export const ABOUT_CLASSIC_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

/** A soft white/gray tone for section labels — dims via color-mix (not `opacity`, which
 *  Framer already animates on these elements) so accent stays reserved for the one
 *  surgical red index chip. */
export function aboutClassicMuted(color: string, percent = 62): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/** "2018-2019" / "2018 — 2019" → "2018 – 2019" (en dash, full years); a single year stays as
 *  is; unparseable text passes through. */
function aboutClassicYearRange(raw: string): string {
  const years = raw.match(/\d{4}/g);
  if (!years || years.length === 0) return raw.trim();
  if (years.length === 1) return years[0];
  return `${years[0]} – ${years[years.length - 1]}`;
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

export const ABOUT_CLASSIC_LEVEL_TONE: Record<string, number> = {
  expert: 1,
  advanced: 0.85,
  intermediate: 0.7,
  beginner: 0.58,
};

export function aboutClassicLanguageCode(name: string): string {
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
            <span aria-hidden className="pf-about-classic-lang-code" style={{ color: ink }}>
              {code}
            </span>
            <span className="pf-about-classic-lang-meta" style={{ color: body }}>
              {item.name}
              {levelLabel ? <span className="pf-about-classic-lang-meta-level block mt-1">{levelLabel}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Drops repeated entries (case/space-insensitive) — a duplicated line reads as a padding bug. */
function aboutClassicUniqueItems(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Strengths / tools — plain floating keywords, no pill/background/border, one even tone:
 *  alternating tones read as a ranking the owner never made. */
function AboutClassicKeywordList({ items, ink, bodyClass }: { items: string[]; ink: string; bodyClass: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={`pf-about-classic-keywords ${bodyClass}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="pf-about-classic-keyword font-medium" style={{ color: ink }}>
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

/** One index row of the layout: label in the left rail (stacked above on narrow screens),
 *  content in the shared text column every block — and the bio — aligns to. */
function AboutClassicBlock({
  blockKey,
  label,
  labelClass,
  labelColor,
  motionOff,
  children,
}: {
  blockKey: string;
  label: string;
  labelClass: string;
  labelColor: string;
  motionOff: boolean;
  children: ReactNode;
}) {
  return (
    <motion.section
      data-block={blockKey}
      className="pf-about-classic-block"
      initial={motionOff ? false : 'hidden'}
      whileInView={motionOff ? undefined : 'show'}
      viewport={ABOUT_CLASSIC_BLOCK_VIEWPORT}
      variants={ABOUT_CLASSIC_STAGGER}
    >
      <motion.h3
        className={`pf-about-classic-block-label font-medium tracking-[0.02em] ${labelClass}`}
        style={{ color: labelColor }}
        variants={motionOff ? undefined : ABOUT_CLASSIC_FADE_UP}
      >
        {label}
      </motion.h3>
      <motion.div className="pf-about-classic-block-body" variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}>
        {children}
      </motion.div>
    </motion.section>
  );
}

export function AboutMeClassicLayout({
  title: _title,
  subtitle: _subtitle,
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
  languageLevelStyle: _languageLevelStyle,
  accent,
  titleColor: _titleColor,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  contentSize,
  blockLabelColor,
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
  blockLabelColor: PortfolioInfoBlockLabelColor;
}) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const motionOff = reduceMotion === true;
  const rootRef = useRef<HTMLDivElement>(null);
  const labelClass = infoContentLabelSizeClass(contentSize);
  const bodyClass = infoContentBodySizeClass(contentSize);
  const labelColor = infoBlockLabelColor(blockLabelColor, aboutClassicMuted(subtitleColor));

  useEffect(() => {
    rootRef.current?.setAttribute('data-pf-js', 'true');
  }, []);

  const bioText = bio?.trim() ?? '';
  const skillLabels = aboutClassicUniqueItems(skillEntryLabels(skillItems));
  const strengthLabels = aboutClassicUniqueItems(strengthItems);
  const toolLabels = aboutClassicUniqueItems(aboutClassicFlattenToolItems(toolItems));
  const educationMetaClass = infoContentEducationMetaSizeClass(contentSize);
  const blockProps = { labelClass, labelColor, motionOff };

  const rootStyle = {
    '--pf-about-classic-accent': accent,
    '--pf-about-classic-border': cardBorder,
    '--pf-about-classic-card': cardBg,
    '--pf-about-classic-body': bodyColor,
    '--pf-about-classic-ink': subtitleColor,
    '--pf-about-classic-lang-size': `${{ small: 28, medium: 32, large: 36, xlarge: 40, xxlarge: 44 }[contentSize]}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="pf-about-classic w-full"
      data-pf-entry={motionOff ? 'static' : 'armed'}
      style={rootStyle}
    >
      {/* The shared header carries title and subtitle; the bio is this design's only prose, and
          without it a profile with just a bio got an empty section under the header. */}
      {bioText ? (
        <motion.p
          className={`pf-about-classic-bio whitespace-pre-line ${bodyClass}`}
          style={{ color: bodyColor }}
          initial={motionOff ? false : 'hidden'}
          whileInView={motionOff ? undefined : 'show'}
          viewport={ABOUT_CLASSIC_BLOCK_VIEWPORT}
          variants={motionOff ? undefined : ABOUT_CLASSIC_FADE_UP}
        >
          {bioText}
        </motion.p>
      ) : null}

      <div className="pf-about-classic-blocks">
        {showEducation ? (
          <AboutClassicBlock blockKey="education" label={t('Education')} {...blockProps}>
            <motion.ol className="pf-about-classic-edu-index" variants={motionOff ? undefined : ABOUT_CLASSIC_STAGGER}>
              {educationItems.map((entry, index) => (
                <motion.li
                  key={entry.id || `${entry.title}-${entry.schoolYear}-${index}`}
                  className="pf-about-classic-edu-row"
                  variants={motionOff ? undefined : ABOUT_CLASSIC_CARD_VARIANTS}
                >
                  {/* Plain dates, no ordinal: the list order is the owner's, not a ranking or steps. */}
                  <p className={`pf-about-classic-edu-range tabular-nums ${bodyClass}`}>
                    {entry.schoolYear?.trim() ? aboutClassicYearRange(entry.schoolYear.trim()) : null}
                  </p>
                  <div className="pf-about-classic-edu-what">
                    {entry.title?.trim() ? (
                      <p className={`pf-about-classic-edu-title font-medium leading-snug ${bodyClass}`} style={{ color: subtitleColor }}>
                        {entry.title.trim()}
                      </p>
                    ) : null}
                    {entry.institution?.trim() ? (
                      <p className={`pf-about-classic-edu-school leading-relaxed ${educationMetaClass}`}>
                        {entry.institution.trim()}
                      </p>
                    ) : null}
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </AboutClassicBlock>
        ) : null}

        {showSkills && skillLabels.length > 0 ? (
          <AboutClassicBlock blockKey="skills" label={t('Skills')} {...blockProps}>
            <AboutClassicItemList items={skillLabels} bodySizeClass={bodyClass} />
          </AboutClassicBlock>
        ) : null}

        {showLanguages ? (
          <AboutClassicBlock blockKey="languages" label={t('Languages')} {...blockProps}>
            <AboutClassicLanguageList items={languageItems} ink={subtitleColor} body={bodyColor} />
          </AboutClassicBlock>
        ) : null}

        {showStrengths && strengthLabels.length > 0 ? (
          <AboutClassicBlock blockKey="strengths" label={t('Strengths')} {...blockProps}>
            <AboutClassicKeywordList items={strengthLabels} ink={subtitleColor} bodyClass={bodyClass} />
          </AboutClassicBlock>
        ) : null}

        {showSystemsTools && toolLabels.length > 0 ? (
          <AboutClassicBlock blockKey="systems" label={t('Systems & tools')} {...blockProps}>
            <AboutClassicKeywordList items={toolLabels} ink={subtitleColor} bodyClass={bodyClass} />
          </AboutClassicBlock>
        ) : null}
      </div>
    </div>
  );
}
