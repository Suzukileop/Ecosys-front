import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });
await page.locator('#cover-cards').scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);
const info = await page.evaluate(() => {
  const veil = document.querySelector('#cover-cards article span[aria-hidden]');
  const h3 = document.querySelector('#cover-cards article h3');
  return {
    hoverNone: matchMedia('(hover: none)').matches,
    anyHover: matchMedia('(any-hover: none)').matches,
    pointerCoarse: matchMedia('(pointer: coarse)').matches,
    veilClass: veil?.className,
    veilOpacity: veil ? getComputedStyle(veil).opacity : null,
    veilTransform: veil ? getComputedStyle(veil).transform : null,
    h3Opacity: h3 ? getComputedStyle(h3).opacity : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
