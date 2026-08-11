import { AxiosError } from 'axios';
import { getApiErrorMessage } from '@/lib/api-error';

export function isConversationAccessDenied(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const status = (error as AxiosError).response?.status;
    if (status === 403) return true;
  }
  const message = getApiErrorMessage(error, '').toLowerCase();
  return (
    message.includes('expired') ||
    message.includes('participant') ||
    message.includes('access denied') ||
    message.includes('accès refusé')
  );
}
