import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate,validateAttack,timing} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
const stats=defaultStats();
for(const delivery of ['melee','area'])for(const facing of [1,-1])for(const missFirst of [false,true])test(`scheduled ${delivery} facing ${facing} opening miss ${missFirst}`,()=>{
 const hitEvents=jugglePreset(3,5).map((e,i)=>({...e,offset:e.offset+3,reaction:'none',hitboxGroup:'group_'+i}));
 const a={...freshAttack(delivery),startup:4,active:14,recovery:2,behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents};
 a.hitboxGroups=hitEvents.map((e,i)=>({id:e.hitboxGroup,hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_'+i,shape:'rectangle',start:e.offset,duration:1,x:missFirst&&i===0?400:a.box.x}]}));
 validateAttack(a);assert.equal(attackVersion(a),10);assert.throws(()=>requireGroupVersion(9,[a]),/version 10/);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1,facing,targetSide:facing});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a],{training:true});p.x=450;o.x=450+50*facing;arena.paused=false;arena.attack(p,a);
 for(let frame=0;frame<35;frame++){arena.tick();assert.equal(o.hp,sim.frames[frame].target.hp,'damage at '+frame);}
 assert.equal(arena.metrics.hits,missFirst?2:3);assert.equal(p.cast,null,'fixed sequence completes without waiting for contact');
 assert.equal(sim.hitResults[1].frame,timing(a,stats).startup+8);assert.equal(sim.hitResults[0].result,missFirst?'Missed':'Connected');
});
for(const delivery of ['melee','area'])for(const facing of [1,-1])test(`scheduled reactions ${delivery} facing ${facing}`,()=>{
 const a={...freshAttack(delivery),startup:0,active:11,recovery:3,cost:0,sequenceTiming:'cast',behaviorVersion:2,impactTrigger:'timed',hitEvents:jugglePreset(3,5),box:{x:0,y:-160,w:160,h:160}};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1,facing,targetSide:facing});const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a],{training:true});p.x=450;o.x=450+50*facing;arena.paused=false;arena.attack(p,a);
 for(let frame=0;frame<60;frame++){
  arena.tick();const expected=sim.frames[frame].target;
  assert.equal(o.hp,expected.hp,'damage at '+frame);assert.ok(Math.abs(o.x-450-expected.x)<1e-6,'x at '+frame);assert.ok(Math.abs(o.y-expected.y)<1e-6,'height at '+frame);
 }
 assert.equal(arena.metrics.hits,3);assert.ok(sim.frames.some(f=>f.target.y<0));
});
