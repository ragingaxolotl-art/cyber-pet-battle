import {refreshStatus,statusTickDue,statusMultiplier,movementMultiplier} from './shared/status-rules.js?v=20261106-bank';
import {beginReaction,advanceReaction,knockDown} from './reactions.js?v=20261106-bank';
import {statsFor,timing,magnitude,worldBox,clamp} from './shared/combat-model.js?v=20261106-bank';
import {shapeHitsRectangle} from './shared/hitbox-shapes.js?v=20261106-bank';
import {availability,mappedAttack} from './catalog.js?v=20261106-bank';
import {sequenceState,sequenceDuration,sequenceOpportunities,applyPulseReaction,advancePulseReaction,hitResult} from './shared/hit-sequence.js?v=20261106-bank';
export const RULES={width:960,ground:370,gravity:.48,jump:-9.5,move:2.8,sprintMultiplier:1.8,dodgeFrames:18,dodgeInvulnerableStart:2,dodgeInvulnerableEnd:14,dodgeCooldown:45,dodgeSpeed:4,energyPerFrame:.055,contactTimeout:600};
export function fighter(name,stats,pet=null){const limits=statsFor(stats);return {name,stats,pet,...limits,hp:limits.maxHP,energy:limits.maxEnergy,x:260,y:0,vy:0,facing:1,crouch:false,moving:false,backing:false,sprinting:false,guarding:false,dodgeStart:-999,dodgeUntil:0,dodgeReady:0,reaction:"standing",reactionStart:0,reactionUntil:0,lastHit:-999,vx:0,needsFall:false,cast:null,cooldowns:new Map(),stun:0,statuses:[],shield:0,shieldUntil:0,flash:0};}
export class Arena{
 constructor(player,opponent,attacks,options={}){this.fighters=[player,opponent];opponent.x=700;opponent.facing=-1;this.attacks=attacks;this.frame=0;this.set=0;this.paused=true;this.winner=null;this.winnerIndex=null;this.honourMetrics={guards:0,dodges:0,attacks:new Set()};this.events=[];this.training=options.training===true;this.ai=!this.training;this.metrics={hits:0,damage:0,wallHits:0,knockdowns:0};this.decks=options.decks||null;}
 slots(){return this.decks?this.decks[this.set].slots:this.attacks.slice(this.set*8,this.set*8+8);}
 rotate(){if(this.paused||this.winner)return;this.set=(this.set+1)%(this.decks?.length||Math.ceil(this.attacks.length/8));}
 reason(f,a){if(!a)return 'Empty slot';return availability(f.pet,a)||(f.reaction!=='standing'?'Recovering from a hit':f.dodgeUntil>this.frame?'Finish your dodge':f.guarding?'Lower your guard before attacking':f.cast?'Finish the current move':f.stun>this.frame?'Recovering from a hit':(f.cooldowns.get(a.id)||0)>this.frame?'Cooling down':f.energy<Math.ceil(a.cost*f.cost)?'Not enough energy':'');}
 attack(f,a){if(this.paused||this.winner||this.reason(f,a))return false;this.faceOpponents();a=mappedAttack(f.pet,a);const tm=timing(a,f.stats);if(a.hitEvents)tm.active=sequenceDuration(a);const cost=Math.ceil(a.cost*f.cost);f.energy-=cost;f.cooldowns.set(a.id,this.frame+Math.max(tm.cooldown,tm.startup+tm.active+tm.recovery));f.cast={a,tm,start:this.frame+1,x:f.x,y:f.y,facing:f.facing,hits:0,lastHit:-999,impact:a.impactTrigger==='contact'?null:tm.startup,sequence:a.hitEvents?sequenceState():null};return true;}
 dodge(f){
  if(this.paused||this.winner)return 'Start or resume the round first';
  const problem=availability(f.pet,{motion:'dodge_side'});
  if(problem)return problem;
  if(f.reaction!=='standing'||f.cast||f.stun>this.frame||f.dodgeUntil>this.frame)return 'Finish your current action first';
  if(f.dodgeReady>this.frame)return 'Dodge is cooling down';
  this.faceOpponents();f.guarding=false;f.sprinting=false;f.dodgeStart=this.frame;f.dodgeUntil=this.frame+RULES.dodgeFrames;f.dodgeReady=this.frame+RULES.dodgeCooldown;return '';
 }
 emit(text,x,y){this.events.push({text,x,y,until:this.frame+60});this.events=this.events.slice(-12);}
 tick(input=new Set(),sprintDirection=0){
  if(this.paused||this.winner)return;this.frame++;
  const [p,o]=this.fighters;
  if(this.training){p.energy=p.maxEnergy;o.hp=Math.max(1,o.hp);}
  for(const f of this.fighters){if(f.hp<=0)continue;const pulseOwned=advancePulseReaction(f,this.frame,35,RULES.width-35);const legacyOwned=!pulseOwned&&advanceReaction(f,this.frame,(name,who)=>this.reactionEvent(name,who));f.pulseOwned=pulseOwned;f.legacyOwned=!!legacyOwned;f.energy=Math.min(f.maxEnergy,f.energy+RULES.energyPerFrame);if(f.shieldUntil<=this.frame)f.shield=0;
   for(const s of f.statuses){if(statusTickDue(s,this.frame)){if(s.type==='regen')f.hp=Math.min(f.maxHP,f.hp+s.power);else if(['burn','poison'].includes(s.type))f.hp=Math.max(0,f.hp-s.power);s.next+=s.interval;}}
   f.statuses=f.statuses.filter(s=>s.until>this.frame);
   if(f.statuses.some(s=>s.type==='stun'))f.stun=Math.max(f.stun,this.frame+1);
   let direction=0,jump=false;f.crouch=false;f.sprinting=false;f.moving=false;f.guarding=f.reaction==='standing'&&f===p&&input.has('Shift')&&!f.cast&&f.dodgeUntil<=this.frame&&f.stun<=this.frame&&!availability(f.pet,{motion:'block_side'});
   if(f===p){direction=Number(input.has('ArrowRight'))-Number(input.has('ArrowLeft'));jump=input.has('ArrowUp');f.crouch=input.has('ArrowDown')&&f.y===0;}
   else if(this.ai){const distance=p.x-f.x;direction=Math.abs(distance)>65?Math.sign(distance):0;if(this.frame%90===0&&p.y< -20)jump=true;}
   if(f.reaction==='standing'&&f.dodgeUntil>this.frame&&f.stun<=this.frame){f.x-=f.facing*RULES.dodgeSpeed;}
   if(f.reaction==='standing'&&!f.cast&&f.dodgeUntil<=this.frame&&f.stun<=this.frame){const statusSpeed=movementMultiplier(f.statuses);
    if(direction){f.moving=true;f.sprinting=f===p&&direction===sprintDirection&&!f.guarding&&!f.crouch&&f.y===0;f.x+=direction*(RULES.move+f.stats.speed*.012)*statusSpeed*(f.crouch||f.guarding?.4:1)*(f.sprinting?RULES.sprintMultiplier:1);}if(jump&&f.y===0&&!f.crouch&&!f.guarding)f.vy=RULES.jump;}
   if(!f.pulseOwned&&!f.legacyOwned&&f.reaction!=='wall'){f.vy+=RULES.gravity;f.y+=f.vy;}if(f.y>=0){f.y=0;f.vy=0;if(f.reaction==='airborne'&&!f.pulseOwned)knockDown(f,this.frame,(name,who)=>this.reactionEvent(name,who));}f.x=clamp(f.x,35,RULES.width-35);
  }
  this.faceOpponents();p.backing=p.moving&&((input.has('ArrowRight')?1:0)-(input.has('ArrowLeft')?1:0))*p.facing<0;o.backing=false;
  if(this.ai&&!o.cast&&o.stun<=this.frame){o.facing=p.x<o.x?-1:1;if(this.frame%42===0){const choices=this.attacks.filter(a=>!this.reason(o,a));const a=choices[Math.floor(this.frame/42)%Math.max(1,choices.length)];if(a)this.attack(o,a);}}
  // Resolve against one frame snapshot before applying hits. A first hit cannot erase a simultaneous trade.
  const pending=this.fighters.filter(f=>f.hp>0&&f.cast).map(f=>this.prepare(f,f===p?o:p));
  for(const hit of pending)if(hit)this.resolve(hit.f,hit.target,hit);
  for(const f of this.fighters)if(f.hp<=0)f.cast=null;
  this.faceOpponents();
  this.events=this.events.filter(e=>e.until>this.frame);
  if(this.training){o.hp=Math.max(1,o.hp);if(o.reaction==='standing'&&this.frame-o.lastHit>60){o.hp=o.maxHP;o.statuses=[];}return;}
  const dead=this.fighters.filter(f=>f.hp<=0);if(dead.length){this.winnerIndex=dead.length===2?-1:this.fighters.findIndex(f=>f.hp>0);this.winner=this.winnerIndex===-1?'Draw':this.fighters[this.winnerIndex].name;this.paused=true;for(const f of this.fighters)f.cast=null;}
  this.events=this.events.filter(e=>e.until>this.frame);
 }
 faceOpponents(){const [p,o]=this.fighters;if(p.x!==o.x){p.facing=o.x>p.x?1:-1;o.facing=-p.facing;}for(const f of this.fighters){if(f.cast&&f.cast.a.delivery==='melee')f.cast.facing=f.facing;}}
 reactionEvent(name,f){this.emit(name,f.x,f.y-80);if(f===this.fighters[1]){if(name==='WALL HIT')this.metrics.wallHits++;if(name==='KNOCKDOWN')this.metrics.knockdowns++;}}
 resetDummy(position=700){if(!this.training)return;const f=this.fighters[1];Object.assign(f,{x:position,y:0,vy:0,vx:0,hp:f.maxHP,energy:f.maxEnergy,pulseMotion:null,pulseOwned:false,legacyMotion:null,legacyOwned:false,juggleHits:0,juggleLocked:false,reaction:'standing',reactionStart:this.frame,reactionUntil:0,needsFall:false,lastHit:-999,cast:null,stun:0,statuses:[],shield:0});this.metrics={hits:0,damage:0,wallHits:0,knockdowns:0};this.lastSequence=null;for(const actor of this.fighters)actor.cast=null;this.faceOpponents();}
 testDummyReaction(wall=false){if(!this.training)return;const f=this.fighters[1];this.resetDummy(wall?910:650);beginReaction(f,{motion:'ground_slam_side',knockback:wall?100:24,launchHeight:35,hitstun:15,flightFrames:36,pushAxis:'both',wallSlam:wall,floorSlam:true},1,this.frame);}
 prepare(f,target){
  const cast=f.cast;if(!cast)return null;const {a,tm}=cast,age=this.frame-cast.start;
  let box=worldBox(a,a.impactTrigger==='contact'&&cast.impact!==null?Math.min(age,cast.impact):age,f.stats,cast.facing);box.x+=cast.x;box.y+=cast.y;
  if(cast.sequence?.attached&&a.projectileMode==='attached')box={...box,x:target.x-box.w/2,y:target.y-box.h};
  const hurt={x:target.x-14,y:target.y-(target.crouch?34:60),w:28,h:target.crouch?34:60};
  const recipient=a.delivery==='self'?f:target,defense=recipient.cast,defAge=defense?this.frame-defense.start:0;
  const defending=defense&&defAge>=defense.tm.startup&&defAge<defense.tm.startup+defense.tm.active;
  return {f,target,cast,age,damageMultiplier:statusMultiplier(f.statuses,'weaken'),contact:a.delivery==='self'||shapeHitsRectangle(box,hurt),guarding:recipient.guarding||(defending&&defense.a.payload==='block'),guardReduction:defending&&defense.a.payload==='block'?defense.a.blockPercent/100:recipient.guard,evading:a.delivery!=='self'&&((this.frame>=recipient.dodgeStart+RULES.dodgeInvulnerableStart&&this.frame<recipient.dodgeStart+RULES.dodgeInvulnerableEnd)||(defending&&defense.a.payload==='dodge'))};
 }
 resolve(f,target,snapshot=this.prepare(f,target)){if(!snapshot)return;const {cast,age}=snapshot;const {a,tm}=cast;
  if(a.hitEvents){this.resolveSequence(f,target,snapshot);return;}
  const box=worldBox(a,a.impactTrigger==='contact'&&cast.impact!==null?Math.min(age,cast.impact):age,f.stats,cast.facing);box.x+=cast.x;box.y+=cast.y;
  const hurt={x:target.x-14,y:target.y-(target.crouch?34:60),w:28,h:target.crouch?34:60};
  const support=a.delivery==='self',contact=snapshot.contact;
  if(cast.impact===null&&age>=tm.startup&&contact)cast.impact=age;
  const impact=cast.impact;
  if(impact!==null&&age>=impact&&age<impact+tm.active&&contact&&cast.hits<a.hitLimit&&age-cast.lastHit>=a.hitInterval){
   cast.hits++;cast.lastHit=age;const recipient=support?f:target;
   const defense=recipient.cast;const defAge=defense?this.frame-defense.start:0;const defending=defense&&defAge>=defense.tm.startup&&defAge<defense.tm.startup+defense.tm.active;
   if(snapshot.evading){if(recipient===this.fighters[0]&&a.payload==='damage')this.honourMetrics.dodges++;this.emit('DODGE',recipient.x,recipient.y-70);}
   else {let amount=magnitude(a,f.stats);if(a.payload==='damage')amount=Math.round(amount*snapshot.damageMultiplier);
    if(a.payload==='damage'){const guard=snapshot.guarding&&a.blockable;amount=Math.round(amount*(guard?1-snapshot.guardReduction:1));const absorbed=Math.min(recipient.shield,amount);recipient.shield-=absorbed;amount-=absorbed;recipient.hp=Math.max(0,recipient.hp-amount);recipient.flash=this.frame+8;
     if(guard&&recipient===this.fighters[0])this.honourMetrics.guards++;if(amount>0&&f===this.fighters[0]&&recipient===this.fighters[1])this.honourMetrics.attacks.add(a.id);if(!guard)beginReaction(recipient,a,cast.facing,this.frame);if(this.training&&recipient===this.fighters[1]){this.metrics.hits++;this.metrics.damage+=amount;}
     this.emit(guard?'GUARD −'+amount:'−'+amount,recipient.x,recipient.y-70);
     if(!guard&&a.status!=='none')this.status(recipient,a);
    }else if(a.payload==='heal'){recipient.hp=Math.min(recipient.maxHP,recipient.hp+amount);this.emit('+'+amount,recipient.x,recipient.y-70);}
    else if(a.payload==='energy'){recipient.energy=Math.min(recipient.maxEnergy,recipient.energy+amount);this.emit('ENERGY +'+amount,recipient.x,recipient.y-70);}
    else if(a.payload==='shield'){recipient.shield=Math.max(recipient.shield,amount);recipient.shieldUntil=this.frame+a.shieldDuration;this.emit('SHIELD',recipient.x,recipient.y-70);}
    else if(a.payload==='push'){if(snapshot.guarding&&a.blockable)this.emit('PUSH BLOCKED',recipient.x,recipient.y-70);else beginReaction(recipient,a,cast.facing,this.frame);}
    if(!['damage','push','block','dodge'].includes(a.payload)&&a.status!=='none')this.status(recipient,a);
   }
  }
  if(f.cast===cast&&((impact!==null&&age>=impact+tm.active+tm.recovery)||(impact===null&&age>=tm.startup+RULES.contactTimeout)))f.cast=null;
 }
 resolveSequence(f,target,snapshot){
  const {cast,age}=snapshot,{a,tm,sequence:state}=cast;
  if(age<tm.startup)return;
  if(target.hp<=0)state.cancelled='Target defeated.';
  for(const event of sequenceOpportunities(a,state,age,snapshot.contact,target)){
   const guard=snapshot.guarding&&a.blockable;
   if(snapshot.evading){hitResult(state,event,age,'Dodged');state.cancelled='Contact dodged; attachment cancelled.';this.emit('DODGE',target.x,target.y-70);continue;}
   const amount=Math.round(event.damage*snapshot.damageMultiplier*(guard?1-snapshot.guardReduction:1)),absorbed=Math.min(target.shield,amount);
   target.shield-=absorbed;const damage=Math.min(target.hp,amount-absorbed);target.hp-=damage;cast.hits++;cast.lastHit=age;
   hitResult(state,event,age,guard?'Blocked':'Connected');this.emit((guard?'GUARD −':'−')+damage,target.x,target.y-70);
   if(this.training&&target===this.fighters[1]){this.metrics.hits++;this.metrics.damage+=damage;}
   if(guard)state.cancelled='Contact blocked; attachment cancelled.';
   else {state.attached=true;target.cast=null;target.guarding=false;applyPulseReaction(target,event,cast.facing,this.frame);if(f===this.fighters[0]&&damage>0)this.honourMetrics.attacks.add(a.id);}
  }
  cast.impact=state.contactFrame;
  this.lastSequence={attack:a.name,results:state.results.map(r=>({...r})),reason:state.cancelled};
  if(f.cast===cast&&((state.contactFrame===null&&age>=tm.startup+RULES.contactTimeout)||(state.contactFrame!==null&&age>=state.contactFrame+sequenceDuration(a)+tm.recovery)))f.cast=null;
 }
 status(f,a){const previous=f.statuses.find(s=>s.type===a.status);const refreshed=refreshStatus(previous,a,this.frame,f.resistance);f.statuses=f.statuses.filter(s=>s.type!==a.status);f.statuses.push(refreshed);}
}
