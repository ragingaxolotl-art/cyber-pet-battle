import test from 'node:test';import assert from 'node:assert/strict';
import {scaledHitstun,scaledHitReaction,validateHitstunScaling} from '../site/shared/hitstun-scaling.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
import {attackVersion,requireGroupVersion} from '../site/shared/attack-format.js';
import {Arena,fighter} from '../site/engine.js';
test('hitstun deterioration clamps without increasing an authored shorter stun',()=>{
 const rule={step:2,minimum:3};assert.deepEqual([0,1,2,3,20].map(h=>scaledHitstun(8,h,rule)),[8,6,4,3,3]);assert.equal(scaledHitstun(1,10,rule),1);assert.equal(scaledHitstun(0,10,rule),0);assert.equal(scaledHitstun(8,20),8);
 const a={...freshAttack(),payload:'push',hitstunScaling:rule};assert.equal(scaledHitReaction(a,10),a);
});
test('hitstun rules validate strictly and reject older envelopes',()=>{
 for(const rule of [null,[],{},{step:-1,minimum:0},{step:1.5,minimum:0},{step:1,minimum:121},{step:1,minimum:0,extra:1}])assert.throws(()=>validateHitstunScaling(rule));
 const a={...freshAttack(),hitstunScaling:{step:2,minimum:1}};validateAttack(a);assert.equal(attackVersion(a),15);assert.throws(()=>requireGroupVersion(14,[a]),/version 15/);
});
for(const launch of [false,true])test(`deterioration recovery agrees with preview, motion=${launch}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:0,active:15,cost:0,base:1,coefficient:0,knockback:0,launchHeight:launch?10:0,flightFrames:12,hitstun:8,hitLimit:4,hitInterval:4,hitstunScaling:{step:3,minimum:1},box:{x:0,y:-120,w:160,h:160}};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){arena.tick();assert.equal(o.stun-1,shot.target.stun,`stun at ${shot.frame}`);assert.equal(o.hp,shot.target.hp,`HP at ${shot.frame}`);}
 if(!launch){assert.equal(preview.frames[8].target.stun,10);assert.equal(preview.frames[10].target.canAct,true);assert.equal(preview.frames[12].target.stun,20);}else assert.ok(preview.frames[8].target.stun>=20);
});

for(const reaction of ['none','knockback'])test(`explicit sequence hitstun scales with recovery parity, reaction=${reaction}`,async()=>{
 const {jugglePreset}=await import('../site/shared/hit-sequence.js');const stats={...defaultStats(),speed:0};
 const a={...freshAttack('area'),startup:0,cost:0,behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitstunScaling:{step:3,minimum:1},box:{x:0,y:-120,w:160,h:160},hitEvents:jugglePreset(4,4).map(h=>({...h,damage:1,reaction,height:0,knockback:0,frames:12,hitstun:8}))};
 const preview=simulate(a,stats,stats,{distance:35,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);
 for(const shot of preview.frames){arena.tick();assert.equal(o.stun-1,shot.target.stun,`stun frame ${shot.frame}`);assert.equal(o.hp,shot.target.hp);assert.equal(o.stun<=arena.frame&&!o.pulseMotion&&o.reaction==='standing',shot.target.canAct,`control frame ${shot.frame}`);}
 if(reaction==='none'){assert.equal(preview.frames[10].target.canAct,true);assert.equal(preview.frames[12].target.stun,20);}else assert.equal(preview.frames[10].target.canAct,false);
 const onlyEvent={...a};delete onlyEvent.hitstunScaling;assert.equal(attackVersion(onlyEvent),15);assert.throws(()=>requireGroupVersion(14,[onlyEvent]),/version 15/);
 for(const invalid of [-1,121,1.5,null])assert.throws(()=>validateAttack({...a,hitEvents:a.hitEvents.map(h=>({...h,hitstun:invalid}))}),/hitstun/);
});
