import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,validateAttack} from '../site/shared/combat-model.js';
function setup(condition='any'){
 const stats={...defaultStats(),speed:0},p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;
 const follow={...freshAttack(),startup:0},first={...freshAttack(),startup:0,active:2,recovery:20,cancelWindows:[{id:'cancel_one',start:1,duration:3,condition,attacks:[follow.id]}]};validateAttack(first);arena.attack(p,first);return {arena,p,o,first,follow};
}
test('cancel permits only named followup within the exact window',()=>{
 const {arena,p,follow}=setup();arena.tick();assert.equal(arena.attack(p,follow),false);arena.tick();assert.equal(arena.attack(p,freshAttack()),false);assert.equal(arena.attack(p,follow),true);assert.equal(p.cast.a.id,follow.id);
});
test('cancel window end is exclusive',()=>{const {arena,p,follow}=setup();for(let i=0;i<5;i++)arena.tick();assert.equal(arena.attack(p,follow),false);});
for(const obstacle of ['energy','cooldown','stun'])test(`cancel retains ${obstacle} check and original cast on failure`,()=>{
 const {arena,p,follow}=setup();arena.tick();arena.tick();const cast=p.cast;if(obstacle==='energy')p.energy=0;if(obstacle==='cooldown')p.cooldowns.set(follow.id,100);if(obstacle==='stun')p.stun=100;assert.equal(arena.attack(p,follow),false);assert.equal(p.cast,cast);
});
test('hit conditional cancel needs an actual connection',()=>{const {arena,p,o,follow}=setup('hit');o.x=850;arena.tick();arena.tick();assert.equal(arena.attack(p,follow),false);});
test('hit conditional cancel opens after a connection',()=>{const {arena,p,follow}=setup('hit');arena.tick();arena.tick();assert.equal(arena.attack(p,follow),true);});
test('whiff cancel waits for the active window to finish',()=>{const {arena,p,o,follow}=setup('whiff');o.x=850;arena.tick();arena.tick();assert.equal(arena.attack(p,follow),false);arena.tick();assert.equal(arena.attack(p,follow),true);});

for(const payload of ['damage','push'])for(const condition of ['hit','block'])test(`${payload} distinguishes ${condition} from guarded contact`,()=>{
 const {arena,p,o,follow}=setup(condition);p.cast.a.payload=payload;arena.attack(o,{...freshAttack(),payload:'block',startup:0,active:20});arena.tick();arena.tick();assert.equal(arena.attack(p,follow),condition==='block');
});
test('push contact enables hit followup without dealing damage',()=>{
 const {arena,p,o,follow}=setup('hit');p.cast.a.payload='push';const hp=o.hp;arena.tick();arena.tick();assert.equal(o.hp,hp);assert.equal(arena.attack(p,follow),true);
});
test('successful parry enables a manual followup while retaining its resource cost',()=>{
 const {arena,p,o,follow}=setup('parry');p.cast.a.box.x=400;p.cast.a.defenseWindows=[{id:'defense_one',kind:'parry',start:0,duration:3,hits:1,stun:8,against:'all'}];arena.attack(o,{...freshAttack(),startup:0});arena.tick();arena.tick();const energy=p.energy;assert.equal(arena.attack(p,follow),true);assert.equal(p.energy,energy-Math.ceil(follow.cost*p.cost));
});
test('support moves cannot qualify as whiffs',()=>{const {arena,p,follow}=setup('whiff');p.cast.a.payload='heal';p.cast.a.delivery='self';arena.tick();arena.tick();arena.tick();assert.equal(arena.attack(p,follow),false);});
test('blocked contact never qualifies as a whiff',()=>{const {arena,p,o,follow}=setup('whiff');arena.attack(o,{...freshAttack(),payload:'block',startup:0,active:20});arena.tick();arena.tick();arena.tick();assert.equal(arena.attack(p,follow),false);});
