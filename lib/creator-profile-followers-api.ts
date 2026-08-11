import api from '@/lib/api';
import type { PagedResponse } from '@/types/ecosystem';

export interface CreatorProfileFollowerItem {
  id: string;
  followedAt: string;
  followerUserId: string;
  followerFullName: string | null;
  followerAvatarUrl: string | null;
}

export async function listCreatorProfileFollowers(
  page = 0,
  size = 20
): Promise<PagedResponse<CreatorProfileFollowerItem>> {
  const res = await api.get<PagedResponse<CreatorProfileFollowerItem>>('/api/creator/profile/followers', {
    params: { page, size },
  });
  return res.data;
}
