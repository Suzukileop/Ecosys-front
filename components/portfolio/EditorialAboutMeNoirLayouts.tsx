'use client';

import type { ReactNode } from 'react';
import type { LanguageProficiencyLevel, ProfileEducationEntry, ProfileSkillEntry } from '@/types/ecosystem';
import { resolveToolLevelPercent } from '@/components/creator/studio/creator-tool-logo-color';
import {
  ToolsLevelGlowDots,
  ToolsLevelStarRating,
} from '@/components/portfolio/portfolio-tools-level-indicators';
import type { PortfolioInfoLanguageLevelDisplayStyle } from '@/components/portfolio/portfolio-info-settings';
import {
  terminalHeadingSizeClass,
  terminalShellSizeClass,
  type PortfolioInfoContentSize,
} from '@/components/portfolio/portfolio-info-settings';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { resolveSpokenLanguageFlagIso2, resolveSpokenLanguageLevelLabel } from '@/lib/spoken-languages';

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

function terminalLanguageBarPercent(level: LanguageProficiencyLevel | null | undefined): number {
  const percent = resolveToolLevelPercent(level);
  return percent > 0 ? percent : 40;
}

function TerminalPrompt({
  accent,
  bodyColor,
  children,
}: {
  accent: string;
  bodyColor: string;
  children: ReactNode;
}) {
  return (
    <p className="mb-5 font-mono text-sm tracking-[0.02em] sm:text-[15px]" style={{ color: bodyColor, opacity: 0.55 }}>
      <span style={{ color: accent }}>$</span> {children}
    </p>
  );
}

function TerminalCaret({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[19px] w-2.5 align-[-2px] motion-safe:animate-pulse sm:h-[21px] sm:w-[9px]"
      style={{ backgroundColor: accent }}
    />
  );
}

