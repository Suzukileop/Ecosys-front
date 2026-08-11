import api from './api';
import { clearRefreshCookie, setRefreshCookie } from './refreshCookie';
import { refreshSession } from './sessionRefresh';
import { AuthResponse, LoginData, SignupData } from '@/types/auth';

export { clearRefreshCookie, setRefreshCookie };

const oauthExchangePromises = new Map<string, Promise<AuthResponse>>();
const oauthCompletionPromises = new Map<string, Promise<void>>();

export async function signupApi(data: SignupData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/signup', data);
  return response.data;
}

export async function loginApi(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout');
}

export async function refreshApi(): Promise<AuthResponse> {
  return refreshSession();
}

export async function exchangeOAuthCode(code: string): Promise<AuthResponse> {
  const existing = oauthExchangePromises.get(code);
  if (existing) {
    return existing;
  }

  const promise = api
    .post<AuthResponse>('/api/auth/oauth/exchange', { code })
    .then((response) => response.data)
    .finally(() => {
      oauthExchangePromises.delete(code);
    });

  oauthExchangePromises.set(code, promise);
  return promise;
}

export async function fetchOAuthStatus(): Promise<{ google: boolean }> {
  const response = await api.get<{ google: boolean }>('/api/auth/oauth/status');
  return response.data;
}

export interface OAuthPendingProfile {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  provider: string;
}

export async function fetchOAuthPendingRegistration(code: string): Promise<OAuthPendingProfile> {
  const response = await api.get<OAuthPendingProfile>('/api/auth/oauth/pending-registration', {
    params: { code },
  });
  return response.data;
}

export async function completeOAuthRegistration(
  code: string,
  role: 'CREATOR' = 'CREATOR'
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/oauth/complete-registration', { code, role });
  return response.data;
}

export async function completeOAuthCallback(
  code: string,
  applyAuthResponse: (authResponse: AuthResponse) => Promise<void>
): Promise<void> {
  const existing = oauthCompletionPromises.get(code);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    await clearRefreshCookie();
    const authResponse = await exchangeOAuthCode(code);
    await applyAuthResponse(authResponse);
  })().finally(() => {
    oauthCompletionPromises.delete(code);
  });

  oauthCompletionPromises.set(code, promise);
  return promise;
}

