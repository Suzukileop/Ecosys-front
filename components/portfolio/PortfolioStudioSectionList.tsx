'use client';

import type { ReactNode } from 'react';
import { portfolioPresenceShowsAboutUs } from '@/components/portfolio/portfolio-presence';
import { resolvePortfolioContentSectionOrder } from '@/components/portfolio/portfolio-services-block-settings';
import {
  PORTFOLIO_SETTINGS_SECTIONS,
  type PortfolioSettings,
  type PortfolioSettingsSectionId,
  type PortfolioSettingsSectionMeta,
} from '@/components/portfolio/portfolio-settings-types';
import { msg } from '@/lib/i18n/config';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * The studio's section list — the left pane of the three-pane editor (structure · preview · settings),
 * and, below lg, the first screen of the settings panel (list → section, with a way back).
 *
 * Kept out of PortfolioSettingsModal on purpose: that module is downloaded on demand, while this list
 * is on screen as soon as Settings opens.
 */

/** Same session key the settings panel has always used, so the open section survives a reload. */
const ACTIVE_SECTION_STORAGE_KEY = 'portfolio-settings-active-section';

/** Sections that style the whole site rather than one block of the page. */
const SITE_SECTION_IDS: readonly PortfolioSettingsSectionId[] = ['theme', 'navigation', 'footer'];

function isPortfolioSettingsSectionId(value: string): value is PortfolioSettingsSectionId {
  return PORTFOLIO_SETTINGS_SECTIONS.some((section) => section.id === value);
}

export function readStoredPortfolioSettingsSection(): PortfolioSettingsSectionId {
  if (typeof window === 'undefined') return 'theme';
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(ACTIVE_SECTION_STORAGE_KEY);
  } catch {
    return 'theme';
  }
  // Legacy ids (Infos / Why choose me / About → Hero; Skills → Tools).
  if (stored === 'about' || stored === 'infos' || stored === 'whyChooseMe') return 'hero';
  if (stored === 'skills') return 'tools';
  if (stored && isPortfolioSettingsSectionId(stored)) return stored;
  return 'theme';
}

export function storePortfolioSettingsSection(sectionId: PortfolioSettingsSectionId) {
  try {
    window.sessionStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, sectionId);
  } catch {
    /* ignore */
  }
}

/**
 * The sections the studio offers, in the page's own order: Global, Navigation and Hero lead, then the
 * content sections in the order picked under Global → Section display order, then Footer. About us is
 * offered only by the formats that show it.
 */
export function getVisiblePortfolioSettingsSections(
  global: Pick<PortfolioSettings['global'], 'presenceKind' | 'sectionOrder'>
): PortfolioSettingsSectionMeta[] {
  const filtered = PORTFOLIO_SETTINGS_SECTIONS.filter(
    (section) => section.id !== 'aboutUs' || portfolioPresenceShowsAboutUs(global.presenceKind)
  );
  const contentOrder = resolvePortfolioContentSectionOrder(global.sectionOrder);
  const contentRank = new Map(contentOrder.map((key, index) => [key as string, index]));
  const leadingRank: Partial<Record<PortfolioSettingsSectionId, number>> = { theme: -3, navigation: -2, hero: -1 };
  return [...filtered].sort((a, b) => {
    const rankA = leadingRank[a.id] ?? contentRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const rankB = leadingRank[b.id] ?? contentRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return rankA - rankB;
  });
}

/** "Site" (what styles every page: Global, Navigation, Footer), then "Page" (its blocks, in order). */
export function groupPortfolioStudioSections(sections: PortfolioSettingsSectionMeta[]) {
  return [
    { title: 'Site', sections: sections.filter((section) => SITE_SECTION_IDS.includes(section.id)) },
    { title: 'Page', sections: sections.filter((section) => !SITE_SECTION_IDS.includes(section.id)) },
  ].filter((group) => group.sections.length > 0);
}

/**
 * One glyph per section, on the site's 24-unit grid and 1.75 stroke (the News / editor rail glyphs):
 * fifteen rows read faster with a shape to catch the eye, and the editor's own Sections rail has them.
 */
