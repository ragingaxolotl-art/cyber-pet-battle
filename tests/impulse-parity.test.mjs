import test from 'node:test';import assert from 'node:assert/strict';import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const stats={...defaultStats(),speed:0};
function attack(mode='replace'){return {...freshAttack(),impactTrigger:'timed',cost:0,startup:0,active:1,recovery:1,status:'none',behaviorVersion:2,sequenceTiming:'cast',box:{x:0,y:-100,w:150,h:100},hitEvents:[{id:'hit_impulse',offset:0,duration:1,damage:10,reaction:'launch',height:0,knockback:0,frames:24,hold:5,target:'any',impulse:{mode,horizontal:2,vertical:-5,gravity:.3,drag:.95,duration:6}}]};}
test('Studio and Arena match impulse travel and released momentum through landing and recovery',()=>{
 const move=attack();validateAttack(move);const sim=simulate(move,stats,stats,{distance:60}),a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[move]);a.x=450;b.x=510;arena.ai=false;arena.paused=false;arena.attack(a,move);
 for(let age=0;age<100;age++){arena.tick();const expected=sim.frames[age].target;assert.ok(Math.abs(b.x-450-expected.x)<1e-8,'x at '+age);assert.ok(Math.abs(b.y-expected.y)<1e-8,'y at '+age);assert.equal(b.reaction,expected.reaction,'reaction at '+age);}
});
