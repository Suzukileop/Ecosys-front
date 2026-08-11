export type CreatorStudioTab = 'content' | 'products' | 'visitors' | 'subscribers' | 'profile';

export const CREATOR_STUDIO_TABS: { id: CreatorStudioTab; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'products', label: 'Products' },
  { id: 'visitors', label: 'Visitors' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'profile', label: 'Information' },
];

export function parseCreatorStudioTab(value: string | null): CreatorStudioTab {
  if (
    value === 'products' ||
    value === 'visitors' ||
    value === 'subscribers' ||
    value === 'profile'
  ) {
    return value;
  }
  return 'content';
}
