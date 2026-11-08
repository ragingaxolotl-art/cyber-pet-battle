import test from 'node:test';import assert from 'node:assert/strict';import {validateMovementCancels,movementCancelWindow} from '../site/shared/movement-cancels.js';
const window=()=>({id:'movement_test',start:5,duration:3,action:'jump',condition:'hit',cost:4});
test('manual movement windows use inclusive start and exclusive end and retain cast state',()=>{
 const w=window(),cast={a:{movementCancels:[w]},outcomes:new Set(['hit']),impact:0,tm:{startup:0,active:4}};
 validateMovementCancels([w]);assert.equal(movementCancelWindow(cast,'jump',4),null);assert.equal(movementCancelWindow(cast,'jump',5),w);assert.equal(movementCancelWindow(cast,'jump',7),w);assert.equal(movementCancelWindow(cast,'jump',8),null);assert.equal(movementCancelWindow(cast,'dodge',5),null);assert.equal(cast.outcomes.size,1);
});
test('movement conditions distinguish block parry and whiff without permitting early misses',()=>{
 for(const condition of ['block','parry']){const w={...window(),condition},cast={a:{movementCancels:[w]},outcomes:new Set(),impact:0,tm:{active:8}};assert.equal(movementCancelWindow(cast,'jump',5),null);cast.outcomes.add(condition);assert.equal(movementCancelWindow(cast,'jump',5),w);}
 const w={...window(),start:0,duration:20,condition:'whiff'},cast={a:{payload:'damage',movementCancels:[w]},outcomes:new Set(),impact:0,tm:{active:8}};assert.equal(movementCancelWindow(cast,'jump',7),null);assert.equal(movementCancelWindow(cast,'jump',8),w);cast.outcomes.add('hit');assert.equal(movementCancelWindow(cast,'jump',8),null);
});
test('invalid movement definitions reject automatic actions and ambiguous dash direction',()=>{
 for(const changes of [{action:'fly'},{automatic:true},{cost:-1},{duration:0},{action:'dash'},{start:899,duration:2}])assert.throws(()=>validateMovementCancels([{...window(),...changes}]));
 validateMovementCancels([{...window(),action:'dash',direction:'input'}]);assert.throws(()=>validateMovementCancels([window(),window()]));assert.equal(movementCancelWindow(null,'jump',0),null);
});
