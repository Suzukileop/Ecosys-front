import type {
  PortfolioNavTriZoneSocialLinkGap,
  PortfolioNavTriZoneSocialLinkSize,
} from '@/components/portfolio/portfolio-settings-types';

export const PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_SIZE_OPTIONS: {
  value: PortfolioNavTriZoneSocialLinkSize;
  label: string;
}[] = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export const PORTFOLIO_NAV_TRI_ZONE_SOCIAL_LINK_GAP_OPTIONS: {
  value: PortfolioNavTriZoneSocialLinkGap;
  label: string;
}[] = [
  { value: 'sm', label: 'Serré' },
  { value: 'md', label: 'Normal' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Très large' },
];

export function portfolioNavTriZoneSocialLinkGapClass(
  gap: PortfolioNavTriZoneSocialLinkGap = 'md'
): string {
  const map: Record<PortfolioNavTriZoneSocialLinkGap, string> = {
    sm: 'gap-2',
    md: 'gap-3.5',
    lg: 'gap-5',
    xl: 'gap-7',
  };
  return map[gap] ?? map.md;
}

export type LinkBrandIconVisualSize = 'xs' | 'sm' | 'md' | 'lg' | 'card' | 'nav' | 'compact';

export function resolveLinkBrandIconMetrics(size: LinkBrandIconVisualSize = 'md') {
  const normalized: 'xs' | 'sm' | 'md' | 'lg' =
    size === 'compact' ? 'sm' : size === 'nav' ? 'md' : size === 'card' ? 'lg' : size;
  switch (normalized) {
    case 'xs':
      return { shell: 'h-7 w-7', glyph: 'h-3.5 w-3.5', facebook: 'h-5 w-5' };
    case 'sm':
      return { shell: 'h-8 w-8', glyph: 'h-4 w-4', facebook: 'h-6 w-6' };
    case 'lg':
      return { shell: 'h-12 w-12', glyph: 'h-7 w-7', facebook: 'h-11 w-11' };
    case 'md':
    default:
      return { shell: 'h-10 w-10', glyph: 'h-5 w-5', facebook: 'h-9 w-9' };
  }
}
