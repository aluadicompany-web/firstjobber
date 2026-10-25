import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
  const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');await page.locator('#start').click();await page.locator('[data-customer="1"]').click();
  const slots=page.locator('.tray-food');const original=await slots.first().elementHandle();
  await page.waitForTimeout(300);assert.equal(await original.evaluate(el=>el.isConnected),true,'Tray cells must survive rendering');
  const points=[['food icon', '.tray-food',.5,.5],['food liner','#tray-items',.8,.5],['tray title','.tray-title',.5,.5],['customer label','#tray-target',.5,.5],['serve hint','#tray-hint',.5,.5],['left rim','#serve',.03,.5],['right rim','#serve',.97,.5],['top rim','#serve',.5,.03],['bottom rim','#serve',.5,.97],['tray stack','.stacked-trays',.8,.9]];
  for(const [label,selector,rx,ry] of points){
   const previous=await page.locator('.customer-reaction.angry').count()?await page.locator('.customer-reaction.angry').elementHandle():null;const box=await page.locator(selector).first().boundingBox();
   await page.mouse.move(box.x+box.width*rx,box.y+box.height*ry);await page.mouse.down();await page.waitForTimeout(240);await page.mouse.up();
   await page.waitForTimeout(50);assert.equal(await page.locator('.customer-reaction.angry').count(),1,`${label} must trigger service`);
   if(previous)assert.equal(await previous.evaluate(el=>el.isConnected),false,`${label} must trigger a new service attempt`);
   assert.equal(await page.locator('#revenue').innerText(),'฿0');
  }
  const recipe=(await page.locator('[data-customer="1"]').getAttribute('data-order-items')).split(',');
  const prices={chicken:59,fries:29,drink:19};
  for(const item of recipe)await page.locator(`[data-cook="${item}"]`).click();
  for(const item of recipe){await page.waitForFunction(item=>document.getElementById(`stock-${item}`).textContent==='1/5',item);await page.locator(`[data-add="${item}"]:not(:disabled)`).first().click();}
  // Reproduce a real held press directly over a filled icon across several render frames.
  const food=page.locator('.tray-food').filter({hasText:/🍗|🍟|🥤/}).first();const box=await food.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(320);await page.mouse.up();
  assert.equal(await page.locator('#revenue').innerText(),`฿${recipe.reduce((sum,item)=>sum+prices[item],10)}`);assert.match(await page.locator('#served').innerText(),/^1 /);
  assert.equal(await original.evaluate(el=>el.isConnected),true,'Serving should reuse the same cells');
  await page.locator('[data-cook="drink"]').click();await page.waitForFunction(()=>document.getElementById('stock-drink').textContent==='1/5');await page.locator('[data-add="drink"]:not(:disabled)').first().click();
  await page.locator('#clear').click();assert.match(await page.locator('#message').innerText(),/คืนอาหาร/);assert.match(await page.locator('#served').innerText(),/^1 /);assert.equal(await page.locator('#stock-drink').innerText(),'1/5');
  await page.screenshot({path:`artifacts/tray-click-${viewport.width}.png`});assert.deepEqual(errors,[]);
  console.log(`PASS ${viewport.width}x${viewport.height}: 10 tray regions, held icon click, stable cells, single payment, independent return button`);
  await page.close();
 }
}finally{await browser.close()}
