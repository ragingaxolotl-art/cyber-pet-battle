import test from 'node:test';import assert from 'node:assert/strict';
import {sequenceState,sequenceOpportunities,jugglePreset} from '../site/shared/hit-sequence.js';
const attack=()=>({projectileMode:'contact',hitEvents:jugglePreset(3,5)});
const target={y:0};
test('cast-relative clock expires a missed opening without delaying later hits',()=>{
 const a=attack(),state=sequenceState(10);
 assert.deepEqual(sequenceOpportunities(a,state,9,true,target),[]);
 assert.deepEqual(sequenceOpportunities(a,state,10,false,target),[]);
 assert.deepEqual(sequenceOpportunities(a,state,11,false,target),[]);
 assert.equal(state.results[0].id,a.hitEvents[0].id);assert.equal(state.results[0].result,'Missed');
 const hits=sequenceOpportunities(a,state,15,true,target);assert.equal(hits[0].id,a.hitEvents[1].id);assert.equal(state.contactFrame,15);
 assert.equal(sequenceOpportunities(a,state,20,true,target)[0].id,a.hitEvents[2].id,'actual contact does not rebase scheduled windows');
 assert.deepEqual(sequenceOpportunities(a,state,20,true,target),[],'same event cannot connect twice');
});
test('contact-relative projectile clock still waits for first overlap',()=>{
 const a=attack(),state=sequenceState();
 assert.deepEqual(sequenceOpportunities(a,state,100,false,target),[]);assert.equal(state.results.length,0);
 assert.equal(sequenceOpportunities(a,state,110,true,target)[0].id,a.hitEvents[0].id);
 assert.equal(sequenceOpportunities(a,state,115,true,target)[0].id,a.hitEvents[1].id);
});
test('scheduled eligibility misses do not prevent a later grounded event',()=>{
 const a=attack(),state=sequenceState(0);a.hitEvents[0].target='airborne';
 assert.deepEqual(sequenceOpportunities(a,state,0,true,target),[]);
 assert.equal(sequenceOpportunities(a,state,5,true,target)[0].id,a.hitEvents[1].id);
 assert.equal(state.results[0].result,'Missed');state.cancelled='Interrupted';assert.deepEqual(sequenceOpportunities(a,state,10,true,target),[]);
});
test('invalid scheduled origins are rejected',()=>{for(const frame of [-1,.5,NaN,Infinity])assert.throws(()=>sequenceState(frame),/nonnegative frame/);});
