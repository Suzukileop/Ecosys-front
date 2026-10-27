// Lists every text element of the services section with size, weight and its real contrast.
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const design='milestone'; const key='experience'; const secId='experience';
const layouts = ['milestone'];
const w = Number(process.argv[2] || 1440);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  for (const layout of layouts) {
    await p.evaluate(([design, layout, key]) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { [key]: { experienceDesign: design, enabled: true } } }, location.origin), [design, layout, key]);
    await p.waitForTimeout(9000);
    const rows = await frame.evaluate((secId) => {
      const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); if (c.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; return [v[0], v[1], v[2], v[3] ?? 1]; };
      const lum = (r, g, b) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bgOf = (el) => { let layers = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) layers.push(c); if (c && c[3] >= 1) break; e = e.parentElement; } let base = [11, 11, 11]; for (const l of layers.reverse()) base = base.map((v, i) => l[i] * l[3] + v * (1 - l[3])); return base; };
      const s = document.getElementById(secId); const out = [];
      for (const el of s.querySelectorAll('h2,h3,p,li,span,a,button,div')) {
        if ([...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).length === 0) continue;
        const t = el.textContent.trim().slice(0, 28); const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (!r.width || cs.visibility === 'hidden') continue;
        let op = 1; let e = el; while (e && e !== s) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
        const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const a = fg[3] * op;
        const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
        const L1 = lum(...mix), L2 = lum(...bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
        const large = size >= 24 || (size >= 18.66 && bold);
        out.push({ t, size: Math.round(size * 10) / 10, w: cs.fontWeight, style: cs.fontStyle, ratio: Math.round(ratio * 10) / 10, need: large ? 3 : 4.5 });
      }
      return out;
    }, secId);
    const extra = await frame.evaluate((secId) => { const s=document.getElementById(secId); const d=document.documentElement; const small=[...s.querySelectorAll('a,button,[role=button]')].map(e=>{const r=e.getBoundingClientRect();return {t:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,24),w:Math.round(r.width),h:Math.round(r.height)};}).filter(x=>x.w&&(x.h<40||x.w<40)); const over=[...s.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(e=>e.className&&String(e.className).slice(0,50)); return {sw:d.scrollWidth,iw:innerWidth,small,over,h:Math.round(s.getBoundingClientRect().height)}; }, secId);
    console.log(JSON.stringify(extra));
    console.log('== ' + layout + ' @' + w);
    const seen = new Set();
    for (const r of rows) { const key = `${r.t}|${r.size}`; if (seen.has(key)) continue; seen.add(key); const flag = r.ratio < r.need ? ' LOW-CONTRAST' : r.size < 12 ? ' SMALL' : r.style === 'italic' ? ' ITALIC' : ''; console.log(`${String(r.size).padStart(5)} w${r.w} ${String(r.ratio).padStart(5)}:1  "${r.t}"${flag}`); }
  }
  await b.close();
})();
