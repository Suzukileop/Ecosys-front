import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(1500);
const html = await page.content();
const i = html.indexOf('portrait-rail"');
console.log(html.slice(i, i + 1400));
await browser.close();
