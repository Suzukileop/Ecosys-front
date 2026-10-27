const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  for (const w of [1440, 768, 375]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
    await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(9000);
    const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
    for (const layout of ['grid', 'monolith', 'bento']) {
      await p.evaluate((layout) => {
        document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: 'services-pricing', enabled: true, pricingCards: { layout } } } }, location.origin);
      }, layout);
      await p.waitForTimeout(2500);
      await frame.evaluate(() => document.getElementById('services')?.scrollIntoView());
      await p.waitForTimeout(1500);
      const h = await frame.evaluate(() => { const s = document.getElementById('services'); if (!s) return 0; s.scrollIntoView(); return Math.round(s.getBoundingClientRect().height); });
      await p.setViewportSize({ width: w, height: Math.min(Math.max(h + 40, 900), 3000) });
      await p.evaluate((h) => { document.getElementById('f').style.height = h + 'px'; }, Math.min(Math.max(h + 40, 900), 3000));
      await p.waitForTimeout(1200);
      await frame.evaluate(() => document.getElementById('services')?.scrollIntoView());
      await p.waitForTimeout(800);
      await p.screenshot({ path: path.join(__dirname, `sr2-${layout}-${w}.png`) });
      console.log(layout, w, 'section height', h);
    }
    await p.close();
  }
  await b.close();
})();
