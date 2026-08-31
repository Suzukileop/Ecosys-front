/**
 * Builds a lookup manifest for TechIcons PNG bundle (public/tool-icons/png-512).
 * Run: node scripts/generate-tool-tech-icons-manifest.mjs
 *
 * Indexing rules (v2):
 * - Full filename stem as primary key (Red-Hat → redhat)
 * - Hyphen/paren fragments only when length >= MIN_PART_KEY_LEN (avoids hat, red, at…)
 * - No substring fuzzy matching at runtime — exact token lookup only
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'public', 'tool-icons', 'png-512');
const OUT_JSON = path.join(ROOT, 'components', 'creator', 'studio', 'creator-tool-tech-icons-manifest.json');
const PUBLIC_BASE = '/tool-icons/png-512';

/** Ignore short filename fragments — prevents chatgpt matching Red-Hat via "hat". */
const MIN_PART_KEY_LEN = 4;

/** Curated aliases (exact token match only at runtime). */
const MANUAL_ALIASES = {
  vscode: 'Visual-Studio-Code-(VS-Code).png',
  visualstudiocode: 'Visual-Studio-Code-(VS-Code).png',
  js: 'JavaScript.png',
  ts: 'TypeScript.png',
  node: 'Node.js.png',
  nodejs: 'Node.js.png',
  next: 'Next.js.png',
  nextjs: 'Next.js.png',
  vue: 'Vue.js.png',
  vuejs: 'Vue.js.png',
  reactjs: 'React.png',
  yt: 'YouTube.png',
  fb: 'Facebook.png',
  meta: 'Facebook.png',
  ig: 'Instagram.png',
  twitter: 'X.png',
  postgres: 'PostgreSQL.png',
  postgresql: 'PostgreSQL.png',
  mongo: 'MongoDB.png',
  golang: 'Go.png',
  cpp: 'C++.png',
  csharp: 'C#.png',
  dotnet: '.NET.png',
  springboot: 'Spring.png',
  aws: 'AWS.png',
  gcp: 'Google-Cloud.png',
  k8s: 'Kubernetes.png',
  kubernetes: 'Kubernetes.png',
};

function normalizeToolKey(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function keysForFilename(filename) {
  const stem = filename.replace(/\.png$/i, '');
  const keys = new Set();

  const add = (raw) => {
    const key = normalizeToolKey(raw);
    if (key.length >= 2) keys.add(key);
  };

  // Primary: entire stem (e.g. Red-Hat → redhat, Vue.js → vuejs)
  add(stem);

  const withoutParen = stem.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutParen && withoutParen !== stem) add(withoutParen);

  for (const match of stem.matchAll(/\(([^)]+)\)/g)) {
    add(match[1]);
    for (const part of match[1].split(/[-/,\s]+/)) {
      if (part.length >= MIN_PART_KEY_LEN) add(part);
    }
  }

  for (const part of stem.split(/[-/]+/)) {
    const clean = part.replace(/\s*\([^)]*\)/g, '').trim();
    if (clean.length >= MIN_PART_KEY_LEN) add(clean);
  }

  return keys;
}

function main() {
  if (!fs.existsSync(ICON_DIR)) {
    console.error(`Missing icon directory: ${ICON_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(ICON_DIR)
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b));

  /** @type {Record<string, string>} */
  const byKey = {};

  const register = (key, filename) => {
    if (!key || key.length < 2) return;
    const existing = byKey[key];
    if (!existing) {
      byKey[key] = filename;
      return;
    }
    // Prefer shorter canonical filenames on collision (React.png over React-Bootstrap.png).
    if (filename.length < existing.length) {
      byKey[key] = filename;
    }
  };

  for (const filename of files) {
    for (const key of keysForFilename(filename)) {
      register(key, filename);
    }
  }

  for (const [key, filename] of Object.entries(MANUAL_ALIASES)) {
    if (files.includes(filename)) {
      register(normalizeToolKey(key), filename);
    }
  }

  const manifest = {
    version: 2,
    source: 'https://techicons.dev/',
    publicBase: PUBLIC_BASE,
    iconCount: files.length,
    byKey,
  };

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${Object.keys(byKey).length} keys for ${files.length} icons → ${OUT_JSON}`);
}

main();
