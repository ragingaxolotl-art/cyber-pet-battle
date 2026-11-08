import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';
function attack(action){return {...freshAttack(),startup:20,active:5,recovery:30,cost:0,movementCancels:[{id:'movement_test',action,start:2,duration:5,condition:'any',cost:3,...(action==='dash'?{direction:'input'}:{})}]};}
for(const action of ['jump','dodge','dash'])test(`comparison executes and reports ${action} movement cancellation`,()=>{
 const a=attack(action),b={...freshAttack(),startup:100};const result=compareAttacks(a,b,{distance:500,frames:40,movementA:{action,frame:2,direction:-1}});
 assert.equal(result.movement.started,true);assert.ok(result.rows.some(r=>r.event==='Movement cancel: '+action));assert.equal(result.contacts[0],0);
 const before=result.replay[2].fighters[0],after=result.replay[8].fighters[0];assert.equal(after.casting,'');if(action==='jump')assert.ok(after.y<before.y);else assert.ok(after.x<before.x);
});
test('comparison reports missed windows and attempts beyond the test duration',()=>{
 const a=attack('jump'),b=freshAttack();let result=compareAttacks(a,b,{distance:500,frames:15,movementA:{action:'jump',frame:8}});assert.equal(result.movement.started,false);assert.equal(result.movement.attempted,true);assert.ok(result.replay[9].fighters[0].casting);
 result=compareAttacks(a,b,{frames:2,movementA:{action:'jump',frame:8}});assert.equal(result.movement.attempted,false);
});
test('movement comparison rejects ambiguous or invalid input',()=>{
 const a=attack('dash'),b=freshAttack();for(const movementA of [{action:'fly',frame:2},{action:'dash',frame:-1},{action:'dash',frame:2,direction:2}])assert.throws(()=>compareAttacks(a,b,{movementA}),/Choose a movement/);
 assert.throws(()=>compareAttacks(a,b,{movementA:{action:'dash',frame:2},followupA:b}),/either/);
});
