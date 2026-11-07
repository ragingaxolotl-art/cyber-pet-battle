import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,validateAttack,simulate} from '../site/shared/combat-model.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
import {validateDefenseWindows} from '../site/shared/defense-windows.js';
const stats={...defaultStats(),speed:0};
const window=(overrides={})=>({id:'defense_one',kind:'armor',start:0,duration:8,hits:1,against:'all',...overrides});
function setup({windowOptions={},reverse=false,sequence=false,hitTime=0}={}){
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;
 const defender=reverse?p:o,attacker=reverse?o:p;
 const protectedMove={...freshAttack(),startup:20,active:1,defenseWindows:[window(windowOptions)]};
 const hit={...freshAttack(),startup:hitTime,active:8,hitLimit:2,hitInterval:2,knockback:25,hitstun:12};
 if(sequence)Object.assign(hit,{delivery:'projectile',projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(2,2)});
 validateAttack(protectedMove);validateAttack(hit);assert.equal(arena.attack(defender,protectedMove),true);assert.equal(arena.attack(attacker,hit),true);
 return {arena,defender,attacker,hit};
}
for(const reverse of [false,true])for(const sequence of [false,true])test(`armor takes damage without interruption, then exhausts; reverse=${reverse}, sequence=${sequence}`,()=>{
 const {arena,defender}=setup({reverse,sequence});const cast=defender.cast,hp=defender.hp,x=defender.x;
 arena.tick();assert.ok(defender.hp<hp);assert.equal(defender.cast,cast);assert.equal(defender.reaction,'standing');assert.equal(defender.x,x);assert.equal(cast.defenseState.get('defense_one'),1);
 arena.tick();arena.tick();assert.equal(defender.cast,null);assert.notEqual(defender.reaction,'standing');
});
for(const [hitTime,protectedHit] of [[0,false],[1,true],[2,true],[3,false]])test(`armor uses exact window boundaries at frame ${hitTime}`,()=>{
 const {arena,defender}=setup({hitTime,windowOptions:{start:1,duration:2}});const cast=defender.cast;
 for(let i=0;i<=hitTime;i++)arena.tick();assert.equal(defender.cast===cast,protectedHit);
});
test('projectile-only armor does not absorb a melee reaction',()=>{
 const {arena,defender}=setup({windowOptions:{against:'projectile'}});arena.tick();assert.equal(defender.cast,null);
});
test('armor never prevents defeat',()=>{
 const {arena,defender}=setup();defender.hp=1;arena.tick();assert.equal(defender.hp,0);assert.equal(defender.cast,null);assert.ok(arena.winner);
});
test('armor does not erase secondary statuses',()=>{
 const {arena,defender,attacker}=setup();attacker.cast.a.status='burn';attacker.cast.a.statusPower=3;arena.tick();assert.ok(defender.cast);assert.equal(defender.statuses[0].type,'burn');
});
test('defense validation rejects unsupported and malformed windows',()=>{
 for(const patch of [{kind:'unknown'},{start:-1},{duration:0},{hits:0},{hits:11},{against:'unknown'}])assert.throws(()=>validateDefenseWindows([window(patch)]));
 assert.throws(()=>validateDefenseWindows([window(),window()]));
});

for(const sequence of [false,true])for(const armored of [false,true])test(`preview interruption parity: sequence=${sequence}, armor=${armored}`,()=>{
 const a={...freshAttack(),startup:5,active:12,hitLimit:1,knockback:0,hitstun:0,defenseWindows:armored?[window()]:undefined};
 if(sequence)Object.assign(a,{delivery:'projectile',projectileSpeed:0,behaviorVersion:2,impactTrigger:'contact',projectileMode:'attached',hitEvents:jugglePreset(2,2)});
 const incoming={...freshAttack(),startup:0,active:1,base:10,coefficient:0,knockback:0,hitstun:0};
 const p=fighter('P',stats),o=fighter('O',stats),arena=new Arena(p,o,[]);arena.ai=false;arena.paused=false;p.x=450;o.x=500;arena.attack(p,a);arena.attack(o,incoming);
 const preview=simulate(a,stats,stats,{distance:50,selfHP:1,targetHP:1,incomingDamage:10,incomingFrame:0});
 for(let age=0;age<20;age++){arena.tick();assert.equal(p.hp,preview.frames[age].self.hp,`self HP at ${age}`);assert.equal(o.hp,preview.frames[age].target.hp,`target HP at ${age}`);}
 assert.equal(preview.frames[15].hits>0,armored);
});

for(const separate of [false,true])test(`overlapping boxes consume armor per hit group, separate=${separate}`,()=>{
 const {arena,defender,attacker}=setup();const cast=defender.cast,a=attacker.cast.a;
 const box=id=>({...a.box,id,start:0,duration:1,shape:'rectangle'});
 a.hitboxGroups=separate?[{id:'group_a',hitLimit:1,hitInterval:1,boxes:[box('box_a')]},{id:'group_b',hitLimit:1,hitInterval:1,boxes:[box('box_b')]}]:[{id:'group_a',hitLimit:1,hitInterval:1,boxes:[box('box_a'),box('box_b')]}];validateAttack(a);
 arena.tick();assert.equal(cast.defenseState.get('defense_one'),1);assert.equal(defender.cast===cast,!separate);assert.equal(attacker.cast.hits,separate?2:1);
});
for(const payload of ['block','dodge'])test(`${payload} avoids consuming an armor charge`,()=>{
 const {arena,defender}=setup();const cast=defender.cast;cast.a.payload=payload;cast.tm.startup=0;cast.tm.active=8;const hp=defender.hp;
 arena.tick();assert.equal(defender.hp,hp);assert.equal(cast.defenseState.size,0);assert.equal(defender.cast,cast);
});
for(const reverse of [false,true])test(`simultaneous armored trade is independent of actor order ${reverse}`,()=>{
 const {arena,defender,attacker}=setup({reverse});const cast=defender.cast;cast.tm.startup=0;cast.tm.active=1;cast.impact=0;const dhp=defender.hp,ahp=attacker.hp;
 arena.tick();assert.ok(defender.hp<dhp);assert.ok(attacker.hp<ahp);assert.equal(defender.cast,cast);assert.equal(attacker.cast,null);
});
test('overlapping armor windows use their budgets in list order',()=>{
 const {arena,defender}=setup();const cast=defender.cast;cast.a.defenseWindows.push(window({id:'defense_two'}));
 arena.tick();assert.equal(cast.defenseState.get('defense_one'),1);assert.equal(cast.defenseState.has('defense_two'),false);
 arena.tick();arena.tick();assert.equal(cast.defenseState.get('defense_two'),1);assert.equal(defender.cast,cast);
});
