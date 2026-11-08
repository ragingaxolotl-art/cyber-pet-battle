import {CONTACT_TIMEOUT,contactDeadline,castEnd} from './shared/contact-timing.js?v=20261108-juggle-reset';
import {canCancel,automaticFollowup,MAX_AUTOMATIC_FOLLOWUPS} from './shared/cancel-windows.js?v=20261108-juggle-reset';
import {createDefenseState,defenseSnapshot,claimArmor,isInvulnerable,claimParry} from './shared/defense-windows.js?v=20261108-juggle-reset';
import {activeGroupBoxes,activeGroupContacts,createGroupHitTracker} from './shared/hitbox-groups.js?v=20261108-juggle-reset';
import {refreshStatus,statusTickDue,statusMultiplier,movementMultiplier} from './shared/status-rules.js?v=20261108-juggle-reset';
import {beginReaction,advanceReaction,knockDown} from './reactions.js?v=20261108-juggle-reset';
import {statsFor,timing,magnitude,worldBox,clamp} from './shared/combat-model.js?v=20261108-juggle-reset';
import {shapeHitsRectangle} from './shared/hitbox-shapes.js?v=20261108-juggle-reset';
import {KEYS,availability,mappedAttack} from './catalog.js?v=20261108-juggle-reset';
import {resetGroundedJuggle,sequenceState,sequenceDuration,sequenceOpportunities,applyPulseReaction,advancePulseReaction,hitResult} from './shared/hit-sequence.js?v=20261108-juggle-reset';
export const RULES={width:960,ground:370,gravity:.48,jump:-9.5,move:2.8,sprintMultiplier:1.8,dodgeFrames:18,dodgeInvulnerableStart:2,dodgeInvulnerableEnd:14,dodgeCooldown:45,dodgeSpeed:4,energyPerFrame:.055,contactTimeout:CONTACT_TIMEOUT};
export function fighter(name,stats,pet=null){const limits=statsFor(stats);return {name,stats,pet,...limits,hp:limits.maxHP,energy:limits.maxEnergy,x:260,y:0,vy:0,facing:1,crouch:false,moving:false,backing:false,sprinting:false,guarding:false,dodgeStart:-999,dodgeUntil:0,dodgeReady:0,reaction:"standing",reactionStart:0,reactionUntil:0,lastHit:-999,vx:0,needsFall:false,cast:null,cooldowns:new Map(),stun:0,statuses:[],shield:0,shieldUntil:0,flash:0};}
export class Arena{
 constructor(player,opponent,attacks,options={}){this.fighters=[player,opponent];opponent.x=700;opponent.facing=-1;this.attacks=attacks;this.frame=0;this.set=0;this.paused=true;this.winner=null;this.winnerIndex=null;this.honourMetrics={guards:0,dodges:0,attacks:new Set()};this.events=[];this.automaticAttempts=[];this.training=options.training===true;this.ai=!this.training;this.metrics={hits:0,damage:0,wallHits:0,knockdowns:0};this.decks=options.decks||null;}
 slots(){return this.decks?this.decks[this.set].slots:this.attacks.slice(this.set*KEYS.length,(this.set+1)*KEYS.length);}
 rotate(){if(this.paused||this.winner)return;this.set=(this.set+1)%(this.decks?.length||Math.ceil(this.attacks.length/KEYS.length));}
 reason(f,a,automatic=false){if(!a)return 'Empty slot';return availability(f.pet,a)||(f.reaction!=='standing'?'Recovering from a hit':f.dodgeUntil>this.frame?'Finish your dodge':f.guarding?'Lower your guard before attacking':f.cast&&!canCancel(f.cast,a,this.frame-f.cast.start,automatic)?'Finish the current move':f.stun>this.frame?'Recovering from a hit':(f.cooldowns.get(a.id)||0)>this.frame?'Cooling down':f.energy<Math.ceil(a.cost*f.cost)?'Not enough energy':'');}
 attack(f,a,automatic=false){if(this.paused||this.winner||this.reason(f,a,automatic))return false;const automaticDepth=automatic?(f.cast?.automaticDepth||0)+1:0;this.faceOpponents();a=mappedAttack(f.pet,a);const tm=timing(a,f.stats);if(a.hitEvents)tm.active=sequenceDuration(a);const cost=Math.ceil(a.cost*f.cost);f.energy-=cost;f.cooldowns.set(a.id,this.frame+Math.max(tm.cooldown,tm.startup+tm.active+tm.recovery));f.cast={a,tm,automaticDepth,start:this.frame+1,x:f.x,y:f.y,facing:f.facing,groupTracker:createGroupHitTracker(),defenseState:createDefenseState(),outcomes:new Set(),hits:0,lastHit:-999,impact:a.impactTrigger==='contact'?null:tm.startup,sequence:a.hitEvents?sequenceState():null};return true;}
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
  this.automaticAttempts=[];
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
   if(!f.pulseOwned&&!f.legacyOwned&&f.reaction!=='wall'){f.vy+=RULES.gravity;f.y+=f.vy;}if(f.y>=0){f.y=0;f.vy=0;resetGroundedJuggle(f);if(f.reaction==='airborne'&&!f.pulseOwned)knockDown(f,this.frame,(name,who)=>this.reactionEvent(name,who));}f.x=clamp(f.x,35,RULES.width-35);
  }
  this.faceOpponents();p.backing=p.moving&&((input.has('ArrowRight')?1:0)-(input.has('ArrowLeft')?1:0))*p.facing<0;o.backing=false;
  if(this.ai&&!o.cast&&o.stun<=this.frame){o.facing=p.x<o.x?-1:1;if(this.frame%42===0){const choices=this.attacks.filter(a=>!this.reason(o,a));const a=choices[Math.floor(this.frame/42)%Math.max(1,choices.length)];if(a)this.attack(o,a);}}
  // Resolve against one frame snapshot before applying hits. A first hit cannot erase a simultaneous trade.
  const pending=this.fighters.filter(f=>f.hp>0&&f.cast).map(f=>this.prepare(f,f===p?o:p));
  for(const hit of pending)if(hit)this.resolve(hit.f,hit.target,hit);
  for(const f of this.fighters)if(f.hp<=0)f.cast=null;
  // Follow-ups start on the next simulation frame, after both sides resolve contact.
  if(this.fighters.every(f=>f.hp>0))for(const f of this.fighters){
   const cast=f.cast,window=automaticFollowup(cast,cast?this.frame-cast.start:0,true);if(!window)continue;
   const available=this.decks?this.decks.flatMap(deck=>deck.slots).filter(Boolean):this.attacks;
   const next=available.find(a=>a.id===window.attacks[0]);
   const reason=(cast.automaticDepth||0)>=MAX_AUTOMATIC_FOLLOWUPS?'Automatic chain limit reached (8 transitions)':!next?'Follow-up attack is unavailable or not equipped':this.reason(f,next,true);
   const started=!reason&&this.attack(f,next,true);
   this.automaticAttempts.push({fighter:f,cast,windowId:window.id,attackId:window.attacks[0],started:!!started,reason:reason||''});
   if(started)this.emit('FOLLOW-UP',f.x,f.y-80);
  }

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
  const recipient=a.delivery==='self'?f:target,candidate=recipient.cast,defAge=candidate?this.frame-candidate.start:0,defense=candidate&&defAge<castEnd(candidate.impact,candidate.tm)?candidate:null;
  const defending=defense&&defAge>=defense.tm.startup&&defAge<defense.tm.startup+defense.tm.active;
  const sequenceFrame=cast.sequence?.contactFrame,groupFrame=a.hitEvents?(sequenceFrame===null?0:age-sequenceFrame):age-tm.startup;
  const groupTime=a.hitEvents?(sequenceFrame??age):age;
  const primary=worldBox(a,groupTime,f.stats,cast.facing);
  const boxes=a.hitboxGroups?activeGroupBoxes(a.hitboxGroups,groupFrame,b=>{const world=worldBox({...a,box:b},groupTime,f.stats,cast.facing);return {...world,x:world.x+box.x-primary.x,y:world.y+box.y-primary.y};}):null;
  const groupContacts=boxes?a.hitboxGroups.filter(g=>boxes.some(b=>b.groupId===g.id&&shapeHitsRectangle(b,hurt))):null;
  const sequenceContacts=boxes?new Set(groupContacts.map(g=>g.id)):null;

  return {f,target,cast,age,defense: defenseSnapshot(defense,defAge),invulnerable:isInvulnerable(defenseSnapshot(defense,defAge),a),boxes,groupContacts,sequenceContacts,damageMultiplier:statusMultiplier(f.statuses,'weaken'),contact:a.delivery==='self'||shapeHitsRectangle(box,hurt),guarding:recipient.guarding||(defending&&defense.a.payload==='block'),guardReduction:defending&&defense.a.payload==='block'?defense.a.blockPercent/100:recipient.guard,evading:a.delivery!=='self'&&((this.frame>=recipient.dodgeStart+RULES.dodgeInvulnerableStart&&this.frame<recipient.dodgeStart+RULES.dodgeInvulnerableEnd)||(defending&&defense.a.payload==='dodge'))};
 }
 resolve(f,target,snapshot=this.prepare(f,target)){if(!snapshot)return;const {cast,age}=snapshot;const {a,tm}=cast;
  if(a.hitEvents){this.resolveSequence(f,target,snapshot);return;}
  const box=worldBox(a,a.impactTrigger==='contact'&&cast.impact!==null?Math.min(age,cast.impact):age,f.stats,cast.facing);box.x+=cast.x;box.y+=cast.y;
  const hurt={x:target.x-14,y:target.y-(target.crouch?34:60),w:28,h:target.crouch?34:60};
  const support=a.delivery==='self',contact=snapshot.contact;
  if(cast.impact===null&&age>=tm.startup&&age<=contactDeadline(tm)&&contact)cast.impact=age;
  const impact=cast.impact;
  const active=impact!==null&&age>=impact&&age<impact+tm.active;
 const groups=snapshot.groupContacts?.filter(g=>active&&cast.groupTracker.claim(target,g,age));
 const opportunities=groups?groups.length:(active&&contact&&cast.hits<a.hitLimit&&age-cast.lastHit>=a.hitInterval?1:0);
 for(let opportunity=0;opportunity<opportunities&&target.hp>0;opportunity++){
   cast.hits++;cast.lastHit=age;const recipient=support?f:target;
   const defense=recipient.cast;const defAge=defense?this.frame-defense.start:0;const defending=defense&&defAge>=defense.tm.startup&&defAge<defense.tm.startup+defense.tm.active;
   const parry=!snapshot.evading&&!snapshot.invulnerable&&claimParry(snapshot.defense,a);
   if(parry){this.parry(f,recipient,parry);continue;}
   if(snapshot.evading||snapshot.invulnerable){if(!snapshot.invulnerable&&recipient===this.fighters[0]&&a.payload==='damage')this.honourMetrics.dodges++;this.emit(snapshot.invulnerable?'INVULNERABLE':'DODGE',recipient.x,recipient.y-70);}
   else {let amount=magnitude(a,f.stats);if(a.payload==='damage')amount=Math.round(amount*snapshot.damageMultiplier);
    if(a.payload==='damage'){const guard=snapshot.guarding&&a.blockable,armored=!guard&&claimArmor(snapshot.defense,a);amount=Math.round(amount*(guard?1-snapshot.guardReduction:1));const absorbed=Math.min(recipient.shield,amount);recipient.shield-=absorbed;amount-=absorbed;recipient.hp=Math.max(0,recipient.hp-amount);recipient.flash=this.frame+8;
     cast.outcomes.add(guard?'block':'hit');if(guard&&recipient===this.fighters[0])this.honourMetrics.guards++;if(amount>0&&f===this.fighters[0]&&recipient===this.fighters[1])this.honourMetrics.attacks.add(a.id);if(!guard&&!armored)beginReaction(recipient,a,cast.facing,this.frame);if(armored)recipient.lastHit=this.frame;if(this.training&&recipient===this.fighters[1]){this.metrics.hits++;this.metrics.damage+=amount;}
     this.emit(guard?'GUARD −'+amount:armored?'ARMOR −'+amount:'−'+amount,recipient.x,recipient.y-70);
     if(!guard&&a.status!=='none')this.status(recipient,a);
    }else if(a.payload==='heal'){recipient.hp=Math.min(recipient.maxHP,recipient.hp+amount);this.emit('+'+amount,recipient.x,recipient.y-70);}
    else if(a.payload==='energy'){recipient.energy=Math.min(recipient.maxEnergy,recipient.energy+amount);this.emit('ENERGY +'+amount,recipient.x,recipient.y-70);}
    else if(a.payload==='shield'){recipient.shield=Math.max(recipient.shield,amount);recipient.shieldUntil=this.frame+a.shieldDuration;this.emit('SHIELD',recipient.x,recipient.y-70);}
    else if(a.payload==='push'){cast.outcomes.add(snapshot.guarding&&a.blockable?'block':'hit');if(snapshot.guarding&&a.blockable)this.emit('PUSH BLOCKED',recipient.x,recipient.y-70);else if(claimArmor(snapshot.defense,a)){recipient.lastHit=this.frame;this.emit('ARMORED',recipient.x,recipient.y-70);}else beginReaction(recipient,a,cast.facing,this.frame);}
    if(!['damage','push','block','dodge'].includes(a.payload)&&a.status!=='none')this.status(recipient,a);
   }
  }
  if(f.cast===cast&&age>=castEnd(impact,tm))f.cast=null;
 }
 resolveSequence(f,target,snapshot){
  const {cast,age}=snapshot,{a,tm,sequence:state}=cast;
  if(age<tm.startup)return;
  if(target.hp<=0)state.cancelled='Target defeated.';
  for(const event of (state.contactFrame===null&&age>contactDeadline(tm)?[]:sequenceOpportunities(a,state,age,snapshot.sequenceContacts?(event=>snapshot.sequenceContacts.has(event.hitboxGroup)):snapshot.contact,target))){
   const guard=snapshot.guarding&&a.blockable;
   if(snapshot.evading||snapshot.invulnerable){hitResult(state,event,age,snapshot.invulnerable?'Invulnerable':'Dodged');state.cancelled=snapshot.invulnerable?'Contact invulnerable; attachment cancelled.':'Contact dodged; attachment cancelled.';this.emit(snapshot.invulnerable?'INVULNERABLE':'DODGE',target.x,target.y-70);continue;}
   const parry=claimParry(snapshot.defense,a);if(parry){hitResult(state,event,age,'Parried');state.cancelled='Contact parried; attachment cancelled.';this.parry(f,target,parry);continue;}
   const armored=!guard&&claimArmor(snapshot.defense,a);
   const amount=Math.round(event.damage*snapshot.damageMultiplier*(guard?1-snapshot.guardReduction:1)),absorbed=Math.min(target.shield,amount);
   target.shield-=absorbed;const damage=Math.min(target.hp,amount-absorbed);target.hp-=damage;cast.hits++;cast.lastHit=age;
   cast.outcomes.add(guard?'block':'hit');hitResult(state,event,age,guard?'Blocked':armored?'Armored':'Connected');this.emit((guard?'GUARD −':armored?'ARMOR −':'−')+damage,target.x,target.y-70);
   if(this.training&&target===this.fighters[1]){this.metrics.hits++;this.metrics.damage+=damage;}
   if(guard)state.cancelled='Contact blocked; attachment cancelled.';
   else {state.attached=true;if(armored)target.lastHit=this.frame;else {target.cast=null;target.guarding=false;applyPulseReaction(target,event,cast.facing,this.frame);}if(f===this.fighters[0]&&damage>0)this.honourMetrics.attacks.add(a.id);}
  }
  cast.impact=state.contactFrame;
  this.lastSequence={attack:a.name,results:state.results.map(r=>({...r})),reason:state.cancelled};
  if(f.cast===cast&&age>=castEnd(state.contactFrame,tm))f.cast=null;
 }
 parry(attacker,defender,window){defender.cast?.outcomes.add('parry');beginReaction(attacker,{knockback:0,launchHeight:0,pushAxis:'x',hitstun:window.stun,flightFrames:1,floorSlam:false,wallSlam:false},-attacker.facing,this.frame);this.emit('PARRY',defender.x,defender.y-70);}
 status(f,a){const previous=f.statuses.find(s=>s.type===a.status);const refreshed=refreshStatus(previous,a,this.frame,f.resistance);f.statuses=f.statuses.filter(s=>s.type!==a.status);f.statuses.push(refreshed);}
}