function TerminalProgressBar({
  percent,
  fillColor,
  trackColor,
}: {
  percent: number;
  fillColor: string;
  trackColor: string;
}) {
  return (
    <div
      className="h-[6px] overflow-hidden rounded-[3px] sm:h-[7px]"
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-[3px] transition-[width] duration-500 ease-out"
        style={{ width: `${percent}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}

function TerminalSection({
  children,
  cardBorder,
  first = false,
}: {
  children: ReactNode;
  cardBorder: string;
  first?: boolean;
}) {
  return (
    <div
      className={first ? undefined : 'mt-[52px] border-t pt-[52px]'}
      style={first ? undefined : { borderColor: cardBorder }}
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
}: {
  name: string;
  description: string;
  nameColor: string;
  bodyColor: string;
  accent: string;
}) {
  const note = description.trim().replace(/\s+/g, ' ');

  return (
    <div>
      <p className="text-base font-medium leading-snug sm:text-[17px]" style={{ color: nameColor }}>
        <span className="mr-2 font-mono" style={{ color: accent }}>
          ›
        </span>
        {name}
      </p>
      {note ? (
        <p
          className="mt-2 pl-4 font-mono text-[13px] leading-relaxed sm:text-sm"
          style={{ color: bodyColor, opacity: 0.55 }}
        >
          <span style={{ color: accent, opacity: 0.75 }}>// </span>
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
}: {
  label: string;
  nameColor: string;
  accent: string;
}) {
  return (
    <p className="text-base font-medium leading-snug sm:text-[17px]" style={{ color: nameColor }}>
      <span className="mr-2 font-mono" style={{ color: accent }}>
        ›
      </span>
      {label}
    </p>
  );
}

function TerminalLanguageLevel({
  name,
  level,
  style,
  accent,
  trackColor,
  noteColor,
}: {
  name: string;
  level?: LanguageProficiencyLevel | null;
  style: PortfolioInfoLanguageLevelDisplayStyle;
  accent: string;
  trackColor: string;
  noteColor: string;
}) {
  if (!level) return null;

  if (style === 'text') {
    const label = resolveSpokenLanguageLevelLabel(level);
    if (!label) return null;
    return (
      <span
        className="shrink-0 whitespace-nowrap font-mono text-xs sm:text-[13px]"
        style={{ color: noteColor, opacity: 0.55 }}
      >
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
        trackColor={trackColor}
        className="shrink-0"
      />
    );
  }

  if (style === 'stars') {
    return (
      <ToolsLevelStarRating
        level={level}
        toolName={name}
        fillColor={accent}
        trackColor={trackColor}
        className="shrink-0"
      />
    );
  }

  return null;
}

function TerminalLanguageRow({
  name,
  level,
  levelStyle,
  nameColor,
  noteColor,
  accent,
  trackColor,
  showFlag,
}: {
  name: string;
  level?: LanguageProficiencyLevel | null;
  levelStyle: PortfolioInfoLanguageLevelDisplayStyle;
  nameColor: string;
  noteColor: string;
  accent: string;
  trackColor: string;
  showFlag: boolean;
}) {
  const flagIso = showFlag ? resolveSpokenLanguageFlagIso2(name) : null;
  const showBar = levelStyle === 'progress-bar' && level;

  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-6">
        <span
          className="flex min-w-0 items-center gap-2 text-base font-medium leading-snug sm:text-[17px]"
          style={{ color: nameColor }}
        >
          {flagIso ? <CountryFlag iso2={flagIso} size="sm" className="shrink-0" /> : null}
          {name}
        </span>
        <TerminalLanguageLevel
          name={name}
          level={level}
          style={levelStyle}
          accent={accent}
          trackColor={trackColor}
          noteColor={noteColor}
        />
      </div>
      {showBar ? (
        <TerminalProgressBar
          percent={terminalLanguageBarPercent(level)}
          fillColor={accent}
          trackColor={trackColor}
        />
      ) : null}
    </div>
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

/** Dev-console aesthetic — palette-driven shell, skill list, language level bars. */
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
  showLanguageFlags = true,
  languageLevelStyle = 'progress-bar',
  contentSize = 'md',
  colorMode = 'dark',
  accent,
  subtitleColor,
  bodyColor,
  cardBg,
  cardBorder,
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
  contentSize?: PortfolioInfoContentSize;
  colorMode?: 'light' | 'dark';
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

  return (
    <div className={`mx-auto w-full max-w-[760px] lg:max-w-[960px] xl:max-w-[1080px] ${shellClass}`}>
      <div
        className="flex max-h-[min(88vh,960px)] flex-col overflow-hidden rounded-[10px] border lg:sticky lg:top-[calc(var(--portfolio-nav-top-clearance,5.5rem)+0.875rem)] lg:z-20 lg:max-h-[calc(100dvh-var(--portfolio-nav-top-clearance,5.5rem)-1.75rem)]"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
          boxShadow: '0 10px 32px -12px rgba(0,0,0,0.28)',
        }}
      >
        <div
          className="flex shrink-0 items-center gap-4 px-5 py-3.5"
          style={{
            borderBottom: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
          }}
        >
          <div className="flex gap-2" aria-hidden>
            <span
              className="h-[11px] w-[11px] rounded-full sm:h-3 sm:w-3"
              style={{ backgroundColor: MAC_WINDOW_DOT.close }}
            />
            <span
              className="h-[11px] w-[11px] rounded-full sm:h-3 sm:w-3"
              style={{ backgroundColor: MAC_WINDOW_DOT.minimize }}
            />
            <span
              className="h-[11px] w-[11px] rounded-full sm:h-3 sm:w-3"
              style={{ backgroundColor: MAC_WINDOW_DOT.maximize }}
            />
          </div>
          <span
            className="truncate font-mono text-sm sm:text-[15px]"
            style={{ color: faintColor, opacity: 0.55 }}
          >
            ~/profile/{fileSlug}.md
          </span>
        </div>

        <div
          className="terminal-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-[26px] py-10 sm:px-[52px] sm:py-14 lg:px-16 lg:py-16 xl:px-[72px]"
          style={{
            color: bodyColor,
            ['--terminal-scroll-thumb' as string]: scrollColors.thumb,
            ['--terminal-scroll-thumb-hover' as string]: scrollColors.thumbHover,
          }}
        >
          <TerminalSection cardBorder={cardBorder} first>
            <TerminalPrompt accent={accent} bodyColor={bodyColor}>
              cat header.txt
            </TerminalPrompt>
            <h2
              className={`font-sans font-semibold leading-[1.15] tracking-[-0.01em] ${headingClass}`}
              style={{ color: subtitleColor }}
            >
              {headerLabel}
          </h2>
            {showRole ? (
              <p className="mt-3 font-mono text-sm sm:text-[15px]" style={{ color: accent }}>
                {roleLabel}
              </p>
            ) : null}
          </TerminalSection>

          {bioText ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                cat bio.txt
              </TerminalPrompt>
              <p
                className="max-w-[62ch] text-lg leading-[1.75] sm:text-xl"
                style={{ color: bodyColor, opacity: 0.88 }}
              >
                {bioText}
                <TerminalCaret accent={accent} />
              </p>
            </TerminalSection>
          ) : null}

          {showSkills && visibleSkills.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                skills --list
              </TerminalPrompt>
              <div className="space-y-7">
                {visibleSkills.map((skill) => (
                  <TerminalSkillEntry
                    key={skill.id || skill.title}
                    name={skill.title.trim()}
                    description={skill.description}
                    nameColor={subtitleColor}
                    bodyColor={bodyColor}
                    accent={accent}
                  />
                ))}
              </div>
            </TerminalSection>
          ) : null}

          {showStrengths && visibleStrengths.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                strengths --list
              </TerminalPrompt>
              <div className="space-y-4">
                {visibleStrengths.map((item) => (
                  <TerminalListEntry
                    key={item}
                    label={item}
                    nameColor={subtitleColor}
                    accent={accent}
                  />
                ))}
              </div>
            </TerminalSection>
                    ) : null}

          {showInterests && visibleInterests.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                cat interests.txt
              </TerminalPrompt>
              <div className="space-y-4">
                {visibleInterests.map((item) => (
                  <TerminalListEntry
                    key={item}
                    label={item}
                    nameColor={subtitleColor}
                    accent={accent}
                  />
                ))}
            </div>
            </TerminalSection>
          ) : null}

          {showLanguages && languageItems.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                locale -a
              </TerminalPrompt>
              <div className="space-y-7">
                {languageItems.map((item) => (
                  <TerminalLanguageRow
                      key={item.name}
                    name={item.name}
                    level={item.level}
                    levelStyle={languageLevelStyle}
                    nameColor={subtitleColor}
                    noteColor={faintColor}
                    accent={accent}
                    trackColor={cardBorder}
                    showFlag={showLanguageFlags}
                  />
                ))}
              </div>
            </TerminalSection>
          ) : null}

          {showSystemsTools && visibleTools.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                which -a
              </TerminalPrompt>
              <div className="space-y-4">
                {visibleTools.map((item) => (
                  <TerminalListEntry
                    key={item}
                    label={item}
                    nameColor={subtitleColor}
                    accent={accent}
                  />
                ))}
            </div>
            </TerminalSection>
          ) : null}

          {showEducation && visibleEducation.length > 0 ? (
            <TerminalSection cardBorder={cardBorder}>
              <TerminalPrompt accent={accent} bodyColor={bodyColor}>
                cat education.log
              </TerminalPrompt>
              <div className="space-y-[22px]">
                {visibleEducation.map((entry) => {
                  const year = entry.schoolYear?.trim() || '—';
                  const degree = entry.title?.trim() || '';
                  const institution = entry.institution?.trim() || '';
                  const key = entry.id || `${year}-${degree}-${institution}`;

                  return (
                    <div key={key} className="flex gap-[18px]">
                      <p
                        className="min-w-[100px] shrink-0 whitespace-nowrap pt-0.5 font-mono text-sm sm:min-w-[110px] sm:text-[15px]"
                        style={{ color: accent }}
                      >
                        {year}
                      </p>
                      <div className="min-w-0">
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
            className="mt-[52px] border-t pt-8 font-mono text-sm sm:text-[15px]"
            style={{ borderColor: cardBorder, color: faintColor, opacity: 0.55 }}
          >
            <span style={{ color: accent }}>$</span>
            <TerminalCaret accent={accent} />
          </div>
        </div>
    </div>
    </div>
  );
}
