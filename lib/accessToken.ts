let accessToken: string | null = null;
const listeners = new Set<() => void>();

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  listeners.forEach((listener) => listener());
};

export const getAccessToken = () => accessToken;

export const onAccessTokenChange = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/*
 * Whether this browser holds a session cookie (refresh_token is HttpOnly, so the server reads it and
 * the root layout passes it down). Guests skip the refresh round-trip on every page, and a 401 on a
 * public page no longer sends them to /login.
 */
let sessionHint = false;

export const setSessionHint = (value: boolean) => {
  sessionHint = value;
};

export const hasSessionHint = () => sessionHint;
