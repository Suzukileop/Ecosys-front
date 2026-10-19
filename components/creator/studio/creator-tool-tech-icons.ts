import manifest from '@/components/creator/studio/creator-tool-tech-icons-manifest.json';
import { buildCreatorToolIconLookupKeys } from '@/components/creator/studio/creator-tool-icon-keys';

type TechIconManifest = {
  version: number;
  source: string;
  publicBase: string;
  iconCount: number;
  byKey: Record<string, string>;
};

const TECH_ICON_MANIFEST = manifest as TechIconManifest;
const BY_KEY = TECH_ICON_MANIFEST.byKey;

const TOOL_TECH_ICONS_PUBLIC_BASE = TECH_ICON_MANIFEST.publicBase;

function encodePublicIconPath(filename: string): string {
  return filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/** Public URL for a bundled TechIcons PNG filename. */
function creatorToolTechIconPublicUrl(filename: string): string {
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

/**
 * Bundled marks that are black / near-black with no light areas (measured from the PNGs:
 * mean luminance < 0.16, under 8% light pixels). They vanish on a dark surface.
 */
const DARK_TECH_ICON_FILES = new Set([
  'Apache-Kafka.png', 'Apple.png', 'Awk.png', 'CodePen.png', 'Core-js.png', 'Crystal.png',
  'Deno.png', 'Django.png', 'Express.png', 'Flask.png', 'Ghost.png', 'GitHub.png', 'Gitter.png',
  'Gradle.png', 'Handlebars.png', 'Helm.png', 'IFTTT.png', 'InfluxDB.png', 'LaTeX.png', 'Lua.png',
  'Markdown.png', 'Microsoft-SQL-Server.png', 'Mongoose.js.png', 'Next.js.png', 'Pandas.png',
  'pfSense.png', 'PureScript.png', 'Rust.png', 'Sema-Software.png', 'Socket.io.png',
  'Solidity.png', 'Splunk.png', 'SSH.png', 'Symfony.png', 'TeX.png', 'Three.js.png',
  'Unreal-Engine.png', 'Vercel.png', 'Vyper.png', 'YAML.png',
]);

/** Whether a bundled TechIcons URL is a dark mark that needs lifting on dark surfaces. */
export function creatorToolTechIconIsDark(url: string): boolean {
  const file = decodeURIComponent(url.split('/').pop() ?? '');
  return DARK_TECH_ICON_FILES.has(file);
}
