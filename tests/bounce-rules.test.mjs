import test from 'node:test';import assert from 'node:assert/strict';
import {validateBounces,bounceContact,claimBounce,resetBounceChain} from '../site/shared/bounce-rules.js';
const settings={wall:{height:35,distance:60,frames:24},floor:{height:25,distance:20,frames:20}};
test('bounce authoring validates exact bounded rules without changing legacy definitions',()=>{
 validateBounces(undefined);validateBounces(settings);
 for(const bad of [null,{},[],{ceiling:settings.wall},{wall:{...settings.wall,height:0}},{floor:{...settings.floor,frames:121}},{wall:{...settings.wall,distance:2.5}},{wall:{...settings.wall,extra:1}}])assert.throws(()=>validateBounces(bad));
});
test('boundary crossings handle overshoot, inward travel and corner ties',()=>{
 assert.deepEqual(bounceContact({x:40,y:-8},{x:20,y:-5},35,925),{kind:'wall',direction:1});
 assert.deepEqual(bounceContact({x:920,y:-1},{x:930,y:2},35,925),{kind:'wall',direction:-1});
 assert.equal(bounceContact({x:35,y:-8},{x:35,y:-5},35,925),null);
 assert.equal(bounceContact({x:35,y:-8},{x:40,y:-5},35,925),null);
 assert.deepEqual(bounceContact({x:400,y:-1},{x:395,y:4},35,925),{kind:'floor',direction:-1});
 assert.equal(bounceContact({x:400,y:0},{x:400,y:0},35,925),null);
});
test('wall and floor budgets persist across rehit and bounce contact until settled reset',()=>{
 const f={hp:100,y:-20,juggleHits:3,airRecoveryUsed:true};
 const wall=claimBounce(f,settings,{kind:'wall',direction:-1});assert.equal(wall.direction,-1);assert.equal(wall.event.height,35);
 assert.equal(claimBounce(f,settings,{kind:'wall',direction:1}),null);
 f.y=0;assert.ok(claimBounce(f,settings,{kind:'floor',direction:-1}));
 assert.equal(claimBounce(f,settings,{kind:'floor',direction:1}),null);
 assert.equal(f.juggleHits,3);assert.equal(f.airRecoveryUsed,true);
 resetBounceChain(f);assert.ok(claimBounce(f,settings,{kind:'floor',direction:1}));
});
test('defeat, juggle release and absent properties never spend a bounce',()=>{
 for(const f of [{hp:0},{hp:100,juggleLocked:true},{hp:100}]){const before=structuredClone(f);assert.equal(claimBounce(f,f.hp===100&&!f.juggleLocked?undefined:settings,{kind:'wall',direction:1}),null);assert.deepEqual(f,before);}
});
