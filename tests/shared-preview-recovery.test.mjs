import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
const stats={...defaultStats(),speed:0};
for(const facing of [-1,1])test(`authored suspension falls into the same knockdown and recovery facing ${facing}`,()=>{
 const first={id:'hit_launch',offset:0,duration:1,damage:10,reaction:'launch',height:40,knockback:10,frames:24,hold:5,target:'any'};
 const move={...freshAttack(),impactTrigger:'timed',cost:0,startup:1,active:6,recovery:1,status:'none',behaviorVersion:2,sequenceTiming:'cast',box:{x:0,y:-200,w:230,h:220},hitEvents:[first,{...first,id:'hit_suspend',offset:5,damage:3,reaction:'suspend'}]};
 const sim=simulate(move,stats,stats,{distance:60,facing,targetSide:facing,targetHP:1});
 const p=fighter('P',stats),q=fighter('Q',stats),arena=new Arena(p,q,[move]);p.x=450;q.x=450+60*facing;arena.ai=false;arena.paused=false;arena.attack(p,move);
 const phases=new Set();
 for(let frame=0;frame<100;frame++){
  arena.tick();const expected=sim.frames[frame].target;phases.add(expected.reaction);
  assert.equal(expected.reaction??'standing',q.reaction,`reaction frame ${frame}`);
  assert.equal(expected.canAct,q.reaction==='standing'&&!q.pulseMotion&&q.stun<=arena.frame,`action readiness frame ${frame}`);
  assert.equal(expected.hp,q.hp);assert.ok(Math.abs(expected.y-q.y)<1e-8);assert.ok(Math.abs(expected.x-(q.x-450))<1e-8);
 }
 assert.ok(phases.has('down'));assert.ok(phases.has('getting_up'));assert.equal(sim.frames[21].target.reaction,'down');assert.equal(sim.frames[83].target.reaction,'standing');
 assert.equal(sim.frames[82].target.canAct,false);assert.equal(sim.frames[83].target.canAct,true);
 assert.ok(sim.events.some(e=>e.frame===21&&e.text==='KNOCKDOWN'));
});
