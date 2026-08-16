import type { ReactNode } from 'react';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import {
  creatorCanAccessProfileProducts,
  type CreatorAppRole,
} from '@/lib/creator-app-role';

export const CREATOR_PROFILE_VISITS_LABEL = 'Visits';
export const CREATOR_PROFILE_SUBSCRIBERS_LABEL = 'Subscribers';
export const CREATOR_PROFILE_PRODUCTS_LABEL = 'Products';
export const CREATOR_PROFILE_SERVICES_LABEL = 'Services';

export type CreatorProfileHeaderProps = {
  layout: CreatorStudioHeaderLayout;
  fullName: string;
  handle: string;
  avatarUrl: string | null;
  /** Drives the floating avatar status ring color. */
  appRole?: CreatorAppRole | null;
  headerContentStyle?: CreatorStudioHeaderContentStyle;
  bio: string | null;
  specialite: string | null;
  specialties?: string[];
  specialtyTags?: string[];
  followerCount: number;
  productCount: number;
  /** Shown in the header middle slot when Products are hidden (e.g. SERVICE_PROVIDER). */
  serviceCount?: number;
  /** When false, hide the Products stat (e.g. SERVICE_PROVIDER). Defaults from appRole. */
  showProductCount?: boolean;
  profileVisits: number;
  profileVisitsHref?: string;
  profileSubscribersHref?: string;
  averageRating?: number | null;
  locationLabel?: string | null;
  /** ISO nationality shown as a flag next to the display name. */
  nationality?: string | null;
  isVerified?: boolean;
  /** Availability status shown under the display name. */
  isAvailable?: boolean;
  /** Custom label when available (empty → "Available"). */
  availabilityLabel?: string | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  trailingActions?: ReactNode;
  /** When a skills band sits flush under the card, drop bottom radius so they read as one block. */
  flushBottom?: boolean;
};

export function resolveShowProductCount(props: Pick<CreatorProfileHeaderProps, 'showProductCount' | 'appRole'>): boolean {
  if (props.showProductCount != null) return props.showProductCount;
  return creatorCanAccessProfileProducts(props.appRole);
}

/** Hide a raw "0 subscribers" on public profiles — keep it for the owner dashboard. */
export function resolveShowSubscriberCount(
  props: Pick<CreatorProfileHeaderProps, 'followerCount' | 'editable'>
): boolean {
  if (props.followerCount > 0) return true;
  return Boolean(props.editable);
}
