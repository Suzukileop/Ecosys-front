'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { LoginData, Role, SignupData, SignupResponse, User, AuthResponse } from '@/types/auth';
import {
  loginApi,
  logoutApi,
  signupApi,
  verifyEmailApi,
  clearRefreshCookie,
} from '@/lib/auth';
import { setAccessToken } from '@/lib/api';
import { setSessionHint } from '@/lib/accessToken';
import { sendPresenceOffline } from '@/lib/presence-api';
import { refreshSession, beginLogout, endLogout } from '@/lib/sessionRefresh';

/**
 * 'loading'        — initial; session restore not yet attempted
 * 'authenticated'  — user has a valid session
 * 'unauthenticated'— definitively no session; safe to redirect to /login
 * 'error'          — transient failure (429, network); token may still be
 *                    valid — do NOT redirect, show a retry UI instead
 */
type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionStatus: SessionStatus;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  /** Creates the account and e-mails a code — no session yet (see `verifyEmail`). */
  signup: (data: SignupData) => Promise<SignupResponse>;
  /** Confirms the e-mailed code and opens the session. */
  verifyEmail: (email: string, code: string) => Promise<void>;
  applyAuthResponse: (authResponse: AuthResponse) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let sessionHintSeeded = false;

/** Seeds the hint from the server value once per page load; later changes come from login / logout. */
function setSessionHintOnce(value: boolean) {
  if (typeof window === 'undefined' || sessionHintSeeded) return;
  sessionHintSeeded = true;
  setSessionHint(value);
}

export function AuthProvider({
  children,
  initialHasSession = true,
}: {
  children: React.ReactNode;
  /** Server-read presence of the refresh_token cookie. False: a guest — no refresh round-trip. */
  initialHasSession?: boolean;
}) {
  /* Set during render so api.ts sees it before any child effect fires a request. */
  setSessionHintOnce(initialHasSession);
  const [user, setUser] = useState<User | null>(null);
  /* A guest (no session cookie) is known to be signed out from the first render: no loading state. */
  const [isLoading, setIsLoading] = useState(initialHasSession);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
    initialHasSession ? 'loading' : 'unauthenticated',
  );

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
        setSessionHint(false);
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

    // No session cookie: nothing to restore. Skips POST /api/auth/refresh (always a 401) and the
    // cookie clean-up that followed it, on every page a guest opens.
    if (!initialHasSession) return;

    void (async () => {
      await restoreSession();
      setIsLoading(false);
    })();
  }, [restoreSession, initialHasSession]);

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
    // The API set the HttpOnly refresh_token cookie on this same response.
    setSessionHint(true);
    setAccessToken(authResponse.accessToken);
    setUser(authResponse.user);
    setSessionStatus('authenticated');
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const authResponse = await loginApi(data);
    await applyAuthResponse(authResponse);
  }, [applyAuthResponse]);

  const signup = useCallback((data: SignupData) => signupApi(data), []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const authResponse = await verifyEmailApi(email, code);
    await applyAuthResponse(authResponse);
  }, [applyAuthResponse]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const logout = useCallback(async () => {
    // Block concurrent refreshSession before API/cookie work — otherwise a
    // refresh can rewrite refresh_token after we clear it and bounce
    // /login → /dashboard.
    beginLogout();
    try {
      await sendPresenceOffline();
    } catch {
      /* presence is best-effort */
    }
    try {
      await logoutApi();
    } catch {
      // Continue with local logout even if API call fails
    }
    try {
      await clearRefreshCookie();
    } catch {
      // Still clear in-memory session
    }
    setAccessToken(null);
    setSessionHint(false);
    setUser(null);
    setSessionStatus('unauthenticated');
    endLogout();
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
        verifyEmail,
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

const SSR_AUTH_FALLBACK: AuthContextType = {
  user: null,
  isLoading: true,
  sessionStatus: 'loading',
  isAuthenticated: false,
  login: async () => undefined,
  signup: () => Promise.reject(new Error('Sign-up needs the client AuthProvider.')),
  verifyEmail: async () => undefined,
  applyAuthResponse: async () => undefined,
  updateUser: () => undefined,
  restoreSession: async () => false,
  logout: async () => undefined,
  hasRole: () => false,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context) return context;
  // Public portfolio SSR can render this hook before the client AuthProvider tree is attached.
  if (typeof window === 'undefined') return SSR_AUTH_FALLBACK;
  throw new Error('useAuth must be used within an AuthProvider');
}
