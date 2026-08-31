import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';

export type PortfolioInfoPresentationSettings = PortfolioSectionBackgroundSettings;

export type PortfolioInfoSectionSettings = PortfolioSectionCopy & PortfolioInfoPresentationSettings;

export const DEFAULT_INFO_PRESENTATION: PortfolioInfoPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
};

export function pickInfoPresentationSettings(
  settings: PortfolioInfoSectionSettings
): PortfolioInfoPresentationSettings {
  const {
    enabled: _enabled,
    title: _title,
    subtitle: _subtitle,
    ...presentation
  } = settings;
  void _enabled;
  void _title;
  void _subtitle;
  return presentation;
}

export function mergeInfoPresentation(
  base: PortfolioInfoPresentationSettings,
  patch: unknown
): PortfolioInfoPresentationSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ...base };
  }
  return {
    ...base,
    ...mergeSectionBackground(base, patch as Record<string, unknown>),
  };
}
