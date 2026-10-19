const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: '<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1280px;height:880px;border:0"></iframe></body>' }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  await p.evaluate(() => {
    const f = document.getElementById('f');
    f.contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design: 'split-overlap', enabled: true, showQuote: true, showFounder: true, showTasks: true, showCta: true, ctaStyle: 'outline', taskBulletStyle: 'arrow' } } }, location.origin);
  });
  await p.waitForTimeout(3000);
  await frame.evaluate(() => document.getElementById('aboutUs')?.scrollIntoView());
  await p.waitForTimeout(1500);
  const info = await frame.evaluate(() => ({
    hasSection: !!document.getElementById('aboutUs'),
    bq: document.querySelectorAll('#aboutUs blockquote').length,
    li: [...document.querySelectorAll('#aboutUs li')].slice(0, 3).map((l) => l.firstElementChild?.outerHTML.slice(0, 120)),
    text: (document.getElementById('aboutUs')?.innerText || '').slice(0, 500),
  }));
  console.log(JSON.stringify(info, null, 1));
  await p.screenshot({ path: path.join(__dirname, 'sim.png') });
  await b.close();
})();
