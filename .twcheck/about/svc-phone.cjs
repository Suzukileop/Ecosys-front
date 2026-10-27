const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  for (const layout of ['grid', 'monolith', 'bento']) {
    const p = await b.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:375px;height:812px;border:0"></iframe></body>` }));
    await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(10000);
    const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
    for (let i = 0; i < 2; i++) {
      await p.evaluate((layout) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: 'services-pricing', enabled: true, pricingCards: { layout } } } }, location.origin), layout);
      await p.waitForTimeout(2500);
    }
    const info = await frame.evaluate(() => { const s = document.getElementById('services'); const cards = s ? s.querySelectorAll('[data-svc-card]').length : -1; return { cards, h: s ? Math.round(s.getBoundingClientRect().height) : 0 }; });
    await p.setViewportSize({ width: 375, height: Math.min(info.h + 200, 3200) });
    await p.evaluate((h) => { document.getElementById('f').style.height = h + 'px'; }, Math.min(info.h + 200, 3200));
    await p.waitForTimeout(1500);
    await frame.evaluate(() => document.getElementById('services')?.scrollIntoView());
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(__dirname, `sp-${layout}.png`) });
    console.log(layout, JSON.stringify(info));
    await p.close();
  }
  await b.close();
})();
