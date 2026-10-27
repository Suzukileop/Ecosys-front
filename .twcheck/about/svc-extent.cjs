const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const design = process.argv[2]; const w = Number(process.argv[3] || 1440);
(async () => {
  const b = await chromium.launch();
  for (let attempt = 0; attempt < 4; attempt++) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
    await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(9000);
    const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
    await p.evaluate((design) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: design, enabled: true } } }, location.origin), design);
    await p.waitForTimeout(3000);
    const r = await frame.evaluate(() => {
      const s = document.getElementById('services'); if (!/What i offer/.test(s.innerText)) return null;
      const sr = s.getBoundingClientRect();
      const items = [...s.querySelectorAll('h3')].map((h) => { let row = h; for (let i = 0; i < 6 && row.parentElement && row.parentElement !== s; i++) { if (row.getBoundingClientRect().width > sr.width * 0.8) break; row = row.parentElement; } const rr = row.getBoundingClientRect(); const texts = [...row.querySelectorAll('h3,p,li,a,span,img,video')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0); const maxX = Math.max(...texts.map((r) => r.right)); return { title: h.textContent.slice(0, 20), rowW: Math.round(rr.width), rowH: Math.round(rr.height), contentRight: Math.round(maxX - rr.left), imgs: row.querySelectorAll('img,video').length }; });
      return { sectionW: Math.round(sr.width), items };
    });
    await p.close();
    if (r) { console.log(JSON.stringify(r)); break; }
  }
  await b.close();
})();
