const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test'),wp=require('next/dist/compiled/webpack/webpack'),postcss=require('postcss');
async function main(){
 const dir=__dirname,base=path.resolve(dir,'..');
 const css=await postcss([require('@tailwindcss/postcss')({base}),require('../postcss-tailwind-variants-last.cjs')]).process(fs.readFileSync(path.join(base,'app/globals.css'),'utf8'),{from:path.join(base,'app/globals.css')});
 await new Promise((resolve,reject)=>wp.webpack({mode:'development',devtool:false,entry:path.join(dir,'entry.tsx'),output:{path:path.join(dir,'build'),filename:'team.js',publicPath:''},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'next/font/local':path.join(dir,'font.cjs'),'@/lib/i18n/I18nProvider':path.join(dir,'../.team-rail-check/i18n.ts'),'@':base}},plugins:[new wp.webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})})],
  module:{rules:[{test:/\.css$/,use:path.join(dir,'css-loader.cjs')},{test:/\.tsx?$/,use:path.join(dir,'../.masonry-check/loader.cjs')}]}
 },(err,stats)=>err||stats.hasErrors()?reject(err||new Error(stats.toString())):resolve()));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});




  const sharp=require('sharp');
  const output=path.join(base,'public/portfolio-previews/gallery');fs.mkdirSync(output,{recursive:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('http://localhost:8080/portfolio-previews/**',route=>{const url=new URL(route.request().url());return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public',url.pathname))});});
  await page.route('http://gallery.test/**',route=>{const url=new URL(route.request().url());if(url.pathname.endsWith('.svg'))return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public',url.pathname))});if(url.pathname.endsWith('neutral-editorial.svg')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/svg+xml',body:fs.readFileSync(path.join(base,'public/portfolio-previews/neutral-editorial.svg'))});if(url.pathname.includes('/avatars/')||url.pathname==='/_next/image')return route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(base,'public/landing/avatars/avatar-1.png'))});if(url.pathname.endsWith('.webp'))return route.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(base,'public',url.pathname))});if(url.pathname.endsWith('.js'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(dir,'build',path.basename(url.pathname)))});return route.fulfill({contentType:'text/html',body:'<div id="root"></div>'});});
  await page.goto('http://gallery.test/');await page.addStyleTag({content:css.css});await page.addScriptTag({path:path.join(dir,'build/team.js')});
  const designs=await page.evaluate(()=>window.designs);
  if(process.env.IDENTITY_STATUS_ONLY){
    await page.evaluate(()=>window.renderIdentityStatus(true,true));
    const status=page.locator('[data-identity-field="availability"]');await status.waitFor();assert.equal(await status.locator('[data-hero-availability]').innerText(),'Ouvert aux projets');assert((await status.textContent()).includes('Statut'));
    await page.evaluate(()=>window.renderIdentityStatus(true,false));assert.equal(await status.locator('[data-hero-availability]').innerText(),'Non disponible');
    await page.evaluate(()=>window.renderIdentityStatus(false,false));assert.equal(await status.count(),0);assert.equal(await page.locator('.pf-identity-index-col').count(),2);
    await page.evaluate(()=>window.renderIdentitySettings());await page.getByRole('button',{name:'Settings — Identity index',exact:true}).click();
    await page.getByRole('textbox',{name:'Specialty',exact:true}).fill('Mon expertise');
    await page.getByRole('textbox',{name:'Availability',exact:true}).fill('Mon statut');
    await page.getByRole('textbox',{name:'Years of experience',exact:true}).fill('Mon parcours');
    await page.getByRole('textbox',{name:'Available label',exact:true}).fill('Disponible en novembre');
    await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('button',{name:'Settings — Identity index',exact:true}).click();assert.equal(await page.getByRole('textbox',{name:'Availability',exact:true}).inputValue(),'Mon statut');
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Identity index available/unavailable text, customizable headings, hidden status removes whole column and settings persist.');return;
  }
  if(process.env.GREETING_ONLY){
    const checks=await page.evaluate(()=>window.checkGreetings());assert.equal(checks.results.length,9);assert(checks.results.every(text=>text.endsWith('Bonjour Alex, Designer')));assert.equal(checks.empty,'original');assert.equal(checks.bounded.heroGreetingOverrides['editorial-rail'].length,500);assert(!('invalid' in checks.bounded.heroGreetingOverrides));assert.equal(Object.keys(checks.saved).length,9);
    await page.evaluate(()=>window.renderGreeting());
    const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
    await catalogue.getByRole('button',{name:'Settings — Editorial rail',exact:true}).click();
    const field=page.getByRole('textbox',{name:'Greeting',exact:true});await field.fill('Bonjour {name} — {specialty}');
    await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
    await catalogue.getByRole('button',{name:'Settings — Statement CTA',exact:true}).click();assert.equal(await field.inputValue(),'');
    await field.fill('Salut !');await page.getByRole('button',{name:'Back',exact:true}).click();
    await catalogue.getByRole('button',{name:'Settings — Editorial rail',exact:true}).click();assert.equal(await field.inputValue(),'Bonjour {name} — {specialty}');
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Nine per-design greeting templates, variables, fallback, safe persistence and independent customization fields.');return;
  }
  if(process.env.SMOOTH_SCROLL_ONLY){
    const settings=await page.evaluate(()=>window.checkScrollSettings());assert.equal(settings.defaults.smoothScrollEnabled,false);assert.equal(settings.valid.smoothScrollSoftness,80);assert.equal(settings.valid.smoothScrollWheelSpeed,125);assert.equal(settings.invalid.smoothScrollSoftness,50);assert.equal(settings.invalid.smoothScrollWheelSpeed,200);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>window.renderSmoothScroll(false));assert.equal(await page.locator('html.lenis').count(),0);
    await page.evaluate(()=>window.renderSmoothScroll(true));await page.waitForFunction(()=>document.documentElement.classList.contains('lenis'));
    await page.mouse.move(700,300);await page.mouse.wheel(0,600);await page.waitForFunction(()=>window.scrollY>100);
    const nested=await page.evaluate(()=>{const el=document.createElement('div');el.style.cssText='position:fixed;inset:20px auto auto 20px;width:200px;height:100px;overflow:auto';el.dataset.lenisPrevent='';el.innerHTML='<div style="height:1000px">Nested</div>';document.body.append(el);return true;});assert(nested);
    await page.mouse.move(80,60);await page.mouse.wheel(0,200);await page.waitForFunction(()=>document.querySelector('[data-lenis-prevent]').scrollTop>0);
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis'));
    await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.classList.contains('lenis'));
    await page.evaluate(()=>window.renderSmoothScroll(false));await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis'));
    await page.evaluate(()=>{document.querySelector('[data-lenis-prevent]').remove();window.scrollTo(0,0);window.renderSmoothScroll(true,true);});
    await page.waitForFunction(()=>document.querySelector('[data-pf-pages-scroll="active"]').classList.contains('lenis'));
    await page.mouse.move(150,200);await page.mouse.wheel(0,400);await page.waitForFunction(()=>document.querySelector('[data-pf-pages-scroll="active"]').scrollTop>100);
    await page.evaluate(()=>window.renderSmoothScroll(false,true));await page.waitForFunction(()=>!document.querySelector('.lenis'));
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Lenis opt-in, wheel scrolling, native nested scroll, reduced-motion live changes, cleanup and Pages viewport.');return;
  }
  if(process.env.HERO_BACKGROUND_ONLY){
    const checks=await page.evaluate(()=>window.checkHeroBackground());
    assert.equal(checks.original.sectionBackgroundFill,'gradient');assert.equal(checks.original.sectionBackgroundGradientAngle,37);
    assert.equal(checks.off.sectionBackgroundEnabled,false);assert.equal(checks.on.sectionBackgroundEnabled,true);
    assert.equal(checks.on.sectionBackgroundFill,'gradient');assert.equal(checks.on.sectionBackgroundGradientFrom,'#123456');
    assert.equal(checks.saved.heroSectionBackgroundEdgeFade,true);assert.equal(checks.saved.paletteFamily,'indigo');
    assert.deepEqual(checks.actualPalette,checks.expectedPalette);
    await page.evaluate(()=>window.renderHeroBackground());
    const enabled=page.getByRole('switch',{name:'Enable section background',exact:true});await enabled.waitFor();
    await page.getByRole('switch',{name:'Individual palette',exact:true}).click();
    await page.getByRole('combobox',{name:'Palette',exact:true}).selectOption('indigo');
    await enabled.click();await page.getByRole('button',{name:'Gradient',exact:true}).click();
    await page.getByRole('switch',{name:'Top/bottom fade',exact:true}).click();
    await enabled.click();await enabled.click();
    assert.equal(await page.getByRole('button',{name:'Gradient',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Image',exact:true}).click();await page.getByText('Background image',{exact:true}).waitFor();
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Hero shared background controls, individual palette, legacy gradient preservation, on/off roundtrip, fade persistence and image controls.');return;
  }
  if(process.env.LAST_HEADERS_ONLY){
    for(const section of ['info','stack','contact','footer']){
      await page.evaluate(section=>window.renderLastHeaders(section),section);
      const catalogue=page.getByLabel('Choose a header',{exact:true});await catalogue.waitFor();
      const choices=catalogue.locator('button[aria-pressed]');assert(await choices.count()>1);
      const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
      await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
      await settings.click();await catalogue.waitFor({state:'detached'});
      await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
      await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
      await catalogue.getByRole('button',{name:/^Settings — /}).first().click();
      await page.getByRole('tab',{name:'Design',exact:true}).click();await page.getByRole('tab',{name:'Header',exact:true}).click();await catalogue.waitFor();
      console.log('PASS: '+section+' header catalogue, customization, back, selection and tab re-entry.');
    }
    assert.equal(errors.length,0,errors.join('\n'));return;
  }
  if(process.env.THREE_HEADERS_ONLY||process.env.NEXT_HEADERS_ONLY){
    for(const section of process.env.NEXT_HEADERS_ONLY?['work','tools','services']:['gallery','team','experience']){
      await page.evaluate(section=>window.renderThreeHeaders(section),section);
      const catalogue=page.getByLabel('Choose a header',{exact:true});await catalogue.waitFor();
      const choices=catalogue.locator('button[aria-pressed]');assert.equal(await choices.count(),section==='experience'?9:8);
      const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
      await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
      await settings.click();await catalogue.waitFor({state:'detached'});
      await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
      await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
      await catalogue.getByRole('button',{name:/^Settings — /}).first().click();
      await page.getByRole('tab',{name:'Design',exact:true}).click();await page.getByRole('tab',{name:'Header',exact:true}).click();await catalogue.waitFor();
      console.log('PASS: '+section+' header catalogue, customization, back, selection and tab re-entry.');
    }
    assert.equal(errors.length,0,errors.join('\n'));return;
  }
  if(process.env.FAQ_HEADER_SETTINGS_ONLY){
    await page.evaluate(()=>window.renderFaqHeaderSettings());
    const catalogue=page.getByLabel('Choose a header',{exact:true});await catalogue.waitFor();
    const choices=catalogue.locator('button[aria-pressed]');assert.equal(await choices.count(),4);
    const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
    await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
    await settings.click();await catalogue.waitFor({state:'detached'});
    await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
    assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
    await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
    await catalogue.getByRole('button',{name:/^Settings — /}).first().click();
    await page.getByRole('tab',{name:'Design',exact:true}).click();
    await page.getByRole('tab',{name:'Header',exact:true}).click();await catalogue.waitFor();
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: FAQ header direct catalogue, four designs, keyboard customization, selection, back and tab re-entry.');return;
  }
  if(process.env.REMAINING_SETTINGS_ONLY){
    for(const section of ['hero','stack','info','services','about']){
      await page.evaluate(section=>window.renderRemainingSettings(section),section);
      const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
      const choices=catalogue.locator('button[aria-pressed]');assert(await choices.count()>1);
      const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
      await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
      await settings.click();await catalogue.waitFor({state:'detached'});
      await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
      assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
      await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
      console.log('PASS: '+section+' catalogue and customization flow.');
    }
    assert.equal(errors.length,0,errors.join('\n'));return;
  }
  if(process.env.WORK_SETTINGS_ONLY||process.env.TOOLS_SETTINGS_ONLY){
    await page.evaluate(tools=>tools?window.renderToolsSettings():window.renderWorkSettings(),!!process.env.TOOLS_SETTINGS_ONLY);
    const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
    const choices=catalogue.locator('button[aria-pressed]');assert(await choices.count()>1);
    const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
    await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
    await settings.click();await catalogue.waitFor({state:'detached'});
    await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
    assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
    await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Portfolio/Tools direct catalogue, accessible customization, associated settings, back and selection without closing.');return;
  }
  if(process.env.EXPERIENCE_SETTINGS_ONLY){
    await page.evaluate(()=>window.renderExperienceSettings());
    const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
    const choices=catalogue.locator('button[aria-pressed]');assert.equal(await choices.count(),11);
    const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
    await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
    await settings.click();await catalogue.waitFor({state:'detached'});
    await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
    assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
    await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: Experience direct catalogue, accessible customization, associated settings, back and selection without closing.');return;
  }
  if(process.env.OTHER_SETTINGS_ONLY){
    for(const section of ['faq','contact','footer']){
      await page.evaluate(section=>window.renderOtherSettings(section),section);
      const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
      const choices=catalogue.locator('button[aria-pressed]');assert(await choices.count()>1);
      const settings=catalogue.getByRole('button',{name:/^Settings — /}).nth(1);
      await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
      await settings.click();await catalogue.waitFor({state:'detached'});
      await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
      assert.equal(await choices.nth(1).getAttribute('aria-pressed'),'true');
      await choices.first().click();assert.equal(await choices.first().getAttribute('aria-pressed'),'true');assert.equal(await catalogue.count(),1);
    }
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: FAQ, Contact, Footer direct catalogues, accessible customization, associated settings, back and selection without closing.');return;
  }
  if(process.env.GALLERY_SETTINGS_ONLY){
    await page.evaluate(()=>window.renderGallerySettings());
    const catalogue=page.getByLabel('Choose a design',{exact:true});await catalogue.waitFor();
    assert.equal(await catalogue.locator('button[aria-pressed]').count(),8);
    const settings=catalogue.getByRole('button',{name:'Settings — Floating canvas',exact:true});
    await settings.focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
    await settings.click();await catalogue.waitFor({state:'detached'});
    await page.getByRole('button',{name:'Back',exact:true}).click();await catalogue.waitFor();
    assert.equal(await catalogue.getByRole('button',{name:'Floating canvas',exact:true}).getAttribute('aria-pressed'),'true');
    await catalogue.getByRole('button',{name:'Framed grid',exact:true}).click();
    assert.equal(await catalogue.getByRole('button',{name:'Framed grid',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await catalogue.count(),1);assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: Gallery direct catalogue, accessible customization, associated settings, return and selection without closing.');return;
  }
  if(process.env.TEAM_SETTINGS_ONLY){
    await page.evaluate(()=>window.renderTeamSettings());
    const catalogue=page.getByLabel('Choose a design',{exact:true});
    await catalogue.waitFor();
    assert.equal(await catalogue.locator('button[aria-pressed]').count(),11);
    const settings=catalogue.getByRole('button',{name:'Settings — Spotlight',exact:true});
    await settings.focus();
    await page.waitForFunction(()=>getComputedStyle(document.activeElement).opacity==='1');
    await settings.click();
    await catalogue.waitFor({state:'detached'});
    await page.getByRole('button',{name:'Back',exact:true}).click();
    await catalogue.waitFor();
    assert.equal(await catalogue.getByRole('button',{name:'Spotlight',exact:true}).getAttribute('aria-pressed'),'true');
    await catalogue.getByRole('button',{name:'Directory',exact:true}).click();
    assert.equal(await catalogue.getByRole('button',{name:'Directory',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await catalogue.count(),1);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('PASS: Team catalogue opens directly, settings are keyboard accessible, associated design selected, return and catalogue selection retained.');return;
  }
  if(process.env.TEAM_FRAME_ONLY){
    for(const design of ['portrait-rail','spotlight','split-screen','editorial-rhythm','directory','polaroid','profile-cards','cover-cards','avatar-cards','float-cards','floating-canvas'])for(const width of [260,360]){
      await page.evaluate(({width,design})=>window.renderTeamPortraitFrame(width,design),{width,design});
      const selector=design==='portrait-rail'?'.team-rail-card':design==='spotlight'?'.team-spotlight-portrait':design==='split-screen'?'.team-split-portrait':design==='directory'?'.team-directory-row':design==='floating-canvas'?'.team-canvas-caption':design==='float-cards'?'.team-float-card':design==='avatar-cards'?'.team-avatar-card':design==='cover-cards'?'.team-veil-card':design==='profile-cards'?'.team-profile-card':design==='polaroid'?'.team-polaroid-card':'.team-rhythm-card';
      const frame=page.frameLocator('iframe');await frame.locator(selector).first().waitFor();
      if(design==='portrait-rail'){
      assert.equal(await frame.locator('.team-rail-card').count(),3);
      assert.equal(await frame.locator('.team-rail-portrait').count(),3);
      const boxes=await frame.locator('.team-rail-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y};}));
      assert(boxes[1].x>boxes[0].x&&Math.abs(boxes[1].y-boxes[0].y)<2,'Portraits share the real horizontal rail');
      }
      if(design==='spotlight'){
        assert.equal(await frame.locator('.team-spotlight-image-layer').count(),4);
        assert.equal(await frame.locator('.team-spotlight-tab').count(),3);
      }
      if(design==='split-screen')assert.equal(await frame.locator('.team-split-layer').count(),3);
      if(design==='directory')assert.equal(await frame.locator('.team-directory-row').count(),3);
      if(design==='floating-canvas'){
        assert.equal(await frame.locator('.team-canvas-caption').count(),3);
        const cards=await frame.locator('article [data-pf-canvas-parallax]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,captionFirst:node.firstElementChild.classList.contains('team-canvas-caption')};}));
        assert.equal(cards.length,3);
        assert(cards[1].x>cards[0].x&&Math.abs(cards[2].x-cards[0].x)<2,'Real canvas columns and editorial slot retained');
        assert(cards[1].y>cards[0].y&&cards[2].y>cards[1].y,'Asymmetric offsets and second row retained');
        assert.deepEqual(cards.map(card=>card.captionFirst),[true,true,false],'Captions alternate by composition slot');
      }
      if(design==='avatar-cards'){
        assert.equal(await frame.locator('.team-avatar-card').count(),3);
        assert.equal(await frame.locator('.team-avatar-mask').count(),3);
        assert.equal(await frame.locator('.team-avatar-name').count(),3);
        const boxes=await frame.locator('.team-avatar-mask').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,w:r.width,h:r.height};}));
        assert(boxes.every(box=>Math.abs(box.w-box.h)<2),'Actual square avatar masks retained');
        assert(boxes[1].x>boxes[0].x&&boxes[2].x>boxes[1].x,'Actual three-column avatar layout retained');
      }
      if(design==='cover-cards'){
        assert.equal(await frame.locator('.team-veil-card').count(),3);
        const opacity=await frame.locator('.team-veil-caption').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).opacity));
        assert.deepEqual(opacity,['1','0','0'],'Only the first portrait demonstrates the revealed veil');
      }
      if(design==='profile-cards'){
        await frame.locator('.team-profile-caption').last().waitFor();
        assert.equal(await frame.locator('.team-profile-card').count(),3);
        assert.equal(await frame.locator('.team-profile-caption').count(),3);
        const boxes=await frame.locator('.team-profile-card').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().x));
        assert(boxes[1]>boxes[0]&&boxes[2]>boxes[1],'Real profile grid retained');
      }
      if(design==='polaroid'){
        await page.waitForFunction(()=>document.querySelector('iframe')?.contentDocument?.querySelectorAll('.team-polaroid-caption').length===3);
        assert.equal(await frame.locator('.team-polaroid-card').count(),3);
        assert.equal(await frame.locator('.team-polaroid-caption').count(),3);
        const boxes=await frame.locator('.team-polaroid-card').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().x));
        assert(boxes[1]>boxes[0]&&boxes[2]>boxes[1],'Real horizontal print rail retained');
      }
      if(design==='editorial-rhythm'){
        assert.equal(await frame.locator('.team-rhythm-card').count(),3);
        const boxes=await frame.locator('.team-rhythm-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,w:r.width};}));
        assert(boxes[0].w>boxes[1].w,'Editorial trio retains its larger lead member');
      }
      assert.equal(await frame.locator('img,video,nav,footer,script').count(),0);
      await page.waitForFunction(()=>{const f=document.querySelector('iframe');const content=f?.contentDocument?.querySelector('#preview>div');return content&&Math.abs(f.parentElement.getBoundingClientRect().height-content.getBoundingClientRect().height*f.getBoundingClientRect().width/1280)<=2;});
      await page.getByRole('button').click();assert.equal(await page.evaluate(()=>window.picked),design);
    }
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: 11 real Team layouts, neutral media, auto height and selection, 260/360px, no media or app chrome.');return;
  }
  if(process.env.FLOATING_FRAME_ONLY){
    assert.equal(designs.length,8);assert(!designs.includes('cinema-strip'));
    const migration=await page.evaluate(()=>window.retiredDesignChecks());
    assert.equal(migration.migrated.design,'caption-carousel');assert.equal(migration.legacyBase.design,'caption-carousel');
    assert.deepEqual(migration.migrated.mediaOrder,['keep-this-media']);assert.equal(migration.migrated.gap,32);assert.equal(migration.current,'hero-mosaic');
    for(const design of ['floating-canvas','caption-carousel','hero-mosaic','tall-row','editorial-split','visual-index','contact-sheet'])for(const width of [260,360]){
      await page.evaluate(({width,design})=>window.renderFloatingFrame(width,design),{width,design});
      const frame=page.frameLocator('iframe');const selector=design==='floating-canvas'?'.pf-canvas-tile':design==='caption-carousel'?'.pf-gallery-caption-card':design==='tall-row'?'.pf-gallery-tall-card':design==='editorial-split'?'.pf-gallery-editorial-card':design==='visual-index'?'.pf-gallery-index-image':design==='contact-sheet'?'.gallery-shot-item':'.pf-gallery-mosaic';await frame.locator(selector).first().waitFor();
      if(design==='floating-canvas'){
      assert.equal(await frame.locator('.pf-canvas-lane').count(),3);
      assert.equal(await frame.locator('.pf-canvas-tile').count(),6);
      }else if(design==='caption-carousel')assert.equal(await frame.locator('.pf-gallery-caption-card').count(),6);
      assert.equal(await frame.locator('img,video,nav:not(.pf-gallery-index-nav),footer,script').count(),0);
      await page.waitForFunction(()=>{const f=document.querySelector('iframe');const content=f?.contentDocument?.querySelector('#preview>div');return content&&Math.abs(f.parentElement.getBoundingClientRect().height-content.getBoundingClientRect().height*f.getBoundingClientRect().width/parseFloat(f.style.width))<=2;});
      if(design==='hero-mosaic'){
        assert.equal(await frame.locator('.pf-gallery-mosaic-grid').count(),1,'One representative mosaic, not a second chunk');
        const geometry=await frame.locator('.pf-gallery-mosaic-grid').evaluate(grid=>{const hero=grid.firstElementChild.getBoundingClientRect();const tile=grid.children[1].getBoundingClientRect();return {heroWidth:hero.width,tileWidth:tile.width,heroX:hero.x,tileX:tile.x,heroY:hero.y,tileY:tile.y};});
        assert(geometry.tileX>geometry.heroX+geometry.heroWidth-2,'Small tiles stay beside the hero');
        assert(Math.abs(geometry.heroY-geometry.tileY)<2,'Desktop mosaic keeps one top baseline');
        assert(geometry.heroWidth>geometry.tileWidth*1.8,'Dominant hero stays twice as wide as a tile');
      }
      if(design==='tall-row'){
        assert.equal(await frame.locator('.pf-gallery-tall-card').count(),6);
        const positions=await frame.locator('.pf-gallery-tall-card').evaluateAll(cards=>cards.slice(0,3).map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
        assert(positions[0].h>positions[0].w,'Portrait format retained');
        assert(positions[1].x>positions[0].x,'Cards stay in a horizontal rail');
      }
      if(design==='editorial-split'){
        assert.equal(await frame.locator('.pf-gallery-editorial-card').count(),4);
        const boxes=await frame.locator('.pf-gallery-editorial-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width};}));
        assert(boxes[0].w>boxes[1].w*1.8,'Wide then narrow');
        assert(boxes[3].w>boxes[2].w*1.8,'Narrow then wide');
        assert(Math.abs(boxes[0].y-boxes[1].y)<2&&boxes[2].y>boxes[0].y,'Two editorial rows');
      }
      if(design==='visual-index'){
        assert.equal(await frame.locator('.pf-gallery-index-choice').count(),3);
        const geometry=await frame.locator('.pf-gallery-index-layout').evaluate(layout=>{const main=layout.querySelector('.pf-gallery-index-main').getBoundingClientRect();const nav=layout.querySelector('.pf-gallery-index-nav').getBoundingClientRect();return {mainX:main.x,mainW:main.width,navX:nav.x};});
        assert(geometry.navX>=geometry.mainX+geometry.mainW,'Index stays beside the main image');
      }
      if(design==='contact-sheet'){
        assert.equal(await frame.locator('.gallery-shot-item').count(),6);
        assert.equal(await frame.locator('.gallery-shot-caption').count(),6);
        const boxes=await frame.locator('.gallery-shot-item').evaluateAll(items=>items.map(item=>{const r=item.getBoundingClientRect();return {x:r.x,y:r.y};}));
        assert(boxes[0].x<boxes[1].x&&boxes[1].x<boxes[2].x,'Three columns');
        assert(Math.abs(boxes[0].y-boxes[2].y)<2&&boxes[3].y>boxes[0].y,'Two aligned rows');
      }
      await page.getByRole('button').click();assert.equal(await page.evaluate(()=>window.picked),design);
    }
    assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: 7 real gallery layouts, no media requests, geometry, auto height and selection, 260/360px.');return;
  }
  if(process.env.PROTOTYPE_ONLY){
    for(const dark of [false,true])for(const width of [260,360]){
      await page.evaluate(({dark,width})=>window.renderAllSchematics(dark,width),{dark,width});
      await page.waitForTimeout(100);
      const cards=page.locator('[data-gallery-layout-prototype]');assert.equal(await cards.count(),31);
      assert.equal(await cards.locator('img,iframe').count(),0);
      for(const card of await cards.all()){
        assert(await card.evaluate(el=>el.scrollWidth<=el.clientWidth),'All layouts fit sidebar');
        const id=await card.getAttribute('data-gallery-layout-prototype');
        await card.getByRole('button').click();assert.equal(await page.evaluate(()=>window.chosen),id);
      }
    }
    for(const dark of [false,true])for(const width of [260,360]){
      await page.evaluate(({dark,width})=>window.renderPrototype(dark,width),{dark,width});
      const card=page.locator('[data-gallery-layout-prototype="framed-grid"]');await card.waitFor();
      assert.equal(await card.locator('img,iframe').count(),0,'Prototype requires no image or iframe');
      assert(await card.evaluate(el=>el.scrollWidth<=el.clientWidth),'No overflow at narrow sidebar widths');
      await page.getByRole('button',{name:'Essayer — Grille encadrée'}).click();assert(await page.evaluate(()=>window.tried));
      if(width===360)await card.screenshot({path:path.join(dir,dark?'prototype-dark.png':'prototype-light.png')});
    }
    console.log('PASS: 31 Galerie/Team/Experience schematic cards, light/dark, 260/360px, no assets, all Try actions.');return;
  }
  for(const design of designs)for(const mode of ['light']){
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(({design,mode})=>window.renderGallery(design,mode),{design,mode});
    await page.locator('#root').waitFor();await page.waitForTimeout(400);
    const footer=page.locator('#root');
    await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';img.scrollIntoView({block:'center'});await new Promise(resolve=>setTimeout(resolve,80));}window.scrollTo(0,0);});
    await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0),{},{timeout:10000}).catch(async e=>{console.log(await page.locator('img').evaluateAll(els=>els.map(x=>({src:x.currentSrc,complete:x.complete,width:x.naturalWidth}))));throw e;});

    const box=await footer.boundingBox();assert(box&&box.height>30,design+' has real content');
    const bitmap=await footer.screenshot({animations:'disabled',timeout:15000});
    const file=path.join(output,design+'-'+mode+'.webp');
    let image=sharp(bitmap);

    await image.resize({width:1000}).webp({quality:90}).toFile(file);
    console.log(design+' '+mode+' '+fs.statSync(file).size+' bytes');
  }
  await page.evaluate(()=>window.renderCatalog());
  await page.waitForFunction(()=>document.images.length===9&&[...document.images].every(x=>x.complete&&x.naturalWidth===1000));
  await page.getByRole('button').first().hover();assert.equal(await page.locator('iframe').count(),0);
  await page.getByRole('button').first().click();assert.equal(await page.evaluate(()=>window.picked),'framed-grid');
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: 9 real gallery designs, loaded images, no iframe, selection preserved.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
