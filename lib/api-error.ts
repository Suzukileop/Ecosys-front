import { AxiosError } from 'axios';
import { ApiError } from '@/types/auth';
import { msg } from '@/lib/i18n/config';
import { tr } from '@/lib/i18n/I18nProvider';

/**
 * An error whose message was written for end users and can be shown as-is.
 * Any other `Error` is treated as technical: logged to the console, never displayed.
 */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

type ApiErrorBody = ApiError & { error?: string; code?: string; fieldErrors?: Record<string, string> };

const MAX_DISPLAYABLE_LENGTH = 240;

const TECHNICAL_PATTERNS: RegExp[] = [
  /exception/i,
  /\bjava\./i,
  /\bnull\b/i,
  /\bundefined\b/i,
  /\bsql\b/i,
  /stack\s*trace/i,
  /request failed with status code/i,
  /network error/i,
  /\bat [\w$.]+\(/,
  /[{}<>[\]]/,
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  /\b[0-9a-f]{16,}\b/i,
  /\b(is not defined|cannot read propert|is not a function)\b/i,
];

const NON_ENGLISH_PATTERN =
  /[àâäçéèêëîïôöùûüÿœæ]|\b(le|la|les|des|du|une|est|pas|introuvable|invalide|vous|votre|déjà|fichier|utilisateur|requête|erreur)\b/i;

/** True when a server-provided message is short, plain English and free of technical details. */
function isDisplayableMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  if (trimmed.length < 3 || trimmed.length > MAX_DISPLAYABLE_LENGTH) return false;
  if (NON_ENGLISH_PATTERN.test(trimmed)) return false;
  return !TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

const SESSION_EXPIRED = msg('Your session has expired. Please sign in again.');
const NO_PERMISSION = msg('You don’t have permission to do this.');

const CODE_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: msg('This account could not be found.'),
  EMAIL_ALREADY_EXISTS: msg('An account with this email already exists.'),
  USERNAME_ALREADY_EXISTS: msg('This username is already taken.'),
  INVALID_USERNAME: msg('This username isn’t valid. Use letters, numbers, dots or underscores.'),
  INVALID_CURRENT_PASSWORD: msg('Your current password is incorrect.'),
  PASSWORD_UNCHANGED: msg('Your new password must be different from the current one.'),
  FILE_TOO_LARGE: msg('This file is too large. Please choose a smaller one.'),
  INVALID_FILE_TYPE: msg('This file type isn’t supported.'),
  FILE_REQUIRED: msg('Please choose a file first.'),
  UPLOAD_FAILED: msg('The upload failed. Please try again.'),
  ALREADY_PURCHASED: msg('You already own this product.'),
  PRODUCT_GROUP_NAME_TAKEN: msg('A group with this name already exists.'),
  RATE_LIMIT_EXCEEDED: msg('Too many requests. Please try again in a minute.'),
  EMAIL_NOT_VERIFIED: msg('Please confirm your email address to continue.'),
  EMAIL_ALREADY_VERIFIED: msg('This email is already verified. You can log in.'),
  INVALID_VERIFICATION_CODE: msg('This code is incorrect. Check it and try again.'),
  VERIFICATION_CODE_EXPIRED: msg('This code has expired. Request a new one.'),
  VERIFICATION_TOO_MANY_ATTEMPTS: msg('Too many incorrect attempts. Request a new code.'),
  TOO_MANY_VERIFICATION_EMAILS: msg('You’ve requested too many codes. Please try again later.'),
  VERIFICATION_CODE_REQUIRED: msg('Enter the code we emailed you.'),
  PASSWORD_ALREADY_SET: msg('Your account already has a password.'),
  FORBIDDEN: NO_PERMISSION,
  COMMENT_FORBIDDEN: NO_PERMISSION,
  EXPIRED_REFRESH_TOKEN: SESSION_EXPIRED,
  INVALID_REFRESH_TOKEN: SESSION_EXPIRED,
  REVOKED_REFRESH_TOKEN: SESSION_EXPIRED,
};

function messageForCode(code: unknown): string | null {
  if (typeof code !== 'string' || code.length === 0) return null;
  const upper = code.toUpperCase();
  if (CODE_MESSAGES[upper]) return CODE_MESSAGES[upper];
  if (upper.startsWith('OAUTH_')) return msg('Sign-in with this provider failed. Please try again.');
  if (upper.startsWith('VPI_')) return msg('The payment couldn’t be completed. Please try again.');
  if (upper.endsWith('_NOT_FOUND')) return msg('We couldn’t find what you were looking for. It may have been removed.');
  if (upper.endsWith('_ACCESS_DENIED') || upper.endsWith('_FORBIDDEN')) return NO_PERMISSION;
  if (upper.endsWith('_NOT_ALLOWED')) return msg('This action isn’t allowed.');
  if (upper.endsWith('_TOO_LONG')) return msg('Some text is too long. Please shorten it.');
  if (upper.startsWith('TOO_MANY_')) return msg('You’ve reached the limit for this action.');
  if (upper.endsWith('_ALREADY_EXISTS') || upper.endsWith('_TAKEN')) return msg('This already exists.');
  return null;
}

