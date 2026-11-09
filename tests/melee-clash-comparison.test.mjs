import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';
const attack=priority=>({...freshAttack(),cost:0,startup:0,active:10,recovery:5,base:7,coefficient:0,knockback:0,box:{x:0,y:-60,w:100,h:60},meleeClash:{priority}});
test('comparison explains equal clashes and records them once in replay',()=>{
 const a=attack(1),b=attack(1),before=structuredClone([a,b]);const result=compareAttacks(a,b,{frames:30});
 assert.equal(result.meleeClashes.length,1);assert.match(result.outcome,/Melee clash/);assert.deepEqual(result.damage,[0,0]);assert.match(result.rows.find(r=>/Melee clash/.test(r.event)).event,/remaining hits cancelled/);
 assert.equal(result.replay.filter(frame=>frame.meleeClashes.length).length,1);assert.deepEqual([a,b],before);
});
test('comparison reports priority winner while normal defender invulnerability still applies',()=>{
 const a=attack(3),b={...attack(1),defenseWindows:[{id:'defense_test',kind:'invulnerability',start:0,duration:10,against:'all'}]};
 const result=compareAttacks(a,b,{frames:30});assert.equal(result.meleeClashes[0].winner,0);assert.equal(result.damage[0],0);
 assert.equal(result.damage[1],0);assert.ok(result.rows.some(r=>/Melee priority/.test(r.event)));
});
