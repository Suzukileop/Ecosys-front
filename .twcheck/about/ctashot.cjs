const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 700, height: 640 } });
  await p.goto('http://localhost:3000/zz-cta-test', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, 'cta-rest.png') });
  const links = await p.$$('a[href="#"]');
  const boxes = [];
  for (const l of links) boxes.push(await l.boundingBox());
  // hover each in the light column (first 5), shot cropped
  for (const [i, l] of links.slice(0, 5).entries()) { await l.hover(); await p.waitForTimeout(700); await p.screenshot({ path: path.join(__dirname, `cta-hover-${i}.png`), clip: { x: 0, y: Math.max(0, boxes[i].y - 20), width: 350, height: boxes[i].height + 40 } }); }
  await b.close();
})();
