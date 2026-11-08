import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const rule={phases:['startup','active','recovery'],damagePercent:150};
function setup(sequence=false,kind=null){
 const stats={...defaultStats(),speed:0},p=fighter('A',stats),o=fighter('B',stats);
 const attack={...freshAttack(),startup:0,active:4,cost:0,base:20,coefficient:0,knockback:0,hitstun:5,counterHit:rule};
 if(sequence)Object.assign(attack,{delivery:'area',behaviorVersion:2,sequenceTiming:'cast',hitEvents:jugglePreset(1,3).map(h=>({...h,damage:20}))});
 const defense={...freshAttack(),startup:30,cost:0};
 if(kind)defense.defenseWindows=[{id:'defense_test',kind,start:0,duration:30,against:'all',...(kind==='invulnerability'?{}:{hits:2}),...(kind==='parry'?{stun:5}:{})}];
 const arena=new Arena(p,o,[attack,defense]);arena.ai=false;arena.paused=false;o.x=p.x+35;arena.attack(p,attack);arena.attack(o,defense);arena.frame=1;
 return {arena,p,o,attack,defense};
}
for(const sequence of [false,true])for(const kind of ['armor','invulnerability','parry'])test(`${sequence?'sequence':'ordinary'} ${kind} prevents a counter-hit bonus`,()=>{
 const {arena,p,o}=setup(sequence,kind);arena.resolve(p,o,arena.prepare(p,o));
 assert.equal(o.maxHP-o.hp,kind==='armor'?20:0);assert.equal(arena.contactFeedback.some(c=>c.counterHit),false);
 if(kind==='armor')assert.ok(o.cast);if(kind==='parry')assert.equal(p.cast,null);
});
for(const sequence of [false,true])test(`${sequence?'sequence':'ordinary'} shield absorbs counter damage but retains contact classification`,()=>{
 const {arena,p,o}=setup(sequence);o.shield=50;arena.resolve(p,o,arena.prepare(p,o));assert.equal(o.hp,o.maxHP);assert.equal(o.shield,20);assert.equal(arena.contactFeedback[0].counterHit,true);assert.equal(arena.contactFeedback[0].damage,0);
});
test('a reflected projectile counter-hit credits its new owner',()=>{
 const stats={...defaultStats(),speed:0},p=fighter('Original owner',stats),o=fighter('Reflector',stats);
 const attack={...freshAttack('projectile'),startup:0,active:1,recovery:0,projectileLifetime:90,impactTrigger:'contact',projectileSpeed:10,cost:0,base:20,coefficient:0,knockback:0,hitstun:5,counterHit:rule};
 const windup={...freshAttack(),startup:100,cost:0};const arena=new Arena(p,o,[attack,windup]);arena.ai=false;arena.paused=false;p.x=200;o.x=500;arena.attack(p,attack);for(let i=0;i<10;i++)arena.tick();assert.equal(arena.reflectProjectile(arena.projectiles.entries[0],o),true);
 assert.equal(arena.attack(p,windup),true);const contacts=[];let previous=arena.frame;
 for(let i=0;i<80;i++){arena.tick();if(arena.frame!==previous)contacts.push(...arena.contactFeedback.filter(c=>c.counterHit));previous=arena.frame;}
 assert.equal(contacts.length,1);assert.equal(contacts[0].attacker,o);assert.equal(contacts[0].target,p);assert.equal(p.maxHP-p.hp,30);assert.equal(o.hp,o.maxHP);
});
