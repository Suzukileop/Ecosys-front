// Reel: per scroll mode, scrolls through each role and measures text contrast/size, clipping, tap targets, overflow.
const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const w = Number(process.argv[2] || 1440);
const modes = (process.argv[3] || 'x').split(',');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'no-preference' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  for (const mode of modes) {
    await p.evaluate(([mode]) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { experience: { experienceDesign: 'legacy', enabled: true } } }, location.origin), [mode]);
    await p.waitForTimeout(9000);
    const res = await frame.evaluate(async ([mode]) => {
      const parse = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const v = m.map(Number); if (c.startsWith('color(')) return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; return [v[0], v[1], v[2], v[3] ?? 1]; };
      const lum = (r, g, b) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bgOf = (el) => { let layers = []; let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) layers.push(c); if (c && c[3] >= 1) break; e = e.parentElement; } let base = [11, 11, 11]; for (const l of layers.reverse()) base = base.map((v, i) => l[i] * l[3] + v * (1 - l[3])); return base; };
      const s = document.getElementById('experience'); const out = new Map(); const clipped = []; const small = new Map();
      const top0 = s.getBoundingClientRect().top + scrollY; const H = s.getBoundingClientRect().height;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = innerHeight * 0.5;
      for (let y = top0 - 100; y < top0 + H; y += step) {
        scrollTo(0, y); await sleep(1500);
        for (const el of s.querySelectorAll('h3,p,li,span,a,button,div')) {
          const r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
          if (el.matches('a,button')) { if (r.height < 40 || r.width < 40) small.set((el.textContent || '').trim().slice(0, 24), `${Math.round(r.width)}x${Math.round(r.height)}`); }
          if ([...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).length === 0) continue;
          const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
          let op = 1; let e = el; while (e && e !== s) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
          if (op < 0.95) continue;
          const t = el.textContent.trim().slice(0, 26); const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const a = fg[3];
          const mix = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)); const L1 = lum(...mix), L2 = lum(...bg);
          const ratio = Math.round(((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)) * 10) / 10;
          const size = Math.round(parseFloat(cs.fontSize) * 10) / 10; const bold = parseInt(cs.fontWeight) >= 700;
          const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
          out.set(t + '|' + size, { t, size, w: cs.fontWeight, style: cs.fontStyle, ratio, need });
          if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') clipped.push(t);
          if (r.right > innerWidth + 1 || r.left < -1) clipped.push('OFFSCREEN ' + t);
          // clipped by overflow-hidden ancestor
          let a2 = el.parentElement; while (a2 && a2 !== s) { const c2 = getComputedStyle(a2); if (/hidden|clip/.test(c2.overflowX + c2.overflowY)) { const r2 = a2.getBoundingClientRect(); if (r.right > r2.right + 2 || r.bottom > r2.bottom + 2 || r.left < r2.left - 2) clipped.push('CLIP ' + t); break; } a2 = a2.parentElement; }
        }
      }
      return { mode, sw: document.documentElement.scrollWidth, iw: innerWidth, h: Math.round(H), small: [...small], clipped: [...new Set(clipped)], rows: [...out.values()] };
    }, [mode]);
    console.log(`== ${mode} @${w} sw=${res.sw}/${res.iw} h=${res.h} small=${JSON.stringify(res.small)} clipped=${JSON.stringify(res.clipped)}`);
    for (const r of res.rows) { const flag = r.ratio < r.need ? ' LOW' : r.size < 12 ? ' SMALL' : r.style === 'italic' ? ' ITALIC' : ''; console.log(`${String(r.size).padStart(5)} w${r.w} ${r.ratio}:1 "${r.t}"${flag}`); }
  }
  await b.close();
})();
