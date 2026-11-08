import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';import {Arena,fighter} from '../site/engine.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
for(const sequence of [false,true])for(const at of [2,12])test(`air recovery preview parity: sequence=${sequence}, attempt=${at}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,cost:0,hitstun:5,launchHeight:50,flightFrames:40,knockback:0,hitLimit:1};
 if(sequence)Object.assign(a,{behaviorVersion:2,delivery:'area',sequenceTiming:'cast',impactTrigger:'timed',hitEvents:jugglePreset(1,5).map(h=>({...h,reaction:'launch',height:50,knockback:0,frames:40,hitstun:5}))});
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1,recoveryFrame:at}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){arena.tick();if(shot.frame===at){const reason=arena.airRecover(o);assert.equal(reason,preview.recovery.reason);}assert.ok(Math.abs(o.y-shot.target.y)<1e-8,`height ${shot.frame}: ${o.y}/${shot.target.y}`);assert.equal(o.hp,shot.target.hp);}
 assert.equal(preview.recovery.recovered,at===12);
});
