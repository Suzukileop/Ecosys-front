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




  const sharp=require('sharp');
  const output=path.join(base,'public/portfolio-previews/footers');fs.mkdirSync(output,{recursive:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('http://footer.test/**',route=>{const url=new URL(route.request().url());if(url.pathname.endsWith('neutral-editorial.svg')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public/portfolio-previews/neutral-editorial.svg'))});if(url.pathname.includes('/avatars/')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(base,'public/landing/avatars/avatar-1.png'))});if(url.pathname.endsWith('.webp'))return route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(output,path.basename(url.pathname)))});if(url.pathname.endsWith('.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'build',path.basename(url.pathname)))});return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
  await page.goto('http://footer.test/');await page.addStyleTag({content:css.css});await page.addScriptTag({path:path.join(dir,'build/team.js')});
  const designs=await page.evaluate(()=>window.designs);
  for(const design of designs)for(const mode of ['light','dark']){
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(({design,mode})=>window.renderFooter(design,mode),{design,mode});
    await page.locator('footer').waitFor();await page.waitForTimeout(400);
    const footer=page.locator('footer').last();
    await page.waitForFunction(()=>[...document.querySelectorAll('footer img')].every(img=>img.complete&&img.naturalWidth>0));
    if(design==='landing'){
      assert(await footer.locator('img').count()>0,'Landing must include the avatar');
      assert((await footer.textContent()).includes('Designer et développeur'),'Landing must include the biography');
      assert((await footer.textContent()).includes('Paris'),'Landing must include location');
      assert(await footer.locator('a[href="https://github.com"]').count()>0,'Landing must include social links');
    }
    const box=await footer.boundingBox();assert(box&&box.height>30,design+' has real content');
    const bitmap=await footer.screenshot({animations:'disabled',timeout:15000});
    const file=path.join(output,design+'-'+mode+'.webp');
    let image=sharp(bitmap);
    if(design==='minimal'){
      const contentHeight=await footer.evaluate(el=>{
        const origin=el.getBoundingClientRect().top;
        let bottom=origin;
        for(const node of el.querySelectorAll('*')){
          const style=getComputedStyle(node);
          if(style.display==='none'||style.visibility==='hidden'||style.opacity==='0')continue;
          if(node.matches('img,svg,button,input')||[...node.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()))bottom=Math.max(bottom,node.getBoundingClientRect().bottom);
        }
        return Math.ceil(bottom-origin+24);
      });
      image=image.extract({left:0,top:0,width:Math.round(box.width),height:Math.min(Math.round(box.height),contentHeight)});
    }
    await image.resize({width:1000}).webp({quality:90}).toFile(file);
    console.log(design+' '+mode+' '+fs.statSync(file).size+' bytes');
  }
  for(const mode of ['light','dark']){
    await page.evaluate(mode=>window.renderCatalog(mode),mode);
    await page.waitForFunction(()=>document.images.length===14&&[...document.images].every(x=>x.complete&&x.naturalWidth===1000));
    assert.equal(await page.locator('iframe').count(),0);
    await page.getByRole('button').first().hover();assert.equal(await page.locator('iframe').count(),0);
    await page.getByRole('button').first().click();assert.equal(await page.evaluate(()=>window.picked),'centered-minimal');
  }
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: '+designs.length+' real footer designs captured in both modes; static assets loaded; no iframe on hover; selection preserved.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
