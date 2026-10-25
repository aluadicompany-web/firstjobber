import type { Item } from './game';
export type Work = { kind: 'cashier' | 'cook' | 'storage' | 'tray'; item?: Item };
export type Point = { x: number; y: number };
const columns: Record<Item, number> = { chicken: 190, fries: 480, drink: 770 };
export function workPoint(work: Work): Point {
  if (work.kind === 'cashier') return { x: 300, y: 340 };
  if (work.kind === 'tray') return { x: 735, y: 350 };
  if (work.kind === 'storage') return { x: { chicken: 440, fries: 625, drink: 800 }[work.item ?? 'chicken'], y: 625 };
  return { x: columns[work.item ?? 'chicken'], y: 675 };
}
// Presentation queue only: cooking and finance remain authoritative in Shift.
export class Employee {
  x = 300; y = 340; moving = false; facing = 1; current: Work | null = null;
  jobs: Work[] = []; path: Point[] = []; hold = 0;
  enqueue(work: Work) { this.jobs.push(work); }
  private route(target: Point) {
    this.path = [];
    // The central food cabinet blocks the middle; use the aisle on its left.
    if ((this.y < 440 && target.y > 600) || (this.y > 600 && target.y < 440)) {
      const fromY = this.y < 440 ? 350 : 640, toY = target.y < 440 ? 350 : 640;
      this.path.push({x:285,y:fromY},{x:285,y:toY});
    }
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
