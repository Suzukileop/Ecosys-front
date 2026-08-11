import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './accessToken';
import { refreshAccessToken, invalidateSessionCache } from './sessionRefresh';

export { setAccessToken, getAccessToken };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  }
  return config;
});

// Response interceptor: handle 401 with silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

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
