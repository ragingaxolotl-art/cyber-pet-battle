import test from 'node:test';import assert from 'node:assert/strict';
import {counterHitDamage,validateCounterHit} from '../site/shared/counter-hit.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {freshAttack,defaultStats,validateAttack} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/engine.js';
const rule={phases:['startup','active'],damagePercent:150};
test('counter-hit rules exclude guard, armor, idle, recovery and support; round once',()=>{
 assert.equal(counterHitDamage(7,rule,'startup',true),11);
 for(const phase of ['idle','recovery'])assert.equal(counterHitDamage(20,rule,phase,true),20);
 for(const outcome of ['block','armor'])assert.equal(counterHitDamage(20,rule,'active',true,outcome),20);
 assert.equal(counterHitDamage(20,rule,'active',false),20);assert.equal(counterHitDamage(20,undefined,'active',true),20);
 assert.equal(counterHitDamage(20,{...rule,phases:['recovery']},'recovery',true),30);
});
test('counter-hit validation requires bounded explicit settings and format14',()=>{
 for(const value of [null,[],{}, {...rule,damagePercent:99},{...rule,damagePercent:301},{...rule,damagePercent:100.5},{...rule,phases:[]},{...rule,phases:['idle']},{...rule,phases:['active','active']},{...rule,extra:true}])assert.throws(()=>validateCounterHit(value));
 const a={...freshAttack(),counterHit:rule};validateAttack(a);assert.equal(attackVersion(a),14);assert.throws(()=>requireGroupVersion(13,[a]),/version 14/);requireGroupVersion(14,[a]);
});
for(const reverse of [false,true])test(`counter-hit trade uses both captured phases, reverse=${reverse}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,active:4,cost:0,knockback:0,hitstun:8,base:20,coefficient:0,counterHit:rule};
 const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;
 arena.attack(p,a);arena.attack(o,a);arena.frame=1;
 const pending=[arena.prepare(p,o),arena.prepare(o,p)];if(reverse)pending.reverse();
 for(const hit of pending)arena.resolve(hit.f,hit.target,hit);
 assert.equal(p.maxHP-p.hp,30);assert.equal(o.maxHP-o.hp,30);assert.ok(arena.contactFeedback.every(c=>c.counterHit));
});
test('counter-hit bonus precedes combo scaling and shields',()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,active:4,cost:0,knockback:0,hitstun:8,base:20,coefficient:0,counterHit:rule,comboScaling:{step:50,minimum:0}};
 const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;
 arena.attack(p,a);arena.attack(o,a);arena.frame=1;o.shield=4;
 arena.combos.contact(p,o,'hit',20);arena.combos.beginFrame(1,new Map([[o,{locked:true}]]));
 arena.resolve(p,o,arena.prepare(p,o));assert.equal(o.maxHP-o.hp,11);assert.equal(o.shield,0);
});
test('scheduled sequence receives counter-hit damage from the captured defender phase',async()=>{
 const {jugglePreset}=await import('../site/shared/hit-sequence.js');
 const stats={...defaultStats(),speed:0},a={...freshAttack('area'),startup:0,cost:0,impactTrigger:'timed',behaviorVersion:2,sequenceTiming:'cast',counterHit:rule,hitEvents:jugglePreset(1,3).map(h=>({...h,damage:20}))};
 const defense={...freshAttack(),startup:20,cost:0};
 const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a,defense]);arena.ai=false;arena.paused=false;o.x=p.x+35;
 arena.attack(p,a);arena.attack(o,defense);arena.frame=1;arena.resolve(p,o,arena.prepare(p,o));
 assert.equal(o.maxHP-o.hp,30);assert.equal(arena.contactFeedback[0].counterHit,true);
});
