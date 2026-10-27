const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { getImageProps } = require('next/image');
const source = fs.readFileSync('lib/storage-media-url.ts', 'utf8');
const legacy = ['https://trademark-devel-counsel-flat.trycloudflare.com', 'https://absence-hollywood-presidential-episodes.trycloudflare.com'];
function moduleFor(origin, mode = 'development') {
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, URL, process: { env: { NODE_ENV: mode, NEXT_PUBLIC_API_URL: origin, NEXT_PUBLIC_STORAGE_LEGACY_ORIGINS: legacy.join(',') } } };
  vm.runInNewContext(code, context);
  context.exports.applyJSON = (method, value) => {
    context.method = method; context.input = JSON.stringify(value);
    return JSON.parse(JSON.stringify(vm.runInNewContext('exports[method](JSON.parse(input))', context)));
  };
  return context.exports;
}
const first = moduleFor('https://tunnel-a.trycloudflare.com');
const second = moduleFor('https://tunnel-b.trycloudflare.com');
const path = '/api/storage/content/public/225fdc2d-035e-4f6b-9643-e17b6dee162f/f74e4964-89da-4b2b-8eb9-baa9624156b0-Happy_brave_woman_with_super_hero_shadow.jpg';
for (const mode of ['development', 'production']) {
  const media = moduleFor('https://tunnel-b.trycloudflare.com', mode);
  assert.equal(media.restoreStorageUrlsDeep(path), (mode === 'production' ? 'https://tunnel-b.trycloudflare.com' : 'http://localhost:8080') + path);
  for (const origin of legacy) {
    const resolved = media.resolveStorageMediaUrl(origin + path);
    assert.equal(resolved, path);
    const { props } = getImageProps({ src: resolved, alt: 'Portrait', fill: true, sizes: '50vw' });
    assert(props.src.startsWith('/_next/image?'));
    assert(!props.src.includes('trycloudflare'));
    const payload = { teamMembers: [{ imageUrl: origin + path }], experienceBlocks: [{ mediaUrl: origin + path }], works: [{ imageUrl: origin + path }] };
    const normalized = media.applyJSON('normalizeStorageUrlsDeep', payload);
    assert.equal(normalized.teamMembers[0].imageUrl, path);
    assert.equal(normalized.experienceBlocks[0].mediaUrl, path);
    assert.equal(normalized.works[0].imageUrl, path);
    assert.equal(media.resolveStorageMediaUrl(origin + path + '?expires=123&signature=abc'), path + '?expires=123&signature=abc');
  }
  for (const external of ['https://images.unsplash.com/photo.jpg','https://bucket.r2.dev/photo.jpg','https://external.trycloudflare.com' + path,'https://absence-hollywood-presidential-episodes.trycloudflare.com.evil.example' + path,legacy[0] + '/other/image.jpg']) {
    assert.equal(media.resolveStorageMediaUrl(external), external);
  }
}
const saved = first.restoreStorageUrlsDeep(path);
assert.equal(saved, 'http://localhost:8080' + path);
assert.equal(second.normalizeStorageUrlsDeep(saved), path);
assert.equal(second.restoreStorageUrlsDeep(path), saved);
const nested = first.applyJSON('restoreStorageUrlsDeep', { teamMembers: [{imageUrl:path}] });
assert.equal(nested.teamMembers[0].imageUrl, saved);
const restored = second.applyJSON('normalizeStorageUrlsDeep', nested);
assert.equal(restored.teamMembers[0].imageUrl, path);
console.log('PASS: exact reported URL accepted by next/image after resolution; legacy aliases dev/prod; nested Team/Experience/Work; query preservation; external origins untouched; stable save across tunnel A/B.');
