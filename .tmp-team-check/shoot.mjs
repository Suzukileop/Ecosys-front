import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LAYOUTS = [
  'portrait-rail',
  'spotlight',
  'directory',
  'polaroid',
  'profile-cards',
  'hover-cards',
  'cover-cards',
  'avatar-cards',
  'float-cards',
];

const out = fileURLToPath(new URL('./shots/', import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });

for (const layout of LAYOUTS) {
  const section = page.locator(`#${layout}`);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2600);
  await section.screenshot({ path: `${out}${layout}.png` });
  // hover state: first card / row inside the section
  const card = section.locator('article').first();
  if (await card.count()) {
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 120));
      await page.waitForTimeout(950);
      await section.screenshot({ path: `${out}${layout}-hover.png` });
      await page.mouse.move(5, 5);
    }
  }
}

// Spotlight interaction: click the 4th thumbnail and capture the swap result.
const spotlight = page.locator('#spotlight');
await spotlight.scrollIntoViewIfNeeded();
const thumbs = spotlight.locator('[role="tab"]');
if (await thumbs.count() > 3) {
  await thumbs.nth(3).click();
  await page.waitForTimeout(1100);
  await spotlight.screenshot({ path: `${out}spotlight-swapped.png` });
}

// Portrait rail: drag it and capture the progress indicator moving.
const rail = page.locator('#portrait-rail');
await rail.scrollIntoViewIfNeeded();
const scroller = rail.locator('div.overflow-x-auto').first();
await scroller.evaluate((node) => { node.scrollLeft = node.scrollWidth; });
await page.waitForTimeout(800);
await rail.screenshot({ path: `${out}portrait-rail-end.png` });

console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
