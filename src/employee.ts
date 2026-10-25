import type { Item } from './game';
export type Work = { kind: 'cashier' | 'cook' | 'storage' | 'tray'; item?: Item };
export type Point = { x: number; y: number };
const columns: Record<Item, number> = { chicken: 245, fries: 485, drink: 725 };
export function workPoint(work: Work): Point {
  if (work.kind === 'cashier') return { x: 180, y: 610 };
  if (work.kind === 'tray') return { x: 365, y: 610 };
  if (work.kind === 'storage') return { x: { chicken: 550, fries: 680, drink: 810 }[work.item ?? 'chicken'], y: 610 };
  return { x: columns[work.item ?? 'chicken'], y: 705 };
}
// Presentation queue only: cooking and finance remain authoritative in Shift.
export class Employee {
  x = 180; y = 610; moving = false; facing = 1; current: Work | null = null;
  jobs: Work[] = []; path: Point[] = []; hold = 0;
  enqueue(work: Work) { this.jobs.push(work); }
  private route(target: Point) {
    this.path = [];
    // All work points share the clear aisle behind the new service counter.
    this.path.push(target);
  }
  tick(dt: number, paused = false) {
    if (paused || dt <= 0) return;
    if (this.hold > 0) { this.hold = Math.max(0,this.hold-dt); return; }
    if (!this.path.length) {
      this.current = this.jobs.shift() ?? null;
      const target = workPoint(this.current ?? {kind:'cashier'});
      if (Math.hypot(target.x-this.x,target.y-this.y) < 1 && !this.current) { this.moving=false; return; }
      this.route(target);
    }
    let distance = dt * 520;
    while (this.path.length && distance > 0) {
      const target=this.path[0], dx=target.x-this.x, dy=target.y-this.y, length=Math.hypot(dx,dy);
      if (Math.abs(dx)>.1) this.facing=dx>0?1:-1;
      if (length<=distance) { this.x=target.x;this.y=target.y;this.path.shift();distance-=length; }
      else { this.x+=dx/length*distance;this.y+=dy/length*distance;distance=0; }
    }
    this.moving=this.path.length>0;
    if (!this.moving) this.hold=.18;
  }
}
