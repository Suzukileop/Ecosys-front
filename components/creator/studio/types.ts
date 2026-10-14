import { msg } from '@/lib/i18n/config';
export type CreatorStudioTab =
  | 'content'
  | 'products'
  | 'images'
  | 'visitors'
  | 'subscribers'
  | 'profile'
  | 'services';

export const CREATOR_STUDIO_TABS: { id: CreatorStudioTab; label: string }[] = [
  { id: 'content', label: msg('Content') },
  { id: 'services', label: msg('Services') },
  { id: 'products', label: msg('Products') },
  { id: 'images', label: msg('Photos') },
  { id: 'visitors', label: msg('Visitors') },
  { id: 'subscribers', label: msg('Subscribers') },
  { id: 'profile', label: msg('Profile') },
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
