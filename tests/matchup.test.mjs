import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';
import {freshAttack} from '../site/shared/combat-model.js';
const move=()=>({...freshAttack(),startup:0,active:1,base:10,coefficient:0,knockback:0,hitstun:20});
test('simultaneous attacks trade without mutating definitions',()=>{const a=move(),before=structuredClone(a),result=compareAttacks(a,a);assert.match(result.outcome,/Trade/);assert.deepEqual(result.damage,[10,10]);assert.deepEqual(a,before);});
test('timing offsets expose interruption and missed contacts',()=>{const a=move(),b={...move(),startup:20};const r=compareAttacks(a,b);assert.deepEqual(r.damage,[0,10]);assert.ok(r.rows.some(row=>row.actor==='B'&&/Interrupted/.test(row.event)));assert.deepEqual(compareAttacks(a,a,{distance:500}).damage,[0,0]);assert.deepEqual(compareAttacks(a,a,{offset:-5}).started,[false,true]);});
test('invalid scenarios fail before simulation',()=>{assert.throws(()=>compareAttacks(move(),move(),{offset:181}));assert.throws(()=>compareAttacks(move(),move(),{distance:NaN}));});

test('replay preserves frame snapshots and configured starting heights',()=>{const a=move(),r=compareAttacks(a,a,{heightB:100,frames:3});assert.equal(r.replay.length,3);assert.ok(r.replay[0].fighters[1].y<0);assert.notEqual(r.replay[0].fighters[1].y,r.replay[2].fighters[1].y);assert.notEqual(r.replay[0].fighters[1],r.replay[2].fighters[1]);});

test('guard and evade scenarios replace B attack and protect during their windows',()=>{for(const actionB of ['guard','dodge']){const r=compareAttacks(move(),move(),{actionB});assert.deepEqual(r.damage,[0,0]);assert.ok(r.rows.some(row=>row.actor==='B'&&/Guard|Evade/.test(row.event)));}assert.deepEqual(compareAttacks({...move(),blockable:false},move(),{actionB:'guard'}).damage,[0,10]);});
test('wall scenarios place fighters at the actual Arena boundary',()=>{const r=compareAttacks({...move(),knockback:100,wallSlam:true},move(),{placement:'right',offset:5});assert.equal(r.replay[0].fighters[1].x,925);assert.ok(r.replay.some(f=>f.fighters[1].reaction==='wall'));assert.throws(()=>compareAttacks(move(),move(),{placement:'outside'}));});
