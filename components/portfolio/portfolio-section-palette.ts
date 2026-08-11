import type { PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';
import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioAboutPresentationSettings } from '@/components/portfolio/portfolio-about-settings';
import { applyAboutPaletteToSettings } from '@/components/portfolio/portfolio-about-palette-settings';
import type { PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_CONTACT_COLOR_BINDINGS,
  mergeContactColorBindings,
} from '@/components/portfolio/portfolio-contact-palette-settings';
import type { PortfolioExperiencePresentationSettings } from '@/components/portfolio/portfolio-experience-settings';
import { applyExperiencePaletteToSettings } from '@/components/portfolio/portfolio-experience-palette-settings';
import type { PortfolioFaqPresentationSettings } from '@/components/portfolio/portfolio-faq-settings';
import { applyFaqPaletteToSettings } from '@/components/portfolio/portfolio-faq-palette-settings';
import type { PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import { applyFooterPaletteToSettings } from '@/components/portfolio/portfolio-footer-palette-settings';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import { applyServicesPaletteToSettings } from '@/components/portfolio/portfolio-services-palette-settings';
import type { PortfolioWorkPresentationSettings } from '@/components/portfolio/portfolio-work-settings';
import { applyWorkPaletteToSettings } from '@/components/portfolio/portfolio-work-palette-settings';
import type { PortfolioTeamPresentationSettings } from '@/components/portfolio/portfolio-team-settings';
import { applyTeamPaletteToSettings } from '@/components/portfolio/portfolio-team-palette-settings';

/**
 * Per-section flag: when true, the section’s colors follow the Hero semantic
 * palette (defined only in Hero settings). When false, the section keeps its
 * own stored hex colors.
 */
export type PortfolioSectionPaletteLink = {
  useHeroPalette: boolean;
};

export const DEFAULT_SECTION_PALETTE_LINK: PortfolioSectionPaletteLink = {
  useHeroPalette: false,
};

export function mergeUseHeroPalette(base: boolean, record: Record<string, unknown>): boolean {
  return typeof record.useHeroPalette === 'boolean' ? record.useHeroPalette : base;
}

export function resolveHeroPaletteFromSettings(
  palette: PortfolioHeroPalette | undefined | null
): PortfolioHeroPalette {
  return mergeHeroPalette(DEFAULT_HERO_PALETTE, palette ?? undefined);
}

type ElementStyleMap = Record<string, PortfolioElementTextStyle>;

function paintElementColors<T extends ElementStyleMap>(
  styles: T,
  tokens: Partial<Record<keyof T & string, HeroPaletteTokenId>>,
  color: (token: HeroPaletteTokenId) => string
): T {
  const next = { ...styles };
  for (const [key, token] of Object.entries(tokens) as [keyof T & string, HeroPaletteTokenId][]) {
    if (!token || !next[key]) continue;
    next[key] = { ...next[key], color: color(token) };
  }
  return next;
}

function paintCardChrome<T extends {
  cardBorderColor?: string;
  cardBackgroundColor?: string;
  cardBackgroundColorA?: string;
  cardBackgroundColorB?: string;
  cardDividerColor?: string;
}>(
  frame: T,
  color: (token: HeroPaletteTokenId) => string
): T {
  return {
    ...frame,
    ...(frame.cardBorderColor !== undefined ? { cardBorderColor: color('bordure') } : {}),
    ...(frame.cardBackgroundColor !== undefined ? { cardBackgroundColor: color('neutre') } : {}),
    ...(frame.cardBackgroundColorA !== undefined ? { cardBackgroundColorA: color('neutre') } : {}),
    ...(frame.cardBackgroundColorB !== undefined ? { cardBackgroundColorB: color('fond') } : {}),
    ...(frame.cardDividerColor !== undefined ? { cardDividerColor: color('bordure') } : {}),
  };
}

/**
 * When the section opts in, paint concrete hex fields from the live Hero
 * palette — same contract as Services / About / FAQ. Work’s stored workPalette
 * stays as an editable mirror (Global color mode + Work → Palette keep it in sync).
 */
export function applyHeroPaletteToWork(
  presentation: PortfolioWorkPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioWorkPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const workPalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  return {
    ...presentation,
    ...(applyWorkPaletteToSettings({
      ...presentation,
      workPalette,
    }) as Partial<PortfolioWorkPresentationSettings>),
    workPalette,
    useHeroPalette: true,
  };
}

/**
 * When opted in, paint Services/Skills from the live Hero palette — same contract as About / FAQ.
 * Uses the Services palette module so bindings + card-surface contrast stay consistent.
 */
export function applyHeroPaletteToServices(
  presentation: PortfolioServicesPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioServicesPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const servicesPalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  return {
    ...presentation,
    ...(applyServicesPaletteToSettings({
      ...presentation,
      servicesPalette,
    }) as Partial<PortfolioServicesPresentationSettings>),
    servicesPalette,
    useHeroPalette: true,
  };
}

export function applyHeroPaletteToAbout(
  presentation: PortfolioAboutPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioAboutPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const aboutPalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  return {
    ...presentation,
    ...(applyAboutPaletteToSettings({
      ...presentation,
      aboutPalette,
    }) as Partial<PortfolioAboutPresentationSettings>),
    aboutPalette,
    useHeroPalette: true,
  };
}

export function applyHeroPaletteToExperience(
  presentation: PortfolioExperiencePresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioExperiencePresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const experiencePalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  const applied = {
    ...presentation,
    ...(applyExperiencePaletteToSettings({
      ...presentation,
      experiencePalette,
    }) as Partial<PortfolioExperiencePresentationSettings>),
    experiencePalette,
    useHeroPalette: true,
  };
  // Keep manual light/dark period-rule hex when the user opted out of palette follow.
  if (presentation.periodRuleFollowPalette === false) {
    return {
      ...applied,
      periodRuleFollowPalette: false,
      periodRuleColor: presentation.periodRuleColor,
      periodRuleColorDark: presentation.periodRuleColorDark,
    };
  }
  return applied;
}

export function applyHeroPaletteToFaq(
  presentation: PortfolioFaqPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioFaqPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const faqPalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  return {
    ...presentation,
    ...(applyFaqPaletteToSettings({
      ...presentation,
      faqPalette,
    }) as Partial<PortfolioFaqPresentationSettings>),
    faqPalette,
    useHeroPalette: true,
  };
}

export function applyHeroPaletteToTeam(
  presentation: PortfolioTeamPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioTeamPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const teamPalette = mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);
  return {
    ...presentation,
    ...(applyTeamPaletteToSettings({ ...presentation, teamPalette }) as Partial<PortfolioTeamPresentationSettings>),
    teamPalette,
    useHeroPalette: true,
  };
}

