import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/engine.js';
const stats=defaultStats();
test('blocked preview and Arena retain identical recovery through hitstop and blockstun',()=>{
 const a={...freshAttack(),startup:0,active:1,cost:0,contactFeedback:{blockstop:2,blockstun:3}},preview=simulate(a,stats,stats,{distance:35,guard:true,targetHP:1});
 const defender=fighter('Defender',stats),attacker=fighter('Attacker',stats),arena=new Arena(defender,attacker,[a]);arena.ai=false;arena.paused=false;attacker.x=defender.x+35;arena.attack(attacker,a);
 for(let tick=0;tick<8;tick++){arena.tick(new Set(['Shift']));const shot=preview.presentationFrames[tick];assert.equal(arena.frame-1,shot.combatFrame);assert.equal(defender.blockstunUntil>arena.frame,!shot.target.canAct);}
});
test('scheduled guarded sequence extends lock on each accepted hit and preserves combat offsets',()=>{
 const a={...freshAttack('area'),behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',startup:0,active:4,cost:0,contactFeedback:{blockstop:2,blockstun:3},hitEvents:[0,3].map((offset,i)=>({id:'hit_'+i,offset,duration:1,damage:2,reaction:'none',height:0,knockback:0,frames:1,hold:1,target:'any'}))};
 const s=simulate(a,stats,stats,{distance:35,guard:true});assert.deepEqual(s.hitResults.map(h=>h.frame),[0,3]);assert.equal(s.frames[3].target.blockstunUntil,7);assert.equal(s.frames[6].target.canAct,false);assert.equal(s.frames[7].target.canAct,true);assert.equal(s.presentationFrames.length,s.frames.length+4);
});
