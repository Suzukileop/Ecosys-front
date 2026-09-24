import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:3000/portfolio/LeopardXY', { waitUntil: 'networkidle', timeout: 180000 });
await page.waitForTimeout(2500);
const team = page.locator('#team');
const has = await team.count();
let shot = null;
if (has) {
  await team.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await team.first().screenshot({ path: './shots/live-team.png' });
  shot = true;
}
console.log({ teamSectionCount: has, shot, errors: errors.slice(0, 6) });
await browser.close();
