import test from 'node:test';import assert from 'node:assert/strict';import {drawAttackEffect} from '../site/effect-renderer.js';
const effect={times:[100,100],canvas:[16,16],columns:2,anchor:[8,8]},visual={x:10,y:-20,scale:1,start:0,rate:1,loop:true};
function render(cast,target={x:300,y:-40}){const calls=[];const ctx={save(){},restore(){},translate(...args){calls.push(['translate',...args]);},scale(...args){calls.push(['scale',...args]);},drawImage(...args){calls.push(['image',...args]);}};drawAttackEffect(ctx,{cast,visual,effect,image:'sprite',frame:5,target});return calls;}
const cast=()=>({a:{delivery:'projectile',projectileSpeed:10,impactTrigger:'contact'},start:0,impact:null,tm:{startup:0},x:100,y:0,facing:1});
test('effect rendering mirrors travel and artwork through the reflection transform',()=>{
 const original=render(cast()),reflected=render({...cast(),projectileTransform:{direction:-1,offset:400}});
 assert.deepEqual(original[0],['translate',160,-20]);assert.deepEqual(reflected[0],['translate',240,-20]);assert.deepEqual(reflected[1],['scale',-1,1]);assert.deepEqual(reflected[2],original[2]);
});
test('attached reflected effect tracks target with mirrored local offsets',()=>{
 const c=cast();c.a.projectileMode='attached';c.sequence={attached:true};c.projectileTransform={direction:-1,offset:400};
 assert.deepEqual(render(c)[0],['translate',290,-60]);assert.deepEqual(render(c,{x:450,y:-80})[0],['translate',440,-100]);
});
