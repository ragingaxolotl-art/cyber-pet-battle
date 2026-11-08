import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';

function setup(){
 const stats={...defaultStats(),speed:0};
 const owner=fighter('Owner',stats),target=fighter('Target',stats);
 const arena=new Arena(owner,target,[]);arena.ai=false;arena.paused=false;
 owner.x=450;target.x=500;
 const projectile={...freshAttack(),id:'source_projectile',delivery:'projectile',projectileSpeed:0,startup:0,active:1,recovery:0,cost:0,base:7,coefficient:0,knockback:0};
 arena.attack(owner,projectile);const source=owner.cast;arena.frame=source.start;
 return {arena,owner,target,source};
}
test('detached collision source resolves without restoring owner action',()=>{
 const {arena,owner,target,source}=setup();owner.cast=null;
 assert.equal(arena.prepare(owner,target),null);
 const snapshot=arena.prepareCast(owner,target,source);
 assert.equal(snapshot.cast,source);assert.equal(snapshot.contact,true);
 arena.resolve(owner,target,snapshot);
 assert.equal(target.hp,target.maxHP-7);assert.equal(owner.cast,null);
});
test('old source retirement cannot clear a new owner move or borrow its attack',()=>{
 const {arena,owner,target,source}=setup();owner.cast=null;
 const next={...freshAttack(),id:'owner_next',startup:20,cost:0};
 assert.equal(arena.attack(owner,next),true);const current=owner.cast;
 const snapshot=arena.prepareCast(owner,target,source);
 arena.resolve(owner,target,snapshot);
 assert.equal(target.hp,target.maxHP-7);assert.equal(owner.cast,current);
 arena.frame=source.start+source.tm.active+source.tm.recovery;
 arena.resolve(owner,target,arena.prepareCast(owner,target,source));
 assert.equal(owner.cast,current);assert.equal(target.hp,target.maxHP-7);
});
test('explicit source uses recipient defense independently of owner action',()=>{
 const {arena,owner,target,source}=setup();owner.cast=null;
 const guard={...freshAttack(),id:'target_guard',delivery:'self',payload:'block',blockPercent:100,startup:0,active:10,cost:0};
 assert.equal(arena.attack(target,guard),true);arena.frame=target.cast.start;
 // Keep this contact inside the old source active window.
 source.start=arena.frame;
 arena.resolve(owner,target,arena.prepareCast(owner,target,source));
 assert.equal(target.hp,target.maxHP);assert.equal(owner.cast,null);
 assert.equal(source.outcomes.has('block'),true);
});
