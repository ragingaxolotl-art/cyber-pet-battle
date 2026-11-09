import test from 'node:test';import assert from 'node:assert/strict';
import {validateImpactAreaArt,impactAreaArtSample,drawImpactAreaArt} from '../site/shared/impact-area-art.js';
const visual={effectId:'spark',scale:1,rate:1,loop:true},effect={times:[100,200],canvas:[40,20],columns:2},box={x:10,y:-40,w:80,h:80};
test('area artwork preserves aspect and follows combat time, not wall time',()=>{
 const before=structuredClone(box),a=impactAreaArtSample(visual,effect,box,6);assert.equal(a.index,1);assert.equal(a.w,80);assert.equal(a.h,40);assert.equal(a.y,-20);
 assert.deepEqual(impactAreaArtSample(visual,effect,box,6),a);assert.equal(impactAreaArtSample(visual,effect,box,18).index,0);assert.deepEqual(box,before);
 assert.equal(impactAreaArtSample({...visual,loop:false},effect,box,18),null);
});
test('expansion changes artwork bounds while missing art can use the collision fallback',()=>{
 const a=impactAreaArtSample(visual,effect,{...box,w:20,h:20},0);assert.equal(a.w,20);assert.equal(a.h,10);
 assert.equal(drawImpactAreaArt({}, {visual,effect,image:null,box,age:0}),false);
 const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args);}};assert.equal(drawImpactAreaArt(ctx,{visual,effect,image:{},box,age:0,ground:370}),true);assert.equal(calls[0][6],350);
});
test('artwork settings reject unsupported references and invalid numeric values',()=>{
 validateImpactAreaArt(visual,new Set(['spark']));assert.throws(()=>validateImpactAreaArt(visual,new Set()),/available/);
 for(const patch of [{scale:0},{rate:Infinity},{loop:'yes'},{extra:true}])assert.throws(()=>validateImpactAreaArt({...visual,...patch}));
});
import {createImpactArea,impactAreaView,validateProjectileArea} from '../site/shared/projectile-area.js';
test('area creation and replay detach artwork settings and retain combat-relative age',()=>{
 const attack={delivery:'projectile',payload:'damage',projectileLifetime:60,projectileContact:'single',projectileArea:{width:80,height:40,duration:30,interval:5,hitLimit:2,damage:3,visual:{...visual}}};
 validateProjectileArea(attack,new Set(['spark']));const area=createImpactArea(attack,{x:0,y:-40,w:20,h:20},10);attack.projectileArea.visual.rate=4;
 const frame=impactAreaView(area,17);assert.equal(frame.age,6);assert.equal(frame.visual.rate,1);frame.visual.scale=3;assert.equal(area.rule.visual.scale,1);
 assert.throws(()=>validateProjectileArea(attack,new Set()),/available/);
});
