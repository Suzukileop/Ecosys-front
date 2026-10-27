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
 const landscape=await require('sharp')(path.join(base,'public/landing/hero/hero-freelance.jpg')).resize(3840,2160,{fit:'cover'}).jpeg({quality:95}).toBuffer();
 try{
 for(const dpr of [1,2]){
  const page=await browser.newPage({viewport:{width:1920,height:1000},deviceScaleFactor:dpr});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://media.test/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/_next/image')return route.fulfill({contentType:'image/jpeg',body:landscape});
    return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});
  });
  await page.goto('http://media.test/');
  await page.addStyleTag({content:css.css+'body{padding:48px;font-family:Arial,sans-serif}@media(max-width:768px){body{padding:20px}}'});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  for(const width of [320,768,1024,1920])for(const canvasColumns of [2,3,4]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(canvasColumns=>window.renderTeam(5,{canvasColumns,canvasAlign:'full',canvasParallax:false}),canvasColumns);
   await page.locator('img').first().waitFor();
   await page.waitForFunction(()=>{const i=document.querySelector('img');return i?.complete&&i.naturalWidth>0;});
   await page.waitForFunction(()=>{
     const image=document.querySelector('img');if(!image?.naturalWidth)return false;
     const rect=image.getBoundingClientRect();
     const needed=Math.min(3840,Math.max(rect.width,rect.height*image.naturalWidth/image.naturalHeight)*devicePixelRatio);
     return Number(new URL(image.currentSrc).searchParams.get('w'))>=needed*.95 && getComputedStyle(image).opacity==='1';
   });
   const media=await page.locator('img').first().evaluate(el=>({source:el.currentSrc,width:el.getBoundingClientRect().width,sizes:el.sizes,loading:el.loading}));
   const selected=new URL(media.source);
   assert.equal(selected.searchParams.get('q'),'90');
   assert(!selected.searchParams.get('url').includes('?w='),'No backend rendition recompression');
   assert(media.sizes.startsWith('auto, '));
   assert.equal(media.loading,'lazy');
   assert(+selected.searchParams.get('w')>=media.width*dpr*.9,'Candidate must cover slot at display density');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.equal(errors.length,0,errors.join('\n'));
  await page.close();
 }
 console.log('PASS: canvas columns 2/3/4, widths 320/768/1024/1920, DPR 1/2; source original q90; correct image candidates; lazy; no overflow.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
