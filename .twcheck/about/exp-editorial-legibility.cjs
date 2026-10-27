const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const w = Number(process.argv[2] || 1440);
const secId = 'experience';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate(() => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { experience: { experienceDesign: 'editorial', enabled: true } } }, location.origin));
  await p.waitForTimeout(9000);
  const measure = () => frame.evaluate((secId) => {
    const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); if (c.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lum = (r, g, b) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = (el) => { let layers = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) layers.push(c); if (c && c[3] >= 1) break; e = e.parentElement; } let base = [11, 11, 11]; for (const l of layers.reverse()) base = base.map((v, i) => l[i] * l[3] + v * (1 - l[3])); return base; };
    const s = document.getElementById(secId); const out = []; const small = [];
    for (const el of s.querySelectorAll('h2,h3,h4,p,li,span,a,button,div')) {
      const r = el.getBoundingClientRect();
      if ((el.tagName === 'BUTTON' || el.tagName === 'A') && r.width && (r.height < 40 || r.width < 40)) small.push(`${el.tagName} ${Math.round(r.width)}x${Math.round(r.height)} "${el.textContent.trim().slice(0, 20)}"`);
      if ([...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).length === 0) continue;
      const t = el.textContent.trim().slice(0, 28); const cs = getComputedStyle(el); if (!r.width || cs.visibility === 'hidden') continue;
      let op = 1; let e = el; while (e && e !== s) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
      const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const a = fg[3] * op;
      const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      const ratio = (Math.max(lum(...mix), lum(...bg)) + 0.05) / (Math.min(lum(...mix), lum(...bg)) + 0.05);
      const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
      out.push({ t, size: Math.round(size * 10) / 10, w: cs.fontWeight, style: cs.fontStyle, ratio: Math.round(ratio * 10) / 10, need: (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5 });
    }
    return { out, small, overflow: document.documentElement.scrollWidth - innerWidth, design: !!s.querySelector('article') };
  }, secId);
  const dump = (label, res) => {
    console.log(`== ${label} @${w} overflowX=${res.overflow} articles=${res.design}`);
    const seen = new Set();
    for (const r of res.out) { const k = `${r.t}|${r.size}`; if (seen.has(k)) continue; seen.add(k); const flag = r.ratio < r.need ? ' LOW-CONTRAST' : r.size < 12 ? ' SMALL' : r.style === 'italic' ? ' ITALIC' : ''; console.log(`${String(r.size).padStart(5)} w${r.w} ${String(r.ratio).padStart(5)}:1 "${r.t}"${flag}`); }
    console.log('small targets:', [...new Set(res.small)].join(' | '));
  };
  dump('initial', await measure());
  const btn = frame.locator('#experience article button[aria-expanded="false"]').first();
  if (await btn.count()) { await btn.click(); await p.waitForTimeout(2000); dump('after-expand-2nd', await measure()); }
  await b.close();
})();
