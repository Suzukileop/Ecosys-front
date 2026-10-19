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
    resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'next/dynamic':path.join(dir,'../.team-rail-check/dynamic.tsx'),'@':base}},
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

    const panel=page.locator('.team-spotlight');
    const heading=page.locator('.team-spotlight-name');
    await panel.waitFor({timeout:10000});await page.waitForTimeout(1600);
    assert.equal(await page.locator('.team-spotlight-tab').count(),5);
    const firstName=await heading.innerText();
    const tabs=page.locator('.team-spotlight-tab');
    const queueBefore=await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
    await tabs.first().click();await page.waitForTimeout(650);
    assert.equal(await heading.innerText(),queueBefore[0]);
    assert.deepEqual(await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label'))),[...queueBefore.slice(1),firstName]);
    const beforeMiddle=await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
    const previousMain=await heading.innerText();
    await tabs.nth(2).click();await page.waitForTimeout(650);
    assert.equal(await heading.innerText(),beforeMiddle[2]);
    assert.deepEqual(await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label'))),[...beforeMiddle.filter((_,i)=>i!==2),previousMain]);
    await tabs.last().click();await page.waitForTimeout(650);
    const role=page.locator('.team-spotlight-role');
    assert(await role.evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Long role must not clip');
    await tabs.first().focus();await page.keyboard.press('End');assert(await tabs.last().evaluate(el=>el===document.activeElement));
    await page.keyboard.press('Home');assert(await tabs.first().evaluate(el=>el===document.activeElement));
    await tabs.nth(4).click();await page.waitForTimeout(600);
    assert(await heading.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Unbroken name must wrap');
    for(const mode of ['light','dark']){
      await page.evaluate(activeColorMode=>window.renderTeam(6,{activeColorMode,spotlightHoverSwitch:false}),mode);await page.waitForTimeout(750);
      for(const width of [1920,1440,1024,768,375,320]){
        await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
        const thumbnail=await tabs.first().boundingBox();
        assert(Math.abs(thumbnail.width-(width>=1024?104:88))<1,`Thumbnail too small at ${width}`);
        assert(await page.locator('.team-spotlight-tabs').evaluate(el=>getComputedStyle(el).flexWrap==='nowrap'&&getComputedStyle(el).scrollbarWidth==='none'),`Thumbnail row must stay horizontal with hidden scrollbar at ${width}`);
        assert(await heading.evaluate(el=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1));
        if(mode==='light'&&(width===1440||width===375))await page.screenshot({path:path.join(dir,`${width}.png`),fullPage:true});
      }
      const ratios=await panel.evaluate(el=>{
        const lum=color=>{const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const v=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
        const bg=lum(getComputedStyle(el).backgroundColor);
        return ['.team-spotlight-name','.team-spotlight-role'].map(s=>{const t=lum(getComputedStyle(el.querySelector(s)).color);return(Math.max(bg,t)+.05)/(Math.min(bg,t)+.05)});
      });
      assert(ratios.every(r=>r>=4.5),`Contrast ${mode}: ${ratios}`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>window.renderTeam(6,{spotlightNavigation:'both',spotlightHoverSwitch:false}));
    await page.waitForTimeout(100);
    const beforeNext=await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
    const mainBeforeNext=await heading.innerText();
    await page.getByRole('button',{name:'Next member'}).click();
    assert.equal(await heading.innerText(),beforeNext[0]);
    assert.equal(await tabs.last().getAttribute('aria-label'),mainBeforeNext);
    assert.equal(await heading.evaluate(el=>getComputedStyle(el.parentElement).transform),'none');
    await page.getByRole('button',{name:'Previous member'}).click();
    assert.equal(await heading.innerText(),mainBeforeNext);
    assert.deepEqual(await tabs.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label'))),beforeNext);
    for(const spotlightNavigation of ['thumbnails','arrows','both']){
      await page.evaluate(spotlightNavigation=>window.renderTeam(6,{spotlightNavigation}),spotlightNavigation);await page.waitForTimeout(100);
      assert.equal(await page.locator('.team-spotlight-tab').count(),spotlightNavigation==='arrows'?0:5);
      assert.equal(await page.getByRole('button',{name:'Next member'}).count(),spotlightNavigation==='thumbnails'?0:1);
    }
    for(const spotlightPortraitSide of ['left','right']){
      await page.setViewportSize({width:1440,height:1000});
      await page.evaluate(spotlightPortraitSide=>window.renderTeam(6,{spotlightPortraitSide}),spotlightPortraitSide);await page.waitForTimeout(100);
      const portrait=await page.locator('.team-spotlight-portrait').boundingBox();
      const copy=await page.locator('.team-spotlight-copy').boundingBox();
      assert.equal(portrait.x>copy.x,spotlightPortraitSide==='right');
    }
    await page.evaluate(()=>window.renderTeam(6,{showImage:false,showSocials:false}));await page.waitForTimeout(100);
    assert.equal(await page.locator('.team-spotlight-portrait').count(),0);
    assert.equal(await panel.locator('img').count(),0);
    assert.equal(await page.locator('.team-spotlight-socials').count(),0);
    await page.evaluate(()=>window.renderTeam(1));await page.waitForTimeout(100);assert.equal(await page.getByRole('tab').count(),0);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: rotating queue first/middle selection, old main goes last, inverse arrows, keyboard focus, typography, contrast, 320–1920, reduced motion and visibility toggles.');
  }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});

