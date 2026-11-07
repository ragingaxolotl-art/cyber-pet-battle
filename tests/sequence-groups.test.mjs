import test from 'node:test';import assert from 'node:assert/strict';import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
const stats=defaultStats();
for(const mode of ['attached','contact'])for(const missing of [false,true])test(`sequence groups ${mode} miss=${missing} preserve per-event geometry`,()=>{
 const hitEvents=jugglePreset().map((e,i)=>({...e,reaction:'none',hitboxGroup:'group_'+i}));
 const a={...freshAttack('projectile'),startup:0,active:21,projectileSpeed:0,behaviorVersion:2,hitEvents,impactTrigger:'contact',projectileMode:mode};
 a.hitboxGroups=hitEvents.map((e,i)=>({id:e.hitboxGroup,hitLimit:1,hitInterval:1,boxes:[0,1].map(j=>({...a.box,shape:'rectangle',id:'box_'+i+'_'+j,start:e.offset,duration:1,x:missing&&i===1?400:a.box.x}))}));validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a],{training:true});p.x=450;o.x=500;arena.paused=false;arena.attack(p,a);
 for(let age=0;age<25;age++){arena.tick();assert.equal(o.hp,sim.frames[age].target.hp,`frame ${age}`);}
 assert.equal(arena.metrics.hits,missing?4:5);assert.equal(arena.metrics.damage,missing?25:28);assert.equal(sim.hitResults[1].result,missing?'Missed':'Connected');
});

// Real launch/suspension/relaunch motion must agree, including a finisher that
// misses when the projectile stays at the original point of contact.
for(const mode of ['attached','contact'])for(const facing of [1,-1])test(`airborne grouped sequence ${mode}, facing ${facing}`,()=>{
 const hitEvents=jugglePreset().map((e,i)=>({...e,hitboxGroup:'group_'+i}));
 const a={...freshAttack('projectile'),startup:0,active:21,projectileSpeed:0,behaviorVersion:2,hitEvents,impactTrigger:'contact',projectileMode:mode};
 a.hitboxGroups=hitEvents.map((e,i)=>({id:e.hitboxGroup,hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_'+i,start:e.offset,duration:1,shape:'rectangle'}]}));validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1,facing,targetSide:facing});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a],{training:true});p.x=450;o.x=450+50*facing;arena.paused=false;arena.attack(p,a);
 let airborne=false;
 for(let age=0;age<60;age++){
  arena.tick();const expected=sim.frames[age].target;airborne ||= expected.y<0;
  assert.equal(o.hp,expected.hp,`HP at ${age}`);
  assert.ok(Math.abs(o.x-450-expected.x)<1e-6,`horizontal motion at ${age}`);
  assert.ok(Math.abs(o.y-expected.y)<1e-6,`vertical motion at ${age}`);
 }
 assert.ok(airborne);assert.equal(arena.metrics.hits,mode==='attached'?5:4);assert.equal(arena.metrics.damage,mode==='attached'?28:16);
 assert.equal(sim.hitResults.at(-1).result,mode==='attached'?'Connected':'Missed');
 if(mode==='contact')assert.equal(sim.hitResults.at(-1).reason,'No eligible contact during this hit window.');
});
