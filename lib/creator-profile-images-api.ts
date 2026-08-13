import api from '@/lib/api';

export type CreatorProfileImageItem = {
  id: string;
  kind: 'AVATAR';
  url: string;
  createdAt: string;
  current: boolean;
};

export async function listCreatorProfileImages(): Promise<CreatorProfileImageItem[]> {
  const res = await api.get<CreatorProfileImageItem[]>('/api/creator/profile/images');
  return res.data;
}

export async function restoreCreatorProfileImage(
  imageId: string
): Promise<CreatorProfileImageItem> {
  const res = await api.post<CreatorProfileImageItem>(
    `/api/creator/profile/images/${imageId}/restore`
  );
  return res.data;
}
