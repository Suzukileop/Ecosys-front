/**
 * The address waiting for its e-mail code, handed from sign-up / log-in to `/verify-email`.
 *
 * Kept in sessionStorage rather than the URL: an address in a query string ends up in history, the
 * Referer header and proxy logs. It survives a reload of the tab, and `/verify-email` falls back to
 * asking for the address when it's missing (new tab, private window, storage blocked).
 */

const STORAGE_KEY = 'skraft-pending-verification';

export type PendingVerification = {
  email: string;
  /** Epoch ms from which "Resend code" is allowed again. */
  resendAvailableAt: number;
  /** Where to go once verified (a same-site path), e.g. the page that sent the user to log in. */
  redirect?: string;
};

export function savePendingVerification(email: string, resendCooldownSeconds: number, redirect?: string): void {
  const pending: PendingVerification = {
    email,
    resendAvailableAt: Date.now() + Math.max(0, resendCooldownSeconds) * 1000,
    ...(redirect ? { redirect } : {}),
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* Storage blocked: /verify-email asks for the address instead. */
  }
}

export function readPendingVerification(): PendingVerification | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingVerification>;
    if (typeof parsed.email !== 'string' || !parsed.email) return null;
    return {
      email: parsed.email,
      resendAvailableAt: typeof parsed.resendAvailableAt === 'number' ? parsed.resendAvailableAt : 0,
      redirect: typeof parsed.redirect === 'string' ? parsed.redirect : undefined,
    };
  } catch {
    return null;
  }
}

export function clearPendingVerification(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing to clear. */
  }
}

/** Same-site paths only, so a crafted `redirect` can't send a freshly signed-in user elsewhere. */
export function safeRedirectPath(value: string | null | undefined): string | undefined {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return undefined;
}
