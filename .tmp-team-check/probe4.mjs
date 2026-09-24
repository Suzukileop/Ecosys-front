import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });
for (const id of ['cover-cards', 'hover-cards']) {
  const first = page.locator(`#${id} article`).nth(1);
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await first.screenshot({ path: `./shots-mobile/${id}-card.png` });
}
await browser.close();
