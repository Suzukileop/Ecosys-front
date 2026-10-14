import { msg } from '@/lib/i18n/config';
import type { ReactNode } from 'react';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import { type CreatorAppRole } from '@/lib/creator-app-role';

export const CREATOR_PROFILE_VISITS_LABEL = 'Visits';

/*
 * Phone header actions (Facebook / Instagram): 40px, 8px corners, filled — one ink primary, soft
 * grey secondaries, a square icon button for "more". Filled tones read calmer than outlines.
 */
const PROFILE_MOBILE_BUTTON_BASE =
  'inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/30 dark:focus-visible:ring-white/30';
export const PROFILE_MOBILE_PRIMARY_BUTTON = `${PROFILE_MOBILE_BUTTON_BASE} flex-1 px-3 font-bold bg-[#0F1419] text-white active:bg-[#272C30] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:active:bg-[#D7DBDC]`;
export const PROFILE_MOBILE_SOFT_BUTTON = `${PROFILE_MOBILE_BUTTON_BASE} flex-1 px-3 font-semibold bg-[#EFF3F4] text-[#0F1419] active:bg-[#E1E8ED] dark:bg-[#202327] dark:text-[#E7E9EA] dark:active:bg-[#2F3336]`;
export const PROFILE_MOBILE_ICON_BUTTON = `${PROFILE_MOBILE_BUTTON_BASE} w-10 shrink-0 bg-[#EFF3F4] text-[#0F1419] active:bg-[#E1E8ED] dark:bg-[#202327] dark:text-[#E7E9EA] dark:active:bg-[#2F3336]`;
export const CREATOR_PROFILE_SUBSCRIBERS_LABEL = msg('Subscribers');

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
  /** Trust stars given by other members. */
  starCount?: number | null;
  locationLabel?: string | null;
  /** ISO nationality shown as a flag next to the display name. */
  nationality?: string | null;
  /** Presence dot next to the flag / name (messaging-style). */
  isOnline?: boolean;
  isVerified?: boolean;
  /** Availability status shown under the display name. */
  isAvailable?: boolean;
  /** Custom label when available (empty → "Available"). */
  availabilityLabel?: string | null;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  trailingActions?: ReactNode;
  /** A row of small contact / social icons under the bio, above the action buttons. */
  headerLinks?: ReactNode;
  /** Phones only (< sm): the compact action row under the bio (equal-width buttons). The desktop
   *  `trailingActions` / `nameActions` / `headerLinks` are not shown there. */
  mobileActions?: ReactNode;
  /** Small icon actions set right after the name (the owner's "Edit profile" / "View public profile"). */
  nameActions?: ReactNode;
  /** Seller header primary link (public shop or shop management). */
  shopHref?: string;
  shopLabel?: string;
  /** When a skills band sits flush under the card, drop bottom radius so they read as one block. */
  flushBottom?: boolean;
  /** Open layout without the card surface, with larger type (public profile). */
  flat?: boolean;
  /** From lg, line the stats column up with a 17.5rem rail under the header (My Profile's
   *  "Manage" rail) and the identity column with the content column beside it. */
  railAligned?: boolean;
};

/** Hide a raw "0 subscribers" on public profiles — keep it for the owner dashboard. */
export function resolveShowSubscriberCount(
  props: Pick<CreatorProfileHeaderProps, 'followerCount' | 'editable'>
): boolean {
  if (props.followerCount > 0) return true;
  return Boolean(props.editable);
}
