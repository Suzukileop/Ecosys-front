/** Paramètres d'export vidéo (alignés CapCut). */
export type ExportResolution = '480p' | '720p' | '1080p';
export type ExportQuality = 'recommended' | 'high' | 'low';
export type ExportVideoFormat = 'mp4';

export interface ExportSettings {
  fileName: string;
  resolution: ExportResolution;
  quality: ExportQuality;
  fps: 24 | 30 | 60;
  format: ExportVideoFormat;
}

export const EXPORT_RESOLUTION_OPTIONS: { value: ExportResolution; label: string }[] = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
];

export const EXPORT_QUALITY_OPTIONS: { value: ExportQuality; label: string }[] = [
  { value: 'recommended', label: 'Qualité recommandée' },
  { value: 'high', label: 'Qualité élevée' },
  { value: 'low', label: 'Fichier plus léger' },
];

export const EXPORT_FPS_OPTIONS: { value: 24 | 30 | 60; label: string }[] = [
  { value: 24, label: '24 fps' },
  { value: 30, label: '30 fps' },
  { value: 60, label: '60 fps' },
];

export const EXPORT_FORMAT_OPTIONS: { value: ExportVideoFormat; label: string }[] = [
  { value: 'mp4', label: 'MP4' },
];

/** Nom par défaut type CapCut : YYYYMMDDHHmm */
export function defaultExportFileName(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}` +
    `${p(date.getHours())}${p(date.getMinutes())}`
  );
}

export function sanitizeExportFileName(raw: string): string {
  const trimmed = raw.trim().replace(/[^\w\-àâäéèêëïîôùûüç .]/gi, '');
  return trimmed.slice(0, 80) || defaultExportFileName();
}

export function exportFileNameFromTitle(title?: string | null): string {
  if (title?.trim()) {
    return sanitizeExportFileName(title.trim());
  }
  return defaultExportFileName();
}

export function defaultExportSettings(title?: string | null): ExportSettings {
  return {
    fileName: exportFileNameFromTitle(title),
    resolution: '720p',
    quality: 'recommended',
    fps: 30,
    format: 'mp4',
  };
}
