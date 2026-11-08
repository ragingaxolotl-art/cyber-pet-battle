import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {environment} from './dom-harness.mjs';
test('M and touch recovery use the Arena action, avoid repeat, and preserve native editing',async()=>{
 const root=fileURLToPath(new URL('../site/',import.meta.url)),env=environment(root+'index.html',root),$=id=>env.ids.get(id);await import('../site/app.js');await new Promise(r=>setImmediate(r));
 const send=(type,e)=>{for(const fn of window.listeners[type]||[])fn({preventDefault(){},metaKey:false,ctrlKey:false,altKey:false,...e});};
 await $('start').click();const recovery=$('touchControls').querySelectorAll('[data-air-recover]')[0];assert.ok(recovery);await recovery.click();
 const status=()=>[...env.ids.values()].filter(n=>n.textContent==='Air recovery requires an airborne fighter');assert.ok(status().length);
 // Clear the visible status through an existing action, then verify keyboard dispatch.
 await $('pause').click();await $('start').click();send('keydown',{target:$('arena'),key:'m',code:'KeyM',repeat:false});assert.ok(status().length);
 const output=status()[0];output.textContent='repeat sentinel';send('keydown',{target:$('arena'),key:'m',code:'KeyM',repeat:true});assert.equal(output.textContent,'repeat sentinel');
 for(const id of ['setNameInput','directSet']){let prevented=false;send('keydown',{target:$(id),key:'m',code:'KeyM',repeat:false,preventDefault(){prevented=true;}});assert.equal(prevented,false);}
 await $('pause').click();
});
