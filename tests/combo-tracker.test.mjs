import test from 'node:test';import assert from 'node:assert/strict';
import {ComboTracker} from '../site/shared/combo-tracker.js';
test('chains span casts until an actionable gap, with detached snapshots',()=>{
 const t=new ComboTracker(),a={},b={};t.beginFrame(1,new Map([[b,{locked:false}]]));t.contact(a,b,'hit',8);t.beginFrame(2,new Map([[b,{locked:true}]]));t.contact(a,b,'hit',4);
 assert.equal(t.snapshot()[0].hits,2);assert.equal(t.snapshot()[0].damage,12);
 t.beginFrame(3,new Map([[b,{locked:false}]]));let s=t.snapshot()[0];assert.equal(s.hits,0);assert.equal(s.last.reason,'Defender regained control');s.last.reason='changed';assert.notEqual(t.snapshot()[0].last.reason,'changed');
 t.contact(a,b,'hit',3);assert.equal(t.snapshot()[0].hits,1);assert.equal(t.snapshot()[0].bestHits,2);
});
test('armor, guard, defeat and reset end chains; shield-only contact counts zero HP damage',()=>{
 const t=new ComboTracker(),a={},b={};t.contact(a,b,'hit',0);assert.equal(t.snapshot()[0].hits,1);assert.equal(t.snapshot()[0].damage,0);
 t.contact(a,b,'armor',7);assert.equal(t.snapshot()[0].hits,0);t.contact(a,b,'hit',2);t.contact(a,b,'block',1);assert.equal(t.snapshot()[0].hits,0);
 t.contact(a,b,'hit',4);t.beginFrame(5,new Map([[b,{locked:true,defeated:true}]]));assert.equal(t.snapshot()[0].last.reason,'Defeated');t.clear();assert.deepEqual(t.snapshot(),[]);
});
test('mixed armor and hit batches produce identical telemetry in either contact order',()=>{
 const a={},b={},contacts=[{attacker:a,target:b,outcome:'hit',damage:4},{attacker:a,target:b,outcome:'armor',damage:8}];
 const snapshots=[];for(const batch of [contacts,[...contacts].reverse()]){const t=new ComboTracker();t.contact(a,b,'hit',2);t.recordFrame(batch);snapshots.push(t.snapshot());}
 assert.deepEqual(snapshots[0],snapshots[1]);assert.equal(snapshots[0][0].hits,1);assert.equal(snapshots[0][0].damage,4);
});
