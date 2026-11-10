import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
import {jugglePreset} from '../site/shared/hit-sequence.js';
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-8,`${message}: ${actual} != ${expected}`);
for(const mode of ['ordinary','sequence','runtime'])for(const focus of [0,99])for(const energy of [.4,1]){
 test(`${mode} preview energy matches combat with focus${focus} and starting fraction${energy}`,()=>{
  const stats={...defaultStats(),speed:0,focus};
  const a={...freshAttack(),startup:2,active:10,recovery:5,cooldown:10,cost:12,base:1,coefficient:0,knockback:0,hitstun:0};
  if(mode==='sequence')Object.assign(a,{behaviorVersion:2,delivery:'area',impactTrigger:'timed',sequenceTiming:'cast',hitEvents:jugglePreset(2,3).map(h=>({...h,reaction:'none',damage:1,hitstun:0}))});
  if(mode==='runtime')a.attackerMotion=[{id:'move_audit',start:0,duration:1,forward:1,rise:0}];
  const preview=simulate(a,stats,stats,{energy,selfHP:1,targetHP:1,distance:35});
  const p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[a]);game.ai=false;game.paused=false;o.x=p.x+35;p.energy=Math.round(p.maxEnergy*energy);
  assert.ok(game.attack(p,a));
  const initial=Math.round(p.maxEnergy*energy)-Math.ceil(12*(1-.2*focus/99));
  for(const shot of preview.frames){game.tick();near(p.energy,Math.min(p.maxEnergy,initial+.055*(shot.frame+1)),'independent regeneration expectation');near(shot.self.energy,p.energy,`frame${shot.frame}`);}
 });
}
for(const payload of ['heal','shield','energy'])for(const delivery of ['self','ally'])test(`${delivery} ${payload} handles regeneration, cost and energy cap`,()=>{
 const stats={...defaultStats(),speed:0};
 const a={...freshAttack('heal'),payload,delivery,startup:0,active:13,cost:12,base:18,coefficient:0,hitLimit:3,hitInterval:5,status:'none'};
 const preview=simulate(a,stats,stats,{energy:.4,selfHP:.5,targetHP:.5,distance:35});
 const p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[a]);game.ai=false;game.paused=false;o.x=p.x+35;p.hp=o.hp=70;p.energy=Math.round(p.maxEnergy*.4);assert.ok(game.attack(p,a));
 for(const shot of preview.frames){game.tick();near(shot.self.energy,p.energy,'owner energy');near(shot.target.energy,o.energy,'recipient energy');}
 assert.ok(preview.frames.every(s=>s.self.energy<=p.maxEnergy&&s.target.energy<=o.maxEnergy));
});
test('impact pause repeats the energy sample without regenerating extra energy',()=>{
 const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,cost:12,base:1,coefficient:0,knockback:0,contactFeedback:{hitstop:3,blockstop:0}};
 const sim=simulate(a,stats,stats,{distance:35,selfHP:1,targetHP:1});
 const p=fighter('A',stats),o=fighter('B',stats),game=new Arena(p,o,[a]);game.ai=false;game.paused=false;o.x=p.x+35;assert.ok(game.attack(p,a));
 for(const shot of sim.presentationFrames){game.tick();near(shot.self.energy,p.energy,'presentation energy');}
});
test('failed cast keeps energy unchanged and defeat ends energy regeneration',()=>{
 const stats={...defaultStats(),speed:0};const a={...freshAttack(),startup:0,cost:12,base:500,coefficient:0,knockback:0,hitstun:0};
 const failed=simulate(a,stats,stats,{energy:0});assert.equal(failed.cast,false);assert.ok(failed.frames.every(f=>f.self.energy===0));
 const sim=simulate(a,stats,stats,{distance:35,selfHP:1,targetHP:1});
 assert.equal(sim.frames[0].target.hp,0);assert.ok(sim.frames.every(f=>f.self.energy===sim.frames[0].self.energy));
});
