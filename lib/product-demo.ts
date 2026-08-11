import type { DemoType } from '@/types/marketplace';
import { isVideoThumbnailUrl } from '@/lib/product-thumbnail';

export function detectDemoTypeFromFile(file: File): DemoType {
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'FILE_EXTRACT';
}

export function detectDemoTypeFromUrl(url: string | null | undefined): DemoType {
  if (!url?.trim()) return 'NONE';
  if (isVideoThumbnailUrl(url)) return 'VIDEO';
  if (/\.(jpe?g|png|webp|gif)(\?|#|$)/i.test(url.trim())) return 'IMAGE';
  return 'FILE_EXTRACT';
}

export function demoTypeLabel(type: DemoType): string {
  switch (type) {
    case 'IMAGE':
      return 'Image';
    case 'VIDEO':
      return 'Video';
    case 'FILE_EXTRACT':
      return 'File extract';
    default:
      return 'None';
  }
}

export function isAllowedDemoMediaFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
}
