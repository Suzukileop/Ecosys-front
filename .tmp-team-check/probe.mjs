import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
await page.goto('http://localhost:3000/tmp-team-designs-check', { waitUntil: 'networkidle', timeout: 120000 });
await page.locator('#portrait-rail').scrollIntoViewIfNeeded();
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const h = document.querySelector('#portrait-rail h3');
  const art = h?.closest('article');
  const cs = h ? getComputedStyle(h) : null;
  return {
    name: h?.textContent,
    color: cs?.color,
    opacity: cs?.opacity,
    inlineStyle: h?.getAttribute('style'),
    articleInline: art?.getAttribute('style'),
    articleOpacity: art ? getComputedStyle(art).opacity : null,
    articleTransform: art ? getComputedStyle(art).transform : null,
    bodyFilter: getComputedStyle(document.body).filter,
    articleBg: art ? getComputedStyle(art).backgroundColor : null,
    articleBorder: art ? getComputedStyle(art).borderColor : null,
    articleHTMLHead: art?.outerHTML.slice(0, 260),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
