const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const w = Number(process.argv[2] || 1440);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'no-preference' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate(() => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { experience: { experienceDesign: 'loft', enabled: true } } }, location.origin));
  await p.waitForTimeout(9000);
  const measure = (scope) => frame.evaluate(async ([scope]) => {
    const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); if (c.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; return [v[0], v[1], v[2], v[3] ?? 1]; };
    const lum = (r, g, b) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = (el) => { let layers = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) layers.push(c); if (c && c[3] >= 1) break; e = e.parentElement; } let base = [11, 11, 11]; for (const l of layers.reverse()) base = base.map((v, i) => l[i] * l[3] + v * (1 - l[3])); return base; };
    const root = scope === 'modal' ? document.querySelector('[role=dialog]') : document.getElementById('experience');
    if (!root) return { none: true };
    const out = new Map(); const small = []; const clipped = [];
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect(); if (!r.width) continue;
      if (el.matches('a,button') && (r.height < 40 || r.width < 40)) small.push((el.getAttribute('aria-label')||el.textContent||'').trim().slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      if (r.right > innerWidth + 1 || r.left < -1) clipped.push('OFF ' + el.tagName + (el.textContent||'').trim().slice(0,20));
      if ([...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).length === 0) continue;
      const cs = getComputedStyle(el); let op = 1; let e = el; while (e && e !== root.parentElement) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
      const fg = parse(cs.color); const bg = bgOf(el); const a = fg[3] * op;
      const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); const L1 = lum(...mix), L2 = lum(...bg);
      const ratio = Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 10) / 10;
      const size = Math.round(parseFloat(cs.fontSize) * 10) / 10;
      out.set(el.textContent.trim().slice(0, 26) + size, { t: el.textContent.trim().slice(0, 26), size, w: cs.fontWeight, st: cs.fontStyle, ratio, op: Math.round(op*100)/100 });
    }
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, small, clipped: [...new Set(clipped)], rows: [...out.values()] };
  }, [scope]);
  const show = (n, r) => { console.log(`== ${n} @${w}`, r.sw, r.iw, JSON.stringify(r.small), JSON.stringify(r.clipped)); for (const x of r.rows || []) console.log(x.size, x.w, x.ratio + ':1', 'op' + x.op, x.st === 'italic' ? 'ITALIC' : '', JSON.stringify(x.t), x.size < 12 ? 'SMALL' : x.ratio < (x.size >= 24 ? 3 : 4.5) ? 'LOW' : ''); };
  await frame.evaluate(() => document.getElementById('experience').scrollIntoView());
  await p.waitForTimeout(1500);
  const cards = await frame.evaluate(() => { const s = document.getElementById('experience'); const c = [...s.querySelectorAll('button.pf-loft-card')]; return { n: c.length, rects: c.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width), Math.round(r.height)]; }), h: Math.round(s.getBoundingClientRect().height) }; });
  console.log('cards', JSON.stringify(cards));
  show('grid', await measure('grid'));
  await frame.evaluate(() => document.querySelector('#experience button.pf-loft-card').click());
  await p.waitForTimeout(1200);
  show('modal', await measure('modal'));
  const m = await frame.evaluate(() => { const d = document.querySelector('[role=dialog]'); const sc = d.querySelector('.overflow-y-auto'); return { sh: sc.scrollHeight, ch: sc.clientHeight, dw: d.scrollWidth, cw: d.clientWidth }; });
  console.log('modal scroll', JSON.stringify(m));
  await frame.keyboard?.press?.('ArrowRight');
  await b.close();
})();
