import { msg } from '@/lib/i18n/config';
export type CreatorStudioHeaderLayout = 'BANNER' | 'SPLIT' | 'VIP_GOLD' | 'VIP_AURORA' | 'STAGE';

const CREATOR_STUDIO_HEADER_LAYOUTS: {
  id: CreatorStudioHeaderLayout;
  label: string;
  description: string;
  premium?: boolean;
}[] = [
  {
    id: 'BANNER',
    label: msg('Banner'),
    description: msg('Wide cover image with a circular avatar overlapping the banner.'),
  },
  {
    id: 'SPLIT',
    label: msg('Split card'),
    description: msg('Profile details on the left and your cover image on the right.'),
  },
  {
    id: 'VIP_GOLD',
    label: msg('VIP Gold'),
    description: msg('Luxury black & gold layout with shimmer border and cinematic cover.'),
    premium: true,
  },
  {
    id: 'VIP_AURORA',
    label: msg('VIP Aurora'),
    description: msg('Glassmorphism with animated aurora orbs and holographic accents.'),
    premium: true,
  },
  {
    id: 'STAGE',
    label: msg('Stage'),
    description: msg('Full-bleed cinematic poster — avatar and name centred over the cover like a concert stage.'),
    premium: true,
  },
];

const LAYOUT_SET = new Set<string>(CREATOR_STUDIO_HEADER_LAYOUTS.map((l) => l.id));

export function parseCreatorStudioHeaderLayout(value: unknown): CreatorStudioHeaderLayout {
  const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (LAYOUT_SET.has(raw)) return raw as CreatorStudioHeaderLayout;
  return 'BANNER';
}
