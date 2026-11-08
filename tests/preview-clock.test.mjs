import test from 'node:test';import assert from 'node:assert/strict';
import {presentationFrames} from '../site/shared/preview-clock.js';
import {freshAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
test('presentation pauses preserve authoring frames and do not mutate snapshots',()=>{
 const frames=[{frame:0,impactStop:2,target:{x:4}},{frame:1,impactStop:0,target:{x:5}}],before=structuredClone(frames),out=presentationFrames(frames);
 assert.deepEqual(out.map(f=>f.combatFrame),[0,0,0,1]);assert.deepEqual(out.map(f=>f.presentationFrame),[0,1,2,3]);assert.deepEqual(out.map(f=>f.hitstopRemaining),[2,1,0,0]);assert.deepEqual(frames,before);
});
test('legacy preview exposes frozen playback while retaining combat timeline length',()=>{
 const a={...freshAttack(),startup:0,cost:0,contactFeedback:{hitstop:3}},s=simulate(a,defaultStats(),defaultStats(),{distance:35});
 const contacts=s.frames.filter(f=>f.impactStop>0);assert.equal(contacts.length,1);assert.equal(s.presentationFrames.length,s.frames.length+3);assert.equal(s.presentationFrames[0].combatFrame,0);
});
