import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
const move=(patch={})=>({...freshAttack('projectile'),startup:0,active:100,recovery:0,cost:0,base:7,coefficient:0,knockback:0,hitstun:0,projectileSpeed:3,projectileLifetime:100,impactTrigger:'contact',projectileFlight:{angle:0,acceleration:0,gravity:0,range:100},...patch});
function setup(attack=move(),distance=300){const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[attack]);arena.ai=false;arena.paused=false;a.x=300;b.x=a.x+distance;arena.attack(a,attack);return {arena,a,b,stats};}
test('flight translates collision geometry and expires at path range',()=>{
 const {arena,b}=setup(move({projectileFlight:{angle:0,acceleration:.5,gravity:.25,range:10}}));arena.tick();const p=arena.projectiles.entries[0],initial=arena.prepareCast(p.owner,p.target,p.cast).box;
 arena.tick();const next=arena.prepareCast(p.owner,p.target,p.cast).box;assert.equal(next.x-initial.x,3.5);assert.equal(next.y-initial.y,.25);
 for(let i=0;i<5;i++)arena.tick();assert.equal(arena.projectiles.entries.length,0);assert.equal(b.hp,b.maxHP);assert.ok(arena.events.some(e=>e.text==='PROJECTILE RANGE'));
});
test('range endpoint can connect before retirement',()=>{
 const attack=move({box:{x:0,y:-40,w:2,h:2},projectileFlight:{angle:0,acceleration:0,gravity:0,range:10}}),{arena,b}=setup(attack,25);
 for(let i=0;i<8;i++)arena.tick();assert.equal(b.maxHP-b.hp,7);assert.equal(arena.projectiles.entries.length,0);
});
test('pause and hitstop leave flight position and spent range unchanged',()=>{
 const {arena}=setup();arena.tick();const p=arena.projectiles.entries[0];arena.paused=true;const before=structuredClone(p.cast.flight);arena.tick();assert.deepEqual(p.cast.flight,before);arena.paused=false;arena.hitstopRemaining=2;arena.tick();arena.tick();assert.deepEqual(p.cast.flight,before);arena.tick();assert.ok(p.cast.flight.distance>before.distance);
});
test('reflection reverses flight without renewing lifetime or range',()=>{
 const {arena,b}=setup();arena.tick();arena.tick();const p=arena.projectiles.entries[0],before=structuredClone(p.cast.flight),expires=p.expires;arena.reflectProjectile(p,b);assert.equal(p.cast.flight.distance,before.distance);assert.equal(p.expires,expires);arena.tick();assert.ok(p.cast.flight.x<before.x);assert.equal(p.cast.flight.distance,before.distance+3);
});
test('split uses ballistic heading and gives children their authored straight rays',()=>{
 const {arena}=setup(move({projectileFlight:{angle:-45,acceleration:0,gravity:0,range:100},projectileSplit:{afterFrames:2,count:3,spread:20,speed:3,lifetime:20}}));for(let i=0;i<3;i++)arena.tick();assert.equal(arena.projectiles.entries.length,3);for(const p of arena.projectiles.entries){assert.equal(p.cast.a.projectileFlight,undefined);assert.ok(p.cast.splitRay.vy<0);}
});
test('Studio ballistic preview matches Arena health and projectile boxes frame by frame',()=>{
 const attack=move({projectileFlight:{angle:-10,acceleration:.1,gravity:.1,range:150}}),stats={...defaultStats(),speed:0};
 const preview=simulate(attack,stats,stats,{distance:120,facing:1,targetSide:1,selfHP:1,targetHP:1,energy:1});const {arena,a,b}=setup(attack,120);a.x=480;a.cast.x=480;b.x=600;
 for(const shot of preview.frames.slice(0,100)){arena.tick();assert.equal(shot.target.hp,b.hp);const p=arena.projectiles.entries[0];assert.equal(shot.projectiles.length,arena.projectiles.entries.length);if(p){const box=arena.prepareCast(p.owner,p.target,p.cast).box;assert.equal(shot.projectiles[0].box.x,box.x-480);assert.equal(shot.projectiles[0].box.y,box.y);}}
});
test('grouped collision boxes preserve offsets while following ballistic travel',()=>{
 const attack=move({impactTrigger:'timed',hitboxGroups:[{id:'group_one',hitLimit:1,hitInterval:1,boxes:[{id:'box_one',x:10,y:-40,w:10,h:10,shape:'rectangle',rotation:30,start:0,duration:100},{id:'box_two',x:30,y:-20,w:10,h:10,shape:'ellipse',start:0,duration:100}]}],projectileFlight:{angle:0,acceleration:0,gravity:.5,range:100}});
 const {arena}=setup(attack);arena.tick();const p=arena.projectiles.entries[0],before=arena.prepareCast(p.owner,p.target,p.cast).boxes;arena.tick();const after=arena.prepareCast(p.owner,p.target,p.cast).boxes;assert.equal(after.length,2);for(let i=0;i<2;i++){assert.equal(after[i].x-before[i].x,3);assert.equal(after[i].y-before[i].y,.5);}assert.equal(after[0].rotation,30);
});
test('attached sequence stops spending ballistic range and follows its target',()=>{
 const events=[0,5].map((offset,i)=>({id:'hit_'+i,offset,duration:1,damage:3,reaction:'none',height:0,knockback:0,frames:1,hold:1,target:'any'}));
 const attack=move({behaviorVersion:2,projectileMode:'attached',hitEvents:events}),{arena,b}=setup(attack,60);arena.tick();const p=arena.projectiles.entries[0];assert.equal(p.cast.sequence.attached,true);const distance=p.cast.flight.distance;b.x+=20;arena.tick();assert.equal(p.cast.flight.distance,distance);const box=arena.prepareCast(p.owner,p.target,p.cast).box;assert.equal(box.x,b.x-box.w/2);
 for(let i=0;i<5;i++)arena.tick();assert.equal(b.maxHP-b.hp,6);
});
