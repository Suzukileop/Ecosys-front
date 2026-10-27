const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
function edit(rel,fn){const f=path.join(root,rel);let s=fs.readFileSync(f,'utf8');const eol=s.includes('\r\n')?'\r\n':'\n';s=s.replace(/\r\n/g,'\n');
const rep=(a,b)=>{if(s.split(a).length!==2)throw new Error(rel+' need one: '+a.slice(0,70));s=s.replace(a,b);};fn(rep);fs.writeFileSync(f,s.replace(/\n/g,eol));}
edit('lib/storage-media-url.ts',rep=>{
rep(`/** URLs médias stockés (local /api/storage ou R2)`,`/**
 * Inverse of \`normalizeStorageUrlsDeep\`, applied to request bodies (dev only): the backend only accepts
 * absolute http(s) media URLs, so a same-origin \`/api/storage/…\` path read from an API payload must go
 * back out as an absolute URL, otherwise saving a profile fails with "Media URL must use http or https".
 */
export function restoreStorageUrlsDeep<T>(value: T): T {
  if (process.env.NODE_ENV === 'production') return value;
  return restoreValue(value) as T;
}

function restoreValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.startsWith(STORAGE_PATH_PREFIX) ? \`\${API_BASE}\${value}\` : value;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const restored = restoreValue(item);
      if (restored !== item) changed = true;
      return restored;
    });
    return changed ? next : value;
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const restored = restoreValue(item);
      if (restored !== item) changed = true;
      next[key] = restored;
    }
    return changed ? next : value;
  }
  return value;
}

/** URLs médias stockés (local /api/storage ou R2)`);
});
edit('lib/api.ts',rep=>{
rep(`import { normalizeStorageUrlsDeep } from './storage-media-url';`,`import { normalizeStorageUrlsDeep, restoreStorageUrlsDeep } from './storage-media-url';`);
rep(`  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;`,`  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (config.data && typeof config.data === 'object') {
    // Responses are rewritten to same-origin storage paths in dev; send them back as absolute URLs.
    config.data = restoreStorageUrlsDeep(config.data);
  }
  return config;`);
});
console.log('ok');
