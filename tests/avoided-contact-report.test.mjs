import test from 'node:test';
import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';
import {freshAttack,defaultStats,simulate,validateAttack} from '../site/shared/combat-model.js';
import {simulateSplitPreview} from '../site/shared/split-preview.js';
import {compareAttacks} from '../site/matchup.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const stats={...defaultStats(),speed:0};
const attack=(patch={})=>({...freshAttack(),id:'attack_probe',name:'Audit strike',startup:0,active:10,recovery:0,cost:0,base:7,coefficient:0,knockback:0,launchHeight:0,hitstun:0,hitLimit:2,hitInterval:3,impactTrigger:'timed',...patch});
const defense=(kind='invulnerability')=>attack({id:'attack_defender',name:'Audit defense',startup:30,base:0,defenseWindows:[{id:'defense_one',kind,against:'all',start:0,duration:2}]});
for(const outcome of ['invulnerable','dodged'])for(const sequence of [false,true])test(`comparison explains ${outcome}, sequence=${sequence}`,()=>{
 const a=attack(sequence?{behaviorVersion:2,sequenceTiming:'cast',hitEvents:jugglePreset(2,3).map(h=>({...h,damage:7,reaction:'none',hitstun:0}))}:{});
 const r=compareAttacks(a,defense(),{frames:8,statsA:stats,statsB:stats,actionB:outcome==='dodged'?'dodge':'attack'});
 assert.ok(r.avoidedContacts.some(c=>c.outcome===outcome&&c.target==='B'&&c.frame===0));
 assert.ok(r.rows.some(row=>row.frame===0&&row.actor==='B'&&row.event.includes(outcome==='dodged'?'Dodged':'Invulnerable')));
 assert.equal(r.damage[1],outcome==='dodged'?0:7);
 assert.doesNotThrow(()=>JSON.stringify(r));
});
test('no avoidance is invented for misses, startup, or expired defense',()=>{
 for(const options of [{distance:500},{offset:-3},{frames:2}]){
  const a=attack(options.frames?{startup:5}:{}),d=defense();
  const r=compareAttacks(a,d,{frames:8,statsA:stats,statsB:stats,...options});
  assert.deepEqual(r.avoidedContacts,[]);
 }
});
test('single-contact projectile reports a continuous overlap once, preserves hit budget and later hits',()=>{
 const a=attack({delivery:'projectile',projectileSpeed:0,projectileLifetime:30,projectileContact:'single',hitLimit:1}),r=compareAttacks(a,defense(),{frames:8,statsA:stats,statsB:stats});
 assert.equal(r.avoidedContacts.length,1);assert.equal(r.avoidedContacts[0].kind,'overlap');assert.equal(r.contacts[0],1);assert.equal(r.remainingProjectiles,0);assert.equal(r.damage[1],7);
 assert.match(r.rows.find(row=>row.event.includes('Invulnerable')).event,/overlap ignored/);
});
test('avoidance log is empty during an impact pause and reset clears it',()=>{
 const a=attack(),b=defense(),p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[a,b],{training:true});game.paused=false;game.ai=false;p.x=450;o.x=500;game.attack(p,a);game.attack(o,b);game.tick();
 assert.equal(game.lastAvoidedContacts.length,1);game.hitstopRemaining=3;game.tick();assert.deepEqual(game.lastAvoidedContacts,[]);game.resetDummy();assert.deepEqual(game.lastAvoidedContacts,[]);
});
test('runtime-backed Studio preview explains an invulnerable incoming hit',()=>{
 const a=defense();Object.assign(a,{delivery:'projectile',projectileLifetime:30,projectileSpeed:0});validateAttack(a);
 const result=simulateSplitPreview(a,stats,stats,{distance:50,selfHP:1,targetHP:1,incomingDamage:10,incomingFrame:1});
 assert.equal(result.frames[1].self.hp,140);assert.ok(result.events.some(e=>e.frame===1&&/Incoming.*invulnerable/.test(e.text)));
});
test('area avoidance does not consume its budget or invent contact outside its bounds',()=>{
 const p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[]);game.paused=false;game.ai=false;p.x=450;o.x=500;game.attack(o,defense());
 const area={name:'Audit area',owner:p,target:o,start:1,end:10,rule:{damage:7,hitLimit:1,interval:2,width:70,height:60,duration:9},box:{x:480,y:-60,w:70,h:60,shape:'rectangle'},targets:new Map(),blockable:true};game.areas.push(area);
 game.tick();assert.equal(game.lastAvoidedContacts.length,1);assert.equal(area.targets.size,0);game.tick();assert.equal(game.lastAvoidedContacts.length,0);game.tick();assert.equal(o.maxHP-o.hp,7);assert.equal(area.targets.get(o).hits,1);
});
