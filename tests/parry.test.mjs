import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,validateAttack,simulate} from '../site/shared/combat-model.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
for(const reverse of [false,true])for(const sequence of [false,true])test(`parry prevents hit and interrupts attacker, reverse=${reverse}, sequence=${sequence}`,()=>{
 const stats={...defaultStats(),speed:0},p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;
 const defender=reverse?p:o,attacker=reverse?o:p,move={...freshAttack(),startup:20,defenseWindows:[{id:'defense_one',kind:'parry',start:0,duration:3,hits:1,stun:8,against:'all'}]},hit={...freshAttack(),startup:0,status:sequence?'none':'burn'};
 if(sequence)Object.assign(hit,{delivery:'projectile',projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(2,2)});
 validateAttack(move);arena.attack(defender,move);arena.attack(attacker,hit);const cast=defender.cast,hp=defender.hp;
 arena.tick();assert.equal(defender.hp,hp);assert.equal(defender.statuses.length,0);assert.equal(defender.cast,cast);assert.equal(cast.defenseState.get('defense_one'),1);assert.equal(attacker.cast,null);assert.equal(attacker.stun,9);
 for(let i=0;i<7;i++)arena.tick();assert.equal(attacker.reaction,'hurt');arena.tick();assert.equal(attacker.reaction,'standing');
 if(sequence)assert.equal(arena.lastSequence.results[0].result,'Parried');
});
test('parry requires bounded interruption duration and hit budget',()=>{
 for(const patch of [{stun:0},{stun:61},{hits:0}])assert.throws(()=>validateAttack({...freshAttack(),defenseWindows:[{id:'defense_one',kind:'parry',start:0,duration:4,hits:1,stun:8,against:'melee',...patch}]}));
});

for(const sequence of [false,true])test(`parry preview and Arena agree, sequence=${sequence}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack(),startup:12,defenseWindows:[{id:'defense_one',kind:'parry',start:0,duration:3,hits:1,stun:8,against:'melee'}]};
 if(sequence)Object.assign(a,{delivery:'projectile',projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(2,2)});
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;arena.attack(p,a);arena.attack(o,{...freshAttack(),startup:0,active:1,base:10,coefficient:0});
 const preview=simulate(a,stats,stats,{distance:50,selfHP:1,targetHP:1,incomingDamage:10,incomingFrame:0});
 for(let age=0;age<20;age++){arena.tick();assert.equal(p.hp,preview.frames[age].self.hp);assert.equal(o.hp,preview.frames[age].target.hp);if(age<8)assert.equal(o.stun-1,preview.frames[age].target.stun);}
 assert.ok(preview.events.some(e=>e.text.includes('parried')));assert.equal(p.hp,p.maxHP);
});

function duel(window,hitOptions={}){
 const stats={...defaultStats(),speed:0},p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;
 arena.attack(o,{...freshAttack(),startup:20,defenseWindows:[{id:'defense_one',kind:'parry',start:1,duration:2,hits:1,stun:8,against:'melee',...window}]});arena.attack(p,{...freshAttack(),startup:0,active:1,...hitOptions});return {arena,p,o};
}
for(const frame of [0,1,2,3])test(`parry boundary ${frame}`,()=>{
 const {arena,p,o}=duel({}, {startup:frame});const hp=o.hp;for(let i=0;i<=frame;i++)arena.tick();assert.equal(o.hp===hp,[1,2].includes(frame));if([1,2].includes(frame))assert.equal(p.cast,null);
});
test('parry delivery filter rejects nonmatching attacks',()=>{const {arena,o}=duel({start:0,against:'projectile'});arena.tick();assert.ok(o.hp<o.maxHP);assert.equal(o.cast,null);});
test('invulnerability preserves the overlapping parry charge',()=>{
 const {arena,p,o}=duel({start:0});const cast=o.cast;cast.a.defenseWindows.push({id:'defense_immune',kind:'invulnerability',start:0,duration:2,against:'all'});arena.tick();assert.equal(o.hp,o.maxHP);assert.equal(cast.defenseState.size,0);assert.ok(p.cast);
});
test('separate simultaneous groups can exhaust a parry budget',()=>{
 const {arena,p,o}=duel({start:0});const cast=o.cast,a=p.cast.a;
 a.hitboxGroups=['a','b'].map(id=>({id:'group_'+id,hitLimit:1,hitInterval:1,boxes:[{...a.box,id:'box_'+id,start:0,duration:1,shape:'rectangle'}]}));validateAttack(a);
 arena.tick();assert.equal(cast.defenseState.get('defense_one'),1);assert.ok(o.hp<o.maxHP);assert.equal(o.cast,null);assert.equal(p.cast,null);
});
