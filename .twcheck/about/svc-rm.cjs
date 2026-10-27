const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
const layout = process.argv[2] || 'grid';
const w = Number(process.argv[3] || 1440);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: process.env.RM ? 'reduce' : 'no-preference' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate((layout) => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: 'services-pricing', enabled: true, pricingCards: { layout } } } }, location.origin), layout);
  await p.waitForTimeout(3000);
  const rows = await frame.evaluate(() => {
    const s = document.getElementById('services'); const out = [];
    for (const el of s.querySelectorAll('h2,h3,h4,p,li,span,a,button')) {
      if (el.children.length > 1) continue;
      const t = (el.textContent || '').trim().slice(0, 30); if (!t) continue;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (!r.width) continue;
      out.push(`${el.tagName.toLowerCase()} "${t}" ${Math.round(parseFloat(cs.fontSize) * 10) / 10}/${Math.round(parseFloat(cs.lineHeight) || 0)} w${cs.fontWeight} ls${cs.letterSpacing} c${cs.color} x${Math.round(r.x)}`);
    }
    return out;
  });
  console.log(rows.slice(0, 40).join('\n'));
  await b.close();
})();
