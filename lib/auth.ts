import api from './api';
import { clearRefreshCookie } from './refreshCookie';
import {
  AuthResponse,
  LoginData,
  ResendVerificationResponse,
  SignupData,
  SignupResponse,
} from '@/types/auth';

export { clearRefreshCookie };

const oauthExchangePromises = new Map<string, Promise<AuthResponse>>();
const oauthCompletionPromises = new Map<string, Promise<void>>();

export async function signupApi(data: SignupData): Promise<SignupResponse> {
  const response = await api.post<SignupResponse>('/api/auth/signup', data);
  return response.data;
}

/** Confirms the e-mailed code; the first session of a local account starts here. */
export async function verifyEmailApi(email: string, code: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/verify-email', { email, code });
  return response.data;
}

/** "Forgot password?": e-mails a reset code. Same answer whether or not the address has an account. */
export async function forgotPasswordApi(email: string, locale?: string): Promise<ResendVerificationResponse> {
  const response = await api.post<ResendVerificationResponse>('/api/auth/password/forgot', { email, locale });
  return response.data;
}

/** Sets a new password with the reset code; every session is signed out, the user logs in next. */
export async function resetPasswordApi(email: string, code: string, newPassword: string): Promise<void> {
  await api.post('/api/auth/password/reset', { email, code, newPassword });
}

/** Asks for a new code. The answer is the same whether or not the address has an account. */
export async function resendVerificationApi(email: string, locale?: string): Promise<ResendVerificationResponse> {
  const response = await api.post<ResendVerificationResponse>('/api/auth/verify-email/resend', { email, locale });
  return response.data;
}

export async function loginApi(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout');
}

async function exchangeOAuthCode(code: string): Promise<AuthResponse> {
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

