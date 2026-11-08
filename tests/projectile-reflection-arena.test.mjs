import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(){const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',{...stats,strength:99,speed:99});
 const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,projectileLifetime:60,projectileDurability:3,impactTrigger:'contact',projectileSpeed:10,cost:0,base:7,coefficient:1,knockback:0};
 const arena=new Arena(a,b,[attack]);arena.ai=false;arena.paused=false;a.x=200;b.x=500;arena.attack(a,attack);arena.tick();return {arena,a,b,entity:arena.projectiles.entries[0]};}
test('reflection preserves position, lifetime and damage stats while changing owner and target',()=>{
 const {arena,a,b,entity}=setup(),before=arena.prepareCast(a,b,entity.cast).box,expiry=entity.expires,cast=entity.cast;
 assert.equal(arena.reflectProjectile(entity,b),true);assert.equal(entity.owner,b);assert.equal(entity.target,a);assert.equal(entity.expires,expiry);assert.equal(entity.durability,3);
 assert.deepEqual(arena.prepareCast(b,a,entity.cast).box,{...before,facing:-before.facing});assert.notEqual(entity.cast,cast);assert.equal(entity.cast.projectileStats.strength,20);
 for(let i=0;i<30;i++)arena.tick();assert.equal(a.hp,a.maxHP-27);assert.equal(b.hp,b.maxHP);
});
test('repeated reflections are bounded and do not extend expiry',()=>{
 const {arena,entity}=setup(),expiry=entity.expires;
 for(let i=0;i<8;i++){assert.equal(arena.reflectProjectile(entity,entity.target),true);assert.equal(entity.expires,expiry);}
 assert.equal(arena.reflectProjectile(entity,entity.target),false);assert.equal(arena.projectiles.entries.length,0);
});
test('reflection cannot mutate an unrelated target or a retired projectile',()=>{
 const {arena,a,b,entity}=setup();assert.throws(()=>arena.reflectProjectile(entity,a),/target/);assert.equal(entity.owner,a);
 arena.projectiles.remove(entity);assert.throws(()=>arena.reflectProjectile(entity,b),/live/);
});
test('reflection does not reuse the original owner action outcomes or hit ledger',()=>{
 const {arena,b,entity}=setup(),old=entity.cast;old.hits=1;old.outcomes.add('hit');
 arena.reflectProjectile(entity,b);assert.equal(old.hits,1);assert.equal(old.outcomes.has('hit'),true);assert.equal(entity.cast.hits,0);assert.equal(entity.cast.outcomes.size,0);
});
test('attached sequence detaches at its current world position when reflected',async()=>{
 const {jugglePreset}=await import('../site/shared/hit-sequence.js');const {arena,a,b,entity}=setup();
 entity.cast.a={...entity.cast.a,behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,5)};
 entity.cast.sequence={contactFrame:0,attached:true,results:[],targets:new Map()};entity.cast.impact=0;
 b.x=600;b.y=-50;const before=arena.prepareCast(a,b,entity.cast).box;
 arena.reflectProjectile(entity,b);const after=arena.prepareCast(b,a,entity.cast).box;
 assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(entity.cast.sequence.attached,false);
 arena.frame++;const next=arena.prepareCast(b,a,entity.cast).box;assert.equal(next.x,after.x-10);
});
test('weakening remains dynamic before reflection and is captured when ownership changes',()=>{
 const {arena,a,b,entity}=setup();a.statuses.push({type:'weaken',power:50,until:100,next:100,interval:100});
 assert.equal(arena.prepareCast(a,b,entity.cast).damageMultiplier,.5);
 arena.reflectProjectile(entity,b);a.statuses=[];b.statuses.push({type:'weaken',power:90,until:100,next:100,interval:100});
 assert.equal(arena.prepareCast(b,a,entity.cast).damageMultiplier,.5);
 for(let i=0;i<30;i++)arena.tick();assert.equal(a.hp,a.maxHP-14);
});
test('reflected attached triangle groups mirror offsets around the target',async()=>{
 const {jugglePreset,sequenceState}=await import('../site/shared/hit-sequence.js');const {arena,a,b,entity}=setup();
 const primary={x:10,y:-30,w:40,h:30,shape:'rectangle'};
 entity.cast.a={...entity.cast.a,box:primary,behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3),hitboxGroups:[{id:'group_tip',hitLimit:1,hitInterval:1,boxes:[{...primary,id:'box_tip',shape:'triangle',x:40,w:10,start:0,duration:10}]}]};
 entity.cast.sequence=sequenceState();arena.reflectProjectile(entity,b);
 entity.cast.sequence.attached=true;entity.cast.sequence.contactFrame=0;entity.cast.impact=0;a.x=350;a.y=-40;
 const snapshot=arena.prepareCast(b,a,entity.cast),tip=snapshot.boxes[0];
 assert.equal(snapshot.box.x,330);assert.equal(tip.x,330);assert.equal(tip.facing,-1);assert.equal(tip.y,-70);
 a.x=450;a.y=-60;const moved=arena.prepareCast(b,a,entity.cast).boxes[0];assert.equal(moved.x,430);assert.equal(moved.y,-90);
});
