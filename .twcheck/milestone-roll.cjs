const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const css = fs.readFileSync('components/portfolio/portfolio-experience-milestone-details.module.css', 'utf8');
  const globalCss = fs.readFileSync('app/globals.css', 'utf8').replace(/\r\n/g, '\n');
  const start = globalCss.indexOf(".pf-theme-root[data-pf-color-transitions='true']\n  *:not");
  assert(start >= 0, 'Global theme transition rule must be included');
  const themeRule = globalCss.slice(start, globalCss.indexOf('}', start) + 1);
  const source = fs.readFileSync('components/portfolio/portfolio-experience-lists.tsx', 'utf8');
  assert(source.includes('className={milestoneDetails.rollTrack} data-pf-no-color-transition=""'));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, reducedMotion: 'no-preference' });
    await page.setContent(`<style>${css}\n${themeRule}</style><div class="pf-theme-root" data-pf-color-transitions="true"><div class="card" style="padding:40px;font:500 48px/1.14 Arial;width:800px"><span class="rollWord"><span class="rollCharacter" style="--roll-delay:0ms"><span class="rollTrack" data-pf-no-color-transition><span>A</span><span class="rollCopy">A</span></span></span></span></div></div>`);
    const track = page.locator('.rollTrack');
    await track.evaluate(el => el.removeAttribute('data-pf-no-color-transition'));
    assert(!(await track.evaluate(el => getComputedStyle(el).transitionProperty)).includes('transform'), 'Reproduce original theme conflict');
    await track.evaluate(el => el.setAttribute('data-pf-no-color-transition', ''));
    const transition = await track.evaluate(el => getComputedStyle(el).transitionProperty);
    assert(transition.includes('transform'), `Unexpected transition: ${transition}`);
    await page.locator('.card').hover();
    await page.waitForTimeout(700);
    const hovered = await track.evaluate(el => ({ transform: getComputedStyle(el).transform, height: el.getBoundingClientRect().height }));
    assert(Math.abs(Number(hovered.transform.split(',')[5].replace(')', '')) + hovered.height) < 1, 'Letter should roll up by one line');
    await page.mouse.move(1200, 800);
    await page.waitForTimeout(600);
    const reset = await track.evaluate(el => getComputedStyle(el).transform);
    assert(reset === 'matrix(1, 0, 0, 1, 0, 0)' || reset === 'none', `Return failed: ${reset}`);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.card').hover();
    assert.equal(await track.evaluate(el => getComputedStyle(el).transform), 'none');
    console.log('PASS: theme transition isolation, hover roll, hover exit, reduced motion');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
