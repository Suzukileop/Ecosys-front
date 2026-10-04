import { AxiosError } from 'axios';
import { ZodError } from 'zod';
import { ApiError } from '@/types/auth';

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
export function isDisplayableMessage(message: unknown): message is string {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  if (trimmed.length < 3 || trimmed.length > MAX_DISPLAYABLE_LENGTH) return false;
  if (NON_ENGLISH_PATTERN.test(trimmed)) return false;
  return !TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';
const NO_PERMISSION = 'You don’t have permission to do this.';

const CODE_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'This account could not be found.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken.',
  INVALID_USERNAME: 'This username isn’t valid. Use letters, numbers, dots or underscores.',
  INVALID_CURRENT_PASSWORD: 'Your current password is incorrect.',
  PASSWORD_UNCHANGED: 'Your new password must be different from the current one.',
  FILE_TOO_LARGE: 'This file is too large. Please choose a smaller one.',
  INVALID_FILE_TYPE: 'This file type isn’t supported.',
  FILE_REQUIRED: 'Please choose a file first.',
  UPLOAD_FAILED: 'The upload failed. Please try again.',
  ALREADY_PURCHASED: 'You already own this product.',
  INSUFFICIENT_CREDITS: 'You don’t have enough credits for this action.',
  PRODUCT_GROUP_NAME_TAKEN: 'A group with this name already exists.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again in a minute.',
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
  if (upper.startsWith('OAUTH_')) return 'Sign-in with this provider failed. Please try again.';
  if (upper.startsWith('VPI_')) return 'The payment couldn’t be completed. Please try again.';
  if (upper.endsWith('_NOT_FOUND')) return 'We couldn’t find what you were looking for. It may have been removed.';
  if (upper.endsWith('_ACCESS_DENIED') || upper.endsWith('_FORBIDDEN')) return NO_PERMISSION;
  if (upper.endsWith('_NOT_ALLOWED')) return 'This action isn’t allowed.';
  if (upper.endsWith('_TOO_LONG')) return 'Some text is too long. Please shorten it.';
  if (upper.startsWith('TOO_MANY_')) return 'You’ve reached the limit for this action.';
  if (upper.endsWith('_ALREADY_EXISTS') || upper.endsWith('_TAKEN')) return 'This already exists.';
  return null;
}

function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return SESSION_EXPIRED;
    case 403:
      return NO_PERMISSION;
    case 404:
      return 'We couldn’t find what you were looking for. It may have been removed.';
    case 409:
      return 'This conflicts with existing data. Refresh the page and try again.';
    case 413:
      return 'This file is too large. Please choose a smaller one.';
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
  const [field, msg] = entries.find(([, m]) => isDisplayableMessage(m)) ?? [];
  if (field && msg) return `${humanizeField(field)}: ${msg}`;
  return 'Some fields are invalid. Please check your input.';
}

function isAxiosLike(error: unknown): error is AxiosError<ApiErrorBody> {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

/**
 * Converts any thrown value into a message that is safe to show to users.
 * Technical details (stack traces, raw server messages, JS errors) are logged, never returned.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof UserFacingError) return error.message;

  if (error instanceof ZodError) {
    const first = error.issues[0];
    return isDisplayableMessage(first?.message) ? first.message : 'Some fields are invalid. Please check your input.';
  }

  if (isAxiosLike(error)) {
    const response = error.response;
    if (!response) {
      if (error.code === 'ERR_CANCELED') return fallback;
      return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? 'The server took too long to respond. Please try again.'
        : 'We can’t reach the server right now. Check your connection and try again.';
    }

    const { status } = response;
    if (status === 429) {
      const retryAfter = Number(response.headers?.['retry-after']);
      return Number.isFinite(retryAfter) && retryAfter > 0
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : 'Too many requests. Please try again in a minute.';
    }

    if (status >= 500) {
      console.error('[api error]', status, response.data);
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
