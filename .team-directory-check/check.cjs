const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
 const dir=__dirname,base=path.resolve(dir,'..');
 const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
 await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'next/dynamic':path.join(dir,'../.team-rail-check/dynamic.tsx'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],
  module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]}
 },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({content:css.css+'body{padding:48px;font-family:Arial,sans-serif}@media(max-width:768px){body{padding:20px}}'});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  await page.locator('article').first().waitFor();await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(dir,process.env.CAPTURE_ONLY?'before.png':'after.png'),fullPage:true});
  if(process.env.CAPTURE_ONLY)return;
  for(const mode of ['light','dark'])for(const count of [1,2,3,4,5,12]){
   await page.evaluate(({mode,count})=>window.renderTeam(count,{activeColorMode:mode,longText:true}),{mode,count});await page.waitForTimeout(1200);
   for(const width of [320,375,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(50);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${mode}/${count}/${width}`);
    assert.equal(await page.locator('article').count(),count);
    assert(await page.locator('h3,p').evaluateAll(nodes=>nodes.every(el=>el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1)),'Text must not clip');
    const linkMetrics=await page.locator('article a').evaluateAll(nodes=>nodes.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {opacity:+s.opacity,width:r.width,height:r.height}}));
    assert(linkMetrics.every(link=>link.opacity===1&&link.width>=43.9&&link.height>=43.9),`Links at ${mode}/${count}/${width}: ${JSON.stringify(linkMetrics)}`);
    assert(await page.locator('h3,p').evaluateAll(nodes=>{
      const lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number);return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
      const bg=lum(getComputedStyle(document.body).backgroundColor);
      return nodes.every(el=>{const ink=lum(getComputedStyle(el).color);return(Math.max(bg,ink)+.05)/(Math.min(bg,ink)+.05)>=4.5;});
    }),`All captions must clear 4.5:1 contrast (${mode}/${count}/${width})`);
    if(mode==='light'&&count===4&&width===375)await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
   }
  }
  for(const directoryPortrait of ['cursor','left','right'])for(const directoryDetachedCards of [false,true]){
    await page.evaluate(({directoryPortrait,directoryDetachedCards})=>window.renderTeam(5,{directoryPortrait,directoryDetachedCards}),{directoryPortrait,directoryDetachedCards});
    await page.waitForTimeout(100);
    await page.setViewportSize({width:375,height:1000});await page.waitForTimeout(100);
    assert.equal(await page.locator('.team-directory-portrait').count(),directoryPortrait==='cursor'?0:5);
    if(directoryPortrait==='cursor'){
      const box=await page.locator('.team-directory-row').first().boundingBox();
      await page.mouse.move(box.x+20,box.y+20);await page.waitForTimeout(800);
      assert(await page.locator('.team-directory-cursor').evaluate(el=>parseFloat(getComputedStyle(el).opacity)>.99),'Cursor portrait must show in a narrow mouse viewport');
      const plate=await page.locator('.team-directory-cursor').boundingBox();
      assert(plate.x>=0&&plate.x+plate.width<=375);
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(100);
    if(directoryPortrait==='cursor'){
      const box=await page.locator('.team-directory-row').first().boundingBox();
      await page.mouse.move(box.x+20,box.y+20);await page.waitForTimeout(800);
      const plate=await page.locator('.team-directory-cursor').boundingBox();
      assert(plate.x>=0&&plate.x+plate.width<=1440);
      assert(await page.locator('.team-directory-cursor').evaluate(el=>parseFloat(getComputedStyle(el).opacity)>.99),'Cursor portrait must actually appear');
    }else assert.equal(await page.locator('.team-directory-portrait').count(),5);
    const hoverRow=page.locator('.team-directory-row').first();
    await hoverRow.hover();await page.waitForTimeout(500);
    assert.equal(await hoverRow.evaluate(el=>getComputedStyle(el).opacity),'1');
    assert.equal(await page.locator('.team-directory-row').nth(1).evaluate(el=>getComputedStyle(el).opacity),'0.7');
    await page.mouse.move(0,0);await page.waitForTimeout(350);
    assert(await page.locator('.team-directory-row').evaluateAll(nodes=>nodes.every(el=>getComputedStyle(el).opacity==='1')));
    await hoverRow.hover();await page.waitForTimeout(500);
    assert(await hoverRow.locator('.team-directory-copy').evaluate(el=>getComputedStyle(el).transform!=='none'),'Row must visibly respond to hover');
    assert(await hoverRow.locator('.team-directory-accent').evaluate(el=>el.getBoundingClientRect().width>=39.9));
  }
  await page.evaluate(()=>window.renderTeam(4,{directoryPortrait:'cursor'}));await page.waitForTimeout(100);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await page.locator('.team-directory-cursor').count(),0);
  assert.equal(await page.locator('.team-directory-portrait').count(),4);
  await page.locator('article a').first().focus();
  assert(await page.locator('article a').first().evaluate(el=>el===document.activeElement));
  await page.evaluate(()=>window.renderTeam(4,{showImage:false,showSocials:false}));await page.waitForTimeout(60);
  assert.equal(await page.locator('img,a').count(),0);
  await page.evaluate(()=>window.renderTeam(0));await page.waitForTimeout(60);assert.equal(await page.locator('article').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: Directory 0/1/2/3/4/5/12 members, 320–1920, light/dark, long text, visible 44px links, media/social toggles.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
