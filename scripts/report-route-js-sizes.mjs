/**
 * Client JavaScript loaded by each App Router page, read from a production build.
 * Turbopack builds no longer print this table.
 *
 *   NEXT_DIST_DIR=.next-build npx next build   (leaves the dev server's .next alone)
 *   node scripts/report-route-js-sizes.mjs .next-build
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.resolve(process.argv[2] || '.next');
const appDir = path.join(dist, 'server', 'app');
if (!fs.existsSync(appDir)) {
  console.error(`No build found in ${dist}`);
  process.exit(1);
}

const sizeCache = new Map();
const sizeOf = (rel) => {
  if (!sizeCache.has(rel)) {
    const file = path.join(dist, rel.replace(/^\/?_next\//, ''));
    const buf = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
    sizeCache.set(rel, { raw: buf.length, gz: buf.length ? zlib.gzipSync(buf).length : 0 });
  }
  return sizeCache.get(rel);
};

const manifests = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'page_client-reference-manifest.js') manifests.push(full);
  }
};
walk(appDir);

const rows = [];
for (const file of manifests) {
  const scope = {};
  new Function('globalThis', 'self', fs.readFileSync(file, 'utf8'))(scope, scope);
  for (const [route, manifest] of Object.entries(scope.__RSC_MANIFEST ?? {})) {
    const chunks = new Set(Object.values(manifest.entryJSFiles ?? {}).flat());
    let raw = 0;
    let gz = 0;
    for (const chunk of chunks) {
      const size = sizeOf(chunk);
      raw += size.raw;
      gz += size.gz;
    }
    rows.push({ route, chunks: chunks.size, raw, gz });
  }
}

rows.sort((a, b) => b.gz - a.gz);
const kb = (n) => String(Math.round(n / 1024)).padStart(7);
console.log('gzip KB | raw KB  | chunks | route');
for (const row of rows) {
  console.log(`${kb(row.gz)} | ${kb(row.raw)} | ${String(row.chunks).padStart(6)} | ${row.route}`);
}
