import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1200}});
 const capture=async(path)=>{await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path,fullPage:true});};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');await page.locator('canvas').waitFor();await page.locator('#start').click();
 const customer=id=>page.locator(`[data-customer="${id}"]`);
 const cook=item=>page.locator(`[data-cook="${item}"]`);
 const oilState=()=>page.locator('[data-cook=chicken] .oil-bubble').first().evaluate(el=>getComputedStyle(el).animationPlayState);
 const food=item=>page.locator(`[data-add="${item}"]:not(:disabled)`).first();
 const waitStock=async(item,n)=>page.waitForFunction(({item,n})=>Number(document.getElementById(`stock-${item}`).textContent.split('/')[0])>=n,{item,n});
 assert.equal(await page.locator('aside,#orders').count(),0);
 assert.match(await page.locator('.business-hours').innerText(),/10:00.*22:00/);
 assert.equal(await page.locator('#employee').count(),1);
 assert.equal(await page.locator('#employee .worker-art').count(),1);
 assert.equal(await page.locator('#employee .chef-hat').count(),0);
 const proportions=await page.locator('#employee').evaluate(el=>el.getBoundingClientRect().height/document.getElementById('world').getBoundingClientRect().height);
 assert.ok(proportions>.1&&proportions<.14,'Reference worker must fit the shop scale');
 assert.equal(await page.locator('#world #shop-clock').count(),1);
 const layout=await page.evaluate(()=>({machine:document.querySelector('[data-cook=chicken]').getBoundingClientRect().toJSON(),storage:document.querySelector('.cabinet').getBoundingClientRect().toJSON(),cashier:document.querySelector('#cashier').getBoundingClientRect().toJSON(),tray:document.querySelector('.tray-station').getBoundingClientRect().toJSON()}));
 assert.ok(layout.machine.y>layout.storage.y&&layout.cashier.x<layout.tray.x&&layout.tray.x<layout.storage.x,'Compact register, tray stack and warmer run along the service line');
 assert.match(await customer(1).innerText(),/คุณ.+/);
 await customer(1).locator('.person').click();
 const recipe=(await customer(1).getAttribute('data-order-items')).split(',');
 const prices={chicken:59,fries:29,drink:19};
 const expectedRevenue=Math.round(recipe.reduce((sum,item)=>sum+prices[item],0)*1.1*100)/100;
 const expectedCosts=40+(recipe.includes('fries')?8:0);
 await customer(1).locator('.person').click();assert.match(await customer(1).getAttribute('aria-label'),/รับออเดอร์แล้ว/);
 await customer(1).click();assert.equal(await page.locator('#revenue').innerText(),'฿0');
 assert.equal(await oilState(),'paused');
 const restingStaff=await page.locator('#employee').getAttribute('style');
 await cook('chicken').click({clickCount:2});await cook('drink').click();
 assert.equal(await page.locator('[data-cook=drink] .soda-stream').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
 assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 2 / 5');
 assert.equal(await page.locator('#costs').innerText(),'฿40');
 assert.ok(await page.locator('.money-popup.expense').count()>0);
 await page.waitForFunction(()=>document.getElementById('employee').dataset.moving==='true');
 assert.equal(await oilState(),'running');
 const oilMotion=()=>page.locator('[data-cook=chicken] .oil-surface').evaluateAll(els=>JSON.stringify(els.map(el=>getComputedStyle(el).transform)));
 const beforeOil=await oilMotion();await page.waitForTimeout(150);assert.notEqual(await oilMotion(),beforeOil,'Oil should visibly move while cooking');
 assert.notEqual(await page.locator('#employee').getAttribute('style'),restingStaff,'Employee should leave the cashier for work');
 await capture('artifacts/kitchen-queued.png');
 await page.locator('#pause').click();assert.equal(await oilState(),'paused');const time=await page.locator('#time').innerText();const timer=await page.locator('#timer-chicken').innerText();
 const pausedStaff=await page.locator('#employee').getAttribute('style');const pausedShop=await page.locator('#shop-clock').innerText();const pausedOil=await oilMotion();await page.waitForTimeout(1100);assert.equal(await oilMotion(),pausedOil,'Oil should freeze while paused');assert.equal(await page.locator('#employee').getAttribute('style'),pausedStaff);assert.equal(await page.locator('#shop-clock').innerText(),pausedShop);assert.equal(await page.locator('#time').innerText(),time);assert.equal(await page.locator('#timer-chicken').innerText(),timer);await page.locator('#resume').click();
 await waitStock('chicken',1);assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 1 / 5');
 await capture('artifacts/kitchen-cabinet.png');
 // An empty tray is always wrong, regardless of the randomized recipe.
 const trayArea=page.locator('.tray-station');
 const clickTrayRim=async()=>{const box=await trayArea.boundingBox();await page.mouse.click(box.x+box.width*.04,box.y+box.height*.67);};
 await clickTrayRim();
 assert.match(await page.locator('#served').innerText(),/^0 /);assert.match(await page.locator('#message').innerText(),/ยังไม่ตรง/);
 assert.equal(await page.locator('.customer-reaction.angry').count(),1);
 await page.waitForTimeout(300);await capture('artifacts/reaction-wrong.png');
 if(recipe.includes('fries')){await cook('fries').click();await waitStock('fries',1);}
 for(const item of recipe)await food(item).click();
 assert.equal(await page.locator('#serve').getAttribute('class'),'serving-tray ready');
 await page.waitForTimeout(550);await capture('artifacts/kitchen-tray.png');
 // Click the blank rim/stack area outside the actual serve button.
 await clickTrayRim();
 assert.match(await page.locator('#served').innerText(),/^1 /);
 assert.equal(await page.locator('#profit').innerText(),`฿${expectedRevenue-expectedCosts}`);
 assert.equal(await page.locator('.money-popup.income').innerText(),`+฿${expectedRevenue}`);
 assert.equal(await page.locator('.customer-reaction.happy').count(),1);assert.equal(await customer(1).count(),0);assert.ok(await page.locator('[data-customer]').count()>=1,'Empty shop must refill immediately');
 await page.waitForTimeout(300);await capture('artifacts/reaction-happy.png');
 console.log('PASS: named overhead orders, no sidebar, click queue, sequential cooking, paused cooldown, physical stock, wrong tray rejection, click-to-serve');
 if(process.argv.includes('--orders')) { await customer(4).waitFor({timeout:65000});const keys=await page.locator('[data-customer]').evaluateAll(nodes=>nodes.map(el=>el.dataset.orderItems.split(',').sort().join(',')));assert.equal(new Set(keys).size,keys.length);await customer(3).click();assert.match(await customer(3).getAttribute('aria-label'),/รับออเดอร์แล้ว/);await customer(4).locator('.bubble').click();assert.match(await customer(4).getAttribute('aria-label'),/รับออเดอร์แล้ว/); }
 else {
  // Capacity rejection cannot charge a sixth piece; slots are exact, not decorative counters.
  for(let i=0;i<5;i++)await cook('fries').click();const cost=await page.locator('#costs').innerText();await cook('fries').click();assert.equal(await page.locator('#costs').innerText(),cost);assert.match(await page.locator('#message').innerText(),/ครบ 5 ชิ้น/);
  await waitStock('fries',5);assert.equal(await page.locator('[data-add="fries"]:not(:disabled)').count(),5);assert.equal(await page.locator('#queue-fries').innerText(),'คิว 0 / 5');
  assert.equal(await page.locator('[data-cook=fries] .oil-bubble').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await food('fries').click();const beforeClear=await page.locator('#served').innerText();await page.locator('#clear').click();assert.equal(await page.locator('#served').innerText(),beforeClear);assert.match(await page.locator('#message').innerText(),/คืนอาหาร/);assert.equal(await page.locator('[data-add="fries"]:not(:disabled)').count(),5);
  // Keyboard actions use the same state as direct scene clicks.
  await page.keyboard.press('Tab');await page.keyboard.press('e');await page.keyboard.press('3');await waitStock('drink',1);await page.keyboard.press('r');assert.equal(await page.locator('#tray-items').innerText(),'🥤');await page.keyboard.press('Backspace');assert.equal(await page.locator('#stock-drink').innerText(),'1/5');
  await capture('artifacts/kitchen-desktop.png');
  console.log('PASS: five-piece cap, automatic queue drain, five physical slots, return food, keyboard');
 }
 await page.setViewportSize({width:390,height:844});
 const mobileCustomer=page.locator('[data-customer]').first();await mobileCustomer.click();assert.match(await mobileCustomer.getAttribute('aria-label'),/รับออเดอร์แล้ว/);
 await cook('drink').click();await waitStock('drink',1);await food('drink').click();await page.locator('#clear').click();
 await page.waitForTimeout(550);
 await capture('artifacts/kitchen-mobile.png');
 await page.locator('.world-scroll').evaluate(el=>el.scrollLeft=0);
 const bounds=await page.locator('[data-customer]').first().evaluate(el=>({bubble:el.querySelector('.bubble').getBoundingClientRect().bottom,head:el.querySelector('.head').getBoundingClientRect().top}));
 assert.ok(bounds.head>=bounds.bubble,'Customer must stay below the order bubble');
 await capture('artifacts/kitchen-mobile-left.png');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: mobile fitted scene, customer/station/cabinet/tray clicks, no page errors');
 if(!process.argv.includes('--orders')&&!process.argv.includes('--kitchen')) {
  console.log('Waiting for sunset, night and shift end...');
  await page.waitForFunction(()=>document.getElementById('world').dataset.lighting==='sunset',null,{timeout:160000});await capture('artifacts/storefront-sunset.png');
  await page.waitForFunction(()=>document.getElementById('world').dataset.lighting==='night',null,{timeout:90000});await capture('artifacts/storefront-night.png');
  assert.ok(Number(await page.locator('#world').evaluate(el=>el.style.getPropertyValue('--night-level')))>=.7);await page.waitForFunction(()=>document.getElementById('overlay').dataset.mode==='end',null,{timeout:210000});
  assert.equal(await page.locator('#shop-clock').innerText(),'22:00');assert.equal(await page.locator('#summary-revenue').innerText(),`฿${expectedRevenue}`);assert.equal(await page.locator('#summary-profit').innerText(),await page.locator('#profit').innerText());await capture('artifacts/day-summary.png');
  await page.locator('#restart').click();assert.match(await page.locator('#served').innerText(),/^0 /);assert.equal(await page.locator('#stock-chicken').innerText(),'0/5');assert.equal(await page.locator('#queue-chicken').innerText(),'คิว 0 / 5');assert.equal(await page.locator('#costs').innerText(),'฿0');assert.deepEqual(errors,[]);console.log('PASS: shift end and clean restart');
 }
} finally {await browser.close()}
