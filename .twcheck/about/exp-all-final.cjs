// Usage: node exp-all-final.cjs <width> [designs csv]. One line per defect, grouped by design/width.
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const w = Number(process.argv[2] || 1440);
const ALL = 'kinetic,editorial,milestone,table,cards,reel,duotone,gallery,loft,press,legacy'.split(',');
const designs = (process.argv[3] || ALL.join(',')).split(',');
const measure = async (frame) => frame.evaluate(async () => {
  const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); if (c.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; return [v[0], v[1], v[2], v[3] ?? 1]; };
  const lum = (r, g, b) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => { const layers = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) layers.push(c); if (c && c[3] >= 1) break; e = e.parentElement; } let base = [11, 11, 11]; for (const l of layers.reverse()) base = base.map((v, i) => l[i] * l[3] + v * (1 - l[3])); return base; };
  const s = document.getElementById('experience');
  if (!s) return { missing: true };
  const sig = [...new Set([...s.querySelectorAll('[class]')].flatMap((e) => String(e.className).split(/\s+/)))].sort().join(' ');
  let hash = 0; for (let i = 0; i < sig.length; i++) hash = (hash * 31 + sig.charCodeAt(i)) | 0;
  const issues = new Map(); const add = (k, v) => { if (!issues.has(k)) issues.set(k, v); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const top0 = s.getBoundingClientRect().top + scrollY; const H = s.getBoundingClientRect().height;
  const step = innerHeight * 0.6;
  for (let y = top0 - 100; y < top0 + H; y += step) {
    scrollTo(0, y); await sleep(900);
    for (const el of s.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button,div,dt,dd,td,th,figcaption,blockquote,time,small')) {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      let op = 1; let e = el; while (e && e !== s) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
      if (op < 0.3) continue;
      const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
      const t = (own || el.textContent.trim()).replace(/\s+/g, ' ').slice(0, 28);
      if (el.matches('a,button') && (r.height < 40 || r.width < 40) && (el.textContent.trim() || el.getAttribute('aria-label'))) add('TAP ' + t, `${Math.round(r.width)}x${Math.round(r.height)}`);
      if (!own) continue;
      const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const a = fg[3] * op;
      const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); const L1 = lum(...mix), L2 = lum(...bg);
      const ratio = Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 10) / 10;
      const size = Math.round(parseFloat(cs.fontSize) * 10) / 10; const bold = parseInt(cs.fontWeight) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      if (size < 12) add('SMALL ' + t, size + 'px');
      if (ratio < need) add('LOW ' + t, `${ratio}:1 (<${need}) ${size}px`);
      if (cs.fontStyle === 'italic') add('ITALIC ' + t, '');
      if (r.right > innerWidth + 1 || r.left < -1) add('OFFSCREEN ' + t, `${Math.round(r.left)}..${Math.round(r.right)}`);
      let a2 = el.parentElement; while (a2 && a2 !== s) { const c2 = getComputedStyle(a2); if (/hidden|clip/.test(c2.overflowX + c2.overflowY)) { const r2 = a2.getBoundingClientRect(); if (r.right > r2.right + 2 || r.bottom > r2.bottom + 2 || r.left < r2.left - 2) add('CLIP ' + t, ''); break; } a2 = a2.parentElement; }
    }
  }
  const sw = document.documentElement.scrollWidth;
  if (sw > innerWidth + 16) add('HOVERFLOW', `sw=${sw} iw=${innerWidth}`);
  return { hash, h: Math.round(H), issues: [...issues] };
});
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'no-preference' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  const seen = new Map();
  for (const d of designs) {
    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      await p.evaluate((d) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { experience: { experienceDesign: d, enabled: true } } }, location.origin), d);
      await p.waitForTimeout(9000);
      res = await measure(frame);
      const dup = !res.missing && [...seen].find(([k, v]) => v === res.hash && k !== d);
      if (!res.missing && !dup) break;
      res.stale = dup ? dup[0] : 'missing';
    }
    if (res.missing || res.stale) { console.log(`[${d} @${w}] UNRELIABLE (${res.stale})`); if (res.missing) continue; }
    seen.set(d, res.hash);
    if (!res.issues.length) { console.log(`[${d} @${w}] clean (h=${res.h})`); continue; }
    console.log(`[${d} @${w}] ${res.issues.length} defects (h=${res.h})`);
    for (const [k, v] of res.issues) console.log(`  ${k} ${v}`);
  }
  await b.close();
})();
