/* Browser port of Guo Xianghao's Beijing Fushengji 1.2.2, GPL-2.0.
 * Rules follow SelectionDlg.cpp. No Windows UI dependencies. */
import D from './original-data.js';
export const subway=['建国门','北京站','西直门','崇文门','东直门','复兴门','积水潭','长椿街','公主坟','苹果园'];
export const surface=['永安里','方 庄','海淀大街','永定门','三元西桥','府右街','亚运村','玉泉营','翠微路','八角西路'];
const recovery=['发廊里','早点摊上','报摊上','烤羊肉摊上','公共汽车里','人力车上','女厕所里','男厕所里','电话亭里','三陪女怀里','出租车里','小巴里','美容院里','小商亭里','小商场门口','民工脚下','无照游商摊里','草地上','电线杆顶端','小饭馆里','马路边','人行道上','街心公园里','广告牌下','公共汽车站里','长途汽车站里','卖盗版游戏的旁边','网络公司尸体旁边','行骗的知本家旁边'];
const recoveryLoc=[...subway,'永安里','方 庄','海淀大街','永定门','三元东桥','文津街','北辰西路','菜户营','翠微路','八角地铁'];
export const fameText=f=>f>=100?'德高望重':f>=90?'杰出青年':f>=80?'一般般':f>=60?'不佳':f>=40?'争议人物':f>=20?'差':f>=10?'很差':'江湖唾弃';
export const defaultScores=[['赖皮张',12500720,98,'争议人物'],['萧峰',830050,100,'杰出青年'],['二黑',500447,78,'德高望重'],['Andy Rocky',239403,97,'很差'],['li xing',34900,35,'江湖唾弃'],['li xing',13400,100,'江湖唾弃'],['li',2300,77,'不佳'],['li',45,12,'杰出青年'],['li',34,100,'一般般'],['li',3,100,'杰出青年']];
export class Game {
 constructor(random=Math.random){this.random=random;this.reset();}
 rand(n){return Math.floor(this.random()*n);}
 reset(){this.cash=2000;this.debt=5000;this.bank=0;this.capacity=100;this.health=100;this.fame=100;this.left=40;this.loc=-1;this.surface=false;this.hacker=false;this.visits=0;this.inventory=Array.from({length:8},()=>({qty:0,cost:0}));this.ended=false;this.dead=false;this.warned={};this.prices=this.makePrices(3);this.interest();}
 get total(){return this.inventory.reduce((n,x)=>n+x.qty,0);}
 get score(){return this.cash+this.bank-this.debt;}
 active(){if(this.ended)throw Error('本局已结束，请开始新游戏。');}
 integer(n,max,min=0){if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`请输入 ${min} 到 ${max} 之间的整数。`);}
 good(id){this.integer(id,7);}
 makePrices(leaveout){const base=[100,15000,5,1000,5000,250,750,65],range=[350,15000,50,2500,9000,600,750,180];const prices=base.map((x,i)=>x+this.rand(range[i]));for(let i=0;i<leaveout;i++)prices[this.rand(8)]=0;return prices;}
 interest(){this.debt+=Math.trunc(this.debt*.10);this.bank+=Math.trunc(this.bank*.01);}
 maxBuy(id){this.good(id);return this.prices[id]?Math.min(this.capacity-this.total,Math.trunc(this.cash/this.prices[id])):0;}
 buy(id,n){this.active();this.integer(n,this.maxBuy(id),1);const item=this.inventory[id],p=this.prices[id];item.cost=Math.trunc((item.cost*item.qty+p*n)/(item.qty+n));item.qty+=n;this.cash-=p*n;return [{text:`买进 ${D.goods[id]} × ${n}`,sound:'buy.wav',quiet:true}];}
 sell(id,n){this.active();this.good(id);const item=this.inventory[id];if(!this.prices[id])throw Error(`哦？仿佛没有人在这里做${D.goods[id]}生意。`);this.integer(n,item.qty,1);item.qty-=n;this.cash+=n*this.prices[id];const events=[{text:`卖出 ${D.goods[id]} × ${n}`,sound:'money.wav',quiet:true}];if(id===4||id===3){this.fame=Math.max(0,this.fame-(id===4?7:10));if(!this.warned[id]){events.push({text:`买卖${D.goods[id]}，${id===4?'污染社会':'危害社会'}，俺的名声下降了。`});this.warned[id]=true;}}if(!item.qty)item.cost=0;return events;}
 deposit(n){this.active();this.integer(n,this.cash);this.cash-=n;this.bank+=n;}
 withdraw(n){this.active();this.integer(n,this.bank);this.bank-=n;this.cash+=n;}
 repay(n){this.active();this.integer(n,Math.min(this.cash,this.debt));this.cash-=n;this.debt-=n;}
 cure(n){this.active();this.integer(n,100-this.health,1);if(n*3500>this.cash)throw Error('医生说，“钱不够哎! 拒绝治疗。”');this.cash-=n*3500;this.health+=n;}
 rent(){this.active();if(this.capacity===140)throw Error('中介说，您的房子比局长的还大!还租房?');if(this.cash<30000)throw Error('中介说，您没有三万现金就想租房? 一边凉快去!');this.cash=this.cash<=30000?this.cash-25000:Math.trunc(this.cash/2)-2000;this.capacity+=10;}
 internet(){this.active();if(this.visits>2)throw Error('村长放出话来：你别总是在网吧里鬼混，快去做正经买卖!');if(this.cash<15)throw Error('进网吧至少身上要带15元，呵呵，取钱再来。');this.visits++;const n=1+this.rand(10);this.cash+=n;return n;}
 travel(loc){this.active();this.integer(loc,9);if(loc===this.loc)return [];this.loc=loc;const events=[{text:`来到${(this.surface?surface:subway)[loc]}`,sound:'shutdoor.wav',quiet:true}];this.prices=this.makePrices(this.left<=2?0:3);this.interest();
  for(const [i,[freq,text,id,plus,minus,add]] of D.commercial.entries()){if(this.rand(950)%freq||!this.prices[id])continue;events.push({text,news:true});if(i===17)this.debt+=2500;if(plus)this.prices[id]*=plus;if(minus)this.prices[id]=Math.trunc(this.prices[id]/minus);if(add){const count=Math.min(add,this.capacity-this.total);if(!count){events.push({text:`可惜!俺租的房子太小，只能放${this.capacity}个物品。`});break;}else this.inventory[id].qty+=count;}}
  for(const [freq,text,hurt,sound] of D.health){if(this.rand(1000)%freq===0){this.health-=hurt;events.push({text:`${text}俺的健康减少了${hurt}点。`,sound});break;}}
  if(this.health<85&&this.left>3){const days=1+this.rand(2),where=recovery[this.rand(29)],cost=days*(1000+this.rand(8500));events.push({text:`由于不注意身体,我被人发现昏迷在${recoveryLoc[(this.surface?10:0)+loc]}附近的${where}。好心的市民把我抬到医院，医生让我治疗${days}天。村长让人为我垫付了住院费用${cost}元。`});this.debt+=cost;this.health=Math.min(100,this.health+10);this.left-=days;}
  else if(this.health<0){this.dead=true;this.ended=true;events.push({text:'俺倒在街头,身边日记本上写着：“北京，我将再来!”',sound:'death.wav'});return events;}
  else if(this.health<20&&this.health>0)events.push({text:'俺的健康..健康危机..快去医..'});
  for(const [i,[freq,text,ratio]] of D.theft.entries()){if(this.rand(1000)%freq===0){const key=i===4||i===5?'bank':'cash';if(key==='cash'||this.bank>0){this[key]=Math.trunc(this[key]/100)*(100-ratio);events.push({text:`${text}俺的${key==='cash'?'银子':'存款'}减少了${ratio}%。`});}break;}}
  if(this.rand(1000)%25===0&&this.hacker&&this.bank>=1000){let n,up=true;if(this.bank>100000){n=Math.trunc(this.bank/(2+this.rand(20)));up=this.rand(20)%3===0;}else n=Math.trunc(this.bank/(1+this.rand(15)));this.bank+=up?n:-n;events.push({text:`黑客入侵银行网络，疯狂修改数据库，我的存款${up?'增加':'减少'}了${n}`});}
  if(this.debt>100000){this.health-=30;events.push({text:'俺欠钱太多，村长叫一群老乡揍了俺一顿!',sound:'kill.wav'});}
  this.left--;if(this.left===1)events.push({text:'俺明天回家乡，快把全部货物卖掉。'});
  if(this.left<=0){events.push({text:'俺已经在北京40天了，该回去结婚去了。'});const remaining=this.inventory.map((x,i)=>x.qty?D.goods[i]:null).filter(Boolean);for(const [i,item] of this.inventory.entries()){this.cash+=item.qty*this.prices[i];item.qty=0;item.cost=0;}if(remaining.length)events.push({text:'系统替我卖了剩余货物：'+remaining.join('、')});this.left=0;this.ended=true;}
  return events;
 }
}
