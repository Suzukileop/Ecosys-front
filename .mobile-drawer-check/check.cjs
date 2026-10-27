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




  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({content:css.css});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  for(const design of ['editorial','contrast','cards','typographic'])for(const width of [320,375,768,1023])for(const side of ['left','right']){
    await page.setViewportSize({width,height:900});
    await page.evaluate(options=>window.renderNav(options),{design,side,dark:side==='left'});
    const open=page.getByRole('button',{name:'Open navigation menu'});
    await open.click();
    const panel=page.getByRole('dialog',{name:'Navigation'});
    await panel.waitFor();await page.waitForTimeout(330);
    assert.equal(await panel.getAttribute('data-pf-drawer-design'),design);
    const rect=await panel.boundingBox();assert(rect.x>=-1&&rect.x+rect.width<=width+1);
    assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth),'Panel must not overflow');
    const links=panel.locator('[data-pf-drawer-link]');
    assert.equal(await links.count(),9);
    assert(await links.evaluateAll(nodes=>nodes.every(el=>{const r=el.getBoundingClientRect();return r.height>=44&&el.scrollWidth<=el.clientWidth+1;})));
    assert(await links.evaluateAll(nodes=>{
      const lum=c=>c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      return nodes.every(el=>{const ink=lum(getComputedStyle(el).color),bg=lum(getComputedStyle(el.closest('aside')).backgroundColor);return(Math.max(ink,bg)+.05)/(Math.min(ink,bg)+.05)>=4.5;});
    }),'Link contrast >= 4.5');
    const close=panel.getByRole('button',{name:'Close navigation',exact:true});
    await close.focus();await page.keyboard.press('Shift+Tab');
    assert(await links.last().evaluate(el=>document.activeElement===el),'Focus stays in drawer');
    await page.keyboard.press('Escape');await panel.waitFor({state:'detached'});
    assert(await open.evaluate(el=>document.activeElement===el));
    await open.click();await page.waitForTimeout(330);
    await panel.locator('[data-pf-drawer-link]').last().click();
    await panel.waitFor({state:'detached'});assert.equal(await page.locator('#selection').textContent(),'contact');
    if(width===375&&side==='right'){
      await open.click();await page.waitForTimeout(330);
      await page.screenshot({path:path.join(dir,design+'.png')});
      await page.keyboard.press('Escape');
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.renderNav({design:'editorial',side:'right'}));
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  assert.equal(await page.getByRole('dialog').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.keyboard.press('Escape');
  for(const design of ['classic','editorial','contrast','cards','typographic'])assert.equal(await page.evaluate(design=>window.mergeNav(design),design),design);
  assert.equal(await page.evaluate(()=>window.mergeNav('invalid')),'classic');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: four drawer designs, 320–1023px, left/right, light/dark contrast, long labels, focus trap, Escape, selection, reduced motion, persistence sanitization.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
