import type { ReactNode } from 'react';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';
import type { CreatorAppRole } from '@/lib/creator-app-role';

export const CREATOR_PROFILE_VISITS_LABEL = 'Visits';
export const CREATOR_PROFILE_SUBSCRIBERS_LABEL = 'Subscribers';

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
  profileVisits: number;
  profileVisitsHref?: string;
  profileSubscribersHref?: string;
  averageRating?: number | null;
  locationLabel?: string | null;
  isVerified?: boolean;
  editable?: boolean;
  uploadingAvatar?: boolean;
  onAvatarPick?: () => void;
  trailingActions?: ReactNode;
};
