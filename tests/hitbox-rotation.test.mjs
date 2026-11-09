import test from 'node:test';import assert from 'node:assert/strict';
import {shapeBounds,containsPoint,shapeHitsRectangle,shapesOverlap,rotatePoint} from '../site/shared/hitbox-shapes.js';
const box=(shape,rotation=0)=>({x:0,y:0,w:80,h:10,shape,rotation});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('rotated bounds and point picking include regions outside the unrotated box',()=>{
 for(const shape of ['rectangle','ellipse','diamond','triangle']){
  const b=box(shape,90),bounds=shapeBounds(b);close(bounds.x,35);close(bounds.y,-35);close(bounds.w,10);close(bounds.h,80);
  assert.equal(containsPoint(b,{x:40,y:30}),true);assert.equal(containsPoint(b,{x:5,y:5}),false);
  assert.equal(shapeHitsRectangle(b,{x:39,y:29,w:2,h:2}),true);
 }
});
test('ellipse bounds use exact rotated extents and polygon misses remain misses',()=>{
 const b=box('ellipse',45),bounds=shapeBounds(b);close(bounds.w,Math.sqrt(3250));close(bounds.h,Math.sqrt(3250));
 assert.equal(shapeHitsRectangle(b,{x:bounds.x+bounds.w-1,y:bounds.y,w:1,h:1}),false);
});
test('rotated ellipse collisions are symmetric and invariant under a common rotation',()=>{
 const pairs=[[box('ellipse'),{x:35,y:8,w:20,h:6,shape:'ellipse',rotation:25}],[box('ellipse'),{x:78,y:0,w:30,h:10,shape:'ellipse',rotation:-35}],[box('ellipse'),{x:100,y:10,w:10,h:50,shape:'ellipse',rotation:15}]];
 const pivot={x:-1,y:-1,w:2,h:2,rotation:67};
 for(const [a,b] of pairs){const expected=shapesOverlap(a,b);assert.equal(shapesOverlap(b,a),expected);
  const turn=shape=>{const p=rotatePoint(pivot,{x:shape.x+shape.w/2,y:shape.y+shape.h/2});return {...shape,x:p.x-shape.w/2,y:p.y-shape.h/2,rotation:(shape.rotation||0)+67};};
  assert.equal(shapesOverlap(turn(a),turn(b)),expected);
 }
});
test('rotated ellipse tangency alone does not count as a hit',()=>{
 const a={x:-20,y:-5,w:40,h:10,shape:'ellipse',rotation:37},angle=37*Math.PI/180;
 const b={...a,x:a.x+40*Math.cos(angle),y:a.y+40*Math.sin(angle)};
 assert.equal(shapesOverlap(a,b),false);assert.equal(shapesOverlap(a,{...b,x:b.x-.001*Math.cos(angle),y:b.y-.001*Math.sin(angle)}),true);
});
