import test from 'node:test';import assert from 'node:assert/strict';
import {scaledComboDamage,validateComboScaling} from '../site/shared/combo-scaling.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/engine.js';
test('scaling arithmetic retains the first hit and clamps at the authored floor',()=>{
 const rule={step:25,minimum:20};assert.deepEqual([0,1,2,3,4,20].map(h=>scaledComboDamage(20,h,rule)),[20,15,10,5,4,4]);
 assert.equal(scaledComboDamage(7,1,{step:50,minimum:0}),4);assert.equal(scaledComboDamage(20,10,rule,'block'),20);assert.equal(scaledComboDamage(20,10,rule,'armor'),20);assert.equal(scaledComboDamage(20,10),20);
});
test('malformed rules and old format envelopes are rejected',()=>{
 for(const value of [null,[],{}, {step:10},{step:10,minimum:20,extra:1},{step:-1,minimum:20},{step:1.5,minimum:20},{step:10,minimum:101}])assert.throws(()=>validateComboScaling(value));
 const a={...freshAttack(),comboScaling:{step:10,minimum:20}};validateAttack(a);assert.equal(attackVersion(a),13);assert.throws(()=>requireGroupVersion(12,[a]),/version 13/);requireGroupVersion(13,[a]);
});
for(const interval of [3,5])test(`scaled repeated attack agrees with preview at interval ${interval}`,()=>{
 const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,active:12,cost:0,base:20,coefficient:0,knockback:0,hitstun:5,hitLimit:3,hitInterval:interval,comboScaling:{step:25,minimum:20}};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){arena.tick();assert.equal(o.hp,shot.target.hp,`frame ${shot.frame}`);}
 assert.equal(o.maxHP-o.hp,interval===3?45:60);
});
test('same-frame hit groups use prior-frame counts rather than contact iteration order',async()=>{
 const {ComboTracker}=await import('../site/shared/combo-tracker.js');const t=new ComboTracker(),a={},b={};t.contact(a,b,'hit',20);t.beginFrame(2,new Map([[b,{locked:true}]]));const rule={step:25,minimum:20};
 const damage=[];for(let i=0;i<2;i++){damage.push(scaledComboDamage(20,t.priorHits(a,b),rule));t.contact(a,b,'hit',damage.at(-1));}
 assert.deepEqual(damage,[15,15]);t.beginFrame(3,new Map([[b,{locked:true}]]));assert.equal(scaledComboDamage(20,t.priorHits(a,b),rule),5);
});
test('a scaled automatic follow-up counts the previous cast’s hit',()=>{
 const stats={...defaultStats(),speed:0},p=fighter('A',stats),o=fighter('B',stats);
 const next={...freshAttack(),startup:0,active:1,cost:0,base:20,coefficient:0,knockback:0,hitstun:8,comboScaling:{step:25,minimum:20}};
 const first={...next,id:'attack_first',active:2,cancelWindows:[{id:'cancel_scale',start:0,duration:5,condition:'hit',attacks:[next.id],automatic:true}]};delete first.comboScaling;
 const arena=new Arena(p,o,[first,next]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,first);arena.tick();assert.equal(p.cast.a.id,next.id);arena.tick();assert.equal(o.maxHP-o.hp,35);
});
test('scheduled sequence scaling agrees with runtime damage on every frame',async()=>{
 const {jugglePreset}=await import('../site/shared/hit-sequence.js');const stats={...defaultStats(),speed:0};
 const a={...freshAttack('area'),startup:0,cost:0,impactTrigger:'timed',behaviorVersion:2,sequenceTiming:'cast',comboScaling:{step:25,minimum:20},hitEvents:jugglePreset(3,3).map(h=>({...h,damage:20}))};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){arena.tick();assert.equal(o.hp,shot.target.hp,`frame ${shot.frame}`);}assert.equal(o.maxHP-o.hp,45);
});
