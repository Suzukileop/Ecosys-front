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
