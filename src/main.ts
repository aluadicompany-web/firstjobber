import Phaser from 'phaser';
import {Shift,menu,type Item} from './game';
import './style.css';
let shift=new Shift();
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><a class="brand" href="./"><span class="logo">C<span>★</span></span><span>CRISPY SHIFT<small>ร้านเล็ก ๆ ความฝันกรอบ ๆ</small></span></a><span class="edition">FAST FOOD SIMULATOR <b>01</b></span><button id="pause" title="พักเกม (Space)">Ⅱ พักเกม</button></header>
<main><div class="title"><div><span class="eyebrow">YOUR FIRST DAY · กะแรกของคุณ</span><h1>ความอร่อย เริ่มที่มือคุณ<span>✳</span></h1><p>รับออเดอร์ เตรียมให้พร้อม แล้วเสิร์ฟรอยยิ้ม</p></div><div class="clock"><span>เวลาที่เหลือ</span><strong id="time">03:00</strong><small>เป้าหมาย: เสิร์ฟอย่างน้อย 5 ออเดอร์</small></div></div>
<div class="stats"><div><span>รายรับ</span><strong id="revenue">฿0</strong></div><div><span>ต้นทุนวัตถุดิบ</span><strong id="costs">฿0</strong></div><div><span>กำไรสุทธิ</span><strong id="profit">฿0</strong></div><div><span>เสิร์ฟแล้ว</span><strong id="served">0 <small>ออเดอร์</small></strong></div><div><span>ลูกค้าออกจากร้าน</span><strong id="lost">0</strong></div></div>
<div class="layout"><section class="restaurant"><div class="section-label"><span><i></i> LIVE KITCHEN</span><span>คลิกตัวลูกค้าเพื่อรับออเดอร์ได้เลย</span></div><div id="world"></div><div class="world-caption"><span>✦ ทำสดทุกออเดอร์ ตั้งใจทุกจาน</span><span>OPEN DAILY · 10:00 – 22:00</span></div></section><aside><div class="queue-heading"><h2>ออเดอร์หน้าร้าน</h2><span id="count">0 / 4</span></div><div id="orders"></div><button id="accept" class="primary">รับออเดอร์ที่เลือก <kbd>E</kbd></button><div class="note">ลูกค้าที่ได้รับอาหารเร็วจะให้ทิปเพิ่ม ฿10</div></aside></div>
<section class="prep"><div class="prep-heading"><h2>ครัวของคุณ <span>เตรียมอาหาร → เพิ่มลงถาด → เสิร์ฟ</span></h2><span>ใช้เมาส์ หรือปุ่มลัดด้านล่าง</span></div><div class="stations">${(Object.keys(menu) as Item[]).map((i,n)=>`<article class="station"><div class="food-icon">${menu[i].icon}</div><div class="food-info"><h3>${menu[i].name}</h3><span>฿${menu[i].price} · ต้นทุน ฿${menu[i].cost}</span><div class="progress"><i id="progress-${i}"></i></div><small id="status-${i}">พร้อม 0 ชิ้น</small></div><div class="station-buttons"><button data-cook="${i}">ทำอาหาร <kbd>${n+1}</kbd></button><button data-add="${i}" class="add">+ ลงถาด <kbd>${['Q','W','R'][n]}</kbd></button></div></article>`).join('')}</div></section>
<section class="tray"><div><span class="eyebrow">READY TO GO</span><h2>ถาดเสิร์ฟของคุณ</h2></div><div id="tray-items">ยังไม่มีอาหารในถาด</div><button id="clear">คืนอาหาร <kbd>⌫</kbd></button><button id="serve" class="primary">เสิร์ฟออเดอร์ <kbd>Enter</kbd></button></section><div id="message" role="status" aria-live="polite"></div><footer><span>CRISPY SHIFT <b>•</b> SMALL KITCHEN. BIG DREAMS.</span><span><kbd>Tab</kbd> เลือกลูกค้าถัดไป <kbd>Space</kbd> พักเกม</span></footer></main><div id="overlay" class="overlay"></div>`;
const $=(id:string)=>document.getElementById(id)!;
function action(fn:()=>void){if(!shift.started||shift.paused||shift.ended)return;fn();render()}
$('accept').onclick=()=>action(()=>shift.accept());$('serve').onclick=()=>action(()=>shift.serve());$('clear').onclick=()=>action(()=>shift.clear());
document.querySelectorAll<HTMLButtonElement>('[data-cook]').forEach(b=>b.onclick=()=>action(()=>shift.cook(b.dataset.cook as Item)));
document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(b=>b.onclick=()=>action(()=>shift.add(b.dataset.add as Item)));
function pause(){if(!shift.started||shift.ended)return;shift.paused=!shift.paused;render()}
$('pause').onclick=pause;
$('orders').onclick=e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-customer]');if(b)action(()=>shift.select(Number(b.dataset.customer)))};
window.addEventListener('keydown',e=>{if((!shift.started||shift.paused||shift.ended)&&e.key==='Enter')return;const key=e.key.toLowerCase();if([' ','tab','backspace','enter','1','2','3','q','w','r','e'].includes(key))e.preventDefault();if(e.repeat)return;if(key===' '){pause();return}action(()=>{if(key==='tab'){const idx=shift.customers.findIndex(c=>c.id===shift.selected);shift.selected=shift.customers[(idx+1)%shift.customers.length]?.id??0}if(key==='e')shift.accept();if(key==='enter')shift.serve();if(key==='backspace')shift.clear();const cooks:Record<string,Item>={'1':'chicken','2':'fries','3':'drink'},adds:Record<string,Item>={q:'chicken',w:'fries',r:'drink'};if(cooks[key])shift.cook(cooks[key]);if(adds[key])shift.add(adds[key])})});
function render(){
 $('time').textContent=`${Math.floor(Math.ceil(shift.remaining)/60).toString().padStart(2,'0')}:${(Math.ceil(shift.remaining)%60).toString().padStart(2,'0')}`;
 for(const [id,value] of Object.entries({revenue:`฿${shift.revenue}`,costs:`฿${shift.costs}`,profit:`฿${shift.profit}`,served:`${shift.served} ออเดอร์`,lost:String(shift.lost)}))$(id).textContent=value;
 $('count').textContent=`${shift.customers.length} / 4`;
 $('orders').innerHTML=shift.customers.length?shift.customers.map(c=>`<button class="order ${c.id===shift.selected?'selected':''}" data-customer="${c.id}"><div><strong>#${String(c.id).padStart(2,'0')} · ${c.name}</strong><span>${c.accepted?'✓ กำลังเตรียม':'รอรับออเดอร์'}</span></div><p>${c.items.map(i=>`${menu[i].icon} ${menu[i].name}`).join(' + ')}</p><div class="patience"><i style="width:${Math.max(0,c.patience/c.maxPatience*100)}%;background:${c.patience<15?'#d8543d':'#779d78'}"></i></div><small>รอได้อีก ${Math.ceil(c.patience)} วินาที</small></button>`).join(''):'<div class="empty">☀<br>ร้านพร้อมแล้ว<br><small>รอลูกค้าเข้ามาสั่งอาหาร</small></div>';
 for(const i of Object.keys(menu) as Item[]){$(`status-${i}`).textContent=`พร้อม ${shift.stock[i]} ชิ้น${shift.cooking[i]>0?` · กำลังทำ ${Math.ceil(shift.cooking[i])} วิ`:''}`;$(`progress-${i}`).style.width=shift.cooking[i]>0?`${(1-shift.cooking[i]/menu[i].seconds)*100}%`:'0%'}
 $('tray-items').innerHTML=shift.tray.length?shift.tray.map(i=>`<span class="tray-food" title="${menu[i].name}">${menu[i].icon}</span>`).join(''):'<span class="tray-empty">เพิ่มอาหารจากครัวลงถาดที่นี่</span>';
 $('message').textContent=shift.message;$('pause').textContent=shift.paused?'▶ เล่นต่อ':'Ⅱ พักเกม';
 const mode=!shift.started?'start':shift.ended?'end':shift.paused?'pause':'';
 const overlay=$('overlay');if(overlay.dataset.mode===mode)return;overlay.dataset.mode=mode;overlay.style.display=mode?'grid':'none';
 if(mode==='start')overlay.innerHTML=`<div class="modal"><span class="modal-icon">🍗</span><span class="eyebrow">WELCOME TO YOUR LITTLE KITCHEN</span><h2>พร้อมเปิดร้านหรือยัง?</h2><p>รับบทพนักงานร้านไก่ทอดในกะ 3 นาที<br>รับออเดอร์ → ทำอาหาร → จัดถาดให้ตรง → เสิร์ฟ</p><div class="instructions"><span><kbd>E</kbd> รับออเดอร์</span><span><kbd>1 2 3</kbd> ทำอาหาร</span><span><kbd>Q W R</kbd> เพิ่มลงถาด</span><span><kbd>Enter</kbd> เสิร์ฟ</span></div><p class="fine">ทุกครั้งที่ทำอาหารมีต้นทุน • รับออเดอร์ก่อนเสิร์ฟ<br>คืนอาหารจากถาดได้โดยไม่เสียของ</p><button id="start" class="primary">เปิดร้าน เริ่มกะแรก →</button></div>`;
 if(mode==='pause')overlay.innerHTML='<div class="modal"><span class="modal-icon">☕</span><h2>พักสักครู่</h2><p>เวลาในร้านหยุดแล้ว พร้อมเมื่อไหร่ค่อยกลับมา</p><button id="resume" class="primary">กลับเข้าครัว · Space</button></div>';
 if(mode==='end')overlay.innerHTML=`<div class="modal"><span class="modal-icon">${shift.served>=5?'🏆':'🌅'}</span><span class="eyebrow">SHIFT COMPLETE</span><h2>${shift.served>=5?'กะแรก ยอดเยี่ยม!':'จบกะแล้ว ขอบคุณที่ตั้งใจ'}</h2><p>เสิร์ฟ ${shift.served} ออเดอร์ · ลูกค้าออก ${shift.lost} คน<br>รายรับ ฿${shift.revenue} − ต้นทุน ฿${shift.costs}</p><div class="result">กำไรสุทธิ <strong>฿${shift.profit}</strong></div><p>เป้าหมาย 5 ออเดอร์: ${shift.served>=5?'สำเร็จ ✓':'ลองใหม่อีกครั้ง'}</p><button id="restart" class="primary">เปิดร้านอีกครั้ง →</button></div>`;
 document.getElementById('start')?.addEventListener('click',()=>{shift.start();render()});document.getElementById('resume')?.addEventListener('click',pause);document.getElementById('restart')?.addEventListener('click',()=>{shift=new Shift();shift.start();render()});
}
class Kitchen extends Phaser.Scene {
 g!:Phaser.GameObjects.Graphics; labels:Phaser.GameObjects.GameObject[]=[]; last=0;
 create(){this.g=this.add.graphics();this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{const c=shift.customers.find((_customer,idx)=>{const x=150+idx*150;return (Math.abs(p.x-x)<=27&&p.y>=110&&p.y<=216)||(Math.abs(p.x-x)<=58&&p.y>=68&&p.y<=112)});if(c)action(()=>{shift.select(c.id);shift.accept();this.draw(this.time.now)})});this.game.canvas.setAttribute('aria-label','ร้านไก่ทอด คลิกตัวลูกค้าหรือรายการอาหารเหนือหัวเพื่อรับออเดอร์');render()}
 update(_t:number,delta:number){shift.tick(Math.min(delta/1000,.25));if(_t-this.last>100){render();this.draw(_t);this.last=_t}}
 draw(t:number){const g=this.g;g.clear();this.labels.forEach(l=>l.destroy());this.labels=[];const rect=(x:number,y:number,w:number,h:number,c:number,r=0)=>{g.fillStyle(c);r?g.fillRoundedRect(x,y,w,h,r):g.fillRect(x,y,w,h)};const text=(x:number,y:number,s:string,size=14,color='#35564a')=>{const tx=this.add.text(x,y,s,{fontFamily:'Tahoma, sans-serif',fontSize:size,color});this.labels.push(tx)};
 rect(0,0,800,410,0xf3e9d4);for(let y=0;y<410;y+=42)for(let x=0;x<800;x+=42){if((x/42+y/42)%2===0)rect(x,y,41,41,0xe9dfc9)}
 rect(0,0,800,63,0x244e42);rect(0,57,800,9,0xdeb16d);text(255,16,'C R I S P Y   C O R N E R',23,'#ffdb9d');
 for(const x of [22,690]){rect(x,90,76,60,0xc88b59,12);rect(x+7,95,62,43,0xf9dfac,8);rect(x+22,155,30,20,0x7c9b76,5);rect(x+22,68,30,17,0x7c9b76,5)}
 shift.customers.forEach((c,idx)=>{
 const x=150+idx*150,y=164+Math.sin(t/320+idx)*2;
 if(c.id===shift.selected){g.lineStyle(3,0xe79a43);g.strokeEllipse(x,y+33,66,24)}
 rect(x-19,y-8,38,44,[0xc96148,0x729c98,0xc8a358,0x7a829f][idx],10);g.fillStyle(0x724833);g.fillCircle(x,y-30,21);g.fillStyle(0xe9b78a);g.fillCircle(x,y-25,17);g.fillStyle(0x40372b);g.fillCircle(x-6,y-26,2);g.fillCircle(x+6,y-26,2);rect(x-16,y+32,12,15,0x3d4944,3);rect(x+4,y+32,12,15,0x3d4944,3);
 // Keep the requested food visible after acceptance; the badge confirms receipt, not service.
 rect(x-58,68,116,44,c.accepted?0xe6f0dd:0xfff9e9,9);
 g.fillStyle(c.accepted?0xe6f0dd:0xfff9e9);g.fillTriangle(x-5,111,x+5,111,x,117);
 text(x-51,72,`#${c.id}`,9);
 c.items.forEach((item,index)=>text(x-c.items.length*14+index*28,78,menu[item].icon,24));
 if(c.accepted){g.fillStyle(0x2e7050);g.fillCircle(x+51,73,10);g.lineStyle(2.5,0xffffff);g.beginPath();g.moveTo(x+46,73);g.lineTo(x+50,77);g.lineTo(x+57,69);g.strokePath()}
 rect(x-25,y+57,50,5,0xd8cbb2,2);rect(x-25,y+57,50*Math.max(0,c.patience/55),5,c.patience<15?0xd8543d:0x729c78,2)
 });
 rect(67,244,666,18,0x815c43,7);rect(67,230,666,26,0xdca972,7);rect(78,261,644,52,0x315b4b);for(let x=96;x<720;x+=100)rect(x,269,76,32,0x406b57,3);text(332,273,'ORDER PICKUP',15,'#f5deb1');
 rect(65,333,670,62,0xb7b7a0,8);rect(70,328,660,52,0xe0dfcc,8);
 for(let i=0;i<3;i++){const x=110+i*220;rect(x,337,139,32,0x59665d,5);rect(x+5,341,129,22,[0xcda457,0xd5a458,0x7eaaa0][i],3);text(x+35,343,['FRYER','FRIES','DRINKS'][i],12,'#fff8e7');if(shift.cooking[(['chicken','fries','drink'] as Item[])[i]]>0){for(let j=0;j<3;j++){g.fillStyle(0xffffff,.5);g.fillCircle(x+40+j*24,325-(t/35+j*8)%27,5)}}}
 rect(363,299,36,36,0xf7eee0,9);g.fillStyle(0xe9b78a);g.fillCircle(381,296,13);rect(364,278,34,10,0xffffff,5);
 }
}
new Phaser.Game({type:Phaser.CANVAS,parent:'world',width:800,height:410,backgroundColor:'#f3e9d4',fps:{target:30,smoothStep:false},scene:Kitchen,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true}});
render();
