import api from '@/lib/api';
import type { PagedResponse } from '@/types/ecosystem';

export interface CreatorProfileVisitItem {
  id: string;
  viewedAt: string;
  anonymous: boolean;
  viewerUserId: string | null;
  viewerFullName: string | null;
  viewerAvatarUrl: string | null;
  viewerAppRole: string | null;
  visitCount: number;
}

export async function listCreatorProfileVisits(
  page = 0,
  size = 20
): Promise<PagedResponse<CreatorProfileVisitItem>> {
  const res = await api.get<PagedResponse<CreatorProfileVisitItem>>('/api/creator/profile/visits', {
    params: { page, size },
  });
  const pageData = res.data;
  return {
    ...pageData,
    content: (pageData.content ?? []).map((row) => ({
      ...row,
      viewerAppRole: row.viewerAppRole ?? null,
      visitCount:
        typeof row.visitCount === 'number' && row.visitCount > 0 ? row.visitCount : 1,
    })),
  };
}
