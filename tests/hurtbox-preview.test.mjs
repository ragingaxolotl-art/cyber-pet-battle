import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
test('Studio playback hurtbox data restores default after action completion or interruption',()=>{
 const a={...freshAttack(),startup:0,active:2,recovery:0,cost:0,base:0,coefficient:0,hurtboxes:{frames:[{boxes:[{x:-10,y:-90,w:20,h:20,shape:'ellipse'}]}]}};
 const stats=defaultStats(),sim=simulate(a,stats,stats,{distance:200});
 assert.equal(sim.frames[0].attackerHurtboxes[0].shape,'ellipse');assert.equal(sim.frames[10].attackerHurtboxes[0].h,60);
 a.active=30;const interrupted=simulate(a,stats,stats,{distance:200,incomingDamage:10,incomingFrame:1});
 assert.equal(interrupted.frames[2].attackerHurtboxes[0].h,60);
});
