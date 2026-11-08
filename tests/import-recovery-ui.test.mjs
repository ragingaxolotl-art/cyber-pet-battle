import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {environment} from './dom-harness.mjs';
import {freshAttack} from '../site/shared/combat-model.js';

test('failed attack imports preserve saved data and slots and explain recovery',async()=>{
 const root=fileURLToPath(new URL('../site/',import.meta.url));
 const env=environment(root+'index.html',root),$=id=>env.ids.get(id);
 await import('../site/app.js');await new Promise(resolve=>setImmediate(resolve));
 const saved=[...env.storage.entries()],slots=$('attackSlots').textContent;
 const attempt=async(file,expected)=>{
  $('attackFile').value='previous-selection';$('attackFile').files=[file];
  await $('attackFile').onchange({target:$('attackFile')});
  assert.match($('status').textContent,expected);
  assert.equal($('attackFile').value,'','same file can be selected again');
  assert.deepEqual([...env.storage.entries()],saved);
  assert.equal($('attackSlots').textContent,slots);
 };
 await attempt({size:12,text:async()=>'{broken'},/not valid JSON.*Export the attack again/);
 await attempt({size:3*1024*1024,text:async()=>{throw Error('must not read');}},/under 2 MiB/);
 await attempt({size:12,text:async()=>JSON.stringify({format:'cyber-pet-combat-design',version:999,attacks:[freshAttack('projectile')]})},/Unsupported Combat Design version/);
 const attack=freshAttack('projectile'),file={size:1000,text:async()=>JSON.stringify({format:'cyber-pet-combat-design',version:1,attacks:[attack]})};
 const original=localStorage.setItem;
 localStorage.setItem=()=>{const error=Error('quota');error.name='QuotaExceededError';throw error;};
 try{await attempt(file,/storage is full.*Export your battle profile/);}finally{localStorage.setItem=original;}
 // A failed selection must not poison a later valid import.
 $('attackFile').files=[file];await $('attackFile').onchange({target:$('attackFile')});
 assert.match($('status').textContent,/attacks added to skill trees/);
});
