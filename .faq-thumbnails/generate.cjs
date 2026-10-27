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
  const output=path.join(base,'public/portfolio-previews/faq');fs.mkdirSync(output,{recursive:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('http://faq.test/**',route=>{const url=new URL(route.request().url());if(url.pathname.endsWith('neutral-editorial.svg')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public/portfolio-previews/neutral-editorial.svg'))});if(url.pathname.includes('/avatars/')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(base,'public/landing/avatars/avatar-1.png'))});if(url.pathname.endsWith('.webp'))return route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(output,path.basename(url.pathname)))});if(url.pathname.endsWith('.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'build',path.basename(url.pathname)))});return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
  await page.goto('http://faq.test/');await page.addStyleTag({content:css.css});await page.addScriptTag({path:path.join(dir,'build/team.js')});
  const designs=await page.evaluate(()=>window.designs);
  if(process.env.FRAME_ONLY){
    await page.evaluate(()=>window.renderCatalog());
    await page.addStyleTag({content:'#root>div>button{width:100%;display:block}'});
    const frame=page.frameLocator('iframe').first();await frame.locator('.pf-faq-kinetic-trigger').first().waitFor();
    assert.equal(await frame.locator('.pf-faq-kinetic-trigger').count(),1);
    assert.equal(await frame.locator('nav,footer,img,script').count(),0);
    const floating=page.frameLocator('iframe').nth(1);await floating.locator('.pf-faq-gallery-q').first().waitFor({state:'attached'});
    assert.equal(await floating.locator('.pf-faq-gallery-q').count(),1);
    const masonry=page.frameLocator('iframe').nth(2);await masonry.locator('.pf-faq-masonry-q').first().waitFor();assert.equal(await masonry.locator('.pf-faq-masonry-q').count(),1);
    // DOM-only checks: visual validation is intentionally left to the user.
    assert.equal(await page.locator('iframe').count(),9);
    for(const frameElement of await page.locator('iframe').all()){
      await page.waitForFunction(el=>{const content=el.contentDocument?.querySelector('#preview>div');return content&&Math.abs(parseFloat(el.style.height)-content.getBoundingClientRect().height)<=2;},await frameElement.elementHandle());
    }
    for(let i=3;i<9;i++){
      const doc=page.frameLocator('iframe').nth(i);await doc.locator('[data-pf-faq-mode="light"]').waitFor();
      assert.equal(await doc.locator('nav,footer,img,script').count(),0);
      assert.equal(await doc.locator('[data-pf-faq-mode="light"]').count(),1);
      const prefix=['prism','star','tri','split','focus','bento'][i-3];
      assert.equal(await doc.locator('.pf-faq-'+prefix+'-q').count(),1);
      const answer=doc.locator('.pf-faq-'+prefix+'-answer,.pf-faq-'+prefix+'-a');
      assert.equal(await answer.count(),1);assert(await answer.isVisible(),prefix+' '+JSON.stringify(await answer.evaluate(e=>({height:e.getBoundingClientRect().height,after:getComputedStyle(e,'::after').height,visibility:getComputedStyle(e).visibility,display:getComputedStyle(e).display}))));
    }
    await page.getByRole('button',{name:'kinetic-split',exact:true}).click();assert.equal(await page.evaluate(()=>window.picked),'kinetic-split');
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: 9 real FAQ iframes, one question/answer each, no app chrome/scripts, selection works.');return;
  }
  if(process.env.KINETIC_ONLY){
    await page.setViewportSize({width:640,height:700});
    await page.evaluate(()=>window.renderKineticQuestions());
    const question=page.getByRole('button',{name:/Comment démarre un projet/}).first();await question.waitFor();await question.click();await page.waitForTimeout(500);await page.evaluate(()=>document.fonts.ready);
    const list=page.locator('ul').first();assert(await list.evaluate(e=>e.scrollWidth<=e.clientWidth));
    const capture=await sharp(await list.screenshot({animations:'disabled'})).resize({width:1000}).toBuffer();
    const padded=await sharp(capture).extend({top:24,bottom:24,left:24,right:24,background:'#faf6ee'}).toBuffer();
    await sharp(padded).resize({width:1000}).webp({quality:92}).toFile(path.join(output,'kinetic-questions-light.webp'));
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Kinetic questions-only capture, first answer open, no overflow.');return;
  }
  for(const design of designs)for(const mode of ['light']){
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(({design,mode})=>window.renderFaq(design,mode),{design,mode});
    await page.locator('#root').waitFor();await page.waitForTimeout(400);
    const footer=page.locator('#root');
    await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0));

    const box=await footer.boundingBox();assert(box&&box.height>30,design+' has real content');
    const question=page.getByRole('button',{name:/Comment démarre un projet/}).first();
    if(await question.count()&&await question.getAttribute('aria-expanded')==='false'){
      await question.click();await page.waitForTimeout(500);
    }
    const bitmap=await footer.screenshot({animations:'disabled',timeout:15000});
    const file=path.join(output,design+'-'+mode+'.webp');
    let image=sharp(bitmap);

    await image.resize({width:1000}).webp({quality:90}).toFile(file);
    console.log(design+' '+mode+' '+fs.statSync(file).size+' bytes');
  }
  await page.evaluate(()=>window.renderCatalog());
  await page.waitForFunction(()=>document.images.length===9&&[...document.images].every(x=>x.complete&&x.naturalWidth===1000));
  await page.getByRole('button').first().hover();assert.equal(await page.locator('iframe').count(),0);
  await page.getByRole('button').first().click();assert.equal(await page.evaluate(()=>window.picked),'kinetic-split');
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: 9 real FAQ designs, images loaded, no iframe, selection preserved.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
