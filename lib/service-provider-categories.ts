/**
 * Service-providers catalog taxonomy (Popular chips + Categories mega-menu).
 * Popular mirrors the discovery specialty chips; Categories holds the grouped tree.
 */

import { PROFILE_SPECIALTIES } from '@/lib/specialties';

export const SERVICE_PROVIDER_POPULAR_TAGS = PROFILE_SPECIALTIES;

export type ServiceProviderPopularTag = (typeof SERVICE_PROVIDER_POPULAR_TAGS)[number];

export type ServiceProviderCategoryIcon =
  | 'wrench'
  | 'house'
  | 'truck'
  | 'graduation';

export type ServiceProviderCategoryGroup = {
  id: string;
  title: string;
  icon: ServiceProviderCategoryIcon;
  items: string[];
};

/** Grouped mega-menu — home / local services taxonomy. */
export const SERVICE_PROVIDER_CATEGORY_GROUPS: ServiceProviderCategoryGroup[] = [
  {
    id: 'maintenance',
    title: 'Maintenance & repairs',
    icon: 'wrench',
    items: [
      'Plumbing',
      'Electrician',
      'Appliance repair',
      'Locksmith',
      'General handyman',
    ],
  },
  {
    id: 'home',
    title: 'Home & personal',
    icon: 'house',
    items: [
      'House cleaning',
      'Gardening',
      'Moving help',
      'Pet sitting',
    ],
  },
  {
    id: 'transport',
    title: 'Transport & logistics',
    icon: 'truck',
    items: ['Courier / delivery', 'Private driver'],
  },
  {
    id: 'education',
    title: 'Education & wellness',
    icon: 'graduation',
    items: ['Private tutoring', 'Fitness coach'],
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
