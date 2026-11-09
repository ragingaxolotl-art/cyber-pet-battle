import test from 'node:test';import assert from 'node:assert/strict';import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const stats={...defaultStats(),speed:0};
function attack(mode='replace'){return {...freshAttack(),impactTrigger:'timed',cost:0,startup:0,active:1,recovery:1,status:'none',behaviorVersion:2,sequenceTiming:'cast',box:{x:0,y:-100,w:150,h:100},hitEvents:[{id:'hit_impulse',offset:0,duration:1,damage:10,reaction:'launch',height:0,knockback:0,frames:24,hold:5,target:'any',impulse:{mode,horizontal:2,vertical:-5,gravity:.3,drag:.95,duration:6}}]};}
test('Studio and Arena match impulse travel and released momentum through landing and recovery',()=>{
 const move=attack();validateAttack(move);const sim=simulate(move,stats,stats,{distance:60}),a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[move]);a.x=450;b.x=510;arena.ai=false;arena.paused=false;arena.attack(a,move);
 for(let age=0;age<100;age++){arena.tick();const expected=sim.frames[age].target;assert.ok(Math.abs(b.x-450-expected.x)<1e-8,'x at '+age);assert.ok(Math.abs(b.y-expected.y)<1e-8,'y at '+age);assert.equal(b.reaction,expected.reaction,'reaction at '+age);}
});
for(const mode of ['add','replace','redirect','extend','suspend','ignore'])test('repeated '+mode+' hit matches both simulations through recovery',()=>{
 const move=attack();move.startup=1;move.hitEvents[0].impulse={mode:'replace',horizontal:1,vertical:-4,gravity:.2,drag:.98,duration:30};move.hitEvents.push({...structuredClone(move.hitEvents[0]),id:'hit_followup',offset:5,damage:3,impulse:{mode,horizontal:1,vertical:-2,gravity:.3,drag:.97,duration:12}});validateAttack(move);
 const sim=simulate(move,stats,stats,{distance:60}),a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[move]);a.x=450;b.x=510;arena.ai=false;arena.paused=false;arena.attack(a,move);
 for(let frame=0;frame<100;frame++){arena.tick();const expected=sim.frames[frame].target;assert.ok(Math.abs(b.x-450-expected.x)<1e-8,mode+' x at '+frame);assert.ok(Math.abs(b.y-expected.y)<1e-8,mode+' y at '+frame);assert.equal(b.reaction,expected.reaction??'standing',mode+' reaction at '+frame);}
 assert.equal(b.maxHP-b.hp,13);assert.equal(sim.frames.at(-1).hits,2);
});
for(const bounce of [false,true])test('wall contact '+(bounce?'with bounce':'without bounce')+' matches at equivalent stage bounds',()=>{
 const move=attack();move.box.w=250;move.hitEvents[0].impulse={mode:'replace',horizontal:10,vertical:-4,gravity:.3,drag:1,duration:30};if(bounce)move.hitEvents[0].bounces={wall:{height:20,distance:30,frames:15}};const sim=simulate(move,stats,stats,{distance:190}),a=fighter('A',stats),b=fighter('B',stats),arena=new Arena(a,b,[move]);a.x=705;b.x=895;arena.ai=false;arena.paused=false;arena.attack(a,move);
 for(let age=0;age<100;age++){arena.tick();const expected=sim.frames[age].target;assert.ok(Math.abs(b.x-705-expected.x)<1e-8,'wall x '+age);assert.ok(Math.abs(b.y-expected.y)<1e-8,'wall y '+age);assert.equal(b.reaction,expected.reaction,'wall reaction '+age);}
});
