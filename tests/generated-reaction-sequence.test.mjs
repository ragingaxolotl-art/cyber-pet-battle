import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {Arena,fighter} from '../site/engine.js';import {defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/generated-reaction-sequence.json',import.meta.url))),stats=defaultStats();
for(const delivery of ['melee','area'])for(const facing of [1,-1])test(`Studio-generated reaction blocks match Arena ${delivery} facing ${facing}`,()=>{
 const attack={...structuredClone(fixture.attack),delivery};validateAttack(attack);
 const sim=simulate(attack,stats,stats,{distance:50,targetHP:1,facing,targetSide:facing});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[attack],{training:true});p.x=450;o.x=450+50*facing;arena.paused=false;arena.attack(p,attack);
 for(let frame=0;frame<60;frame++){arena.tick();const expected=sim.frames[frame].target;assert.equal(o.hp,expected.hp,'damage at '+frame);assert.ok(Math.abs(o.x-450-expected.x)<1e-6,'x at '+frame);assert.ok(Math.abs(o.y-expected.y)<1e-6,'height at '+frame);}
 assert.equal(arena.metrics.hits,5);assert.equal(sim.hitResults.filter(r=>r.result==='Connected').length,5);
});
