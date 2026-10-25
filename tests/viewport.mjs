import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');await page.locator('#start').click();
 const sizes=[{width:1366,height:768},{width:1280,height:720},{width:1440,height:900},{width:1024,height:768},{width:390,height:844},{width:844,height:390}];
 for(const viewport of sizes){
  await page.setViewportSize(viewport);await page.waitForTimeout(200);
  const result=await page.evaluate(()=>{
   const world=document.getElementById('world').getBoundingClientRect(),host=document.querySelector('.world-scroll').getBoundingClientRect();
   return {world:world.toJSON(),host:host.toJSON(),scrollX:document.documentElement.scrollWidth-innerWidth,scrollY:document.documentElement.scrollHeight-innerHeight,targets:[...document.querySelectorAll('[data-cook],.cabinet,#serve,#cashier,#shop-clock')].map(el=>el.getBoundingClientRect().toJSON()),stations:[...document.querySelectorAll('[data-cook]')].map(el=>el.getBoundingClientRect().toJSON())};
  });
  assert.ok(result.world.left>=result.host.left-1&&result.world.right<=result.host.right+1,`Scene width at ${viewport.width}x${viewport.height}`);
  assert.ok(result.world.top>=result.host.top-1&&result.world.bottom<=result.host.bottom+1,`Scene height at ${viewport.width}x${viewport.height}`);
  assert.ok(result.scrollX<=1&&result.scrollY<=1,'No page scrolling');
  for(const box of result.stations)assert.ok(Math.abs(box.bottom-result.world.bottom)<1.5&&Math.abs(box.bottom-result.host.bottom)<1.5,'Cooking machines must touch the lower scene edge');
  for(const box of result.targets)assert.ok(box.left>=0&&box.top>=0&&box.right<=viewport.width+1&&box.bottom<=viewport.height+1,`Every workstation stays on screen at ${viewport.width}x${viewport.height}: ${JSON.stringify(box)}`);
  await page.screenshot({path:`artifacts/fit-${viewport.width}x${viewport.height}.png`});
  console.log(`PASS: whole shop and controls visible at ${viewport.width}x${viewport.height}`);
 }
 await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(150);
 await page.locator('[data-customer="1"] .person').click();
 await page.locator('[data-cook="chicken"]').click();await page.locator('[data-cook="drink"]').click();
 await page.waitForFunction(()=>document.getElementById('stock-chicken').textContent==='1/5');
 await page.locator('[data-add="chicken"]:not(:disabled)').first().click();await page.locator('[data-add="drink"]:not(:disabled)').first().click();await page.locator('#serve').click();
 assert.equal(await page.locator('#revenue').innerText(),'฿88');assert.match(await page.locator('#served').innerText(),/^1 /);
 await page.locator('#pause').click();assert.equal(await page.locator('#overlay').getAttribute('data-mode'),'pause');await page.locator('#resume').click();
 assert.deepEqual(errors,[]);console.log('PASS: scaled mouse flow, food transfers, service and pause');
}finally{await browser.close()}
