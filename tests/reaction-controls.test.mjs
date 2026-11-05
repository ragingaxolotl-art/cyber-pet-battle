import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {beginReaction} from '../site/reactions.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(){const p=fighter('P',defaultStats()),o=fighter('O',defaultStats()),arena=new Arena(p,o,[]);arena.paused=false;arena.ai=false;return {p,arena};}
test('landing into knockdown cannot leak a frame of movement, jump or guard',()=>{
 const {p,arena}=setup(),a={...freshAttack(),knockback:0,launchHeight:40,flightFrames:4,hitstun:0,floorSlam:true};
 beginReaction(p,a,1,0);const x=p.x;
 for(let i=0;i<4;i++)arena.tick(new Set(['ArrowRight','ArrowUp','Shift']));
 assert.equal(p.reaction,'down');assert.equal(p.x,x);assert.equal(p.y,0);assert.equal(p.vy,0);assert.equal(p.guarding,false);assert.equal(p.moving,false);
 for(let i=0;i<61;i++)arena.tick(new Set(['ArrowRight']));assert.equal(p.x,x);
 arena.tick(new Set(['ArrowRight']));assert.equal(p.reaction,'standing');assert.ok(p.x>x);
});
test('floor slam on an X-only push never adds a delayed knockdown',()=>{
 const {p,arena}=setup(),a={...freshAttack(),pushAxis:'x',knockback:20,launchHeight:40,flightFrames:4,hitstun:12,floorSlam:true};
 beginReaction(p,a,1,0);const states=[];for(let i=0;i<20;i++){arena.tick();states.push(p.reaction);}
 assert.ok(!states.includes('down'));assert.equal(p.reaction,'standing');
});
test('active knockdown blocks attacks and dodge as well as walking',()=>{
 const {p,arena}=setup(),a={...freshAttack(),startup:0};p.reaction='down';p.reactionUntil=20;p.stun=0;
 assert.equal(arena.attack(p,a),false);assert.match(arena.dodge(p),/Finish/);arena.tick(new Set(['ArrowRight','Shift']));assert.equal(p.moving,false);assert.equal(p.guarding,false);
});
