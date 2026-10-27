const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: '<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>' }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  for (const [label, style] of [['chevron', 'chevron'], ['disc', 'disc'], ['number', 'number'], ['none', 'none']]) {
    await p.evaluate((style) => {
      document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design: 'panorama', enabled: true, showTasks: true, taskBulletStyle: style } } }, location.origin);
    }, style);
    await p.waitForTimeout(2200);
    const r = await frame.evaluate(() => { const li = document.querySelector('#aboutUs ol li'); const kids = [...li.children].map((c) => { const b = c.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; }); return { display: getComputedStyle(li).display, kids }; });
    console.log(label, JSON.stringify(r));
  }
  await frame.evaluate(() => document.getElementById('aboutUs').scrollIntoView());
  await p.evaluate(() => document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design: 'panorama', enabled: true, showTasks: true, taskBulletStyle: 'chevron' } } }, location.origin));
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(__dirname, 'pano-bullet.png') });
  await b.close();
})();
