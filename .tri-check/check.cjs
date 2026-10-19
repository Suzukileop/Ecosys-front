const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const wp = require('next/dist/compiled/webpack/webpack');
async function main() {
  await new Promise((resolve,reject) => wp.webpack({
    mode:'development', devtool:false, entry:path.join(__dirname,'entry.tsx'),
    output:{path:path.join(__dirname,'build'),filename:'faq.js'},
    resolve:{extensions:['.tsx','.ts','.js']},
    module:{rules:[{test:/\.tsx?$/,use:path.join(__dirname,'../.masonry-check/loader.cjs')}]},
  },(err,stats) => err || stats.hasErrors() ? reject(err || new Error(stats.toString())) : resolve()));
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const css=fs.readFileSync(path.join(__dirname,'../app/globals.css'),'utf8');
    await page.setContent('<div id="root"></div>');
    await page.addStyleTag({content:`body{margin:48px;font-family:Arial}@media(max-width:768px){body{margin:24px}}.pf-faq-tri{--pf-faq-q-size:1.4rem;--pf-faq-a-size:1.15rem;--pf-palette-principal:#b74116}`+css.slice(css.indexOf('/* ---------- Tri Grid'),css.indexOf('/* ---------- Split Index'))});
    await page.addScriptTag({path:path.join(__dirname,'build/faq.js')});
    const blocks=page.getByRole('listitem'); await blocks.first().waitFor();
    for(const [width,expected] of [[1920,3],[1440,3],[900,2],[768,2],[375,1],[320,1]]) {
      await page.setViewportSize({width,height:1000});
      const cols=await page.locator('.pf-faq-tri-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(cols,expected,`Columns at ${width}`);
      for(let i=0;i<6;i++) {
        assert((await blocks.nth(i).innerText()).startsWith(`Question ${i+1}`));
        assert((await blocks.nth(i).innerText()).includes('<texte> & contenu préservé.'));
      }
      await blocks.first().hover();
      const states=await blocks.evaluateAll(els=>els.map(el=>[getComputedStyle(el).opacity,getComputedStyle(el).filter]));
      assert(states.every(([o,f])=>o==='1'&&f==='none'));
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width===1440||width===375) await page.screenshot({path:path.join(__dirname,`${width}.png`),fullPage:true});
    }
    await page.setViewportSize({width:1440,height:1000});
    for(const n of [1,2,3,5,8,12]) {
      await page.evaluate(n=>window.renderFaq(n),n);await page.waitForTimeout(30);
      assert.equal(await blocks.count(),n);
      assert.equal(await page.locator('.pf-faq-tri-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),Math.min(n,3));
    }
    for(const mode of ['light','dark']) {
      await page.evaluate(m=>window.renderFaq(6,m),mode);await page.waitForTimeout(30);
      const ratios=await page.locator('.pf-faq-tri').evaluate(el=>{
        const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
        const ctx=canvas.getContext('2d');
        const lum=color=>{
          ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
          const v=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});
          return .2126*v[0]+.7152*v[1]+.0722*v[2];
        };
        const bg=lum(getComputedStyle(el).getPropertyValue('--pft-fond'));
        return ['.pf-faq-tri-q','.pf-faq-tri-a'].map(s=>{const t=lum(getComputedStyle(el.querySelector(s)).color);return(Math.max(bg,t)+.05)/(Math.min(bg,t)+.05)});
      });
      assert(ratios.every(r=>r>=4.5),`Contrast ${mode}: ${ratios}`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});await blocks.first().hover();
    assert.equal(await blocks.first().evaluate(el=>getComputedStyle(el).transform),'none');
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: responsive 1/2/3 columns, source order, 1–12 items, readable hover, text preservation, no overflow 320–1920, light/dark contrast, reduced motion.');
  } finally {await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
