import api from '@/lib/api';

export type MessagePermission = 'EVERYONE' | 'FOLLOWING' | 'NOBODY';

export type UserSettings = {
  emailNotifications: boolean;
  notifyMessages: boolean;
  notifyComments: boolean;
  notifyFollowers: boolean;
  notifyProfileVisits: boolean;
  notifySales: boolean;
  notifyFollowingActivity: boolean;
  showOnlineStatus: boolean;
  privateProfileViews: boolean;
  messagePermission: MessagePermission;
};

export type AccountSecurity = {
  email: string;
  emailVerified: boolean;
  authProvider: string;
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
  activeSessions: number;
};

export async function getUserSettings(): Promise<UserSettings> {
  const res = await api.get<UserSettings>('/api/user/settings');
  return res.data;
}

export async function updateUserSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const res = await api.put<UserSettings>('/api/user/settings', patch);
  return res.data;
}

export async function getAccountSecurity(): Promise<AccountSecurity> {
  const res = await api.get<AccountSecurity>('/api/user/account/security');
  return res.data;
}

export async function changePassword(body: { currentPassword?: string; newPassword: string }): Promise<void> {
  await api.post('/api/user/account/password', body);
}

export async function revokeAllSessions(): Promise<number> {
  const res = await api.post<{ revoked: number }>('/api/user/account/sessions/revoke-all');
  return res.data.revoked;
}

export async function downloadAccountData(): Promise<void> {
  const res = await api.get<Record<string, unknown>>('/api/user/account/export');
  const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `skraft-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function deleteAccount(body: { password?: string; confirmation: string }): Promise<void> {
  await api.post('/api/user/account/delete', body);
}
