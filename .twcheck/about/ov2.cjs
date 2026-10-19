const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  for (const w of [320, 768, 1024, 1440, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    await p.goto('http://localhost:3000/portfolio/tester1?embed=1&previewSection=aboutUs&previewDesign=split-overlap', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    console.log(w, await p.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth, imgs: [...document.querySelectorAll('img')].map((i) => { const r = i.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }) })));
    await p.close();
  }
  await b.close();
})();
