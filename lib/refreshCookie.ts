/*
 * The refresh_token cookie is set by the API itself (HttpOnly, on login / verify-email / OAuth /
 * refresh): the token never passes through JavaScript. Only the clean-up stays here — the API cannot
 * clear a cookie for a session it no longer recognises, and a stale cookie would make proxy.ts bounce
 * /login ↔ the app.
 */
export async function clearRefreshCookie(): Promise<void> {
  const response = await fetch('/api/clear-refresh-cookie', { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Failed to clear refresh cookie (${response.status})`);
  }
}
