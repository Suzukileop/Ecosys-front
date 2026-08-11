import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import type { PagedResponse, SpringPageRaw } from '@/types/ecosystem';
import type { ContentPostBucket, CreatorContentCreateBody, CreatorContentItemDto } from '@/types/creator-content';

export async function listMyContent(
  bucket: ContentPostBucket = 'active',
  page = 0,
  size = 20
): Promise<PagedResponse<CreatorContentItemDto>> {
  const res = await api.get<SpringPageRaw<CreatorContentItemDto>>('/api/creator/content', {
    params: { bucket, page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function updateCreatorContent(
  id: string,
  body: CreatorContentCreateBody
): Promise<CreatorContentItemDto> {
  const res = await api.put<CreatorContentItemDto>(`/api/creator/content/${id}`, body);
  return res.data;
}

export async function updateContentCommentsEnabled(
  id: string,
  commentsEnabled: boolean
): Promise<CreatorContentItemDto> {
  const res = await api.patch<CreatorContentItemDto>(`/api/creator/content/${id}/comments`, { commentsEnabled });
  return res.data;
}

export async function updateContentVisibility(
  id: string,
  isPublic: boolean
): Promise<CreatorContentItemDto> {
  const res = await api.patch<CreatorContentItemDto>(`/api/creator/content/${id}/visibility`, { isPublic });
  return res.data;
}

export async function archiveContent(id: string): Promise<CreatorContentItemDto> {
  const res = await api.post<CreatorContentItemDto>(`/api/creator/content/${id}/archive`);
  return res.data;
}

export async function unarchiveContent(id: string): Promise<CreatorContentItemDto> {
  const res = await api.post<CreatorContentItemDto>(`/api/creator/content/${id}/unarchive`);
  return res.data;
}

export async function restoreContent(id: string): Promise<CreatorContentItemDto> {
  const res = await api.post<CreatorContentItemDto>(`/api/creator/content/${id}/restore`);
  return res.data;
}

export async function moveContentToTrash(id: string): Promise<void> {
  await api.delete(`/api/creator/content/${id}`);
}

export async function permanentDeleteContent(id: string): Promise<void> {
  await api.delete(`/api/creator/content/${id}/permanent`);
}

export async function pinContent(id: string): Promise<CreatorContentItemDto> {
  const res = await api.post<CreatorContentItemDto>(`/api/creator/content/${id}/pin`);
  return res.data;
}

export async function unpinContent(id: string): Promise<CreatorContentItemDto> {
  const res = await api.delete<CreatorContentItemDto>(`/api/creator/content/${id}/pin`);
  return res.data;
}
