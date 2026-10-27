const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
 const dir=__dirname,base=path.resolve(dir,'..');
 const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
 await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],
  module:{rules:[{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]}
 },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://portrait.test/**',route=>route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(base,'public/landing/hero/hero-freelance.jpg'))}));
  await page.setContent('<div id="root"></div>');
  await page.addStyleTag({content:css.css+'body{padding:48px;font-family:Arial,sans-serif}@media(max-width:768px){body{padding:20px}}'});
  await page.addScriptTag({path:path.join(dir,'build/team.js')});
  await page.locator('article').first().waitFor();await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(dir,process.env.CAPTURE_ONLY?'before.png':'after.png'),fullPage:true});
  if(process.env.CAPTURE_ONLY)return;
  for(const mode of ['light','dark'])for(const count of [1,2,3,4,5,12]){
   await page.evaluate(({mode,count})=>window.renderTeam(count,{activeColorMode:mode,longText:true}),{mode,count});await page.waitForTimeout(1200);
   for(const width of [320,375,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(50);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${mode}/${count}/${width}`);
    assert.equal(await page.locator('article').count(),count);
    assert(await page.locator('h3,p').evaluateAll(nodes=>nodes.every(el=>el.scrollWidth<=el.clientWidth+1&&el.scrollHeight<=el.clientHeight+1)),'Text must not clip');
    assert(await page.locator('article a').evaluateAll(nodes=>nodes.every(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return +s.opacity===1&&r.width>=44&&r.height>=44;})),'Links must be visible and large enough without hover');
    assert(await page.locator('h3,p').evaluateAll(nodes=>{
      const lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number);return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
      const bg=lum(getComputedStyle(document.body).backgroundColor);
      return nodes.every(el=>{const ink=lum(getComputedStyle(el).color);return(Math.max(bg,ink)+.05)/(Math.min(bg,ink)+.05)>=4.5;});
    }),`All captions must clear 4.5:1 contrast (${mode}/${count}/${width})`);
    if(mode==='light'&&count===4&&width===375)await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
   }
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.team-profile-frame').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.locator('article a').first().focus();
  assert(await page.locator('article a').first().evaluate(el=>el===document.activeElement));
  await page.evaluate(()=>window.renderTeam(6,{profileCardsView:'grid',profileCardsVisible:'4'}));await page.waitForTimeout(100);
  assert.equal(await page.locator('article').count(),4);
  await page.getByRole('button',{name:/View all/}).click();await page.waitForTimeout(100);
  assert.equal(await page.locator('article').count(),6);
  await page.getByRole('button',{name:'Show less',exact:true}).click();
  assert.equal(await page.locator('article').count(),4);
  await page.getByRole('button',{name:'Rail',exact:true}).click();await page.waitForTimeout(100);
  const rail=page.getByRole('region',{name:'Team members'});
  await rail.focus();await page.keyboard.press('End');await page.waitForTimeout(100);
  assert(await rail.evaluate(el=>el.scrollLeft>0));
  await page.keyboard.press('Home');await page.waitForTimeout(100);
  assert(await rail.evaluate(el=>el.scrollLeft<=1));
  await page.getByRole('button',{name:'Grid',exact:true}).click();await page.waitForTimeout(100);
  await page.evaluate(()=>window.renderTeam(4,{profileCardsPanel:'hover'}));await page.waitForTimeout(100);
  const card=page.locator('article').first();
  await card.focus();await page.waitForTimeout(400);
  assert.equal(await card.locator('[data-team-panel]').evaluate(el=>getComputedStyle(el).opacity),'1');
  for(const width of [768,1440,1920])for(const cardMaxWidth of ['xs','sm','full'])for(const profileCardsColumns of [2,3,4])for(const [profileCardsGutter,expected] of Object.entries({sm:12,md:48,lg:96,xl:160})){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(options=>window.renderTeam(4,options),{cardMaxWidth,profileCardsColumns,profileCardsGutter,profileCardsView:'grid'});await page.waitForTimeout(40);
    const cards=await page.locator('article').evaluateAll(nodes=>nodes.slice(0,2).map(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right}}));
    const gap=cards[1].left-cards[0].right;
    const actualColumns=await page.locator('.team-profile-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(actualColumns,width<1024?2:profileCardsColumns,`Wrong column count at ${width}/${profileCardsColumns}`);
    assert(Math.abs(gap-expected)<1,`Actual card gap ${gap}, expected ${expected}, ${width}/${cardMaxWidth}/${profileCardsColumns}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  for(const [profileCardsGutter,expected] of Object.entries({sm:12,md:48,lg:96,xl:160})){
    await page.evaluate(options=>window.renderTeam(4,options),{profileCardsGutter,profileCardsView:'rail'});await page.waitForTimeout(60);
    const cards=await page.locator('article').evaluateAll(nodes=>nodes.slice(0,2).map(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right}}));
    assert(Math.abs(cards[1].left-cards[0].right-expected)<1,`Rail gap must be ${expected}`);
  }
  for(const profileCardsView of ['grid','rail'])for(const profileCardsShowNumbers of [false,true]){
    assert.equal(await page.evaluate(value=>window.mergeTeam({profileCardsShowNumbers:value}).profileCardsShowNumbers,profileCardsShowNumbers),profileCardsShowNumbers);
    await page.evaluate(options=>window.renderTeam(4,options),{profileCardsView,profileCardsShowNumbers});await page.waitForTimeout(60);
    assert.equal(await page.locator('.team-profile-index').count(),profileCardsShowNumbers?4:0);
  }
  await page.evaluate(()=>window.renderTeam(4,{showImage:false,showSocials:false}));await page.waitForTimeout(60);
  assert.equal(await page.locator('img,a').count(),0);
  await page.evaluate(()=>window.renderTeam(0));await page.waitForTimeout(60);assert.equal(await page.locator('article').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: Profile cards 0/1/2/3/4/5/12 members, 320–1920, light/dark, long text, visible 44px links, media/social toggles.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
