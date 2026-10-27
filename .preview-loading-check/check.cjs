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




  let loads=0;
  await page.route('http://preview.test/**',async route=>{
    if(route.request().url().endsWith('.webp'))return route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(base,'public/portfolio-previews/footer-centered-minimal-v1.webp'))});
    if(route.request().url().includes('/frame/')){loads++;return route.fulfill({contentType:'text/html',body:`<script>
    window.addEventListener('message',e=>{if(e.data.type==='apply-settings')setTimeout(()=>parent.postMessage({source:'skraft-portfolio-studio',type:'design-preview-applied',previewRequestId:e.data.previewRequestId},location.origin),100);});
    parent.postMessage({source:'skraft-portfolio-studio',type:'design-preview-ready'},location.origin);
    parent.postMessage({source:'skraft-portfolio-studio',type:'design-preview-size',height:640},location.origin);
    </script>`});}
    return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});
  });
  await page.goto('http://preview.test/');
  await page.addStyleTag({content:css.css});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  await page.locator('iframe').waitFor();await page.waitForTimeout(350);
  assert.equal(loads,1,'Only selected design requests a portfolio');
  assert.equal(await page.locator('[data-thumbnail]').count(),7,'Other designs show instant thumbnails');
  const second=page.getByRole('button',{name:'Design 1',exact:true});
  await second.hover();await page.waitForTimeout(450);
  assert.equal(loads,2,'Hovered card alone loads another preview');
  assert.equal(await page.locator('iframe').count(),2);
  await page.mouse.move(1000,900);await page.waitForTimeout(100);
  assert.equal(await page.locator('iframe').count(),1,'Inactive preview is released');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: 8 cards, 1 initial iframe, immediate thumbnails, on-demand hover and cleanup.');
  const initialLoads=loads;await page.evaluate(()=>window.renderStatic());
  await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth>0);
  await page.getByRole('button',{name:'Minimal centré'}).hover();await page.waitForTimeout(300);
  assert.equal(await page.locator('iframe').count(),0);assert.equal(loads,initialLoads);
  await page.getByRole('button',{name:'Minimal centré'}).click();assert(await page.evaluate(()=>window.picked));
  console.log('PASS: centered minimal static image loads, no iframe on selection/hover, picking preserved.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
