import type { ReactNode } from 'react';
import type { CreatorStudioHeaderLayout } from '@/components/creator/studio/creator-studio-header';
import type { CreatorStudioHeaderContentStyle } from '@/components/creator/studio/creator-studio-header-content';

export const CREATOR_PROFILE_VISITS_LABEL = 'Visits';
export const CREATOR_PROFILE_SUBSCRIBERS_LABEL = 'Subscribers';

export type CreatorProfileHeaderProps = {
  layout: CreatorStudioHeaderLayout;
  fullName: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  coverObjectPositionY?: number;
  headerContentStyle?: CreatorStudioHeaderContentStyle;
  bio: string | null;
  specialite: string | null;
  followerCount: number;
  productCount: number;
  profileVisits: number;
  profileVisitsHref?: string;
  profileSubscribersHref?: string;
  averageRating?: number | null;
  locationLabel?: string | null;
  isVerified?: boolean;
  editable?: boolean;
  uploadingCover?: boolean;
  uploadingAvatar?: boolean;
  onCoverPick?: () => void;
  onAvatarPick?: () => void;
  coverPositionAdjustable?: boolean;
  onCoverObjectPositionYChange?: (value: number) => void;
  trailingActions?: ReactNode;
};