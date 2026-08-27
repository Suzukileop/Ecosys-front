let inflightSetCookie: { token: string; promise: Promise<void> } | null = null;

export async function setRefreshCookie(refreshToken: string): Promise<void> {
  if (inflightSetCookie?.token === refreshToken) {
    return inflightSetCookie.promise;
  }

  const promise = fetch('/api/set-refresh-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(() => undefined).finally(() => {
    if (inflightSetCookie?.token === refreshToken) {
      inflightSetCookie = null;
    }
  });

  inflightSetCookie = { token: refreshToken, promise };
  return promise;
}

export async function clearRefreshCookie(): Promise<void> {
  inflightSetCookie = null;
  const response = await fetch('/api/clear-refresh-cookie', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to clear refresh cookie (${response.status})`);
  }
}
