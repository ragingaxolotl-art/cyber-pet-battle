import test from 'node:test';
import assert from 'node:assert/strict';
import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';
import {Arena,fighter} from '../site/shared/combat-runtime.js';
const stats={...defaultStats(),speed:0,focus:0};
const attack=(status,delivery='self',hitLimit=1)=>({...freshAttack('shield'),startup:0,active:13,recovery:0,cost:0,base:12,coefficient:0,status,statusPower:3,statusDuration:10,statusInterval:5,shieldDuration:30,delivery,hitLimit,hitInterval:5});
for(const kind of ['burn','poison'])for(const delivery of ['self','ally'])for(const hitLimit of [1,3])for(const focus of [0,99])test(`${kind} bypasses shields in preview and runtime: ${delivery}, hits${hitLimit}, focus${focus}`,()=>{
 const a=attack(kind,delivery,hitLimit),levels={...stats,focus};
 const sim=simulate(a,levels,levels,{distance:50,selfHP:.5,targetHP:.5});
 const p=fighter('A',levels),o=fighter('B',levels),game=new Arena(p,o,[a]);game.ai=false;game.paused=false;p.x=450;o.x=500;p.hp=p.maxHP*.5;o.hp=o.maxHP*.5;assert(game.attack(p,a));
 for(let i=0;i<sim.frames.length;i++){game.tick();assert.equal(sim.frames[i].self.hp,p.hp,`self HP at${i}`);assert.equal(sim.frames[i].self.shield,p.shield,`self shield at${i}`);assert.equal(sim.frames[i].target.hp,o.hp,`target HP at${i}`);assert.equal(sim.frames[i].target.shield,o.shield,`target shield at${i}`);}
 const who=delivery==='self'?'self':'target';assert.equal(sim.frames[5][who].hp,67);assert.equal(sim.frames[5][who].shield,12);
 assert(sim.events.some(event=>event.frame===5&&event.text===`${kind} tick: 3 damage.`));
});
test('a direct incoming hit still spends shield after a burn tick bypasses it',()=>{
 const sim=simulate(attack('burn'),stats,stats,{selfHP:.5,incomingDamage:4,incomingFrame:6});
 assert.equal(sim.frames[5].self.hp,67);assert.equal(sim.frames[5].self.shield,12);
 assert.equal(sim.frames[6].self.hp,67);assert.equal(sim.frames[6].self.shield,8);
});
test('status overkill reports actual HP loss without consuming shield',()=>{
 const sim=simulate(attack('poison'),stats,stats,{selfHP:.01});
 assert.equal(sim.frames[5].self.hp,0);assert.equal(sim.frames[5].self.shield,12);
 assert(sim.events.some(event=>event.frame===5&&event.text==='poison tick: 1 damage.'));
});
test('regeneration with a shield still heals and respects maximum health',()=>{
 const sim=simulate(attack('regen'),stats,stats,{selfHP:.99});assert.equal(sim.frames[5].self.hp,140);assert.equal(sim.frames[5].self.shield,12);
});
