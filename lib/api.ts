import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, hasSessionHint, setAccessToken } from './accessToken';
import { refreshAccessToken, invalidateSessionCache } from './sessionRefresh';
import { reportNetworkFailure } from '@/stores/serverStatusStore';
import { normalizeStorageUrlsDeep, restoreStorageUrlsDeep } from './storage-media-url';

export {
  setAccessToken,
};

import { API_BASE } from './api-base';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData must set Content-Type with boundary automatically (not application/json)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (config.data && typeof config.data === 'object') {
    // Responses are rewritten to same-origin storage paths in dev; send them back as absolute URLs.
    config.data = restoreStorageUrlsDeep(config.data);
  }
  return config;
});

// Response interceptor: handle 401 with silent token refresh
api.interceptors.response.use(
  (response) => {
    response.data = normalizeStorageUrlsDeep(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response && error.code !== AxiosError.ERR_CANCELED && !axios.isCancel(error)) {
      void reportNetworkFailure();
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] ?? '60';
      error.message = `Too many requests. Please try again in ${retryAfter} seconds.`;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const onOAuthPage =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/oauth/');
      const isAuthEndpoint = originalRequest.url?.includes('/api/auth/');

      if (onOAuthPage || isAuthEndpoint) {
        return Promise.reject(error);
      }

      // A guest (no token sent, no session cookie) hitting a members-only endpoint from a public page:
      // there is nothing to refresh, and bouncing them to /login would throw away what they were doing
      // (the landing feedback form did exactly that). Let the caller show its own error.
      const sentToken = Boolean(originalRequest.headers?.Authorization);
      if (!sentToken && !hasSessionHint()) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh itself was rate-limited, do NOT redirect to /login —
        // that would create an infinite loop (middleware bounces back to /dashboard
        // because the refresh_token cookie still exists).
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : null;

        if (refreshStatus === 429) {
          // Transient error — let the caller handle it (AuthContext shows retry UI)
          return Promise.reject(refreshError);
        }

        // Session is no longer valid — clear stale in-memory token even if still present.
        invalidateSessionCache();
        setAccessToken(null);

        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/oauth/') &&
          !window.location.pathname.startsWith('/login')
        ) {
          try {
            await fetch(`${API_BASE}/api/auth/logout`, {
              method: 'POST',
              credentials: 'include',
            });
          } catch {
            // ignore — we're logging out anyway
          }
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
