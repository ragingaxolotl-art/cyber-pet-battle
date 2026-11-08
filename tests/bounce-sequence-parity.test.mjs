import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
for(const wall of [false,true])for(const duration of [10,120])test(`sequence bounce Arena/preview parity wall=${wall} duration=${duration}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,cost:0,delivery:'area',sequenceTiming:'cast',behaviorVersion:2,impactTrigger:'timed',box:{x:0,y:-60,w:200,h:60,shape:'rectangle'},hitEvents:jugglePreset(1).map(e=>({...e,reaction:'launch',height:30,frames:10,knockback:wall?150:0,bounces:{floor:{height:25,distance:10,frames:duration},...(wall?{wall:{height:20,distance:30,frames:duration}}:{})}}))};
 const preview=simulate(a,stats,stats,{distance:100,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);p.x=705;o.x=805;arena.ai=false;arena.paused=false;arena.attack(p,a);
 let rebounds=0;
 for(const shot of preview.frames){arena.tick();assert.equal(o.hp,shot.target.hp);assert.ok(Math.abs(o.x-705-shot.target.x)<1e-8,`x frame ${shot.frame}`);assert.ok(Math.abs(o.y-shot.target.y)<1e-8,`y frame ${shot.frame}`);if(shot.target.reactionBounceFrame===shot.frame)rebounds++;}
 assert.equal(rebounds,wall?2:1);assert.equal(o.y,0);assert.equal(o.pulseMotion,null);
});
