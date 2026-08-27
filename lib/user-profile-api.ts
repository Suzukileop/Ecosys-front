import api from '@/lib/api';
import type { User } from '@/types/auth';
import type { CreatorProfileDto } from '@/types/ecosystem';

export async function getUserProfile(): Promise<User> {
  const res = await api.get<User>('/api/user/profile');
  return res.data;
}

export async function updateUserProfile(body: {
  fullName?: string;
  username?: string;
}): Promise<User> {
  const res = await api.put<User>('/api/user/profile', body);
  return res.data;
}

export async function uploadUserAvatar(file: File): Promise<User> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<User>('/api/user/profile/avatar', form);
  return res.data;
}
