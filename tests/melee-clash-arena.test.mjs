import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(priorities=[2,2],extra={}){
 const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',stats);
 const attacks=priorities.map((priority,i)=>({...freshAttack('melee'),id:'clash_'+i,delivery:'melee',payload:'damage',startup:0,active:10,recovery:5,cooldown:0,impactTrigger:'timed',cost:0,base:7,coefficient:0,knockback:0,hitLimit:1,hitInterval:1,box:{x:0,y:-60,w:100,h:60,shape:'rectangle'},...(priority===undefined?{}:{meleeClash:{priority}}),...extra}));
 const arena=new Arena(a,b,attacks);arena.ai=false;arena.paused=false;a.x=450;b.x=500;
 assert.ok(arena.attack(a,attacks[0]));assert.ok(arena.attack(b,attacks[1]));return {arena,a,b,attacks};
}
test('equal melee priorities cancel damage and future windows, then enforce recovery',()=>{
 const {arena,a,b,attacks}=setup();arena.tick();assert.equal(arena.lastMeleeClashes.length,1);assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);assert.equal(a.cast,null);assert.equal(b.cast,null);assert.ok(a.stun>arena.frame);assert.equal(arena.attack(a,attacks[0]),false);
 for(let i=0;i<20;i++)arena.tick();assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);assert.equal(arena.lastMeleeClashes.length,0);
});
test('unequal melee priorities stop only the weaker hit in either fighter position',()=>{
 for(const priorities of [[1,3],[3,1]]){const {arena,a,b}=setup(priorities);arena.tick();const winner=priorities[0]>priorities[1]?a:b,loser=winner===a?b:a;assert.equal(winner.hp,winner.maxHP);assert.equal(loser.hp,loser.maxHP-7);assert.equal(arena.lastMeleeClashes[0].winner,winner===a?0:1);}
});
test('ordinary and one-sided opt-in melee contacts still trade',()=>{
 for(const priorities of [[undefined,undefined],[2,undefined]]){const {arena,a,b}=setup(priorities);arena.tick();assert.equal(arena.lastMeleeClashes.length,0);assert.equal(a.hp,a.maxHP-7);assert.equal(b.hp,b.maxHP-7);}
});
test('startup and separated geometry do not clash',()=>{
 const waiting=setup([2,2],{startup:5});waiting.arena.tick();assert.equal(waiting.arena.lastMeleeClashes.length,0);
 const separated=setup();separated.b.x=850;separated.b.cast.x=850;separated.arena.tick();assert.equal(separated.arena.lastMeleeClashes.length,0);
});

test('scheduled clash cancels all remaining hit events and reports each stopped hit',()=>{
 const event=(id,offset)=>({id,offset,duration:1,damage:7,reaction:'none',height:0,knockback:0,frames:1,hold:1,target:'any'});
 const {arena,a,b}=setup([2,2],{behaviorVersion:2,sequenceTiming:'cast',hitEvents:[event('hit_one',0),event('hit_two',5)]});
 arena.tick();assert.equal(arena.lastHitResults.length,4);assert.ok(arena.lastHitResults.every(r=>r.result==='Clashed'));
 for(let i=0;i<15;i++)arena.tick();assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);
});
test('gaps between scheduled hits cannot clash',()=>{
 const event={id:'hit_later',offset:5,duration:1,damage:7,reaction:'none',height:0,knockback:0,frames:1,hold:1,target:'any'};
 const {arena}=setup([2,2],{behaviorVersion:2,sequenceTiming:'cast',hitEvents:[event]});
 for(let i=0;i<5;i++){arena.tick();assert.equal(arena.lastMeleeClashes.length,0);}
 arena.tick();assert.equal(arena.lastMeleeClashes.length,1);
});
test('recovery frames do not clash even when both hitboxes overlap',()=>{
 const {arena,a,b}=setup([2,2],{active:1});arena.frame=3;arena.tick();assert.equal(arena.lastMeleeClashes.length,0);assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);
});

test('spent grouped hit budgets cannot clash again',()=>{
 const group={id:'group_one',hitLimit:1,hitInterval:1,boxes:[{id:'box_one',x:0,y:-60,w:100,h:60,shape:'rectangle',start:0,duration:10}]};
 const {arena,a,b}=setup([2,2],{hitboxGroups:[group]});
 assert.equal(a.cast.groupTracker.claim(b,group,0),true);
 arena.tick();assert.equal(arena.lastMeleeClashes.length,0);assert.equal(b.hp,b.maxHP);assert.equal(a.hp,a.maxHP-7);
});
