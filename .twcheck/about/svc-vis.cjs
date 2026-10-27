const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: process.env.RM ? 'reduce' : 'no-preference' });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>` }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate(() => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { services: { sectionDesign: 'services-pricing', enabled: true, pricingCards: { layout: 'grid' } } } }, location.origin));
  await p.waitForTimeout(3000);
  console.log(JSON.stringify(await frame.evaluate(() => {
    const s = document.getElementById('services');
    const cta = [...s.querySelectorAll('a')].find((a) => /Get started/.test(a.textContent));
    const price = [...s.querySelectorAll('span')].find((a) => /On request|€/.test(a.textContent));
    const info = (e) => { if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); let o = 1, el = e; while (el && el !== s) { o *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } return { opacity: o, vis: cs.visibility, y: Math.round(r.y), h: Math.round(r.height), parentOverflow: getComputedStyle(e.parentElement).overflow }; };
    return { cta: info(cta), price: info(price), sectionTop: Math.round(s.getBoundingClientRect().top) };
  })));
  await b.close();
})();
