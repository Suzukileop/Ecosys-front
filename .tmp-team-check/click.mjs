import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });
await page.evaluate(() => {
  window.__clicks = [];
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a');
    if (a) window.__clicks.push({ href: a.getAttribute('href'), prevented: e.defaultPrevented });
  });
});
const rail = page.locator('#portrait-rail');
await rail.scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);
const link = rail.locator('a').first();
await link.click({ noWaitAfter: true, force: true });
await page.waitForTimeout(300);
// and a click right after a drag, which must be suppressed
const scroller = rail.locator('div.overflow-x-auto').first();
const box = await scroller.boundingBox();
await page.mouse.move(box.x + 200, box.y + 300);
await page.mouse.down();
for (let i = 1; i <= 8; i += 1) await page.mouse.move(box.x + 200 - i * 20, box.y + 300);
await page.mouse.up();
await page.waitForTimeout(300);
console.log(await page.evaluate(() => window.__clicks));
await browser.close();
