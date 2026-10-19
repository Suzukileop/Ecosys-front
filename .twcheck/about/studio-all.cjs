const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: '<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1280px;height:880px;border:0"></iframe></body>' }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  for (const design of ['stacked', 'split-overlap', 'split-founder', 'split-media-left', 'split-card', 'split-quote']) {
    await p.evaluate((design) => {
      document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design, enabled: true, showQuote: true, showFounder: true, showTasks: true, showCta: true, taskBulletStyle: 'arrow' } } }, location.origin);
    }, design);
    await p.waitForTimeout(2500);
    const r = await frame.evaluate(() => {
      const s = document.getElementById('aboutUs');
      const li = [...s.querySelectorAll('li')];
      return { lis: li.length, arrow: li.filter((l) => l.querySelector('svg path[d*="M4"]') || l.firstElementChild?.className?.includes('mt-1')).length, firstMarker: li[0]?.firstElementChild?.outerHTML.slice(0, 90), quote: !!s.querySelector('blockquote'), founder: /Leopard|CEO/i.test(s.innerText) };
    });
    console.log(design, JSON.stringify(r));
  }
  await b.close();
})();
