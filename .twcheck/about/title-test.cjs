const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  for (const w of [1440, 375]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: `<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:${w}px;height:880px;border:0"></iframe></body>` }));
    await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(9000);
    const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
    const out = [];
    for (const [label, extra] of [['auto', {}], ['auto small', { textSize: 'small' }], ['auto xlarge', { textSize: 'xlarge' }], ['custom 120 red', { editorialTitleSizePx: 120, editorialTitleColor: '#ff0000' }], ['custom 120 + xlarge', { editorialTitleSizePx: 120, textSize: 'xlarge' }], ['custom 40', { editorialTitleSizePx: 40 }]]) {
      await p.evaluate((extra) => {
        document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design: 'editorial', enabled: true, showQuote: true, showFounder: true, showTasks: true, showCta: true, ...extra } } }, location.origin);
      }, extra);
      await p.waitForTimeout(2200);
      out.push(label + ': ' + (await frame.evaluate(() => { const h = document.querySelector('#aboutUs h3'); const cs = getComputedStyle(h); return `${cs.fontSize} ${cs.color}`; })));
    }
    console.log(w + 'px viewport\n  ' + out.join('\n  '));
    await p.close();
  }
  await b.close();
})();
