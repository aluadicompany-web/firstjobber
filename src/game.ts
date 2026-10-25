export type Item = 'chicken' | 'fries' | 'drink';
export const items: Item[] = ['chicken', 'fries', 'drink'];
export const capacity = 5;
export const menu: Record<Item, { name: string; price: number; cost: number; seconds: number; icon: string }> = {
  chicken: { name: 'ไก่ทอด', price: 59, cost: 18, seconds: 5, icon: '🍗' },
  fries: { name: 'เฟรนช์ฟรายส์', price: 29, cost: 8, seconds: 3, icon: '🍟' },
  drink: { name: 'น้ำอัดลม', price: 19, cost: 4, seconds: 1, icon: '🥤' },
};
export type Customer = { id: number; name: string; items: Item[]; patience: number; maxPatience: number; accepted: boolean };
export type FoodEvent = { type: 'ready' | 'add' | 'return'; item: Item; slot: number };
export class Shift {
  remaining = 180; elapsed = 0; spawnIn = 8; nextId = 1;
  customers: Customer[] = []; selected = 0;
  stock: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  // queued includes the active piece. cooking is the remaining time for that piece only.
  queued: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  cooking: Record<Item, number> = { chicken: 0, fries: 0, drink: 0 };
  events: FoodEvent[] = []; tray: Item[] = [];
  revenue = 0; costs = 0; served = 0; lost = 0; combo = 0;
  paused = false; ended = false; started = false;
  message = 'เปิดร้าน แล้วคลิกตัวลูกค้าเพื่อรับออเดอร์';
  get current() { return this.customers.find(c => c.id === this.selected); }
  get profit() { return this.revenue - this.costs; }
  get trayMatches() {
    return !!this.current?.accepted && [...this.current.items].sort().join() === [...this.tray].sort().join();
  }
  owned(item: Item) { return this.stock[item] + this.queued[item] + this.tray.filter(i => i === item).length; }
  start() { this.started = true; this.spawn(); this.say('ดูชื่อและอาหารเหนือหัว แล้วคลิกตัวลูกค้าเพื่อรับออเดอร์'); }
  spawn() {
    if (this.customers.length >= 4) return;
    const id = this.nextId++;
    const sets: Item[][] = [['chicken', 'drink'], ['chicken', 'fries'], ['chicken'], ['chicken', 'fries', 'drink'], ['fries', 'drink']];
    this.customers.push({ id, name: ['มิน', 'เจ', 'พลอย', 'ต้น', 'ฟ้า'][(id - 1) % 5], items: sets[(id - 1) % sets.length].slice(), patience: 55, maxPatience: 55, accepted: false });
    if (!this.current) this.selected = id;
  }
  select(id: number) { if (this.customers.some(c => c.id === id)) this.selected = id; }
  accept() {
    const c = this.current;
    if (!c) return this.say('ยังไม่มีลูกค้าในคิว');
    c.accepted = true;
    this.say(`รับออเดอร์ #${c.id} คุณ${c.name} แล้ว คลิกสถานีเพื่อทำอาหาร`);
  }
  say(message: string) { this.message = message; }
  cook(item: Item) {
    if (this.owned(item) >= capacity) return this.say(`${menu[item].name}ครบ 5 ชิ้นแล้ว (รวมคิว ตู้ และถาด) เสิร์ฟก่อนทำเพิ่ม`);
    this.queued[item]++;
    if (this.queued[item] === 1) this.cooking[item] = menu[item].seconds;
    this.costs += menu[item].cost;
    this.say(`เพิ่มคิว${menu[item].name} · กำลังทำและรอ ${this.queued[item]} ชิ้น`);
  }
  add(item: Item) {
    if (this.stock[item] <= 0) return this.say(`ยังไม่มี${menu[item].name}ในตู้`);
    if (this.tray.length >= 6) return this.say('ถาดเต็มแล้ว');
    this.stock[item]--;
    this.tray.push(item);
    this.events.push({ type: 'add', item, slot: this.tray.length - 1 });
    this.say(`เพิ่ม${menu[item].name}ลงถาดแล้ว`);
  }
  clear() {
    for (const item of this.tray) {
      this.stock[item]++;
      this.events.push({ type: 'return', item, slot: this.stock[item] - 1 });
    }
    this.tray = [];
    this.say('คืนอาหารจากถาดเข้าตู้แล้ว');
  }
  serve() {
    const c = this.current;
    if (!c?.accepted) return this.say('คลิกตัวลูกค้าเพื่อรับออเดอร์ก่อนเสิร์ฟ');
    if (!this.trayMatches) return this.say(`อาหารยังไม่ตรงออเดอร์คุณ${c.name} ตรวจถาดก่อนเสิร์ฟ`);
    const tip = c.patience > 30 ? 10 : 0;
    const total = c.items.reduce((sum, i) => sum + menu[i].price, 0) + tip;
    this.revenue += total; this.served++; this.combo++; this.tray = [];
    this.customers = this.customers.filter(x => x.id !== c.id);
    this.selected = this.customers[0]?.id ?? 0;
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
        this.cooking[item] = this.queued[item] > 0 ? menu[item].seconds : 0;
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
    if (this.spawnIn <= 0) { this.spawn(); this.spawnIn = Math.max(7, 13 - this.elapsed / 30); }
    if (this.remaining <= 0) { this.ended = true; this.say('หมดเวลากะแล้ว'); }
  }
}
