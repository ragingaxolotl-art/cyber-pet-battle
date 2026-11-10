import test from 'node:test';
import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
const stats={...defaultStats(),speed:0};
const shot=()=>({...freshAttack('projectile'),id:'attack_report_shot',name:'Report projectile',startup:0,active:1,recovery:0,cost:0,base:7,coefficient:0,knockback:15,hitstun:10,projectileSpeed:10,projectileLifetime:60,projectileContact:'single',impactTrigger:'contact'});
const defense=kind=>({...freshAttack(),id:'attack_report_defense',startup:90,cost:0,defenseWindows:[{id:'defense_report',kind,against:'projectile',start:0,duration:60,hits:1,...(kind==='parry'?{stun:12}:{})}]});
const compare=(a,b)=>compareAttacks(a,b,{distance:200,frames:70,statsA:stats,statsB:stats});

test('comparison explains a parried projectile and the remaining charge count',()=>{
 const result=compare(shot(),defense('parry'));
 assert.deepEqual(result.damage,[0,0]);
 const rows=result.rows.filter(r=>r.event.startsWith('Parried incoming attack'));
 assert.equal(rows.length,1);assert.equal(rows[0].actor,'B');assert.match(rows[0].event,/0 defense charges left/);
});

test('comparison explains armor damage without claiming that armor blocked damage',()=>{
 const result=compare(shot(),defense('armor'));
 assert.deepEqual(result.damage,[0,7]);
 const rows=result.rows.filter(r=>r.event.startsWith('Armored contact'));
 assert.equal(rows.length,1);assert.equal(rows[0].actor,'B');assert.match(rows[0].event,/7 HP damage; hit reaction suppressed/);
});

test('impact pauses do not repeat the armored-contact explanation',()=>{
 const result=compare({...shot(),contactFeedback:{hitstop:8}},defense('armor'));
 assert.ok(result.presentationElapsed>result.elapsed);
 assert.equal(result.rows.filter(r=>r.event.startsWith('Armored contact')).length,1);
});

test('an expired parry window is not reported as successful',()=>{
 const d=defense('parry');d.defenseWindows[0].duration=1;
 const result=compare(shot(),d);assert.deepEqual(result.damage,[0,7]);
 assert.equal(result.rows.filter(r=>r.event.startsWith('Parried incoming attack')).length,0);
});
