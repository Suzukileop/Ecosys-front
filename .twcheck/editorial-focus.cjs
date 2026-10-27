const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage();
  const css=fs.readFileSync('components/portfolio/portfolio-experience-editorial-status.module.css','utf8');
  await page.setContent(`<style>${css}article{padding:30px}button{padding:20px}</style><div class="focusRows" data-focus-blur="true">${[1,2,3].map(i=>`<div><article><button>Experience ${i}</button></article></div>`).join('')}</div>`);
  const rows=page.locator('article');
  await page.getByRole('button',{name:'Experience 1'}).click();
  await page.getByRole('button',{name:'Experience 2'}).hover();
  await page.waitForTimeout(550);
  const opacity=await rows.evaluateAll(es=>es.map(e=>Number(getComputedStyle(e).opacity)));
  assert.deepEqual(opacity,[.6,1,.6]);
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['blur(2px)','none','blur(2px)']);
  await page.mouse.move(700,500);
  await page.waitForTimeout(550);
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>Number(getComputedStyle(e).opacity))),[1,1,1]);
  assert.deepEqual(await rows.evaluateAll(es=>es.map(e=>getComputedStyle(e).filter)),['none','none','none']);
  console.log('PASS: first row dims despite prior click; hovered row stays clear; all reset on exit');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
