import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {beginReaction} from '../site/reactions.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';

function setup(training=false){
 const stats={...defaultStats(),speed:0},owner=fighter('Owner',stats),target=fighter('Target',stats);
 const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,cost:0,base:7,coefficient:0,projectileSpeed:20,impactTrigger:'contact',knockback:0};
 const arena=new Arena(owner,target,[attack],{training});arena.ai=false;arena.paused=false;owner.x=450;
 arena.attack(owner,attack);arena.tick();
 return {arena,owner,target,attack};
}
test('launched projectile survives owner interruption and expires after its hit',()=>{
 const {arena,owner,target}=setup();arena.launchProjectile(owner,30);
 beginReaction(owner,{...freshAttack(),knockback:0,hitstun:20},-1,arena.frame);
 assert.equal(owner.cast,null);
 for(let i=0;i<20;i++)arena.tick();
 assert.equal(target.hp,target.maxHP-7);assert.equal(arena.projectiles.entries.length,0);
});
test('owner finishes recovery and starts another move while projectile travels',()=>{
 const {arena,owner,target}=setup();arena.launchProjectile(owner,30);arena.tick();
 assert.equal(owner.cast,null);
 const next={...freshAttack(),startup:40,cost:0};assert.equal(arena.attack(owner,next),true);const action=owner.cast;
 for(let i=0;i<15;i++)arena.tick();
 assert.equal(target.hp,target.maxHP-7);assert.equal(owner.cast,action);
});
test('explicit expiry stops misses and paused simulation does not age entities',()=>{
 const {arena,owner,target}=setup();const entity=arena.launchProjectile(owner,2);
 arena.paused=true;for(let i=0;i<5;i++)arena.tick();assert.equal(arena.frame,entity.spawnFrame);
 arena.paused=false;arena.tick();assert.equal(arena.projectiles.entries.length,1);
 arena.tick();assert.equal(arena.projectiles.entries.length,0);assert.equal(target.hp,target.maxHP);
});
test('dummy reset clears every independent projectile and owner action',()=>{
 const {arena,owner}=setup(true);arena.launchProjectile(owner,30);arena.resetDummy();
 assert.equal(arena.projectiles.entries.length,0);assert.equal(owner.cast,null);
});
for(const defeated of ['owner','target'])test('defeated '+defeated+' retires the projectile',()=>{
 const state=setup();state.arena.launchProjectile(state.owner,30);state[defeated].hp=0;state.arena.tick();
 assert.equal(state.arena.projectiles.entries.length,0);
});
test('launch validation cannot duplicate a cast or accept unbounded lifetime',()=>{
 const {arena,owner}=setup();for(const value of [0,601,Infinity,1.5])assert.throws(()=>arena.launchProjectile(owner,value),/lifetime/);
 arena.launchProjectile(owner,30);assert.throws(()=>arena.launchProjectile(owner,30),/already launched/);
});
test('startup interruption prevents a projectile from launching',()=>{
 const {arena,owner}=setup();owner.cast=null;arena.attack(owner,{...freshAttack('projectile'),startup:20,cost:0});
 assert.throws(()=>arena.launchProjectile(owner,30),/startup/);
 beginReaction(owner,freshAttack(),-1,arena.frame);assert.throws(()=>arena.launchProjectile(owner,30),/projectile cast/);
});
test('opposing independent projectiles resolve simultaneous lethal contacts as a draw',()=>{
 const {arena,owner,target,attack}=setup();owner.cast=null;target.x=500;
 const lethal={...attack,id:"independent_lethal",active:10,projectileSpeed:0,base:500};
 arena.attack(owner,lethal);arena.attack(target,lethal);arena.frame++;
 arena.launchProjectile(owner,30);arena.launchProjectile(target,30);arena.tick();
 assert.equal(owner.hp,0);assert.equal(target.hp,0);assert.equal(arena.winner,'Draw');assert.equal(arena.projectiles.entries.length,0);
});
test('parry destroys the independent projectile without interrupting its owner new move',()=>{
 const {arena,owner,target}=setup();arena.launchProjectile(owner,30);arena.tick();
 const next={...freshAttack(),startup:40,cost:0};arena.attack(owner,next);const action=owner.cast;
 const parry={...freshAttack(),delivery:'self',payload:'block',startup:40,cost:0,defenseWindows:[{id:'parry_projectile',kind:'parry',start:0,duration:40,against:'all',stun:20}]};
 assert.equal(arena.attack(target,parry),true);
 for(let i=0;i<15;i++)arena.tick();
 assert.equal(target.hp,target.maxHP);assert.equal(owner.cast,action);assert.equal(owner.stun,0);assert.equal(arena.projectiles.entries.length,0);
 assert.equal(target.cast.outcomes.has('parry'),true);
});
test('owner spawn cap bounds concurrent entities without deleting existing ones',()=>{
 const {arena,owner,attack}=setup();
 for(let i=0;i<16;i++){
  owner.cast=null;assert.equal(arena.attack(owner,{...attack,id:'limited_'+i}),true);arena.frame++;
  arena.launchProjectile(owner,100);
 }
 owner.cast=null;arena.attack(owner,{...attack,id:'over_limit'});arena.frame++;
 assert.throws(()=>arena.launchProjectile(owner,100),/limit reached/);assert.equal(arena.projectiles.entries.length,16);
 assert.equal(owner.cast.projectileLaunched,undefined);
});
test('existing cast-owned projectiles still end when the attacker is interrupted',()=>{
 const {arena,owner,target}=setup();
 beginReaction(owner,{...freshAttack(),knockback:0,hitstun:20},-1,arena.frame);
 for(let i=0;i<20;i++)arena.tick();
 assert.equal(target.hp,target.maxHP);assert.equal(arena.projectiles.entries.length,0);
});
test('attached multi-hit entity retains its sequence after owner interruption',async()=>{
 const {jugglePreset}=await import('../site/shared/hit-sequence.js');
 const {arena,owner,target,attack}=setup();owner.cast=null;
 const sequence={...attack,id:'independent_sequence',behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3)};
 assert.equal(arena.attack(owner,sequence),true);arena.tick();arena.launchProjectile(owner,60);
 beginReaction(owner,{...freshAttack(),knockback:0,hitstun:20},-1,arena.frame);
 for(let i=0;i<40;i++)arena.tick();
 assert.equal(arena.lastSequence.results.filter(r=>r.result==='Connected').length,3);
 assert.equal(target.hp,target.maxHP-sequence.hitEvents.reduce((sum,event)=>sum+event.damage,0));
 assert.equal(arena.projectiles.entries.length,0);
});
for(const sequence of [false,true])for(const interruptFrame of [2,6])test(`automatic ${sequence?'sequence':'ordinary'} launch agrees with preview for interruption at ${interruptFrame}`,async()=>{
 const {simulate}=await import('../site/shared/combat-model.js');const {jugglePreset}=await import('../site/shared/hit-sequence.js');
 const stats={...defaultStats(),speed:0},owner=fighter('Owner',stats),target=fighter('Target',stats);
 const attack={...freshAttack('projectile'),startup:5,active:1,recovery:2,cost:0,base:7,coefficient:0,projectileSpeed:12,impactTrigger:'contact',knockback:0,projectileLifetime:60};
 if(sequence)Object.assign(attack,{behaviorVersion:2,projectileMode:'attached',hitEvents:jugglePreset(3,3)});
 const preview=simulate(attack,stats,stats,{distance:200,incomingDamage:1,incomingFrame:interruptFrame,targetHP:1});
 const arena=new Arena(owner,target,[attack]);arena.ai=false;arena.paused=false;owner.x=450;target.x=650;arena.attack(owner,attack);const cast=owner.cast;
 for(let frame=0;frame<100;frame++){
  arena.tick();
  if(frame===interruptFrame){owner.hp--;beginReaction(owner,{...freshAttack(),knockback:0,hitstun:20},-1,arena.frame);}
 }
 assert.equal(cast.hits,preview.frames.at(-1).hits);assert.equal(target.hp,preview.frames.at(-1).target.hp);assert.equal(arena.projectiles.entries.length,0);
});
