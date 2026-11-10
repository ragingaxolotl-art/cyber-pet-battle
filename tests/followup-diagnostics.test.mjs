import test from 'node:test';
import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack} from '../site/shared/combat-model.js';
const move=(id,name)=>({...freshAttack(),id,name,startup:0,active:2,recovery:20,cost:0,base:10,coefficient:0,knockback:0,hitstun:0,launchHeight:0});
function fixture(condition='hit'){
 const next=move('attack_next','Follow-up'),first=move('attack_first','Opener'),opponent={...move('attack_opponent','Opponent'),startup:100};
 first.cancelWindows=[{id:'cancel_test',start:1,duration:3,condition,attacks:[next.id]}];
 return {first,next,opponent};
}
function run(data,options={}){return compareAttacks(data.first,data.opponent,{frames:40,followupA:data.next,followupFrame:1,...options});}
for(const frame of [0,4])test(`manual rejection identifies closed window at cast frame ${frame}`,()=>{
 const result=run(fixture(),{followupFrame:frame});assert.equal(result.followup.started,false);
 assert.match(result.followup.reason,new RegExp(`cast frame ${frame}`));assert.match(result.followup.reason,/1–3/);assert.equal(result.damage[1],10);
});
test('a guarded hit explains why the hit condition did not open',()=>{
 const result=run(fixture(),{actionB:'guard'});assert.equal(result.damage[1],0);assert.match(result.followup.reason,/blocked.*unblocked hit/i);
 assert(result.rows.some(row=>row.event.includes(result.followup.reason)));
});
test('a miss explains the missing hit instead of claiming a closed window',()=>{
 const result=run(fixture(),{distance:500});assert.match(result.followup.reason,/No hit has connected/);assert.equal(result.damage[1],0);
});
test('missing target and automatic-only rules give actionable explanations',()=>{
 const data=fixture();data.first.cancelWindows[0].attacks=['attack_other'];assert.match(run(data).followup.reason,/not allowed/);
 data.first.cancelWindows[0].attacks=[data.next.id];data.first.cancelWindows[0].automatic=true;
 assert.match(run(data,{followupFrame:0}).followup.reason,/automatic-only/);
});
test('whiff explains unfinished active time and blocked contact separately',()=>{
 const data=fixture('whiff');assert.match(run(data,{distance:500}).followup.reason,/Active time has not finished/);
 assert.match(run(data,{actionB:'guard',followupFrame:2}).followup.reason,/contact.*not a miss/);
 assert.equal(run(data,{distance:500,followupFrame:2}).followup.started,true);
});
test('parry and block rules name their missing condition',()=>{
 assert.match(run(fixture('parry')).followup.reason,/No successful parry/);
 assert.match(run(fixture('block')).followup.reason,/No blocked contact/);
});
test('overlapping windows explain active alternatives without describing expired rules as open',()=>{
 const data=fixture('hit');data.first.cancelWindows.push({id:'cancel_other',start:0,duration:1,condition:'any',attacks:[data.next.id]});
 assert.match(run(data,{distance:500}).followup.reason,/No hit has connected/);
});
test('resource rejection and successful followups retain engine behavior',()=>{
 const data=fixture();data.next.cost=10;const rejected=run(data,{energyA:0});assert.equal(rejected.followup.reason,'Not enough energy');assert.equal(rejected.damage[1],10);
 const accepted=run(data);assert.equal(accepted.followup.reason,'');assert.equal(accepted.followup.cancelled,true);assert.equal(accepted.damage[1],20);
});
