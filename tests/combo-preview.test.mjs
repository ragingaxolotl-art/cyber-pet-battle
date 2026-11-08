import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {Arena,fighter} from '../site/engine.js';
for(const sequence of [false,true])for(const guard of [false,true])test(`combo preview agrees with runtime (${sequence?'sequence':'ordinary'}, ${guard?'guard':'hit'})`,()=>{
 const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,active:12,cost:0,base:5,coefficient:0,knockback:0,hitstun:5,hitLimit:2,hitInterval:3,contactFeedback:{hitstop:2,blockstop:1}};
 if(sequence)Object.assign(a,{delivery:'area',impactTrigger:'timed',behaviorVersion:2,sequenceTiming:'cast',hitEvents:jugglePreset(3,3)});
 const preview=simulate(a,stats,stats,{distance:35,guard,targetHP:1});
 const target=fighter('Target',stats),owner=fighter('Owner',stats),arena=new Arena(target,owner,[a]);arena.ai=false;arena.paused=false;owner.x=target.x+35;arena.attack(owner,a);
 for(const shot of preview.presentationFrames){arena.tick(new Set(guard?['Shift']:[]));const actual=arena.combos.snapshot().map(({attacker,target,...r})=>r),expected=shot.combos.map(({attacker,target,...r})=>r);assert.deepEqual(actual,expected,`combat frame ${shot.combatFrame}`);}
});
for(const floorSlam of [false,true])test(`launched recovery combo telemetry matches Arena (floor knockdown=${floorSlam})`,()=>{
 const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,active:1,cost:0,base:5,coefficient:0,knockback:0,launchHeight:30,flightFrames:12,hitstun:4,floorSlam};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1});const owner=fighter('Owner',stats),target=fighter('Target',stats),arena=new Arena(owner,target,[a]);arena.ai=false;arena.paused=false;target.x=owner.x+35;arena.attack(owner,a);
 for(const shot of preview.presentationFrames){arena.tick();assert.deepEqual(arena.combos.snapshot().map(({attacker,target,...r})=>r),shot.combos.map(({attacker,target,...r})=>r),`combat frame ${shot.combatFrame}`);}
 assert.equal(preview.combos[0].hits,0);
});
