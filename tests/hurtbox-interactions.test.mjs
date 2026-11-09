import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {freshAttack,defaultStats,validateAttack} from '../site/shared/combat-model.js';
const region={x:-14,y:-60,w:28,h:60,shape:'rectangle'};
function move(){return {...freshAttack(),startup:0,active:30,recovery:0,cost:0,base:10,coefficient:0,knockback:0,hitstun:12,hitLimit:1};}
function battle(a,b){validateAttack(a);validateAttack(b);const p=fighter('P',defaultStats()),q=fighter('Q',defaultStats()),arena=new Arena(p,q,[a,b]);p.x=400;q.x=450;arena.ai=false;arena.paused=false;arena.attack(p,a);arena.attack(q,b);return {arena,p,q};}
test('same-frame trades retain both authored hurtbox snapshots after interruption',()=>{
 const a=move(),b=move();a.hurtboxes={frames:[{boxes:[{...region}]}]};b.hurtboxes=structuredClone(a.hurtboxes);
 const {arena,p,q}=battle(a,b);arena.tick();assert.equal(p.maxHP-p.hp,10);assert.equal(q.maxHP-q.hp,10);assert.equal(p.cast,null);assert.equal(q.cast,null);
});
for(const grouped of [false,true])test(`projectile tests all authored regions without duplicate damage grouped=${grouped}`,()=>{
 const a={...move(),delivery:'projectile',projectileSpeed:1,projectileLifetime:60,box:{x:20,y:-40,w:40,h:20,shape:'rectangle'}};
 if(grouped)a.hitboxGroups=[{id:'group_test',hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_test',start:0,duration:30}]}];
 const b={...move(),payload:'heal',delivery:'self',base:0,hurtboxes:{frames:[{boxes:[{...region,y:-200},{...region},{...region}]}]}};
 const {arena,q}=battle(a,b);arena.tick();assert.equal(q.maxHP-q.hp,10);
});
test('authored regions can avoid a projectile until their pose changes',()=>{
 const a={...move(),delivery:'projectile',projectileSpeed:1,projectileLifetime:60,box:{x:20,y:-40,w:80,h:20,shape:'rectangle'}};
 const b={...move(),payload:'heal',delivery:'self',base:0,poseTiming:'custom',poseFrames:[0,1],poseDurations:[.1,.1],hurtboxes:{frames:[{boxes:[{...region,y:-200}]},{boxes:[{...region}]}]}};
 const {arena,q}=battle(a,b);for(let i=0;i<6;i++){arena.tick();assert.equal(q.hp,q.maxHP,`pose before transition ${i}`);}arena.tick();assert.equal(q.maxHP-q.hp,10);
});
