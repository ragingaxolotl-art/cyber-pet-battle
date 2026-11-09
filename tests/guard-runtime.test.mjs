import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/shared/combat-runtime.js';import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(mode,patch={}){const a={...freshAttack(),startup:0,active:1,recovery:0,cost:0,base:20,coefficient:0,knockback:0,hitstun:0,guardInteraction:{mode,recoveryFrames:20},...patch},stats=defaultStats(),p=fighter('A',stats),q=fighter('B',stats),arena=new Arena(p,q,[a]);arena.paused=false;arena.ai=false;p.x=220;q.x=270;arena.attack(p,a);return {arena,p,q,a};}
for(const mode of ['break','crush'])test(`${mode} resolves guarded damage and forces recovery after block feedback`,()=>{const {arena,q}=setup(mode,{contactFeedback:{blockstun:80}});arena.tick(new Set(),0,new Set(['Shift']));assert.equal(q.maxHP-q.hp,mode==='break'?20:12);assert.equal(q.guarding,false);assert.equal(q.blockstunUntil,0);assert.equal(q.hitstunUntil,22);assert.equal(q.cast,null);assert.ok(arena.events.some(e=>e.text===('GUARD '+mode.toUpperCase())));for(let i=0;i<10;i++)arena.tick(new Set(),0,new Set(['Shift']));assert.equal(q.guarding,false);});
test('unguarded target receives ordinary reaction without forced guard recovery',()=>{const {arena,q}=setup('crush');arena.tick();assert.equal(q.maxHP-q.hp,20);assert.equal(q.hitstunUntil,1);assert.ok(!arena.events.some(e=>e.text==='GUARD CRUSH'));});
test('invulnerable guard ignores break; armored push does not trigger break recovery',()=>{for(const kind of ['invulnerability','armor']){const {arena,q}=setup('break',{payload:kind==='armor'?'push':'damage'});const defense={...freshAttack(),startup:0,active:100,recovery:0,cost:0,payload:'block',defenseWindows:[{id:'defense_guard',kind,start:0,duration:30,against:'all',...(kind==='armor'?{hits:1}:{})}]};assert.equal(arena.attack(q,defense),true);arena.tick();assert.equal(q.hp,q.maxHP);assert.ok(q.cast);assert.ok(!arena.events.some(e=>e.text==='GUARD BREAK'));}});

for(const mode of ['break','crush'])test(`${mode} preserves the guard snapshot across simultaneous hit groups`,()=>{
 const hitboxGroups=['first','second'].map(id=>({id:'group_'+id,hitLimit:1,hitInterval:1,boxes:[{id:'box_'+id,start:0,duration:1,shape:'rectangle',x:22,y:-52,w:54,h:44}]}));
 const {arena,q}=setup(mode,{hitboxGroups,contactFeedback:{blockstun:80}});
 arena.tick(new Set(),0,new Set(['Shift']));
 assert.equal(q.maxHP-q.hp,mode==='break'?40:24);
 assert.equal(q.guarding,false);assert.equal(q.blockstunUntil,0);assert.equal(q.hitstunUntil,22);
 assert.equal(arena.contactFeedback.filter(c=>c.guardInteraction?.mode===mode).length,2);
});
