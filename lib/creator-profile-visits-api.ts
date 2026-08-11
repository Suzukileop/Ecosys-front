import api from '@/lib/api';
import type { PagedResponse } from '@/types/ecosystem';

export interface CreatorProfileVisitItem {
  id: string;
  viewedAt: string;
  anonymous: boolean;
  viewerUserId: string | null;
  viewerFullName: string | null;
  viewerAvatarUrl: string | null;
}

export async function listCreatorProfileVisits(
  page = 0,
  size = 20
): Promise<PagedResponse<CreatorProfileVisitItem>> {
  const res = await api.get<PagedResponse<CreatorProfileVisitItem>>('/api/creator/profile/visits', {
    params: { page, size },
  });
  return res.data;
}
