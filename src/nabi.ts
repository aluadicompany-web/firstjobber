// A non-interactive visitor: eight seconds per visit, using game time only.
const route = [
  {time:0,x:880,y:630}, {time:1.5,x:680,y:650},
  {time:3,x:260,y:640}, {time:4.5,x:720,y:650},
  {time:6.5,x:360,y:640}, {time:8,x:880,y:630},
];
export class Nabi {
  active=false; elapsed=0; pending=0; visits=0;
  x=route[0].x; y=route[0].y; facing=1;
  arrive(){this.pending++;this.startNext();}
  private startNext(){
    if(this.active||!this.pending)return;
    this.pending--;this.active=true;this.elapsed=0;this.visits++;this.position();
  }
  private position(){
    const end=route.findIndex(point=>point.time>this.elapsed);
    const to=route[end<0?route.length-1:end],from=route[Math.max(0,(end<0?route.length-1:end)-1)];
    const fraction=(this.elapsed-from.time)/(to.time-from.time);
    this.x=from.x+(to.x-from.x)*fraction;this.y=from.y+(to.y-from.y)*fraction;
    this.facing=to.x>=from.x?1:-1;
  }
  tick(dt:number){
    if(dt<=0)return;
    while(this.active&&dt>0){
      const step=Math.min(dt,8-this.elapsed);this.elapsed+=step;dt-=step;this.position();
      if(this.elapsed>=8){this.active=false;this.startNext();}
    }
  }
  close(){this.active=false;this.pending=0;}
}
