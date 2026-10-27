const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  const css=fs.readFileSync('components/portfolio/portfolio-experience-kinetic.module.css','utf8');
  for(const width of [320,375,390,430]) for(const mode of ['watermark','signature','vertical']) {
   await page.setViewportSize({width,height:900});
   await page.setContent(`<style>body{margin:0;background:black;color:white;font:16px Arial}.row{position:relative;padding:24px;box-sizing:border-box;width:100%}.content{margin-top:40px}button{padding:20px} ${css}</style><article class="row" data-status-style="${mode}"><p>Studio · 2023</p><h3>panneau de verre givré sur fond</h3><p class="status" data-presentation="${mode}" style="--kinetic-status-ink:white;--kinetic-status-color:green">Ongoing</p><div class="content"><p>Une description du projet</p><p>Une première tâche</p><p>Une deuxième tâche</p><aside><p>OBS Studio · Midjourney · Adobe Illustrator</p><button>Repository github ↗</button></aside></div></article>`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode} overflow at ${width}`);
   if(mode==='watermark') {
    const p=await page.locator('.status').boundingBox();
    const button=await page.locator('button').boundingBox();
    assert(p.y>=button.y+button.height,`Status overlaps CTA at ${width}`);
    const lines=await page.locator('.status').evaluate(el=>el.getBoundingClientRect().height/parseFloat(getComputedStyle(el).lineHeight));
    assert(lines<1.1,`Ongoing wraps at ${width}`);
   }
  }
  console.log('PASS: 3 status layouts at 320/375/390/430px, no overflow; watermark below CTA and single-line');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
