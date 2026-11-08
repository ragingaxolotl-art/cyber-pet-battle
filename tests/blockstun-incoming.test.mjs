import test from 'node:test';import assert from 'node:assert/strict';
import {freshAttack,simulate,defaultStats} from '../site/shared/combat-model.js';
for(const sequence of [false,true])test(`incoming preview attack respects block recovery (${sequence?'sequence':'ordinary'})`,()=>{
 const a={...freshAttack('area'),startup:0,active:1,recovery:20,cost:0,contactFeedback:{blockstop:2,blockstun:3}};
 if(sequence)Object.assign(a,{behaviorVersion:2,sequenceTiming:'cast',impactTrigger:'timed',hitEvents:[{id:'hit_first',offset:0,duration:1,damage:2,reaction:'none',height:0,knockback:0,frames:1,hold:1,target:'any'}]});
 const stats=defaultStats(),options={distance:35,guard:true,incomingDamage:10};
 const locked=simulate(a,stats,stats,{...options,incomingFrame:2});assert.ok(locked.events.some(e=>e.text.includes('recovering from a block')));assert.equal(locked.frames[2].self.hp,locked.frames[0].self.hp);
 const released=simulate(a,stats,stats,{...options,incomingFrame:4});assert.ok(released.frames[4].self.hp<released.frames[0].self.hp);
});
