const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  for (const w of [320, 375, 768, 1024, 1440, 1920]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    await p.goto('http://localhost:3000/portfolio/tester1?embed=1&previewSection=aboutUs&previewDesign=stacked', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const h = document.querySelector('h3'); const para = h.nextElementSibling; const q = document.querySelector('blockquote');
      const cpl = (el) => Math.round(el.textContent.length / Math.max(1, Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))));
      return { scrollW: document.documentElement.scrollWidth, h3: getComputedStyle(h).fontSize, para: getComputedStyle(para).fontSize, charsPerLine: cpl(para), quote: getComputedStyle(q).fontSize };
    });
    console.log(w, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})();
