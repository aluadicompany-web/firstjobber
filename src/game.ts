export type Item = 'chicken' | 'fries' | 'drink';
export const menu: Record<Item, {name:string; price:number; cost:number; seconds:number; icon:string}> = {
 chicken:{name:'ไก่ทอด',price:59,cost:18,seconds:5,icon:'🍗'}, fries:{name:'เฟรนช์ฟรายส์',price:29,cost:8,seconds:3,icon:'🍟'}, drink:{name:'น้ำอัดลม',price:19,cost:4,seconds:1,icon:'🥤'}
};
export type Customer={id:number; name:string; items:Item[]; patience:number; maxPatience:number; accepted:boolean};
export class Shift {
 remaining=180; elapsed=0; spawnIn=8; nextId=1; customers:Customer[]=[]; selected=0;
 stock:Record<Item,number>={chicken:0,fries:0,drink:0}; cooking:Record<Item,number>={chicken:0,fries:0,drink:0};
 tray:Item[]=[]; revenue=0; costs=0; served=0; lost=0; combo=0; paused=false; ended=false; started=false;
 message='ยินดีต้อนรับ! เริ่มกะแล้วรับออเดอร์ลูกค้าคนแรก';
 constructor(public random= Math.random){}
 get current(){return this.customers.find(c=>c.id===this.selected)}
 get profit(){return this.revenue-this.costs}
 start(){this.started=true;this.spawn();this.message='คลิกลูกค้า แล้วกด E เพื่อรับออเดอร์'}
 spawn(){if(this.customers.length>=4)return;const n=this.nextId++;const sets:Item[][]=[['chicken','drink'],['chicken','fries'],['chicken'],['chicken','fries','drink'],['fries','drink']]; const items=sets[(n-1)%sets.length].slice();this.customers.push({id:n,name:['มิน','เจ','พลอย','ต้น','ฟ้า'][(n-1)%5],items,patience:55,maxPatience:55,accepted:false});if(!this.current)this.selected=n;}
 select(id:number){if(this.customers.some(c=>c.id===id))this.selected=id}
 accept(){const c=this.current;if(!c)return this.say('ยังไม่มีลูกค้าในคิว');c.accepted=true;this.say(`รับออเดอร์ #${c.id} แล้ว เตรียมอาหารได้เลย`)}
 say(message:string){this.message=message}
 cook(item:Item){if(this.cooking[item]>0)return this.say('สถานีนี้กำลังทำอาหารอยู่');if(this.stock[item]>=5)return this.say('อาหารพร้อมเสิร์ฟเต็มแล้ว (สูงสุด 5 ชิ้น)');this.cooking[item]=menu[item].seconds;this.costs+=menu[item].cost;this.say(`กำลังเตรียม${menu[item].name}`)}
 add(item:Item){if(this.stock[item]<=0)return this.say(`ยังไม่มี${menu[item].name}พร้อมเสิร์ฟ`);if(this.tray.length>=6)return this.say('ถาดเต็มแล้ว');this.stock[item]--;this.tray.push(item);this.say(`เพิ่ม${menu[item].name}ลงถาดแล้ว`)}
 clear(){for(const item of this.tray)this.stock[item]++;this.tray=[];this.say('คืนอาหารจากถาดแล้ว')}
 serve(){const c=this.current;if(!c||!c.accepted)return this.say('รับออเดอร์ลูกค้าด้วย E ก่อน');if([...c.items].sort().join()!==[...this.tray].sort().join())return this.say('อาหารไม่ตรงออเดอร์ ตรวจถาดแล้วลองใหม่');const tip=c.patience>30?10:0;const total=c.items.reduce((sum,i)=>sum+menu[i].price,0)+tip;this.revenue+=total;this.served++;this.combo++;this.tray=[];this.customers=this.customers.filter(x=>x.id!==c.id);this.selected=this.customers[0]?.id??0;this.say(`เสิร์ฟสำเร็จ! +฿${total}${tip?' รวมทิป ฿10':''}`)}
 tick(dt:number){if(!this.started||this.paused||this.ended)return;dt=Math.min(dt,this.remaining);this.remaining=Math.max(0,this.remaining-dt);this.elapsed+=dt;for(const i of Object.keys(menu) as Item[]){if(this.cooking[i]>0){this.cooking[i]=Math.max(0,this.cooking[i]-dt);if(this.cooking[i]===0)this.stock[i]++;}}for(const c of this.customers)c.patience-=dt;const lost=this.customers.filter(c=>c.patience<=0);if(lost.length){this.lost+=lost.length;this.combo=0;this.customers=this.customers.filter(c=>c.patience>0);if(!this.current)this.selected=this.customers[0]?.id??0;this.say('ลูกค้ารอนานเกินไปและออกจากร้านแล้ว');}this.spawnIn-=dt;if(this.spawnIn<=0){this.spawn();this.spawnIn=Math.max(7,13-this.elapsed/30)}if(this.remaining<=0){this.ended=true;this.say('หมดเวลากะแล้ว')}}
}
