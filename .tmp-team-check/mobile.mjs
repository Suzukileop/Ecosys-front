import { chromium, devices } from 'playwright';
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

const out = fileURLToPath(new URL('./shots-mobile/', import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });

for (const layout of LAYOUTS) {
  const section = page.locator(`#${layout}`);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2200);
  await section.screenshot({ path: `${out}${layout}.png` });
  const overflow = await page.evaluate(() => ({
    docWidth: document.documentElement.scrollWidth,
    winWidth: window.innerWidth,
  }));
  if (overflow.docWidth > overflow.winWidth + 1) {
    console.log(`horizontal overflow at ${layout}:`, overflow);
  }
}

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
