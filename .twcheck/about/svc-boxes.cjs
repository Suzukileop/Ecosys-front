const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const design = process.argv[2]; const w = Number(process.argv[3] || 1440);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate((design) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: design, enabled: true } } }, location.origin), design);
  await p.waitForTimeout(3000);
  console.log(JSON.stringify(await frame.evaluate(() => {
    const s = document.getElementById('services'); const sr = s.getBoundingClientRect();
    const cards = [...s.querySelectorAll('[data-svc-card]')].map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y - sr.y), Math.round(r.width), Math.round(r.height)]; });
    return { section: [Math.round(sr.width), Math.round(sr.height)], cards };
  })));
  await b.close();
})();
