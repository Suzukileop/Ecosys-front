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
  for(const mode of ['default','pages'])for(const button of [false,true]){
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(options=>window.renderNav(options),{mode,button});
    const contact=page.getByRole('button',{name:'Contact',exact:true});
    await contact.first().waitFor();
    await page.evaluate(()=>{window.savedNavButton=document.querySelector('button[aria-label="Contact"]');window.savedNavRoot=window.savedNavButton.closest('nav');});
    await contact.first().click();
    assert.equal(await page.locator('#selection').textContent(),'contact');
    assert(await page.evaluate(()=>window.savedNavButton===document.querySelector('button[aria-label="Contact"]')&&window.savedNavRoot.isConnected),'Navigation and its buttons must remain mounted across page selection');
  }
  assert.equal(errors.length,0,errors.join('\n'));
  await page.evaluate(()=>window.renderNav({mode:'pages',button:false,palette:true}));
  const contact=page.getByRole('button',{name:'Contact',exact:true});await contact.waitFor();
  await page.mouse.move(0,900);
  await page.waitForTimeout(400);
  const before=await contact.evaluate(el=>getComputedStyle(el.querySelector('span')??el).color);
  await page.evaluate(()=>window.paletteNav=document.querySelector('[data-pf-page-palette]'));
  await contact.click();await page.mouse.move(0,900);await page.waitForTimeout(450);
  const after=await page.getByRole('button',{name:'Tools',exact:true}).evaluate(el=>getComputedStyle(el.querySelector('span')??el).color);
  assert.notEqual(before,after,'Inactive links must change ink between light and dark pages');
  assert(await page.evaluate(()=>window.paletteNav===document.querySelector('[data-pf-page-palette]')&&window.paletteNav.isConnected),'Palette updates preserve navigation mount');
  await page.getByRole('button',{name:'Tools',exact:true}).click();await page.mouse.move(0,900);await page.waitForTimeout(450);
  assert.equal(await contact.evaluate(el=>getComputedStyle(el.querySelector('span')??el).color),before,'Return to light palette');
  console.log('PASS: Contact menu visible and clickable with CTA on/off, default/pages; navigation DOM remains mounted after selection.');
  await page.setViewportSize({width:1440,height:600});
  await page.evaluate(()=>window.renderScroll());await page.waitForTimeout(100);
  for(const [top,expected] of [[0,'hero'],[950,'info'],[1850,'contact'],[950,'info'],[0,'hero']]){
    await page.evaluate(top=>window.scrollTo(0,top),top);await page.waitForTimeout(100);
    assert.equal(await page.locator('#scroll-selection').textContent(),expected,'Scroll palette follows section behind navigation');
  }
  console.log('PASS: scroll navigation tracks hero/info/contact in both directions.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
