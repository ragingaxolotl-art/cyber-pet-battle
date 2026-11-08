import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats} from '../site/shared/combat-model.js';
function setup(interval,stun=5,configure=()=>{}){const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,active:12,cost:0,base:5,coefficient:0,knockback:0,hitstun:stun,hitLimit:2,hitInterval:interval};const p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);arena.ai=false;arena.paused=false;o.x=p.x+35;configure(a);arena.attack(p,a);return {p,o,a,arena};}
test('actual contacts extend during stun and split at the expiry boundary',()=>{
 for(const [interval,best] of [[4,2],[5,1]]){const {arena}=setup(interval);for(let i=0;i<8;i++)arena.tick();assert.equal(arena.combos.snapshot()[0].bestHits,best);}
});
test('hitstop retains chain and training reset clears telemetry',()=>{
 const {arena}=setup(3,5,a=>a.contactFeedback={hitstop:3});arena.tick();assert.equal(arena.hitstopRemaining,3);for(let i=0;i<10;i++)arena.tick();assert.equal(arena.combos.snapshot()[0].bestHits,2);arena.training=true;arena.resetDummy();assert.deepEqual(arena.combos.snapshot(),[]);
});
test('telemetry records actual HP damage rather than overkill',()=>{
 const {arena,o}=setup(3);o.hp=2;arena.tick();const result=arena.combos.snapshot()[0];assert.equal(result.bestDamage,2);assert.equal(result.hits,0);assert.equal(result.last.reason,'Round ended');
});

test('automatic follow-up contributes to the same chain across cast replacement',()=>{
 const {arena,p,a}=setup(10);a.hitLimit=1;
 const next={...a,id:'attack_followup',base:7};delete next.cancelWindows;
 a.cancelWindows=[{id:'cancel_combo',start:0,duration:5,condition:'hit',attacks:[next.id],automatic:true}];arena.attacks.push(next);p.cast.a.cancelWindows=a.cancelWindows;p.cast.a.hitLimit=1;
 arena.tick();assert.equal(p.cast.a.id,next.id);arena.tick();
 assert.equal(arena.combos.snapshot()[0].hits,2);assert.equal(arena.combos.snapshot()[0].damage,12);
});
test('simultaneous trades track independent attacker pairs in either fighter order',()=>{
 for(const reverse of [false,true]){
  const {arena,p,o,a}=setup(10);arena.attack(o,{...a,id:'attack_trade'});if(reverse)arena.fighters.reverse();arena.tick();
  const rows=arena.combos.snapshot();assert.equal(rows.length,2);assert.ok(rows.every(c=>c.hits===1&&c.damage===5));assert.ok(rows.some(c=>c.attacker===p&&c.target===o));
 }
});
test('blocked and armored damage is excluded from combo totals',()=>{
 for(const kind of ['block','armor']){
  const {arena,o}=setup(10);
  const defense={...freshAttack(),startup:0,active:20,cost:0,box:{x:400,y:-52,w:54,h:44},...(kind==='block'?{payload:'block',delivery:'self'}:{defenseWindows:[{id:'defense_test',kind:'armor',start:0,duration:20,hits:2,against:'all'}]})};
  arena.attack(o,defense);arena.tick();assert.equal(arena.combos.snapshot()[0].bestHits,0);assert.equal(arena.combos.snapshot()[0].bestDamage,0);
 }
});
test('shield contact reports zero HP damage and burn ticks do not add hits',()=>{
 const {arena,o}=setup(10,5,a=>Object.assign(a,{hitLimit:1,status:'burn',statusPower:2,statusInterval:1,statusDuration:5}));o.shield=100;o.shieldUntil=100;
 arena.tick();assert.equal(o.statuses[0].type,'burn');assert.equal(arena.combos.snapshot()[0].damage,0);for(let i=0;i<3;i++)arena.tick();assert.equal(arena.combos.snapshot()[0].bestHits,1);assert.equal(arena.combos.snapshot()[0].bestDamage,0);
});

test('authored flight holds a chain beyond nominal hitstun until motion ends',()=>{
 const {arena}=setup(5,0,a=>Object.assign(a,{knockback:12,launchHeight:30,flightFrames:12,box:{x:0,y:-200,w:300,h:250}}));
 for(let i=0;i<8;i++)arena.tick();assert.equal(arena.combos.snapshot()[0].bestHits,2);
 for(let i=0;i<40;i++)arena.tick();assert.equal(arena.combos.snapshot()[0].hits,0);assert.equal(arena.combos.snapshot()[0].last.reason,'Defender regained control');
});
test('ordinary airborne movement alone does not keep a zero-stun chain alive',()=>{
 const {arena,o}=setup(2,0,a=>Object.assign(a,{hitLimit:1}));arena.tick();assert.equal(arena.combos.snapshot()[0].hits,1);
 o.y=-10;o.vy=-2;arena.tick();assert.equal(arena.combos.snapshot()[0].hits,0);
});
