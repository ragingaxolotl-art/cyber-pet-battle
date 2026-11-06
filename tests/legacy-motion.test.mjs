import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {beginReaction,advanceReaction} from '../site/reactions.js';
const stats=defaultStats();
for(const pushAxis of ['x','y','both'])for(const flightFrames of [12,36,90])for(const direction of [-1,1])test(`legacy displacement parity ${pushAxis}/${flightFrames}/${direction}`,()=>{
 const a={...freshAttack(),startup:0,active:1,knockback:100,launchHeight:70,flightFrames,pushAxis};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1,facing:direction,targetSide:direction});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=450+direction*50;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<=flightFrames;age++){arena.tick();assert.ok(Math.abs(o.x-450-sim.frames[age].target.x)<1e-8,`x at ${age}`);assert.ok(Math.abs(o.y-sim.frames[age].target.y)<1e-8,`y at ${age}`);}
});
test('walls and floor knockdowns require authored flags',()=>{
 for(const enabled of [false,true]){const f=fighter('F',stats);f.x=900;const a={...freshAttack(),knockback:100,launchHeight:50,flightFrames:12,wallSlam:enabled,floorSlam:enabled};const events=[];beginReaction(f,a,1,0);for(let frame=1;frame<=12;frame++)advanceReaction(f,frame,name=>events.push(name));assert.equal(f.x,925);assert.equal(f.y,0);assert.equal(events.includes('WALL HIT'),enabled);assert.equal(events.includes('KNOCKDOWN'),enabled);}
});
test('a subsequent hit starts its trajectory at current airborne coordinates',()=>{
 const f=fighter('F',stats),a={...freshAttack(),knockback:60,launchHeight:40,flightFrames:20};beginReaction(f,a,1,0);advanceReaction(f,10,()=>{});const x=f.x,y=f.y;beginReaction(f,{...a,pushAxis:'y'},-1,10);advanceReaction(f,20,()=>{});assert.equal(f.x,x);assert.equal(f.y,y*.5-40);
});

for(const floorSlam of [false,true])for(const hitstun of [0,80])test(`recovery eligibility matches preview floor=${floorSlam} stun=${hitstun}`,()=>{
 const a={...freshAttack(),startup:0,active:1,knockback:10,launchHeight:40,flightFrames:12,floorSlam,hitstun};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=500;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<sim.frames.length;age++){arena.tick();assert.equal(o.reaction==='standing'&&o.stun<=arena.frame,sim.frames[age].target.canAct,`eligibility at ${age}`);}
});

for(const direction of [-1,1])test(`wall travel and recovery agree in aligned stages ${direction}`,()=>{
 const a={...freshAttack(),startup:0,active:1,base:1,coefficient:0,box:{x:0,y:-80,w:220,h:80},knockback:100,launchHeight:40,flightFrames:24,wallSlam:true,hitstun:0};
 const sim=simulate(a,stats,stats,{distance:190,facing:direction,targetSide:direction,targetHP:1});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=direction===1?705:255;o.x=p.x+direction*190;const origin=p.x;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<sim.frames.length;age++){arena.tick();const target=sim.frames[age].target;assert.ok(Math.abs(o.x-origin-target.x)<1e-8,`wall x ${age}`);assert.ok(Math.abs(o.y-target.y)<1e-8,`wall y ${age}`);assert.equal(o.reaction==='standing'&&o.stun<=arena.frame,target.canAct,`wall eligibility ${age}`);}
});
for(const floorSlam of [false,true])test(`repeated airborne contacts preserve recovery parity floor=${floorSlam}`,()=>{
 const a={...freshAttack(),startup:0,active:21,hitLimit:5,hitInterval:5,base:1,coefficient:0,box:{x:0,y:-400,w:400,h:400},knockback:5,launchHeight:30,flightFrames:24,floorSlam,hitstun:0};
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1}),p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a]);p.x=450;o.x=500;arena.paused=false;arena.ai=false;arena.attack(p,a);
 for(let age=0;age<sim.frames.length;age++){arena.tick();const target=sim.frames[age].target;assert.equal(o.hp,target.hp,`HP ${age}`);assert.ok(Math.abs(o.y-target.y)<1e-8,`height ${age}`);assert.equal(o.reaction==='standing'&&o.stun<=arena.frame,target.canAct,`eligibility ${age}`);}
 assert.equal(o.maxHP-o.hp,5);
});