export function applyHeroPaletteToContact(
  presentation: PortfolioContactPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioContactPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;
  const color = (token: HeroPaletteTokenId) => resolveHeroPaletteColor(palette, token);
  const bindings = mergeContactColorBindings(
    DEFAULT_CONTACT_COLOR_BINDINGS,
    presentation.contactColorBindings
  );
  return {
    ...presentation,
    ...paintCardChrome(presentation, color),
    cardBackgroundEnabled: true,
    sectionBackgroundColor: color('fond'),
    sectionBackgroundGradientFrom: color('fond'),
    sectionBackgroundGradientTo: color('neutre'),
    sectionBackgroundColorA: color('fond'),
    sectionBackgroundColorB: color('neutre'),
    sectionBackgroundDividerColor: color('bordure'),
    titleColor: color('texteFort'),
    subtitleColor: color('texteMuted'),
    ctaColor: color(bindings.cta),
    iconColor: color(bindings.iconColor),
    iconBorderColor: color(bindings.iconBorder),
    // Empty keeps soft tint derived from CTA / principal in contactIconShellStyle.
    iconBackgroundColor: '',
    contactColorBindings: bindings,
    elementStyles: paintElementColors(presentation.elementStyles, {
      channelValue: 'texteFort',
      linksHeading: 'texteFaint',
      linkLabel: 'texteFort',
      linkUrl: 'texteMuted',
      locationValue: 'texteFort',
      ctaLabel: 'neutre',
    }, color),
  };
}

export function applyHeroPaletteToFooter(
  presentation: PortfolioFooterPresentationSettings,
  palette: PortfolioHeroPalette
): PortfolioFooterPresentationSettings {
  if (presentation.useHeroPalette === false) return presentation;

  // Locked: keep the snapshotted footer palette — ignore Global dark/light switches.
  const sourcePalette = presentation.lockPaletteAcrossColorModes
    ? mergeHeroPalette(DEFAULT_HERO_PALETTE, presentation.footerPalette)
    : mergeHeroPalette(DEFAULT_HERO_PALETTE, palette);

  return {
    ...presentation,
    ...(applyFooterPaletteToSettings({
      ...presentation,
      footerPalette: sourcePalette,
    }) as Partial<PortfolioFooterPresentationSettings>),
    footerPalette: sourcePalette,
    useHeroPalette: true,
  };
}
