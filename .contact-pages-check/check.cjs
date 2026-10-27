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





  await page.setContent('<div id="root"></div>');await page.addStyleTag({content:css.css});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  for(const width of [320,375,768,1440])for(const showForm of [false,true]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(showForm=>window.renderContact(true,showForm),showForm);await page.waitForTimeout(120);
    const root=page.locator('[data-contact-static="true"]');await root.waitFor();
    assert.equal(await page.evaluate(()=>window.triggerCount()),0,'No ScrollTrigger in pages mode');
    assert(await root.locator('[data-reveal-char-inner]').evaluateAll(nodes=>nodes.every(el=>{const s=getComputedStyle(el);return s.visibility!=='hidden'&&+s.opacity===1&&s.transform==='none';})),'Title fully visible without scroll');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
    assert(await root.locator('[data-reveal-title]').isVisible());
    assert.equal(await root.locator('form').count(),showForm?1:0);
    const image=root.locator('div.aspect-\\[4\\/3\\]').first();
    assert(await root.evaluate(el=>Array.from(el.querySelectorAll('[style]')).every(node=>getComputedStyle(node).clipPath==='none')),'No clipped portrait');
  }
  await page.evaluate(()=>window.renderContact(false,true));await page.waitForTimeout(250);
  assert(await page.evaluate(()=>window.triggerCount()>0),'Normal navigation keeps scroll animation');
  await page.evaluate(()=>window.renderContact(true,true));await page.waitForTimeout(120);
  assert.equal(await page.evaluate(()=>window.triggerCount()),0,'Switching mode cleans old scroll triggers');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: sequential contact static pages mode, 320–1440px, form on/off, full visible title and portrait; normal animation retained; clean mode switching.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
