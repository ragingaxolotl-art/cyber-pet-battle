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

test('comparison reports a traveling projectile after owner recovery and snapshots its bounds',()=>{
 const projectile={...move(),delivery:'projectile',projectileLifetime:80,impactTrigger:'contact',projectileSpeed:1,recovery:0,cost:0};
 const other={...move(),startup:0,recovery:0,cost:0};
 const result=compareAttacks(projectile,other,{distance:500,frames:10});
 assert.equal(result.replay.at(-1).fighters[0].casting,'');
 assert.equal(result.remainingProjectiles,1);assert.equal(result.unfinished,true);
 assert.equal(result.replay[0].projectiles[0].actor,'A');
 const first=result.replay[0].projectiles[0].boxes[0],last=result.replay.at(-1).projectiles[0].boxes[0];
 assert.notEqual(first,last);assert.ok(last.x>first.x);
 const finished=compareAttacks(projectile,other,{distance:500,frames:90});assert.equal(finished.remainingProjectiles,0);assert.equal(finished.unfinished,false);
});
test('authored durability reports clash destruction and survival in comparison',()=>{
 const a={...move(),delivery:'projectile',projectileLifetime:60,projectileDurability:2,impactTrigger:'contact',projectileSpeed:10,recovery:0,cost:0};
 const b={...a,id:'attack_clash_b',projectileDurability:1};
 const result=compareAttacks(a,b,{distance:100,frames:20});
 assert.equal(result.projectileClashes.length,1);
 assert.deepEqual(result.projectileClashes[0].participants.map(p=>p.remaining),[1,0]);
 assert.deepEqual(result.damage,[0,10]);assert.ok(result.rows.some(r=>/Projectile clash.*destroyed/.test(r.event)));
 assert.ok(result.replay.some(r=>r.projectiles.some(p=>p.durability===1)));
});
