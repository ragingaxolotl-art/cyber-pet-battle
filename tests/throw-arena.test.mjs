import {compareAttacks} from '../site/matchup.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,validateAttack,simulate} from '../site/shared/combat-model.js';
function setup(){
 const stats={...defaultStats(),speed:0},a=fighter('A',stats),b=fighter('B',stats);
 const grab={...freshAttack('melee'),id:'attack_grab',delivery:'melee',payload:'damage',startup:0,active:3,recovery:5,cooldown:0,impactTrigger:'timed',cost:0,base:7,coefficient:0,knockback:0,hitLimit:1,hitInterval:1,box:{x:0,y:-60,w:70,h:60,shape:'rectangle'},throw:{holdFrames:3,holdX:30,holdHeight:20,target:'grounded'}};
 const arena=new Arena(a,b,[grab]);arena.ai=false;arena.paused=false;a.x=450;b.x=500;return {arena,a,b,grab};
}
test('grab holds without damage, locks both fighters and releases once through guard',()=>{
 const {arena,a,b,grab}=setup();b.guarding=true;assert.ok(arena.attack(a,grab));arena.tick();assert.equal(b.hp,b.maxHP);assert.equal(b.captured?.attacker,a);assert.equal(b.x,480);assert.equal(b.y,-20);
 for(const f of [a,b]){assert.match(arena.reason(f,grab),/throw/);for(const action of ['jump','dodge','airRecover','dash'])assert.match(arena[action](f),/throw/);}
 arena.tick(new Set(['ArrowRight']),0,new Set(['ArrowLeft']));assert.equal(a.x,450);assert.equal(b.x,480);
 arena.tick();assert.equal(b.hp,b.maxHP);arena.tick();assert.equal(b.hp,b.maxHP-7);assert.equal(a.holding,undefined);assert.equal(b.captured,undefined);assert.equal(arena.lastThrows[0].outcome,'throw released');
 for(let i=0;i<20;i++)arena.tick();assert.equal(b.hp,b.maxHP-7);assert.equal(a.cast,null);
});
test('reciprocal grabs break without actor order advantage',()=>{
 const {arena,a,b,grab}=setup();arena.attack(a,grab);arena.attack(b,grab);arena.tick();assert.equal(arena.lastThrows.length,2);assert.ok(arena.lastThrows.every(r=>r.outcome==='throw break'));assert.equal(a.hp,a.maxHP);assert.equal(b.hp,b.maxHP);assert.equal(arena.throws.holds.length,0);
 for(let i=0;i<10;i++)arena.tick();assert.equal(a.cast,null);assert.equal(b.cast,null);
});
test('a whiff ends normally and cannot capture during recovery',()=>{
 const {arena,a,b,grab}=setup();b.x=800;arena.attack(a,grab);for(let i=0;i<5;i++)arena.tick();b.x=500;for(let i=0;i<10;i++)arena.tick();assert.equal(b.captured,undefined);assert.equal(b.hp,b.maxHP);assert.equal(a.cast,null);
});
test('interruption cancels capture without release damage and reset clears both flags',()=>{
 const {arena,a,b,grab}=setup();arena.attack(a,grab);arena.tick();a.cast=null;arena.tick();assert.equal(b.hp,b.maxHP);assert.equal(b.captured,undefined);assert.equal(a.holding,undefined);assert.equal(arena.lastThrows[0].outcome,'throw cancelled');
 const second=setup();second.arena.training=true;second.arena.attack(second.a,second.grab);second.arena.tick();second.arena.resetDummy();assert.equal(second.a.holding,undefined);assert.equal(second.b.captured,undefined);
});
test('presentation hitstop does not advance a hold',()=>{
 const {arena,a,b,grab}=setup();arena.attack(a,grab);arena.tick();arena.hitstopRemaining=4;for(let i=0;i<4;i++)arena.tick();assert.equal(arena.frame,1);assert.equal(b.hp,b.maxHP);for(let i=0;i<3;i++)arena.tick();assert.equal(b.hp,b.maxHP-7);
});
test('throw immunity rejects grabs while strike-only immunity does not',()=>{
 for(const against of ['throw','all','melee']){const {arena,a,b,grab}=setup();const defense={...grab,id:'attack_defense',throw:undefined,base:0,box:{x:300,y:-60,w:10,h:10,shape:'rectangle'},defenseWindows:[{id:'defense_test',kind:'invulnerability',against,start:0,duration:20}]};validateAttack(defense);arena.attack(b,defense);arena.attack(a,grab);arena.tick();assert.equal(!!b.captured,against==='melee');}
});
test('an ordinary strike interrupts a simultaneous grab in either fighter slot',()=>{
 for(const reverse of [false,true]){const {arena,a,b,grab}=setup(),captor=reverse?b:a,striker=reverse?a:b;const strike={...grab,id:'strike',throw:undefined,knockback:20};arena.attack(captor,grab);arena.attack(striker,strike);arena.tick();assert.equal(arena.throws.holds.length,0);assert.equal(captor.hp,captor.maxHP-7);assert.equal(striker.hp,striker.maxHP);}
});

test('Studio preview uses the same hold and release as Arena without circular replay data',()=>{
 const {grab}=setup();const stats={...defaultStats(),speed:0};const result=simulate(grab,stats,stats,{distance:50,guard:true});
 assert.equal(result.frames[0].target.captured,true);assert.equal(result.frames[0].target.x,30);assert.equal(result.frames[2].hits,0);assert.equal(result.frames[3].hits,1);assert.equal(result.frames[3].target.captured,false);assert.ok(result.events.some(e=>e.text==='throw released'));assert.doesNotThrow(()=>JSON.stringify(result));
});

test('comparison records capture and release, with detached hold flags',()=>{
 const {grab}=setup();const result=compareAttacks(grab,grab,{actionB:'guard',frames:30});assert.deepEqual(result.throws.map(t=>t.outcome),['grabbed','throw released']);assert.equal(result.replay[0].fighters[1].captured,true);assert.equal(result.contacts[0],1);assert.ok(result.rows.some(r=>/throw released/.test(r.event)));assert.doesNotThrow(()=>JSON.stringify(result));
});
