import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
for(const wall of [false,true])for(const duration of [10,120])test(`ordinary bounce parity wall=${wall}, duration=${duration}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,cost:0,hitstun:3,launchHeight:30,flightFrames:10,knockback:wall?150:0,hitLimit:1,box:{x:0,y:-60,w:200,h:60,shape:'rectangle'},bounces:{floor:{height:25,distance:10,frames:duration},...(wall?{wall:{height:20,distance:30,frames:duration}}:{})}};
 const preview=simulate(a,stats,stats,{distance:100,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);p.x=705;o.x=805;arena.ai=false;arena.paused=false;arena.attack(p,a);
 let rebounds=0;
 for(const shot of preview.frames){arena.tick();assert.equal(o.hp,shot.target.hp);if(shot.target.pulseMotion)assert.equal(o.reaction,'airborne',`bounce stance frame ${shot.frame}`);assert.ok(Math.abs(o.x-705-shot.target.x)<1e-8,`x frame ${shot.frame}`);assert.ok(Math.abs(o.y-shot.target.y)<1e-8,`y frame ${shot.frame}`);if(shot.target.reactionBounceFrame===shot.frame)rebounds++;}
 assert.equal(rebounds,wall?2:1);assert.equal(preview.events.filter(e=>/^(Wall|Floor) bounce$/.test(e.text)).length,rebounds);assert.ok(o.y===0);assert.equal(o.pulseMotion,null);assert.equal(preview.frames.at(-1).target.pulseMotion,null);
});

import {compareAttacks} from '../site/matchup.js';
test('comparison reports one rebound without additional damage or pause duplicates',()=>{
 const a={...freshAttack(),startup:0,cost:0,hitstun:3,launchHeight:40,flightFrames:12,knockback:0,hitLimit:1,bounces:{floor:{height:45,distance:30,frames:24}},contactFeedback:{hitstop:10,blockstop:0,blockstun:0}};
 const b={...freshAttack(),startup:100,cost:0};const result=compareAttacks(a,b,{distance:35,frames:80});
 const rows=result.rows.filter(r=>r.event.startsWith('Floor bounce'));assert.equal(rows.length,1);assert.equal(rows[0].frame,22);assert.equal(rows[0].actor,'B');
});
