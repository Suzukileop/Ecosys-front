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
  await page.route('http://split.test/**',route=>{const pathname=new URL(route.request().url()).pathname;if(pathname.endsWith('.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'build',path.basename(pathname)))});return pathname==='/_next/image'?route.fulfill({contentType:'image/jpeg',body:jpg}):route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
  await page.goto('http://split.test/');await page.addStyleTag({content:css.css});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  assert.equal(await page.evaluate(()=>window.defaultPortrait()),false);
  for(const mode of ['light','dark'])for(const width of [320,375,768,1440])for(const portrait of [true,false]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(mode=>{const dark=mode==='dark';for(const [key,value] of Object.entries({'texte-fort':dark?'#fafafa':'#201a10','texte-muted':dark?'#a3a3a3':'#6b6047','fond':dark?'#0a0a0a':'#faf6ee','neutre':dark?'#171717':'#ffffff'}))document.body.style.setProperty('--pf-palette-'+key,value);},mode);
    await page.evaluate(options=>window.renderSplit(options),{portrait,mode});await page.waitForTimeout(120);
    assert.equal(await page.locator('[data-contact-split-portrait]').count(),portrait?1:0);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow with long email');
    if(portrait){
      const frame=page.locator('[data-contact-split-portrait]');
      await frame.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('img')?.naturalWidth>0);
      const r=await frame.boundingBox();assert(Math.abs(r.x+r.width/2-width/2)<2,'Portrait centered on canvas');
      const portraitBox=await frame.locator('img').boundingBox();assert(portraitBox.width>=Math.min(width-48,width*.74,336)-4,`Portrait width ${portraitBox.width} at viewport ${width} must not collapse`);assert(portraitBox.height>=portraitBox.width*1.24,'Portrait retains 4:5 ratio');
      assert.equal(await page.locator('img').getAttribute('alt'),'Portrait Studio');
      if(mode==='light'&&width===1440)await page.screenshot({path:path.join(dir,'portrait.png'),fullPage:true});
    }
    assert.equal(await page.locator('a[href^="mailto:"]').count(),1);
  }
  await page.evaluate(()=>window.renderSplit({portrait:true,noPhoto:true,mode:'light'}));await page.waitForTimeout(100);
  assert.equal(await page.locator('[data-contact-split-portrait]').count(),0,'No empty portrait when source missing');
  assert.equal(errors.length,0,errors.join('\n'));
  await page.evaluate(()=>{document.getElementById('root').id='contact';window.renderSplit({portrait:true,mode:'light'});});
  await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(150);
  const sizes=[];
  for(const scale of [.85,1,1.15,1.3,1.45]){
    await page.evaluate(scale=>document.getElementById('contact').style.setProperty('--pf-contact-font-scale',scale),scale);
    sizes.push(await page.locator('a[href^="mailto:"]').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Scaled email stays within canvas');
  }
  for(let i=1;i<sizes.length;i++)assert(sizes[i]>sizes[i-1],'Every text-size step must visibly resize the email');
  assert(Math.abs(sizes[4]/sizes[1]-1.45)<.01,'Email follows the shared scale');
  for(const width of [375,768,1440,1920])for(const gutter of ['none','wide','medium','narrow']){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(options=>window.renderSplit(options),{portrait:false,mode:'light',gutter});await page.waitForTimeout(100);
    const aligned=await page.evaluate(()=>{const host=document.querySelector('#contact > div');const grid=document.querySelector('a[href^="mailto:"]').closest('.grid');const a=host.getBoundingClientRect(),b=grid.getBoundingClientRect();return Math.abs(a.left+parseFloat(getComputedStyle(host).paddingLeft)-b.left-parseFloat(getComputedStyle(grid).paddingLeft))<1&&Math.abs(a.right-parseFloat(getComputedStyle(host).paddingRight)-b.right+parseFloat(getComputedStyle(grid).paddingRight))<1;});
    assert(aligned,`Global gutter alignment ${gutter} ${width}`);
  }
  for(const mode of ['light','dark','light'])for(const design of ['editorial-focus','split-grid']){
    await page.evaluate(({mode,design})=>{document.body.style.setProperty('--pf-palette-texte-fort',mode==='dark'?'#111111':'#eeeeee');window.renderSectionMode(mode,design);},{mode,design});
    await page.waitForTimeout(1200);
    const ink=await page.locator('a[href="mailto:creator@example.com"]').first().evaluate(el=>getComputedStyle(el).color);
    const expected=design==='editorial-focus'?(mode==='dark'?'rgb(163, 163, 163)':'rgb(107, 96, 71)'):(mode==='dark'?'rgb(250, 250, 250)':'rgb(32, 26, 16)');
    assert.equal(ink,expected,`Contact ${design} ${mode} must use local ink despite opposite global mode`);
  }
  console.log('PASS: split-grid optional centered portrait, default off, 320–1440px, light/dark, no overflow, missing-photo fallback.');
  for(const width of [320,375,768,1440,1920])for(const name of ['LEOPARD','LEOPARD JULIO CESAR','WWWWWWWWWWWWWWWWWWWWWWWW']){
    await page.setViewportSize({width,height:1000});await page.evaluate(name=>window.renderLiquid(name),name);await page.waitForTimeout(150);
    for(const scale of [.85,1,1.45]){
      await page.evaluate(scale=>document.body.style.setProperty('--pf-contact-font-scale',scale),scale);
      const contained=await page.locator('[data-liquid-watermark]').evaluate(el=>{const text=el.getBoundingClientRect(),box=el.parentElement.parentElement.getBoundingClientRect();return text.left>=box.left&&text.right<=box.right&&text.width>0;});
      assert(contained,`Whole watermark visible at ${width}, ${name}, scale ${scale}`);
    }
  }
  console.log('PASS: liquid watermark fits short/long/wide names at 320–1920px and all tested text scales.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
