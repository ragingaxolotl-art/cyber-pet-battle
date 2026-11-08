import test from 'node:test';import assert from 'node:assert/strict';
import {fighter,Arena} from '../site/engine.js';import {beginReaction,advanceReaction} from '../site/reactions.js';
import {applyPulseReaction,jugglePreset} from '../site/shared/hit-sequence.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
for(const first of ['legacy','sequence'])test('mixed reactions share budget starting with '+first,()=>{
 const target=fighter('Target',defaultStats()),a={...freshAttack(),launchHeight:20};target.y=-20;
 for(let i=0;i<10;i++){
  if((i%2===0)===(first==='legacy'))beginReaction(target,a,1,i);else applyPulseReaction(target,jugglePreset()[0],1,i);
  assert.equal(target.juggleHits,i+1);
 }
 assert.equal(target.juggleLocked,true);const motion=target.pulseMotion||target.legacyMotion;
 beginReaction(target,a,1,11);assert.equal(target.pulseMotion||target.legacyMotion,motion);
});
test('ordinary multi-hit launcher uses the same budget and trajectory in preview and Arena',()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,active:10,hitLimit:10,hitInterval:1,launchHeight:5,knockback:0,flightFrames:36,base:1,coefficient:0,cost:0};
 const preview=simulate(a,stats,stats,{distance:50,targetHP:1});const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;arena.attack(p,a);
 for(let i=0;i<30;i++){arena.tick();assert.ok(Math.abs(o.y-preview.frames[i].target.y)<1e-8,'height '+i);assert.equal(o.juggleHits||0,preview.frames[i].target.juggleHits||0,'budget '+i);}
 assert.equal(preview.frames[9].target.juggleLocked,true);assert.equal(o.juggleLocked,false);assert.equal(o.hp,o.maxHP-10);
});
test('grounded flinch and parry interruption do not spend the airborne budget',()=>{
 const target=fighter('Target',defaultStats());beginReaction(target,freshAttack(),1,0);assert.equal(target.juggleHits,0);
 target.y=-20;beginReaction(target,freshAttack(),1,1,false);assert.equal(target.juggleHits,0);
});
for(const defense of ['guard','armor','invulnerability'])for(const sequence of [false,true])test(`${defense} prevents spending juggle budget for ${sequence?'sequence':'ordinary'} contact`,()=>{
 const stats={...defaultStats(),speed:0},p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;Object.assign(o,{x:500,y:-10,juggleHits:4});
 const protect={...freshAttack(),startup:20,active:20,cost:0};
 if(defense==='guard')Object.assign(protect,{startup:0,payload:'block',delivery:'self'});
 else protect.defenseWindows=[{id:'defense_budget',kind:defense,start:0,duration:20,against:'all',...(defense==='armor'?{hits:2}:{})}];
 const hit={...freshAttack(),startup:0,active:1,cost:0,launchHeight:20,base:1,coefficient:0};
 if(sequence)Object.assign(hit,{delivery:'projectile',projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(2,2)});
 arena.attack(o,protect);arena.attack(p,hit);arena.tick();assert.equal(o.juggleHits,4);assert.equal(o.juggleLocked||false,false);
});
test('automatic successive casts preserve the target airborne budget',()=>{
 const stats={...defaultStats(),speed:0},p=fighter('A',stats),o=fighter('B',stats);
 const second={...freshAttack(),startup:0,active:1,cost:0,launchHeight:20,knockback:0,base:1,coefficient:0};
 const first={...second,id:'attack_first',cancelWindows:[{id:'cancel_chain',start:0,duration:2,condition:'hit',automatic:true,attacks:[second.id]}]};
 const arena=new Arena(p,o,[first,second]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;arena.attack(p,first);
 arena.tick();assert.equal(o.juggleHits,1);assert.equal(p.cast.a.id,second.id);
 arena.tick();assert.equal(o.juggleHits,2);assert.equal(o.hp,o.maxHP-2);
});
