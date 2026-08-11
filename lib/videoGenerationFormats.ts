export const VIDEO_PROMPT_MAX_LENGTH = 500;

// ─── Style visuel ────────────────────────────────────────────────────────────

export type VideoStyleId = 'cinematic' | 'realistic' | 'animated' | '3d' | 'documentary';

export interface VideoStyle {
  id: VideoStyleId;
  label: string;
  suffix: string;
}

export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'cinematic',
    label: 'Cinématique',
    suffix: ', cinematic lighting, film grain, dramatic atmosphere, anamorphic lens',
  },
  {
    id: 'realistic',
    label: 'Réaliste',
    suffix: ', photorealistic, natural lighting, high detail, lifelike',
  },
  {
    id: 'animated',
    label: 'Animé',
    suffix: ', animation style, vibrant colors, smooth fluid motion, stylized',
  },
  {
    id: '3d',
    label: '3D',
    suffix: ', 3D render, volumetric lighting, digital art, clean CGI',
  },
  {
    id: 'documentary',
    label: 'Documentaire',
    suffix: ', documentary style, natural raw footage, handheld feel, authentic',
  },
];

// ─── Mouvement de caméra ─────────────────────────────────────────────────────

export type CameraMovementId = 'static' | 'pan' | 'zoom' | 'drone' | 'handheld';

export interface CameraMovement {
  id: CameraMovementId;
  label: string;
  suffix: string;
}

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  { id: 'static', label: 'Statique', suffix: ', static camera' },
  { id: 'pan', label: 'Panoramique', suffix: ', smooth panning camera movement' },
  { id: 'zoom', label: 'Zoom', suffix: ', dynamic zoom effect' },
  { id: 'drone', label: 'Drone', suffix: ', aerial drone shot, bird\'s eye view' },
  { id: 'handheld', label: 'Épaule', suffix: ', shoulder mount, handheld camera' },
];

// ─── Format ──────────────────────────────────────────────────────────────────

export interface VideoFormat {
  id: string;
  label: string;
  aspectRatio: string;
}

export const VIDEO_FORMAT_PICKER: VideoFormat[] = [
  { id: '9:16', label: '9:16', aspectRatio: '9:16' },
  { id: '1:1', label: '1:1', aspectRatio: '1:1' },
  { id: '16:9', label: '16:9', aspectRatio: '16:9' },
  { id: '4:5', label: '4:5', aspectRatio: '4:5' },
];

// ─── Durée ───────────────────────────────────────────────────────────────────

export const VIDEO_DURATION_OPTIONS = [3, 5, 10, 15] as const;
export type VideoDurationOption = (typeof VIDEO_DURATION_OPTIONS)[number];

/** Mappe la durée UI vers la durée supportée par fal.ai (6 ou 10 secondes). */
export function mapToSupportedDuration(duration: VideoDurationOption): 6 | 10 {
  return duration <= 6 ? 6 : 10;
}

// ─── Qualité ─────────────────────────────────────────────────────────────────

export const VIDEO_QUALITY_LEVELS = [
  { value: 0, label: 'Rapide' },
  { value: 50, label: 'Standard' },
  { value: 100, label: 'Haute' },
] as const;

const QUALITY_SUFFIXES: Record<number, string> = {
  0: '',
  50: ', high quality',
  100: ', ultra high quality, 4K, highly detailed, sharp',
};

/** Mappe le format UI vers le format accepté par fal.ai (aspect_ratio). */
export function mapAspectRatioToFal(aspectRatio: string): string {
  const map: Record<string, string> = {
    '9:16': '9:16',
    '1:1': '1:1',
    '16:9': '16:9',
    '4:5': '3:4',
    '4:3': '4:3',
    '3:4': '3:4',
  };
  return map[aspectRatio] ?? '9:16';
}

// ─── Prompt builder ──────────────────────────────────────────────────────────

export function buildVideoPrompt(
  description: string,
  styleId: VideoStyleId,
  cameraId: CameraMovementId,
  quality: number
): string {
  const style = VIDEO_STYLES.find((s) => s.id === styleId);
  const camera = CAMERA_MOVEMENTS.find((c) => c.id === cameraId);
  const qualitySuffix = QUALITY_SUFFIXES[quality] ?? '';
  const base = description.trim();
  return (
    base +
    (style?.suffix ?? '') +
    (camera?.suffix ?? '') +
    qualitySuffix +
    ', smooth motion, seamless loop, social media background, no text, no people'
  );
}
