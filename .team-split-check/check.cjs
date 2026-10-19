const fs=require('fs');
const path=require('path');
const assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const wp=require('next/dist/compiled/webpack/webpack');
const postcss=require('postcss');
async function main(){
  const dir=__dirname, base=path.resolve(dir,'..');
  const stylesheet=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
  await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),
    output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
    resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'@':base}},
    plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development',NEXT_PUBLIC_API_URL:'http://localhost:8080'})})],
    module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]},
  },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
    await page.setContent('<div id="root"></div>');
    await page.addStyleTag({content:stylesheet.css+' body{margin:0;padding:48px;font-family:Arial,sans-serif}@media(max-width:768px){body{padding:16px}}'});
    await page.addScriptTag({path:path.join(dir,'build/team.js')});
    await page.getByRole('tab').first().waitFor();await page.waitForTimeout(1000);
    if(process.env.CAPTURE_ONLY){await page.screenshot({path:path.join(dir,'before.png'),fullPage:true});return;}
    await page.screenshot({path:path.join(dir,'after-normal.png'),fullPage:true});
    const tabs=page.getByRole('tab');
    await tabs.first().focus();await page.keyboard.press('ArrowDown');
    assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
    assert(await tabs.nth(1).evaluate(el=>el===document.activeElement));
    await page.keyboard.press('End');assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
    await page.keyboard.press('Home');assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
    const panel=page.getByRole('tabpanel');
    assert.equal(await panel.getAttribute('aria-labelledby'),await tabs.first().getAttribute('id'));
    await page.getByRole('button',{name:'Social links',exact:true}).click();
    assert(await page.locator('[data-split-socials] a').isVisible());
    await page.getByRole('button',{name:'Social links',exact:true}).click();
    assert(await page.locator('[data-split-socials]').evaluate(el=>el.inert));
    for(const mode of ['light','dark'])for(const count of [1,5,12]){
      await page.evaluate(({mode,count})=>window.renderTeam(count,{activeColorMode:mode,longRole:true}),{mode,count});
      await page.waitForTimeout(80);
      if(count>1)await tabs.nth(1).click();
      for(const width of [1920,1440,1024,768,375,320]){
        await page.setViewportSize({width,height:1000});await page.waitForTimeout(80);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${mode}/${count}/${width}`);
        assert(await page.locator('.team-split').evaluate(el=>{
          const rect=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();
          const style=getComputedStyle(el.parentElement);
          return Math.abs(rect.left-parent.left-parseFloat(style.paddingLeft))<1&&Math.abs(parent.right-rect.right-parseFloat(style.paddingRight))<1;
        }),'Split must inherit the global content boundaries');
        assert(await page.locator('.team-split-text').evaluate(el=>{
          const style=getComputedStyle(el);
          return parseFloat(style.paddingLeft)===0&&parseFloat(style.marginLeft)===0;
        }),'No extra inset on the text column');
        assert(await tabs.evaluateAll(nodes=>nodes.every(el=>parseFloat(getComputedStyle(el).opacity)===1&&el.scrollWidth<=el.clientWidth+1)),'Names must remain visible and wrap');
        assert(await page.locator('.team-split-role').evaluate(el=>el.scrollHeight<=el.clientHeight+1),'Role must not clip');
        assert(await tabs.evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=44)));
        const ratio=await tabs.last().evaluate(el=>{
          const rgb=getComputedStyle(el).color.match(/[\d.]+/g).slice(0,3).map(Number);
          const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
          const bg=lum(getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).slice(0,3).map(Number));
          const ink=lum(rgb);return(Math.max(bg,ink)+.05)/(Math.min(bg,ink)+.05);
        });
        assert(ratio>=4.5,`Inactive name contrast ${ratio}`);
        if(count===5&&mode==='light'&&(width===1440||width===375))await page.screenshot({path:path.join(dir,`after-${width}.png`),fullPage:true});
      }
    }
    for(const splitPortraitSide of ['left','right']){
      await page.setViewportSize({width:1440,height:1000});
      await page.evaluate(splitPortraitSide=>window.renderTeam(5,{splitPortraitSide}),splitPortraitSide);await page.waitForTimeout(80);
      const picture=await page.locator('.team-split-portrait').boundingBox(),list=await page.getByRole('tablist').boundingBox();
      assert.equal(picture.x>list.x,splitPortraitSide==='right');
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await tabs.nth(2).click();
    assert.equal(await page.locator('.team-split-layer').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
    assert.equal(await page.getByRole('button',{name:'Social links',exact:true}).count(),0,'No empty socials control');
    await page.evaluate(()=>window.renderTeam(5,{showImage:false,showSocials:false}));await page.waitForTimeout(80);
    assert.equal(await page.locator('.team-split-portrait').count(),0);
    for(const splitShowNumbers of [false,true]){
      const persisted=await page.evaluate(value=>window.mergeTeam({splitShowNumbers:value}).splitShowNumbers,splitShowNumbers);
      assert.equal(persisted,splitShowNumbers);
      await page.evaluate(splitShowNumbers=>window.renderTeam(5,{splitShowNumbers}),splitShowNumbers);await page.waitForTimeout(80);
      assert.equal(await page.locator('.team-split-index').count(),splitShowNumbers?5:0);
      assert.equal(await page.locator('.team-split-count > span:not(.sr-only)').count(),splitShowNumbers?1:0);
      await tabs.first().focus();await page.keyboard.press('ArrowDown');
      assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
    }
    await page.evaluate(()=>window.renderTeam(0));await page.waitForTimeout(80);
    assert.equal(await page.locator('.team-split').count(),0);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: Split screen responsive 320–1920, 1/5/12 members, long names/roles, keyboard, socials, portrait side, reduced motion and visibility.');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
