const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const tag = process.argv[2] || 'before';
const url = process.argv[3] || 'http://localhost:3000/portfolio/tester1?embed=1&previewSection=aboutUs&previewDesign=stacked';
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h] of [['desktop', 1440, 900], ['tablet', 768, 1024], ['phone', 375, 812], ['phone320', 320, 700]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(__dirname, `${tag}-${name}.png`), fullPage: true });
    if (name === 'desktop' || name === 'phone') {
      const rows = await p.evaluate(() => {
        const out = [];
        const root = document.querySelector('h3')?.closest('section') || document.body;
        for (const el of root.querySelectorAll('h2,h3,h4,p,li,blockquote,span,img,figure')) {
          const t = (el.textContent || '').trim().slice(0, 40);
          if (!t && el.tagName !== 'IMG') continue;
          const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          if (r.width === 0) continue;
          out.push(`${el.tagName.toLowerCase()} "${t}" ${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight} ls${cs.letterSpacing} x${Math.round(r.x)} w${Math.round(r.width)} h${Math.round(r.height)}`);
        }
        return out;
      });
      console.log('==', name, w); console.log(rows.join('\n'));
    }
    await p.close();
  }
  await b.close();
})();
