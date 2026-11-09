import test from 'node:test';import assert from 'node:assert/strict';
import {validateAttackerMotion,createAttackerMotion,stepAttackerMotion} from '../site/shared/attacker-motion.js';
const segment=(extra={})=>({id:'move_dash',start:2,duration:4,forward:40,rise:0,...extra});
test('dash and recoil move by authored distance with a stationary strike gap',()=>{
 const state=createAttackerMotion({attackerMotion:[segment(),segment({id:'move_recoil',start:8,duration:2,forward:-10})]},1);let p={x:450,y:0};const xs=[];
 for(let f=0;f<11;f++){p=stepAttackerMotion(state,f,p);xs.push(p.x);}assert.deepEqual(xs,[450,450,460,470,480,490,490,490,485,480,480]);
});
test('facing mirrors displacement, ascent owns vertical motion and descent stops at floor',()=>{
 const state=createAttackerMotion({attackerMotion:[segment({start:0,duration:2,rise:20}),segment({id:'move_down',start:2,duration:2,forward:0,rise:-40})]},-1);let p=stepAttackerMotion(state,0,{x:450,y:0});assert.equal(p.x,430);assert.equal(p.y,-10);assert.equal(p.vertical,true);p=stepAttackerMotion(state,1,p);assert.equal(p.x,410);assert.equal(p.y,-20);p=stepAttackerMotion(state,2,p);assert.equal(p.y,0);p=stepAttackerMotion(state,3,p);assert.equal(p.y,0);
});
test('walls consume blocked displacement without stored teleport and interruption is permanent',()=>{
 const state=createAttackerMotion({attackerMotion:[segment({start:0})]},1);let p=stepAttackerMotion(state,0,{x:920,y:0});assert.equal(p.x,925);p=stepAttackerMotion(state,1,{...p,x:800});assert.equal(p.x,810);p=stepAttackerMotion(state,2,p,{interrupted:true});assert.equal(p.x,810);assert.equal(p.cancelled,true);assert.equal(stepAttackerMotion(state,3,p).x,810);
});
test('repeated presentation frames do not move the attacker again',()=>{
 const state=createAttackerMotion({attackerMotion:[segment({start:0})]},1);const p=stepAttackerMotion(state,0,{x:450,y:0});assert.equal(stepAttackerMotion(state,0,p).x,p.x);assert.throws(()=>stepAttackerMotion(state,-1,p),/monotonically/);
});
test('validation rejects overlaps, excessive travel, ambiguous fields and duplicate identities',()=>{
 for(const list of [[segment({duration:181})],[segment({forward:301})],[segment({rise:151})],[segment({extra:true})],[segment(),segment({id:'move_other',start:3})],[segment(),segment({start:8})],[segment({forward:0})]])assert.throws(()=>validateAttackerMotion({attackerMotion:list}));
 assert.doesNotThrow(()=>validateAttackerMotion({}));
});
