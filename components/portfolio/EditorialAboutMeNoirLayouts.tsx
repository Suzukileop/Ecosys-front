'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { LanguageProficiencyLevel, ProfileEducationEntry, ProfileSkillEntry } from '@/types/ecosystem';
import type { PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import {
  terminalHeadingSizeClass,
  terminalShellSizeClass,
  type PortfolioInfoPremiumFontSize,
} from '@/components/portfolio/portfolio-info-settings';
import {
  resolveSpokenLanguageLevelLabel,
  spokenLanguageMatchKey,
} from '@/lib/spoken-languages';

type LanguageDisplayItem = {
  name: string;
  level?: LanguageProficiencyLevel | null;
};

type InfoColors = {
  accent: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  cardBg: string;
  cardBorder: string;
};

const MAC_WINDOW_DOT = {
  close: '#ff5f56',
  minimize: '#febc2e',
  maximize: '#28c840',
} as const;

function terminalSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const TERMINAL_LANG_CODES: Record<string, string> = {
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

/** Two-letter language code for a spoken-language name — shared with the About · noir layout. */
export function terminalLanguageCode(name: string): string {
  const trimmed = name.trim();
  const key = spokenLanguageMatchKey(trimmed);
  if (TERMINAL_LANG_CODES[key]) return TERMINAL_LANG_CODES[key];
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();
  const locale = trimmed.match(/^([a-z]{2})[-_][a-z]{2}$/i);
  if (locale) return locale[1].toUpperCase();
  const latin = trimmed.replace(/[^a-zA-Z]/g, '');
  if (latin.length >= 2) return latin.slice(0, 2).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

function commandTypeDuration(command: string): string {
  return `${Math.min(0.68, 0.24 + command.length * 0.026)}s`;
}

function TerminalPrompt({
  command,
  index,
  accent,
  bodyColor,
}: {
  command: string;
  index: number;
  accent: string;
  bodyColor: string;
}) {
  return (
    <p
      className="pf-about-terminal-prompt mb-5 font-mono text-sm tracking-[0.02em] sm:text-[15px]"
      style={{
        color: bodyColor,
        opacity: 0.55,
        ['--pf-about-terminal-i' as string]: index,
      }}
    >
      <span className="pf-about-terminal-path mr-2" aria-hidden>
        ~
      </span>
      <span className="pf-about-terminal-ps1" style={{ color: accent }}>
        $
      </span>{' '}
      <span
        className="pf-about-terminal-cmd"
        style={{
          ['--pf-about-terminal-ch' as string]: `${Math.max(command.length, 8)}ch`,
          ['--pf-about-terminal-type-dur' as string]: commandTypeDuration(command),
        }}
      >
        {command}
      </span>
    </p>
  );
}

function TerminalCaret({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden
      className="pf-about-terminal-caret ml-0.5 inline-block h-[17px] w-[7px] align-[-2px] sm:h-[19px] sm:w-2"
      style={{ backgroundColor: accent }}
    />
  );
}

function TerminalSection({
  children,
  index,
  first = false,
}: {
  children: ReactNode;
  cardBorder?: string;
  index: number;
  first?: boolean;
}) {
  return (
    <div
      className={
        first
          ? 'pf-about-terminal-block'
          : 'pf-about-terminal-block pf-about-terminal-block--cascade'
      }
      style={{
        ['--pf-about-terminal-i' as string]: index,
      }}
    >
      {children}
    </div>
  );
}

function TerminalSkillEntry({
  name,
  description,
  nameColor,
  bodyColor,
  accent,
  index,
}: {
  name: string;
  description: string;
  nameColor: string;
  bodyColor: string;
  accent: string;
  index: number;
}) {
  const note = description.trim().replace(/\s+/g, ' ');

  return (
    <div
      className="pf-about-terminal-item"
      style={{ ['--pf-about-terminal-j' as string]: Math.min(index, 8) }}
    >
      <p className="text-base font-medium leading-snug sm:text-[17px]" style={{ color: nameColor }}>
        <span className="mr-2 font-mono" style={{ color: accent }}>
          ›
        </span>
        {name}
      </p>
      {note ? (
        <p
          className="pf-about-terminal-comment mt-2 pl-4 font-mono text-[13px] leading-relaxed sm:text-sm"
          style={{ color: bodyColor, opacity: 0.55 }}
        >
          <span style={{ color: accent, opacity: 0.55 }}>{'// '}</span>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function TerminalListEntry({
  label,
  nameColor,
  accent,
  index,
}: {
  label: string;
  nameColor: string;
  accent: string;
  index: number;
}) {
  return (
    <p
      className="pf-about-terminal-item text-base font-medium leading-snug sm:text-[17px]"
      style={{
        color: nameColor,
        ['--pf-about-terminal-j' as string]: Math.min(index, 8),
      }}
    >
      <span className="mr-2 font-mono" style={{ color: accent }}>
        ›
      </span>
      {label}
    </p>
  );
}

function TerminalLanguageRow({
  name,
  level,
  nameColor,
  noteColor,
  accent,
  index,
}: {
  name: string;
  level?: LanguageProficiencyLevel | null;
  nameColor: string;
  noteColor: string;
  accent: string;
  index: number;
}) {
  const code = terminalLanguageCode(name);
  const levelLabel = level ? resolveSpokenLanguageLevelLabel(level) : null;

  return (
    <li
      className="pf-about-terminal-item pf-about-terminal-lang"
      style={{ ['--pf-about-terminal-j' as string]: Math.min(index, 8) }}
    >
      <span className="pf-about-terminal-lang-code" style={{ color: accent }}>
        {code}
      </span>
      <span className="pf-about-terminal-lang-name" style={{ color: nameColor }}>
        {name}
      </span>
      {levelLabel ? (
        <span className="pf-about-terminal-lang-level" style={{ color: noteColor }}>
          ({levelLabel})
        </span>
      ) : null}
    </li>
  );
}

function terminalScrollbarColors(
  colorMode: 'light' | 'dark',
  cardBorder: string,
  bodyColor: string
): { thumb: string; thumbHover: string } {
  if (colorMode === 'light') {
    return {
      thumb: `color-mix(in srgb, ${cardBorder} 40%, #c4c4c4)`,
      thumbHover: `color-mix(in srgb, ${cardBorder} 60%, #8a8a8a)`,
    };
  }

  return {
    thumb: `color-mix(in srgb, ${cardBorder} 72%, ${bodyColor})`,
    thumbHover: `color-mix(in srgb, ${cardBorder} 88%, ${bodyColor})`,
  };
}

/** Dev-console aesthetic — palette-driven shell, typographic locale rows. */
export function AboutTerminalLayout({
  title,
  subtitle,
  fullName,
  bio,
  educationItems,
  skillItems,
  strengthItems,
  interestItems,
  toolItems,
  languageItems,
  showEducation,
  showSkills,
  showStrengths,
  showInterests,
  showLanguages,
  showSystemsTools,
  showLanguageFlags: _showLanguageFlags = true,
  languageLevelStyle: _languageLevelStyle = 'progress-bar',
  contentSize = 'medium',
  colorMode = 'dark',
  accent,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
  className,
}: {
  title: string;
  subtitle?: string | null;
  fullName?: string | null;
  bio?: string | null;
  educationItems: ProfileEducationEntry[];
  skillItems: ProfileSkillEntry[];
  strengthItems: string[];
  interestItems: string[];
  toolItems: string[];
  languageItems: LanguageDisplayItem[];
  showEducation: boolean;
  showSkills: boolean;
  showStrengths: boolean;
  showInterests: boolean;
  showLanguages: boolean;
  showSystemsTools: boolean;
  showLanguageFlags?: boolean;
  languageLevelStyle?: PortfolioInfoLanguageLevelDisplayStyle;
  contentSize?: PortfolioInfoPremiumFontSize;
  colorMode?: 'light' | 'dark';
  className?: string;
} & InfoColors) {
  const headerLabel = fullName?.trim() || title.trim();
  const roleLabel = subtitle?.trim() || title.trim();
  const showRole = roleLabel.length > 0 && roleLabel !== headerLabel;
  const fileSlug = terminalSlug(title || fullName || 'about-me');
  const bioText = bio?.trim().replace(/\s+/g, ' ') ?? '';
  const shellClass = terminalShellSizeClass(contentSize);
  const headingClass = terminalHeadingSizeClass(contentSize);

  const visibleSkills = skillItems.filter((item) => item.title?.trim());
  const visibleStrengths = strengthItems.map((item) => item.trim()).filter(Boolean);
  const visibleInterests = interestItems.map((item) => item.trim()).filter(Boolean);
  const visibleTools = toolItems.map((item) => item.trim()).filter(Boolean);
  const visibleEducation = educationItems.filter(
    (entry) => entry.title?.trim() || entry.institution?.trim() || entry.schoolYear?.trim()
  );

  const faintColor = bodyColor;
  const scrollColors = terminalScrollbarColors(colorMode, cardBorder, bodyColor);
  const showSkillsBlock = showSkills && visibleSkills.length > 0;
  const showStrengthsBlock = showStrengths && visibleStrengths.length > 0;
  const showInterestsBlock = showInterests && visibleInterests.length > 0;
  const showLanguagesBlock = showLanguages && languageItems.length > 0;
  const showToolsBlock = showSystemsTools && visibleTools.length > 0;
  const showEducationBlock = showEducation && visibleEducation.length > 0;

  const blockKeys = [
    'header',
    bioText ? 'bio' : null,
    showSkillsBlock ? 'skills' : null,
    showStrengthsBlock ? 'strengths' : null,
    showInterestsBlock ? 'interests' : null,
    showLanguagesBlock ? 'languages' : null,
    showToolsBlock ? 'tools' : null,
    showEducationBlock ? 'education' : null,
  ].filter((key): key is string => Boolean(key));
  const blockIndex = (key: string) => Math.max(0, blockKeys.indexOf(key));
  const blockCount = blockKeys.length;

  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (reduceMotion) return undefined;

    const node = rootRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const entryState = reduceMotion || entered ? 'in' : 'armed';
  const titlebarFill =
    colorMode === 'dark'
      ? `color-mix(in srgb, ${cardBg} 82%, #000)`
      : `color-mix(in srgb, ${cardBg} 88%, #fff)`;
  const statusFill =
    colorMode === 'dark'
      ? `color-mix(in srgb, ${cardBg} 78%, #000)`
      : `color-mix(in srgb, ${cardBg} 92%, #f3f3f3)`;
  const insetHighlight =
    colorMode === 'dark'
      ? 'inset 0 1px 0 rgba(255,255,255,0.06)'
      : 'inset 0 1px 0 rgba(255,255,255,0.72)';
  const shellShadow =
    colorMode === 'dark'
      ? `0 0 0 1px color-mix(in srgb, ${accent} 16%, ${cardBorder}), 0 28px 80px -36px rgba(0,0,0,0.62), ${insetHighlight}`
      : `0 0 0 1px color-mix(in srgb, ${accent} 12%, ${cardBorder}), 0 24px 64px -32px rgba(15,15,15,0.18), ${insetHighlight}`;

  return (
    <div
      ref={rootRef}
      className={`pf-about-terminal mx-auto w-full max-w-[760px] lg:max-w-[960px] xl:max-w-[1080px] ${shellClass}${className ? ` ${className}` : ''}`}
      data-pf-entry={entryState}
      data-pf-terminal-mode={colorMode}
      style={{
        ['--pf-about-terminal-accent' as string]: accent,
        ['--pf-about-terminal-border' as string]: cardBorder,
        ['--pf-about-terminal-body' as string]: bodyColor,
        ['--pf-about-terminal-scan' as string]: bodyColor,
      }}
    >
      <div
        className="pf-about-terminal-shell flex max-h-[min(88vh,960px)] flex-col overflow-hidden rounded-[8px] border lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+0.875rem)] lg:z-20 lg:max-h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-1.75rem)]"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
          boxShadow: shellShadow,
        }}
        role="region"
        aria-label={headerLabel ? `About ${headerLabel}` : 'About'}
      >
        <div
          className="pf-about-terminal-titlebar flex shrink-0 items-center gap-3 px-3 py-0 sm:gap-3.5 sm:px-3.5"
          style={{
            borderBottom: `1px solid ${cardBorder}`,
            backgroundColor: titlebarFill,
          }}
        >
          <div className="pf-about-terminal-chrome-item flex shrink-0 gap-[6px] pl-1.5" aria-hidden>
            <span
              className="pf-about-terminal-dot h-2 w-2 rounded-full sm:h-[9px] sm:w-[9px]"
              style={{ backgroundColor: MAC_WINDOW_DOT.close }}
            />
            <span
              className="pf-about-terminal-dot h-2 w-2 rounded-full sm:h-[9px] sm:w-[9px]"
              style={{ backgroundColor: MAC_WINDOW_DOT.minimize }}
            />
            <span
              className="pf-about-terminal-dot h-2 w-2 rounded-full sm:h-[9px] sm:w-[9px]"
              style={{ backgroundColor: MAC_WINDOW_DOT.maximize }}
            />
          </div>

          <div className="pf-about-terminal-chrome-item pf-about-terminal-tab relative flex min-h-[42px] min-w-0 flex-1 items-center">
            <span
              className="flex min-w-0 items-center gap-2 px-3 py-2 font-mono text-[12px] tracking-[0.01em] sm:text-[13px]"
              style={{ color: faintColor, opacity: 0.72 }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <span className="truncate">~/profile/{fileSlug}.md</span>
            </span>
          </div>

          <p
            className="pf-about-terminal-chrome-item hidden shrink-0 font-mono text-[11px] tracking-[0.08em] uppercase sm:block"
            style={{ color: faintColor, opacity: 0.42 }}
          >
            zsh · utf-8
          </p>
        </div>

        <div className="pf-about-terminal-viewport relative flex min-h-0 flex-1 flex-col">
          <div className="pf-about-terminal-scan" aria-hidden />
          <div
            className="terminal-panel-scroll pf-about-terminal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-[26px] py-10 sm:px-[52px] sm:py-14 lg:px-16 lg:py-16 xl:px-[72px]"
            style={{
              color: bodyColor,
              ['--terminal-scroll-thumb' as string]: scrollColors.thumb,
              ['--terminal-scroll-thumb-hover' as string]: scrollColors.thumbHover,
            }}
          >
            <p
              className="pf-about-terminal-boot mb-8 font-mono text-[12px] tracking-[0.04em] sm:text-[13px]"
              style={{ color: faintColor, opacity: 0.42 }}
            >
              {`// init · profile.session · ${blockCount} blk`}
            </p>

            <TerminalSection cardBorder={cardBorder} index={blockIndex('header')} first>
              <TerminalPrompt
                command="cat header.txt"
                index={blockIndex('header')}
                accent={accent}
                bodyColor={bodyColor}
              />
              <div className="pf-about-terminal-output">
                <h2
                  className={`pf-about-terminal-name leading-[1.12] ${headingClass} font-medium`}
                  style={{ color: subtitleColor }}
                >
                  {headerLabel}
                </h2>
                {showRole ? (
                  <p className="mt-3 font-mono text-sm sm:text-[15px]" style={{ color: accent }}>
                    {roleLabel}
                  </p>
                ) : null}
              </div>
            </TerminalSection>

            {bioText ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('bio')}>
                <TerminalPrompt
                  command="cat bio.txt"
                  index={blockIndex('bio')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <p
                  className="pf-about-terminal-output pf-about-terminal-bio max-w-[56ch] text-lg leading-[1.75] sm:text-xl"
                  style={{ color: bodyColor, opacity: 0.88 }}
                >
                  {bioText}
                </p>
              </TerminalSection>
            ) : null}

            {showSkillsBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('skills')}>
                <TerminalPrompt
                  command="skills --list"
                  index={blockIndex('skills')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <div className="pf-about-terminal-output space-y-7">
                  {visibleSkills.map((skill, index) => (
                    <TerminalSkillEntry
                      key={skill.id || skill.title}
                      name={skill.title.trim()}
                      description={skill.description}
                      nameColor={subtitleColor}
                      bodyColor={bodyColor}
                      accent={accent}
                      index={index}
                    />
                  ))}
                </div>
              </TerminalSection>
            ) : null}

            {showStrengthsBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('strengths')}>
                <TerminalPrompt
                  command="strengths --list"
                  index={blockIndex('strengths')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <div className="pf-about-terminal-output space-y-4">
                  {visibleStrengths.map((item, index) => (
                    <TerminalListEntry
                      key={`${index}-${item}`}
                      label={item}
                      nameColor={subtitleColor}
                      accent={accent}
                      index={index}
                    />
                  ))}
                </div>
              </TerminalSection>
            ) : null}

            {showInterestsBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('interests')}>
                <TerminalPrompt
                  command="cat interests.txt"
                  index={blockIndex('interests')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <div className="pf-about-terminal-output space-y-4">
                  {visibleInterests.map((item, index) => (
                    <TerminalListEntry
                      key={`${index}-${item}`}
                      label={item}
                      nameColor={subtitleColor}
                      accent={accent}
                      index={index}
                    />
                  ))}
                </div>
              </TerminalSection>
            ) : null}

            {showLanguagesBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('languages')}>
                <TerminalPrompt
                  command="locale -a"
                  index={blockIndex('languages')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <ul className="pf-about-terminal-output pf-about-terminal-langs">
                  {languageItems.map((item, index) => (
                    <TerminalLanguageRow
                      key={item.name}
                      name={item.name}
                      level={item.level}
                      nameColor={subtitleColor}
                      noteColor={faintColor}
                      accent={accent}
                      index={index}
                    />
                  ))}
                </ul>
              </TerminalSection>
            ) : null}

            {showToolsBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('tools')}>
                <TerminalPrompt
                  command="which -a"
                  index={blockIndex('tools')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <div className="pf-about-terminal-output space-y-4">
                  {visibleTools.map((item, index) => (
                    <TerminalListEntry
                      key={`${index}-${item}`}
                      label={item}
                      nameColor={subtitleColor}
                      accent={accent}
                      index={index}
                    />
                  ))}
                </div>
              </TerminalSection>
            ) : null}

            {showEducationBlock ? (
              <TerminalSection cardBorder={cardBorder} index={blockIndex('education')}>
                <TerminalPrompt
                  command="cat education.log"
                  index={blockIndex('education')}
                  accent={accent}
                  bodyColor={bodyColor}
                />
                <div className="pf-about-terminal-output space-y-[22px]">
                  {visibleEducation.map((entry, index) => {
                    const year = entry.schoolYear?.trim() || '—';
                    const degree = entry.title?.trim() || '';
                    const institution = entry.institution?.trim() || '';
                    const key = entry.id || `${year}-${degree}-${institution}`;

                    return (
                      <div
                        key={key}
                        className="pf-about-terminal-item flex gap-[18px]"
                        style={{
                          ['--pf-about-terminal-j' as string]: Math.min(index, 8),
                        }}
                      >
                        <p
                          className="min-w-[100px] shrink-0 whitespace-nowrap pt-0.5 font-mono text-sm tabular-nums sm:min-w-[110px] sm:text-[15px]"
                          style={{ color: accent }}
                        >
                          {year}
                        </p>
                        <div
                          className="min-w-0 border-l pl-[18px]"
                          style={{ borderColor: cardBorder }}
                        >
                          {degree ? (
                            <p
                              className="text-base font-medium leading-snug sm:text-[17px]"
                              style={{ color: subtitleColor }}
                            >
                              {degree}
                            </p>
                          ) : null}
                          {institution ? (
                            <p
                              className="mt-1 text-sm leading-relaxed sm:text-[15px]"
                              style={{ color: bodyColor, opacity: 0.88 }}
                            >
                              {institution}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TerminalSection>
            ) : null}

            <div
              className="pf-about-terminal-idle border-t pt-8 font-mono text-sm sm:text-[15px]"
              style={{
                borderColor: cardBorder,
                color: faintColor,
                opacity: 0.55,
                ['--pf-about-terminal-i' as string]: blockCount,
              }}
            >
              <span className="pf-about-terminal-path mr-2" aria-hidden>
                ~
              </span>
              <span style={{ color: accent }}>$</span>
              <TerminalCaret accent={accent} />
            </div>
          </div>
        </div>

        <div
          className="pf-about-terminal-status flex shrink-0 items-center gap-3 px-4 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase sm:px-5 sm:text-[11px]"
          style={{
            borderTop: `1px solid ${cardBorder}`,
            backgroundColor: statusFill,
            color: faintColor,
          }}
        >
          <span className="flex items-center gap-1.5" style={{ color: accent }}>
            <span className="pf-about-terminal-live h-1.5 w-1.5 rounded-full" aria-hidden />
            ready
          </span>
          <span aria-hidden className="opacity-45">
            ·
          </span>
          <span className="opacity-45">utf-8</span>
          <span aria-hidden className="hidden opacity-45 sm:inline">
            ·
          </span>
          <span className="hidden truncate opacity-45 sm:inline">{fileSlug}.md</span>
          <span className="ml-auto tabular-nums opacity-45">{blockCount} blk</span>
        </div>
      </div>
    </div>
  );
}
