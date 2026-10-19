const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const wp=require('next/dist/compiled/webpack/webpack');
const postcss=require('postcss');
async function main(){
  const dir=__dirname, base=path.resolve(dir,'..');
  const stylesheet=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
  await new Promise((resolve,reject)=>wp.webpack({
    mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),
    output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
    resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'i18n.ts'),'next/dynamic':path.join(dir,'dynamic.tsx'),'@':base}},
    plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development',NEXT_PUBLIC_API_URL:'http://localhost:8080'})})],
    module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]},
  },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser:',e.message)});
    await page.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
    await page.route('http://font.test/**',route=>{
      const weight=route.request().url().includes('500')?'500':'400';
      return route.fulfill({contentType:'font/woff2',headers:{'access-control-allow-origin':'*'},body:fs.readFileSync(path.join(base,`node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff2`))});
    });
    await page.setContent('<div id="root"></div>');
    await page.addStyleTag({content:stylesheet.css+' @font-face{font-family:Inter;src:url(http://font.test/400.woff2);font-weight:400}@font-face{font-family:Inter;src:url(http://font.test/500.woff2);font-weight:500} body{padding:48px;font-family:Inter,sans-serif} @media(max-width:768px){body{padding:24px}}'});
    await page.addScriptTag({path:path.join(dir,'build/team.js')});
    const cards=page.locator('.team-rail-card'),rail=page.locator('.team-rail-scroller');
    await cards.first().waitFor({timeout:10000});await page.waitForTimeout(1600);
    assert.equal(await cards.count(),6);
    const font=await page.locator('.team-rail-name').first().evaluate(el=>({weight:getComputedStyle(el).fontWeight,size:parseFloat(getComputedStyle(el).fontSize)}));
    assert.equal(font.weight,'500');assert(font.size<=28);
    for(const mode of ['light','dark']){
      await page.evaluate(activeColorMode=>window.renderTeam(6,{activeColorMode}),mode);await page.waitForTimeout(750);
      assert.equal(await cards.count(),6);
      const ratios=await page.evaluate(()=>{
        const lum=color=>{
          const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
          const v=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2];
        };
        const bg=lum(getComputedStyle(document.body).backgroundColor);
        return ['.team-rail-name','.team-rail-role'].map(s=>{const t=lum(getComputedStyle(document.querySelector(s)).color);return(Math.max(t,bg)+.05)/(Math.min(t,bg)+.05)});
      });
      assert(ratios.every(r=>r>=4.5),`Text contrast ${mode}: ${ratios}`);
      for(const width of [1920,1440,1024,768,375,320]){
        await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Page overflow ${width}`);
        const nameOverflow=await page.locator('.team-rail-name').evaluateAll(els=>els.some(el=>el.scrollWidth>el.clientWidth+1));assert(!nameOverflow);
        const state=await cards.evaluateAll(els=>els.map(el=>({opacity:getComputedStyle(el).opacity,filter:getComputedStyle(el).filter})));assert(state.every(s=>s.opacity==='1'&&s.filter==='none'));
        const box=await page.locator('.team-rail-socials a').first().boundingBox();assert(box.width>=44&&box.height>=44);
        if(mode==='light'&&(width===1440||width===375))await page.screenshot({path:path.join(dir,`${width}.png`),fullPage:true});
      }
    }
    await page.setViewportSize({width:1024,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
    await rail.focus();await page.keyboard.press('End');await page.waitForTimeout(100);
    assert.equal(await page.getByRole('slider').getAttribute('aria-valuenow'),'6');
    await page.getByRole('slider').focus();
    const endLeft=await rail.evaluate(el=>el.scrollLeft);
    await page.keyboard.press('ArrowLeft');await page.waitForTimeout(100);
    assert(await rail.evaluate((el,end)=>el.scrollLeft<end,endLeft),'Slider must leave its end position');
    await rail.focus();
    await page.keyboard.press('Home');await page.waitForTimeout(100);assert.equal(await rail.evaluate(el=>el.scrollLeft),0);
    await page.getByRole('slider').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);assert(await rail.evaluate(el=>el.scrollLeft>0));
    await page.getByRole('slider').press('Home');await page.waitForTimeout(100);
    const rb=await rail.boundingBox();await page.mouse.move(rb.x+rb.width*.8,rb.y+150);await page.mouse.down();await page.mouse.move(rb.x+rb.width*.2,rb.y+150,{steps:12});await page.mouse.up();await page.waitForTimeout(120);assert(await rail.evaluate(el=>el.scrollLeft>0));
    await page.evaluate(()=>window.renderTeam(6,{railNavigation:'chevrons'}));await page.waitForTimeout(100);
    await page.getByRole('button',{name:'Next member'}).click();await page.waitForTimeout(100);assert(await rail.evaluate(el=>el.scrollLeft>0));
    for(const count of [1,2,3,6]){
      await page.evaluate(n=>window.renderTeam(n,{railNavigation:'show-all'}),count);await page.waitForTimeout(100);
      assert.equal(await cards.count(),count);assert.equal(await page.getByRole('slider').count(),0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.evaluate(()=>window.renderTeam(6));await page.setViewportSize({width:375,height:1000});await page.waitForTimeout(100);
    await rail.evaluate(el=>{el.scrollLeft=0});await page.waitForTimeout(100);
    const peek=await rail.evaluate(el=>el.getBoundingClientRect().right-el.children[1].getBoundingClientRect().left);assert(peek>=16,'Mobile next portrait should peek');
    await page.evaluate(()=>window.renderTeam(1));await page.waitForTimeout(100);assert.equal(await page.locator('.team-rail-footer').count(),0);
    await page.evaluate(()=>window.renderTeam(2,{showImage:false,showSocials:false}));await page.waitForTimeout(100);assert.equal(await page.locator('.team-rail-portrait').count(),0);
    for(const railNavigation of ['drag','chevrons','show-all']){
      for(const railShowNumbers of [false,true]){
        await page.evaluate(options=>window.renderTeam(3,options),{railNavigation,railShowNumbers});await page.waitForTimeout(100);
        assert.equal(await page.locator('.team-rail-index').count(),railShowNumbers?3:0);
      }
    }
    for(const railShowNumbers of [false,true]) assert.equal(await page.evaluate(value=>window.mergeTeam({railShowNumbers:value}).railShowNumbers,railShowNumbers),railShowNumbers);
    assert.equal(await page.evaluate(()=>window.mergeTeam({}).railShowNumbers),true);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: actual Team gallery + full project CSS; typography, names, targets, 320–1920, light/dark, drag, keyboard, chevrons, grid, toggles, reduced motion.');
  }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
