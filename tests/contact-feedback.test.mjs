import test from 'node:test';import assert from 'node:assert/strict';
import {validateContactFeedback,contactFeedbackResult} from '../site/shared/contact-feedback.js';
test('contact feedback accepts bounded whole frames and preserves omitted legacy settings',()=>{
 validateContactFeedback();validateContactFeedback({hitstop:0,blockstop:20,blockstun:120});
 for(const value of [null,[],{}, {unknown:1},{constructor:1},{hitstop:21},{blockstop:-1},{blockstun:1.5},{hitstop:'2'}])assert.throws(()=>validateContactFeedback(value));
 assert.deepEqual(contactFeedbackResult([{attack:{},outcome:'hit'}]),{stopFrames:0,guards:new Map()});
});
test('simultaneous contacts use maximum stop and per-target guard lock regardless of order',()=>{
 const contacts=[{attack:{contactFeedback:{hitstop:4}},target:'A',outcome:'hit'},{attack:{contactFeedback:{blockstop:7,blockstun:15}},target:'B',outcome:'block'},{attack:{contactFeedback:{blockstop:2,blockstun:9}},target:'B',outcome:'block'},{attack:{contactFeedback:{blockstun:3}},target:'A',outcome:'block'}];
 const expected={stopFrames:7,guards:new Map([['B',15],['A',3]])};assert.deepEqual(contactFeedbackResult(contacts),expected);assert.deepEqual(contactFeedbackResult([...contacts].reverse()),expected);
});
test('misses, evasion, parries and invulnerability do not request ordinary impact stop',()=>{
 const attack={contactFeedback:{hitstop:10,blockstop:8,blockstun:20}};
 for(const outcome of ['miss','evade','parry','invulnerable'])assert.deepEqual(contactFeedbackResult([{attack,target:'A',outcome}]),{stopFrames:0,guards:new Map()});
 assert.equal(contactFeedbackResult([{attack,outcome:'armor'}]).stopFrames,10);
});
