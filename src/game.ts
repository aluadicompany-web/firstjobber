import type { Work } from './employee';
export type Item = 'chicken' | 'fries' | 'drink';
export type Upgrade = Exclude<Item,'drink'>;
export const items: Item[] = ['chicken', 'fries', 'drink'];
export const capacity = 5;
export const birdChance = 0.05;
export const menu: Record<Item, { name: string; price: number; cost: number; seconds: number; icon: string }> = {
  chicken: { name: 'ไก่ทอด', price: 59, cost: 18, seconds: 5, icon: '🍗' },
  fries: { name: 'เฟรนช์ฟรายส์', price: 29, cost: 8, seconds: 3, icon: '🍟' },
  drink: { name: 'น้ำอัดลม', price: 19, cost: 4, seconds: 1, icon: '🥤' },
};
export type Customer = { id: number; name: string; items: Item[]; patience: number; maxPatience: number; accepted: boolean };
export const orderTemplates: readonly (readonly Item[])[] = [['chicken','drink'],['chicken','fries'],['chicken'],['chicken','fries','drink'],['fries','drink']];
export type ReactionEvent = { customerId:number; name:string; index:number; mood:'happy'|'angry' };
export type FoodEvent = { type: 'ready' | 'add' | 'return'; item: Item; slot: number };
export class Shift {
  constructor(private readonly random:()=>number=Math.random, readonly stage:1|2=1, readonly upgrade:Upgrade|null=null) {this.spawnIn=this.arrivalInterval;}
  get patienceSeconds(){return this.stage===2?44:55;}
  cookSeconds(item:Item){return menu[item].seconds-(this.stage===2&&this.upgrade===item?1:0);}
  private orderBag:number[]=[];
  private lastOrder=-1;
  reactionEvents:ReactionEvent[]=[];
  remaining = 180; elapsed = 0; spawnIn = 6; nextId = 1;
  customers: Customer[] = []; selected = 0;
  stock: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  // queued includes the active piece. cooking is the remaining time for that piece only.
  queued: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  cooking: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  events: FoodEvent[] = []; tray: Item[] = [];
  workEvents: Work[] = [];
  moneyEvents: {amount:number; item?:Item}[] = [];
  get shopMinutes() { return Math.min(22*60,10*60+Math.floor((180-this.remaining)*4)); }
  get shopTime() { return `${Math.floor(this.shopMinutes/60).toString().padStart(2,'0')}:${(this.shopMinutes%60).toString().padStart(2,'0')}`; }
  revenue = 0; costs = 0; served = 0; lost = 0; combo = 0;
  paused = false; ended = false; started = false;
  message = 'เปิดร้าน แล้วคลิกตัวลูกค้าเพื่อรับออเดอร์';
  get current() { return this.customers.find(c => c.id === this.selected); }
  get profit() { return this.revenue - this.costs; }
  get trayMatches() {
    return !!this.current?.accepted && [...this.current.items].sort().join() === [...this.tray].sort().join();
  }
  owned(item: Item) { return this.stock[item] + this.queued[item] + this.tray.filter(i => i === item).length; }
  get arrivalInterval() { return this.stage===2?(this.customers.length>=2?6.5:5.5):(this.customers.length>=2?7:6); }
  private refillEmptyShop() {
    if(!this.started||this.paused||this.ended||this.remaining<=0||this.customers.length)return false;
    this.spawn();this.spawnIn=this.arrivalInterval;return this.customers.length>0;
  }
  start() { this.started = true; this.spawnIn=this.arrivalInterval; this.spawn(); this.say('ดูชื่อและอาหารเหนือหัว แล้วคลิกตัวลูกค้าเพื่อรับออเดอร์'); }
  spawn() {
    if (this.customers.length >= 4) return;
    // Bird has a 5% chance per arrival; only one Bird can wait at a time.
    if (this.random() >= 1-birdChance && !this.customers.some(c=>c.name==='เบิร์ด')) {
      const pool=items.flatMap(item=>Array<Item>(capacity).fill(item));
      const order:Item[]=[];
      for(let i=0;i<6;i++){
        const index=Math.min(pool.length-1,Math.max(0,Math.floor(this.random()*pool.length)));
        order.push(pool.splice(index,1)[0]);
      }
      this.addCustomer('เบิร์ด',order);
      return;
    }
    if (!this.orderBag.length) this.orderBag=orderTemplates.map((_,index)=>index);
    const key=(order:readonly Item[])=>[...order].sort().join(',');
    const waiting=new Set(this.customers.map(c=>key(c.items)));
    const eligible=this.orderBag.filter(index=>index!==this.lastOrder&&!waiting.has(key(orderTemplates[index])));
    // Keep this round intact if its remaining recipes are already being waited for.
    if (!eligible.length) return;
    const recipe=eligible[Math.min(eligible.length-1,Math.max(0,Math.floor(this.random()*eligible.length)))];
    this.orderBag.splice(this.orderBag.indexOf(recipe),1);this.lastOrder=recipe;
    const names=['มิน','เจ','พลอย','ต้น','ฟ้า','แป้ง','บอส','นัท','เมย์','ปอนด์'].filter(name=>!this.customers.some(c=>c.name===name));
    const name=names[Math.min(names.length-1,Math.max(0,Math.floor(this.random()*names.length)))];
    this.addCustomer(name,[...orderTemplates[recipe]]);
  }
  private addCustomer(name:string,order:Item[]) {
    const id=this.nextId++;
    this.customers.push({id,name,items:order,patience:this.patienceSeconds,maxPatience:this.patienceSeconds,accepted:false});
    if (!this.current) this.selected = id;
  }
  select(id: number) { if (this.customers.some(c => c.id === id)) this.selected = id; }
  accept() {
    const c = this.current;
    if (!c) return this.say('ยังไม่มีลูกค้าในคิว');
    c.accepted = true;
    this.workEvents.push({kind:'cashier'});
    this.say(`รับออเดอร์ #${c.id} คุณ${c.name} แล้ว คลิกสถานีเพื่อทำอาหาร`);
  }
  say(message: string) { this.message = message; }
  cook(item: Item) {
    if (this.owned(item) >= capacity) return this.say(`${menu[item].name}ครบ 5 ชิ้นแล้ว (รวมคิว ตู้ และถาด) เสิร์ฟก่อนทำเพิ่ม`);
    this.queued[item]++;
    if (this.queued[item] === 1) this.cooking[item] = this.cookSeconds(item);
    this.costs += menu[item].cost;
    this.workEvents.push({kind:'cook',item});
    this.moneyEvents.push({amount:-menu[item].cost,item});
    this.say(`เพิ่มคิว${menu[item].name} · กำลังทำและรอ ${this.queued[item]} ชิ้น`);
  }
  add(item: Item) {
    if (this.stock[item] <= 0) return this.say(`ยังไม่มี${menu[item].name}ในตู้`);
    if (this.tray.length >= 6) return this.say('ถาดเต็มแล้ว');
    this.stock[item]--;
    this.tray.push(item);
    this.workEvents.push({kind:'storage',item},{kind:'tray'});
    this.events.push({ type: 'add', item, slot: this.tray.length - 1 });
    this.say(`เพิ่ม${menu[item].name}ลงถาดแล้ว`);
  }
  clear() {
    for (const item of this.tray) {
      this.stock[item]++;
      this.events.push({ type: 'return', item, slot: this.stock[item] - 1 });
    }
    if (this.tray.length) this.workEvents.push({kind:'storage'});
    this.tray = [];
    this.say('คืนอาหารจากถาดเข้าตู้แล้ว');
  }
  serve() {
    const c = this.current;
    if (!c) return this.say('ยังไม่มีลูกค้าที่เลือกให้เสิร์ฟ');
    const react=(mood:'happy'|'angry')=>this.reactionEvents.push({customerId:c.id,name:c.name,index:this.customers.indexOf(c),mood});
    if (!c.accepted) {react('angry');return this.say('คลิกตัวลูกค้าเพื่อรับออเดอร์ก่อนเสิร์ฟ');}
    if (!this.trayMatches) {react('angry');return this.say(`อาหารยังไม่ตรงออเดอร์คุณ${c.name} ตรวจถาดก่อนเสิร์ฟ`);}
    react('happy');
    const tip = c.patience > 30 ? 10 : 0;
    const total = c.items.reduce((sum, i) => sum + menu[i].price, 0) + tip;
    this.moneyEvents.push({amount:total});
    this.workEvents.push({kind:'cashier'});
    this.revenue += total; this.served++; this.combo++; this.tray = [];
    this.customers = this.customers.filter(x => x.id !== c.id);
    this.selected = this.customers[0]?.id ?? 0;
    this.refillEmptyShop();
    this.say(`เสิร์ฟให้คุณ${c.name}สำเร็จ! +฿${total}${tip ? ' รวมทิป ฿10' : ''}`);
  }
  tick(dt: number) {
    if (!this.started || this.paused || this.ended || dt <= 0) return;
    dt = Math.min(dt, this.remaining);
    this.remaining = Math.max(0, this.remaining - dt); this.elapsed += dt;
    for (const item of items) {
      let budget = dt;
      while (this.queued[item] > 0 && budget >= this.cooking[item]) {
        budget -= this.cooking[item];
        this.queued[item]--; this.stock[item]++;
        this.events.push({ type: 'ready', item, slot: this.stock[item] - 1 });
        this.cooking[item] = this.queued[item] > 0 ? this.cookSeconds(item) : 0;
      }
      if (this.queued[item] > 0) this.cooking[item] -= budget;
    }
    for (const c of this.customers) c.patience -= dt;
    const lost = this.customers.filter(c => c.patience <= 0);
    if (lost.length) {
      this.lost += lost.length; this.combo = 0;
      this.customers = this.customers.filter(c => c.patience > 0);
      if (!this.current) this.selected = this.customers[0]?.id ?? 0;
      this.say('ลูกค้ารอนานเกินไปและออกจากร้านแล้ว');
    }
    this.spawnIn -= dt;
    if (this.remaining <= 0) { this.ended = true; this.say('หมดเวลากะแล้ว'); return; }
    if (this.refillEmptyShop()) return;
    if (this.spawnIn <= 0) { this.spawn(); this.spawnIn = this.arrivalInterval; }
  }
}
