import test from 'node:test';import assert from 'node:assert/strict';import {freshAttack} from '../site/shared/combat-model.js';import {prepareComparisonTransfer,consumeComparisonTransfer} from '../site/shared/comparison-transfer.js';
function setup(){globalThis.location={href:'https://example.test/studio/',origin:'https://example.test'};const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),key:i=>[...map.keys()][i],get length(){return map.size;}};const a=freshAttack(),b=freshAttack();return {map,storage,a,b,window:{attacks:[b.id],start:12}};}
test('comparison transfer preserves definitions, is one-use, and touches only its own key',()=>{const {map,storage,a,b,window}=setup();map.set('saved-profile','unchanged');const before=structuredClone(a),url=prepareComparisonTransfer([a,b],a.id,window,'/arena/',storage,1000);const data=consumeComparisonTransfer(new URL(url).hash,storage,1001);assert.deepEqual(data.attacks,[a,b]);assert.deepEqual(a,before);assert.equal(data.frame,12);assert.equal(map.get('saved-profile'),'unchanged');assert.throws(()=>consumeComparisonTransfer(new URL(url).hash,storage,1002),/already opened/);});
test('invalid references, origins and expired transfer cannot open a test',()=>{const {storage,a,b,window}=setup();assert.throws(()=>prepareComparisonTransfer([a],a.id,window,'/arena/',storage,0),/missing/);assert.throws(()=>prepareComparisonTransfer([a,b],a.id,window,'https://other.test/',storage,0),/same website/);const url=prepareComparisonTransfer([a,b],a.id,window,'/arena/',storage,0);assert.throws(()=>consumeComparisonTransfer(new URL(url).hash,storage,600001),/expired/);assert.equal(consumeComparisonTransfer('#unrelated',storage),null);});

test('new transfers clean expired handoffs but preserve current tests and saved data',()=>{
 const {map,storage,a,b,window}=setup(),prefix='cyber-pet-comparison-transfer:';
 map.set('saved-profile','private');map.set('saved-attacks','untouched');
 map.set(prefix+'expired',JSON.stringify({created:0}));map.set(prefix+'broken','{');
 map.set(prefix+'current',JSON.stringify({created:600001}));
 const url=prepareComparisonTransfer([a,b],a.id,window,'/arena/',storage,600001);
 assert.equal(map.has(prefix+'expired'),false);assert.equal(map.has(prefix+'broken'),false);
 assert.equal(map.has(prefix+'current'),true);assert.equal(map.get('saved-profile'),'private');assert.equal(map.get('saved-attacks'),'untouched');
 assert.equal(consumeComparisonTransfer(new URL(url).hash,storage,600002).first,a.id);
});
