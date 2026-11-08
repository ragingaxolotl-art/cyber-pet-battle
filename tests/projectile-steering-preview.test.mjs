import test from 'node:test';import assert from 'node:assert/strict';
import {Arena,fighter} from '../site/engine.js';import {freshAttack,defaultStats,simulate} from '../site/shared/combat-model.js';import {jugglePreset} from '../site/shared/hit-sequence.js';
for(const sequence of [false,'contact','attached'])for(const mode of ['homing','return'])test(`steering preview parity ${mode}, sequence=${sequence}`,()=>{
 const stats={...defaultStats(),speed:0},a={...freshAttack('projectile'),startup:0,active:100,cost:0,coefficient:0,base:1,projectileLifetime:150,projectileSpeed:6,hitLimit:1,launchHeight:30,knockback:0,flightFrames:30,projectileSteering:{mode,turnRate:30,...(mode==='return'?{returnAfter:10}:{})}};
 if(sequence)Object.assign(a,{behaviorVersion:2,impactTrigger:'contact',projectileMode:sequence,hitEvents:jugglePreset(2,25)});
 const preview=simulate(a,stats,stats,{distance:150,targetHP:1}),p=fighter('A',stats),o=fighter('B',stats),arena=new Arena(p,o,[a]);p.x=300;o.x=450;arena.ai=false;arena.paused=false;arena.attack(p,a);
 // The impact frame stores pre-contact geometry; a fresh Arena query after
 // that hit has already switched to attachment. Compare geometry thereafter.
 let checked=0;
 for(const shot of preview.frames){arena.tick();assert.equal(o.hp,shot.target.hp,`hp frame ${shot.frame}`);const entity=arena.projectiles.entries[0];if(entity&&!(sequence==='attached'&&shot.frame===preview.impactFrame)){const box=arena.prepareCast(p,o,entity.cast).box;assert.ok(Math.abs(box.x-300-shot.box.x)<1e-8,`x frame ${shot.frame}`);assert.ok(Math.abs(box.y-shot.box.y)<1e-8,`y frame ${shot.frame}`);checked++;}if(shot.steering?.caught)assert.equal(entity,undefined);}
 assert.ok(checked>5);if(mode==='return')assert.equal(preview.events.some(e=>/returned to owner/.test(e.text)),!(sequence==='attached'&&preview.impactFrame!==null));
});
