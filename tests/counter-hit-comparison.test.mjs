import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
import {attackDiagnostics} from '../site/shared/attack-diagnostics.js';
test('comparison counter-hit log records trades once despite impact pauses and detaches replay data',()=>{
 const move={...freshAttack(),startup:0,active:2,cost:0,base:20,coefficient:0,knockback:0,hitstun:5,counterHit:{phases:['startup','active'],damagePercent:150},contactFeedback:{hitstop:5,blockstop:0,blockstun:0}};
 const stats={...defaultStats(),speed:0},result=compareAttacks(move,{...move,id:'attack_other'},{distance:35,frames:20,statsA:stats,statsB:stats});
 assert.equal(result.counterHits.length,2);assert.deepEqual(result.counterHits.map(c=>c.damage),[30,30]);assert.equal(result.rows.filter(r=>r.event.startsWith('Counter-hit:')).length,2);
 assert.equal(result.replay.flatMap(f=>f.counterHits).length,2);assert.ok(result.replay.some(f=>f.hitstopRemaining>0));assert.doesNotThrow(()=>JSON.stringify(result));
 result.counterHits[0].damage=999;assert.equal(result.replay[0].counterHits[0].damage,30);
 const guarded=compareAttacks(move,move,{distance:35,frames:20,statsA:stats,statsB:stats,actionB:'guard'});assert.deepEqual(guarded.counterHits,[]);
});
test('diagnostics state counter-hit compatibility and preview limits',()=>{
 const move={...freshAttack('heal'),counterHit:{phases:['recovery'],damagePercent:150}};
 const messages=attackDiagnostics(move);for(const code of ['counter-hit-version','counter-hit-rules','counter-hit-preview','counter-hit-payload'])assert.ok(messages.some(m=>m.code===code));
});
