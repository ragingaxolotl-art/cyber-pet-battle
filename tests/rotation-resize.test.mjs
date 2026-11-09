import test from 'node:test';import assert from 'node:assert/strict';
import {hitboxResizeHandles,resizeHitbox,rotatePoint} from '../site/shared/hitbox-shapes.js';
const world=(b,f)=>({...b,x:f===1?b.x:-b.x-b.w,rotation:b.rotation*f});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const facing of [-1,1])for(const rotation of [-90,37,90])for(const kind of ['width','height','size'])test(`resize ${kind} at ${rotation} facing${facing} anchors opposite corner`,()=>{
 const original={x:20,y:-40,w:60,h:30,rotation},before=world(original,facing),angle=rotation*facing*Math.PI/180;
 const dw=kind==='height'?0:12,dh=kind==='width'?0:8,dx=Math.cos(angle)*dw-Math.sin(angle)*dh,dy=Math.sin(angle)*dw+Math.cos(angle)*dh;
 const next=resizeHitbox(original,dx,dy,kind,facing),after=world(next,facing);
 near(next.w,60+dw);near(next.h,30+dh);
 const a=rotatePoint(before,{x:before.x,y:before.y}),b=rotatePoint(after,{x:after.x,y:after.y});near(a.x,b.x);near(a.y,b.y);
 const handle=hitboxResizeHandles(before).find(h=>h.kind===kind),moved=hitboxResizeHandles(after).find(h=>h.kind===kind);near(moved.x-handle.x,dx);near(moved.y-handle.y,dy);
});
test('rotated resizing obeys position and size limits without reversing dimensions',()=>{
 for(const facing of [-1,1]){const b={x:499,y:499,w:490,h:490,rotation:45},next=resizeHitbox(b,5000,5000,'size',facing);for(const k of ['x','y'])assert.ok(Math.abs(next[k])<=500);for(const k of ['w','h'])assert.ok(next[k]>=1&&next[k]<=500);}
});
