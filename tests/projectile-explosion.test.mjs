import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
import {createImpactArea,impactAreaBox,claimAreaHit} from '../site/shared/projectile-area.js';
import {shapeHitsRectangle} from '../site/shared/hitbox-shapes.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
const blast=()=>({...freshAttack('projectile'),startup:0,active:12,recovery:0,cooldown:0,cost:0,base:7,coefficient:0,knockback:0,hitstun:0,projectileSpeed:0,projectileLifetime:30,projectileContact:'single',projectileArea:{width:120,height:120,duration:20,interval:1,hitLimit:1,damage:9,blastFrames:6}});
test('blast grows concentrically and uses elliptical collision, one hit per target',()=>{
 const a=blast(),area=createImpactArea(a,{x:0,y:0,w:20,h:20},4),original={...area.box};
 assert.equal(impactAreaBox(area,5).w,20);assert.equal(impactAreaBox(area,10).w,120);assert.equal(impactAreaBox(area,15).w,120);assert.deepEqual(area.box,original);
 const edge={x:60,y:8,w:2,h:2};assert.equal(shapeHitsRectangle(impactAreaBox(area,5),edge),false);assert.equal(shapeHitsRectangle(impactAreaBox(area,10),edge),true);
 const corner={x:65,y:65,w:2,h:2};assert.equal(shapeHitsRectangle(impactAreaBox(area,10),corner),false);
 assert.equal(claimAreaHit(area,'a',5,true),true);assert.equal(claimAreaHit(area,'a',10,true),false);assert.equal(claimAreaHit(area,'b',10,true),true);
});
test('expansion hits only when its boundary reaches the target with runtime/preview parity',()=>{
 const a=blast(),stats={...defaultStats(),speed:0},owner=fighter('A',stats),target=fighter('B',stats),arena=new Arena(owner,target,[a],{training:true});arena.ai=false;arena.paused=false;owner.x=300;target.x=350;arena.attack(owner,a);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});let pulses=0;
 for(let frame=0;frame<35;frame++){arena.tick();assert.equal(target.hp,sim.frames[frame].target.hp,'frame '+frame);pulses+=arena.lastAreaContacts.length;}
 assert.equal(pulses,1);assert.equal(target.maxHP-target.hp,16);assert.equal(sim.frames.at(-1).areaHits,1);
});
test('blast definitions reject invalid growth and repeated damage; version20 refuses them',()=>{
 const a=blast();validateAttack(a);assert.equal(attackVersion(a),21);assert.throws(()=>requireGroupVersion(20,[a]),/version 21/);requireGroupVersion(21,[a]);
 for(const value of [0,21,1.5,null])assert.throws(()=>validateAttack({...a,projectileArea:{...a.projectileArea,blastFrames:value}}));
 assert.throws(()=>validateAttack({...a,projectileArea:{...a.projectileArea,hitLimit:2}}));
 const legacy=structuredClone(a);delete legacy.projectileArea.blastFrames;legacy.projectileArea.hitLimit=3;validateAttack(legacy);assert.equal(attackVersion(legacy),20);assert.equal(impactAreaBox(createImpactArea(legacy,{x:0,y:0,w:20,h:20},0),1).shape,'rectangle');
});
function explosionArena(){const a=blast(),stats={...defaultStats(),speed:0},owner=fighter('A',stats),target=fighter('B',stats),arena=new Arena(owner,target,[a],{training:true});arena.ai=false;arena.paused=false;owner.x=300;target.x=350;arena.attack(owner,a);arena.tick();return {a,stats,owner,target,arena};}
test('pause and impact stop freeze explosion growth and do not spend its hit',()=>{
 const {arena,target}=explosionArena(),area=arena.areas[0],frame=arena.frame,box=impactAreaBox(area,frame),hp=target.hp;
 arena.paused=true;for(let i=0;i<10;i++)arena.tick();assert.equal(arena.frame,frame);assert.deepEqual(impactAreaBox(area,arena.frame),box);assert.equal(area.targets.size,0);
 arena.paused=false;arena.hitstopRemaining=4;for(let i=0;i<4;i++)arena.tick();assert.equal(arena.frame,frame);assert.equal(target.hp,hp);assert.equal(area.targets.size,0);
 for(let i=0;i<10;i++)arena.tick();assert.equal(target.hp,hp-9);assert.equal(area.targets.get(target).hits,1);
});
test('explosion invulnerability preserves its single hit; shield absorbs it once',()=>{
 const {arena,target}=explosionArena();arena.training=false;const defense={...freshAttack(),startup:90,cost:0,defenseWindows:[{id:'defense_blast_safe',kind:'invulnerability',against:'area',start:0,duration:5}]};validateAttack(defense);assert.equal(arena.attack(target,defense),true);
 target.shield=4;target.shieldUntil=100;const hp=target.hp;for(let i=0;i<4;i++)arena.tick();assert.equal(target.hp,hp);assert.equal(arena.areas[0].targets.size,0);
 for(let i=0;i<15;i++)arena.tick();assert.equal(target.hp,hp-5);assert.equal(target.shield,0);assert.equal(arena.areas[0].targets.get(target).hits,1);
});
test('area parry removes explosion without affecting its distant owner',()=>{
 const {arena,target,owner}=explosionArena();arena.training=false;const defense={...freshAttack(),startup:90,cost:0,defenseWindows:[{id:'defense_blast_parry',kind:'parry',against:'area',start:0,duration:20,hits:1,stun:10}]};validateAttack(defense);assert.equal(arena.attack(target,defense),true);const hp=target.hp,cast=owner.cast;
 for(let i=0;i<10;i++)arena.tick();assert.equal(target.hp,hp);assert.equal(arena.areas.length,0);assert.equal(owner.cast,cast);assert.equal(target.cast.outcomes.has('parry'),true);
});
import {jugglePreset} from '../site/shared/hit-sequence.js';
test('attached sequence explosion cancels later source hits and matches preview through expiry',()=>{
 const a={...blast(),behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(3,3).map(e=>({...e,reaction:'none',height:0,knockback:0}))},stats={...defaultStats(),speed:0},owner=fighter('A',stats),target=fighter('B',stats),arena=new Arena(owner,target,[a],{training:true});arena.ai=false;arena.paused=false;owner.x=300;target.x=350;assert.equal(arena.attack(owner,a),true);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});let pulses=0;
 for(let frame=0;frame<35;frame++){arena.tick();assert.equal(target.hp,sim.frames[frame].target.hp,'frame '+frame);pulses+=arena.lastAreaContacts.length;}
 assert.equal(sim.frames.at(-1).hits,1);assert.equal(sim.frames.at(-1).areaHits,1);assert.equal(pulses,1);assert.equal(arena.areas.length,0);
});
import {compareAttacks} from '../site/matchup.js';
test('replay explosion bounds match impact-relative expansion and expiry',()=>{
 const a=blast(),result=compareAttacks(a,{...freshAttack(),startup:90},{distance:50,frames:30});
 const impact=result.rows.find(row=>row.event.includes('Projectile ended on hit')).frame;
 assert.equal(result.replay[impact].areas.length,0);
 const first=result.replay[impact+1];assert.equal(first.areas[0].box.w,20);assert.equal(first.areas[0].remaining,20);
 assert.equal(result.replay[impact+6].areas[0].box.w,120);assert.equal(result.replay[impact+21].areas.length,0);
});
