import type { ScheduledPostDto } from '@/types/scheduler';

export function formatAgentContentTitle(deliveryNumber?: number | null): string {
  if (deliveryNumber != null && deliveryNumber > 0) {
    return `Content #${deliveryNumber}`;
  }
  return 'Content';
}

export function getAgentContentDisplayTitle(post: ScheduledPostDto, platformLabel: string): string {
  if (post.deliveryNumber != null && post.deliveryNumber > 0) {
    return formatAgentContentTitle(post.deliveryNumber);
  }
  const caption = post.caption?.trim();
  if (caption) return caption;
  return platformLabel;
}

/** Optional agent caption (hidden when identical to auto title). */
export function getAgentContentSubtitle(
  post: ScheduledPostDto,
  displayTitle: string,
): string | null {
  const caption = post.caption?.trim();
  if (!caption || caption === displayTitle) return null;
  if (post.deliveryNumber != null && caption === formatAgentContentTitle(post.deliveryNumber)) {
    return null;
  }
  return caption;
}
