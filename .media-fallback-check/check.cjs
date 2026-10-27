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

  let optimizerHits=0,originalHits=0;
  const jpg=fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'));
  await page.route('http://media.test/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/_next/image'){optimizerHits++;return route.fulfill({status:400,body:'optimizer unavailable'});}
    if(url.pathname.startsWith('/api/storage/')){originalHits++;return route.fulfill(url.pathname.endsWith('missing.jpg')?{status:404,body:'missing'}:{contentType:'image/jpeg',body:jpg});}
    return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});
  });
  await page.goto('http://media.test/');
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth>0);
  assert.equal(await page.locator('img').getAttribute('src'),'/api/storage/ok.jpg');
  assert.equal(await page.locator('img').getAttribute('srcset'),null);
  assert.equal(optimizerHits,1);assert.equal(originalHits,1);
  await page.evaluate(()=>window.renderMedia('/api/storage/missing.jpg'));
  await page.locator('[data-media-unavailable]').waitFor();
  const before=[optimizerHits,originalHits];await page.waitForTimeout(500);
  assert.deepEqual([optimizerHits,originalHits],before,'No repeated retries');
  await page.evaluate(()=>window.renderMedia('/api/storage/recovered.jpg'));
  await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth>0);
  assert.equal(await page.locator('[data-media-unavailable]').count(),0);
  assert.equal(await page.locator('img').getAttribute('src'),'/api/storage/recovered.jpg');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: optimizer 400 -> original 200; original 404 -> placeholder; bounded retries; source change recovers.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