function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return SESSION_EXPIRED;
    case 403:
      return NO_PERMISSION;
    case 404:
      return msg('We couldn’t find what you were looking for. It may have been removed.');
    case 409:
      return msg('This conflicts with existing data. Refresh the page and try again.');
    case 413:
      return msg('This file is too large. Please choose a smaller one.');
    default:
      return fallback;
  }
}

function humanizeField(field: string): string {
  const last = field.split('.').pop() ?? field;
  const words = last
    .replace(/\[\d+\]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Field';
}

function messageForFieldErrors(fieldErrors: Record<string, string>): string | null {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) return null;
  const [field, message] = entries.find(([, m]) => isDisplayableMessage(m)) ?? [];
  if (field && message) return `${humanizeField(field)}: ${message}`;
  return msg('Some fields are invalid. Please check your input.');
}

function isAxiosLike(error: unknown): error is AxiosError<ApiErrorBody> {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

/** The server's machine-readable error code (e.g. `EMAIL_NOT_VERIFIED`), when there is one. */
export function getApiErrorCode(error: unknown): string | null {
  if (!isAxiosLike(error)) return null;
  const code = error.response?.data?.code;
  return typeof code === 'string' && code.length > 0 ? code.toUpperCase() : null;
}

/**
 * Converts any thrown value into a message that is safe to show to users.
 * Technical details (stack traces, raw server messages, JS errors) are logged, never returned.
 */
export function getApiErrorMessage(error: unknown, fallback: string = msg('Something went wrong. Please try again.')): string {
  /* Messages below are English sources; the caller's fallback usually comes translated already. */
  return tr(resolveApiErrorMessage(error, fallback));
}

/*
 * A zod validation error, recognised by shape: `import { ZodError } from 'zod'` for one instanceof
 * pulled the whole zod library (~95 KB gzipped) into every page that shows an API error — public
 * portfolios included, which never validate anything with zod.
 */
function isZodErrorLike(error: unknown): error is { issues: Array<{ message?: unknown }> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'ZodError' &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof UserFacingError) return error.message;

  if (isZodErrorLike(error)) {
    const first = error.issues[0];
    return isDisplayableMessage(first?.message) ? first.message : msg('Some fields are invalid. Please check your input.');
  }

  if (isAxiosLike(error)) {
    const response = error.response;
    if (!response) {
      if (error.code === 'ERR_CANCELED') return fallback;
      return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? msg('The server took too long to respond. Please try again.')
        : msg('We can’t reach the server right now. Check your connection and try again.');
    }

    const { status } = response;
    if (status === 429) {
      const retryAfter = Number(response.headers?.['retry-after']);
      return Number.isFinite(retryAfter) && retryAfter > 0
        ? tr('Too many requests. Please try again in {seconds} seconds.', { seconds: retryAfter })
        : msg('Too many requests. Please try again in a minute.');
    }

    if (status >= 500) {
      /* A gateway / tunnel page (502-504, Cloudflare 52x, an HTML body) is infrastructure, not an app
         bug: one short warning instead of dumping the whole page through console.error (which opens
         the dev error overlay). Real backend 500s (JSON) stay errors. */
      const htmlBody = typeof response.data === 'string' && /^\s*<(!doctype|html)/i.test(response.data);
      if (htmlBody || status === 502 || status === 503 || status === 504 || (status >= 520 && status <= 530)) {
        console.warn(`[api error] ${status} — the server or its tunnel is unreachable right now`);
      } else {
        console.error('[api error]', status, response.data);
      }
      return fallback;
    }

    const data = (typeof response.data === 'object' && response.data !== null ? response.data : {}) as ApiErrorBody;

    if (data.fieldErrors && typeof data.fieldErrors === 'object') {
      const fieldMessage = messageForFieldErrors(data.fieldErrors);
      if (fieldMessage) return fieldMessage;
    }

    if (isDisplayableMessage(data.message)) return data.message.trim();

    const codeMessage = messageForCode(data.code) ?? messageForCode(data.error);
    if (codeMessage) return codeMessage;

    if (data.message) console.warn('[api error] hidden server message', status, data.message);
    return messageForStatus(status, fallback);
  }

  if (error !== undefined && error !== null) {
    console.error('[unexpected error]', error);
  }
  return fallback;
}
