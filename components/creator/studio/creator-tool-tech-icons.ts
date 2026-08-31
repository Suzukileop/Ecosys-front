import manifest from '@/components/creator/studio/creator-tool-tech-icons-manifest.json';
import {
  buildCreatorToolIconLookupKeys,
  normalizeCreatorToolIconKey,
} from '@/components/creator/studio/creator-tool-icon-keys';

type TechIconManifest = {
  version: number;
  source: string;
  publicBase: string;
  iconCount: number;
  byKey: Record<string, string>;
};

const TECH_ICON_MANIFEST = manifest as TechIconManifest;
const BY_KEY = TECH_ICON_MANIFEST.byKey;

export const TOOL_TECH_ICONS_PUBLIC_BASE = TECH_ICON_MANIFEST.publicBase;
export const TOOL_TECH_ICONS_SOURCE_URL = TECH_ICON_MANIFEST.source;
export const TOOL_TECH_ICONS_COUNT = TECH_ICON_MANIFEST.iconCount;

export { normalizeCreatorToolIconKey };

function encodePublicIconPath(filename: string): string {
  return filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/** Public URL for a bundled TechIcons PNG filename. */
export function creatorToolTechIconPublicUrl(filename: string): string {
  const base = TOOL_TECH_ICONS_PUBLIC_BASE.replace(/\/$/, '');
  return `${base}/${encodePublicIconPath(filename)}`;
}

/**
 * Resolve a tool label to a bundled TechIcons PNG URL.
 * Exact token matches only — avoids false positives like chatgpt → Red Hat ("hat").
 */
export function resolveCreatorToolTechIconUrl(label: string): string | null {
  const lookupKeys = buildCreatorToolIconLookupKeys(label);
  let bestFile: string | null = null;
  let bestKeyLen = 0;

  for (const key of lookupKeys) {
    const file = BY_KEY[key];
    if (file && key.length > bestKeyLen) {
      bestFile = file;
      bestKeyLen = key.length;
    }
  }

  return bestFile ? creatorToolTechIconPublicUrl(bestFile) : null;
}

export function creatorToolHasTechIcon(label: string): boolean {
  return resolveCreatorToolTechIconUrl(label) != null;
}
