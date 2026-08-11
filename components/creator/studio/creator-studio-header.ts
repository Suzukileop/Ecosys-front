export type CreatorStudioHeaderLayout = 'BANNER' | 'SPLIT' | 'VIP_GOLD' | 'VIP_AURORA' | 'STAGE';

export const CREATOR_STUDIO_HEADER_LAYOUTS: {
  id: CreatorStudioHeaderLayout;
  label: string;
  description: string;
  premium?: boolean;
}[] = [
  {
    id: 'BANNER',
    label: 'Banner',
    description: 'Wide cover image with a circular avatar overlapping the banner.',
  },
  {
    id: 'SPLIT',
    label: 'Split card',
    description: 'Profile details on the left and your cover image on the right.',
  },
  {
    id: 'VIP_GOLD',
    label: 'VIP Gold',
    description: 'Luxury black & gold layout with shimmer border and cinematic cover.',
    premium: true,
  },
  {
    id: 'VIP_AURORA',
    label: 'VIP Aurora',
    description: 'Glassmorphism with animated aurora orbs and holographic accents.',
    premium: true,
  },
  {
    id: 'STAGE',
    label: 'Stage',
    description: 'Full-bleed cinematic poster — avatar and name centred over the cover like a concert stage.',
    premium: true,
  },
];

const LAYOUT_SET = new Set<string>(CREATOR_STUDIO_HEADER_LAYOUTS.map((l) => l.id));

export function parseCreatorStudioHeaderLayout(value: unknown): CreatorStudioHeaderLayout {
  const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (LAYOUT_SET.has(raw)) return raw as CreatorStudioHeaderLayout;
  return 'BANNER';
}

export function creatorHeaderNeedsInset(layout: CreatorStudioHeaderLayout): boolean {
  return layout === 'SPLIT' || layout === 'VIP_GOLD' || layout === 'VIP_AURORA' || layout === 'STAGE';
}

export function isPremiumCreatorHeaderLayout(layout: CreatorStudioHeaderLayout): boolean {
  return layout === 'VIP_GOLD' || layout === 'VIP_AURORA' || layout === 'STAGE';
}
