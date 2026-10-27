import type { PortfolioTeamPresentationSettings } from './portfolio-team-settings';

const VEIL_KEYS = {
  profileCardsView: 'hoverVeilView', profileCardsColumns: 'hoverVeilColumns',
  profileCardsRatio: 'hoverVeilRatio', profileCardsGutter: 'hoverVeilGutter',
  profileCardsPanel: 'hoverVeilPanel', profileCardsVisible: 'hoverVeilVisible',
  profileCardsStagger: 'hoverVeilStagger', profileCardsShowNumbers: 'hoverVeilShowNumbers',
} as const;

/** Reuse the tested gallery controls while keeping each design's saved settings independent. */
export function teamHoverVeilPresentation<T extends PortfolioTeamPresentationSettings>(team: T): T {
  return { ...team,
    profileCardsView: team.hoverVeilView ?? 'grid', profileCardsColumns: team.hoverVeilColumns ?? 3,
    profileCardsRatio: team.hoverVeilRatio ?? 'soft', profileCardsGutter: team.hoverVeilGutter ?? 'md',
    profileCardsPanel: team.hoverVeilPanel ?? 'hover', profileCardsVisible: team.hoverVeilVisible ?? 'all',
    profileCardsStagger: team.hoverVeilStagger ?? false, profileCardsShowNumbers: team.hoverVeilShowNumbers ?? true,
  };
}

export function teamProfilePatchToHoverVeil(patch: Partial<PortfolioTeamPresentationSettings>): Partial<PortfolioTeamPresentationSettings> {
  return Object.fromEntries(Object.entries(patch).map(([key, value]) => [VEIL_KEYS[key as keyof typeof VEIL_KEYS] ?? key, value]));
}
