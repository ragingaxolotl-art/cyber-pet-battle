import test from 'node:test';import assert from 'node:assert/strict';import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
const stats=defaultStats();
for(const mode of ['attached','contact'])for(const missing of [false,true])test(`sequence groups ${mode} miss=${missing} preserve per-event geometry`,()=>{
 const hitEvents=jugglePreset().map((e,i)=>({...e,reaction:'none',hitboxGroup:'group_'+i}));
 const a={...freshAttack('projectile'),startup:0,active:21,projectileSpeed:0,behaviorVersion:2,hitEvents,impactTrigger:'contact',projectileMode:mode};
 a.hitboxGroups=hitEvents.map((e,i)=>({id:e.hitboxGroup,hitLimit:1,hitInterval:1,boxes:[0,1].map(j=>({...a.box,shape:'rectangle',id:'box_'+i+'_'+j,start:e.offset,duration:1,x:missing&&i===1?400:a.box.x}))}));validateAttack(a);
 const sim=simulate(a,stats,stats,{distance:50,targetHP:1});const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[a],{training:true});p.x=450;o.x=500;arena.paused=false;arena.attack(p,a);
 for(let age=0;age<25;age++){arena.tick();assert.equal(o.hp,sim.frames[age].target.hp,`frame ${age}`);}
 assert.equal(arena.metrics.hits,missing?4:5);assert.equal(arena.metrics.damage,missing?25:28);assert.equal(sim.hitResults[1].result,missing?'Missed':'Connected');
});
