import test from 'node:test';import assert from 'node:assert/strict';
import {validateThrow,throwRejection,throwImmunity,resolveGrabAttempts,createThrowHold,heldPosition,throwHoldPhase} from '../site/shared/throw-rules.js';
const attack=()=>({delivery:'melee',payload:'damage',hitLimit:1,throw:{holdFrames:12,holdX:30,holdHeight:10,target:'grounded'}});
const actor=x=>({x,y:0,hp:100,reaction:'standing'});
const attempt=(id,a,b)=>({id,attack:attack(),attacker:a,target:b,active:true,contact:true});
test('grabs require contact, nearby living fighters and matching target state',()=>{
 const a=actor(100),b=actor(140),s=attempt('one',a,b);assert.equal(throwRejection(s),'');
 for(const patch of [{active:false},{contact:false},{evading:true}])assert.notEqual(throwRejection({...s,...patch}),'');
 for(const patch of [{x:181},{hp:0},{captured:true},{holding:true},{y:-2},{reaction:'down'},{reaction:'getting_up'}])assert.notEqual(throwRejection({...s,target:{...b,...patch}}),'');
 const airborne={...s,attack:{...attack(),throw:{...attack().throw,target:'airborne'}}};assert.notEqual(throwRejection(airborne),'');assert.equal(throwRejection({...airborne,target:{...b,y:-10}}),'');
});
test('throw immunity is separate from strike immunity, guard and armor',()=>{
 for(const against of ['all','throw'])assert.equal(throwImmunity({windows:[{kind:'invulnerability',against}]}),true);
 for(const window of [{kind:'invulnerability',against:'melee'},{kind:'armor',against:'all'},{kind:'parry',against:'all'}])assert.equal(throwImmunity({windows:[window]}),false);
 const s=attempt('one',actor(100),actor(140));assert.equal(throwRejection({...s,defense:{windows:[{kind:'armor',against:'all'}]}}),'');assert.match(throwRejection({...s,defense:{windows:[{kind:'invulnerability',against:'throw'}]}}),/invulnerable/);
});
test('reciprocal grabs break equally regardless of iteration order',()=>{
 const a=actor(100),b=actor(140),one=attempt('a',a,b),two=attempt('b',b,a);assert.deepEqual(resolveGrabAttempts([one,two]),{accepted:[],broken:['a','b']});assert.deepEqual(resolveGrabAttempts([two,one]),resolveGrabAttempts([one,two]));two.active=false;assert.deepEqual(resolveGrabAttempts([two,one]),{accepted:['a'],broken:[]});
});
test('holds mirror placement, respect walls and release on combat time',()=>{
 const move=attack(),before=structuredClone(move);for(const facing of [1,-1]){const hold=createThrowHold(move,20,facing);assert.deepEqual(heldPosition(hold,actor(400)),{x:400+30*facing,y:-10});assert.equal(throwHoldPhase(hold,31),'hold');assert.equal(throwHoldPhase(hold,31),'hold');assert.equal(throwHoldPhase(hold,32),'release');assert.equal(throwHoldPhase(hold,32,{interrupted:true}),'cancel');assert.equal(throwHoldPhase(hold,21,{targetAlive:false}),'cancel');}assert.equal(heldPosition(createThrowHold(move,0,1),actor(920)).x,925);assert.deepEqual(move,before);
});
test('throw validation rejects malformed and contradictory attack definitions',()=>{
 validateThrow({});validateThrow(attack());for(const patch of [{delivery:'projectile'},{payload:'heal'},{hitLimit:2},{hitEvents:[]},{meleeClash:{}},{guardInteraction:{}}])assert.throws(()=>validateThrow({...attack(),...patch}));
 for(const rule of [null,{},[],{...attack().throw,holdFrames:0},{...attack().throw,holdX:61},{...attack().throw,holdHeight:81},{...attack().throw,target:'down'},{...attack().throw,extra:1}])assert.throws(()=>validateThrow({...attack(),throw:rule}));
});