const SECTION_GLYPHS: Partial<Record<PortfolioSettingsSectionId, ReactNode>> = {
  /* Global: sliders. */
  theme: <path d="M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4" />,
  /* Navigation: a bar with links. */
  navigation: (
    <>
      <rect x="3" y="5" width="18" height="5" rx="1.5" />
      <path d="M6 15h12M6 19h8" />
    </>
  ),
  /* Footer: a page with its foot filled. */
  footer: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 15h16" />
    </>
  ),
  /* Hero: a headline over a wide block. */
  hero: (
    <>
      <rect x="3" y="4" width="18" height="11" rx="2" />
      <path d="M7 19h10" />
    </>
  ),
  /* Stack: layers. */
  stack: (
    <>
      <path d="m12 4 8.5 4.5L12 13 3.5 8.5z" />
      <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
    </>
  ),
  /* Info: an i in a circle. */
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  /* Portfolio: a folder. */
  work: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  /* Tools: a wrench. */
  tools: <path d="M14.5 6.5a4 4 0 0 0 4.9 4.9L20 12l-8 8a2.1 2.1 0 0 1-3-3l8-8 .6-.6a4 4 0 0 0-3.1-1.9z" />,
  /* Services: a briefcase. */
  services: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18" />
    </>
  ),
  /* About us: a building. */
  aboutUs: (
    <>
      <path d="M5 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M15 9h3a1 1 0 0 1 1 1v10M3 20h18" />
      <path d="M8.5 8h3M8.5 12h3M8.5 16h3" />
    </>
  ),
  /* Experience: a timeline. */
  experience: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <path d="M6 8v8M11 6h9M11 18h9M11 12h6" />
    </>
  ),
  /* Team: two people. */
  team: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.8a3 3 0 0 1 0 5.4M17.5 14a5.5 5.5 0 0 1 3 5" />
    </>
  ),
  /* Gallery: a picture. */
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.75" />
      <path d="m21 15.5-5-5L5 20" />
    </>
  ),
  /* FAQ: a question mark in a circle. */
  faq: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5M12 17h.01" />
    </>
  ),
  /* Contact: an envelope. */
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

