import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
const stats={...defaultStats(),speed:0};
const launch=()=>({...freshAttack(),startup:0,cost:0,base:1,coefficient:0,hitstun:5,knockback:0,launchHeight:50,flightFrames:40,hitLimit:1});
const defense=()=>({...freshAttack(),startup:100,cost:0});
const options={distance:35,frames:70,statsA:stats,statsB:stats};
test('comparison schedules recovery in combat time and distinguishes success from early rejection',()=>{
 const a=launch(),b=defense();const recovered=compareAttacks(a,b,{...options,recoveryBFrame:12});assert.equal(recovered.recovery.recovered,true);assert.equal(recovered.recovery.combatFrame,12);assert.equal(recovered.rows.filter(r=>r.event.startsWith('Air recovery succeeded')).length,1);assert.equal(recovered.replay[12].fighters[1].reaction,'standing');
 const early=compareAttacks(a,b,{...options,recoveryBFrame:2});assert.equal(early.recovery.recovered,false);assert.match(early.recovery.reason,/Hitstun/);
 assert.equal(compareAttacks(a,b,options).recovery,null);assert.throws(()=>compareAttacks(a,b,{...options,recoveryBFrame:-1}),/air-recovery/);
});
test('hitstop delays presentation but does not duplicate or move a recovery attempt',()=>{
 const result=compareAttacks({...launch(),contactFeedback:{hitstop:10,blockstop:0,blockstun:0}},defense(),{...options,recoveryBFrame:12});assert.equal(result.recovery.recovered,true);const rows=result.rows.filter(r=>r.event.startsWith('Air recovery'));assert.equal(rows.length,1);assert.equal(rows[0].frame,22);assert.equal(result.recovery.combatFrame,12);
});
test('forced knockdown and short test limit report why recovery did not happen',()=>{
 assert.match(compareAttacks({...launch(),floorSlam:true},defense(),{...options,recoveryBFrame:12}).recovery.reason,/knockdown/);
 const result=compareAttacks(launch(),defense(),{...options,frames:5,recoveryBFrame:12});assert.equal(result.recovery.attempted,false);assert.match(result.recovery.reason,/Test ended/);
});
