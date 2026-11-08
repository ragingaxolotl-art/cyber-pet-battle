import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(stop=3){const a={...freshAttack(),startup:0,active:8,recovery:20,cost:0,contactFeedback:{hitstop:stop}},p=fighter('A',defaultStats()),o=fighter('B',defaultStats()),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);arena.tick();return {a,p,o,arena};}
test('impact pause freezes combat state for exactly the requested ticks',()=>{
 const {a,p,o,arena}=setup();assert.equal(arena.hitstopRemaining,3);const frame=arena.frame,energy=p.energy,hp=o.hp,x=o.x,y=o.y,stun=o.stun;
 for(let i=0;i<3;i++){assert.equal(arena.attack(p,a),false);assert.equal(arena.jump(p),'Impact pause');arena.tick(new Set(['ArrowRight']));assert.equal(arena.frame,frame);assert.equal(p.energy,energy);assert.equal(o.hp,hp);assert.equal(o.x,x);assert.equal(o.y,y);assert.equal(o.stun,stun);}
 assert.equal(arena.hitstopRemaining,0);arena.tick();assert.equal(arena.frame,frame+1);assert.equal(arena.presentationFrame,5);
});
test('menu pause does not consume hitstop and training reset clears it',()=>{
 const {arena}=setup();arena.paused=true;arena.tick();assert.equal(arena.hitstopRemaining,3);arena.training=true;arena.resetDummy();assert.equal(arena.hitstopRemaining,0);
});
test('zero hitstop retains uninterrupted simulation timing',()=>{
 const {arena}=setup(0);for(let i=0;i<10;i++)arena.tick();assert.equal(arena.frame,11);assert.equal(arena.presentationFrame,11);
});
test('same-frame trade resolves both hits before taking the larger stop',()=>{
 const p=fighter('A',defaultStats()),o=fighter('B',defaultStats());const a={...freshAttack(),startup:0,cost:0,contactFeedback:{hitstop:2}},b={...a,id:'attack_second',contactFeedback:{hitstop:5}};
 const arena=new Arena(p,o,[a,b]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,a);arena.attack(o,b);arena.tick();assert.ok(p.hp<p.maxHP);assert.ok(o.hp<o.maxHP);assert.equal(arena.hitstopRemaining,5);
});
