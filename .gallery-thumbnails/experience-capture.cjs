const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
const base=path.resolve(__dirname,'..');
const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(__dirname,'experience-entry.tsx'),output:{path:path.join(__dirname,'experience-build'),filename:'preview.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'next/font/local':path.join(__dirname,'font.cjs'),'@/lib/i18n/I18nProvider':path.join(__dirname,'../.team-rail-check/i18n.ts'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],module:{rules:[{test:/\.css$/,use:path.join(__dirname,'css-loader.cjs')},{test:/\.tsx?$/,use:path.join(__dirname,'../.masonry-check/loader.cjs')}]}},(e,s)=>e||s.hasErrors()?reject(e||new Error(s.toString())):resolve()));
const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:1000,height:900},deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const mediaRoute=r=>{const url=new URL(r.request().url());const source=url.searchParams.get('url')||url.pathname;const filename=path.basename(source);return r.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public/portfolio-previews',filename.endsWith('.svg')?filename:'neutral-editorial.svg'))});};
await page.route('http://localhost:8080/**',mediaRoute);
await page.route('http://experience.test/**',r=>{const u=new URL(r.request().url());return u.pathname.endsWith('.svg')||u.pathname==='/_next/image'?mediaRoute(r):r.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});await page.goto('http://experience.test');
await page.emulateMedia({reducedMotion:'reduce'});
await page.addStyleTag({content:css.css+'body{margin:0;font-family:Arial,sans-serif}'});await page.addScriptTag({path:path.join(__dirname,'experience-build/preview.js')});
const output=path.join(base,'public/portfolio-previews/experience');fs.mkdirSync(output,{recursive:true});
const metadata={};
for(const design of await page.evaluate(()=>window.designs)){
await page.evaluate(d=>window.renderExperience(d),design);await page.locator('main[data-design="'+design+'"]').waitFor();await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(500);
await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';img.scrollIntoView({block:'center'});}await new Promise(r=>setTimeout(r,350));window.scrollTo(0,0);});
await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
const main=page.locator('main');assert(await main.evaluate(e=>e.scrollWidth<=e.clientWidth),design+' overflow');
// For long list layouts, retain the first complete entry rather than a screenful of empty media space.
let cropHeight=null;
if(['milestone','table'].includes(design))cropHeight=await main.evaluate(el=>{const article=el.querySelector('article');if(!article)return null;const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT);let bottom=0;while(walker.nextNode()){const n=walker.currentNode;if(!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);bottom=Math.max(bottom,r.getBoundingClientRect().bottom);}return Math.ceil(bottom-el.getBoundingClientRect().top+44);});
if(design==='table')cropHeight=440;
const file=path.join(output,design+'-light.webp');const sharp=require('sharp');let bitmap=sharp(await sharp(await main.screenshot({animations:'disabled'})).resize({width:1000}).toBuffer());if(cropHeight)bitmap=bitmap.extract({left:0,top:0,width:1000,height:cropHeight});await bitmap.webp({quality:90}).toFile(file);
const info=await require('sharp')(file).metadata();metadata[design]={width:info.width,height:info.height};console.log(design,info.width,info.height,fs.statSync(file).size+' bytes');
}
fs.writeFileSync(path.join(__dirname,'experience-build/dimensions.json'),JSON.stringify(metadata));
assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: all real Experience layouts, loaded media, no overflow.');
}finally{await browser.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
