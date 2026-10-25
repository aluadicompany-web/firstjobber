import {Shift, type Upgrade} from './game';
export type DaySummary={revenue:number;costs:number;profit:number;served:number;lost:number};
export class Campaign {
  shift:Shift;
  phase:'day'|'upgrade'='day';
  selectedUpgrade:Upgrade|null=null;
  dayOne:DaySummary|null=null;
  constructor(private readonly random:()=>number=Math.random){this.shift=new Shift(random);}
  get totalProfit(){return this.shift.stage===2?(this.dayOne?.profit??0)+this.shift.profit:this.shift.profit;}
  openUpgrades(){
    if(this.phase!=='day'||!this.shift.ended||this.shift.stage!==1)return false;
    const {revenue,costs,profit,served,lost}=this.shift;
    this.dayOne={revenue,costs,profit,served,lost};this.phase='upgrade';return true;
  }
  chooseUpgrade(item:Upgrade){
    if(this.phase!=='upgrade'||this.selectedUpgrade!==null||(item!=='chicken'&&item!=='fries'))return false;
    this.selectedUpgrade=item;return true;
  }
  startDayTwo(){
    if(this.phase!=='upgrade'||!this.selectedUpgrade)return false;
    this.shift=new Shift(this.random,2,this.selectedUpgrade);this.phase='day';this.shift.start();return true;
  }
}
