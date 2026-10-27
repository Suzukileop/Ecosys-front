const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const tag = process.argv[2];
const url = process.argv[3];
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h] of [['desktop', 1440, 900], ['tablet', 768, 1024], ['phone', 375, 812]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(__dirname, `${tag}-${name}.png`), fullPage: true });
    if (name !== 'tablet') {
      const rows = await p.evaluate(() => {
        const out = [];
        for (const el of document.body.querySelectorAll('h2,h3,h4,p,li,span,a,button')) {
          if (el.children.length > 1) continue;
          const t = (el.textContent || '').trim().slice(0, 34);
          if (!t) continue;
          const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          out.push(`${el.tagName.toLowerCase()} "${t}" ${Math.round(parseFloat(cs.fontSize) * 10) / 10}/${Math.round(parseFloat(cs.lineHeight) || 0)} w${cs.fontWeight} ls${cs.letterSpacing} x${Math.round(r.x)} y${Math.round(r.y)} w${Math.round(r.width)}`);
        }
        return out;
      });
      console.log('==', name, w); console.log(rows.slice(0, 70).join('\n'));
    }
    await p.close();
  }
  await b.close();
})();
