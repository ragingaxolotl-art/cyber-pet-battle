import test from 'node:test';import assert from 'node:assert/strict';
import {simulate,freshAttack,defaultStats} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
for(const sequence of [false,true])for(const mode of ['break','crush'])test(`guard preview parity sequence=${sequence} mode=${mode}`,()=>{
 const stats=defaultStats(),a={...freshAttack(),startup:0,active:6,recovery:0,cost:0,base:20,coefficient:0,knockback:0,hitstun:0,hitLimit:2,hitInterval:5,guardInteraction:{mode,recoveryFrames:20},contactFeedback:{blockstun:80,hitstop:2,blockstop:3}};
 if(sequence)Object.assign(a,{behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents:jugglePreset(2,5).map(e=>({...e,damage:20,reaction:'none'}))});
 const sim=simulate(a,stats,stats,{guard:true,distance:50,targetHP:1});
 const p=fighter('A',stats),q=fighter('B',stats),arena=new Arena(p,q,[a]);p.x=220;q.x=270;arena.paused=false;arena.ai=false;arena.attack(p,a);
 // Both public clocks include presentation hitstop: compare each combat frame only.
 const expected=[...new Map(sim.frames.map(f=>[f.frame,f])).values()];let index=0;
 while(index<Math.min(18,expected.length)){const before=arena.frame;arena.tick(new Set(),0,new Set(['Shift']));if(arena.frame===before)continue;const f=expected[index++];assert.equal(q.hp,f.target.hp,`HP at ${f.frame}`);assert.equal(q.blockstunUntil,f.target.blockstunUntil||0);}
 assert.equal(q.maxHP-q.hp,mode==='break'?40:32);
 assert.ok(sim.events.some(e=>e.text==='Guard '+mode+'.'));
});
