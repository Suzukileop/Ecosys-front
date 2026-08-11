import { AxiosError } from 'axios';
import { ZodError } from 'zod';
import { ApiError } from '@/types/auth';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    if (first?.message) return first.message;
  }
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError & { fieldErrors?: Record<string, string> }>;
    if (axiosError.response?.status === 429) {
      const retryAfter = axiosError.response.headers?.['retry-after'];
      if (retryAfter) {
        return `Too many requests. Please try again in ${retryAfter} seconds.`;
      }
      return 'Too many requests. Please try again in a minute.';
    }
    const fieldErrors = axiosError.response?.data?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const details = Object.entries(fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' · ');
      if (details) return details;
    }
    const msg = axiosError.response?.data?.message;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
    if (typeof axiosError.message === 'string' && axiosError.message.length > 0) {
      return axiosError.message;
    }
  }
  return fallback;
}
