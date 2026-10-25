import Phaser from 'phaser';
import { Shift, menu, items, capacity, type Item, type FoodEvent, type ReactionEvent } from './game';
import './style.css';
import { equipmentArt, cashierArt } from './equipment';
import { Employee } from './employee';
import { storefrontArt, displayCaseArt, daylight } from './storefront';
import { restaurantDecor } from './decor';
let sceneScale = 1;
let employee = new Employee();
let shift = new Shift();
const $ = (id: string) => document.getElementById(id)!;
const stationX = [30, 330, 750];
const stationWidth = [30, 30, 21];
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<header><a class="brand" href="./"><span class="logo">C<span>★</span></span><span>CRISPY SHIFT<small>ร้านเล็ก ๆ ความฝันกรอบ ๆ</small></span></a><span class="edition">FAST FOOD SIMULATOR <b>08</b></span><button id="pause">⏸ หยุดเกม <kbd>Space</kbd></button></header>
<main><div class="title"><div><span class="eyebrow">YOUR FIRST DAY · กะแรกของคุณ</span><h1>ความอร่อย เริ่มที่มือคุณ<span>✦</span></h1><p>คลิกลูกค้า → เข้าคิวทำอาหาร → หยิบจากตู้ลงถาด → คลิกถาดเสิร์ฟ</p></div></div>
<div class="stats">${[['revenue','รายรับวันนี้'],['costs','วัตถุดิบวันนี้'],['profit','กำไรวันนี้'],['served','เสิร์ฟแล้ว'],['lost','ลูกค้าออกจากร้าน']].map(([id,label])=>`<div><span>${label}</span><strong id="${id}">0</strong></div>`).join('')}</div>
<section class="restaurant"><div class="section-label"><span><i></i> LIVE KITCHEN</span><span>คลิกทุกอย่างในร้านได้เลย · <span id="count">ลูกค้า 0 / 4</span></span></div><div class="world-scroll"><div id="world"><div id="canvas-layer"></div><div class="storefront" aria-label="กระจกหน้าร้าน มองเห็นลานจอดรถ">${storefrontArt}</div>${restaurantDecor}<div class="interior-tint"></div><div class="sunbeam"></div><div class="business-hours in-game-clock"><span class="day-label">DAY 01 · วันนี้</span><span>เปิด <b>10:00</b> — ปิด <b>22:00</b></span><strong id="shop-clock">10:00</strong><span id="shop-state">พร้อมเปิดร้าน</span><span class="shift-remaining">เหลือ <b id="time">03:00</b> · เป้าหมาย 5 ออเดอร์</span><span class="hours-progress"><i id="hours-progress"></i></span></div><div id="customers" class="world-layer"></div><div class="cashier-station" id="cashier" style="left:6%;top:45%;width:18%;height:15%">${cashierArt}<span class="cashier-label">แคชเชียร์ · รับออเดอร์</span></div><div id="employee" role="img" aria-label="พนักงานของเรา รอที่แคชเชียร์"><span class="employee-tag">คุณ · พนักงาน</span><span class="chef-hat"></span><span class="chef-head"><i></i><i></i></span><span class="chef-body"><span></span></span><span class="chef-arm left"></span><span class="chef-arm right"></span><span class="chef-leg left"></span><span class="chef-leg right"></span><span class="chef-shadow"></span></div><span class="zone-label storage-zone">HOT HOLDING · ตู้อุ่นอาหาร</span><span class="zone-label kitchen-zone">HOT KITCHEN · ครัวร้อน</span>
${items.map((item,index)=>`<button class="machine world-button commercial-machine" data-cook="${item}" style="left:${stationX[index]/10}%;top:74%;width:${stationWidth[index]}%;height:26%" aria-label="ทำ${menu[item].name}">${equipmentArt(item)}<span class="machine-top"><strong>${menu[item].icon} ${menu[item].name}</strong><kbd>${index+1}</kbd></span><span class="machine-detail">${menu[item].seconds} วิ/ชิ้น · ต้นทุน ฿${menu[item].cost}</span><span class="machine-bottom"><span class="dial" id="dial-${item}"><span id="timer-${item}">+</span></span><span><b id="queue-${item}">0 / 5</b><small id="status-${item}">คลิกเพิ่มคิว</small></span></span><span class="queue-dots" id="dots-${item}"></span></button>`).join('')}
<div class="cabinet" style="left:48%;top:45%;width:41%;height:17%">${displayCaseArt}<div class="cabinet-title">ตู้เก็บอาหาร <span>คลิกอาหารเพื่อหยิบลงถาด</span></div><div class="shelves">${items.map(item=>`<div class="shelf" data-shelf="${item}"><div class="shelf-label">${menu[item].name} <b id="stock-${item}">0/5</b></div><div class="slots">${Array.from({length:capacity},(_,slot)=>`<button class="food-slot" data-add="${item}" data-slot="${slot}" aria-label="หยิบ${menu[item].name}ชิ้นที่ ${slot+1}" disabled></button>`).join('')}</div></div>`).join('')}</div></div>
<div class="tray-station" role="group" aria-label="บริเวณถาดเสิร์ฟ คลิกถาดหรือขอบเพื่อเสิร์ฟ" title="คลิกบริเวณถาดเพื่อเสิร์ฟออเดอร์" style="left:29%;top:49%;width:14%;height:16%"><div class="stacked-trays" aria-hidden="true"><i></i><i></i><i></i><i></i></div><button id="serve" class="serving-tray"><span class="tray-title">ถาดเสิร์ฟ <kbd>Enter</kbd></span><span id="tray-target">เลือกลูกค้าก่อน</span><span id="tray-items">${Array.from({length:6},()=>'<span class="tray-food"></span>').join('')}</span><span id="tray-hint">หยิบอาหารจากตู้</span></button><button id="clear">คืนอาหารเข้าตู้ <kbd>⌫</kbd></button></div><div id="food-fx" class="world-layer" aria-hidden="true"></div></div></div><div class="world-caption"><span>อาหารสูงสุดชนิดละ 5 ชิ้น รวมในคิว ตู้ และถาด</span><span>เสิร์ฟเร็ว รับทิปเพิ่ม ฿10</span></div></section>
<div id="message" role="status" aria-live="polite"></div><details class="help"><summary>วิธีเล่นและปุ่มลัด</summary><p>คลิกตัวลูกค้าเพื่อรับออเดอร์ ชื่อและอาหารอยู่เหนือหัว คลิกสถานีซ้ำเพื่อเข้าคิวทำทีละชิ้น อาหารที่เสร็จจะย้ายไปตู้ คลิกอาหารในตู้เพื่อจัดถาด แล้วคลิกถาดเพื่อเสิร์ฟให้ลูกค้าที่มีกรอบสีส้ม</p><p><kbd>Tab</kbd> เลือกลูกค้าถัดไป <kbd>E</kbd> รับออเดอร์ <kbd>1 2 3</kbd> เพิ่มคิวไก่ / ฟรายส์ / น้ำ <kbd>Q W R</kbd> หยิบลงถาด <kbd>Enter</kbd> เสิร์ฟ <kbd>Backspace</kbd> คืนอาหาร <kbd>Space</kbd> พัก</p></details><footer>CRISPY SHIFT · SMALL KITCHEN. BIG DREAMS.</footer></main><div id="overlay" class="overlay"></div>`;
function fitScene() {
  const viewport=document.querySelector<HTMLElement>('.world-scroll')!, world=$('world');
  const main=document.querySelector('main')!, padding=getComputedStyle(main);
  const available=main.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight)-2;
  const trackHeight=parseFloat(padding.gridTemplateRows.split(' ')[1]);
  const chrome=document.querySelector<HTMLElement>('.section-label')!.offsetHeight+document.querySelector<HTMLElement>('.world-caption')!.offsetHeight+2;
  sceneScale=Math.max(.05,Math.min(1,available/1000,(trackHeight-chrome)/900));
  const frame=document.querySelector<HTMLElement>('.restaurant')!;
  frame.style.width=`${1000*sceneScale+2}px`;frame.style.height=`${900*sceneScale+chrome}px`;
  world.style.transform=`scale(${sceneScale})`;
  world.style.left=`${Math.max(0,(viewport.clientWidth-1000*sceneScale)/2)}px`;
  world.style.top=`${Math.max(0,(viewport.clientHeight-900*sceneScale)/2)}px`;
  const clock=document.querySelector<HTMLElement>('.in-game-clock')!;clock.style.left='auto';clock.style.right='2%';
  world.dataset.scale=String(sceneScale);
}
new ResizeObserver(fitScene).observe(document.querySelector('.world-scroll')!);
window.addEventListener('resize',fitScene);
requestAnimationFrame(fitScene);
function action(fn: () => void) {
  if (!shift.started || shift.paused || shift.ended) return;
  fn(); render();
}
document.querySelector<HTMLElement>('.tray-station')!.onclick = event => {
  if ((event.target as Element).closest('#clear')) return;
  action(() => shift.serve());
};
$('clear').onclick = event => {event.stopPropagation();action(() => shift.clear());};
document.querySelectorAll<HTMLButtonElement>('[data-cook]').forEach(b => b.onclick = () => action(() => shift.cook(b.dataset.cook as Item)));
document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(b => b.onclick = () => action(() => shift.add(b.dataset.add as Item)));
function pause() { if (!shift.started || shift.ended) return; shift.paused = !shift.paused; render(); }
$('pause').onclick = pause;
$('customers').onclick = e => {
  const button = (e.target as HTMLElement).closest<HTMLElement>('[data-customer]');
  if (button) action(() => { shift.select(Number(button.dataset.customer)); shift.accept(); });
};
window.addEventListener('keydown', e => {
  if ((!shift.started || shift.paused || shift.ended) && e.key === 'Enter') return;
  const key = e.key.toLowerCase();
  if ([' ', 'tab', 'backspace', 'enter', '1', '2', '3', 'q', 'w', 'r', 'e'].includes(key)) e.preventDefault();
  if (e.repeat) return;
  if (key === ' ') { pause(); return; }
  action(() => {
    if (key === 'tab') { const index = shift.customers.findIndex(c => c.id === shift.selected); shift.selected = shift.customers[(index + 1) % shift.customers.length]?.id ?? 0; }
    if (key === 'e') shift.accept();
    if (key === 'enter') shift.serve();
    if (key === 'backspace') shift.clear();
    const cooks: Record<string, Item> = { '1': 'chicken', '2': 'fries', '3': 'drink' }, adds: Record<string, Item> = { q: 'chicken', w: 'fries', r: 'drink' };
    if (cooks[key]) shift.cook(cooks[key]);
    if (adds[key]) shift.add(adds[key]);
  });
});
function fly(event: FoodEvent) {
  const index = items.indexOf(event.item);
  const source = event.type === 'ready' ? document.querySelector(`[data-cook="${event.item}"]`) : event.type === 'add' ? document.querySelector(`[data-shelf="${event.item}"]`) : $('serve');
  const target = event.type === 'add' ? $('serve') : document.querySelectorAll(`[data-add="${event.item}"]`)[event.slot];
  if (!source || !target) return;
  const world = $('world').getBoundingClientRect(), from = source.getBoundingClientRect(), to = target.getBoundingClientRect();
  const icon = document.createElement('span'); icon.className = 'flying-food'; icon.textContent = menu[items[index]].icon;
  icon.style.left = `${(from.x + from.width/2 - world.x)/sceneScale}px`; icon.style.top = `${(from.y + from.height/2 - world.y)/sceneScale}px`;
  $('food-fx').append(icon);
  const dx = (to.x + to.width/2 - from.x - from.width/2)/sceneScale, dy = (to.y + to.height/2 - from.y - from.height/2)/sceneScale;
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
  icon.animate([{transform:'translate(-50%,-50%) scale(.8)',opacity:1},{transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% + ${dy*.5-35}px)) scale(1.25)`,opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8)`,opacity:.3}],{duration,easing:'ease-in-out'}).onfinish=()=>icon.remove();
}
function moneyPopup(amount:number,item?:Item) {
  const source=item?document.querySelector(`[data-cook="${item}"]`):$('cashier');
  if(!source)return;
  const box=source.getBoundingClientRect(), world=$('world').getBoundingClientRect();
  const popup=document.createElement('span');popup.className=`money-popup ${amount<0?'expense':'income'}`;
  popup.textContent=`${amount<0?'−':'+'}฿${Math.abs(amount)}`;
  const burst=$('food-fx').querySelectorAll('.money-popup').length%3;
  popup.style.left=`${(box.x+box.width/2-world.x)/sceneScale+(burst-1)*24}px`;popup.style.top=`${(box.y+box.height*.2-world.y)/sceneScale-burst*12}px`;
  $('food-fx').append(popup);
  const animation=popup.animate([{transform:'translate(-50%,0) scale(.85)',opacity:1},{transform:'translate(-50%,-32px) scale(1.1)',opacity:1,offset:.3},{transform:'translate(-50%,-85px) scale(1)',opacity:0}],{duration:1600,easing:'ease-out'});
  animation.onfinish=()=>popup.remove();
}
function reactionPopup(event:ReactionEvent) {
  $('food-fx').querySelector(`[data-reaction-customer="${event.customerId}"]`)?.remove();
  const node=document.createElement('span');node.className=`customer-reaction ${event.mood}`;
  node.dataset.reactionCustomer=String(event.customerId);node.dataset.mood=event.mood;
  const emoji=event.mood==='happy'?'😊':'😡';
  node.setAttribute('role','img');node.setAttribute('aria-label',`${event.mood==='happy'?'เสิร์ฟถูก':'เสิร์ฟผิด'} คุณ${event.name}`);
  node.innerHTML=`<span>${emoji}</span><small>#${event.customerId} คุณ${event.name}</small>`;
  node.style.left=`${14.5+event.index*22}%`;node.style.top='21%';
  $('food-fx').append(node);
  const animation=node.animate([{transform:'translate(-50%,0) scale(.65)',opacity:0},{transform:'translate(-50%,-12px) scale(1.15)',opacity:1,offset:.15},{transform:'translate(-50%,-20px) scale(1)',opacity:1,offset:.8},{transform:'translate(-50%,-42px) scale(.9)',opacity:0}],{duration:2200,easing:'ease-out'});
  animation.onfinish=()=>node.remove();
}
function render() {
  for (const work of shift.workEvents.splice(0)) employee.enqueue(work);
  const actor=$('employee');actor.style.left=`${employee.x/10}%`;actor.style.top=`${employee.y/9}%`;
  actor.classList.toggle('walking',employee.moving);actor.style.setProperty('--facing',String(employee.facing));
  const taskNames={cashier:'รอรับออเดอร์',cook:'ไปสถานีทำอาหาร',storage:'หยิบอาหารจากตู้',tray:'จัดถาดเสิร์ฟ'};
  actor.dataset.task=employee.current?.kind??'cashier';actor.dataset.moving=String(employee.moving);
  actor.setAttribute('aria-label',`พนักงานของเรา ${taskNames[employee.current?.kind??'cashier']}`);
  const light=daylight(shift.shopMinutes), world=$('world');
  world.style.setProperty('--sky-color',light.sky);world.style.setProperty('--night-level',String(light.night));world.style.setProperty('--dusk-level',String(light.dusk));world.style.setProperty('--sun-shift',`${light.sunShift}px`);
  world.dataset.lighting=light.night>=.7?'night':light.dusk>.45?'sunset':'day';
  $('shop-clock').textContent=shift.shopTime;
  $('shop-state').textContent=shift.ended?'ปิดร้านแล้ว':!shift.started?'พร้อมเปิดร้าน':shift.paused?'พักเกม':'เปิดให้บริการ';
  $('hours-progress').style.width=`${(180-shift.remaining)/180*100}%`;
  for(const entry of shift.moneyEvents.splice(0)) moneyPopup(entry.amount,entry.item);

  $('world').classList.toggle('simulation-paused', shift.paused || shift.ended || !shift.started);
  const seconds = Math.ceil(shift.remaining);
  $('time').textContent = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  for (const [id, value] of Object.entries({revenue:`฿${shift.revenue}`,costs:`฿${shift.costs}`,profit:`฿${shift.profit}`,served:`${shift.served} ออเดอร์`,lost:String(shift.lost)})) $(id).textContent=value;
  $('register-total').textContent=`฿${shift.revenue}`;
  $('count').textContent = `ลูกค้า ${shift.customers.length} / 4`;
  // Keep each customer's button stable while time, selected state and acceptance change.
  for (const node of Array.from($('customers').querySelectorAll<HTMLElement>('[data-customer]'))) if (!shift.customers.some(c=>c.id===Number(node.dataset.customer))) node.remove();
  shift.customers.forEach((c,index)=>{
    let button = document.querySelector<HTMLButtonElement>(`[data-customer="${c.id}"]`);
    if (!button) { button=document.createElement('button');button.dataset.customer=String(c.id);button.innerHTML=`<span class="bubble"><span class="customer-name">#${c.id} คุณ${c.name}<span class="accepted-badge">✓</span></span><span class="requested-food">${c.items.map(item=>`<span title="${menu[item].name}">${menu[item].icon}</span>`).join('')}</span><span class="customer-status"></span><span class="patience"><i></i></span></span><span class="person"><span class="head">••<span>⌣</span></span><span class="body"></span><span class="feet"></span></span>`; $('customers').append(button); }
    button.dataset.orderItems=c.items.join(',');
    button.dataset.customerName=c.name;
    button.className=`customer ${shift.selected===c.id?'selected':''} ${c.accepted?'accepted':''}`;
    button.style.left=`${7+index*22}%`;
    button.setAttribute('aria-label',`คุณ${c.name} ต้องการ ${c.items.map(i=>menu[i].name).join(' และ ')} ${c.accepted?'รับออเดอร์แล้ว':'คลิกเพื่อรับออเดอร์'}`);
    button.querySelector('.customer-status')!.textContent=`${c.accepted?'รับแล้ว':'คลิกรับ'} · ${Math.ceil(c.patience)} วิ`;
    const bar=button.querySelector<HTMLElement>('.patience i')!;bar.style.width=`${Math.max(0,c.patience/c.maxPatience*100)}%`;bar.style.background=c.patience<15?'#ce624a':'#82a578';
  });
  for (const item of items) {
    const pending=shift.queued[item];
    $(`queue-${item}`).textContent=`คิว ${pending} / 5`;
    $(`timer-${item}`).textContent=pending?`${Math.ceil(shift.cooking[item])}`:'+';
    $(`dial-${item}`).style.setProperty('--angle',`${pending?(1-shift.cooking[item]/menu[item].seconds)*360:0}deg`);
    $(`status-${item}`).textContent=pending?`กำลังทำ 1 · รอ ${pending-1}`:'คลิกเพิ่มคิว';
    $(`stock-${item}`).textContent=`${shift.stock[item]}/5`;
    $(`dots-${item}`).innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<pending?'filled':''}"></i>`).join('');
    const machine=document.querySelector<HTMLButtonElement>(`[data-cook="${item}"]`)!;
    machine.classList.toggle('busy',pending>0);machine.classList.toggle('full',shift.owned(item)>=capacity);
    machine.setAttribute('aria-label',`ทำ${menu[item].name} คิว ${pending} ชิ้น มีรวม ${shift.owned(item)} จาก 5 ชิ้น`);
    document.querySelectorAll<HTMLButtonElement>(`[data-add="${item}"]`).forEach((slot,i)=>{slot.disabled=i>=shift.stock[item];slot.textContent=i<shift.stock[item]?menu[item].icon:'';});
  }
  // Preserve pointer targets across frames: replacing a pressed food node cancels its click.
  $('tray-items').querySelectorAll<HTMLElement>('.tray-food').forEach((slot,index)=>{
    const icon=shift.tray[index]?menu[shift.tray[index]].icon:'';
    if(slot.textContent!==icon)slot.textContent=icon;
  });
  $('tray-target').textContent=shift.current?`ส่งให้ #${shift.current.id} คุณ${shift.current.name}`:'รอลูกค้า';
  $('tray-hint').textContent=shift.trayMatches?'✓ ครบแล้ว คลิกถาดเพื่อเสิร์ฟ':shift.tray.length?'จัดอาหารให้ตรงออเดอร์':'หยิบอาหารจากตู้';
  $('serve').classList.toggle('ready',shift.trayMatches);
  $('clear').toggleAttribute('disabled',shift.tray.length===0);
  $('message').textContent=shift.message;
  $('pause').innerHTML=`${shift.paused?'▶ เล่นต่อ':'⏸ หยุดเกม'} <kbd>Space</kbd>`;
  for (const event of shift.events.splice(0)) fly(event);
  for (const event of shift.reactionEvents.splice(0)) reactionPopup(event);
  for(const animation of $('food-fx').getAnimations({subtree:true})){if(shift.paused||shift.ended)animation.pause();else if(animation.playState==='paused')animation.play();}
  const mode=!shift.started?'start':shift.ended?'end':shift.paused?'pause':'';
  const overlay=$('overlay');if(overlay.dataset.mode===mode)return;overlay.dataset.mode=mode;overlay.style.display=mode?'grid':'none';
  if(mode==='start')overlay.innerHTML=`<div class="modal"><span class="modal-icon">🍗</span><span class="eyebrow">WELCOME TO YOUR LITTLE KITCHEN</span><h2>เปิดร้าน พร้อมลุย!</h2><p>กะ 3 นาที เป้าหมาย 5 ออเดอร์<br>ทุกขั้นตอนคลิกได้ในร้าน</p><div class="instructions"><span>① คลิกลูกค้ารับออเดอร์</span><span>② คลิกเครื่องเพื่อเข้าคิว</span><span>③ หยิบอาหารในตู้ลงถาด</span><span>④ คลิกถาดเพื่อเสิร์ฟ</span></div><p class="fine">แต่ละชนิดมีได้รวม 5 ชิ้น · ทำทีละชิ้นต่อเนื่องอัตโนมัติ<br>คลิกลูกค้าเพื่อเลือกคนที่จะเสิร์ฟ · ปุ่มลัดเดิมยังใช้ได้</p><button id="start" class="primary">เปิดร้าน เริ่มกะแรก →</button></div>`;
  if(mode==='pause')overlay.innerHTML='<div class="modal"><span class="modal-icon">☕</span><h2>พักสักครู่</h2><p>เวลา คิวอาหาร และความอดทนลูกค้าหยุดแล้ว</p><button id="resume" class="primary">กลับเข้าครัว · Space</button></div>';
  if(mode==='end')overlay.innerHTML=`<div class="modal"><span class="modal-icon">${shift.served>=5?'🏆':'🌅'}</span><span class="eyebrow">22:00 · ปิดร้านประจำวัน</span><h2>${shift.served>=5?'กะแรก ยอดเยี่ยม!':'จบกะแล้ว ขอบคุณที่ตั้งใจ'}</h2><p>เสิร์ฟ ${shift.served} ออเดอร์ · ลูกค้าออก ${shift.lost} คน<br>รายรับ ฿${shift.revenue} − ต้นทุน ฿${shift.costs}</p><div class="daily-report"><h3>สรุปรายได้วันนี้</h3><div><span>รายรับรวมทิป</span><b id="summary-revenue">฿${shift.revenue}</b></div><div><span>ต้นทุนวัตถุดิบทั้งหมด</span><b id="summary-costs">−฿${shift.costs}</b></div><div class="report-total"><span>กำไรสุทธิวันนี้</span><strong id="summary-profit">฿${shift.profit}</strong></div><small>ต้นทุนรวมอาหารที่เหลือในตู้ ถาด และคิวด้วย</small></div><p>เป้าหมาย 5 ออเดอร์: ${shift.served>=5?'สำเร็จ ✓':'ลองใหม่อีกครั้ง'}</p><button id="restart" class="primary">เปิดร้านอีกครั้ง →</button></div>`;
  document.getElementById('start')?.addEventListener('click',()=>{shift.start();render();});
  document.getElementById('resume')?.addEventListener('click',pause);
  document.getElementById('restart')?.addEventListener('click',()=>{shift=new Shift();employee=new Employee();$('food-fx').replaceChildren();shift.start();render();});
}
class Kitchen extends Phaser.Scene {
  g!:Phaser.GameObjects.Graphics; lastRender = 0;
  create(){this.g=this.add.graphics();this.game.canvas.setAttribute('aria-hidden','true');this.draw();}
  update(time:number,delta:number){const dt=Math.min(delta/1000,.25);shift.tick(dt);employee.tick(dt,shift.paused||shift.ended||!shift.started);if(time-this.lastRender>80){render();this.lastRender=time;}}
  draw(){const g=this.g;const rect=(x:number,y:number,w:number,h:number,c:number,r=0)=>{g.fillStyle(c);r?g.fillRoundedRect(x,y,w,h,r):g.fillRect(x,y,w,h);};
    // A compact service line and an open staff aisle, scaled around the chef.
    rect(0,0,1000,900,0xe9e6e0);
    for(let y=240;y<900;y+=40)for(let x=0;x<1000;x+=40)rect(x,y,39,39,(x/40+y/40)%2===0?0xf2efe8:0xe0dcd5);
    rect(0,244,1000,8,0x878c8c);rect(0,251,1000,6,0xc0c1b9);
    rect(39,482,903,61,0xb1aaa4,8);rect(30,474,910,62,0x9e2531,7);rect(30,465,910,49,0xf4f1e9,6);rect(30,510,910,8,0x30343a);
    for(let x=48;x<930;x+=105){rect(x,521,86,9,0xc4424b,2);}
    // Full-height steel commercial line, grounded at the lower edge of the room.
    rect(20,796,950,104,0x727e83,4);rect(20,791,950,99,0xd0d5d0,4);rect(20,886,950,9,0x9e2936);rect(20,895,950,5,0x30393e);


  }
}
new Phaser.Game({type:Phaser.CANVAS,parent:'canvas-layer',width:1000,height:900,backgroundColor:'#f0e6d1',fps:{target:30,smoothStep:false},scene:Kitchen,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true}});
render();
