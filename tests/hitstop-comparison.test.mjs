import test from 'node:test';import assert from 'node:assert/strict';
import {compareAttacks} from '../site/matchup.js';import {freshAttack} from '../site/shared/combat-model.js';
function setup(){const a={...freshAttack(),startup:0,active:8,recovery:30,cost:0,contactFeedback:{hitstop:4},movementCancels:[{id:'movement_jump',action:'jump',start:0,duration:10,condition:'hit',cost:0}]},b={...freshAttack(),startup:100};return {a,b};}
test('comparison defers contact-frame movement input until impact pause ends',()=>{
 const {a,b}=setup();const r=compareAttacks(a,b,{frames:20,movementA:{action:'jump',frame:0}});assert.equal(r.movement.started,true);assert.equal(r.rows.find(row=>row.event==='Movement cancel: jump').frame,4);assert.deepEqual(r.replay.slice(0,5).map(f=>f.combatFrame),[0,0,0,0,0]);assert.equal(r.presentationElapsed,20);assert.equal(r.elapsed,16);
});
test('later cast-frame attempts retain authored timing despite frozen playback frames',()=>{
 const {a,b}=setup();const r=compareAttacks(a,b,{frames:20,movementA:{action:'jump',frame:3}});assert.equal(r.movement.started,true);assert.equal(r.rows.find(row=>row.event==='Movement cancel: jump').frame,7);
 assert.equal(r.rows.filter(row=>row.actor==='A'&&row.event==='Started '+a.name).length,1);
});
test('test limit during impact pause reports unfinished work and no premature movement attempt',()=>{
 const {a,b}=setup();const r=compareAttacks(a,b,{frames:2,movementA:{action:'jump',frame:0}});assert.equal(r.movement.attempted,false);assert.equal(r.unfinished,true);assert.equal(r.elapsed,1);
});
