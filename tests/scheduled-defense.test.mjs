import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const stats=defaultStats();
function setup(kind){
 const attack={...freshAttack('melee'),startup:0,active:11,recovery:3,cost:0,sequenceTiming:'cast',behaviorVersion:2,impactTrigger:'timed',hitEvents:jugglePreset(3,5).map(e=>({...e,reaction:'none'}))};
 const defense={...freshAttack(),startup:0,active:40,cost:0,payload:'block',blockPercent:100};
 if(kind!=='guard'){defense.payload='damage';defense.startup=90;defense.defenseWindows=[{id:'defense_test',kind,against:'all',start:0,duration:kind==='invulnerability'?2:30,hits:1,stun:12}];}
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[attack,defense],{training:true});p.x=450;o.x=500;arena.paused=false;arena.attack(p,attack);arena.attack(o,defense);return {arena,p,o,attack};
}
test('guard blocks every scheduled hit without cancelling later windows',()=>{
 const {arena,o}=setup('guard');for(let i=0;i<20;i++)arena.tick();assert.equal(o.hp,o.maxHP);
 assert.deepEqual(arena.lastSequence.results.map(r=>r.result),['Blocked','Blocked','Blocked']);
});
test('expired invulnerability permits later scheduled hits',()=>{
 const {arena}=setup('invulnerability');for(let i=0;i<20;i++)arena.tick();
 assert.deepEqual(arena.lastSequence.results.map(r=>r.result),['Invulnerable','Connected','Connected']);
});
test('one-charge armor is consumed by the opening scheduled hit',()=>{
 const {arena}=setup('armor');for(let i=0;i<20;i++)arena.tick();
 assert.deepEqual(arena.lastSequence.results.map(r=>r.result),['Armored','Connected','Connected']);
});
test('parry interrupts the source and prevents later scheduled hits',()=>{
 const {arena,p,o}=setup('parry');for(let i=0;i<20;i++)arena.tick();assert.equal(o.hp,o.maxHP);assert.equal(p.cast,null);
 assert.deepEqual(arena.lastSequence.results.map(r=>r.result),['Parried']);
});
test('preview guard preserves all scheduled windows and incoming damage interrupts',()=>{
 const {attack}=setup('guard');const guarded=simulate(attack,stats,stats,{distance:50,targetHP:1,guard:true});
 assert.deepEqual(guarded.hitResults.map(r=>r.result),['Blocked','Blocked','Blocked']);
 const interrupted=simulate(attack,stats,stats,{distance:50,targetHP:1,incomingDamage:1,incomingFrame:2});
 assert.deepEqual(interrupted.hitResults.map(r=>r.result),['Connected','Missed','Missed']);assert.match(interrupted.hitResults[1].reason,/interrupted/);
});
