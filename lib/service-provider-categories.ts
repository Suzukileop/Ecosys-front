/**
 * Service-providers catalog taxonomy (Popular chips + Categories mega-menu).
 * Popular mirrors the discovery specialty chips; Categories holds the grouped tree.
 */

import { PROFILE_SPECIALTIES } from '@/lib/specialties';
import { msg } from '@/lib/i18n/config';

export const SERVICE_PROVIDER_POPULAR_TAGS = PROFILE_SPECIALTIES.filter(
  (tag) => tag !== 'Writing'
);

export type ServiceProviderCategoryIcon =
  | 'wrench'
  | 'house'
  | 'truck'
  | 'graduation';

type ServiceProviderCategoryGroup = {
  id: string;
  title: string;
  icon: ServiceProviderCategoryIcon;
  items: string[];
};

/** Grouped mega-menu — home / local services taxonomy. */
export const SERVICE_PROVIDER_CATEGORY_GROUPS: ServiceProviderCategoryGroup[] = [
  {
    id: 'maintenance',
    title: msg('Maintenance & repairs'),
    icon: 'wrench',
    items: [
      msg('Plumbing'),
      msg('Electrician'),
      msg('Appliance repair'),
      msg('Locksmith'),
      msg('General handyman'),
    ],
  },
  {
    id: 'home',
    title: msg('Home & personal'),
    icon: 'house',
    items: [
      msg('House cleaning'),
      msg('Gardening'),
      msg('Moving help'),
      msg('Pet sitting'),
    ],
  },
  {
    id: 'transport',
    title: msg('Transport & logistics'),
    icon: 'truck',
    items: [msg('Courier / delivery'), msg('Private driver')],
  },
  {
    id: 'education',
    title: msg('Education & wellness'),
    icon: 'graduation',
    items: [msg('Private tutoring'), msg('Fitness coach')],
  },
];

export function countServiceProviderSubcategories(
  groups: ServiceProviderCategoryGroup[] = SERVICE_PROVIDER_CATEGORY_GROUPS
): number {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

export function findServiceProviderCategoryLabel(
  genre: string | null | undefined,
  groups: ServiceProviderCategoryGroup[] = SERVICE_PROVIDER_CATEGORY_GROUPS
): string | null {
  const needle = (genre ?? '').trim().toLowerCase();
  if (!needle) return null;
  for (const group of groups) {
    const match = group.items.find((item) => item.toLowerCase() === needle);
    if (match) return match;
  }
  return null;
}
