const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const wp = require('next/dist/compiled/webpack/webpack');
const dir = __dirname;
async function main() {
  await new Promise((resolve, reject) => wp.webpack({
    mode: 'development', devtool: false, entry: path.join(dir, 'entry.tsx'),
    output: { path: path.join(dir, 'build'), filename: 'faq.js' },
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    module: { rules: [{ test: /\.tsx?$/, use: path.join(dir, 'loader.cjs') }] },
  }, (error, stats) => error || stats.hasErrors() ? reject(error || new Error(stats.toString())) : resolve()));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const css = fs.readFileSync(path.join(dir, '../app/globals.css'), 'utf8');
    const start = css.indexOf('/* ---------- Editorial Masonry');
    const end = css.indexOf('/* ---------- Prism Cards', start);
    await page.setContent('<div id="root"></div>');
    await page.addStyleTag({ content: `body { margin: 64px; font-family: Arial; } .pf-faq-masonry { --pf-faq-q-size:1.4rem; --pf-faq-a-size:1.15rem; --pf-faq-label-size:.7rem; --pf-palette-fond:#fff; --pf-palette-texte-fort:#0a0a0a; --pf-palette-principal:#b74116; }` + css.slice(start, end) });
    await page.addStyleTag({ content: '@media(max-width:768px){body{margin:24px}}' });
    await page.addScriptTag({ path: path.join(dir, 'build/faq.js') });
    const rows = page.locator('.pf-faq-masonry-row');
    const buttons = page.locator('.pf-faq-masonry-trigger');
    await buttons.first().waitFor();
    await buttons.first().click();
    await page.waitForTimeout(520);
    await assert.doesNotReject(() => page.getByRole('region').first().waitFor());
    assert.equal(await page.getByRole('region').count(), 1);
    for (let i = 0; i < 12; i++) await buttons.nth(i % 6).hover();
    const states = await rows.evaluateAll(els => els.map(el => ({ opacity: getComputedStyle(el).opacity, filter: getComputedStyle(el).filter })));
    assert(states.every(s => s.opacity === '1' && s.filter === 'none'));
    assert((await page.getByRole('region').innerText()).includes('<texte> & contenu préservé.'));
    await page.screenshot({ path: path.join(dir, 'desktop.png'), fullPage: true });
    for (const count of [1, 2, 3, 4, 7, 12]) {
      await page.evaluate(n => window.renderFaq(n), count);
      await page.waitForTimeout(40);
      const cols = await page.locator('.pf-faq-masonry-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(cols, count < 4 ? 1 : 2);
    }
    await buttons.first().click();
    await page.waitForTimeout(520);
    for (const width of [1920, 1024, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(50);
      const sizes = await page.getByRole('region').evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight }));
      assert(sizes.scroll <= sizes.client + 1, `Clipped answer at ${width}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    }
    await page.screenshot({ path: path.join(dir, 'mobile.png'), fullPage: true });
    const panel = page.locator('.pf-faq-masonry-panel').first();
    const openHeight = await panel.evaluate(el => el.getBoundingClientRect().height);
    await buttons.first().click();
    await page.waitForTimeout(120);
    const intermediateHeight = await panel.evaluate(el => el.getBoundingClientRect().height);
    assert(intermediateHeight > 0 && intermediateHeight < openHeight, 'Closure must interpolate height');
    await page.waitForTimeout(440);
    assert.equal(await panel.evaluate(el => el.getBoundingClientRect().height), 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await buttons.first().click();
    await buttons.first().click();
    assert.equal(await page.getByRole('region').count(), 0);
    await buttons.nth(1).focus();
    await page.keyboard.press('Enter');
    assert.equal(await buttons.nth(1).getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('.pf-faq-masonry-panel').nth(1).evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    assert.equal(errors.length, 0, errors.join('\n'));
    console.log('PASS: hover, open-answer readability, exclusive accessible panels, text safety, 1–12 items, resize 320–1920, keyboard, reduced motion.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
