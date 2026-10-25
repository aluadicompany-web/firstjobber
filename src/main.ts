import Phaser from 'phaser';
import { Shift, menu, items, capacity, type Item, type FoodEvent } from './game';
import './style.css';
let shift = new Shift();
const $ = (id: string) => document.getElementById(id)!;
const stationX = [60, 350, 640];
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<header><a class="brand" href="./"><span class="logo">C<span>★</span></span><span>CRISPY SHIFT<small>ร้านเล็ก ๆ ความฝันกรอบ ๆ</small></span></a><span class="edition">FAST FOOD SIMULATOR <b>02</b></span><button id="pause">พักเกม <kbd>Space</kbd></button></header>
<main><div class="title"><div><span class="eyebrow">YOUR FIRST DAY · กะแรกของคุณ</span><h1>ความอร่อย เริ่มที่มือคุณ<span>✳</span></h1><p>คลิกลูกค้า → เข้าคิวทำอาหาร → หยิบจากตู้ลงถาด → คลิกถาดเสิร์ฟ</p></div><div class="clock"><span>เวลาที่เหลือ</span><strong id="time">03:00</strong><small>เป้าหมาย: 5 ออเดอร์</small></div></div>
<div class="stats">${[['revenue','รายรับ'],['costs','ต้นทุนวัตถุดิบ'],['profit','กำไรสุทธิ'],['served','เสิร์ฟแล้ว'],['lost','ลูกค้าออกจากร้าน']].map(([id,label])=>`<div><span>${label}</span><strong id="${id}">0</strong></div>`).join('')}</div>
<section class="restaurant"><div class="section-label"><span><i></i> LIVE KITCHEN</span><span>คลิกทุกอย่างในร้านได้เลย · <span id="count">ลูกค้า 0 / 4</span></span></div><div class="world-scroll"><div id="world"><div id="canvas-layer"></div><div id="customers" class="world-layer"></div>
${items.map((item,index)=>`<button class="machine world-button" data-cook="${item}" style="left:${stationX[index]/10}%;top:44.44%;width:26%;height:18.05%" aria-label="ทำ${menu[item].name}"><span class="machine-top"><strong>${menu[item].icon} ${menu[item].name}</strong><kbd>${index+1}</kbd></span><span class="machine-detail">${menu[item].seconds} วิ/ชิ้น · ต้นทุน ฿${menu[item].cost}</span><span class="machine-bottom"><span class="dial" id="dial-${item}"><span id="timer-${item}">+</span></span><span><b id="queue-${item}">0 / 5</b><small id="status-${item}">คลิกเพิ่มคิว</small></span></span><span class="queue-dots" id="dots-${item}"></span></button>`).join('')}
<div class="cabinet" style="left:6%;top:67.36%;width:57%;height:21.5%"><div class="cabinet-title">ตู้เก็บอาหาร <span>คลิกอาหารเพื่อหยิบลงถาด</span></div><div class="shelves">${items.map(item=>`<div class="shelf" data-shelf="${item}"><div class="shelf-label">${menu[item].name} <b id="stock-${item}">0/5</b></div><div class="slots">${Array.from({length:capacity},(_,slot)=>`<button class="food-slot" data-add="${item}" data-slot="${slot}" aria-label="หยิบ${menu[item].name}ชิ้นที่ ${slot+1}" disabled></button>`).join('')}</div></div>`).join('')}</div></div>
<div class="tray-station" style="left:67%;top:67.36%;width:27%;height:23.5%"><button id="serve" class="serving-tray"><span class="tray-title">ถาดเสิร์ฟ <kbd>Enter</kbd></span><span id="tray-target">เลือกลูกค้าก่อน</span><span id="tray-items"></span><span id="tray-hint">หยิบอาหารจากตู้</span></button><button id="clear">คืนอาหารเข้าตู้ <kbd>⌫</kbd></button></div><div id="food-fx" class="world-layer" aria-hidden="true"></div></div></div><div class="world-caption"><span>อาหารสูงสุดชนิดละ 5 ชิ้น รวมในคิว ตู้ และถาด</span><span>เสิร์ฟเร็ว รับทิปเพิ่ม ฿10</span></div></section>
<div id="message" role="status" aria-live="polite"></div><details class="help"><summary>วิธีเล่นและปุ่มลัด</summary><p>คลิกตัวลูกค้าเพื่อรับออเดอร์ ชื่อและอาหารอยู่เหนือหัว คลิกสถานีซ้ำเพื่อเข้าคิวทำทีละชิ้น อาหารที่เสร็จจะย้ายไปตู้ คลิกอาหารในตู้เพื่อจัดถาด แล้วคลิกถาดเพื่อเสิร์ฟให้ลูกค้าที่มีกรอบสีส้ม</p><p><kbd>Tab</kbd> เลือกลูกค้าถัดไป <kbd>E</kbd> รับออเดอร์ <kbd>1 2 3</kbd> เพิ่มคิวไก่ / ฟรายส์ / น้ำ <kbd>Q W R</kbd> หยิบลงถาด <kbd>Enter</kbd> เสิร์ฟ <kbd>Backspace</kbd> คืนอาหาร <kbd>Space</kbd> พัก</p></details><footer>CRISPY SHIFT · SMALL KITCHEN. BIG DREAMS.</footer></main><div id="overlay" class="overlay"></div>`;
function action(fn: () => void) {
  if (!shift.started || shift.paused || shift.ended) return;
  fn(); render();
}
$('serve').onclick = () => action(() => shift.serve());
$('clear').onclick = () => action(() => shift.clear());
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
  icon.style.left = `${from.x + from.width/2 - world.x}px`; icon.style.top = `${from.y + from.height/2 - world.y}px`;
  $('food-fx').append(icon);
  const dx = to.x + to.width/2 - from.x - from.width/2, dy = to.y + to.height/2 - from.y - from.height/2;
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500;
  icon.animate([{transform:'translate(-50%,-50%) scale(.8)',opacity:1},{transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% + ${dy*.5-35}px)) scale(1.25)`,opacity:1},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8)`,opacity:.3}],{duration,easing:'ease-in-out'}).onfinish=()=>icon.remove();
}
function render() {
  const seconds = Math.ceil(shift.remaining);
  $('time').textContent = `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  for (const [id, value] of Object.entries({revenue:`฿${shift.revenue}`,costs:`฿${shift.costs}`,profit:`฿${shift.profit}`,served:`${shift.served} ออเดอร์`,lost:String(shift.lost)})) $(id).textContent=value;
  $('count').textContent = `ลูกค้า ${shift.customers.length} / 4`;
  // Keep each customer's button stable while time, selected state and acceptance change.
  for (const node of Array.from($('customers').querySelectorAll<HTMLElement>('[data-customer]'))) if (!shift.customers.some(c=>c.id===Number(node.dataset.customer))) node.remove();
  shift.customers.forEach((c,index)=>{
    let button = document.querySelector<HTMLButtonElement>(`[data-customer="${c.id}"]`);
    if (!button) { button=document.createElement('button');button.dataset.customer=String(c.id);button.innerHTML=`<span class="bubble"><span class="customer-name">#${c.id} คุณ${c.name}<span class="accepted-badge">✓</span></span><span class="requested-food">${c.items.map(item=>`<span title="${menu[item].name}">${menu[item].icon}</span>`).join('')}</span><span class="customer-status"></span><span class="patience"><i></i></span></span><span class="person"><span class="head">••<span>⌣</span></span><span class="body"></span><span class="feet"></span></span>`; $('customers').append(button); }
    button.className=`customer ${shift.selected===c.id?'selected':''} ${c.accepted?'accepted':''}`;
    button.style.left=`${9+index*22}%`;
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
  $('tray-items').innerHTML=Array.from({length:6},(_,i)=>`<span class="tray-food">${shift.tray[i]?menu[shift.tray[i]].icon:''}</span>`).join('');
  $('tray-target').textContent=shift.current?`ส่งให้ #${shift.current.id} คุณ${shift.current.name}`:'รอลูกค้า';
  $('tray-hint').textContent=shift.trayMatches?'✓ ครบแล้ว คลิกถาดเพื่อเสิร์ฟ':shift.tray.length?'จัดอาหารให้ตรงออเดอร์':'หยิบอาหารจากตู้';
  $('serve').classList.toggle('ready',shift.trayMatches);
  $('clear').toggleAttribute('disabled',shift.tray.length===0);
  $('message').textContent=shift.message;
  $('pause').innerHTML=`${shift.paused?'เล่นต่อ':'พักเกม'} <kbd>Space</kbd>`;
  for (const event of shift.events.splice(0)) fly(event);
  const mode=!shift.started?'start':shift.ended?'end':shift.paused?'pause':'';
  const overlay=$('overlay');if(overlay.dataset.mode===mode)return;overlay.dataset.mode=mode;overlay.style.display=mode?'grid':'none';
  if(mode==='start')overlay.innerHTML=`<div class="modal"><span class="modal-icon">🍗</span><span class="eyebrow">WELCOME TO YOUR LITTLE KITCHEN</span><h2>เปิดร้าน พร้อมลุย!</h2><p>กะ 3 นาที เป้าหมาย 5 ออเดอร์<br>ทุกขั้นตอนคลิกได้ในร้าน</p><div class="instructions"><span>① คลิกลูกค้ารับออเดอร์</span><span>② คลิกเครื่องเพื่อเข้าคิว</span><span>③ หยิบอาหารในตู้ลงถาด</span><span>④ คลิกถาดเพื่อเสิร์ฟ</span></div><p class="fine">แต่ละชนิดมีได้รวม 5 ชิ้น · ทำทีละชิ้นต่อเนื่องอัตโนมัติ<br>คลิกลูกค้าเพื่อเลือกคนที่จะเสิร์ฟ · ปุ่มลัดเดิมยังใช้ได้</p><button id="start" class="primary">เปิดร้าน เริ่มกะแรก →</button></div>`;
  if(mode==='pause')overlay.innerHTML='<div class="modal"><span class="modal-icon">☕</span><h2>พักสักครู่</h2><p>เวลา คิวอาหาร และความอดทนลูกค้าหยุดแล้ว</p><button id="resume" class="primary">กลับเข้าครัว · Space</button></div>';
  if(mode==='end')overlay.innerHTML=`<div class="modal"><span class="modal-icon">${shift.served>=5?'🏆':'🌅'}</span><span class="eyebrow">SHIFT COMPLETE</span><h2>${shift.served>=5?'กะแรก ยอดเยี่ยม!':'จบกะแล้ว ขอบคุณที่ตั้งใจ'}</h2><p>เสิร์ฟ ${shift.served} ออเดอร์ · ลูกค้าออก ${shift.lost} คน<br>รายรับ ฿${shift.revenue} − ต้นทุน ฿${shift.costs}</p><div class="result">กำไรสุทธิ <strong>฿${shift.profit}</strong></div><p>เป้าหมาย 5 ออเดอร์: ${shift.served>=5?'สำเร็จ ✓':'ลองใหม่อีกครั้ง'}</p><button id="restart" class="primary">เปิดร้านอีกครั้ง →</button></div>`;
  document.getElementById('start')?.addEventListener('click',()=>{shift.start();render();});
  document.getElementById('resume')?.addEventListener('click',pause);
  document.getElementById('restart')?.addEventListener('click',()=>{shift=new Shift();$('food-fx').replaceChildren();shift.start();render();});
}
class Kitchen extends Phaser.Scene {
  g!:Phaser.GameObjects.Graphics; lastRender = 0;
  create(){this.g=this.add.graphics();this.game.canvas.setAttribute('aria-hidden','true');this.draw();}
  update(time:number,delta:number){shift.tick(Math.min(delta/1000,.25));if(time-this.lastRender>80){render();this.lastRender=time;}}
  draw(){const g=this.g;const rect=(x:number,y:number,w:number,h:number,c:number,r=0)=>{g.fillStyle(c);r?g.fillRoundedRect(x,y,w,h,r):g.fillRect(x,y,w,h);};
    rect(0,0,1000,720,0xf0e6d1);
    for(let y=0;y<720;y+=40)for(let x=0;x<1000;x+=40)if((x/40+y/40)%2===0)rect(x,y,39,39,0xe5dbc5);
    rect(0,0,1000,56,0x244e42);rect(0,56,1000,9,0xd5a267);
    const sign=this.add.text(500,26,'C R I S P Y   C O R N E R',{fontFamily:'Georgia',fontSize:'23px',color:'#f9d59a'});sign.setOrigin(.5);
    rect(25,252,950,40,0x8a6144,8);rect(25,245,950,29,0xd9a36e,8);rect(35,282,930,27,0x365f4b);
    for(let x=50;x<950;x+=110)rect(x,286,90,16,0x47745c,3);
    rect(30,461,940,225,0xa7a38d,10);rect(30,456,940,219,0xd5d1bb,10);
    for(const x of [25,950]){rect(x,96,25,90,0xb4845b,8);g.fillStyle(0x6e9165);g.fillCircle(x+13,104,21);g.fillCircle(x+5,88,17);g.fillCircle(x+23,88,17);}
  }
}
new Phaser.Game({type:Phaser.CANVAS,parent:'canvas-layer',width:1000,height:720,backgroundColor:'#f0e6d1',fps:{target:30,smoothStep:false},scene:Kitchen,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true}});
render();
