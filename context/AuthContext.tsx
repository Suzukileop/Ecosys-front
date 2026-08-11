'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { LoginData, Role, SignupData, User, AuthResponse } from '@/types/auth';
import {
  loginApi,
  logoutApi,
  signupApi,
  clearRefreshCookie,
  setRefreshCookie,
} from '@/lib/auth';
import { setAccessToken } from '@/lib/api';
import { refreshSession, invalidateSessionCache } from '@/lib/sessionRefresh';

/**
 * 'loading'        — initial; session restore not yet attempted
 * 'authenticated'  — user has a valid session
 * 'unauthenticated'— definitively no session; safe to redirect to /login
 * 'error'          — transient failure (429, network); token may still be
 *                    valid — do NOT redirect, show a retry UI instead
 */
export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionStatus: SessionStatus;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  applyAuthResponse: (authResponse: AuthResponse) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      const authResponse = await refreshSession();
      setUser(authResponse.user);
      setSessionStatus('authenticated');
      return true;
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : null;

      if (status === 429 || status == null) {
        // Transient failure: rate limit or no response (network).
        // The refresh token may still be valid — do NOT clear the session
        // and do NOT trigger a /login redirect; show an error state instead.
        setSessionStatus('error');
      } else {
        // Genuine auth failure (400 INVALID/REVOKED/EXPIRED, 401, 403, …).
        // The refresh token is unusable, so we MUST clear the stale
        // refresh_token cookie BEFORE marking the session unauthenticated.
        // Otherwise the middleware keeps bouncing /login -> /dashboard
        // (cookie still present) while the client bounces /dashboard -> /login
        // (session invalid) → infinite redirect loop on server restart.
        setAccessToken(null);
        setUser(null);
        try {
          await clearRefreshCookie();
        } catch {
          // Navigate to /login regardless of cookie-clear outcome.
        }
        setSessionStatus('unauthenticated');
      }
      return false;
    }
  }, []);

  useEffect(() => {
    // OAuth pages handle their own session setup — skip stale refresh cookie restore.
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/oauth/')) {
      setIsLoading(false);
      setSessionStatus('unauthenticated');
      return;
    }

    void (async () => {
      await restoreSession();
      setIsLoading(false);
    })();
  }, [restoreSession]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;

    const interval = window.setInterval(() => {
      void refreshSession().catch(() => {
        /* 401/429 handled by restoreSession / api interceptor on next request */
      });
    }, 12 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [sessionStatus]);

  const applyAuthResponse = useCallback(async (authResponse: AuthResponse) => {
    setAccessToken(authResponse.accessToken);
    setUser(authResponse.user);
    setSessionStatus('authenticated');
    setIsLoading(false);
    if (authResponse.refreshToken) {
      await setRefreshCookie(authResponse.refreshToken);
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const authResponse = await loginApi(data);
    await applyAuthResponse(authResponse);
  }, [applyAuthResponse]);

  const signup = useCallback(async (data: SignupData) => {
    const authResponse = await signupApi(data);
    await applyAuthResponse(authResponse);
  }, [applyAuthResponse]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Continue with local logout even if API call fails
    }
    invalidateSessionCache();
    await clearRefreshCookie();
    setAccessToken(null);
    setUser(null);
    setSessionStatus('unauthenticated');
  }, []);

  const hasRole = useCallback(
    (role: Role) => user?.roles.includes(role) ?? false,
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionStatus,
        isAuthenticated: user !== null,
        login,
        signup,
        applyAuthResponse,
        updateUser,
        restoreSession,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
