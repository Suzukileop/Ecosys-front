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
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const name of ['Hero','Tools','Contact','Hero']){
    await page.getByRole('button',{name,exact:true}).click();
    await page.waitForTimeout(500);
    const bar=page.locator('[data-pf-mini-footer-bar]');
    assert.equal(await bar.count(),1,'One bar only, including Contact');
    assert(await bar.isVisible());
    const panel=page.locator('[data-pf-pages-scroll="active"]');
    const viewport=await panel.boundingBox();
    const initial=await bar.boundingBox();
    assert.equal(await bar.evaluate(el=>['absolute','fixed','sticky'].includes(getComputedStyle(el).position)),false);
    if(name!=='Tools')assert(initial.y>=viewport.y+viewport.height,'Long page: footer below the fold, not pinned');
    else assert(Math.abs(initial.y+initial.height-viewport.y-viewport.height)<2,'Short page: footer follows flexible content');
    await panel.evaluate(el=>el.scrollTop=el.scrollHeight);
    const bottom=await bar.boundingBox();
    assert(bottom.y+bottom.height<=viewport.y+viewport.height+2);
    if(name!=='Tools'){
      await panel.evaluate(el=>el.scrollTop-=30);
      const moved=await bar.boundingBox();
      assert(Math.abs(moved.y-bottom.y-30)<2,'Footer moves with page content');
    }
    await page.getByRole('button',{name:'Back to top ↑'}).click();
    await page.waitForTimeout(100);
    assert.equal(await panel.evaluate(el=>el.scrollTop),0);
    assert.equal(await page.locator('[data-large-footer]').count(),name==='Contact'?1:0);
  }
  await page.evaluate(()=>window.renderLazy());
  await page.getByRole('button',{name:'Load delayed section'}).waitFor();
  await page.evaluate(()=>window.savedNav=document.querySelector('[data-persistent-nav]'));
  await page.getByRole('button',{name:'Load delayed section'}).click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator('[data-global-skeleton]').count(),0,'Slow section must not replace the whole portfolio with skeleton');
  assert(await page.locator('[data-ready-section]').isVisible(),'Keep old content visible while chunk loads');
  assert(await page.evaluate(()=>window.savedNav===document.querySelector('[data-persistent-nav]')&&window.savedNav.isConnected));
  await page.evaluate(()=>window.releaseSection());
  await page.locator('[data-delayed-section]').waitFor();
  assert.equal(await page.locator('[data-global-skeleton]').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));
  for(const width of [375,768,1440,1920])for(const gutter of ['none','wide','medium','narrow']){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(({gutter})=>window.renderFooterHeaders(gutter,1200),{gutter});await page.waitForTimeout(100);
    const aligned=await page.evaluate(()=>{const ref=document.querySelector('[data-reference-inner]').getBoundingClientRect();return [...document.querySelectorAll('[data-header-shell]')].every(shell=>{const h=shell.querySelector('[data-footer-header]');if(!h)return false;const r=h.getBoundingClientRect();return Math.abs(r.left-ref.left)<1&&Math.abs(r.right-ref.right)<1;});});
    assert(aligned,`All footer header roots align to global content at ${width}/${gutter}`);
    const optical=await page.evaluate(()=>{const title=document.querySelector('[data-footer-header="editorial"] h2');const style=getComputedStyle(title);const ctx=document.createElement('canvas').getContext('2d');ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;const edge=ctx.measureText(title.textContent.trim().toUpperCase()[0]).actualBoundingBoxLeft;return Math.abs(parseFloat(style.marginInlineStart)-Math.min(0,edge))<.1;});
    assert(optical,'Editorial title compensates actual first-glyph side bearing');
  }
  console.log('PASS: mini-bar in document flow on every page; below long content; short-page bottom; scrolls normally; no duplication; back-to-top.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
