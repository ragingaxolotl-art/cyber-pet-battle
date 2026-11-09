import test from 'node:test';import assert from 'node:assert/strict';
import {validateProjectileFlight,createFlightState,advanceFlight,reflectFlight,FLIGHT_LIMITS} from '../site/shared/projectile-flight.js';
const rule={angle:0,acceleration:0,gravity:0,range:100};
test('constant velocity is mirrored and repeated collision queries do not move twice',()=>{
 for(const facing of [1,-1]){const s=createFlightState({x:30,y:-40},facing,3,rule,7);advanceFlight(s,8);assert.equal(s.x,30+facing*3);assert.equal(s.y,-40);const before=structuredClone(s);advanceFlight(s,8);assert.deepEqual(s,before);assert.throws(()=>advanceFlight(s,10),/consecutive/);}
});
test('gravity and acceleration integrate only consecutive combat frames',()=>{
 const s=createFlightState({x:0,y:0},1,2,{...rule,acceleration:.5,gravity:.25},0);
 advanceFlight(s,1);assert.equal(s.x,2.5);assert.equal(s.y,.25);advanceFlight(s,2);assert.equal(s.x,5.5);assert.equal(s.y,.75);
});
test('travel range follows the path length and clips the final step exactly',()=>{
 const s=createFlightState({x:0,y:0},1,3,{...rule,angle:45,range:5},0);advanceFlight(s,1);assert.equal(s.expired,false);advanceFlight(s,2);assert.equal(s.expired,true);assert.equal(s.distance,5);assert.ok(Math.abs(Math.hypot(s.x,s.y)-5)<1e-10);
 const before=structuredClone(s);advanceFlight(s,3);assert.deepEqual(s,before);
});
test('reflection preserves age, spent range and vertical motion',()=>{
 const s=createFlightState({x:0,y:0},1,3,{...rule,acceleration:.2,gravity:.1},10);advanceFlight(s,11);const before=structuredClone(s);reflectFlight(s);assert.equal(s.vx,-before.vx);assert.equal(s.ax,-before.ax);assert.equal(s.vy,before.vy);assert.equal(s.ay,before.ay);assert.equal(s.distance,before.distance);assert.equal(s.lastFrame,11);
});
test('combined velocity stays bounded and stationary projectiles remain finite',()=>{
 const s=createFlightState({x:0,y:0},1,12,{...rule,acceleration:1,gravity:1,range:3000},0);for(let frame=1;frame<100;frame++){advanceFlight(s,frame);assert.ok(Math.hypot(s.vx,s.vy)<=FLIGHT_LIMITS.speed+1e-10);}
 const stationary=createFlightState({x:2,y:3},1,0,rule,0);advanceFlight(stationary,1);assert.equal(stationary.x,2);assert.equal(stationary.y,3);assert.equal(stationary.expired,false);
});
test('flight rejects malformed rules and competing movement authorities',()=>{
 const attack={delivery:'projectile',projectileLifetime:60,projectileFlight:rule};validateProjectileFlight(attack);validateProjectileFlight({});
 for(const projectileFlight of [null,{},[],{...rule,range:0},{...rule,angle:181},{...rule,gravity:Infinity},{...rule,acceleration:2},{...rule,extra:1}])assert.throws(()=>validateProjectileFlight({...attack,projectileFlight}));
 for(const patch of [{delivery:'melee'},{projectileLifetime:undefined},{projectileSteering:{mode:'homing'}},{motionPath:[{x:0,y:0}]}])assert.throws(()=>validateProjectileFlight({...attack,...patch}));
});
