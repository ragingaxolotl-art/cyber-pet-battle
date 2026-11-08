import test from 'node:test';import assert from 'node:assert/strict';
import {shapesOverlap,HITBOX_SHAPES} from '../site/shared/hitbox-shapes.js';
const box=(shape,x=0,y=0,w=20,h=20,facing=1)=>({shape,x,y,w,h,facing});
for(const first of HITBOX_SHAPES)for(const second of HITBOX_SHAPES)test(`${first}/${second} overlap is symmetric and excludes separated or edge-touching bounds`,()=>{
 const a=box(first),b=box(second,4,4);
 assert.equal(shapesOverlap(a,b),true);assert.equal(shapesOverlap(b,a),true);
 for(const x of [20,21])assert.equal(shapesOverlap(a,box(second,x)),false);
});
test('overlapping bounds do not make separated diamonds or ellipses collide',()=>{
 for(const shape of ['diamond','ellipse']){
  const a=box(shape),b=box(shape,15,15);assert.equal(shapesOverlap(a,b),false);assert.equal(shapesOverlap(b,a),false);
 }
});
test('ellipse against a polygon handles containment, edge crossing and mirrored triangle tips',()=>{
 const ellipse=box('ellipse',8,8,4,4);assert.equal(shapesOverlap(ellipse,box('diamond')),true);
 assert.equal(shapesOverlap(box('ellipse'),box('rectangle',-5,9,30,2)),true);
 const corner=box('ellipse',16,0,3,3);
 assert.equal(shapesOverlap(corner,box('triangle')),false);
 assert.equal(shapesOverlap(corner,box('triangle',0,0,20,20,-1)),true);
});
test('ellipses with unequal radii handle containment and corner separation',()=>{
 const wide=box('ellipse',0,0,100,10);
 assert.equal(shapesOverlap(wide,box('ellipse',49,4,2,2)),true);
 assert.equal(shapesOverlap(wide,box('ellipse',95,8,10,2)),false);
 assert.equal(shapesOverlap(wide,box('ellipse',49,-10,2,30)),true);
});
test('circular diagonal tangency is excluded while positive overlap connects',()=>{
 const a=box('ellipse'),shift=Math.sqrt(200);
 assert.equal(shapesOverlap(a,box('ellipse',shift,shift)),false);
 assert.equal(shapesOverlap(a,box('ellipse',shift-.001,shift-.001)),true);
});
