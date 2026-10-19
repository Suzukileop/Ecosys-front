const path = require('path');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/zz-harness', (r) => r.fulfill({ contentType: 'text/html', body: '<body style="margin:0"><iframe id="f" src="/portfolio/tester1?embed=1" style="width:1440px;height:880px;border:0"></iframe></body>' }));
  await p.goto('http://localhost:3000/zz-harness', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(9000);
  const frame = p.frames().find((f) => f.url().includes('/portfolio/tester1'));
  for (const design of ['editorial', 'stacked', 'split-overlap']) {
    const row = [];
    for (const textSize of ['small', 'medium', 'xlarge']) {
      await p.evaluate(([design, textSize]) => {
        document.getElementById('f').contentWindow.postMessage({ source: 'skraft-portfolio-studio', type: 'apply-settings', settings: { aboutUs: { design, enabled: true, showQuote: true, showFounder: true, showTasks: true, showCta: true, textSize } } }, location.origin);
      }, [design, textSize]);
      await p.waitForTimeout(2200);
      row.push(textSize + ': ' + (await frame.evaluate(() => {
        const s = document.getElementById('aboutUs');
        const fs = (sel) => { const e = s.querySelector(sel); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10 : null; };
        return JSON.stringify({ h3: fs('h3'), li: fs('li'), p: fs('h3 ~ p, h3 + div p, p.text-pretty'), bq: fs('blockquote'), cta: fs('a[href]') });
      })));
    }
    console.log(design, '\n  ' + row.join('\n  '));
  }
  await b.close();
})();