function SectionGlyph({ id, active }: { id: PortfolioSettingsSectionId; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {SECTION_GLYPHS[id] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}

type Tone = 'chrome' | 'palette';

/*
 * Two tones: `chrome` — the studio's own black & white (the left pane, beside the preview's bar);
 * `palette` — the settings panel's colours (the portfolio palette's CSS variables), for the list shown
 * inside it below lg.
 */
const TONE: Record<Tone, { title: string; kicker: string; row: string; idle: string; active: string; rule: string }> = {
  chrome: {
    title: 'text-[#0F1419] dark:text-[#E7E9EA]',
    rule: 'bg-[#EBEFF1] dark:bg-[#1F2226]',
    kicker: 'text-[#536471] dark:text-[#71767B]',
    row: 'hover:bg-[rgba(15,20,25,0.06)] focus-visible:ring-[#0F1419]/35 dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:ring-[#E7E9EA]/45',
    idle: 'font-medium text-[#0F1419] dark:text-[#E7E9EA]',
    active: 'font-bold text-[#0F1419] dark:text-[#E7E9EA]',
  },
  palette: {
    title: 'text-[color:var(--pf-palette-texte-fort)]',
    rule: 'bg-[color:var(--pf-palette-bordure)]',
    kicker: 'text-[color:var(--pf-palette-texte-muted)]',
    row: 'hover:bg-[color:var(--pf-palette-neutre)] focus-visible:ring-[color:var(--pf-palette-texte-fort)]',
    idle: 'font-medium text-[color:var(--pf-palette-texte-fort)]',
    active: 'font-bold text-[color:var(--pf-palette-texte-fort)]',
  },
};

export function PortfolioStudioSectionList({
  sections,
  activeId,
  onSelect,
  hoverEdit = false,
  onHoverEditChange,
  tone = 'chrome',
  variant = 'rail',
}: {
  sections: PortfolioSettingsSectionMeta[];
  activeId: PortfolioSettingsSectionId;
  onSelect: (sectionId: PortfolioSettingsSectionId) => void;
  /** The preview's hover-to-edit (blue outline + click opens a section); the switch shows when settable. */
  hoverEdit?: boolean;
  onHoverEditChange?: (enabled: boolean) => void;
  tone?: Tone;
  /** `toolbar`: compact editor rail. `rail`: full list. `drill`: mobile list with chevrons. */
  variant?: 'toolbar' | 'rail' | 'drill';
}) {
  const toneClass = TONE[tone];
  const t = useT();

  if (variant === 'toolbar') {
    return (
      <nav
        aria-label={t('Portfolio sections')}
        className="portfolio-studio-section-toolbar flex h-full min-h-0 w-full touch-pan-y flex-col overflow-y-auto overscroll-y-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groupPortfolioStudioSections(sections).map((group, groupIndex) => (
          <div
            key={group.title}
            className={`portfolio-studio-toolbar-group flex shrink-0 flex-col px-2 pb-2 ${groupIndex > 0 ? 'mt-1 border-t border-neutral-200 pt-3 dark:border-neutral-800' : 'pt-3'}`}
          >
            <p className="mb-1 px-2 text-[10px] font-medium uppercase leading-3 tracking-[0.16em] text-neutral-500 dark:text-neutral-500">
              {t(group.title)}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.sections.map((section) => {
                const active = section.id === activeId;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSelect(section.id)}
                    aria-current={active ? 'true' : undefined}
                    title={t(section.label)}
                    className={`group flex min-h-[58px] w-full flex-col items-center justify-center gap-1 rounded-[10px] px-1 py-1.5 text-center transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4C9AFF] [&>svg]:h-5 [&>svg]:w-5 ${
                      active
                        ? 'bg-neutral-200 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <SectionGlyph id={section.id} active={active} />
                    <span className="line-clamp-2 max-w-full text-[11px] font-medium leading-[1.15]">
                      {t(section.label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label={t('Portfolio sections')} className="flex flex-col pb-4">
      {/* The rail's title, as the editor's "Sections" box; the drill-down list has it in its header. */}
      {variant === 'rail' ? (
        <h2 className={`px-5 pb-1 pt-2 text-[20px] font-extrabold leading-6 tracking-[-0.01em] ${toneClass.title}`}>{t('Sections')}</h2>
      ) : null}
      {groupPortfolioStudioSections(sections).map((group) => (
        <div key={group.title} className="flex flex-col pt-5 first:pt-3">
          <p className={`px-5 pb-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] ${toneClass.kicker}`}>{t(group.title)}</p>
          {group.sections.map((section) => {
            const active = variant === 'rail' && section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={active ? 'true' : undefined}
                className={`mx-2 flex h-11 items-center gap-3.5 rounded-full px-3 text-left text-[15px] leading-5 transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset ${toneClass.row} ${
                  active ? toneClass.active : toneClass.idle
                }`}
              >
                <SectionGlyph id={section.id} active={active} />
                <span className="min-w-0 flex-1 truncate">{t(section.label)}</span>
                {active ? (
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                ) : variant === 'drill' ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
      {onHoverEditChange ? (
        <>
          <div className={`mx-5 mb-2 mt-5 h-px ${toneClass.rule}`} aria-hidden />
          {/* One switch for every section: the blue outline on hover and click-to-edit in the preview. */}
          <button
            type="button"
            role="switch"
            aria-checked={hoverEdit}
            onClick={() => onHoverEditChange(!hoverEdit)}
            className={`mx-2 flex min-h-11 items-center gap-3.5 rounded-full px-3 py-2 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset ${toneClass.row}`}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${toneClass.title}`} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3.5" y="3.5" width="17" height="17" rx="2" strokeDasharray="3 2.5" />
              <path d="m11 10 6 2.5-2.6 1 1.6 2.9-1.3.7-1.6-2.9-2.1 1.8z" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className={`block text-[15px] font-medium leading-5 ${toneClass.title}`}>{t('Hover to edit')}</span>
              <span className={`block text-[12px] leading-4 ${toneClass.kicker}`}>{t('Outline sections, click to open')}</span>
            </span>
            <span
              aria-hidden
              className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                hoverEdit ? 'bg-[#1D9BF0]' : 'bg-[#AAB8C2] dark:bg-[#3E4144]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,20,25,0.2)] transition-[left] ${
                  hoverEdit ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </span>
          </button>
        </>
      ) : null}
    </nav>
  );
}
