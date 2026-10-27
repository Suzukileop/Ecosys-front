const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
 const dir=__dirname,base=path.resolve(dir,'..');
 const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
 await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'next/font/local':path.join(dir,'font.cjs'),'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],
  module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]}
 },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});


  const jpg=fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'));
  const imageRequests=[];
  await page.route('http://media.test/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/_next/image'){imageRequests.push(url.searchParams.get('w'));return route.fulfill({contentType:'image/jpeg',body:jpg});}
    return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});
  });
  await page.goto('http://media.test/');
  await page.addStyleTag({content:css.css});
  await page.evaluate(()=>{
    const decode=HTMLImageElement.prototype.decode;
    window.holdDecode=true;window.decodePending=[];
    HTMLImageElement.prototype.decode=async function(){
      await decode.call(this);
      if(window.holdDecode)await new Promise(resolve=>window.decodePending.push(resolve));
    };
    window.releaseDecode=()=>{window.holdDecode=false;window.decodePending.splice(0).forEach(fn=>fn());};
  });
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  for(const kind of ['studio','deferred']){
    await page.evaluate(kind=>{window.holdDecode=true;window.renderMedia(kind,'/api/storage/'+kind+'.jpg');},kind);
    const image=page.locator('img');
    await page.waitForFunction(()=>document.querySelector('img')?.complete&&document.querySelector('img')?.naturalWidth>0&&window.decodePending.length>0);
    assert.equal(await image.evaluate(el=>getComputedStyle(el).opacity),'0','Must remain hidden until decoding resolves');
    if(kind==='deferred'){
      const skeleton=page.locator('.pf-media-loading');
      await skeleton.waitFor({state:'visible'});
      assert.equal(await skeleton.getAttribute('data-loading'),'true');
      assert.equal(await skeleton.evaluate(el=>getComputedStyle(el,'::after').animationPlayState),'running');
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await skeleton.evaluate(el=>getComputedStyle(el,'::after').animationName),'none');
      await page.emulateMedia({reducedMotion:'no-preference'});
    }
    const before=await image.evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
    await page.evaluate(()=>window.releaseDecode());await page.waitForTimeout(350);
    assert.equal(await image.evaluate(el=>getComputedStyle(el).opacity),'1');
    if(kind==='deferred')assert.equal(await page.locator('.pf-media-loading').evaluate(el=>getComputedStyle(el).visibility),'hidden');
    const after=await image.evaluate(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
    assert.deepEqual(before,after,'Reveal must not change layout');
    await page.evaluate(kind=>{window.holdDecode=true;window.renderMedia(kind,'/api/storage/'+kind+'-new.jpg');},kind);
    await page.waitForFunction(()=>document.querySelector('img')?.complete&&window.decodePending.length>0);
    assert.equal(await image.evaluate(el=>getComputedStyle(el).opacity),'0','Replacement must hide until decoded');
    await page.evaluate(()=>window.releaseDecode());await page.waitForTimeout(350);
    assert.equal(await image.evaluate(el=>getComputedStyle(el).opacity),'1');
  }
  assert(imageRequests.every(w=>Number(w)<=640),'Small cards must not download 1920px images');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('img').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: Studio + Deferred hidden until decode; full reveal; source replacement; no layout jump; size <=640px; reduced motion.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
