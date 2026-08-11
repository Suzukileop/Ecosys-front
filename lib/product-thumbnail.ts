export const THUMBNAIL_VIDEO_MAX_SECONDS = 30;

const VIDEO_THUMBNAIL_EXT = /\.(mp4|webm|mov)(\?|#|$)/i;

export function isVideoThumbnailUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return VIDEO_THUMBNAIL_EXT.test(trimmed);
}

export function isAllowedThumbnailFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type);
}

export function getVideoFileDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Durée vidéo illisible.'));
        return;
      }
      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Impossible de lire la vidéo.'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function secondsToDurationLabel(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
