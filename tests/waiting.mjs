import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
async function scenario(bird,target,factor,mood){
 const page=await browser.newPage({viewport:{width:bird?390:1366,height:bird?844:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.addInitScript(bird=>{Math.random=()=>bird?.999:0},bird);await page.goto('http://127.0.0.1:5173');await page.locator('#start').click();
  const c=page.locator('[data-customer="1"]');assert.match(await c.locator('.requested-food').innerText(),/กดเพื่อรับออเดอร์/);assert.equal(await c.getAttribute('data-order-items'),'');assert.doesNotMatch(await c.getAttribute('aria-label'),/ไก่ทอด|เฟรนช์ฟรายส์|น้ำอัดลม/);
  await page.locator('#pause').click();const initial=await c.locator('.customer-status').innerText();await page.waitForTimeout(250);assert.equal(await c.locator('.customer-status').innerText(),initial);await page.locator('#resume').click();
  // A prepared drink/fries stock makes the rare six-piece rush order eligible for fast service.
  if(bird){await page.locator('[data-cook=drink]').click({clickCount:5});await page.locator('[data-cook=fries]').click();await page.waitForFunction(()=>document.getElementById('stock-drink').textContent==='5/5')}
  await c.click();const max=bird?22.5:45;assert.ok(await c.locator('.requested-food>span[title]').count()>0);assert.match(await c.locator('.customer-status').innerText(),new RegExp(`${Math.ceil(max)} วิ`));
  const order=(await c.getAttribute('data-order-items')).split(','),prices={chicken:59,fries:29,drink:19};
  if(!bird)for(const item of order)await page.locator(`[data-cook="${item}"]`).click();
  for(const item of new Set(order))await page.waitForFunction(({item,n})=>document.getElementById(`stock-${item}`).textContent===`${n}/5`,{item,n:order.filter(i=>i===item).length});
  for(const item of order)await page.locator(`[data-add="${item}"]:not(:disabled)`).first().click();
  await page.waitForFunction(target=>{const text=document.querySelector('[data-customer="1"] .customer-status')?.textContent;return text&&Number(text.match(/(\d+)%/)?.[1])<=target},target,{timeout:65000});
  await page.locator('#serve').click();await page.locator('.customer-reaction[data-reaction-customer="1"]').waitFor();assert.equal(await page.locator('.customer-reaction[data-reaction-customer="1"]').getAttribute('data-mood'),mood);
  const base=order.reduce((n,i)=>n+prices[i],0),expected=Math.round(base*(bird?2:1)*factor*100)/100;
  assert.equal(await page.locator('#revenue').innerText(),`฿${expected}`);assert.match(await page.locator('#served').innerText(),/^1 /);
  if(bird&&!factor)assert.match(await page.locator('#profit').getAttribute('title'),new RegExp(`ค่าปรับ ฿${base}`));
  await page.screenshot({path:`artifacts/waiting-${bird?'bird':'normal'}-${target}.png`});assert.deepEqual(errors,[]);console.log(`PASS ${bird?'Bird':'ordinary'} ${target}% -> ${factor}x, ${mood}`);
 }finally{await page.close()}
}
try{for(const bird of [false,true]){const results=await Promise.allSettled([[80,1.1,'happy'],[50,1,'neutral'],[30,.95,'angry'],[10,0,'angry']].map(([target,factor,mood])=>scenario(bird,target,factor,mood)));for(const r of results)if(r.status==='rejected')throw r.reason;}}finally{await browser.close()}
