export type CreatorStudioTab =
  | 'content'
  | 'products'
  | 'images'
  | 'visitors'
  | 'subscribers'
  | 'profile'
  | 'services';

export const CREATOR_STUDIO_TABS: { id: CreatorStudioTab; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'images', label: 'Images' },
  { id: 'visitors', label: 'Visitors' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'profile', label: 'Information' },
];

export function parseCreatorStudioTab(value: string | null): CreatorStudioTab {
  if (
    value === 'products' ||
    value === 'images' ||
    value === 'visitors' ||
    value === 'subscribers' ||
    value === 'profile' ||
    value === 'services'
  ) {
    return value;
  }
  return 'content';
}
